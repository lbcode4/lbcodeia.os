// Edita imagem via OpenAI gpt-image-1 (images.edit), com 1+ imagens de entrada.
// Uso: node --env-file=.env scripts/editar-imagem-openai.js \
//        "PROMPT" "saida.png" "base.png" "ref1.png,ref2.png,..."

const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const { toFile } = require('openai');

const [prompt, outPath, basePath, refsArg] = process.argv.slice(2);

if (!prompt || !outPath || !basePath) {
  console.error('Uso: node editar-imagem-openai.js "PROMPT" "saida.png" "base.png" "ref1,ref2"');
  process.exit(1);
}
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY ausente no .env');
  process.exit(1);
}

const refs = refsArg ? refsArg.split(',').map(p => p.trim()).filter(Boolean) : [];
const allImages = [basePath, ...refs];

(async () => {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const mimeFor = p => {
    const ext = path.extname(p).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
    if (ext === '.webp') return 'image/webp';
    return 'image/png';
  };
  const images = await Promise.all(
    allImages.map(p => toFile(fs.createReadStream(p), path.basename(p), { type: mimeFor(p) }))
  );

  console.log(`→ Editando (gpt-image-1, ${images.length} imagens):`);
  console.log(`  ${prompt.slice(0, 110)}${prompt.length > 110 ? '…' : ''}`);

  const t0 = Date.now();
  const result = await client.images.edit({
    model: 'gpt-image-1',
    image: images,
    prompt,
    size: '1024x1536',
    quality: 'high',
  });

  const b64 = result.data[0].b64_json;
  if (!b64) throw new Error('API não retornou b64_json');

  fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
  fs.writeFileSync(outPath, Buffer.from(b64, 'base64'));

  const dt = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`✓ ${outPath} (${dt}s)`);
})().catch(err => {
  console.error('ERRO:', err.message);
  if (err.response) console.error(err.response.data);
  process.exit(1);
});
