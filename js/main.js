/* ============================================================
   SAFURA LONDON — Main Application
   ============================================================ */

/* ---- Toast Notification ---- */
function showToast(html, duration = 3200) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = html;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
}

/* ---- Navigation ---- */
function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  const toggle = document.getElementById('menu-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('mobile-open');
      document.body.style.overflow = links.classList.contains('mobile-open') ? 'hidden' : '';
    });
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('mobile-open');
        document.body.style.overflow = '';
      });
    });
  }
}

/* ---- Scroll Reveal ---- */
function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ---- FAQ Accordion ---- */
function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

/* ---- Newsletter form ---- */
function initNewsletter() {
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input && input.value) {
        showToast(`Thank you — you're on the Safura <span class="toast-gold">early access</span> list`);
        input.value = '';
      }
    });
  });
}

/* ---- Product Swatch Renderer ---- */
function createSwatch(product) {
  const swatch = document.createElement('div');
  swatch.className = 'product-swatch';
  swatch.style.background = product.color;
  swatch.innerHTML = `
    <div class="product-swatch-inner">
      <svg viewBox="0 0 180 320" xmlns="http://www.w3.org/2000/svg" fill="${product.accentColor}">
        <ellipse cx="90" cy="30" rx="22" ry="28"/>
        <path d="M 60 55 Q 55 70 50 85 L 10 160 L 25 165 L 55 105 L 55 320 L 125 320 L 125 105 L 155 165 L 170 160 L 130 85 Q 125 70 120 55 Z"/>
      </svg>
    </div>`;
  return swatch;
}

/* ---- Build a Product Card ---- */
function buildProductCard(product) {
  const priceDisplay = typeof convertPrice !== 'undefined'
    ? convertPrice(product.price).formatted
    : `£${product.price}`;

  const card = document.createElement('a');
  card.className = 'product-card reveal';
  card.href = `product.html?id=${product.slug}`;
  card.setAttribute('aria-label', `View ${product.name} Abaya`);

  card.innerHTML = `
    <div class="product-img-wrap">
      <div class="product-swatch" style="background:${product.color};transition:transform 0.7s var(--ease)">
        <div class="product-swatch-inner">
          <svg viewBox="0 0 180 320" xmlns="http://www.w3.org/2000/svg" fill="${product.accentColor}">
            <ellipse cx="90" cy="30" rx="22" ry="28"/>
            <path d="M 60 55 Q 55 70 50 85 L 10 160 L 25 165 L 55 105 L 55 320 L 125 320 L 125 105 L 155 165 L 170 160 L 130 85 Q 125 70 120 55 Z"/>
          </svg>
        </div>
      </div>
      ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
      <div class="product-quick-add">
        <a href="product.html?id=${product.slug}" class="btn btn-outline-gold btn-full" style="font-size:0.62rem">View Collection</a>
      </div>
    </div>
    <div class="product-info">
      <div class="product-collection">Safura London</div>
      <h3 class="product-name">${product.name}</h3>
      <div class="product-meaning">${product.arabic} — ${product.meaning}</div>
      <div class="product-price" data-gbp-price="${product.price}">${priceDisplay}</div>
    </div>`;

  document.addEventListener('currencyChange', () => {
    const priceEl = card.querySelector('[data-gbp-price]');
    if (priceEl) priceEl.textContent = convertPrice(product.price).formatted;
  });

  return card;
}

/* ---- Common Page Init ---- */
async function initPage() {
  initNav();
  initReveal();
  initFAQ();
  initNewsletter();

  if (typeof initCurrency !== 'undefined') await initCurrency();
  if (typeof initCart !== 'undefined') initCart();
  if (typeof initStripe !== 'undefined') initStripe();
}

document.addEventListener('DOMContentLoaded', initPage);
