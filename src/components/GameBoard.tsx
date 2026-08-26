import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  BOARD_COLUMNS,
  BOARD_ROWS,
  TARGET_SUM,
  getSelectionTotal,
  type Board,
  type NumberPairHint,
  type Position,
  type Selection,
} from '../game/gameEngine';

interface GameBoardProps {
  board: Board;
  interactive: boolean;
  pairHints?: NumberPairHint[];
  onCompleteSelection: (selection: Selection) => void;
}

interface AppleBurst {
  id: number;
  index: number;
}

const BURST_DURATION_MS = 850;
const BURST_PARTICLES = [
  { x: -330, y: -80, rotation: -155, delay: 0, size: 20, variant: 'flesh' },
  { x: -250, y: -250, rotation: -95, delay: 20, size: 15, variant: 'juice' },
  { x: -105, y: -345, rotation: -45, delay: 0, size: 19, variant: 'flesh' },
  { x: 70, y: -310, rotation: 35, delay: 35, size: 13, variant: 'juice' },
  { x: 245, y: -265, rotation: 85, delay: 5, size: 21, variant: 'flesh' },
  { x: 345, y: -105, rotation: 140, delay: 30, size: 14, variant: 'juice' },
  { x: 320, y: 80, rotation: 190, delay: 0, size: 18, variant: 'flesh' },
  { x: 260, y: 245, rotation: 235, delay: 45, size: 13, variant: 'juice' },
  { x: 95, y: 340, rotation: 285, delay: 10, size: 20, variant: 'flesh' },
  { x: -70, y: 315, rotation: 330, delay: 40, size: 14, variant: 'juice' },
  { x: -245, y: 260, rotation: 385, delay: 0, size: 19, variant: 'flesh' },
  { x: -345, y: 105, rotation: 430, delay: 25, size: 13, variant: 'juice' },
  { x: -185, y: -185, rotation: 490, delay: 65, size: 15, variant: 'leaf' },
  { x: 185, y: -175, rotation: 545, delay: 55, size: 16, variant: 'flesh' },
  { x: 180, y: 185, rotation: 600, delay: 70, size: 14, variant: 'leaf' },
  { x: -175, y: 180, rotation: 655, delay: 60, size: 16, variant: 'flesh' },
] as const;

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
  pairHints = [],
  onCompleteSelection,
}: GameBoardProps) {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [bursts, setBursts] = useState<AppleBurst[]>([]);
  const selectionRef = useRef<Selection | null>(null);
  const activePointerRef = useRef<number | null>(null);
  const previousBoardRef = useRef(board);
  const nextBurstIdRef = useRef(0);
  const hintedIndexSet = new Set(pairHints.flatMap(({ indices }) => indices));

  useEffect(() => {
    const previousBoard = previousBoardRef.current;
    const hasRestoredApple = board.some(
      (value, index) => value !== null && previousBoard[index] === null,
    );
    const nextBursts = board.flatMap((value, index) =>
      value === null && previousBoard[index] !== null
        ? [{ id: nextBurstIdRef.current++, index }]
        : [],
    );

    previousBoardRef.current = board;

    if (hasRestoredApple) {
      setBursts(nextBursts);
    } else if (nextBursts.length > 0) {
      setBursts((currentBursts) => [...currentBursts, ...nextBursts]);
    }
  }, [board]);

  useEffect(() => {
    if (bursts.length === 0) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setBursts([]), BURST_DURATION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [bursts]);

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
        const isHinted = hintedIndexSet.has(index);

        return (
          <div
            className={`game-cell${value === null ? ' game-cell--empty' : ''}${isHinted ? ' game-cell--hinted' : ''}`}
            role="gridcell"
            aria-label={
              value === null
                ? `${row + 1}행 ${column + 1}열, 빈 칸`
                : `${row + 1}행 ${column + 1}열, 숫자 ${value}${isHinted ? ', 가능한 쌍' : ''}`
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

      {bursts.map(({ id, index }) => {
        const row = Math.floor(index / BOARD_COLUMNS);
        const column = index % BOARD_COLUMNS;

        return (
          <div
            className="apple-burst"
            data-testid="apple-burst"
            aria-hidden="true"
            key={id}
            style={{ gridRow: row + 1, gridColumn: column + 1 }}
          >
            <span
              className="apple-burst__flash"
              data-testid="apple-burst-flash"
            />
            <span
              className="apple-burst__ring apple-burst__ring--primary"
              data-testid="apple-burst-ring"
            />
            <span
              className="apple-burst__ring apple-burst__ring--secondary"
              data-testid="apple-burst-ring"
            />
            {BURST_PARTICLES.map((particle, particleIndex) => (
              <span
                className={`apple-burst__particle apple-burst__particle--${particle.variant}`}
                data-testid="apple-burst-particle"
                key={particleIndex}
                style={
                  {
                    '--burst-x': `${particle.x}%`,
                    '--burst-y': `${particle.y}%`,
                    '--burst-rotation': `${particle.rotation}deg`,
                    '--burst-delay': `${particle.delay}ms`,
                    '--burst-size': `${particle.size}%`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        );
      })}

      {pairHints.map(({ indices: [firstIndex, secondIndex] }) => {
        const firstRow = Math.floor(firstIndex / BOARD_COLUMNS);
        const firstColumn = firstIndex % BOARD_COLUMNS;
        const secondRow = Math.floor(secondIndex / BOARD_COLUMNS);
        const secondColumn = secondIndex % BOARD_COLUMNS;

        return (
          <div
            className="pair-hint-frame"
            data-testid="pair-hint-frame"
            aria-hidden="true"
            key={`${firstIndex}-${secondIndex}`}
            style={{
              gridColumn: `${Math.min(firstColumn, secondColumn) + 1} / ${Math.max(firstColumn, secondColumn) + 2}`,
              gridRow: `${Math.min(firstRow, secondRow) + 1} / ${Math.max(firstRow, secondRow) + 2}`,
            }}
          />
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
