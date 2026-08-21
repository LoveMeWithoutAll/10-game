import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import App from './App';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(0);
});

afterEach(() => {
  vi.useRealTimers();
});

test('시작 전에는 보드를 가리고 게임 규칙과 시작 동작을 제공한다', () => {
  render(<App />);

  expect(screen.getByText('합이 10이 되도록 사과를 드래그하세요')).toBeInTheDocument();
  expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: '게임 시작' })).toBeInTheDocument();
});

test('시작 버튼을 누르면 17×10 보드와 120초 라운드를 연다', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: '게임 시작' }));

  expect(screen.getByRole('grid')).toBeInTheDocument();
  expect(screen.getAllByRole('gridcell')).toHaveLength(170);
  expect(screen.getByText('02:00')).toBeInTheDocument();
  expect(screen.getByLabelText('현재 점수')).toHaveTextContent('0');
});

test('시간이 끝나면 결과를 보여주고 새 라운드를 시작할 수 있다', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: '게임 시작' }));

  act(() => vi.advanceTimersByTime(120_000));

  expect(screen.getByRole('heading', { name: '시간 종료' })).toBeInTheDocument();
  expect(screen.getByText('최종 점수 0점')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: '다시 시작' }));

  expect(screen.getByRole('grid')).toBeInTheDocument();
  expect(screen.getByText('02:00')).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: '시간 종료' })).not.toBeInTheDocument();
});
