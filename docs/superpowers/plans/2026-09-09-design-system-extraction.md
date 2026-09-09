# Вынос дизайн-системы в отдельный репозиторий — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Перенести дизайн-систему Aurora из подпапки Android-репозитория в самостоятельный репозиторий `aurora-mobile-design-system`, потребляемый мобильными приложениями как git-зависимость по тегу.

**Architecture:** История ветки переносится `git filter-repo` (код и спек, без файлов приложения), Flutter-пакет переезжает в `packages/aurora_design_system`, версия живёт в его `pubspec.yaml`, тег `vX.Y.Z` создаёт CI при пуше в `main`. Токены не меняются: их неизменность — гейт, а не пожелание.

**Tech Stack:** Node 20 (генераторы и гейты, ноль зависимостей, `node:test`), Flutter 3.41.9 / Dart 3.11, GitHub Actions, `git filter-repo`, mise.

**Spec:** `docs/superpowers/specs/2026-09-09-design-system-extraction-design.md`

## Global Constraints

- **`tokens/` не меняется ни на байт.** Любой дифф внутри `tokens/` в этом цикле — ошибка исполнителя. Красный гейт контраста или чётности — это вопрос человеку, а не разрешение подвинуть цвет.
- **`tokens.g.dart` не редактируется руками никогда.** Он пересобирается `npm run build`.
- **Инструменты только через mise:** `mise exec -- npm ...`, `mise exec -- flutter ...`. Системных `node`/`flutter` в этом окружении может не быть.
- **Пины:** Node 20, Flutter 3.41.9 — из `mise.toml`.
- **Язык:** комментарии, документация и changelog — русские, как во всём репозитории. **Сообщения коммитов — английские** (глобальное правило пользователя).
- **Теги руками не ставятся.** Тег создаёт CI.
- **Ветка `feat/aurora-design-tokens` в `AndroidClientYandex` не удаляется** до Задачи 6, и только с явного согласия человека. Пока она цела, откат бесплатен.
- **Задача 5 выходит наружу** (создание репозитория на GitHub, пуш). Она требует отдельного «да» от человека перед выполнением.
- **Где отмечать галочки:** Задача 1 выполняется в `D:\projects\AndroidClientYandex`, Задачи 2–6 — в `D:\projects\aurora-mobile-design-system`. Копия этого файла есть в обоих (он переезжает вместе с `docs/`); после Задачи 1 актуальна копия в новом репозитории.

**Эталон, снятый до начала работ** (2026-09-09, в текущей раскладке): `npm test` — 102 теста зелёные; `flutter test` — 16 зелёных; `flutter analyze` — «No issues found». Любое отклонение от этих чисел в конце цикла требует объяснения.

---

## Структура файлов

Новый репозиторий `D:\projects\aurora-mobile-design-system`:

| Путь | Ответственность | Откуда |
|---|---|---|
| `tokens/` | источник истины | переезжает как есть |
| `tools/` | 11 модулей: загрузка, разрешение ссылок, валидация, чётность, 4 генератора | переезжает, правятся 4 строки |
| `test/` | 8 наборов гейтов | переезжает, правятся 2 строки |
| `test/toolchain.test.js` | новый гейт: пин Flutter в `ci.yaml` совпадает с `mise.toml` | создаётся (Задача 4) |
| `assets/brand/` | знаки и вордмарки | переезжает как есть |
| `packages/aurora_design_system/` | pub-пакет, который подключают приложения | переезжает из корня подпапки |
| `docs/superpowers/` | спек дизайн-системы, спек переезда, оба плана | переезжает как есть |
| `changelog/0.1.0.md` | тело первого релиза | создаётся (Задача 3) |
| `.github/workflows/ci.yaml` | гейты и релиз | создаётся (Задача 4) |
| `package.json` | скрипты `test` и `build`, без `version` | правится (Задача 3) |
| `mise.toml` | единственный человекочитаемый пин node и flutter | переезжает как есть |
| `.gitattributes` | `* text=auto eol=lf` — без него гейт свежести падает под Windows | переезжает как есть |
| `README.md` | как менять, как добавить бренд, **как подключить** | правится (Задачи 2, 3) |
| `CLAUDE.md` | правила для агента | создаётся (Задача 3) |

---

### Task 1: Перенос истории в новый репозиторий

