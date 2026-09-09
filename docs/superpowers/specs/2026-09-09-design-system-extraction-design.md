# Вынос дизайн-системы в отдельный репозиторий

Дата: 2026-09-09
Статус: согласован, готов к плану реализации

## 1. Зачем

Дизайн-система Aurora лежит подпапкой `design-system/` внутри репозитория
Android-приложения, к которому не имеет отношения: в `settings.gradle` она не
подключена, кода приложения не касается, собирается своим Node-пайплайном и
своим Flutter-пакетом. Приложений, которые должны ею пользоваться, уже больше
одного — рядом живёт `aurora_driver` (`NikolayNN/auroraDriverFlutter`), и он не
может подключить пакет, лежащий в чужом репозитории, ничем кроме копирования.

Цикл переносит систему в собственный репозиторий `aurora-mobile-design-system`
и делает её потребляемой: git-зависимость по тегу, версия, changelog, CI.

### Что не входит

- Содержимое токенов не меняется ни на байт.
- Три открытых вопроса из Приложения Б спека дизайн-системы (различимость трека
  МТС, слабая подсветка выбранной строки, порог 1.13 у волосяной границы) ждут
  дизайнера, а не переезда.
- Подключение `aurora_driver` первым потребителем — отдельный цикл, он трогает
  второй репозиторий.
- Компоненты §9, шрифты Inter, бренд Irissoft, решение по импорту в Figma —
  как были, за рамками.

## 2. Исходное состояние

| Что | Сейчас |
|---|---|
| Где лежит | `D:\projects\AndroidClientYandex\design-system\` |
| Связь с Android-приложением | никакой: нет в `settings.gradle`, не ссылается на код |
| Состав | 43 файла под версией: `tokens/`, `tools/` (11 модулей), `test/` (8 наборов), `assets/brand/`, Flutter-пакет `aurora_design_system/` |
| Ветка | `feat/aurora-design-tokens`, локальная, не пушена, 33 коммита впереди `origin/main` |
| Что на `origin/main` | дизайн-системы нет вообще; ветка не мержена |
| Состав ветки | 26 коммитов трогают `design-system/`, 14 — `docs/`, один добавляет строку в `.gitignore`; кода приложения ветка не касается |
| Наружные связи | спек и план в `docs/superpowers/`, на спек ссылается README |
| Версии | `pubspec.yaml` 0.1.0 и `package.json` 1.0.0 — два числа без связи |
| CI | нет ни одного workflow в репозитории |

Ключевое следствие: очистка Android-репозитория стоит ноль. Удалять нечего —
достаточно не мержить ветку.

## 3. Принятые решения

| Решение | Выбор | Почему |
|---|---|---|
| Имя репозитория | `aurora-mobile-design-system` | В списке `D:\projects\` сразу видно назначение; Aurora — базовый бренд white-label, имя не сужает переиспользование |
| Владелец | `NikolayNN`, private | Рядом с `auroraDriverFlutter`: git-зависимость и CI достанутся тем же токеном без отдельных ключей |
| История | Переносится целиком | Сообщения коммитов здесь — журнал решений по цвету и порогам контраста («stop Material falling back past the tokens»); терять его дороже, чем переносить |
| Инструмент переноса | `git filter-repo` | Умеет несколько путей: едет и код, и история спека. `git subtree split` берёт один префикс и историю `docs/` потерял бы |
| Раскладка | Пакет в `packages/aurora_design_system` | §9 спека обещает компоненты и иконки; второму пакету будет куда лечь. Переименовать позже нельзя: `path:` в pubspec потребителей сломается |
| Потребление | git-зависимость по тегу | Стандарт для приватных пакетов без pub.dev; каждое приложение само решает, когда поднять версию |
| Источник версии | `pubspec.yaml` пакета | Единственное число. `version` из `package.json` убирается: пакет `private`, в npm не публикуется |
| Релиз | Тег — выход CI | Тот же стандарт, что уже работает в `aurora_driver` и записан в глобальном CLAUDE.md; руками теги не ставятся |
| Судьба Android-репо | `main` не трогаем | Дизайн-системы там никогда не было |

## 4. Раскладка нового репозитория

```
aurora-mobile-design-system/
├── tokens/                    источник истины
│   ├── primitive/             scale, typography, motion, status, geofence
│   ├── semantic/color.json
│   └── brands/                aurora.json, mts.json
├── tools/                     build, load, resolve, validate, parity, color,
│                              curves, generate-{dart,css,figma,preview}
├── test/                      8 наборов, включая гейт свежести Dart
├── assets/brand/              aurora.svg, aurora-wordmark.svg, mts.png, mts-wordmark.png
├── packages/
│   └── aurora_design_system/  pub-пакет: AuroraTheme, tokens.g.dart, тесты
├── docs/superpowers/
│   ├── specs/                 спек дизайн-системы + этот документ
│   └── plans/
├── changelog/0.1.0.md
├── .github/workflows/ci.yaml
├── package.json               scripts: test, build (без version)
├── mise.toml                  node 20, flutter 3.41.9
├── .gitattributes             eol=lf
├── .gitignore                 build/, node_modules/
├── README.md
└── CLAUDE.md
```

Переезд пакета в `packages/` правит четыре строки: путь вывода в
`tools/generate-dart.js:228`, тот же путь в `test/generate-dart.test.js:92` и две
строки README. Больше на путь пакета никто не ссылается.

`.gitattributes` с `eol=lf` едет обязательно: гейт свежести сравнивает
закоммиченный `tokens.g.dart` с генерацией посимвольно, и без него свежий клон
под Windows падает на переводах строк.

Спек и план ложатся по прежним путям `docs/superpowers/...`. Ссылка в README,
сегодня указывающая наружу пакета, становится валидной внутри репозитория.

## 5. Перенос истории

На клоне ветки `feat/aurora-design-tokens`:

```
pip install git-filter-repo
git filter-repo --path design-system/ --path docs/ --path-rename design-system/:
```

Результат: `design-system/` стал корнем, Android-приложения нет ни в одном дереве
истории.

**Проверки после переноса** (обе обязательны, обе в плане):

- число коммитов совпадает с `git rev-list --count origin/main..HEAD`, снятым в
  Android-репозитории **непосредственно перед** переносом. Число не выписывается
  в документ заранее: каждый коммит в ветку — включая коммит этого спека — его
  меняет, а устаревшее число в проверке хуже, чем её отсутствие;
- `git log --all --diff-filter=A --name-only | grep -c '^app/'` = 0 — ни один
  файл приложения никогда не добавлялся.

**Запасной путь**, если `pip install git-filter-repo` не проходит:
`git subtree split --prefix=design-system`, затем спек и план одним коммитом
сверху. Теряется только история двух `.md`; код и его журнал сохраняются
полностью. Запасной путь выбирается явно и отмечается в changelog.

## 6. Версия и релиз

Единственный источник версии — `version:` в
`packages/aurora_design_system/pubspec.yaml`. Поле `version` из `package.json`
удаляется: пакет `private: true`, в npm не публикуется, а второе число рядом с
первым — это расхождение, ждущее своего дня.

Порядок релиза повторяет `aurora_driver`:

1. Работа мержится в `main`.
2. Когда пора выпускать: пишется `changelog/X.Y.Z.md`, поднимается версия в
   `pubspec.yaml`, оба изменения уходят в `main` одним коммитом.
3. CI на пуше в `main` читает версию, требует существования
   `changelog/X.Y.Z.md`, прогоняет гейты и **сам** создаёт тег `vX.Y.Z` и
   GitHub-релиз с телом из changelog.

Руками теги не ставятся. Если тег `vX.Y.Z` уже есть — релизная работа
пропускается, это не ошибка.

Первый релиз — `v0.1.0`: версия уже стоит в `pubspec.yaml`, нужен только
`changelog/0.1.0.md`.

## 7. CI

Один файл `.github/workflows/ci.yaml`: `ubuntu-latest`, `concurrency` по ветке с
`cancel-in-progress`, триггеры `push: [main]`, `pull_request`,
`workflow_dispatch`.

**Job `test`** — по шагу на гейт, чтобы упавший шаг был виден в интерфейсе:

| Шаг | Что стережёт |
|---|---|
| `actions/setup-node` (20), `npm test` | целостность ссылок, контраст WCAG AA, брендовая чётность, свежесть `tokens.g.dart` |
| `subosito/flutter-action` (`flutter-version-file`), `flutter pub get` | — |
| `flutter analyze` в `packages/aurora_design_system` | линт пакета |
| `flutter test` в `packages/aurora_design_system` | тема, равенство по значению, прокидка в `ColorScheme` |
| `npm run build` | генераторы не падают |
| `actions/upload-artifact` | `build/preview.html`, `build/design-system.css`, `build/figma-variables.json` |

Артефакт закрывает раздел README «что отдать дизайн-инструменту»: `build/` в
`.gitignore`, и сегодня, чтобы получить превью, дизайнеру нужен клон и Node.
С артефактом — ссылка.

`flutter analyze` — новый гейт: до переезда его никто не прогонял, потому что
CI не было. Он обязан стать зелёным внутри этого цикла. Если анализатор найдёт
замечания, они чинятся здесь же; выключать гейт или откладывать его — нельзя,
иначе он не появится никогда.

**Job `release`** (`needs: test`, только `push` в `main`, `contents: write`):
версия из `pubspec.yaml`, проверка наличия `changelog/X.Y.Z.md`, проверка что
тега ещё нет, затем `npm run build` и `gh release create vX.Y.Z` с теми же тремя
файлами вложением.

## 8. Как приложение подключается

```yaml
dependencies:
  aurora_design_system:
    git:
      url: https://github.com/NikolayNN/aurora-mobile-design-system.git
      ref: v0.1.0
      path: packages/aurora_design_system
