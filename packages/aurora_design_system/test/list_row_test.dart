import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:aurora_design_system/aurora_design_system.dart';
import 'support/harness.dart';

void main() {
  testWidgets('длинный заголовок не переносится на вторую строку', (tester) async {
    const longTitle =
        'очень очень очень очень очень очень очень очень очень очень очень очень очень очень очень очень очень очень заголовок';
    await pumpAurora(
      tester,
      const SizedBox(
        width: 100,
        child: AuroraListRow(
          title: longTitle,
          height: AuroraRowHeight.compact,
        ),
      ),
    );

    final textFinder = find.text(longTitle);
    expect(textFinder, findsOneWidget);

    // The title text must fit inside the row as a single line.
    expect(
      tester.getSize(textFinder).height,
      lessThan(AuroraDimensions.rowCompact),
      reason: 'Title must fit in row height as single line',
    );
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

  testWidgets('тапабельная выбранная строка несёт семантику кнопки и выбора', (tester) async {
    await pumpAurora(tester, AuroraListRow(title: 'x', selected: true, onTap: () {}));
    expect(
      tester.getSemantics(find.byKey(const Key('aurora.row'))),
      matchesSemantics(isButton: true, hasSelectedState: true, isSelected: true, hasTapAction: true),
    );
  });

  testWidgets('строка без onTap не несёт семантику кнопки', (tester) async {
    await pumpAurora(tester, const AuroraListRow(title: 'x'));
    expect(
      tester.getSemantics(find.byKey(const Key('aurora.row'))),
      matchesSemantics(isButton: false, hasSelectedState: true, isSelected: false),
    );
  });
}
