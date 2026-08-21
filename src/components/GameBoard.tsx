import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import {
  BOARD_COLUMNS,
  BOARD_ROWS,
  TARGET_SUM,
  getSelectionTotal,
  type Board,
  type Position,
  type Selection,
} from '../game/gameEngine';

interface GameBoardProps {
  board: Board;
  interactive: boolean;
  onCompleteSelection: (selection: Selection) => void;
}

function getPositionFromPointer(
  element: HTMLElement,
  clientX: number,
  clientY: number,
): Position | null {
  const bounds = element.getBoundingClientRect();

  if (bounds.width <= 0 || bounds.height <= 0) {
    return null;
  }

  const column = Math.min(
    BOARD_COLUMNS - 1,
    Math.max(0, Math.floor(((clientX - bounds.left) / bounds.width) * BOARD_COLUMNS)),
  );
  const row = Math.min(
    BOARD_ROWS - 1,
    Math.max(0, Math.floor(((clientY - bounds.top) / bounds.height) * BOARD_ROWS)),
  );

  return { row, column };
}

export function GameBoard({
  board,
  interactive,
  onCompleteSelection,
}: GameBoardProps) {
  const [selection, setSelection] = useState<Selection | null>(null);
  const selectionRef = useRef<Selection | null>(null);
  const activePointerRef = useRef<number | null>(null);

  const beginSelection = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!interactive || event.button !== 0) {
      return;
    }

    const position = getPositionFromPointer(
      event.currentTarget,
      event.clientX,
      event.clientY,
    );

    if (!position) {
      return;
    }

    event.preventDefault();
    activePointerRef.current = event.pointerId;
    const nextSelection = { start: position, end: position };
    selectionRef.current = nextSelection;
    setSelection(nextSelection);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const moveSelection = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (activePointerRef.current !== event.pointerId || !selectionRef.current) {
      return;
    }

    const position = getPositionFromPointer(
      event.currentTarget,
      event.clientX,
      event.clientY,
    );

    if (!position) {
      return;
    }

    const nextSelection = { ...selectionRef.current, end: position };
    selectionRef.current = nextSelection;
    setSelection(nextSelection);
  };

  const finishSelection = (
    event: ReactPointerEvent<HTMLDivElement>,
    shouldComplete: boolean,
  ) => {
    if (activePointerRef.current !== event.pointerId) {
      return;
    }

    let finalSelection = selectionRef.current;
    const position = getPositionFromPointer(
      event.currentTarget,
      event.clientX,
      event.clientY,
    );

    if (finalSelection && position && shouldComplete) {
      finalSelection = { ...finalSelection, end: position };
      onCompleteSelection(finalSelection);
    }

    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    activePointerRef.current = null;
    selectionRef.current = null;
    setSelection(null);
  };

  const selectionTotal = selection ? getSelectionTotal(board, selection) : 0;
  const selectionBounds = selection
    ? {
        firstRow: Math.min(selection.start.row, selection.end.row),
        lastRow: Math.max(selection.start.row, selection.end.row),
        firstColumn: Math.min(selection.start.column, selection.end.column),
        lastColumn: Math.max(selection.start.column, selection.end.column),
      }
    : null;

  return (
    <div
      className={`game-board${interactive ? ' game-board--interactive' : ''}`}
      role="grid"
      aria-label="숫자 10 게임 보드"
      aria-rowcount={BOARD_ROWS}
      aria-colcount={BOARD_COLUMNS}
      onPointerDown={beginSelection}
      onPointerMove={moveSelection}
      onPointerUp={(event) => finishSelection(event, true)}
      onPointerCancel={(event) => finishSelection(event, false)}
    >
      {board.map((value, index) => {
        const row = Math.floor(index / BOARD_COLUMNS);
        const column = index % BOARD_COLUMNS;

        return (
          <div
            className={`game-cell${value === null ? ' game-cell--empty' : ''}`}
            role="gridcell"
            aria-label={
              value === null
                ? `${row + 1}행 ${column + 1}열, 빈 칸`
                : `${row + 1}행 ${column + 1}열, 숫자 ${value}`
            }
            aria-disabled={value === null}
            data-row={row}
            data-column={column}
            data-value={value ?? ''}
            key={index}
            style={{ gridRow: row + 1, gridColumn: column + 1 }}
          >
            {value !== null && (
              <span className="apple" aria-hidden="true">
                <span className="apple__leaf" />
                <span className="apple__number">{value}</span>
              </span>
            )}
          </div>
        );
      })}

      {selectionBounds && (
        <div
          className="selection-frame"
          data-testid="selection-frame"
          data-valid={selectionTotal === TARGET_SUM}
          style={{
            gridColumn: `${selectionBounds.firstColumn + 1} / ${selectionBounds.lastColumn + 2}`,
            gridRow: `${selectionBounds.firstRow + 1} / ${selectionBounds.lastRow + 2}`,
          }}
        >
          <span className="selection-frame__total">합계 {selectionTotal}</span>
        </div>
      )}
    </div>
  );
}
