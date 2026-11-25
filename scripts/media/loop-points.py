# loop-points.py <file> <start> <end>: the start/end pair (3-4.9s apart) whose frames look most alike
import subprocess,sys
f,a,b=sys.argv[1],float(sys.argv[2]),float(sys.argv[3]); FPS=8; W,H=48,27
raw=subprocess.run(['ffmpeg','-v','error','-ss',str(a),'-t',str(b-a),'-i',f,'-vf',f'fps={FPS},scale={W}:{H},format=gray','-f','rawvideo','-'],capture_output=True,check=True).stdout
fr=[raw[i:i+W*H] for i in range(0,len(raw)-W*H+1,W*H)]
diff=lambda x,y: sum(abs(p-q) for p,q in zip(x,y))/len(x)
best=None
for i in range(len(fr)):
    for j in range(i+24,min(len(fr),i+int(4.9*FPS)+1)):
        d=diff(fr[i],fr[j])
        if best is None or d<best[0]: best=(d,i,j)
assert best, 'run too short'
d,i,j=best; print(f'{a+i/FPS:.3f} {a+j/FPS:.3f} {d:.1f}')
