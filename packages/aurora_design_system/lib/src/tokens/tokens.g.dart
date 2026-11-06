// GENERATED — не редактировать руками.
// Источник: tokens/. Пересобрать: npm run build

import 'dart:ui' show Brightness, Color, FontFeature, FontVariation, FontWeight;
import 'package:flutter/animation.dart' show Curve, Curves;
import 'package:flutter/painting.dart' show TextStyle;

enum AuroraBrand { aurora, mts }

class AuroraColorTokens {
  final Color surfaceGround;
  final Color surfaceContent;
  final Color surfaceChrome;
  final Color surfaceSelected;
  final Color surfaceOverlay;
  final Color surfaceScrim;
  final Color borderHairline;
  final Color borderStrong;
  final Color textPrimary;
  final Color textSecondary;
  final Color textDisabled;
  final Color textOnBrand;
  final Color textOnMovingSubtle;
  final Color textOnWarningSubtle;
  final Color textOnAlarmSubtle;
  final Color actionPrimary;
  final Color actionPressed;
  final Color actionSubtle;
  final Color focusIndicator;
  final Color statusMoving;
  final Color statusParked;
  final Color statusWarning;
  final Color statusAlarm;
  final Color statusOffline;
  final Color statusMovingSubtle;
  final Color statusWarningSubtle;
  final Color statusAlarmSubtle;
  final Color mapTrackDefault;
  final Color mapTrackSpeeding;
  final Color mapTrackSelected;
  final Color mapMarkerFill;
  final Color mapMarkerStroke;
  final Color mapClusterFill;
  final Color mapClusterText;
  final Color mapControlFill;
  final Color mapControlBorder;
  final Color mapControlDivider;
  final Color mapControlInk;
  final Color mapAttributionInk;
  final Color geofenceAqua;
  final Color geofenceBlue;
  final Color geofenceGray;
  final Color geofenceGreen;
  final Color geofenceOrange;
  final Color geofencePurple;
  final Color geofenceRed;
  final Color geofenceYellow;
  final Color actionText;
  final Color textOnSolid;

