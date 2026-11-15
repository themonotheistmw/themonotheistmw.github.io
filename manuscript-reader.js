/* Manuscript reading controls — progressive enhancement, no external services. */
(function () {
  'use strict';
  const toc = document.getElementById('contents');
  const main = document.querySelector('main');
  if (!toc || !main) return;

  const tocList = toc.querySelector('.toc-list');
  if (!tocList) return;
  const chapters = [...main.querySelectorAll('section[id]')]
    .filter(section => section.querySelector('h2'));
  if (!chapters.length) return;

  const controls = document.createElement('div');
  controls.className = 'mp-controls';
  const label = document.createElement('label');
  label.htmlFor = 'mp-chapter-search';
  label.textContent = 'Find a chapter, topic, or philosopher';
  const input = document.createElement('input');
  input.id = 'mp-chapter-search';
  input.type = 'search';
  input.placeholder = 'e.g. Avicenna, kalām, ethics…';
  input.autocomplete = 'off';
  input.setAttribute('aria-describedby', 'mp-search-status');
  const status = document.createElement('p');
  status.id = 'mp-search-status';
  status.className = 'mp-search-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.textContent = 'Browse the contents or search by title.';
  controls.append(label, input, status);
  toc.insertBefore(controls, tocList);

  const rootItems = [...tocList.children];
  input.addEventListener('input', () => {
    const q = input.value.trim().toLocaleLowerCase();
    let visible = 0;
    // Match against existing heading text, not the entire manuscript body.
    for (const item of rootItems) {
      const children = [...item.querySelectorAll(':scope > ol > li')];
      if (children.length) {
        let matched = 0;
        for (const child of children) {
          const ok = !q || child.textContent.toLocaleLowerCase().includes(q);
          child.hidden = !ok;
          if (ok) matched++;
        }
        // A part title match reveals all chapters within that part.
        const own = [...item.childNodes].filter(n => n.nodeType === Node.TEXT_NODE).map(n => n.textContent).join(' ');
        const partMatches = !!q && own.toLocaleLowerCase().includes(q);
        if (partMatches) {
          children.forEach(child => { child.hidden = false; });
          matched = children.length;
        }
        item.hidden = !!q && matched === 0;
        visible += matched;
      } else {
        const ok = !q || item.textContent.toLocaleLowerCase().includes(q);
        item.hidden = !ok;
        if (ok) visible++;
      }
    }
    status.textContent = q ? (visible ? visible + ' matching contents entries.' : 'No matching chapter titles. Clear the search to see all chapters.') : 'Browse the contents or search by title.';
  });

  // Source content is preserved. Chapter links are inserted only as navigation.
  const link = (section, text) => {
    const a = document.createElement('a');
    a.href = '#' + section.id;
    a.textContent = text;
    return a;
  };
  chapters.forEach((section, i) => {
    const nav = document.createElement('nav');
    nav.className = 'mp-chapter-nav';
    nav.setAttribute('aria-label', 'Section navigation');
    if (i) nav.append(link(chapters[i - 1], '← Previous section'));
    nav.append(link(toc, '↑ Contents'));
    if (i < chapters.length - 1) nav.append(link(chapters[i + 1], 'Next section →'));
    section.append(nav);
  });
})();
