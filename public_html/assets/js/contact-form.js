/* Enquiry form: posts to contact.php; if the server can't take it, hands the enquiry to WhatsApp instead. */
(function () {
  var form = document.getElementById('enquiry-form');
  if (!form) return;
  var status = form.querySelector('.form-status');
  var button = form.querySelector('button[type="submit"]');
  var WHATSAPP = '919811511558';

  function show(type, html) {
    status.className = 'form-status ' + type;
    status.innerHTML = html;
  }

  function whatsappLink() {
    var d = new FormData(form);
    var text = 'Hello Laavin Infrascapes, I would like to enquire about a project.\n\n' +
      'Name: ' + d.get('name') + '\n' +
      'Phone: ' + d.get('number') + '\n' +
      'Email: ' + d.get('email') + '\n' +
      'Service: ' + (d.get('service') || '-') + '\n' +
      'Project location: ' + (d.get('location') || '-') + '\n' +
      'Requirements: ' + (d.get('message') || '-');
    return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    button.disabled = true;
    button.textContent = 'Sending…';
    show('', '');

    // The host's anti-bot check answers the first request with a script that sets a cookie and reloads.
    // A page reload would lose the form, so set that cookie here and send once more.
    function send(retry) {
      return fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' }, credentials: 'same-origin' })
        .then(function (r) {
          var type = r.headers.get('content-type') || '';
          if (type.indexOf('json') !== -1) return r.json();
          return r.text().then(function (t) {
            var m = t.match(/document\.cookie\s*=\s*"([^"]+)"/);
            if (!retry && m) { document.cookie = m[1] + '; path=/; SameSite=Lax'; return send(true); }
            throw new Error('unexpected response');
          });
        });
    }

    send(false)
      .then(function (res) {
        if (!res.ok) throw new Error(res.error || 'send failed');
        form.reset();
        show('success', '<strong>Thank you, we’ve received your enquiry.</strong> Our project team will reply within 24 hours. ' +
          'For anything urgent, call <a href="tel:+919811511558">(+91) 98115 11558</a>.');
      })
      .catch(function () {
        show('error', 'We couldn’t send your enquiry online. Please <a href="' + whatsappLink() +
          '" target="_blank" rel="noopener">send it on WhatsApp</a> (your details are filled in) or call ' +
          '<a href="tel:+919811511558">(+91) 98115 11558</a>.');
      })
      .then(function () {
        button.disabled = false;
        button.innerHTML = 'Send Enquiry <span>↗</span>';
      });
  });
})();
