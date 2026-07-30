---
title: 'Two GPUs, Two Nodes, Seven Services: GPU Workload Distribution on Proxmox'
date: 2026-04-13
slug: 'proxmox-gpu-passthrough-multi-service'
description: 'How I distribute GPU workloads across two Proxmox nodes using LXC device binding - VRAM strategy, LXC passthrough config, and Tdarr distributed encoding.'
categories: ['Homelab']
tags: ['proxmox', 'nvidia', 'gpu', 'lxc', 'frigate', 'homelab', 'ollama']
heroImage: '/images/blog/proxmox-gpu-passthrough-multi-service/hero.webp'
heroAlt: 'Two Dell R730 servers in a rack with NVIDIA GPU cards visible, showing GPU workload distribution across a Proxmox cluster'
tldr: 'I run seven GPU-accelerated services across two Proxmox nodes using LXC device binding. The 8GB Quadro RTX 4000 on prxbox1 handles Frigate NVR, Wyoming Whisper STT, and a Tdarr encoding node. The 16GB RTX A4000 on prxbox2 handles Plex, Ollama, Immich ML, and Tdarr server. The config is straightforward once you understand what LXC passthrough actually is and why workload placement matters more than the passthrough setup itself.'
faq:
  - question: 'Does sharing a GPU across multiple LXC containers hurt performance?'
    answer: 'It depends on the workload. Services compete for VRAM and CUDA execution time when running simultaneously. Batch and async workloads (Tdarr encoding, Immich photo ML) tolerate sharing fine. Real-time services like Frigate object detection and Whisper STT need predictable access - which is why I put them on their own GPU node rather than sharing with bursty workloads like Plex and Ollama.'
  - question: 'Can I use a gaming GPU (GeForce) for Proxmox LXC passthrough?'
    answer: 'In a desktop Proxmox build, yes - GeForce cards work fine with LXC device binding. In a 2U rack server like a Dell R730, physical size constraints require workstation-class cards (Quadro, RTX professional series) that fit the 3.44-inch chassis height and front-to-back airflow design.'
  - question: 'Does nvidia-smi work on the Proxmox host with LXC device binding?'
    answer: 'Yes - with LXC device binding, the NVIDIA driver loads on the Proxmox host and nvidia-smi reports the GPU there. What it cannot show is per-container VRAM breakdown. To see which container is consuming VRAM, run nvidia-smi from inside the container: pct exec <ct-id> -- nvidia-smi. (This is the opposite of full VM vfio-pci passthrough, where the GPU is removed from the host device tree entirely and nvidia-smi on the host returns nothing.)'
  - question: 'What Proxmox version do I need for LXC GPU passthrough?'
    answer: 'LXC device binding works on PVE 7+ with cgroup v2 enabled. My setup runs PVE 9.1.1 (Debian 13 Trixie) with kernel 6.17.2-1-pve and NVIDIA driver 580.95.05. The cgroup2 device allowlist syntax (lxc.cgroup2.devices.allow) replaced the older cgroup v1 syntax in PVE 7.'
---

> **TL;DR**: Two-node Proxmox cluster, two NVIDIA GPUs, seven GPU-accelerated services. The 8GB card runs Frigate, Whisper STT, and a Tdarr node. The 16GB card runs Plex, Ollama, Immich, and Tdarr server. LXC device binding - not full VM passthrough, not enterprise vGPU. Here's the actual config and the reasoning behind the workload split.

---

The moment things got complicated: I was watching Frigate's object detection logs and noticed the detection latency had jumped from the usual 30ms to over 2 seconds. Plex was transcoding something for my partner at the same time. Both were fighting for GPU memory on the same card - and Frigate was losing.

That's the problem with Proxmox LXC GPU passthrough once you stack enough services: the setup is straightforward, but nobody writes about what happens when six different things want CUDA time on the same card.

Frigate dropping frames on a security camera because Plex decided to transcode a movie is exactly the kind of failure mode that seems obvious in retrospect. Of course they compete. They're both CUDA processes on the same card. But when you're building a homelab incrementally - adding one service at a time, each one working fine in isolation - it doesn't feel obvious until something breaks.