Задача создаёт репозиторий и доказывает, что перенос ничего не потерял и ничего лишнего не принёс. Раскладка ещё старая: пакет лежит в корне, как лежал.

**Files:**
- Create: `D:\projects\aurora-mobile-design-system\` (весь репозиторий)
- Commit in source: `docs/superpowers/plans/2026-09-09-design-system-extraction.md`

**Interfaces:**
- Consumes: ветка `feat/aurora-design-tokens` в `D:\projects\AndroidClientYandex`.
- Produces: git-репозиторий `D:\projects\aurora-mobile-design-system` с веткой `main`, без remote, где `tokens/`, `tools/`, `test/`, `assets/`, `aurora_design_system/`, `docs/` лежат в корне. Число коммитов — `N`, снятое на шаге 2.

- [ ] **Шаг 1: Убедиться, что план закоммичен и дерево чистое**

```bash
cd /d/projects/AndroidClientYandex
git status --short
git log --oneline -1 -- docs/superpowers/plans/2026-09-09-design-system-extraction.md
```

Ожидается: пустой `git status` и коммит с этим планом. Он должен быть в истории **до** клонирования, иначе не переедет вместе с `docs/`. Если дерево грязное — разберитесь с изменениями прежде, чем клонировать: `filter-repo` переносит только закоммиченное.

- [ ] **Шаг 2: Снять эталонное число коммитов**

```bash
cd /d/projects/AndroidClientYandex
git rev-list --count origin/main..HEAD
```

Запишите это число как `N`. Проверено при написании плана: каждый коммит ветки трогает `design-system/` или `docs/` (единственный коммит, задевающий `.gitignore` в корне, — `cf7916a`, он же добавляет спек), поэтому после переноса ни один коммит не должен пропасть. Число не выписано в план заранее намеренно: каждый коммит в ветку его меняет.

- [ ] **Шаг 3: Установить `git filter-repo` и убедиться, что он виден git**

```bash
python -m pip install git-filter-repo
git filter-repo --version
```

Ожидается номер версии. Если команда не найдена — `pip` положил скрипт мимо `PATH`; найдите его (`python -m pip show -f git-filter-repo`) и вызывайте как `python <путь>/git_filter_repo.py`, подставляя это вместо `git filter-repo` в шаге 5.

Если установка не проходит вовсе — переходите на запасной путь из §5 спека (`git subtree split --prefix=design-system`, спек и планы одним коммитом сверху) и отметьте это в `changelog/0.1.0.md` в Задаче 3.

- [ ] **Шаг 4: Склонировать ветку в целевой каталог**

```bash
git clone --no-hardlinks --single-branch --branch feat/aurora-design-tokens \
  /d/projects/AndroidClientYandex /d/projects/aurora-mobile-design-system
```

`--no-hardlinks` обязателен: без него объекты клона разделяются с исходным репозиторием, а `filter-repo` переписывает историю на месте.

- [ ] **Шаг 5: Переписать историю**

```bash
cd /d/projects/aurora-mobile-design-system
git filter-repo --path design-system/ --path docs/ --path-rename design-system/:
```

`--path` оставляет только эти два дерева, `--path-rename design-system/:` поднимает содержимое подпапки в корень. Коммиты, от которых после фильтрации ничего не осталось (вся история Android-приложения), отбрасываются. `filter-repo` сам удаляет remote `origin` — это его штатное поведение, защита от случайного пуша переписанной истории в исходный репозиторий.

- [ ] **Шаг 6: Переименовать ветку в `main` и проверить, что remote нет**

```bash
cd /d/projects/aurora-mobile-design-system
git branch -m feat/aurora-design-tokens main
git remote -v
```

Ожидается: пустой вывод `git remote -v`.

- [ ] **Шаг 7: Проверить, что история полная и чистая**

```bash
cd /d/projects/aurora-mobile-design-system
echo "commits: $(git rev-list --count HEAD)"
echo "app files ever added: $(git log --all --name-only --pretty=format: | sed '/^$/d' | sort -u | grep -cE '^(app|gradle)/')"
ls
```

Ожидается:
- `commits:` равно `N` из шага 2;
- `app files ever added: 0`;
- `ls` показывает `tokens`, `tools`, `test`, `assets`, `aurora_design_system`, `docs`, `package.json`, `mise.toml`, `README.md`.

Если число коммитов **меньше** `N` — остановитесь и разберитесь, какой коммит отбросился, прежде чем идти дальше: `git log --oneline` в обоих репозиториях и сравнение сообщений покажет пропажу.

- [ ] **Шаг 8: Довериться mise в свежем клоне**

```bash
cd /d/projects/aurora-mobile-design-system
mise trust
```

- [ ] **Шаг 9: Прогнать оба набора тестов из нового места**

```bash
cd /d/projects/aurora-mobile-design-system
mise exec -- npm test 2>&1 | tail -8
cd aurora_design_system && mise exec -- flutter test 2>&1 | tail -3
```

Ожидается: `# pass 102`, `# fail 0` и `+16: All tests passed!`. Перенос не должен был изменить ни одного числа.

