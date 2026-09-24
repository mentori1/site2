import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

// Match the production server's extensionless HTML routes in local previews.
export default defineConfig({
  plugins: [{name:'clean-page-urls',configureServer(server){
    server.middlewares.use((req,res,next)=>{
      const url=new URL(req.url,'http://localhost');
      if(!path.extname(url.pathname)&&url.pathname!=='/'&&fs.existsSync(path.join(process.cwd(),url.pathname+'.html')))
        req.url=url.pathname+'.html'+url.search;
      next();
    });
  }}]
});
