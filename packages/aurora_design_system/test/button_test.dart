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
