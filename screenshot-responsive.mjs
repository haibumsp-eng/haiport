import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const url = 'http://localhost:3000';
const dir = './temporary screenshots';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

async function shot(label, width, height, scrollToAbout = false) {
  let n = 1;
  while (fs.existsSync(path.join(dir, `screenshot-${n}-${label}.png`))) n++;
  const outPath = path.join(dir, `screenshot-${n}-${label}.png`);

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: 'networkidle0' });

  if (scrollToAbout) {
    await page.evaluate(() => {
      document.getElementById('about').scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 1200));
  } else {
    await new Promise(r => setTimeout(r, 600));
  }

  await page.screenshot({ path: outPath, fullPage: false });
  await browser.close();
  console.log('Saved:', outPath);
}

await shot('mobile-hero',   375, 812);
await shot('mobile-about',  375, 812, true);
await shot('tablet-about',  900, 900, true);
await shot('desktop-about', 1440, 900, true);
