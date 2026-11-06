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

    testWidgets('$name: выбранный фильтр берёт приглушённое действие', (tester) async {
      await pumpAurora(tester,
          AuroraFilterChip(label: 'Все', selected: true, onPressed: () {}),
          brand: brand, brightness: brightness);
      final tokens = AuroraTheme.forBrand(brand, brightness).colors;
      final box = tester.widget<DecoratedBox>(find.byKey(const Key('aurora.chip.filter')));
      expect((box.decoration as BoxDecoration).color, tokens.actionSubtle);
      expect(tester.widget<Text>(find.text('Все')).style?.color, tokens.actionText);
    });

    testWidgets('$name: невыбранный фильтр лежит на приглушённой поверхности', (tester) async {
      await pumpAurora(tester,
          AuroraFilterChip(label: 'Все', selected: false, onPressed: () {}),
          brand: brand, brightness: brightness);
      final tokens = AuroraTheme.forBrand(brand, brightness).colors;
      final box = tester.widget<DecoratedBox>(find.byKey(const Key('aurora.chip.filter')));
      expect((box.decoration as BoxDecoration).color, tokens.surfaceChrome);
    });

    testWidgets('$name: счётчик фильтра рисуется рядом с меткой', (tester) async {
      await pumpAurora(
          tester,
          AuroraFilterChip(
              label: 'Активные', selected: false, onPressed: () {}, count: '12'),
          brand: brand,
          brightness: brightness);
      expect(find.text('Активные'), findsOneWidget);
      expect(find.text('12'), findsOneWidget);
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

  testWidgets('длинная подпись статус-чипа не переполняет узкий контейнер', (tester) async {
    await pumpAurora(
      tester,
      const SizedBox(
        width: 100,
        child: AuroraStatusChip(
          status: AuroraStatus.alarm,
          label: 'Очень длинная подпись статуса, которая не влезает в сто пикселей ширины',
        ),
      ),
    );
    expect(tester.takeException(), isNull);
  });

  testWidgets('длинная подпись фильтр-чипа не переполняет узкий контейнер', (tester) async {
    await pumpAurora(
      tester,
      SizedBox(
        width: 100,
        child: AuroraFilterChip(
          label: 'Очень длинная подпись фильтра, которая не влезает в сто пикселей ширины',
          selected: false,
          onPressed: () {},
        ),
      ),
    );
    expect(tester.takeException(), isNull);
  });

  testWidgets('выключенный фильтр гасит подпись и несёт признак выключенности', (tester) async {
    await pumpAurora(
        tester, const AuroraFilterChip(label: 'Все', selected: true, onPressed: null));
    final c = AuroraTheme.forBrand(AuroraBrand.aurora, Brightness.light).colors;
    expect(tester.widget<Text>(find.text('Все')).style?.color, c.textDisabled);

    expect(
      tester.getSemantics(find.byType(AuroraFilterChip)),
      matchesSemantics(
        hasEnabledState: true,
        isEnabled: false,
        isButton: true,
        hasSelectedState: true,
        isSelected: true,
      ),
    );

    await tester.tap(find.byType(AuroraFilterChip));
    await tester.pump();
    expect(tester.takeException(), isNull);
  });
}
