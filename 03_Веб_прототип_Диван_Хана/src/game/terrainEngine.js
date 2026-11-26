// ============================================================================
// Движок рельефа и театра военных действий: высоты SRTM, обход скал, погода, укрепления, мосты, госпитали, лес
// Вынесено из App.jsx (модульная структура веб-прототипа «Имамат: Диван-Хана»)
// ============================================================================
import { FORTIFICATION_BLUEPRINTS } from '../data/campaignData.js';
import { sampleDagestanRealSrtm } from '../data/dagestanRealSrtmDem.js';


// ============================================================================
// СПРИНТ 24 (M24) + РЕАЛЬНЫЙ NASA SRTM 30м ДАГЕСТАНА: ГЕОДЕЗИЧЕСКАЯ МОДЕЛЬ РЕЛЬЕФА
// ============================================================================
export function sampleStrategicTerrain(rawX, rawY) {
  const x = Math.max(0, Math.min(700, Number(rawX) || 0));
  const y = Math.max(0, Math.min(460, Number(rawY) || 0));

  // Реальная спутниковая высота (м над уровнем моря) и истинный уклон склона по NASA SRTM 30м!
  const srtm = sampleDagestanRealSrtm(x, y);
  const elev = Math.round(srtm.elev);
  let slopeDeg = srtm.slopeDeg;

  const isSulakCanyon = x >= 355 && x <= 445 && y >= 72 && y <= 170 && elev < 860 && slopeDeg >= 16;
  const isKoisuGorge = x >= 270 && x <= 635 && y >= 155 && y <= 410 && elev < 1180 && slopeDeg >= 22;
  const isArgunGorge = x >= 72 && x <= 175 && y >= 110 && y <= 355 && elev < 1050 && slopeDeg >= 16;
  const isRiverGorge = isSulakCanyon || isKoisuGorge || isArgunGorge;

  let biomeRu = 'Предгорная долина и кутаны';
  let biomeEn = 'Foothill Valley & Winter Kutans';
  let speedMult = 1.0;

  if (elev <= -12 && x > 565) {
    biomeRu = 'Акватория Каспийского моря (глубокая вода)';
    biomeEn = 'Caspian Sea Open Water (Impassable)';
    slopeDeg = 0;
    speedMult = 0.25;
  } else if (elev <= 12 && x > 565) {
    biomeRu = 'Прикаспийская низменность и береговая коса';
    biomeEn = 'Caspian Coast & Sandy Lowland';
    slopeDeg = Math.min(5, slopeDeg);
    speedMult = 1.2;
  } else if (elev < 240 && y < 145) {
    biomeRu = 'Притеречно-Сунженская равнина (степь)';
    biomeEn = 'Terek-Sunzha Lowland Steppe';
    slopeDeg = Math.min(9, slopeDeg);
    speedMult = 1.32;
  } else if (elev >= 2950) {
    biomeRu = 'Вечные снега и ледники Богосского и Главного хребтов';
    biomeEn = 'Bogoss & Main Caucasian Glaciers';
    slopeDeg = Math.max(38, slopeDeg);
    speedMult = 0.36;
  } else if (isSulakCanyon) {
    biomeRu = 'Сулакский каньон и Гимринская теснина';
    biomeEn = 'Sulak Canyon & Gimry Chasm';
    speedMult = 0.68;
  } else if (isRiverGorge) {
    biomeRu = 'Теснина каньона Койсу / Аргуна';
    biomeEn = 'Koisu / Argun River Canyon Gorge';
    speedMult = 0.78;
  } else if (x < 345 && elev >= 260 && elev <= 2150) {
    biomeRu = 'Вековой буковый лес Ичкерии и предгорий';
    biomeEn = 'Ancient Beech Forest of Ichkeria & Foothills';
    speedMult = 0.84;
  } else if (x >= 340 && elev >= 1180 && elev < 2520 && slopeDeg < 22) {
    biomeRu = 'Известняковое столовое плато Нагорного Дагестана';
    biomeEn = 'Mountain Dagestan Limestone Table Plateau';
    speedMult = 0.86;
  } else if (x >= 340 && elev >= 950) {
    biomeRu = 'Куэстовые обрывы и террасы Внутригорного Дагестана';
    biomeEn = 'Inner Dagestan Limestone Cuestas & Terraces';
    speedMult = slopeDeg > 36 ? 0.54 : 0.72;
  } else {
    biomeRu = 'Альпийские луга Джайляу и горные тропы';
    biomeEn = 'Alpine Jailau Pastures & Mountain Trails';
    speedMult = 0.92;
  }

  return {
    x: Math.round(x),
    y: Math.round(y),
    elevationMeters: elev,
    slopeDeg,
    biomeRu,
    biomeEn,
    speedMult: +speedMult.toFixed(2)
  };
}

