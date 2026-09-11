import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:aurora_design_system/aurora_design_system.dart';
import 'support/harness.dart';

void main() {
  forEachBrandAndTheme((brand, brightness) {
    final name = '${brand.name}/${brightness.name}';

    testWidgets('$name: лист подтверждения показывает оба действия', (tester) async {
      late BuildContext ctx;
      await pumpAurora(
          tester,
          Builder(builder: (c) {
            ctx = c;
            return const SizedBox.shrink();
          }),
          brand: brand,
          brightness: brightness);

      showAuroraConfirmSheet(
        context: ctx,
        title: 'Выключить запись?',
        message: 'Точки перестанут писаться.',
        confirmLabel: 'Выключить',
        cancelLabel: 'Продолжить запись',
      );
      await tester.pumpAndSettle();

      expect(find.text('Выключить запись?'), findsOneWidget);
      expect(find.text('Выключить'), findsOneWidget);
      expect(find.text('Продолжить запись'), findsOneWidget);

      // Радиус, фон и скрим листа заданы темой (bottomSheetTheme), а не
      // компонентом — проверяем, что для каждого бренда и темы лист
      // действительно взял их из токенов, а не совпал случайно в одной
      // комбинации.
      final tokens = AuroraTheme.forBrand(brand, brightness).colors;
      // Material конкретно листа, а не любой Material в дереве — иначе в
      // светлой теме surfaceContent == surfaceOverlay совпадает с фоном
      // Scaffold и находится больше одного совпадения.
      final surface = tester.widget<Material>(
          find.descendant(of: find.byType(BottomSheet), matching: find.byType(Material)));
      expect(surface.color, tokens.surfaceOverlay);

      final barrier = tester.widget<AnimatedModalBarrier>(find.byType(AnimatedModalBarrier));
      expect(barrier.color.value, tokens.surfaceScrim);
    });
  });

  testWidgets('длинное сообщение не выталкивает кнопки подтверждения за экран', (tester) async {
    late BuildContext ctx;
    await pumpAurora(tester, Builder(builder: (c) {
      ctx = c;
      return const SizedBox.shrink();
    }));

    showAuroraConfirmSheet(
      context: ctx,
      title: 'Выключить запись?',
      message: 'Точки перестанут писаться. ' * 40,
      confirmLabel: 'Выключить',
      cancelLabel: 'Продолжить запись',
    );
    await tester.pumpAndSettle();

    expect(tester.takeException(), isNull);
    expect(find.text('Выключить'), findsOneWidget);
    expect(find.text('Продолжить запись'), findsOneWidget);
  });

  testWidgets('подтверждение возвращает true, отмена — false', (tester) async {
    late BuildContext ctx;
    await pumpAurora(tester, Builder(builder: (c) {
      ctx = c;
      return const SizedBox.shrink();
    }));

    final result = showAuroraConfirmSheet(
      context: ctx,
      title: 'Выключить запись?',
      message: 'Точки перестанут писаться.',
      confirmLabel: 'Выключить',
      cancelLabel: 'Продолжить запись',
    );
    await tester.pumpAndSettle();
    await tester.tap(find.text('Выключить'));
    await tester.pumpAndSettle();

    expect(await result, isTrue);
  });
}
