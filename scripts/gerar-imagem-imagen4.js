// Gera imagem via Google Imagen 4 (não aceita refs visuais — só texto).
//
// Uso:
//   node --env-file=.env scripts/gerar-imagem-imagen4.js \
//        "PROMPT" "saida.png" [aspect] [variant]
//   aspect:  1:1 | 3:4 | 4:3 | 9:16 | 16:9   (default 3:4)
//   variant: standard | ultra | fast          (default standard)
//

const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const [prompt, outPath, aspectArg, variantArg] = process.argv.slice(2);

if (!prompt || !outPath) {
  console.error('Uso: gerar-imagem-imagen4.js "PROMPT" "saida.png" [aspect] [variant]');
  process.exit(1);
}
if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY ausente no .env');
  process.exit(1);
}

const aspectRatio = aspectArg || '3:4';
const variant = variantArg || 'standard';

const modelMap = {
  standard: 'imagen-4.0-generate-001',
  ultra: 'imagen-4.0-ultra-generate-001',
  fast: 'imagen-4.0-fast-generate-001',
};
const model = modelMap[variant];
if (!model) {
  console.error(`Variant inválida: ${variant}. Usar: standard | ultra | fast`);
  process.exit(1);
}

(async () => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  console.log(`→ Gerando (${model}, ${aspectRatio}):`);
  console.log(`  ${prompt.slice(0, 110)}${prompt.length > 110 ? '…' : ''}`);

  const t0 = Date.now();

  const response = await ai.models.generateImages({
    model,
    prompt,
    config: {
      numberOfImages: 1,
      aspectRatio,
      personGeneration: 'allow_adult',
    },
  });

  const img = response.generatedImages?.[0]?.image;
  if (!img?.imageBytes) {
    throw new Error('API não retornou imageBytes. Resposta: ' + JSON.stringify(response).slice(0, 300));
  }

  fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
  fs.writeFileSync(outPath, Buffer.from(img.imageBytes, 'base64'));

  const dt = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`✓ ${outPath} (${dt}s)`);
})().catch(err => {
  console.error('ERRO:', err.message);
  process.exit(1);
});
