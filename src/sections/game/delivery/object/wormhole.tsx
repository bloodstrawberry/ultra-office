import React from "react";
import Portal, { PortalProps } from "./portal";

export type WormholeProps = PortalProps;

export default function Wormhole(props: WormholeProps) {
  return <Portal {...props} />;
}