// Построение рельефно-адаптивного маршрута (обход отвесных скал >60° и ледников через перевалы и ущелья)
export function computeTerrainAwarePath(startX, startY, targetX, targetY) {
  const dx = targetX - startX;
  const dy = targetY - startY;
  const dist = Math.hypot(dx, dy);
  const steps = Math.max(2, Math.min(10, Math.ceil(dist / 52)));

  const waypoints = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    let wx = startX + dx * t;
    let wy = startY + dy * t;

    // Для промежуточных точек ищем локальный перевал с наименьшим уклоном и высотой в окрестности перпендикуляра
    if (i > 0 && i < steps) {
      const nx = -dy / Math.max(1, dist);
      const ny = dx / Math.max(1, dist);
      let bestX = wx;
      let bestY = wy;
      let bestCost = Infinity;

      const offsets = [-34, -22, -11, 0, 11, 22, 34];
      for (const off of offsets) {
        const candX = Math.max(24, Math.min(676, wx + nx * off));
        const candY = Math.max(32, Math.min(425, wy + ny * off));
        const probe = sampleStrategicTerrain(candX, candY);
        // Штрафуем акваторию Каспия (<= -10 м), отвесные обрывы (>48°), вечные ледники (>3000 м) и отклонение от генерального курса
        const seaPenalty = probe.elevationMeters <= -10 && candX > 560 ? 4000 : 0;
        const cliffPenalty = probe.slopeDeg > 48 ? (probe.slopeDeg - 48) * 38 : 0;
        const glacierPenalty = probe.elevationMeters > 2900 ? (probe.elevationMeters - 2900) * 1.4 : 0;
        const deviationPenalty = Math.abs(off) * 4.2;
        const cost =
          probe.elevationMeters * 0.25 +
          probe.slopeDeg * 11 +
          seaPenalty +
          cliffPenalty +
          glacierPenalty +
          deviationPenalty;
        if (cost < bestCost) {
          bestCost = cost;
          bestX = candX;
          bestY = candY;
        }
      }
      wx = bestX;
      wy = bestY;
    }

    const sample = sampleStrategicTerrain(wx, wy);
    waypoints.push({
      x: +wx.toFixed(1),
      y: +wy.toFixed(1),
      elevationMeters: sample.elevationMeters,
      slopeDeg: sample.slopeDeg,
      biomeRu: sample.biomeRu,
      biomeEn: sample.biomeEn,
      speedMult: sample.speedMult
    });
  }
  return waypoints;
}

export function sampleWeatherAtPoint(x, y, fronts, weatherEnabled = true) {
  if (!weatherEnabled || !Array.isArray(fronts)) {
    return {
      active: false,
      activeFront: null,
      icon: '☀️',
      badgeRu: 'Ясная погода',
      badgeEn: 'Clear Sky',
      speedMult: 1.0,
      ambushBonus: 0,
      ambushBonusPct: 0,
      labelRu: 'Ясная горная погода (видимость 100%)',
      labelEn: 'Clear Mountain Weather (100% visibility)'
    };
  }
  for (const f of fronts) {
    const normDist = Math.hypot((x - f.x) / Math.max(10, f.rx), (y - f.y) / Math.max(10, f.ry));
    if (normDist <= 1.0) {
      return {
        active: true,
        activeFront: f,
        icon: f.icon || '🌦️',
        badgeRu: f.badgeRu,
        badgeEn: f.badgeEn,
        speedMult: f.speedMult,
        ambushBonus: f.ambushBonus,
        ambushBonusPct: f.ambushBonusPct || f.ambushBonus,
        labelRu: f.nameRu,
        labelEn: f.nameEn
      };
    }
  }
  return {
    active: false,
    activeFront: null,
    icon: '☀️',
    badgeRu: 'Ясная погода',
    badgeEn: 'Clear Sky',
    speedMult: 1.0,
    ambushBonus: 0,
    ambushBonusPct: 0,
    labelRu: 'Ясная горная погода (видимость 100%)',
    labelEn: 'Clear Mountain Weather (100% visibility)'
  };
}

