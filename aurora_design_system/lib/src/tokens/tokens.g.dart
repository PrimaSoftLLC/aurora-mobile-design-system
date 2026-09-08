// GENERATED — не редактировать руками.
// Источник: design-system/tokens/. Пересобрать: npm run build

import 'dart:ui' show Brightness, Color, FontFeature, FontWeight;
import 'package:flutter/animation.dart' show Curve, Curves;
import 'package:flutter/painting.dart' show TextStyle;

enum AuroraBrand { aurora, mts }

class AuroraColorTokens {
  final Color surfaceContent;
  final Color surfaceChrome;
  final Color surfaceSelected;
  final Color surfaceOverlay;
  final Color borderHairline;
  final Color borderStrong;
  final Color textPrimary;
  final Color textSecondary;
  final Color textDisabled;
  final Color textOnBrand;
  final Color actionPrimary;
  final Color actionPressed;
  final Color actionSubtle;
  final Color focusIndicator;
  final Color statusMoving;
  final Color statusParked;
  final Color statusWarning;
  final Color statusAlarm;
  final Color statusOffline;
  final Color mapTrackDefault;
  final Color mapTrackSpeeding;
  final Color mapTrackSelected;
  final Color mapMarkerFill;
  final Color mapMarkerStroke;

  const AuroraColorTokens({
    required this.surfaceContent,
    required this.surfaceChrome,
    required this.surfaceSelected,
    required this.surfaceOverlay,
    required this.borderHairline,
    required this.borderStrong,
    required this.textPrimary,
    required this.textSecondary,
    required this.textDisabled,
    required this.textOnBrand,
    required this.actionPrimary,
    required this.actionPressed,
    required this.actionSubtle,
    required this.focusIndicator,
    required this.statusMoving,
    required this.statusParked,
    required this.statusWarning,
    required this.statusAlarm,
    required this.statusOffline,
    required this.mapTrackDefault,
    required this.mapTrackSpeeding,
    required this.mapTrackSelected,
    required this.mapMarkerFill,
    required this.mapMarkerStroke,
  });
}

const AuroraColorTokens _auroraLight = AuroraColorTokens(
  surfaceContent: Color(0xFFFFFFFF),
  surfaceChrome: Color(0xFFF4F6FA),
  surfaceSelected: Color(0xFFF5F9FC),
  surfaceOverlay: Color(0xFFFFFFFF),
  borderHairline: Color(0xFFEFF1F6),
  borderStrong: Color(0xFFE0E3EC),
  textPrimary: Color(0xFF141624),
  textSecondary: Color(0xFF666C85),
  textDisabled: Color(0xFFC4C9D8),
  textOnBrand: Color(0xFFFFFFFF),
  actionPrimary: Color(0xFF0066B8),
  actionPressed: Color(0xFF005493),
  actionSubtle: Color(0xFFE8F2FB),
  focusIndicator: Color(0xFF0066B8),
  statusMoving: Color(0xFF12A150),
  statusParked: Color(0xFF6E7480),
  statusWarning: Color(0xFFB7791F),
  statusAlarm: Color(0xFFC7301F),
  statusOffline: Color(0xFFC9CDD6),
  mapTrackDefault: Color(0xFF0066B8),
  mapTrackSpeeding: Color(0xFFC7301F),
  mapTrackSelected: Color(0xFF141624),
  mapMarkerFill: Color(0xFFFFFFFF),
  mapMarkerStroke: Color(0xFF141624),
);

const AuroraColorTokens _auroraDark = AuroraColorTokens(
  surfaceContent: Color(0xFF101220),
  surfaceChrome: Color(0xFF191C2E),
  surfaceSelected: Color(0xFF20243A),
  surfaceOverlay: Color(0xFF191C2E),
  borderHairline: Color(0xFF20243A),
  borderStrong: Color(0xFF292D42),
  textPrimary: Color(0xFFF4F6FA),
  textSecondary: Color(0xFF949AB4),
  textDisabled: Color(0xFF343A50),
  textOnBrand: Color(0xFF101220),
  actionPrimary: Color(0xFF3E9BE0),
  actionPressed: Color(0xFF1478C6),
  actionSubtle: Color(0xFF143253),
  focusIndicator: Color(0xFF3E9BE0),
  statusMoving: Color(0xFF2BD47A),
  statusParked: Color(0xFF9CA2AE),
  statusWarning: Color(0xFFF0B429),
  statusAlarm: Color(0xFFF0554F),
  statusOffline: Color(0xFF40444F),
  mapTrackDefault: Color(0xFF3E9BE0),
  mapTrackSpeeding: Color(0xFFF0554F),
  mapTrackSelected: Color(0xFFF4F6FA),
  mapMarkerFill: Color(0xFF101220),
  mapMarkerStroke: Color(0xFFF4F6FA),
);

