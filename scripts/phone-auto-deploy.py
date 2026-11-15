#!/usr/bin/env python3
"""Pull verified public GitHub builds. No GitHub token or SSH key is needed."""
import argparse,hashlib,json,os,re,subprocess,sys,time
from pathlib import Path
REPO='https://github.com/vorojar/head-exploded.git'
BASE=Path.home()/'server/apps/head-exploded'

def artifact(ref,name):
    cache=BASE/'build-cache.git'
    if not cache.exists():subprocess.run(['git','init','--bare',str(cache)],check=True,capture_output=True)
    if not subprocess.run(['git','--git-dir',str(cache),'cat-file','-e',ref+'^{commit}'],capture_output=True).returncode==0:
        subprocess.run(['git','--git-dir',str(cache),'fetch','--depth=1',REPO,ref],check=True,capture_output=True,timeout=120)
    return subprocess.check_output(['git','--git-dir',str(cache),'show',ref+':'+name],timeout=15)

def check():
    refs={line.split()[1]:line.split()[0] for line in subprocess.check_output(['git','ls-remote',REPO,'refs/heads/main','refs/heads/deploy-phone'],text=True,timeout=40).splitlines()}
    main=refs.get('refs/heads/main');built=refs.get('refs/heads/deploy-phone')
    if not built:return
    payload=json.loads(artifact(built,'manifest.json'))
    if payload['commit']!=main:return # A newer main is still building; never deploy an outdated candidate.
    if not re.fullmatch('[0-9a-f]{40}',main):raise ValueError('Invalid main ref')
    current=BASE/'current/version.json'
    if current.is_file() and json.loads(current.read_text()).get('commit')==main:return
    print(f'Applying verified build for {main}',flush=True)
    archive=artifact(built,'release.tar.gz')
    if len(archive)>30_000_000:raise ValueError('Archive exceeds size limit')
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
