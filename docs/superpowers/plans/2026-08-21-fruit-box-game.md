# 숫자 10 과일 상자 게임 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 17×10 숫자 보드에서 합계 10인 직사각형을 제거하는 120초 React SPA 게임을 구현한다.

**Architecture:** 순수 TypeScript 게임 엔진이 보드 규칙을 담당하고 React 훅이 타이머와 라운드 상태를 관리한다. CSS Grid 기반 보드는 Pointer Events를 행·열 좌표로 변환해 선택 프레임을 렌더링한다.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library, ESLint, Playwright CLI

**Spec:** `docs/superpowers/specs/2026-08-21-fruit-box-game-design.md`

## Global Constraints

- 보드는 17열 × 10행이고 각 숫자는 1~9다.
- 목표 합계는 10, 제한 시간은 120초, 점수는 제거한 사과 한 개당 1점이다.
- 게임 시작 버튼을 누를 때 무작위 보드를 생성한다.
- 보드의 완전 제거 가능성은 보장하지 않는다.
- 데이터 저장과 백엔드를 사용하지 않는다.
- 마우스와 터치를 Pointer Events 하나로 처리한다.
- 작업은 현재 `develop` 브랜치에서 수행하고 자동 커밋이나 푸시를 하지 않는다.

---

### Task 1: React SPA 도구 기반

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `eslint.config.js`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/test/setup.ts`
- Create: `src/App.smoke.test.tsx`
- Create: `.gitignore`

**Interfaces:**
- Consumes: Node.js와 npm.
- Produces: `npm run dev`, `npm test`, `npm run lint`, `npm run build` 명령과 jsdom 테스트 환경.

- [ ] **Step 1: 패키지와 TypeScript/Vite 설정 작성**

`package.json`에 React 실행 의존성과 Vite, TypeScript, Vitest, Testing Library, ESLint 개발 의존성을 선언하고 다음 스크립트를 둔다.

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 2: 의존성 설치**

Run: `npm install`

Expected: `package-lock.json`이 생성되고 설치가 성공한다.

- [ ] **Step 3: 실패하는 앱 스모크 테스트 작성**

```tsx
import { render, screen } from '@testing-library/react';
import App from './App';

test('게임 시작 동작을 제공한다', () => {
  render(<App />);
  expect(screen.getByRole('button', { name: '게임 시작' })).toBeInTheDocument();
});
```

- [ ] **Step 4: RED 확인**

Run: `npm test -- src/App.smoke.test.tsx`

Expected: `src/App.tsx`가 없어서 실패한다.

---

### Task 2: 순수 게임 엔진

**Files:**
- Create: `src/game/gameEngine.test.ts`
- Create: `src/game/gameEngine.ts`

**Interfaces:**
- Produces: `BOARD_COLUMNS`, `BOARD_ROWS`, `CELL_COUNT`, `TARGET_SUM`, `Position`, `Selection`, `Board`, `createBoard(random?)`, `getSelectionIndices(selection)`, `getSelectionTotal(board, selection)`, `clearSelection(board, selection)`.
- `clearSelection` returns `{ board: Board; clearedCount: number; valid: boolean }`.

- [ ] **Step 1: 보드 생성 실패 테스트 작성**

```ts
test('170개의 1~9 숫자를 생성한다', () => {
  const board = createBoard(() => 0.999);
  expect(board).toHaveLength(170);
  expect(board.every((value) => value === 9)).toBe(true);
});
```

- [ ] **Step 2: RED 확인**

Run: `npm test -- src/game/gameEngine.test.ts`

Expected: `createBoard`가 없어 실패한다.

- [ ] **Step 3: 최소 보드 생성 구현**

```ts
export const BOARD_COLUMNS = 17;
export const BOARD_ROWS = 10;
export const CELL_COUNT = BOARD_COLUMNS * BOARD_ROWS;
export const TARGET_SUM = 10;
export type Board = Array<number | null>;

