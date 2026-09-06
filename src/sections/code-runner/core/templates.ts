import type { CodeTemplate, SupportedLanguage } from '../types';

import { C_TEMPLATES } from './templates/c';
import { GO_TEMPLATES } from './templates/go';
import { CPP_TEMPLATES } from './templates/cpp';
import { PHP_TEMPLATES } from './templates/php';
import { SQL_TEMPLATES } from './templates/sql';
import { LUA_TEMPLATES } from './templates/lua';
import { HTML_TEMPLATES } from './templates/html';
import { JAVA_TEMPLATES } from './templates/java';
import { RUST_TEMPLATES } from './templates/rust';
import { RUBY_TEMPLATES } from './templates/ruby';
import { BASH_TEMPLATES } from './templates/bash';
import { REACT_TEMPLATES } from './templates/react';
import { CSHARP_TEMPLATES } from './templates/csharp';
import { PYTHON_TEMPLATES } from './templates/python';
import { JAVASCRIPT_TEMPLATES } from './templates/javascript';
import { TYPESCRIPT_TEMPLATES } from './templates/typescript';
import { NODE_SERVER_TEMPLATES } from './templates/node-server';

// ----------------------------------------------------------------------

export const TEMPLATES: CodeTemplate[] = [
  ...JAVASCRIPT_TEMPLATES,
  ...TYPESCRIPT_TEMPLATES,
  ...REACT_TEMPLATES,
  ...HTML_TEMPLATES,
  ...NODE_SERVER_TEMPLATES,
  ...PYTHON_TEMPLATES,
  ...C_TEMPLATES,
  ...CPP_TEMPLATES,
  ...CSHARP_TEMPLATES,
  ...JAVA_TEMPLATES,
  ...GO_TEMPLATES,
  ...SQL_TEMPLATES,
  ...RUBY_TEMPLATES,
  ...PHP_TEMPLATES,
  ...LUA_TEMPLATES,
  ...BASH_TEMPLATES,
  ...RUST_TEMPLATES,
];

export function getTemplateById(id: string): CodeTemplate {
  const template = TEMPLATES.find((t) => t.id === id);
  return template || TEMPLATES[0];
}

export function getTemplatesByLanguage(language: SupportedLanguage): CodeTemplate[] {
  const filtered = TEMPLATES.filter((t) => t.language === language);
  return filtered.length > 0 ? filtered : [TEMPLATES[0]];
}

export function getDefaultContentForFileName(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  switch (ext) {
    case 'py':
      return `# ${fileName}\n\ndef helper_function(message: str) -> str:\n    return f"[Helper] {message}"\n\nif __name__ == "__main__":\n    print(helper_function("Hello from ${fileName}"))\n`;

    case 'js':
    case 'mjs':
    case 'cjs':
      return `// ${fileName}\n\nfunction calculate(a, b) {\n  return a + b;\n}\n\nmodule.exports = { calculate };\n`;

    case 'ts':
    case 'mts':
      return `// ${fileName}\n\nexport interface Config {\n  title: string;\n  version: number;\n}\n\nexport function getConfig(): Config {\n  return { title: 'OmniRunner', version: 1 };\n}\n`;

    case 'jsx':
    case 'tsx':
      return `import React from 'react';\n\nexport default function CustomComponent({ title = "${fileName}" }) {\n  return (\n    <div className="p-4 my-2 bg-slate-50 border border-slate-200 rounded-lg shadow-sm">\n      <h3 className="font-bold text-slate-800">{title}</h3>\n      <p className="text-sm text-slate-600">추가된 서브 컴포넌트입니다.</p>\n    </div>\n  );\n}\n`;

    case 'css':
      return `/* ${fileName} */\n.custom-highlight {\n  color: #0284c7;\n  font-weight: 600;\n  padding: 4px 8px;\n  background: rgba(2, 132, 199, 0.1);\n  border-radius: 4px;\n}\n`;

    case 'json':
      return `{\n  "name": "workspace-data",\n  "status": "ready",\n  "items": [\n    { "id": 1, "title": "항목 1" },\n    { "id": 2, "title": "항목 2" }\n  ]\n}\n`;

    case 'html':
    case 'htm':
      return `<div class="p-4 bg-sky-50 border border-sky-200 rounded-lg">\n  <h3 class="font-bold text-sky-900">${fileName}</h3>\n  <p class="text-sm text-sky-700">추가된 HTML 템플릿 영역입니다.</p>\n</div>\n`;

    case 'sql':
      return `-- ${fileName}\nCREATE TABLE IF NOT EXISTS audit_log (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  action TEXT NOT NULL,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n\nINSERT INTO audit_log (action) VALUES ('file_created');\nSELECT * FROM audit_log;\n`;

    case 'c':
    case 'h':
      return `// ${fileName}\n#include <stdio.h>\n\nvoid greet(const char* name) {\n    printf("Hello, %s!\\n", name);\n}\n`;

    case 'cpp':
    case 'hpp':
    case 'cc':
      return `// ${fileName}\n#include <iostream>\n#include <string>\n\nvoid displayMessage(const std::string& msg) {\n    std::cout << "[Module] " << msg << std::endl;\n}\n`;

    case 'cs':
      return `// ${fileName}\nusing System;\n\npublic class Helper\n{\n    public static void Log(string msg)\n    {\n        Console.WriteLine($"[Helper] {msg}");\n    }\n}\n`;

    case 'java':
      return `// ${fileName}\npublic class Helper {\n    public static void greet(String name) {\n        System.out.println("Hello, " + name);\n    }\n}\n`;

    case 'go':
      return `// ${fileName}\npackage main\n\nimport "fmt"\n\nfunc Helper() {\n    fmt.Println("Go helper module loaded")\n}\n`;

    case 'rs':
      return `// ${fileName}\npub fn helper() -> &'static str {\n    "Rust helper loaded"\n}\n`;

    case 'rb':
      return `# ${fileName}\ndef helper_message\n  "Ruby helper loaded"\nend\n`;

    case 'php':
      return `<?php\n// ${fileName}\nfunction helper() {\n    return "PHP helper loaded";\n}\n`;

    case 'lua':
      return `-- ${fileName}\nlocal M = {}\nfunction M.greet(name)\n    return "Hello, " .. name\nend\nreturn M\n`;

    case 'sh':
    case 'bash':
      return `#!/usr/bin/env bash\n# ${fileName}\necho "Bash helper executed"\n`;

    default:
      return `// ${fileName}\n`;
  }
}