Коммита в этой задаче нет: результат — сам репозиторий.

---

### Task 2: Пакет переезжает в `packages/`, путевые ссылки чинятся

**Files:**
- Move: `aurora_design_system/` → `packages/aurora_design_system/`
- Modify: `tools/generate-dart.js:228` (путь вывода), `tools/generate-dart.js:88`, `tools/generate-css.js:45`, `tools/generate-figma.js:65`, `tools/generate-preview.js:629` (строки происхождения)
- Modify: `test/generate-dart.test.js:89` (комментарий), `test/generate-dart.test.js:92` (путь)
- Modify: `README.md:13`, `README.md:18`
- Regenerate: `packages/aurora_design_system/lib/src/tokens/tokens.g.dart`

**Interfaces:**
- Consumes: репозиторий из Задачи 1.
- Produces: путь `packages/aurora_design_system` — его подставляют в `path:` потребители (Задача 3, README) и в `working-directory` шаги CI (Задача 4).

- [ ] **Шаг 1: Переместить пакет**

```bash
cd /d/projects/aurora-mobile-design-system
mkdir -p packages
git mv aurora_design_system packages/aurora_design_system
```

- [ ] **Шаг 2: Прогнать тесты и увидеть, как гейт ловит переезд**

```bash
mise exec -- npm test 2>&1 | tail -20
```

Ожидается FAIL: набор `generate-dart` не находит `aurora_design_system/lib/src/tokens/tokens.g.dart` (`ENOENT`). Это тот самый гейт свежести — он читает файл с диска, поэтому переезд для него неотличим от пропажи. Красный здесь означает, что гейт работает.

- [ ] **Шаг 3: Починить путь вывода генератора**

В `tools/generate-dart.js`, функция `writeDart()`:

```js
export function writeDart() {
  const out = path.join(root, 'packages', 'aurora_design_system', 'lib', 'src', 'tokens', 'tokens.g.dart');
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, generateDart(), 'utf8');
  return out;
}
```

- [ ] **Шаг 4: Починить путь в тесте**

В `test/generate-dart.test.js`, тест «закоммиченный tokens.g.dart совпадает с генерацией»:

```js
  const file = path.join(root, 'packages', 'aurora_design_system', 'lib', 'src', 'tokens', 'tokens.g.dart');
```

Там же, комментарий двумя строками выше — `design-system/.gitattributes` больше не существует:

```js
// eol=lf в .gitattributes держит файл в LF на любой платформе,
```

- [ ] **Шаг 5: Прогнать тесты и убедиться, что зелено**

```bash
mise exec -- npm test 2>&1 | tail -8
```

Ожидается `# pass 102`, `# fail 0`.

- [ ] **Шаг 6: Починить строки происхождения в генераторах**

Префикс `design-system/` вшит в **генерируемый вывод** и после переезда указывает в никуда. Четыре места:

`tools/generate-dart.js:88`:

```js
  lines.push('// Источник: tokens/. Пересобрать: npm run build');
```

`tools/generate-css.js:45`:

```js
  out.push(' * Источник: tokens/. Пересобрать: npm run build');
```

`tools/generate-figma.js:65`:

```js
      generatedBy: 'tools/generate-figma.js',
```

`tools/generate-preview.js:629`:

```js
    <span>Источник: <span class="mono">tokens/</span> · страница пересобирается командой <span class="mono">npm run build</span></span>
```

- [ ] **Шаг 7: Прогнать тесты и увидеть, что гейт свежести поймал изменившийся заголовок**

```bash
mise exec -- npm test 2>&1 | tail -20
```

