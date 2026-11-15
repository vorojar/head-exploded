#!/usr/bin/env python3
"""Publish only head-exploded, with verified assets and atomic entry switching."""
import argparse
import hashlib
import json
from pathlib import Path
import shlex
import subprocess
import tarfile
import tempfile

ROOT=Path(__file__).resolve().parents[1]
DIST=ROOT/'remotion/player/dist'
REMOTE=(ROOT/'scripts/phone-release.py').read_text()

def run(args,**kwargs):return subprocess.run(args,check=True,**kwargs)
def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--host',default='xiaomi-server')
    parser.add_argument('--dry-run',action='store_true')
    args=parser.parse_args()
    commit=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
    dirty=subprocess.check_output(['git','status','--porcelain'],cwd=ROOT,text=True).strip()
    if dirty and not args.dry_run:raise SystemExit('Commit and push the reviewed work before deployment.')
    if not args.dry_run:
        remote=subprocess.check_output(['git','ls-remote','origin','refs/heads/main'],cwd=ROOT,text=True).split()[0]
        if remote!=commit:raise SystemExit('origin/main does not match this release. Push successfully first.')
    run(['npm','run','verify'],cwd=ROOT/'remotion')
    run(['npm','run','build'],cwd=ROOT/'remotion')
    version={'commit':commit,'contentRevision':'2026-11-15','episodes':3}
    (DIST/'version.json').write_text(json.dumps(version,indent=2)+'\n')
    files={str(p.relative_to(DIST)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(DIST.rglob('*')) if p.is_file()}
    assert 'index.html' in files and 'version.json' in files
    assert any(p.endswith('.mp3') for p in files)
    payload={'commit':commit,'archive':f'head-exploded-{commit}.tar.gz','files':files}
    print(json.dumps({'mode':'dry-run' if args.dry_run else 'deploy','host':args.host,'commit':commit,'files':len(files),'bytes':sum((DIST/p).stat().st_size for p in files),'dirty':bool(dirty)},ensure_ascii=False))
    if args.dry_run:return
    with tempfile.TemporaryDirectory(prefix='head-exploded-') as td:
        archive=Path(td)/payload['archive']
        with tarfile.open(archive,'w:gz') as tar:
            for name in files:tar.add(DIST/name,arcname=name,recursive=False)
        run(['scp',str(archive),f'{args.host}:server/artifacts/{archive.name}'])
        command='python -c '+shlex.quote(REMOTE)
        result=run(['ssh',args.host,command],input=json.dumps(payload),text=True,capture_output=True)
        print(result.stdout)
        if result.stderr:print(result.stderr)
    # Verify the actual phone entry and every published file independently of SSH.
    from urllib.request import Request,urlopen
    origin='http://100.93.28.43:8900/head-exploded/'
    for rel,expected in files.items():
        with urlopen(Request(origin+rel,headers={'User-Agent':'HeadExplodedRelease/1.0'}),timeout=30) as response:
            assert hashlib.sha256(response.read()).hexdigest()==expected,rel
    print(f'Verified {len(files)} served files against SHA-256; public browser verification follows.')

if __name__=='__main__':main()
