"""Trace one of Joe's hand-drawn marks from a sketchbook photo into a Scribble path.

Usage:
    python3 scripts/media/trace-scribble.py photo.jpeg --crop X0 Y0 X1 Y1 --box W H \
        [--rotate ccw|cw|180] [--rays] [--retrace] [--preview out.png]

Prints the SVG path for src/data/scribbles.ts. Needs numpy, scipy and scikit-image
(pip install numpy scipy scikit-image pillow).

Scribble draws a mark in by running a dash along it, so a mark has to be the line
the pen took, not the outline of the ink. This thins the ink to its centerline,
turns that into a graph of crossings and the lines between them, and walks it the
way a pen would: straight on through a crossing, round any loop off it first. The
originals and the crop of every mark in use are listed in media-sources/README.md.

--crop      region of the photo, in its pixels (after EXIF rotation)
--box       viewBox to fit the mark into, keeping its proportions
--rotate    turn the crop first: ccw a quarter left (a coil drawn down the page),
            cw a quarter right, 180 for a page photographed upside down
--rays      separate strokes, each drawn from the center out, in order round it
--retrace   where two laps ran together the pen went over that stretch twice;
            without this the walk stops at the first such fork
--fill      stretch to fill the whole box, for marks that trace a target (rings,
            boxes, underlines); the page stretches them again to fit
--erase     blank a rectangle of the photo (its pixels) before cropping, to drop a
            neighbouring drawing; repeatable. A crop whose ink touches its edge is refused.
--min-spur  line ends shorter than this (photo pixels, default 25) are noise and get cut;
            lower it for marks made of short strokes, like a row of small X's
--offset    shift the result, to set two traces side by side in one viewBox
--preview   PNG of the result, shaded red to blue in drawing order
"""

import argparse
import math

import numpy as np
from PIL import Image, ImageDraw, ImageOps
from scipy import ndimage as ndi
from skimage.morphology import closing, disk, remove_small_objects, skeletonize

# Ink is anything darker than this fraction of the page around it
INK_THRESHOLD = 0.6
# Specks of ink smaller than this many pixels are dust, not marks
MIN_INK_PIXELS = 400
# Side branches shorter than this (in photo pixels) are skeleton noise at a line's end
MIN_SPUR = 25
# How far a simplified line may stray from the traced one, in photo pixels
SIMPLIFY_TOLERANCE = 2.0
ROTATIONS = {"ccw": Image.Transpose.ROTATE_90, "cw": Image.Transpose.ROTATE_270, "180": Image.Transpose.ROTATE_180}
# Ink this close to a crop edge means the crop cut the mark off
EDGE_MARGIN = 3
EDGES = {
    "top": lambda ink: ink[:EDGE_MARGIN],
    "bottom": lambda ink: ink[-EDGE_MARGIN:],
    "left": lambda ink: ink[:, :EDGE_MARGIN],
    "right": lambda ink: ink[:, -EDGE_MARGIN:],
}
NEIGHBORS = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]


def find_ink(photo):
    gray = np.asarray(photo.convert("L"), dtype=float)
    # Divide out the uneven light across the page (the pink lamp, the curl of the paper)
    page = ndi.gaussian_filter(ndi.grey_closing(gray, size=(41, 41)), 20)
    ink = gray / np.maximum(page, 1) < INK_THRESHOLD
    return remove_small_objects(closing(ink, disk(2)), max_size=MIN_INK_PIXELS)


def chain_length(chain):
    return sum(math.dist(chain[i], chain[i + 1]) for i in range(len(chain) - 1))


