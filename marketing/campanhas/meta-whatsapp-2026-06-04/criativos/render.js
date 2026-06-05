const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1080, height: 1350 });

  const htmlPath = 'file://' + path.resolve(__dirname, 'carrossel.html');
  await page.goto(htmlPath, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const slides = await page.$$('.slide');
  console.log(`Renderizando ${slides.length} slides...`);

  for (let i = 0; i < slides.length; i++) {
    const num = String(i + 1).padStart(2, '0');
    const outPath = path.resolve(__dirname, `instagram/slide-${num}.png`);
    await slides[i].screenshot({ path: outPath });
    console.log(`✅ slide-${num}.png`);
  }

  await browser.close();
  console.log('Pronto!');
})();
