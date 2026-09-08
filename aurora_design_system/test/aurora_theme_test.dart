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

  testWidgets('в ThemeData нет теней', (tester) async {
    final data = auroraThemeData(AuroraBrand.aurora, Brightness.light);
    expect(data.cardTheme.elevation, 0);
    expect(data.appBarTheme.elevation, 0);
    expect(data.appBarTheme.scrolledUnderElevation, 0);
  });
}
