import type { FinishReason } from '../game/useFruitBoxGame';
import type { NumberPair } from '../game/gameEngine';

interface GameOverlayProps {
  phase: 'idle' | 'finished';
  score: number;
  finishReason?: FinishReason | null;
  availablePairs?: NumberPair[];
  onStart: () => void;
}

export function GameOverlay({
  phase,
  score,
  finishReason = null,
  availablePairs = [],
  onStart,
}: GameOverlayProps) {
  const isIdle = phase === 'idle';
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
          {finishReason === 'timeout' && (
            <div className="game-overlay__pairs">
              <p className="game-overlay__pairs-label">남아 있던 숫자 쌍</p>
              {availablePairs.length > 0 ? (
                <ul className="game-overlay__pair-list" aria-label="가능한 숫자 쌍">
                  {availablePairs.map(([first, second]) => (
                    <li className="game-overlay__pair" key={`${first}-${second}`}>
                      {first} + {second}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="game-overlay__pairs-empty">두 숫자 조합은 없었어요</p>
              )}
            </div>
          )}
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
