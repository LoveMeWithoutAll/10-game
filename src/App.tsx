import { GameBoard } from './components/GameBoard';
import { GameOverlay } from './components/GameOverlay';
import { GameStatus } from './components/GameStatus';
import { useFruitBoxGame } from './game/useFruitBoxGame';

export default function App() {
  const game = useFruitBoxGame();

  return (
    <main className="game-shell">
      <header className="game-header">
        <div className="game-title">
          <span className="game-title__mark" aria-hidden="true" />
          <div>
            <p>Fruit box</p>
            <h1>과일 상자 <span>· 10</span></h1>
          </div>
        </div>
        {game.phase !== 'idle' && (
          <GameStatus score={game.score} remainingMs={game.remainingMs} />
        )}
      </header>

      <section className="game-stage" aria-label="게임 영역">
        {game.phase === 'idle' ? (
          <GameOverlay phase="idle" score={0} onStart={game.startGame} />
        ) : (
          <>
            <GameBoard
              board={game.board}
              interactive={game.phase === 'playing'}
              onCompleteSelection={game.completeSelection}
            />
            {game.phase === 'finished' && (
              <GameOverlay
                phase="finished"
                score={game.score}
                onStart={game.startGame}
              />
            )}
          </>
        )}
      </section>

      <footer className="game-help">
        <span className="game-help__target">10</span>
        <p>
          직사각형 안의 <strong>모든 숫자</strong>를 더하세요. 빈칸은 0으로 계산됩니다.
        </p>
      </footer>
    </main>
  );
}
