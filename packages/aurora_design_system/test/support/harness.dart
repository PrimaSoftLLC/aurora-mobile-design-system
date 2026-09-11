import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:aurora_design_system/aurora_design_system.dart';

/// Прогоняет тело по всем четырём комбинациям бренд × тема. Компонент,
/// проверенный только в одной, не считается проверенным: перекраска — то,
/// ради чего система существует.
void forEachBrandAndTheme(void Function(AuroraBrand brand, Brightness brightness) body) {
  for (final brand in AuroraBrand.values) {
    for (final brightness in Brightness.values) {
      body(brand, brightness);
    }
  }
}

/// Поднимает виджет внутри MaterialApp с темой Aurora. Без темы
/// `AuroraTheme.of` падает по assert.
Future<void> pumpAurora(
  WidgetTester tester,
  Widget child, {
  AuroraBrand brand = AuroraBrand.aurora,
  Brightness brightness = Brightness.light,
}) {
  return tester.pumpWidget(MaterialApp(
    theme: auroraThemeData(brand, brightness),
    home: Scaffold(body: Center(child: child)),
  ));
}
