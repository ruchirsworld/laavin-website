// Static checks across public_html: links, images, anchors, ids, headings, dashes.
const fs = require('fs');
const path = require('path');
const PUB = path.join(__dirname, '..', 'public_html');
const pages = fs.readdirSync(PUB).filter(f => f.endsWith('.html') && !/^google[0-9a-f]+\.html$/.test(f)); // skip Search Console verification files
const problems = [];
const drafts = require('./content/articles.json').filter(a => a.draft).map(a => a.slug + '.html');
const ids = {};
for (const f of pages) {
  const s = fs.readFileSync(path.join(PUB, f), 'utf8');
  ids[f] = new Set([...s.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
}
for (const f of pages) {
  const s = fs.readFileSync(path.join(PUB, f), 'utf8');
  const p = (msg) => problems.push(f + ': ' + msg);
  if (/[\u2014\u2013]|&mdash;|&ndash;|&#821[12];/.test(s)) p('contains em/en dash: ' + (s.match(/.{0,40}([\u2014\u2013]|&mdash;|&ndash;).{0,40}/) || [''])[0]);
  if (f === 'blog-details.html') continue; // redirect stub
  const h1 = (s.match(/<h1[\s>]/g) || []).length; if (h1 !== 1) p(h1 + ' h1 tags');
  if (!/<title>[^<]+<\/title>/.test(s)) p('missing title');
  const tl = ((s.match(/<title>([^<]*)<\/title>/) || [])[1] || '').replace(/&amp;/g, '&');
  if (tl.length > 60) p('title over 60 characters (' + tl.length + ')');
  const dl = ((s.match(/name="description" content="([^"]*)"/) || [])[1] || '').replace(/&amp;/g, '&');
  if (dl.length > 160) p('description over 160 characters (' + dl.length + ')');
  if (!/noindex/.test(s)) for (const d of drafts) if (s.includes('href="' + d + '"')) p('links to draft ' + d);
  const markup = s.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/g, '');
  for (const t of ['div', 'section', 'article', 'ul', 'nav', 'main']) {
    const open = (markup.match(new RegExp('<' + t + '[\\s>]', 'g')) || []).length, close = (markup.match(new RegExp('</' + t + '>', 'g')) || []).length;
    if (open !== close) p(`unbalanced <${t}>: ${open} open, ${close} closed`);
  }
  if (!/name="description" content="[^"]{50,}"/.test(s)) p('missing/short description');
  const seen = {}; for (const m of s.matchAll(/\sid="([^"]+)"/g)) { if (seen[m[1]]) p('duplicate id ' + m[1]); seen[m[1]] = 1; }
  for (const m of s.matchAll(/<img\b[^>]*>/g)) if (!/\salt="/.test(m[0])) p('img without alt: ' + m[0].slice(0, 80));
  for (const m of s.matchAll(/srcset="([^"]+)"/g)) for (const c of m[1].split(',')) { const u = c.trim().split(' ')[0].replace(/^\//, ''); if (!/^https?:/.test(u) && !fs.existsSync(path.join(PUB, u))) p('missing srcset candidate ' + u); }
  for (const m of s.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const u = m[1];
    if (/^(https?:|mailto:|tel:|data:)/.test(u)) continue;
    const [file0, hash] = u.split('#');
    const file = file0.split('?')[0].replace(/^\//, '');
    const target = file === '' ? f : file;
    if (file && !fs.existsSync(path.join(PUB, decodeURIComponent(file)))) { p('missing file ' + u); continue; }
    if (hash && target.endsWith('.html') && !(ids[target] || new Set()).has(hash)) p('missing anchor ' + u);
  }
  for (const m of s.matchAll(/url\(([^)]+)\)/g)) { const u = m[1].replace(/['"]/g, ''); if (!/^https?:/.test(u) && !fs.existsSync(path.join(PUB, u))) p('missing bg ' + u); }
  for (const m of s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { try { JSON.parse(m[1]); } catch (e) { p('bad JSON-LD'); } }
  // heading order: no skipping from h1 to h3 before any h2
  const hs = [...s.matchAll(/<h([1-6])[\s>]/g)].map(m => +m[1]); let prev = 0;
  for (const h of hs) { if (h > prev + 1 && prev !== 0) { p('heading jumps h' + prev + ' to h' + h); break; } prev = h; }
}
for (const f of ['assets/css/site.css', 'assets/js/site.js', 'assets/js/contact-form.js', 'contact.php', 'sitemap.xml', 'robots.txt', '.htaccess', 'llms.txt']) {
  const s = fs.readFileSync(path.join(PUB, f), 'utf8');
  if (/[\u2014\u2013]|&mdash;|&ndash;/.test(s)) problems.push(f + ': contains em/en dash');
  for (const m of s.matchAll(/url\(([^)]+)\)/g)) { const u = m[1].replace(/['"]/g, ''); if (f.endsWith('.css') && !/^(https?:|data:)/.test(u) && !fs.existsSync(path.join(PUB, 'assets/css', u))) problems.push(f + ': missing ' + u); }
}
// Every script must at least parse; a syntax error silently disables a whole file.
for (const f of fs.readdirSync(path.join(PUB, 'assets/js')).filter(f => f.endsWith('.js'))) {
  try { new Function(fs.readFileSync(path.join(PUB, 'assets/js', f), 'utf8')); } catch (e) { problems.push('assets/js/' + f + ': ' + e.message); }
}
for (const f of pages) {
  const s = fs.readFileSync(path.join(PUB, f), 'utf8');
  for (const m of s.matchAll(/<script>([\s\S]*?)<\/script>/g)) { try { new Function(m[1]); } catch (e) { problems.push(f + ': inline script ' + e.message); } }
}
const sm = fs.readFileSync(path.join(PUB, 'sitemap.xml'), 'utf8');
for (const m of sm.matchAll(/<loc>https:\/\/laavinfra\.com\/([^<]*)<\/loc>/g)) if (m[1] && !fs.existsSync(path.join(PUB, m[1]))) problems.push('sitemap: missing ' + m[1]);
// Draft pages carry noindex and stay out of the sitemap until approved.
for (const f of pages) { const noindex = /name="robots" content="noindex"/.test(fs.readFileSync(path.join(PUB, f), 'utf8')); if (!['blog-details.html'].includes(f) && !noindex && !sm.includes('laavinfra.com/' + (f === 'index.html' ? '<' : f))) problems.push('sitemap: does not list ' + f); if (noindex && f !== 'blog-details.html' && sm.includes('laavinfra.com/' + f)) problems.push('sitemap: lists draft ' + f); }
console.log(pages.length + ' pages checked');
console.log(problems.length ? problems.join('\n') : 'No problems found');
