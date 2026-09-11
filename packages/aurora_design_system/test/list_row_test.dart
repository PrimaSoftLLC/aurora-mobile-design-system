import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:aurora_design_system/aurora_design_system.dart';
import 'support/harness.dart';

void main() {
  testWidgets('компонент не ломается на длинном тексте в узкой ширине', (tester) async {
    await pumpAurora(
      tester,
      const SizedBox(
        width: 200,
        child: AuroraListRow(
          title: 'очень очень очень очень очень очень длинный заголовок',
          subtitle: 'очень очень очень очень очень очень длинный подзаголовок',
          height: AuroraRowHeight.compact,
        ),
      ),
    );
    // Verify the row height is still the compact height (40), not grown by wrapping text
    final rowSize = tester.getSize(find.byKey(const Key('aurora.row')));
    expect(rowSize.height, AuroraDimensions.rowCompact);
    // Verify no RenderFlex overflow exceptions were thrown
    expect(tester.takeException(), isNull);
  });

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
