import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:aurora_design_system/aurora_design_system.dart';
import 'support/harness.dart';

void main() {
  testWidgets('длинный заголовок не переносится на вторую строку', (tester) async {
    const longTitle = 'очень очень очень очень очень очень длинный заголовок';
    await pumpAurora(
      tester,
      const SizedBox(
        width: 120,  // Narrow width to force wrapping without maxLines
        child: AuroraListRow(
          title: longTitle,
          height: AuroraRowHeight.compact,
        ),
      ),
    );
    // Check the RenderParagraph to count actual lines rendered.
    // With maxLines: 1, should have 1 line.
    // Without maxLines, should have 2+ lines.
    final textFinder = find.text(longTitle);
    expect(textFinder, findsOneWidget);

    // Get the Text widget to verify maxLines is set
    final textWidget = textFinder.evaluate().first.widget as Text;
    expect(textWidget.maxLines, equals(1),
        reason: 'Text widget should have maxLines: 1 set');
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
