// Run the dev server and test-nonogram.cjs --ocr first. Requires Playwright via NODE_PATH.
const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require('playwright');
const cacheRoot = path.resolve('node_modules/.cache/nonogram-tests');

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
    const headers = {
      'access-control-allow-origin': '*',
      'cross-origin-resource-policy': 'cross-origin',
    };
    // Replay the exact downloaded model data and installed engine, without depending on CDN availability.
    await context.route('https://cdn.jsdelivr.net/npm/tesseract.js@*/dist/worker.min.js', (route) =>
      route.fulfill({
        path: path.resolve('node_modules/tesseract.js/dist/worker.min.js'),
        contentType: 'application/javascript',
        headers,
      })
    );
    await context.route('https://cdn.jsdelivr.net/npm/tesseract.js-core@*/**', (route) => {
      const file = path.basename(new URL(route.request().url()).pathname);
      return route.fulfill({
        path: path.resolve('node_modules/tesseract.js-core', file),
        contentType: file.endsWith('.wasm') ? 'application/wasm' : 'application/javascript',
        headers,
      });
    });
    await context.route(
      'https://raw.githubusercontent.com/tesseract-ocr/*/4.1.0/eng.traineddata',
      (route) => {
        const fast = route.request().url().includes('/tessdata_fast/');
        return route.fulfill({
          path: path.join(
            cacheRoot,
            fast ? 'nonogram-tessdata_fast-fast-4.1.0' : 'nonogram-tessdata-legacy-4.1.0',
            'eng.traineddata'
          ),
          contentType: 'application/octet-stream',
          headers,
        });
      }
    );
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('http://localhost:8083/puzzle/nonogram/', { timeout: 120000 });
    await page.getByRole('button', { name: '문제 이미지 읽기 · 숫자 모델 비교' }).click();
    await page.locator('input[type=file]').setInputFiles('scripts/fixtures/nonogram-10x10.png');
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: '선택한 모델로 인식·비교' }).click();
    const choices = dialog.locator('button:has-text("이 표를 적용 대상으로 선택")');
    await choices.nth(2).waitFor({ timeout: 120000 });
    assert.equal(await choices.count(), 3);
    const firstLegacyRow = dialog.getByLabel('Legacy · 숫자 전용 모드 행 1 단서 4');
    assert.equal(await firstLegacyRow.inputValue(), '6');
    await firstLegacyRow.fill('?');
    assert.ok(await dialog.getByRole('button', { name: '선택한 표로 문제 적용' }).isDisabled());
    await firstLegacyRow.fill('6');
    await dialog.screenshot({ path: path.join(cacheRoot, 'nonogram-comparison.png') });
    await dialog.getByRole('button', { name: '선택한 표로 문제 적용' }).click();
    await dialog.waitFor({ state: 'hidden' });
    assert.ok((await page.locator('body').innerText()).includes('nonogram-10x10'));
    assert.deepEqual(errors, []);
    console.log(
      'PASS: browser upload, three models, clue correction/validation, puzzle application, no page errors'
    );
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: '문제 이미지 읽기 · 숫자 모델 비교' }).click();
    assert.ok(await dialog.isVisible());
    const bounds = await dialog.boundingBox();
    assert.ok(bounds.width <= 390);
    await dialog.screenshot({
      path: path.join(cacheRoot, 'nonogram-mobile.png'),
      animations: 'disabled',
    });
    console.log('PASS: mobile dialog viewport');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
