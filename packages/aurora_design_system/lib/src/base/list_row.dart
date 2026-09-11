import 'package:flutter/material.dart';

import '../theme/aurora_theme.dart';

/// Три высоты строки из токенов: 40, 52, 64.
enum AuroraRowHeight { compact, standard, tall }

/// Строка списка. Волосяная граница и поверхность выделения живут здесь,
/// а не в каждом экране: иначе выделение начинает выглядеть по-разному в
/// разных списках одного приложения.
class AuroraListRow extends StatelessWidget {
  const AuroraListRow({
    super.key,
    required this.title,
    this.subtitle,
    this.leading,
    this.trailing,
    this.height = AuroraRowHeight.standard,
    this.selected = false,
    this.onTap,
    this.showDivider = true,
  });

  final String title;
  final String? subtitle;
  final Widget? leading;
  final Widget? trailing;
  final AuroraRowHeight height;
  final bool selected;
  final VoidCallback? onTap;
  final bool showDivider;

  double get _height {
    switch (height) {
      case AuroraRowHeight.compact:
        return AuroraDimensions.rowCompact;
      case AuroraRowHeight.standard:
        return AuroraDimensions.rowDefault;
      case AuroraRowHeight.tall:
        return AuroraDimensions.rowDouble;
    }
  }

  @override
  Widget build(BuildContext context) {
    final aurora = AuroraTheme.of(context);
    final c = aurora.colors;

    return GestureDetector(
      onTap: onTap,
      child: DecoratedBox(
        key: const Key('aurora.row'),
        decoration: BoxDecoration(
          color: selected ? c.surfaceSelected : c.surfaceContent,
          border: showDivider
              ? Border(
                  bottom: BorderSide(
                    color: c.borderHairline,
                    width: AuroraDimensions.hairlineWidth,
                  ),
                )
              : null,
        ),
        child: SizedBox(
          height: _height,
          child: Row(
            children: <Widget>[
              SizedBox(
                width: AuroraDimensions.activeBarWidth,
                child: selected ? ColoredBox(color: c.actionPrimary) : null,
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AuroraDimensions.screenPadding,
                  ),
                  child: Row(
                    children: <Widget>[
                      if (leading != null) ...<Widget>[
                        leading!,
                        const SizedBox(width: AuroraDimensions.space12),
                      ],
                      Expanded(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            Text(
                              title,
                              overflow: TextOverflow.ellipsis,
                              style: aurora.typography.body.copyWith(color: c.textPrimary),
                            ),
                            if (subtitle != null)
                              Text(
                                subtitle!,
                                overflow: TextOverflow.ellipsis,
                                style: aurora.typography.caption
                                    .copyWith(color: c.textSecondary),
                              ),
                          ],
                        ),
                      ),
                      if (trailing != null) ...<Widget>[
                        const SizedBox(width: AuroraDimensions.space12),
                        trailing!,
                      ],
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
