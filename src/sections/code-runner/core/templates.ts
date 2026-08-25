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
