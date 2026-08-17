/* ============================================================================
   Toast Bouquets — Quote form → GoHighLevel
   ----------------------------------------------------------------------------
   THE ONLY LINE YOU EDIT: paste your GoHighLevel Inbound Webhook URL below.
   (In GoHighLevel: Automation → Workflows → new workflow → add trigger
   "Inbound Webhook" → copy the URL it gives you → paste it here.)

   Until you paste it, the form runs in DEMO MODE (shows the success screen but
   does NOT send anything) so the live site keeps working safely.
   ========================================================================== */

var TB_CONFIG = {
  // Paste your GoHighLevel Inbound Webhook URL here. It looks like:
  // https://services.leadconnectorhq.com/hooks/XXXXX/webhook-trigger/YYYYY
  GHL_WEBHOOK_URL: 'https://services.leadconnectorhq.com/hooks/Yvrw300nz4Kt2bFhd2QJ/webhook-trigger/5f9cb812-ddd4-4339-b057-168084ffbfcd'
};

/* ==========================================================================
   You don't need to edit anything below this line.
   ========================================================================== */
(function () {
  'use strict';

  var CONFIGURED =
    TB_CONFIG.GHL_WEBHOOK_URL.indexOf('http') === 0 &&
    TB_CONFIG.GHL_WEBHOOK_URL.indexOf('PASTE_YOUR') === -1;

  var TBQuotes = {
    isConfigured: CONFIGURED,

    // Send one quote to GoHighLevel. Returns a Promise that resolves on success.
    submit: function (data) {
      // Clean field names — these are what you'll map inside your GoHighLevel
      // workflow (and what shows on the contact record).
      var name = (data.name || '').trim();
      var firstName = name.split(' ')[0] || '';
      var lastName  = name.split(' ').slice(1).join(' ') || '';

      // Normalize the phone into clean +1 E.164 format so GoHighLevel always accepts it.
      // Strips (), -, spaces, and + ; drops autofill's leading "1"/"+1"; re-adds a single +1.
      var phoneDigits = (data.phone || '').replace(/[^0-9]/g, '');   // digits only
      if (phoneDigits.length === 11 && phoneDigits.charAt(0) === '1') {
        phoneDigits = phoneDigits.slice(1);                          // "19805551234" -> "9805551234"
      }
      var phoneE164 = phoneDigits.length === 10 ? '+1' + phoneDigits : phoneDigits;

      var payload = {
        // Standard GoHighLevel contact fields (map these to the contact in your
        // workflow's "Create/Update Contact" step):
        full_name:      name,
        first_name:     firstName,
        last_name:      lastName,
        email:          (data.email || '').trim(),
        phone:          phoneE164,
        // Quote details (add these as custom fields or put them in a note):
        order_type:     (data.event_type || '').trim(),
        requested_date: (data.requested_date || '').trim(),
        budget:         (data.budget || '').trim(),
        submitted_at:   new Date().toLocaleString(),
        source:         (data.source || 'website') + ' — ' + location.href,
        sms_consent:    'Yes — agreed to be contacted by call, text & email (web form)'
      };

      if (!CONFIGURED) {
        // DEMO MODE — no network call.
        return new Promise(function (resolve) {
          console.info('[TBQuotes] DEMO mode — not sent. Add your GoHighLevel webhook URL in js/quote-form.js to go live.', payload);
          setTimeout(resolve, 500);
        });
      }

      return fetch(TB_CONFIG.GHL_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (res) {
        if (res.ok) return res.text().then(function (t) { try { return JSON.parse(t); } catch (e) { return {}; } });
        throw new Error('Submission failed (' + res.status + ').');
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

    // Lock the submit button until the consent box is checked.
    var consentBox = form.querySelector('[name="sms_consent"]');
    if (consentBox && submitBtn) {
      var syncConsent = function () {
        var ok = consentBox.checked;
        submitBtn.disabled = !ok;
        submitBtn.style.opacity = ok ? '' : '0.5';
        submitBtn.style.cursor  = ok ? '' : 'not-allowed';
      };
      consentBox.addEventListener('change', syncConsent);
      syncConsent();
    }

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
      var consentEl = form.querySelector('[name="sms_consent"]');
      if (consentEl && !consentEl.checked) return showError('Please check the box to agree before we can send your request.');

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
        showError('Sorry — something went wrong sending your request. Please call or text us at (980) 473-0352 and we\'ll help right away.');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.forEach.call(document.querySelectorAll('form[data-tb-quote]'), wireForm);
  });
})();