class CenterlineGraph:
    """The ink's one-pixel centerline as nodes (line ends, crossings) and edges (pixel chains)."""

    def __init__(self, ink, min_spur=MIN_SPUR):
        self.min_spur = min_spur
        skeleton = skeletonize(ink)
        self.stroke_width = max(6.0, 2 * float(np.median(ndi.distance_transform_edt(ink)[skeleton])))
        self.pixels = set(zip(*np.nonzero(skeleton)))
        self.edges = self.build()
        self.prune_spurs()

    def neighbors(self, p):
        return [(p[0] + dy, p[1] + dx) for dy, dx in NEIGHBORS if (p[0] + dy, p[1] + dx) in self.pixels]

    def build(self):
        degree = {p: len(self.neighbors(p)) for p in self.pixels}
        junctions = {p for p, d in degree.items() if d >= 3}
        # An X crossing thins to two Ys a few pixels apart: merge junction pixels that close
        merge_radius = int(1.6 * self.stroke_width)
        node_of = {}
        label = 0
        for p in junctions:
            if p in node_of:
                continue
            label += 1
            node_of[p] = label
            stack = [p]
            while stack:
                q = stack.pop()
                for r in junctions:
                    if r not in node_of and abs(r[0] - q[0]) <= merge_radius and abs(r[1] - q[1]) <= merge_radius:
                        node_of[r] = label
                        stack.append(r)
        for p, d in degree.items():
            if d == 1:
                label += 1
                node_of[p] = label

        edges = []
        seen = set()
        for start in node_of:
            for step in self.neighbors(start):
                if step in node_of:
                    if node_of[step] != node_of[start] and (start, step) not in seen:
                        seen.update({(start, step), (step, start)})
                        edges.append((node_of[start], node_of[step], [start, step]))
                    continue
                if (start, step) in seen:
                    continue
                chain = [start, step]
                prev, cur = start, step
                while cur not in node_of:
                    ahead = [q for q in self.neighbors(cur) if q != prev and q not in chain[-3:]]
                    if not ahead:
                        break
                    prev, cur = cur, ahead[0]
                    chain.append(cur)
                seen.update({(start, step), (cur, prev)})
                edges.append((node_of[start], node_of.get(cur, -1), chain))

        # A closed loop with no crossing or end has no nodes: give it one
        covered = {p for e in edges for p in e[2]}
        for first in self.pixels - covered:
            if first in covered:
                continue
            chain = [first]
            prev, cur = None, first
            while True:
                ahead = [q for q in self.neighbors(cur) if q != prev and q not in chain[-3:]]
                if not ahead or ahead[0] == first:
                    break
                prev, cur = cur, ahead[0]
                if cur in covered:
                    break
                chain.append(cur)
            covered |= set(chain)
            label += 1
            edges.append((label, label, chain + [first]))

        # Drop the stubs joining the two halves of one merged crossing
        return [e for e in edges if not (e[0] == e[1] and chain_length(e[2]) < 4 * self.stroke_width)]

    def degrees(self):
        degree = {}
        for u, v, _ in self.edges:
            degree[u] = degree.get(u, 0) + 1
            degree[v] = degree.get(v, 0) + 1
        return degree

    def prune_spurs(self):
        for _ in range(3):
            degree = self.degrees()
            spurs = [
                e for e in self.edges if (degree[e[0]] == 1) != (degree[e[1]] == 1) and chain_length(e[2]) < self.min_spur
            ]
            if not spurs:
                return
            for _, _, chain in spurs:
                self.pixels.difference_update(chain[1:-1])
            self.edges = self.build()

    def heading(self, chain, from_end):
        """Direction into a chain from one end, measured just past the crossing's bend."""
        c = chain[::-1] if from_end else chain
        i0 = min(int(self.stroke_width), len(c) - 2)
        i1 = min(i0 + int(2 * self.stroke_width), len(c) - 1)
        dy, dx = c[i1][0] - c[i0][0], c[i1][1] - c[i0][1]
        n = math.hypot(dy, dx) or 1
        return dy / n, dx / n

    def walk(self, retrace):
        """Pen strokes, each a list of (row, col) pixels in drawing order."""
        edges = self.edges
        used = [False] * len(edges)
        degree = self.degrees()
        strokes = []
        while not all(used):
            # Put the pen down at a free line end, the one nearest the top left
            starts = []
            for i, (u, v, c) in enumerate(edges):
                if used[i]:
                    continue
                if degree[u] == 1:
                    starts.append((c[0][0] + c[0][1], i, False))
                if degree[v] == 1:
                    starts.append((c[-1][0] + c[-1][1], i, True))
            _, i, backwards = min(starts) if starts else (0, used.index(False), False)
            stroke = []
            for _ in range(4 * len(edges)):
                used[i] = True
                u, v, c = edges[i]
                c = c[::-1] if backwards else c
                stroke += c if not stroke else c[1:]
                if all(used):
                    break
                node = u if backwards else v
                back = self.heading(c, True)
                going = (-back[0], -back[1])
                best, next_edge = -2.0, None
                for j, (u2, v2, c2) in enumerate(edges):
                    if used[j] and (j == i or not retrace):
                        continue
                    for at_end, end_node in ((False, u2), (True, v2)):
                        if end_node != node:
                            continue
                        d = self.heading(c2, at_end)
                        score = d[0] * going[0] + d[1] * going[1]
                        if used[j]:
                            score -= 0.6
                        if u2 == v2:
                            # A loop off this crossing gets drawn before the pen moves on
                            score += 1.5
                        if score > best:
                            best, next_edge = score, (j, at_end)
                if next_edge is None or best < -0.3:
                    break
                i, backwards = next_edge
            strokes.append(stroke)
        return [s for s in strokes if chain_length(s) > self.min_spur * 2]


def smooth(chain, window=7):
    if len(chain) < window * 2:
        return chain
    arr = np.array(chain, dtype=float)
    out = np.array([arr[max(0, i - window) : i + window + 1].mean(0) for i in range(len(arr))])
    out[0], out[-1] = arr[0], arr[-1]
    return [tuple(p) for p in out]


