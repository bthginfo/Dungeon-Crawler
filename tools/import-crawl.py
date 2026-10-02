from pathlib import Path
import urllib.request,re,zipfile,io,html,json
root=Path(__file__).resolve().parents[1]
folder=root/'assets-source'/'crawl';folder.mkdir(parents=True,exist_ok=True)
url='https://opengameart.org/content/dungeon-crawl-32x32-tiles'
body=urllib.request.urlopen(url,timeout=60).read().decode()
(folder/'license-page.html').write_text(body,encoding='utf8')
links=re.findall(r'href="([^"]+\.zip)"',body)
print(links,flush=True)
link=next((u for u in links if 'Full' in u or 'full' in u),links[0])
link=html.unescape(link)
if link.startswith('/'):link='https://opengameart.org'+link
blob=urllib.request.urlopen(link,timeout=60).read()
(folder/'source.zip').write_bytes(blob)
with zipfile.ZipFile(io.BytesIO(blob)) as z:
 for entry in z.infolist():
  if not (folder/'pack'/entry.filename).resolve().is_relative_to((folder/'pack').resolve()):raise RuntimeError('unsafe path')
 z.extractall(folder/'pack')
(folder/'source.json').write_text(json.dumps({'source':url,'download':link,'license':'CC0-1.0','authors':'Dungeon Crawl Stone Soup tile contributors; README included'},indent=2),encoding='utf8')
print(len(blob),'bytes',flush=True)
