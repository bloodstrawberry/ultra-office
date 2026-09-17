import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { DeliveryView } from 'src/sections/game/delivery/view';

export const metadata: Metadata = { title: `택배 배송 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <DeliveryView mode="game" />;
}
