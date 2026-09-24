// Run: node scripts/test-subtitle-remover-history.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const output = { exports: {} };
new Function(
  'module',
  'exports',
  ts.transpileModule(
    fs.readFileSync('src/sections/video-master/utils/subtitle-remover-history.ts', 'utf8'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }
  ).outputText
)(output, output.exports);
const { createSubtitleEditHistory, subtitleEditHistoryReducer: reduce } = output.exports;
const initial = {
  boxes: [{ id: 'a', x: 0.1, width: 0.5, startTime: 0, endTime: 5 }],
  activeBoxId: 'a',
};
let state = createSubtitleEditHistory(initial);
const act = (action) => {
  state = reduce(state, action);
};
const move = (x) => act({ type: 'boxes', value: (boxes) => boxes.map((box) => ({ ...box, x })) });
act({ type: 'begin' });
for (let i = 1; i <= 30; i++) move(i / 100);
act({ type: 'end' });
assert.equal(state.past.length, 1, 'one drag is one undo entry');
act({ type: 'undo' });
assert.deepEqual(state.present, initial);
act({ type: 'redo' });
assert.equal(state.present.boxes[0].x, 0.3);
act({ type: 'boxes', value: [] });
act({ type: 'select', id: null });
act({ type: 'undo' });
assert.equal(state.present.activeBoxId, 'a', 'delete restores selection');
assert.equal(state.present.boxes.length, 1);
act({ type: 'redo' });
assert.equal(state.present.boxes.length, 0);
act({ type: 'undo' });
move(0.4);
assert.equal(state.future.length, 0, 'new edit clears redo');
act({ type: 'reset', snapshot: initial });
act({ type: 'begin' });
move(0.1);
act({ type: 'end' });
assert.equal(state.past.length, 0, 'no-op does not consume undo');
act({ type: 'select', id: null });
assert.equal(state.past.length, 0, 'selection alone does not consume undo');
for (let i = 0; i < 120; i++) move(i);
assert.equal(state.past.length, 100, 'history is bounded');
act({ type: 'reset', snapshot: initial });
assert.equal(state.past.length, 0);
assert.equal(state.future.length, 0);
act({ type: 'undo' });
assert.deepEqual(state.present, initial, 'new video cannot undo into previous video');
console.log(
  'PASS: grouped drag, undo/redo, deletion and selection restore, redo invalidation, no-op, history limit and video reset'
);
