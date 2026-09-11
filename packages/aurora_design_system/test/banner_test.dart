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
