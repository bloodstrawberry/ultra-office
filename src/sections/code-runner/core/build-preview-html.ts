// ----------------------------------------------------------------------
// Helper to transform React JSX / HTML code into a fully renderable HTML document
// ----------------------------------------------------------------------

export function buildReactPreviewHtml(rawJsxCode: string): string {
  const jsonCode = JSON.stringify(rawJsxCode);

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>React Live Sandbox</title>
  <!-- React 18 & Babel Standalone CDN -->
  <script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone@7.26.9/babel.min.js" crossorigin></script>
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

        // CommonJS module environment
        var exports = {};
        var module = { exports: exports };

        function require(moduleName) {
          if (moduleName === 'react') return window.React;
          if (moduleName === 'react-dom' || moduleName === 'react-dom/client') return window.ReactDOM;
          return {};
        }

        // Expose top-level React hooks in scope
        var useState = React.useState;
        var useEffect = React.useEffect;
        var useReducer = React.useReducer;
        var useMemo = React.useMemo;
        var useCallback = React.useCallback;
        var useRef = React.useRef;
        var useContext = React.useContext;
        var createContext = React.createContext;

        // Run the compiled code inside a clean scope
        var fn = new Function(
          'React', 'ReactDOM', 'require', 'module', 'exports',
          'useState', 'useEffect', 'useReducer', 'useMemo', 'useCallback', 'useRef', 'useContext', 'createContext',
          transformed.code
        );

        fn(
          React, ReactDOM, require, module, exports,
          useState, useEffect, useReducer, useMemo, useCallback, useRef, useContext, createContext
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

export function buildHtmlPreview(rawHtml: string): string {
  if (rawHtml.includes('<html') || rawHtml.includes('<!DOCTYPE')) {
    return rawHtml;
  }
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
</body>
</html>`;
}