  const AuroraColorTokens({
    required this.surfaceGround,
    required this.surfaceContent,
    required this.surfaceChrome,
    required this.surfaceSelected,
    required this.surfaceOverlay,
    required this.surfaceScrim,
    required this.borderHairline,
    required this.borderStrong,
    required this.textPrimary,
    required this.textSecondary,
    required this.textDisabled,
    required this.textOnBrand,
    required this.textOnMovingSubtle,
    required this.textOnWarningSubtle,
    required this.textOnAlarmSubtle,
    required this.actionPrimary,
    required this.actionPressed,
    required this.actionSubtle,
    required this.focusIndicator,
    required this.statusMoving,
    required this.statusParked,
    required this.statusWarning,
    required this.statusAlarm,
    required this.statusOffline,
    required this.statusMovingSubtle,
    required this.statusWarningSubtle,
    required this.statusAlarmSubtle,
    required this.mapTrackDefault,
    required this.mapTrackSpeeding,
    required this.mapTrackSelected,
    required this.mapMarkerFill,
    required this.mapMarkerStroke,
    required this.mapClusterFill,
    required this.mapClusterText,
    required this.mapControlFill,
    required this.mapControlBorder,
    required this.mapControlDivider,
    required this.mapControlInk,
    required this.mapAttributionInk,
    required this.geofenceAqua,
    required this.geofenceBlue,
    required this.geofenceGray,
    required this.geofenceGreen,
    required this.geofenceOrange,
    required this.geofencePurple,
    required this.geofenceRed,
    required this.geofenceYellow,
    Color? actionText,
    Color? textOnSolid,
  }) : actionText = actionText ?? actionPrimary,
       textOnSolid = textOnSolid ?? textOnBrand;

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is AuroraColorTokens &&
        runtimeType == other.runtimeType &&
        surfaceGround == other.surfaceGround &&
        surfaceContent == other.surfaceContent &&
        surfaceChrome == other.surfaceChrome &&
        surfaceSelected == other.surfaceSelected &&
        surfaceOverlay == other.surfaceOverlay &&
        surfaceScrim == other.surfaceScrim &&
        borderHairline == other.borderHairline &&
        borderStrong == other.borderStrong &&
        textPrimary == other.textPrimary &&
        textSecondary == other.textSecondary &&
        textDisabled == other.textDisabled &&
        textOnBrand == other.textOnBrand &&
        textOnMovingSubtle == other.textOnMovingSubtle &&
        textOnWarningSubtle == other.textOnWarningSubtle &&
        textOnAlarmSubtle == other.textOnAlarmSubtle &&
        actionPrimary == other.actionPrimary &&
        actionPressed == other.actionPressed &&
        actionSubtle == other.actionSubtle &&
        focusIndicator == other.focusIndicator &&
        statusMoving == other.statusMoving &&
        statusParked == other.statusParked &&
        statusWarning == other.statusWarning &&
        statusAlarm == other.statusAlarm &&
        statusOffline == other.statusOffline &&
        statusMovingSubtle == other.statusMovingSubtle &&
        statusWarningSubtle == other.statusWarningSubtle &&
        statusAlarmSubtle == other.statusAlarmSubtle &&
        mapTrackDefault == other.mapTrackDefault &&
        mapTrackSpeeding == other.mapTrackSpeeding &&
        mapTrackSelected == other.mapTrackSelected &&
        mapMarkerFill == other.mapMarkerFill &&
        mapMarkerStroke == other.mapMarkerStroke &&
        mapClusterFill == other.mapClusterFill &&
        mapClusterText == other.mapClusterText &&
        mapControlFill == other.mapControlFill &&
        mapControlBorder == other.mapControlBorder &&
        mapControlDivider == other.mapControlDivider &&
        mapControlInk == other.mapControlInk &&
        mapAttributionInk == other.mapAttributionInk &&
        geofenceAqua == other.geofenceAqua &&
        geofenceBlue == other.geofenceBlue &&
        geofenceGray == other.geofenceGray &&
        geofenceGreen == other.geofenceGreen &&
        geofenceOrange == other.geofenceOrange &&
        geofencePurple == other.geofencePurple &&
        geofenceRed == other.geofenceRed &&
        geofenceYellow == other.geofenceYellow &&
        actionText == other.actionText &&
        textOnSolid == other.textOnSolid;
  }

  @override
  int get hashCode => Object.hashAll(<Object?>[
        surfaceGround,
        surfaceContent,
        surfaceChrome,
        surfaceSelected,
        surfaceOverlay,
        surfaceScrim,
        borderHairline,
        borderStrong,
        textPrimary,
        textSecondary,
        textDisabled,
        textOnBrand,
        textOnMovingSubtle,
        textOnWarningSubtle,
        textOnAlarmSubtle,
        actionPrimary,
        actionPressed,
        actionSubtle,
        focusIndicator,
        statusMoving,
        statusParked,
        statusWarning,
        statusAlarm,
        statusOffline,
        statusMovingSubtle,
        statusWarningSubtle,
        statusAlarmSubtle,
        mapTrackDefault,
        mapTrackSpeeding,
        mapTrackSelected,
        mapMarkerFill,
        mapMarkerStroke,
        mapClusterFill,
        mapClusterText,
        mapControlFill,
        mapControlBorder,
        mapControlDivider,
        mapControlInk,
        mapAttributionInk,
        geofenceAqua,
        geofenceBlue,
        geofenceGray,
        geofenceGreen,
        geofenceOrange,
        geofencePurple,
        geofenceRed,
        geofenceYellow,
        actionText,
        textOnSolid,
      ]);
}

