import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { GameOverlay } from './GameOverlay';

test('shows a perfect result after all 96 apples are cleared', () => {
  render(<GameOverlay phase="finished" score={96} onStart={() => undefined} />);

  expect(screen.getByRole('heading', { name: '모두 찾았어요!' })).toBeInTheDocument();
  expect(screen.getByText('최종 점수 96점')).toBeInTheDocument();
});
