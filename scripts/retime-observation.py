#!/usr/bin/env python3
"""Insert observation silence around reviewed audio, preserving every phrase."""
import hashlib,json,subprocess,wave
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
copy=ROOT/'remotion/src/lesson-copy.json';reviewed=hashlib.sha256(copy.read_bytes()).hexdigest()
capfile=ROOT/'remotion/src/captions.json';captions=json.loads(capfile.read_text());texts={k:[(c['text'],c['zh']) for c in v] for k,v in captions.items()}
out=ROOT/'work/observation-retime';out.mkdir(exist_ok=True,parents=True)
for ep in ['1','3']:
 path=ROOT/f'remotion/src/timeline{"" if ep=="1" else ep}.json';data=json.loads(path.read_text());segments=data.get('timeline',data.get('segments'))
 if any('observationLeadFrames' in s for s in segments):continue
 with wave.open(str(ROOT/f'work/narration-cache/episode{ep}.wav'),'rb') as w:
  rate=w.getframerate();channels=w.getnchannels();width=w.getsampwidth();samples=w.readframes(w.getnframes());assert abs(w.getnframes()/rate-segments[-1]['end']/24)<.01
 chunks=[];offset=0
 for s in segments:
  old_start,old_end=s['start'],s['end'];lead=48 if ep=='1' and s['id'] in ['frontal','parietal','temporal','sphenoid','ethmoid','palatine'] else 0
  tail=48 if ep=='1' and s['id'] in ['temporal','sphenoid','ethmoid','palatine'] else (144 if ep=='3' and s['id']=='cn-table' else 0)
  stride=channels*width
  chunks.extend([bytes(lead*rate//24*stride),samples[old_start*rate//24*stride:old_end*rate//24*stride],bytes(tail*rate//24*stride)])
  shift=(offset+lead)/24*1000
  for c in captions[ep]:
   if c['segmentId']==s['id']:c['startMs']=round(c['startMs']+shift);c['endMs']=round(c['endMs']+shift)
  s['start']=old_start+offset;s['end']=old_end+offset+lead+tail;s['observationLeadFrames']=lead;s['observationTailFrames']=tail;offset+=lead+tail
 totalkey='total_frames' if 'total_frames' in data else 'total';data[totalkey]=segments[-1]['end']
 wav=out/f'episode{ep}.wav'
 with wave.open(str(wav),'wb') as w:w.setnchannels(channels);w.setsampwidth(width);w.setframerate(rate);w.writeframes(b''.join(chunks))
 subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),'-codec:a','libmp3lame','-q:a','3','-ar',str(rate),'-ac','1',str(ROOT/f'remotion/public/narration{ep}.mp3')],check=True)
 path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');print(f'ep{ep}: added {offset/24:.1f}s observation silence; reviewed narration unchanged')
assert texts=={k:[(c['text'],c['zh']) for c in v] for k,v in captions.items()}
capfile.write_text(json.dumps(captions,ensure_ascii=False,indent=2)+'\n');assert hashlib.sha256(copy.read_bytes()).hexdigest()==reviewed
