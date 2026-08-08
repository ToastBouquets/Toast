const navToggle = document.getElementById('navToggle');
const navbar = document.getElementById('navbar');

if (navToggle && navbar) {
  navToggle.addEventListener('click', () => {
    navbar.classList.toggle('open');
  });

  document.querySelectorAll('#navLinks a').forEach((link) => {
    link.addEventListener('click', () => navbar.classList.remove('open'));
  });
}

if (navbar) {
  const growNavOnScroll = () => {
    navbar.classList.toggle('navbar-scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', growNavOnScroll);
  growNavOnScroll();
}

const quoteForm = document.getElementById('quoteForm');

if (quoteForm) {
  quoteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    document.getElementById('quoteFormFields').style.display = 'none';
    document.getElementById('quoteSuccess').classList.add('show');
  });
}

// Service area map (Leaflet)
const mapEl = document.getElementById('serviceMap');
if (mapEl && window.L) {
  const shop = [35.2465, -81.1450]; // 2733 E Ozark Ave, Gastonia, NC 28054

  const cities = [
    ['Charlotte', 35.2271, -80.8431],
    ['Huntersville', 35.4107, -80.8428],
    ['Cornelius', 35.4868, -80.8595],
    ['Davidson', 35.4993, -80.8487],
    ['Mooresville', 35.5849, -80.8101],
    ['Concord', 35.4088, -80.5795],
    ['Kannapolis', 35.4874, -80.6217],
    ['Gastonia', 35.2621, -81.1873],
    ['Belmont', 35.2452, -81.0334],
    ['Matthews', 35.1168, -80.7237],
    ['Mint Hill', 35.1793, -80.6487],
    ['Indian Trail', 35.0768, -80.6659],
    ['Pineville', 35.0857, -80.8929],
    ['Waxhaw', 34.9235, -80.7443],
    ['Rock Hill', 34.9249, -81.0251]
  ];

  const coverageOutline = [
    [35.62, -80.82],
    [35.52, -80.58],
    [35.30, -80.55],
    [34.98, -80.62],
    [34.87, -80.75],
    [34.87, -81.08],
    [35.10, -81.20],
    [35.28, -81.22],
    [35.45, -81.05]
  ];

  const map = L.map('serviceMap', {
    scrollWheelZoom: false,
    zoomSnap: 0.5,
    fadeAnimation: true,
    inertia: true
  });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 16,
    updateWhenZooming: false,
    keepBuffer: 4
  }).addTo(map);

  // Only capture scroll-to-zoom once the user is actively interacting with the map,
  // so scrolling the page past it doesn't get hijacked.
  mapEl.addEventListener('click', () => map.scrollWheelZoom.enable());
  mapEl.addEventListener('mouseleave', () => map.scrollWheelZoom.disable());

  L.polygon(coverageOutline, {
    color: '#1F3A2E',
    weight: 2.5,
    fillColor: '#1F3A2E',
    fillOpacity: 0.12
  }).addTo(map);

  cities.forEach(([name, lat, lon]) => {
    L.circleMarker([lat, lon], {
      radius: 8,
      color: '#1F3A2E',
      weight: 2,
      fillColor: '#D4AF37',
      fillOpacity: 1
    })
      .addTo(map)
      .bindTooltip(name, { className: 'city-tooltip', direction: 'top', offset: [0, -6] });
  });

  const shopMarker = L.circleMarker(shop, {
    radius: 9,
    color: '#D4AF37',
    weight: 3,
    fillColor: '#142822',
    fillOpacity: 1
  }).addTo(map);
  shopMarker.bindTooltip(
    '<a href="https://share.google/K1XaUEQSZYnH6Ug1w" target="_blank" rel="noopener">Toast Bouquets</a>',
    { className: 'shop-tooltip', direction: 'top', offset: [0, -8], permanent: true, interactive: true }
  );

  const bounds = L.latLngBounds(cities.map((c) => [c[1], c[2]]).concat([shop]));

  // Add a reset button directly into the existing zoom control group so it's
  // visually seamless with +/- instead of a separate floating box.
  const zoomContainer = map.zoomControl.getContainer();
  const resetBtn = L.DomUtil.create('a', 'leaflet-control-zoom-reset', zoomContainer);
  resetBtn.href = '#';
  resetBtn.title = 'Reset view';
  resetBtn.innerHTML = '&#8634;';
  L.DomEvent.on(resetBtn, 'click', (e) => {
    L.DomEvent.preventDefault(e);
    map.fitBounds(bounds, { padding: [40, 40] });
  });

  map.fitBounds(bounds, { padding: [40, 40] });
}

const lightbox = document.getElementById('lightbox');
if (lightbox) {
  const cards = Array.from(document.querySelectorAll('.cat-card'));
  const lbImg = document.getElementById('lbImg');
  const lbCap = document.getElementById('lbCap');
  const lbCount = document.getElementById('lbCount');
  let gallery = [];
  let current = 0;

  const parseImages = (str) => {
    if (!str) return [];
    return str.split(';').map((s) => {
      const [full, cap] = s.split('|');
      return { full: full.trim(), cap: (cap || '').trim() };
    });
  };

  const preloaded = {};
  const preload = (src) => {
    if (preloaded[src]) return;
    const im = new Image();
    im.src = src;
    preloaded[src] = im;
  };

  const show = (i) => {
    if (!gallery.length) return;
    current = (i + gallery.length) % gallery.length;
    const entry = gallery[current];
    lbCap.textContent = entry.cap;
    lbCount.textContent = gallery.length > 1 ? (current + 1) + ' / ' + gallery.length : '';

    const swap = () => {
      lbImg.src = entry.full;
      lbImg.classList.remove('lb-loading');
    };
    if (preloaded[entry.full] && preloaded[entry.full].complete) {
      swap();
    } else {
      lbImg.classList.add('lb-loading');
      const im = preloaded[entry.full] || new Image();
      im.src = entry.full;
      preloaded[entry.full] = im;
      im.onload = () => { if (gallery[current] === entry) swap(); };
    }

    // preload neighbors so next/prev clicks feel instant
    preload(gallery[(current + 1) % gallery.length].full);
    preload(gallery[(current - 1 + gallery.length) % gallery.length].full);
  };

  const open = (imgs) => {
    gallery = imgs;
    if (!gallery.length) return;
    imgs.forEach((g) => preload(g.full));
    show(0);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lb-open');
  };

  const close = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lb-open');
  };

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const imgs = parseImages(card.getAttribute('data-images'));
      if (imgs.length) open(imgs);
    });
  });

  document.getElementById('lbClose').addEventListener('click', close);
  document.getElementById('lbNext').addEventListener('click', () => show(current + 1));
  document.getElementById('lbPrev').addEventListener('click', () => show(current - 1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') show(current + 1);
    else if (e.key === 'ArrowLeft') show(current - 1);
  });
}
