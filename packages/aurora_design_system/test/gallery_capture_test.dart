import 'dart:io';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:aurora_design_system/aurora_design_system.dart';

import 'support/harness.dart';

/// Не golden-тест: ничего ни с чем не сравнивается, поэтому он не может
/// покраснеть из-за сдвига на пиксель между Windows разработчика и ubuntu в
/// CI. Он только рисует компоненты настоящим Flutter'ом и кладёт снимки в
/// `build/gallery/`, откуда их забирает генератор превью.
///
/// Смысл в том, что превью показывает не подобие компонента на HTML, а тот
/// самый виджет, который поедет в приложение: разойтись с кодом снимок не
/// может по построению.
void main() {
  final outDir = Directory('../../build/gallery');

  setUpAll(() async {
    if (outDir.existsSync()) outDir.deleteSync(recursive: true);
    outDir.createSync(recursive: true);

    // Без этого `flutter test` рисует текст заглушкой — пустыми квадратами.
    // Снимок с «тофу» вместо подписей хуже отсутствия снимка: он выглядит
    // как сломанный компонент, хотя сломано только тестовое окружение.
    // Имя семейства обязано совпадать с тем, что ставит тема, то есть быть
    // package-квалифицированным.
    final bytes = File('assets/fonts/InterVariable.ttf').readAsBytesSync();
    await (FontLoader(AuroraTypographyTokens.fontFamilySans)
          ..addFont(Future<ByteData>.value(ByteData.view(bytes.buffer))))
        .load();
  });

  forEachBrandAndTheme((brand, brightness) {
    final suffix = '${brand.name}-${brightness.name}';

    for (final sample in samples) {
      testWidgets('${sample.name} · $suffix', (tester) async {
        await _capture(tester, brand, brightness, sample, outDir);
      });
    }
  });
}

/// Один экспонат галереи: имя файла и то, что рисуется.
class Sample {
  const Sample(this.name, this.build, {this.width = 360});

  final String name;
  final Widget Function(BuildContext context) build;
  final double width;
}

final samples = <Sample>[
  Sample('AuroraButton', (context) => const _Buttons()),
  Sample('AuroraIconButton', (context) => const _IconButtons(), width: 200),
  Sample('AuroraStatusChip', (context) => const _StatusChips()),
  Sample('AuroraFilterChip', (context) => const _FilterChips()),
  Sample('AuroraBanner', (context) => const _Banners()),
  Sample('AuroraListRow', (context) => const _Rows()),
  Sample('AuroraEmptyState', (context) => const AuroraEmptyState(
        title: 'Заявок нет',
        message: 'Новые появятся, когда диспетчер их назначит.',
      )),
  Sample('AuroraErrorState', (context) => const AuroraErrorState(
        title: 'Не удалось загрузить',
        message: 'Проверьте связь и повторите.',
        retryLabel: 'Повторить',
        onRetry: _noop,
      )),
];

void _noop() {}

Future<void> _capture(
  WidgetTester tester,
  AuroraBrand brand,
  Brightness brightness,
  Sample sample,
  Directory outDir,
) async {
  final key = GlobalKey();
  tester.view.physicalSize = Size(sample.width * 3, 2000);
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.reset);

  await tester.pumpWidget(MaterialApp(
    theme: auroraThemeData(brand, brightness),
    home: Builder(builder: (context) {
      final c = AuroraTheme.of(context).colors;
      return Align(
        alignment: Alignment.topLeft,
        child: RepaintBoundary(
          key: key,
          child: ColoredBox(
            color: c.surfaceContent,
            // Без Material в предках Flutter метит текст жёлтым двойным
            // подчёркиванием — это отладочный признак «текст вне Material»,
            // а не оформление компонента. В приложении такой предок есть
            // всегда; здесь его приходится добавить самим, иначе снимок
            // врёт о том, как компонент выглядит.
            child: Material(
              type: MaterialType.transparency,
              child: SizedBox(
                width: sample.width,
                child: Padding(
                  padding: const EdgeInsets.all(AuroraDimensions.space16),
                  child: sample.build(context),
                ),
              ),
            ),
          ),
        ),
      );
    }),
  ));
  await tester.pumpAndSettle();

  final boundary = key.currentContext!.findRenderObject()! as RenderRepaintBoundary;
  late Uint8List bytes;
  await tester.runAsync(() async {
    final image = await boundary.toImage(pixelRatio: 2);
    final data = await image.toByteData(format: ui.ImageByteFormat.png);
    bytes = data!.buffer.asUint8List();
    image.dispose();
  });

  final file = File('${outDir.path}/${sample.name}-${brand.name}-${brightness.name}.png');
  file.writeAsBytesSync(bytes);
}

