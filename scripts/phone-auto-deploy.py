#!/usr/bin/env python3
"""Pull verified public GitHub builds. No GitHub token or SSH key is needed."""
import argparse,hashlib,json,os,re,subprocess,sys,time
from pathlib import Path
from urllib.request import Request,urlopen
REPO='https://github.com/vorojar/head-exploded.git'
BASE=Path.home()/'server/apps/head-exploded'

def fetch(url,limit):
    with urlopen(Request(url,headers={'User-Agent':'HeadExplodedAutoDeploy/1.0'}),timeout=45) as response:
        data=response.read(limit+1)
    if len(data)>limit:raise ValueError('Download exceeds size limit')
    return data

def check():
    refs={line.split()[1]:line.split()[0] for line in subprocess.check_output(['git','ls-remote',REPO,'refs/heads/main','refs/heads/deploy-phone'],text=True,timeout=40).splitlines()}
    main=refs.get('refs/heads/main');built=refs.get('refs/heads/deploy-phone')
    if not built:return
    prefix=f'https://raw.githubusercontent.com/vorojar/head-exploded/{built}'
    payload=json.loads(fetch(prefix+'/manifest.json',1_000_000))
    if payload['commit']!=main:return # A newer main is still building; never deploy an outdated candidate.
    if not re.fullmatch('[0-9a-f]{40}',main):raise ValueError('Invalid main ref')
    current=BASE/'current/version.json'
    if current.is_file() and json.loads(current.read_text()).get('commit')==main:return
    print(f'Applying verified build for {main}',flush=True)
    archive=fetch(prefix+'/release.tar.gz',30_000_000)
    if hashlib.sha256(archive).hexdigest()!=payload['archiveSha256']:raise ValueError('Archive checksum mismatch')
    if payload['archive']!=f'head-exploded-{main}.tar.gz':raise ValueError('Invalid archive name')
    target=Path.home()/'server/artifacts'/payload['archive'];target.parent.mkdir(parents=True,exist_ok=True)
    staging=target.with_suffix('.pending');staging.write_bytes(archive);os.replace(staging,target)
    subprocess.run([sys.executable,str(Path(__file__).with_name('phone-release.py'))],input=json.dumps(payload),text=True,check=True,timeout=120)
    (BASE/'auto-status.json').write_text(json.dumps({'commit':main,'deployedAtUnix':int(time.time()),'status':'success'})+'\n')
    print(f'Deployed {main}',flush=True)

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--once',action='store_true');args=parser.parse_args()
    if args.once:check();return
    print('Head Exploded auto deployer started; checking main every 60 seconds.',flush=True)
    while True:
        try:check()
        except Exception as exc:print(f'Deploy check failed; current release retained: {exc}',flush=True)
        time.sleep(60)
if __name__=='__main__':main()