const AuroraColorTokens _auroraLight = AuroraColorTokens(
  surfaceGround: Color(0xFFF6F7F9),
  surfaceContent: Color(0xFFFFFFFF),
  surfaceChrome: Color(0xFFF6F7F9),
  surfaceSelected: Color(0xFFEEF3FA),
  surfaceOverlay: Color(0xFFFFFFFF),
  surfaceScrim: Color(0x66101220),
  borderHairline: Color(0xFFEEF0F4),
  borderStrong: Color(0xFFCDD2DC),
  textPrimary: Color(0xFF1D222C),
  textSecondary: Color(0xFF5E6676),
  textDisabled: Color(0xFFA7AEBD),
  textOnBrand: Color(0xFFFFFFFF),
  textOnMovingSubtle: Color(0xFF12653A),
  textOnWarningSubtle: Color(0xFF8A5A00),
  textOnAlarmSubtle: Color(0xFFB3261E),
  actionPrimary: Color(0xFF2B5F9E),
  actionPressed: Color(0xFF4D79AE),
  actionSubtle: Color(0xFFEEF3FA),
  focusIndicator: Color(0xFF2B5F9E),
  statusMoving: Color(0xFF157A45),
  statusParked: Color(0xFF5E6676),
  statusWarning: Color(0xFF9A6400),
  statusAlarm: Color(0xFFC1291F),
  statusOffline: Color(0xFFC1291F),
  statusMovingSubtle: Color(0xFFE7F4EC),
  statusWarningSubtle: Color(0xFFFDF3E0),
  statusAlarmSubtle: Color(0xFFFDECEA),
  mapTrackDefault: Color(0xFF2B5F9E),
  mapTrackSpeeding: Color(0xFFC1291F),
  mapTrackSelected: Color(0xFF1D222C),
  mapMarkerFill: Color(0xFFFFFFFF),
  mapMarkerStroke: Color(0xFF1D222C),
  mapClusterFill: Color(0xFFFFFFFF),
  mapClusterText: Color(0xFF1D222C),
  mapControlFill: Color(0xFFFFFFFF),
  mapControlBorder: Color(0xFFD6D9E0),
  mapControlDivider: Color(0xFFE6E8ED),
  mapControlInk: Color(0xFF2E3440),
  mapAttributionInk: Color(0xFF626B7C),
  geofenceAqua: Color(0x4000FFFF),
  geofenceBlue: Color(0x400000FF),
  geofenceGray: Color(0x407F7F7F),
  geofenceGreen: Color(0x4000FF00),
  geofenceOrange: Color(0x40FF9200),
  geofencePurple: Color(0x40932092),
  geofenceRed: Color(0x40FF0000),
  geofenceYellow: Color(0x40FFFF00),
  actionText: Color(0xFF235081),
  textOnSolid: Color(0xFFFFFFFF),
);

