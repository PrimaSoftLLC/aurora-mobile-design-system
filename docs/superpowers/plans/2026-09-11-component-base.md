# База компонентов и вариативный шрифт — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Положить в пакет вариативный Inter и первую партию из шести базовых компонентов, стерегомую гейтом полноты.

**Architecture:** Компоненты живут в `lib/src/base/`, берут цвета через `AuroraTheme.of(context)`, размеры — из `AuroraDimensions`, и не содержат ни одной пользовательской строки. Каждый проверяется в четырёх комбинациях бренд × тема общим тестовым хелпером. Гейт на стороне Node (`npm test`) не даёт экспортировать компонент без такого теста.

**Tech Stack:** Flutter 3.41.9, Dart SDK >=3.11.0 <4.0.0, Node 20 для генераторов и гейтов, mise для обоих.

**Spec:** `docs/superpowers/specs/2026-09-10-design-system-adoption-design.md`

## Global Constraints

Действуют в каждой задаче:

- Flutter `>=3.41.0`, Dart SDK `>=3.11.0 <4.0.0`. Все команды через `mise exec --`.
- `lib/src/tokens/tokens.g.dart` генерируется. Руками не редактируется никогда.
- **Ни одной пользовательской строки в пакете.** Все тексты, включая метки доступности, приходят параметрами.
- **Никакого форматирования данных.** Компонент принимает готовую строку `«12,4 км»`, а не число с локалью. Пакет не зависит от `intl`.
- **Цвета и размеры только из `AuroraTheme.of(context)` и `AuroraDimensions`.** Литерал `Color(0x…)` и `Colors.*` в `lib/src/base/` запрещены. Прозрачность выражается через `null` в `BoxDecoration.color`, а не литералом.
- **Исключение — размеры иконок** (20, 24, 40). Роли для них в токенах нет, и заводить её этот план не берётся; числа стоят прямо в коде и записаны открытым вопросом в конце.
- **Зона нажатия не меньше `AuroraDimensions.touchTarget` (44)** независимо от видимого размера.
- **Иконки — `Icons.*_rounded`** из Flutter. Свои SVG и иконочные шрифты не заводим.
- **У иконочной кнопки `semanticLabel` обязателен** — required-параметр, а не необязательный.
- **Статусная точка не существует без текста** — `label` у статусного чипа required.
- Каждый компонент проверяется в четырёх комбинациях бренд × тема.
- Сообщения коммитов — на английском.

## File Structure

| Файл | Ответственность |
|---|---|
| `packages/aurora_design_system/assets/fonts/InterVariable.ttf` | Вариативный Inter, оси `opsz` и `wght` |
| `packages/aurora_design_system/assets/fonts/OFL.txt` | Лицензия шрифта, обязательна к поставке |
| `tools/generate-dart.js` | Добавляет package-квалификацию семейства и `fontVariations` |
| `lib/src/base/status.dart` | `AuroraStatus` и отображение статуса в цвет токена |
| `lib/src/base/button.dart` | `AuroraButton`, `AuroraIconButton`, `AuroraButtonKind` |
| `lib/src/base/chip.dart` | `AuroraStatusChip`, `AuroraFilterChip` |
| `lib/src/base/banner.dart` | `AuroraBanner`, `AuroraBannerKind` |
| `lib/src/base/list_row.dart` | `AuroraListRow`, `AuroraRowHeight` |
| `lib/src/base/sheet.dart` | `showAuroraSheet`, `showAuroraConfirmSheet` |
| `lib/src/base/states.dart` | `AuroraEmptyState`, `AuroraErrorState` |
| `test/support/harness.dart` | `forEachBrandAndTheme`, `pumpAurora` |
| `tools/component-parity.js` | Гейт: экспортированный компонент обязан иметь тест на четыре комбинации |

**Явно не делаем** (чтобы исполнитель не изобрёл): ось `opsz` по ролям не настраиваем — Inter выберет значение по умолчанию; пиксельных golden-тестов нет; `TextField`, `Checkbox`, `Switch`, `Select`, `Progress` в эту партию не входят.

---

### Task 1: Вариативный Inter в пакете

**Files:**
- Create: `packages/aurora_design_system/assets/fonts/InterVariable.ttf`
- Create: `packages/aurora_design_system/assets/fonts/OFL.txt`
- Modify: `packages/aurora_design_system/pubspec.yaml` (закомментированный блок `flutter:`)
- Modify: `tools/generate-dart.js`
- Modify: `.gitattributes`
- Test: `packages/aurora_design_system/test/aurora_theme_test.dart`

**Interfaces:**
- Consumes: ничего.
- Produces: `AuroraTypographyTokens.fontFamilySans == 'packages/aurora_design_system/Inter'`; каждая роль в `AuroraTypographyTokens` несёт `fontVariations: <FontVariation>[FontVariation('wght', <вес>)]`.

- [ ] **Step 1: Объявить ttf бинарным**

В `.gitattributes` после строки `*.png binary`:

```
*.ttf binary
```

- [ ] **Step 2: Скачать шрифт и лицензию**

```bash
cd packages/aurora_design_system && mkdir -p assets/fonts
curl -fL -o assets/fonts/InterVariable.ttf \
  "https://raw.githubusercontent.com/google/fonts/main/ofl/inter/Inter%5Bopsz%2Cwght%5D.ttf"
curl -fL -o assets/fonts/OFL.txt \
  "https://raw.githubusercontent.com/google/fonts/main/ofl/inter/OFL.txt"
```

Проверить, что приехал шрифт, а не HTML-страница ошибки:

```bash
ls -l assets/fonts/
```

Ожидается: `InterVariable.ttf` около 876 000 байт, `OFL.txt` около 4 400 байт.

- [ ] **Step 3: Написать падающий тест**

В `packages/aurora_design_system/test/aurora_theme_test.dart` добавить:

```dart
  test('семейство шрифта package-квалифицировано', () {
    expect(AuroraTypographyTokens.fontFamilySans, 'packages/aurora_design_system/Inter');
  });

  test('вес 550 у label доезжает осью wght, а не округляется', () {
    expect(
      AuroraTypographyTokens.label.fontVariations,
      contains(const FontVariation('wght', 550)),
    );
  });
```

Импорт добавлять не нужно: `FontVariation` приходит из `package:flutter/material.dart`, как и `FontFeature`, который в этом файле уже используется. Лишний `import 'dart:ui'` уронил бы `flutter analyze` на правиле `unnecessary_import`.

- [ ] **Step 4: Убедиться, что тест падает**

Run: `cd packages/aurora_design_system && mise exec -- flutter test`
Expected: FAIL — `fontFamilySans` равен `Inter`, `fontVariations` равен `null`.