A GPU memory collision is what led me to a two-node strategy. Not "I planned this out carefully from the start." More like "I added enough things to one GPU that they started stepping on each other, and I had to actually think about it."

![Distracted Boyfriend meme - guy labeled 'me adding Ollama to the already-maxed 8GB GPU node' looking at girl labeled 'the 16GB node sitting right there'](/images/blog/proxmox-gpu-passthrough-multi-service/distracted-boyfriend-gpu.webp)

This post is the thinking-out-loud version of that process: how I distribute GPU workloads across two Proxmox nodes, why certain services live where they do, and the actual LXC passthrough config that makes it work. If you're running a single GPU server and starting to feel that pressure, this is one path forward.

My full homelab hardware story is in [the two-year retrospective](/blog/homelab-two-years-later/) - I won't re-cover the rack, the R730s, or why enterprise hardware makes sense. This post is specifically about GPUs and how to think about distributing work across them.

## The Two Cards

Quick hardware context before getting into configs.

**prxbox1** runs a [Quadro RTX 4000](https://www.nvidia.com/content/dam/en-zz/Solutions/design-visualization/quadro-product-literature/quadro-rtx-4000-datasheet.pdf) (8GB GDDR6 VRAM). **prxbox2** runs an [RTX A4000](https://www.nvidia.com/content/dam/en-zz/Solutions/gtcs21/rtx-a4000/nvidia-rtx-a4000-datasheet.pdf) (16GB GDDR6 VRAM). Both are professional/workstation class - not gaming GPUs. Both nodes run Proxmox VE 9.1.1 on Debian 13 (Trixie) with NVIDIA driver 580.95.05.

That distinction matters if you're trying to install a GPU in a 2U rack server. Desktop GPUs are designed for full-height cases with side-panel fans blowing directly on them. A Dell R730 is 3.44 inches tall (2U). The airflow runs front-to-back through a carefully engineered wind tunnel. A standard RTX 4090 physically does not fit. You need cards that are short enough, or use the right slot configuration. Workstation GPUs - Quadro, RTX professional series, Tesla - are designed for exactly this environment.

I also had to disable the Dell R730's third-party PCIe fan response after installing both cards. By default, when the server detects a GPU it doesn't recognize from its vendor list, it cranks the fans to maximum as a precaution. Setting `ThirdPartyPCIFanResponse Disabled` via iDRAC's racadm brought both servers back to sane noise levels.

```
+----------------------------------+
|  prxbox1                         |
|  Quadro RTX 4000 - 8GB VRAM      |
|  Frigate  |  Whisper  |  Tdarr   |
+----------------------------------+
            | 10G SFP+
            |
+----------------------------------+
|  MikroTik CRS317 (10G Switch)    |
+----------------------------------+
      |                |
  20G LACP          1G link
      |                |
+-------------+  +------------------+
| prxbox2     |  | prxbox3          |
| RTX A4000   |  | No GPU           |
| 16GB VRAM   |  | Monitoring only  |
| Plex/Ollama |  | Prometheus/Loki  |
| Immich/Tdarr|  +------------------+
+-------------+
```

Both R730s are in a 3-node Proxmox cluster. prxbox3 is a custom build with no GPU - it handles Prometheus, Grafana, Loki, and cluster management. The GPU work lives entirely on the two Dell nodes.

## How LXC Passthrough Actually Works

Before getting into the workload split, it's worth being clear about what I'm actually doing here, because there are three different approaches to GPU access in Proxmox and they work very differently.

**vGPU** lets you split one physical GPU into multiple virtual GPUs and assign them to different VMs. Sounds ideal. It requires NVIDIA enterprise licensing and only works on specific Tesla/professional cards (not the ones I have). Not an option unless you're already paying for datacenter-class hardware and licensing.

**Full VM passthrough** uses IOMMU to give an entire VM exclusive access to one physical GPU. Works fine. The VM boots with full GPU ownership, drivers installed inside the VM, and the GPU is invisible to the Proxmox host. Slightly heavier overhead than containers, and you lose the ability to run multiple services on the same GPU easily - you'd need one VM per service or Docker inside the VM.

**LXC device binding** is what I use. The NVIDIA driver loads on the Proxmox host directly - not vfio-pci, not IOMMU isolation. The driver creates `/dev/nvidia0`, `/dev/nvidiactl`, `/dev/nvidia-uvm`, and friends on the host. You then grant specific LXC containers access to those device nodes and bind-mount the NVIDIA libraries in. Multiple containers share the same physical GPU simultaneously. Same mechanism as Docker's `--gpus all`, but configured at the container level.

This is the key distinction from full VM passthrough: with vfio-pci, the GPU is removed from the host's device tree entirely and handed to one VM. With LXC device binding, the host owns the GPU and grants containers controlled access. You can't do both at the same time. IOMMU (`intel_iommu=on iommu=pt` in GRUB) is only needed if you're doing vfio-pci VM passthrough - not for LXC device binding.

Here's the actual LXC config that makes it work. This is from the Frigate container on prxbox1:

```conf
arch: amd64
cores: 4
features: nesting=1,keyctl=1
hostname: frigate
memory: 8192
onboot: 1
ostype: debian
rootfs: local-lvm:vm-XXX-disk-0,size=20G

# NVIDIA GPU Passthrough
lxc.cgroup2.devices.allow: c 195:* rwm
lxc.cgroup2.devices.allow: c 507:* rwm
lxc.cgroup2.devices.allow: c 226:* rwm
lxc.cgroup2.devices.allow: c 235:* rwm
lxc.mount.entry: /dev/nvidia0 dev/nvidia0 none bind,optional,create=file
lxc.mount.entry: /dev/nvidiactl dev/nvidiactl none bind,optional,create=file
lxc.mount.entry: /dev/nvidia-uvm dev/nvidia-uvm none bind,optional,create=file
lxc.mount.entry: /dev/nvidia-uvm-tools dev/nvidia-uvm-tools none bind,optional,create=file
lxc.mount.entry: /dev/nvidia-caps dev/nvidia-caps none bind,optional,create=dir
lxc.mount.entry: /dev/dri dev/dri none bind,optional,create=dir

# NVIDIA Libraries
lxc.mount.entry: /opt/nvidia-libs opt/nvidia-libs none bind,optional,create=dir
lxc.mount.entry: /usr/bin/nvidia-smi usr/bin/nvidia-smi none bind,optional,create=file
```

The `cgroup2.devices.allow` lines give the container permission to access NVIDIA device nodes. The cgroup device numbers (`195`, `507`, `226`, `235`) correspond to the NVIDIA devices. One important note: the device number for `nvidia-uvm` (507 in my case) is not fixed - it can vary between hosts. Check your actual value with `ls -la /dev/nvidia-uvm` before copying this config.

The `/opt/nvidia-libs` directory on the Proxmox host contains copies of the NVIDIA driver libraries. I maintain it manually:

```bash
# Run this on the Proxmox host after any driver update
rm -rf /opt/nvidia-libs/*
cp /usr/lib/x86_64-linux-gnu/libnvidia* /opt/nvidia-libs/
cp /usr/lib/x86_64-linux-gnu/libcuda* /opt/nvidia-libs/
cp /usr/lib/x86_64-linux-gnu/libnvcuvid* /opt/nvidia-libs/
```

Important: whenever you update the NVIDIA driver on the Proxmox host, you need to re-run those `cp` commands to refresh `/opt/nvidia-libs/`, then restart every GPU-bound container. The libraries in the directory need to match the running driver version - stale copies will cause containers to fail with `libcuda.so version mismatch` errors.

Every container that needs GPU access gets the same LXC block above. They all share the same `/dev/nvidia0` device. The GPU handles multiple concurrent CUDA contexts just fine.

After restarting the container, verify the GPU is visible from inside it:

```bash
# From the Proxmox host - should show your GPU model and driver version
ssh root@<host-ip> "pct exec <ct-id> -- nvidia-smi"

# Expected output:
# +-----------------------------------------------------------------------------------------+
# | NVIDIA-SMI 580.95.05    Driver Version: 580.95.05    CUDA Version: 12.7                |
# |-----------------------------------------+------------------------+----------------------|
# | GPU  Name        Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |
# |   0  Quadro RTX 4000 ...  Off  |  00000000:82:00.0 Off  |                  N/A |
# +-----------------------------------------------------------------------------------------+
```

If nvidia-smi returns "No devices were found", check that: (1) the cgroup device numbers match your host's actual device numbers, (2) `/opt/nvidia-libs` is populated, and (3) you restarted the container after editing the config.

### The docker-compose gotcha

This one burned me an afternoon. If you're running Docker inside your LXC containers and you try to use the NVIDIA container toolkit the standard way, it won't work. Setting `default-runtime: nvidia` in `/etc/docker/daemon.json` causes issues inside LXC because the CDI (Container Device Interface) mechanism doesn't function correctly in that environment.

The fix: don't use the nvidia runtime at all. Mount the devices directly in your compose file instead:

```yaml
services:
  frigate:
    image: ghcr.io/blakeblackshear/frigate:stable-tensorrt
    volumes:
      - /opt/nvidia-libs:/usr/local/nvidia/lib64:ro
      - /dev/nvidia0:/dev/nvidia0
      - /dev/nvidiactl:/dev/nvidiactl
      - /dev/nvidia-uvm:/dev/nvidia-uvm
      - /dev/nvidia-uvm-tools:/dev/nvidia-uvm-tools
      - /dev/dri:/dev/dri
    environment:
      NVIDIA_VISIBLE_DEVICES: all
      NVIDIA_DRIVER_CAPABILITIES: all
      LD_LIBRARY_PATH: /usr/local/nvidia/lib64
```

No `runtime: nvidia`. No CDI. Direct device mounts, direct library path. Works reliably.

![Surprised Pikachu meme - top text: 'sets default-runtime: nvidia in daemon.json inside an LXC container', bottom text: 'all docker containers lose GPU access'](/images/blog/proxmox-gpu-passthrough-multi-service/surprised-pikachu-cdi.webp)

## The Workload Map

The passthrough config above is the same on both nodes - the interesting decisions are which services run where and why.

### prxbox1 - The 8GB node: real-time inference

Three GPU services live on prxbox1's Quadro RTX 4000.

**[Frigate NVR](https://frigate.video/)** runs ONNX-based object detection across my security cameras. My config uses a YOLOX model (`yolox_s.onnx`) - Frigate supports multiple detection backends and this is one option, not the only one. The inference workload is constant and real-time: every frame from every camera needs to be processed in under the frame interval or you start dropping detections. From `nvidia-smi` inside the container, VRAM usage looks like roughly 232MB for the ONNX detector process, plus 200-350MB per camera for FFmpeg hardware decode. With two cameras active, that's around 800-1000MB total. The `stable-tensorrt` image handles this well with `preset-nvidia-h264` for hardware decoding.

**Wyoming Whisper** does GPU-accelerated speech-to-text for Home Assistant's voice pipeline. I covered this setup in detail in the [local voice AI post](/blog/local-voice-ai-home-assistant-gpu/). The key number: the `small-int8` model loads approximately 2.2GB of VRAM and stays resident (this is from `nvidia-smi` inside the container - it may vary depending on your driver version and CUDA context overhead). It's always loaded, always waiting. Latency matters - sub-1-second transcription is the goal.

**A Tdarr encoding node** (more on Tdarr in the next section). This one is bursty - it only consumes significant VRAM when there's encoding work in the queue.

Adding it up: Frigate at ~1GB, Whisper at ~2.2GB, leaves roughly 4.8GB for Tdarr encoding bursts. That's comfortable. The reason these three work well together is that Frigate and Whisper have predictable steady-state VRAM footprints, and the Tdarr node only needs significant GPU time when there's a transcoding job waiting.

### prxbox2 - The 16GB node: heavy compute

More services, more variable VRAM demands, which is exactly why this one got the bigger card.

**[Ollama](https://ollama.com/)** runs local LLMs. I'm typically running `llama3.2:3b`, which needs about 2-3GB of VRAM depending on quantization. But when I load `llama3.1:8b` for more demanding queries, that's 5-8GB depending on which quantization Ollama selects for your available VRAM. VRAM usage here is unpredictable - it depends entirely on what model I've loaded most recently. This is the primary reason Ollama lives on the 16GB node. Trying to fit an 8B parameter model alongside Plex transcoding on an 8GB card would be a disaster.

**Plex** hardware transcoding is bursty. When someone starts streaming content that needs to be converted to a different format, Plex spins up an NVENC encode session. When nothing is transcoding, the GPU usage is essentially zero. It coexists fine with Ollama because they're rarely demanding the GPU at the same time - LLM inference is usually a quick burst, and active Plex sessions are not constant.

**[Immich](https://immich.app/)** runs ML-based face recognition and scene classification as background jobs. These run asynchronously - not in real-time, not on a critical path. They can take whatever GPU time is available. This is almost the ideal background workload: it runs when the GPU is otherwise idle, and nobody notices if it takes twice as long because Ollama happened to be running.

**Tdarr server** coordinates the distributed encoding cluster and also runs its own GPU encoding workers. With 3 GPU workers configured and `hevc_nvenc` for 1080p content, it can churn through a significant queue while Plex and Ollama handle their own workloads. (My encode speed varies with source material and settings - `preset p4` HEVC is meaningfully faster than CPU-only, but I haven't benchmarked it precisely.)

Here's how all of that adds up across both nodes:

| Service                        | Node    | VRAM (steady-state) | Pattern                |
| ------------------------------ | ------- | ------------------- | ---------------------- |
| Frigate ONNX detector          | prxbox1 | ~232MB              | Always running         |
| Frigate FFmpeg decode (2 cams) | prxbox1 | ~400-700MB          | Always running         |
| Wyoming Whisper small-int8     | prxbox1 | ~2.2GB              | Always loaded          |
| Tdarr encoding node            | prxbox1 | ~2-4GB              | Bursty, queue-driven   |
| **8GB node headroom at idle**  |         | **~4.8GB free**     |                        |
| Ollama llama3.2:3b             | prxbox2 | ~2-3GB              | Resident when loaded   |
| Ollama llama3.1:8b (when used) | prxbox2 | ~5-8GB              | Replaces smaller model |
| Plex NVENC transcoding         | prxbox2 | ~500MB-2GB          | Per active stream      |
| Immich ML (face/scene)         | prxbox2 | ~1-2GB              | Background, async      |
| Tdarr server + workers         | prxbox2 | ~2-4GB              | Bursty, queue-driven   |

The VRAM numbers for prxbox1 are from `nvidia-smi` inside the containers. The prxbox2 numbers are harder to nail down because services there compete more dynamically - what matters is that the 16GB ceiling gives Ollama room to load an 8B model without evicting everything else.

![Two Buttons meme - sweating person choosing between 'add one more GPU service to the 8GB node' and 'check if there is actually VRAM headroom first'](/images/blog/proxmox-gpu-passthrough-multi-service/two-buttons-vram.webp)

## Tdarr as a Distributed Encoding Cluster

Tdarr is doing something a bit more interesting than the other services: it's treating both GPUs as a single encoding cluster.

The Tdarr server runs on prxbox2 and handles all queue coordination. But I've also deployed a Tdarr encoding node on prxbox1 - a separate LXC container that connects back to the prxbox2 server and accepts encoding jobs. When there's work in the queue, both nodes pull jobs and encode independently using their local GPU.

```
prxbox2 (Tdarr Server + Node)          prxbox1 (Tdarr Node)
RTX A4000 - 16GB                       Quadro RTX 4000 - 8GB
  [3 GPU transcode workers]              [GPU transcode workers]
  [20 GPU health check workers]                |
              |                               |
              +---------> Media Queue <--------+
                       (NAS via NFS)
```

Both nodes access the media library over NFS from the Synology NAS. A file gets assigned to whichever node picks it up from the queue first. The RTX A4000 handles `hevc_nvenc` and `av1_nvenc` in addition to H.264; the Quadro RTX 4000 handles `h264_nvenc` and `hevc_nvenc`. For most of my library - old MPEG4, MPEG2, and WMV content - H.264 output is fine for either node.

Right now there are 25,727 video files in the "other videos" library totaling about 22TB. The queue has been running for weeks. Both GPUs contributing means the throughput is roughly double what either node could do alone.

This distributed model works well for batch encoding because each job is completely independent. There's no synchronization between nodes mid-encode, no shared state, no handoff. They just pull from the same queue and write output back to the same NFS path.

## Monitoring VRAM Across the Cluster

One quirk of the LXC passthrough approach: `nvidia-smi` on the Proxmox host shows the GPU and its total VRAM, but it cannot show per-container breakdown. To see which specific processes are consuming VRAM, you have to query from inside a container.

```bash
# Check VRAM usage on prxbox1 from inside the Frigate container
# Replace <host-ip> with your Proxmox node IP, <ct-id> with your container ID
ssh root@<host-ip> "pct exec <ct-id> -- nvidia-smi"

# Check which processes are consuming VRAM
ssh root@<host-ip> "pct exec <ct-id> -- nvidia-smi --query-compute-apps=name,used_memory --format=csv"
```

For ongoing monitoring, I have node_exporter running inside each GPU container, exporting metrics to the Prometheus instance on prxbox3. The NVIDIA-specific metrics - temperature, utilization, memory - come from nvidia-smi output scraped periodically. For a cleaner setup, [nvidia_gpu_exporter](https://github.com/utkuozdemir/nvidia_gpu_exporter) runs inside a container and exposes proper Prometheus metrics without any scripting.

The practical reality: I check GPU stats reactively when something feels slow, not on a dashboard I watch constantly. The Uptime Kuma monitor tells me if Whisper or Frigate goes down. The Home Assistant CPU/memory graphs show me if the system is under pressure. GPU VRAM isn't the thing I watch most often - it's more useful for investigating a specific incident.

## The Decision Framework

Here's the actual rule I landed on, stated plainly: **separate latency-sensitive from bursty**. Real-time services that lose value when slow go on one node; variable, spike-driven services that tolerate waiting go on the other. That's it.

**Latency-sensitive, real-time services go on the 8GB node.** Frigate needs to detect a person in a camera frame before they've moved on. Whisper needs to respond to a voice command before it feels broken. These services lose value if they're slow, and they need predictable, low-latency GPU access regardless of what else is running. The 8GB card is dedicated enough to them that there's no contention with anything that has irregular demand.

**VRAM-heavy and bursty services go on the 16GB node.** Ollama might load an 8B parameter model. Plex might start three simultaneous transcode sessions. Tdarr is encoding constantly. Immich might be processing 200 photos from a recent trip. None of these have hard real-time requirements - a 2x slower LLM response is annoying but not a failure. The 16GB card has enough headroom that even peak-demand combinations fit.

There's a third category that doesn't apply to me but might to you: **exclusive GPU access for specific workloads**. If you're running stable diffusion, training, or anything with very specific VRAM requirements, you might want a GPU dedicated to that single service via full VM passthrough instead of shared LXC access. For my workloads, shared LXC is fine. But if you're running something with strict requirements, LXC sharing means other services can grab VRAM at unexpected times.

The hardware investment - two workstation GPUs in two servers - sounds like a lot. But both R730s came from enterprise lease disposal for reasonable money, and the GPUs themselves are on the workstation/professional market rather than gaming. The Quadro RTX 4000 was around $400 used; the RTX A4000 was more. Not cheap, but not the gaming GPU market either.

If I were doing this over: I'd think about GPU workload distribution before buying the second server, not after. The workload split I have now didn't come from careful planning - it came from trial and error. Knowing what I know now, I'd put the LLM inference card on the primary node and accept a smaller VRAM budget for everything else, rather than treating VRAM allocation as an afterthought.

The passthrough config is the easy part. It takes an afternoon, and there are decent tutorials if you get stuck. The workload strategy is the part that doesn't show up in documentation - and it's the part that determines whether you're constantly fighting GPU memory contention or not.

---

If any of this is useful, I'm happy to dig into specifics in the comments - particularly around the Frigate TensorRT setup or the Tdarr distributed config, which both have their own rabbit holes. The [homelab two-year retrospective](/blog/homelab-two-years-later/) has the full hardware context, and the [local voice AI post](/blog/local-voice-ai-home-assistant-gpu/) covers the Whisper pipeline end-to-end if you're building the Home Assistant voice setup.