const AuroraColorTokens _auroraDark = AuroraColorTokens(
  surfaceGround: Color(0xFF0D1015),
  surfaceContent: Color(0xFF15191F),
  surfaceChrome: Color(0xFF1C2129),
  surfaceSelected: Color(0xFF1F2A38),
  surfaceOverlay: Color(0xFF1C2129),
  surfaceScrim: Color(0x99101220),
  borderHairline: Color(0xFF272D37),
  borderStrong: Color(0xFF363D49),
  textPrimary: Color(0xFFEEF0F4),
  textSecondary: Color(0xFFA7AEBD),
  textDisabled: Color(0xFF5E6676),
  textOnBrand: Color(0xFF0D1520),
  textOnMovingSubtle: Color(0xFF7ED4A6),
  textOnWarningSubtle: Color(0xFFE8C477),
  textOnAlarmSubtle: Color(0xFFF0A39A),
  actionPrimary: Color(0xFF5B92D4),
  actionPressed: Color(0xFF4F7EB7),
  actionSubtle: Color(0xFF1F2A38),
  focusIndicator: Color(0xFF5B92D4),
  statusMoving: Color(0xFF38B076),
  statusParked: Color(0xFF8C94A3),
  statusWarning: Color(0xFFD69E2E),
  statusAlarm: Color(0xFFE76256),
  statusOffline: Color(0xFFE76256),
  statusMovingSubtle: Color(0xFF1B312D),
  statusWarningSubtle: Color(0xFF342E21),
  statusAlarmSubtle: Color(0xFF372528),
  mapTrackDefault: Color(0xFF5B92D4),
  mapTrackSpeeding: Color(0xFFE76256),
  mapTrackSelected: Color(0xFFEEF0F4),
  mapMarkerFill: Color(0xFF15191F),
  mapMarkerStroke: Color(0xFFEEF0F4),
  mapClusterFill: Color(0xFF1C2129),
  mapClusterText: Color(0xFFEEF0F4),
  mapControlFill: Color(0xFFFFFFFF),
  mapControlBorder: Color(0xFFD6D9E0),
  mapControlDivider: Color(0xFFE6E8ED),
  mapControlInk: Color(0xFF2E3440),
  mapAttributionInk: Color(0xFF626B7C),
  geofenceAqua: Color(0x5900FFFF),
  geofenceBlue: Color(0x590000FF),
  geofenceGray: Color(0x597F7F7F),
  geofenceGreen: Color(0x5900FF00),
  geofenceOrange: Color(0x59FF9200),
  geofencePurple: Color(0x59932092),
  geofenceRed: Color(0x59FF0000),
  geofenceYellow: Color(0x59FFFF00),
  actionText: Color(0xFF9DC0EA),
  textOnSolid: Color(0xFF12151C),
);

const AuroraColorTokens _mtsLight = AuroraColorTokens(
  surfaceGround: Color(0xFFE6E3E1),
  surfaceContent: Color(0xFFFFFFFF),
  surfaceChrome: Color(0xFFF7F6F5),
  surfaceSelected: Color(0xFFFDF5F5),
  surfaceOverlay: Color(0xFFFFFFFF),
  surfaceScrim: Color(0x66161514),
  borderHairline: Color(0xFFF1EFED),
  borderStrong: Color(0xFFE6E3E1),
  textPrimary: Color(0xFF1B1A19),
  textSecondary: Color(0xFF74706D),
  textDisabled: Color(0xFFD2CDC9),
  textOnBrand: Color(0xFFFFFFFF),
  textOnMovingSubtle: Color(0xFF12653A),
  textOnWarningSubtle: Color(0xFF8A5A00),
  textOnAlarmSubtle: Color(0xFFB3261E),
  actionPrimary: Color(0xFFD0050F),
  actionPressed: Color(0xFFD82D35),
  actionSubtle: Color(0xFFFDEAEA),
  focusIndicator: Color(0xFFD0050F),
  statusMoving: Color(0xFF157A45),
  statusParked: Color(0xFF5E6676),
  statusWarning: Color(0xFF9A6400),
  statusAlarm: Color(0xFFC1291F),
  statusOffline: Color(0xFFC1291F),
  statusMovingSubtle: Color(0xFFE7F4EC),
  statusWarningSubtle: Color(0xFFFDF3E0),
  statusAlarmSubtle: Color(0xFFFDECEA),
  mapTrackDefault: Color(0xFFD0050F),
  mapTrackSpeeding: Color(0xFFC1291F),
  mapTrackSelected: Color(0xFF1B1A19),
  mapMarkerFill: Color(0xFFFFFFFF),
  mapMarkerStroke: Color(0xFF1B1A19),
  mapClusterFill: Color(0xFFFFFFFF),
  mapClusterText: Color(0xFF1B1A19),
  mapControlFill: Color(0xFFFFFFFF),
  mapControlBorder: Color(0xFFD6D9E0),
  mapControlDivider: Color(0xFFE6E8ED),
  mapControlInk: Color(0xFF2E3440),
  mapAttributionInk: Color(0xFF626B7C),
  geofenceAqua: Color(0x4000FFFF),
  geofenceBlue: Color(0x400000FF),
  geofenceGray: Color(0x407F7F7F),
  geofenceGreen: Color(0x4000FF00),
  geofenceOrange: Color(0x40FF9200),
  geofencePurple: Color(0x40932092),
  geofenceRed: Color(0x40FF0000),
  geofenceYellow: Color(0x40FFFF00),
  actionText: Color(0xFFD0050F),
  textOnSolid: Color(0xFFFFFFFF),
);

