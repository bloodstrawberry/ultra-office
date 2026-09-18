import React from 'react';

import Wall from './wall';
import Corn from './corn';
import Bomb from './bomb';
import Spike from './spike';
import Apple from './apple';
import Peach from './peach';
import Grape from './grape';
import Straw from './straw';
import WallV from './wall-v';
import WallH from './wall-h';
import Portal from './portal';
import Shooter from './shooter';
import NumBlock from './num-block';
import Pineapple from './pineapple';
import Blueberry from './blueberry';
import Blackhole from './blackhole';
import IceCasing from './ice-casing';
import Strawberry from './strawberry';
import Watermelon from './watermelon';
import WallAutoV from './wall-auto-v';
import WallAutoH from './wall-auto-h';
import SweetPotato from './sweet-potato';
import KoreanMelon from './korean-melon';
import LetterBlock from './letter-block';
import {
  BLOCK_NONE,
  BLOCK_WALL,
  BLOCK_CORN,
  BLOCK_BOMB,
  BLOCK_APPLE,
  BLOCK_PEACH,
  BLOCK_GRAPE,
  BLOCK_NUM_1,
  BLOCK_NUM_2,
  BLOCK_NUM_3,
  BLOCK_NUM_4,
  BLOCK_NUM_5,
  BLOCK_WALL_V,
  BLOCK_WALL_H,
  isFrozenBlock,
  BLOCK_SPIKE_U,
  BLOCK_SPIKE_D,
  BLOCK_SPIKE_L,
  BLOCK_SPIKE_R,
  isBlockActive,
  BLOCK_STRAW_1,
  BLOCK_STRAW_2,
  BLOCK_STRAW_3,
  BLOCK_STRAW_4,
  BLOCK_STRAW_5,
  getBaseBlockId,
  BLOCK_CHESTNUT,
  BLOCK_LETTER_A,
  BLOCK_LETTER_B,
  BLOCK_LETTER_C,
  BLOCK_LETTER_D,
  BLOCK_LETTER_E,
  BLOCK_PORTAL_1,
  BLOCK_PORTAL_2,
  BLOCK_PORTAL_3,
  BLOCK_PORTAL_4,
  BLOCK_PORTAL_5,
  BLOCK_PORTAL_6,
  BLOCK_PORTAL_7,
  BLOCK_PINEAPPLE,
  BLOCK_BLUEBERRY,
  BLOCK_SHOOTER_L,
  BLOCK_SHOOTER_R,
  BLOCK_STRAWBERRY,
  BLOCK_WATERMELON,
  BLOCK_AUTO_WALL_V,
  BLOCK_AUTO_WALL_H,
  BLOCK_BLACKHOLE_1,
  BLOCK_BLACKHOLE_2,
  BLOCK_BLACKHOLE_3,
  BLOCK_BLACKHOLE_4,
  BLOCK_BLACKHOLE_5,
  BLOCK_BLACKHOLE_6,
  BLOCK_BLACKHOLE_7,
  BLOCK_SWEET_POTATO,
  BLOCK_KOREAN_MELON,
  isLetterBlockActive,
  BLOCK_SHOOTER_L_ONCE,
  BLOCK_SHOOTER_R_ONCE,
} from './constants';

export * from './preload';
export * from './constants';
export { default as Wall } from './wall';
export { default as Corn } from './corn';
export { default as Bomb } from './bomb';
export { default as Apple } from './apple';
export { default as Peach } from './peach';
export { default as Grape } from './grape';
export { default as Spike } from './spike';
export { default as Straw } from './straw';
export { default as WallV } from './wall-v';
export { default as WallH } from './wall-h';
export { default as Portal } from './portal';
export { default as Shooter } from './shooter';
export { default as Chestnut } from './chestnut';
export { default as Wormhole } from './wormhole';
export { default as NumBlock } from './num-block';
export { default as Pineapple } from './pineapple';
export { default as Blueberry } from './blueberry';
export { default as Blackhole } from './blackhole';
export { default as IceCasing } from './ice-casing';
export { default as Strawberry } from './strawberry';
export { default as Watermelon } from './watermelon';
export { default as WallAutoV } from './wall-auto-v';
export { default as WallAutoH } from './wall-auto-h';
export { default as SweetPotato } from './sweet-potato';
export { default as KoreanMelon } from './korean-melon';
export { default as LetterBlock } from './letter-block';
export { default as SoilTileDark } from './soil-tile-dark';
export { default as SoilTileLight } from './soil-tile-light';

interface BlockRendererProps {
  id: number;
  x?: number;
  y?: number;
  grid?: number[][];
  firedOnce?: Record<string, boolean>;
}

