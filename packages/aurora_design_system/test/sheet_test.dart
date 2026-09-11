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
    });
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