const AuroraColorTokens _mtsDark = AuroraColorTokens(
  surfaceGround: Color(0xFF161514),
  surfaceContent: Color(0xFF161514),
  surfaceChrome: Color(0xFF201E1D),
  surfaceSelected: Color(0xFF272423),
  surfaceOverlay: Color(0xFF201E1D),
  surfaceScrim: Color(0x99161514),
  borderHairline: Color(0xFF272423),
  borderStrong: Color(0xFF302D2B),
  textPrimary: Color(0xFFF7F6F5),
  textSecondary: Color(0xFFA09B97),
  textDisabled: Color(0xFF3E3B39),
  textOnBrand: Color(0xFF161514),
  textOnMovingSubtle: Color(0xFF7ED4A6),
  textOnWarningSubtle: Color(0xFFE8C477),
  textOnAlarmSubtle: Color(0xFFF0A39A),
  actionPrimary: Color(0xFFFF4D52),
  actionPressed: Color(0xFFDA4448),
  actionSubtle: Color(0xFF5A0C10),
  focusIndicator: Color(0xFFFF4D52),
  statusMoving: Color(0xFF38B076),
  statusParked: Color(0xFF8C94A3),
  statusWarning: Color(0xFFD69E2E),
  statusAlarm: Color(0xFFE76256),
  statusOffline: Color(0xFFE76256),
  statusMovingSubtle: Color(0xFF1B2E24),
  statusWarningSubtle: Color(0xFF352B18),
  statusAlarmSubtle: Color(0xFF37211F),
  mapTrackDefault: Color(0xFFFF4D52),
  mapTrackSpeeding: Color(0xFFE76256),
  mapTrackSelected: Color(0xFFF7F6F5),
  mapMarkerFill: Color(0xFF161514),
  mapMarkerStroke: Color(0xFFF7F6F5),
  mapClusterFill: Color(0xFF201E1D),
  mapClusterText: Color(0xFFF7F6F5),
  mapControlFill: Color(0xFFFFFFFF),
  mapControlBorder: Color(0xFFD6D9E0),
  mapControlDivider: Color(0xFFE6E8ED),
  mapControlInk: Color(0xFF2E3440),
  mapAttributionInk: Color(0xFF626B7C),
  geofenceAqua: Color(0x5900FFFF),
  geofenceBlue: Color(0x590000FF),
  geofenceGray: Color(0x597F7F7F),
  geofenceGreen: Color(0x5900FF00),
  geofenceOrange: Color(0x59FF9200),
  geofencePurple: Color(0x59932092),
  geofenceRed: Color(0x59FF0000),
  geofenceYellow: Color(0x59FFFF00),
  actionText: Color(0xFFEE7175),
  textOnSolid: Color(0xFF12151C),
);

AuroraColorTokens auroraColorTokens(AuroraBrand brand, Brightness brightness) {
  final isDark = brightness == Brightness.dark;
  switch (brand) {
    case AuroraBrand.aurora:
      return isDark ? _auroraDark : _auroraLight;
    case AuroraBrand.mts:
      return isDark ? _mtsDark : _mtsLight;
  }
}

class AuroraDimensions {
  const AuroraDimensions._();
  static const double space0 = 0;
  static const double space2 = 2;
  static const double space4 = 4;
  static const double space8 = 8;
  static const double space12 = 12;
  static const double space16 = 16;
  static const double space20 = 20;
  static const double space24 = 24;
  static const double space32 = 32;
  static const double space40 = 40;
  static const double space48 = 48;
  static const double radiusXs = 4;
  static const double radiusSm = 6;
  static const double radiusMd = 8;
  static const double radiusLg = 12;
  static const double radiusXl = 16;
  static const double radiusPill = 999;
  static const double rowCompact = 40;
  static const double rowDefault = 52;
  static const double rowDouble = 64;
  static const double touchTarget = 44;
  static const double screenPadding = 16;
  static const double rowPadding = 14;
  static const double activeBarWidth = 2;
  static const double hairlineWidth = 1;
}