```

Репозиторий приватный, поэтому README отдельным абзацем предупреждает: локально
это работает через git-креденшл разработчика, а CI приложения потребует deploy
key или PAT, подставленный через `git config url.<...>.insteadOf`. Проверяется
это на `aurora_driver` — отдельным циклом, не этим.

## 9. Судьба Android-репозитория

`origin/main` не трогается: дизайн-системы там нет и не было. Локальная ветка
`feat/aurora-design-tokens` остаётся на месте до конца работ и удаляется
последним шагом — по явному согласию человека, после того как новый репозиторий
запушен и CI на нём зелёный. Пока ветка цела, откат переезда бесплатен.

## 10. Критерий готовности

- `D:\projects\aurora-mobile-design-system` — git-репозиторий со всей историей
  ветки и без единого файла Android-приложения в ней;
- `npm test` и `flutter test` зелёные **без единой правки в `tokens/`**;
- `npm run build` выдаёт то же, что и до переезда: `tokens.g.dart` без диффа
  плюс три файла в `build/` — `preview.html`, `design-system.css`,
  `figma-variables.json`;
- `flutter analyze` зелёный;
- репозиторий запушен в `NikolayNN`, private, CI зелёный;
- тег `v0.1.0` создан самим CI, релиз содержит превью, CSS и Figma-JSON;
- README нового репозитория объясняет, как подключить пакет, и говорит про
  приватность репозитория в CI потребителя;
- CLAUDE.md объясняет агенту устройство репозитория и запрет править
  `tokens.g.dart` руками;
- ветка `feat/aurora-design-tokens` в Android-репозитории цела.
