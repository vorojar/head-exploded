#!/usr/bin/env python3
"""Synthesize reviewed phrase units locally and derive captions from actual audio.
Requires Python 3.12, kokoro==0.9.4, soundfile, numpy, and ffmpeg.
No API key or cloud synthesis. Cache files live in ignored work/.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parents[1]
RATE = 24000
FPS = 24
VOICE = 'bm_george'
SPEED = 1.1

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--device', default='cpu', choices=['cpu','mps','cuda'])
    args = parser.parse_args()
    from kokoro import KPipeline
    pipeline = KPipeline(lang_code='b', repo_id='hexgrad/Kokoro-82M', device=args.device)
    copy = json.loads((ROOT/'remotion/src/lesson-copy.json').read_text())
    cache = ROOT/'work/narration-cache'
    cache.mkdir(parents=True, exist_ok=True)
    output = {}
    report = []
    for episode in ['1','2','3']:
        suffix = '' if episode=='1' else episode
        timeline = json.loads((ROOT/f'remotion/src/timeline{suffix}.json').read_text())
        segments = timeline.get('timeline',timeline.get('segments'))
        for segment in segments:
            segment['text'] = ' '.join(p['text'] for p in copy[episode][segment['id']])
        (ROOT/f'remotion/src/timeline{suffix}.json').write_text(json.dumps(timeline,ensure_ascii=False,indent=2)+'\n')
        total = segments[-1]['end']
        audio = np.zeros(round(total/FPS*RATE), dtype=np.float32)
        captions = []
        for seg in segments:
            phrases = copy[episode][seg['id']]
            assert ' '.join(p['text'] for p in phrases)==seg['text']
            generated = []
            for phrase in phrases:
                key = hashlib.sha256(f"kokoro-0.9.4|{VOICE}|{SPEED}|{phrase['text']}".encode()).hexdigest()[:20]
                wav = cache/f'{key}.wav'
                if not wav.exists():
                    results = list(pipeline(phrase['text'], voice=VOICE, speed=SPEED))
                    if not results or any(r.audio is None for r in results):
                        raise RuntimeError(f"Empty synthesis: {phrase['text']}")
                    samples = np.concatenate([r.audio.numpy() for r in results])
                    sf.write(wav, samples, RATE, subtype='FLOAT')
                samples, rate = sf.read(wav, dtype='float32')
                assert rate==RATE and np.isfinite(samples).all() and np.max(np.abs(samples))>0.01
                generated.append((phrase,samples))
            # Match changes of view and wall highlights to the spoken phrase groups.
            groups = [[i] for i in range(4)] if seg['id']=='orbit-walls' else ([[0,1],[2,3]] if seg['id'] in ['cn-back','orbit-apex'] else [list(range(len(generated)))])
            lead = seg.get('observationLeadFrames',0)/FPS
            tail = seg.get('observationTailFrames',0)/FPS
            start = seg['start']/FPS+lead
            duration = (seg['end']-seg['start'])/FPS-lead-tail
            for group_index, indexes in enumerate(groups):
                slot_start = start+duration*group_index/len(groups)
                slot_duration = duration/len(groups)
                raw_duration = sum(len(generated[i][1])/RATE for i in indexes)+0.10*(len(indexes)-1)
                available = slot_duration-0.25
                tempo = max(0.90,raw_duration/available)
                if tempo>1.65:
                    raise RuntimeError(f"Narration too dense: ep{episode}/{seg['id']} {tempo:.2f}x")
                cursor = slot_start+0.08
                for i in indexes:
                    phrase, samples = generated[i]
                    if abs(tempo-1)>0.001:
                        proc = subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-f','f32le','-ar',str(RATE),'-ac','1','-i','pipe:0','-af',f'atempo={tempo:.8f}','-f','f32le','pipe:1'],input=samples.tobytes(),stdout=subprocess.PIPE,check=True)
                        samples = np.frombuffer(proc.stdout,dtype=np.float32)
                    # Tiny fades prevent clicks at phrase joins.
                    ramp = min(120,len(samples)//2)
                    samples=samples.copy();samples[:ramp]*=np.linspace(0,1,ramp);samples[-ramp:]*=np.linspace(1,0,ramp)
                    offset = round(cursor*RATE)
                    if offset+len(samples)>round((slot_start+slot_duration)*RATE):
                        raise RuntimeError(f'Audio overrun {episode}/{seg["id"]}')
                    audio[offset:offset+len(samples)] = samples
                    end = cursor+len(samples)/RATE
                    captions.append({'text':phrase['text'],'zh':phrase['zh'],'startMs':round(cursor*1000),'endMs':round(end*1000),'timestampMs':None,'confidence':None,'segmentId':seg['id']})
                    cursor=end+0.10/tempo
                report.append({'episode':episode,'segment':seg['id'],'group':group_index,'tempo':round(tempo,3)})
            print(f'ep{episode} {seg["id"]}: {len(phrases)} aligned phrases',flush=True)
        wav=cache/f'episode{episode}.wav';sf.write(wav,audio,RATE,subtype='PCM_16')
        # VBR MP3 is seekable in browsers and much smaller than PCM WAV.
        for directory in [ROOT/'remotion/public']:
            directory.mkdir(exist_ok=True)
            subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),'-codec:a','libmp3lame','-q:a','3','-ar',str(RATE),'-ac','1',str(directory/f'narration{episode}.mp3')],check=True)
        output[episode]=captions
        (ROOT/'remotion/src/captions.json').write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n')
    (ROOT/'work/narration-report.json').write_text(json.dumps(report,indent=2)+'\n')
    print('All narration and bilingual captions complete.',flush=True)

if __name__=='__main__':main()
