// Gera imagem via Gemini (nano-banana) usando imagens de referência.
//
// Uso:
//   node --env-file=.env scripts/gerar-imagem-gemini.js \
//        "PROMPT" \
//        "saida.png" \
//        "ref1.png,ref2.png,ref3.png" \
//        [modelo]
//
// Modelo (opcional): 4º arg OU env GEMINI_IMAGE_MODEL. Default: gemini-2.5-flash-image.
// Aceita: gemini-2.5-flash-image | gemini-3-pro-image-preview | gemini-3.1-flash-image-preview
// O modelo escolhido é tentado primeiro; os demais ficam como fallback automático.

const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const [prompt, outPath, refsArg, modelArg] = process.argv.slice(2);

if (!prompt || !outPath) {
  console.error('Uso: node gerar-imagem-gemini.js "PROMPT" "saida.png" "ref1,ref2,..." [modelo]');
  process.exit(1);
}
if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY ausente no .env');
  process.exit(1);
}

const refs = refsArg ? refsArg.split(',').map(p => p.trim()).filter(Boolean) : [];

// Modelos disponíveis (ordem = prioridade default). Modelo escolhido vai pro topo.
const ALL_MODELS = [
  'gemini-2.5-flash-image',
  'gemini-3-pro-image-preview',
  'gemini-3.1-flash-image-preview',
];
const chosen = modelArg || process.env.GEMINI_IMAGE_MODEL;
if (chosen && !ALL_MODELS.includes(chosen)) {
  console.error(`Modelo "${chosen}" desconhecido. Use um de: ${ALL_MODELS.join(', ')}`);
  process.exit(1);
}
const tryModels = chosen
  ? [chosen, ...ALL_MODELS.filter(m => m !== chosen)]
  : ALL_MODELS;

(async () => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const parts = [];
  for (const r of refs) {
    const buf = fs.readFileSync(r);
    const ext = path.extname(r).toLowerCase().slice(1);
    const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
    parts.push({ inlineData: { mimeType: mime, data: buf.toString('base64') } });
    console.log(`  ref: ${r} (${(buf.length / 1024).toFixed(0)} KB)`);
  }
  parts.push({ text: prompt });

  console.log(`→ Gerando (${tryModels[0]}, ${refs.length} refs):`);
  console.log(`  ${prompt.slice(0, 110)}${prompt.length > 110 ? '…' : ''}`);

  const t0 = Date.now();

  let response, usedModel;
  let lastErr;
  for (const model of tryModels) {
    try {
      response = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts }],
        config: {
          responseModalities: ['IMAGE'],
        },
      });
      usedModel = model;
      break;
    } catch (e) {
      lastErr = e;
      console.error(`  modelo ${model} falhou: ${e.message?.slice(0, 140)}`);
    }
  }

  if (!response) {
    throw lastErr || new Error('Todos os modelos falharam');
  }

  const candidate = response.candidates?.[0];
  if (!candidate) throw new Error('Resposta sem candidate');

  const imgPart = candidate.content?.parts?.find(p => p.inlineData?.data);
  if (!imgPart) {
    const textPart = candidate.content?.parts?.find(p => p.text);
    throw new Error(`Sem imagem na resposta. Texto: ${textPart?.text?.slice(0, 200) || '(vazio)'}`);
  }

  fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
  fs.writeFileSync(outPath, Buffer.from(imgPart.inlineData.data, 'base64'));

  const dt = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`✓ ${outPath} (modelo: ${usedModel}, ${dt}s)`);
})().catch(err => {
  console.error('ERRO:', err.message);
  process.exit(1);
});