Ожидается FAIL: «tokens.g.dart в репозитории отличается от генерации». Заголовок сгенерированного файла изменился, а закоммиченный — ещё нет. Ни один тест не проверяет строки происхождения напрямую, так что это единственный сигнал, что шаг 6 состоялся.

- [ ] **Шаг 8: Пересобрать**

```bash
mise exec -- npm run build
git diff --stat packages/aurora_design_system/lib/src/tokens/tokens.g.dart
```

Ожидается дифф ровно в одну строку — заголовок. Если строк больше, остановитесь: значит изменилось что-то кроме происхождения.

- [ ] **Шаг 9: Убедиться, что `tokens/` не тронут**

```bash
git status --short tokens/
```

Ожидается пустой вывод. Это глобальное ограничение цикла.

- [ ] **Шаг 10: Прогнать все три гейта**

```bash
mise exec -- npm test 2>&1 | tail -8
cd packages/aurora_design_system && mise exec -- flutter analyze 2>&1 | tail -2 && mise exec -- flutter test 2>&1 | tail -3 && cd ../..
```

Ожидается: `# pass 102` / `# fail 0`, «No issues found!», `+16: All tests passed!`.

- [ ] **Шаг 11: Поправить README**

Строка 13 — путь к пакету:

```
    cd packages/aurora_design_system && flutter test
```

Строка 18 — путь к генерируемому файлу:

```
`packages/aurora_design_system/lib/src/tokens/tokens.g.dart` руками не редактируется.
```

- [ ] **Шаг 12: Закоммитить**

```bash
git add -A
git commit -m "Move the Flutter package under packages/ and repoint the generators"
```

---

### Task 3: Версия, changelog, README подключения, CLAUDE.md

**Files:**
- Modify: `package.json` (убрать `version`)
- Create: `changelog/0.1.0.md`
- Modify: `README.md` (раздел «Как подключить в приложении»)
- Create: `CLAUDE.md`

**Interfaces:**
- Consumes: путь `packages/aurora_design_system` из Задачи 2.
- Produces: `changelog/0.1.0.md` и версия `0.1.0` в `packages/aurora_design_system/pubspec.yaml` — их читает job `release` из Задачи 4.

- [ ] **Шаг 1: Убрать второе число версии**

В `package.json` удалить строку `"version": "1.0.0",`. Пакет `private: true`, в npm не публикуется; единственный источник версии — `pubspec.yaml`. Результат:

```json
{
  "name": "aurora-design-tokens",
  "private": true,
  "type": "module",
  "engines": { "node": ">=20" },
  "scripts": {
    "test": "node --test test/",
    "build": "node tools/build.js"
  }
}
```

- [ ] **Шаг 2: Убедиться, что npm не возражает против отсутствия версии**

```bash
mise exec -- npm test 2>&1 | tail -8
```

Ожидается `# pass 102`, `# fail 0`.

- [ ] **Шаг 3: Проверить версию в pubspec**

```bash
grep -n "^version:" packages/aurora_design_system/pubspec.yaml
```

Ожидается `version: 0.1.0`. Если там другое число — дальше в плане и в CI подставляйте его, changelog назовите так же.

- [ ] **Шаг 4: Написать `changelog/0.1.0.md`**

```markdown
# 0.1.0

Первый выпуск дизайн-системы отдельным репозиторием.

- Токены: примитивный и семантический слои, бренды Aurora и МТС.
- Flutter-пакет `aurora_design_system`: `AuroraTheme` как `ThemeExtension` и
  `auroraThemeData()`, прокидывающий токены в `ColorScheme` и `TextTheme`.
- Генераторы: Dart, CSS-переменные, Figma Variables, страница превью.
- Гейты: целостность ссылок, контраст WCAG AA, брендовая чётность и свежесть
  сгенерированного Dart.

Перенесено из `AndroidClientYandex/design-system/` с сохранением истории.
```

Если в Задаче 1 пришлось пойти запасным путём (`git subtree split`), добавьте последней строкой: «История спека и планов не перенесена — они добавлены одним коммитом.»

- [ ] **Шаг 5: Добавить в README раздел о подключении**

После раздела «Команды», перед «Как что-то поменять»:

