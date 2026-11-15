/* The Monotheist: Urdu reader controls. No analytics, authentication, or remote requests. */
(() => {
  'use strict';
  const root = document.documentElement;
  const button = document.getElementById('ur-theme-toggle');
  if (!button || !document.body.classList.contains('urdu-reader')) return;

  const storageKey = 'monotheist-theme';
  let saved = null;
  try { saved = localStorage.getItem(storageKey); } catch (_) {}
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    const next = theme === 'dark' ? 'روشنی' : 'تاریکی';
    button.textContent = next;
    button.setAttribute('aria-label', theme === 'dark' ? 'روشن انداز اختیار کریں' : 'تاریک انداز اختیار کریں');
  }
  applyTheme(saved === 'light' || saved === 'dark' ? saved : (systemDark ? 'dark' : 'light'));
  button.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem(storageKey, next); } catch (_) {}
  });

  const progress = document.createElement('div');
  progress.className = 'ur-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);
  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'ur-top';
  back.textContent = '↑ اوپر جائیں';
  back.setAttribute('aria-label', 'صفحے کے آغاز پر جائیں');
  back.hidden = true;
  document.body.append(back);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  back.addEventListener('click', () => window.scrollTo({top:0,behavior:reduced.matches?'instant':'smooth'}));
  let scheduled = false;
  const update = () => {
    scheduled = false;
    const maximum = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    progress.style.width = (maximum ? Math.min(100,Math.max(0,window.scrollY / maximum * 100)) : 0) + '%';
    back.hidden = window.scrollY < 480;
  };
  const schedule = () => {
    if (!scheduled) {
      scheduled = true;
      window.requestAnimationFrame(update);
    }
  };
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule);
  schedule();
})();
