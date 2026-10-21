// Builds every page in public_html from one shared header, footer and design system,
// so all pages stay in sync. Run: node tools/build.js
const fs = require('fs');
const path = require('path');

const PUB = path.join(__dirname, '..', 'public_html');
const SITE = 'https://laavinfra.com/';
const BRAND = 'Laavin Infrascapes';
const PHONE = '(+91) 98115 11558';
const TEL = '+919811511558';
const WA = '919811511558';
const EMAIL = 'connect@laavinfra.com';
const ADDRESS = 'B-328 (Ground Floor), New Ashok Nagar, Delhi 110096';
const articles = require('./content/articles.json');
// Short content hash appended to CSS/JS URLs, so browsers can cache them for a year and still get updates.
const ver = f => require('crypto').createHash('md5').update(fs.readFileSync(path.join(PUB, f))).digest('hex').slice(0, 8);

// Image paths may be local (assets/...) or full URLs.
const absUrl = u => (u.startsWith('http://') || u.startsWith('https://') ? u : SITE + u);
const esc = s => String(s).replace(/&(?!(?:[a-z]+|#\d+);)/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// Responsive photos: where an 800px "-800.webp" copy exists, offer it to phones and smaller screens.
const webpWidth = f => { const x = fs.readFileSync(f); const t = x.toString('ascii', 12, 16);
  return t === 'VP8X' ? 1 + x.readUIntLE(24, 3) : t === 'VP8L' ? (x.readUInt32LE(21) & 0x3fff) + 1 : x.readUInt16LE(26) & 0x3fff; };
const withSrcset = html => html.replace(/<img ([^>]*?)src="(assets\/images\/[^"]+)\.webp"([^>]*)>/g, (m, pre, base, post) => {
  const small = base + '-800.webp';
  if (/srcset=/.test(m) || !fs.existsSync(path.join(PUB, small))) return m;
  return '<img ' + pre + 'src="' + base + '.webp" srcset="' + small + ' 800w, ' + base + '.webp ' + webpWidth(path.join(PUB, base + '.webp')) + 'w" sizes="(max-width: 760px) 100vw, 600px"' + post + '>';
});

// ---------- shared partials ----------

const NAV = [
  { key: 'services', href: 'services.html', label: 'Services', children: [
    { key: 'landscaping', href: 'landscaping-services.html', label: 'Landscape Services' },
    { key: 'hardscaping', href: 'hardscaping-service.html', label: 'Hardscaping Services' },
    { key: 'horticulture', href: 'horticulture-service.html', label: 'Irrigation & Horticulture' },
  ] },
  { key: 'about', href: 'about.html', label: 'About' },
  { key: 'projects', href: 'index.html#projects', label: 'Projects' },
  { key: 'blog', href: 'blog.html', label: 'Insights' },
];

function navHtml(active) {
  const cur = k => (k === active ? ' aria-current="page"' : '');
  return NAV.map(item => {
    if (!item.children) return `<a href="${item.href}"${cur(item.key)}>${item.label}</a>`;
    const inSection = item.key === active || item.children.some(c => c.key === active);
    return `<div class="nav-item"><a href="${item.href}"${inSection ? ' aria-current="page"' : ''}>${item.label}</a><button class="sub-toggle" type="button" aria-expanded="false" aria-label="Show service pages">▾</button>
          <div class="sub-menu">${item.children.map(c => `<a href="${c.href}"${cur(c.key)}>${esc(c.label)}</a>`).join('')}</div></div>`;
  }).join('\n        ');
}

const ICON_WA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm5.8 14.03c-.25.69-1.44 1.32-1.98 1.37-.51.05-1 .24-3.36-.7-2.84-1.12-4.63-4.04-4.77-4.23-.14-.19-1.14-1.52-1.14-2.9 0-1.38.72-2.06.98-2.34.25-.28.55-.35.74-.35l.53.01c.17.01.4-.06.62.48.25.6.84 2.06.91 2.21.07.15.12.32.02.51-.1.19-.15.31-.3.48-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.76 1.25 1.63 2.03 1.12 1 2.07 1.31 2.36 1.46.29.15.46.12.63-.07.17-.19.73-.85.92-1.14.19-.29.39-.24.65-.14.27.1 1.7.8 1.99.95.29.15.48.22.55.34.07.12.07.69-.18 1.38Z"/></svg>';
const ICON_PHONE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2Z"/></svg>';

function header(active) {
  return `<a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="container nav">
      <a class="brand" href="index.html" aria-label="${BRAND} homepage"><img src="assets/images/logo/logo-black.png" alt="${BRAND}" width="140" height="52"></a>
      <nav class="nav-links" id="navLinks" aria-label="Main navigation">
        ${navHtml(active)}
        <a class="btn mobile-cta" href="contact.html">Book a Site Visit <span>↗</span></a>
      </nav>
      <a class="btn nav-cta" href="contact.html">Book a Site Visit <span>↗</span></a>
      <button class="menu-toggle" id="menuToggle" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="navLinks">☰</button>
    </div>
  </header>`;
}

function footer() {
  return `<footer class="site-footer">
    <div class="container">
      <div class="footer-top">
        <div class="footer-brand">
          <a href="index.html" aria-label="${BRAND} homepage"><img src="assets/images/logo/logo-white.png" alt="${BRAND}" width="150" height="56" loading="lazy"></a>
          <p>We design, build and look after gardens, trees and irrigation across Delhi NCR. Led by a botanist and a retired DDA engineer. Formerly EGW Services.</p>
        </div>
        <div class="footer-col">
          <h2>Company</h2>
          <ul><li><a href="about.html">About us</a></li><li><a href="index.html#projects">Projects</a></li><li><a href="blog.html">Insights</a></li><li><a href="contact.html">Contact</a></li></ul>
        </div>
        <div class="footer-col">
          <h2>Services</h2>
          <ul><li><a href="landscaping-services.html">Landscape Services</a></li><li><a href="hardscaping-service.html">Hardscaping Services</a></li><li><a href="horticulture-service.html">Irrigation &amp; Horticulture</a></li><li><a href="services.html">All services</a></li></ul>
        </div>
        <div class="footer-col">
          <h2>Get in touch</h2>
          <ul><li><a href="tel:${TEL}">${PHONE}</a></li><li><a href="https://wa.me/${WA}" target="_blank" rel="noopener">Chat on WhatsApp</a></li><li><a href="mailto:${EMAIL}">${EMAIL}</a></li><li>${ADDRESS}</li></ul>
        </div>
      </div>
      <div class="footer-bottom"><span>© <span id="year">2026</span> ${BRAND}. All rights reserved.</span><span class="footer-links"><a href="privacy.html">Privacy Policy</a><a href="#main">Back to top ↑</a></span></div>
    </div>
  </footer>
  <div class="float-contact">
    <a class="float-btn wa" href="https://wa.me/${WA}?text=${encodeURIComponent('Hello Laavin Infrascapes, I would like to enquire about your services.')}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">${ICON_WA}<span>WhatsApp us</span></a>
    <a class="float-btn call" href="tel:${TEL}" aria-label="Call ${PHONE}">${ICON_PHONE}</a>
  </div>
  <nav class="mobile-bar" aria-label="Quick contact"><a class="mb-wa" href="https://wa.me/${WA}?text=${encodeURIComponent('Hello Laavin Infrascapes, I would like to enquire about your services.')}" target="_blank" rel="noopener">${ICON_WA}WhatsApp</a><a href="tel:${TEL}">${ICON_PHONE}Call</a><a class="mb-book" href="contact.html">Book a Site Visit</a></nav>`;
}

