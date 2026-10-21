/* Shared behaviour: mobile menu, services sub-menu, sticky header shadow, footer year. */
(function () {
  var toggle = document.getElementById('menuToggle');
  var nav = document.getElementById('navLinks');
  var header = document.querySelector('.site-header');

  function setMenu(open) {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    toggle.textContent = open ? '×' : '☰';
    document.body.classList.toggle('menu-open', open);
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('open') && !e.target.closest('.site-header')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); toggle.focus(); }
    });
  }

  document.querySelectorAll('.sub-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.nav-item');
      var open = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  if (header) {
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Hero photos: with two or more images in .hero-photo they cross-fade every 6 seconds.
  // Text stays fixed. Skipped when the visitor's device asks for reduced motion.
  var box = document.querySelector('.hero-photo');
  var slides = box ? box.querySelectorAll('img') : [];
  if (slides.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var current = 0, timer = null;
    var pause = document.createElement('button');
    pause.type = 'button';
    pause.className = 'hero-pause';
    box.classList.add('is-fading');
    slides[0].classList.add('is-active');
    var next = function () {
      slides[current].classList.remove('is-active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('is-active');
    };
    var play = function () {
      timer = setInterval(next, 6000);
      pause.textContent = 'Pause';
      pause.setAttribute('aria-label', 'Pause photo slideshow');
    };
    var stop = function () {
      clearInterval(timer);
      timer = null;
      pause.textContent = 'Play';
      pause.setAttribute('aria-label', 'Play photo slideshow');
    };
    pause.addEventListener('click', function () { if (timer) stop(); else play(); });
    box.appendChild(pause);
    play();
  }

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Scroll motion: one soft rise for section blocks, staggered in card grids, and a gentle settle for photos.
  // Anything already on screen when the page loads is left alone, so the first view appears instantly.
  (function () {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    var RISE = '.section-head, .about-copy, .contact-copy, .process-intro, .credential-panel, .project-feature-body, .cta-box, .cta-band .container, .prose-cols > div:first-child';
    var GRID = '.service-card, .path-card, .ledger-row:not(.ledger-head), .team-card, .post-card, .feature-item, .info-card, .process-step';
    var PHOTO = '.about-photo img, .project-feature-photo img, .card-photo img, .detail-photo img';
    var targets = [];
    function tag(el, kind, delay) {
      var top = el.getBoundingClientRect().top;
      if (top < window.innerHeight * 0.9) return; // on screen or above it: show as is
      el.setAttribute('data-motion', kind);
      if (delay) el.style.transitionDelay = delay + 'ms';
      targets.push(el);
    }
    document.querySelectorAll(RISE).forEach(function (el) { tag(el, 'rise'); });
    document.querySelectorAll(GRID).forEach(function (el) {
      var sibs = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.matches(GRID); });
      tag(el, 'rise', Math.min(sibs.indexOf(el) % 4, 3) * 60);
    });
    document.querySelectorAll(PHOTO).forEach(function (el) { tag(el, 'photo'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        el.classList.add('motion-in');
        io.unobserve(el);
        // Hand the element back to its own styles so hover effects keep their speed.
        setTimeout(function () { el.style.transitionDelay = ''; el.removeAttribute('data-motion'); el.classList.remove('motion-in'); }, 1300);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (el) { io.observe(el); });
  })();

  // Services on phones: each card opens and closes like a list item, one at a time.
  (function () {
    var cards = document.querySelectorAll('.svc-acc > .service-card');
    if (!cards.length) return;
    var mq = window.matchMedia('(max-width: 760px)');
    function setOpen(card, open) {
      card.classList.toggle('open', open);
      card.querySelector('.acc-btn').setAttribute('aria-expanded', String(open));
    }
    cards.forEach(function (card, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'acc-btn';
      btn.setAttribute('aria-label', 'Show details: ' + card.querySelector('h3').textContent);
      card.appendChild(btn);
      setOpen(card, false);
      card.addEventListener('click', function (e) {
        if (!mq.matches || e.target.closest('a')) return;
        var open = !card.classList.contains('open');
        cards.forEach(function (c) { setOpen(c, false); });
        setOpen(card, open);
      });
    });
  })();

  // "Who we work with": tabs show one audience card at a time, on every screen size.
  (function () {
    var grid = document.querySelector('.paths-grid');
    if (!grid) return;
    var cards = grid.querySelectorAll('.path-card');
    var bar = document.createElement('div');
    bar.className = 'path-tabs';
    bar.setAttribute('role', 'tablist');
    bar.setAttribute('aria-label', 'Who we work with');
    var tabs = [];
    cards.forEach(function (card, i) {
      card.id = card.id || 'path-' + (i + 1);
      var b = document.createElement('button');
      b.type = 'button';
      b.id = card.id + '-tab';
      b.setAttribute('role', 'tab');
      card.setAttribute('role', 'tabpanel');
      card.setAttribute('aria-labelledby', b.id);
      b.textContent = card.getAttribute('data-short') || card.querySelector('.path-tag').textContent;
      b.setAttribute('aria-controls', card.id);
      b.addEventListener('click', function () { select(i); });
      bar.appendChild(b);
      tabs.push(b);
    });
    bar.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(document.activeElement);
      if (i < 0 || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;
      var n = (i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
      select(n); tabs[n].focus(); e.preventDefault();
    });
    grid.parentNode.insertBefore(bar, grid);
    function select(n) {
      cards.forEach(function (c, i) { c.classList.toggle('active', i === n); });
      tabs.forEach(function (t, i) { t.setAttribute('aria-selected', String(i === n)); t.tabIndex = i === n ? 0 : -1; });
    }
    grid.classList.add('tabbed');
    select(0);
  })();

  // Service pages on phones: in chapters with several items, each item opens and closes, one at a time.
  document.querySelectorAll('.chapter-copy').forEach(function (list) {
    var items = list.querySelectorAll('.chapter-item');
    if (items.length < 2) return;
    list.classList.add('acc');
    var mq = window.matchMedia('(max-width: 760px)');
    function setOpen(item, open) {
      item.classList.toggle('open', open);
      item.querySelector('.acc-btn').setAttribute('aria-expanded', String(open));
    }
    items.forEach(function (item) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'acc-btn';
      btn.setAttribute('aria-label', 'Show details: ' + item.querySelector('h3').textContent);
      item.querySelector('h3').appendChild(btn);
      setOpen(item, item === items[0]);
      item.addEventListener('click', function (e) {
        if (!mq.matches || e.target.closest('a')) return;
        var open = !item.classList.contains('open');
        items.forEach(function (i) { setOpen(i, false); });
        setOpen(item, open);
      });
    });
  });
})();

// Services sub-header: on phones, scroll the current service into view
(function () {
  var cur = document.querySelector('.svc-bar [aria-current="page"]');
  var bar = document.querySelector('.svc-bar .container');
  if (!bar) return;
  if (cur) bar.scrollLeft = cur.offsetLeft - 16;
  // Drop the right-edge fade once the bar is scrolled to its end
  var edge = function () { bar.classList.toggle('at-end', bar.scrollLeft + bar.clientWidth >= bar.scrollWidth - 2); };
  bar.addEventListener('scroll', edge, { passive: true });
  edge();
})();
