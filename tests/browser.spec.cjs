const {test,expect}=require('@playwright/test');

function watchPageErrors(page) {
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  return errors;
}
async function noHorizontalOverflow(page) {
  const sizes=await page.evaluate(()=>({
    scroll:document.documentElement.scrollWidth,
    viewport:document.documentElement.clientWidth
  }));
  expect(sizes.scroll,JSON.stringify(sizes)).toBeLessThanOrEqual(sizes.viewport+3);
}

test('homepage: welcome modal, Urdu article discovery and topic navigation',async({page})=>{
  const errors=watchPageErrors(page);
  await page.goto('/index.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#mw-welcome-backdrop')).toHaveClass(/mw-open/);
  await page.locator('#mw-welcome-enter').click();
  await expect(page.locator('#mw-welcome-backdrop')).not.toHaveClass(/mw-open/);
  await page.locator('.writing-topics a[href="#urdu-writings"]').click();
  await expect(page.locator('#urdu-writings h3')).toContainText('اہلِ فترۃ');
  await expect(page).toHaveURL(/#urdu-writings$/);
  await expect(page.locator('#urdu-writings a[href="ahl-al-fatrah-divine-justice.html"]')).toHaveCount(1);
  await noHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test('manuscript: search, chapter navigation, dark mode, and keyboard access',async({page})=>{
  const errors=watchPageErrors(page);
  await page.goto('/muslim-philosophy-and-philosophers.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('#mp-chapter-search')).toBeVisible();
  await page.locator('#mp-chapter-search').fill('Avicenna');
  await expect(page.locator('#mp-search-status')).toContainText('matching');
  await expect(page.locator('.toc-list a[href="#ch9"]')).toBeVisible();
  await expect(page.locator('.toc-list a[href="#ch3"]')).toBeHidden();
  await page.locator('#mp-chapter-search').fill('unmatchedfictionalchaptername');
  await expect(page.locator('#mp-search-status')).toContainText('No matching');
  await page.locator('#mp-chapter-search').clear();
  await expect(page.locator('.toc-list a[href="#ch3"]')).toBeVisible();
  await expect(page.locator('#ch1 .mp-chapter-nav a[href="#ch2"]')).toHaveCount(1);
  await page.locator('#ch1 .mp-chapter-nav a[href="#ch2"]').click();
  await expect(page).toHaveURL(/#ch2$/);
  await page.locator('.tm-nav-tools button').first().click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await noHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test('shared navigation: skip link moves focus to actual main content',async({page})=>{
  const errors=watchPageErrors(page);
  await page.goto('/opinion.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#tm-main')).toHaveCount(0);
  await expect(page.locator('#main-content')).toHaveCount(1);
  await expect(page.locator('.tm-skip')).toHaveAttribute('href','#main-content');
  await page.keyboard.press('Tab');
  await expect(page.locator('.tm-skip')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main-content$/);
  await noHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test('Urdu article: RTL, internal return link, social metadata and small screens',async({page})=>{
  const errors=watchPageErrors(page);
  await page.goto('/ahl-al-fatrah-divine-justice.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('html')).toHaveAttribute('lang','ur');
  await expect(page.locator('html')).toHaveAttribute('dir','rtl');
  await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
  await expect(page.locator('footer a[href="index.html#writings"]')).toHaveCount(1);
  await noHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test('mobile navigation on manuscript and opinion remains usable',async({page,isMobile})=>{
  test.skip(!isMobile,'mobile-specific navigation check');
  for(const target of ['/muslim-philosophy-and-philosophers.html','/opinion.html']){
    await page.goto(target,{waitUntil:'domcontentloaded'});
    const menu=page.locator('.tm-menu-button');
    await expect(menu).toBeVisible();
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded','true');
    await expect(page.locator('.tm-nav-links a[href="index.html#writings"]')).toBeVisible();
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded','false');
    await noHorizontalOverflow(page);
  }
});

test('scholarly essay: Arabic quotations, notes, dark mode, and internal navigation',async({page})=>{
  const errors=watchPageErrors(page);
  await page.goto('/the-burden-of-certainty.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('h1')).toContainText('The Burden of Certainty');
  await expect(page.locator('.arabic[lang="ar"][dir="rtl"]')).toHaveCount(3);
  await expect(page.locator('#ref-1, #ref-2, #ref-3, #ref-4, #ref-5, #ref-6')).toHaveCount(6);
  await page.locator('details summary').click();
  await page.locator('.toc a[href="#references"]').click();
  await expect(page).toHaveURL(/#references$/);
  await page.locator('.tm-nav-tools button').first().click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await noHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

for(const article of ['divine-mercy-nuzulan.html','khauf-raja-balance.html','religious-scrupulosity.html']){
  test('Urdu reader: mobile visual layout, theme, keyboard access — '+article,async({page})=>{
    const errors=watchPageErrors(page);
    await page.goto('/'+article,{waitUntil:'domcontentloaded'});
    await expect(page.locator('html')).toHaveAttribute('dir','rtl');
    await expect(page.locator('.ur-site-header')).toBeVisible();
    await expect(page.locator('main#ur-main h1')).toBeVisible();
    await expect(page.locator('a.ur-skip')).toHaveAttribute('href','#ur-main');
    await expect(page.locator('.ur-theme-toggle')).toBeVisible();
    const initial=await page.locator('html').getAttribute('data-theme');
    await page.locator('.ur-theme-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme',initial==='dark'?'light':'dark');
    if(await page.locator('.quran-verse').count()) await expect(page.locator('.quran-verse').first()).toBeVisible();
    await page.evaluate(()=>window.scrollTo(0,1000));
    await expect(page.locator('.ur-top')).toBeVisible();
    const offending=await page.evaluate(()=>{
      const width=document.documentElement.clientWidth;
      return [...document.querySelectorAll('body *')].map(el=>({el,box:el.getBoundingClientRect()})).filter(x=>x.box.width && (x.box.right>width+3||x.box.left< -3)).slice(0,12).map(x=>({tag:x.el.tagName,cls:x.el.className,id:x.el.id,left:Math.round(x.box.left),right:Math.round(x.box.right),scroll:x.el.scrollWidth}));
    });
    console.log('RTL width diagnostics:',article,JSON.stringify(offending));
    await noHorizontalOverflow(page);
    expect(errors).toEqual([]);
  });
}
test('Urdu page CSP blocks injected inline scripts',async({page})=>{
  await page.goto('/khauf-raja-balance.html',{waitUntil:'domcontentloaded'});
  const ran = await page.evaluate(async()=>{
    const flag='__monotheistCspTest';
    const script=document.createElement('script');
    script.textContent='window.'+flag+'=true';
    document.body.append(script);
    await new Promise(resolve=>setTimeout(resolve,40));
    const executed=Boolean(window[flag]);
    script.remove();
    return executed;
  });
  expect(ran).toBe(false);
});
