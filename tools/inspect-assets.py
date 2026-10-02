from pathlib import Path
from PIL import Image, ImageDraw
root=Path(__file__).resolve().parents[1]
paths=list((root/'assets-source'/'foozle').glob('*/pack/**/*.png'))
for p in paths:
    im=Image.open(p)
    print(p.relative_to(root/'assets-source'/'foozle'),im.size)
selected=[p for p in paths if 'dungeon' in str(p) or 'equipment' in str(p)][:30]
canvas=Image.new('RGB',(1000, max(1,len(selected))*300),(31,33,35))
d=ImageDraw.Draw(canvas)
for i,p in enumerate(selected):
    im=Image.open(p).convert('RGBA')
    im.thumbnail((950,250),Image.Resampling.NEAREST)
    canvas.paste(im,(10,i*300+30),im)
    d.text((10,i*300+5),str(p.relative_to(root/'assets-source'/'foozle')),fill='white')
(root/'artifacts').mkdir(exist_ok=True)
canvas.save(root/'artifacts'/'asset-inspection.png')
