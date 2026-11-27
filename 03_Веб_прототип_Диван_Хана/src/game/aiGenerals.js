// ============================================================================
// ОПЕРАТИВНЫЙ ИИ ГЕНЕРАЛОВ КАВКАЗСКОГО КОРПУСА РИ (Спринт 2 — Фаза 1 / Gate 1)
// Воронцов, Фрейтаг, Аргутинский, Барятинский — чистые функции без React/DOM.
// ============================================================================

export function selectEpochGeneralIdx({
  activeScenarioId = 'camp_1845',
  nextTurnNum = 2,
  currentGeneralIdx = 0,
  aiDoctrineLocked = false
}) {
  if (aiDoctrineLocked) return currentGeneralIdx;
  if (activeScenarioId === 'camp_1839' || activeScenarioId === 'camp_1847') return 1;
  if (nextTurnNum <= 4) return 0;
  if (nextTurnNum <= 8) return 2;
  return 3;
}

export function rankVulnerableNaibates({ naibates = [], general = null, excludeNaibateId = null }) {
  const preferred = general?.preferredTargets || [];
  return [...naibates]
    .filter((n) => n && n.id !== excludeNaibateId)
    .sort((a, b) => {
      const scoreA =
        (a.imperialPressure || 0) * 0.65 -
        (a.garrison || 0) * 0.014 -
        (a.gunpowder || 0) * 0.16 +
        (preferred.includes(a.id) ? 18 : 0);
      const scoreB =
        (b.imperialPressure || 0) * 0.65 -
        (b.garrison || 0) * 0.014 -
        (b.gunpowder || 0) * 0.16 +
        (preferred.includes(b.id) ? 18 : 0);
      return scoreB - scoreA;
    });
}

// Выбор главной горячей точки карты для мягкого наведения 3D-камеры при смене хода
export function selectTurnHotspotFocus({
  naibates = [],
  liveImperialColumns = [],
  nextTurnNum = 2
}) {
  const hotSiege = naibates.find((n) => n.underSiege && n.coords);
  if (hotSiege) {
    return {
      mx: hotSiege.coords.x,
      my: hotSiege.coords.y,
      labelRu: `Осада: ${hotSiege.name}`,
      labelEn: `Siege: ${hotSiege.nameEn || hotSiege.name}`,
      seq: nextTurnNum
    };
  }
  const hotCol = (liveImperialColumns || []).find(
    (c) =>
      !c.fogHidden &&
      c.status !== 'routed' &&
      c.status !== 'destroyed' &&
      Number.isFinite(c.x) &&
      Number.isFinite(c.y)
  );
  if (hotCol) {
    return {
      mx: hotCol.x,
      my: hotCol.y,
      labelRu: hotCol.nameRu,
      labelEn: hotCol.nameEn,
      seq: nextTurnNum
    };
  }
  return null;
}

