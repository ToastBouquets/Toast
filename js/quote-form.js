/* ============================================================================
   Toast Bouquets — Quote form → Formspree
   ----------------------------------------------------------------------------
   THE ONLY LINE YOU EDIT: paste your Formspree endpoint below (see SETUP.md).
   Until you do, the form runs in DEMO MODE (shows the success screen but does
   NOT send anything) so you can preview it safely.
   ========================================================================== */

var TB_CONFIG = {
  // Formspree → your form → Integration → copy the endpoint. Looks like:
  // https://formspree.io/f/abcdwxyz
  FORMSPREE_ENDPOINT: 'https://formspree.io/f/meeyjwll'
};

/* ==========================================================================
   You don't need to edit anything below this line.
   ========================================================================== */
(function () {
  'use strict';

  var CONFIGURED =
    TB_CONFIG.FORMSPREE_ENDPOINT.indexOf('formspree.io/f/') !== -1 &&
    TB_CONFIG.FORMSPREE_ENDPOINT.indexOf('YOUR_FORM_ID') === -1;

  var TBQuotes = {
    isConfigured: CONFIGURED,

    // Send one quote to Formspree. Returns a Promise that resolves on success.
    submit: function (data) {
      // Clean, readable field names — these are exactly what you'll see in the
      // Formspree dashboard and the notification email.
      var payload = {
        name:           (data.name || '').trim(),
        email:          (data.email || '').trim(),   // Formspree uses this as reply-to
        phone:          (data.phone || '').trim(),
        order_type:     (data.event_type || '').trim(),
        requested_date: (data.requested_date || '').trim(),
        budget:         (data.budget || '').trim(),
        submitted_at:   new Date().toLocaleString(),
        source:         (data.source || '') + ' — ' + location.href,
        _subject:       'New quote request: ' + (data.name || 'customer') + ' — ' + (data.event_type || '')
      };

      if (!CONFIGURED) {
        // DEMO MODE — no network call.
        return new Promise(function (resolve) {
          console.info('[TBQuotes] DEMO mode — not sent. Add your Formspree endpoint in js/quote-form.js to go live.', payload);
          setTimeout(resolve, 500);
        });
      }

      return fetch(TB_CONFIG.FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (res) {
        if (res.ok) return res.json().catch(function () { return {}; });
        return res.json().then(function (body) {
          var msg = (body && body.errors && body.errors.length)
            ? body.errors.map(function (e) { return e.message; }).join(', ')
            : 'Submission failed (' + res.status + ').';
          throw new Error(msg);
        });
      });
    }
  };

  window.TBQuotes = TBQuotes;

  /* ---------- Generic form wiring (validation + submit + states) ---------- */
  function wireForm(form) {
    var fields    = form.querySelector('[data-quote-fields]');
    var success   = form.querySelector('[data-quote-success]');
    var submitBtn = form.querySelector('[type="submit"]');
    var errorBox  = form.querySelector('[data-quote-error]');
    var submitting = false;

    function showError(msg) {
      if (errorBox) { errorBox.textContent = msg; errorBox.style.display = 'block'; }
      else { alert(msg); }
    }
    function clearError() { if (errorBox) errorBox.style.display = 'none'; }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (submitting) return;            // guard against double submits
      clearError();

      // Honeypot: real users never fill this hidden field.
      var pot = form.querySelector('[name="_gotcha"]');
      if (pot && pot.value) { if (success) { fields.style.display='none'; success.classList.add('show'); } return; }

      var data = {};
      Array.prototype.forEach.call(form.querySelectorAll('[name]'), function (el) { data[el.name] = el.value; });
      data.source = form.getAttribute('data-source') || 'website';

      // Validation
      if (!data.event_type)     return showError('Please choose an event or order type.');
      if (!data.requested_date) return showError('Please choose a requested date.');
      if (!data.budget)         return showError('Please select a budget.');
      if (!data.name || data.name.trim().length < 2) return showError('Please enter your name.');
      if ((data.phone || '').replace(/[^0-9]/g, '').length < 10) return showError('Please enter a valid phone number.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || '')) return showError('Please enter a valid email address.');

      // Loading state + lock
      submitting = true;
      if (submitBtn) { submitBtn.disabled = true; submitBtn.dataset.label = submitBtn.textContent; submitBtn.textContent = 'Sending…'; }

      TBQuotes.submit(data).then(function () {
        if (fields) fields.style.display = 'none';
        if (success) success.classList.add('show');
      }).catch(function (err) {
        submitting = false;
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitBtn.dataset.label || 'Submit'; }
        console.error('[TBQuotes] submit failed', err);
        showError('Sorry — something went wrong sending your request. Please call or text us at (980) 213-1254 and we\'ll help right away.');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.forEach.call(document.querySelectorAll('form[data-tb-quote]'), wireForm);
  });
})();
