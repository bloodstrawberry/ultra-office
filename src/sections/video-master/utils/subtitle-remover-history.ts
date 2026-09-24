import type { SubtitleBoundingBox } from './video-subtitle-remover-processor';

export interface SubtitleEditSnapshot {
  boxes: SubtitleBoundingBox[];
  activeBoxId: string | null;
}

export interface SubtitleEditHistory {
  past: SubtitleEditSnapshot[];
  present: SubtitleEditSnapshot;
  future: SubtitleEditSnapshot[];
  gesture: SubtitleEditSnapshot | null;
  gestureRecorded: boolean;
}

type HistoryAction =
  | {
      type: 'boxes';
      value: SubtitleBoundingBox[] | ((boxes: SubtitleBoundingBox[]) => SubtitleBoundingBox[]);
    }
  | { type: 'select'; id: string | null }
  | { type: 'reset'; snapshot: SubtitleEditSnapshot }
  | { type: 'begin' | 'end' | 'undo' | 'redo' };

const HISTORY_LIMIT = 100;

export function createSubtitleEditHistory(present: SubtitleEditSnapshot): SubtitleEditHistory {
  return { past: [], present, future: [], gesture: null, gestureRecorded: false };
}

export function subtitleEditHistoryReducer(
  state: SubtitleEditHistory,
  action: HistoryAction
): SubtitleEditHistory {
  switch (action.type) {
    case 'reset':
      return createSubtitleEditHistory(action.snapshot);
    case 'select':
      return { ...state, present: { ...state.present, activeBoxId: action.id } };
    case 'begin':
      return state.gesture ? state : { ...state, gesture: state.present, gestureRecorded: false };
    case 'end':
      return { ...state, gesture: null, gestureRecorded: false };
    case 'boxes': {
      const boxes =
        typeof action.value === 'function' ? action.value(state.present.boxes) : action.value;
      if (JSON.stringify(boxes) === JSON.stringify(state.present.boxes)) return state;
      const record = !state.gestureRecorded;
      return {
        ...state,
        past: record
          ? [...state.past, state.gesture ?? state.present].slice(-HISTORY_LIMIT)
          : state.past,
        present: { ...state.present, boxes },
        future: [],
        gestureRecorded: state.gesture !== null,
      };
    }
    case 'undo': {
      const previous = state.past.at(-1);
      if (!previous) return state;
      return {
        ...createSubtitleEditHistory(previous),
        past: state.past.slice(0, -1),
        future: [state.present, ...state.future].slice(0, HISTORY_LIMIT),
      };
    }
    case 'redo': {
      const next = state.future[0];
      if (!next) return state;
      return {
        ...createSubtitleEditHistory(next),
        past: [...state.past, state.present].slice(-HISTORY_LIMIT),
        future: state.future.slice(1),
      };
    }
    default:
      return state;
  }
}
