export const BOARD_COLUMNS = 8;
export const BOARD_ROWS = 12;
export const CELL_COUNT = BOARD_COLUMNS * BOARD_ROWS;
export const TARGET_SUM = 10;

export type Board = Array<number | null>;
export type NumberPair = readonly [number, number];

export interface Position {
  row: number;
  column: number;
}

export interface Selection {
  start: Position;
  end: Position;
}

export interface ClearResult {
  board: Board;
  clearedCount: number;
  valid: boolean;
}

export function createBoard(random: () => number = Math.random): Board {
  return Array.from({ length: CELL_COUNT }, () => Math.floor(random() * 9) + 1);
}

export function getSelectionIndices(selection: Selection): number[] {
  const firstRow = Math.min(selection.start.row, selection.end.row);
  const lastRow = Math.max(selection.start.row, selection.end.row);
  const firstColumn = Math.min(selection.start.column, selection.end.column);
  const lastColumn = Math.max(selection.start.column, selection.end.column);
  const indices: number[] = [];

  for (let row = firstRow; row <= lastRow; row += 1) {
    for (let column = firstColumn; column <= lastColumn; column += 1) {
      indices.push(row * BOARD_COLUMNS + column);
    }
  }

  return indices;
}

export function getSelectionTotal(board: Board, selection: Selection): number {
  return getSelectionIndices(selection).reduce(
    (total, index) => total + (board[index] ?? 0),
    0,
  );
}

export function clearSelection(board: Board, selection: Selection): ClearResult {
  if (getSelectionTotal(board, selection) !== TARGET_SUM) {
    return { board, clearedCount: 0, valid: false };
  }

  const nextBoard = [...board];
  let clearedCount = 0;

  for (const index of getSelectionIndices(selection)) {
    if (nextBoard[index] !== null) {
      nextBoard[index] = null;
      clearedCount += 1;
    }
  }

  return { board: nextBoard, clearedCount, valid: true };
}

export function hasAvailableSelection(board: Board): boolean {
  for (let firstRow = 0; firstRow < BOARD_ROWS; firstRow += 1) {
    const columnTotals = Array<number>(BOARD_COLUMNS).fill(0);

    for (let lastRow = firstRow; lastRow < BOARD_ROWS; lastRow += 1) {
      for (let column = 0; column < BOARD_COLUMNS; column += 1) {
        columnTotals[column] += board[lastRow * BOARD_COLUMNS + column] ?? 0;
      }

      for (let firstColumn = 0; firstColumn < BOARD_COLUMNS; firstColumn += 1) {
        let total = 0;

        for (
          let lastColumn = firstColumn;
          lastColumn < BOARD_COLUMNS;
          lastColumn += 1
        ) {
          total += columnTotals[lastColumn];

          if (total === TARGET_SUM) {
            return true;
          }

          if (total > TARGET_SUM) {
            break;
          }
        }
      }
    }
  }

  return false;
}

export function getAvailableNumberPairs(board: Board): NumberPair[] {
  const pairs = new Map<string, NumberPair>();

  for (let firstIndex = 0; firstIndex < board.length; firstIndex += 1) {
    const firstValue = board[firstIndex];

    if (firstValue === null) {
      continue;
    }

    for (let secondIndex = firstIndex + 1; secondIndex < board.length; secondIndex += 1) {
      const secondValue = board[secondIndex];

      if (secondValue === null || firstValue + secondValue !== TARGET_SUM) {
        continue;
      }

      const selection: Selection = {
        start: {
          row: Math.floor(firstIndex / BOARD_COLUMNS),
          column: firstIndex % BOARD_COLUMNS,
        },
        end: {
          row: Math.floor(secondIndex / BOARD_COLUMNS),
          column: secondIndex % BOARD_COLUMNS,
        },
      };

      if (getSelectionTotal(board, selection) !== TARGET_SUM) {
        continue;
      }

      const pair: NumberPair =
        firstValue <= secondValue
          ? [firstValue, secondValue]
          : [secondValue, firstValue];
      pairs.set(`${pair[0]}-${pair[1]}`, pair);
    }
  }

  return [...pairs.values()].sort(
    ([firstLeft, firstRight], [secondLeft, secondRight]) =>
      firstLeft - secondLeft || firstRight - secondRight,
  );
}
