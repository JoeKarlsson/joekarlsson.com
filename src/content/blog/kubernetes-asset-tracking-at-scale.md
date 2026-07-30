---
title: 'Kubernetes Asset Tracking: Why 70% of Enterprises are Struggling (And How to Fix It)'
date: 2025-05-01
slug: 'kubernetes-asset-tracking-at-scale'
description: 'Learn how to tackle the challenges of managing Kubernetes assets across multiple clouds with the central configuration store pattern. Discover how CloudQuery enables SQL-based querying for efficient governance, security enforcement, and compliance at scale.'
categories: ['Work']
tags: ['Engineering', 'Governance']
heroImage: '/images/blog/kubernetes-asset-tracking-at-scale/thumbnail.webp'
canonicalUrl: 'https://www.cloudquery.io/blog/kubernetes-asset-tracking-at-scale'
contentNotice: 'This post was originally published on CloudQuery blog.'
---

![Kubernetes Asset Tracking blog header](/images/blog/kubernetes-asset-tracking-at-scale/header.webp)

> **TL;DR:**
> Managing Kubernetes assets across multiple cloud environments creates significant challenges for enterprises. According to CNCF research, 88% of enterprises run Kubernetes across multiple clouds, but 70% struggle with visibility and governance.
>
> Traditional approaches like shell scripts, fragmented monitoring tools, and manual security checks simply don't scale. The most effective solution is implementing a central configuration store pattern that collects, normalizes, and allows SQL-based querying of your entire Kubernetes estate.

Managing Kubernetes assets across multiple clouds isn't just hard it's becoming nearly impossible without the right approach. When your organization runs dozens or hundreds of clusters across AWS, Azure, and GCP, keeping track of what you have and ensuring it meets your standards becomes a significant technical challenge.

![Ralph Wiggum from The Simpsons saying, "I'm in Danger," with the caption, "When you realize your Kubernetes asset tracking is a mess".](/images/blog/kubernetes-asset-tracking-at-scale/image1.webp)

We've worked with numerous Fortune 500 companies who initially struggled with this exact problem. Their platform teams were drowning in kubectl commands, custom scripts, and fragmented dashboards all trying to answer seemingly simple questions like "how many pods are running across all our clusters?" or "which CRDs are deployed in production?"

This article digs into the technical realities of managing Kubernetes assets at scale, examining both the challenges and practical solutions based on what actually works in production environments. You won't find marketing fluff here just hard-earned technical insights backed by research and real-world implementations.

## Understanding Kubernetes Asset Management

Before diving in, let's define what we mean by Kubernetes assets. Kubernetes assets encompass all the components that make up your containerized applications, including:

**Pods:** The smallest deployable units in Kubernetes, pods encapsulate one or more containers and share network and storage resources

**Deployments:** Deployments provide declarative updates for pods and ReplicaSets, allowing you to manage the desired state of your application

**Services:** Services provide a stable endpoint for accessing pods, enabling load balancing and service discovery

**ConfigMaps and Secrets:** ConfigMaps and Secrets allow you to decouple configuration and sensitive data from your application code

**Custom Resource Definitions (CRDs):** CRDs extend the Kubernetes API, allowing you to define and manage custom resources tailored to your specific needs

## The Reality of Working with Lots of Kubernetes Clusters

Let's start with some context: [Multi-cloud is the norm: **89% of organizations now employ multi-cloud strategies**, up from 87% last year](https://www.cloudcomputing-news.net/news/flexera-2024-state-of-the-cloud-cost-optimisation-finops-and-genai-key-takeaways/). This isn't just about having separate, isolated environments. It's about treating your infrastructure as a coherent whole while respecting the differences between providers.

When tracking Kubernetes assets, the complexity quickly becomes apparent. You're juggling core resources like Pods, Deployments, and Services alongside configuration objects such as ConfigMaps and Secrets. Then there are extension mechanisms through Custom Resource Definitions (CRDs), access control via RBAC components, networking through Ingresses and NetworkPolicies, and storage resources including PersistentVolumes and StorageClasses. Each of these elements plays a critical role in your Kubernetes ecosystem, and missing any of them in your governance strategy creates blind spots.

