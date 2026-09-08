import 'package:flutter/material.dart';

import '../tokens/tokens.g.dart';

export '../tokens/tokens.g.dart'
    show AuroraBrand, AuroraColorTokens, AuroraDimensions, AuroraMotionTokens, AuroraTypographyTokens;

/// Типографические роли из спека §6. Моноширинного шрифта нет:
/// числовые роли — тот же Inter с табличными цифрами.
@immutable
class AuroraTypography {
  final TextStyle display;
  final TextStyle title;
  final TextStyle section;
  final TextStyle body;
  final TextStyle label;
  final TextStyle caption;
  final TextStyle overline;
  final TextStyle numberLg;
  final TextStyle numberMd;
  final TextStyle numberSm;

  const AuroraTypography({
    required this.display,
    required this.title,
    required this.section,
    required this.body,
    required this.label,
    required this.caption,
    required this.overline,
    required this.numberLg,
    required this.numberMd,
    required this.numberSm,
  });

  /// Значения приходят из сгенерированного `tokens.g.dart`. Руками здесь
  /// ничего не задаётся: иначе шкала в JSON и шкала в коде разъедутся.
  ///
  /// Роль `overline` в спеке набирается капителью, но у Flutter нет
  /// text-transform — верхний регистр применяет компонент
  /// (`Text(value.toUpperCase())`), а не токен.
  const AuroraTypography.standard()
      : display = AuroraTypographyTokens.display,
        title = AuroraTypographyTokens.title,
        section = AuroraTypographyTokens.section,
        body = AuroraTypographyTokens.body,
        label = AuroraTypographyTokens.label,
        caption = AuroraTypographyTokens.caption,
        overline = AuroraTypographyTokens.overline,
        numberLg = AuroraTypographyTokens.numberLg,
        numberMd = AuroraTypographyTokens.numberMd,
        numberSm = AuroraTypographyTokens.numberSm;
}

@immutable
class AuroraTheme extends ThemeExtension<AuroraTheme> {
  final AuroraBrand brand;
  final AuroraColorTokens colors;
  final AuroraTypography typography;

  const AuroraTheme({
    required this.brand,
    required this.colors,
    required this.typography,
  });

  factory AuroraTheme.forBrand(AuroraBrand brand, Brightness brightness) => AuroraTheme(
        brand: brand,
        colors: auroraColorTokens(brand, brightness),
        typography: const AuroraTypography.standard(),
      );

  static AuroraTheme of(BuildContext context) {
    final ext = Theme.of(context).extension<AuroraTheme>();
    assert(ext != null, 'AuroraTheme не найдена. Используйте auroraThemeData() при сборке ThemeData.');
    return ext!;
  }

  @override
  AuroraTheme copyWith({
    AuroraBrand? brand,
    AuroraColorTokens? colors,
    AuroraTypography? typography,
  }) =>
      AuroraTheme(
        brand: brand ?? this.brand,
        colors: colors ?? this.colors,
        typography: typography ?? this.typography,
      );

  /// Токены дискретны: на середине переход считается завершённым.
  /// Плавно анимировать смену бренда или темы система не обещает.
  @override
  AuroraTheme lerp(ThemeExtension<AuroraTheme>? other, double t) {
    if (other is! AuroraTheme) return this;
    return t < 0.5 ? this : other;
  }
}

/// Ноль подъёма для всех состояний кнопки: Material 3 держит `ElevatedButton`
/// на 1.0 в покое и 3.0 под курсором, и без этого тени возвращаются через
/// умолчания фреймворка, а не через токены.
const WidgetStatePropertyAll<double> _noElevation = WidgetStatePropertyAll<double>(0);

/// Собирает [ThemeData] так, чтобы Material-компоненты подчинялись токенам.
///
/// Теней нет нигде — это принцип системы, а не настройка. Поверхности
/// разделяются тоном и волосяной границей. Обнулить `Card` и `AppBar`
/// недостаточно: у `ElevatedButton`, `FloatingActionButton`, `Dialog`,
/// `BottomSheet`, `SnackBar`, `Drawer`, `PopupMenu`, `MenuAnchor` и
/// `NavigationBar` подъём ненулевой по умолчанию, а `ColorScheme.surfaceTint`
/// без явного значения падает на `primary` — и всё поднятое получает
/// брендовую подкраску M3. Поэтому здесь и глобальный запрет тени, и
/// поимённое обнуление подтем.
ThemeData auroraThemeData(AuroraBrand brand, Brightness brightness) {
  final aurora = AuroraTheme.forBrand(brand, brightness);
  final c = aurora.colors;

  return ThemeData(
    useMaterial3: true,
    brightness: brightness,
    fontFamily: AuroraTypographyTokens.fontFamilySans,
    scaffoldBackgroundColor: c.surfaceContent,
    shadowColor: Colors.transparent,
    colorScheme: ColorScheme(
      brightness: brightness,
      primary: c.actionPrimary,
      onPrimary: c.textOnBrand,
      secondary: c.actionSubtle,
      onSecondary: c.textPrimary,
      surface: c.surfaceContent,
      onSurface: c.textPrimary,
      error: c.statusAlarm,
      onError: c.textOnBrand,
      shadow: Colors.transparent,
      surfaceTint: Colors.transparent,
    ),
    dividerTheme: DividerThemeData(
      color: c.borderHairline,
      thickness: AuroraDimensions.hairlineWidth,
      space: AuroraDimensions.hairlineWidth,
    ),
    cardTheme: CardThemeData(
      elevation: 0,
      color: c.surfaceContent,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AuroraDimensions.radiusLg),
        side: BorderSide(color: c.borderStrong, width: AuroraDimensions.hairlineWidth),
      ),
    ),
    appBarTheme: AppBarTheme(
      elevation: 0,
      scrolledUnderElevation: 0,
      backgroundColor: c.surfaceContent,
      foregroundColor: c.textPrimary,
    ),
    elevatedButtonTheme: const ElevatedButtonThemeData(
      style: ButtonStyle(elevation: _noElevation, shadowColor: WidgetStatePropertyAll<Color>(Colors.transparent)),
    ),
    floatingActionButtonTheme: const FloatingActionButtonThemeData(
      elevation: 0,
      focusElevation: 0,
      hoverElevation: 0,
      highlightElevation: 0,
      disabledElevation: 0,
    ),
    dialogTheme: const DialogThemeData(elevation: 0),
    bottomSheetTheme: const BottomSheetThemeData(elevation: 0, modalElevation: 0),
    snackBarTheme: const SnackBarThemeData(elevation: 0),
    drawerTheme: const DrawerThemeData(elevation: 0),
    popupMenuTheme: const PopupMenuThemeData(elevation: 0),
    menuTheme: const MenuThemeData(
      style: MenuStyle(elevation: _noElevation, shadowColor: WidgetStatePropertyAll<Color>(Colors.transparent)),
    ),
    navigationBarTheme: const NavigationBarThemeData(elevation: 0),
    extensions: <ThemeExtension<dynamic>>[aurora],
  );
}
