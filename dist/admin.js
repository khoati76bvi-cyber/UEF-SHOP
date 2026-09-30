const VND = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

const navItems = [
  ['dashboard', '01', 'Tổng quan'],
  ['appearance', '02', 'Giao diện & màu sắc'],
  ['content', '03', 'Nội dung trang'],
  ['products', '04', 'Sản phẩm'],
  ['orders', '05', 'Đơn hàng'],
  ['users', '06', 'Người dùng'],
  ['media', '07', 'Thư viện ảnh'],
  ['data', '08', 'Dữ liệu nâng cao']
];

const pageMeta = {
  dashboard: ['TRUNG TÂM ĐIỀU HÀNH', 'Tổng quan'],
  appearance: ['THIẾT KẾ WEBSITE', 'Giao diện & màu sắc'],
  content: ['BIÊN TẬP WEBSITE', 'Nội dung trang'],
  products: ['CATALOG MANAGER', 'Sản phẩm'],
  orders: ['ORDER WORKFLOW', 'Đơn hàng'],
  users: ['CUSTOMER MANAGER', 'Người dùng'],
  media: ['ASSET LIBRARY', 'Thư viện ảnh'],
  data: ['DATA CONTROL', 'Dữ liệu nâng cao']
};

let store = { site: {}, products: [], orders: [], users: [] };
let mediaFiles = [];
let activeSection = location.hash.replace('#', '') || 'dashboard';
let productSearch = '';
let serverOnline = false;

const loginScreen = document.querySelector('#loginScreen');
const cmsApp = document.querySelector('#cmsApp');
const cmsNav = document.querySelector('#cmsNav');
const cmsContent = document.querySelector('#cmsContent');
const pageKicker = document.querySelector('#pageKicker');
const pageTitle = document.querySelector('#pageTitle');
const saveState = document.querySelector('#saveState');
const connectionDot = document.querySelector('#connectionDot');
const connectionText = document.querySelector('#connectionText');
const modalBackdrop = document.querySelector('#modalBackdrop');
const cmsModal = document.querySelector('#cmsModal');
const toastRegion = document.querySelector('#toastRegion');

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character]);
}

