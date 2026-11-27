'use strict';
const form = document.querySelector('#studio');
const byId = id => document.getElementById(id);
const fields = ['kind','language','title','summary','body'];
const draftKey = 'monotheist-studio-post-v1';
let draftId = crypto.randomUUID();
try {
  const draft = JSON.parse(localStorage.getItem(draftKey));
  if (draft && typeof draft.id === 'string') {
    draftId = draft.id;
    for (const field of fields) byId(field).value = draft[field] || '';
  }
} catch {}
form.addEventListener('input', event => {
  if (!fields.includes(event.target.id)) return;
  const draft = {id:draftId};
  for (const field of fields) draft[field] = byId(field).value;
  try { localStorage.setItem(draftKey, JSON.stringify(draft)); }
  catch { byId('status').textContent = 'Device storage is full. Keep this tab open until published.'; }
});
function escapeMarkup(value) {
  return value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function encodeText(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (let offset=0; offset<bytes.length; offset+=16384)
    binary += String.fromCharCode(...bytes.subarray(offset,offset+16384));
  return btoa(binary);
}
function makeEntry(post) {
  const title = escapeMarkup(post.title);
  const summary = escapeMarkup(post.summary);
  const paragraphs = post.body.split(/\n\s*\n/).map(escapeMarkup);
  const common = {id:post.id,lang:post.lang,title,studioPost:post,toc:[],html:paragraphs.map(p=>'<p>'+p.replaceAll('\n','<br>')+'</p>').join('')};
  const section = {title,body:paragraphs};
  if (post.kind==='books') return {...common,type:'Book Manuscript',subtitle:summary,status:'Published',progress:100,accent:'#C9A24D',bg:'#14264f',motif:'book-open',readable:true,chapters:[section]};
  const mins = Math.max(1, Math.ceil(post.body.split(/\s+/).length/180));
  return {...common,subject:post.lang==='ur'?'Urdu':'Essays',tag:'The Monotheist MW',summary,mins,readTime:mins+' min',sections:[section],paragraphs};
}
async function publish(post, token) {
  const api='https://api.github.com/repos/themonotheistmw/themonotheistmw.github.io';
  const headers={Authorization:'Bearer '+token,Accept:'application/vnd.github+json'};
  async function request(path, options={}) {
    const response=await fetch(api+path,{headers,cache:'no-store',...options});
    if (!response.ok) throw new Error('GitHub '+response.status+'. '+(response.status===409?'Another publication changed the feed. Tap Publish to retry.':'Check repository access and try again.'));
    return response;
  }
  const meta=await (await request('/contents/content.json?ref=main')).json();
  const blob=await request('/git/blobs/'+meta.sha,{headers:{...headers,Accept:'application/vnd.github.raw+json'}});
  const feed=await blob.json();
  if (!Array.isArray(feed.books)||!Array.isArray(feed.writings)||!Number.isSafeInteger(feed.version)) throw new Error('The publication feed could not be validated.');
  const existing=[...feed.books,...feed.writings].find(item=>item.id===post.id);
  if(existing) {
    if(JSON.stringify(existing.studioPost)===JSON.stringify(post)) return;
    throw new Error('An earlier version of this draft was already published. Check View publications.');
  }
  feed[post.kind].unshift(makeEntry(post));
  feed.version=Math.max(3,feed.version)+1;
  feed.lastAlert={title:'New publication',body:escapeMarkup(post.title)};
  await request('/contents/content.json',{method:'PUT',body:JSON.stringify({branch:'main',message:'Publish '+post.title,sha:meta.sha,content:encodeText(JSON.stringify(feed))})});
}
form.addEventListener('submit', async event=>{
  event.preventDefault();
  const post={id:draftId,kind:byId('kind').value,lang:byId('language').value,title:byId('title').value.trim(),summary:byId('summary').value.trim(),body:byId('body').value.trim()};
  if(!post.title||!post.body){byId('status').textContent='Enter a title and full text.';return;}
  const token=byId('token').value.trim();
  for(const control of form.elements) control.disabled=true;
  byId('status').textContent='Publishing…';
  try {
    await publish(post,token);
    try {localStorage.removeItem(draftKey);} catch {}
    form.reset(); draftId=crypto.randomUUID();
    byId('status').textContent='Published to GitHub. The website and app will receive the post after GitHub Pages updates.';
  } catch(error){byId('status').textContent=error.message;}
  finally {for(const control of form.elements) control.disabled=false;}
});
