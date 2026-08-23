import type { FinishReason } from '../game/useFruitBoxGame';

interface GameOverlayProps {
  phase: 'idle' | 'finished';
  score: number;
  finishReason?: FinishReason | null;
  onStart: () => void;
}

export function GameOverlay({
  phase,
  score,
  finishReason = null,
  onStart,
}: GameOverlayProps) {
  const isIdle = phase === 'idle';

  if (!isIdle && finishReason === 'timeout') {
    return (
      <section
        className="game-timeout-summary"
        role="status"
        aria-label="시간 종료 결과"
      >
        <div className="game-timeout-summary__result">
          <h2>시간 종료</h2>
          <p>최종 점수 {score}점</p>
        </div>
        <button className="primary-button" type="button" onClick={onStart}>
          다시 시작
        </button>
      </section>
    );
  }

  const heading = isIdle
    ? '10을 만드세요'
    : finishReason === 'cleared'
      ? '모두 찾았어요!'
      : finishReason === 'no-moves'
        ? '승리!'
        : '시간 종료';

  return (
    <section className={`game-overlay game-overlay--${phase}`} aria-live="polite">
      <div className="game-overlay__apple" aria-hidden="true">
        10
      </div>
      <p className="game-overlay__eyebrow">120초 숫자 퍼즐</p>
      <h2>{heading}</h2>
      {isIdle ? (
        <p>합이 10이 되도록 사과를 드래그하세요</p>
      ) : (
        <>
          {finishReason === 'no-moves' && <p>가능한 수를 모두 찾았어요</p>}
          <p className="game-overlay__result">최종 점수 {score}점</p>
        </>
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
