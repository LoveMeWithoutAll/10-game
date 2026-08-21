import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { type Board, type Selection } from '../game/gameEngine';
import { GameBoard } from './GameBoard';

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