const ORG_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': SITE + '#business',
  name: BRAND,
  alternateName: 'EGW Services',
  description: 'Landscaping, tree transplantation and irrigation company in Delhi NCR. Led by a botanist and a retired DDA engineer. Empanelled with NHAI, DDA and Indian Railways.',
  url: SITE,
  logo: SITE + 'assets/images/logo/logo-black.png',
  image: SITE + 'assets/images/og-image.jpg',
  telephone: '+91-9811511558',
  email: EMAIL,
  address: { '@type': 'PostalAddress', streetAddress: 'B-328 (Ground Floor), New Ashok Nagar', addressLocality: 'Delhi', postalCode: '110096', addressCountry: 'IN' },
  areaServed: { '@type': 'AdministrativeArea', name: 'Delhi NCR' },
  knowsAbout: ['Landscaping', 'Tree transplantation', 'Drip irrigation', 'Sprinkler irrigation', 'Green belt development', 'Highway median plantation', 'Terrace gardens', 'Vertical gardens', 'Hardscaping', 'Landscape maintenance', 'Sports turf'],
};

function page({ file, active, title, description, body, schema, scripts = [], noindex = false, ogImage = 'assets/images/og-image.jpg', ogType = 'website' }) {
  const url = SITE + (file === 'index.html' ? '' : file);
  const ld = (schema || []).map(s => `<script type="application/ld+json">\n${JSON.stringify(s, null, 2)}\n</script>`).join('\n');
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
${noindex ? '<meta name="robots" content="noindex">\n' : ''}<meta name="theme-color" content="#24463A">
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="${BRAND}">
<meta property="og:locale" content="en_IN">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${absUrl(ogImage)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="assets/images/favicon.png" type="image/png">
<link rel="preload" href="assets/fonts/inter/inter-latin-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/css/site.css?v=${ver('assets/css/site.css')}">
${ld}
</head>
<body>
  ${header(active)}
  <main id="main">
${body}
  </main>
  ${footer()}
  <script src="assets/js/site.js?v=${ver('assets/js/site.js')}"></script>
${scripts.map(s => `  <script src="${s}?v=${ver(s)}"></script>`).join('\n')}
</body>
</html>
`;
  fs.writeFileSync(path.join(PUB, file), withSrcset(html));
  return file;
}

// ---------- reusable blocks ----------

const crumbs = list => `<ol class="breadcrumb">${list.map(([label, href]) => `<li>${href ? `<a href="${href}">${label}</a>` : `<span aria-current="page">${label}</span>`}</li>`).join('')}</ol>`;

const breadcrumbSchema = list => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: list.map(([label, href], i) => ({ '@type': 'ListItem', position: i + 1, name: label.replace(/&amp;/g, '&'), ...(href ? { item: SITE + (href === 'index.html' ? '' : href) } : {}) })),
});

function pageHero({ trail, eyebrow, h1, lead, photo, actions }) {
  const text = `${crumbs(trail)}
          <p class="eyebrow">${eyebrow}</p>
          <h1>${h1}</h1>
          ${lead ? `<p class="lead">${lead}</p>` : ''}${actions ? `\n          <div class="hero-actions">${actions}</div>` : ''}`;
  if (!photo) return `    <section class="page-hero"><div class="container">
          ${text}
    </div></section>`;
  return `    <section class="page-hero"><div class="container page-hero-grid">
        <div>
          ${text}
        </div>
        <div class="page-hero-photo"><img src="${photo.src}" alt="${esc(photo.alt)}" width="1200" height="900" fetchpriority="high"></div>
    </div></section>`;
}

const ctaBand = (title, text, button = 'Book a Site Visit', href = 'contact.html') => `    <section class="cta-band"><div class="container">
      <div><h2>${title}</h2><p>${text}</p></div>
      <div class="actions"><a class="btn btn-light" href="${href}">${button} <span>↗</span></a><a class="btn btn-ghost-light" href="https://wa.me/${WA}" target="_blank" rel="noopener">WhatsApp us</a></div>
    </div></section>`;

const processSection = (intro, button = true) => `    <section class="process">
      <div class="container">
        <div class="process-intro">
          <div><p class="eyebrow">How we work</p><h2 class="h2">Four steps from first visit to a garden that lasts.</h2></div>
          <div class="process-side">${intro ? `<p>${intro}</p>` : ''}${button ? `<a class="btn btn-light" href="contact.html">Book a Site Visit <span>↗</span></a>` : ''}</div>
        </div>
        <ol class="process-steps">
          <li class="process-step"><span class="step-num">01</span><div><h3>Site visit</h3><p>We visit your site, test the soil and check sunlight, water and drainage. We listen to what you need.</p></div></li>
          <li class="process-step"><span class="step-num">02</span><div><h3>Design and estimate</h3><p>You get drawings, a plant list and an item-wise estimate. You know the cost before we start.</p></div></li>
          <li class="process-step"><span class="step-num">03</span><div><h3>Build</h3><p>Our team plants, builds and installs the irrigation. One project manager keeps you updated.</p></div></li>
          <li class="process-step"><span class="step-num">04</span><div><h3>Aftercare</h3><p>We look after the garden after handover, send a photo report every month and replace failed plants on written terms.</p></div></li>
        </ol>
      </div>
    </section>`;

// Delivered projects shown in the homepage project list, in display order.
// To add a project, copy one line and edit it. Keep it to real, delivered work.
const PROJECT_LIST = [
  { sector: 'Airport', name: 'Green Belt and Landscaping', client: 'Delhi Airport Fuel Facility Pvt. Ltd.', scale: 'Safety-compliant green belt' },
  { sector: 'School', name: 'Cricket Ground and Running Track', client: 'Angels Public School, Faridabad', scale: 'Turf, track and drainage' },
  { sector: 'Highway', name: 'Median Plantation, NH&#8209;7', client: 'NHAI, via ATLAS Constructions (P) Ltd.', scale: '3,500 plants' },
  { sector: 'Railways', name: 'Tree Transplantation, Ujjain', client: 'Indian Railways, via DRA', scale: '80 trees' },
  { sector: 'Landfill', name: 'Soil Protection Turfing', client: 'Gazipur landfill, for UPL Environmental Engineers Ltd.', scale: '2.5 acres' },
];

const projectsSection = () => `    <section class="projects" id="projects">
      <div class="container">
        <div class="section-head">
          <div><p class="eyebrow">Selected work</p><h2>Work that <em>speaks for itself.</em></h2></div>
        </div>
        <article class="project-feature">
          <div class="project-feature-photo"><img src="assets/images/blog/blog-1.webp" alt="Mature tree being lifted by crane for transplantation" width="1200" height="900" loading="lazy"></div>
          <div class="project-feature-body">
            <span class="project-tag">Featured project</span>
            <p class="project-metric">155<span>mature trees moved, not cut down</span></p>
            <h3>Tree Transplantation, NH&#8209;307</h3>
            <p>We checked each tree, prepared it, lifted it and replanted it, working around the road contractor's schedule. Then we looked after each tree until it grew new roots.</p>
            <dl class="project-facts">
              <div><dt>Client</dt><dd>NHAI, via Vasistha Construction Pvt. Ltd.</dd></div>
              <div><dt>Scope</dt><dd>Survey, transplantation and aftercare</dd></div>
            </dl>
          </div>
        </article>
        <div class="ledger" role="table" aria-label="More delivered projects">
          <div class="ledger-row ledger-head" role="row"><span role="columnheader">Project</span><span role="columnheader">Client</span><span role="columnheader">Scale</span></div>
${PROJECT_LIST.map(p => `          <div class="ledger-row" role="row"><div class="ledger-name" role="cell"><span class="ledger-tag">${p.sector}</span><h3>${p.name}</h3></div><span class="ledger-client" role="cell">${p.client}</span><span class="ledger-scale" role="cell">${p.scale}</span></div>`).join('\n')}
        </div>
        <div class="project-foot">
          <p class="project-note">The photograph is representative of this type of work.</p>
          <a class="text-link" href="contact.html">Have a similar project? Book a site visit <span>↗</span></a>
        </div>
      </div>
    </section>`;

const CLIENTS = [
  ['partner-1.png', 'Yamuna Expressway Industrial Development Authority (YEIDA)'],
  ['partner-2.png', 'Supertech'],
  ['partner-3.png', 'Crowne Plaza Hotels & Resorts'],
  ['partner-4.png', 'Godrej Interio'],
  ['partner-5.png', 'Hitachi'],
  ['partner-6.png', 'Honda'],
  ['partner-7.png', 'Sharda University'],
];

const clientsBlock = () => `        <p class="client-label">Organisations we have worked with</p>
        <div class="logo-strip">
${CLIENTS.map(([f, n]) => `          <div class="logo-tile"><img src="assets/images/partners/${f}" alt="${esc(n)} logo" width="210" height="110" loading="lazy"></div>`).join('\n')}
        </div>`;

const postCard = a => `          <article class="post-card"><div class="card-photo"><img src="${a.card || a.image}" alt="" width="800" height="500" loading="lazy"></div><div class="post-body"><p class="post-cat">${a.category}<span>${a.readTime}</span></p><h3><a href="${a.slug}.html">${a.title}</a></h3><p>${a.summary}</p><span class="post-more" aria-hidden="true">Read the article <span>→</span></span></div></article>`;

// Card images and summaries for the article list.
const CARD = {
  'tree-transplantation-highway-projects': { summary: 'How a mature tree is moved and kept alive: timing, root ball, lifting and aftercare.' },
  'carbon-sequestration-avenue-median-plantation': { summary: 'How much carbon roadside trees store, and the planting choices that matter most.' },
  'office-landscaping-guide': { card: 'assets/images/land.webp', summary: 'Layout, shade, plants, water and the upkeep that keeps an office landscape looking good.' },
  'industrial-green-belt-development': { summary: 'How to design a green belt that meets clearance conditions and survives.' },
  'school-cricket-ground-construction': { summary: 'Levelling, drainage and turf for grounds that still play the morning after rain.' },
  'terrace-garden-waterproofing-guide': { summary: 'Structure, waterproofing, drainage, soil and plants: what to get right before a terrace or balcony garden goes in.' },
  'farmhouse-garden-planning-delhi': { summary: 'Soil, water, windbreaks, lawns and an orchard: planning a farmhouse garden that copes with the NCR climate.' },
  'hotel-landscaping-guide': { summary: 'Arrival courts, pool decks, event lawns and lighting, and keeping it all perfect around guests.' },
  'vertical-garden-green-wall-guide': { summary: 'Systems, wall protection, irrigation, light and plants: what keeps a green wall green.' },
  'balcony-garden-guide': { summary: 'Light, weight, drainage and the right plants for an apartment balcony garden.' },
  'drip-irrigation-large-campuses': { summary: 'Where drip and sprinkler systems save water and labour, and where they do not.' },
};
articles.forEach(a => Object.assign(a, CARD[a.slug]));

const enquiryForm = () => `        <form class="enquiry" id="enquiry-form" action="contact.php" method="post" novalidate>
          <div class="hp-field" aria-hidden="true"><label for="website">Leave this empty</label><input type="text" id="website" name="website" tabindex="-1" autocomplete="off"></div>
          <div class="form-grid">
            <div class="field"><label for="f-name">Name *</label><input id="f-name" name="name" autocomplete="name" required></div>
            <div class="field"><label for="f-phone">Phone or WhatsApp *</label><input id="f-phone" name="number" type="tel" autocomplete="tel" required placeholder="+91"></div>
            <div class="field"><label for="f-email">Email *</label><input id="f-email" name="email" type="email" autocomplete="email" required></div>
            <div class="field"><label for="f-location">Site location</label><input id="f-location" name="location" placeholder="City or area"></div>
            <div class="field full"><label for="f-service">Service</label><select id="f-service" name="service">
              <option value="">Choose a service</option>
              <option>Terrace, Balcony or Vertical Garden</option>
              <option>Hotel &amp; Resort Landscaping</option>
              <option>Office Premises</option>
              <option>Farmhouse Landscaping</option>
              <option>Drip &amp; Sprinkler Irrigation</option>
              <option>Landscape Maintenance</option>
              <option>Hardscaping &amp; Water Features</option>
              <option>Tree Transplantation &amp; Green Belts</option>
              <option>Something else</option>
            </select></div>
            <div class="field full"><label for="f-message">About your site</label><textarea id="f-message" name="message" placeholder="Type of property, rough size, what you have in mind and your timeline. Photos or drawings help us reply faster."></textarea></div>
          </div>
          <div class="form-end"><p class="form-foot">We only use your details to reply to you. See our <a href="privacy.html">privacy policy</a>.</p><button class="btn" type="submit">Send Enquiry <span>↗</span></button></div>
          <div class="form-status" role="status" aria-live="polite"></div>
        </form>`;

const contactDetails = () => `<a class="btn btn-wa" href="https://wa.me/${WA}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm5.8 14.03c-.25.69-1.44 1.32-1.98 1.37-.51.05-1 .24-3.36-.7-2.84-1.12-4.63-4.04-4.77-4.23-.14-.19-1.14-1.52-1.14-2.9 0-1.38.72-2.06.98-2.34.25-.28.55-.35.74-.35l.53.01c.17.01.4-.06.62.48.25.6.84 2.06.91 2.21.07.15.12.32.02.51-.1.19-.15.31-.3.48-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.76 1.25 1.63 2.03 1.12 1 2.07 1.31 2.36 1.46.29.15.46.12.63-.07.17-.19.73-.85.92-1.14.19-.29.39-.24.65-.14.27.1 1.7.8 1.99.95.29.15.48.22.55.34.07.12.07.69-.18 1.38Z"/></svg>Chat on WhatsApp</a>
          <div class="contact-detail"><strong>Call</strong><a href="tel:${TEL}">${PHONE}</a></div>
          <div class="contact-detail"><strong>Email</strong><a href="mailto:${EMAIL}">${EMAIL}</a></div>
          <div class="contact-detail"><strong>Office</strong><span>B-328 (Ground Floor), New Ashok Nagar, Delhi 110096</span></div>`;

// Hero photos. One photo shows a static hero. Add two or three real site photos here and
// they cross-fade behind the fixed headline (handled in assets/js/site.js).
const HERO_PHOTOS = [
  { src: 'assets/images/about/about-6.webp', alt: 'Landscaped courtyard with a water channel, palms and seating' },
];
const heroPhotos = () => HERO_PHOTOS.map((p, i) => `<img src="${p.src}" alt="${esc(p.alt)}" width="1400" height="1000"${i ? ' loading="lazy"' : ' fetchpriority="high"'}>`).join('');

// Homepage questions. Answers use only facts stated elsewhere on the site.
const FAQ = [
  ['Which areas do you work in?', 'We are based in New Ashok Nagar, Delhi, and work across Delhi NCR. We also take on larger projects outside Delhi, such as moving 80 trees for Indian Railways in Ujjain.'],
  ['Can you move a big tree instead of cutting it down?', 'Yes. We check the tree, prepare its roots, lift it with a crane and replant it. Then we water and check it until it grows new roots. On NH-307 we moved 155 mature trees for an NHAI project.'],
  ['Do you look after the garden after it is built?', 'Yes. We offer regular maintenance. You get a photo report every month, and we replace plants that fail on terms agreed in writing.'],
  ['Can my terrace hold a garden?', 'Often, yes, but we check first. Our engineer checks the roof load and waterproofing before any work starts. We use light soil and drip watering to keep the weight and water low.'],
  ['Do you work with facility management (FM) companies?', 'Yes. You can hire us directly, or we can work as the garden specialist under your FM company contract.'],
  ['How do I get a price?', 'Book a site visit, or send photos of your site on WhatsApp to ' + PHONE + '. We reply within 24 hours. After the site visit, you get drawings and an item-wise estimate.'],
];
const faqSection = () => `    <section class="faq" id="faq">
      <div class="container">
        <div class="section-head">
          <div><p class="eyebrow">Questions</p><h2>Answers to <em>common questions.</em></h2></div>
        </div>
        <div class="faq-list">
${FAQ.map(([q, a]) => `          <details class="faq-item"><summary>${q}</summary><p>${a}</p></details>`).join('\n')}
        </div>
      </div>
    </section>`;
const FAQ_SCHEMA = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) };

// ---------- pages ----------

const built = [];

// Shared blocks used on the homepage and the About page.
const proofStrip = `    <div class="proof">
      <div class="container proof-grid">
        <div class="proof-item"><div class="proof-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M16 3l3.2 2.4 4-.3 1.3 3.8 3.4 2.2-1.2 3.9 1.2 3.9-3.4 2.2-1.3 3.8-4-.3L16 27l-3.2-2.4-4 .3-1.3-3.8-3.4-2.2 1.2-3.9-1.2-3.9 3.4-2.2 1.3-3.8 4 .3Z"/><path d="M11 15.5l3.5 3.5L21 12.5"/></svg></div><div><strong>75+</strong><span>Projects completed</span></div></div>
        <div class="proof-item"><div class="proof-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M16 29V17M16 17l-4-3M16 20l4-3M16 3c-6 0-9 5-9 9 0 4 3 7 9 7s9-3 9-7c0-4-3-9-9-9ZM10 29h12"/></svg></div><div><strong>350+</strong><span>Trees transplanted</span></div></div>
        <div class="proof-item"><div class="proof-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M7 25C7 13 15 6 26 6c0 11-7 19-19 19ZM7 25l10-10"/></svg></div><div><strong>100T+</strong><span>Carbon sequestered</span></div></div>
        <div class="proof-item"><div class="proof-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M16 4a12 12 0 1 0 0 24 12 12 0 0 0 0-24ZM16 9v7l5 3"/></svg></div><div><strong>10+</strong><span>Years of experience</span></div></div>
      </div>
    </div>`;
const credentialsSection = (logos = true) => `    <section class="credentials" id="credentials">
      <div class="container">
        <div class="credential-panel">
          <div><p class="eyebrow">Credentials</p><h2 class="h2">Proof you can check before you hire us.</h2><p>Our own team delivered every project on this site. Ask for the papers and we will share them.</p><a class="cap-link" href="assets/docs/laavin-infrascapes-capability-sheet.pdf" download><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>Download our capability sheet (PDF)</a></div>
          <div class="credential-list">
            <div class="credential-item"><span class="cred-check" aria-hidden="true">✓</span><div>Empanelled with NHAI, DDA and Indian Railways<small>We are approved to work on public projects for all three.</small></div></div>
            <div class="credential-item"><span class="cred-check" aria-hidden="true">✓</span><div>Work orders and completion certificates<small>For our NHAI, Delhi Airport, school and landfill projects.</small></div></div>
            <div class="credential-item"><span class="cred-check" aria-hidden="true">✓</span><div>Client references<small>Past clients who are happy to talk to you.</small></div></div>
            <div class="credential-item"><span class="cred-check" aria-hidden="true">✓</span><div>Monthly photo reports, written replacement terms<small>You see the work every month. Plants that fail are replaced on agreed terms.</small></div></div>
          </div>
        </div>
${logos ? clientsBlock() + '\n' : ''}      </div>
    </section>`;

// Home
built.push(page({
  file: 'index.html', active: 'home',
  title: 'Landscaping &amp; Tree Transplantation, Delhi NCR | Laavin',
  description: 'Landscaping, tree transplantation and irrigation across Delhi NCR for builders, offices, hotels and homes. Empanelled with NHAI, DDA and Indian Railways.',
  schema: [ORG_SCHEMA, FAQ_SCHEMA],
  scripts: ['assets/js/contact-form.js'],
  body: `    <section class="hero">
      <div class="container hero-grid">
        <div>
          <p class="eyebrow">Landscaping<span class="hide-sm"> · Terrace gardens</span> · Irrigation</p>
          <h1>Gardens and landscapes, <em>planted to survive.</em></h1>
          <p class="hero-copy">We design, build and look after gardens and landscapes across Delhi NCR. A botanist picks the plants and an engineer checks the soil, water and drainage, so your garden stays green for years.</p>
          <div class="hero-actions"><a class="btn" href="contact.html">Book a Site Visit <span>↗</span></a><a class="btn btn-outline" href="#projects">See Our Projects <span>↓</span></a></div>
          <div class="micro-trust"><span class="dot"></span><span>Empanelled with NHAI, DDA and Indian Railways</span></div>
        </div>
        <div class="hero-visual">
          <div class="hero-photo">${heroPhotos()}</div>
          <div class="photo-label"><strong>Survival is part of the scope</strong><span>We plan the plants, soil and watering for every site, and keep checking after handover.</span></div>
        </div>
      </div>
    </section>

${proofStrip}

    <section class="services" id="capabilities">
      <div class="container">
        <div class="section-head">
          <div><p class="eyebrow">Services</p><h2>Rooted in science. <em>Grown with care.</em></h2></div>
        </div>
        <div class="service-grid svc-acc">
          <article class="service-card"><div class="svc-head"><span class="svc-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M6 28V6h14v22M20 12h6v16M3 28h26M10 10h2M14 10h2M10 15h2M14 15h2M10 20h2M14 20h2M23 17h1M23 22h1"/></svg></span><h3>Office &amp; Corporate Premises</h3></div><p>We plan, plant and look after your office garden, so you do not have to.</p><ul class="mini-list"><li>Design, planting and regular upkeep</li><li>A photo report every month</li><li>Directly, or through your facility manager</li></ul><a class="text-link" href="landscaping-services.html">Office landscaping <span>→</span></a></article>
          <article class="service-card"><div class="svc-head"><span class="svc-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M5 23h22M7 23a9 9 0 0 1 18 0M16 14v-2M14 12h4M4 27h24"/></svg></span><h3>Hotel &amp; Resort Landscaping</h3></div><p>Lawns, courtyards and poolside planting, kept ready for your guests.</p><ul class="mini-list"><li>Event lawns ready before October</li><li>Planting for entrances and pool areas</li><li>Water features and garden lighting</li></ul><a class="text-link" href="landscaping-services.html">Hotel landscaping <span>→</span></a></article>
          <article class="service-card"><div class="svc-head"><span class="svc-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M16 29V17M16 17l-4-3M16 20l4-3M16 3c-6 0-9 5-9 9 0 4 3 7 9 7s9-3 9-7c0-4-3-9-9-9ZM10 29h12"/></svg></span><h3>Tree Transplantation &amp; Green Belts</h3></div><p>We move big trees so they live, and keep records for inspections.</p><ul class="mini-list"><li>155 trees moved for NHAI on NH&#8209;307</li><li>Each tree checked before we move it</li><li>A photo report every month for your records</li></ul><a class="text-link" href="horticulture-service.html">Tree transplantation <span>→</span></a></article>
          <article class="service-card"><div class="svc-head"><span class="svc-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M16 4c5 7 8 11 8 15a8 8 0 0 1-16 0c0-4 3-8 8-15ZM12 20a4 4 0 0 0 4 4"/></svg></span><h3>Drip &amp; Sprinkler Irrigation</h3></div><p>Drip and sprinklers that give each plant the water it needs.</p><ul class="mini-list"><li>Drip for beds, sprinklers for lawns</li><li>Filters for borewell or STP water</li><li>Automatic timers, area by area</li></ul><a class="text-link" href="horticulture-service.html">Irrigation services <span>→</span></a></article>
          <article class="service-card"><div class="svc-head"><span class="svc-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M4 16 13 8l9 8M6 14v13h14V14M11 27v-6h4v6M25 27v-7M25 20c-3 0-4-3-4-5 0-3 2-5 4-6 2 1 4 3 4 6 0 2-1 5-4 5Z"/></svg></span><h3>Farmhouse Landscaping</h3></div><p>A farmhouse garden that stays green, even when you are away.</p><ul class="mini-list"><li>Plants that suit Delhi heat and local soil</li><li>Photo updates on WhatsApp</li><li>Lawns, fruit trees and driveways</li></ul><a class="text-link" href="landscaping-services.html">Farmhouse landscaping <span>→</span></a></article>
          <article class="service-card"><div class="svc-head"><span class="svc-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M6 28V12h20v16M4 28h24M10 16h3v3h-3zM19 16h3v3h-3zM10 22h3v3h-3zM19 22h3v3h-3zM12 12c0-3 2-5 4-6 2 1 4 3 4 6M16 6V3"/></svg></span><h3>Terrace, Balcony &amp; Vertical Gardens</h3></div><p>A terrace garden that keeps your roof safe.</p><ul class="mini-list"><li>An engineer checks load and waterproofing first</li><li>Light soil and timed drip watering</li><li>Pots that drain, so no standing water</li></ul><a class="text-link" href="landscaping-services.html">Terrace gardens <span>→</span></a></article>
        </div>
      </div>
    </section>

    <section class="paths" id="who-we-work-with">
      <div class="container">
        <div class="section-head">
          <div><p class="eyebrow">Who we work with</p><h2>Whatever your dialect, <em>we answer in green.</em></h2></div>
        </div>
        <div class="paths-grid">
          <article class="path-card" data-short="Builders"><p class="path-tag">Builders, contractors and infrastructure</p><h3>Gardens that match the brochure, and stay alive after handover.</h3><ul class="mini-list"><li>Planting planned for your EC tree count and green area</li><li>Item-wise quote (BOQ) and clear maintenance periods</li><li>Empanelled with NHAI, DDA and Indian Railways</li></ul><a class="text-link" href="horticulture-service.html">See how we work <span>→</span></a></article>
          <article class="path-card" data-short="Properties"><p class="path-tag">Offices, hotels and societies</p><h3>Garden upkeep you do not have to chase.</h3><ul class="mini-list"><li>A photo report every month, and written terms for replacing plants</li><li>Irrigation that runs on treated STP water</li><li>We work with you directly or through your FM company</li></ul><a class="text-link" href="landscaping-services.html">See how we work <span>→</span></a></article>
          <article class="path-card" data-short="Homes"><p class="path-tag">Homes and farmhouses</p><h3>Green and ready whenever you arrive.</h3><ul class="mini-list"><li>Plants picked for Delhi heat and the water you have</li><li>Photo updates on WhatsApp when you are away</li><li>We check load and waterproofing before building a terrace garden</li></ul><a class="text-link" href="landscaping-services.html">See how we work <span>→</span></a></article>
        </div>
      </div>
    </section>

    <section class="about" id="about">
      <div class="container about-grid">
        <div class="about-photo"><img src="assets/images/about/about-2.webp" alt="Our team reviewing a landscape plan on site" width="1200" height="900" loading="lazy"><div class="about-note"><b>60+</b>years of combined horticulture and engineering experience</div></div>
        <div class="about-copy">
          <p class="eyebrow">About us</p>
          <h2 class="h2">Plant science meets <em>solid engineering.</em></h2>
          <p>Laavin Infrascapes used to be called EGW Services. Two people lead our work: a horticulturist with an M.Sc. in Botany, and a civil and electrical engineer who retired from the Delhi Development Authority (DDA). Each has more than 30 years of experience.</p>
          <p>That is why our gardens last. The botanist chooses the plants. The engineer checks the waterproofing, drainage and irrigation below them. We bring the same care from our NHAI highway work to every terrace, hotel, office and farmhouse.</p>
          <ul class="check-list">
            <li><span class="check">✓</span><span><strong>Planned to survive.</strong> We choose the plants, soil and watering for each site.</span></li>
            <li><span class="check">✓</span><span><strong>One team from design to upkeep.</strong> No passing the job between contractors.</span></li>
            <li><span class="check">✓</span><span><strong>Saves water.</strong> We plan the irrigation from day one.</span></li>
          </ul>
          <a class="btn" href="about.html">Meet the Team <span>↗</span></a>
        </div>
      </div>
    </section>

    <section class="trust" aria-label="Organisations we have worked with">
      <div class="container">
${clientsBlock()}
      </div>
    </section>

${projectsSection()}

${processSection('')}

${credentialsSection(false)}

    <section class="insights">
      <div class="container">
        <div class="section-head">
          <div><p class="eyebrow">Insights</p><h2>Practical guides for gardens that last.</h2></div>
          <div class="section-side"><a class="text-link" href="blog.html">All insights <span>→</span></a></div>
        </div>
        <div class="post-grid">
${['office-landscaping-guide', 'tree-transplantation-highway-projects', 'drip-irrigation-large-campuses'].map(s => postCard(articles.find(a => a.slug === s))).join('\n')}
        </div>
      </div>
    </section>

${faqSection()}

    <section class="contact" id="contact">
      <div class="container contact-grid">
        <div class="contact-copy"><p class="eyebrow">Get in touch</p><h2 class="h2">Planning a garden, terrace or landscape?</h2><p>Send us a few photos of your site on WhatsApp, or fill in the form. We reply within 24 hours with ideas and a rough cost.</p>
          ${contactDetails()}
        </div>
${enquiryForm()}
      </div>
    </section>`,
}));

// About
const aboutTrail = [['Home', 'index.html'], ['About us']];
built.push(page({
  file: 'about.html', active: 'about',
  title: 'About Us: Botanist &amp; Engineer Led | Laavin Infrascapes',
  description: 'Delhi NCR landscaping team led by a botanist and a retired DDA engineer, formerly EGW Services. Empanelled with NHAI, DDA and Indian Railways.',
  schema: [ORG_SCHEMA, breadcrumbSchema(aboutTrail)],
  body: `${pageHero({ trail: aboutTrail, eyebrow: 'About us', h1: 'A landscaping team built around <em>plants that survive.</em>', lead: `We are a Delhi team that designs, builds and looks after gardens, terraces and large landscapes. We plan the irrigation from day one.`, photo: { src: 'assets/images/about/about-2.webp', alt: 'Our team reviewing a landscape plan on site' } })}

${proofStrip}

    <section class="detail">
      <div class="container prose-cols">
        <div><p class="eyebrow">Our story</p><h2 class="h2">From EGW Services to ${BRAND}.</h2></div>
        <div>
          <p>We started as EGW Services, a landscaping and horticulture firm. Our work grew to highways, factory green belts and landfill slopes, and we became ${BRAND}. On projects like moving trees on NH-307 and the green belt at the Delhi Airport fuel facility, we learned to plan for survival, keep our papers in order and finish on time.</p>
          <p>Today we bring the same care to terrace gardens, hotels, offices and farmhouses, where a garden must look good every day, not just on handover day.</p>
        </div>
      </div>
    </section>

    <section class="about">
      <div class="container">
        <div class="section-head">
          <div><p class="eyebrow">The people you will work with</p><h2>60+ years of horticulture and<br>engineering on one team.</h2></div>
          <p>A botanist and a retired DDA engineer lead every project. A landscape designer and a project manager work with them.</p>
        </div>
        <div class="team-grid">
          <article class="team-card"><div class="team-initials" aria-hidden="true">AJ</div><h3>Alka Jain</h3><p class="team-role">Horticulturist · M.Sc. Botany</p><p>Over 30 years of hands-on work with plants. Chooses the plants, soil treatment and care plan for every site.</p></article>
          <article class="team-card"><div class="team-initials" aria-hidden="true">RP</div><h3>Ramesh Chandra Pathak</h3><p class="team-role">Engineer · Retd. DDA</p><p>Over 30 years as a civil and electrical engineer at the Delhi Development Authority. Makes sure waterproofing, drainage, irrigation and lighting are built to last.</p></article>
          <article class="team-card"><div class="team-initials" aria-hidden="true">RJ</div><h3>Ruchir Jain</h3><p class="team-role">Landscape Designer</p><p>Turns each site into a layout that looks good and works well, from rooftop terraces to large grounds.</p></article>
          <article class="team-card"><div class="team-initials" aria-hidden="true">SP</div><h3>Shashank Pathak</h3><p class="team-role">Project Manager</p><p>Your main contact on site. Keeps the team, materials and timeline on track and on budget.</p></article>
        </div>
      </div>
    </section>

    <section class="detail">
      <div class="container about-grid reverse">
        <div class="about-copy">
          <p class="eyebrow">How we work differently</p>
          <h2 class="h2">Most gardens fail after the contractor leaves. Ours are planned to last.</h2>
          <div class="feature-grid">
            <div class="feature-item"><h3>We plan for survival</h3><p>We pick plants for the site's soil, sun, wind and water. Aftercare is part of the job, not an extra.</p></div>
            <div class="feature-item"><h3>We plan the water first</h3><p>We design drip and sprinkler watering along with the planting. Gardens stay green with less water and less labour.</p></div>
            <div class="feature-item"><h3>We check what is underneath</h3><p>Before planting starts, an engineer checks waterproofing, drainage and load on terraces, and paving and wiring on the ground.</p></div>
            <div class="feature-item"><h3>We stay after handover</h3><p>Regular maintenance, a photo report every month and written replacement terms keep your garden alive year after year.</p></div>
          </div>
        </div>
        <div class="about-photo"><img src="assets/images/about/about-6.webp" alt="Landscaped courtyard with water channel and palms" width="1200" height="900" loading="lazy"><div class="about-note">Aftercare is part<br>of the scope.</div></div>
      </div>
    </section>

${credentialsSection()}

${processSection('One team handles all four steps, and we record each one, so you always know where your project stands.')}

${ctaBand('Have a site in mind?', 'Send us the location, drawings or a few photos. We reply within 24 hours with ideas and a rough cost.', 'Book a Site Visit')}`,
}));

// Services overview
const servicesTrail = [['Home', 'index.html'], ['Services']];
built.push(page({
  file: 'services.html', active: 'services',
  title: 'Landscaping, Irrigation &amp; Hardscaping | Laavin Infrascapes',
  description: 'Landscaping, terrace and vertical gardens, drip irrigation, hardscaping and tree transplantation from one accountable team in Delhi NCR.',
  schema: [ORG_SCHEMA, breadcrumbSchema(servicesTrail)],
  body: `${pageHero({ trail: servicesTrail, eyebrow: 'What we do', h1: 'One team for the plants, water and stonework <em>on your site.</em>', lead: 'From a rooftop terrace to a hotel or a farmhouse, we design, build, water and maintain. You deal with one team that is responsible for the result.' })}

    <section class="services">
      <div class="container">
        <div class="section-head">
          <div><p class="eyebrow">Our services</p><h2>Three service lines,<br>one team.</h2></div>
          <p>Choose the service closest to what you need. Many projects use two or three, all done by the same team.</p>
        </div>
        <div class="service-grid">
          <article class="service-card has-photo"><div class="card-photo"><img src="assets/images/land.webp" alt="Landscaped grounds with lawns, palms and walkways" width="900" height="560" loading="lazy"></div><div class="card-body"><div class="service-num">01 / LANDSCAPE</div><h3>Landscape Services</h3><p>Design, planting and upkeep for terraces, hotels, offices and farmhouses.</p><ul class="mini-list"><li>Terrace, balcony &amp; vertical gardens</li><li>Hotel, office &amp; farmhouse landscaping</li><li>Lawns, planting &amp; maintenance</li></ul><a class="text-link" href="landscaping-services.html">Explore landscape services <span>→</span></a></div></article>
          <article class="service-card has-photo"><div class="card-photo"><img src="assets/images/horti.webp" alt="Plant nursery with misting irrigation system" width="900" height="560" loading="lazy"></div><div class="card-body"><div class="service-num">02 / IRRIGATION</div><h3>Irrigation &amp; Horticulture</h3><p>Automatic watering for gardens of any size, plus tree moving and large-scale planting.</p><ul class="mini-list"><li>Drip &amp; sprinkler irrigation</li><li>Mature tree transplantation</li><li>Green belts &amp; avenue planting</li></ul><a class="text-link" href="horticulture-service.html">Explore irrigation and horticulture <span>→</span></a></div></article>
          <article class="service-card has-photo"><div class="card-photo"><img src="assets/images/hardscaping.webp" alt="Stone-paved courtyard with pergola and path lighting" width="900" height="560" loading="lazy"></div><div class="card-body"><div class="service-num">03 / HARDSCAPE</div><h3>Hardscaping Services</h3><p>Water features, paving, lighting and shade structures, built for heavy use.</p><ul class="mini-list"><li>Fountains &amp; water features</li><li>Pathways &amp; stone paving</li><li>Pergolas, gazebos &amp; lighting</li></ul><a class="text-link" href="hardscaping-service.html">Explore hardscaping services <span>→</span></a></div></article>
        </div>
      </div>
    </section>

${processSection('The same four steps apply to every service, done by the same team.')}

${ctaBand('Planning a garden, terrace or landscape?', 'Tell us where your site is and what you have in mind. We reply within 24 hours with ideas and a rough cost.', 'Book a Site Visit')}`,
}));

// Service detail pages
const SERVICES = [
  { key: 'landscaping', file: 'landscaping-services.html', short: 'Landscape Services',
    title: 'Terrace, Hotel &amp; Office Landscaping | Laavin Infrascapes',
    description: 'Terrace, balcony and vertical gardens, hotel and resort landscaping, office premises, farmhouse gardens, sports turf and landscape maintenance in Delhi NCR.',
    eyebrow: 'Landscape services', h1: 'Landscapes for terraces, balconies, hotels, offices <em>and farmhouses.</em>',
    lead: 'Rooftop, hotel entrance, office campus or farmhouse: we design gardens that look good on day one and still look good five years later.',
    photo: { src: 'assets/images/land.webp', alt: 'Landscaped grounds with lawns and palms' },
    intro: 'We design, build and maintain, so one team is responsible for the result. We plan each layout around sun, shade, drainage, water and how people use the space. One project manager runs the work from start to finish.',
    items: [
      ['Terrace and rooftop gardens', 'Waterproofing, drainage layers, light soil and hardy plants that turn an empty roof into a garden people use. Our engineer checks the structure and load before work starts.'],
      ['Balcony gardens', 'Planters, railing boxes and small drip lines, with plants chosen for the light your balcony gets, from deep shade to full sun. We check weight and drainage so the slab and the flat below stay safe.'],
      ['Vertical gardens and green walls', 'Modular living walls for lobbies, outside walls and boundary walls. Built-in drip watering keeps them green with little upkeep.'],
      ['Hotel and resort landscaping', 'Entrances, lawns, courtyards and poolside planting, with water features and lighting, planned to look good in every season.'],
      ['Office and corporate premises', 'Entrances, lawns, shade trees, seating and break-out areas for offices and campuses. We plan maintenance around working hours.'],
      ['Farmhouse landscaping', 'Lawns, fruit trees, tree-lined drives and garden areas for large plots. We pick plants for the soil and season, and size the irrigation for the whole property.'],
      ['Landscape design and planting', 'Site layouts and healthy plants from the nursery, from shade trees to ground cover. We plant them in well-prepared soil so they root fast and resist disease. We prefer native plants and add rainwater harvesting where the site allows.'],
      ['Sports turf and grounds', 'Cricket grounds, football fields and running tracks with careful levelling and drainage under the surface, so play can start again soon after rain.', 'We built a cricket ground and a multi-lane running track for Angels Public School, Faridabad.'],
      ['Landscape maintenance', 'Our teams prune, mow, aerate, feed and control pests on a schedule agreed with you.'],
    ],
    listTitle: 'Nine landscape services, one accountable team.',
    cta: ['Planning a terrace, garden or landscape?', 'Send your site plan, location or a few photos. Our landscape designer will suggest an approach and prepare an estimate.', 'Book a Site Visit'],
    side: ['Planning a landscape?', 'Get a design and build estimate from our team.'] },
  { key: 'hardscaping', file: 'hardscaping-service.html', short: 'Hardscaping Services',
    title: 'Water Features, Paving &amp; Lighting | Laavin Infrascapes',
    description: 'Water features, stone paving, landscape lighting, fencing, pergolas and gazebos for hotels, offices and farmhouses, overseen by a former DDA engineer.',
    eyebrow: 'Hardscaping services', h1: 'Built elements that last as long as <em>the landscape.</em>',
    lead: 'Paths, water features, lighting and shade structures for hotels, offices and farmhouses. Built for heavy use, hot summers and the monsoon.',
    photo: { src: 'assets/images/hardscaping.webp', alt: 'Stone-paved courtyard with pergola, cascade and path lighting' },
    intro: 'A civil and electrical engineer with over 30 years at the Delhi Development Authority oversees our hardscape work. We get the structure, drainage and wiring right before the finishing work begins.',
    items: [
      ['Water features and fountains', 'Fountains, cascades and reflecting pools with pumps that reuse the water, and lights under the water. Designed to be easy to clean and maintain.'],
      ['Pathways and paving', 'Walkways, courtyards and driveways in natural stone, interlocking pavers or stamped concrete. Permeable pavers let rainwater soak into the ground, and we add step-free routes where needed.'],
      ['Landscape lighting', 'Low-energy LED bollards, lights on trees, underwater lights and solar lights that make gardens safe and pleasant after dark.'],
      ['Fencing and metalwork', 'MS and SS railings, decorative screens and boundary fencing, finished to resist rust and weather.'],
      ['Pergolas, gazebos and shade structures', 'Wood, aluminium and fabric (tensile) structures for seating areas, poolsides, terraces and break-out spaces. Designed for shade and air flow.'],
      ['Sculptures and feature walls', 'Stone and metal sculptures, murals and feature walls that give a hotel, office or farmhouse a clear focal point.'],
    ],
    listTitle: 'Six hardscape elements, engineered to last.',
    cta: ['Have drawings or a layout ready?', 'Send them to us. Our engineer will review the work and prepare a detailed, item-wise estimate.', 'Book a Site Visit'],
    side: ['Planning site works?', 'Talk to us about paving, water features and lighting.'] },
  { key: 'horticulture', file: 'horticulture-service.html', short: 'Irrigation & Horticulture',
    title: 'Drip Irrigation &amp; Tree Transplantation | Laavin Infrascapes',
    description: 'Drip and sprinkler irrigation, mature tree transplantation and green belt plantation, with NH-307, NH-7 and Delhi Airport projects delivered.',
    eyebrow: 'Irrigation and horticulture', h1: 'Irrigation and horticulture for <em>sites of every size.</em>',
    lead: 'From drip lines on a farmhouse lawn to moving mature trees on a national highway, our horticulture team plans the living part of every project.',
    photo: { src: 'assets/images/horti.webp', alt: 'Plant nursery with misting irrigation system' },
    intro: 'A botanist with over 30 years of field experience leads our horticulture team. We plan the plants, soil treatment and watering for each site, and keep checking after handover.',
    items: [
      ['Drip and sprinkler irrigation', 'Automatic drip and sprinkler systems that water each plant when it needs it. They save water and labour on terraces, gardens, farmhouses and long highway stretches. We design, install and service the system.'],
      ['Mature tree transplantation', 'When building work puts mature trees in the way, we move them instead of cutting them down. We check and prune each tree, dig and protect the root ball, lift and carry it, and replant it. Then we stay on to water, feed and check it.', 'We moved 155 mature roadside trees for an NHAI road-widening project on NH-307.'],
      ['Highway median and avenue plantation', 'Hardy shrubs and trees that cope with pollution, for road medians, roadsides and long drives. A well-planted median cuts headlight glare and handles dust, heat and little water.', 'We planted 3,500 plants on the NH-7 median for an NHAI contractor.'],
      ['Industrial green belts', 'Thick belts of native trees around factories, fuel depots and public sites, as environmental clearances often require. We pick trees that trap dust, survive the site and follow its safety rules.', 'We built a green belt and landscape that meets the safety rules at the Delhi Airport fuel facility.'],
      ['Erosion control and slope turfing', 'Grass and plants that hold slopes, embankments and covered landfills in place through the monsoon.', 'We laid turf over 2.5 acres of the Gazipur landfill in Delhi to hold the slope.'],
    ],
    listTitle: 'Five services for the living part of your site.',
    cta: ['Need irrigation, or have trees in the way?', 'Tell us where your site is and what you need. We will survey it and send a proposal with an item-wise estimate.', 'Book a Site Visit'],
    side: ['Planning irrigation or tree work?', 'Get a proposal from our horticulture team.'] },
];

const serviceLinks = active => `<ul class="side-links">${SERVICES.map(s => `<li><a href="${s.file}"${s.key === active ? ' aria-current="page"' : ''}>${esc(s.short)}</a></li>`).join('')}<li><a href="services.html">All services</a></li></ul>`;

const sideContact = (title, text) => `<div class="side-card dark"><h2>Talk to our team</h2><p class="side-title">${title}</p><p>${text}</p><ul class="side-contact"><li><a href="tel:${TEL}">${PHONE}</a></li><li><a href="mailto:${EMAIL}">${EMAIL}</a></li></ul><p style="margin:18px 0 0"><a class="btn btn-light" href="contact.html">Book a Site Visit <span>↗</span></a></p></div>`;

for (const s of SERVICES) {
  const trail = [['Home', 'index.html'], ['Services', 'services.html'], [esc(s.short)]];
  built.push(page({
    file: s.file, active: s.key, title: s.title, description: s.description,
    schema: [ORG_SCHEMA, breadcrumbSchema(trail), { '@context': 'https://schema.org', '@type': 'Service', name: s.short, description: s.description, serviceType: s.items.map(i => i[0]), provider: { '@id': SITE + '#business' }, areaServed: { '@type': 'AdministrativeArea', name: 'Delhi NCR' }, url: SITE + s.file }],
    body: `${pageHero({ trail, eyebrow: s.eyebrow, h1: s.h1, lead: s.lead, photo: s.photo, actions: `<a class="btn" href="contact.html">Book a Site Visit <span>↗</span></a>` })}

    <section class="detail">
      <div class="container detail-grid">
        <div>
          <p class="eyebrow">What we deliver</p>
          <h2 class="h2" style="margin-bottom:16px">${s.listTitle}</h2>
          <p class="detail-intro">${s.intro}</p>
          <div class="detail-list">
${s.items.map(([h, p, proof], i) => `            <div class="detail-item"><div class="num">${String(i + 1).padStart(2, '0')}</div><div><h3>${h}</h3><p>${p}</p>${proof ? `<div class="proof-callout"><b>Delivered:</b> ${proof}</div>` : ''}</div></div>`).join('\n')}
          </div>
          <div class="cta-box"><h2>${s.cta[0]}</h2><p>${s.cta[1]}</p><a class="btn" href="contact.html">${s.cta[2]} <span>↗</span></a></div>
        </div>
        <aside class="sidebar" aria-label="More services">
          <div class="side-card"><h2>All services</h2>${serviceLinks(s.key)}</div>
          ${sideContact(s.side[0], s.side[1])}
        </aside>
      </div>
    </section>

${processSection('')}`,
  }));
}

// Blog listing
const blogTrail = [['Home', 'index.html'], ['Insights']];
built.push(page({
  file: 'blog.html', active: 'blog',
  title: 'Landscaping &amp; Irrigation Insights | Laavin Infrascapes',
  description: 'Practical guides on landscaping, irrigation, tree transplantation and green spaces that last, from the Laavin Infrascapes team.',
  schema: [breadcrumbSchema(blogTrail)],
  body: `${pageHero({ trail: blogTrail, eyebrow: 'Insights', h1: 'Practical guides for <em>gardens that last.</em>' })}

    <section class="insights">
      <div class="container">
        <h2 class="sr-only">All articles</h2>
        <div class="post-grid">
${articles.filter(a => !a.draft).map(postCard).join('\n')}
        </div>
      </div>
    </section>

${ctaBand('Have a question about your site?', 'Our horticulturist and engineer are happy to advise on plants, drainage, irrigation or moving trees before you start.', 'Book a Site Visit')}`,
}));

// Articles
for (const a of articles) {
  const trail = [['Home', 'index.html'], ['Insights', 'blog.html'], [a.category]];
  const others = articles.filter(o => o.slug !== a.slug && !o.draft);
  built.push(page({
    file: a.slug + '.html', active: 'blog', title: a.metaTitle, description: a.description, ogType: 'article', noindex: !!a.draft,
    ogImage: a.image,
    schema: [{
      '@context': 'https://schema.org', '@type': 'BlogPosting', headline: a.title.replace(/&amp;/g, '&'), description: a.description,
      image: absUrl(a.image), datePublished: '2026-10-10', dateModified: a.draft ? '2026-10-10' : '2026-10-21',
      author: { '@type': 'Organization', name: BRAND, url: SITE },
      publisher: { '@type': 'Organization', name: BRAND, logo: { '@type': 'ImageObject', url: SITE + 'assets/images/logo/logo-black.png' } },
      mainEntityOfPage: SITE + a.slug + '.html',
    }, breadcrumbSchema(trail)],
    body: `    <section class="page-hero"><div class="container">
          ${crumbs(trail)}
          <p class="eyebrow">${a.category}</p>
          <h1>${a.title}</h1>
          <div class="article-meta"><span>${BRAND}</span><span><time datetime="2026-10-10">${a.date}</time></span><span>${a.readTime}</span></div>
    </div></section>

    <section class="detail">
      <div class="container detail-grid">
        <article class="prose">
          <p class="article-lead">${a.lead}</p>
          <figure class="detail-photo"><img src="${a.image}" alt="${esc(a.imageAlt)}" width="1200" height="675"></figure>
${a.body.split('\n').map(l => '          ' + l).join('\n')}
          <div class="cta-box"><h2>${a.cta.title}</h2><p>${a.cta.text}</p><a class="btn" href="contact.html">${a.cta.button} <span>↗</span></a></div>
        </article>
        <aside class="sidebar" aria-label="Related">
          <div class="side-card"><h2>Recent project</h2><p class="side-figure">${a.proof.figure}</p><p>${a.proof.text}</p><a class="text-link" href="${a.proof.href}">${a.proof.link} <span>→</span></a></div>
          <div class="side-card"><h2>More articles</h2><ul class="side-links">${others.map(o => `<li><a href="${o.slug}.html">${o.title}</a></li>`).join('')}</ul></div>
          ${sideContact('Planning similar work?', 'Send us the site details and we will reply within 24 hours.')}
        </aside>
      </div>
    </section>`,
  }));
}

// Contact
const contactTrail = [['Home', 'index.html'], ['Contact']];
built.push(page({
  file: 'contact.html', active: 'contact',
  title: 'Contact Laavin Infrascapes | Book a Site Visit',
  description: 'Book a site visit for a garden, terrace, landscape, irrigation or hardscape project. Call or WhatsApp +91 98115 11558 for a reply within 24 hours.',
  schema: [ORG_SCHEMA, breadcrumbSchema(contactTrail)],
  scripts: ['assets/js/contact-form.js'],
  body: `${pageHero({ trail: contactTrail, eyebrow: 'Get in touch', h1: 'Tell us about <em>your site.</em>', lead: 'Tell us a little about your terrace, garden or property. We reply within 24 hours with ideas, advice on what is possible and a rough cost. For anything urgent, call or WhatsApp us.' })}

    <section class="contact">
      <div class="container">
        <div class="info-grid">
          <div class="info-card"><div class="proof-icon" aria-hidden="true">⌂</div><h2>Visit our office</h2><p>${ADDRESS}, India</p></div>
          <div class="info-card"><div class="proof-icon" aria-hidden="true">@</div><h2>Email</h2><p><a href="mailto:${EMAIL}">${EMAIL}</a></p></div>
          <div class="info-card"><div class="proof-icon" aria-hidden="true">↗</div><h2>Call or WhatsApp</h2><p><a href="tel:${TEL}">${PHONE}</a> · <a href="https://wa.me/${WA}" target="_blank" rel="noopener">Chat on WhatsApp</a></p></div>
        </div>
      </div>
    </section>

    <section class="contact" style="padding-top:0">
      <div class="container contact-grid">
        <div class="contact-copy"><p class="eyebrow">Send an enquiry</p><h2 class="h2">Planning a garden, terrace or landscape?</h2><p>Tell us what you need, where the site is and when you want the work done. A rough size and a few photos help us reply faster.</p>
          <div class="map-frame" style="margin-top:24px"><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14012.941263973356!2d77.29572835582755!3d28.592716610980645!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce48b866af1ef%3A0x58913d62225c2c0!2sNew%20Ashok%20Nagar%2C%20Delhi!5e0!3m2!1sen!2sin!4v1721473228480!5m2!1sen!2sin" title="Map showing New Ashok Nagar, Delhi" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>
        </div>
${enquiryForm()}
      </div>
    </section>`,
}));

// Privacy
const privacyTrail = [['Home', 'index.html'], ['Privacy policy']];
built.push(page({
  file: 'privacy.html', active: '',
  title: 'Privacy Policy | Laavin Infrascapes',
  description: 'How Laavin Infrascapes handles the details you send through our enquiry form, email or WhatsApp.',
  schema: [breadcrumbSchema(privacyTrail)],
  body: `${pageHero({ trail: privacyTrail, eyebrow: 'Privacy', h1: 'Privacy policy', lead: 'How we handle the details you send us. Last updated October 2026.' })}

    <section class="detail">
      <div class="container legal">
        <h2>What we collect</h2>
        <p>When you send an enquiry through our website, we receive the details you enter: your name, phone number, email address, site location, the service you need and what you tell us about your site. If you contact us by phone, email or WhatsApp, we receive the details you share there.</p>
        <h2>How we use it</h2>
        <p>We use your details only to respond to your enquiry, prepare proposals and estimates, and carry out work you ask us to do. We do not sell your details or add you to marketing lists.</p>
        <h2>How long we keep it</h2>
        <p>Enquiries are kept in our business email for as long as they are needed for the project or for our records.</p>
        <h2>Third parties</h2>
        <p>Our contact page shows a Google Maps embed, and the WhatsApp links open WhatsApp, which are run by their own providers under their own privacy policies.</p>
        <h2>Contact</h2>
        <p>To ask what we hold about you or to have it deleted, email <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>
      </div>
    </section>`,
}));

// 404: shown by the server for any missing URL, so every link and asset path is made root-relative (/...).
built.push(page({
  file: '404.html', active: '', noindex: true,
  title: 'Page Not Found | Laavin Infrascapes',
  description: 'The page you were looking for has moved or does not exist. Find our services, projects and contact details here.',
  body: `    <section class="page-hero"><div class="container">
          <p class="eyebrow">Page not found</p>
          <h1>This page has moved, <em>or never took root.</em></h1>
          <p class="lead">The link may be old or mistyped. These are the pages most people are looking for.</p>
          <div class="hero-actions"><a class="btn" href="contact.html">Book a Site Visit <span>↗</span></a><a class="btn btn-outline" href="index.html">Go to the homepage</a></div>
    </div></section>

    <section class="detail">
      <div class="container">
        <div class="info-grid">
          <div class="info-card"><h2>Services</h2><p>Landscaping, irrigation, hardscaping and tree transplantation. <a href="services.html">See all services</a></p></div>
          <div class="info-card"><h2>Projects</h2><p>Highway, railway, airport, school and landfill work we have delivered. <a href="index.html#projects">See our projects</a></p></div>
          <div class="info-card"><h2>Insights</h2><p>Practical guides on planting, irrigation and keeping a landscape alive. <a href="blog.html">Read the guides</a></p></div>
        </div>
      </div>
    </section>`,
}));
{
  const f = path.join(PUB, '404.html');
  fs.writeFileSync(f, fs.readFileSync(f, 'utf8').replace(/(\s(?:href|src)=")(?!https?:|mailto:|tel:|data:|#|\/)/g, '$1/').replace(/srcset="([^"]+)"/g, (m, v) => 'srcset="' + v.split(', ').map(s => s.startsWith('/') ? s : '/' + s).join(', ') + '"'));
}

console.log('Built ' + built.length + ' pages:\n' + built.join('\n'));
