from pathlib import Path
from PIL import Image,ImageDraw
import json
root=Path(__file__).resolve().parents[1]
out=root/'public/assets';artifacts=root/'artifacts';artifacts.mkdir(exist_ok=True)
meta=json.loads((out/'manifest.json').read_text(encoding='utf8'))
tiles=Image.open(out/'world/tiles.png').convert('RGBA')
sheet=Image.new('RGBA',(8*132,5*110),(25,35,31,255));d=ImageDraw.Draw(sheet)
for i in range(meta['tiles']['count']):
 im=tiles.crop((i%8*32,i//8*32,i%8*32+32,i//8*32+32));alpha=im.getchannel('A');print('tile',i,'opaque',sum(a==255 for a in alpha.getdata()),'bbox',im.getbbox())
 sheet.alpha_composite(im.resize((96,96),Image.Resampling.NEAREST),(i%8*132,i//8*110+14));d.text((i%8*132,i//8*110),str(i),fill='white')
sheet.save(artifacts/'curated-tile-inspection.png')
paths=sorted((out/'portraits').glob('*.png'))+sorted((out/'sprites').glob('f*-mob-*.png'))
sheet=Image.new('RGBA',(8*100,((len(paths)+7)//8)*105),(25,35,31,255));d=ImageDraw.Draw(sheet)
for i,p in enumerate(paths):
 im=Image.open(p).convert('RGBA');im=im.crop((0,0,min(64,im.width),im.height));im.thumbnail((80,80),Image.Resampling.NEAREST);sheet.alpha_composite(im,(i%8*100, i//8*105+20));d.text((i%8*100,i//8*105),p.stem,fill='white')
sheet.save(artifacts/'curated-creature-inspection.png')
sheet=Image.new('RGBA',(8*115,16*76),(25,35,31,255));d=ImageDraw.Draw(sheet)
for index in range(128):
 im=Image.open(out/f'items/{index}.png').convert('RGBA')
 sheet.alpha_composite(im.resize((56,56),Image.Resampling.NEAREST),(index%8*115,index//8*76+18))
 d.text((index%8*115,index//8*76),str(index)+' '+meta['itemSources'][str(index)]['category'],fill='white')
sheet.save(artifacts/'curated-item-inspection.png')
