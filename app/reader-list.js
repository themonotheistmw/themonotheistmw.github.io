const cards = [...document.querySelectorAll('.card')];
const buttons = [...document.querySelectorAll('.filters button')];
const search = document.querySelector('#search');
let kind = 'all';
function filter() {
  const query = search.value.trim().toLowerCase();
  for (const card of cards) {
    card.hidden = (kind !== 'all' && card.dataset.kind !== kind) || !card.textContent.toLowerCase().includes(query);
  }
  document.querySelector('#empty').hidden = cards.some(card => !card.hidden);
}
for (const button of buttons) {
  button.onclick = () => {
    kind = button.dataset.kind;
    for (const other of buttons) other.setAttribute('aria-pressed', String(other === button));
    filter();
  };
}
search.oninput = filter;
document.querySelector('#controls').hidden = false;
function openLegacyLink() {
  const match = cards.find(card => '#' + card.id === location.hash);
  if (match) location.replace(match.href);
}
openLegacyLink();
window.addEventListener('hashchange', openLegacyLink);
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