- [ ] **Step 5: Научить генератор package-квалификации и осям**

В `tools/generate-dart.js` рядом с другими константами файла:

```javascript
// Шрифт объявлен в pubspec пакета, поэтому Flutter видит семейство как
// `packages/<имя пакета>/<семейство>`. Без префикса шрифт молча не находится
// и всё рисуется платформенным — в CSS и Figma префикс, наоборот, не нужен.
const DART_PACKAGE = 'aurora_design_system';
```

Заменить строку с `fontFamilySans`:

```javascript
  lines.push(`  static const String fontFamilySans = 'packages/${DART_PACKAGE}/${primitives.fontFamily.sans}';`);
```

В цикле по ролям, сразу после строки с `fontWeight`, добавить:

```javascript
    // Вариативный Inter: `fontWeight` сам по себе не двигает ось `wght`,
    // поэтому вес задаётся осью. `fontWeight` остаётся для фолбэка на
    // платформенный шрифт и для метрик.
    lines.push(`    fontVariations: <FontVariation>[FontVariation('wght', ${r.weight})],`);
```

В строку импорта `dart:ui` добавить `FontVariation`:

```javascript
  lines.push("import 'dart:ui' show Brightness, Color, FontFeature, FontVariation, FontWeight;");
```

- [ ] **Step 6: Объявить шрифт в pubspec**

В `packages/aurora_design_system/pubspec.yaml` заменить весь закомментированный блок `# flutter:` на:

```yaml
flutter:
  fonts:
    - family: Inter
      fonts:
        # Вариативный файл: одно начертание на все веса. Оси — opsz и wght;
        # вес выбирается через fontVariations в tokens.g.dart, поэтому
        # перечислять здесь weight не нужно и нельзя.
        - asset: assets/fonts/InterVariable.ttf
```

- [ ] **Step 7: Пересобрать и прогнать оба набора тестов**

```bash
cd ../.. && mise exec -- npm run build && mise exec -- npm test
cd packages/aurora_design_system && mise exec -- flutter test
```

Expected: оба зелёные; в `tokens.g.dart` появились `fontVariations` и префикс.

- [ ] **Step 8: Записать в changelog**

В `changelog/0.2.0.md` перед последним абзацем добавить:

```markdown
- Вариативный Inter поставляется внутри пакета: одно начертание на все веса,
  вес роли задаётся осью `wght`. Роль `label` наконец рисуется весом 550, а не
  округляется до 600. Арабский по-прежнему берёт платформенный шрифт — у Inter
  арабских глифов нет.
```

- [ ] **Step 9: Commit**

```bash
cd ../.. && git add -A
git commit -m "feat(font): ship the variable Inter inside the package"
```

---

### Task 2: Тестовый хелпер и AuroraButton

**Files:**
- Create: `packages/aurora_design_system/test/support/harness.dart`
- Create: `packages/aurora_design_system/lib/src/base/button.dart`
- Create: `packages/aurora_design_system/test/button_test.dart`
- Modify: `packages/aurora_design_system/lib/aurora_design_system.dart`

**Interfaces:**
- Consumes: `auroraThemeData`, `AuroraTheme`, `AuroraDimensions` из пакета.
- Produces: `forEachBrandAndTheme(void Function(AuroraBrand, Brightness) body)`; `pumpAurora(WidgetTester, Widget, {AuroraBrand, Brightness})`; `AuroraButton`, `AuroraIconButton`, `enum AuroraButtonKind { primary, secondary, ghost, danger }`.

- [ ] **Step 1: Написать хелпер**

`test/support/harness.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:aurora_design_system/aurora_design_system.dart';

/// Прогоняет тело по всем четырём комбинациям бренд × тема. Компонент,
/// проверенный только в одной, не считается проверенным: перекраска — то,
/// ради чего система существует.
void forEachBrandAndTheme(void Function(AuroraBrand brand, Brightness brightness) body) {
  for (final brand in AuroraBrand.values) {
    for (final brightness in Brightness.values) {
      body(brand, brightness);
    }
  }
}

/// Поднимает виджет внутри MaterialApp с темой Aurora. Без темы
/// `AuroraTheme.of` падает по assert.
Future<void> pumpAurora(
  WidgetTester tester,
  Widget child, {
  AuroraBrand brand = AuroraBrand.aurora,
  Brightness brightness = Brightness.light,
}) {
  return tester.pumpWidget(MaterialApp(
    theme: auroraThemeData(brand, brightness),
    home: Scaffold(body: Center(child: child)),
  ));
}
```

- [ ] **Step 2: Написать падающий тест кнопки**

`test/button_test.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:aurora_design_system/aurora_design_system.dart';
import 'support/harness.dart';

void main() {
  forEachBrandAndTheme((brand, brightness) {
    final name = '${brand.name}/${brightness.name}';

    testWidgets('$name: primary берёт цвет действия из токенов', (tester) async {
      await pumpAurora(tester, AuroraButton(label: 'Go', onPressed: () {}),
          brand: brand, brightness: brightness);
      final tokens = AuroraTheme.forBrand(brand, brightness).colors;
      final box = tester.widget<DecoratedBox>(find.byKey(const Key('aurora.button')));
      expect((box.decoration as BoxDecoration).color, tokens.actionPrimary);
    });

    testWidgets('$name: danger берёт цвет тревоги', (tester) async {
      await pumpAurora(
          tester,
          AuroraButton(
              label: 'Stop', onPressed: () {}, kind: AuroraButtonKind.danger),
          brand: brand,
          brightness: brightness);
      final tokens = AuroraTheme.forBrand(brand, brightness).colors;
      final box = tester.widget<DecoratedBox>(find.byKey(const Key('aurora.button')));
      expect((box.decoration as BoxDecoration).color, tokens.statusAlarm);
    });
  });

  testWidgets('зона нажатия не меньше 44', (tester) async {
    await pumpAurora(tester, AuroraButton(label: 'Go', onPressed: () {}));
    expect(tester.getSize(find.byType(AuroraButton)).height,
        greaterThanOrEqualTo(AuroraDimensions.touchTarget));
  });

  testWidgets('включённая кнопка зовёт onPressed', (tester) async {
    var taps = 0;
    await pumpAurora(tester, AuroraButton(label: 'Go', onPressed: () => taps++));
    await tester.tap(find.byType(AuroraButton));
    expect(taps, 1);
  });

  testWidgets('выключенная кнопка гасит подпись и не реагирует на тап', (tester) async {
    await pumpAurora(tester, const AuroraButton(label: 'Go', onPressed: null));
    final c = AuroraTheme.forBrand(AuroraBrand.aurora, Brightness.light).colors;
    expect(tester.widget<Text>(find.text('Go')).style?.color, c.textDisabled);

    await tester.tap(find.byType(AuroraButton));
    await tester.pump();
    expect(tester.takeException(), isNull);
  });

  testWidgets('иконочная кнопка несёт семантическую метку', (tester) async {
    await pumpAurora(
        tester,
        AuroraIconButton(
            icon: Icons.close_rounded, semanticLabel: 'Закрыть', onPressed: () {}));
    expect(find.bySemanticsLabel('Закрыть'), findsOneWidget);
  });
}
```

