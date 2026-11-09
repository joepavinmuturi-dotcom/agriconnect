/* AgriConnect front end */
const $ = (s, r = document) => r.querySelector(s);
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "\"": '&quot;', "'": '&#39;' };
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ESC[c]);
const money = (n) => 'KES ' + Number(n).toFixed(2);
const EMAIL_RE = /^[^@ ]+@[^@ ]+[.][^@ ]+$/;
let me = null;

async function api(url, opts = {}) {
  const init = { credentials: 'same-origin', ...opts };
  if (opts.body && !(opts.body instanceof FormData)) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(opts.body);
  }
  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

const getCart = () => { try { return JSON.parse(localStorage.getItem('cart')) || []; } catch (e) { return []; } };
const saveCart = (c) => localStorage.setItem('cart', JSON.stringify(c));
function addToCart(p, qty) {
  const cart = getCart();
  const line = cart.find((l) => l.id === p.id);
  if (line) line.qty = Math.min(line.qty + qty, p.quantity);
  else cart.push({ id: p.id, name: p.name, price: p.price, unit: p.unit, max: p.quantity, qty });
  saveCart(cart);
}

function showMsg(el, text, ok) { el.className = 'msg ' + (ok ? 'ok' : 'err'); el.textContent = text; }

function needLogin(role) {
  if (!me) { location.href = 'login.html'; return false; }
  if (role && me.role !== role) { location.href = 'index.html'; return false; }
  return true;
}

function card(p) {
  const img = p.photo ? `<img src='uploads/${esc(p.photo)}' alt='${esc(p.name)}'>` : `<div class='ph'>🥬</div>`;
  return `<div class='card'>${img}<div class='body'><strong>${esc(p.name)}</strong>
    <span class='muted'>${esc(p.category)} · ${esc(p.location || 'Kenya')}</span>
    <span class='price'>${money(p.price)} / ${esc(p.unit)}</span>
    <span class='muted'>Farmer: ${esc(p.farmer)} · ${p.quantity} ${esc(p.unit)} left</span>
    <a class='btn small' href='product.html?id=${p.id}'>View details</a></div></div>`;
}

const tbl = (heads, rows) => rows.length
  ? `<div class='table-wrap'><table><tr>${heads.map((h) => `<th>${h}</th>`).join('')}</tr>${rows.join('')}</table></div>`
  : `<p class='muted'>Nothing here yet.</p>`;

const NAV = [['index.html', 'Home'], ['catalogue.html', 'Catalogue'], ['farmers.html', 'Farmers'], ['about.html', 'About Us'], ['contact.html', 'Contact Us']];

