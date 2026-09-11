import sys, importlib.util
spec = importlib.util.spec_from_file_location("pd", sys.argv[3]); pd = importlib.util.module_from_spec(spec)
import types
src = open(sys.argv[3]).read().split("pa, pb = sys.argv")[0]
mod = types.ModuleType("pd"); exec(src, mod.__dict__)
w1,h1,n1,A = mod.read_png(sys.argv[1]); w2,h2,n2,B = mod.read_png(sys.argv[2])
stride = w1*n1; BAND = 300
bands = {}
for y in range(h1):
    ra = A[y*stride:(y+1)*stride]; rb = B[y*stride:(y+1)*stride]
    if ra == rb: continue
    c = 0
    for x in range(w1):
        o = x*n1
        if ra[o]!=rb[o] or ra[o+1]!=rb[o+1] or ra[o+2]!=rb[o+2]: c += 1
    bands[y//BAND] = bands.get(y//BAND,0) + c
for b in sorted(bands):
    print("y %4d-%4d : %8d px (%.2f%% of band)" % (b*BAND, min((b+1)*BAND, h1)-1, bands[b], 100.0*bands[b]/(w1*min(BAND, h1-b*BAND))))