function safeCssUrl(value) { return String(value || '').replace(/["'()\\\r\n]/g, ''); }
function statusLabel(status) { return ({ pending: 'Chờ xác nhận', processing: 'Đang xử lý', shipped: 'Đang giao', completed: 'Hoàn thành', canceled: 'Đã hủy', active: 'Hoạt động', locked: 'Đã khóa' })[status] || status; }
function formatBytes(bytes) { return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`; }
function productMediaStyle(product) {
  if (product?.image) return `background-image:url("${safeCssUrl(product.image)}");background-position:center;background-size:cover`;
  const sprite = Array.isArray(product?.sprite) ? product.sprite : [0, 0];
  return `background-position:${sprite[0]}% ${sprite[1]}%`;
}

function toast(message, type = 'success') {
  const element = document.createElement('div');
  element.className = `toast ${type === 'error' ? 'error' : ''}`;
  element.innerHTML = `<strong>${type === 'error' ? 'Không thể thực hiện' : 'Đã hoàn tất'}</strong><br>${escapeHtml(message)}`;
  toastRegion.appendChild(element);
  setTimeout(() => element.remove(), 3200);
}

function setSaveState(message, type = '') {
  saveState.textContent = message;
  saveState.className = `save-state ${type}`;
}

function storePayload() { return { site: store.site, products: store.products, orders: store.orders, users: store.users }; }

async function loadStoreData() {
  const response = await fetch('/api/store-data', { cache: 'no-store' });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Không thể đọc dữ liệu cửa hàng.');
  store = {
    site: result.site || {},
    products: Array.isArray(result.products) ? result.products : [],
    orders: Array.isArray(result.orders) ? result.orders : [],
    users: Array.isArray(result.users) ? result.users : []
  };
  serverOnline = true;
  connectionDot.classList.add('online');
  connectionText.textContent = 'Dữ liệu đã kết nối';
  document.querySelector('#cmsLogo').textContent = store.site.logoLetter || 'U';
  document.querySelector('#cmsShopName').textContent = store.site.shopName || 'UEF SHOP';
  setSaveState(result.updatedAt ? `Đã nạp ${new Date(result.updatedAt).toLocaleString('vi-VN')}` : 'Dữ liệu đã sẵn sàng', 'saved');
}

async function saveStoreData(message = 'Đã lưu thay đổi') {
  setSaveState('Đang lưu...', 'saving');
  const response = await fetch('/api/store-data', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(storePayload())
  });
  const result = await response.json();
  if (!response.ok) {
    setSaveState('Lưu thất bại', 'error');
    throw new Error(result.error || 'Không thể lưu dữ liệu.');
  }
  setSaveState(`Đã lưu ${new Date(result.updatedAt).toLocaleTimeString('vi-VN')}`, 'saved');
  document.querySelector('#cmsLogo').textContent = store.site.logoLetter || 'U';
  document.querySelector('#cmsShopName').textContent = store.site.shopName || 'UEF SHOP';
  refreshPreview();
  toast(message);
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Không thể đọc tệp ảnh.'));
    reader.readAsDataURL(file);
  });
}

async function uploadImage(file) {
  if (!file) return '';
  setSaveState('Đang tải ảnh...', 'saving');
  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: file.name, dataUrl: await fileToDataUrl(file) })
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Không thể tải ảnh lên.');
  return result.path;
}

function renderNavigation() {
  cmsNav.innerHTML = navItems.map(([id, number, label]) => `<button class="nav-button ${activeSection === id ? 'active' : ''}" data-section="${id}"><span>${number}</span>${label}</button>`).join('');
}

function render() {
  if (!pageMeta[activeSection]) activeSection = 'dashboard';
  renderNavigation();
  pageKicker.textContent = pageMeta[activeSection][0];
  pageTitle.textContent = pageMeta[activeSection][1];
  const renderers = {
    dashboard: renderDashboard,
    appearance: renderAppearance,
    content: renderContent,
    products: renderProducts,
    orders: renderOrders,
    users: renderUsers,
    media: renderMedia,
    data: renderData
  };
  cmsContent.innerHTML = renderers[activeSection]();
}

function renderDashboard() {
  const validOrders = store.orders.filter(order => order.status !== 'canceled');
  const revenue = validOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const pending = store.orders.filter(order => ['pending', 'processing'].includes(order.status)).length;
  return `<div class="metric-grid">
    <article class="metric"><span>DOANH THU</span><strong>${VND.format(revenue)}</strong><small>${validOrders.length} đơn hợp lệ</small></article>
    <article class="metric"><span>ĐƠN HÀNG</span><strong>${store.orders.length}</strong><small>${pending} đơn cần xử lý</small></article>
    <article class="metric"><span>SẢN PHẨM</span><strong>${store.products.length}</strong><small>${store.products.filter(product => product.visible !== false).length} đang bán</small></article>
    <article class="metric"><span>KHÁCH HÀNG</span><strong>${store.users.length}</strong><small>${store.users.filter(user => user.status === 'active').length} hoạt động</small></article>
  </div>
  <div class="dashboard-grid">
    <section class="panel"><div class="panel-head"><div><h2>Truy cập nhanh</h2><p>Đi thẳng đến nội dung cần chỉnh sửa</p></div></div><div class="quick-actions">
      <button class="quick-action" data-section="appearance"><b>Thiết kế giao diện</b><small>Màu sắc, thương hiệu và CSS</small></button>
      <button class="quick-action" data-section="content"><b>Đổi banner</b><small>Hero, danh mục và nội dung trang</small></button>
      <button class="quick-action" data-section="products"><b>Thêm sản phẩm</b><small>Ảnh, giá, size và tồn kho</small></button>
      <button class="quick-action" data-section="data"><b>Toàn bộ dữ liệu</b><small>Sao lưu, nhập và chỉnh JSON</small></button>
    </div></section>
    <section class="panel"><div class="panel-head"><div><h3>Đơn gần đây</h3><p>Trạng thái vận hành</p></div></div><div class="activity-list">${store.orders.slice(0, 6).map(order => `<div class="activity"><i></i><div><p><strong>${escapeHtml(order.id)}</strong> · ${escapeHtml(order.customer)}</p><small>${statusLabel(order.status)}</small></div><strong>${VND.format(order.total)}</strong></div>`).join('') || '<div class="empty">Chưa có đơn hàng.</div>'}</div></section>
  </div>`;
}

function previewPanel() {
  return `<aside class="preview-panel"><div class="preview-toolbar"><span>XEM TRƯỚC CỬA HÀNG</span><div><button class="active" data-preview-size="desktop">Desktop</button><button data-preview-size="mobile">Mobile</button></div></div><div class="preview-stage" id="previewStage"><iframe id="storePreview" src="./index.html#/shop" title="Xem trước cửa hàng"></iframe></div></aside>`;
}

function renderAppearance() {
  const site = store.site;
  return `<div class="workspace-grid"><form class="editor-stack" id="appearanceForm">
    <section class="panel section-form"><div class="panel-head"><div><h2>Thương hiệu</h2><p>Tên và ký hiệu xuất hiện trên toàn website</p></div></div>
      <div class="form-grid"><label class="field">Tên cửa hàng<input name="shopName" value="${escapeHtml(site.shopName)}" required></label><label class="field">Ký tự logo<input name="logoLetter" maxlength="3" value="${escapeHtml(site.logoLetter || 'U')}" required></label></div>
      <label class="field">Dòng mô tả dưới logo<input name="shopTagline" value="${escapeHtml(site.shopTagline || '')}" required></label>
    </section>
    <section class="panel section-form"><div class="panel-head"><div><h2>Màu giao diện</h2><p>Thay đổi bảng màu cho toàn bộ cửa hàng</p></div></div>
      <div class="form-grid"><label class="field">Màu nhấn<input name="accentColor" type="color" value="${escapeHtml(site.accentColor || '#d9ff00')}"></label><label class="field">Màu khuyến mãi<input name="hotColor" type="color" value="${escapeHtml(site.hotColor || '#ff007a')}"></label><label class="field">Màu chữ chính<input name="inkColor" type="color" value="${escapeHtml(site.inkColor || '#0a0a0a')}"></label><label class="field">Màu nền<input name="paperColor" type="color" value="${escapeHtml(site.paperColor || '#f4f4ef')}"></label></div>
    </section>
    <section class="panel section-form"><div class="panel-head"><div><h2>Thanh điều hướng</h2><p>Đổi tên các mục menu chính</p></div></div>
      <div class="form-grid"><label class="field">Trang chủ<input name="navHome" value="${escapeHtml(site.navHome || '')}" required></label><label class="field">Sản phẩm<input name="navProducts" value="${escapeHtml(site.navProducts || '')}" required></label><label class="field">Hỗ trợ<input name="navSupport" value="${escapeHtml(site.navSupport || '')}" required></label></div>
    </section>
    <section class="panel section-form"><div class="panel-head"><div><h2>CSS tùy chỉnh</h2><p>Dành cho thay đổi bố cục hoặc kiểu hiển thị chuyên sâu</p></div></div><label class="field">Mã CSS<textarea class="code-editor" name="customCss" spellcheck="false" placeholder="Ví dụ: .flash-hero { border-radius: 24px; }">${escapeHtml(site.customCss || '')}</textarea><small>CSS này được chèn sau stylesheet chính của cửa hàng.</small></label></section>
    <div class="form-actions"><p>Lưu xong, khung xem trước sẽ tự cập nhật.</p><button class="button primary" type="submit">Lưu giao diện</button></div>
  </form>${previewPanel()}</div>`;
}

function renderContent() {
  const site = store.site;
  const benefits = Array.isArray(site.benefits) ? site.benefits : [];
  while (benefits.length < 3) benefits.push({ title: '', text: '' });
  return `<div class="workspace-grid"><form class="editor-stack" id="contentForm">
    <section class="panel section-form"><div class="panel-head"><div><h2>Thanh thông báo</h2><p>Nội dung nằm trên cùng của cửa hàng</p></div></div><label class="field">Thông báo<input name="announcement" value="${escapeHtml(site.announcement)}" required></label><label class="field">Nội dung liên kết<input name="announcementLink" value="${escapeHtml(site.announcementLink)}" required></label></section>
    <section class="panel section-form"><div class="panel-head"><div><h2>Hero banner</h2><p>Khu vực nổi bật đầu trang</p></div></div><div class="image-preview" style="background-image:linear-gradient(90deg,rgba(0,0,0,.8),rgba(0,0,0,.1)),url('${safeCssUrl(site.heroImage)}')"></div>
      <div class="form-grid"><label class="field">Nhãn nhỏ<input name="heroLabel" value="${escapeHtml(site.heroLabel)}" required></label><label class="field">Huy hiệu<input name="heroBadge" value="${escapeHtml(site.heroBadge)}" required></label><label class="field">Tiêu đề dòng 1<input name="heroTitleLine1" value="${escapeHtml(site.heroTitleLine1)}" required></label><label class="field">Tiêu đề dòng 2<input name="heroTitleLine2" value="${escapeHtml(site.heroTitleLine2)}" required></label></div>
      <label class="field">Mô tả<textarea name="heroDescription" required>${escapeHtml(site.heroDescription)}</textarea></label><div class="form-grid"><label class="field">Nội dung nút<input name="heroButton" value="${escapeHtml(site.heroButton)}" required></label><label class="field">Đường dẫn ảnh<input name="heroImage" value="${escapeHtml(site.heroImage)}" required></label></div><label class="field file-field">Tải ảnh hero mới<input id="heroFile" type="file" accept="image/png,image/jpeg,image/webp,image/gif"><small>PNG, JPG, WEBP hoặc GIF · tối đa 5 MB</small></label>
    </section>
    <section class="panel section-form"><div class="panel-head"><div><h2>Banner danh mục</h2><p>Nội dung trên danh sách sản phẩm</p></div></div><div class="image-preview" style="background-image:linear-gradient(90deg,rgba(0,0,0,.8),rgba(0,0,0,.15)),url('${safeCssUrl(site.catalogImage)}')"></div><div class="form-grid"><label class="field">Dòng dẫn<input name="catalogEyebrow" value="${escapeHtml(site.catalogEyebrow)}" required></label><label class="field">Tiêu đề<input name="catalogTitle" value="${escapeHtml(site.catalogTitle)}" required></label></div><label class="field">Đường dẫn ảnh<input name="catalogImage" value="${escapeHtml(site.catalogImage)}" required></label><label class="field file-field">Tải ảnh banner mới<input id="catalogFile" type="file" accept="image/png,image/jpeg,image/webp,image/gif"><small>PNG, JPG, WEBP hoặc GIF · tối đa 5 MB</small></label><label class="field">Dòng chữ chạy<input name="marquee" value="${escapeHtml(site.marquee || '')}" required></label></section>
    <section class="panel section-form"><div class="panel-head"><div><h2>Quyền lợi khách hàng</h2><p>Ba thông tin nằm cuối danh mục</p></div></div>${benefits.slice(0, 3).map((benefit, index) => `<div class="form-grid"><label class="field">Tiêu đề ${index + 1}<input name="benefitTitle${index}" value="${escapeHtml(benefit.title)}" required></label><label class="field">Mô tả ${index + 1}<input name="benefitText${index}" value="${escapeHtml(benefit.text)}" required></label></div>`).join('')}</section>
    <section class="panel section-form"><div class="panel-head"><div><h2>Chân trang</h2><p>Nội dung giới thiệu, liên kết và bản quyền</p></div></div><label class="field">Mô tả cửa hàng<textarea name="footerDescription" required>${escapeHtml(site.footerDescription || '')}</textarea></label><div class="form-grid"><label class="field">Tiêu đề cột hỗ trợ<input name="footerSupportTitle" value="${escapeHtml(site.footerSupportTitle || '')}"></label><label class="field">Liên kết hỗ trợ 1<input name="footerSupportLink1" value="${escapeHtml(site.footerSupportLink1 || '')}"></label><label class="field">Liên kết hỗ trợ 2<input name="footerSupportLink2" value="${escapeHtml(site.footerSupportLink2 || '')}"></label><label class="field">Tiêu đề cột chính sách<input name="footerPolicyTitle" value="${escapeHtml(site.footerPolicyTitle || '')}"></label><label class="field">Liên kết chính sách 1<input name="footerPolicyLink1" value="${escapeHtml(site.footerPolicyLink1 || '')}"></label><label class="field">Liên kết chính sách 2<input name="footerPolicyLink2" value="${escapeHtml(site.footerPolicyLink2 || '')}"></label><label class="field">Bản quyền<input name="copyright" value="${escapeHtml(site.copyright || '')}"></label><label class="field">Ghi chú cuối trang<input name="footerNote" value="${escapeHtml(site.footerNote || '')}"></label></div></section>
    <div class="form-actions"><p>Mọi nội dung được lưu tập trung trong tệp dữ liệu.</p><button class="button primary" type="submit">Lưu nội dung trang</button></div>
  </form>${previewPanel()}</div>`;
}

function renderProducts() {
  const query = productSearch.toLowerCase();
  const products = store.products.filter(product => !query || `${product.name} ${product.category} ${product.color}`.toLowerCase().includes(query));
  return `<section class="panel"><div class="toolbar"><input class="search-input" id="productSearch" type="search" value="${escapeHtml(productSearch)}" placeholder="Tìm tên, danh mục hoặc màu..."><div class="toolbar-group"><button class="button secondary" data-export-products>Xuất danh sách</button><button class="button primary" data-new-product>+ Thêm sản phẩm</button></div></div>
    <div class="table-wrap"><table class="data-table"><thead><tr><th>Sản phẩm</th><th>Danh mục</th><th>Giá</th><th>Tồn kho</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>${products.map(product => `<tr><td><div class="table-product"><span class="table-thumb" style="${productMediaStyle(product)}"></span><div><strong>${escapeHtml(product.name)}</strong><br><small>#${product.id} · ${escapeHtml(product.color)}</small></div></div></td><td>${escapeHtml(product.category)}</td><td><strong>${VND.format(product.price)}</strong>${product.oldPrice ? `<br><del>${VND.format(product.oldPrice)}</del>` : ''}</td><td>${product.stock}</td><td><span class="status ${product.visible === false ? 'hidden' : 'active'}">${product.visible === false ? 'Đã ẩn' : 'Đang bán'}</span></td><td><div class="table-actions"><button data-edit-product="${product.id}">Sửa</button><button data-toggle-product="${product.id}">${product.visible === false ? 'Hiện' : 'Ẩn'}</button><button class="danger" data-delete-product="${product.id}">Xóa</button></div></td></tr>`).join('') || '<tr><td colspan="6"><div class="empty">Không tìm thấy sản phẩm.</div></td></tr>'}</tbody></table></div></section>`;
}

function renderOrders() {
  return `<section class="panel"><div class="panel-head"><div><h2>Quản lý đơn hàng</h2><p>Cập nhật trạng thái hoặc xem toàn bộ chi tiết đơn</p></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Ngày</th><th>Tổng tiền</th><th>Thanh toán</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>${store.orders.map(order => `<tr><td><strong>${escapeHtml(order.id)}</strong></td><td>${escapeHtml(order.customer)}<br><small>${escapeHtml(order.email)}</small></td><td>${escapeHtml(order.date)}</td><td>${VND.format(order.total)}</td><td>${escapeHtml(order.payment)}</td><td><select data-order-status="${escapeHtml(order.id)}"><option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Chờ xác nhận</option><option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Đang xử lý</option><option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Đang giao</option><option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Hoàn thành</option><option value="canceled" ${order.status === 'canceled' ? 'selected' : ''}>Đã hủy</option></select></td><td><div class="table-actions"><button data-edit-order="${escapeHtml(order.id)}">Chi tiết</button><button class="danger" data-delete-order="${escapeHtml(order.id)}">Xóa</button></div></td></tr>`).join('') || '<tr><td colspan="7"><div class="empty">Chưa có đơn hàng.</div></td></tr>'}</tbody></table></div></section>`;
}

function renderUsers() {
  return `<section class="panel"><div class="toolbar"><div><h2>Người dùng</h2><p>Hồ sơ khách hàng và trạng thái truy cập</p></div><button class="button primary" data-new-user>+ Thêm người dùng</button></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Khách hàng</th><th>Email</th><th>Ngày tham gia</th><th>Số đơn</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>${store.users.map(user => `<tr><td><strong>${escapeHtml(user.name)}</strong></td><td>${escapeHtml(user.email)}</td><td>${escapeHtml(user.joined)}</td><td>${user.orders}</td><td><span class="status ${user.status}">${statusLabel(user.status)}</span></td><td><div class="table-actions"><button data-edit-user="${user.id}">Sửa</button><button data-toggle-user="${user.id}">${user.status === 'active' ? 'Khóa' : 'Mở khóa'}</button><button class="danger" data-delete-user="${user.id}">Xóa</button></div></td></tr>`).join('') || '<tr><td colspan="6"><div class="empty">Chưa có người dùng.</div></td></tr>'}</tbody></table></div></section>`;
}

function renderMedia() {
  return `<section class="panel"><div class="upload-box"><div><h2>Thư viện ảnh</h2><p>Ảnh banner và sản phẩm được lưu trong thư mục dự án.</p></div><label class="button primary">Tải ảnh lên<input id="mediaUpload" type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple hidden></label></div>${mediaFiles.length ? `<div class="media-grid">${mediaFiles.map(file => `<article class="media-card"><img src="${escapeHtml(file.path)}" alt="${escapeHtml(file.name)}"><div><strong title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</strong><small>${formatBytes(file.size)} · ${new Date(file.modifiedAt).toLocaleDateString('vi-VN')}</small><button data-copy-media="${escapeHtml(file.path)}">Sao chép đường dẫn</button><button data-delete-media="${escapeHtml(file.name)}">Xóa ảnh</button></div></article>`).join('')}</div>` : '<div class="empty">Chưa có ảnh tải lên. Ảnh mặc định vẫn nằm trong thư mục assets.</div>'}</section>`;
}

function renderData() {
  return `<div class="workspace-grid"><div class="editor-stack"><section class="panel"><div class="panel-head"><div><h2>Toàn bộ dữ liệu website</h2><p>Chỉnh trực tiếp JSON khi cần thay đổi sâu hoặc khôi phục dữ liệu</p></div></div><div class="data-path"><span>TỆP DỮ LIỆU CHÍNH</span><code>D:\\Clothing online shopping\\data\\store-data.json</code></div><div class="data-path"><span>THƯ MỤC ẢNH</span><code>D:\\Clothing online shopping\\dist\\uploads</code></div><div class="json-summary"><div><strong>${store.products.length}</strong><span>Sản phẩm</span></div><div><strong>${store.orders.length}</strong><span>Đơn hàng</span></div><div><strong>${store.users.length}</strong><span>Người dùng</span></div></div><div class="toolbar-group"><button class="button dark" data-export-data>Xuất bản sao JSON</button><label class="button secondary">Nhập tệp JSON<input id="importDataFile" type="file" accept="application/json,.json" hidden></label><button class="button secondary" data-reload-data>Tải lại từ ổ đĩa</button></div></section>
    <form class="panel section-form" id="jsonEditorForm"><div class="panel-head"><div><h2>Trình chỉnh JSON</h2><p>Cho phép kiểm soát mọi trường dữ liệu trên website</p></div></div><label class="field">JSON cửa hàng<textarea class="code-editor" id="jsonEditor" spellcheck="false">${escapeHtml(JSON.stringify(storePayload(), null, 2))}</textarea></label><button class="button primary" type="submit">Kiểm tra & lưu JSON</button></form></div>${previewPanel()}</div>`;
}

function openModal(content) {
  cmsModal.innerHTML = content;
  modalBackdrop.hidden = false;
  cmsModal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  cmsModal.hidden = true;
  modalBackdrop.hidden = true;
  document.body.style.overflow = '';
}

function productEditor(product = null) {
  const item = product || { name: '', category: 'Áo', price: '', oldPrice: '', stock: 0, badge: 'Mới', color: '', sizes: ['S', 'M', 'L'], description: '', image: '', visible: true, sprite: [0, 0] };
  const categories = ['Áo', 'Quần', 'Đầm', 'Áo khoác', 'Giày', 'Phụ kiện'];
  openModal(`<div class="modal-head"><div><span class="kicker">PRODUCT EDITOR</span><h2>${product ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h2></div><button class="close-modal" data-close-modal>×</button></div><form class="section-form" id="productForm" data-product-id="${product?.id || ''}"><div class="form-grid"><div class="modal-image" style="${productMediaStyle(item)}"></div><label class="field file-field">Ảnh sản phẩm<input id="productImageFile" type="file" accept="image/png,image/jpeg,image/webp,image/gif"><small>Tải ảnh mới hoặc giữ ảnh hiện tại</small></label></div><div class="form-grid"><label class="field">Tên sản phẩm<input name="name" value="${escapeHtml(item.name)}" required></label><label class="field">Danh mục<select name="category">${categories.map(category => `<option ${item.category === category ? 'selected' : ''}>${category}</option>`).join('')}</select></label><label class="field">Giá bán<input name="price" type="number" min="0" value="${item.price}" required></label><label class="field">Giá gốc<input name="oldPrice" type="number" min="0" value="${item.oldPrice || ''}"></label><label class="field">Tồn kho<input name="stock" type="number" min="0" value="${item.stock}" required></label><label class="field">Huy hiệu<input name="badge" value="${escapeHtml(item.badge || '')}"></label><label class="field">Màu sắc<input name="color" value="${escapeHtml(item.color || '')}" required></label><label class="field">Kích cỡ<input name="sizes" value="${escapeHtml((item.sizes || []).join(', '))}" required></label></div><label class="field">Mô tả<textarea name="description" required>${escapeHtml(item.description || '')}</textarea></label><label class="field">Đường dẫn ảnh<input name="image" value="${escapeHtml(item.image || '')}" placeholder="Để trống để dùng ảnh mẫu"></label><div class="form-actions"><p>Dữ liệu được áp dụng ngay sau khi lưu.</p><button class="button primary" type="submit">Lưu sản phẩm</button></div></form>`);
}

function userEditor(user = null) {
  const item = user || { name: '', email: '', joined: new Date().toLocaleDateString('vi-VN'), orders: 0, status: 'active' };
  openModal(`<div class="modal-head"><div><span class="kicker">USER EDITOR</span><h2>${user ? 'Sửa người dùng' : 'Thêm người dùng'}</h2></div><button class="close-modal" data-close-modal>×</button></div><form class="section-form" id="userForm" data-user-id="${user?.id || ''}"><div class="form-grid"><label class="field">Họ và tên<input name="name" value="${escapeHtml(item.name)}" required></label><label class="field">Email<input name="email" type="email" value="${escapeHtml(item.email)}" required></label><label class="field">Ngày tham gia<input name="joined" value="${escapeHtml(item.joined)}" required></label><label class="field">Số đơn hàng<input name="orders" type="number" min="0" value="${item.orders}" required></label><label class="field">Trạng thái<select name="status"><option value="active" ${item.status === 'active' ? 'selected' : ''}>Hoạt động</option><option value="locked" ${item.status === 'locked' ? 'selected' : ''}>Đã khóa</option></select></label></div><button class="button primary" type="submit">Lưu người dùng</button></form>`);
}

function orderEditor(order) {
  openModal(`<div class="modal-head"><div><span class="kicker">ORDER DETAIL</span><h2>${escapeHtml(order.id)}</h2></div><button class="close-modal" data-close-modal>×</button></div><form class="section-form" id="orderForm" data-order-id="${escapeHtml(order.id)}"><div class="form-grid"><label class="field">Khách hàng<input name="customer" value="${escapeHtml(order.customer)}" required></label><label class="field">Email<input name="email" type="email" value="${escapeHtml(order.email)}" required></label><label class="field">Ngày đặt<input name="date" value="${escapeHtml(order.date)}" required></label><label class="field">Tổng tiền<input name="total" type="number" min="0" value="${order.total}" required></label><label class="field">Thanh toán<input name="payment" value="${escapeHtml(order.payment)}" required></label><label class="field">Trạng thái<select name="status">${['pending','processing','shipped','completed','canceled'].map(status => `<option value="${status}" ${order.status === status ? 'selected' : ''}>${statusLabel(status)}</option>`).join('')}</select></label></div><label class="field">Danh sách sản phẩm (JSON)<textarea class="code-editor" name="items" required>${escapeHtml(JSON.stringify(order.items || [], null, 2))}</textarea></label><button class="button primary" type="submit">Lưu đơn hàng</button></form>`);
}

function refreshPreview() {
  const frame = document.querySelector('#storePreview');
  if (frame) frame.src = `./index.html?preview=${Date.now()}#/shop`;
}

async function loadMedia() {
  try {
    const response = await fetch('/api/uploads', { cache: 'no-store' });
    mediaFiles = response.ok ? await response.json() : [];
  } catch { mediaFiles = []; }
}

async function initializeCms() {
  try {
    await Promise.all([loadStoreData(), loadMedia()]);
    render();
  } catch (error) {
    serverOnline = false;
    connectionText.textContent = 'Mất kết nối dữ liệu';
    setSaveState('Không thể tải dữ liệu', 'error');
    cmsContent.innerHTML = `<div class="empty"><h2>Không thể kết nối tệp dữ liệu</h2><p>${escapeHtml(error.message)}</p><p>Hãy mở website bằng START-UEF-SHOP.cmd.</p></div>`;
  }
}

document.querySelector('#adminLoginForm').addEventListener('submit', async event => {
  event.preventDefault();
  const email = document.querySelector('#adminEmail').value.trim();
  const password = document.querySelector('#adminPassword').value;
  if (email !== 'admin@demo.vn' || password !== 'admin123') {
    document.querySelector('#loginError').textContent = 'Email hoặc mật khẩu không đúng.';
    return;
  }
  sessionStorage.setItem('uef_admin_authenticated', 'true');
  loginScreen.hidden = true;
  cmsApp.hidden = false;
  await initializeCms();
});

document.querySelector('#logoutButton').addEventListener('click', () => {
  sessionStorage.removeItem('uef_admin_authenticated');
  cmsApp.hidden = true;
  loginScreen.hidden = false;
});

document.addEventListener('click', async event => {
  const target = event.target.closest('button, [data-section]');
  if (!target) return;
  try {
    if (target.dataset.section) {
      activeSection = target.dataset.section;
      location.hash = activeSection;
      if (activeSection === 'media') await loadMedia();
      render();
    }
    if (target.dataset.closeModal !== undefined) closeModal();
    if (target.dataset.previewSize) {
      document.querySelectorAll('[data-preview-size]').forEach(button => button.classList.toggle('active', button === target));
      document.querySelector('#previewStage')?.classList.toggle('mobile', target.dataset.previewSize === 'mobile');
    }
    if (target.dataset.newProduct !== undefined) productEditor();
    if (target.dataset.editProduct) productEditor(store.products.find(product => product.id === Number(target.dataset.editProduct)));
    if (target.dataset.toggleProduct) {
      const product = store.products.find(item => item.id === Number(target.dataset.toggleProduct));
      product.visible = product.visible === false;
      await saveStoreData('Đã cập nhật trạng thái sản phẩm.');
      render();
    }
    if (target.dataset.deleteProduct) {
      const product = store.products.find(item => item.id === Number(target.dataset.deleteProduct));
      if (confirm(`Xóa sản phẩm “${product.name}”? Thao tác này không thể hoàn tác.`)) {
        store.products = store.products.filter(item => item.id !== product.id);
        await saveStoreData('Đã xóa sản phẩm.');
        render();
      }
    }
    if (target.dataset.exportProducts !== undefined) downloadJson(store.products, `uef-shop-products-${new Date().toISOString().slice(0,10)}.json`);
    if (target.dataset.editOrder) orderEditor(store.orders.find(order => order.id === target.dataset.editOrder));
    if (target.dataset.deleteOrder) {
      if (confirm(`Xóa đơn hàng ${target.dataset.deleteOrder}?`)) {
        store.orders = store.orders.filter(order => order.id !== target.dataset.deleteOrder);
        await saveStoreData('Đã xóa đơn hàng.');
        render();
      }
    }
    if (target.dataset.newUser !== undefined) userEditor();
    if (target.dataset.editUser) userEditor(store.users.find(user => user.id === Number(target.dataset.editUser)));
    if (target.dataset.toggleUser) {
      const user = store.users.find(item => item.id === Number(target.dataset.toggleUser));
      user.status = user.status === 'active' ? 'locked' : 'active';
      await saveStoreData('Đã cập nhật trạng thái người dùng.');
      render();
    }
    if (target.dataset.deleteUser) {
      const user = store.users.find(item => item.id === Number(target.dataset.deleteUser));
      if (confirm(`Xóa người dùng “${user.name}”?`)) {
        store.users = store.users.filter(item => item.id !== user.id);
        await saveStoreData('Đã xóa người dùng.');
        render();
      }
    }
    if (target.dataset.copyMedia) {
      await navigator.clipboard.writeText(target.dataset.copyMedia);
      toast('Đã sao chép đường dẫn ảnh.');
    }
    if (target.dataset.deleteMedia) {
      if (confirm(`Xóa ảnh ${target.dataset.deleteMedia}?`)) {
        const response = await fetch(`/api/uploads/${encodeURIComponent(target.dataset.deleteMedia)}`, { method: 'DELETE' });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Không thể xóa ảnh.');
        await loadMedia();
        render();
        toast('Đã xóa ảnh khỏi thư viện.');
      }
    }
    if (target.dataset.exportData !== undefined) downloadJson({ version: 1, exportedAt: new Date().toISOString(), ...storePayload() }, `uef-shop-backup-${new Date().toISOString().slice(0,10)}.json`);
    if (target.dataset.reloadData !== undefined) { await loadStoreData(); render(); toast('Đã tải lại dữ liệu từ ổ đĩa.'); }
  } catch (error) { toast(error.message, 'error'); }
});

document.addEventListener('submit', async event => {
  if (!['appearanceForm','contentForm','productForm','userForm','orderForm','jsonEditorForm'].includes(event.target.id)) return;
  event.preventDefault();
  try {
    const form = event.target;
    const values = Object.fromEntries(new FormData(form).entries());
    if (form.id === 'appearanceForm') {
      Object.assign(store.site, values);
      await saveStoreData('Giao diện cửa hàng đã được cập nhật.');
      render();
    }
    if (form.id === 'contentForm') {
      const heroFile = document.querySelector('#heroFile').files[0];
      const catalogFile = document.querySelector('#catalogFile').files[0];
      if (heroFile) values.heroImage = await uploadImage(heroFile);
      if (catalogFile) values.catalogImage = await uploadImage(catalogFile);
      values.benefits = [0,1,2].map(index => ({ title: values[`benefitTitle${index}`], text: values[`benefitText${index}`] }));
      [0,1,2].forEach(index => { delete values[`benefitTitle${index}`]; delete values[`benefitText${index}`]; });
      Object.assign(store.site, values);
      await saveStoreData('Nội dung website đã được cập nhật.');
      render();
    }
    if (form.id === 'productForm') {
      const productId = Number(form.dataset.productId);
      const current = store.products.find(product => product.id === productId);
      const file = document.querySelector('#productImageFile').files[0];
      const item = {
        name: values.name.trim(), category: values.category, price: Number(values.price), oldPrice: Number(values.oldPrice) || null,
        stock: Number(values.stock), badge: values.badge.trim(), color: values.color.trim(),
        sizes: values.sizes.split(',').map(size => size.trim()).filter(Boolean), description: values.description.trim(),
        image: file ? await uploadImage(file) : values.image.trim(), visible: current ? current.visible !== false : true,
        sprite: current?.sprite || [0, 0]
      };
      if (current) Object.assign(current, item);
      else store.products.push({ id: store.products.length ? Math.max(...store.products.map(product => product.id)) + 1 : 1, ...item });
      await saveStoreData(current ? 'Đã cập nhật sản phẩm.' : 'Đã thêm sản phẩm mới.');
      closeModal(); render();
    }
    if (form.id === 'userForm') {
      const userId = Number(form.dataset.userId);
      const current = store.users.find(user => user.id === userId);
      const item = { name: values.name.trim(), email: values.email.trim(), joined: values.joined.trim(), orders: Number(values.orders), status: values.status };
      if (current) Object.assign(current, item);
      else store.users.push({ id: store.users.length ? Math.max(...store.users.map(user => user.id)) + 1 : 1, ...item });
      await saveStoreData(current ? 'Đã cập nhật người dùng.' : 'Đã thêm người dùng mới.');
      closeModal(); render();
    }
    if (form.id === 'orderForm') {
      const order = store.orders.find(item => item.id === form.dataset.orderId);
      Object.assign(order, { customer: values.customer.trim(), email: values.email.trim(), date: values.date.trim(), total: Number(values.total), payment: values.payment.trim(), status: values.status, items: JSON.parse(values.items) });
      await saveStoreData('Đã cập nhật đơn hàng.');
      closeModal(); render();
    }
    if (form.id === 'jsonEditorForm') {
      const parsed = JSON.parse(document.querySelector('#jsonEditor').value);
      if (!parsed.site || !Array.isArray(parsed.products) || !Array.isArray(parsed.orders) || !Array.isArray(parsed.users)) throw new Error('JSON phải có site, products, orders và users.');
      store = { site: parsed.site, products: parsed.products, orders: parsed.orders, users: parsed.users };
      await saveStoreData('Toàn bộ dữ liệu JSON đã được lưu.');
      render();
    }
  } catch (error) { toast(error.message, 'error'); setSaveState('Có lỗi cần kiểm tra', 'error'); }
});

document.addEventListener('input', event => {
  if (event.target.id === 'productSearch') { productSearch = event.target.value; render(); document.querySelector('#productSearch')?.focus(); }
  if (event.target.closest('form')) setSaveState('Có thay đổi chưa lưu');
});

document.addEventListener('change', async event => {
  try {
    if (event.target.dataset.orderStatus) {
      const order = store.orders.find(item => item.id === event.target.dataset.orderStatus);
      order.status = event.target.value;
      await saveStoreData(`Đơn ${order.id} đã chuyển sang ${statusLabel(order.status)}.`);
      render();
    }
    if (event.target.id === 'mediaUpload' && event.target.files.length) {
      for (const file of event.target.files) await uploadImage(file);
      await loadMedia();
      render();
      setSaveState('Ảnh đã được tải lên', 'saved');
      toast('Đã thêm ảnh vào thư viện.');
    }
    if (event.target.id === 'importDataFile' && event.target.files[0]) {
      const parsed = JSON.parse(await event.target.files[0].text());
      if (!parsed.site || !Array.isArray(parsed.products) || !Array.isArray(parsed.orders) || !Array.isArray(parsed.users)) throw new Error('Tệp JSON không đúng cấu trúc UEF SHOP.');
      store = { site: parsed.site, products: parsed.products, orders: parsed.orders, users: parsed.users };
      await saveStoreData('Đã nhập và khôi phục toàn bộ dữ liệu.');
      render();
    }
  } catch (error) { toast(error.message, 'error'); }
});

function downloadJson(value, fileName) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
}

modalBackdrop.addEventListener('click', closeModal);
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !cmsModal.hidden) closeModal(); });
window.addEventListener('hashchange', async () => {
  activeSection = location.hash.replace('#', '') || 'dashboard';
  if (activeSection === 'media') await loadMedia();
  render();
});

if (sessionStorage.getItem('uef_admin_authenticated') === 'true') {
  loginScreen.hidden = true;
  cmsApp.hidden = false;
  void initializeCms();
}
