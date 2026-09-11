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
