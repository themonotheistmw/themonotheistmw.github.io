'use strict';
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.ico':'image/x-icon','.mp4':'video/mp4','.pdf':'application/pdf'};
http.createServer((req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const filepath=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(!filepath.startsWith(root+path.sep)||!fs.existsSync(filepath)||!fs.statSync(filepath).isFile()){
      res.writeHead(404,{'content-type':'text/plain'});res.end('Not found');return;
    }
    res.writeHead(200,{'content-type':types[path.extname(filepath)]||'application/octet-stream','cache-control':'no-store'});
    fs.createReadStream(filepath).pipe(res);
  }catch(e){res.writeHead(400,{'content-type':'text/plain'});res.end('Bad request');}
}).listen(8765,'127.0.0.1');
