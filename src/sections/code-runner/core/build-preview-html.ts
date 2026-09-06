// ----------------------------------------------------------------------
// Helper to transform React JSX / HTML code into a fully renderable HTML document
// ----------------------------------------------------------------------

export function buildReactPreviewHtml(rawJsxCode: string, files?: Record<string, string>): string {
  const jsonCode = JSON.stringify(rawJsxCode);

  let extraCss = '';
  if (files) {
    for (const [name, content] of Object.entries(files)) {
      if (name.endsWith('.css')) {
        extraCss += `\n/* ${name} */\n${content}\n`;
      }
    }
  }

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>React Live Sandbox</title>
  ${extraCss ? `<style>${extraCss}</style>` : ''}
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- React 18 & Babel Standalone CDN -->
  <script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone@7.26.9/babel.min.js" crossorigin></script>
  <!-- Lucide Icons UMD -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <!-- Canvas Confetti CDN -->
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js"></script>
  <!-- Lodash CDN -->
  <script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"></script>
  <!-- Day.js CDN -->
  <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.13/dayjs.min.js"></script>
  <!-- Chart.js CDN -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <!-- Rough.js CDN -->
  <script src="https://cdn.jsdelivr.net/npm/roughjs@4.5.2/bundled/rough.js"></script>
  <!-- Tone.js CDN -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js"></script>
  <!-- Fuse.js CDN -->
  <script src="https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.min.js"></script>
  <!-- PapaParse CSV CDN -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>
  <!-- Chroma.js CDN -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/chroma-js/2.4.2/chroma.min.js"></script>
  <!-- Anime.js CDN -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js"></script>
  <!-- Marked.js Markdown CDN -->
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <!-- KaTeX Math CDN -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" />
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <!-- QRCode.js CDN -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
  <!-- Math.js CDN -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/12.4.1/math.js"></script>
  <!-- Howler.js Audio CDN -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.4/howler.min.js"></script>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #ffffff;
      color: #0f172a;
      -webkit-font-smoothing: antialiased;
    }
    #root {
      width: 100%;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    #error-display {
      display: none;
      padding: 14px 18px;
      margin: 16px;
      background-color: #fef2f2;
      border: 1px solid #f87171;
      border-radius: 8px;
      color: #991b1b;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      line-height: 1.5;
      white-space: pre-wrap;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
  </style>
