# Дизайн-система Aurora — токены

Источник истины: `tokens/`. Всё остальное генерируется.

Основы согласованы с веб-дизайн-системой Aurora: [соответствия токенов,
типографика и мобильные отличия](docs/web-foundations.md).
Aurora использует DEFAULT-палитру веба, Inter Tight и JetBrains Mono;
МТС сохраняет свой бренд. Снимок веб-эталона проверяется в `npm test`.

## Инструменты

Node и Flutter ставятся через [mise](https://mise.jdx.dev/), версии закреплены
в `mise.toml` (`node = "20"`, `flutter = "3.41.9"`). После клонирования один раз:

    mise install
    mise trust

Дальше все команды идут через `mise exec --`, чтобы гарантированно взять
версии из `mise.toml`, а не то, что случайно стоит в системе.

Пакет требует Flutter `>=3.41.0` (`environment.flutter` в `pubspec.yaml`
пакета): на более старом SDK `flutter pub get` упадёт с ошибкой разрешения
зависимостей, никак не указывающей на причину. Если это случилось —
проверьте версию через `flutter --version` и переустановите SDK через mise.

## Команды

    mise exec -- npm test        проверки: ссылки, контраст WCAG AA, брендовая чётность, свежесть Dart
    mise exec -- npm run build   валидация, затем генерация Dart, Figma, превью build/preview.html
                                  и CSS-переменных build/design-system.css

Flutter-пакет:

    cd packages/aurora_design_system && mise exec -- flutter test

## Как подключить в приложении

    dependencies:
      aurora_design_system:
        git:
          url: https://github.com/PrimaSoftLLC/aurora-mobile-design-system.git
          ref: v0.1.0
          path: packages/aurora_design_system

`ref` — тег релиза. Ветку указывать не нужно: версии двигаются тегами, и
приложение само решает, когда перейти на следующую.

Репозиторий приватный. Локально `flutter pub get` берёт git-креденшл
разработчика и ничего дополнительного не требует. В CI приложения нужен
доступ — deploy key либо PAT, подставленный до `flutter pub get`:

    git config --global url."https://${TOKEN}@github.com/".insteadOf "https://github.com/"

## Как использовать в коде

Точка входа — `auroraThemeData()`, она собирает `ThemeData` под выбранный
бренд и тему (`packages/aurora_design_system/lib/src/theme/aurora_theme.dart`):

```dart
import 'package:flutter/material.dart';
import 'package:aurora_design_system/aurora_design_system.dart';

MaterialApp(
  theme: auroraThemeData(AuroraBrand.aurora, Brightness.light),
  darkTheme: auroraThemeData(AuroraBrand.aurora, Brightness.dark),
  home: const HomePage(),
)
```

Внутри виджета токены достаются через `AuroraTheme.of(context)` — это
`ThemeExtension`, зарегистрированное в `ThemeData.extensions`:

```dart
final aurora = AuroraTheme.of(context);
final Color primary = aurora.colors.actionPrimary;
final TextStyle title = aurora.typography.title;
```

`AuroraTheme.of` падает по `assert`, если `auroraThemeData()` не была отдана
`MaterialApp`/`Theme` выше по дереву. Полный список токенов — в
`AuroraColorTokens` и `AuroraTypography`
(`packages/aurora_design_system/lib/src/tokens/tokens.g.dart`, экспортированы
через `package:aurora_design_system/aurora_design_system.dart`).

## Как что-то поменять

Цвет, отступ, радиус — правится в `tokens/`, затем `npm run build`.
`packages/aurora_design_system/lib/src/tokens/tokens.g.dart` руками не редактируется.

## Как добавить бренд

Скопировать `tokens/brands/aurora.json` и заменить цветовую часть `color`
(шкалы `neutral`/`brand` и семантические `roles`), `logo` и `wordmark`.
Плюс метаданные: `id`, `appName`,
`baseUrl`, `defaultLocale`, `neutralHue`, `seed`. Больше ничего: радиусы,
отступы, типографика, движение, статусные цвета и палитра геозон едины для
всех брендов, и `npm test` это стережёт.

Имя файла — это и есть идентификатор бренда: оно становится членом enum
`AuroraBrand` в Dart, поэтому только `[a-z][a-z0-9]*`, и поле `id` внутри
обязано с ним совпадать.

Шкалы подбирает дизайнер — генератора шкал нет и не планируется (§4.1 спека).
`neutralHue` и `seed` записывают замысел, а не производят цвета, и оба
проверяются против шкалы: `seed` обязан буквально встречаться среди ступеней
собственной шкалы `brand` (ступень не фиксирована: у Aurora это 600, у МТС
500), `neutralHue` обязан совпадать с оттенком `neutral.500` с допуском 15°.

`logo` и `wordmark` — имена файлов относительно `assets/brand/`, и файлы
обязаны там лежать: `parity.js` падает на бренде без знака. Сейчас там
`aurora.svg` и `aurora-wordmark.svg` (сконвертированы из vector drawable
текущего приложения; вордмарк залит `currentColor`, поэтому красится
токеном `text.*`) и `mts.png` с `mts-wordmark.png` (у МТС векторного
исходника в проекте нет, лежит растр 240 px из сплэша). Компонент, который
их показывает, появится вместе с §9 спека.

Шкалы перекрашиваются на месте, а не пересобираются: обе должны сохранить
ровно тот же набор ступеней, включая нестандартную `850` в `neutral`
(`parity.js` сверяет ступени с эталонным списком и называет недостающие и
лишние). Ступень `850` существует потому, что в тёмной теме
`border.hairline` и фон панели иначе слились бы в один тон.

## Как выпустить версию

Версия и тег живут только в `packages/aurora_design_system/pubspec.yaml` —
руками тег не ставится, его создаёт CI. Порядок:

1. Написать `changelog/X.Y.Z.md` с описанием релиза (без него релизная
   работа в CI откажет ещё на шаге проверки).
2. Поднять `version:` в `packages/aurora_design_system/pubspec.yaml` до
   `X.Y.Z`.
3. Запушить оба изменения в `main`.

Дальше CI сам: если тега `vX.Y.Z` ещё нет — прогоняет гейты, создаёт тег и
GitHub-релиз с превью, CSS-переменными и Figma-JSON вложением. Если тег уже
есть — работа `release` завершается без изменений, это ожидаемое поведение,
а не ошибка.

## Куда идёт Figma

Сначала `npm run build` — каталог `build/` в `.gitignore`, поэтому в свежем
клоне файла нет. Он появляется как `build/figma-variables.json`. Внутри
четыре коллекции: `semantic` с модами `бренд × тема` и `dimension`,
`typography`, `motion` без модов.

Формат файла свой, и чем он попадает в Figma — ещё не решено: нативного
импорта переменных из JSON у Figma нет, типовые плагины ждут своей схемы.
Варианты: плагин под этот формат, скрипт через Figma API, перенос руками.
И второе: четыре мода в одной коллекции — потолок тарифов Professional и
Organization, третий бренд даёт шесть (§11 спека). Оба вопроса решить до того,
как дизайнер начнёт работу с переменными.

Направление синхронизации одностороннее: JSON → Figma. Правки цветов внутри
Figma теряются при следующей сборке — это сделано намеренно.

## Что отдать дизайн-инструменту

Claude Design, другой агент или верстальщик прототипа читают дизайн-систему
из четырёх файлов, все кроме спека собираются `npm run build`:

| Файл | Что в нём |
|---|---|
| `docs/superpowers/specs/2026-09-08-aurora-design-system-design.md` | принципы, правила, состав компонентов, открытые вопросы |
| `build/design-system.css` | все токены как CSS-переменные: цвета по брендам и темам, размеры, движение, роли типографики классами `.type-*`. **Единственный файл из `build/`, который лежит в git** — чтобы инструменту, читающему репозиторий, не приходилось разворачивать ссылки `mix()` из `tokens/` самому. Устареть не может: `npm test` сверяет закоммиченную копию с генерацией |
| `build/preview.html` | как это выглядит: шкалы, контраст, экран из токенов, переключатель бренда |
| `build/figma-variables.json` | те же токены в виде коллекций и модов, если инструмент понимает такой JSON |
| `assets/brand/` | знак и вордмарк каждого бренда: `aurora.svg`, `aurora-wordmark.svg`, `mts.png`, `mts-wordmark.png` |

Чего в пакете нет и что инструмент попросит отдельно: векторный знак МТС
(есть только растр) и скриншоты текущего приложения, если нужен контекст
«как сейчас». Вариативные Inter Tight и JetBrains Mono в пакете уже есть —
их тянуть не нужно. Происхождение и лицензии — в `assets/fonts/` пакета.

## Спек

`docs/superpowers/specs/2026-09-08-aurora-design-system-design.md`
