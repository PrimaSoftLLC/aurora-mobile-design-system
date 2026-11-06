import 'package:flutter/material.dart';

import '../theme/aurora_theme.dart';
import 'status.dart';

/// Статусный чип: точка плюс подпись. [label] обязателен — статус никогда не
/// кодируется одним цветом, и это правило закрыто типом, а не договорённостью.
class AuroraStatusChip extends StatelessWidget {
  const AuroraStatusChip({super.key, required this.status, required this.label});

  final AuroraStatus status;
  final String label;

  @override
  Widget build(BuildContext context) {
    final aurora = AuroraTheme.of(context);
    final c = aurora.colors;
    return DecoratedBox(
      decoration: BoxDecoration(
        color: c.surfaceContent,
        borderRadius: BorderRadius.circular(AuroraDimensions.radiusPill),
        border: Border.all(color: c.borderStrong, width: AuroraDimensions.hairlineWidth),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: AuroraDimensions.space12,
          vertical: AuroraDimensions.space8,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            DecoratedBox(
              key: const Key('aurora.chip.dot'),
              decoration: BoxDecoration(color: status.color(c), shape: BoxShape.circle),
              child: const SizedBox(width: AuroraDimensions.space8, height: AuroraDimensions.space8),
            ),
            const SizedBox(width: AuroraDimensions.space8),
            Flexible(
              child: Text(
                label,
                overflow: TextOverflow.ellipsis,
                maxLines: 1,
                style: aurora.typography.label.copyWith(color: c.textPrimary),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Фильтр-чип со счётчиком. Счётчик — готовая строка: пакет не форматирует
/// числа.
class AuroraFilterChip extends StatelessWidget {
  const AuroraFilterChip({
    super.key,
    required this.label,
    required this.selected,
    required this.onPressed,
    this.count,
  });

  final String label;
  final bool selected;
  final VoidCallback? onPressed;
  final String? count;

  bool get _enabled => onPressed != null;

  @override
  Widget build(BuildContext context) {
    final aurora = AuroraTheme.of(context);
    final c = aurora.colors;
    final fg = !_enabled ? c.textDisabled : (selected ? c.actionText : c.textSecondary);

    return Semantics(
      button: true,
      selected: selected,
      enabled: _enabled,
      child: GestureDetector(
        onTap: onPressed,
        child: ConstrainedBox(
          constraints: const BoxConstraints(minHeight: AuroraDimensions.touchTarget),
          child: DecoratedBox(
            key: const Key('aurora.chip.filter'),
            decoration: BoxDecoration(
              color: _enabled && selected ? c.actionSubtle : c.surfaceChrome,
              borderRadius: BorderRadius.circular(AuroraDimensions.radiusMd),
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: AuroraDimensions.space12),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  Flexible(
                    child: Text(
                      label,
                      overflow: TextOverflow.ellipsis,
                      maxLines: 1,
                      style: aurora.typography.label.copyWith(color: fg),
                    ),
                  ),
                  if (count != null) ...<Widget>[
                    const SizedBox(width: AuroraDimensions.space4),
                    Flexible(
                      child: Text(
                        count!,
                        overflow: TextOverflow.ellipsis,
                        maxLines: 1,
                        style: aurora.typography.numberSm.copyWith(color: fg),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
