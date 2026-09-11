import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:aurora_design_system/aurora_design_system.dart';
import 'support/harness.dart';

void main() {
  forEachBrandAndTheme((brand, brightness) {
    final name = '${brand.name}/${brightness.name}';

    testWidgets('$name: пустое состояние приглушено, а не тревожно', (tester) async {
      await pumpAurora(tester, const AuroraEmptyState(title: 'Заявок нет'),
          brand: brand, brightness: brightness);
      final tokens = AuroraTheme.forBrand(brand, brightness).colors;
      expect(tester.widget<Text>(find.text('Заявок нет')).style?.color, tokens.textPrimary);
      expect(tester.widget<Icon>(find.byType(Icon)).color, tokens.textSecondary);
    });

    testWidgets('$name: состояние ошибки красится тревогой', (tester) async {
      await pumpAurora(tester, const AuroraErrorState(title: 'Не удалось загрузить'),
          brand: brand, brightness: brightness);
      final tokens = AuroraTheme.forBrand(brand, brightness).colors;
      expect(tester.widget<Icon>(find.byType(Icon)).color, tokens.statusAlarm);
    });
  });

  testWidgets('кнопка повтора появляется только с колбэком', (tester) async {
    await pumpAurora(tester, const AuroraErrorState(title: 'Ошибка'));
    expect(find.byType(AuroraButton), findsNothing);

    await pumpAurora(
        tester,
        AuroraErrorState(title: 'Ошибка', retryLabel: 'Повторить', onRetry: () {}));
    expect(find.byType(AuroraButton), findsOneWidget);
  });
}