```markdown
## Как подключить в приложении

    dependencies:
      aurora_design_system:
        git:
          url: https://github.com/NikolayNN/aurora-mobile-design-system.git
          ref: v0.1.0
          path: packages/aurora_design_system

`ref` — тег релиза. Ветку указывать не нужно: версии двигаются тегами, и
приложение само решает, когда перейти на следующую.

Репозиторий приватный. Локально `flutter pub get` берёт git-креденшл
разработчика и ничего дополнительного не требует. В CI приложения нужен
доступ — deploy key либо PAT, подставленный до `flutter pub get`:

    git config --global url."https://${TOKEN}@github.com/".insteadOf "https://github.com/"
```

- [ ] **Шаг 6: Написать `CLAUDE.md`**

```markdown
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
```

- [ ] **Шаг 7: Закоммитить**

```bash
git add -A
git commit -m "Give the repository a single version, a changelog and consumption instructions"
```

---

### Task 4: CI и гейт против расхождения пинов

**Files:**
- Create: `.github/workflows/ci.yaml`
- Create: `test/toolchain.test.js`

**Interfaces:**
- Consumes: `packages/aurora_design_system` (Задача 2), `changelog/0.1.0.md` и версия в pubspec (Задача 3).
- Produces: job `test` (гейты на PR и пуш) и job `release` (тег и GitHub-релиз при пуше в `main`).

Почему нужен новый тест: `subosito/flutter-action` читает версию только из `pubspec.yaml`, `.fvmrc` или `.fvm/fvm_config.json`. Наш pubspec — библиотечный, и в нём обязан стоять **диапазон** `>=3.41.0`, а не пин: пин заставил бы каждое приложение-потребителя сесть ровно на эту версию Flutter. Значит в `ci.yaml` версия пишется числом и может молча разъехаться с `mise.toml`. Для node такой проблемы нет: `actions/setup-node` умеет читать `mise.toml` напрямую.

- [ ] **Шаг 1: Написать падающий тест на расхождение пинов**

Создать `test/toolchain.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { root } from '../tools/load.js';

// flutter-action читает версию только из pubspec.yaml, .fvmrc и
// .fvm/fvm_config.json, а pubspec библиотеки обязан держать диапазон, а не пин:
// пин посадил бы каждое приложение-потребителя ровно на эту версию Flutter.
// Поэтому версия в ci.yaml написана числом и может разъехаться с mise.toml
// молча — сборка просто поедет на другом SDK. Этот тест их связывает.
test('пин Flutter в ci.yaml совпадает с mise.toml', () => {
  const mise = readFileSync(path.join(root, 'mise.toml'), 'utf8');
  const ci = readFileSync(path.join(root, '.github', 'workflows', 'ci.yaml'), 'utf8');

  const pinned = /^\s*flutter\s*=\s*"([^"]+)"/m.exec(mise);
  assert.ok(pinned, 'в mise.toml нет строки flutter = "..."');

  const used = /flutter-version:\s*([0-9][^\s#]*)/.exec(ci);
  assert.ok(used, 'в ci.yaml нет строки flutter-version:');

  assert.equal(
    used[1], pinned[1],
    'ci.yaml собирает не на той версии Flutter, что стоит в mise.toml — ' +
    'поднимайте обе строки вместе',
  );
});
```

- [ ] **Шаг 2: Прогнать и убедиться, что тест падает**

```bash
mise exec -- npm test 2>&1 | tail -20
```

Ожидается FAIL: `ENOENT` на `.github/workflows/ci.yaml` — файла ещё нет.

- [ ] **Шаг 3: Узнать актуальные мажоры используемых actions**

```bash
for a in actions/checkout actions/setup-node actions/upload-artifact; do
  echo "$a $(gh api repos/$a/releases/latest --jq .tag_name)"
done
```

Соседний репозиторий `auroraDriverFlutter` использует `actions/checkout@v7` и `actions/upload-artifact@v7` — это заведомо рабочие пины, файл ниже написан с ними. Единственный, которого у соседа нет, — `actions/setup-node`: в файле стоит `@v5`, замените на мажор из вывода команды, если он другой.