const AuroraColorTokens _mtsLight = AuroraColorTokens(
  surfaceContent: Color(0xFFFFFFFF),
  surfaceChrome: Color(0xFFF7F6F5),
  surfaceSelected: Color(0xFFFDF5F5),
  surfaceOverlay: Color(0xFFFFFFFF),
  borderHairline: Color(0xFFF1EFED),
  borderStrong: Color(0xFFE6E3E1),
  textPrimary: Color(0xFF1B1A19),
  textSecondary: Color(0xFF74706D),
  textDisabled: Color(0xFFD2CDC9),
  textOnBrand: Color(0xFFFFFFFF),
  actionPrimary: Color(0xFFD0050F),
  actionPressed: Color(0xFFA8040C),
  actionSubtle: Color(0xFFFDEAEA),
  focusIndicator: Color(0xFFD0050F),
  statusMoving: Color(0xFF12A150),
  statusParked: Color(0xFF6E7480),
  statusWarning: Color(0xFFB7791F),
  statusAlarm: Color(0xFFC7301F),
  statusOffline: Color(0xFFC9CDD6),
  mapTrackDefault: Color(0xFFD0050F),
  mapTrackSpeeding: Color(0xFFC7301F),
  mapTrackSelected: Color(0xFF1B1A19),
  mapMarkerFill: Color(0xFFFFFFFF),
  mapMarkerStroke: Color(0xFF1B1A19),
);

const AuroraColorTokens _mtsDark = AuroraColorTokens(
  surfaceContent: Color(0xFF161514),
  surfaceChrome: Color(0xFF201E1D),
  surfaceSelected: Color(0xFF272423),
  surfaceOverlay: Color(0xFF201E1D),
  borderHairline: Color(0xFF272423),
  borderStrong: Color(0xFF302D2B),
  textPrimary: Color(0xFFF7F6F5),
  textSecondary: Color(0xFFA09B97),
  textDisabled: Color(0xFF3E3B39),
  textOnBrand: Color(0xFF161514),
  actionPrimary: Color(0xFFFF4D52),
  actionPressed: Color(0xFFE30611),
  actionSubtle: Color(0xFF5A0C10),
  focusIndicator: Color(0xFFFF4D52),
  statusMoving: Color(0xFF2BD47A),
  statusParked: Color(0xFF9CA2AE),
  statusWarning: Color(0xFFF0B429),
  statusAlarm: Color(0xFFF0554F),
  statusOffline: Color(0xFF40444F),
  mapTrackDefault: Color(0xFFFF4D52),
  mapTrackSpeeding: Color(0xFFF0554F),
  mapTrackSelected: Color(0xFFF7F6F5),
  mapMarkerFill: Color(0xFF161514),
  mapMarkerStroke: Color(0xFFF7F6F5),
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
  static const double radiusSm = 4;
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
  static const int durationFast = 120;
  static const int durationBase = 200;
  static const int durationSlow = 320;
  static const int durationDataInterp = 500;
  static const Curve curveEnter = Curves.easeOutCubic;
  static const Curve curveExit = Curves.easeInCubic;
}

class AuroraTypographyTokens {
  const AuroraTypographyTokens._();
  static const String fontFamilySans = 'Inter';
  static const String fontFamilyArabic = 'Noto Sans Arabic';
  static const TextStyle display = TextStyle(
    fontFamily: fontFamilySans,
    fontSize: 28,
    height: 1.2143,
    fontWeight: FontWeight.w600,
    letterSpacing: -0.4200,
  );
  static const TextStyle title = TextStyle(
    fontFamily: fontFamilySans,
    fontSize: 20,
    height: 1.3000,
    fontWeight: FontWeight.w600,
    letterSpacing: -0.2000,
  );
  static const TextStyle section = TextStyle(
    fontFamily: fontFamilySans,
    fontSize: 15,
    height: 1.3333,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.0000,
  );
  static const TextStyle body = TextStyle(
    fontFamily: fontFamilySans,
    fontSize: 15,
    height: 1.4667,
    fontWeight: FontWeight.w400,
    letterSpacing: 0.0000,
  );
  static const TextStyle label = TextStyle(
    fontFamily: fontFamilySans,
    fontSize: 13,
    height: 1.3846,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.0000,
  );
  static const TextStyle caption = TextStyle(
    fontFamily: fontFamilySans,
    fontSize: 11,
    height: 1.3636,
    fontWeight: FontWeight.w400,
    letterSpacing: 0.0000,
  );
  static const TextStyle overline = TextStyle(
    fontFamily: fontFamilySans,
    fontSize: 9,
    height: 1.3333,
    fontWeight: FontWeight.w700,
    letterSpacing: 0.7200,
  );
  static const TextStyle numberLg = TextStyle(
    fontFamily: fontFamilySans,
    fontSize: 20,
    height: 1.2000,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.0000,
    fontFeatures: <FontFeature>[FontFeature.tabularFigures()],
  );
  static const TextStyle numberMd = TextStyle(
    fontFamily: fontFamilySans,
    fontSize: 14,
    height: 1.2857,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.0000,
    fontFeatures: <FontFeature>[FontFeature.tabularFigures()],
  );
  static const TextStyle numberSm = TextStyle(
    fontFamily: fontFamilySans,
    fontSize: 11,
    height: 1.2727,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.0000,
    fontFeatures: <FontFeature>[FontFeature.tabularFigures()],
  );
}
