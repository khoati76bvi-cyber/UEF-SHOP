const VND = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

const defaultProducts = [
  { id: 1, name: 'Áo thun Oversized Essential', category: 'Áo', price: 329000, oldPrice: 399000, stock: 24, badge: 'Bán chạy', sprite: [0, 0], color: 'Kem', sizes: ['S', 'M', 'L', 'XL'], visible: true, description: 'Áo thun cotton 240gsm, phom rộng hiện đại và bề mặt vải mềm mịn.' },
  { id: 2, name: 'Áo khoác Denim Black', category: 'Áo khoác', price: 899000, oldPrice: 1099000, stock: 12, badge: 'Mới', sprite: [33.333, 0], color: 'Đen', sizes: ['M', 'L', 'XL'], visible: true, description: 'Denim dày vừa, xử lý wash đen và đường may chắc chắn cho phong cách đường phố.' },
  { id: 3, name: 'Quần Jeans Straight Blue', category: 'Quần', price: 679000, oldPrice: null, stock: 18, badge: '', sprite: [66.666, 0], color: 'Xanh', sizes: ['28', '29', '30', '31', '32'], visible: true, description: 'Quần jeans ống suông, cạp vừa và chất vải có độ co giãn nhẹ.' },
  { id: 4, name: 'Đầm Midi Emerald', category: 'Đầm', price: 749000, oldPrice: 899000, stock: 8, badge: 'Giới hạn', sprite: [100, 0], color: 'Xanh lá', sizes: ['S', 'M', 'L'], visible: true, description: 'Đầm midi tay phồng, thân váy rủ tự nhiên và sắc xanh nổi bật.' },
  { id: 5, name: 'Hoodie Everyday Beige', category: 'Áo', price: 629000, oldPrice: null, stock: 20, badge: '', sprite: [0, 100], color: 'Be', sizes: ['S', 'M', 'L', 'XL'], visible: true, description: 'Hoodie nỉ bông thoáng ấm, form unisex và túi kangaroo tiện dụng.' },
  { id: 6, name: 'Sneaker Minimal White', category: 'Giày', price: 1099000, oldPrice: 1299000, stock: 10, badge: 'Hot', sprite: [33.333, 100], color: 'Trắng', sizes: ['37', '38', '39', '40', '41', '42'], visible: true, description: 'Sneaker da tổng hợp tối giản, đế êm và dễ phối với nhiều phong cách.' },
  { id: 7, name: 'Túi Crossbody Leather', category: 'Phụ kiện', price: 589000, oldPrice: null, stock: 16, badge: '', sprite: [66.666, 100], color: 'Nâu', sizes: ['Một kích cỡ'], visible: true, description: 'Túi đeo chéo dáng gọn với nhiều ngăn và dây đeo điều chỉnh linh hoạt.' },
  { id: 8, name: 'Mũ Cap Washed Charcoal', category: 'Phụ kiện', price: 269000, oldPrice: 319000, stock: 30, badge: '-15%', sprite: [100, 100], color: 'Xám', sizes: ['Một kích cỡ'], visible: true, description: 'Mũ lưỡi trai washed, khóa kim loại phía sau và độ ôm thoải mái.' }
];

const seedOrders = [
  { id: 'UEF-260918', date: '18/09/2026', customer: 'Nguyễn Minh Anh', email: 'user@demo.vn', total: 1008000, status: 'shipped', payment: 'Ví điện tử', items: [{ productId: 1, qty: 1, size: 'M' }, { productId: 5, qty: 1, size: 'L' }] },
  { id: 'UEF-260914', date: '14/09/2026', customer: 'Trần Ngọc Lan', email: 'lan@example.com', total: 1428000, status: 'processing', payment: 'COD', items: [{ productId: 4, qty: 1, size: 'M' }, { productId: 3, qty: 1, size: '29' }] },
  { id: 'UEF-260910', date: '10/09/2026', customer: 'Lê Quốc Bảo', email: 'bao@example.com', total: 1099000, status: 'completed', payment: 'Thẻ ngân hàng', items: [{ productId: 6, qty: 1, size: '41' }] },
  { id: 'UEF-260903', date: '03/09/2026', customer: 'Phạm Hà My', email: 'my@example.com', total: 858000, status: 'canceled', payment: 'COD', items: [{ productId: 1, qty: 1, size: 'S' }, { productId: 7, qty: 1, size: 'Một kích cỡ' }] }
];

const seedUsers = [
  { id: 1, name: 'Nguyễn Minh Anh', email: 'user@demo.vn', joined: '12/08/2026', orders: 3, status: 'active' },
  { id: 2, name: 'Trần Ngọc Lan', email: 'lan@example.com', joined: '22/08/2026', orders: 2, status: 'active' },
  { id: 3, name: 'Lê Quốc Bảo', email: 'bao@example.com', joined: '01/09/2026', orders: 1, status: 'active' },
  { id: 4, name: 'Phạm Hà My', email: 'my@example.com', joined: '02/09/2026', orders: 1, status: 'locked' }
];