export function sampleFortificationsAtPoint(x, y, fortifications) {
  if (!fortifications || fortifications.length === 0) {
    return {
      active: false,
      fort: null,
      blueprint: null,
      enemySpeedMult: 1.0,
      friendlySpeedMult: 1.0,
      salvoDamageBayonets: 0,
      ambushBonusPct: 0
    };
  }
  for (let i = 0; i < fortifications.length; i++) {
    const f = fortifications[i];
    if (f.integrity <= 0) continue;
    const bp =
      FORTIFICATION_BLUEPRINTS.find((b) => b.id === f.type) || FORTIFICATION_BLUEPRINTS[0];
    const dist = Math.hypot(x - f.x, y - f.y);
    if (dist <= bp.radius) {
      return {
        active: true,
        fort: f,
        blueprint: bp,
        enemySpeedMult: bp.enemySpeedMult,
        friendlySpeedMult: bp.friendlySpeedMult,
        salvoDamageBayonets: bp.salvoDamageBayonets,
        ambushBonusPct: bp.ambushBonusPct
      };
    }
  }
  return {
    active: false,
    fort: null,
    blueprint: null,
    enemySpeedMult: 1.0,
    friendlySpeedMult: 1.0,
    salvoDamageBayonets: 0,
    ambushBonusPct: 0
  };
}

export function sampleSignalBeaconBonus(x, y, beacons) {
  if (!beacons || !beacons.length) {
    return { active: false, speedMult: 1.0, enemySlowMult: 1.0, beacon: null };
  }
  for (const b of beacons) {
    if (!b.isLit) continue;
    const dist = Math.hypot(x - b.x, y - b.y);
    if (dist <= b.radius) {
      return {
        active: true,
        speedMult: 1.30,
        enemySlowMult: 0.88,
        beacon: b
      };
    }
  }
  return { active: false, speedMult: 1.0, enemySlowMult: 1.0, beacon: null };
}

export function sampleRiverBridgeEffect(x, y, bridges) {
  if (!bridges || !bridges.length) {
    return { active: false, friendlySpeedMult: 1.0, enemySpeedMult: 1.0, bridge: null };
  }
  for (const br of bridges) {
    const dist = Math.hypot(x - br.x, y - br.y);
    if (dist <= br.radius) {
      if (br.status === 'intact') {
        return {
          active: true,
          friendlySpeedMult: 1.25,
          enemySpeedMult: 1.0,
          bridge: br
        };
      }
      return {
        active: true,
        friendlySpeedMult: 0.85,
        enemySpeedMult: 0.28,
        bridge: br
      };
    }
  }
  return { active: false, friendlySpeedMult: 1.0, enemySpeedMult: 1.0, bridge: null };
}

export function sampleHospitalBonusAtPoint(x, y, hospitals) {
  let bestHosp = null;
  for (const h of hospitals || []) {
    if (h.status !== 'active') continue;
    const dist = Math.hypot(x - h.x, y - h.y);
    if (dist <= h.radius) {
      if (!bestHosp || h.recoveryRate > bestHosp.recoveryRate) {
        bestHosp = h;
      }
    }
  }
  return {
    inHospitalZone: Boolean(bestHosp),
    hospital: bestHosp,
    casualtyReductionMult: bestHosp ? +(1 - bestHosp.recoveryRate).toFixed(2) : 1.0,
    healSabersPerPulse: bestHosp ? bestHosp.healSabersPerPulse : 0
  };
}

export function sampleForestCanopyAtPoint(x, y, clearings) {
  for (const fc of clearings || []) {
    if (Math.hypot(x - fc.x, y - fc.y) <= fc.radius) {
      return {
        inForest: true,
        clearing: fc,
        enemySlowdownMult: fc.status === 'protected' ? fc.enemySlowdownMult : 0.82,
        ambushBonusPct: fc.status === 'protected' ? fc.ambushBonusPct : 15
      };
    }
  }
  return {
    inForest: false,
    clearing: null,
    enemySlowdownMult: 1.0,
    ambushBonusPct: 0
  };
}
