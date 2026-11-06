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
      expect(tester.widget<Text>(find.text('Stop')).style?.color, tokens.textOnSolid);
    });

    testWidgets('$name: ghost использует брендовые чернила', (tester) async {
      await pumpAurora(
          tester,
          AuroraButton(label: 'Link', onPressed: () {}, kind: AuroraButtonKind.ghost),
          brand: brand,
          brightness: brightness);
      final tokens = AuroraTheme.forBrand(brand, brightness).colors;
      expect(tester.widget<Text>(find.text('Link')).style?.color, tokens.actionText);
    });
  });

  testWidgets('зона нажатия не меньше 44 и не растянута сверх меры', (tester) async {
    // UnconstrainedBox — не Center из harness: Center внутри Scaffold.body
    // даёт лишь loose-ограничение по высоте, и кнопка, растянувшаяся на всю
    // доступную высоту, всё равно проходит `>= 44`. UnconstrainedBox снимает
    // ограничение вовсе, так что тест меряет собственный размер кнопки, а не
    // то, сколько места ей досталось.
    await pumpAurora(tester, UnconstrainedBox(child: AuroraButton(label: 'Go', onPressed: () {})));
    final height = tester.getSize(find.byType(AuroraButton)).height;
    expect(height, greaterThanOrEqualTo(AuroraDimensions.touchTarget));
    expect(height, lessThan(AuroraDimensions.touchTarget + 16),
        reason: 'кнопка не должна раздуваться сверх зоны нажатия');
  });

  testWidgets('в ряду действий внизу панели кнопка не растягивается на всю высоту ряда',
      (tester) async {
    // Реальный сценарий из документации button.dart: "ряд действий внизу
    // панели". Row даёт каждой кнопке loose-ограничение по высоте до своей
    // собственной высоты — без heightFactor на внутреннем Center кнопка
    // заполняет это ограничение целиком.
    await pumpAurora(
      tester,
      Row(
        children: <Widget>[
          Expanded(child: AuroraButton(label: 'A', onPressed: () {})),
          const SizedBox(width: AuroraDimensions.space8),
          Expanded(child: AuroraButton(label: 'B', onPressed: () {})),
        ],
      ),
    );
    final height = tester.getSize(find.byType(AuroraButton).first).height;
    expect(height, lessThan(AuroraDimensions.touchTarget + 16));
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

  testWidgets('иконочная кнопка ловит тап у самого края зоны 44×44, а не только по глифу',
      (tester) async {
    var taps = 0;
    await pumpAurora(
        tester,
        AuroraIconButton(
            icon: Icons.close_rounded,
            semanticLabel: 'Закрыть',
            onPressed: () => taps++));
    final topLeft = tester.getTopLeft(find.byType(AuroraIconButton));
    // 2px от угла квадрата 44×44 — далеко от глифа 24×24 в центре, но всё
    // ещё внутри заявленной зоны нажатия.
    await tester.tapAt(topLeft + const Offset(2, 2));
    expect(taps, 1);
  });
}
