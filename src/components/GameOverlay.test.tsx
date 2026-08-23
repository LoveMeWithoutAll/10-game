import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { GameOverlay } from './GameOverlay';

test('shows a perfect result after all 96 apples are cleared', () => {
  render(
    <GameOverlay
      phase="finished"
      score={96}
      finishReason="cleared"
      onStart={() => undefined}
    />,
  );

  expect(screen.getByRole('heading', { name: '모두 찾았어요!' })).toBeInTheDocument();
  expect(screen.getByText('최종 점수 96점')).toBeInTheDocument();
});

test('shows a victory when no available move remains', () => {
  render(
    <GameOverlay
      phase="finished"
      score={12}
      finishReason="no-moves"
      onStart={() => undefined}
    />,
  );

  expect(screen.getByRole('heading', { name: '승리!' })).toBeInTheDocument();
  expect(screen.getByText('가능한 수를 모두 찾았어요')).toBeInTheDocument();
  expect(screen.getByText('최종 점수 12점')).toBeInTheDocument();
});

test('shows the available number pairs when time runs out', () => {
  render(
    <GameOverlay
      phase="finished"
      score={8}
      finishReason="timeout"
      availablePairs={[
        [1, 9],
        [4, 6],
        [5, 5],
      ]}
      onStart={() => undefined}
    />,
  );

  expect(screen.getByRole('heading', { name: '시간 종료' })).toBeInTheDocument();
  expect(screen.getByText('남아 있던 숫자 쌍')).toBeInTheDocument();
  expect(screen.getByText('1 + 9')).toBeInTheDocument();
  expect(screen.getByText('4 + 6')).toBeInTheDocument();
  expect(screen.getByText('5 + 5')).toBeInTheDocument();
});
