/* ============================================================
   SAFURA LONDON — Currency Detection & Conversion
   ============================================================ */

const CURRENCIES = {
  GBP: { symbol: '£',    code: 'GBP', name: 'British Pound',   rate: 1.00,  flag: '🇬🇧' },
  USD: { symbol: '$',    code: 'USD', name: 'US Dollar',        rate: 1.27,  flag: '🇺🇸' },
  EUR: { symbol: '€',    code: 'EUR', name: 'Euro',             rate: 1.17,  flag: '🇪🇺' },
  AED: { symbol: 'د.إ', code: 'AED', name: 'UAE Dirham',       rate: 4.66,  flag: '🇦🇪' },
  SAR: { symbol: '﷼',   code: 'SAR', name: 'Saudi Riyal',      rate: 4.76,  flag: '🇸🇦' },
  KWD: { symbol: 'K.D.',code: 'KWD', name: 'Kuwaiti Dinar',    rate: 0.39,  flag: '🇰🇼' },
  QAR: { symbol: 'QR',  code: 'QAR', name: 'Qatari Riyal',     rate: 4.62,  flag: '🇶🇦' },
  CAD: { symbol: 'C$',  code: 'CAD', name: 'Canadian Dollar',  rate: 1.73,  flag: '🇨🇦' },
  AUD: { symbol: 'A$',  code: 'AUD', name: 'Australian Dollar',rate: 1.95,  flag: '🇦🇺' },
  MYR: { symbol: 'RM',  code: 'MYR', name: 'Malaysian Ringgit',rate: 5.86,  flag: '🇲🇾' },
};

const COUNTRY_TO_CURRENCY = {
  GB: 'GBP', IE: 'EUR', DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR',
  NL: 'EUR', BE: 'EUR', AT: 'EUR', PT: 'EUR', GR: 'EUR', FI: 'EUR',
  US: 'USD', PR: 'USD',
  AE: 'AED', SA: 'SAR', KW: 'KWD', QA: 'QAR', BH: 'AED', OM: 'AED',
  CA: 'CAD', AU: 'AUD', MY: 'MYR',
};

const CURRENCY_KEY = 'safura_currency';

let activeCurrency = localStorage.getItem(CURRENCY_KEY) || 'GBP';

/* ---- Auto-detect country via IP ---- */
async function detectCurrency() {
  const saved = localStorage.getItem(CURRENCY_KEY);
  if (saved && CURRENCIES[saved]) {
    activeCurrency = saved;
    return;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeout);
    const data = await res.json();
    const country = data.country_code || 'GB';
    activeCurrency = COUNTRY_TO_CURRENCY[country] || 'GBP';
  } catch {
    activeCurrency = 'GBP';
  }
}

/* ---- Convert a GBP price ---- */
function convertPrice(gbpPrice) {
  const cur = CURRENCIES[activeCurrency];
  if (!cur) return { formatted: `£${gbpPrice}`, raw: gbpPrice, currency: CURRENCIES.GBP };
  const converted = gbpPrice * cur.rate;
  const formatted = formatPrice(converted, cur);
  return { formatted, raw: converted, currency: cur };
}

function formatPrice(amount, cur) {
  const decimals = ['KWD'].includes(cur.code) ? 3 : 0;
  const num = amount.toFixed(decimals);
  const parts = num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (['AED','SAR','QAR'].includes(cur.code)) return `${parts} ${cur.symbol}`;
  return `${cur.symbol}${parts}`;
}

function setCurrency(code) {
  if (!CURRENCIES[code]) return;
  activeCurrency = code;
  localStorage.setItem(CURRENCY_KEY, code);
  document.dispatchEvent(new CustomEvent('currencyChange', { detail: { code } }));
  refreshAllPrices();
}

function getActiveCurrency() { return CURRENCIES[activeCurrency] || CURRENCIES.GBP; }

/* ---- Refresh price elements on page ---- */
function refreshAllPrices() {
  document.querySelectorAll('[data-gbp-price]').forEach(el => {
    const gbp = parseFloat(el.dataset.gbpPrice);
    if (!isNaN(gbp)) el.textContent = convertPrice(gbp).formatted;
  });
}

/* ---- Build currency dropdown ---- */
function buildCurrencyDropdown(btnEl, dropEl) {
  if (!dropEl) return;
  dropEl.innerHTML = '';
  Object.values(CURRENCIES).forEach(cur => {
    const opt = document.createElement('div');
    opt.className = `currency-option${cur.code === activeCurrency ? ' active' : ''}`;
    opt.dataset.code = cur.code;
    opt.innerHTML = `<span>${cur.name}</span><span class="sym">${cur.symbol}</span>`;
    opt.addEventListener('click', () => {
      setCurrency(cur.code);
      dropEl.querySelectorAll('.currency-option').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      updateCurrencyBtn(btnEl);
      toggleDropdown(btnEl, dropEl, false);
    });
    dropEl.appendChild(opt);
  });
  updateCurrencyBtn(btnEl);
}

function updateCurrencyBtn(btnEl) {
  if (!btnEl) return;
  const cur = getActiveCurrency();
  const span = btnEl.querySelector('.cur-label');
  if (span) span.textContent = cur.code;
}

function toggleDropdown(btnEl, dropEl, force) {
  const isOpen = typeof force === 'boolean' ? force : !dropEl.classList.contains('open');
  dropEl.classList.toggle('open', isOpen);
  btnEl.classList.toggle('open', isOpen);
}

/* ---- Init ---- */
async function initCurrency() {
  await detectCurrency();
  const btnEl = document.getElementById('currency-btn');
  const dropEl = document.getElementById('currency-dropdown');
  if (btnEl && dropEl) {
    buildCurrencyDropdown(btnEl, dropEl);
    btnEl.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown(btnEl, dropEl);
    });
    document.addEventListener('click', () => toggleDropdown(btnEl, dropEl, false));
    dropEl.addEventListener('click', e => e.stopPropagation());
  }
  refreshAllPrices();
}