async function loadLayout() {
  try { me = (await api('/api/auth/me')).user; } catch (e) { me = null; }
  let html = NAV.map(([h, t]) => `<a href='${h}'>${t}</a>`).join('');
  if (!me) html += `<a href='cart.html'>Cart</a><a href='login.html'>Login</a><a href='register.html'>Register</a>`;
  else {
    if (me.role === 'buyer') html += `<a href='cart.html'>Cart</a><a href='orders.html'>My Orders</a>`;
    if (me.role === 'farmer') html += `<a href='farmer.html'>My Produce</a>`;
    if (me.role === 'admin') html += `<a href='admin.html'>Dashboard</a>`;
    html += `<a href='#' id='logout'>Logout (${esc(me.name)})</a>`;
  }
  $('#site-header').innerHTML = `<div class='bar'><a class='brand' href='index.html'>🌱 AgriConnect</a><button class='menu-btn' id='menu-btn' type='button'>Menu</button><nav class='links' id='nav-links'>${html}</nav></div>`;
  $('#site-footer').innerHTML = `<p>&copy; 2026 AgriConnect. Connecting smallholder farmers and buyers.</p>`;
  $('#menu-btn').addEventListener('click', () => $('#nav-links').classList.toggle('open'));
  const lo = $('#logout');
  if (lo) lo.addEventListener('click', async (e) => {
    e.preventDefault();
    await api('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('cart');
    location.href = 'index.html';
  });
}

const pages = {};

pages.home = async () => {
  const [list, cats] = await Promise.all([api('/api/produce'), api('/api/categories')]);
  $('#featured').innerHTML = list.length ? list.slice(0, 4).map(card).join('') : '<p>No produce listed yet. Check back soon.</p>';
  $('#cats').innerHTML = cats.map((c) => `<a class='btn small amber' href='catalogue.html?category=${c.id}'>${esc(c.name)}</a>`).join(' ');
};

pages.catalogue = async () => {
  const cats = await api('/api/categories');
  $('#category').innerHTML = `<option value=''>All categories</option>` + cats.map((c) => `<option value='${c.id}'>${esc(c.name)}</option>`).join('');
  const q = new URLSearchParams(location.search);
  $('#search').value = q.get('search') || '';
  $('#category').value = q.get('category') || '';
  $('#max').value = q.get('max') || '';
  const run = async () => {
    const p = new URLSearchParams();
    if ($('#search').value.trim()) p.set('search', $('#search').value.trim());
    if ($('#category').value) p.set('category', $('#category').value);
    if ($('#max').value) p.set('max', $('#max').value);
    if (q.get('farmer')) p.set('farmer', q.get('farmer'));
    const list = await api('/api/produce?' + p);
    $('#results').innerHTML = list.length ? list.map(card).join('') : '<p>No produce matches your search.</p>';
  };
  $('#filters').addEventListener('submit', (e) => { e.preventDefault(); run(); });
  run();
};

pages.product = async () => {
  const id = new URLSearchParams(location.search).get('id');
  try {
    const p = await api('/api/produce/' + encodeURIComponent(id));
    const img = p.photo ? `<img src='uploads/${esc(p.photo)}' alt='${esc(p.name)}'>` : `<div class='ph tall'>🥬</div>`;
    $('#detail').innerHTML = `<div class='detail'><div>${img}</div><div>
      <h1>${esc(p.name)}</h1><p class='muted'>${esc(p.category)} · ${esc(p.location || 'Kenya')}</p>
      <p class='price'>${money(p.price)} per ${esc(p.unit)}</p><p>Farmer: ${esc(p.farmer)}</p>
      <p>In stock: ${p.quantity} ${esc(p.unit)}</p><p>${esc(p.description)}</p>
      <label for='qty'>Quantity</label><input id='qty' type='number' min='1' max='${p.quantity}' value='1'>
      <p><button class='btn' id='add' type='button'>Add to cart</button></p><div id='msg'></div></div></div>`;
    $('#add').addEventListener('click', () => {
      const qty = parseInt($('#qty').value, 10);
      if (!qty || qty < 1 || qty > p.quantity) return showMsg($('#msg'), 'Enter a quantity between 1 and ' + p.quantity, false);
      if (me && me.role !== 'buyer') return showMsg($('#msg'), 'Only buyers can order produce', false);
      addToCart(p, qty);
      showMsg($('#msg'), 'Added to cart', true);
    });
  } catch (e) { $('#detail').innerHTML = `<p class='msg err'>${esc(e.message)}</p>`; }
};

pages.farmers = async () => {
  const list = await api('/api/farmers');
  $('#farmers').innerHTML = list.length ? list.map((f) => `<div class='card'><div class='body'>
    <strong>${esc(f.name)}</strong><span class='muted'>${esc(f.location || 'Kenya')}</span>
    <p>${esc(f.bio || 'Smallholder farmer')}</p><span class='muted'>${f.listings} active listings</span>
    <a class='btn small' href='catalogue.html?farmer=${f.id}'>View produce</a></div></div>`).join('') : '<p>No farmers yet.</p>';
};

pages.contact = () => {
  $('#form').addEventListener('submit', (e) => {
    e.preventDefault();
    const b = Object.fromEntries(new FormData(e.target));
    if (b.name.trim().length < 2 || !EMAIL_RE.test(b.email) || b.message.trim().length < 10) {
      return showMsg($('#msg'), 'Enter your name, a valid email and a message of 10+ characters', false);
    }
    showMsg($('#msg'), 'Thank you. We will reply soon.', true);
    e.target.reset();
  });
};

function validateRegister(b) {
  if (b.name.trim().length < 2) return 'Enter your full name';
  if (!EMAIL_RE.test(b.email)) return 'Enter a valid email address';
  if (b.password.length < 8 || !/[A-Za-z]/.test(b.password) || !/[0-9]/.test(b.password)) return 'Password needs 8+ characters with a letter and a number';
  if (b.password !== b.confirm) return 'Passwords do not match';
  if (!['farmer', 'buyer'].includes(b.role)) return 'Choose Farmer or Buyer';
  return '';
}

pages.register = () => {
  $('#form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const b = Object.fromEntries(new FormData(e.target));
    const problem = validateRegister(b);
    if (problem) return showMsg($('#msg'), problem, false);
    try {
      const r = await api('/api/auth/register', { method: 'POST', body: b });
      showMsg($('#msg'), r.message, true);
      e.target.reset();
    } catch (err) { showMsg($('#msg'), err.message, false); }
  });
};

