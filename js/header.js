/* Toast Bouquets — shared site header component.
   Injects the same navbar into every page so header changes apply site-wide.
   Include right after <body> on each page:  <script src="js/header.js"></script>
   (Pages in the site root; assets referenced relative to that root.) */
(function () {
  // Detect the homepage by filename (runs before the rest of <body> is parsed,
  // so we can't rely on page sections existing yet). Other pages link back to index.
  var file = location.pathname.split('/').pop();
  var isHome = (file === '' || file === 'index.html' || file === 'index.htm');
  var p = isHome ? '' : 'index.html';

  var phoneSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.94.36 1.86.7 2.73a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.35-1.27a2 2 0 0 1 2.11-.45c.87.34 1.79.57 2.73.7A2 2 0 0 1 22 16.92z"/></svg>';

  var html =
    '<nav class="navbar" id="navbar"><div class="nav-inner">' +
      '<a href="' + (isHome ? '#' : 'index.html') + '" class="logo"><img src="images/nav-logo.png" alt="Toast Bouquets"> Toast <span>Bouquets</span></a>' +
      '<div class="nav-links" id="navLinks">' +
        '<a href="' + p + '#reviews">Reviews</a>' +
        '<a href="' + p + '#services">Services</a>' +
        '<a href="' + p + '#gallery">Gallery</a>' +
        '<a href="' + p + '#location">Location</a>' +
        '<div class="menu-only menu-actions">' +
          '<a href="' + p + '#get-quote" class="btn btn-gold menu-quote">Get Quote</a>' +
          '<a href="tel:9802131254" class="menu-phone">' + phoneSvg + '(980) 213-1254</a>' +
        '</div>' +
      '</div>' +
      '<div class="nav-cta">' +
        '<a href="' + p + '#get-quote" class="btn btn-gold nav-quote-btn" style="padding:11px 22px;">Get a Quote</a>' +
        '<a href="tel:9802131254" class="nav-phone">' + phoneSvg + '(980) 213-1254</a>' +
        '<button class="nav-toggle" id="navToggle" aria-label="Menu">&#9776;</button>' +
      '</div>' +
    '</div></nav>';

  document.body.insertAdjacentHTML('afterbegin', html);

  // Sticky mobile bottom bar: Get a Free Quote + Call. Appears on scroll.
  var barHtml =
    '<div class="mobile-cta-bar" id="mobileCtaBar">' +
      '<a href="' + p + '#get-quote" class="btn btn-gold mcta-quote">Get a Free Quote</a>' +
      '<a href="tel:9802131254" class="mcta-call">' + phoneSvg + '<span>Call</span></a>' +
    '</div>';
  document.body.insertAdjacentHTML('beforeend', barHtml);
  var ctaBar = document.getElementById('mobileCtaBar');
  if (ctaBar) {
    var toggleBar = function () {
      var y = window.scrollY || window.pageYOffset;
      var nearBottom = (window.innerHeight + y) > (document.body.scrollHeight - 180);
      ctaBar.classList.toggle('show', y > 480 && !nearBottom);
    };
    window.addEventListener('scroll', toggleBar, { passive: true });
    window.addEventListener('resize', toggleBar);
    toggleBar();
  }

  var navbar = document.getElementById('navbar');
  var navToggle = document.getElementById('navToggle');

  if (navToggle && navbar) {
    navToggle.addEventListener('click', function () {
      navbar.classList.toggle('open');
    });
    document.querySelectorAll('#navLinks a').forEach(function (link) {
      link.addEventListener('click', function () { navbar.classList.remove('open'); });
    });
  }

  if (navbar) {
    var grow = function () {
      navbar.classList.toggle('navbar-scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', grow);
    grow();
  }
})();
