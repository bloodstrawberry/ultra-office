import type { PortalProps } from './portal';

import React from 'react';

import Portal from './portal';

export type WormholeProps = PortalProps;

export default function Wormhole(props: WormholeProps) {
  return <Portal {...props} />;
}
