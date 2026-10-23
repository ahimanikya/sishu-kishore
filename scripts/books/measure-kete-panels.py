from pathlib import Path
from PIL import Image
import json
S=Path(__file__).resolve().parents[2]/'provenance/kete-jami-loda'
out={}
for p in sorted((S/'comic-originals').glob('page-*-v1.png')):
 p=p.with_name(p.name.replace('-v1','-v2')) if p.with_name(p.name.replace('-v1','-v2')).exists() else p
 im=Image.open(p).convert('RGB');w,h=im.size
 def boundary(axis,expected):
  length=w if axis=='y' else h;limit=h if axis=='y' else w
  scores=[]
  for k in range(max(1,int(expected)-90),min(limit-1,int(expected)+90)):
   pts=[im.getpixel((v,k) if axis=='y' else (k,v)) for v in range(0,length,4)]
   scores.append((sum(max(rgb)<65 for rgb in pts)/len(pts),k))
  best=max(v[0] for v in scores);candidates=[k for score,k in scores if score>=max(.68,best-.02)]
  return min(candidates,key=lambda k:abs(k-expected)) if candidates else round(expected)
 xs=[0,boundary('x',w/2),w];ys=[0,boundary('y',h/3),boundary('y',2*h/3),h]
 out[str(int(p.stem.split('-')[1]))]={'width':w,'height':h,'x':xs,'y':ys}
(S/'comic-geometry.json').write_text(json.dumps(out,indent=2)+'\n');print(out)