// Шаг живых экспедиционных колонн РИ и их сухарных обозов на новый ход
export function stepImperialColumnsForTurn({
  columns = [],
  naibates = [],
  liveUnits = [],
  isWinterClimate = false,
  difficultyWeight = 1.0,
  nextTurnNum = 2,
  computePath
}) {
  const clampedDiff = Math.max(0.8, Math.min(1.3, difficultyWeight || 1.0));
  const baseImperialMarchBudget = Math.round((isWinterClimate ? 38 : 54) * clampedDiff);
  const logs = [];

  const nextColumns = columns.map((col) => {
    const distToOrigin = Math.hypot(col.x - col.originX, col.y - col.originY);
    if (col.status === 'retreating' && distToOrigin <= 30) {
      const replenishedBayonets = Math.min(
        col.maxBayonets || 4200,
        col.bayonets + Math.round(320 * (difficultyWeight || 1.0))
      );
      const vulnNaib =
        [...naibates].sort(
          (a, b) =>
            b.imperialPressure * 0.65 -
            b.garrison * 0.015 -
            (a.imperialPressure * 0.65 - a.garrison * 0.015)
        )[0] || naibates[0];
      const freshPath =
        computePath && vulnNaib?.coords
          ? computePath(col.x, col.y, vulnNaib.coords.x, vulnNaib.coords.y)
          : col.waypoints || [];
      return {
        ...col,
        bayonets: replenishedBayonets,
        supplyCut: false,
        status: 'advancing',
        targetNaibateId: vulnNaib?.id || col.targetNaibateId,
        targetNameRu: vulnNaib?.name || col.targetNameRu,
        targetNameEn: vulnNaib?.nameEn || vulnNaib?.name || col.targetNameEn,
        turnMarchBudget: baseImperialMarchBudget,
        waypoints: freshPath,
        waypointIdx: Math.min(1, Math.max(0, freshPath.length - 1))
      };
    }

    const segDx = col.x - col.originX;
    const segDy = col.y - col.originY;
    const segLenSq = segDx * segDx + segDy * segDy;
    const unitBlockingLine =
      segLenSq > 900 &&
      (liveUnits || []).some((u) => {
        if (u.id === 'unit_powder_caravan') return false;
        if ((u.sabers ?? 400) < 240) return false;
        const tProj = ((u.x - col.originX) * segDx + (u.y - col.originY) * segDy) / segLenSq;
        if (tProj < 0.06 || tProj > 0.88) return false;
        const px = col.originX + segDx * tProj;
        const py = col.originY + segDy * tProj;
        return Math.hypot(u.x - px, u.y - py) <= 34;
      });

    // Если мюриды ушли с перерезанного тракта, а у колонны достаточно сил — казачий конвой восстанавливает обоз
    const cossackReopenedRoad =
      col.status === 'advancing' &&
      col.supplyCut &&
      !unitBlockingLine &&
      col.bayonets >= 1650 &&
      !isWinterClimate;

    if (cossackReopenedRoad) {
      logs.push({
        id: `log-supply-reopen-${col.id}-${nextTurnNum}`,
        turn: nextTurnNum,
        category: 'battle',
        sender: 'Разведка кунаков на кордоне',
        senderEn: 'Kunak Cordon Reconnaissance',
        title: `Казачий конвой деблокировал обозный тракт колонны (${col.commanderRu || col.nameRu})`,
        titleEn: `Cossack Escort Reopened Supply Road (${col.commanderEn || col.nameEn})`,
        text: `Так как конные сотни отошли с коммуникаций, штаб колонны выслал линейный резерв и восстановил подвоз сухарей из крепости.`,
        textEn: `With murid squadrons withdrawn from the supply road, the column’s HQ dispatched a reserve escort and restored biscuit convoys.`
      });
      return {
        ...col,
        supplyCut: false,
        turnMarchBudget: Math.round(baseImperialMarchBudget * 0.82)
      };
    }

    const isSupplySevered = col.status === 'advancing' && (col.supplyCut || unitBlockingLine);
    if (isSupplySevered) {
      const attrition = Math.max(120, Math.round(col.bayonets * 0.14));
      const nextBayonets = Math.max(600, col.bayonets - attrition);
      if (nextBayonets <= 1150) {
        const retreatPath = computePath
          ? computePath(col.x, col.y, col.originX, col.originY)
          : col.waypoints || [];
        return {
          ...col,
          bayonets: nextBayonets,
          supplyCut: true,
          status: 'retreating',
          turnMarchBudget: 52,
          waypoints: retreatPath,
          waypointIdx: Math.min(1, Math.max(0, retreatPath.length - 1))
        };
      }
      return {
        ...col,
        bayonets: nextBayonets,
        supplyCut: true,
        convoyProgress: 0,
        turnMarchBudget: 24
      };
    }

    if (col.status === 'advancing') {
      const nextConvoy = +((col.convoyProgress ?? 0.42) + 0.32).toFixed(2);
      if (nextConvoy >= 1.0) {
        const reinforcedBayonets = Math.min(col.maxBayonets || 4400, col.bayonets + 220);
        logs.push({
          id: `log-convoy-arrived-${col.id}-${nextTurnNum}`,
          turn: nextTurnNum,
          category: 'battle',
          sender: 'Лазутчики на коммуникациях РИ',
          senderEn: 'Supply Road Scouts',
          title: `🥖 Обоз из крепости «${col.originNameRu}» усилил колонну (+220 штыков)`,
          titleEn: `🥖 Convoy from “${col.originNameEn}” Reinforced Column (+220 bayonets)`,
          text: `Неперехваченный сухарный и зарядный транспорт дошёл до лагеря «${col.nameRu}», пополнив строй на +220 штыков. Перережьте коммуникацию конницей!`,
          textEn: `An unraided biscuit and caisson wagon train reached “${col.nameEn}”, replenishing +220 bayonets. Sever the supply road with cavalry!`
        });
        return {
          ...col,
          bayonets: reinforcedBayonets,
          convoyProgress: 0.24,
          supplyCut: false,
          turnMarchBudget: baseImperialMarchBudget
        };
      }
      return {
        ...col,
        convoyProgress: nextConvoy,
        supplyCut: false,
        turnMarchBudget: baseImperialMarchBudget
      };
    }

    return {
      ...col,
      supplyCut: false,
      turnMarchBudget: baseImperialMarchBudget
    };
  });

  return { nextColumns, logs, baseImperialMarchBudget };
}