- [ ] **Step 3: Убедиться, что тест падает**

Run: `cd packages/aurora_design_system && mise exec -- flutter test test/button_test.dart`
Expected: FAIL — `AuroraButton` не определён.

- [ ] **Step 4: Реализовать кнопку**

`lib/src/base/button.dart`:

```dart
import 'package:flutter/material.dart';

// `aurora_theme.dart` реэкспортирует AuroraColorTokens и AuroraDimensions,
// поэтому прямой импорт tokens.g.dart здесь лишний и уронил бы analyze.
import '../theme/aurora_theme.dart';

/// Четыре вида кнопки. Пятый — иконочная — вынесен в [AuroraIconButton],
/// потому что у неё обязательна семантическая метка, а у текстовой её роль
/// играет сама подпись.
enum AuroraButtonKind { primary, secondary, ghost, danger }

class AuroraButton extends StatelessWidget {
  const AuroraButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.kind = AuroraButtonKind.primary,
    this.icon,
    this.expanded = false,
  });

  final String label;
  final VoidCallback? onPressed;
  final AuroraButtonKind kind;
  final IconData? icon;

  /// Кнопка на всю ширину — ряд действий внизу панели и листа.
  final bool expanded;

  bool get _enabled => onPressed != null;

  /// `null` означает «без заливки». Литерал прозрачного цвета в компоненте
  /// запрещён так же, как любой другой литерал цвета.
  Color? _background(AuroraColorTokens c) {
    final filled = kind == AuroraButtonKind.primary || kind == AuroraButtonKind.danger;
    if (!filled) return null;
    if (!_enabled) return c.surfaceChrome;
    return kind == AuroraButtonKind.primary ? c.actionPrimary : c.statusAlarm;
  }

  Color _foreground(AuroraColorTokens c) {
    if (!_enabled) return c.textDisabled;
    switch (kind) {
      case AuroraButtonKind.primary:
      case AuroraButtonKind.danger:
        return c.textOnBrand;
      case AuroraButtonKind.secondary:
        return c.textPrimary;
      case AuroraButtonKind.ghost:
        return c.actionPrimary;
    }
  }

  @override
  Widget build(BuildContext context) {
    final aurora = AuroraTheme.of(context);
    final c = aurora.colors;
    final fg = _foreground(c);

    final content = Row(
      mainAxisSize: expanded ? MainAxisSize.max : MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: <Widget>[
        if (icon != null) ...<Widget>[
          Icon(icon, size: 20, color: fg),
          const SizedBox(width: AuroraDimensions.space8),
        ],
        Flexible(
          child: Text(
            label,
            overflow: TextOverflow.ellipsis,
            style: aurora.typography.label.copyWith(color: fg),
          ),
        ),
      ],
    );

    return Semantics(
      button: true,
      enabled: _enabled,
      child: GestureDetector(
        onTap: onPressed,
        child: ConstrainedBox(
          constraints: const BoxConstraints(minHeight: AuroraDimensions.touchTarget),
          child: DecoratedBox(
            key: const Key('aurora.button'),
            decoration: BoxDecoration(
              color: _background(c),
              borderRadius: BorderRadius.circular(AuroraDimensions.radiusMd),
              border: kind == AuroraButtonKind.secondary
                  ? Border.all(
                      color: _enabled ? c.borderStrong : c.borderHairline,
                      width: AuroraDimensions.hairlineWidth,
                    )
                  : null,
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: AuroraDimensions.space16),
              child: Center(widthFactor: expanded ? null : 1, child: content),
            ),
          ),
        ),
      ),
    );
  }
}

/// Иконочная кнопка. [semanticLabel] обязателен: иконка без метки —
/// нарушение правила доступности, и оно закрыто типом, а не ревью.
class AuroraIconButton extends StatelessWidget {
  const AuroraIconButton({
    super.key,
    required this.icon,
    required this.semanticLabel,
    required this.onPressed,
  });

  final IconData icon;
  final String semanticLabel;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    final c = AuroraTheme.of(context).colors;
    return Semantics(
      button: true,
      label: semanticLabel,
      enabled: onPressed != null,
      child: GestureDetector(
        onTap: onPressed,
        child: SizedBox(
          width: AuroraDimensions.touchTarget,
          height: AuroraDimensions.touchTarget,
          child: Icon(icon, size: 24, color: onPressed == null ? c.textDisabled : c.textPrimary),
        ),
      ),
    );
  }
}
```

- [ ] **Step 5: Экспортировать**

В `lib/aurora_design_system.dart` добавить строку:

```dart
export 'src/base/button.dart';
```

- [ ] **Step 6: Прогнать тесты**

Run: `mise exec -- flutter test`
Expected: PASS, включая уже существующие тесты темы.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat(base): add AuroraButton and AuroraIconButton"
```

---

### Task 3: AuroraStatus и чипы

**Files:**
- Create: `packages/aurora_design_system/lib/src/base/status.dart`
- Create: `packages/aurora_design_system/lib/src/base/chip.dart`
- Create: `packages/aurora_design_system/test/chip_test.dart`
- Modify: `packages/aurora_design_system/lib/aurora_design_system.dart`

**Interfaces:**
- Consumes: `AuroraTheme`, `AuroraDimensions`, `AuroraColorTokens`.
- Produces: `enum AuroraStatus { moving, parked, warning, alarm, offline }` с методом `Color color(AuroraColorTokens)`; `AuroraStatusChip({required AuroraStatus status, required String label})`; `AuroraFilterChip({required String label, required bool selected, required VoidCallback? onPressed, String? count})`.

- [ ] **Step 1: Написать падающий тест**

`test/chip_test.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:aurora_design_system/aurora_design_system.dart';
import 'support/harness.dart';

