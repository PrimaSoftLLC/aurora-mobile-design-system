import 'package:flutter/material.dart';

// `aurora_theme.dart` реэкспортирует AuroraColorTokens и AuroraDimensions,
// поэтому прямой импорт tokens.g.dart здесь лишний и уронил бы analyze.
import '../theme/aurora_theme.dart';

/// Четыре вида кнопки. Пятый — иконочная — вынесен в [AuroraIconButton],
/// потому что у неё обязательна семантическая метка, а у текстовой её роль
/// играет сама подпись.
enum AuroraButtonKind { primary, secondary, ghost, danger }

class AuroraButton extends StatelessWidget {
  const AuroraButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.kind = AuroraButtonKind.primary,
    this.icon,
    this.expanded = false,
  });

  final String label;
  final VoidCallback? onPressed;
  final AuroraButtonKind kind;
  final IconData? icon;

  /// Кнопка на всю ширину — ряд действий внизу панели и листа.
  final bool expanded;

  bool get _enabled => onPressed != null;

  /// `null` означает «без заливки». Литерал прозрачного цвета в компоненте
  /// запрещён так же, как любой другой литерал цвета.
  Color? _background(AuroraColorTokens c) {
    final filled = kind == AuroraButtonKind.primary || kind == AuroraButtonKind.danger;
    if (!filled) return null;
    if (!_enabled) return c.surfaceChrome;
    return kind == AuroraButtonKind.primary ? c.actionPrimary : c.statusAlarm;
  }

  Color _foreground(AuroraColorTokens c) {
    if (!_enabled) return c.textDisabled;
    switch (kind) {
      case AuroraButtonKind.primary:
      case AuroraButtonKind.danger:
        return c.textOnBrand;
      case AuroraButtonKind.secondary:
        return c.textPrimary;
      case AuroraButtonKind.ghost:
        return c.actionPrimary;
    }
  }

  @override
  Widget build(BuildContext context) {
    final aurora = AuroraTheme.of(context);
    final c = aurora.colors;
    final fg = _foreground(c);

    final content = Row(
      mainAxisSize: expanded ? MainAxisSize.max : MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: <Widget>[
        if (icon != null) ...<Widget>[
          Icon(icon, size: 20, color: fg),
          const SizedBox(width: AuroraDimensions.space8),
        ],
        Flexible(
          child: Text(
            label,
            overflow: TextOverflow.ellipsis,
            maxLines: 1,
            style: aurora.typography.label.copyWith(color: fg),
          ),
        ),
      ],
    );

    return Semantics(
      button: true,
      enabled: _enabled,
      child: GestureDetector(
        onTap: onPressed,
        child: ConstrainedBox(
          constraints: const BoxConstraints(minHeight: AuroraDimensions.touchTarget),
          child: DecoratedBox(
            key: const Key('aurora.button'),
            decoration: BoxDecoration(
              color: _background(c),
              borderRadius: BorderRadius.circular(AuroraDimensions.radiusMd),
              border: kind == AuroraButtonKind.secondary
                  ? Border.all(
                      color: _enabled ? c.borderStrong : c.borderHairline,
                      width: AuroraDimensions.hairlineWidth,
                    )
                  : null,
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: AuroraDimensions.space16),
              child: Center(
                widthFactor: expanded ? null : 1,
                heightFactor: 1,
                child: content,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// Иконочная кнопка. [semanticLabel] обязателен: иконка без метки —
/// нарушение правила доступности, и оно закрыто типом, а не ревью.
class AuroraIconButton extends StatelessWidget {
  const AuroraIconButton({
    super.key,
    required this.icon,
    required this.semanticLabel,
    required this.onPressed,
  });

  final IconData icon;
  final String semanticLabel;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    final c = AuroraTheme.of(context).colors;
    return Semantics(
      button: true,
      label: semanticLabel,
      enabled: onPressed != null,
      child: GestureDetector(
        onTap: onPressed,
        behavior: HitTestBehavior.opaque,
        child: SizedBox(
          width: AuroraDimensions.touchTarget,
          height: AuroraDimensions.touchTarget,
          child: Icon(icon, size: 24, color: onPressed == null ? c.textDisabled : c.textPrimary),
        ),
      ),
    );
  }
}