export function createBoard(random = Math.random): Board {
  return Array.from({ length: CELL_COUNT }, () => Math.floor(random() * 9) + 1);
}
```

- [ ] **Step 4: GREEN 확인**

Run: `npm test -- src/game/gameEngine.test.ts`

Expected: 보드 생성 테스트가 통과한다.

- [ ] **Step 5: 역방향 직사각형과 빈 칸 합계 실패 테스트 작성**

```ts
test('어느 방향으로 드래그해도 직사각형 전체의 남은 숫자를 더한다', () => {
  const board = Array(170).fill(null);
  board[0] = 4;
  board[1] = null;
  board[17] = 1;
  board[18] = 5;
  expect(getSelectionTotal(board, { start: { row: 1, column: 1 }, end: { row: 0, column: 0 } })).toBe(10);
});
```

- [ ] **Step 6: RED 확인 후 사각형 계산 구현**

Run: `npm test -- src/game/gameEngine.test.ts`

Expected: `getSelectionTotal`이 없어 실패한다.

`getSelectionIndices`는 두 좌표의 최소·최대 행과 열을 구하고 모든 포함 인덱스를 행 우선으로 반환한다. `getSelectionTotal`은 `null`을 0으로 더한다.

- [ ] **Step 7: 유효·무효 제거 실패 테스트 작성**

```ts
test('합계 10인 선택만 제거하고 제거 개수를 반환한다', () => {
  const board = Array(170).fill(null);
  board[0] = 4;
  board[1] = 6;
  const result = clearSelection(board, { start: { row: 0, column: 0 }, end: { row: 0, column: 1 } });
  expect(result).toEqual({ board: Array(170).fill(null), clearedCount: 2, valid: true });
  expect(board[0]).toBe(4);
});
```

무효 선택은 원래 보드 참조, `clearedCount: 0`, `valid: false`를 반환하는 별도 테스트를 둔다.

- [ ] **Step 8: RED 확인 후 제거 구현**

Run: `npm test -- src/game/gameEngine.test.ts`

Expected: 제거 결과 기대값과 달라 실패한 뒤 최소 구현에서 모두 통과한다.

---

### Task 3: 라운드 상태와 타이머 훅

**Files:**
- Create: `src/game/useFruitBoxGame.test.tsx`
- Create: `src/game/useFruitBoxGame.ts`

**Interfaces:**
- Consumes: `createBoard`, `clearSelection`, `Selection`.
- Produces: `useFruitBoxGame({ random?, now? })` returning `phase`, `board`, `score`, `remainingMs`, `startGame()`, `completeSelection(selection)`.

- [ ] **Step 1: 시작 상태 전환 실패 테스트 작성**

```tsx
test('시작하면 새 보드와 120초 라운드를 만든다', () => {
  const { result } = renderHook(() => useFruitBoxGame({ random: () => 0, now: () => 1_000 }));
  act(() => result.current.startGame());
  expect(result.current.phase).toBe('playing');
  expect(result.current.board).toHaveLength(170);
  expect(result.current.score).toBe(0);
  expect(result.current.remainingMs).toBe(120_000);
});
```

- [ ] **Step 2: RED 확인**

Run: `npm test -- src/game/useFruitBoxGame.test.tsx`

Expected: 훅이 없어 실패한다.

- [ ] **Step 3: 최소 시작 상태 구현 후 GREEN 확인**

Run: `npm test -- src/game/useFruitBoxGame.test.tsx`

Expected: 시작 테스트가 통과한다.

- [ ] **Step 4: 점수와 시간 만료 실패 테스트 작성**

유효 선택을 완료하면 제거 개수만큼 점수가 증가하고, fake timer를 120초 전진하면 `finished`가 되며 이후 선택을 무시하는 실제 상태 결과를 검증한다.

- [ ] **Step 5: RED 확인 후 종료 시각 기반 타이머 구현**

Run: `npm test -- src/game/useFruitBoxGame.test.tsx`

Expected: 시간 만료 기대가 실패한 뒤 `setInterval`이 `endAt - now()`를 갱신하는 구현에서 통과한다.

- [ ] **Step 6: 전체 제거 조기 종료 테스트와 구현**

마지막 유효 선택이 모든 숫자를 제거하면 `phase`가 `finished`가 되는 테스트를 먼저 실패시키고 최소 구현으로 통과시킨다.

---

### Task 4: 포인터 기반 게임 보드

**Files:**
- Create: `src/components/GameBoard.test.tsx`
- Create: `src/components/GameBoard.tsx`

**Interfaces:**
- Consumes: `Board`, `Selection`, `getSelectionTotal`, `onCompleteSelection(selection)`.
- Produces: 17×10 접근 가능한 grid, `data-row`/`data-column` 셀, 합계 10일 때 `data-valid="true"`인 선택 프레임.

- [ ] **Step 1: 보드 렌더링 실패 테스트 작성**

```tsx
test('17×10 숫자 보드를 렌더링한다', () => {
  render(<GameBoard board={Array(170).fill(1)} interactive onCompleteSelection={() => {}} />);
  expect(screen.getAllByRole('gridcell')).toHaveLength(170);
  expect(screen.getByRole('grid', { name: '숫자 10 게임 보드' })).toBeInTheDocument();
});
```

- [ ] **Step 2: RED 확인 후 최소 렌더링 구현**

Run: `npm test -- src/components/GameBoard.test.tsx`

Expected: 구성 요소가 없어 실패한 뒤 grid 구현에서 통과한다.

- [ ] **Step 3: 포인터 선택 실패 테스트 작성**

보드 경계를 `1700×1000`으로 대체하고 `(50, 50)`에서 `(150, 50)`까지 pointer 이벤트를 보내 첫 두 칸 선택이 `onCompleteSelection`에 `{0,0} → {0,1}`로 전달되는지 검증한다.

- [ ] **Step 4: RED 확인 후 포인터 캡처와 좌표 변환 구현**

Run: `npm test -- src/components/GameBoard.test.tsx`

Expected: 콜백이 호출되지 않아 실패한 뒤 Pointer Events 구현에서 통과한다.

- [ ] **Step 5: 실시간 합계 프레임 실패 테스트와 구현**

4와 6이 든 두 칸을 선택하는 동안 프레임이 `data-valid="true"`이고 `합계 10`을 표시하는 테스트를 실패시킨 뒤 구현한다. `pointercancel`은 콜백 없이 프레임만 제거하는 테스트도 둔다.

---

### Task 5: 전체 화면과 게임 흐름

**Files:**
- Create: `src/components/GameStatus.tsx`
- Create: `src/components/GameOverlay.tsx`
- Create: `src/App.tsx`
- Modify: `src/App.smoke.test.tsx`

**Interfaces:**
- Consumes: `useFruitBoxGame`, `GameBoard`.
- Produces: 시작 오버레이, 점수·시간 상태, 종료 결과, 다시 시작 동작.

- [ ] **Step 1: 시작 전 화면 실패 테스트 확장**

```tsx
test('시작 전에는 보드를 가리고 사용자가 시작할 때 라운드를 연다', async () => {
  const user = userEvent.setup();
  render(<App />);
  expect(screen.getByText('합이 10이 되도록 사과를 드래그하세요')).toBeInTheDocument();
  expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: '게임 시작' }));
  expect(screen.getByRole('grid')).toBeInTheDocument();
  expect(screen.getByText('02:00')).toBeInTheDocument();
});
```

- [ ] **Step 2: RED 확인 후 App과 보조 구성 요소 구현**

Run: `npm test -- src/App.smoke.test.tsx`

Expected: 안내와 게임 상태가 없어 실패한 뒤 최소 화면 연결에서 통과한다.

- [ ] **Step 3: 종료와 다시 시작 실패 테스트 작성**

fake timer로 시간을 만료시키고 `시간 종료`, 최종 점수, `다시 시작` 버튼이 나타나는지 검증한다. 다시 시작 후 점수 0과 `02:00`이 복구되는지 검증한다.

- [ ] **Step 4: RED 확인 후 종료 오버레이 구현**

Run: `npm test -- src/App.smoke.test.tsx`

Expected: 결과 화면 기대가 실패한 뒤 구현에서 통과한다.

---

### Task 6: 원작 기반 반응형 시각 디자인

**Files:**
- Create: `src/styles.css`
- Modify: `src/main.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/GameBoard.tsx`

**Interfaces:**
- Consumes: 설계 문서의 색상·글꼴·레이아웃 토큰.
- Produces: 과수원 배경, CSS 사과, 연속 선택 프레임, 모바일 대응, 포커스와 reduced-motion 처리.

- [ ] **Step 1: 전역 토큰과 한 화면 레이아웃 구현**

```css
:root {
  --orchard: #183f2d;
  --leaf: #3f7d43;
  --meadow: #9fc45a;
  --board: #fff3c4;
  --apple: #e65342;
  --ripe: #ffd45a;
}
```

보드는 `width: min(100%, 70rem)`과 `aspect-ratio: 17 / 10`을 유지하고 17열 grid를 사용한다.

- [ ] **Step 2: CSS 사과와 선택 상태 구현**

사과 몸체는 원형에 가까운 비대칭 `border-radius`, 줄기와 잎은 pseudo-element로 그린다. 유효 선택 프레임은 `--apple` 빨간색과 합계 배지, 무효 프레임은 반투명 갈색을 사용한다.

- [ ] **Step 3: 반응형·접근성 마감**

`clamp()`로 숫자와 여백을 축소하고 420px 이하에서 설명 문구를 줄인다. `:focus-visible` 윤곽선과 `@media (prefers-reduced-motion: reduce)`를 추가한다.

- [ ] **Step 4: 정적 검사**

Run: `npm run lint && npm run build`

Expected: 두 명령 모두 exit 0.

---

### Task 7: 실제 브라우저 검증

**Files:**
- No repository files. Playwright CLI의 일회성 브라우저 세션을 사용한다.

**Interfaces:**
- Consumes: 빌드된 SPA와 실제 Chromium Pointer Events.
- Produces: 데스크톱·모바일 뷰포트에서 시작과 유효 드래그를 확인한 검증 기록.

- [ ] **Step 1: 결정적 보드 주입 없이 실제 화면 검사**

Playwright CLI로 게임 시작 후 snapshot을 찍어 170개 gridcell이 존재하는지 확인한다. 인접한 합계 10 영역의 셀 중심 좌표 사이를 `mousemove`, `mousedown`, `mousemove`, `mouseup` 순서로 드래그한 뒤 점수가 제거 개수만큼 증가하는지 확인한다.

- [ ] **Step 2: 데스크톱 Chromium 실행**

Run: `playwright-cli open http://127.0.0.1:4173 --headed`

Expected: 시작 화면과 17×10 보드가 렌더링되고 브라우저 콘솔 오류가 없다.

- [ ] **Step 3: 모바일 뷰포트 실행**

`playwright-cli resize 375 812` 후 페이지의 가로 스크롤이 없고 게임 보드 경계가 뷰포트 안에 있는지 검증한다.

- [ ] **Step 4: 최종 전체 검증**

Run: `npm test && npm run lint && npm run build`

Expected: 단위·통합 테스트, lint, production build가 모두 exit 0이고 앞 단계의 브라우저 동작 확인이 완료된다.
