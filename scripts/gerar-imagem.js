// Gera imagem via OpenAI (gpt-image).
// Uso: node --env-file=.env scripts/gerar-imagem.js "PROMPT" "saida.png" [quality] [modelo]
//   quality: low | medium | high (default high)
//   modelo (opcional): 5º arg OU env OPENAI_IMAGE_MODEL. Default: gpt-image-1.
//                      Aceita: gpt-image-1 | gpt-image-2

const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const [prompt, outPath, qualityArg, modelArg] = process.argv.slice(2);

if (!prompt || !outPath) {
  console.error('Uso: node gerar-imagem.js "PROMPT" "saida.png" [low|medium|high] [gpt-image-1|gpt-image-2]');
  process.exit(1);
}

if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY ausente no .env');
  process.exit(1);
}

const quality = qualityArg || 'high';

const ALL_MODELS = ['gpt-image-1', 'gpt-image-2'];
const model = modelArg || process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
if (!ALL_MODELS.includes(model)) {
  console.error(`Modelo "${model}" desconhecido. Use um de: ${ALL_MODELS.join(', ')}`);
  process.exit(1);
}

(async () => {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  console.log(`→ Gerando (${model}, ${quality}, 1024x1536):`);
  console.log(`  ${prompt.slice(0, 100)}${prompt.length > 100 ? '…' : ''}`);

  const t0 = Date.now();
  const result = await client.images.generate({
    model,
    prompt,
    size: '1024x1536',
    quality,
    n: 1,
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
