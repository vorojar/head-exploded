#!/usr/bin/env python3
"""Package the already verified Vite build for the phone's pull deployer."""
import hashlib,json,subprocess,tarfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
dist=ROOT/'remotion/player/dist'
out=ROOT/'work/phone-publish';out.mkdir(parents=True,exist_ok=True)
commit=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
(dist/'version.json').write_text(json.dumps({'commit':commit,'episodes':3,'contentRevision':'2026-11-15'})+'\n')
files={str(p.relative_to(dist)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(dist.rglob('*')) if p.is_file()}
archive=out/'release.tar.gz'
with tarfile.open(archive,'w:gz') as tar:
    for name in files:tar.add(dist/name,arcname=name,recursive=False)
payload={'commit':commit,'archive':f'head-exploded-{commit}.tar.gz','files':files,'archiveSha256':hashlib.sha256(archive.read_bytes()).hexdigest()}
(out/'manifest.json').write_text(json.dumps(payload,indent=2)+'\n')
print(f'Packaged {len(files)} files for source {commit}')
