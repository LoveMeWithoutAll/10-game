import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useFruitBoxGame } from './useFruitBoxGame';

describe('useFruitBoxGame', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('starts a new 120 second round with a random board', () => {
    const { result } = renderHook(() =>
      useFruitBoxGame({ random: () => 0, now: () => 1_000 }),
    );

    act(() => result.current.startGame());

    expect(result.current.phase).toBe('playing');
    expect(result.current.board).toHaveLength(96);
    expect(result.current.board.every((value) => value === 1)).toBe(true);
    expect(result.current.score).toBe(0);
    expect(result.current.remainingMs).toBe(120_000);
  });

  test('adds one point for each apple in a valid selection', () => {
    const { result } = renderHook(() =>
      useFruitBoxGame({ random: () => 0, now: () => 1_000 }),
    );
    act(() => result.current.startGame());

    act(() => {
      result.current.completeSelection({
        start: { row: 0, column: 0 },
        end: { row: 0, column: 9 },
      });
    });

    expect(result.current.score).toBe(10);
    expect(result.current.board.slice(0, 10).every((value) => value === null)).toBe(
      true,
    );
  });

  test('finishes when the 120 seconds have elapsed', () => {
    let currentTime = 5_000;
    const { result } = renderHook(() =>
      useFruitBoxGame({ random: () => 0, now: () => currentTime }),
    );
    act(() => result.current.startGame());

    currentTime += 120_000;
    act(() => vi.advanceTimersByTime(100));

    expect(result.current.remainingMs).toBe(0);
    expect(result.current.phase).toBe('finished');
  });

  test('finishes immediately after every apple is cleared', () => {
    const { result } = renderHook(() =>
      useFruitBoxGame({ random: () => 0.5, now: () => 1_000 }),
    );
    act(() => result.current.startGame());

    for (let row = 0; row < 12; row += 1) {
      for (let column = 0; column < 8; column += 2) {
        act(() => {
          result.current.completeSelection({
            start: { row, column },
            end: { row, column: column + 1 },
          });
        });
      }
    }

    expect(result.current.score).toBe(96);
    expect(result.current.phase).toBe('finished');
    expect(result.current.board.every((value) => value === null)).toBe(true);
  });
});
