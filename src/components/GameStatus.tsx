interface GameStatusProps {
  score: number;
  remainingMs: number;
}

function formatRemainingTime(remainingMs: number): string {
  const totalSeconds = Math.ceil(Math.max(0, remainingMs) / 1_000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function GameStatus({ score, remainingMs }: GameStatusProps) {
  return (
    <div className="game-status" aria-label="게임 상태">
      <div className="status-card status-card--score">
        <span className="status-card__label">점수</span>
        <output className="status-card__value" aria-label="현재 점수">
          {score}
        </output>
        <span className="status-card__unit">/ 170</span>
      </div>
      <div className="status-card status-card--time" data-low={remainingMs <= 10_000}>
        <span className="status-card__label">남은 시간</span>
        <output className="status-card__value" aria-label="남은 시간">
          {formatRemainingTime(remainingMs)}
        </output>
      </div>
    </div>
  );
}
