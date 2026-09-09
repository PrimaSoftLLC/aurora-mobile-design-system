# aurora-mobile-design-system

Дизайн-система Aurora для мобильных приложений. Источник истины — `tokens/`,
всё остальное генерируется.

## Устройство

- `tokens/` — правится руками, это единственный источник истины.
- `tools/` — генераторы и гейты. `npm run build` собирает Dart, CSS,
  Figma-JSON и превью в `build/`.
- `packages/aurora_design_system/` — pub-пакет, который подключают приложения.
- `packages/aurora_design_system/lib/src/tokens/tokens.g.dart` —
  **генерируется**. Руками не редактируется никогда: `npm test` падает, если
  закоммиченный файл разошёлся с `tokens/`.

## Команды

    mise exec -- npm test                 гейты токенов
    mise exec -- npm run build            генерация
    cd packages/aurora_design_system && mise exec -- flutter test

## Версии и релиз

Единственный источник версии — `version:` в
`packages/aurora_design_system/pubspec.yaml`. Тег `vX.Y.Z` создаёт CI при пуше
в `main`; руками теги не ставятся. Перед подъёмом версии обязателен
`changelog/X.Y.Z.md` — без него релизная работа падает.

## Правила

- Цвета и пороги контраста подбирал человек. Не «чинить» их ради зелёного
  гейта: красный гейт — это вопрос человеку, а не задача на правку токенов.
- Добавление бренда описано в README и стережётся `tools/parity.js`.
- Открытые вопросы — Приложение Б спека
  `docs/superpowers/specs/2026-09-08-aurora-design-system-design.md`.
