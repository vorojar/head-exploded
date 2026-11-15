import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import React from 'react';
import {renderToString} from 'react-dom/server';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {PageLayout} from './PageLayout';
import {PlayerPlaceholder} from './PlayerPlaceholder';
import {packedSkull} from './packed-skull';
import poster from './poster-asset.json';

const styles=()=>readFileSync(new URL('./style.css',import.meta.url),'utf8');
// Use the exact same layout component before and after JS starts. Reserve the
// player rectangle so loading the live scene does not move surrounding content.
const initialPage=renderToString(React.createElement(PageLayout,{children:React.createElement(PlayerPlaceholder)}));
export default defineConfig({
  root:fileURLToPath(new URL('.',import.meta.url)),
  base:'./',publicDir:false,
  plugins:[react(),packedSkull(),{
    name:'immediate-first-screen',
    generateBundle(){for(const fileName of [poster.fileName,'og-classroom-7dd4fa292777.jpg'])this.emitFile({type:'asset',fileName:'assets/'+fileName,source:readFileSync(new URL('./assets/'+fileName,import.meta.url))});},
    transformIndexHtml(html){
      return html.replace('<div id="root"></div>',`<div id="root">${initialPage}</div>`)
        .replace('</head>',`<link rel="preload" as="image" href="${poster.src}" fetchpriority="high"><style>${styles()}</style></head>`);
    },
    handleHotUpdate(ctx){if(ctx.file.endsWith('/player/style.css'))ctx.server.ws.send({type:'full-reload'});},
  }],
  build:{outDir:'dist',emptyOutDir:true,chunkSizeWarningLimit:650},
});