def simplify(chain, tolerance):
    """Ramer-Douglas-Peucker."""
    if len(chain) < 3:
        return chain
    arr = np.array(chain)
    a, b = arr[0], arr[-1]
    ab = b - a
    span = np.hypot(*ab)
    if span == 0:
        dist = np.hypot(*(arr - a).T)
    else:
        dist = np.abs(ab[0] * (arr[:, 1] - a[1]) - ab[1] * (arr[:, 0] - a[0])) / span
    k = int(dist.argmax())
    if dist[k] > tolerance:
        return simplify(chain[: k + 1], tolerance)[:-1] + simplify(chain[k:], tolerance)
    return [chain[0], chain[-1]]


def order_rays(strokes):
    center = np.array([p for s in strokes for p in s]).mean(0)
    outward = [s if math.dist(s[0], center) <= math.dist(s[-1], center) else s[::-1] for s in strokes]
    return sorted(outward, key=lambda s: math.atan2(s[-1][0] - center[0], s[-1][1] - center[1]))


def fit(strokes, box_w, box_h, fill, pad_fraction=0.04):
    """Map (row, col) pixels to viewBox (x, y), centered, keeping proportions unless fill."""
    allp = np.array([p for s in strokes for p in s])
    (y0, x0), (y1, x1) = allp.min(0), allp.max(0)
    pad = pad_fraction * min(box_w, box_h)
    sx, sy = (box_w - 2 * pad) / (x1 - x0), (box_h - 2 * pad) / (y1 - y0)
    if not fill:
        sx = sy = min(sx, sy)
    ox = (box_w - (x1 - x0) * sx) / 2 - x0 * sx
    oy = (box_h - (y1 - y0) * sy) / 2 - y0 * sy
    return [[(p[1] * sx + ox, p[0] * sy + oy) for p in s] for s in strokes]


def to_path(points):
    """M, then quadratic curves through the midpoints, in the site's existing style."""
    f = lambda v: f"{v:.1f}"
    d = f"M{f(points[0][0])},{f(points[0][1])}"
    if len(points) == 2:
        return d + f" L{f(points[1][0])},{f(points[1][1])}"
    for i in range(1, len(points) - 1):
        end = points[-1] if i == len(points) - 2 else ((points[i][0] + points[i + 1][0]) / 2, (points[i][1] + points[i + 1][1]) / 2)
        d += f" Q{f(points[i][0])},{f(points[i][1])} {f(end[0])},{f(end[1])}"
    return d


def save_preview(strokes, box_w, box_h, out):
    image = Image.new("RGB", (int(box_w), int(box_h)), "white")
    draw = ImageDraw.Draw(image)
    total = sum(len(s) - 1 for s in strokes) or 1
    done = 0
    for s in strokes:
        for m in range(len(s) - 1):
            t = done / total
            draw.line(s[m : m + 2], fill=(int(240 * (1 - t)), 40, int(240 * t)), width=4)
            done += 1
        draw.ellipse([s[0][0] - 6, s[0][1] - 6, s[0][0] + 6, s[0][1] + 6], outline="black", width=2)
    image.save(out)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("photo")
    ap.add_argument("--crop", nargs=4, type=int, required=True, metavar=("X0", "Y0", "X1", "Y1"))
    ap.add_argument("--box", nargs=2, type=float, required=True, metavar=("W", "H"))
    ap.add_argument("--rotate", choices=list(ROTATIONS))
    ap.add_argument("--rays", action="store_true")
    ap.add_argument("--retrace", action="store_true")
    ap.add_argument("--fill", action="store_true")
    ap.add_argument("--min-spur", type=float, default=MIN_SPUR)
    ap.add_argument("--offset", nargs=2, type=float, default=(0, 0), metavar=("DX", "DY"))
    ap.add_argument("--erase", nargs=4, type=int, action="append", default=[], metavar=("X0", "Y0", "X1", "Y1"))
    ap.add_argument("--preview")
    args = ap.parse_args()

    photo = ImageOps.exif_transpose(Image.open(args.photo))
    for box in args.erase:
        # Blank out a neighbouring drawing that the crop can't avoid
        ImageDraw.Draw(photo).rectangle(box, fill="white")
    photo = photo.crop(tuple(args.crop))
    if args.rotate:
        photo = photo.transpose(ROTATIONS[args.rotate])
    ink = find_ink(photo)
    clipped = [name for name, edge in EDGES.items() if edge(ink).any()]
    if clipped:
        raise SystemExit(
            f"Ink touches the {', '.join(clipped)} edge of the crop (after --rotate): the mark is cut off "
            "or a neighbour is caught. Widen --crop, or --erase the neighbour."
        )
    strokes = CenterlineGraph(ink, args.min_spur).walk(args.retrace)
    if not strokes:
        raise SystemExit("No mark found in that crop")
    strokes = [simplify(smooth(s), SIMPLIFY_TOLERANCE) for s in strokes]
    if args.rays:
        strokes = order_rays(strokes)
    fitted = [[(x + args.offset[0], y + args.offset[1]) for x, y in s] for s in fit(strokes, *args.box, args.fill)]
    if args.preview:
        save_preview(fitted, *args.box, args.preview)
    print(" ".join(to_path(s) for s in fitted))


if __name__ == "__main__":
    main()
