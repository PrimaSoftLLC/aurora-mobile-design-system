import 'package:flutter/material.dart';

import '../theme/aurora_theme.dart';
import 'button.dart';

/// Нижний лист. Радиус, фон и скрим уже заданы темой в `bottomSheetTheme`,
/// поэтому здесь их нет: иначе при правке токена лист остался бы прежним.
Future<T?> showAuroraSheet<T>({
  required BuildContext context,
  required Widget child,
  bool isDismissible = true,
}) {
  return showModalBottomSheet<T>(
    context: context,
    isDismissible: isDismissible,
    isScrollControlled: true,
    builder: (context) => SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(AuroraDimensions.screenPadding),
        child: child,
      ),
    ),
  );
}

/// Лист подтверждения деструктивного действия. Возвращает `true`, если
/// пользователь подтвердил, `false` — если отказался, `null` — если закрыл
/// лист свайпом.
Future<bool?> showAuroraConfirmSheet({
  required BuildContext context,
  required String title,
  required String message,
  required String confirmLabel,
  required String cancelLabel,
  String? summary,
  bool destructive = true,
}) {
  return showAuroraSheet<bool>(
    context: context,
    child: Builder(builder: (context) {
      final aurora = AuroraTheme.of(context);
      final c = aurora.colors;
      // SingleChildScrollView: showAuroraSheet передаёт isScrollControlled,
      // но сама по себе эта опция лишь разрешает листу занять больше места —
      // содержимое всё равно должно взять это место сама. Без скролла
      // длинное message выталкивает кнопки за экран.
      return SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            Text(title, style: aurora.typography.title.copyWith(color: c.textPrimary)),
            const SizedBox(height: AuroraDimensions.space8),
            Text(message, style: aurora.typography.body.copyWith(color: c.textSecondary)),
            if (summary != null) ...<Widget>[
              const SizedBox(height: AuroraDimensions.space8),
              Text(summary, style: aurora.typography.caption.copyWith(color: c.textSecondary)),
            ],
            const SizedBox(height: AuroraDimensions.space24),
            AuroraButton(
              label: cancelLabel,
              expanded: true,
              kind: AuroraButtonKind.secondary,
              onPressed: () => Navigator.of(context).pop(false),
            ),
            const SizedBox(height: AuroraDimensions.space8),
            AuroraButton(
              label: confirmLabel,
              expanded: true,
              kind: destructive ? AuroraButtonKind.danger : AuroraButtonKind.primary,
              onPressed: () => Navigator.of(context).pop(true),
            ),
          ],
        ),
      );
    }),
  );
}
