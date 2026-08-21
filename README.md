# 과일 상자 · 10

17×10 보드에서 직사각형 안의 숫자 합이 10이 되도록 사과를 골라 제거하는 120초 퍼즐 게임입니다. React와 TypeScript로 만든 SPA이며 서버나 데이터 저장소를 사용하지 않습니다.

**플레이:** [https://lovemewithoutall.github.io/10-game/](https://lovemewithoutall.github.io/10-game/)

## 실행

```bash
npm install
npm run dev
```

브라우저에서 Vite가 안내하는 로컬 주소를 엽니다.

## 규칙

- `게임 시작`을 누르면 1~9 숫자가 담긴 17×10 무작위 보드와 120초 타이머가 시작됩니다.
- 마우스나 손가락으로 직사각형 영역을 드래그합니다.
- 영역 안에 남아 있는 숫자의 합이 정확히 10이면 사과가 제거됩니다.
- 제거한 사과 한 개마다 1점을 얻습니다.
- 비어 있는 칸은 0으로 계산됩니다.

## 검증

```bash
npm test
npm run lint
npm run build
```
