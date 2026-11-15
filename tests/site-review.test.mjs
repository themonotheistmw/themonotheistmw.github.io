import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';

const pages=[
  'index.html','opinion.html','ahl-al-fatrah-divine-justice.html',
  'muslim-philosophy-and-philosophers.html'
];
const source=p=>readFileSync(p,'utf8');
const hrefs=s=>[...s.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)].map(m=>m[1]);
const ids=s=>[...s.matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1]);

for(const page of pages){
  test(page+' has unique IDs and valid internal anchors',()=>{
    const html=source(page),names=ids(html);
    assert.equal(new Set(names).size,names.length,'duplicate HTML IDs');
    for(const url of hrefs(html)){
      if(url.startsWith('#')) assert.ok(names.includes(decodeURIComponent(url.slice(1))), 'missing anchor '+url);
    }
  });
  test(page+' local resources exist',()=>{
    const html=source(page);
    for(const raw of hrefs(html)){
      if(/^(?:https?:|mailto:|tel:|data:|javascript:|#|\/\/)/i.test(raw))continue;
      const target=decodeURIComponent(raw.split(/[?#]/,1)[0]);
      if(target && !target.startsWith('/'))assert.ok(existsSync(resolve(dirname(page),target)),page+': missing '+target);
    }
  });
  test(page+' has essential metadata and a meaningful heading',()=>{
    const html=source(page);
    assert.match(html,/<title\b[^>]*>[^<]+<\/title>/i);
    assert.match(html,/<meta\s+name=["']description["']/i);
    assert.match(html,/<link\s+rel=["']canonical["']/i);
    assert.match(html,/<h1\b[^>]*>/i);
  });
}

test('homepage links to Urdu research and core reading collections',()=>{
  const h=source('index.html');
  assert.match(h,/href=["']ahl-al-fatrah-divine-justice\.html["']/i);
  assert.match(h,/href=["']muslim-philosophy-and-philosophers\.html["']/i);
  assert.match(h,/class=["']writing-topics["']/i);
});
test('manuscript reader assets and all chapter anchors present',()=>{
  const h=source('muslim-philosophy-and-philosophers.html');
  assert.match(h,/src=["']manuscript-reader\.js["']/);
  assert.match(h,/href=["']manuscript-reader\.css["']/);
  for(let n=1;n<=30;n++)assert.match(h,new RegExp('id=["\\\']ch'+n+'["\\\']'));
});
test('main manuscript text retains independent draft label',()=>{
  assert.match(source('muslim-philosophy-and-philosophers.html'),/unpublished manuscript/i);
});
test('opinion page uses valid top-level article structure',()=>{
  const h=source('opinion.html');
  assert.equal((h.match(/<article\b/gi)||[]).length,(h.match(/<\/article>/gi)||[]).length);
  assert.equal((h.match(/<main\b/gi)||[]).length,1);
});
test('manuscript script is not referenced on the home page',()=>{
  assert.doesNotMatch(source('index.html'),/src=["']manuscript-reader\.js["']/);
});