// Стратегическая директива Штаба Отдельного Кавказского корпуса на ход
export function resolveImperialAiDirective({
  imperialAi,
  naibates = [],
  imperialGenerals = [],
  activeScenarioId = 'camp_1845',
  nextTurnNum = 2,
  isWinterClimate = false,
  difficultyWeight = 1.0
}) {
  const activeGen = imperialGenerals[imperialAi.generalIdx] || imperialGenerals[0];
  const activeDocMod = activeGen?.doctrineModifiers || {
    strikePressureBonus: 18,
    strikePowderDrain: -10,
    interceptRiskBonus: 0,
    provisionsModPerTurn: 0
  };
  const targetNaibObj =
    naibates.find((n) => n.id === imperialAi.targetNaibateId) || naibates[0];
  const clampedDiff = Math.max(0.85, Math.min(1.25, difficultyWeight || 1.0));
  const scaledStrikePressure = Math.round(activeDocMod.strikePressureBonus * clampedDiff);
  const logs = [];

  if ((imperialAi.turnsUntilStrike || 1) <= 1) {
    const aiStrikeTargetId = imperialAi.targetNaibateId;
    if (targetNaibObj && activeGen) {
      logs.push({
        id: `log-ai-strike-${nextTurnNum}`,
        turn: nextTurnNum,
        category: 'battle',
        sender: `Штаб Отдельного Кавказского корпуса (${activeGen.name})`,
        senderEn: `Separate Caucasian Corps HQ (${activeGen.nameEn || activeGen.name})`,
        title: `УДАР ИМПЕРСКОЙ КОЛОННЫ по округу «${targetNaibObj.name}»!`,
        titleEn: `IMPERIAL COLUMN STRIKE on “${targetNaibObj.nameEn || targetNaibObj.name}”!`,
        text: `Экспедиционный отряд (${imperialAi.columnStrength} штыков при горных орудиях) провёл операцию по доктрине ${activeGen.doctrineName}. Нажим на округ «${targetNaibObj.name}» вырос на +${scaledStrikePressure}%, гарнизон израсходовал ${Math.abs(activeDocMod.strikePowderDrain)} пудов пороха на оборону завалов!`,
        textEn: `An expeditionary column (${imperialAi.columnStrength} bayonets with mountain guns) executed an offensive under doctrine ${activeGen.doctrineNameEn || activeGen.doctrineName}. Pressure on “${targetNaibObj.nameEn || targetNaibObj.name}” rose by +${scaledStrikePressure}%, and the garrison expended ${Math.abs(activeDocMod.strikePowderDrain)} poods of powder defending the abatis!`
      });
    }

    const nextGenIdx = selectEpochGeneralIdx({
      activeScenarioId,
      nextTurnNum,
      currentGeneralIdx: imperialAi.generalIdx,
      aiDoctrineLocked: Boolean(imperialAi.aiDoctrineLocked)
    });
    const nextGen = imperialGenerals[nextGenIdx] || imperialGenerals[0];
    const rankedTargets = rankVulnerableNaibates({
      naibates,
      general: nextGen,
      excludeNaibateId: aiStrikeTargetId
    });
    const nextTargetId =
      rankedTargets[0]?.id ||
      nextGen?.preferredTargets?.[nextTurnNum % (nextGen.preferredTargets.length || 1)] ||
      naibates[0]?.id;

    return {
      aiStrikeTargetId,
      scaledStrikePressure,
      aiPowderDrain: activeDocMod.strikePowderDrain,
      activeGen,
      nextImperialAi: {
        ...imperialAi,
        generalIdx: nextGenIdx,
        targetNaibateId: nextTargetId,
        turnsUntilStrike: isWinterClimate ? 3 : 2,
        columnStrength: Math.round((3600 + (nextTurnNum % 4) * 650) * clampedDiff),
        scouted: true
      },
      logs
    };
  }

  return {
    aiStrikeTargetId: null,
    scaledStrikePressure,
    aiPowderDrain: activeDocMod.strikePowderDrain,
    activeGen,
    nextImperialAi: {
      ...imperialAi,
      turnsUntilStrike: imperialAi.turnsUntilStrike - 1
    },
    logs
  };
}
