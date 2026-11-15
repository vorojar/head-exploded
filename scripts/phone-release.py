#!/usr/bin/env python3
"""Apply one verified site release on Termux; read the manifest from stdin."""
import hashlib,json,os,re,shutil,subprocess,sys,tarfile,time,fcntl
from urllib.request import urlopen
from pathlib import Path
payload=json.loads(sys.stdin.read())
base=Path.home()/'server/apps/head-exploded'
if not re.fullmatch(r'[0-9a-f]{40}',payload['commit']):raise ValueError('Invalid source commit')
if payload['archive']!=f'head-exploded-{payload["commit"]}.tar.gz':raise ValueError('Invalid archive name')
for name,digest in payload['files'].items():
    if Path(name).is_absolute() or '..' in Path(name).parts or not re.fullmatch(r'[0-9a-f]{64}',digest):raise ValueError('Invalid manifest')
base.mkdir(parents=True,exist_ok=True)
lock=(base/'deployment.lock').open('a')
fcntl.flock(lock,fcntl.LOCK_EX)
release=base/'releases'/payload['commit']
archive=Path.home()/'server/artifacts'/payload['archive']
release.mkdir(parents=True,exist_ok=True)
with tarfile.open(archive) as tar:
    for item in tar.getmembers():
        p=Path(item.name)
        if p.is_absolute() or '..' in p.parts or not item.isfile():
            raise RuntimeError('Invalid release member: '+item.name)
    if {item.name for item in tar.getmembers()}!=set(payload['files']):raise ValueError('Archive/manifest mismatch')
    if sum(item.size for item in tar.getmembers())>50_000_000:raise ValueError('Release exceeds size limit')
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
      gzip_comp_level 9;
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
    # Graceful reload can take a moment to replace the old worker.
    for attempt in range(15):
        try:
            with urlopen('http://127.0.0.1:8900/head-exploded/version.json',timeout=5) as response:
                if json.load(response)['commit']==payload['commit']:break
        except Exception:
            if attempt==14:raise
        time.sleep(0.2)
    else:raise RuntimeError('Served version did not switch')
    for name,expected in payload['files'].items():
        for attempt in range(10):
            try:
                with urlopen('http://127.0.0.1:8900/head-exploded/'+name,timeout=15) as response:
                    if hashlib.sha256(response.read()).hexdigest()!=expected:raise RuntimeError('HTTP checksum mismatch: '+name)
                break
            except Exception as exc:
                if attempt==9:raise RuntimeError('HTTP verification failed for '+name) from exc
                time.sleep(0.2)
except Exception:
    if config_changed:
        config.write_text(original)
        subprocess.run(['nginx','-s','reload','-p',str(site)+'/','-c',str(config)],check=True)
    if old:
        temp=base/'current.rollback';temp.symlink_to(old);os.replace(temp,current)
    raise
print(json.dumps({'commit':payload['commit'],'files_verified':len(payload['files']),'release':str(release),'previous':old,'nginx_reloaded':config_changed}))