pages.login = () => {
  $('#form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const b = Object.fromEntries(new FormData(e.target));
    if (!b.email || !b.password) return showMsg($('#msg'), 'Enter your email and password', false);
    try {
      const { user } = await api('/api/auth/login', { method: 'POST', body: b });
      location.href = user.role === 'admin' ? 'admin.html' : user.role === 'farmer' ? 'farmer.html' : 'catalogue.html';
    } catch (err) { showMsg($('#msg'), err.message, false); }
  });
};

pages.cart = () => {
  const draw = () => {
    const cart = getCart();
    if (!cart.length) { $('#cart').innerHTML = `<p>Your cart is empty. <a href='catalogue.html'>Browse produce</a></p>`; return; }
    const total = cart.reduce((s, l) => s + l.price * l.qty, 0);
    $('#cart').innerHTML = tbl(['Item', 'Price', 'Qty', 'Subtotal', ''], cart.map((l) =>
      `<tr><td>${esc(l.name)}</td><td>${money(l.price)}</td>
       <td><input class='qty' type='number' min='1' max='${l.max}' value='${l.qty}' data-id='${l.id}'></td>
       <td>${money(l.price * l.qty)}</td>
       <td><button class='btn small danger rm' data-id='${l.id}' type='button'>Remove</button></td></tr>`))
      + `<h3>Total: ${money(total)}</h3><button class='btn' id='place' type='button'>Place order</button>`;
  };
  $('#cart').addEventListener('click', async (e) => {
    if (e.target.classList.contains('rm')) {
      saveCart(getCart().filter((l) => String(l.id) !== e.target.dataset.id));
      draw();
    }
    if (e.target.id === 'place') {
      if (!me) { location.href = 'login.html'; return; }
      if (me.role !== 'buyer') return showMsg($('#msg'), 'Only buyers can place orders', false);
      try {
        const r = await api('/api/orders', { method: 'POST', body: { items: getCart().map((l) => ({ produce_id: l.id, quantity: l.qty })) } });
        localStorage.removeItem('cart');
        location.href = 'receipt.html?id=' + r.id;
      } catch (err) { showMsg($('#msg'), err.message, false); }
    }
  });
  $('#cart').addEventListener('change', (e) => {
    if (!e.target.classList.contains('qty')) return;
    const cart = getCart();
    const line = cart.find((x) => String(x.id) === e.target.dataset.id);
    const v = parseInt(e.target.value, 10);
    if (line && v >= 1 && v <= line.max) line.qty = v;
    saveCart(cart);
    draw();
  });
  draw();
};

