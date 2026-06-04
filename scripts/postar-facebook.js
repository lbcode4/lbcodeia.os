// Posta um carrossel (ou imagem única) na Página do Facebook via Meta Graph API.
//
// Uso:
//   node --env-file=.env scripts/postar-facebook.js <pasta-do-carrossel> [slug]
//
// Estratégia: sobe cada slide como foto não-publicada (published=false) em /{page}/photos,
// pega os ids e cria um post no feed com attached_media (post multi-foto). A legenda vira
// a mensagem. As imagens são buscadas por URL pública ($SITE_URL/img/posts/<slug>/...),
// então o site precisa já estar deployado (ver skill /aprovar-post).
//
// Env necessárias: META_PAGE_ID, META_PAGE_ACCESS_TOKEN, SITE_URL

const fs = require('fs');
const path = require('path');

const API = 'https://graph.facebook.com/v21.0';

const [folder, slugArg] = process.argv.slice(2);

if (!folder) {
  console.error('Uso: node postar-facebook.js <pasta-do-carrossel> [slug]');
  process.exit(1);
}
for (const k of ['META_PAGE_ID', 'META_PAGE_ACCESS_TOKEN', 'SITE_URL']) {
  if (!process.env[k]) {
    console.error(`${k} ausente no .env`);
    process.exit(1);
  }
}

const PAGE_ID = process.env.META_PAGE_ID;
const TOKEN = process.env.META_PAGE_ACCESS_TOKEN;
const SITE_URL = process.env.SITE_URL.replace(/\/$/, '');

const slug = slugArg || path.basename(folder).replace(/-\d{4}-\d{2}-\d{2}$/, '');

function slides() {
  const dir = path.join(folder, 'instagram');
  if (!fs.existsSync(dir)) {
    console.error(`Pasta de slides não encontrada: ${dir}`);
    process.exit(1);
  }
  const files = fs.readdirSync(dir)
    .filter(f => /^slide-\d+\.png$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (files.length === 0) {
    console.error(`Nenhum slide-*.png em ${dir}`);
    process.exit(1);
  }
  return files.map(f => `${SITE_URL}/img/posts/${slug}/${f}`);
}

function message() {
  const p = path.join(folder, 'legenda.md');
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8').trim() : '';
}

async function graph(endpoint, params) {
  const body = new URLSearchParams({ ...params, access_token: TOKEN });
  const res = await fetch(`${API}/${endpoint}`, { method: 'POST', body });
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(`Graph API ${endpoint}: ${JSON.stringify(json.error || json)}`);
  }
  return json;
}

(async () => {
  const urls = slides();
  const msg = message();
  console.log(`Facebook: ${urls.length} slide(s), slug "${slug}"`);

  // imagem única → post de foto direto, publicado
  if (urls.length === 1) {
    const photo = await graph(`${PAGE_ID}/photos`, { url: urls[0], caption: msg, published: 'true' });
    const id = photo.post_id || photo.id;
    console.log(`✓ Facebook publicado. Post ID: ${id}`);
    console.log(`POST_ID=${id}`);
    return;
  }

  // multi-foto → subir cada uma não-publicada, depois feed com attached_media
  const mediaFbids = [];
  for (const [i, url] of urls.entries()) {
    const photo = await graph(`${PAGE_ID}/photos`, { url, published: 'false' });
    mediaFbids.push({ media_fbid: photo.id });
    console.log(`  foto ${i + 1}/${urls.length} ok (${photo.id})`);
  }

  const params = { message: msg };
  mediaFbids.forEach((m, i) => { params[`attached_media[${i}]`] = JSON.stringify(m); });

  const post = await graph(`${PAGE_ID}/feed`, params);
  console.log(`✓ Facebook publicado. Post ID: ${post.id}`);
  console.log(`POST_ID=${post.id}`);
})().catch(err => {
  console.error(`✗ Falha Facebook: ${err.message}`);
  process.exit(1);
});
