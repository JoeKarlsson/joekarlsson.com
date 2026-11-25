# clip-levels.py <clip> [start seconds] [length seconds] [crop w:h:x:y]
# Prints an ffmpeg lutyuv filter that gives an archival clip the same brightness as the rest
# (Joe, 2026-11-25: "normalize them so they all have the same kind of brightness"): its darkest
# and brightest 2% go to black and white, like the site's pink pass, then a gamma curve sets the
# mean to TARGET. Gray output, as the pink pass grays everything anyway. A clip already at the
# target comes out the same, so running it twice is harmless.
import subprocess
import sys

TARGET = 0.42  # the mean of the first 28 clips, which Joe approved
GAMMA_LIMITS = (0.45, 2.5)  # past these, contrast suffers more than consistency gains

clip = sys.argv[1]
seek = ['-ss', sys.argv[2], '-t', sys.argv[3]] if len(sys.argv) > 3 else []
# Measure inside the crop: pillarbox bars would count as the clip's blacks
crop = f'crop={sys.argv[4]},' if len(sys.argv) > 4 else ''
luma = subprocess.run(
	['ffmpeg', '-nostdin', '-v', 'error', *seek, '-i', clip, '-vf',
	 f'{crop}fps=4,scale=64:36:flags=area,format=yuv420p,extractplanes=y', '-f', 'rawvideo', '-'],
	capture_output=True, check=True).stdout
values = sorted(luma)
low, high = values[int(len(values) * 0.02)], values[int(len(values) * 0.98) - 1]
span = max(high - low, 1)
stretched = [min(max((v - low) / span, 0), 1) for v in luma]


def mean_at(gamma):
	return sum(x**gamma for x in stretched) / len(stretched)


# The mean falls as gamma rises: bisect for the target
lo_g, hi_g = GAMMA_LIMITS
for _ in range(40):
	gamma = (lo_g + hi_g) / 2
	lo_g, hi_g = (gamma, hi_g) if mean_at(gamma) > TARGET else (lo_g, gamma)
gamma = round(min(max(gamma, GAMMA_LIMITS[0]), GAMMA_LIMITS[1]), 3)
print(f"lutyuv=y='16+219*pow(clip((val-{low})/{span},0,1),{gamma})':u=128:v=128")
