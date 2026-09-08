# Дизайн-система Aurora — токены

Источник истины: `tokens/`. Всё остальное генерируется.

## Команды

    npm test        проверки: ссылки, контраст WCAG AA, брендовая чётность
    npm run build   валидация, затем генерация Dart и Figma

Flutter-пакет:

    cd aurora_design_system && flutter test

## Как что-то поменять

Цвет, отступ, радиус — правится в `tokens/`, затем `npm run build`.
`aurora_design_system/lib/src/tokens/tokens.g.dart` руками не редактируется.

## Как добавить бренд

Скопировать `tokens/brands/aurora.json`, поменять `id`, метаданные и две
шкалы цвета. Больше ничего: радиусы, отступы, типографика, движение и
статусные цвета едины для всех брендов, и `npm test` это стережёт.

## Куда идёт Figma

`build/figma-variables.json` импортируется в Figma. Направление
синхронизации одностороннее: JSON → Figma. Правки цветов внутри Figma
теряются при следующей сборке — это сделано намеренно.

## Спек

`docs/superpowers/specs/2026-09-08-aurora-design-system-design.md`
