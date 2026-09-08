import 'package:flutter/material.dart';

import '../tokens/tokens.g.dart';

export '../tokens/tokens.g.dart'
    show
        AuroraBrand,
        AuroraColorTokens,
        AuroraDimensions,
        AuroraMotionTokens,
        AuroraTypography,
        AuroraTypographyTokens;

@immutable
class AuroraTheme extends ThemeExtension<AuroraTheme> {
  final AuroraBrand brand;
  final AuroraColorTokens colors;

  /// Роли §6. Класс генерируется вместе с токенами: моноширинного шрифта
  /// нет, числовые роли — тот же Inter с табличными цифрами.
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

  /// `ThemeData.==` сравнивает `extensions` по значению. Без равенства здесь
  /// каждая пересборка `MaterialApp(theme: auroraThemeData(...))` — а это
  /// идиоматическое место вызова, внутри `build` — давала бы новый, не равный
  /// предыдущему `ThemeData`, `Theme.updateShouldNotify` возвращал бы `true`,
  /// и перестраивался бы каждый зависящий от `Theme.of` виджет. На одном
  /// экране это незаметно; на карте с двадцатью компонентами §9 — нет.
  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is AuroraTheme &&
        runtimeType == other.runtimeType &&
        brand == other.brand &&
        colors == other.colors &&
        typography == other.typography;
  }

  @override
  int get hashCode => Object.hash(brand, colors, typography);
}

/// Ноль подъёма для всех состояний кнопки: Material 3 держит `ElevatedButton`
/// на 1.0 в покое и 3.0 под курсором, и без этого тени возвращаются через
/// умолчания фреймворка, а не через токены.
const WidgetStatePropertyAll<double> _noElevation = WidgetStatePropertyAll<double>(0);

const WidgetStatePropertyAll<Color> _noShadow = WidgetStatePropertyAll<Color>(Colors.transparent);

/// Роли §6 в слотах Material, чтобы `AppBar`, `ListTile`, кнопки и поля
/// ввода брали шкалу системы, а не размеры Material по умолчанию. Слотов
/// у Material пятнадцать, ролей десять: соседние слоты делят роль.
/// Цвета сюда не входят — их подставит `ThemeData` из `colorScheme`.
const TextTheme _textTheme = TextTheme(
  displayLarge: AuroraTypographyTokens.display,
  displayMedium: AuroraTypographyTokens.display,
  displaySmall: AuroraTypographyTokens.display,
  headlineLarge: AuroraTypographyTokens.display,
  headlineMedium: AuroraTypographyTokens.title,
  headlineSmall: AuroraTypographyTokens.title,
  titleLarge: AuroraTypographyTokens.title, // заголовок AppBar и диалога
  titleMedium: AuroraTypographyTokens.section,
  titleSmall: AuroraTypographyTokens.label,
  bodyLarge: AuroraTypographyTokens.body, // ListTile.title, текст в поле ввода
  bodyMedium: AuroraTypographyTokens.body,
  bodySmall: AuroraTypographyTokens.caption,
  labelLarge: AuroraTypographyTokens.label, // подпись кнопки
  labelMedium: AuroraTypographyTokens.label,
  labelSmall: AuroraTypographyTokens.overline,
);

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
///
/// Вторая ловушка — фолбэки `ColorScheme`. Незаданный `outline` падает на
/// `onSurface`, `onSurfaceVariant` тоже, а все `surfaceContainer*` на
/// `surface`. Без явных значений рамка поля ввода рисуется цветом
/// `text.primary`, а диалог и шторка ложатся на `surface.content` вместо
/// `surface.overlay`, и в тёмной теме лист перестаёт отличаться от контента.
ThemeData auroraThemeData(AuroraBrand brand, Brightness brightness) {
  final aurora = AuroraTheme.forBrand(brand, brightness);
  final c = aurora.colors;

  return ThemeData(
    useMaterial3: true,
    brightness: brightness,
    fontFamily: AuroraTypographyTokens.fontFamilySans,
    fontFamilyFallback: AuroraTypographyTokens.fontFamilyFallback,
    textTheme: _textTheme,
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
      onSurfaceVariant: c.textSecondary,
      outline: c.borderStrong,
      outlineVariant: c.borderHairline,
      // Лист, диалог и меню — на overlay (§5.4); «самая высокая» ступень
      // M3 (заливка поля ввода, filled Card) — на chrome, как один шаг тона
      // от контента в той же теме.
      surfaceContainerLowest: c.surfaceContent,
      surfaceContainerLow: c.surfaceOverlay,
      surfaceContainer: c.surfaceOverlay,
      surfaceContainerHigh: c.surfaceOverlay,
      surfaceContainerHighest: c.surfaceChrome,
      scrim: c.surfaceScrim,
      // Ошибка формы пока красится тревогой объекта; отдельного токена нет
      // (спек, приложение Б).
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
    // Поле ввода — радиус 8 (§7). Цвета состояний M3 берёт из colorScheme:
    // покой — outline, фокус — primary, ошибка — error.
    inputDecorationTheme: InputDecorationTheme(
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(AuroraDimensions.radiusMd)),
    ),
    elevatedButtonTheme: const ElevatedButtonThemeData(
      style: ButtonStyle(elevation: _noElevation, shadowColor: _noShadow),
    ),
    floatingActionButtonTheme: const FloatingActionButtonThemeData(
      elevation: 0,
      focusElevation: 0,
      hoverElevation: 0,
      highlightElevation: 0,
      disabledElevation: 0,
    ),
    dialogTheme: DialogThemeData(
      elevation: 0,
      backgroundColor: c.surfaceOverlay,
      barrierColor: c.surfaceScrim,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AuroraDimensions.radiusLg)),
    ),
    bottomSheetTheme: BottomSheetThemeData(
      elevation: 0,
      modalElevation: 0,
      backgroundColor: c.surfaceOverlay,
      modalBarrierColor: c.surfaceScrim,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AuroraDimensions.radiusXl)),
      ),
    ),
    snackBarTheme: const SnackBarThemeData(elevation: 0),
    drawerTheme: DrawerThemeData(
      elevation: 0,
      backgroundColor: c.surfaceOverlay,
      scrimColor: c.surfaceScrim,
    ),
    popupMenuTheme: PopupMenuThemeData(elevation: 0, color: c.surfaceOverlay),
    menuTheme: MenuThemeData(
      style: MenuStyle(
        elevation: _noElevation,
        shadowColor: _noShadow,
        backgroundColor: WidgetStatePropertyAll<Color>(c.surfaceOverlay),
      ),
    ),
    navigationBarTheme: NavigationBarThemeData(elevation: 0, backgroundColor: c.surfaceChrome),
    extensions: <ThemeExtension<dynamic>>[aurora],
  );
}
