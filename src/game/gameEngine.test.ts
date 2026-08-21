import {
  BOARD_COLUMNS,
  CELL_COUNT,
  clearSelection,
  createBoard,
  getSelectionIndices,
  getSelectionTotal,
  type Board,
} from './gameEngine';

describe('createBoard', () => {
  test('creates 96 values from 1 through 9', () => {
    const lowest = createBoard(() => 0);
    const highest = createBoard(() => 0.999);

    expect(lowest).toHaveLength(96);
    expect(lowest.every((value) => value === 1)).toBe(true);
    expect(highest.every((value) => value === 9)).toBe(true);
  });
});

describe('rectangle selection', () => {
  test('returns every cell when dragged from bottom-right to top-left', () => {
    const indices = getSelectionIndices({
      start: { row: 1, column: 1 },
      end: { row: 0, column: 0 },
    });

    expect(indices).toEqual([0, 1, BOARD_COLUMNS, BOARD_COLUMNS + 1]);
  });

  test('adds remaining values and treats cleared cells as zero', () => {
    const board: Board = Array(CELL_COUNT).fill(null);
    board[0] = 4;
    board[1] = null;
    board[BOARD_COLUMNS] = 1;
    board[BOARD_COLUMNS + 1] = 5;

    expect(
      getSelectionTotal(board, {
        start: { row: 1, column: 1 },
        end: { row: 0, column: 0 },
      }),
    ).toBe(10);
  });
});

describe('clearSelection', () => {
  test('clears a rectangle totaling 10 without mutating the source board', () => {
    const board: Board = Array(CELL_COUNT).fill(null);
    board[0] = 4;
    board[1] = 6;

    const result = clearSelection(board, {
      start: { row: 0, column: 0 },
      end: { row: 0, column: 1 },
    });

    expect(result.valid).toBe(true);
    expect(result.clearedCount).toBe(2);
    expect(result.board.every((value) => value === null)).toBe(true);
    expect(board[0]).toBe(4);
    expect(board[1]).toBe(6);
  });

  test('leaves the same board untouched when the total is not 10', () => {
    const board = createBoard(() => 0);

    const result = clearSelection(board, {
      start: { row: 0, column: 0 },
      end: { row: 0, column: 1 },
    });

    expect(result).toEqual({ board, clearedCount: 0, valid: false });
    expect(result.board).toBe(board);
  });
});
