import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PuzzleSudokuView } from 'src/sections/puzzle/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `스도쿠 치트키 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <PuzzleSudokuView />;
}
