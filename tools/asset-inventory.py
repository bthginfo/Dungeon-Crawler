from pathlib import Path
from PIL import Image,ImageDraw
root=Path(__file__).resolve().parents[1]
source=root/'assets-source'/'foozle'
for folder in source.iterdir():
 if not folder.is_dir(): continue
 files=list(folder.glob('pack/**/*.png'))
 print('\n'+folder.name,len(files))
 for p in files:
  if folder.name in ['effects','rpg-ui','exterior-tileset','desert-tileset','lava-dungeon-tileset'] or '/Down/' in p.as_posix():
   print(p.relative_to(folder).as_posix(),Image.open(p).size)
sheet=Image.open(next((source/'dungeon-tileset').glob('pack/**/DungeonTileset.png'))).convert('RGBA')
canvas=Image.new('RGBA',(1344,512),(30,34,36,255));canvas.alpha_composite(sheet.resize((1344,512),Image.Resampling.NEAREST))
d=ImageDraw.Draw(canvas)
for y in range(8):
 for x in range(21):
  d.rectangle((x*64,y*64,(x+1)*64-1,(y+1)*64-1),outline=(120,140,140,150))
  d.text((x*64+2,y*64+2),str(y*21+x),fill=(255,255,255))
canvas.save(root/'assets-source'/'tiles-grid.png')
