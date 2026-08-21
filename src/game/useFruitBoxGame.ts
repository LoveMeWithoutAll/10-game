import { useCallback, useEffect, useReducer, useRef } from 'react';
import {
  clearSelection,
  createBoard,
  type Board,
  type Selection,
} from './gameEngine';

export const ROUND_DURATION_MS = 120_000;

export type GamePhase = 'idle' | 'playing' | 'finished';

interface GameState {
  phase: GamePhase;
  board: Board;
  score: number;
  remainingMs: number;
  endAt: number | null;
}

type GameAction =
  | { type: 'start'; board: Board; endAt: number }
  | { type: 'tick'; now: number }
  | { type: 'select'; selection: Selection; now: number };

const initialState: GameState = {
  phase: 'idle',
  board: [],
  score: 0,
  remainingMs: ROUND_DURATION_MS,
  endAt: null,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'start') {
    return {
      phase: 'playing',
      board: action.board,
      score: 0,
      remainingMs: ROUND_DURATION_MS,
      endAt: action.endAt,
    };
  }

  if (state.phase !== 'playing' || state.endAt === null) {
    return state;
  }

  if (action.now >= state.endAt) {
    return { ...state, phase: 'finished', remainingMs: 0 };
  }

  if (action.type === 'tick') {
    return { ...state, remainingMs: state.endAt - action.now };
  }

  const result = clearSelection(state.board, action.selection);

  if (!result.valid) {
    return state;
  }

  const isComplete = result.board.every((value) => value === null);

  return {
    ...state,
    phase: isComplete ? 'finished' : 'playing',
    board: result.board,
    score: state.score + result.clearedCount,
  };
}

interface UseFruitBoxGameOptions {
  random?: () => number;
  now?: () => number;
}

export function useFruitBoxGame({
  random = Math.random,
  now = Date.now,
}: UseFruitBoxGameOptions = {}) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const nowRef = useRef(now);

  useEffect(() => {
    nowRef.current = now;
  }, [now]);

  useEffect(() => {
    if (state.phase !== 'playing') {
      return undefined;
    }

    const timer = window.setInterval(() => {
      dispatch({ type: 'tick', now: nowRef.current() });
    }, 100);

    return () => window.clearInterval(timer);
  }, [state.phase]);

  const startGame = useCallback(() => {
    const startedAt = now();
    dispatch({
      type: 'start',
      board: createBoard(random),
      endAt: startedAt + ROUND_DURATION_MS,
    });
  }, [now, random]);

  const completeSelection = useCallback((selection: Selection) => {
    dispatch({ type: 'select', selection, now: nowRef.current() });
  }, []);

  return {
    phase: state.phase,
    board: state.board,
    score: state.score,
    remainingMs: state.remainingMs,
    startGame,
    completeSelection,
  };
}
