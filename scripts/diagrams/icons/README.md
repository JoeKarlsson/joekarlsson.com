# Diagram icons

[Lucide](https://lucide.dev) icons (lucide-static 0.469.0, ISC licence) for parts
of a diagram that have no product logo: agents (`bot`), people (`user`,
`user-check`), schedules (`clock`), alerts (`bell`), databases (`database`) and so
on. `draw.mjs` draws any name that isn't in `LOGOS` from this folder, stroked in
the text colour of the box it sits on.

To add one, find it on lucide.dev and download it with the same version:

```bash
curl -o scripts/diagrams/icons/<name>.svg https://cdn.jsdelivr.net/npm/lucide-static@0.469.0/icons/<name>.svg
```