The challenge multiplies when these resources span different cloud providers. AWS EKS clusters come with specific IAM integration patterns that differ significantly from Azure AKS with its managed identity approach or GCP GKE with Workload Identity. These aren't just minor implementation differences they fundamentally change how you secure, monitor, and manage your Kubernetes assets across environments. The traditional perimeter-based security model that treats each cluster as an isolated island simply doesn't work anymore. You need a unified approach that acknowledges both the common Kubernetes foundations and the cloud-specific nuances.

In the [2024 CNCF Annual Survey](https://www.cncf.io/wp-content/uploads/2025/04/cncf_annual_survey24_031225a.pdf), security (42%) and complexity (38%) were cited as the top challenges in container management, and CRD proliferation only adds to that complexity. This makes sense when you consider how CRDs work: they extend the Kubernetes API server with custom resources that behave like native resources. As these proliferate across clusters, often installed by different teams, keeping track of them becomes extraordinarily difficult.

## Common Failure Modes in K8s Asset Management

Let's look at the most common ways organizations fail when trying to track Kubernetes assets at scale.

### 1. The Script Graveyard

Many platform teams start with something like this:

```bash
#!/bin/bash
for ctx in $(kubectl config get-contexts -o name); do
  kubectl --context $ctx get pods -A -o json >> all_pods.json
  kubectl --context $ctx get deployments -A -o json >> all_deployments.json
  # ...repeat for each resource type
done
```

This approach might work for 3-5 clusters, but it breaks down spectacularly at scale. You'll quickly hit API rate limits from the Kubernetes API server and experience authentication timeouts as tokens expire during long-running operations. Error handling becomes a nightmare what happens when one cluster is unreachable? The runtime grows linearly with the number of clusters and resources, and these operations become increasingly memory-intensive as your environment grows.

![The Most Interesting Man in the World, with the caption, "I don't always track Kubernetes assets, but when I do, I use manual scripts and end up DDoSing my own APIs."](/images/blog/kubernetes-asset-tracking-at-scale/image7.webp)

### 2. Fragmented Visibility

Another common pattern is the proliferation of different monitoring tools across your organization. You might have Prometheus handling metrics while Datadog manages logs. Then there are custom dashboards built by individual teams, spreadsheets tracking cluster metadata maintained by platform engineers, and wiki pages documenting CRDs and their owners that rarely stay current.

This fragmentation creates an environment where no single source of truth exists. Metadata becomes inconsistent across tools, teams duplicate effort to gather the same information in different ways, and security blind spots emerge in the gaps between systems. According to the [2023 Grafana Observability Survey](https://grafana.com/observability-survey/2023/), **70% of companies** have a centralized observability initiative, but teams still spend time stitching data across tools.

### 3. CRD Chaos

Custom Resource Definitions deserve special attention because they're particularly challenging to govern. A typical enterprise Kubernetes deployment becomes a complex ecosystem of CRDs from various sources: service meshes like [Istio](https://istio.io/) or [Linkerd](https://linkerd.io/), monitoring solutions like [Prometheus](https://prometheus.io/) and [Grafana](https://grafana.com/), GitOps tools such as [Flux](https://fluxcd.io/) or [ArgoCD](https://argo-cd.readthedocs.io/en/stable/), cloud provider extensions, and your own in-house developed operators.

### 4. Manual Security Posture Assessment

Manual security checks simply don't scale with Kubernetes. Consider what it takes to validate just one security policy like ensuring all pods have resource limits defined:

```bash
# Run against each cluster, for each namespace
kubectl get pods -n $NAMESPACE -o json | jq '.items[] | select(.spec.containers[].resources.limits == null) | .metadata.name'
```

Now imagine running this across dozens of security policies, hundreds of clusters, and thousands of name spaces. The math doesn't work you'd need an army of engineers just to keep up with basic security checks. As your environment grows, manual approaches become increasingly impractical, leaving gaps in your security posture that can lead to vulnerabilities. You need automation that can scale with your infrastructure.

## Best Practices for Kubernetes Asset Management

As Kubernetes adoption proliferates, organizations have developed sophisticated approaches to asset management. Before diving into specific solutions, let's explore the industry best practices that have emerged for tracking and managing Kubernetes resources at scale.

![Infographic titled 'Best Practices for Kubernetes Asset Management' showing four quadrants: a computer monitor with graphs labeled 'Centralized Visibility'; three colored labels reading 'team', 'app', and 'ENV' labeled 'Consistent Labeling Strategy'; a document and gear icon labeled 'Automated Data Collection'; and a code snippet with a shield icon labeled 'Governance of Custom Resources'.](/images/blog/kubernetes-asset-tracking-at-scale/image4.webp)

### Centralized Visibility

The cornerstone of effective Kubernetes management is establishing centralized visibility across all clusters and environments. The [Kubernetes documentation on logging and monitoring](https://kubernetes.io/docs/concepts/cluster-administration/logging/) emphasizes the importance of aggregating logs and metrics to understand system behavior. In practice, this means implementing solutions that provide a "single pane of glass" view across your entire Kubernetes estate.

[Datadog's research on Kubernetes monitoring best practices](https://www.datadoghq.com/blog/monitoring-kubernetes-with-datadog/) highlights that organizations with centralized visibility detect and remediate issues 67% faster than those with siloed monitoring approaches. This translates directly to improved reliability and reduced incident response times. The key is ensuring that all stakeholders, from security teams to platform engineers to application developers, have access to the same consistent view of your infrastructure.

### Consistent Labeling Strategy

A robust labeling strategy forms the foundation of effective Kubernetes governance. According to Kubernetes' documentation on labels and selectors, proper labeling makes it easier to filter and organize resources efficiently. Labels should identify key metadata like _ownership_, _environment_, _application_ _tier_, and _cost center_.

Netflix's engineering team has [publicly shared how their labeling strategy enables them to track resource ownership and enforce policies across hundreds of clusters](https://substack.com/home/post/p-150938616). Their approach mandates certain labels for all resources (like `team`, `application`, and `environment`) and uses admission controllers to enforce these standards. This consistency makes cross-cluster queries and reporting possible at their massive scale.

### Automated Data Collection

Manual data collection simply doesn't scale in enterprise Kubernetes environments. The [CNCF whitepaper on Kubernetes monitoring](https://www.cncf.io/blog/2020/06/30/kubernetes-best-practices-for-monitoring-and-alerts/) emphasizes automating the collection of metrics, logs, and configuration data. Automation ensures consistent, timely data gathering without human intervention.

The technical requirements here are significant: collection must be lightweight enough not to impact cluster performance, reliable even during cluster degradation, and comprehensive across all resource types. Leading organizations implement collection mechanisms that run on predictable schedules and include robust error handling and retry logic.

### Governance of Custom Resources

As CRDs proliferate in production environments, establishing governance around their lifecycle becomes critical. [Red Hat's Kubernetes Operators best practices guide](https://redhat-best-practices-for-k8s.github.io/guide/) recommends using tools like Operator Lifecycle Manager (OLM) to track CRD versions and dependencies.

Effective CRD governance includes tracking who can create CRDs, documenting their purpose and ownership, managing versioning across clusters, and ensuring security reviews before deployment. Organizations like Spotify have developed internal review processes specifically for CRDs to prevent "cluster cruft" accumulation and security risks from poorly vetted extensions.

Effective CRD governance encompasses controlling CRD creation permissions, documenting their purpose and ownership, managing versioning across clusters, and conducting security reviews prior to deployment. [Spotify's internal processes](https://engineering.atspotify.com/2023/05/fleet-management-at-spotify-part-2-the-path-to-declarative-infrastructure/) exemplify this by integrating automated tools and review mechanisms to prevent the accumulation of unvetted extensions, thereby mitigating security risks and maintaining cluster hygiene.

### Query-Based Analysis

Rather than relying on pre-built dashboards alone, leading organizations implement query-based analysis capabilities for their Kubernetes data. This approach, highlighted in [Gartner's research on cloud infrastructure operations](https://www.gartner.com/en/infrastructure-and-it-operations-leaders/insights/manage-and-optimize-a-cloud-environment), enables ad-hoc investigation and exploration of the state of your infrastructure.

The ability to run SQL-like queries against your Kubernetes configuration data transforms how teams troubleshoot issues and assess compliance. Instead of pre-determining what metrics to collect and visualize, query-based analysis allows teams to answer novel questions as they arise, creating a more flexible and powerful approach to governance.

## K8s Governance Approaches

Organizations have developed several distinct approaches to Kubernetes governance at scale. Each has strengths and limitations that are important to understand before choosing a path.

### The Script-Based Approach

![Diagram titled 'Script-Based Approach' showing cron Jobs and Custom Scripts feeding into kubectl, which queries multiple Kubernetes clusters. Issues highlighted include authentication and rate limit problems, maintenance overhead, and performance slowdowns at scale.](/images/blog/kubernetes-asset-tracking-at-scale/image2.webp)

Many organizations begin with a collection of custom scripts and cron jobs that execute kubectl commands against their clusters. This approach is simple to implement initially but comes with significant drawbacks at scale. Scripts are difficult to maintain, prone to breaking when cluster configurations change, and struggle with authentication and rate limiting in multi-cluster environments.

Google's Site Reliability Engineering team has documented how their initial script-based approaches to fleet management broke down as they scaled beyond a few dozen clusters. The maintenance burden grew exponentially, and the time to gather complete inventory data stretched from minutes to hours as their environment expanded.

### The Agent-Based Approach

![Diagram titled 'Agent-Based Approach' showing three Kubernetes clusters each running an agent that sends data to a Central Platform. Listed issues include resource overhead, management complexity, and a focus on metrics over configuration data.](/images/blog/kubernetes-asset-tracking-at-scale/image5.webp)

Some organizations deploy monitoring agents within each Kubernetes cluster that report metrics and configuration data back to a central platform. This approach, used by tools like Datadog and New Relic, provides near real-time visibility but typically focuses more on performance metrics than configuration governance.

The primary limitation is that agents require cluster access and consume resources within the environment they're monitoring. As your cluster count grows, the overhead and management complexity of maintaining agents across environments can become significant. Additionally, many agent-based solutions are optimized for metrics rather than complete configuration capture.

### The Snapshot-Based Approach

![Diagram titled 'Snapshot-Based Approach' showing three labeled snapshots pointing to a storage system. Drawbacks listed include historical audit use, stale data, and lack of real-time query capabilities.](/images/blog/kubernetes-asset-tracking-at-scale/image3.webp)

Another common pattern is periodic snapshots of cluster configuration, often stored in object storage like S3 or GCS. This approach provides a historical record of cluster state but typically lacks real-time querying capabilities. Teams must process these snapshots with custom tools to extract meaningful insights.

While snapshots provide valuable historical data for auditing, they rarely offer the interactive query capabilities needed for operational governance. The lag between snapshots also means that teams may be working with stale information when responding to incidents.

### The Central Configuration Store Pattern

The central configuration store pattern, implemented by tools like CloudQuery, represents the most comprehensive approach to Kubernetes governance at scale. This pattern treats your infrastructure configuration as data to be collected, normalized, and queried in a standardized way.

This approach offers several advantages over alternatives:

1. **Complete coverage**: Unlike agent-based solutions that may focus on metrics, the central store captures full configuration details for all resource types.

2. **Cross-provider analysis**: The normalized schema allows querying across cloud providers and clusters with consistent syntax.

3. **Flexible storage**: Data can be stored in your existing data warehouse or database, leveraging your organization's data management practices.

4. **Query-based insights**: SQL provides a powerful, familiar language for exploring your infrastructure state.

5. **Historical analysis**: Changes over time are tracked, enabling drift detection and compliance history.

## Implementation Strategies

[CloudQuery](https://www.cloudquery.io/) implements the central configuration store pattern with some key technical characteristics that make it particularly well-suited for Kubernetes governance at scale.

### Integration-Based Architecture

CloudQuery uses a [integration-based architecture](https://www.cloudquery.io/hub/plugins/source/cloudquery/k8s/latest/docs) to connect to various data sources, including Kubernetes clusters across [AWS](https://www.cloudquery.io/hub/plugins/source/cloudquery/aws/latest/docs), [Azure](https://www.cloudquery.io/hub/plugins/source/cloudquery/azure/latest/docs), and [GCP](https://www.cloudquery.io/hub/plugins/source/cloudquery/gcp/latest/docs). The [Kubernetes integration](https://www.cloudquery.io/hub/plugins/source/cloudquery/k8s/latest/docs) handles authentication, rate limiting, and efficient data collection automatically, solving many of the challenges that plague script-based approaches.

This architecture allows CloudQuery to adapt to different environments without requiring code changes. Whether you're running EKS, AKS, GKE, or self-managed Kubernetes, the same integration can extract configuration data with consistent schema and performance characteristics.

### SQL-Based Analysis

Once data is collected, CloudQuery normalizes it into SQL tables with a consistent schema. This approach lets you leverage the full power of SQL for analysis, joining Kubernetes data with data from other sources for comprehensive visibility.

For example, you can run queries like:

```sql
-- Find pods without resource limits across all clusters
SELECT
  context as cluster,
  namespace,
  name as pod_name
FROM k8s_core_pods
WHERE JSON_ARRAY_LENGTH(
  JSON_EXTRACT(spec, '$.containers[*].resources.limits')
) = 0;
```

Or more complex queries that join Kubernetes data with cloud provider data:

```sql
-- Find EKS clusters with public API endpoints but without API server authorized networks
SELECT
  eks.name as cluster_name,
  eks.endpoint as api_endpoint,
  eks.resources_vpc_config_endpoint_public_access as public_access
FROM aws_eks_clusters eks
LEFT JOIN aws_eks_cluster_security_groups sg
  ON eks.name = sg.cluster_name
WHERE eks.resources_vpc_config_endpoint_public_access = TRUE
AND (
  eks.resources_vpc_config_public_access_cidrs IS NULL
  OR JSON_ARRAY_LENGTH(eks.resources_vpc_config_public_access_cidrs) = 0
);
```

These queries would be extremely complicated to run without a central configuration store. With CloudQuery, they're just SQL against your existing database.

### Incremental Syncs

One of the key technical challenges in Kubernetes governance is efficiently handling updates without overloading the API server. CloudQuery addresses this with incremental sync capabilities that minimize the data transferred during updates.

Rather than pulling all configuration data in every sync, CloudQuery intelligently identifies what has changed and updates only those resources. This approach reduces load on your clusters and enables more frequent updates without performance impact.

### Alternative Governance and Visibility Platforms

Beyond the central configuration store pattern, several other platforms and frameworks aim to streamline Kubernetes asset management:

[**Backstage**](https://backstage.spotify.com/) is an open-source developer portal from Spotify that consolidates tooling, services, and documentation in one UI. Backstage's Software Catalog can ingest Kubernetes component definitions, CRDs, and metadata, enabling teams to discover and manage clusters, services, and resources alongside CI/CD pipelines and APIs.

CloudQuery provides a first-class [Backstage integration](https://www.cloudquery.io/hub/plugins/source/cloudquery/backstage/latest/docs) that syncs your normalized Kubernetes and cloud config data directly into Backstage's Software Catalog. This lets you:

- Surface real-time cluster inventories, CRD versions, and resource metadata
- Link governance queries (e.g., missing labels, security posture checks) to Backstage entities

[**Rancher**](https://apps.rancher.io/) provides a unified UI for provisioning, securing, and monitoring multi-cluster environments. Rancher excels at lifecycle management, upgrading Kubernetes versions, applying security policies via Gatekeeper, and managing RBAC across environments.

[**Lens**](https://k8slens.dev/) is a desktop IDE for Kubernetes offering real-time cluster visualization, log access, and terminal integration. Lens is ideal for developers and SREs who need local, ad-hoc visibility into cluster state but lacks enterprise-grade governance controls.

## Advanced SQL Patterns for K8s Governance

What truly sets CloudQuery apart in the Kubernetes governance space is its ability to implement sophisticated cross-domain governance logic using standard SQL. Unlike specialized tools that only handle Kubernetes data in isolation, CloudQuery's central configuration store approach allows you to join [Kubernetes](https://www.cloudquery.io/hub/plugins/source/cloudquery/k8s/latest/docs) data with information from [every other cloud service and tool in your environment](https://www.cloudquery.io/hub/plugins/source), creating truly comprehensive governance capabilities.

Let's explore some of the advanced patterns our customers are implementing with CloudQuery that would be difficult or impossible with other approaches.

### 1. Detecting `CrashLoopBackOff` Pods Across Clusters

Identifying workloads stuck in CrashLoopBackOff is a common operational challenge. With CloudQuery, one media streaming company implemented a cross-cluster monitoring solution using this query:

```sql
SELECT
  context as cluster,
  namespace,
  name as pod_name,
  JSON_EXTRACT_SCALAR(
    container_status, '$.state.waiting.reason'
  ) as wait_reason,
  JSON_EXTRACT_SCALAR(
    container_status, '$.state.waiting.message'
  ) as wait_message
FROM
  k8s_core_pods,
  JSON_EACH(
    JSON_EXTRACT(status, '$.containerStatuses')
  ) as container_status
WHERE
  JSON_EXTRACT_SCALAR(
    container_status, '$.state.waiting.reason'
  ) = 'CrashLoopBackOff';
```

This query finds all pods across all clusters that are in CrashLoopBackOff state, making it easy to identify problematic workloads. The company's SRE team built an alerting system on top of this query that reduced their mean time to detection for failed deployments by 73%.

### 2. Auditing for Security Best Practices

A major financial services customer uses CloudQuery to enforce security standards across their Kubernetes fleet. Their approach includes this query to identify containers running as root:

```sql
-- Find pods running as root
SELECT
  context as cluster,
  namespace,
  name as pod_name,
  JSON_EXTRACT_SCALAR(container, '$.name') as container_name
FROM
  k8s_core_pods,
  JSON_EACH(
    JSON_EXTRACT(spec, '$.containers')
  ) as container
WHERE
  JSON_EXTRACT(container, '$.securityContext.runAsNonRoot') IS NULL
  OR JSON_EXTRACT(container, '$.securityContext.runAsNonRoot') = 'false';
```

By running this query as part of their continuous compliance process, they've reduced security findings in audits by 68% and can now provide evidence of security controls to regulators in minutes rather than days.

### 3. Label and Annotation Standardization

A software as a service provider with over 300 microservices uses CloudQuery to enforce their labeling standards with this query:

```sql
-- Find resources missing required labels
SELECT
  context as cluster,
  namespace,
  name as deployment_name
FROM
  k8s_apps_deployments
WHERE
  labels->>'team' IS NULL
  OR labels->>'environment' IS NULL
  OR labels->>'application' IS NULL;
```

This query identifies deployments missing standardized labels required by their governance policy. The operations team runs this query nightly and automatically creates tickets for teams with non-compliant resources. This automated approach has improved label compliance from 63% to 97% without requiring manual reviews.

### 4. Count Kubernetes Nodes by Cloud Provider

This query counts the number of Kubernetes nodes running on AWS, Azure, and GCP separately, then returns a summary grouped by each cloud provider.

```sql
WITH

   SELECT Provider,Sum(Count) as _count,Provider
   FROM (SELECT
      'AWS' AS Provider,
      count(name) AS Count
    FROM k8s_core_nodes
    WHERE spec_provider_id LIKE 'aws://%'


    UNION ALL


    SELECT
      'Azure' AS Provider,
      count(name) AS Count
    FROM k8s_core_nodes
    WHERE spec_provider_id LIKE 'azure://%'


    UNION ALL


    SELECT
      'GCP' AS Provider,
      count(name) AS Count
    FROM k8s_core_nodes
    WHERE spec_provider_id LIKE 'google://%')

   GROUP BY Provider
```

These examples demonstrate how CloudQuery transforms Kubernetes governance from a manual, error-prone process to an automated, data-driven approach. The pattern of expressing governance requirements as SQL queries provides flexibility and power that script-based approaches simply can't match.

## Wrapping Up

Managing Kubernetes assets at scale requires moving beyond scripts and manual processes to a structured, queryable approach. The central configuration store pattern, implemented through tools like CloudQuery, provides the visibility and control needed to govern complex, multi-cloud Kubernetes environments.

By following the technical patterns outlined in this article, you can:

- Gain comprehensive visibility across clusters and clouds
- Enforce consistent standards and policies
- Reduce time spent on compliance and auditing
- Improve security posture through automated detection

The most successful organizations treat their Kubernetes infrastructure as data to be queried, not just systems to be managed. This shift in thinking from imperative management to declarative governance is key to scaling Kubernetes successfully.

## About CloudQuery

CloudQuery is a developer-first cloud governance platform designed to provide security, compliance, and FinOps teams complete visibility into their cloud assets. By leveraging SQL-driven flexibility, CloudQuery enables you to easily query, automate, and optimize your cloud infrastructure's security posture, compliance requirements, and operational costs at scale. The central configuration store pattern we've described is just one example of how we've engineered our platform to handle enterprise-scale data volumes.

Ready to see how CloudQuery can transform your cloud visibility? Our team can walk you through a tailored demo based on your cloud environment and use cases. Let's talk about how CloudQuery can fit into your stack. [Schedule a demo today](https://www.cloudquery.io/contact-us).

For more information on how CloudQuery can help with your specific use case, check out our [documentation](https://www.cloudquery.io/docs/platform/introduction) or [join our community](https://community.cloudquery.io/).