pages.orders = async () => {
  if (!needLogin()) return;
  const list = await api('/api/orders');
  $('#orders').innerHTML = tbl(['#', 'Date', 'Total', 'Status', ''], list.map((o) =>
    `<tr><td>${o.id}</td><td>${esc(o.created_at)}</td><td>${money(o.total)}</td><td><span class='badge'>${esc(o.status)}</span></td><td><a href='receipt.html?id=${o.id}'>Receipt</a></td></tr>`));
};

pages.receipt = async () => {
  if (!needLogin()) return;
  $('#print').addEventListener('click', () => window.print());
  try {
    const o = await api('/api/orders/' + encodeURIComponent(new URLSearchParams(location.search).get('id')));
    $('#receipt').innerHTML = `<h2>AgriConnect Order Receipt</h2>
      <p>Order #${o.id} · ${esc(o.created_at)}<br>Buyer: ${esc(o.buyer)} (${esc(o.buyer_email)})<br>Status: ${esc(o.status)}</p>
      ${tbl(['Item', 'Qty', 'Unit price', 'Subtotal'], o.items.map((i) =>
        `<tr><td>${esc(i.name)}</td><td>${i.quantity} ${esc(i.unit)}</td><td>${money(i.unit_price)}</td><td>${money(i.unit_price * i.quantity)}</td></tr>`))}
      <h3>Total: ${money(o.total)}</h3><p class='muted'>Thank you for buying directly from farmers.</p>`;
  } catch (e) { $('#receipt').innerHTML = `<p class='msg err'>${esc(e.message)}</p>`; }
};

pages.farmer = async () => {
  if (!needLogin('farmer')) return;
  const form = $('#form');
  const setF = (n, v) => { form.elements.namedItem(n).value = v; };
  const cats = await api('/api/categories');
  $('#category').innerHTML = cats.map((c) => `<option value='${c.id}'>${esc(c.name)}</option>`).join('');
  let editing = null;
  let mine = [];
  const load = async () => {
    mine = await api('/api/my/produce');
    $('#mine').innerHTML = tbl(['Name', 'Price', 'Qty', 'Status', ''], mine.map((p) =>
      `<tr><td>${esc(p.name)}</td><td>${money(p.price)}</td><td>${p.quantity} ${esc(p.unit)}</td>
       <td><span class='badge'>${p.approved ? 'Approved' : 'Pending approval'}</span></td>
       <td><button class='btn small edit' data-id='${p.id}' type='button'>Edit</button>
           <button class='btn small danger del' data-id='${p.id}' type='button'>Remove</button></td></tr>`));
  };
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const price = Number(form.elements.namedItem('price').value);
    const qty = Number(form.elements.namedItem('quantity').value);
    if (form.elements.namedItem('name').value.trim().length < 2) return showMsg($('#msg'), 'Enter the produce name', false);
    if (!(price > 0)) return showMsg($('#msg'), 'Price must be greater than 0', false);
    if (!Number.isInteger(qty) || qty < 0) return showMsg($('#msg'), 'Quantity must be a whole number, 0 or more', false);
    try {
      const r = await api(editing ? '/api/produce/' + editing : '/api/produce', { method: editing ? 'PUT' : 'POST', body: new FormData(form) });
      showMsg($('#msg'), r.message, true);
      form.reset();
      editing = null;
      $('#save').textContent = 'Save listing';
      load();
    } catch (err) { showMsg($('#msg'), err.message, false); }
  });
  $('#mine').addEventListener('click', async (e) => {
    const id = e.target.dataset.id;
    if (!id) return;
    if (e.target.classList.contains('del') && confirm('Remove this listing?')) {
      try { await api('/api/produce/' + id, { method: 'DELETE' }); load(); } catch (err) { showMsg($('#msg'), err.message, false); }
    }
    if (e.target.classList.contains('edit')) {
      const p = mine.find((x) => String(x.id) === id);
      if (!p) return;
      editing = p.id;
      ['name', 'price', 'quantity', 'unit', 'location', 'description'].forEach((k) => setF(k, p[k] == null ? '' : p[k]));
      setF('category_id', p.category_id);
      $('#save').textContent = 'Update listing';
      window.scrollTo(0, 0);
    }
  });
  load();
};

