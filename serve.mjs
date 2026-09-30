import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, stat, readdir, unlink } from 'node:fs/promises';
import { extname, normalize, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const projectRoot = fileURLToPath(new URL('./', import.meta.url));
const distRoot = resolve(projectRoot, 'dist');
const dataDirectory = resolve(projectRoot, 'data');
const dataFile = resolve(dataDirectory, 'store-data.json');
const uploadsDirectory = resolve(distRoot, 'uploads');
const port = Number(process.env.PORT || 4173);
const host = '127.0.0.1';
const maxRequestBytes = 8 * 1024 * 1024;
const shopUrl = `http://${host}:${port}/#/shop`;
const adminUrl = `http://${host}:${port}/admin.html`;
const shouldOpenBrowser = process.argv.includes('--open');

function openAdminPage() {
  spawn('explorer.exe', [adminUrl], {
    detached: true,
    windowsHide: true,
    stdio: 'ignore'
  }).unref();
}

async function isUefShopRunning() {
  try {
    const response = await fetch(`http://${host}:${port}/api/health`, {
      signal: AbortSignal.timeout(1500),
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) return false;
    const health = await response.json();
    return health?.ok === true && health?.service === 'UEF SHOP Studio';
  } catch {
    return false;
  }
}

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

await mkdir(dataDirectory, { recursive: true });
await mkdir(uploadsDirectory, { recursive: true });

if (shouldOpenBrowser && await isUefShopRunning()) {
  console.log('');
  console.log(`UEF SHOP đang chạy sẵn tại cổng ${port}.`);
  console.log(`Đang mở trang quản trị: ${adminUrl}`);
  openAdminPage();
  process.exit(0);
}

function sendJson(response, status, value) {
  response.writeHead(status, { 'Content-Type': mime['.json'], 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(value));
}

async function readJsonBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxRequestBytes) throw new Error('Tệp tải lên vượt quá giới hạn 8 MB.');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

function validateStoreData(value) {
  if (!value || typeof value !== 'object') throw new Error('Dữ liệu cửa hàng không hợp lệ.');
  if (!value.site || typeof value.site !== 'object') throw new Error('Thiếu cấu hình giao diện.');
  if (!Array.isArray(value.products) || !Array.isArray(value.orders) || !Array.isArray(value.users)) {
    throw new Error('Danh sách sản phẩm, đơn hàng hoặc người dùng không hợp lệ.');
  }
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    site: value.site,
    products: value.products,
    orders: value.orders,
    users: value.users
  };
}

async function handleApi(request, response, pathname) {
  if (pathname === '/api/health' && request.method === 'GET') {
    sendJson(response, 200, { ok: true, service: 'UEF SHOP Studio', dataFile });
    return true;
  }

  if (pathname === '/api/store-data' && request.method === 'GET') {
    try {
      const data = JSON.parse(await readFile(dataFile, 'utf8'));
      sendJson(response, 200, data);
    } catch (error) {
      sendJson(response, 500, { error: `Không thể đọc dữ liệu: ${error.message}` });
    }
    return true;
  }

  if (pathname === '/api/store-data' && request.method === 'PUT') {
    try {
      const data = validateStoreData(await readJsonBody(request));
      await writeFile(dataFile, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
      sendJson(response, 200, { ok: true, updatedAt: data.updatedAt });
    } catch (error) {
      sendJson(response, 400, { error: error.message });
    }
    return true;
  }

  if (pathname === '/api/upload' && request.method === 'POST') {
    try {
      const payload = await readJsonBody(request);
      const match = String(payload.dataUrl || '').match(/^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=]+)$/);
      if (!match) throw new Error('Chỉ hỗ trợ ảnh PNG, JPG, WEBP hoặc GIF.');
      const extension = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp', 'image/gif': '.gif' }[match[1]];
      const baseName = basename(String(payload.filename || 'image'), extname(String(payload.filename || 'image')))
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'image';
      const fileName = `${Date.now()}-${baseName}${extension}`;
      const buffer = Buffer.from(match[2], 'base64');
      if (buffer.length > 5 * 1024 * 1024) throw new Error('Ảnh vượt quá giới hạn 5 MB.');
      await writeFile(resolve(uploadsDirectory, fileName), buffer);
      sendJson(response, 201, { ok: true, path: `./uploads/${fileName}` });
    } catch (error) {
      sendJson(response, 400, { error: error.message });
    }
    return true;
  }

  if (pathname === '/api/uploads' && request.method === 'GET') {
    try {
      const entries = await readdir(uploadsDirectory, { withFileTypes: true });
      const files = await Promise.all(entries.filter(entry => entry.isFile()).map(async entry => {
        const details = await stat(resolve(uploadsDirectory, entry.name));
        return { name: entry.name, path: `./uploads/${entry.name}`, size: details.size, modifiedAt: details.mtime.toISOString() };
      }));
      files.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
      sendJson(response, 200, files);
    } catch (error) {
      sendJson(response, 500, { error: error.message });
    }
    return true;
  }

  if (pathname.startsWith('/api/uploads/') && request.method === 'DELETE') {
    try {
      const requestedName = decodeURIComponent(pathname.slice('/api/uploads/'.length));
      const safeName = basename(requestedName);
      if (!safeName || safeName !== requestedName) throw new Error('Tên tệp không hợp lệ.');
      await unlink(resolve(uploadsDirectory, safeName));
      sendJson(response, 200, { ok: true });
    } catch (error) {
      sendJson(response, 400, { error: error.message });
    }
    return true;
  }

  return false;
}

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, `http://${host}:${port}`).pathname);
    if (await handleApi(request, response, pathname)) return;

    const requestedPath = pathname === '/' ? 'index.html' : normalize(pathname).replace(/^[\\/]+/, '');
    let filePath = resolve(distRoot, requestedPath);
    if (!filePath.startsWith(distRoot)) throw new Error('Invalid path');
    if ((await stat(filePath)).isDirectory()) filePath = resolve(filePath, 'index.html');
    const body = await readFile(filePath);
    response.writeHead(200, { 'Content-Type': mime[extname(filePath).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(body);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
});

server.on('error', async error => {
  if (error.code === 'EADDRINUSE') {
    if (await isUefShopRunning()) {
      console.log('');
      console.log(`UEF SHOP đang chạy sẵn tại cổng ${port}.`);
      console.log(`Trang quản trị: ${adminUrl}`);
      if (shouldOpenBrowser) openAdminPage();
      process.exit(0);
    }

    console.error('');
    console.error(`Không thể khởi động vì cổng ${port} đang được chương trình khác sử dụng.`);
    console.error('Hãy đóng chương trình đang dùng cổng này rồi mở lại UEF SHOP.');
    process.exit(1);
  }

  console.error(`Không thể khởi động UEF SHOP: ${error.message}`);
  process.exit(1);
});

server.listen(port, host, () => {
  console.log('');
  console.log('UEF SHOP đã sẵn sàng');
  console.log(`Cửa hàng: ${shopUrl}`);
  console.log(`Quản trị: ${adminUrl}`);
  console.log('Nhấn Ctrl+C để dừng máy chủ.');
  if (shouldOpenBrowser) openAdminPage();
});