</head>
<body>
  <div id="error-display"></div>
  <div id="root"></div>

  <script>
    function showError(err) {
      var el = document.getElementById('error-display');
      if (el) {
        el.style.display = 'block';
        var message = (err && (err.stack || err.message)) ? (err.stack || err.message) : String(err);
        el.textContent = '❌ React Error:\\n' + message;
      }
      console.error(err);
    }

    window.onerror = function(msg, url, line, col, error) {
      showError(error || msg);
    };

    // Create a versatile Lucide Icon component factory for React Live
    function createLucideIconComponent(iconName) {
      return function LucideIconComponent(props) {
        var size = props.size || 20;
        var color = props.color || 'currentColor';
        var strokeWidth = props.strokeWidth || 2;
        var className = props.className || '';
        var style = props.style || {};

        // Convert PascalCase or camelCase to kebab-case
        var kebabName = iconName
          .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
          .toLowerCase();

        var ref = React.useRef(null);

        React.useEffect(function() {
          if (ref.current && window.lucide) {
            ref.current.innerHTML = '';
            var iconElem = document.createElement('i');
            iconElem.setAttribute('data-lucide', kebabName);
            iconElem.style.width = typeof size === 'number' ? size + 'px' : size;
            iconElem.style.height = typeof size === 'number' ? size + 'px' : size;
            iconElem.style.stroke = color;
            iconElem.style.strokeWidth = strokeWidth;
            if (className) iconElem.className = className;
            ref.current.appendChild(iconElem);
            window.lucide.createIcons({ root: ref.current });
          }
        }, [iconName, size, color, strokeWidth, className]);

        return React.createElement('span', {
          ref: ref,
          className: 'inline-flex items-center justify-center ' + className,
          style: Object.assign({ display: 'inline-flex', verticalAlign: 'middle' }, style)
        });
      };
    }

    // Proxy for lucide-react to generate dynamic icons
    var LucideReactProxy = new Proxy({}, {
      get: function(target, prop) {
        if (typeof prop === 'string') {
          return createLucideIconComponent(prop);
        }
        return undefined;
      }
    });

    // Framer Motion Light Proxy
    var MotionComponentProxy = new Proxy({}, {
      get: function(target, tag) {
        return function MotionElement(props) {
          var domProps = Object.assign({}, props);
          delete domProps.initial;
          delete domProps.animate;
          delete domProps.exit;
          delete domProps.transition;
          delete domProps.whileHover;
          delete domProps.whileTap;
          delete domProps.variants;
          return React.createElement(tag, domProps);
        };
      }
    });

    function executeReactSandbox() {
      try {
        if (typeof Babel === 'undefined' || typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
          throw new Error('React 또는 Babel 라이브러리를 로드 중입니다. 잠시 후 다시 시도해주세요.');
        }

        var sourceCode = ${jsonCode};

        // Transform JSX and ES modules with Babel
        var transformed = Babel.transform(sourceCode, {
          presets: [
            ['react', { runtime: 'classic' }],
            ['env', { modules: 'commonjs' }]
          ],
          filename: 'App.jsx'
        });

        var workspaceFiles = ${JSON.stringify(files || {})};
        var moduleCache = {};

        // CommonJS module environment
        var exports = {};
        var module = { exports: exports };

        function require(moduleName) {
          if (moduleName === 'react') return window.React;
          if (moduleName === 'react-dom' || moduleName === 'react-dom/client') return window.ReactDOM;
          if (moduleName === 'lucide-react' || moduleName === 'lucide') return LucideReactProxy;
          if (moduleName === 'canvas-confetti' || moduleName === 'confetti') return window.confetti;
          if (moduleName === 'lodash' || moduleName === 'lodash-es') return window._;
          if (moduleName === 'dayjs') return window.dayjs;
          if (moduleName === 'chart.js' || moduleName === 'chart.js/auto') return window.Chart;
          if (moduleName === 'roughjs' || moduleName === 'roughjs/bin/rough') return window.rough;
          if (moduleName === 'tone' || moduleName === 'Tone') return window.Tone;
          if (moduleName === 'fuse.js' || moduleName === 'fuse') return window.Fuse;
          if (moduleName === 'papaparse' || moduleName === 'Papa') return window.Papa;
          if (moduleName === 'chroma-js' || moduleName === 'chroma') return window.chroma;
          if (moduleName === 'animejs' || moduleName === 'anime') return window.anime;
          if (moduleName === 'marked') return window.marked;
          if (moduleName === 'katex') return window.katex;
          if (moduleName === 'qrcode') return window.QRCode;
          if (moduleName === 'mathjs' || moduleName === 'math') return window.math;
          if (moduleName === 'howler') return window.Howl;
          if (moduleName === 'framer-motion') return { motion: MotionComponentProxy, AnimatePresence: function(p) { return p.children; } };

          // Multi-file workspace resolution
          var cleanName = moduleName.startsWith('./') ? moduleName.slice(2) : (moduleName.startsWith('/') ? moduleName.slice(1) : moduleName);
          var candidates = [
            cleanName,
            cleanName + '.js',
            cleanName + '.jsx',
            cleanName + '.ts',
            cleanName + '.tsx',
            cleanName + '.json'
          ];
          var resolvedKey = candidates.find(function(k) { return Boolean(workspaceFiles && Object.prototype.hasOwnProperty.call(workspaceFiles, k)); });
          if (resolvedKey) {
            if (moduleCache[resolvedKey]) {
              return moduleCache[resolvedKey].exports;
            }
            if (resolvedKey.endsWith('.json')) {
              try {
                var parsed = JSON.parse(workspaceFiles[resolvedKey]);
                moduleCache[resolvedKey] = { exports: parsed };
                return parsed;
              } catch (e) {
                throw new Error('Failed to parse JSON file "' + resolvedKey + '": ' + e.message);
              }
            }
            var subTrans = Babel.transform(workspaceFiles[resolvedKey], {
              presets: [
                ['react', { runtime: 'classic' }],
                ['env', { modules: 'commonjs' }]
              ],
              filename: resolvedKey
            });
            var subModule = { exports: {} };
            moduleCache[resolvedKey] = subModule;
            var subFn = new Function(
              'React', 'ReactDOM', 'require', 'module', 'exports',
              'useState', 'useEffect', 'useReducer', 'useMemo', 'useCallback', 'useRef', 'useContext', 'createContext',
              'confetti', '_', 'dayjs', 'Chart', 'rough', 'Tone', 'Fuse', 'Papa', 'chroma', 'anime', 'marked', 'katex', 'QRCode', 'math', 'Howl', 'motion', 'LucideReact',
              subTrans.code
            );
            subFn(
              React, ReactDOM, require, subModule, subModule.exports,
              useState, useEffect, useReducer, useMemo, useCallback, useRef, useContext, createContext,
              confetti, _, dayjs, Chart, rough, Tone, Fuse, Papa, chroma, anime, marked, katex, QRCode, math, Howl, motion, LucideReactProxy
            );
            return subModule.exports;
          }

          return {};
        }

        // Expose top-level React hooks & libraries in scope
        var useState = React.useState;
        var useEffect = React.useEffect;
        var useReducer = React.useReducer;
        var useMemo = React.useMemo;
        var useCallback = React.useCallback;
        var useRef = React.useRef;
        var useContext = React.useContext;
        var createContext = React.createContext;
        var confetti = window.confetti;
        var _ = window._;
        var dayjs = window.dayjs;
        var Chart = window.Chart;
        var rough = window.rough;
        var Tone = window.Tone;
        var Fuse = window.Fuse;
        var Papa = window.Papa;
        var chroma = window.chroma;
        var anime = window.anime;
        var marked = window.marked;
        var katex = window.katex;
        var QRCode = window.QRCode;
        var math = window.math;
        var Howl = window.Howl;
        var motion = MotionComponentProxy;

        // Run the compiled code inside a clean scope
        var fn = new Function(
          'React', 'ReactDOM', 'require', 'module', 'exports',
          'useState', 'useEffect', 'useReducer', 'useMemo', 'useCallback', 'useRef', 'useContext', 'createContext',
          'confetti', '_', 'dayjs', 'Chart', 'rough', 'Tone', 'Fuse', 'Papa', 'chroma', 'anime', 'marked', 'katex', 'QRCode', 'math', 'Howl', 'motion', 'LucideReact',
          transformed.code
        );

        fn(
          React, ReactDOM, require, module, exports,
          useState, useEffect, useReducer, useMemo, useCallback, useRef, useContext, createContext,
          confetti, _, dayjs, Chart, rough, Tone, Fuse, Papa, chroma, anime, marked, katex, QRCode, math, Howl, motion, LucideReactProxy
        );

        // Find the exported component
        var TargetComponent = 
          module.exports.default || 
          module.exports.App || 
          exports.default || 
          exports.App || 
          (typeof App !== 'undefined' ? App : null) ||
          (typeof window.App !== 'undefined' ? window.App : null);

        if (!TargetComponent && typeof module.exports === 'function') {
          TargetComponent = module.exports;
        }

        if (TargetComponent) {
          var root = ReactDOM.createRoot(document.getElementById('root'));
          root.render(React.createElement(TargetComponent));
        } else {
          throw new Error("컴포넌트를 찾을 수 없습니다. 'export default function App()' 형식으로 컴포넌트를 내보내주세요.");
        }
      } catch (err) {
        showError(err);
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', executeReactSandbox);
    } else {
      executeReactSandbox();
    }
  </script>
</body>
</html>`;
}

export function buildHtmlPreview(rawHtml: string, files?: Record<string, string>): string {
  let extraCss = '';
  let extraJs = '';
  if (files) {
    for (const [name, content] of Object.entries(files)) {
      if (name.endsWith('.css')) {
        extraCss += `\n/* ${name} */\n${content}\n`;
      } else if (name.endsWith('.js')) {
        extraJs += `\n// ${name}\n${content}\n`;
      }
    }
  }

  const hasFullDocument = rawHtml.includes('<html') || rawHtml.includes('<!DOCTYPE');

  if (hasFullDocument) {
    // Inject scripts if not already present
    let doc = rawHtml;
    if (extraCss) {
      doc = doc.replace('</head>', `<style>${extraCss}</style>\\n</head>`);
    }
    if (extraJs) {
      doc = doc.replace('</body>', `<script>${extraJs}</script>\\n</body>`);
    }
    if (!doc.includes('cdn.tailwindcss.com')) {
      doc = doc.replace('<head>', '<head>\\n  <script src="https://cdn.tailwindcss.com"></script>');
    }
    if (!doc.includes('unpkg.com/lucide')) {
      doc = doc.replace(
        '</head>',
        `  <script src="https://unpkg.com/lucide@latest"></script>
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/roughjs@4.5.2/bundled/rough.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/chroma-js/2.4.2/chroma.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" />
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/12.4.1/math.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.4/howler.min.js"></script>
</head>`
      );
    }
    return doc;
  }

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <!-- Canvas Confetti -->
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js"></script>
  <!-- Chart.js -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <!-- Three.js -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <!-- Rough.js -->
  <script src="https://cdn.jsdelivr.net/npm/roughjs@4.5.2/bundled/rough.js"></script>
  <!-- Tone.js -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js"></script>
  <!-- Fuse.js -->
  <script src="https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.min.js"></script>
  <!-- PapaParse -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>
  <!-- Chroma.js -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/chroma-js/2.4.2/chroma.min.js"></script>
  <!-- Anime.js -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js"></script>
  <!-- Marked.js -->
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <!-- KaTeX -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" />
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <!-- QRCode.js -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
  <!-- Math.js -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/12.4.1/math.js"></script>
  <!-- Howler.js -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.4/howler.min.js"></script>
  <!-- Lodash & Day.js -->
  <script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.13/dayjs.min.js"></script>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #ffffff;
      color: #0f172a;
    }
  </style>
</head>
<body>
${rawHtml}

<script>
  document.addEventListener('DOMContentLoaded', function() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  });
  if (window.lucide) {
    window.lucide.createIcons();
  }
</script>
</body>
</html>`;
}