function loadStore(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function saveStore(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

let products = loadStore('uef_products', defaultProducts);
let cart = loadStore('uef_cart', []);
let orders = loadStore('uef_orders', seedOrders);
let users = loadStore('uef_users', seedUsers);
let favorites = loadStore('uef_favorites', []);
let session = loadStore('uef_session', null);
let profile = loadStore('uef_profile', { name: 'Nguyễn Minh Anh', email: 'user@demo.vn', phone: '090 123 4567', address: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh' });

let shopState = { search: '', category: 'Tất cả', size: '', saleOnly: false, sort: 'featured' };
let accountTab = 'orders';
let adminTab = 'dashboard';
let adminAddOpen = false;
let pendingAction = null;
let checkoutStep = 1;
let checkoutData = { name: profile.name, phone: profile.phone, address: profile.address, delivery: 'Tiêu chuẩn', payment: 'COD' };
let lastPlacedOrder = null;

const app = document.querySelector('#app');
const overlay = document.querySelector('#overlay');
const cartDrawer = document.querySelector('#cartDrawer');
const cartItemsEl = document.querySelector('#cartItems');
const cartSummaryEl = document.querySelector('#cartSummary');
const authModal = document.querySelector('#authModal');
const productModal = document.querySelector('#productModal');
const checkoutModal = document.querySelector('#checkoutModal');
const toastRegion = document.querySelector('#toastRegion');

const icons = {
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></svg>',
  cart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8Z"></path><path d="M9 10V6a3 3 0 0 1 6 0v4"></path></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M14 7l5 5-5 5"></path></svg>'
};

function spriteStyle(product) { return `background-position:${product.sprite[0]}% ${product.sprite[1]}%`; }
function getProduct(id) { return products.find(p => p.id === Number(id)); }
function cartCount() { return cart.reduce((sum, item) => sum + item.qty, 0); }
function cartSubtotal() { return cart.reduce((sum, item) => sum + (getProduct(item.productId)?.price || 0) * item.qty, 0); }
function statusLabel(status) { return ({ pending: 'Chờ xác nhận', processing: 'Đang xử lý', shipped: 'Đang giao', completed: 'Hoàn thành', canceled: 'Đã hủy', active: 'Hoạt động', locked: 'Đã khóa' })[status] || status; }
function initials(name = '') { return name.split(' ').slice(-2).map(x => x[0]).join('').toUpperCase(); }

function toast(message, title = 'Thành công') {
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<strong>${title}</strong><br>${message}`;
  toastRegion.appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

function showOverlay() { overlay.hidden = false; document.body.style.overflow = 'hidden'; }
function hideOverlay() { overlay.hidden = true; document.body.style.overflow = ''; }
function closeAll() {
  cartDrawer.classList.remove('open');
  cartDrawer.setAttribute('aria-hidden', 'true');
  [authModal, productModal, checkoutModal].forEach(el => el.hidden = true);
  hideOverlay();
}
function openModal(modal) { closeAll(); showOverlay(); modal.hidden = false; }
function openCart() { closeAll(); renderCart(); showOverlay(); cartDrawer.classList.add('open'); cartDrawer.setAttribute('aria-hidden', 'false'); }

function updateHeader() {
  document.querySelector('#cartCount').textContent = cartCount();
  document.querySelector('#favCount').textContent = favorites.length;
  document.querySelector('#sessionBtn').textContent = session ? session.name.split(' ').slice(-1)[0].toUpperCase() : 'TÀI KHOẢN';
  const route = getRoute();
  document.querySelectorAll('[data-route-link]').forEach(link => link.classList.toggle('active', link.dataset.routeLink === route));
}

function getRoute() { return location.hash.replace(/^#\//, '').split('/')[0] || 'shop'; }
function render() {
  updateHeader();
  const route = getRoute();
  if (route === 'admin') renderAdmin();
  else if (route === 'account') renderAccount();
  else renderShop();
  requestAnimationFrame(() => app.focus({ preventScroll: true }));
}

function productCard(product) {
  const favorite = favorites.includes(product.id);
  return `<article class="product-card">
    <div class="product-image" style="${spriteStyle(product)}" data-product="${product.id}" role="button" tabindex="0" aria-label="Xem ${product.name}">
      ${product.oldPrice ? `<span class="product-badge">GIẢM ${Math.round((1 - product.price / product.oldPrice) * 100)}%</span>` : product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
      <button class="favorite-button ${favorite ? 'active' : ''}" data-favorite="${product.id}" aria-label="${favorite ? 'Bỏ yêu thích' : 'Thêm yêu thích'}">${favorite ? '♥' : '♡'}</button>
    </div>
    <div class="product-info">
      <div class="product-meta"><span>UEF SHOP</span><span>${product.stock > 0 ? 'CÒN HÀNG' : 'HẾT HÀNG'}</span></div>
      <h3>${product.name}</h3>
      <div class="price-line"><strong>${VND.format(product.price)}</strong>${product.oldPrice ? `<del>${VND.format(product.oldPrice)}</del>` : ''}</div>
      <div class="card-actions"><button class="button primary" data-add="${product.id}">THÊM VÀO GIỎ</button><button class="square-button" data-product="${product.id}" aria-label="Xem chi tiết">${icons.arrow}</button></div>
    </div>
  </article>`;
}

function filteredProducts() {
  const query = shopState.search.trim().toLowerCase();
  let list = products.filter(p => p.visible !== false && (shopState.category === 'Tất cả' || p.category === shopState.category) && (!shopState.size || p.sizes.includes(shopState.size)) && (!shopState.saleOnly || p.oldPrice) && (!query || `${p.name} ${p.category} ${p.color}`.toLowerCase().includes(query)));
  if (shopState.sort === 'price-asc') list.sort((a, b) => a.price - b.price);
  if (shopState.sort === 'price-desc') list.sort((a, b) => b.price - a.price);
  if (shopState.sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  return list;
}

function renderShop() {
  const categories = ['Tất cả', ...new Set(products.filter(p => p.visible !== false).map(p => p.category))];
  const list = filteredProducts();
  app.innerHTML = `<div class="uef-shop-page">
    <section class="flash-hero" aria-labelledby="flashTitle">
      <div class="flash-copy">
        <div class="flash-label"><span>FLASH SALE</span><b>HOT DEAL</b></div>
        <h1 id="flashTitle"><span>DEAL ĐỈNH CHO</span><br><span>NHỊP SỐNG UEF</span></h1>
        <p>Thiết kế năng động cho lịch học, hoạt động câu lạc bộ và những buổi xuống phố.</p>
        <div class="flash-actions"><a class="button primary" href="#catalog">XEM TẤT CẢ DEAL ${icons.arrow}</a><strong>■ SỐ LƯỢNG CÓ HẠN</strong></div>
      </div>
      <div class="flash-visual" role="img" aria-label="Bộ sưu tập thời trang UEF SHOP">
        <div class="live-tag">● LIVE</div>
        <div class="countdown-card"><span>KẾT THÚC SAU</span><div class="countdown-grid"><b><em data-countdown="days">03</em><small>NGÀY</small></b><b><em data-countdown="hours">08</em><small>GIỜ</small></b><b><em data-countdown="minutes">24</em><small>PHÚT</small></b><b class="hot"><em data-countdown="seconds">16</em><small>GIÂY</small></b></div></div>
      </div>
    </section>
    <div class="signal-marquee" aria-hidden="true">UEF SHOP · SĂN DEAL · PHỐI CHẤT · CÒN HÀNG · CAMPUS DROP · UEF SHOP · SĂN DEAL · PHỐI CHẤT ·</div>

    <section class="catalog-banner">
      <span><b>TRANG CHỦ</b> / BỘ SƯU TẬP 2026</span>
      <h2>TẤT CẢ SẢN PHẨM</h2>
    </section>

    <section class="catalog-layout" id="catalog">
      <aside class="catalog-sidebar" aria-label="Bộ lọc sản phẩm">
        <div class="filter-group"><strong>TÌM SẢN PHẨM</strong><label class="search-box">${icons.search}<input id="productSearch" type="search" placeholder="Áo, quần, phụ kiện..." value="${shopState.search}" aria-label="Tìm kiếm sản phẩm" /></label></div>
        <div class="filter-group"><strong>LOẠI SẢN PHẨM</strong><div class="filter-list">${categories.map(c => `<button class="filter-option ${shopState.category === c ? 'active' : ''}" data-category="${c}"><span></span>${c}</button>`).join('')}</div></div>
        <div class="filter-group"><strong>TÌNH TRẠNG</strong><button class="filter-option ${shopState.saleOnly ? 'active' : ''}" data-sale-only><span></span>Đang ưu đãi</button></div>
        <div class="filter-group"><strong>KÍCH CỠ</strong><div class="size-filter">${['S','M','L','XL'].map(size => `<button class="${shopState.size === size ? 'active' : ''}" data-size-filter="${size}">${size}</button>`).join('')}<button class="${shopState.size === '' ? 'active' : ''}" data-size-filter="">ALL</button></div></div>
        <button class="reset-filter" data-reset-filters>ĐẶT LẠI BỘ LỌC</button>
      </aside>
      <div class="catalog-main">
        <div class="catalog-toolbar"><strong>${list.length} SẢN PHẨM</strong><label>SẮP XẾP THEO <select id="sortSelect" class="select-control" aria-label="Sắp xếp"><option value="featured">Mặc định</option><option value="price-asc" ${shopState.sort === 'price-asc' ? 'selected' : ''}>Giá tăng dần</option><option value="price-desc" ${shopState.sort === 'price-desc' ? 'selected' : ''}>Giá giảm dần</option><option value="name" ${shopState.sort === 'name' ? 'selected' : ''}>Tên A–Z</option></select></label></div>
        <div class="product-grid" id="productGrid">${list.length ? list.map(productCard).join('') : '<div class="empty-state"><h3>KHÔNG TÌM THẤY SẢN PHẨM</h3><p>Hãy thử từ khóa hoặc bộ lọc khác.</p></div>'}</div>
      </div>
    </section>

    <section class="benefit-strip" id="benefits">
      <div class="benefit"><strong>Giao hàng toàn quốc</strong><span>Theo dõi trạng thái đơn theo thời gian thực.</span></div>
      <div class="benefit"><strong>Thanh toán linh hoạt</strong><span>COD, thẻ ngân hàng hoặc ví điện tử.</span></div>
      <div class="benefit"><strong>Hỗ trợ tận tâm</strong><span>Tư vấn kích cỡ và đổi trả trong 14 ngày.</span></div>
    </section>
  </div>`;
  requestAnimationFrame(updateSaleCountdown);
}

const saleEndsAt = Date.now() + (3 * 24 * 60 * 60 + 8 * 60 * 60 + 24 * 60 + 16) * 1000;
function updateSaleCountdown() {
  const remaining = Math.max(0, saleEndsAt - Date.now());
  const values = {
    days: Math.floor(remaining / 86400000),
    hours: Math.floor(remaining / 3600000) % 24,
    minutes: Math.floor(remaining / 60000) % 60,
    seconds: Math.floor(remaining / 1000) % 60
  };
  Object.entries(values).forEach(([key, value]) => {
    const el = document.querySelector(`[data-countdown="${key}"]`);
    if (el) el.textContent = String(value).padStart(2, '0');
  });
}
setInterval(updateSaleCountdown, 1000);

function openProduct(id) {
  const product = getProduct(id);
  if (!product) return;
  productModal.innerHTML = `<button class="close-button modal-close" data-close aria-label="Đóng">×</button>
    <div class="product-detail-grid">
      <div class="detail-image" style="${spriteStyle(product)}" role="img" aria-label="${product.name}"></div>
      <div class="detail-copy">
        <span class="eyebrow">${product.category} · Còn ${product.stock} sản phẩm</span>
        <h2 id="productModalTitle">${product.name}</h2>
        <div class="detail-price">${VND.format(product.price)}</div>
        <p>${product.description}</p>
        <div class="option-group"><div class="option-title"><span>Màu sắc</span><span>${product.color}</span></div><div class="option-row"><button class="option-btn active">${product.color}</button></div></div>
        <div class="option-group"><div class="option-title"><span>Kích cỡ</span><span>Chọn một size</span></div><div class="option-row" id="sizeOptions">${product.sizes.map((size, i) => `<button class="option-btn ${i === 0 ? 'active' : ''}" data-size="${size}">${size}</button>`).join('')}</div></div>
        <button class="button primary full" data-add-modal="${product.id}">${icons.cart} Thêm vào giỏ</button>
      </div>
    </div>`;
  openModal(productModal);
}

function addToCart(productId, size) {
  const product = getProduct(productId);
  if (!product || product.stock < 1) return;
  const chosenSize = size || product.sizes[0];
  const existing = cart.find(item => item.productId === product.id && item.size === chosenSize);
  if (existing) existing.qty = Math.min(existing.qty + 1, product.stock);
  else cart.push({ productId: product.id, qty: 1, size: chosenSize });
  saveStore('uef_cart', cart);
  updateHeader();
  toast(`${product.name} đã được thêm vào giỏ.`);
}

function renderCart() {
  if (!cart.length) {
    cartItemsEl.innerHTML = '<div class="empty-state"><h3>Giỏ hàng đang trống</h3><p>Hãy chọn một sản phẩm bạn yêu thích.</p></div>';
    cartSummaryEl.innerHTML = '<button class="button dark full" data-close>Tiếp tục mua sắm</button>';
    return;
  }
  cartItemsEl.innerHTML = cart.map((item, index) => {
    const product = getProduct(item.productId);
    return `<div class="cart-item"><div class="cart-thumb" style="${spriteStyle(product)}"></div><div><h4>${product.name}</h4><p>Size ${item.size} · ${VND.format(product.price)}</p><div class="quantity"><button data-qty="${index}" data-delta="-1" aria-label="Giảm số lượng">−</button><strong>${item.qty}</strong><button data-qty="${index}" data-delta="1" aria-label="Tăng số lượng">+</button></div></div><button class="remove-item" data-remove="${index}" aria-label="Xóa sản phẩm">×</button></div>`;
  }).join('');
  const subtotal = cartSubtotal();
  const shipping = subtotal >= 799000 ? 0 : 30000;
  cartSummaryEl.innerHTML = `<div class="summary-line"><span>Tạm tính</span><strong>${VND.format(subtotal)}</strong></div><div class="summary-line"><span>Phí vận chuyển</span><strong>${shipping ? VND.format(shipping) : 'Miễn phí'}</strong></div>${shipping ? `<div class="free-shipping">Mua thêm ${VND.format(799000 - subtotal)} để được miễn phí vận chuyển.</div>` : '<div class="free-shipping">Bạn đã được miễn phí vận chuyển.</div>'}<div class="summary-line total"><span>Tổng cộng</span><strong>${VND.format(subtotal + shipping)}</strong></div><button class="button primary full" id="checkoutBtn">Tiến hành thanh toán</button>`;
}

function openAuth(action = null) { pendingAction = action; openModal(authModal); }
function loginAs(role) {
  session = role === 'admin' ? { role: 'admin', name: 'Admin', email: 'admin@demo.vn' } : { role: 'customer', name: profile.name, email: profile.email };
  saveStore('uef_session', session);
  closeAll();
  updateHeader();
  toast(`Xin chào ${session.name}!`, 'Đăng nhập thành công');
  if (pendingAction === 'checkout') { pendingAction = null; openCheckout(); }
  else if (role === 'admin') { location.hash = '#/admin'; render(); }
  else if (getRoute() === 'account') render();
}
function logout() {
  session = null;
  localStorage.removeItem('uef_session');
  accountTab = 'orders';
  location.hash = '#/shop';
  render();
  toast('Bạn đã đăng xuất.', 'Hoàn tất');
}

function openCheckout() {
  if (!cart.length) return;
  if (!session) { closeAll(); openAuth('checkout'); return; }
  checkoutStep = 1;
  lastPlacedOrder = null;
  renderCheckout();
  openModal(checkoutModal);
}

function checkoutSummaryHtml() {
  const subtotal = cartSubtotal();
  const shipping = subtotal >= 799000 ? 0 : 30000;
  return `<aside class="checkout-summary"><h3>Đơn hàng</h3>${cart.map(item => `<div class="checkout-item"><span>${getProduct(item.productId).name} × ${item.qty}</span><strong>${VND.format(getProduct(item.productId).price * item.qty)}</strong></div>`).join('')}<div class="summary-line total"><span>Tổng cộng</span><strong>${VND.format(subtotal + shipping)}</strong></div></aside>`;
}

function renderCheckout() {
  const stepNames = ['Giao hàng', 'Thanh toán', 'Xác nhận'];
  let content = '';
  if (checkoutStep === 1) content = `<form id="checkoutAddressForm" class="stack-form"><div class="form-grid"><label>Họ và tên<input id="shipName" value="${checkoutData.name}" required /></label><label>Số điện thoại<input id="shipPhone" value="${checkoutData.phone}" required /></label></div><label>Địa chỉ giao hàng<textarea id="shipAddress" required>${checkoutData.address}</textarea></label><label>Phương thức giao hàng<select id="deliveryMethod"><option>Tiêu chuẩn</option><option>Hỏa tốc</option></select></label><div class="checkout-actions"><button type="button" class="button secondary" data-close>Hủy</button><button class="button dark" type="submit">Tiếp tục ${icons.arrow}</button></div></form>`;
  if (checkoutStep === 2) content = `<div class="stack-form"><label class="radio-card"><input type="radio" name="payment" value="COD" ${checkoutData.payment === 'COD' ? 'checked' : ''}><span><strong>Thanh toán khi nhận hàng</strong><br><small>Thanh toán bằng tiền mặt cho nhân viên giao hàng.</small></span></label><label class="radio-card"><input type="radio" name="payment" value="Thẻ ngân hàng" ${checkoutData.payment === 'Thẻ ngân hàng' ? 'checked' : ''}><span><strong>Thẻ ngân hàng</strong><br><small>Mô phỏng thanh toán Visa / Mastercard.</small></span></label><label class="radio-card"><input type="radio" name="payment" value="Ví điện tử" ${checkoutData.payment === 'Ví điện tử' ? 'checked' : ''}><span><strong>Ví điện tử</strong><br><small>Mô phỏng thanh toán qua ví điện tử.</small></span></label><div class="checkout-actions"><button class="button secondary" data-checkout-back>Quay lại</button><button class="button dark" data-checkout-payment>Tiếp tục ${icons.arrow}</button></div></div>`;
  if (checkoutStep === 3) content = `<div><h3>Thông tin giao hàng</h3><p>${checkoutData.name} · ${checkoutData.phone}<br>${checkoutData.address}<br>${checkoutData.delivery} · ${checkoutData.payment}</p><div class="checkout-actions"><button class="button secondary" data-checkout-back>Quay lại</button><button class="button primary" data-place-order>Đặt hàng ngay</button></div></div>`;
  if (checkoutStep === 4) {
    checkoutModal.innerHTML = `<button class="close-button modal-close" data-close aria-label="Đóng">×</button><div class="success-panel"><div class="success-icon">✓</div><span class="eyebrow">ĐẶT HÀNG THÀNH CÔNG</span><h2 id="checkoutTitle">Cảm ơn bạn!</h2><p>Đơn hàng <strong>${lastPlacedOrder.id}</strong> đã được ghi nhận và đang chờ xác nhận.</p><button class="button dark" data-view-order>Xem chi tiết đơn hàng</button></div>`;
    return;
  }
  checkoutModal.innerHTML = `<button class="close-button modal-close" data-close aria-label="Đóng">×</button><span class="eyebrow">SECURE CHECKOUT</span><h2 id="checkoutTitle">Thanh toán</h2><div class="stepper">${stepNames.map((name, i) => `<div class="step ${checkoutStep >= i + 1 ? 'active' : ''}">${i + 1}. ${name}</div>`).join('')}</div><div class="checkout-layout"><div>${content}</div>${checkoutSummaryHtml()}</div>`;
}

function placeOrder() {
  const subtotal = cartSubtotal();
  const shipping = subtotal >= 799000 ? 0 : 30000;
  const newOrder = { id: `UEF-${Date.now().toString().slice(-6)}`, date: new Date().toLocaleDateString('vi-VN'), customer: checkoutData.name, email: session.email, total: subtotal + shipping, status: 'pending', payment: checkoutData.payment, items: cart.map(item => ({ ...item })) };
  orders.unshift(newOrder);
  saveStore('uef_orders', orders);
  lastPlacedOrder = newOrder;
  cart = [];
  saveStore('uef_cart', cart);
  updateHeader();
  checkoutStep = 4;
  renderCheckout();
}

function renderAccount() {
  if (!session || session.role !== 'customer') {
    app.innerHTML = `<div class="page-shell"><div class="admin-login"><span class="eyebrow">UEF MEMBER</span><h1>Tài khoản của bạn</h1><p>Đăng nhập để theo dõi đơn hàng, quản lý địa chỉ và cập nhật thông tin cá nhân.</p><button class="button primary full" data-open-login>Đăng nhập tài khoản demo</button></div></div>`;
    return;
  }
  const customerOrders = orders.filter(order => order.email === session.email);
  let content = '';
  if (accountTab === 'orders') content = `<div class="panel-head"><div><h2>Lịch sử đơn hàng</h2><p>${customerOrders.length} đơn hàng gần đây</p></div></div>${customerOrders.length ? customerOrders.map(order => orderCard(order)).join('') : '<div class="empty-state">Bạn chưa có đơn hàng nào.</div>'}`;
  if (accountTab === 'profile') content = `<h2>Thông tin cá nhân</h2><form id="profileForm" class="stack-form"><div class="form-grid"><label>Họ và tên<input id="profileName" value="${profile.name}" required></label><label>Số điện thoại<input id="profilePhone" value="${profile.phone}" required></label></div><label>Email<input id="profileEmail" type="email" value="${profile.email}" required></label><button class="button dark" type="submit">Lưu thay đổi</button></form>`;
  if (accountTab === 'address') content = `<h2>Sổ địa chỉ</h2><div class="order-card"><div><span class="status completed">Mặc định</span><h4>${profile.name} · ${profile.phone}</h4><p>${profile.address}</p></div><button class="button secondary small" data-edit-address>Chỉnh sửa</button></div><form id="addressForm" class="stack-form" hidden><label>Địa chỉ<textarea id="profileAddress" required>${profile.address}</textarea></label><button class="button dark" type="submit">Lưu địa chỉ</button></form>`;
  app.innerHTML = `<div class="page-shell"><div class="page-title"><div><span class="eyebrow">MY ACCOUNT</span><h1>Xin chào,<br>${profile.name.split(' ').slice(-1)[0]}.</h1></div><p>Quản lý thông tin cá nhân, địa chỉ giao hàng và theo dõi trạng thái các đơn đã đặt.</p></div><div class="account-grid"><aside class="side-card"><div class="profile-head"><div class="avatar">${initials(profile.name)}</div><h3>${profile.name}</h3><p>${profile.email}</p></div><div class="side-menu"><button class="${accountTab === 'orders' ? 'active' : ''}" data-account-tab="orders">Đơn hàng</button><button class="${accountTab === 'profile' ? 'active' : ''}" data-account-tab="profile">Thông tin cá nhân</button><button class="${accountTab === 'address' ? 'active' : ''}" data-account-tab="address">Sổ địa chỉ</button><button data-logout>Đăng xuất</button></div></aside><section class="content-card">${content}</section></div></div>`;
}

function orderCard(order) {
  const steps = ['pending', 'processing', 'shipped', 'completed'];
  const current = order.status === 'canceled' ? -1 : steps.indexOf(order.status);
  return `<article class="order-card"><div><span class="status ${order.status}">${statusLabel(order.status)}</span><h4>${order.id} · ${order.date}</h4><p>${order.items.reduce((sum, item) => sum + item.qty, 0)} sản phẩm · ${order.payment}</p><div class="timeline">${steps.map((step, i) => `<span class="timeline-step ${i <= current ? 'done' : ''}">${statusLabel(step)}</span>`).join('')}</div></div><div><strong>${VND.format(order.total)}</strong></div></article>`;
}

function adminSidebar() {
  const tabs = [['dashboard', 'Tổng quan'], ['products', 'Sản phẩm'], ['orders', 'Đơn hàng'], ['users', 'Người dùng'], ['reports', 'Báo cáo']];
  return `<aside class="admin-sidebar">${tabs.map(([id, label]) => `<button class="${adminTab === id ? 'active' : ''}" data-admin-tab="${id}">${label}</button>`).join('')}</aside>`;
}

function renderAdmin() {
  if (!session || session.role !== 'admin') {
    app.innerHTML = `<div class="admin-login"><span class="eyebrow">ADMIN PORTAL</span><h1>Quản trị hệ thống</h1><p>Sử dụng tài khoản quản trị demo để truy cập dashboard, sản phẩm, đơn hàng và báo cáo.</p><form id="adminLoginForm" class="stack-form"><label>Email<input id="adminEmail" type="email" value="admin@demo.vn" required></label><label>Mật khẩu<input id="adminPassword" type="password" value="admin123" required></label><p class="form-error" id="adminLoginError"></p><button class="button primary full" type="submit">Đăng nhập quản trị</button></form></div>`;
    return;
  }
  let content = '';
  if (adminTab === 'dashboard') content = renderDashboard();
  if (adminTab === 'products') content = renderAdminProducts();
  if (adminTab === 'orders') content = renderAdminOrders();
  if (adminTab === 'users') content = renderAdminUsers();
  if (adminTab === 'reports') content = renderReports();
  app.innerHTML = `<div class="admin-shell"><div class="admin-top"><div><span class="eyebrow">ADMINISTRATOR</span><h1>Điều hành cửa hàng</h1></div><button class="button secondary" data-logout>Đăng xuất</button></div><div class="admin-layout">${adminSidebar()}<section class="admin-main">${content}</section></div></div>`;
}

function renderDashboard() {
  const revenue = orders.filter(o => o.status !== 'canceled').reduce((sum, o) => sum + o.total, 0);
  const pending = orders.filter(o => ['pending', 'processing'].includes(o.status)).length;
  return `<div class="metrics-grid"><div class="metric-card"><span>DOANH THU</span><strong>${VND.format(revenue)}</strong><small>↑ 12,8% so với tháng trước</small></div><div class="metric-card"><span>ĐƠN HÀNG</span><strong>${orders.length}</strong><small>${pending} đơn cần xử lý</small></div><div class="metric-card"><span>KHÁCH HÀNG</span><strong>${users.length}</strong><small>+2 khách mới</small></div><div class="metric-card"><span>SẮP HẾT HÀNG</span><strong>${products.filter(p => p.stock <= 10).length}</strong><small>Cần bổ sung tồn kho</small></div></div><div class="dashboard-grid"><div class="admin-panel"><div class="panel-head"><div><h2>Doanh thu 7 ngày</h2><small>Dữ liệu mô phỏng</small></div><strong>+12,8%</strong></div><div class="bar-chart">${[46,58,41,72,64,89,78].map((v, i) => `<div class="bar-column"><div class="bar" style="height:${v}%"></div><span>T${i + 2}</span></div>`).join('')}</div></div><div class="admin-panel"><div class="panel-head"><h3>Hoạt động gần đây</h3></div><div class="activity-list">${orders.slice(0,4).map(order => `<div class="activity"><span class="activity-dot"></span><div><p><strong>${order.id}</strong> · ${statusLabel(order.status)}</p><small>${order.customer} · ${VND.format(order.total)}</small></div></div>`).join('')}</div></div></div>`;
}

function renderAdminProducts() {
  return `<div class="admin-panel"><div class="panel-head"><div><h2>Quản lý sản phẩm</h2><small>${products.length} sản phẩm trong danh mục</small></div><button class="button dark small" data-toggle-product-form>${adminAddOpen ? 'Đóng biểu mẫu' : '+ Thêm sản phẩm'}</button></div>${adminAddOpen ? `<form id="addProductForm" class="stack-form"><div class="form-grid"><label>Tên sản phẩm<input id="newProductName" required></label><label>Danh mục<select id="newProductCategory"><option>Áo</option><option>Quần</option><option>Đầm</option><option>Áo khoác</option><option>Giày</option><option>Phụ kiện</option></select></label><label>Giá bán<input id="newProductPrice" type="number" min="1000" required></label><label>Tồn kho<input id="newProductStock" type="number" min="0" required></label></div><button class="button primary" type="submit">Lưu sản phẩm</button></form><br>` : ''}<div class="table-wrap"><table class="data-table"><thead><tr><th>Sản phẩm</th><th>Danh mục</th><th>Giá</th><th>Tồn kho</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>${products.map(p => `<tr><td><div class="table-product"><span class="mini-thumb" style="${spriteStyle(p)}"></span>${p.name}</div></td><td>${p.category}</td><td>${VND.format(p.price)}</td><td>${p.stock}</td><td><span class="status ${p.visible === false ? 'locked' : 'completed'}">${p.visible === false ? 'Đã ẩn' : 'Đang bán'}</span></td><td><div class="table-actions"><button data-stock="${p.id}" data-delta="5">+5 kho</button><button data-toggle-product="${p.id}">${p.visible === false ? 'Hiện' : 'Ẩn'}</button></div></td></tr>`).join('')}</tbody></table></div></div>`;
}

function renderAdminOrders() {
  return `<div class="admin-panel"><div class="panel-head"><div><h2>Quản lý đơn hàng</h2><small>Cập nhật trạng thái theo quy trình xử lý</small></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Ngày đặt</th><th>Tổng tiền</th><th>Thanh toán</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>${orders.map(o => `<tr><td><strong>${o.id}</strong></td><td>${o.customer}<br><small>${o.email}</small></td><td>${o.date}</td><td>${VND.format(o.total)}</td><td>${o.payment}</td><td><span class="status ${o.status}">${statusLabel(o.status)}</span></td><td><div class="table-actions"><button data-next-status="${o.id}" ${['completed','canceled'].includes(o.status) ? 'disabled' : ''}>Chuyển bước</button><button data-cancel-order="${o.id}" ${['completed','canceled'].includes(o.status) ? 'disabled' : ''}>Hủy</button></div></td></tr>`).join('')}</tbody></table></div></div>`;
}

function renderAdminUsers() {
  return `<div class="admin-panel"><div class="panel-head"><div><h2>Quản lý người dùng</h2><small>${users.filter(u => u.status === 'active').length} tài khoản đang hoạt động</small></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Khách hàng</th><th>Email</th><th>Ngày tham gia</th><th>Đơn hàng</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>${users.map(u => `<tr><td><strong>${u.name}</strong></td><td>${u.email}</td><td>${u.joined}</td><td>${u.orders}</td><td><span class="status ${u.status === 'active' ? 'completed' : 'locked'}">${statusLabel(u.status)}</span></td><td><div class="table-actions"><button data-toggle-user="${u.id}">${u.status === 'active' ? 'Khóa' : 'Mở khóa'}</button></div></td></tr>`).join('')}</tbody></table></div></div>`;
}

function renderReports() {
  const activeOrders = orders.filter(o => o.status !== 'canceled');
  const revenue = activeOrders.reduce((sum, o) => sum + o.total, 0);
  const avg = activeOrders.length ? revenue / activeOrders.length : 0;
  const sold = activeOrders.reduce((sum, o) => sum + o.items.reduce((s, item) => s + item.qty, 0), 0);
  return `<div class="report-grid"><div class="report-card"><p>Tổng doanh thu</p><strong>${VND.format(revenue)}</strong><div class="progress"><span style="width:82%"></span></div></div><div class="report-card"><p>Giá trị đơn trung bình</p><strong>${VND.format(avg)}</strong><div class="progress"><span style="width:64%"></span></div></div><div class="report-card"><p>Sản phẩm đã bán</p><strong>${sold}</strong><div class="progress"><span style="width:71%"></span></div></div></div><br><div class="admin-panel"><div class="panel-head"><div><h2>Hiệu quả danh mục</h2><small>Báo cáo mô phỏng cho tháng 09/2026</small></div><button class="button secondary small" data-export-report>Xuất CSV</button></div><div class="bar-chart">${[['Áo',88],['Quần',63],['Đầm',72],['Giày',56],['Phụ kiện',77]].map(([name, value]) => `<div class="bar-column"><div class="bar" style="height:${value}%"></div><span>${name}</span></div>`).join('')}</div></div>`;
}

function saveAll() {
  saveStore('uef_products', products); saveStore('uef_orders', orders); saveStore('uef_users', users); saveStore('uef_favorites', favorites);
}

document.addEventListener('click', event => {
  const target = event.target.closest('button, [data-product], [data-category], [data-route-link]');
  if (!target) return;
  if (target.matches('[data-close]')) closeAll();
  if (target.dataset.product) openProduct(target.dataset.product);
  if (target.dataset.add) addToCart(target.dataset.add);
  if (target.dataset.addModal) {
    const size = productModal.querySelector('[data-size].active')?.dataset.size;
    addToCart(target.dataset.addModal, size); closeAll(); openCart();
  }
  if (target.dataset.size) {
    productModal.querySelectorAll('[data-size]').forEach(btn => btn.classList.remove('active'));
    target.classList.add('active');
  }
  if (target.dataset.favorite) {
    const id = Number(target.dataset.favorite);
    favorites = favorites.includes(id) ? favorites.filter(x => x !== id) : [...favorites, id];
    saveStore('uef_favorites', favorites); renderShop();
  }
  if (target.dataset.category) { shopState.category = target.dataset.category; renderShop(); document.querySelector('#catalog')?.scrollIntoView(); }
  if (target.dataset.sizeFilter !== undefined) { shopState.size = shopState.size === target.dataset.sizeFilter ? '' : target.dataset.sizeFilter; renderShop(); document.querySelector('#catalog')?.scrollIntoView(); }
  if (target.dataset.saleOnly !== undefined) { shopState.saleOnly = !shopState.saleOnly; renderShop(); document.querySelector('#catalog')?.scrollIntoView(); }
  if (target.dataset.resetFilters !== undefined) { shopState = { search: '', category: 'Tất cả', size: '', saleOnly: false, sort: 'featured' }; renderShop(); document.querySelector('#catalog')?.scrollIntoView(); }
  if (target.dataset.qty !== undefined) {
    const index = Number(target.dataset.qty), delta = Number(target.dataset.delta);
    cart[index].qty = Math.max(1, Math.min(cart[index].qty + delta, getProduct(cart[index].productId).stock));
    saveStore('uef_cart', cart); updateHeader(); renderCart();
  }
  if (target.dataset.remove !== undefined) { cart.splice(Number(target.dataset.remove), 1); saveStore('uef_cart', cart); updateHeader(); renderCart(); }
  if (target.id === 'checkoutBtn') openCheckout();
  if (target.dataset.openLogin !== undefined) openAuth();
  if (target.dataset.demoLogin) loginAs(target.dataset.demoLogin === 'admin' ? 'admin' : 'customer');
  if (target.dataset.checkoutBack !== undefined) { checkoutStep -= 1; renderCheckout(); }
  if (target.dataset.checkoutPayment !== undefined) { checkoutData.payment = checkoutModal.querySelector('input[name="payment"]:checked')?.value || 'COD'; checkoutStep = 3; renderCheckout(); }
  if (target.dataset.placeOrder !== undefined) placeOrder();
  if (target.dataset.viewOrder !== undefined) { closeAll(); accountTab = 'orders'; location.hash = '#/account'; render(); }
  if (target.dataset.accountTab) { accountTab = target.dataset.accountTab; renderAccount(); }
  if (target.dataset.editAddress !== undefined) document.querySelector('#addressForm').hidden = false;
  if (target.dataset.logout !== undefined) logout();
  if (target.dataset.adminTab) { adminTab = target.dataset.adminTab; renderAdmin(); }
  if (target.dataset.toggleProductForm !== undefined) { adminAddOpen = !adminAddOpen; renderAdmin(); }
  if (target.dataset.stock) { const p = getProduct(target.dataset.stock); p.stock += Number(target.dataset.delta); saveAll(); renderAdmin(); toast(`Đã cập nhật tồn kho ${p.name}.`); }
  if (target.dataset.toggleProduct) { const p = getProduct(target.dataset.toggleProduct); p.visible = p.visible === false; saveAll(); renderAdmin(); }
  if (target.dataset.nextStatus) {
    const flow = ['pending','processing','shipped','completed']; const o = orders.find(x => x.id === target.dataset.nextStatus); const i = flow.indexOf(o.status); o.status = flow[Math.min(i + 1, flow.length - 1)]; saveAll(); renderAdmin(); toast(`Đơn ${o.id}: ${statusLabel(o.status)}.`);
  }
  if (target.dataset.cancelOrder) { const o = orders.find(x => x.id === target.dataset.cancelOrder); o.status = 'canceled'; saveAll(); renderAdmin(); }
  if (target.dataset.toggleUser) { const u = users.find(x => x.id === Number(target.dataset.toggleUser)); u.status = u.status === 'active' ? 'locked' : 'active'; saveAll(); renderAdmin(); }
  if (target.dataset.exportReport !== undefined) { toast('Báo cáo CSV mô phỏng đã được chuẩn bị.', 'Xuất báo cáo'); }
});

document.addEventListener('submit', event => {
  event.preventDefault();
  if (event.target.id === 'loginForm') {
    const email = document.querySelector('#loginEmail').value.trim(); const password = document.querySelector('#loginPassword').value;
    if (email === 'admin@demo.vn' && password === 'admin123') loginAs('admin');
    else if (email === 'user@demo.vn' && password === 'demo123') loginAs('customer');
    else document.querySelector('#loginError').textContent = 'Email hoặc mật khẩu không đúng.';
  }
  if (event.target.id === 'adminLoginForm') {
    if (document.querySelector('#adminEmail').value.trim() === 'admin@demo.vn' && document.querySelector('#adminPassword').value === 'admin123') loginAs('admin');
    else document.querySelector('#adminLoginError').textContent = 'Sai thông tin tài khoản quản trị.';
  }
  if (event.target.id === 'checkoutAddressForm') {
    checkoutData.name = document.querySelector('#shipName').value.trim(); checkoutData.phone = document.querySelector('#shipPhone').value.trim(); checkoutData.address = document.querySelector('#shipAddress').value.trim(); checkoutData.delivery = document.querySelector('#deliveryMethod').value; checkoutStep = 2; renderCheckout();
  }
  if (event.target.id === 'profileForm') {
    profile.name = document.querySelector('#profileName').value.trim(); profile.phone = document.querySelector('#profilePhone').value.trim(); profile.email = document.querySelector('#profileEmail').value.trim(); session.name = profile.name; session.email = profile.email; saveStore('uef_profile', profile); saveStore('uef_session', session); render(); toast('Thông tin cá nhân đã được cập nhật.');
  }
  if (event.target.id === 'addressForm') { profile.address = document.querySelector('#profileAddress').value.trim(); saveStore('uef_profile', profile); checkoutData.address = profile.address; renderAccount(); toast('Địa chỉ mặc định đã được cập nhật.'); }
  if (event.target.id === 'addProductForm') {
    const nextId = Math.max(...products.map(p => p.id)) + 1;
    products.push({ id: nextId, name: document.querySelector('#newProductName').value.trim(), category: document.querySelector('#newProductCategory').value, price: Number(document.querySelector('#newProductPrice').value), oldPrice: null, stock: Number(document.querySelector('#newProductStock').value), badge: 'Mới', sprite: [0, 0], color: 'Kem', sizes: ['S','M','L'], visible: true, description: 'Sản phẩm mới được thêm từ trang quản trị.' });
    adminAddOpen = false; saveAll(); renderAdmin(); toast('Sản phẩm mới đã được thêm.');
  }
});

document.addEventListener('input', event => {
  if (event.target.id === 'productSearch') { shopState.search = event.target.value; const grid = document.querySelector('#productGrid'); const list = filteredProducts(); grid.innerHTML = list.length ? list.map(productCard).join('') : '<div class="empty-state"><h3>Không tìm thấy sản phẩm</h3><p>Hãy thử từ khóa khác.</p></div>'; }
});
document.addEventListener('change', event => {
  if (event.target.id === 'categorySelect') { shopState.category = event.target.value; renderShop(); }
  if (event.target.id === 'sortSelect') { shopState.sort = event.target.value; renderShop(); }
});

document.querySelector('#cartBtn').addEventListener('click', openCart);
document.querySelector('#sessionBtn').addEventListener('click', () => session ? (location.hash = session.role === 'admin' ? '#/admin' : '#/account') : openAuth());
document.querySelector('#searchFocusBtn').addEventListener('click', () => { location.hash = '#/shop'; setTimeout(() => { document.querySelector('#catalog')?.scrollIntoView(); document.querySelector('#productSearch')?.focus(); }, 80); });
overlay.addEventListener('click', closeAll);
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeAll(); if ((event.key === 'Enter' || event.key === ' ') && event.target.dataset.product) { event.preventDefault(); openProduct(event.target.dataset.product); } });
window.addEventListener('hashchange', render);

if (!location.hash) location.hash = '#/shop';
render();

function registerWebMcpTools() {
  const context = document.modelContext;
  if (!context?.registerTool) return;
  const lifecycle = new AbortController();
  const reportError = error => console.warn('WebMCP tool registration failed', error);
  try {
    void Promise.resolve(context.registerTool({
      name: 'search_store_products',
      title: 'Tìm sản phẩm UEF SHOP',
      description: 'Tìm các sản phẩm đang bán theo tên hoặc danh mục và trả về giá cùng tồn kho hiện tại.',
      inputSchema: {
        type: 'object',
        properties: { query: { type: 'string' }, category: { type: 'string' } },
        additionalProperties: false
      },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute(input) {
        const query = String(input?.query || '').trim().toLowerCase();
        const category = String(input?.category || '').trim().toLowerCase();
        return products.filter(p => p.visible !== false)
          .filter(p => !query || `${p.name} ${p.category} ${p.color}`.toLowerCase().includes(query))
          .filter(p => !category || p.category.toLowerCase() === category)
          .map(p => ({ id: p.id, name: p.name, category: p.category, price: p.price, stock: p.stock }));
      }
    }, { signal: lifecycle.signal })).catch(reportError);

    void Promise.resolve(context.registerTool({
      name: 'add_store_item_to_cart',
      title: 'Thêm sản phẩm vào giỏ',
      description: 'Thêm một sản phẩm UEF SHOP hợp lệ vào giỏ hàng demo và cập nhật giao diện.',
      inputSchema: {
        type: 'object',
        properties: {
          productId: { type: 'integer' },
          quantity: { type: 'integer', minimum: 1, maximum: 10 },
          size: { type: 'string' }
        },
        required: ['productId'],
        additionalProperties: false
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        const product = getProduct(Number(input?.productId));
        const quantity = Number(input?.quantity || 1);
        const size = String(input?.size || product?.sizes?.[0] || '');
        if (!product || product.visible === false) throw new Error('Sản phẩm không tồn tại hoặc đã ngừng bán.');
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) throw new Error('Số lượng phải từ 1 đến 10.');
        if (!product.sizes.includes(size)) throw new Error('Kích cỡ không hợp lệ.');
        const existing = cart.find(item => item.productId === product.id && item.size === size);
        if (existing) existing.qty = Math.min(existing.qty + quantity, product.stock);
        else cart.push({ productId: product.id, qty: Math.min(quantity, product.stock), size });
        saveStore('uef_cart', cart);
        updateHeader();
        toast(`${product.name} đã được thêm vào giỏ.`);
        return { productId: product.id, name: product.name, size, cartQuantity: cartCount(), subtotal: cartSubtotal() };
      }
    }, { signal: lifecycle.signal })).catch(reportError);
  } catch (error) { reportError(error); }
}

registerWebMcpTools();
