// survey-submit.js - shared by the seller and buyer surveys.
// Personalizes the greeting from the link (?client=Name), collects every answer, and posts to /api/submit.
(function () {
  function qp(k) { return new URLSearchParams(location.search).get(k); }

  // Personalize the headline if the agent's link included a name.
  var client = qp('client');
  if (client) {
    var h = document.getElementById('h1');
    if (h) h.textContent = h.textContent + ', ' + client;
  }

  function collect(form) {
    var answers = [], contact = {};
    form.querySelectorAll('.field').forEach(function (field) {
      var labelEl = field.querySelector('label');
      if (!labelEl) return;
      var label = labelEl.textContent.replace(/\s+/g, ' ').replace(/\(optional[^)]*\)/i, '').replace(/\([^)]*personalizes[^)]*\)/i, '').trim();
      var val = '';
      var chips = field.querySelector('.chips');
      var input = field.querySelector('input, textarea');
      if (chips) {
        var c = chips.querySelector('[aria-pressed="true"]');
        val = c ? c.textContent.trim() : '';
        if (c && c.dataset.reveal) {
          var rev = document.getElementById(c.dataset.reveal);
          // Only fold in a bare reveal input. A reveal that is itself a full .field
          // (its own label) gets collected on its own, so don't double-count it.
          if (rev && !rev.classList.contains('field')) {
            var ri = rev.querySelector('input, textarea');
            if (ri && ri.value.trim()) val += ' (' + ri.value.trim() + ')';
          }
        }
      } else if (input) {
        val = (input.value || '').trim();
      }
      if (!val) return;
      var low = label.toLowerCase();
      if (/^your name/.test(low)) contact.name = val;
      else if (/email/.test(low)) contact.email = val;
      else if (/phone/.test(low)) contact.phone = val;
      else if (/property address/.test(low)) contact.address = val;
      else answers.push({ label: label, value: val });
    });
    return { answers: answers, contact: contact };
  }

  var form = document.getElementById('form');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    try {
      var c = collect(form);
      var payload = {
        form_type: form.dataset.form || 'seller-survey',
        contact_name: c.contact.name || '',
        contact_email: c.contact.email || '',
        contact_phone: c.contact.phone || '',
        listing_address: c.contact.address || '',
        answers: c.answers.map(function(a){ return a.label + ': ' + a.value; }).join('\n')
      };
      var cfg = window.SF_CONFIG || {};
      if (cfg.endpoint) {
        fetch(cfg.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      } else if (cfg.web3formsKey) {
        // Static, email-only fallback (no server).
        var fd = new FormData();
        fd.append('access_key', cfg.web3formsKey);
        fd.append('subject', 'New ' + (payload.form_type === 'buyer-survey' ? 'Buyer' : 'Seller') + ' survey - ' + (payload.contact_name || 'client'));
        fd.append('name', payload.contact_name);
        fd.append('email', payload.contact_email);
        fd.append('phone', payload.contact_phone);
        fd.append('property', payload.listing_address);
        fd.append('answers', payload.answers.map(function (a) { return a.label + ': ' + a.value; }).join('\n'));
        fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd });
      }
    } catch (err) {}
    document.getElementById('form').style.display = 'none';
    document.querySelector('.bar').style.display = 'none';
    document.getElementById('done').classList.add('show');
    window.scrollTo(0, 0);
  });
})();