class AuroraMotionTokens {
  const AuroraMotionTokens._();
  static const Duration durationFast = Duration(milliseconds: 120);
  static const Duration durationBase = Duration(milliseconds: 180);
  static const Duration durationSlow = Duration(milliseconds: 320);
  static const Duration durationDataInterp = Duration(milliseconds: 500);
  static const Curve curveEnter = Curves.easeOutCubic;
  static const Curve curveExit = Curves.easeInCubic;
}

class AuroraTypographyTokens {
  const AuroraTypographyTokens._();
  static const String fontFamilySans = 'packages/aurora_design_system/Inter Tight';
  static const String fontFamilyMono = 'packages/aurora_design_system/JetBrains Mono';
  static const String fontFamilyArabic = 'Noto Sans Arabic';

  /// Арабский — один из языков приложения, а у Inter арабских глифов нет.
  /// Фолбэк стоит в каждой роли, чтобы стиль работал и вне ThemeData.
  static const List<String> fontFamilyFallback = <String>[fontFamilyArabic];

  static const TextStyle display = TextStyle(
    fontFamily: fontFamilySans,
    fontFamilyFallback: fontFamilyFallback,
    fontSize: 30,
    height: 1.2000,
    fontWeight: FontWeight.w600,
    fontVariations: <FontVariation>[FontVariation('wght', 600)],
    letterSpacing: -0.4500,
  );

  static const TextStyle title = TextStyle(
    fontFamily: fontFamilySans,
    fontFamilyFallback: fontFamilyFallback,
    fontSize: 20,
    height: 1.2000,
    fontWeight: FontWeight.w600,
    fontVariations: <FontVariation>[FontVariation('wght', 600)],
    letterSpacing: -0.3000,
  );

  static const TextStyle section = TextStyle(
    fontFamily: fontFamilySans,
    fontFamilyFallback: fontFamilyFallback,
    fontSize: 16,
    height: 1.3500,
    fontWeight: FontWeight.w600,
    fontVariations: <FontVariation>[FontVariation('wght', 600)],
    letterSpacing: 0.0000,
  );

  static const TextStyle body = TextStyle(
    fontFamily: fontFamilySans,
    fontFamilyFallback: fontFamilyFallback,
    fontSize: 14,
    height: 1.5000,
    fontWeight: FontWeight.w400,
    fontVariations: <FontVariation>[FontVariation('wght', 400)],
    letterSpacing: 0.0000,
  );

  static const TextStyle label = TextStyle(
    fontFamily: fontFamilySans,
    fontFamilyFallback: fontFamilyFallback,
    fontSize: 13,
    height: 1.3500,
    fontWeight: FontWeight.w500,
    fontVariations: <FontVariation>[FontVariation('wght', 500)],
    letterSpacing: 0.0000,
  );

  static const TextStyle caption = TextStyle(
    fontFamily: fontFamilySans,
    fontFamilyFallback: fontFamilyFallback,
    fontSize: 12,
    height: 1.3500,
    fontWeight: FontWeight.w400,
    fontVariations: <FontVariation>[FontVariation('wght', 400)],
    letterSpacing: 0.0000,
  );

  /// В спеке набирается верхним регистром. У Flutter нет text-transform,
  /// поэтому регистр применяет компонент (`Text(value.toUpperCase())`), не токен.
  static const TextStyle overline = TextStyle(
    fontFamily: fontFamilySans,
    fontFamilyFallback: fontFamilyFallback,
    fontSize: 11,
    height: 1.3500,
    fontWeight: FontWeight.w600,
    fontVariations: <FontVariation>[FontVariation('wght', 600)],
    letterSpacing: 0.6600,
  );

