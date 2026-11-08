"""Beck et al. V3 の許諾された気候区分を取得する。API キーは不要。"""
import hashlib
import json
import pathlib
import tempfile
import urllib.request
import zipfile
root=pathlib.Path(__file__).resolve().parents[2]
metadata=json.loads((root/'data/climate-provenance.json').read_text())
target=root/'.cache/climate/koppen-1991-2020.tif'
if target.exists() and hashlib.sha256(target.read_bytes()).hexdigest()==metadata['sha256']:
    print('climate raster already verified')
else:
    with tempfile.TemporaryDirectory() as folder:
        archive=pathlib.Path(folder)/'koppen.zip'
        urllib.request.urlretrieve(metadata['download'],archive)
        with zipfile.ZipFile(archive) as source:
            data=source.read(metadata['file'])
        if hashlib.sha256(data).hexdigest()!=metadata['sha256']:
            raise RuntimeError('気候区分データの整合性を確認できませんでした。')
        target.parent.mkdir(parents=True,exist_ok=True)
        target.write_bytes(data)
        print('climate raster downloaded and verified')
