'use strict';
(async()=>{
  const list=document.querySelector('#posts');
  try {
    const response=await fetch('./content.json',{cache:'no-store'});
    if(!response.ok) throw new Error();
    const feed=await response.json();
    const entries=[...feed.writings,...feed.books].filter(item=>item.studioPost);
    list.textContent=entries.length?'':'New Author Studio publications will appear here.';
    for(const {studioPost:post} of entries){
      const article=document.createElement('article');
      article.lang=post.lang;
      article.dir=post.lang==='ur'?'rtl':'ltr';
      const title=document.createElement('h2');
      title.textContent=post.title;
      article.append(title);
      const credit=document.createElement('small');
      credit.textContent='The Monotheist MW';
      article.append(credit);
      for(const text of [post.summary,...post.body.split(/\n\s*\n/)].filter(Boolean)){
        const paragraph=document.createElement('p'); paragraph.dir='auto';
        paragraph.textContent=text; article.append(paragraph);
      }
      list.append(article);
    }
  } catch {list.textContent='Could not load publications. Please refresh to try again.';}
})();