- [ ] **Шаг 4: Написать `.github/workflows/ci.yaml`**

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v5
        with:
          # setup-node читает mise.toml напрямую — пин node не дублируется.
          node-version-file: mise.toml
      # Гейты токенов: целостность ссылок, контраст WCAG AA, брендовая
      # чётность, свежесть закоммиченного tokens.g.dart и совпадение пина
      # Flutter в этом файле с mise.toml.
      - run: npm test
      - uses: subosito/flutter-action@v2
        with:
          # Дублирует mise.toml вынужденно: flutter-action не читает ни
          # mise.toml, ни .tool-versions, а pubspec библиотеки держит диапазон,
          # а не пин. За расхождением следит test/toolchain.test.js.
          flutter-version: 3.41.9
          channel: stable
          cache: true
      - run: flutter pub get
        working-directory: packages/aurora_design_system
      - run: flutter analyze
        working-directory: packages/aurora_design_system
      - run: flutter test
        working-directory: packages/aurora_design_system
      # build/ лежит в .gitignore: артефакт — единственный способ отдать
      # превью, CSS и Figma-JSON дизайнеру, не требуя клона и Node.
      - run: npm run build
      - uses: actions/upload-artifact@v7
        if: always()
        with:
          name: design-system-build
          path: build/
          if-no-files-found: error

  # Релиз по стандарту «тег — выход CI»: версия в pubspec пакета — единственный
  # источник. Пуш в main с версией, у которой ещё нет тега, создаёт тег и
  # релиз. Руками теги не ставятся.
  release:
    needs: test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v7
      - name: Version from pubspec.yaml
        id: version
        run: |
          pubspec=packages/aurora_design_system/pubspec.yaml
          v=$(sed -nE 's/^version:[[:space:]]*([0-9]+\.[0-9]+\.[0-9]+).*/\1/p' "$pubspec")
          test -n "$v" || { echo "version not found in $pubspec"; exit 1; }
          test -f "changelog/$v.md" || { echo "changelog/$v.md is missing - write the changelog entry before bumping the version"; exit 1; }
          echo "version=$v" >> "$GITHUB_OUTPUT"
          if git ls-remote --exit-code --tags origin "refs/tags/v$v" >/dev/null; then
            echo "v$v is already tagged - nothing to release"
            echo "release=false" >> "$GITHUB_OUTPUT"
          else
            echo "release=true" >> "$GITHUB_OUTPUT"
          fi
      - uses: actions/setup-node@v5
        if: steps.version.outputs.release == 'true'
        with:
          node-version-file: mise.toml
      - run: npm run build
        if: steps.version.outputs.release == 'true'
      - name: Tag and GitHub release
        if: steps.version.outputs.release == 'true'
        env:
          GH_TOKEN: ${{ github.token }}
          VERSION: ${{ steps.version.outputs.version }}
        run: |
          # Тело релиза — запись changelog без строки заголовка версии.
          awk 'NR > 1' "changelog/$VERSION.md" > release-notes.md
          gh release create "v$VERSION" --target "$GITHUB_SHA" \
            --title "v$VERSION" --notes-file release-notes.md \
            build/preview.html build/design-system.css build/figma-variables.json
```

- [ ] **Шаг 5: Прогнать и убедиться, что тест позеленел**

```bash
mise exec -- npm test 2>&1 | tail -8
```

Ожидается `# pass 103`, `# fail 0` — на один тест больше эталонных 102.

- [ ] **Шаг 6: Проверить, что гейт ловит расхождение**

Временно поменяйте в `ci.yaml` `flutter-version: 3.41.9` на `3.40.0`, прогоните `mise exec -- npm test` — ожидается FAIL с текстом «поднимайте обе строки вместе», — затем верните `3.41.9` и прогоните ещё раз до зелёного. Тест, который не пробовали уронить, ничего не стережёт.

- [ ] **Шаг 7: Проверить синтаксис YAML**

```bash
mise exec -- node -e "const {readFileSync}=require('fs');const s=readFileSync('.github/workflows/ci.yaml','utf8');if(/\t/.test(s))throw new Error('таб в YAML');console.log('строк:',s.split('\n').length)"
```

Табов в YAML быть не должно. Полная проверка схемы — только на GitHub, в Задаче 5.

- [ ] **Шаг 8: Закоммитить**

```bash
git add -A
git commit -m "Add CI with the token gates, the release job and a guard against toolchain drift"
```

---

### Task 5: GitHub-репозиторий, зелёный CI, тег v0.1.0

**Требует явного «да» от человека перед началом:** задача создаёт публично адресуемый (хоть и приватный) ресурс и публикует туда историю.

**Files:** изменений в рабочем дереве нет.

**Interfaces:**
- Consumes: всё, что собрано Задачами 1–4.
- Produces: `https://github.com/NikolayNN/aurora-mobile-design-system`, тег `v0.1.0`, релиз с тремя файлами. `ref: v0.1.0` из README становится рабочим.

