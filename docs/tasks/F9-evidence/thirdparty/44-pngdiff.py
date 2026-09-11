import sys, zlib, struct

def read_png(p):
    d = open(p,'rb').read()
    assert d[:8] == b'\x89PNG\r\n\x1a\n', 'not png'
    i = 8; idat = bytearray(); hdr = None
    while i < len(d):
        ln = struct.unpack('>I', d[i:i+4])[0]; typ = d[i+4:i+8]; body = d[i+8:i+8+ln]
        if typ == b'IHDR': hdr = struct.unpack('>IIBBBBB', body)
        elif typ == b'IDAT': idat += body
        elif typ == b'IEND': break
        i += 12 + ln
    w,h,bd,ct,comp,filt,inter = hdr
    assert bd == 8 and inter == 0, ('unsupported', bd, inter)
    nch = {0:1,2:3,3:1,4:2,6:4}[ct]
    raw = zlib.decompress(bytes(idat))
    stride = w*nch
    out = bytearray(h*stride); prev = bytearray(stride); pos = 0
    for y in range(h):
        f = raw[pos]; pos += 1
        line = bytearray(raw[pos:pos+stride]); pos += stride
        if f == 1:
            for x in range(nch, stride): line[x] = (line[x] + line[x-nch]) & 255
        elif f == 2:
            for x in range(stride): line[x] = (line[x] + prev[x]) & 255
        elif f == 3:
            for x in range(stride):
                a = line[x-nch] if x >= nch else 0
                line[x] = (line[x] + ((a + prev[x]) >> 1)) & 255
        elif f == 4:
            for x in range(stride):
                a = line[x-nch] if x >= nch else 0
                b = prev[x]; c = prev[x-nch] if x >= nch else 0
                pp = a + b - c
                pa = abs(pp-a); pb = abs(pp-b); pc = abs(pp-c)
                pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[x] = (line[x] + pr) & 255
        out[y*stride:(y+1)*stride] = line
        prev = line
    return w,h,nch,out

pa, pb = sys.argv[1], sys.argv[2]
w1,h1,n1,A = read_png(pa)
w2,h2,n2,B = read_png(pb)
print('A', w1, h1, 'ch', n1); print('B', w2, h2, 'ch', n2)
if (w1,h1,n1) != (w2,h2,n2):
    print('GEOMETRY MISMATCH'); sys.exit(0)
diff = 0; minx=10**9; miny=10**9; maxx=-1; maxy=-1; maxd=0
rows = set()
stride = w1*n1
for y in range(h1):
    ra = A[y*stride:(y+1)*stride]; rb = B[y*stride:(y+1)*stride]
    if ra == rb: continue
    rows.add(y)
    for x in range(w1):
        o = x*n1
        dd = abs(ra[o]-rb[o]) + abs(ra[o+1]-rb[o+1]) + abs(ra[o+2]-rb[o+2])
        if dd:
            diff += 1
            if dd > maxd: maxd = dd
            if x < minx: minx = x
            if x > maxx: maxx = x
            if y < miny: miny = y
            if y > maxy: maxy = y
tot = w1*h1
print('size', w1, 'x', h1, 'totalPx', tot)
print('diffPx', diff, 'pct', round(100.0*diff/tot, 3))
print('bbox x0,y0,x1,y1 =', minx, miny, maxx, maxy)
print('maxChannelSumDelta', maxd)
