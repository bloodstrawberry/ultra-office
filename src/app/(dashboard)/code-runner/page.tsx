import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { CodeRunnerView } from 'src/sections/code-runner/view/code-runner-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `다국어 코드 실행기 (OmniRunner) | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <CodeRunnerView />;
}
