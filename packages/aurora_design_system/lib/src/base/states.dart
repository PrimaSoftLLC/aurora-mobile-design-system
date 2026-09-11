import 'package:flutter/material.dart';

import '../theme/aurora_theme.dart';
import 'button.dart';

/// Экран без данных. Самая частая дыра при редизайне: без него список без
/// строк выглядит сломанным, а не пустым.
class AuroraEmptyState extends StatelessWidget {
  const AuroraEmptyState({
    super.key,
    required this.title,
    this.message,
    this.icon,
    this.actionLabel,
    this.onAction,
  });

  final String title;
  final String? message;
  final IconData? icon;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return _StateBody(
      icon: icon ?? Icons.inbox_rounded,
      iconColor: AuroraTheme.of(context).colors.textSecondary,
      title: title,
      message: message,
      actionLabel: actionLabel,
      onAction: onAction,
    );
  }
}

/// Экран ошибки. Отличается от пустого только цветом значка и смыслом
/// действия: пустому предлагают создать, ошибке — повторить.
class AuroraErrorState extends StatelessWidget {
  const AuroraErrorState({
    super.key,
    required this.title,
    this.message,
    this.retryLabel,
    this.onRetry,
  });

  final String title;
  final String? message;
  final String? retryLabel;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    return _StateBody(
      icon: Icons.error_outline_rounded,
      iconColor: AuroraTheme.of(context).colors.statusAlarm,
      title: title,
      message: message,
      actionLabel: retryLabel,
      onAction: onRetry,
    );
  }
}

class _StateBody extends StatelessWidget {
  const _StateBody({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.message,
    required this.actionLabel,
    required this.onAction,
  });

  final IconData icon;
  final Color iconColor;
  final String title;
  final String? message;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    final aurora = AuroraTheme.of(context);
    final c = aurora.colors;

    return Padding(
      padding: const EdgeInsets.all(AuroraDimensions.space24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Icon(icon, size: 40, color: iconColor),
          const SizedBox(height: AuroraDimensions.space16),
          Text(
            title,
            textAlign: TextAlign.center,
            style: aurora.typography.section.copyWith(color: c.textPrimary),
          ),
          if (message != null) ...<Widget>[
            const SizedBox(height: AuroraDimensions.space8),
            Text(
              message!,
              textAlign: TextAlign.center,
              style: aurora.typography.body.copyWith(color: c.textSecondary),
            ),
          ],
          if (actionLabel != null && onAction != null) ...<Widget>[
            const SizedBox(height: AuroraDimensions.space24),
            AuroraButton(label: actionLabel!, onPressed: onAction),
          ],
        ],
      ),
    );
  }
}
