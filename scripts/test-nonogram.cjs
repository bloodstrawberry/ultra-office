// node scripts/test-nonogram.cjs [--ocr | image.png]
// Optional image integration test requires @napi-rs/canvas (NODE_PATH may point to a runtime bundle).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const cacheRoot = 'node_modules/.cache/nonogram-tests';

function load(name, overrides = {}) {
  const filename = path.resolve('src/sections/puzzle/utils', `${name}.ts`);
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const output = { exports: {} };
  new Function('require', 'module', 'exports', code)(
    (id) => overrides[id] || require(id),
    output,
    output.exports
  );
  return output.exports;
}
const clues = load('nonogram-clues');
const solver = load('nonogram-solver');
assert.deepEqual(clues.parseClueText('10 2\n0\n?'), [[10, 2], [0], []]);
assert.ok(clues.validateClues([[0, 1]], [[1]]).length);
assert.ok(clues.validateClues([[2]], [[0], [0]]).length);
assert.throws(() => clues.solveNonogramClues([[1], [1]], [[2], [1]]));
assert.throws(() => clues.solveNonogramClues([[2], [0]], [[0], [2]]), /해답이 없습니다/);
for (const preset of solver.NONOGRAM_PRESETS) {
  const solution = clues.solveNonogramClues(preset.rowClues, preset.colClues);
  assert.deepEqual(solver.generateClues(solution), {
    rowClues: preset.rowClues,
    colClues: preset.colClues,
  });
}
assert.deepEqual(clues.solveNonogramClues([[0]], [[0], [0]]), [[0, 0]]);
assert.deepEqual(
  clues.solveNonogramClues(
    [[10]],
    Array.from({ length: 10 }, () => [1])
  ),
  [Array(10).fill(1)]
);
console.log(
  'PASS: clue parsing, invalid/unsatisfiable clues, empty lines, multi-digit clues and all built-in puzzles'
);

async function integration(imagePath) {
  const { createCanvas, loadImage } = require('@napi-rs/canvas');
  const tesseract = require('tesseract.js');
  global.document = { createElement: () => createCanvas(1, 1) };
  const ocr = load('nonogram-ocr', {
    './nonogram-clues': clues,
    './sudoku-ocr': {},
    'tesseract.js': {
      ...tesseract,
      createWorker: async (language, mode, options, config) => {
        const cachePath = path.resolve(cacheRoot, options.cachePath);
        fs.mkdirSync(cachePath, { recursive: true });
        const worker = await tesseract.createWorker(
          language,
          mode,
          { ...options, cachePath },
          config
        );
        const recognize = worker.recognize.bind(worker);
        worker.recognize = (canvas) => recognize(canvas.toBuffer('image/png'));
        return worker;
      },
    },
  });
  const img = await loadImage(imagePath);
  const canvas = createCanvas(img.width, img.height);
  canvas.getContext('2d').drawImage(img, 0, 0);
  const layout = ocr.detectNonogramLayout(canvas);
  console.log('Detected layout:', layout);
  assert.ok(layout);
  const results = [];
  let lastMessage = '';
  await ocr.recognizeNonogram(
    canvas,
    layout,
    ['fast', 'best', 'legacy'],
    (message) => {
      const model = message.split(' · ')[0];
      if (model !== lastMessage) {
        console.log(message);
        lastMessage = model;
      }
    },
    (result) => {
      results.push(result);
      console.log(JSON.stringify(result, null, 2));
    },
    new AbortController().signal
  );
  fs.mkdirSync(cacheRoot, { recursive: true });
  fs.writeFileSync(
    path.join(cacheRoot, 'nonogram-ocr-results.json'),
    JSON.stringify({ layout, results }, null, 2)
  );
  assert.equal(results.length, 3);
  assert.ok(
    results.every((result) => result.rows),
    'Every model must run successfully'
  );
  if (process.argv[2] === '--ocr') {
    assert.equal(layout.rows, 10);
    assert.equal(layout.cols, 10);
    for (const result of results.filter((r) => r.id === 'best' || r.id === 'legacy')) {
      assert.equal(result.rows, '6 2\n1 2 2\n1 1 3\n2 1 2\n7\n1 1 1\n1 7\n4 1 1\n2 2 1\n3 5');
      assert.equal(result.cols, '5 4\n1 2 3\n1 1 1 1\n2 1 2\n7\n1 1 4\n4 2\n2 1 1\n3 1 1\n3 5');
    }
  }
  assert.ok(
    results.some((r) => r.rows && !r.errors.length),
    'At least one model should produce consistent clues'
  );
  for (const result of results.filter((r) => !r.errors.length)) {
    const rows = clues.parseClueText(result.rows);
    const cols = clues.parseClueText(result.cols);
    const solution = clues.solveNonogramClues(rows, cols);
    assert.deepEqual(solver.generateClues(solution), { rowClues: rows, colClues: cols });
  }
  console.log('PASS: image detection, three real OCR models, recognized clue solution round trip');
}
if (process.argv[2])
  integration(
    process.argv[2] === '--ocr' ? 'scripts/fixtures/nonogram-10x10.png' : process.argv[2]
  ).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
