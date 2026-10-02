"""Import the author's free CC0 itch.io downloads into reproducible local packs.

Uses the normal public zero-price download flow, never an account or paid link.
Raw archives and source license pages are kept under assets-source (not shipped).
"""
import html as htmlmod
import json
import pathlib
import re
import urllib.request
import urllib.parse
import http.cookiejar
import zipfile
import io

ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets-source" / "foozle"
SOURCE.mkdir(parents=True, exist_ok=True)
PACKS = ["dungeon-tileset", "exterior-tileset", "warrior", "sorceress", "necromancer", "skeleton-hunter-enemy", "skeleton-king-boss", "goblin-beast-boss", "equipment", "rpg-ui", "effects", "desert-tileset", "lava-dungeon-tileset"]

def import_pack(slug):
    folder = SOURCE / slug
    folder.mkdir(exist_ok=True)
    # Provenance JSON is committed, archives/extracted packs are intentionally
    # ignored. A fresh checkout must still acquire the author-owned source art.
    if (folder / "complete.json").exists() and any((folder / "pack").rglob("*.png")) and any(folder.glob("*.zip")):
        print(slug, "cached", flush=True)
        return
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
    opener.addheaders = [("User-Agent", "Mozilla/5.0 (Asset importer; normal public CC0 download)")]
    url = "https://foozlecc.itch.io/lucifer-" + slug
    body = opener.open(url, timeout=45).read().decode()
    (folder / "license-page.html").write_text(body, encoding="utf8")
    if "CC0" not in body or "free to use and modify" not in body:
        raise RuntimeError("Author's CC0 license was not present")
    token = htmlmod.unescape(re.search(r'name="csrf_token" value="([^"]+)"', body).group(1))
    data = urllib.parse.urlencode({"csrf_token": token}).encode()
    req = urllib.request.Request(url + "/download_url", data=data, headers={"Referer": url, "X-Requested-With": "XMLHttpRequest"})
    download_url = json.loads(opener.open(req, timeout=45).read())["url"]
    download_page = opener.open(download_url, timeout=45).read().decode()
    (folder / "download-page.html").write_text(download_page, encoding="utf8")
    upload_ids = re.findall(r'data-upload_id="(\d+)"', download_page)
    if not upload_ids:
        upload_ids = re.findall(r'data-upload_id=\"?(\d+)', download_page)
    print(slug, "uploads", upload_ids, flush=True)
    for upload_id in upload_ids:
        req = urllib.request.Request(url + "/file/" + upload_id, data=data, headers={"Referer": download_url, "X-Requested-With": "XMLHttpRequest"})
        response = opener.open(req, timeout=45)
        result = response.read()
        if "json" in response.headers.get("Content-Type", ""):
            result = opener.open(json.loads(result)["url"], timeout=60).read()
        archive = folder / (upload_id + ".zip")
        archive.write_bytes(result)
        with zipfile.ZipFile(io.BytesIO(result)) as z:
            for entry in z.infolist():
                target = (folder / "pack" / entry.filename).resolve()
                if not target.is_relative_to((folder / "pack").resolve()):
                    raise RuntimeError("Unsafe archive path")
            z.extractall(folder / "pack")
        print(slug, "downloaded", len(result), "bytes", flush=True)
    (folder / "complete.json").write_text(json.dumps({"source": url, "license": "CC0-1.0", "author": "David / chroma_dave", "publisher": "Foozle", "uploads": upload_ids}, indent=2), encoding="utf8")

if __name__ == "__main__":
    import sys
    failed = False
    for slug in sys.argv[1:] or PACKS:
        try:
            import_pack(slug)
        except Exception as error:
            failed = True
            print(slug, "ERROR", error, flush=True)
    if failed:
        raise SystemExit(1)
