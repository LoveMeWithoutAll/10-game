interface GameOverlayProps {
  phase: 'idle' | 'finished';
  score: number;
  onStart: () => void;
}

export function GameOverlay({ phase, score, onStart }: GameOverlayProps) {
  const isIdle = phase === 'idle';
  const isPerfect = score === 170;

  return (
    <section className={`game-overlay game-overlay--${phase}`} aria-live="polite">
      <div className="game-overlay__apple" aria-hidden="true">
        10
      </div>
      <p className="game-overlay__eyebrow">120초 숫자 퍼즐</p>
      <h2>{isIdle ? '10을 만드세요' : isPerfect ? '모두 찾았어요!' : '시간 종료'}</h2>
      {isIdle ? (
        <p>합이 10이 되도록 사과를 드래그하세요</p>
      ) : (
        <p className="game-overlay__result">최종 점수 {score}점</p>
      )}
      <button className="primary-button" type="button" onClick={onStart}>
        {isIdle ? '게임 시작' : '다시 시작'}
      </button>
      {isIdle && (
        <p className="game-overlay__hint">
          선택한 사과의 합이 10이면 사라지고, 사과 한 개마다 1점을 얻습니다.
        </p>
      )}
    </section>
  );
}
