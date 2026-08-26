import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { type Board, type Selection } from '../game/gameEngine';
import { GameBoard } from './GameBoard';

afterEach(() => {
  vi.useRealTimers();
});

function setBoardBounds(board: HTMLElement) {
  Object.defineProperty(board, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 800,
      bottom: 1200,
      width: 800,
      height: 1200,
      toJSON: () => ({}),
    }),
  });
}

test('renders an 8 by 12 number board', () => {
  render(
    <GameBoard
      board={Array<Board[number]>(96).fill(1)}
      interactive
      onCompleteSelection={() => undefined}
    />,
  );

  expect(screen.getAllByRole('gridcell')).toHaveLength(96);
  expect(screen.getByRole('grid', { name: '숫자 10 게임 보드' })).toBeInTheDocument();
});

test('emits the rectangle selected with pointer input', () => {
  let completedSelection: Selection | null = null;
  render(
    <GameBoard
      board={Array<Board[number]>(96).fill(1)}
      interactive
      onCompleteSelection={(selection) => {
        completedSelection = selection;
      }}
    />,
  );
  const board = screen.getByRole('grid');
  setBoardBounds(board);

  fireEvent.pointerDown(board, { pointerId: 1, button: 0, clientX: 50, clientY: 50 });
  fireEvent.pointerMove(board, { pointerId: 1, clientX: 150, clientY: 50 });
  fireEvent.pointerUp(board, { pointerId: 1, clientX: 150, clientY: 50 });

  expect(completedSelection).toEqual({
    start: { row: 0, column: 0 },
    end: { row: 0, column: 1 },
  });
});

test('marks an in-progress selection red when its total is 10', () => {
  const boardValues: Board = Array(96).fill(null);
  boardValues[0] = 4;
  boardValues[1] = 6;
  render(
    <GameBoard
      board={boardValues}
      interactive
      onCompleteSelection={() => undefined}
    />,
  );
  const board = screen.getByRole('grid');
  setBoardBounds(board);

  fireEvent.pointerDown(board, { pointerId: 1, button: 0, clientX: 50, clientY: 50 });
  fireEvent.pointerMove(board, { pointerId: 1, clientX: 150, clientY: 50 });

  expect(screen.getByTestId('selection-frame')).toHaveAttribute('data-valid', 'true');
  expect(screen.getByText('합계 10')).toBeInTheDocument();
});

test('keeps cells in their original grid areas while a selection frame is visible', () => {
  render(
    <GameBoard
      board={Array<Board[number]>(96).fill(1)}
      interactive
      onCompleteSelection={() => undefined}
    />,
  );
  const board = screen.getByRole('grid');
  setBoardBounds(board);

  fireEvent.pointerDown(board, { pointerId: 1, button: 0, clientX: 50, clientY: 50 });
  fireEvent.pointerMove(board, { pointerId: 1, clientX: 250, clientY: 250 });

  const cells = screen.getAllByRole('gridcell');
  expect(screen.getByTestId('selection-frame')).toBeInTheDocument();
  expect(cells[0]).toHaveStyle({ gridRow: '1', gridColumn: '1' });
  expect(cells[95]).toHaveStyle({ gridRow: '12', gridColumn: '8' });
});

test('cancels a pointer selection without completing it', () => {
  let completed = false;
  render(
    <GameBoard
      board={Array<Board[number]>(96).fill(1)}
      interactive
      onCompleteSelection={() => {
        completed = true;
      }}
    />,
  );
  const board = screen.getByRole('grid');
  setBoardBounds(board);

  fireEvent.pointerDown(board, { pointerId: 1, button: 0, clientX: 50, clientY: 50 });
  fireEvent.pointerCancel(board, { pointerId: 1 });

  expect(completed).toBe(false);
  expect(screen.queryByTestId('selection-frame')).not.toBeInTheDocument();
});

test('draws a connecting highlight over an available apple pair after timeout', () => {
  const boardValues: Board = Array(96).fill(null);
  boardValues[0] = 1;
  boardValues[2] = 9;

  render(
    <GameBoard
      board={boardValues}
      interactive={false}
      pairHints={[{ pair: [1, 9], indices: [0, 2] }]}
      onCompleteSelection={() => undefined}
    />,
  );

  const cells = screen.getAllByRole('gridcell');
  expect(cells[0]).toHaveClass('game-cell--hinted');
  expect(cells[2]).toHaveClass('game-cell--hinted');
  expect(cells[1]).not.toHaveClass('game-cell--hinted');
  expect(cells[0]).toHaveAccessibleName('1행 1열, 숫자 1, 가능한 쌍');
  expect(screen.getByTestId('pair-hint-frame')).toHaveStyle({
    gridColumn: '1 / 4',
    gridRow: '1 / 2',
  });
});

test('bursts each apple that changes from a number to a cleared cell', () => {
  vi.useFakeTimers();
  const before: Board = Array(96).fill(null);
  before[0] = 4;
  before[1] = 6;
  const after: Board = [...before];
  after[0] = null;
  after[1] = null;

  const { rerender } = render(
    <GameBoard
      board={before}
      interactive
      onCompleteSelection={() => undefined}
    />,
  );

  rerender(
    <GameBoard
      board={after}
      interactive
      onCompleteSelection={() => undefined}
    />,
  );

  const bursts = screen.getAllByTestId('apple-burst');
  expect(bursts).toHaveLength(2);
  expect(bursts[0]).toHaveStyle({ gridRow: '1', gridColumn: '1' });
  expect(bursts[1]).toHaveStyle({ gridRow: '1', gridColumn: '2' });
  expect(within(bursts[0]).getByTestId('apple-burst-flash')).toBeInTheDocument();
  expect(within(bursts[0]).getAllByTestId('apple-burst-ring')).toHaveLength(2);
  expect(within(bursts[0]).getAllByTestId('apple-burst-particle')).toHaveLength(
    16,
  );

  act(() => vi.advanceTimersByTime(900));

  expect(screen.queryByTestId('apple-burst')).not.toBeInTheDocument();
});