pages.admin = async () => {
  if (!needLogin('admin')) return;
  const FLOW = ['Placed', 'Confirmed', 'Dispatched', 'Delivered'];
  const load = async () => {
    const [s, farmers, produce, orders] = await Promise.all([
      api('/api/admin/stats'), api('/api/admin/farmers'), api('/api/admin/produce'), api('/api/orders')]);
    const stat = (k, v) => `<div class='card'><div class='body'><span class='muted'>${k}</span><span class='price'>${v}</span></div></div>`;
    $('#admin').innerHTML = `<div class='grid'>${stat('Farmers', s.farmers)}${stat('Pending farmers', s.pendingFarmers)}${stat('Buyers', s.buyers)}${stat('Pending listings', s.pendingListings)}${stat('Orders', s.orders)}</div>
      <h2>Farmer accounts</h2>${tbl(['Name', 'Email', 'Location', 'Status', ''], farmers.map((f) =>
        `<tr><td>${esc(f.name)}</td><td>${esc(f.email)}</td><td>${esc(f.location)}</td><td><span class='badge'>${f.approved ? 'Approved' : 'Pending'}</span></td>
         <td><button class='btn small' data-act='farmer' data-id='${f.id}' data-val='${f.approved ? 0 : 1}' type='button'>${f.approved ? 'Suspend' : 'Approve'}</button></td></tr>`))}
      <h2>Produce listings</h2>${tbl(['Produce', 'Farmer', 'Price', 'Qty', 'Status', ''], produce.map((p) =>
        `<tr><td>${esc(p.name)}</td><td>${esc(p.farmer)}</td><td>${money(p.price)}</td><td>${p.quantity}</td><td><span class='badge'>${p.approved ? 'Approved' : 'Pending'}</span></td>
         <td><button class='btn small' data-act='produce' data-id='${p.id}' data-val='${p.approved ? 0 : 1}' type='button'>${p.approved ? 'Hide' : 'Approve'}</button></td></tr>`))}
      <h2>Orders</h2>${tbl(['#', 'Buyer', 'Total', 'Status', 'Action', ''], orders.map((o) => {
        const next = FLOW[FLOW.indexOf(o.status) + 1];
        return `<tr><td>${o.id}</td><td>${esc(o.buyer)}</td><td>${money(o.total)}</td><td><span class='badge'>${esc(o.status)}</span></td>
         <td>${next ? `<button class='btn small' data-act='status' data-id='${o.id}' data-next='${next}' type='button'>Mark ${next}</button>` : 'Complete'}</td>
         <td><a href='receipt.html?id=${o.id}'>Receipt</a></td></tr>`;
      }))}`;
  };
  $('#admin').addEventListener('click', async (e) => {
    const b = e.target.closest('button[data-act]');
    if (!b) return;
    const { act, id, val, next } = b.dataset;
    try {
      if (act === 'farmer') await api('/api/admin/farmers/' + id + '/approve', { method: 'PUT', body: { approved: val === '1' } });
      if (act === 'produce') await api('/api/admin/produce/' + id + '/approve', { method: 'PUT', body: { approved: val === '1' } });
      if (act === 'status') await api('/api/orders/' + id + '/status', { method: 'PUT', body: { status: next } });
      load();
    } catch (err) { showMsg($('#msg'), err.message, false); }
  });
  load();
};

document.addEventListener('DOMContentLoaded', async () => {
  await loadLayout();
  const run = pages[document.body.dataset.page];
  if (run) { try { await run(); } catch (e) { console.error(e); } }
});