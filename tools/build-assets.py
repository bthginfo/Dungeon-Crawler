"""Curate imported CC0 source art and reproducibly draw the game's original pixel props.

No runtime hotlinks or unlicensed art. Nearest-neighbour resizing preserves pixels.
Run import-assets.py (and optionally import-crawl.py) first, then this script.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageEnhance
import json, hashlib, math, re, shutil

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'assets-source'/'foozle'
crawl=ROOT/'assets-source'/'crawl'/'pack'
OUT=ROOT/'public'/'assets'
for name in ['world','sprites','portraits','items','skills','licenses']:(OUT/name).mkdir(parents=True,exist_ok=True)
manifest={'sprites':{},'tiles':{},'sources':[]}

def save(im,path):
 im.save(OUT/path,optimize=True)

def find(pack, pattern):
 return next((SOURCE/pack).glob('pack/**/'+pattern))

def copied(pack,pattern,path):
 im=Image.open(find(pack,pattern)).convert('RGBA');save(im,path);return im

for key,pack,prefix in [('warrior','warrior','Warrior'),('sorceress','sorceress','Sorceress'),('necromancer','necromancer','Necromancer'),('skeleton-hunter','skeleton-hunter-enemy','SkeletonWithBow'),('skeleton-king','skeleton-king-boss','SkeletonKing'),('goblin-beast','goblin-beast-boss','GoblinBeast')]:
 descriptor={}
 for direction in ['Down','Left','Right','Up']:
  for action,patterns in [('idle',['Idle']),('walk',['Walk','Run']),('attack',['Attack01']),('hurt',['Hurt']),('death',['Death'])]:
   for suffix in patterns:
    matches=list((SOURCE/pack).glob('pack/**/'+prefix+direction+suffix+'.png'))
    if matches:break
   if not matches:continue
   im=Image.open(matches[0]).convert('RGBA')
   path=f'sprites/{key}-{direction.lower()}-{action}.png'
   save(im,path)
   descriptor[direction.lower()+'-'+action]={'path':'/assets/'+path,'width':im.height,'height':im.height,'frames':im.width//im.height}
 manifest['sprites'][key]=descriptor

tile_source=Image.open(find('dungeon-tileset','DungeonTileset.png')).convert('RGBA')
copied('dungeon-tileset','DungeonTileset.png','world/dungeon.png')
copied('exterior-tileset','OuterTileset.png','world/exterior.png')
copied('desert-tileset','Desert Tileset.png','world/desert.png')
copied('lava-dungeon-tileset','LavaDungeonTileset.png','world/lava.png')

# A compact tile atlas contains the curated author's floors/walls plus original
# broadcast materials and hazard surfaces. Tile coordinates are stable API.
tiles=[]
def original(index):
 x=(index%21)*32;y=(index//21)*32
 return tile_source.crop((x,y,x+32,y+32))
for index in [84,85,86,105,106,107,163,164,4,5,6,25,26,27,22,110,131]:tiles.append(original(index))
for style in ['grate','carpet','metal','circuit','water','oil','ice','lava','hazard','void']:
 im=Image.new('RGBA',(32,32),(42,48,45,255));d=ImageDraw.Draw(im)
 if style=='grate':
  d.rectangle((0,0,31,31),fill='#252e2b');d.rectangle((0,0,31,31),outline='#454e47')
  for x in range(4,30,5):
   for y in range(4,30,5):d.rectangle((x,y,x+2,y+2),fill='#131b18');d.line((x,y+3,x+3,y+3),fill='#4b5549')
 elif style=='carpet':
  d.rectangle((0,0,31,31),fill='#5f302c');d.line((0,0,31,0),fill='#85584b');d.line((0,31,31,31),fill='#3f2625')
  for x in range(2,32,8):
   for y in range(3,32,8):d.point((x,y),fill='#a27c51');d.point((x+1,y+1),fill='#8d6846')
 elif style in ['metal','circuit']:
  d.rectangle((0,0,31,31),fill='#394746');d.rectangle((1,1,30,30),outline='#60716a');d.line((1,29,29,29),fill='#263633')
  for x,y in [(3,3),(28,3),(3,28),(28,28)]:d.rectangle((x,y,x+1,y+1),fill='#829584')
  if style=='circuit':
   d.line((4,12,14,12,14,20,26,20),fill='#609880',width=1);d.point((4,12),fill='#b1e6b5');d.point((26,20),fill='#b1e6b5')
 elif style in ['water','oil','ice','lava']:
  colors={'water':('#263e44','#42616a','#1b2f39'),'oil':('#242c29','#414936','#131b1c'),'ice':('#738989','#9caeaa','#516669'),'lava':('#6b3127','#c36e38','#923d28')};base,light,dark=colors[style]
  d.rectangle((0,0,31,31),fill=base)
  for y in [3,11,21,29]:
   x=(y*7)%22;d.line((x,y,min(31,x+9),y),fill=light);d.line((max(0,x-3),y+2,x+5,y+2),fill=dark)
  if style=='ice':d.line((3,31,12,19,9,7,16,0),fill=light)
 elif style=='hazard':
  d.rectangle((0,0,31,31),fill='#343d37')
  for x in range(-32,64,12):d.polygon([(x,0),(x+6,0),(x+38,32),(x+32,32)],fill='#9b7a42')
 else:d.rectangle((0,0,31,31),fill='#121b1a')
 tiles.append(im)
exterior=Image.open(find('exterior-tileset','OuterTileset.png')).convert('RGBA')
desert=Image.open(find('desert-tileset','Desert Tileset.png')).convert('RGBA')
lava=Image.open(find('lava-dungeon-tileset','LavaDungeonTileset.png')).convert('RGBA')
for sheet,box in [(exterior,(192,32,224,64)),(desert,(800,320,832,352)),(lava,(256,416,288,448)),(exterior,(32,32,64,64)),(lava,(96,96,128,128))]:tiles.append(sheet.crop(box))
atlas=Image.new('RGBA',(32*8,32*math.ceil(len(tiles)/8)),(0,0,0,0))
for i,im in enumerate(tiles):atlas.alpha_composite(im,(i%8*32,i//8*32))
save(atlas,'world/tiles.png')
manifest['tiles']={'path':'/assets/world/tiles.png','width':32,'height':32,'columns':8,'count':len(tiles),'floor':[0,1,2,3,4,5,6],'wall':[8,9,10,11,12,13],'grate':17,'carpet':18,'metal':19,'circuit':20,'water':21,'oil':22,'ice':23,'lava':24,'hazard':25,'void':26,'grass':27,'wood':28,'forgebrick':29,'rockwall':30,'forgewall':31}

# Use real CC0 details from the coherent primary atlas.
for name,box in {'banner':(480,64,544,128),'statue':(416,128,448,160),'statue-shield':(448,128,480,160),'torch':(480,0,512,64),'pillar':(576,128,608,224),'door':(608,0,640,64),'large-door':(608,96,672,160),'rug':(224,160,320,256),'grate':(576,64,608,96),'ground-bones':(416,160,448,192)}.items():
 save(tile_source.crop(box),'world/'+name+'.png')
torch=Image.open(find('lava-dungeon-tileset','Torch.png')).convert('RGBA');save(torch,'world/torch-animated.png')
flames=Image.open(find('desert-tileset','Campfire.png')).convert('RGBA');save(flames,'world/campfire.png')
copied('effects','Destroy Effect.png','sprites/impact.png')

# Bespoke 32-bit-era broadcast machinery. These are original pixel bitmaps drawn
# here, not imitations or ripped source screenshots. They are project-owned.
for kind in ['terminal','camera','crate','chest','fountain','exit','antenna','pipe','mushroom','furnace','bookshelf','clock','mirror','bones','reactor','shrine']:
 im=Image.new('RGBA',(64,64),(0,0,0,0));d=ImageDraw.Draw(im)
 shadow='#15201e';dark='#293531';mid='#556259';light='#849783';jade='#92d9b1';gold='#cda369';brown='#5f5141'
 if kind=='terminal':
  d.rectangle((17,16,47,40),fill=shadow);d.rectangle((17,14,45,37),fill=mid);d.rectangle((19,16,43,34),fill=dark);d.rectangle((21,18,41,30),fill='#203c35');d.line((23,22,36,22),fill=jade);d.line((23,25,31,25),fill='#558b6a');d.line((17,14,45,14),fill=light);d.polygon([(21,38),(42,38),(47,47),(17,47)],fill=mid);d.line((20,41,41,41),fill=light);d.rectangle((25,47,39,51),fill=shadow);d.rectangle((20,51,45,54),fill=dark)
 elif kind=='camera':
  d.rectangle((29,28,32,48),fill=mid);d.line((30,47,18,55),fill=light,width=2);d.line((30,47,43,55),fill=dark,width=2);d.rectangle((16,17,43,30),fill=shadow);d.rectangle((16,15,40,26),fill=mid);d.rectangle((18,15,37,16),fill=light);d.rectangle((37,18,45,24),fill=dark);d.rectangle((43,18,47,24),fill=jade);d.rectangle((20,18,22,20),fill='#d36d51');d.line((21,9,28,9,29,14),fill=mid,width=2)
 elif kind in ['crate','chest']:
  d.polygon([(13,29),(25,23),(51,29),(39,35)],fill='#877253');d.polygon([(13,29),(39,35),(39,51),(13,45)],fill='#615039');d.polygon([(39,35),(51,29),(51,44),(39,51)],fill='#3e392d');d.line((14,30,38,35),fill='#b49a6c');d.line((14,32,38,48),fill='#433929',width=2);d.line((16,43,37,36),fill='#9e8356');d.line((20,27,46,33),fill=dark,width=2);d.line((29,25,29,48),fill=dark,width=2)
  if kind=='chest':
   d.rectangle((13,34,37,38),fill=gold);d.rectangle((26,35,30,40),fill='#eac88a');d.rectangle((27,37,28,39),fill=shadow)
 elif kind=='fountain':
  d.polygon([(10,41),(20,31),(43,31),(54,41),(43,51),(21,51)],fill=mid);d.polygon([(15,39),(24,33),(40,33),(49,39),(41,45),(24,45)],fill='#34565b');d.line((23,38,42,38),fill='#91bdbc');d.rectangle((28,22,35,39),fill='#496261');d.rectangle((25,19,39,23),fill=light);d.line((28,24,24,36),fill='#77b0af');d.line((35,24,41,36),fill='#9bd3c9')
 elif kind=='exit':
  d.rectangle((10,12,54,58),fill=dark);d.rectangle((15,17,49,55),fill=shadow);d.rectangle((20,21,44,55),fill='#25473c');d.line((20,21,44,21),fill=jade,width=2);d.line((20,21,20,55),fill='#5c977a',width=2);d.line((44,21,44,55),fill='#5c977a',width=2)
  for y in range(12,57,7):d.line((10,y,15,y),fill=light);d.line((49,y,54,y),fill=light)
  for y in range(27,50,8):d.line((27,y,37,y),fill='#79ad86')
  d.polygon([(13,56),(50,56),(57,62),(6,62)],fill=mid)
 elif kind=='antenna':
  d.rectangle((23,46,40,56),fill=dark);d.rectangle((30,15,34,47),fill=mid);d.line((32,17,15,24),fill=light,width=2);d.line((32,17,49,24),fill=mid,width=2);d.line((20,13,20,35),fill=mid);d.line((44,13,44,35),fill=light);d.rectangle((27,7,37,17),fill=shadow);d.rectangle((30,8,34,13),fill=jade)
 elif kind=='pipe':
  d.rectangle((8,31,55,44),fill=dark);d.rectangle((8,28,55,38),fill=mid);d.line((8,28,55,28),fill=light);d.line((8,31,55,31),fill='#758175');d.rectangle((15,26,18,45),fill=shadow);d.rectangle((40,26,43,45),fill=shadow);d.rectangle((16,26,16,43),fill=light);d.rectangle((41,26,41,43),fill=light);d.rectangle((27,18,36,28),fill=dark);d.ellipse((25,14,38,26),fill=brown,outline=gold);d.line((28,17,35,23),fill=gold);d.line((35,17,28,23),fill=gold)
 elif kind=='mushroom':
  for x,y,h in [(22,39,18),(37,46,27),(46,36,13)]:
   d.rectangle((x-2,y-h+7,x+2,y),fill='#8b9580');d.polygon([(x-10,y-h+9),(x-8,y-h+2),(x,y-h-2),(x+8,y-h+3),(x+10,y-h+9)],fill='#4c8369');d.line((x-8,y-h+9,x+8,y-h+9),fill='#a6ce89');d.rectangle((x-3,y-h+1,x-1,y-h+3),fill='#c1d796');d.rectangle((x+4,y-h+4,x+5,y-h+6),fill='#8ec69a')
 elif kind=='furnace':
  d.rectangle((14,12,49,51),fill=dark);d.rectangle((17,15,46,26),fill=mid);d.line((17,15,45,15),fill=light);d.rectangle((19,31,43,45),fill=shadow);d.polygon([(21,43),(25,32),(28,41),(34,29),(40,43)],fill='#bb6336');d.polygon([(25,42),(29,35),(32,43),(36,36),(38,43)],fill='#e9b570');d.rectangle((24,3,36,13),fill=dark);d.line((14,51,49,51),fill=mid,width=3)
 elif kind=='bookshelf':
  d.rectangle((11,15,52,52),fill=brown);d.rectangle((13,17,50,50),fill=shadow)
  for row in [18,30,42]:
   for x in range(16,48,5):d.rectangle((x,row,x+3,row+8),fill=['#786953','#5a7567','#86605a','#85907c'][((x+row)//5)%4]);d.line((x,row+1,x+2,row+1),fill=gold)
   d.rectangle((12,row+9,51,row+11),fill='#7b6851')
 elif kind=='clock':
  d.rectangle((16,12,47,56),fill=brown);d.rectangle((19,15,44,40),fill=shadow);d.ellipse((21,16,42,37),fill='#b9b397',outline=gold);d.line((31,19,31,28,38,28),fill=dark,width=2);d.rectangle((28,40,35,43),fill=gold);d.line((31,42,31,50),fill=gold);d.ellipse((28,48,35,54),fill=gold)
 elif kind=='mirror':
  d.rectangle((15,10,48,53),fill=gold);d.rectangle((18,13,45,50),fill=dark);d.rectangle((20,15,43,48),fill='#586d6e');d.line((23,44,39,20),fill='#9cada6',width=2);d.line((25,44,41,20),fill='#778f87');d.rectangle((11,53,52,56),fill=brown)
 elif kind=='bones':
  d.line((12,44,43,29),fill='#afa68a',width=3);d.line((20,26,45,46),fill='#968d78',width=3);d.ellipse((23,22,38,34),fill='#aba48a');d.rectangle((26,26,28,28),fill=shadow);d.rectangle((33,26,35,28),fill=shadow);d.rectangle((29,29,32,32),fill=dark)
 elif kind=='reactor':
  d.polygon([(8,28),(31,11),(55,28),(55,45),(31,59),(8,45)],fill=dark);d.polygon([(11,27),(31,14),(52,27),(31,40)],fill=mid);d.polygon([(18,27),(31,18),(45,27),(31,35)],fill='#39644f');d.polygon([(25,25),(31,20),(38,25),(31,31)],fill=jade);d.line((12,32,28,43),fill='#96a788',width=2);d.line((51,32,35,43),fill='#96a788',width=2);d.line((31,42,31,56),fill=gold,width=2)
 else:
  d.polygon([(11,45),(22,36),(42,36),(54,45),(42,53),(22,53)],fill=mid);d.rectangle((27,19,37,41),fill=dark);d.polygon([(22,20),(32,9),(43,20),(32,29)],fill=gold);d.polygon([(26,20),(32,14),(38,20),(32,25)],fill=jade)
 save(im,'world/'+kind+'.png')

# Original small bestiary and mechanical jackal companion. Frame silhouettes
# retain eyes, metal armour, paws, tails and readable role details at native size.
for kind in ['slime','rat','bat','construct','nix']:
 sheet=Image.new('RGBA',(48*4,48),(0,0,0,0))
 for frame in range(4):
  im=Image.new('RGBA',(48,48),(0,0,0,0));d=ImageDraw.Draw(im);b=frame%2
  dark='#273d35';mid='#68836a';bright='#b2c9a0';eye='#eee0a4'
  if kind=='slime':
   d.polygon([(10,33),(11,24+b),(17,18+b),(29,17+b),(36,24+b),(38,34),(31,36),(18,36)],fill=dark);d.polygon([(13,31),(15,23+b),(21,20+b),(30,21+b),(34,31)],fill=mid);d.rectangle((18,22+b,23,24+b),fill=bright);d.rectangle((17,28+b,19,30+b),fill=eye);d.rectangle((28,28+b,30,30+b),fill=eye);d.line((22,33,26,33),fill=dark)
  elif kind=='rat':
   d.line((10,30,5,29,4,34,8,35),fill='#837365',width=2);d.polygon([(10,29+b),(16,21+b),(27,23+b),(33,29+b),(30,35),(15,34)],fill='#655f51');d.polygon([(26,25+b),(33,23+b),(40,30+b),(35,33)],fill='#918174');d.polygon([(28,24+b),(27,19+b),(31,21+b)],fill='#a08975');d.rectangle((32,27+b,33,28+b),fill=eye);d.rectangle((37,30+b,40,31+b),fill=dark);d.rectangle((14+b,33,17+b,36),fill='#928273');d.rectangle((28-b,33,31-b,36),fill='#928273')
  elif kind=='bat':
   span=4 if frame%2 else 0
   d.polygon([(23,21),(15,17-span),(5,14-span),(7,27),(13,25),(17,31),(23,29)],fill='#565952');d.polygon([(25,21),(33,17-span),(43,14-span),(41,27),(35,25),(31,31),(25,29)],fill='#777362');d.line((6,15-span,20,24),fill='#a0967c');d.line((42,15-span,28,24),fill='#aaa17c');d.rectangle((21,20,27,32),fill=dark);d.polygon([(21,22),(21,16),(24,21),(27,16),(27,23)],fill='#819080');d.rectangle((21,24,22,25),fill=eye);d.rectangle((26,24,27,25),fill=eye)
  elif kind=='construct':
   d.rectangle((15,11+b,33,23+b),fill=dark);d.rectangle((17,12+b,31,21+b),fill=mid);d.rectangle((19,15+b,29,17+b),fill='#c9d59c');d.polygon([(14,24+b),(33,24+b),(36,31),(29,36),(17,36),(11,31)],fill=dark);d.rectangle((16,24+b,31,32),fill=mid);d.rectangle((20,26+b,26,29+b),fill='#b4986d');d.rectangle((8,25+b,13,34),fill='#9aa38a');d.rectangle((34,25+b,39,34),fill='#879981');d.rectangle((16+b,35,20+b,39),fill=dark);d.rectangle((28-b,35,32-b,39),fill=dark);d.line((17,13+b,31,13+b),fill=bright)
  else:
   d.line((11,29,4,23,5,18),fill='#768e7e',width=2);d.polygon([(10,27+b),(15,22+b),(29,24+b),(33,30+b),(26,34),(13,32)],fill=dark);d.polygon([(14,24+b),(24,24+b),(26,30+b),(14,30+b)],fill='#768d7d');d.line((15,24+b,24,24+b),fill='#b2bca1');d.polygon([(27,24+b),(27,14+b),(31,20+b),(34,14+b),(35,24+b),(41,27+b),(39,30+b),(29,29+b)],fill='#708772');d.rectangle((33,23+b,36,24+b),fill='#b2edb5');d.rectangle((39,26+b,42,28+b),fill=dark);d.rectangle((13+b,31,16+b,36),fill='#708772');d.rectangle((28-b,32,31-b,36),fill='#a5b9a0');d.rectangle((17,27+b,21,29+b),fill='#c4a373')
  sheet.alpha_composite(im,(frame*48,0))
 path='sprites/'+kind+'.png';save(sheet,path)
 manifest['sprites'][kind]={d+'-'+a:{'path':'/assets/'+path,'width':48,'height':48,'frames':4} for d in ['down','left','right','up'] for a in ['idle','walk','attack','hurt','death']}

# DCSS's compatible 32px orthogonal public-domain art adds recognisable animal,
# fungus, spirit and machinery silhouettes. Match source art to the named mob;
# these are sprite adaptations with two-frame breathing, not claimed to be
# original full-direction attack sets.
manifest['creatureSources']={}
manifest['npcSources']={}
if crawl.exists() and (ROOT/'src/content/floors.ts').exists():
 artroot=crawl/'Dungeon Crawl Stone Soup Full'/'monster'
 candidates=list(artroot.rglob('*.png'))
 byname={p.name:p for p in candidates}
 patterns=[
  ('rat',['orange_rat.png','green_rat.png','grey_rat.png','rat.png']),
  ('louse',['giant_mite.png','giant_cockroach_new.png']),
  ('crawler',['spider.png','redback_new.png','jumping_spider_new.png']),
  ('worm',['rock_worm.png','giant_leech.png','worm_new.png','brain_worm_new.png']),
  ('jelly',['jellyfish.png','azure_jelly_new.png','acid_blob.png']),
  ('crab',['fire_crab.png','apocalypse_crab.png']),
  ('moth',['ghost_moth_new.png','moth_of_wrath_new.png']),
  ('beetle',['boring_beetle.png','boulder_beetle.png']),
  ('hound',['hound.png','hell_hound_new.png','warg.png']),
  ('spore',['giant_spore.png','wandering_mushroom_new.png']),
  ('fung',['deathcap.png','wandering_mushroom_new.png']),
  ('root',['thorn_hunter.png','vine_stalker.png']),
  ('leech',['giant_leech_new.png','giant_leech.png']),
  ('larva',['killer_bee_larva.png','brain_worm_new.png']),
  ('ghost',['ghost_new.png','flayed_ghost_new.png']),
  ('shadow',['shadow.png','eidolon.png','ghost_new.png']),
  ('wraith',['freezing_wraith.png','wraith.png']),
  ('tick',['giant_mite.png','worker_ant.png']),
  ('swarm',['giant_mosquito.png','bumblebee.png','red_wasp.png']),
  ('drone',['battlesphere.png','electric_golem.png','orb_of_electricity.png']),
  ('camera',['orb_of_electricity.png','crystal_guardian.png']),
  ('sentinel',['iron_golem.png','crystal_guardian.png','metal_gargoyle.png']),
  ('golem',['clay_golem.png','stone_golem.png','guardian_golem.png']),
  ('crystal',['crystal_golem.png','crystal_guardian.png']),
  ('goblin',['goblin_new.png','goblin_old.png']),
  ('slime',['acid_blob.png','brown_ooze.png','ooze_new.png']),
 ]
 tuples=re.findall(r"\['([^']+)','([^']+)','(?:chaser|flanker|shooter|summoner|tank|support|controller|ambusher)','[^']+','[^']+'",(ROOT/'src/content/floors.ts').read_text(encoding='utf8'))
 for index,(de,en) in enumerate(tuples):
  floor=index//10+1;mob=index%10
  if mob>=8:continue
  match=next((files for word,files in patterns if word in en.lower()),None)
  if not match:continue
  choices=[byname[name] for name in match if name in byname]
  if not choices:continue
  source=choices[(floor+mob)%len(choices)]
  image=Image.open(source).convert('RGBA')
  if image.size!=(32,32):continue
  family=f'f{floor:02d}-mob-{mob+1}';sheet=Image.new('RGBA',(96,48),(0,0,0,0))
  for i in range(2):sheet.alpha_composite(image,(8+i*48,2-i))
  path='sprites/'+family+'.png';save(sheet,path)
  manifest['sprites'][family]={d+'-'+a:{'path':'/assets/'+path,'width':48,'height':48,'frames':2} for d in ['down','left','right','up'] for a in ['idle','walk','attack','hurt','death']}
  manifest['creatureSources'][family]={'mob':en,'source':source.relative_to(crawl).as_posix(),'license':'CC0-1.0'}
 for npcid,filename in {'mira':'jessica_new.png','ilya':'eustachio_new.png','tam':'deep_dwarf_artificer.png','zuv':'goblin_new.png','enno':'joseph_new.png','sera':'spellforged_servitor.png','veyl':'frederick_new.png','rhea':'agnes_new.png','oris':'iron_golem.png'}.items():
  if filename not in byname:continue
  source=byname[filename];image=Image.open(source).convert('RGBA')
  if image.size!=(32,32):continue
  family='npc-'+npcid;sheet=Image.new('RGBA',(48,48),(0,0,0,0));sheet.alpha_composite(image,(8,1));path='sprites/'+family+'.png';save(sheet,path)
  manifest['sprites'][family]={d+'-'+a:{'path':'/assets/'+path,'width':48,'height':48,'frames':1} for d in ['down','left','right','up'] for a in ['idle','walk','attack','hurt','death']}
  portrait=Image.new('RGBA',(64,64),(0,0,0,0));portrait.alpha_composite(image.resize((64,64),Image.Resampling.NEAREST));save(portrait,'portraits/'+family+'.png')
  manifest['npcSources'][npcid]={'source':source.relative_to(crawl).as_posix(),'license':'CC0-1.0'}
nixportrait=Image.open(OUT/'sprites'/'nix.png').crop((0,0,48,48));box=nixportrait.getbbox();nixportrait=nixportrait.crop(box);canvas=Image.new('RGBA',(64,64),(0,0,0,0));nixportrait=nixportrait.resize((nixportrait.width*2,nixportrait.height*2),Image.Resampling.NEAREST);canvas.alpha_composite(nixportrait,((64-nixportrait.width)//2,64-nixportrait.height-4));save(canvas,'portraits/npc-nix.png')

classes=[('breaker','warrior',(1,1,1)),('sparkweaver','sorceress',(1,1,1)),('shade-runner','necromancer',(.8,1,1)),('scrapper','warrior',(1.3,1,.7)),('pact-warden','necromancer',(.9,1.2,.9)),('trail-hunter','skeleton-hunter',(1.1,1,.8))]
for classid,sprite,tint in classes:
 meta=manifest['sprites'][sprite]['down-idle'];im=Image.open(OUT/meta['path'].removeprefix('/assets/')).crop((0,0,48,48)).convert('RGBA');pixels=im.load()
 for y in range(im.height):
  for x in range(im.width):
   r,g,b,a=pixels[x,y];pixels[x,y]=(min(255,int(r*tint[0])),min(255,int(g*tint[1])),min(255,int(b*tint[2])),a)
 box=im.getbbox();cut=im.crop(box);canvas=Image.new('RGBA',(64,64),(0,0,0,0));cut=cut.resize((cut.width*2,cut.height*2),Image.Resampling.NEAREST);canvas.alpha_composite(cut,((64-cut.width)//2,64-cut.height-4));save(canvas,'portraits/'+classid+'.png')

# Bundle all animation frames into one 1024-wide atlas: one browser request,
# deduplicated own-creature frame aliases, no full-pack downloads at runtime.
frames={};unique={};cells=[]
for family,entries in manifest['sprites'].items():
 for action,meta in entries.items():
  sheet=Image.open(OUT/meta['path'].removeprefix('/assets/')).convert('RGBA')
  for i in range(meta['frames']):
   frame=sheet.crop((i*meta['width'],0,(i+1)*meta['width'],meta['height']))
   digest=hashlib.sha256(frame.tobytes()).hexdigest()
   if digest not in unique:unique[digest]=len(cells);cells.append(frame)
   cell=unique[digest];x=(cell%16)*64;y=(cell//16)*64
   frames[f'{family}:{action}:{i}']={'frame':{'x':x,'y':y,'w':frame.width,'h':frame.height},'rotated':False,'trimmed':False,'spriteSourceSize':{'x':0,'y':0,'w':frame.width,'h':frame.height},'sourceSize':{'w':frame.width,'h':frame.height}}
atlas=Image.new('RGBA',(1024,64*math.ceil(len(cells)/16)),(0,0,0,0))
for i,im in enumerate(cells):atlas.alpha_composite(im,((i%16)*64,(i//16)*64))
save(atlas,'sprites/actors.png')
(OUT/'sprites'/'actors.json').write_text(json.dumps({'frames':frames,'meta':{'image':'actors.png','format':'RGBA8888','size':{'w':atlas.width,'h':atlas.height},'scale':'1'}},separators=(',',':')),encoding='utf8')

# Stable semantic groups keep helmets, medicine and weapons recognisable in UI.
# The source filename of every exported icon is recorded for audit/reproduction.
equipment=sorted((SOURCE/'equipment').glob('pack/**/Png/*.png'))
equipment=[p for p in equipment if 'Rarity Backgrounds' not in str(p)]
itemroot=crawl/'Dungeon Crawl Stone Soup Full'/'item'
def eq(category):return [p for p in equipment if category in p.as_posix()]
def dc(category):return sorted((itemroot/category).glob('*.png')) if itemroot.exists() else []
misc=[p for p in dc('misc') if any(s in p.name for s in ['orb','lantern','lamp','mirror','stone','box','phial'])]
groups=[
 ('weapon',24,eq('/Weapons/')+dc('weapon')+dc('weapon/ranged')),
 ('offhand',8,dc('armor/shields')),
 ('head',8,eq('/Head/')+dc('armor/headgear')),
 ('body',12,eq('/Chest/')+dc('armor/torso')),
 ('hands',8,[p for p in eq('/Misc/') if 'Glove' in p.name]+dc('armor/hands')),
 ('feet',8,eq('/Feet/')+dc('armor/feet')),
 ('amulet',8,[p for p in eq('/Misc/') if 'Amulet' in p.name]+dc('amulet')),
 ('talisman',8,[p for p in eq('/Misc/') if 'Ring' in p.name]+dc('ring')),
 ('relic',16,misc+dc('misc/runes')),
 ('consumable',20,dc('potion')[:14]+dc('scroll')[:6]),
 ('key',8,[p for p in dc('misc') if p.name=='key.png']+dc('misc/runes')),
]
manifest['itemGroups']={};manifest['itemSources']={};item_index=0
for category,count,paths in groups:
 if not paths:raise RuntimeError('Missing CC0 item art for '+category)
 manifest['itemGroups'][category]={'start':item_index,'count':count}
 for variant in range(count):
  p=paths[variant%len(paths)];im=Image.open(p).convert('RGBA')
  bounds=im.getbbox()
  if bounds:
   im=im.crop(bounds);scale=24/max(im.size)
   im=im.resize((max(1,round(im.width*scale)),max(1,round(im.height*scale))),Image.Resampling.NEAREST)
  canvas=Image.new('RGBA',(32,32),(0,0,0,0));canvas.alpha_composite(im,((32-im.width)//2,(32-im.height)//2));save(canvas,f'items/{item_index}.png')
  manifest['itemSources'][str(item_index)]={'category':category,'source':p.relative_to(ROOT/'assets-source').as_posix(),'license':'CC0-1.0'}
  item_index+=1
skills=sorted((SOURCE/'rpg-ui').glob('pack/**/Skill Icons/**/Png/*.png'))
for i,p in enumerate(skills):save(Image.open(p).convert('RGBA'),f'skills/{i}.png')

# Physically small gradients for lights; graphics are still pixel-sharp.
for kind in ['glow','shadow','vignette']:
 size=128 if kind!='vignette' else 256
 im=Image.new('RGBA',(size,size));px=im.load()
 for y in range(size):
  for x in range(size):
   distance=math.hypot((x-size/2)/(size/2),(y-size/2)/(size/2))
   if kind=='glow':px[x,y]=(255,236,192,int(max(0,1-distance)**2*135))
   elif kind=='shadow':px[x,y]=(6,14,12,int(max(0,1-distance)**2*130))
   else:px[x,y]=(5,14,13,int(min(1,max(0,distance-.3))**1.5*190))
 save(im,'world/'+kind+'.png')

source_records=[]
for folder in SOURCE.iterdir():
 record=folder/'complete.json'
 if record.exists():
  item=json.loads(record.read_text(encoding='utf8'));item['acquired']='2026-10-02';item['archiveSHA256']={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in folder.glob('*.zip')};source_records.append(item)
manifest['sources']=source_records
if crawl.exists():
 shutil.copyfile(crawl/'Dungeon Crawl Stone Soup Full'/'LICENSE.txt',OUT/'licenses'/'crawl-CC0.txt')
 shutil.copyfile(crawl/'Dungeon Crawl Stone Soup Full'/'README.txt',OUT/'licenses'/'crawl-CREDITS.txt')
 manifest['sources'].append({'source':'https://opengameart.org/content/dungeon-crawl-32x32-tiles','license':'CC0-1.0','author':'Dungeon Crawl Stone Soup tile contributors','archiveSHA256':hashlib.sha256((ROOT/'assets-source'/'crawl'/'source.zip').read_bytes()).hexdigest(),'acquired':'2026-10-02'})
(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf8')
(ROOT/'src'/'game'/'assets-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf8')
(OUT/'licenses'/'foozle-CC0.txt').write_text('Lucifer Collection pixel assets\nCommissioned from David (https://x.com/chroma_dave)\nDistributed by Foozle (https://foozlecc.itch.io/)\nLicense: Creative Commons Zero v1.0 Universal (CC0-1.0)\nhttps://creativecommons.org/publicdomain/zero/1.0/\n\nThe author\'s pages state: This content is free to use and modify for all projects, including commercial projects. Attribution not required.\n\nSource URLs and archive SHA256 hashes are listed in assets/manifest.json.\nOriginal broadcast props, NIX and small creature pixel art are project-owned.\n',encoding='utf8')
print('Exported',len(list(OUT.rglob('*.png'))),'PNGs;',sum(p.stat().st_size for p in OUT.rglob('*.png')),'bytes; sprite families',list(manifest['sprites']))
