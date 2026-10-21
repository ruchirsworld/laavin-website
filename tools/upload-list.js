// Lists the files in public_html that the live site actually needs (pages, server files, and every asset
// referenced by a page, stylesheet or script), so the upload zip leaves out old unused files.
// Run: node tools/upload-list.js [output-file]   (prints the list when no output file is given)
const fs = require('fs');
const path = require('path');

const PUB = path.join(__dirname, '..', 'public_html');
const ROOT_FILES = new Set(['.htaccess', 'robots.txt', 'sitemap.xml', 'contact.php', 'llms.txt']);
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const rel = f => path.relative(PUB, f).split(path.sep).join('/');

const files = walk(PUB).map(rel);
const sources = files.filter(f => !f.includes('/') && /\.(html|php)$/.test(f)).concat(['assets/css/site.css', 'assets/js/site.js', 'assets/js/contact-form.js']);
const text = sources.map(f => fs.readFileSync(path.join(PUB, f), 'utf8')).join('\n');

const used = files.filter(f => {
  if (!f.includes('/')) return f.endsWith('.html') || ROOT_FILES.has(f);
  return sources.includes(f) || text.includes(f) || text.includes(f.replace(/^assets\//, '../'));
});

const out = process.argv[2];
if (out) { fs.writeFileSync(out, used.join('\n')); console.log(used.length + ' files listed in ' + out); }
else console.log(used.join('\n'));