- [ ] **Шаг 1: Убедиться, что всё зелено локально и дерево чистое**

```bash
cd /d/projects/aurora-mobile-design-system
git status --short
mise exec -- npm test 2>&1 | tail -8
cd packages/aurora_design_system && mise exec -- flutter analyze 2>&1 | tail -2 && mise exec -- flutter test 2>&1 | tail -3 && cd ../..
```

Ожидается: пустой `git status`, `# pass 103` / `# fail 0`, «No issues found!», `+16: All tests passed!`.

- [ ] **Шаг 2: Спросить человека и дождаться ответа**

Показать, что будет создано: приватный репозиторий `NikolayNN/aurora-mobile-design-system`, в него уйдёт вся история ветки. Не выполнять шаг 3 без ответа.

- [ ] **Шаг 3: Создать репозиторий и запушить**

```bash
cd /d/projects/aurora-mobile-design-system
gh repo create NikolayNN/aurora-mobile-design-system \
  --private --source . --remote origin --push
```

- [ ] **Шаг 4: Дождаться CI и прочитать результат**

```bash
gh run watch --exit-status
```

Если job `test` красный — читать лог упавшего шага (`gh run view --log-failed`) и чинить. Наиболее вероятные места: мажор какого-то action не тот (шаг 3 Задачи 4), либо `flutter-action` не находит 3.41.9 на канале stable.

- [ ] **Шаг 5: Проверить, что CI сам создал тег и релиз**

```bash
git fetch --tags
git tag
gh release view v0.1.0
```

Ожидается: тег `v0.1.0` существует, релиз содержит `preview.html`, `design-system.css`, `figma-variables.json` и текст из `changelog/0.1.0.md`.

Если тега нет, а job `release` зелёный — значит он ушёл в ветку `release=false`; посмотрите лог шага «Version from pubspec.yaml».

- [ ] **Шаг 6: Проверить артефакт сборки**

```bash
out="$TMPDIR/ds-artifact"; mkdir -p "$out"
gh run download -n design-system-build -D "$out"
ls "$out"
```

`gh run download` без номера запуска берёт последний. Если `TMPDIR` не задан, подставьте любой временный каталог вне репозитория — скачанное в рабочее дерево класть нельзя.

Ожидается: три файла. Это тот самый пакет, который отдаётся дизайнеру ссылкой вместо клона.

Коммита в этой задаче нет.

---

### Task 6: Закрыть переезд в Android-репозитории

**Требует явного «да» от человека:** удаление ветки — единственный необратимый шаг цикла.

**Files:** изменений нет.

- [ ] **Шаг 1: Убедиться, что новый репозиторий на месте и полон**

```bash
cd /d/projects/aurora-mobile-design-system
git log --oneline origin/main | wc -l
gh release view v0.1.0 --json tagName --jq .tagName
```

Число коммитов равно `N` из Задачи 1, тег на месте.

- [ ] **Шаг 2: Показать человеку и спросить**

Сообщить: `origin/main` Android-репозитория не менялся ни разу за цикл (проверить: `cd /d/projects/AndroidClientYandex && git rev-parse origin/main` — тот же sha, что и в начале). Локальная ветка `feat/aurora-design-tokens` больше ничего уникального не хранит: вся её история лежит в новом репозитории и запушена. Спросить, удалять ли ветку.

- [ ] **Шаг 3: Удалить ветку — только по ответу «да»**

```bash
cd /d/projects/AndroidClientYandex
git checkout main
git branch -D feat/aurora-design-tokens
```

Если ответ «нет» или «позже» — оставить как есть и на этом закончить. Ветка никому не мешает.

---

## Что остаётся за рамками плана

- **Подключение `aurora_driver` первым потребителем.** Отдельный цикл: он трогает второй репозиторий и проверит доступ приватного репо из CI приложения — единственное, что этот план не может проверить сам.
- **Три открытых вопроса Приложения Б** спека дизайн-системы (различимость трека МТС, слабая подсветка выбранной строки, порог 1.13). Они ждут дизайнера.
- **Компоненты §9, шрифты Inter, бренд Irissoft, способ импорта в Figma** — как были.
- **Защита ветки `main`** и требование зелёного CI перед мержем — настройка репозитория, делается человеком в интерфейсе GitHub после Задачи 5.