export default function BlockRenderer({ id, x, y, grid, firedOnce }: BlockRendererProps) {
  const isFrozen = isFrozenBlock(id);
  const baseId = getBaseBlockId(id);

  const key = `${y},${x}`;
  const isFiredOnce = firedOnce !== undefined && firedOnce[key] === true;

  const active = isBlockActive(baseId, grid);
  const letterActive = isLetterBlockActive(baseId, grid);

  const isPressed =
    isFiredOnce ||
    (grid !== undefined &&
      y !== undefined &&
      x !== undefined &&
      y > 0 &&
      grid[y - 1]?.[x] !== undefined &&
      grid[y - 1][x] !== 0); // BLOCK_EMPTY = 0

  const renderInner = () => {
    switch (baseId) {
      case BLOCK_NONE:
        return (
          <div className="w-full h-full border-2 border-dashed border-rose-400/70 rounded-lg bg-rose-500/10 select-none" />
        );
      case BLOCK_WALL:
        return <Wall />;
      case BLOCK_STRAWBERRY:
        return <Strawberry isFrozen={isFrozen} />;
      case BLOCK_PINEAPPLE:
        return <Pineapple isFrozen={isFrozen} />;
      case BLOCK_CHESTNUT:
      case BLOCK_CORN:
        return <Corn isFrozen={isFrozen} />;
      case BLOCK_WATERMELON:
        return <Watermelon isFrozen={isFrozen} />;
      case BLOCK_SWEET_POTATO:
        return <SweetPotato isFrozen={isFrozen} />;
      case BLOCK_APPLE:
        return <Apple isFrozen={isFrozen} />;
      case BLOCK_PEACH:
        return <Peach isFrozen={isFrozen} />;
      case BLOCK_KOREAN_MELON:
        return <KoreanMelon isFrozen={isFrozen} />;
      case BLOCK_BLUEBERRY:
        return <Blueberry isFrozen={isFrozen} />;
      case BLOCK_GRAPE:
        return <Grape isFrozen={isFrozen} />;
      case BLOCK_WALL_V:
        return <WallV isFrozen={isFrozen} />;
      case BLOCK_WALL_H:
        return <WallH isFrozen={isFrozen} />;
      case BLOCK_AUTO_WALL_V:
        return <WallAutoV isFrozen={isFrozen} />;
      case BLOCK_AUTO_WALL_H:
        return <WallAutoH isFrozen={isFrozen} />;
      case BLOCK_BOMB:
        return <Bomb isFrozen={isFrozen} />;
      case BLOCK_SHOOTER_L:
        return <Shooter direction="left" mode="repeated" isPressed={isPressed} />;
      case BLOCK_SHOOTER_R:
        return <Shooter direction="right" mode="repeated" isPressed={isPressed} />;
      case BLOCK_SHOOTER_L_ONCE:
        return <Shooter direction="left" mode="once" isPressed={isPressed} />;
      case BLOCK_SHOOTER_R_ONCE:
        return <Shooter direction="right" mode="once" isPressed={isPressed} />;
      case BLOCK_SPIKE_U:
        return <Spike direction="up" />;
      case BLOCK_SPIKE_D:
        return <Spike direction="down" />;
      case BLOCK_SPIKE_L:
        return <Spike direction="left" />;
      case BLOCK_SPIKE_R:
        return <Spike direction="right" />;
      case BLOCK_NUM_1:
        return <NumBlock num={1} active={active} />;
      case BLOCK_NUM_2:
        return <NumBlock num={2} active={active} />;
      case BLOCK_NUM_3:
        return <NumBlock num={3} active={active} />;
      case BLOCK_NUM_4:
        return <NumBlock num={4} active={active} />;
      case BLOCK_NUM_5:
        return <NumBlock num={5} active={active} />;
      case BLOCK_LETTER_A:
        return <LetterBlock letter="A" active={letterActive} />;
      case BLOCK_LETTER_B:
        return <LetterBlock letter="B" active={letterActive} />;
      case BLOCK_LETTER_C:
        return <LetterBlock letter="C" active={letterActive} />;
      case BLOCK_LETTER_D:
        return <LetterBlock letter="D" active={letterActive} />;
      case BLOCK_LETTER_E:
        return <LetterBlock letter="E" active={letterActive} />;
      case BLOCK_STRAW_1:
        return <Straw count={1} />;
      case BLOCK_STRAW_2:
        return <Straw count={2} />;
      case BLOCK_STRAW_3:
        return <Straw count={3} />;
      case BLOCK_STRAW_4:
        return <Straw count={4} />;
      case BLOCK_STRAW_5:
        return <Straw count={5} />;
      case BLOCK_PORTAL_1:
        return <Portal type={1} />;
      case BLOCK_PORTAL_2:
        return <Portal type={2} />;
      case BLOCK_PORTAL_3:
        return <Portal type={3} />;
      case BLOCK_PORTAL_4:
        return <Portal type={4} />;
      case BLOCK_PORTAL_5:
        return <Portal type={5} />;
      case BLOCK_PORTAL_6:
        return <Portal type={6} />;
      case BLOCK_PORTAL_7:
        return <Portal type={7} />;
      case BLOCK_BLACKHOLE_1:
        return <Blackhole type={1} />;
      case BLOCK_BLACKHOLE_2:
        return <Blackhole type={2} />;
      case BLOCK_BLACKHOLE_3:
        return <Blackhole type={3} />;
      case BLOCK_BLACKHOLE_4:
        return <Blackhole type={4} />;
      case BLOCK_BLACKHOLE_5:
        return <Blackhole type={5} />;
      case BLOCK_BLACKHOLE_6:
        return <Blackhole type={6} />;
      case BLOCK_BLACKHOLE_7:
        return <Blackhole type={7} />;
      default:
        return null;
    }
  };

  const content = renderInner();
  if (!content) return null;

  if (isFrozen) {
    return <IceCasing>{content}</IceCasing>;
  }

  return content;
}
