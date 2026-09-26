import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const menuData = JSON.parse(fs.readFileSync(path.join(projectRoot, 'data/loqum-menu.json'), 'utf-8'));
const assetData = JSON.parse(fs.readFileSync(path.join(projectRoot, 'data/loqum-assets.json'), 'utf-8'));

const targets = [
  ...menuData.categories.map(c => ({ url: c.remoteUrl, dest: path.join(projectRoot, 'public', c.localPath) })),
  { url: assetData.logos.headerLogo.remoteUrl, dest: path.join(projectRoot, 'public', assetData.logos.headerLogo.localPath) },
  { url: assetData.logos.sidebarLogo.remoteUrl, dest: path.join(projectRoot, 'public', assetData.logos.sidebarLogo.localPath) },
  ...assetData.icons.map(i => ({ url: i.remoteUrl, dest: path.join(projectRoot, 'public', i.localPath) }))
];

async function downloadFile(url, destPath) {
  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(destPath, buffer);
    console.log(`[OK] Indirildi: ${path.basename(destPath)}`);
  } catch (err) {
    console.warn(`[WARN] ${path.basename(destPath)} indirilemedi (${err.message}). Fallback remoteUrl kullanılacak.`);
  }
}

async function run() {
  console.log('Loqum Et gorsel varliklari indiriliyor...');
  for (const item of targets) {
    await downloadFile(item.url, item.dest);
  }
  console.log('Indirme islemi tamamlandi.');
}

run();

