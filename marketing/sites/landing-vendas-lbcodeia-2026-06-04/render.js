const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const outDir = path.join(__dirname, 'preview');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  const htmlPath = `file://${path.resolve(__dirname, 'index.html')}`;

  // desktop
  const desktop = await browser.newPage();
  await desktop.setViewportSize({ width: 1440, height: 900 });
  await desktop.goto(htmlPath);
  await desktop.waitForLoadState('networkidle');
  await desktop.waitForTimeout(1500);
  // trigger all reveals
  await desktop.evaluate(() => {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  });
  await desktop.waitForTimeout(500);
  await desktop.screenshot({ path: path.join(outDir, 'desktop.png'), fullPage: true });
  console.log('desktop.png');
  await desktop.close();

  // mobile
  const mobile = await browser.newPage();
  await mobile.setViewportSize({ width: 390, height: 844 });
  await mobile.goto(htmlPath);
  await mobile.waitForLoadState('networkidle');
  await mobile.waitForTimeout(1500);
  await mobile.evaluate(() => {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  });
  await mobile.waitForTimeout(500);
  await mobile.screenshot({ path: path.join(outDir, 'mobile.png'), fullPage: true });
  console.log('mobile.png');
  await mobile.close();

  await browser.close();
})();
