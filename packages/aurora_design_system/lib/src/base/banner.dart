import 'package:flutter/material.dart';

import '../theme/aurora_theme.dart';

enum AuroraBannerKind { info, warning, error }

/// Полоса с сообщением: расписание, предупреждение, ошибка отправки.
/// Первый потребитель ролей `*Subtle` — до них такой баннер приходилось
/// красить вручную в каждом экране.
class AuroraBanner extends StatelessWidget {
  const AuroraBanner({
    super.key,
    required this.text,
    this.kind = AuroraBannerKind.info,
    this.icon,
    this.action,
  });

  final String text;
  final AuroraBannerKind kind;
  final IconData? icon;

  /// Кнопка справа. Виджет, а не колбэк: баннеру всё равно, что там.
  final Widget? action;

  Color _background(AuroraColorTokens c) {
    switch (kind) {
      case AuroraBannerKind.info:
        return c.actionSubtle;
      case AuroraBannerKind.warning:
        return c.statusWarningSubtle;
      case AuroraBannerKind.error:
        return c.statusAlarmSubtle;
    }
  }

  Color _foreground(AuroraColorTokens c) {
    switch (kind) {
      case AuroraBannerKind.info:
        return c.textPrimary;
      case AuroraBannerKind.warning:
        return c.textOnWarningSubtle;
      case AuroraBannerKind.error:
        return c.textOnAlarmSubtle;
    }
  }

  Color _bar(AuroraColorTokens c) {
    switch (kind) {
      case AuroraBannerKind.info:
        return c.actionPrimary;
      case AuroraBannerKind.warning:
        return c.statusWarning;
      case AuroraBannerKind.error:
        return c.statusAlarm;
    }
  }

  @override
  Widget build(BuildContext context) {
    final aurora = AuroraTheme.of(context);
    final c = aurora.colors;
    final fg = _foreground(c);

    return DecoratedBox(
      key: const Key('aurora.banner'),
      decoration: BoxDecoration(
        color: _background(c),
        borderRadius: BorderRadius.circular(AuroraDimensions.radiusMd),
      ),
      child: IntrinsicHeight(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            SizedBox(
              width: AuroraDimensions.activeBarWidth,
              child: ColoredBox(color: _bar(c)),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(AuroraDimensions.space12),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    if (icon != null) ...<Widget>[
                      Icon(icon, size: 20, color: fg),
                      const SizedBox(width: AuroraDimensions.space8),
                    ],
                    Expanded(
                      child: Text(text, style: aurora.typography.body.copyWith(color: fg)),
                    ),
                    if (action != null) ...<Widget>[
                      const SizedBox(width: AuroraDimensions.space8),
                      action!,
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