void main() {
  forEachBrandAndTheme((brand, brightness) {
    final name = '${brand.name}/${brightness.name}';

    testWidgets('$name: точка красится цветом статуса', (tester) async {
      await pumpAurora(
          tester,
          const AuroraStatusChip(status: AuroraStatus.alarm, label: 'Тревога'),
          brand: brand,
          brightness: brightness);
      final tokens = AuroraTheme.forBrand(brand, brightness).colors;
      final dot = tester.widget<DecoratedBox>(find.byKey(const Key('aurora.chip.dot')));
      expect((dot.decoration as BoxDecoration).color, tokens.statusAlarm);
    });

    testWidgets('$name: рядом с точкой всегда есть текст', (tester) async {
      await pumpAurora(
          tester,
          const AuroraStatusChip(status: AuroraStatus.moving, label: 'В движении'),
          brand: brand,
          brightness: brightness);
      expect(find.text('В движении'), findsOneWidget);
    });
  });

  test('каждый статус отображается в свой токен', () {
    final c = AuroraTheme.forBrand(AuroraBrand.aurora, Brightness.light).colors;
    expect(AuroraStatus.moving.color(c), c.statusMoving);
    expect(AuroraStatus.parked.color(c), c.statusParked);
    expect(AuroraStatus.warning.color(c), c.statusWarning);
    expect(AuroraStatus.alarm.color(c), c.statusAlarm);
    expect(AuroraStatus.offline.color(c), c.statusOffline);
  });

  testWidgets('выбранный фильтр берёт приглушённое действие', (tester) async {
    await pumpAurora(tester,
        AuroraFilterChip(label: 'Все', selected: true, onPressed: () {}));
    final c = AuroraTheme.forBrand(AuroraBrand.aurora, Brightness.light).colors;
    final box = tester.widget<DecoratedBox>(find.byKey(const Key('aurora.chip.filter')));
    expect((box.decoration as BoxDecoration).color, c.actionSubtle);
  });
}
```

- [ ] **Step 2: Убедиться, что тест падает**

Run: `mise exec -- flutter test test/chip_test.dart`
Expected: FAIL — `AuroraStatus` не определён.

- [ ] **Step 3: Реализовать статус**

`lib/src/base/status.dart`:

```dart
import 'package:flutter/painting.dart' show Color;

import '../tokens/tokens.g.dart';

/// Пять состояний объекта из §5.3 спека. Это единственное знание о домене,
/// которое пакету позволено: цвета этих состояний уже лежат в токенах.
enum AuroraStatus { moving, parked, warning, alarm, offline }

extension AuroraStatusColor on AuroraStatus {
  Color color(AuroraColorTokens c) {
    switch (this) {
      case AuroraStatus.moving:
        return c.statusMoving;
      case AuroraStatus.parked:
        return c.statusParked;
      case AuroraStatus.warning:
        return c.statusWarning;
      case AuroraStatus.alarm:
        return c.statusAlarm;
      case AuroraStatus.offline:
        return c.statusOffline;
    }
  }
}
```

- [ ] **Step 4: Реализовать чипы**

`lib/src/base/chip.dart`:

```dart
import 'package:flutter/material.dart';

import '../theme/aurora_theme.dart';
import 'status.dart';

/// Статусный чип: точка плюс подпись. [label] обязателен — статус никогда не
/// кодируется одним цветом, и это правило закрыто типом, а не договорённостью.
class AuroraStatusChip extends StatelessWidget {
  const AuroraStatusChip({super.key, required this.status, required this.label});

  final AuroraStatus status;
  final String label;

  @override
  Widget build(BuildContext context) {
    final aurora = AuroraTheme.of(context);
    final c = aurora.colors;
    return DecoratedBox(
      decoration: BoxDecoration(
        color: c.surfaceContent,
        borderRadius: BorderRadius.circular(AuroraDimensions.radiusPill),
        border: Border.all(color: c.borderStrong, width: AuroraDimensions.hairlineWidth),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: AuroraDimensions.space12,
          vertical: AuroraDimensions.space8,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            DecoratedBox(
              key: const Key('aurora.chip.dot'),
              decoration: BoxDecoration(color: status.color(c), shape: BoxShape.circle),
              child: const SizedBox(width: AuroraDimensions.space8, height: AuroraDimensions.space8),
            ),
            const SizedBox(width: AuroraDimensions.space8),
            Text(label, style: aurora.typography.label.copyWith(color: c.textPrimary)),
          ],
        ),
      ),
    );
  }
}

/// Фильтр-чип со счётчиком. Счётчик — готовая строка: пакет не форматирует
/// числа.
class AuroraFilterChip extends StatelessWidget {
  const AuroraFilterChip({
    super.key,
    required this.label,
    required this.selected,
    required this.onPressed,
    this.count,
  });

  final String label;
  final bool selected;
  final VoidCallback? onPressed;
  final String? count;

