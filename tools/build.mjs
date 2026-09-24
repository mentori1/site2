import fs from 'node:fs/promises';
import { build } from 'vite';
import { minify } from 'terser';

await build({configFile:false,publicDir:false,build:{
  outDir:'assets/hero/bundle',emptyOutDir:true,sourcemap:false,
  lib:{entry:'src/air.js',formats:['es'],fileName:()=> 'air.js'},
  rollupOptions:{output:{chunkFileNames:'[name]-[hash].js'}}
}});
const sceneBundle=await minify(await fs.readFile('assets/hero/bundle/air.js','utf8'),{module:true,compress:true,mangle:true});
await fs.writeFile('assets/hero/bundle/air.js',sceneBundle.code);
const result=await minify(await fs.readFile('main.js','utf8'),{compress:true,mangle:true});
await fs.writeFile('main.min.js',result.code);
console.log('Hero bundle and shared site script built.');