  static const TextStyle numberLg = TextStyle(
    fontFamily: fontFamilySans,
    fontFamilyFallback: fontFamilyFallback,
    fontSize: 20,
    height: 1.2000,
    fontWeight: FontWeight.w600,
    fontVariations: <FontVariation>[FontVariation('wght', 600)],
    letterSpacing: 0.0000,
    fontFeatures: <FontFeature>[FontFeature.tabularFigures()],
  );

  static const TextStyle numberMd = TextStyle(
    fontFamily: fontFamilySans,
    fontFamilyFallback: fontFamilyFallback,
    fontSize: 14,
    height: 1.2857,
    fontWeight: FontWeight.w600,
    fontVariations: <FontVariation>[FontVariation('wght', 600)],
    letterSpacing: 0.0000,
    fontFeatures: <FontFeature>[FontFeature.tabularFigures()],
  );

  static const TextStyle numberSm = TextStyle(
    fontFamily: fontFamilySans,
    fontFamilyFallback: fontFamilyFallback,
    fontSize: 11,
    height: 1.2727,
    fontWeight: FontWeight.w600,
    fontVariations: <FontVariation>[FontVariation('wght', 600)],
    letterSpacing: 0.0000,
    fontFeatures: <FontFeature>[FontFeature.tabularFigures()],
  );

  static const TextStyle bodyStrong = TextStyle(
    fontFamily: fontFamilySans,
    fontFamilyFallback: fontFamilyFallback,
    fontSize: 14,
    height: 1.5000,
    fontWeight: FontWeight.w500,
    fontVariations: <FontVariation>[FontVariation('wght', 500)],
    letterSpacing: 0.0000,
  );

  static const TextStyle mono = TextStyle(
    fontFamily: fontFamilyMono,
    fontFamilyFallback: fontFamilyFallback,
    fontSize: 13,
    height: 1.3500,
    fontWeight: FontWeight.w400,
    fontVariations: <FontVariation>[FontVariation('wght', 400)],
    letterSpacing: 0.0000,
    fontFeatures: <FontFeature>[FontFeature.tabularFigures()],
  );
}

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
  final TextStyle bodyStrong;
  final TextStyle mono;

  const AuroraTypography({
    this.display = AuroraTypographyTokens.display,
    this.title = AuroraTypographyTokens.title,
    this.section = AuroraTypographyTokens.section,
    this.body = AuroraTypographyTokens.body,
    this.label = AuroraTypographyTokens.label,
    this.caption = AuroraTypographyTokens.caption,
    this.overline = AuroraTypographyTokens.overline,
    this.numberLg = AuroraTypographyTokens.numberLg,
    this.numberMd = AuroraTypographyTokens.numberMd,
    this.numberSm = AuroraTypographyTokens.numberSm,
    this.bodyStrong = AuroraTypographyTokens.bodyStrong,
    this.mono = AuroraTypographyTokens.mono,
  });

  /// Роли из `AuroraTypographyTokens`. Руками здесь ничего не задаётся:
  /// иначе шкала в JSON и шкала в коде разъедутся.
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
        numberSm = AuroraTypographyTokens.numberSm,
        bodyStrong = AuroraTypographyTokens.bodyStrong,
        mono = AuroraTypographyTokens.mono;

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is AuroraTypography &&
        runtimeType == other.runtimeType &&
        display == other.display &&
        title == other.title &&
        section == other.section &&
        body == other.body &&
        label == other.label &&
        caption == other.caption &&
        overline == other.overline &&
        numberLg == other.numberLg &&
        numberMd == other.numberMd &&
        numberSm == other.numberSm &&
        bodyStrong == other.bodyStrong &&
        mono == other.mono;
  }

  @override
  int get hashCode => Object.hashAll(<Object?>[
        display,
        title,
        section,
        body,
        label,
        caption,
        overline,
        numberLg,
        numberMd,
        numberSm,
        bodyStrong,
        mono,
      ]);
}
