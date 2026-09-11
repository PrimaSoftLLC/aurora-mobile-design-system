import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:aurora_design_system/aurora_design_system.dart';

void main() {
  test('Aurora светлая берёт белый контент и синее действие', () {
    final t = AuroraTheme.forBrand(AuroraBrand.aurora, Brightness.light);
    expect(t.colors.surfaceContent, const Color(0xFFFFFFFF));
    expect(t.colors.actionPrimary, const Color(0xFF0066B8));
  });

  test('Aurora тёмная берёт индиговый контент', () {
    final t = AuroraTheme.forBrand(AuroraBrand.aurora, Brightness.dark);
    expect(t.colors.surfaceContent, const Color(0xFF101220));
    expect(t.colors.actionPrimary, const Color(0xFF3E9BE0));
  });

  test('МТС берёт свою шкалу', () {
    final t = AuroraTheme.forBrand(AuroraBrand.mts, Brightness.light);
    expect(t.colors.actionPrimary, const Color(0xFFD0050F));
    expect(t.colors.surfaceChrome, const Color(0xFFF7F6F5));
  });

  test('статусы одинаковы у обоих брендов', () {
    final a = AuroraTheme.forBrand(AuroraBrand.aurora, Brightness.light);
    final m = AuroraTheme.forBrand(AuroraBrand.mts, Brightness.light);
    expect(a.colors.statusAlarm, m.colors.statusAlarm);
    expect(a.colors.statusMoving, m.colors.statusMoving);
  });

  test('числовые роли включают табличные цифры', () {
    final t = AuroraTheme.forBrand(AuroraBrand.aurora, Brightness.light);
    expect(t.typography.numberMd.fontFeatures, contains(const FontFeature.tabularFigures()));
    expect(t.typography.body.fontFeatures ?? const [], isNot(contains(const FontFeature.tabularFigures())));
  });

  test('lerp возвращает валидную тему на границах', () {
    final a = AuroraTheme.forBrand(AuroraBrand.aurora, Brightness.light);
    final b = AuroraTheme.forBrand(AuroraBrand.aurora, Brightness.dark);
    expect(a.lerp(b, 0).colors.surfaceContent, a.colors.surfaceContent);
    expect(a.lerp(b, 1).colors.surfaceContent, b.colors.surfaceContent);
  });

  testWidgets('AuroraTheme.of достаёт тему из контекста', (tester) async {
    late AuroraTheme found;
    await tester.pumpWidget(MaterialApp(
      theme: auroraThemeData(AuroraBrand.mts, Brightness.light),
      home: Builder(builder: (context) {
        found = AuroraTheme.of(context);
        return const SizedBox();
      }),
    ));
    expect(found.brand, AuroraBrand.mts);
    expect(found.colors.actionPrimary, const Color(0xFFD0050F));
  });

  // Прошлая версия этой проверки читала те же три поля, которые
  // auroraThemeData задаёт двумя строками выше, — тавтология в костюме
  // принципа. Здесь дерево реально собирается, и проверяется то, что видит
  // пользователь: ни один отрисованный Material не поднят над плоскостью.
  // ElevatedButton и FloatingActionButton взяты потому, что в Material 3 у
  // них ненулевая elevation по умолчанию (1.0 и 6.0), то есть проверка
  // способна падать.
  testWidgets('ни один Material в собранном дереве не поднят над плоскостью', (tester) async {
    await tester.pumpWidget(MaterialApp(
      theme: auroraThemeData(AuroraBrand.aurora, Brightness.light),
      home: Scaffold(
        floatingActionButton: FloatingActionButton(
          onPressed: () {},
          child: const Icon(Icons.add),
        ),
        body: Center(
          child: ElevatedButton(onPressed: () {}, child: const Text('Кнопка')),
        ),
      ),
    ));
    await tester.pumpAndSettle();

    final materials = tester.widgetList<Material>(find.byType(Material)).toList();
    expect(materials, isNotEmpty, reason: 'дерево не собралось — проверять нечего');
    for (final m in materials) {
      expect(
        m.elevation, 0.0,
        reason: 'Material с elevation ${m.elevation} — теней в системе нет',
      );
    }
  });

  testWidgets('тень и M3-подкраска поверхности отключены глобально', (tester) async {
    for (final brightness in Brightness.values) {
      final data = auroraThemeData(AuroraBrand.mts, brightness);
      expect(data.shadowColor, Colors.transparent);
      expect(data.colorScheme.shadow, Colors.transparent);
      expect(data.colorScheme.surfaceTint, Colors.transparent);
    }
  });

  test('структурно одинаковые темы равны', () {
    final a = AuroraTheme.forBrand(AuroraBrand.aurora, Brightness.light);
    final b = AuroraTheme.forBrand(AuroraBrand.aurora, Brightness.light);
    expect(identical(a, b), isFalse, reason: 'иначе проверка равенства вырождается');
    expect(a, equals(b));
    expect(a.hashCode, equals(b.hashCode));
    expect(a, isNot(equals(AuroraTheme.forBrand(AuroraBrand.mts, Brightness.light))));
    expect(a, isNot(equals(AuroraTheme.forBrand(AuroraBrand.aurora, Brightness.dark))));
  });

  test('типографика сравнивается по значению, а не по ссылке', () {
    const a = AuroraTypography.standard();
    const b = AuroraTypography(
      display: AuroraTypographyTokens.display,
      title: AuroraTypographyTokens.title,
      section: AuroraTypographyTokens.section,
      body: AuroraTypographyTokens.body,
      label: AuroraTypographyTokens.label,
      caption: AuroraTypographyTokens.caption,
      overline: AuroraTypographyTokens.overline,
      numberLg: AuroraTypographyTokens.numberLg,
      numberMd: AuroraTypographyTokens.numberMd,
      numberSm: AuroraTypographyTokens.numberSm,
    );
    expect(a, equals(b));
    expect(a.hashCode, equals(b.hashCode));
    const c = AuroraTypography(
      display: AuroraTypographyTokens.title,
      title: AuroraTypographyTokens.title,
      section: AuroraTypographyTokens.section,
      body: AuroraTypographyTokens.body,
      label: AuroraTypographyTokens.label,
      caption: AuroraTypographyTokens.caption,
      overline: AuroraTypographyTokens.overline,
      numberLg: AuroraTypographyTokens.numberLg,
      numberMd: AuroraTypographyTokens.numberMd,
      numberSm: AuroraTypographyTokens.numberSm,
    );
    expect(a, isNot(equals(c)));
  });

  // Симптом, ради которого всё это: ThemeData сравнивает extensions по
  // значению, и без равенства на AuroraTheme два одинаково собранных
  // ThemeData расходились бы на каждой пересборке.
  test('два одинаково собранных ThemeData равны', () {
    expect(
      auroraThemeData(AuroraBrand.aurora, Brightness.light),
      equals(auroraThemeData(AuroraBrand.aurora, Brightness.light)),
    );
    expect(
      auroraThemeData(AuroraBrand.aurora, Brightness.light),
      isNot(equals(auroraThemeData(AuroraBrand.mts, Brightness.light))),
    );
  });

  // Фолбэки ColorScheme: outline → onSurface, surfaceContainer* → surface.
  // Незаданное поле не пустое, оно молча берёт соседний токен, и рамка поля
  // ввода становится text.primary. Проверяются именно те поля, которые
  // Material читает для рамок, подсказок, диалогов, листов и затемнения.
  test('ColorScheme не оставляет Material на фолбэках', () {
    for (final brightness in Brightness.values) {
      final c = AuroraTheme.forBrand(AuroraBrand.aurora, brightness).colors;
      final s = auroraThemeData(AuroraBrand.aurora, brightness).colorScheme;
      expect(s.outline, c.borderStrong);
      expect(s.outlineVariant, c.borderHairline);
      expect(s.onSurfaceVariant, c.textSecondary);
      expect(s.surfaceContainerLow, c.surfaceOverlay);
      expect(s.surfaceContainerHigh, c.surfaceOverlay);
      expect(s.scrim, c.surfaceScrim);
    }
  });

  // Тёмная тема: там overlay (neutral.900) и content (neutral.1000) — разные
  // ступени, и подмена одного другим видна. В светлой обе белые, и проверка
  // ничего бы не доказала.
  testWidgets('диалог и шторка лежат на surface.overlay, под ними surface.scrim', (tester) async {
    final c = AuroraTheme.forBrand(AuroraBrand.aurora, Brightness.dark).colors;
    expect(c.surfaceOverlay, isNot(c.surfaceContent), reason: 'иначе проверка вырождается');

    late BuildContext ctx;
    await tester.pumpWidget(MaterialApp(
      theme: auroraThemeData(AuroraBrand.aurora, Brightness.dark),
      home: Scaffold(
        body: Builder(builder: (context) {
          ctx = context;
          return const SizedBox();
        }),
      ),
    ));

    showDialog<void>(context: ctx, builder: (_) => const AlertDialog(title: Text('Диалог')));
    await tester.pumpAndSettle();
    final dialog = tester.widget<Material>(
      find.descendant(of: find.byType(Dialog), matching: find.byType(Material)).first,
    );
    expect(dialog.color, c.surfaceOverlay);
    expect(
      tester.widget<AnimatedModalBarrier>(find.byType(AnimatedModalBarrier)).color.value,
      c.surfaceScrim,
    );
    Navigator.of(ctx, rootNavigator: true).pop();
    await tester.pumpAndSettle();

    showModalBottomSheet<void>(context: ctx, builder: (_) => const SizedBox(height: 100));
    await tester.pumpAndSettle();
    final sheet = tester.widget<Material>(
      find.descendant(of: find.byType(BottomSheet), matching: find.byType(Material)).first,
    );
    expect(sheet.color, c.surfaceOverlay);
    expect(
      tester.widget<AnimatedModalBarrier>(find.byType(AnimatedModalBarrier)).color.value,
      c.surfaceScrim,
    );
  });

  testWidgets('поле ввода берёт скруглённую рамку радиуса 8', (tester) async {
    await tester.pumpWidget(MaterialApp(
      theme: auroraThemeData(AuroraBrand.aurora, Brightness.light),
      home: const Scaffold(body: TextField()),
    ));
    final decorator = tester.widget<InputDecorator>(find.byType(InputDecorator));
    final border = decorator.decoration.border;
    expect(border, isA<OutlineInputBorder>());
    expect(
      (border! as OutlineInputBorder).borderRadius,
      BorderRadius.circular(AuroraDimensions.radiusMd),
    );
  });

  test('слоты Material берут роли §6, и у всех есть арабский фолбэк', () {
    final t = auroraThemeData(AuroraBrand.aurora, Brightness.light).textTheme;
    expect(t.titleLarge!.fontSize, AuroraTypographyTokens.title.fontSize);
    expect(t.bodyMedium!.fontSize, AuroraTypographyTokens.body.fontSize);
    expect(t.labelLarge!.fontWeight, AuroraTypographyTokens.label.fontWeight);
    expect(t.labelSmall!.fontSize, AuroraTypographyTokens.overline.fontSize);
    for (final style in [t.displayLarge, t.titleLarge, t.bodyMedium, t.labelLarge, t.bodySmall]) {
      expect(style!.fontFamily, AuroraTypographyTokens.fontFamilySans);
      expect(style.fontFamilyFallback, contains(AuroraTypographyTokens.fontFamilyArabic));
    }
    expect(AuroraTypographyTokens.numberSm.fontFamilyFallback, contains('Noto Sans Arabic'));
  });

  test('семейство шрифта package-квалифицировано', () {
    expect(AuroraTypographyTokens.fontFamilySans, 'packages/aurora_design_system/Inter');
  });

  test('вес 550 у label доезжает осью wght, а не округляется', () {
    expect(
      AuroraTypographyTokens.label.fontVariations,
      contains(const FontVariation('wght', 550)),
    );
  });
}
