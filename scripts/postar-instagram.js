// Posta um carrossel (ou imagem única) no Instagram via Meta Graph API.
//
// Uso:
//   node --env-file=.env scripts/postar-instagram.js <pasta-do-carrossel> [slug]
//
// Exemplo:
//   node --env-file=.env scripts/postar-instagram.js saidas/marketing/conteudo/educativo-tema-2026-05-30 meu-slug
//
// Lê os slides de <pasta>/instagram/slide-*.png e a legenda de <pasta>/legenda.md.
// As imagens precisam estar publicamente acessíveis em:
//   $SITE_URL/img/posts/<slug>/<arquivo>.png
// (a Meta busca a imagem por URL — não faz upload de bytes). Por isso o site
// já precisa estar deployado antes de rodar este script (ver skill /aprovar-post).
//
// Env necessárias: META_IG_USER_ID, META_PAGE_ACCESS_TOKEN, SITE_URL

const fs = require('fs');
const path = require('path');

const API = 'https://graph.facebook.com/v21.0';

const [folder, slugArg] = process.argv.slice(2);

if (!folder) {
  console.error('Uso: node postar-instagram.js <pasta-do-carrossel> [slug]');
  process.exit(1);
}
for (const k of ['META_IG_USER_ID', 'META_PAGE_ACCESS_TOKEN', 'SITE_URL']) {
  if (!process.env[k]) {
    console.error(`${k} ausente no .env`);
    process.exit(1);
  }
}

const IG_USER_ID = process.env.META_IG_USER_ID;
const TOKEN = process.env.META_PAGE_ACCESS_TOKEN;
const SITE_URL = process.env.SITE_URL.replace(/\/$/, '');

// slug: 2º argumento, ou derivado da pasta (tira sufixo -YYYY-MM-DD)
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

function caption() {
  const p = path.join(folder, 'legenda.md');
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8').trim() : '';
}

async function graph(endpoint, params) {
  const url = `${API}/${endpoint}`;
  const body = new URLSearchParams({ ...params, access_token: TOKEN });
  const res = await fetch(url, { method: 'POST', body });
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(`Graph API ${endpoint}: ${JSON.stringify(json.error || json)}`);
  }
  return json;
}

async function waitReady(creationId, tries = 10) {
  for (let i = 0; i < tries; i++) {
    const res = await fetch(`${API}/${creationId}?fields=status_code&access_token=${TOKEN}`);
    const json = await res.json();
    if (json.status_code === 'FINISHED') return;
    if (json.status_code === 'ERROR') throw new Error(`Container ${creationId} deu ERROR`);
    await new Promise(r => setTimeout(r, 3000));
  }
  throw new Error(`Container ${creationId} não ficou pronto a tempo`);
}

(async () => {
  const urls = slides();
  const cap = caption();
  console.log(`Instagram: ${urls.length} slide(s), slug "${slug}"`);

  let creationId;

  if (urls.length === 1) {
    // imagem única
    const c = await graph(`${IG_USER_ID}/media`, { image_url: urls[0], caption: cap });
    creationId = c.id;
  } else {
    // carrossel: 1 container por item, depois container CAROUSEL
    const children = [];
    for (const [i, url] of urls.entries()) {
      const item = await graph(`${IG_USER_ID}/media`, { image_url: url, is_carousel_item: 'true' });
      children.push(item.id);
      console.log(`  item ${i + 1}/${urls.length} ok (${item.id})`);
    }
    const carousel = await graph(`${IG_USER_ID}/media`, {
      media_type: 'CAROUSEL',
      children: children.join(','),
      caption: cap,
    });
    creationId = carousel.id;
  }

  await waitReady(creationId);
  const published = await graph(`${IG_USER_ID}/media_publish`, { creation_id: creationId });

  console.log(`✓ Instagram publicado. Media ID: ${published.id}`);
  console.log(`POST_ID=${published.id}`);
})().catch(err => {
  console.error(`✗ Falha Instagram: ${err.message}`);
  process.exit(1);
});
