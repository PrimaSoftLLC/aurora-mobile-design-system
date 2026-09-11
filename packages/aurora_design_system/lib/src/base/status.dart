import 'package:flutter/painting.dart' show Color;

import '../tokens/tokens.g.dart';

/// Пять состояний объекта из §5.3 спека. Это единственное знание о домене,
/// которое пакету позволено: цвета этих состояний уже лежат в токенах.
enum AuroraStatus { moving, parked, warning, alarm, offline }

extension AuroraStatusColor on AuroraStatus {
  Color color(AuroraColorTokens c) {
    switch (this) {
      case AuroraStatus.moving:
        return c.statusMoving;
      case AuroraStatus.parked:
        return c.statusParked;
      case AuroraStatus.warning:
        return c.statusWarning;
      case AuroraStatus.alarm:
        return c.statusAlarm;
      case AuroraStatus.offline:
        return c.statusOffline;
    }
  }
}
