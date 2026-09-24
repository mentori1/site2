import fs from 'node:fs/promises';
import { minify } from 'terser';

const result=await minify(await fs.readFile('main.js','utf8'),{compress:true,mangle:true});
await fs.writeFile('main.min.js',result.code);
console.log('Shared site script built. The original HTML dashboard needs no WebGL bundle.');
