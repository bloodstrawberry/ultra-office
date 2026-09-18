import React from 'react';

import Egg from './egg';
import Wall from './wall';
import Corn from './corn';
import Bomb from './bomb';
import Spike from './spike';
import Apple from './apple';
import Peach from './peach';
import Grape from './grape';
import Straw from './straw';
import Sheep from './sheep';
import Portal from './portal';
import Rabbit from './rabbit';
import Chicken from './chicken';
import CowMale from './cow-male';
import NumBlock from './num-block';
import PathTile from './path-tile';
import Pineapple from './pineapple';
import Blueberry from './blueberry';
import Blackhole from './blackhole';
import CowFemale from './cow-female';
import IceCasing from './ice-casing';
import Strawberry from './strawberry';
import Watermelon from './watermelon';
import SweetPotato from './sweet-potato';
import KoreanMelon from './korean-melon';
import LetterBlock from './letter-block';
import {
  BLOCK_EGG,
  BLOCK_NONE,
  BLOCK_WALL,
  BLOCK_CORN,
  BLOCK_BOMB,
  BLOCK_PATH,
  isWaterTile,
  BLOCK_APPLE,
  BLOCK_PEACH,
  BLOCK_GRAPE,
  BLOCK_NUM_1,
  BLOCK_NUM_2,
  BLOCK_NUM_3,
  BLOCK_NUM_4,
  BLOCK_NUM_5,
  BLOCK_SHEEP,
  BLOCK_RABBIT,
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
  BLOCK_CHICKEN,
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
  BLOCK_COW_MALE,
  BLOCK_PINEAPPLE,
  BLOCK_BLUEBERRY,
  BLOCK_CHICKEN_D,
  BLOCK_CHICKEN_U,
  BLOCK_CHICKEN_L,
  BLOCK_CHICKEN_R,
  BLOCK_STRAWBERRY,
  BLOCK_WATERMELON,
  BLOCK_COW_FEMALE,
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
} from './constants';

export * from './preload';
export * from './constants';
export { default as Egg } from './egg';
export { default as Wall } from './wall';
export { default as Corn } from './corn';
export { default as Bomb } from './bomb';
export { default as Apple } from './apple';
export { default as Peach } from './peach';
export { default as Grape } from './grape';
export { default as Spike } from './spike';
export { default as Straw } from './straw';
export { default as Sheep } from './sheep';
export { default as Portal } from './portal';
export { default as Rabbit } from './rabbit';
export { default as Chicken } from './chicken';
export { default as CowMale } from './cow-male';
export { default as Chestnut } from './chestnut';
export { default as Wormhole } from './wormhole';
export { default as NumBlock } from './num-block';
export { default as PathTile } from './path-tile';
export { default as Pineapple } from './pineapple';
export { default as Blueberry } from './blueberry';
export { default as Blackhole } from './blackhole';
export { default as IceCasing } from './ice-casing';
export { default as CowFemale } from './cow-female';
export { default as Strawberry } from './strawberry';
export { default as Watermelon } from './watermelon';
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
  statusMap?: number[][];
  isSwimming?: boolean;
  firedOnce?: Record<string, boolean>;
  chickenDir?: 'up' | 'down' | 'left' | 'right';
}

export default function BlockRenderer({
  id,
  x,
  y,
  grid,
  statusMap,
  isSwimming,
  firedOnce,
  chickenDir,
}: BlockRendererProps) {
  const isFrozen = isFrozenBlock(id);
  const baseId = getBaseBlockId(id);

  const key = `${y},${x}`;
  const isFiredOnce = firedOnce !== undefined && firedOnce[key] === true;

  const active = isBlockActive(baseId, grid);
  const letterActive = isLetterBlockActive(baseId, grid);

  const isCurrentSwimming =
    isSwimming ||
    (statusMap !== undefined &&
      y !== undefined &&
      x !== undefined &&
      isWaterTile(statusMap[y]?.[x] ?? 0));

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
      case BLOCK_BOMB:
        return <Bomb isFrozen={isFrozen} />;
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
      case BLOCK_SHEEP:
        return <Sheep isFrozen={isFrozen} isSwimming={isCurrentSwimming} />;
      case BLOCK_RABBIT:
        return <Rabbit isFrozen={isFrozen} isSwimming={isCurrentSwimming} />;
      case BLOCK_CHICKEN:
      case BLOCK_CHICKEN_D:
        return (
          <Chicken
            isFrozen={isFrozen}
            direction={chickenDir || 'down'}
            isSwimming={isCurrentSwimming}
          />
        );
      case BLOCK_CHICKEN_U:
        return (
          <Chicken
            isFrozen={isFrozen}
            direction={chickenDir || 'up'}
            isSwimming={isCurrentSwimming}
          />
        );
      case BLOCK_CHICKEN_L:
        return (
          <Chicken
            isFrozen={isFrozen}
            direction={chickenDir || 'left'}
            isSwimming={isCurrentSwimming}
          />
        );
      case BLOCK_CHICKEN_R:
        return (
          <Chicken
            isFrozen={isFrozen}
            direction={chickenDir || 'right'}
            isSwimming={isCurrentSwimming}
          />
        );
      case BLOCK_COW_MALE:
        return <CowMale isFrozen={isFrozen} isSwimming={isCurrentSwimming} />;
      case BLOCK_COW_FEMALE:
        return <CowFemale isFrozen={isFrozen} isSwimming={isCurrentSwimming} />;
      case BLOCK_EGG:
        return <Egg />;
      case BLOCK_PATH:
        return <PathTile />;
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
