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
# This program runs on Termux through the user's existing, verified SSH session.
REMOTE=r"""
import hashlib,json,os,re,shutil,subprocess,sys,tarfile
from pathlib import Path
payload=json.loads(sys.stdin.read())
base=Path.home()/'server/apps/head-exploded'
release=base/'releases'/payload['commit']
archive=Path.home()/'server/artifacts'/payload['archive']
release.mkdir(parents=True,exist_ok=True)
with tarfile.open(archive) as tar:
    for item in tar.getmembers():
        p=Path(item.name)
        if p.is_absolute() or '..' in p.parts or not item.isfile():
            raise RuntimeError('Invalid release member: '+item.name)
    tar.extractall(release,filter='data')
for rel,expected in payload['files'].items():
    actual=hashlib.sha256((release/rel).read_bytes()).hexdigest()
    if actual!=expected:raise RuntimeError('Release checksum mismatch: '+rel)
assets=base/'assets';assets.mkdir(exist_ok=True)
for path in (release/'assets').iterdir():
    target=assets/path.name
    if target.exists() and hashlib.sha256(target.read_bytes()).hexdigest()!=hashlib.sha256(path.read_bytes()).hexdigest():
        raise RuntimeError('Hash asset collision: '+path.name)
    if not target.exists():shutil.copy2(path,target)
# Preserve both the previous entry and all previous hash assets for open tabs.
current=base/'current';previous=base/'previous'
legacy=Path.home()/'server/apps/xiaomi-test-site/current/www/head-exploded'
old=os.readlink(current) if current.is_symlink() else (str(legacy.resolve()) if legacy.is_dir() else None)
if legacy.is_dir():
    for path in (legacy/'assets').glob('*'):
        target=assets/path.name
        if not target.exists():shutil.copy2(path,target)
if old:
    temp=base/'previous.pending'
    if temp.is_symlink():temp.unlink()
    temp.symlink_to(old);os.replace(temp,previous)
temp=base/'current.pending'
if temp.is_symlink():temp.unlink()
temp.symlink_to(release);os.replace(temp,current)
site=Path.home()/'server/apps/xiaomi-test-site'
config=site/'nginx.conf'
original=config.read_text()
start='    # head-exploded managed route begin'
end='    # head-exploded managed route end'
csp="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; media-src 'self' data:; img-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"
headers=f'''      add_header X-Content-Type-Options nosniff always;
      add_header Referrer-Policy no-referrer always;
      add_header Content-Security-Policy "{csp}" always;'''
legacy_routes='\n'.join(f'    location = /head-exploded/{name} {{ alias {legacy}/{name}; }}' for name in ['mixed.wav','mixed2.wav','mixed3.wav'] if (legacy/name).is_file())
routes=f'''{start}
{legacy_routes}
    location = /head-exploded {{ return 301 /head-exploded/; }}
    location ^~ /head-exploded/assets/ {{
      alias {assets}/;
{headers}
      add_header Cache-Control "public, max-age=31536000, immutable, no-transform" always;
    }}
    location ^~ /head-exploded/ {{
      alias {current}/;
      index index.html;
{headers}
      add_header Cache-Control "no-cache, no-transform" always;
    }}
{end}'''
if start in original:
    updated=re.sub(re.escape(start)+r'.*?'+re.escape(end),lambda _:routes,original,flags=re.S)
else:
    anchor='    location / { try_files $uri $uri/ =404; }'
    if original.count(anchor)!=1:raise RuntimeError('Cannot uniquely locate target server block')
    updated=original.replace(anchor,routes+'\n'+anchor)
config_changed=updated!=original
if config_changed:
    backup=base/f'nginx-before-{payload["commit"]}.conf'
    if not backup.exists():backup.write_text(original)
    config.write_text(updated)
try:
    subprocess.run(['nginx','-t','-p',str(site)+'/', '-c',str(config)],check=True)
    if config_changed:
        subprocess.run(['nginx','-s','reload','-p',str(site)+'/','-c',str(config)],check=True)
except Exception:
    if config_changed:config.write_text(original)
    if old:
        temp=base/'current.rollback';temp.symlink_to(old);os.replace(temp,current)
    raise
print(json.dumps({'commit':payload['commit'],'files_verified':len(payload['files']),'release':str(release),'previous':old,'nginx_reloaded':config_changed}))
"""

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
