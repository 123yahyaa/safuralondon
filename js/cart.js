/* ============================================================
   SAFURA LONDON — Cart
   ============================================================ */

const CART_KEY = 'safura_cart';

let cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getCartCount() {
  return cart.reduce((n, i) => n + i.qty, 0);
}

function getCartTotal() {
  return cart.reduce((t, i) => t + i.price * i.qty, 0);
}

function addToCart(product, size) {
  const key = `${product.slug}_${size}`;
  const existing = cart.find(i => i.key === key);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ key, slug: product.slug, name: product.name, arabic: product.arabic, size, price: product.price, color: product.color, accentColor: product.accentColor, qty: 1 });
  }
  saveCart();
  updateCartUI();
  showToast(`<span class="toast-gold">${product.name}</span> — size ${size} added to your bag`);
}

function removeFromCart(key) {
  cart = cart.filter(i => i.key !== key);
  saveCart();
  updateCartUI();
  renderCartItems();
}

function updateCartUI() {
  const count = getCartCount();
  const countEl = document.getElementById('cart-count');
  if (countEl) {
    countEl.textContent = count;
    countEl.classList.toggle('visible', count > 0);
  }
}

function renderCartItems() {
  const container = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">◻</div>
        <p>Your bag is empty.<br>Discover our collections.</p>
        <a href="collections.html" class="btn btn-outline-gold" style="margin-top:1rem;font-size:0.65rem">Explore Collections</a>
      </div>`;
    if (totalEl) totalEl.style.display = 'none';
    return;
  }

  if (totalEl) totalEl.style.display = 'flex';

  container.innerHTML = cart.map(item => {
    const priceDisplay = typeof convertPrice !== 'undefined'
      ? convertPrice(item.price).formatted
      : `£${item.price}`;
    return `
    <div class="cart-item">
      <div class="cart-item-swatch" style="background:${item.color}">
        <svg viewBox="0 0 180 320" xmlns="http://www.w3.org/2000/svg" fill="${item.accentColor}" style="width:55%;opacity:0.35">
          <ellipse cx="90" cy="30" rx="22" ry="28"/>
          <path d="M 60 55 Q 55 70 50 85 L 10 160 L 25 165 L 55 105 L 55 320 L 125 320 L 125 105 L 155 165 L 170 160 L 130 85 Q 125 70 120 55 Z"/>
        </svg>
      </div>
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <div class="size">Size ${item.size}</div>
        <div class="price" data-gbp-price="${item.price}">${priceDisplay}</div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart('${item.key}')" aria-label="Remove">✕</button>
    </div>`;
  }).join('');

  if (totalEl) {
    const total = getCartTotal();
    const totalDisplay = typeof convertPrice !== 'undefined'
      ? convertPrice(total).formatted
      : `£${total}`;
    document.getElementById('cart-total-amount').textContent = totalDisplay;
  }
}

function openCart() {
  renderCartItems();
  document.getElementById('cart-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cart-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function initCart() {
  updateCartUI();

  const cartBtn = document.getElementById('cart-btn');
  if (cartBtn) cartBtn.addEventListener('click', openCart);

  const cartOverlay = document.getElementById('cart-overlay');
  if (cartOverlay) {
    cartOverlay.addEventListener('click', (e) => {
      if (e.target === cartOverlay) closeCart();
    });
  }

  const cartClose = document.getElementById('cart-close');
  if (cartClose) cartClose.addEventListener('click', closeCart);

  document.addEventListener('currencyChange', () => {
    renderCartItems();
  });
}
