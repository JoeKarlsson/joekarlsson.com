#!/usr/bin/env python3
"""Generate a single collage cut-out element on the Gemini image API, then
optionally knock out the background with rembg to produce a transparent PNG
ready for the compositor.

Usage:
    export GEMINI_API_KEY=...
    python generate_element.py \
        --prompt "A single cut-out collage element on a plain pure-white background: ..." \
        --out scenes/scene1/elements/hand.png \
        --ref product.jpg --ref logo.png \
        --knockout

Deps: pip install google-genai rembg pillow
Model note: the nano-banana image line rotates ids. Default below is the
current Gemini image model; if the call errors with a model-not-found,
check Google's model list and pass --model explicitly. Never fall back to a
different model family silently.
"""

import argparse
import io
import os
import sys
from pathlib import Path

DEFAULT_MODEL = "gemini-3-pro-image-preview"
KEY_NAMES = ("GEMINI_API_KEY", "GOOGLE_API_KEY")


def load_dotenv_files():
    """Load KEY=value lines from .env in the current directory and the skill
    directory, without overwriting variables already set in the environment."""
    candidates = [Path.cwd() / ".env", Path(__file__).resolve().parent.parent / ".env"]
    for env_file in candidates:
        if not env_file.is_file():
            continue
        for line in env_file.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, _, v = line.partition("=")
            k, v = k.strip(), v.strip().strip("'\"")
            if k and v and k not in os.environ:
                os.environ[k] = v


def find_key() -> str | None:
    for name in KEY_NAMES:
        if os.environ.get(name):
            return os.environ[name]
    return None


KEY_HELP = """No Gemini API key found.

Get a free key at https://aistudio.google.com/apikey then do ONE of:

  1. Session only (macOS/Linux):   export GEMINI_API_KEY=your_key
     Session only (Windows):       setx GEMINI_API_KEY your_key   (then reopen the terminal)
  2. Per project: create a file named .env in your project folder containing:
       GEMINI_API_KEY=your_key
     (add .env to .gitignore so the key never lands in git)

GOOGLE_API_KEY is accepted as an alternate variable name."""


def generate(prompt: str, refs: list[Path], model: str) -> bytes:
    try:
        from google import genai
    except ImportError:
        sys.exit("pip install google-genai")
    key = find_key()
    if not key:
        sys.exit(KEY_HELP)

    client = genai.Client(api_key=key)
    contents = [prompt]
    for r in refs:
        try:
            from PIL import Image
            contents.append(Image.open(r))
        except Exception as e:
            sys.exit(f"Could not open reference image {r}: {e}")

    resp = client.models.generate_content(model=model, contents=contents)
    for cand in resp.candidates or []:
        for part in cand.content.parts:
            data = getattr(getattr(part, "inline_data", None), "data", None)
            if data:
                return data
    sys.exit("No image returned. Check the model id and prompt; the API response "
             "contained no inline image data.")


def knockout(png_bytes: bytes) -> bytes:
    try:
        from rembg import remove
    except ImportError:
        sys.exit("pip install rembg  (or drop --knockout)")
    return remove(png_bytes)


def main():
    ap = argparse.ArgumentParser(description="Generate a collage element via Gemini")
    ap.add_argument("--prompt")
    ap.add_argument("--out", type=Path)
    ap.add_argument("--ref", type=Path, action="append", default=[],
                    help="Reference image (product/brand). Repeatable.")
    ap.add_argument("--model", default=DEFAULT_MODEL)
    ap.add_argument("--knockout", action="store_true",
                    help="Remove the background with rembg for a transparent PNG")
    ap.add_argument("--check-key", action="store_true",
                    help="Verify a Gemini API key is available, then exit")
    args = ap.parse_args()

    load_dotenv_files()

    if args.check_key:
        if find_key():
            print("API key found. Ready to generate.")
            return
        sys.exit(KEY_HELP)

    if not args.prompt or not args.out:
        ap.error("--prompt and --out are required (unless using --check-key)")

    data = generate(args.prompt, args.ref, args.model)
    if args.knockout:
        data = knockout(data)

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_bytes(data)

    # normalize to RGBA png
    try:
        from PIL import Image
        img = Image.open(io.BytesIO(args.out.read_bytes())).convert("RGBA")
        img.save(args.out)
    except Exception:
        pass
    print(f"element -> {args.out}")


if __name__ == "__main__":
    main()
