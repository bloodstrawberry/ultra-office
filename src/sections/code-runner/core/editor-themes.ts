import type { ITheme as XtermTheme } from 'xterm';

// ----------------------------------------------------------------------

export interface IDETheme {
  id: string;
  name: string;
  category: 'Dark' | 'Light' | 'Special';
  isDark: boolean;
  previewBg: string;
  previewAccent: string;
  monacoThemeId: string;
  monacoDefinition?: {
    base: 'vs' | 'vs-dark' | 'hc-black';
    inherit: boolean;
    rules: Array<{ token: string; foreground?: string; fontStyle?: string }>;
    colors: Record<string, string>;
  };
  terminalTheme: XtermTheme;
  uiColors: {
    bg: string;
    surface: string;
    card: string;
    border: string;
    text: string;
    textMuted: string;
  };
}

export const DEFAULT_THEME_ID = 'light';

export const IDE_THEMES: IDETheme[] = [
  // 1. Visual Studio Light (Default)
  {
    id: 'light',
    name: 'Visual Studio Light',
    category: 'Light',
    isDark: false,
    previewBg: '#fffffe',
    previewAccent: '#0066b8',
    monacoThemeId: 'light',
    terminalTheme: {
      background: '#f6f8fa',
      foreground: '#24292f',
      cursor: '#0969da',
      cursorAccent: '#ffffff',
      selectionBackground: '#b6e3ff',
      black: '#24292f',
      red: '#cf222e',
      green: '#116329',
      yellow: '#4d2d00',
      blue: '#0969da',
      magenta: '#8250df',
      cyan: '#1b7c83',
      white: '#6e7781',
    },
    uiColors: {
      bg: '#f1f5f9',
      surface: '#ffffff',
      card: '#f8fafc',
      border: '#e2e8f0',
      text: '#0f172a',
      textMuted: '#64748b',
    },
  },

  // 2. Visual Studio Dark
  {
    id: 'vs-dark',
    name: 'Visual Studio Dark',
    category: 'Dark',
    isDark: true,
    previewBg: '#1e1e1e',
    previewAccent: '#007acc',
    monacoThemeId: 'vs-dark',
    terminalTheme: {
      background: '#0d1117',
      foreground: '#c9d1d9',
      cursor: '#58a6ff',
      cursorAccent: '#0d1117',
      selectionBackground: '#264f78',
      black: '#484f58',
      red: '#ff7b72',
      green: '#3fb950',
      yellow: '#d29922',
      blue: '#58a6ff',
      magenta: '#bc8cff',
      cyan: '#39c5cf',
      white: '#b1bac4',
    },
    uiColors: {
      bg: '#090d16',
      surface: '#0f172a',
      card: '#1e293b',
      border: '#1e293b',
      text: '#f8fafc',
      textMuted: '#94a3b8',
    },
  },

  // 3. Dracula
  {
    id: 'dracula',
    name: 'Dracula (드라큘라)',
    category: 'Dark',
    isDark: true,
    previewBg: '#282a36',
    previewAccent: '#bd93f9',
    monacoThemeId: 'dracula',
    monacoDefinition: {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
        { token: 'string', foreground: 'f1fa8c' },
        { token: 'keyword', foreground: 'ff79c6', fontStyle: 'bold' },
        { token: 'number', foreground: 'bd93f9' },
        { token: 'type', foreground: '8be9fd' },
        { token: 'function', foreground: '50fa7b' },
      ],
      colors: {
        'editor.background': '#282a36',
        'editor.foreground': '#f8f8f2',
        'editorLineNumber.foreground': '#6272a4',
        'editorCursor.foreground': '#ae81ff',
        'editor.selectionBackground': '#44475a',
      },
    },
    terminalTheme: {
      background: '#21222c',
      foreground: '#f8f8f2',
      cursor: '#ff79c6',
      cursorAccent: '#282a36',
      selectionBackground: '#44475a',
      black: '#21222c',
      red: '#ff5555',
      green: '#50fa7b',
      yellow: '#f1fa8c',
      blue: '#bd93f9',
      magenta: '#ff79c6',
      cyan: '#8be9fd',
      white: '#f8f8f2',
    },
    uiColors: {
      bg: '#191a21',
      surface: '#21222c',
      card: '#282a36',
      border: '#44475a',
      text: '#f8f8f2',
      textMuted: '#6272a4',
    },
  },

  // 4. One Dark Pro
  {
    id: 'one-dark-pro',
    name: 'One Dark Pro (아톰 다크)',
    category: 'Dark',
    isDark: true,
    previewBg: '#282c34',
    previewAccent: '#61afef',
    monacoThemeId: 'one-dark-pro',
    monacoDefinition: {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '5c6370', fontStyle: 'italic' },
        { token: 'string', foreground: '98c379' },
        { token: 'keyword', foreground: 'c678dd', fontStyle: 'bold' },
        { token: 'number', foreground: 'd19a66' },
        { token: 'type', foreground: 'e5c07b' },
        { token: 'function', foreground: '61afef' },
      ],
      colors: {
        'editor.background': '#282c34',
        'editor.foreground': '#abb2bf',
        'editorLineNumber.foreground': '#4b5263',
        'editorCursor.foreground': '#528bff',
        'editor.selectionBackground': '#3e4451',
      },
    },
    terminalTheme: {
      background: '#21252b',
      foreground: '#abb2bf',
      cursor: '#528bff',
      cursorAccent: '#282c34',
      selectionBackground: '#3e4451',
      black: '#282c34',
      red: '#e06c75',
      green: '#98c379',
      yellow: '#e5c07b',
      blue: '#61afef',
      magenta: '#c678dd',
      cyan: '#56b6c2',
      white: '#abb2bf',
    },
    uiColors: {
      bg: '#1b1d23',
      surface: '#21252b',
      card: '#282c34',
      border: '#3b4048',
      text: '#abb2bf',
      textMuted: '#5c6370',
    },
  },

  // 5. GitHub Dark Dimmed
  {
    id: 'github-dark',
    name: 'GitHub Dark Dimmed',
    category: 'Dark',
    isDark: true,
    previewBg: '#22272e',
    previewAccent: '#539bf5',
    monacoThemeId: 'github-dark',
    monacoDefinition: {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '768390', fontStyle: 'italic' },
        { token: 'string', foreground: '96d0ff' },
        { token: 'keyword', foreground: 'f47067', fontStyle: 'bold' },
        { token: 'number', foreground: '6cb6ff' },
        { token: 'type', foreground: 'dcBDFB' },
        { token: 'function', foreground: 'dcbdfb' },
      ],
      colors: {
        'editor.background': '#22272e',
        'editor.foreground': '#adbac7',
        'editorLineNumber.foreground': '#636e7b',
        'editorCursor.foreground': '#539bf5',
        'editor.selectionBackground': '#313d4a',
      },
    },
    terminalTheme: {
      background: '#1c2128',
      foreground: '#adbac7',
      cursor: '#539bf5',
      cursorAccent: '#22272e',
      selectionBackground: '#313d4a',
      black: '#545d68',
      red: '#f47067',
      green: '#57ab5a',
      yellow: '#c69026',
      blue: '#539bf5',
      magenta: '#bc8cff',
      cyan: '#39c5cf',
      white: '#adbac7',
    },
    uiColors: {
      bg: '#181b20',
      surface: '#1c2128',
      card: '#22272e',
      border: '#373e47',
      text: '#adbac7',
      textMuted: '#768390',
    },
  },

  // 6. Monokai
  {
    id: 'monokai',
    name: 'Monokai (모노카이)',
    category: 'Dark',
    isDark: true,
    previewBg: '#272822',
    previewAccent: '#a6e22e',
    monacoThemeId: 'monokai',
    monacoDefinition: {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '75715e', fontStyle: 'italic' },
        { token: 'string', foreground: 'e6db74' },
        { token: 'keyword', foreground: 'f92672', fontStyle: 'bold' },
        { token: 'number', foreground: 'ae81ff' },
        { token: 'type', foreground: '66d9ef' },
        { token: 'function', foreground: 'a6e22e' },
      ],
      colors: {
        'editor.background': '#272822',
        'editor.foreground': '#f8f8f2',
        'editorLineNumber.foreground': '#90908a',
        'editorCursor.foreground': '#f8f8f0',
        'editor.selectionBackground': '#49483e',
      },
    },
    terminalTheme: {
      background: '#1e1f1c',
      foreground: '#f8f8f2',
      cursor: '#f8f8f0',
      cursorAccent: '#272822',
      selectionBackground: '#49483e',
      black: '#333333',
      red: '#f92672',
      green: '#a6e22e',
      yellow: '#e6db74',
      blue: '#66d9ef',
      magenta: '#ae81ff',
      cyan: '#a1efe4',
      white: '#f8f8f2',
    },
    uiColors: {
      bg: '#171814',
      surface: '#1e1f1c',
      card: '#272822',
      border: '#3e3d32',
      text: '#f8f8f2',
      textMuted: '#75715e',
    },
  },

  // 7. Nord (Arctic Blue)
  {
    id: 'nord',
    name: 'Nord (노르드 아틱)',
    category: 'Dark',
    isDark: true,
    previewBg: '#2e3440',
    previewAccent: '#88c0d0',
    monacoThemeId: 'nord',
    monacoDefinition: {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '616e88', fontStyle: 'italic' },
        { token: 'string', foreground: 'a3be8c' },
        { token: 'keyword', foreground: '81a1c1', fontStyle: 'bold' },
        { token: 'number', foreground: 'b48ead' },
        { token: 'type', foreground: '8fbcbb' },
        { token: 'function', foreground: '88c0d0' },
      ],
      colors: {
        'editor.background': '#2e3440',
        'editor.foreground': '#d8dee9',
        'editorLineNumber.foreground': '#4c566a',
        'editorCursor.foreground': '#88c0d0',
        'editor.selectionBackground': '#434c5e',
      },
    },
    terminalTheme: {
      background: '#242933',
      foreground: '#d8dee9',
      cursor: '#88c0d0',
      cursorAccent: '#2e3440',
      selectionBackground: '#434c5e',
      black: '#3b4252',
      red: '#bf616a',
      green: '#a3be8c',
      yellow: '#ebcb8b',
      blue: '#81a1c1',
      magenta: '#b48ead',
      cyan: '#88c0d0',
      white: '#e5e9f0',
    },
    uiColors: {
      bg: '#1e222b',
      surface: '#242933',
      card: '#2e3440',
      border: '#434c5e',
      text: '#eceff4',
      textMuted: '#7b88a1',
    },
  },

  // 8. High Contrast Dark
  {
    id: 'hc-black',
    name: 'High Contrast (고대비 다크)',
    category: 'Special',
    isDark: true,
    previewBg: '#000000',
    previewAccent: '#00ff00',
    monacoThemeId: 'hc-black',
    terminalTheme: {
      background: '#000000',
      foreground: '#ffffff',
      cursor: '#00ff00',
      cursorAccent: '#000000',
      selectionBackground: '#ffffff',
      black: '#000000',
      red: '#ff0000',
      green: '#00ff00',
      yellow: '#ffff00',
      blue: '#0000ff',
      magenta: '#ff00ff',
      cyan: '#00ffff',
      white: '#ffffff',
    },
    uiColors: {
      bg: '#000000',
      surface: '#0a0a0a',
      card: '#121212',
      border: '#333333',
      text: '#ffffff',
      textMuted: '#aaaaaa',
    },
  },
];

export function getThemeById(id?: string): IDETheme {
  if (!id) {
    return IDE_THEMES.find((t) => t.id === DEFAULT_THEME_ID) || IDE_THEMES[0];
  }
  return (
    IDE_THEMES.find((t) => t.id === id) ||
    IDE_THEMES.find((t) => t.id === DEFAULT_THEME_ID) ||
    IDE_THEMES[0]
  );
}
