/* Toast Bouquets — header for the hidden verification page ONLY.
   Same navbar as the live site but with ALL call-to-action buttons removed
   (no "Get a Quote", no phone, no sticky mobile CTA bar). Do not use on the
   public site — the public site uses js/header.js. */
(function () {
  var html =
    '<nav class="navbar" id="navbar"><div class="nav-inner">' +
      '<a href="#" class="logo"><img src="images/nav-logo.png" alt="Toast Bouquets"> Toast <span>Bouquets</span></a>' +
      '<div class="nav-links" id="navLinks">' +
        '<a href="#reviews">Reviews</a>' +
        '<a href="#services">Services</a>' +
        '<a href="#gallery">Gallery</a>' +
        '<a href="#location">Location</a>' +
      '</div>' +
      '<div class="nav-cta">' +
        '<button class="nav-toggle" id="navToggle" aria-label="Menu">&#9776;</button>' +
      '</div>' +
    '</div></nav>';

  document.body.insertAdjacentHTML('afterbegin', html);

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
