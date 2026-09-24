// Run: node scripts/test-subtitle-remover-timeline.cjs
// Deliver pointer events before another render to cover the fast-release race.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const effects = [];
const React = {
  createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
  useRef: (current) => ({ current }),
  useState: (value) => [value, () => {}],
  useMemo: (fn) => fn(),
  useCallback: (fn) => fn,
  useEffect: (fn) => effects.push(fn),
};
const output = { exports: {} };
const code = ts.transpileModule(
  fs.readFileSync(
    'src/sections/video-master/components/subtitle-remover-timeline-track.tsx',
    'utf8'
  ),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.React,
      esModuleInterop: true,
    },
  }
).outputText;
new Function('require', 'module', 'exports', code)(
  (id) => (id === 'react' ? React : id),
  output,
  output.exports
);
global.window = new EventTarget();
const seeks = [];
const edits = [];
const tree = output.exports.SubtitleRemoverTimelineTrack({
  boxes: [{ id: 'a', startTime: 1, endTime: 3, y: 0.8, label: 'Subtitle' }],
  activeBoxId: 'a',
  currentTime: 2,
  duration: 10,
  isPlaying: false,
  onSeek: (time) => seeks.push(time),
  onSelectBox: () => {},
  onUpdateBoxTime: (...args) => edits.push(args),
  onAddBoxAtCurrentTime: () => {},
});
function flatten(node) {
  if (Array.isArray(node)) return node.flatMap(flatten);
  if (!node || typeof node !== 'object') return [];
  return [node, ...node.children.flatMap(flatten)];
}
const nodes = flatten(tree);
const track = nodes.find((node) => node.props.ref && node.props.onPointerDown);
const captured = new Set();
track.props.ref.current = {
  getBoundingClientRect: () => ({ left: 0, width: 1000 }),
  setPointerCapture: (id) => captured.add(id),
  hasPointerCapture: (id) => captured.has(id),
  releasePointerCapture: (id) => captured.delete(id),
};
const cleanups = effects.map((fn) => fn());
const event = (overrides = {}) => ({
  pointerId: 1,
  button: 0,
  buttons: 1,
  isPrimary: true,
  clientX: 200,
  preventDefault() {},
  stopPropagation() {},
  ...overrides,
});
const head = nodes.find(
  (node) => node !== track && node.props.onPointerDown === track.props.onPointerDown
);
head.props.onPointerDown(event());
assert.ok(captured.has(1));
track.props.onPointerMove(event({ clientX: 400 }));
assert.equal(seeks.at(-1), 4);
track.props.onPointerUp(event({ buttons: 0 }));
const releasedCount = seeks.length;
track.props.onPointerMove(event({ clientX: 800, buttons: 0 }));
assert.equal(seeks.length, releasedCount, 'release before rerender stops seeking');
assert.equal(captured.size, 0);
for (const end of ['onPointerCancel', 'onLostPointerCapture']) {
  head.props.onPointerDown(event());
  track.props[end](event());
  const count = seeks.length;
  track.props.onPointerMove(event({ clientX: 800 }));
  assert.equal(seeks.length, count, end);
}
head.props.onPointerDown(event());
let count = seeks.length;
track.props.onPointerMove(event({ pointerId: 2, clientX: 500 }));
assert.equal(seeks.length, count, 'other pointer cannot move playhead');
track.props.onPointerMove(event({ buttons: 0, clientX: 700 }));
assert.equal(seeks.length, count, 'missed release does not seek');
head.props.onPointerDown(event());
window.dispatchEvent(new Event('blur'));
count = seeks.length;
track.props.onPointerMove(event({ clientX: 700 }));
assert.equal(seeks.length, count, 'window blur stops drag');
head.props.onPointerDown(event({ button: 2, buttons: 2 }));
assert.equal(seeks.length, count, 'right click cannot start drag');
const clip = nodes.find((node) => node.props.key === 'a');
clip.props.onPointerDown(event());
track.props.onPointerMove(event({ clientX: 300 }));
assert.deepEqual(edits.at(-1), ['a', 2, 4]);
track.props.onPointerUp(event({ buttons: 0 }));
track.props.onPointerMove(event({ clientX: 500, buttons: 0 }));
assert.equal(edits.length, 1, 'clip drag also ends immediately');
cleanups.forEach((cleanup) => cleanup?.());
console.log(
  'PASS: fast playhead release, pointer capture, cancel, capture loss, missed release, window blur, pointer identity, right click and clip movement'
);
