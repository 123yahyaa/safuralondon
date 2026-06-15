/* ============================================================
   SAFURA LONDON — Stripe Integration Stub
   Replace STRIPE_PUBLIC_KEY and activate stripeCheckout()
   when payments go live.
   ============================================================ */

const STRIPE_PUBLIC_KEY = 'pk_test_REPLACE_WITH_YOUR_STRIPE_PUBLIC_KEY';

/* Show "coming soon" checkout modal */
function openCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

/*
  When Stripe is live, replace openCheckoutModal() with:

  async function stripeCheckout() {
    const stripe = Stripe(STRIPE_PUBLIC_KEY);
    const cartItems = JSON.parse(localStorage.getItem('safura_cart') || '[]');
    const currency = localStorage.getItem('safura_currency') || 'gbp';

    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cartItems, currency }),
    });
    const { sessionId } = await response.json();
    const { error } = await stripe.redirectToCheckout({ sessionId });
    if (error) console.error(error);
  }
*/

function initStripe() {
  const checkoutBtns = document.querySelectorAll('[data-action="checkout"]');
  checkoutBtns.forEach(btn => {
    btn.addEventListener('click', openCheckoutModal);
  });

  const modalClose = document.getElementById('checkout-modal-close');
  if (modalClose) modalClose.addEventListener('click', closeCheckoutModal);

  const modalOverlay = document.getElementById('checkout-modal');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeCheckoutModal();
    });
  }

  const notifyBtn = document.getElementById('notify-launch-btn');
  if (notifyBtn) {
    notifyBtn.addEventListener('click', () => {
      const email = document.getElementById('notify-email')?.value;
      if (email) {
        showToast(`We'll notify <span class="toast-gold">${email}</span> when checkout goes live`);
        closeCheckoutModal();
      }
    });
  }
}