// ── экспонаты ────────────────────────────────────────────────────────────

class _Buttons extends StatelessWidget {
  const _Buttons();

  @override
  Widget build(BuildContext context) => const Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Wrap(spacing: AuroraDimensions.space8, runSpacing: AuroraDimensions.space8, children: <Widget>[
            AuroraButton(label: 'Выключить', onPressed: _noop),
            AuroraButton(label: 'Отмена', onPressed: _noop, kind: AuroraButtonKind.secondary),
            AuroraButton(label: 'Подробнее', onPressed: _noop, kind: AuroraButtonKind.ghost),
            AuroraButton(label: 'Удалить', onPressed: _noop, kind: AuroraButtonKind.danger),
          ]),
          SizedBox(height: AuroraDimensions.space12),
          AuroraButton(label: 'Выключена', onPressed: null),
        ],
      );
}

class _IconButtons extends StatelessWidget {
  const _IconButtons();

  @override
  Widget build(BuildContext context) => const Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          AuroraIconButton(icon: Icons.menu_rounded, semanticLabel: 'Меню', onPressed: _noop),
          AuroraIconButton(icon: Icons.my_location_rounded, semanticLabel: 'Моё положение', onPressed: _noop),
          AuroraIconButton(icon: Icons.close_rounded, semanticLabel: 'Закрыть', onPressed: null),
        ],
      );
}

class _StatusChips extends StatelessWidget {
  const _StatusChips();

  @override
  Widget build(BuildContext context) => const Wrap(
        spacing: AuroraDimensions.space8,
        runSpacing: AuroraDimensions.space8,
        children: <Widget>[
          AuroraStatusChip(status: AuroraStatus.moving, label: 'В движении'),
          AuroraStatusChip(status: AuroraStatus.parked, label: 'Стоим'),
          AuroraStatusChip(status: AuroraStatus.warning, label: 'Внимание'),
          AuroraStatusChip(status: AuroraStatus.alarm, label: 'Тревога'),
          AuroraStatusChip(status: AuroraStatus.offline, label: 'Нет связи'),
        ],
      );
}

class _FilterChips extends StatelessWidget {
  const _FilterChips();

  @override
  Widget build(BuildContext context) => const Wrap(
        spacing: AuroraDimensions.space8,
        children: <Widget>[
          AuroraFilterChip(label: 'Все', selected: true, onPressed: _noop, count: '24'),
          AuroraFilterChip(label: 'В движении', selected: false, onPressed: _noop, count: '7'),
          AuroraFilterChip(label: 'Архив', selected: false, onPressed: null),
        ],
      );
}

class _Banners extends StatelessWidget {
  const _Banners();

  @override
  Widget build(BuildContext context) => const Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          AuroraBanner(text: 'Запись выключится по расписанию сегодня в 18:00.', icon: Icons.schedule_rounded),
          SizedBox(height: AuroraDimensions.space8),
          AuroraBanner(
            text: 'Запись выключена вручную во время смены.',
            kind: AuroraBannerKind.warning,
            icon: Icons.warning_amber_rounded,
          ),
          SizedBox(height: AuroraDimensions.space8),
          AuroraBanner(
            text: 'Не удалось отправить очередь.',
            kind: AuroraBannerKind.error,
            icon: Icons.error_outline_rounded,
          ),
        ],
      );
}

class _Rows extends StatelessWidget {
  const _Rows();

  @override
  Widget build(BuildContext context) => const Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          AuroraListRow(title: 'А 123 БВ', subtitle: 'Петров П. · 34 км/ч'),
          AuroraListRow(title: 'В 456 ГД', subtitle: 'Стоим 12 мин', selected: true),
          AuroraListRow(title: 'Е 789 ЖЗ', height: AuroraRowHeight.compact, showDivider: false),
        ],
      );
}