  @override
  Widget build(BuildContext context) {
    final aurora = AuroraTheme.of(context);
    final c = aurora.colors;
    final fg = selected ? c.actionPrimary : c.textSecondary;

    return Semantics(
      button: true,
      selected: selected,
      child: GestureDetector(
        onTap: onPressed,
        child: ConstrainedBox(
          constraints: const BoxConstraints(minHeight: AuroraDimensions.touchTarget),
          child: DecoratedBox(
            key: const Key('aurora.chip.filter'),
            decoration: BoxDecoration(
              color: selected ? c.actionSubtle : c.surfaceChrome,
              borderRadius: BorderRadius.circular(AuroraDimensions.radiusMd),
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: AuroraDimensions.space12),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  Text(label, style: aurora.typography.label.copyWith(color: fg)),
                  if (count != null) ...<Widget>[
                    const SizedBox(width: AuroraDimensions.space4),
                    Text(count!, style: aurora.typography.numberSm.copyWith(color: fg)),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
```

- [ ] **Step 5: Экспортировать**

```dart
export 'src/base/chip.dart';
export 'src/base/status.dart';
```

- [ ] **Step 6: Прогнать тесты**

Run: `mise exec -- flutter test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat(base): add status chips and filter chips"
```

---

### Task 4: AuroraBanner

**Files:**
- Create: `packages/aurora_design_system/lib/src/base/banner.dart`
- Create: `packages/aurora_design_system/test/banner_test.dart`
- Modify: `packages/aurora_design_system/lib/aurora_design_system.dart`

**Interfaces:**
- Consumes: `AuroraTheme`, `AuroraDimensions`.
- Produces: `enum AuroraBannerKind { info, warning, error }`; `AuroraBanner({required String text, AuroraBannerKind kind, IconData? icon, Widget? action})`.

- [ ] **Step 1: Написать падающий тест**

`test/banner_test.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:aurora_design_system/aurora_design_system.dart';
import 'support/harness.dart';

void main() {
  forEachBrandAndTheme((brand, brightness) {
    final name = '${brand.name}/${brightness.name}';

    testWidgets('$name: предупреждение лежит на подложке предупреждения', (tester) async {
      await pumpAurora(
          tester,
          const AuroraBanner(text: 'Запись выключена', kind: AuroraBannerKind.warning),
          brand: brand,
          brightness: brightness);
      final tokens = AuroraTheme.forBrand(brand, brightness).colors;
      final box = tester.widget<DecoratedBox>(find.byKey(const Key('aurora.banner')));
      expect((box.decoration as BoxDecoration).color, tokens.statusWarningSubtle);
      expect(tester.widget<Text>(find.text('Запись выключена')).style?.color,
          tokens.textOnWarningSubtle);
    });

    testWidgets('$name: ошибка лежит на подложке тревоги', (tester) async {
      await pumpAurora(
          tester,
          const AuroraBanner(text: 'Не удалось отправить', kind: AuroraBannerKind.error),
          brand: brand,
          brightness: brightness);
      final tokens = AuroraTheme.forBrand(brand, brightness).colors;
      final box = tester.widget<DecoratedBox>(find.byKey(const Key('aurora.banner')));
      expect((box.decoration as BoxDecoration).color, tokens.statusAlarmSubtle);
    });

    testWidgets('$name: инфо берёт приглушённое действие', (tester) async {
      await pumpAurora(tester, const AuroraBanner(text: 'Смена до 18:00'),
          brand: brand, brightness: brightness);
      final tokens = AuroraTheme.forBrand(brand, brightness).colors;
      final box = tester.widget<DecoratedBox>(find.byKey(const Key('aurora.banner')));
      expect((box.decoration as BoxDecoration).color, tokens.actionSubtle);
    });
  });

  testWidgets('длинный текст переносится, а не обрезает баннер', (tester) async {
    await pumpAurora(
        tester,
        const SizedBox(
          width: 200,
          child: AuroraBanner(
              text:
                  'Запись выключится по расписанию сегодня в 18:00, включится завтра в 09:00'),
        ));
    expect(tester.takeException(), isNull);
  });
}
```

- [ ] **Step 2: Убедиться, что тест падает**

Run: `mise exec -- flutter test test/banner_test.dart`
Expected: FAIL — `AuroraBanner` не определён.

- [ ] **Step 3: Реализовать**

`lib/src/base/banner.dart`:

```dart
import 'package:flutter/material.dart';

import '../theme/aurora_theme.dart';

enum AuroraBannerKind { info, warning, error }

/// Полоса с сообщением: расписание, предупреждение, ошибка отправки.
/// Первый потребитель ролей `*Subtle` — до них такой баннер приходилось
/// красить вручную в каждом экране.
class AuroraBanner extends StatelessWidget {
  const AuroraBanner({
    super.key,
    required this.text,
    this.kind = AuroraBannerKind.info,
    this.icon,
    this.action,
  });

  final String text;
  final AuroraBannerKind kind;
  final IconData? icon;

  /// Кнопка справа. Виджет, а не колбэк: баннеру всё равно, что там.
  final Widget? action;

  Color _background(AuroraColorTokens c) {
    switch (kind) {
      case AuroraBannerKind.info:
        return c.actionSubtle;
      case AuroraBannerKind.warning:
        return c.statusWarningSubtle;
      case AuroraBannerKind.error:
        return c.statusAlarmSubtle;
    }
  }

  Color _foreground(AuroraColorTokens c) {
    switch (kind) {
      case AuroraBannerKind.info:
        return c.textPrimary;
      case AuroraBannerKind.warning:
        return c.textOnWarningSubtle;
      case AuroraBannerKind.error:
        return c.textOnAlarmSubtle;
    }
  }

  Color _bar(AuroraColorTokens c) {
    switch (kind) {
      case AuroraBannerKind.info:
        return c.actionPrimary;
      case AuroraBannerKind.warning:
        return c.statusWarning;
      case AuroraBannerKind.error:
        return c.statusAlarm;
    }
  }

  @override
  Widget build(BuildContext context) {
    final aurora = AuroraTheme.of(context);
    final c = aurora.colors;
    final fg = _foreground(c);

    return DecoratedBox(
      key: const Key('aurora.banner'),
      decoration: BoxDecoration(
        color: _background(c),
        borderRadius: BorderRadius.circular(AuroraDimensions.radiusMd),
      ),
      child: IntrinsicHeight(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            SizedBox(
              width: AuroraDimensions.activeBarWidth,
              child: ColoredBox(color: _bar(c)),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(AuroraDimensions.space12),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    if (icon != null) ...<Widget>[
                      Icon(icon, size: 20, color: fg),
                      const SizedBox(width: AuroraDimensions.space8),
                    ],
                    Expanded(
                      child: Text(text, style: aurora.typography.body.copyWith(color: fg)),
                    ),
                    if (action != null) ...<Widget>[
                      const SizedBox(width: AuroraDimensions.space8),
                      action!,
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

- [ ] **Step 4: Экспортировать и прогнать**

```dart
export 'src/base/banner.dart';
```

Run: `mise exec -- flutter test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(base): add AuroraBanner on the subtle status surfaces"
```

---

### Task 5: AuroraListRow

**Files:**
- Create: `packages/aurora_design_system/lib/src/base/list_row.dart`
- Create: `packages/aurora_design_system/test/list_row_test.dart`
- Modify: `packages/aurora_design_system/lib/aurora_design_system.dart`

**Interfaces:**
- Consumes: `AuroraTheme`, `AuroraDimensions`.
- Produces: `enum AuroraRowHeight { compact, standard, tall }`; `AuroraListRow({required String title, String? subtitle, Widget? leading, Widget? trailing, AuroraRowHeight height, bool selected, VoidCallback? onTap, bool showDivider})`.

- [ ] **Step 1: Написать падающий тест**

`test/list_row_test.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:aurora_design_system/aurora_design_system.dart';
import 'support/harness.dart';

void main() {
  forEachBrandAndTheme((brand, brightness) {
    final name = '${brand.name}/${brightness.name}';

    testWidgets('$name: выбранная строка берёт поверхность выделения', (tester) async {
      await pumpAurora(tester, const AuroraListRow(title: 'А 123 БВ', selected: true),
          brand: brand, brightness: brightness);
      final tokens = AuroraTheme.forBrand(brand, brightness).colors;
      final box = tester.widget<DecoratedBox>(find.byKey(const Key('aurora.row')));
      expect((box.decoration as BoxDecoration).color, tokens.surfaceSelected);
    });

    testWidgets('$name: невыбранная строка лежит на контенте', (tester) async {
      await pumpAurora(tester, const AuroraListRow(title: 'А 123 БВ'),
          brand: brand, brightness: brightness);
      final tokens = AuroraTheme.forBrand(brand, brightness).colors;
      final box = tester.widget<DecoratedBox>(find.byKey(const Key('aurora.row')));
      expect((box.decoration as BoxDecoration).color, tokens.surfaceContent);
    });
  });

  testWidgets('высоты берутся из токенов строк', (tester) async {
    await pumpAurora(tester, const AuroraListRow(title: 'x', height: AuroraRowHeight.compact));
    expect(tester.getSize(find.byKey(const Key('aurora.row'))).height,
        AuroraDimensions.rowCompact);
  });

  testWidgets('тап зовёт onTap', (tester) async {
    var taps = 0;
    await pumpAurora(tester, AuroraListRow(title: 'x', onTap: () => taps++));
    await tester.tap(find.byKey(const Key('aurora.row')));
    expect(taps, 1);
  });
}
```

- [ ] **Step 2: Убедиться, что тест падает**

Run: `mise exec -- flutter test test/list_row_test.dart`
Expected: FAIL — `AuroraListRow` не определён.

- [ ] **Step 3: Реализовать**

`lib/src/base/list_row.dart`:

```dart
import 'package:flutter/material.dart';

import '../theme/aurora_theme.dart';

/// Три высоты строки из токенов: 40, 52, 64.
enum AuroraRowHeight { compact, standard, tall }

/// Строка списка. Волосяная граница и поверхность выделения живут здесь,
/// а не в каждом экране: иначе выделение начинает выглядеть по-разному в
/// разных списках одного приложения.
class AuroraListRow extends StatelessWidget {
  const AuroraListRow({
    super.key,
    required this.title,
    this.subtitle,
    this.leading,
    this.trailing,
    this.height = AuroraRowHeight.standard,
    this.selected = false,
    this.onTap,
    this.showDivider = true,
  });

  final String title;
  final String? subtitle;
  final Widget? leading;
  final Widget? trailing;
  final AuroraRowHeight height;
  final bool selected;
  final VoidCallback? onTap;
  final bool showDivider;

  double get _height {
    switch (height) {
      case AuroraRowHeight.compact:
        return AuroraDimensions.rowCompact;
      case AuroraRowHeight.standard:
        return AuroraDimensions.rowDefault;
      case AuroraRowHeight.tall:
        return AuroraDimensions.rowDouble;
    }
  }

  @override
  Widget build(BuildContext context) {
    final aurora = AuroraTheme.of(context);
    final c = aurora.colors;

    return GestureDetector(
      onTap: onTap,
      child: DecoratedBox(
        key: const Key('aurora.row'),
        decoration: BoxDecoration(
          color: selected ? c.surfaceSelected : c.surfaceContent,
          border: showDivider
              ? Border(
                  bottom: BorderSide(
                    color: c.borderHairline,
                    width: AuroraDimensions.hairlineWidth,
                  ),
                )
              : null,
        ),
        child: SizedBox(
          height: _height,
          child: Row(
            children: <Widget>[
              SizedBox(
                width: AuroraDimensions.activeBarWidth,
                child: selected ? ColoredBox(color: c.actionPrimary) : null,
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AuroraDimensions.screenPadding,
                  ),
                  child: Row(
                    children: <Widget>[
                      if (leading != null) ...<Widget>[
                        leading!,
                        const SizedBox(width: AuroraDimensions.space12),
                      ],
                      Expanded(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            Text(
                              title,
                              overflow: TextOverflow.ellipsis,
                              style: aurora.typography.body.copyWith(color: c.textPrimary),
                            ),
                            if (subtitle != null)
                              Text(
                                subtitle!,
                                overflow: TextOverflow.ellipsis,
                                style: aurora.typography.caption
                                    .copyWith(color: c.textSecondary),
                              ),
                          ],
                        ),
                      ),
                      if (trailing != null) ...<Widget>[
                        const SizedBox(width: AuroraDimensions.space12),
                        trailing!,
                      ],
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

- [ ] **Step 4: Экспортировать и прогнать**

```dart
export 'src/base/list_row.dart';
```

Run: `mise exec -- flutter test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(base): add AuroraListRow with the selection surface"
```

---

### Task 6: Нижний лист и лист подтверждения

**Files:**
- Create: `packages/aurora_design_system/lib/src/base/sheet.dart`
- Create: `packages/aurora_design_system/test/sheet_test.dart`
- Modify: `packages/aurora_design_system/lib/aurora_design_system.dart`

**Interfaces:**
- Consumes: `AuroraButton`, `AuroraButtonKind`, `AuroraTheme`, `AuroraDimensions`.
- Produces: `Future<T?> showAuroraSheet<T>({required BuildContext context, required Widget child})`; `Future<bool?> showAuroraConfirmSheet({required BuildContext context, required String title, required String message, required String confirmLabel, required String cancelLabel, String? summary, bool destructive})`.

- [ ] **Step 1: Написать падающий тест**

`test/sheet_test.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:aurora_design_system/aurora_design_system.dart';
import 'support/harness.dart';

void main() {
  forEachBrandAndTheme((brand, brightness) {
    final name = '${brand.name}/${brightness.name}';

    testWidgets('$name: лист подтверждения показывает оба действия', (tester) async {
      late BuildContext ctx;
      await pumpAurora(
          tester,
          Builder(builder: (c) {
            ctx = c;
            return const SizedBox.shrink();
          }),
          brand: brand,
          brightness: brightness);

      showAuroraConfirmSheet(
        context: ctx,
        title: 'Выключить запись?',
        message: 'Точки перестанут писаться.',
        confirmLabel: 'Выключить',
        cancelLabel: 'Продолжить запись',
      );
      await tester.pumpAndSettle();

      expect(find.text('Выключить запись?'), findsOneWidget);
      expect(find.text('Выключить'), findsOneWidget);
      expect(find.text('Продолжить запись'), findsOneWidget);
    });
  });

  testWidgets('подтверждение возвращает true, отмена — false', (tester) async {
    late BuildContext ctx;
    await pumpAurora(tester, Builder(builder: (c) {
      ctx = c;
      return const SizedBox.shrink();
    }));

    final result = showAuroraConfirmSheet(
      context: ctx,
      title: 'Выключить запись?',
      message: 'Точки перестанут писаться.',
      confirmLabel: 'Выключить',
      cancelLabel: 'Продолжить запись',
    );
    await tester.pumpAndSettle();
    await tester.tap(find.text('Выключить'));
    await tester.pumpAndSettle();

    expect(await result, isTrue);
  });
}
```

- [ ] **Step 2: Убедиться, что тест падает**

Run: `mise exec -- flutter test test/sheet_test.dart`
Expected: FAIL — `showAuroraConfirmSheet` не определён.

- [ ] **Step 3: Реализовать**

`lib/src/base/sheet.dart`:

```dart
import 'package:flutter/material.dart';

import '../theme/aurora_theme.dart';
import 'button.dart';

/// Нижний лист. Радиус, фон и скрим уже заданы темой в `bottomSheetTheme`,
/// поэтому здесь их нет: иначе при правке токена лист остался бы прежним.
Future<T?> showAuroraSheet<T>({
  required BuildContext context,
  required Widget child,
  bool isDismissible = true,
}) {
  return showModalBottomSheet<T>(
    context: context,
    isDismissible: isDismissible,
    isScrollControlled: true,
    builder: (context) => SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(AuroraDimensions.screenPadding),
        child: child,
      ),
    ),
  );
}

/// Лист подтверждения деструктивного действия. Возвращает `true`, если
/// пользователь подтвердил, `false` — если отказался, `null` — если закрыл
/// лист свайпом.
Future<bool?> showAuroraConfirmSheet({
  required BuildContext context,
  required String title,
  required String message,
  required String confirmLabel,
  required String cancelLabel,
  String? summary,
  bool destructive = true,
}) {
  return showAuroraSheet<bool>(
    context: context,
    child: Builder(builder: (context) {
      final aurora = AuroraTheme.of(context);
      final c = aurora.colors;
      return Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Text(title, style: aurora.typography.title.copyWith(color: c.textPrimary)),
          const SizedBox(height: AuroraDimensions.space8),
          Text(message, style: aurora.typography.body.copyWith(color: c.textSecondary)),
          if (summary != null) ...<Widget>[
            const SizedBox(height: AuroraDimensions.space8),
            Text(summary, style: aurora.typography.caption.copyWith(color: c.textSecondary)),
          ],
          const SizedBox(height: AuroraDimensions.space24),
          AuroraButton(
            label: cancelLabel,
            expanded: true,
            kind: AuroraButtonKind.secondary,
            onPressed: () => Navigator.of(context).pop(false),
          ),
          const SizedBox(height: AuroraDimensions.space8),
          AuroraButton(
            label: confirmLabel,
            expanded: true,
            kind: destructive ? AuroraButtonKind.danger : AuroraButtonKind.primary,
            onPressed: () => Navigator.of(context).pop(true),
          ),
        ],
      );
    }),
  );
}
```

- [ ] **Step 4: Экспортировать и прогнать**

```dart
export 'src/base/sheet.dart';
```

Run: `mise exec -- flutter test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(base): add the bottom sheet and the confirm sheet"
```

---

### Task 7: Экраны без данных и с ошибкой

**Files:**
- Create: `packages/aurora_design_system/lib/src/base/states.dart`
- Create: `packages/aurora_design_system/test/states_test.dart`
- Modify: `packages/aurora_design_system/lib/aurora_design_system.dart`

**Interfaces:**
- Consumes: `AuroraButton`, `AuroraTheme`, `AuroraDimensions`.
- Produces: `AuroraEmptyState({required String title, String? message, IconData? icon, String? actionLabel, VoidCallback? onAction})`; `AuroraErrorState({required String title, String? message, String? retryLabel, VoidCallback? onRetry})`.

- [ ] **Step 1: Написать падающий тест**

`test/states_test.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:aurora_design_system/aurora_design_system.dart';
import 'support/harness.dart';

void main() {
  forEachBrandAndTheme((brand, brightness) {
    final name = '${brand.name}/${brightness.name}';

    testWidgets('$name: пустое состояние приглушено, а не тревожно', (tester) async {
      await pumpAurora(tester, const AuroraEmptyState(title: 'Заявок нет'),
          brand: brand, brightness: brightness);
      final tokens = AuroraTheme.forBrand(brand, brightness).colors;
      expect(tester.widget<Text>(find.text('Заявок нет')).style?.color, tokens.textPrimary);
      expect(tester.widget<Icon>(find.byType(Icon)).color, tokens.textSecondary);
    });

    testWidgets('$name: состояние ошибки красится тревогой', (tester) async {
      await pumpAurora(tester, const AuroraErrorState(title: 'Не удалось загрузить'),
          brand: brand, brightness: brightness);
      final tokens = AuroraTheme.forBrand(brand, brightness).colors;
      expect(tester.widget<Icon>(find.byType(Icon)).color, tokens.statusAlarm);
    });
  });

  testWidgets('кнопка повтора появляется только с колбэком', (tester) async {
    await pumpAurora(tester, const AuroraErrorState(title: 'Ошибка'));
    expect(find.byType(AuroraButton), findsNothing);

    await pumpAurora(
        tester,
        AuroraErrorState(title: 'Ошибка', retryLabel: 'Повторить', onRetry: () {}));
    expect(find.byType(AuroraButton), findsOneWidget);
  });
}
```

- [ ] **Step 2: Убедиться, что тест падает**

Run: `mise exec -- flutter test test/states_test.dart`
Expected: FAIL — `AuroraEmptyState` не определён.

- [ ] **Step 3: Реализовать**

`lib/src/base/states.dart`:

```dart
import 'package:flutter/material.dart';

import '../theme/aurora_theme.dart';
import 'button.dart';

/// Экран без данных. Самая частая дыра при редизайне: без него список без
/// строк выглядит сломанным, а не пустым.
class AuroraEmptyState extends StatelessWidget {
  const AuroraEmptyState({
    super.key,
    required this.title,
    this.message,
    this.icon,
    this.actionLabel,
    this.onAction,
  });

  final String title;
  final String? message;
  final IconData? icon;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return _StateBody(
      icon: icon ?? Icons.inbox_rounded,
      iconColor: AuroraTheme.of(context).colors.textSecondary,
      title: title,
      message: message,
      actionLabel: actionLabel,
      onAction: onAction,
    );
  }
}

/// Экран ошибки. Отличается от пустого только цветом значка и смыслом
/// действия: пустому предлагают создать, ошибке — повторить.
class AuroraErrorState extends StatelessWidget {
  const AuroraErrorState({
    super.key,
    required this.title,
    this.message,
    this.retryLabel,
    this.onRetry,
  });

  final String title;
  final String? message;
  final String? retryLabel;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    return _StateBody(
      icon: Icons.error_outline_rounded,
      iconColor: AuroraTheme.of(context).colors.statusAlarm,
      title: title,
      message: message,
      actionLabel: retryLabel,
      onAction: onRetry,
    );
  }
}

class _StateBody extends StatelessWidget {
  const _StateBody({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.message,
    required this.actionLabel,
    required this.onAction,
  });

  final IconData icon;
  final Color iconColor;
  final String title;
  final String? message;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    final aurora = AuroraTheme.of(context);
    final c = aurora.colors;

    return Padding(
      padding: const EdgeInsets.all(AuroraDimensions.space24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Icon(icon, size: 40, color: iconColor),
          const SizedBox(height: AuroraDimensions.space16),
          Text(
            title,
            textAlign: TextAlign.center,
            style: aurora.typography.section.copyWith(color: c.textPrimary),
          ),
          if (message != null) ...<Widget>[
            const SizedBox(height: AuroraDimensions.space8),
            Text(
              message!,
              textAlign: TextAlign.center,
              style: aurora.typography.body.copyWith(color: c.textSecondary),
            ),
          ],
          if (actionLabel != null && onAction != null) ...<Widget>[
            const SizedBox(height: AuroraDimensions.space24),
            AuroraButton(label: actionLabel!, onPressed: onAction),
          ],
        ],
      ),
    );
  }
}
```

- [ ] **Step 4: Экспортировать и прогнать**

```dart
export 'src/base/states.dart';
```

Run: `mise exec -- flutter test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(base): add empty and error states"
```

---

### Task 8: Гейт полноты

**Files:**
- Create: `tools/component-parity.js`
- Create: `test/component-parity.test.js`

**Interfaces:**
- Consumes: файловую структуру `packages/aurora_design_system/lib/src/base/` и `test/`.
- Produces: `checkComponentParity(): string[]` — список нарушений, пустой массив означает «всё в порядке».

- [ ] **Step 1: Написать падающий тест**

`test/component-parity.test.js`:

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { checkComponentParity } from '../tools/component-parity.js';

test('каждый компонент проверен в четырёх комбинациях бренд × тема', () => {
  assert.deepEqual(checkComponentParity(), []);
});
```

- [ ] **Step 2: Убедиться, что тест падает**

Run: `mise exec -- npm test`
Expected: FAIL — модуль `../tools/component-parity.js` не найден.

- [ ] **Step 3: Реализовать гейт**

`tools/component-parity.js`:

```javascript
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { root } from './load.js';

const PKG = path.join(root, 'packages', 'aurora_design_system');
const SRC = path.join(PKG, 'lib', 'src', 'base');
const TEST = path.join(PKG, 'test');

// Файлы без виджетов: перечислять их в исключениях честнее, чем угадывать по
// содержимому. Компонент, случайно попавший сюда, виден в диффе.
const NO_WIDGETS = new Set(['status.dart']);

/**
 * Компонент, экспортированный без проверки на четыре комбинации, — это
 * компонент, чья перекраска не проверена никем. Гейт ловит ровно это:
 * файл в `base/` обязан иметь тест, а тест обязан звать `forEachBrandAndTheme`.
 */
export function checkComponentParity() {
  const problems = [];
  if (!existsSync(SRC)) return problems;

  const barrel = readFileSync(path.join(PKG, 'lib', 'aurora_design_system.dart'), 'utf8');

  for (const file of readdirSync(SRC).filter((f) => f.endsWith('.dart'))) {
    const name = file.replace(/\.dart$/, '');

    if (!barrel.includes(`export 'src/base/${file}';`)) {
      problems.push(`${file}: лежит в base/, но не экспортирован из aurora_design_system.dart`);
    }

    if (NO_WIDGETS.has(file)) continue;

    const testFile = path.join(TEST, `${name}_test.dart`);
    if (!existsSync(testFile)) {
      problems.push(`${file}: нет теста test/${name}_test.dart`);
      continue;
    }

    const body = readFileSync(testFile, 'utf8');
    if (!body.includes('forEachBrandAndTheme(')) {
      problems.push(`${name}_test.dart: не зовёт forEachBrandAndTheme — компонент проверен не во всех темах`);
    }
  }

  return problems;
}
```

- [ ] **Step 4: Прогнать тест**

Run: `mise exec -- npm test`
Expected: PASS.

- [ ] **Step 5: Проверить, что гейт действительно ловит**

```bash
cd packages/aurora_design_system && mv test/banner_test.dart test/banner_test.dart.off
cd ../.. && mise exec -- npm test
```

Expected: FAIL с сообщением `banner.dart: нет теста test/banner_test.dart`.

Вернуть на место:

```bash
mv packages/aurora_design_system/test/banner_test.dart.off packages/aurora_design_system/test/banner_test.dart
mise exec -- npm test
```

Expected: PASS.

- [ ] **Step 6: Подключить гейт к сборке**

В `tools/build.js` заменить строку сбора проблем:

```javascript
import { checkComponentParity } from './component-parity.js';

const problems = [...validateAll(), ...checkBrandParity(), ...checkComponentParity()];
```

Run: `mise exec -- npm run build`
Expected: сборка проходит.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "test(gate): fail when a component ships without a four-combination test"
```

---

### Task 9: Changelog и версия

**Files:**
- Modify: `changelog/0.2.0.md`
- Modify: `packages/aurora_design_system/pubspec.yaml`

**Interfaces:**
- Consumes: всё выше.
- Produces: тег `v0.2.0`, создаваемый CI при пуше в `main`.

> **Внимание:** пуш этой задачи в `main` выпускает релиз — CI создаёт тег и
> GitHub-релиз. Выполнять только с явного согласия владельца репозитория.

- [ ] **Step 1: Дописать changelog**

В `changelog/0.2.0.md` перед последним абзацем добавить:

```markdown
- Первая партия базовых компонентов: `AuroraButton` и `AuroraIconButton`,
  статусный и фильтр-чипы, `AuroraBanner`, `AuroraListRow`, нижний лист с
  листом подтверждения, пустое состояние и состояние ошибки. Два правила
  системы закрыты типом, а не ревью: у иконочной кнопки обязательна
  семантическая метка, у статусного чипа — подпись рядом с точкой.
- Гейт полноты: компонент, экспортированный без теста на четыре комбинации
  бренд × тема, роняет сборку.
```

- [ ] **Step 2: Поднять версию**

В `packages/aurora_design_system/pubspec.yaml`:

```yaml
version: 0.2.0
```

- [ ] **Step 3: Прогнать всё**

```bash
mise exec -- npm test && mise exec -- npm run build
cd packages/aurora_design_system && mise exec -- flutter analyze && mise exec -- flutter test
```

Expected: всё зелёное.

- [ ] **Step 4: Commit**

```bash
cd ../.. && git add -A && git commit -m "chore: release 0.2.0"
```

---

## Что этот план не делает

Подключение `aurora-driver-flutter` и `AuroraTrackerApp` — §7 спека — живёт в
их собственных репозиториях и требует отдельного плана. Туда же уходит гейт,
запрещающий литералы цвета в приложениях: он работает на их дереве, не на
этом. Подключать имеет смысл версию, в которой уже есть шрифт и первая партия
компонентов, поэтому тот план опирается на этот.

Открытым остаётся размер иконок: 20 у кнопки, 24 у иконочной кнопки, 40 у
пустого состояния стоят числами. Роли для размеров иконок в токенах нет, и
заводить её посреди этой работы значило бы принимать решение о шкале мимо
дизайнера.
