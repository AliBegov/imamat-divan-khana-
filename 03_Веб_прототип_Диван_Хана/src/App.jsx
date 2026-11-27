import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Compass,
  Scale,
  Scroll,
  Swords,
  Hammer,
  BookOpen,
  Crosshair,
  RefreshCw,
  Volume2,
  VolumeX,
  AlertTriangle,
  Shield,
  Flame,
  Coins,
  Wheat,
  Crown
} from 'lucide-react';
import {
  playHistoricalSound,
  setGlobalAudioMixerState,
  syncAdaptiveMusicScore,
  syncCaucasianAmbient
} from './game/audio.js';
import {
  loadAudioMixerConfig,
  resolveAdaptiveMusicState,
  resolveTactileCueForAction,
  saveAudioMixerConfig
} from './game/adaptiveAudioEngine.js';
import {
  PLAYTEST_BUILD_TAG,
  computeFirst5TurnsFunnel,
  loadLocalFeedbackReports,
  saveLocalFeedbackReport
} from './game/playtestFeedbackEngine.js';
import { clientToMapPoint } from './game/mapProjection.js';
import {
  computeBaseTurnEconomy,
  computeCampaignAudit,
  computeLeaderStress,
  computeNextNaibatesState,
  computeNizamModifiers,
  computeOrderExecutionBreakdown,
  createFreshTurnActionQuota,
  evaluateCampaignClimax,
  refreshFieldUnitsForNewTurn,
  resolveEnvoysForTurn
} from './game/turnEngine.js';
import {
  resolveImperialAiDirective,
  selectTurnHotspotFocus,
  stepImperialColumnsForTurn
} from './game/aiGenerals.js';
import {
  buildCampaignSavePayload,
  buildImamatSaveFilename,
  getLatestSaveSummary,
  hasAnySavedCampaign,
  listSaveSlotsMeta,
  readSaveSlot,
  serializeImamatSaveFile,
  validateAndMigrateSavePayload,
  writeSaveSlot
} from './game/saveSystem.js';
import {
  computeAutoResolveForecast,
  computeNextStealthAfterAction,
  computeTacticalModifiers,
  getTacticalStanceById,
  resolveConvoyStrikeOutcome
} from './game/tacticalBattleEngine.js';
import {
  activateSingleKunakRing,
  buildReadableAiIntentVectors,
  buildReconSources
} from './game/reconIntelEngine.js';
import {
  applyOrderAwardToNaibate,
  pickNextHistoricalDilemma,
  resolveDueDelayedConsequences,
  scheduleDelayedConsequence
} from './game/naibPoliticsEngine.js';
import { HighlandEagleIcon, WaxSealIcon } from './views/hud/PeriodIcons.jsx';
import {
  CAMPAIGN_SCENARIOS,
  TACTICAL_3D_TERRAINS,
  SEASON_CLIMATE_MODIFIERS,
  HISTORICAL_FIGURES_ARCHIVE,
  IMPERIAL_GENERALS,
  INITIAL_ARSENAL_ITEMS,
  INITIAL_NAIBATES,
  NAIB_ORDER_TYPES,
  INITIAL_NIZAMS,
  INITIAL_COURT_CASES,
  INITIAL_SPLINE_SEGMENTS,
  INITIAL_SPLINE_ECHELONS,
  INITIAL_HISTORICAL_CRISES,
  IMAMAT_GLOSSARY_TERMS,
  FORTIFICATION_BLUEPRINTS,
  NAIB_RIVALRY_TRIANGLES,
  AI_SHAMIL_DOCTRINES
} from './data/campaignData.js';
import {
  sampleStrategicTerrain,
  computeTerrainAwarePath,
  sampleWeatherAtPoint,
  sampleFortificationsAtPoint,
  sampleSignalBeaconBonus,
  sampleRiverBridgeEffect,
  sampleHospitalBonusAtPoint,
  sampleForestCanopyAtPoint
} from './game/terrainEngine.js';
import {
  SQUADRON_GEAR_CATALOG,
  INITIAL_BATTLE_MEMORIALS,
  INITIAL_LIVE_FIELD_UNITS,
  INITIAL_WEATHER_FRONTS,
  INITIAL_IMPERIAL_COLUMNS,
  INITIAL_MAP_FORTIFICATIONS,
  INITIAL_SUPPLY_CARAVANS,
  INITIAL_CORDON_FORTRESSES,
  INITIAL_SIGNAL_BEACONS,
  INITIAL_DEEP_RAID_TARGETS,
  INITIAL_RIVER_BRIDGES,
  INITIAL_MUHTASIB_PATROLS,
  INITIAL_MOUNTAIN_BATTERIES,
  INITIAL_TRANSHUMANCE_FLOCKS,
  INITIAL_SAPPER_MINES,
  INITIAL_DIPLOMATIC_MISSIONS,
  INITIAL_FIELD_HOSPITALS,
  INITIAL_PRISONER_EXCHANGES,
  INITIAL_POWDER_MILLS,
  INITIAL_KUNAK_SPY_RINGS,
  INITIAL_IMPERIAL_COURIERS,
  INITIAL_FOREST_CLEARINGS,
  INITIAL_MUHAJIR_CARAVANS
} from './data/theaterEntities.js';
import { SEASONS, SEASONS_EN, HISTORICAL_IRONMAN_CHALLENGES, STEAM_TRAILER_STORYBOARD_SHOTS, DIPLOMATIC_DISPATCHES_ARCHIVE } from './data/appContent.js';
import {
  RELICS_STORAGE_KEY,
  ACTIVE_RELICS_STORAGE_KEY,
  IMAMAT_RELICS_CATALOG,
  loadUnlockedRelicIds,
  loadActiveRelicIds,
  computeActiveRelicBonuses,
  getNaibLoyaltyMemory
} from './data/imamatRelics.js';
import { HERO_STORY_ARCS, createInitialHeroArcsState } from './data/heroArcs.js';
import {
  STEAM_APP_ID,
  STEAM_CLOUD_QUOTA_BYTES,
  buildSteamRichPresence,
  detectSteamRuntimeEnvironment,
  loadSteamCloudManifest,
  syncAchievementsToSteam,
  syncSaveToSteamCloud,
  triggerSteamOverlay
} from './game/steamworksBridge.js';
import {
  NEXT_FEST_DEMO_CONFIG,
  detectNextFestDemoMode,
  evaluateNextFestDemoProgress,
  tagDemoSaveForFullVersionCarryOver
} from './game/nextFestDemoEngine.js';
import NextFestDemoOutroModal from './views/modals/NextFestDemoOutroModal.jsx';
import {
  HISTORICAL_EPISODES,
  createInitialEpisodesState,
  getInitialEpisodeIdForScenario
} from './data/historicalEpisodes.js';
import GlossaryModal from './views/modals/GlossaryModal.jsx';
import TelemetryModal from './views/modals/TelemetryModal.jsx';
import AchievementsModal from './views/modals/AchievementsModal.jsx';
import AudioMixerModal from './views/modals/AudioMixerModal.jsx';
import ModBuilderModal from './views/modals/ModBuilderModal.jsx';
import ReplayModal from './views/modals/ReplayModal.jsx';
import FieldManualModal from './views/modals/FieldManualModal.jsx';
import TrailerPrevizModal from './views/modals/TrailerPrevizModal.jsx';
import MuseumCodexModal from './views/modals/MuseumCodexModal.jsx';
import DispatchesModal from './views/modals/DispatchesModal.jsx';
import ReleaseHubModal from './views/modals/ReleaseHubModal.jsx';
import PlaytestFeedbackModal from './views/modals/PlaytestFeedbackModal.jsx';
import MapTab from './views/tabs/MapTab.jsx';
import NizamsTab from './views/tabs/NizamsTab.jsx';
import DiplomacyTab from './views/tabs/DiplomacyTab.jsx';
import SiegeTab from './views/tabs/SiegeTab.jsx';
import ArsenalTab from './views/tabs/ArsenalTab.jsx';
import ChronicleTab from './views/tabs/ChronicleTab.jsx';
import CrisesTab from './views/tabs/CrisesTab.jsx';
import VerdictTab from './views/tabs/VerdictTab.jsx';
import SimEpilogueTab from './views/tabs/SimEpilogueTab.jsx';
import ArchiveBallisticsTab from './views/tabs/ArchiveBallisticsTab.jsx';
import Tactical3DTab from './views/tabs/Tactical3DTab.jsx';
import {
  AlertBar,
  EndTurnButton,
  HudLangContext,
  PauseMenu,
  ResourceChip,
  TitleScreen,
  ToastBanner,
  TurnTransitionOverlay,
  findPortrait,
  useGameHotkeys,
  useResourceDeltas
} from './views/hud/GameHUD.jsx';

export default function App() {
  const [lang, setLang] = useState('ru');
  const t = (ru, en) => (lang === 'en' ? en : ru);
  const [activeTab, setActiveTab] = useState('map');
  const [activeScenarioId, setActiveScenarioId] = useState('camp_1845');
  const [turn, setTurn] = useState(1);
  const [turnFocusEvent, setTurnFocusEvent] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [statusBanner, setStatusBanner] = useState(null);
  const [showAdvisorPanel, setShowAdvisorPanel] = useState(false);
  const [showGlossaryModal, setShowGlossaryModal] = useState(false);
  const [glossarySearch, setGlossarySearch] = useState('');
  const [glossaryCategory, setGlossaryCategory] = useState('all');
  const [advisorBattleCompleted, setAdvisorBattleCompleted] = useState(false);
  const [showTelemetryModal, setShowTelemetryModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showAudioMixerModal, setShowAudioMixerModal] = useState(false);
  const [showPlaytestFeedbackModal, setShowPlaytestFeedbackModal] = useState(false);
  const [localFeedbackReports, setLocalFeedbackReports] = useState(() => loadLocalFeedbackReports());
  const [recentRuntimeErrors, setRecentRuntimeErrors] = useState([]);
  const sessionStartMsRef = useRef(Date.now());
  const [audioMixerConfig, setAudioMixerConfig] = useState(() => loadAudioMixerConfig());
  const [tactileFeedback, setTactileFeedback] = useState(null);
  const [lastActionLatencyMs, setLastActionLatencyMs] = useState(null);
  const tactileClearTimerRef = useRef(null);

  const triggerTactileCue = useCallback(
    (actionType = 'map_click', pos = null) => {
      const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const cue = resolveTactileCueForAction(actionType);
      if (cue.soundId) {
        playHistoricalSound(cue.soundId, soundEnabled);
      }
      if (audioMixerConfig.hapticsEnabled) {
        setTactileFeedback({
          ...cue,
          actionType,
          pos,
          seq: Date.now()
        });
        if (tactileClearTimerRef.current) {
          window.clearTimeout(tactileClearTimerRef.current);
        }
        tactileClearTimerRef.current = window.setTimeout(() => {
          setTactileFeedback(null);
        }, cue.durationMs || 260);
      }
      const elapsed = Math.max(
        0.1,
        Number((((typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0)).toFixed(1))
      );
      setLastActionLatencyMs(elapsed);
    },
    [soundEnabled, audioMixerConfig.hapticsEnabled]
  );
  const [showModBuilderModal, setShowModBuilderModal] = useState(false);
  const [showReplayModal, setShowReplayModal] = useState(false);
  const [replaySelectedTurnIdx, setReplaySelectedTurnIdx] = useState(0);
  const [showReplayBenchmarkOverlay, setShowReplayBenchmarkOverlay] = useState(true);
  const [showFieldManualModal, setShowFieldManualModal] = useState(false);
  const [fieldManualSection, setFieldManualSection] = useState('doctrines');
  const [activeIronmanChallengeId, setActiveIronmanChallengeId] = useState(null);
  const [showTrailerPrevizModal, setShowTrailerPrevizModal] = useState(false);
  const [trailerShotIdx, setTrailerShotIdx] = useState(0);
  const [trailerAutoPlaying, setTrailerAutoPlaying] = useState(false);
  const [showMuseumCodexModal, setShowMuseumCodexModal] = useState(false);
  const [museumActiveGallery, setMuseumActiveGallery] = useState('portraits');
  const [museumSelectedExhibitId, setMuseumSelectedExhibitId] = useState('ex_shamil_denier');
  const [showDispatchesModal, setShowDispatchesModal] = useState(false);
  const [selectedDispatchId, setSelectedDispatchId] = useState('disp_sultan_abdulmejid_1853');
  const [feluccaEscortLevel, setFeluccaEscortLevel] = useState(1);
  const [diplomaticTone, setDiplomaticTone] = useState('protocol');
  const [executedDispatchesIds, setExecutedDispatchesIds] = useState([]);
  const [showReleaseHubModal, setShowReleaseHubModal] = useState(false);
  const [saveSlotsRefreshTick, setSaveSlotsRefreshTick] = useState(0);
  const [prologueRewardClaimed, setPrologueRewardClaimed] = useState(false);
  const [activeDivanPacket, setActiveDivanPacket] = useState(null);
  const [resolvedPacketIds, setResolvedPacketIds] = useState([]);
  const [delayedConsequences, setDelayedConsequences] = useState([]);
  const [campaignClimaxState, setCampaignClimaxState] = useState(null);
  const [climaxDismissed, setClimaxDismissed] = useState(false);
  const [deployedSector, setDeployedSector] = useState('blindage');
  const [lastBattleAfterActionReport, setLastBattleAfterActionReport] = useState(null);
  const [battleMemorials, setBattleMemorials] = useState(INITIAL_BATTLE_MEMORIALS);
  const [real3DTableMode, setReal3DTableMode] = useState(true);
  const [unlockedRelicIds, setUnlockedRelicIds] = useState(() => loadUnlockedRelicIds());
  const [activeRelicIds, setActiveRelicIds] = useState(() => loadActiveRelicIds());
  const activeRelicBonuses = useMemo(
    () => computeActiveRelicBonuses(activeRelicIds),
    [activeRelicIds]
  );
  const [heroArcsState, setHeroArcsState] = useState(() => createInitialHeroArcsState());
  const [activeHeroArcModal, setActiveHeroArcModal] = useState(null);
  const [episodesState, setEpisodesState] = useState(() => createInitialEpisodesState());
  const [activeEpisodeId, setActiveEpisodeId] = useState('ep_1845_dargo');
  const [activeEpisodeModal, setActiveEpisodeModal] = useState(false);
  const [capitalNaibateId, setCapitalNaibateId] = useState('vedeno');
  const [capitalLabelRu, setCapitalLabelRu] = useState('Дарго-Ведено');
  const [capitalLabelEn, setCapitalLabelEn] = useState('Dargo-Vedeno');
  const [imperialHeldIds, setImperialHeldIds] = useState([]);
  const [campaignHistoryLog, setCampaignHistoryLog] = useState([
    {
      turn: 1,
      seasonRu: 'Июнь 1845 г. (Джумада ас-сани 1261 г. х.)',
      seasonEn: 'June 1845 (Jumada al-Thani 1261 AH)',
      generalNameRu: 'Генерал-фельдмаршал князь М. С. Воронцов',
      generalNameEn: 'Field Marshal Prince Mikhail S. Vorontsov',
      vedenoPowder: 195,
      regionalPowder: INITIAL_NAIBATES.reduce((s, n) => s + n.gunpowder, 0),
      silver: 680,
      provisions: 1420,
      totalGarrison: INITIAL_NAIBATES.reduce((s, n) => s + n.garrison + n.murtazeks, 0),
      totalStress: 29,
      victoryScore: 76,
      siegesCount: INITIAL_NAIBATES.filter((n) => n.underSiege).length,
      eventRu: 'Начало кампании: созыв Государственного совета Диван-ханы в Дарго-Ведено',
      eventEn: 'Campaign Start: State Council Divan-Khana convened in Dargo-Vedeno'
    }
  ]);
  const [modSelectedNaibateId, setModSelectedNaibateId] = useState('khunzakh');
  const [modImportJsonText, setModImportJsonText] = useState('');
  const [modDraft, setModDraft] = useState({
    modId: 'custom_imamat_1845_mod',
    titleRu: 'Пользовательская кампания Диван-ханы (1845)',
    titleEn: 'Custom Divan-Khana Campaign (1845)',
    yearLabel: '1845 г. — Авторский сценарий (Mod)',
    yearLabelEn: '1845 — Custom Mod Scenario',
    generalIdx: 0,
    resources: {
      gunpowder: 195,
      provisions: 1420,
      silver: 680,
      authority: 86,
      ottomanSupport: 48
    },
    naibates: INITIAL_NAIBATES
  });
  const [playtestTelemetry, setPlaytestTelemetry] = useState({
    sessionId: `imamat-pt-${Date.now().toString(36)}`,
    minVedenoPowderPoods: 195,
    zulmatTriggeredCount: 0,
    glossaryOpenedCount: 0,
    totalEnvoysDispatched: 0,
    tier0_NoPowder: 0,
    tier15_LightPack: 0,
    tier30_Reinforced: 0,
    tier45_HeavyTrain: 0,
    envoysInterceptedCount: 0,
    naibOrdersObeyedCount: 0,
    naibOrdersRefusedCount: 0,
    dioramasEntered: 0,
    camoufletsDetonated: 0,
    gazyrDepletionMeleeTriggered: 0,
    totalPowderCapturedInTactics: 0
  });

  const [resources, setResources] = useState({
    gunpowder: 195,
    provisions: 1420,
    silver: 680,
    authority: 86,
    ottomanSupport: 48
  });

  const [naibates, setNaibates] = useState(INITIAL_NAIBATES);
  const [selectedNaibateId, setSelectedNaibateId] = useState('khunzakh');
  const [mapLayer, setMapLayer] = useState('realistic_3d');

  // СПРИНТ 24–27 (M24–M27): Состояние живого движения объектов, колонн РИ, караванов, кордонных крепостей, укреплений и погоды по рельефу SRTM (60 FPS)
  const [liveFieldUnits, setLiveFieldUnits] = useState(INITIAL_LIVE_FIELD_UNITS);
  const [liveImperialColumns, setLiveImperialColumns] = useState(INITIAL_IMPERIAL_COLUMNS);
  const [liveWeatherFronts, setLiveWeatherFronts] = useState(INITIAL_WEATHER_FRONTS);
  const [weatherOverlayEnabled, setWeatherOverlayEnabled] = useState(true);
  const [liveMapFortifications, setLiveMapFortifications] = useState(INITIAL_MAP_FORTIFICATIONS);
  const [selectedFortBlueprintId, setSelectedFortBlueprintId] = useState('abatis');
  const [fortBuildMode, setFortBuildMode] = useState(false);
  const [liveSupplyCaravans, setLiveSupplyCaravans] = useState(INITIAL_SUPPLY_CARAVANS);
  const [cordonFortresses, setCordonFortresses] = useState(INITIAL_CORDON_FORTRESSES);
  const [totalCaravansDelivered, setTotalCaravansDelivered] = useState(0);
  const [totalFortressesStormed, setTotalFortressesStormed] = useState(0);
  const [signalBeacons, setSignalBeacons] = useState(INITIAL_SIGNAL_BEACONS);
  const [deepRaidTargets, setDeepRaidTargets] = useState(INITIAL_DEEP_RAID_TARGETS);
  const [totalDeepRaidsCompleted, setTotalDeepRaidsCompleted] = useState(0);
  const [riverBridges, setRiverBridges] = useState(INITIAL_RIVER_BRIDGES);
  const [liveMuhtasibPatrols, setLiveMuhtasibPatrols] = useState(INITIAL_MUHTASIB_PATROLS);
  const [totalMuhtasibInspections, setTotalMuhtasibInspections] = useState(0);
  const [_totalBridgesBlown, setTotalBridgesBlown] = useState(0);
  const [liveMountainBatteries, setLiveMountainBatteries] = useState(INITIAL_MOUNTAIN_BATTERIES);
  const [liveTranshumanceFlocks, setLiveTranshumanceFlocks] = useState(INITIAL_TRANSHUMANCE_FLOCKS);
  const [totalBatterySalvos, setTotalBatterySalvos] = useState(0);
  const [totalFlockMigrations, setTotalFlockMigrations] = useState(0);
  const [sapperMines, setSapperMines] = useState(INITIAL_SAPPER_MINES);
  const [liveDiplomaticMissions, setLiveDiplomaticMissions] = useState(INITIAL_DIPLOMATIC_MISSIONS);
  const [totalMinesDetonatedOnMap, setTotalMinesDetonatedOnMap] = useState(0);
  const [totalDiplomaticMissionsArrived, setTotalDiplomaticMissionsArrived] = useState(0);
  const [fieldHospitals, setFieldHospitals] = useState(INITIAL_FIELD_HOSPITALS);
  const [livePrisonerConvoys, setLivePrisonerConvoys] = useState(INITIAL_PRISONER_EXCHANGES);
  const [totalWoundedRecoveredOnMap, setTotalWoundedRecoveredOnMap] = useState(0);
  const [totalPrisonerExchangesCompleted, setTotalPrisonerExchangesCompleted] = useState(0);
  const [powderMills, setPowderMills] = useState(INITIAL_POWDER_MILLS);
  const [kunakSpyRings, setKunakSpyRings] = useState(INITIAL_KUNAK_SPY_RINGS);
  const [liveImperialCouriers, setLiveImperialCouriers] = useState(INITIAL_IMPERIAL_COURIERS);
  const [totalMillBatchesProduced, setTotalMillBatchesProduced] = useState(0);
  const [totalCouriersIntercepted, setTotalCouriersIntercepted] = useState(0);
  const [forestClearings, setForestClearings] = useState(INITIAL_FOREST_CLEARINGS);
  const [liveMuhajirCaravans, setLiveMuhajirCaravans] = useState(INITIAL_MUHAJIR_CARAVANS);
  const [totalForestAmbushesTriggered, setTotalForestAmbushesTriggered] = useState(0);
  const [totalMuhajirCaravansSaved, setTotalMuhajirCaravansSaved] = useState(0);
  const [gameCameraTilt, setGameCameraTilt] = useState(true);
  const [showSchematicLabels, setShowSchematicLabels] = useState(false);
  const [hoveredMapInfo, setHoveredMapInfoRaw] = useState(null);
  const setHoveredMapInfo = useCallback((next) => {
    setHoveredMapInfoRaw((prev) => {
      const val = typeof next === 'function' ? next(prev) : next;
      if (!prev && !val) return prev;
      if (prev && val && prev.titleRu === val.titleRu && prev.detailRu === val.detailRu) return prev;
      return val;
    });
  }, []);
  const [commandDockTab, setCommandDockTab] = useState('units');
  const [animatedBattleVfx, setAnimatedBattleVfx] = useState(true);
  const [fullScreenTableMode, setFullScreenTableMode] = useState(false);
  const [dioramaTimeOfDay, setDioramaTimeOfDay] = useState('day');
  const [radialWheelTarget, setRadialWheelTarget] = useState(null);
  const [showThreatRadarOverlay, setShowThreatRadarOverlay] = useState(false);
  // Режим студии: инструменты продюсера (трейлер, релиз-хаб, питч-тур, телеметрия, моддинг, экспорт UE5) скрыты от игрока
  const [studioMode, setStudioMode] = useState(false);
  const [showHeaderArchiveMenu, setShowHeaderArchiveMenu] = useState(false);
  const [showMoreHeaderTabs, setShowMoreHeaderTabs] = useState(false);
  // Всплывающие цифры и трассы залпов появляются только в ответ на реальные события боя и сами исчезают
  const [floatingCombatPopups, setFloatingCombatPopups] = useState([]);
  const [liveCannonSmokePlumes, setLiveCannonSmokePlumes] = useState([]);
  const [activeTacticalEncounter, setActiveTacticalEncounter] = useState(null);
  const [liveSkirmishBursts, setLiveSkirmishBursts] = useState([]);
  const [totalMapInterceptions, setTotalMapInterceptions] = useState(0);
  const [selectedUnitId, setSelectedUnitId] = useState('unit_chapar_vedeno');
  const [terrainProbe, setTerrainProbe] = useState(() => sampleStrategicTerrain(225, 195));
  const [terrainSimSpeed, setTerrainSimSpeed] = useState(1.25);
  const liveUnitsRef = useRef(INITIAL_LIVE_FIELD_UNITS);
  const liveColumnsRef = useRef(INITIAL_IMPERIAL_COLUMNS);
  const liveWeatherRef = useRef(INITIAL_WEATHER_FRONTS);
  const liveFortsRef = useRef(INITIAL_MAP_FORTIFICATIONS);
  const signalBeaconsRef = useRef(INITIAL_SIGNAL_BEACONS);
  const riverBridgesRef = useRef(INITIAL_RIVER_BRIDGES);
  const sapperMinesRef = useRef(INITIAL_SAPPER_MINES);
  const fieldHospitalsRef = useRef(INITIAL_FIELD_HOSPITALS);
  const powderMillsRef = useRef(INITIAL_POWDER_MILLS);
  const forestClearingsRef = useRef(INITIAL_FOREST_CLEARINGS);
  const weatherEnabledRef = useRef(true);
  const lastSkirmishTimeRef = useRef({});
  const lastFortStrikeRef = useRef({});
  const lastCaravanEventRef = useRef({});
  const lastFortressAssaultRef = useRef({});
  const lastDeepRaidRef = useRef({});
  const lastBridgeDetourRef = useRef({});
  const lastMuhtasibInspectRef = useRef({});
  const lastBatterySalvoRef = useRef({});
  const lastFlockEventRef = useRef({});
  const lastMineDetonationRef = useRef({});
  const lastDipMissionRef = useRef({});
  const lastHospitalHealRef = useRef({});
  const lastPrisonerExchangeRef = useRef({});
  const lastMillPulseRef = useRef({});
  const lastCourierInterceptRef = useRef({});
  const lastForestAmbushRef = useRef({});
  const lastMuhajirEventRef = useRef({});
  const [unitMovementLog, setUnitMovementLog] = useState([
    {
      id: 'mv-init-0',
      time: '1845 • Кордонная линия',
      textRu: 'Разведка: Из кр. Грозной, Внезапной и Темир-Хан-Шуры выдвинулись 3 колонны РИ! Нажмите «⚔️ На перехват колонны» или кликните по колонне на карте!',
      textEn: 'Scout Alert: 3 Imperial columns have marched from Forts Groznaya, Vnezapnaya & Temir-Khan-Shura! Click any enemy column or “⚔️ Intercept Column” to engage!'
    },
    {
      id: 'mv-init-1',
      time: '1845 • Дарго-Ведено',
      textRu: 'Конный чапар Диван-ханы выступил из Ведено (225, 195) через Андийский перевал в Хунзах (410, 245).',
      textEn: 'Divan-Khana Mounted Chapar departed Vedeno (225, 195) across the Andi Pass toward Khunzakh (410, 245).'
    }
  ]);

  // Параметры снаряжения гонца
  const [selectedOrderType, setSelectedOrderType] = useState('raid');
  const [attachedPowder, setAttachedPowder] = useState(15);
  const [attachedSilver, setAttachedSilver] = useState(40);
  const [routeMode, setRouteMode] = useState('mountain_path');
  const [activeEnvoys, setActiveEnvoys] = useState([]);

  // Низамы, Судебные казусы и Треугольники соперничества наибов
  const [nizams, setNizams] = useState(INITIAL_NIZAMS);
  const [selectedPillar, setSelectedPillar] = useState('all');
  const [courtCases, setCourtCases] = useState(INITIAL_COURT_CASES);
  const [naibRivalries, setNaibRivalries] = useState(NAIB_RIVALRY_TRIANGLES);
  const [tableQuickDrawer, setTableQuickDrawer] = useState(null);

  // Тактический симулятор (Режим А: Осада Милютина / Режим Б: Лесной сплайн)
  const [tacticalMode, setTacticalMode] = useState('milyutin_siege');
  const [selectedSiegeZone, setSelectedSiegeZone] = useState('direct_battery');
  const [siegeState, setSiegeState] = useState({
    aulName: 'Аул Салты (Осада князя М. С. Воронцова)',
    aulNameEn: 'Aul of Salty (Prince M. S. Vorontsov’s Siege)',
    day: 14,
    wallIntegrity: 76,
    blindageLayers: 3,
    russianMineDistance: 9.5,
    counterMineProgress: 52,
    basinVibration: 'СЛЫШНЫ УДАРЫ КИРОК ПОД ЮЖНОЙ БАШНЕЙ (9.5 саж.)',
    basinVibrationEn: 'SAPPER PICKS HEARD BENEATH SOUTH TOWER (9.5 sazh.)',
    garrisonMorale: 92,
    russianMorale: 78,
    battleLog: [
      {
        ru: 'День 14-й осады: Настильная батарея русских бьёт в нижний обрыв скалы (мёртвая зона для 2-го и 3-го ярусов саклей).',
        en: 'Siege Day 14: Imperial flat-trajectory battery strikes the lower cliff face (dead zone shields the 2nd & 3rd saklya tiers).'
      },
      {
        ru: 'Инженер Хаджи-Юсуф Сафаров установил медный таз с водой в подвале башни: колебания воды выдали направление русского минного подкопа!',
        en: 'Engineer Hajji Yusuf Safarov placed a copper water basin in the tower cellar: water ripples exposed the enemy sapper gallery!'
      }
    ]
  });

  const [splineSegments, setSplineSegments] = useState(INITIAL_SPLINE_SEGMENTS);
  const [splineEchelons, setSplineEchelons] = useState(INITIAL_SPLINE_ECHELONS);
  const [selectedSplineIdx, setSelectedSplineIdx] = useState(1);
  const [ambushStep, setAmbushStep] = useState(1);
  const [ambushLog, setAmbushLog] = useState([
    {
      ru: '10 июля 1845 г.: Колонна «Сухарной экспедиции» ген. Клюгенау, Викторова и Пассека растянулась на 5 вёрст по лесному гребню от горы Речель к Дарго.',
      en: 'July 10, 1845: The “Biscuit Expedition” column under Gens. Klugenau, Viktorov, and Passek stretches 5 versts along the forest ridge from Mt. Rechel toward Dargo.'
    }
  ]);

  // Активный ИИ Кавказского корпуса и Арсенал Ведено
  const [imperialAi, setImperialAi] = useState({
    generalIdx: 0,
    targetNaibateId: 'karata',
    turnsUntilStrike: 2,
    columnStrength: 4200,
    scouted: true,
    aiDoctrineLocked: false
  });

  const [arsenalItems, setArsenalItems] = useState(INITIAL_ARSENAL_ITEMS);
  const [crises, setCrises] = useState(INITIAL_HISTORICAL_CRISES);
  const [ueExportFormat, setUeExportFormat] = useState('json');
  const [zulmatClearedCount, setZulmatClearedCount] = useState(0);

  // Состояние ИИ-симулятора Монте-Карло (Этап 4: Балансировка) и Исторического Эпилога
  const [simRunsCount, setSimRunsCount] = useState(100);
  const [simDifficultyWeight, setSimDifficultyWeight] = useState(1.0);
  const [monteCarloReport, setMonteCarloReport] = useState({
    runs: 100,
    survivalRate: 68,
    avgFinalStress: 54,
    powderBottleneckRate: 41,
    mostRebelliousNaib: 'Султан Даниял-бек Илисуйский (Ириб) — 24% отказов без субсидий',
    mostRebelliousNaibEn: 'Sultan Daniyal-Bek of Elisu (Irib) — 24% refusal rate without subsidies',
    mostStalwartNaib: 'Байсунгур Беноевский (Ичкерия) — 99.4% выполнения приказов',
    mostStalwartNaibEn: 'Baysungur of Benoy (Ichkeria) — 99.4% order obedience rate',
    recommendedBalanceNote:
      'Баланс эталонный: принятие Низама о мухтасибах и постройка селитренных варниц Хаджи-Юсуфа повышают выживаемость Имамата на +23%.',
    recommendedBalanceNoteEn:
      'Gold-standard balance: enacting the Muhtasib Nizam and building Hajji Yusuf’s saltpeter works increase Imamate survival by +23%.'
  });
  const [epilogueDecisionsMade, setEpilogueDecisionsMade] = useState({});

  // Состояние режима «Executive Publisher Auto-Tour» (Milestone M11)
  const [pitchTour, setPitchTour] = useState({
    active: false,
    stepIdx: 0,
    autoAdvance: true
  });

  // Оперативный бюджет приказов Диван-ханы на один ход (ограничение действий за сезон)
  const [turnActionQuota, setTurnActionQuota] = useState({
    sealsRemaining: 3,
    maxSeals: 3,
    envoysSent: 0,
    maxEnvoysPerTurn: 2,
    nizamsEnacted: 0,
    maxNizamsPerTurn: 1,
    courtCasesResolved: 0,
    maxCourtCasesPerTurn: 1,
    stateOrdersUsed: 0,
    maxStateOrdersPerTurn: 1,
    tacticalMovesUsed: 0,
    maxTacticalMovesPerTurn: 4,
    crisesResolved: 0,
    maxCrisesPerTurn: 1
  });

  // Состояние «Режима Наблюдателя / ИИ-Полководца» (Spectator AI Commander Mode)
  const [spectatorMode, setSpectatorMode] = useState({
    active: false,
    autoPlay: false,
    stepIdx: 0,
    doctrineId: 'historical',
    actLabelRu: 'АКТ I (1839–1845) • СУХАРНАЯ ЭКСПЕДИЦИЯ И СОЗЫВ ДИВАН-ХАНЫ',
    actLabelEn: 'ACT I (1839–1845) • THE BISCUIT EXPEDITION & DIVAN-KHANA COUNCIL',
    speakerNameRu: 'Имам Шамиль • Государственный совет Диван-ханы',
    speakerNameEn: 'Imam Shamil • State Council of Divan-Khana',
    speakerPortraitKey: 'Шамиль',
    titleRu: 'Режим Наблюдателя: ИИ-Полководец готов вести кампанию',
    titleEn: 'Spectator Mode: AI Commander Ready to Lead the Campaign',
    descRu:
      'Вы наблюдаете за ходом кампании из зала Диван-ханы. Нажимайте «⚡ Сделать следующий ход ИИ» или включите «▶ Авто-ход (4.5с)», чтобы ИИ-Полководец сам отдавал приказы наибам, принимал законы Низама, вёл осады и проходил все 5 актов Кавказской драмы.',
    descEn:
      'You are observing the campaign from the Divan-Khana council hall. Click “⚡ Execute Next AI Move” or toggle “▶ Auto-Play (4.5s)” to watch the AI Commander issue orders, enact Nizams, fight sieges, and play through all 5 acts of the Caucasian drama.',
    imperialResponseRu:
      'Штаб в Тифлисе (М. С. Воронцов): 10-тысячная колонна выступила из Внезапной через перевал Кырк к старому Дарго.',
    imperialResponseEn:
      'Tiflis HQ (Prince Vorontsov): A 10,000-strong column marched from Fort Vnezapnaya across Kirk Pass toward old Dargo.'
  });
  const executeSpectatorMoveRef = useRef(null);

  const PUBLISHER_TOUR_STEPS = useMemo(
    () => [
      {
        id: 'tour_map',
        tab: 'map',
        badgeRu: 'Остановка 1/5 • Ядро Стратегии и Психологии',
        badgeEn: 'Stop 1/5 • Strategy & Psychology Core',
        titleRu: 'Командный стол Диван-ханы: 10 Наибств и непрямые приказы (FOrderProbabilityBreakdown)',
        titleEn: 'Divan-Khana Command Table: 10 Naibates & Indirect Orders (FOrderProbabilityBreakdown)',
        descRu:
          'Вместо прямого RTS-клик-контроля игрок управляет горскими губернаторами (наибами) через конных гонцов. Вероятность повиновения P(Obey) рассчитывается в реальном времени из Имана, Смелости, Алчности, Гордыни и калибра порохового обоза (0/15/30/45 пудов).',
        descEn:
          'Instead of direct RTS unit clicking, the player governs 10 autonomous Naibs via mounted envoys. Obedience probability P(Obey) is computed live from Iman, Courage, Greed, Pride, and gunpowder convoy tier (0/15/30/45 poods).',
        kpiHighlightRu: 'Проверено 4 000 прогонами Монте-Карло • Перехват обозов: 9.8%–29.9%',
        kpiHighlightEn: 'Validated across 4,000 Monte Carlo campaigns • Convoy Interception: 9.8%–29.9%'
      },
      {
        id: 'tour_nizams',
        tab: 'nizams',
        badgeRu: 'Остановка 2/5 • Законодательство и Шариатский Суд',
        badgeEn: 'Stop 2/5 • Statecraft & Sharia vs. Adat Court',
        titleRu: 'Кодекс 12 Низамов Шамиля и 6 исторических судебных казусов',
        titleEn: 'Shamil’s Code of 12 Nizams & 6 Historical Court Cases',
        descRu:
          'Принятие государственных реформ (Тайные мухтасибы, Запрет кровной мести Канлы, Селитренные варницы) срезает штрафы Алчности и Гордыни наибов до -70% и предотвращает паралич власти («Зульмат»).',
        descEn:
          'Enacting state reforms (Secret Muhtasib Inspectors, Abolition of Kanly Blood Feuds, Saltpeter Works) cuts Naib Greed and Pride penalties by up to -70% and prevents command paralysis (“Zulmat”).',
        kpiHighlightRu: 'Выживаемость без Низамов: 0% • С Кодексом Низамов: до 100.0%',
        kpiHighlightEn: 'Survival without Nizams: 0% • With Nizam Reforms: up to 100.0%'
      },
      {
        id: 'tour_siege',
        tab: 'siege',
        badgeRu: 'Остановка 3/5 • Тактическая Диорама и 18 Газырей',
        badgeEn: 'Stop 3/5 • Tactical Siege Diorama & 18 Gazyrs',
        titleRu: 'Инженерная война Хаджи-Юсуфа Сафарова и патронташ на 18 нагрудных газырей',
        titleEn: 'Hajji Yusuf Safarov’s Counter-Mine Warfare & 18-Cartridge Chest Bandolier',
        descRu:
          'Бесшовный мост FTacticalBattleContext <-> FTacticalBattleResult: медный таз с водой пеленгует русские сапы для подрыва камуфлетов, а исчерпание 18 нагрудных газырей (0/18) переводит мюридов в яростный кинжальный прорыв (+35% натиска).',
        descEn:
          'Seamless FTacticalBattleContext <-> FTacticalBattleResult bridge: a water-filled copper basin detects enemy sapper tunnels for camouflet blasts, while depleting all 18 chest gazyrs (0/18) triggers a fierce Bazalai dagger charge (+35% shock).',
        kpiHighlightRu: 'Конверсия в кинжальный бой при 0/18 газырях: 55.3% в когорте плейтеста',
        kpiHighlightEn: '0/18 Gazyr Melee Trigger Rate: 55.3% across playtest cohort'
      },
      {
        id: 'tour_3d',
        tab: '3d_tactical',
        badgeRu: 'Остановка 4/5 • 3D-Рельеф SRTM и Срез Милютина',
        badgeEn: 'Stop 4/5 • 3D SRTM Relief & Milyutin Cutaway',
        titleRu: 'Интерактивный 3D-полигон Кавказа: «Мёртвая зона» настильного огня (15° против 58°)',
        titleEn: 'Interactive 3D Caucasus Arena: Direct-Fire “Dead Zone” (15° vs. 58° Ballistics)',
        descRu:
          'Геометрический парадокс горных аулов по чертежам полковника Д. А. Милютина: ядра настильных единорогов (15°) врезаются в известняковый обрыв, тогда как навесные бомбы мортир (58°) гасятся 3-слойными дубовыми блиндажами.',
        descEn:
          'Col. D. A. Milyutin’s geometric paradox in live 3D: flat-trajectory 15° Unicorn shells strike the limestone cliff base, while plunging 58° mortar bombs are absorbed by 3-layer oak log blindages.',
        kpiHighlightRu: '20 реальных 16-битных карт высот NASA SRTM (2017×2017 .r16 / .png)',
        kpiHighlightEn: '20 authentic 16-bit NASA SRTM heightmaps (2017×2017 .r16 / .png)'
      },
      {
        id: 'tour_roi',
        tab: 'sim_epilogue',
        badgeRu: 'Остановка 5/5 • Готовность к Релизу и ROI Издателя',
        badgeEn: 'Stop 5/5 • Release Readiness & Publisher ROI',
        titleRu: 'Сертификат целостности PASS (7/7), бюджет $240,000 и окупаемость на 23,188 копиях',
        titleEn: 'Integrity Certificate PASS (7/7), $240,000 Budget & 23,188-Unit Break-Even',
        descRu:
          'Полный пакет UE 5.5 C++20/HLSL, 12 достижений Steamworks VDF, когортный отчёт телеметрии (PASS 5/5 KPI) и автономный двуязычный билд. Точка безубыточности при цене $24.99 — всего 23 188 проданных копий (Base Case ROI: +169.9%).',
        descEn:
          'Complete UE 5.5 C++20/HLSL engineering package, 12 Steamworks VDF achievements, cohort telemetry gate (PASS 5/5 KPIs), and standalone bilingual build. Break-even at $24.99 is just 23,188 units (Base Case ROI: +169.9%).',
        kpiHighlightRu: 'Чистая выручка Base Case (75k копий): $971,563 • Консервативный ROI: +34.9%',
        kpiHighlightEn: 'Base Case Net Revenue (75k units): $971,563 • Conservative ROI: +34.9%'
      }
    ],
    []
  );

  // Состояние Вкладки 10: Архив личностей и Баллистический калькулятор газырей
  const [selectedFigureId, setSelectedFigureId] = useState('shamil_1859');
  const [activatedFigurePerks, setActivatedFigurePerks] = useState(['shamil_1859']);
  const [ballisticsConfig, setBallisticsConfig] = useState({
    gazyrCount: 18,
    distanceSteps: 280,
    elevationDeg: 38,
    slopeDeg: 65,
    weaponType: 'crimean_miquelet'
  });

  // ============================================================================
  // СОСТОЯНИЕ ВКЛАДКИ 11: ИНТЕРАКТИВНЫЙ 3D-ПОЛИГОН И ГЕОДЕЗИЧЕСКИЙ РАЗРЕЗ СКАЛЫ
  // ============================================================================
  const canvas3DRef = useRef(null);
  const dragStateRef = useRef({
    isDragging: false,
    lastX: 0,
    lastY: 0
  });
  const projectilesRef = useRef([]);
  const explosionsRef = useRef([]);

  const [selected3DTerrainId, setSelected3DTerrainId] = useState('salty_1847');
  const [siegeInline3D, setSiegeInline3D] = useState(true);
  const [cam3D, setCam3D] = useState({
    yaw: -0.54,
    pitch: 0.44,
    zoom: 1.18,
    cutawayRatio: 0.98,
    showWireframeContours: false,
    showDeadZoneCone: false,
    autoRotate: false
  });
  const [mortarAngle3D, setMortarAngle3D] = useState(58);
  const [unicornAngle3D, setUnicornAngle3D] = useState(15);
  const [stats3D, setStats3D] = useState({
    mortarHits: 0,
    deadZoneBlocked: 0,
    camoufletsDetonated: 0,
    lastShotReport:
      'Готовность 3D-полигона: вращайте рельеф мышью или пальцем, двигайте плоскость разреза Милютина и испытывайте баллистику.',
    lastShotReportEn:
      '3D Range Ready: orbit the terrain with mouse or touch, slide Milyutin’s cutaway plane, and test mountain ballistics.'
  });

  const active3DTerrain = useMemo(
    () =>
      TACTICAL_3D_TERRAINS.find((t) => t.id === selected3DTerrainId) ||
      TACTICAL_3D_TERRAINS[0],
    [selected3DTerrainId]
  );

  // Запуск 3D-снаряда (навесная пудовая мортира / настильный горный единорог / штуцерный залп)
  const handleLaunch3DProjectile = (shotType) => {
    playHistoricalSound(shotType === 'camouflet_3d' ? 'cannon' : 'cannon', soundEnabled);

    if (shotType === 'camouflet_3d') {
      explosionsRef.current.push({
        x: 0.8,
        y: -1.1,
        z: 0.0,
        radius: 0.2,
        maxRadius: 3.4,
        alpha: 1.0,
        color: '#f59e0b',
        isUnderground: true
      });
      handleTacticalAction('camouflet');
      setStats3D((prev) => ({
        ...prev,
        camoufletsDetonated: prev.camoufletsDetonated + 1,
        lastShotEvent: {
          seq: (prev.lastShotEvent?.seq || 0) + 1,
          type: 'camouflet_3d',
          angleDeg: 0,
          ts: Date.now()
        },
        lastShotReport:
          lang === 'en'
            ? 'SUBTERRANEAN CAMOUFLET DETONATED IN 3D CUTAWAY! Hajji Yusuf Safarov’s counter-mine collapsed the Russian sap gallery.'
            : 'ПОДЗЕМНЫЙ ВЗРЫВ КАМУФЛЕТА В 3D-РАЗРЕЗЕ! Встречный горн Хаджи-Юсуфа Сафарова обрушил свод русской сапёрной галереи.'
      }));
      return;
    }

    const isMortar = shotType === 'mortar_3d';
    const angleDeg = isMortar ? mortarAngle3D : unicornAngle3D;
    const speed = isMortar ? 0.26 : 0.38;
    const rad = (angleDeg * Math.PI) / 180;
    const blockedByDeadZone = !isMortar && angleDeg < (active3DTerrain?.deadZoneAngleDeg ?? 28);

    // В режиме WebGL2 (когда 2D-fallback холст не смонтирован) сразу фиксируем событие выстрела и телеметрию попадания
    if (!canvas3DRef.current) {
      setStats3D((prev) => ({
        ...prev,
        mortarHits: blockedByDeadZone ? prev.mortarHits : prev.mortarHits + 1,
        deadZoneBlocked: blockedByDeadZone ? prev.deadZoneBlocked + 1 : prev.deadZoneBlocked,
        lastShotEvent: {
          seq: (prev.lastShotEvent?.seq || 0) + 1,
          type: shotType,
          angleDeg,
          blockedByDeadZone,
          ts: Date.now()
        },
        lastShotReport: blockedByDeadZone
          ? lang === 'en'
            ? `Mountain Unicorn cannonball (${angleDeg}°) struck the sheer limestone cliff! Tier II & III saklyas remain inside the DEAD ZONE.`
            : `Ядро горного единорога (${angleDeg}°) врезалось в отвесный известняковый обрыв! Сакли 2-го и 3-го яруса остались в МЁРТВОЙ ЗОНЕ рельефа.`
          : lang === 'en'
          ? `Plunging pood mortar bomb (${angleDeg}°) cleared the cliff crest and detonated atop the timber blindage (${siegeState.blindageLayers} oak layers absorbed the blast).`
          : `Навесная пудовая бомба (${angleDeg}°) перелетела гребень скалы и разорвалась на бревенчатом накате блиндажа (${siegeState.blindageLayers} слоя брёвен погасили удар).`
      }));
    }

    projectilesRef.current.push({
      id: Date.now() + Math.random(),
      type: shotType,
      x: 7.4,
      y: -1.45,
      z: isMortar ? -1.4 : 1.2,
      vx: -Math.cos(rad) * speed,
      vy: Math.sin(rad) * speed * (isMortar ? 1.32 : 0.52),
      vz: isMortar ? 0.035 : -0.02,
      gravity: isMortar ? 0.0082 : 0.0032,
      trail: [],
      color: isMortar ? '#fbbf24' : '#ef4444'
    });
  };

  // Программная функция высоты рельефа Кавказа H(x, z) на основе профиля SRTM
  const sampleMountainHeight = useMemo(() => {
    return (x, z) => {
      const steep = active3DTerrain.cliffSteepness;
      const gorge = active3DTerrain.gorgeDepth;

      // Скальное плато аула в левой части (-6 .. +1.8), крутой обрыв в центре (+1.8 .. +3.8) и осадная долина справа
      const plateauFactor = 1.0 / (1.0 + Math.exp((x - 1.35) * (1.55 * steep)));
      let h = -1.6 + plateauFactor * 4.45 * steep;

      // Террасные ступени аула (3–4 яруса каменных саклей)
      if (x < 1.5 && x > -5.5) {
        const steps = active3DTerrain.terraceSteps;
        h = Math.floor(h * steps) / steps + 0.25 * Math.sin(x * 0.9) * Math.cos(z * 0.8);
      }

      // Глубокий каньон реки Койсу у подножия скалы (x ~ -6.5 .. -4.8)
      const riverCanyon = Math.exp(-Math.pow((x + 6.2) * 0.9, 2)) * 2.4 * gorge;
      h -= riverCanyon;

      // Боковые скальные гребни ущелья по оси Z
      const ridgeWave = 0.38 * Math.cos(z * 0.55) + 0.22 * Math.sin(x * 0.45 + z * 0.5);
      return h + ridgeWave;
    };
  }, [active3DTerrain]);

  // 60-FPS 3D-рендеринг полигона, разреза скалы Милютина, подземной минной галереи и баллистики
  useEffect(() => {
    const is3DVisible =
      activeTab === '3d_tactical' ||
      (activeTab === 'siege' && siegeInline3D && tacticalMode === 'milyutin_siege');
    if (!is3DVisible) return undefined;
    const canvas = canvas3DRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let animFrameId;
    let currentYaw = cam3D.yaw;

    const renderLoop = () => {
      const nowMs = Date.now();
      if (cam3D.autoRotate && !dragStateRef.current.isDragging) {
        currentYaw += 0.0042;
      } else {
        currentYaw = cam3D.yaw;
      }

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // 1. Атмосферное кавказское горное небо с низким закатно-золотистым солнцем и альпийской дымкой
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#0a1220');
      skyGrad.addColorStop(0.28, '#172740');
      skyGrad.addColorStop(0.54, '#2d3b4e');
      skyGrad.addColorStop(0.76, '#3d352e');
      skyGrad.addColorStop(1, '#12100e');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Мягкое солнечное гало со стороны высокогорных хребтов Дагестана
      const sunX = width * 0.22;
      const sunY = height * 0.19;
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, width * 0.34);
      sunGlow.addColorStop(0, 'rgba(254, 243, 199, 0.42)');
      sunGlow.addColorStop(0.32, 'rgba(251, 191, 36, 0.16)');
      sunGlow.addColorStop(0.7, 'rgba(180, 83, 9, 0.05)');
      sunGlow.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = sunGlow;
      ctx.fillRect(0, 0, width, height * 0.65);

      // Далёкие заснеженные пики Главного Кавказского хребта (задний план)
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, height * 0.36);
      const farPeaks = [
        [0.05, 0.25],
        [0.14, 0.18],
        [0.23, 0.26],
        [0.33, 0.14],
        [0.44, 0.24],
        [0.56, 0.12],
        [0.68, 0.23],
        [0.8, 0.16],
        [0.91, 0.25],
        [1.0, 0.19]
      ];
      farPeaks.forEach(([rx, ry]) => ctx.lineTo(width * rx, height * ry));
      ctx.lineTo(width, height * 0.46);
      ctx.lineTo(0, height * 0.46);
      ctx.closePath();
      const peakGrad = ctx.createLinearGradient(0, height * 0.12, 0, height * 0.44);
      peakGrad.addColorStop(0, 'rgba(241, 245, 249, 0.34)');
      peakGrad.addColorStop(0.38, 'rgba(148, 163, 184, 0.22)');
      peakGrad.addColorStop(1, 'rgba(30, 41, 59, 0.04)');
      ctx.fillStyle = peakGrad;
      ctx.fill();

      // Средний план отрогов в сизой пороховой и горной дымке
      ctx.beginPath();
      ctx.moveTo(0, height * 0.42);
      const midRidges = [
        [0.1, 0.31],
        [0.24, 0.35],
        [0.39, 0.27],
        [0.52, 0.34],
        [0.66, 0.28],
        [0.82, 0.35],
        [1.0, 0.29]
      ];
      midRidges.forEach(([rx, ry]) => ctx.lineTo(width * rx, height * ry));
      ctx.lineTo(width, height * 0.52);
      ctx.lineTo(0, height * 0.52);
      ctx.closePath();
      const midGrad = ctx.createLinearGradient(0, height * 0.27, 0, height * 0.52);
      midGrad.addColorStop(0, 'rgba(71, 85, 105, 0.36)');
      midGrad.addColorStop(1, 'rgba(28, 25, 23, 0.08)');
      ctx.fillStyle = midGrad;
      ctx.fill();
      ctx.restore();

      const cosY = Math.cos(currentYaw);
      const sinY = Math.sin(currentYaw);
      const cosP = Math.cos(cam3D.pitch);
      const sinP = Math.sin(cam3D.pitch);
      const fovScale = 435 * cam3D.zoom;

      // 3D -> 2D матричная перспективная проекция
      const project3D = (wx, wy, wz) => {
        const rx = wx * cosY - wz * sinY;
        const rz = wx * sinY + wz * cosY;
        const ry = wy * cosP - rz * sinP;
        const depth = wy * sinP + rz * cosP + 22.5;
        const invZ = fovScale / Math.max(2.0, depth);
        return {
          sx: width * 0.5 + rx * invZ,
          sy: height * 0.55 - ry * invZ,
          depth,
          scale: invZ
        };
      };

      // 2. Высокодетализированный скульптурный рельеф (step = 0.52) без грубых CAD-швов
      const maxZLimit = -6.0 + cam3D.cutawayRatio * 14.0;
      const step = 0.52;
      const quads = [];

      // Вектор солнца (сверху-слева-сзади в сторону известнякового обрыва)
      const sunDirX = -0.56;
      const sunDirY = 0.74;
      const sunDirZ = -0.37;

      for (let x = -7.5; x < 7.5; x += step) {
        for (let z = -6.0; z < maxZLimit; z += step) {
          const zNext = Math.min(z + step, maxZLimit);
          const xNext = Math.min(x + step, 7.5);
          const dzActual = Math.max(0.08, zNext - z);
          const dxActual = Math.max(0.08, xNext - x);

          const y00 = sampleMountainHeight(x, z);
          const y10 = sampleMountainHeight(xNext, z);
          const y11 = sampleMountainHeight(xNext, zNext);
          const y01 = sampleMountainHeight(x, zNext);

          const p00 = project3D(x, y00, z);
          const p10 = project3D(xNext, y10, z);
          const p11 = project3D(xNext, y11, zNext);
          const p01 = project3D(x, y01, zNext);

          const avgY = (y00 + y10 + y11 + y01) * 0.25;
          const dxH = (y10 - y00 + (y11 - y01)) * (0.5 / dxActual);
          const dzH = (y01 - y00 + (y11 - y10)) * (0.5 / dzActual);
          const slopeMag = Math.hypot(dxH, dzH);
          const avgDepth = (p00.depth + p10.depth + p11.depth + p01.depth) * 0.25;

          // Нормаль грани n = normalize(-dxH, 1, -dzH) и ламбертово + полусферическое небесное освещение
          const invNorm = 1.0 / Math.sqrt(dxH * dxH + 1.0 + dzH * dzH);
          const nx = -dxH * invNorm;
          const ny = invNorm;
          const nz = -dzH * invNorm;
          const nDotL = Math.max(0, nx * sunDirX + ny * sunDirY + nz * sunDirZ);
          const skyAmbient = 0.36 + 0.22 * ny;
          const shade = Math.max(0.46, Math.min(1.34, skyAmbient + nDotL * 0.78));
          const fogFactor = Math.max(0, Math.min(0.28, (avgDepth - 24.5) * 0.018));

          const tint = (r, g, b) => {
            const litR = r * shade * (1 - fogFactor) + 52 * fogFactor;
            const litG = g * shade * (1 - fogFactor) + 64 * fogFactor;
            const litB = b * shade * (1 - fogFactor) + 82 * fogFactor;
            return `rgb(${Math.min(255, Math.round(litR))}, ${Math.min(255, Math.round(litG))}, ${Math.min(255, Math.round(litB))})`;
          };

          let fillCol;
          if (x < -4.95 && avgY < -1.68) {
            // Бурный бирюзовый поток Андийского / Аварского Койсу с пеной на порогах
            const wave = Math.sin(nowMs * 0.0045 + z * 2.4 + x * 1.5);
            const foam = wave > 0.42 ? 38 : wave > 0.1 ? 14 : 0;
            fillCol = tint(22 + foam, 132 + foam, 168 + foam);
          } else if (slopeMag > 1.24) {
            // Отвесный дагестанский слоистый известняк (тёплая охра и светлый доломит)
            const strataBand = Math.sin(avgY * 5.6 + x * 0.45) * 11;
            fillCol = tint(136 + strataBand, 121 + strataBand * 0.85, 98 + strataBand * 0.7);
          } else if (avgY > 1.48 && x < 1.55) {
            // Верхнее террасное плато аула (сухая каменная кладка и вытоптанный сланец)
            const terraceVar = ((Math.floor((x + 8) * 2) + Math.floor((z + 8) * 2)) % 2) * 6;
            fillCol = tint(114 + terraceVar, 98 + terraceVar, 74 + terraceVar);
          } else if (x > 2.25) {
            // Осадная долина: субальпийский дёрн + рыжие земляные брустверы русских сап
            const inSapperTrenchZone = Math.abs(z - 0.1) < 0.85 && x > 2.35 && x < 6.0;
            if (inSapperTrenchZone) {
              fillCol = tint(98, 76, 52);
            } else {
              const grassVar = Math.sin(x * 1.3 + z * 1.1) * 6;
              fillCol = tint(62 + grassVar, 84 + grassVar, 54);
            }
          } else {
            // Каменистые осыпи и склоны предгорья
            fillCol = tint(86, 78, 66);
          }

          quads.push({
            p00,
            p10,
            p11,
            p01,
            avgDepth,
            fillCol,
            avgY
          });
        }
      }

      // Сортировка полигонов рельефа по глубине (алгоритм художника)
      quads.sort((a, b) => b.avgDepth - a.avgDepth);

      const showMesh = Boolean(cam3D.showWireframeContours);
      quads.forEach((q) => {
        ctx.beginPath();
        ctx.moveTo(q.p00.sx, q.p00.sy);
        ctx.lineTo(q.p10.sx, q.p10.sy);
        ctx.lineTo(q.p11.sx, q.p11.sy);
        ctx.lineTo(q.p01.sx, q.p01.sy);
        ctx.closePath();
        ctx.fillStyle = q.fillCol;
        ctx.fill();

        if (showMesh) {
          ctx.strokeStyle =
            q.avgY > 1.5 ? 'rgba(251, 191, 36, 0.24)' : 'rgba(214, 211, 209, 0.14)';
          ctx.lineWidth = 0.55;
          ctx.stroke();
        } else {
          // Бесшовная спайка смежных граней тем же цветом заливки (0 пиксельных зазоров и 0 CAD-сетки)
          ctx.strokeStyle = q.fillCol;
          ctx.lineWidth = 0.65;
          ctx.stroke();
        }
      });

      // Лёгкая туманная дымка на дне каньона реки Койсу
      const canyonMistCenter = project3D(-5.8, -1.5, 0);
      const mistGrad = ctx.createRadialGradient(
        canyonMistCenter.sx,
        canyonMistCenter.sy,
        6,
        canyonMistCenter.sx,
        canyonMistCenter.sy,
        95 * cam3D.zoom
      );
      mistGrad.addColorStop(0, 'rgba(186, 230, 253, 0.16)');
      mistGrad.addColorStop(1, 'rgba(186, 230, 253, 0)');
      ctx.fillStyle = mistGrad;
      ctx.beginPath();
      ctx.arc(canyonMistCenter.sx, canyonMistCenter.sy, 95 * cam3D.zoom, 0, Math.PI * 2);
      ctx.fill();

      // 3. Передняя стенка ГЕОДЕЗИЧЕСКОГО РАЗРЕЗА СКАЛЫ МИЛЮТИНА (при Z = maxZLimit) с осадочными породами
      ctx.beginPath();
      const baseCutY = -3.45;
      const firstBottom = project3D(-7.5, baseCutY, maxZLimit);
      ctx.moveTo(firstBottom.sx, firstBottom.sy);
      for (let x = -7.5; x <= 7.5; x += 0.28) {
        const topP = project3D(x, sampleMountainHeight(x, maxZLimit), maxZLimit);
        ctx.lineTo(topP.sx, topP.sy);
      }
      const lastBottom = project3D(7.5, baseCutY, maxZLimit);
      ctx.lineTo(lastBottom.sx, lastBottom.sy);
      ctx.closePath();
      const cutGrad = ctx.createLinearGradient(0, height * 0.32, 0, height * 0.88);
      cutGrad.addColorStop(0, 'rgba(92, 77, 60, 0.97)');
      cutGrad.addColorStop(0.38, 'rgba(63, 52, 41, 0.98)');
      cutGrad.addColorStop(0.75, 'rgba(39, 32, 26, 0.99)');
      cutGrad.addColorStop(1, 'rgba(22, 18, 15, 0.99)');
      ctx.fillStyle = cutGrad;
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Слои известняка, сланца и песчаника на геологическом срезе
      [-0.25, -0.85, -1.45, -2.1, -2.75].forEach((layerY, lIdx) => {
        ctx.beginPath();
        for (let x = -7.0; x <= 7.0; x += 0.5) {
          const surfY = sampleMountainHeight(x, maxZLimit);
          const clampedY = Math.min(surfY - 0.16, layerY + Math.sin(x * 0.85 + lIdx * 1.3) * 0.09);
          const lp = project3D(x, clampedY, maxZLimit + 0.02);
          if (x === -7.0) ctx.moveTo(lp.sx, lp.sy);
          else ctx.lineTo(lp.sx, lp.sy);
        }
        ctx.strokeStyle = lIdx % 2 === 0 ? 'rgba(214, 211, 209, 0.22)' : 'rgba(180, 83, 9, 0.2)';
        ctx.lineWidth = 1.05;
        ctx.stroke();
      });

      // 4. Подземные минные галереи в плоскости разреза с дубовыми крепями и масляными фонарями
      const sapperHeadX = 1.0 + (siegeState.russianMineDistance - 1.5) * 0.32;
      const sapStart = project3D(5.8, -1.25, maxZLimit + 0.08);
      const sapEnd = project3D(sapperHeadX, -1.15, maxZLimit + 0.08);

      // Тёмный свод русской минной галереи + контурная подсветка
      ctx.beginPath();
      ctx.moveTo(sapStart.sx, sapStart.sy);
      ctx.lineTo(sapEnd.sx, sapEnd.sy);
      ctx.strokeStyle = '#14110f';
      ctx.lineWidth = 11 * cam3D.zoom;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.82)';
      ctx.lineWidth = 2.6;
      ctx.stroke();

      // Деревянные стойки сапёрной крепи и тёплый свет фонарей в забое
      for (let tx = 5.5; tx >= sapperHeadX; tx -= 0.55) {
        const tp = project3D(tx, -1.2, maxZLimit + 0.09);
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 2.1;
        ctx.beginPath();
        ctx.moveTo(tp.sx, tp.sy - 5 * cam3D.zoom);
        ctx.lineTo(tp.sx, tp.sy + 5 * cam3D.zoom);
        ctx.stroke();
      }
      const sapLanternGlow = ctx.createRadialGradient(
        sapEnd.sx,
        sapEnd.sy,
        1,
        sapEnd.sx,
        sapEnd.sy,
        22 * cam3D.zoom
      );
      sapLanternGlow.addColorStop(0, 'rgba(254, 240, 138, 0.72)');
      sapLanternGlow.addColorStop(0.45, 'rgba(245, 158, 11, 0.25)');
      sapLanternGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = sapLanternGlow;
      ctx.beginPath();
      ctx.arc(sapEnd.sx, sapEnd.sy, 22 * cam3D.zoom, 0, Math.PI * 2);
      ctx.fill();

      // Контрминная галерея защитников Хаджи-Юсуфа Сафарова с пороховым горном
      const counterStart = project3D(-0.95, -1.05, maxZLimit + 0.08);
      const counterEnd = project3D(0.95, -1.12, maxZLimit + 0.08);
      ctx.beginPath();
      ctx.moveTo(counterStart.sx, counterStart.sy);
      ctx.lineTo(counterEnd.sx, counterEnd.sy);
      ctx.strokeStyle = '#14110f';
      ctx.lineWidth = 10.5 * cam3D.zoom;
      ctx.stroke();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3.0;
      ctx.stroke();

      // Пороховые бочонки в камере камуфлета
      ctx.fillStyle = '#78350f';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(counterEnd.sx - 3 * cam3D.zoom, counterEnd.sy, 3.6 * cam3D.zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Медный таз с водой Хаджи-Юсуфа Сафарова в подземном каземате над контрминой
      const basinPos = project3D(-0.2, -0.35, maxZLimit + 0.1);
      const basinGlow = ctx.createRadialGradient(
        basinPos.sx,
        basinPos.sy,
        1,
        basinPos.sx,
        basinPos.sy,
        18 * cam3D.zoom
      );
      basinGlow.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
      basinGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = basinGlow;
      ctx.beginPath();
      ctx.arc(basinPos.sx, basinPos.sy, 18 * cam3D.zoom, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#c2410c';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(basinPos.sx, basinPos.sy, 9.5 * cam3D.zoom, 4.8 * cam3D.zoom, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      const waterRipple = ((nowMs * 0.015) % 7.5) + 1.5;
      ctx.beginPath();
      ctx.ellipse(
        basinPos.sx,
        basinPos.sy,
        waterRipple * cam3D.zoom,
        waterRipple * 0.45 * cam3D.zoom,
        0,
        0,
        Math.PI * 2
      );
      ctx.strokeStyle = siegeState.russianMineDistance <= 4 ? '#f87171' : '#7dd3fc';
      ctx.lineWidth = 1.25;
      ctx.stroke();

      // Сейсмические волны от кирок сапёров к медному тазу Хаджи-Юсуфа
      const pulseRadius = ((nowMs * 0.026) % 26) + 4;
      ctx.beginPath();
      ctx.arc(sapEnd.sx, sapEnd.sy, pulseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(248, 113, 113, 0.58)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(sapEnd.sx, sapEnd.sy, 4.2, 0, Math.PI * 2);
      ctx.fillStyle = '#fef08a';
      ctx.fill();

      // 5. Каменные сакли аула, боевая башня и многослойные дубовые блиндажи на скальном плато
      const saklyaNodes = [
        {
          x: -1.8,
          z: -0.6,
          label: lang === 'en' ? 'Citadel & Mosque (Tier III)' : 'Цитадель и Мечеть (Ярус III)',
          isTower: true,
          labelOffsetY: 34,
          labelOffsetX: 0
        },
        {
          x: -0.4,
          z: 0.4,
          label:
            lang === 'en'
              ? `Blindage (${siegeState.blindageLayers} log layers)`
              : `Блиндаж (${siegeState.blindageLayers} наката брёвен)`,
          isTower: false,
          labelOffsetY: 18,
          labelOffsetX: 30
        },
        {
          x: -3.1,
          z: -1.2,
          label: lang === 'en' ? 'Powder Magazine' : 'Пороховой погреб',
          isTower: false,
          labelOffsetY: -16,
          labelOffsetX: -24
        }
      ];

      saklyaNodes.forEach((node) => {
        if (node.z > maxZLimit) return;
        const groundY = sampleMountainHeight(node.x, node.z);
        const hBox = node.isTower ? 1.38 : 0.76;
        const pBase = project3D(node.x, groundY, node.z);
        const pTop = project3D(node.x, groundY + hBox, node.z);

        const boxW = (node.isTower ? 23 : 29) * cam3D.zoom;
        const boxH = Math.max(13, pBase.sy - pTop.sy);
        const leftX = pTop.sx - boxW * 0.5;

        // Тень у основания каменной кладки
        ctx.fillStyle = 'rgba(12, 10, 9, 0.45)';
        ctx.beginPath();
        ctx.ellipse(pBase.sx, pBase.sy + 2, boxW * 0.62, 4 * cam3D.zoom, 0, 0, Math.PI * 2);
        ctx.fill();

        // Освещённая солнечная и теневая грани кавказской каменной кладки
        ctx.fillStyle = node.isTower ? '#b08d62' : '#968773';
        ctx.fillRect(leftX, pTop.sy, boxW * 0.66, boxH);
        ctx.fillStyle = node.isTower ? '#6e5439' : '#5c5247';
        ctx.fillRect(leftX + boxW * 0.66, pTop.sy, boxW * 0.34, boxH);
        ctx.strokeStyle = 'rgba(253, 230, 138, 0.72)';
        ctx.lineWidth = 1.0;
        ctx.strokeRect(leftX, pTop.sy, boxW, boxH);

        // Зубцы боевой башни и тёплый отсвет огня в бойницах
        if (node.isTower) {
          for (let cr = 0; cr < 3; cr++) {
            ctx.fillStyle = '#b08d62';
            ctx.fillRect(
              leftX + cr * (boxW * 0.36),
              pTop.sy - 3.5 * cam3D.zoom,
              boxW * 0.24,
              3.5 * cam3D.zoom
            );
          }
        }
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(leftX + boxW * 0.18, pTop.sy + boxH * 0.34, 3.2 * cam3D.zoom, 5 * cam3D.zoom);
        ctx.fillRect(leftX + boxW * 0.44, pTop.sy + boxH * 0.34, 3.2 * cam3D.zoom, 5 * cam3D.zoom);

        // Развевающееся зелёное знамя Имамата над главной башней Цитадели
        if (node.isTower) {
          const bannerWave = Math.sin(nowMs * 0.004) * 2.2 * cam3D.zoom;
          ctx.beginPath();
          ctx.moveTo(pTop.sx, pTop.sy - 3 * cam3D.zoom);
          ctx.lineTo(pTop.sx, pTop.sy - 20 * cam3D.zoom);
          ctx.strokeStyle = '#fde68a';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(pTop.sx, pTop.sy - 20 * cam3D.zoom);
          ctx.quadraticCurveTo(
            pTop.sx + 6 * cam3D.zoom,
            pTop.sy - 21 * cam3D.zoom + bannerWave,
            pTop.sx + 13 * cam3D.zoom,
            pTop.sy - 18.5 * cam3D.zoom
          );
          ctx.lineTo(pTop.sx + 12.5 * cam3D.zoom, pTop.sy - 12 * cam3D.zoom);
          ctx.quadraticCurveTo(
            pTop.sx + 6 * cam3D.zoom,
            pTop.sy - 14 * cam3D.zoom + bannerWave,
            pTop.sx,
            pTop.sy - 13 * cam3D.zoom
          );
          ctx.closePath();
          ctx.fillStyle = '#059669';
          ctx.fill();
          ctx.strokeStyle = '#6ee7b7';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        // Объёмные бревенчатые накаты поверх блиндажа с торцевыми спилами дуба
        for (let l = 0; l < siegeState.blindageLayers; l++) {
          const ly = pTop.sy - l * 3.8 * cam3D.zoom;
          ctx.beginPath();
          ctx.moveTo(pTop.sx - boxW * 0.62, ly);
          ctx.lineTo(pTop.sx + boxW * 0.62, ly);
          ctx.strokeStyle = l % 2 === 0 ? '#78350f' : '#92400e';
          ctx.lineWidth = 3.2 * cam3D.zoom;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(pTop.sx - boxW * 0.62, ly, 1.7 * cam3D.zoom, 0, Math.PI * 2);
          ctx.arc(pTop.sx + boxW * 0.62, ly, 1.7 * cam3D.zoom, 0, Math.PI * 2);
          ctx.fillStyle = '#d97706';
          ctx.fill();
        }

        ctx.font = 'bold 10px Georgia, serif';
        ctx.textAlign = 'center';
        const labelX = pTop.sx + (node.labelOffsetX || 0) * cam3D.zoom;
        const labelY =
          node.labelOffsetY < 0
            ? pBase.sy + Math.abs(node.labelOffsetY) * cam3D.zoom
            : pTop.sy - (node.labelOffsetY || 18) * cam3D.zoom;
        const textWidth = ctx.measureText(node.label).width;
        ctx.fillStyle = 'rgba(17, 14, 11, 0.88)';
        ctx.fillRect(labelX - textWidth * 0.5 - 6, labelY - 10.5, textWidth + 12, 15);
        ctx.strokeStyle = 'rgba(217, 119, 6, 0.65)';
        ctx.lineWidth = 0.9;
        ctx.strokeRect(labelX - textWidth * 0.5 - 6, labelY - 10.5, textWidth + 12, 15);
        ctx.fillStyle = '#fef3c7';
        ctx.fillText(node.label, labelX, labelY);
      });

      // Крытый бревенчатый спуск за водой к реке Койсу (Ахульго / Салты)
      const waterTop = project3D(-2.5, sampleMountainHeight(-2.5, 0), 0);
      const waterBot = project3D(-6.1, sampleMountainHeight(-6.1, 0), 0);
      ctx.beginPath();
      ctx.moveTo(waterTop.sx, waterTop.sy);
      ctx.lineTo(waterBot.sx, waterBot.sy);
      ctx.strokeStyle = '#5c2d0c';
      ctx.lineWidth = 5.5 * cam3D.zoom;
      ctx.stroke();
      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 6. Позиции русских осадных батарей с плетёными турами, лафетами и клубами порохового дыма
      const mortarPos = project3D(7.2, sampleMountainHeight(7.2, -1.4), -1.4);
      const unicornPos = project3D(7.2, sampleMountainHeight(7.2, 1.2), 1.2);

      [
        {
          p: mortarPos,
          angle: mortarAngle3D,
          label: lang === 'en' ? `Mortars (${mortarAngle3D}°)` : `Мортиры (${mortarAngle3D}°)`,
          col: '#f59e0b',
          phase: 0
        },
        {
          p: unicornPos,
          angle: unicornAngle3D,
          label: lang === 'en' ? `Unicorns (${unicornAngle3D}°)` : `Единороги (${unicornAngle3D}°)`,
          col: '#ef4444',
          phase: 1.7
        }
      ].forEach((bat) => {
        const rad = (bat.angle * Math.PI) / 180;
        const barrelLen = 14.5 * cam3D.zoom;

        // Земляной бруствер и 2 плетёных сапёрных тура (габиона)
        [-14, -8.5].forEach((gx) => {
          ctx.fillStyle = '#6b5a45';
          ctx.strokeStyle = '#d6d3d1';
          ctx.lineWidth = 0.9;
          ctx.fillRect(
            bat.p.sx + gx * cam3D.zoom,
            bat.p.sy - 4.5 * cam3D.zoom,
            4.8 * cam3D.zoom,
            9.5 * cam3D.zoom
          );
          ctx.strokeRect(
            bat.p.sx + gx * cam3D.zoom,
            bat.p.sy - 4.5 * cam3D.zoom,
            4.8 * cam3D.zoom,
            9.5 * cam3D.zoom
          );
        });

        // Дрейфующий пороховой дымок у дульного среза батареи
        const smokeCycle = ((nowMs * 0.0007 + bat.phase) % 1);
        const muzzleX = bat.p.sx - Math.cos(rad) * barrelLen;
        const muzzleY = bat.p.sy - Math.sin(rad) * barrelLen;
        ctx.beginPath();
        ctx.arc(
          muzzleX - smokeCycle * 16 * cam3D.zoom,
          muzzleY - smokeCycle * 11 * cam3D.zoom,
          (5 + smokeCycle * 11) * cam3D.zoom,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(231, 229, 228, ${(1 - smokeCycle) * 0.28})`;
        ctx.fill();

        // Литой бронзовый ствол мортиры / единорога
        ctx.beginPath();
        ctx.moveTo(bat.p.sx, bat.p.sy);
        ctx.lineTo(muzzleX, muzzleY);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 4.4 * cam3D.zoom;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Деревянный лафет и колесо со спицами
        ctx.beginPath();
        ctx.arc(bat.p.sx, bat.p.sy + 2 * cam3D.zoom, 5.8 * cam3D.zoom, 0, Math.PI * 2);
        ctx.fillStyle = '#292524';
        ctx.fill();
        ctx.strokeStyle = bat.col;
        ctx.lineWidth = 1.6;
        ctx.stroke();

        const bTextW = ctx.measureText(bat.label).width;
        ctx.fillStyle = 'rgba(17, 14, 11, 0.85)';
        ctx.fillRect(bat.p.sx - bTextW * 0.5 - 5, bat.p.sy - 26 * cam3D.zoom, bTextW + 10, 14);
        ctx.strokeStyle = 'rgba(248, 113, 113, 0.5)';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(bat.p.sx - bTextW * 0.5 - 5, bat.p.sy - 26 * cam3D.zoom, bTextW + 10, 14);
        ctx.fillStyle = '#fecaca';
        ctx.font = 'bold 10px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText(bat.label, bat.p.sx, bat.p.sy - 16 * cam3D.zoom);
      });

      // Визуализация конуса МЁРТВОЙ ЗОНЫ настильного огня за перегибом скалы
      if (cam3D.showDeadZoneCone) {
        const crestP = project3D(1.1, sampleMountainHeight(1.1, 0.2), 0.2);
        const shadowP1 = project3D(-1.9, sampleMountainHeight(-1.9, 0.2) + 0.9, 0.2);
        const shadowP2 = project3D(-1.9, sampleMountainHeight(-1.9, 0.2), 0.2);
        ctx.beginPath();
        ctx.moveTo(crestP.sx, crestP.sy);
        ctx.lineTo(shadowP1.sx, shadowP1.sy);
        ctx.lineTo(shadowP2.sx, shadowP2.sy);
        ctx.closePath();
        ctx.fillStyle = 'rgba(239, 68, 68, 0.16)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(248, 113, 113, 0.52)';
        ctx.setLineDash([4, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 7. Летящие 3D-бомбы мортир и гранаты единорогов с огненным фитилём
      for (let i = projectilesRef.current.length - 1; i >= 0; i--) {
        const pr = projectilesRef.current[i];
        pr.trail.push({ x: pr.x, y: pr.y, z: pr.z });
        if (pr.trail.length > 28) pr.trail.shift();

        pr.x += pr.vx;
        pr.y += pr.vy;
        pr.z += pr.vz;
        pr.vy -= pr.gravity;

        ctx.beginPath();
        pr.trail.forEach((pt, idx) => {
          const tp = project3D(pt.x, pt.y, pt.z);
          if (idx === 0) ctx.moveTo(tp.sx, tp.sy);
          else ctx.lineTo(tp.sx, tp.sy);
        });
        ctx.strokeStyle = pr.color;
        ctx.lineWidth = 2.4;
        ctx.stroke();

        const curP = project3D(pr.x, pr.y, pr.z);
        ctx.beginPath();
        ctx.arc(curP.sx, curP.sy, 7.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(251, 191, 36, 0.35)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(curP.sx, curP.sy, 4.2, 0, Math.PI * 2);
        ctx.fillStyle = '#fef08a';
        ctx.fill();

        const terrainH = sampleMountainHeight(pr.x, pr.z);
        if (pr.y <= terrainH || pr.x < -7.5) {
          const hitCliffWall = pr.x > 0.35 && pr.x < 3.4;
          explosionsRef.current.push({
            x: pr.x,
            y: Math.max(pr.y, terrainH),
            z: pr.z,
            radius: 0.15,
            maxRadius: pr.type === 'mortar_3d' ? 2.1 : 1.35,
            alpha: 1.0,
            color: hitCliffWall ? '#ef4444' : '#fbbf24',
            isUnderground: false
          });

          if (hitCliffWall && pr.type === 'unicorn_3d') {
            setStats3D((prev) => ({
              ...prev,
              deadZoneBlocked: prev.deadZoneBlocked + 1,
              lastShotReport:
                lang === 'en'
                  ? `Mountain Unicorn cannonball (${unicornAngle3D}°) struck the sheer limestone cliff! Tier II & III saklyas remain inside the DEAD ZONE.`
                  : `Ядро горного единорога (${unicornAngle3D}°) врезалось в отвесный известняковый обрыв! Сакли 2-го и 3-го яруса остались в МЁРТВОЙ ЗОНЕ рельефа.`
            }));
          } else {
            setStats3D((prev) => ({
              ...prev,
              mortarHits: prev.mortarHits + 1,
              lastShotReport:
                lang === 'en'
                  ? `Plunging pood mortar bomb (${mortarAngle3D}°) cleared the cliff crest and detonated atop the timber blindage (${siegeState.blindageLayers} oak layers absorbed the blast).`
                  : `Навесная пудовая бомба (${mortarAngle3D}°) перелетела гребень скалы и разорвалась на бревенчатом накате блиндажа (${siegeState.blindageLayers} слоя брёвен погасили удар).`
            }));
          }

          projectilesRef.current.splice(i, 1);
        }
      }

      // 8. Многослойные 3D-разрывы бомб и подземных камуфлетов с клубами дыма
      for (let i = explosionsRef.current.length - 1; i >= 0; i--) {
        const ex = explosionsRef.current[i];
        ex.radius += 0.12;
        ex.alpha -= 0.03;
        const ep = project3D(ex.x, ex.y, ex.z);
        const rPx = ex.radius * 14.5 * cam3D.zoom;
        ctx.beginPath();
        ctx.arc(ep.sx, ep.sy, rPx * 1.25, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(120, 113, 108, ${Math.max(0, ex.alpha * 0.45)})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ep.sx, ep.sy, rPx, 0, Math.PI * 2);
        ctx.fillStyle = ex.isUnderground
          ? `rgba(245, 158, 11, ${Math.max(0, ex.alpha)})`
          : `rgba(239, 68, 68, ${Math.max(0, ex.alpha)})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ep.sx, ep.sy, rPx * 0.48, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(254, 249, 195, ${Math.max(0, ex.alpha)})`;
        ctx.fill();
        if (ex.alpha <= 0) {
          explosionsRef.current.splice(i, 1);
        }
      }

      // Подпись плоскости разреза Милютина в латунной картуши внизу среза
      const cutLabelPos = project3D(1.8, -2.62, maxZLimit);
      const cutTitle =
        lang === 'en'
          ? `MILYUTIN GEODESIC CUTAWAY PLANE • Sap: ${siegeState.russianMineDistance} sazh. to tower`
          : `ПЛОСКОСТЬ ГЕОДЕЗИЧЕСКОГО РАЗРЕЗА МИЛЮТИНА • Сапа: ${siegeState.russianMineDistance} саж. до башни`;
      ctx.font = 'bold 11px Georgia, serif';
      ctx.textAlign = 'center';
      const cutW = ctx.measureText(cutTitle).width;
      ctx.fillStyle = 'rgba(17, 14, 11, 0.86)';
      ctx.fillRect(cutLabelPos.sx - cutW * 0.5 - 8, cutLabelPos.sy - 12, cutW + 16, 17);
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.65)';
      ctx.lineWidth = 1;
      ctx.strokeRect(cutLabelPos.sx - cutW * 0.5 - 8, cutLabelPos.sy - 12, cutW + 16, 17);
      ctx.fillStyle = '#fde68a';
      ctx.fillText(cutTitle, cutLabelPos.sx, cutLabelPos.sy);

      animFrameId = requestAnimationFrame(renderLoop);
    };

    animFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animFrameId);
  }, [
    activeTab,
    cam3D,
    lang,
    sampleMountainHeight,
    siegeInline3D,
    siegeState.russianMineDistance,
    siegeState.blindageLayers,
    mortarAngle3D,
    tacticalMode,
    unicornAngle3D
  ]);

  // Обработчики вращения 3D-камеры мышью и касанием на холсте
  const handleCanvasPointerDown = (clientX, clientY) => {
    dragStateRef.current = {
      isDragging: true,
      lastX: clientX,
      lastY: clientY
    };
  };

  const handleCanvasPointerMove = (clientX, clientY) => {
    if (!dragStateRef.current.isDragging) return;
    const dx = clientX - dragStateRef.current.lastX;
    const dy = clientY - dragStateRef.current.lastY;
    dragStateRef.current.lastX = clientX;
    dragStateRef.current.lastY = clientY;

    setCam3D((prev) => ({
      ...prev,
      autoRotate: false,
      yaw: prev.yaw + dx * 0.0085,
      pitch: Math.max(0.12, Math.min(1.28, prev.pitch + dy * 0.0075))
    }));
  };

  const handleCanvasPointerUp = () => {
    dragStateRef.current.isDragging = false;
  };

  // Хроника Мухаммед-Тахира аль-Карахи
  const [chronicleFilter, setChronicleFilter] = useState('all');
  const [chronicle, setChronicle] = useState([
    {
      id: 'init-1',
      turn: 1,
      category: 'envoy',
      sender: 'Секретарь Диван-ханы Мухаммед-Тахир аль-Карахи',
      senderEn: 'Secretary of the Divan-Khana Muhammad-Tahir al-Qarakhi',
      title: 'Открытие Совета в столице Дарго-Ведено (Лето 1845 г. / 1261 г. хиджры)',
      titleEn: 'Opening of the State Council in Dargo-Vedeno (Summer 1845 / 1261 AH)',
      text: 'Имам Шамиль собрал алимов и казначея Хаджиява над картой Кавказа. Из крепости Внезапной и Темир-Хан-Шуры двинулись колонны графа Воронцова. Необходимо разослать гонцов с порохом по наибствам.',
      textEn: 'Imam Shamil convened the scholars and Treasurer Hajjiyav over the relief map of the Caucasus. Count Vorontsov’s columns have marched from Fort Vnezapnaya and Temir-Khan-Shura. Mounted envoys with gunpowder must be dispatched to the Naibates.'
    }
  ]);

  // Автоматическое переключение вкладок и таймер для режима «Executive Publisher Auto-Tour» (Milestone M11)
  const handleSelectPitchTourStep = (nextIdx) => {
    const wrappedIdx = (nextIdx + PUBLISHER_TOUR_STEPS.length) % PUBLISHER_TOUR_STEPS.length;
    const stepObj = PUBLISHER_TOUR_STEPS[wrappedIdx];
    setPitchTour((prev) => ({
      ...prev,
      active: true,
      stepIdx: wrappedIdx
    }));
    if (stepObj?.tab) {
      setActiveTab(stepObj.tab);
    }
    playHistoricalSound('seal', soundEnabled);
  };

  const handleTogglePitchTour = () => {
    if (pitchTour.active) {
      setPitchTour((prev) => ({ ...prev, active: false }));
    } else {
      const firstStep = PUBLISHER_TOUR_STEPS[0];
      setPitchTour({ active: true, stepIdx: 0, autoAdvance: true });
      if (firstStep?.tab) setActiveTab(firstStep.tab);
      playHistoricalSound('horn', soundEnabled);
    }
  };

  useEffect(() => {
    if (!pitchTour.active || !pitchTour.autoAdvance) return undefined;
    const timerId = setInterval(() => {
      setPitchTour((prev) => {
        if (!prev.active || !prev.autoAdvance) return prev;
        const nextIdx = (prev.stepIdx + 1) % PUBLISHER_TOUR_STEPS.length;
        const nextStep = PUBLISHER_TOUR_STEPS[nextIdx];
        if (nextStep?.tab) {
          setActiveTab(nextStep.tab);
        }
        return {
          ...prev,
          stepIdx: nextIdx
        };
      });
    }, 8500);
    return () => clearInterval(timerId);
  }, [pitchTour.active, pitchTour.autoAdvance, PUBLISHER_TOUR_STEPS]);

  // ============================================================================
  // ПРОЦЕДУРНЫЙ МИКШЕР АТМОСФЕРЫ WEBAUDIO SYNTHESIZER 2.0 (БЕЗ ВНЕШНИХ ФАЙЛОВ)
  // ============================================================================
  // Слой 1: Горный ветер ущелья Ахк-Таш и плато Верхний Гуниб
  useEffect(() => {
    if (!soundEnabled || !audioMixerConfig.windLayerEnabled) return undefined;
    playHistoricalSound('wind_gust', true, { volume: audioMixerConfig.masterVolume });
    const timerId = setInterval(() => {
      playHistoricalSound('wind_gust', true, { volume: audioMixerConfig.masterVolume });
    }, 2400);
    return () => clearInterval(timerId);
  }, [soundEnabled, audioMixerConfig.windLayerEnabled, audioMixerConfig.masterVolume]);

  // Слой 2: Акустический пеленг медного таза Хаджи-Юсуфа Сафарова (динамический период по D_mine)
  useEffect(() => {
    if (!soundEnabled || !audioMixerConfig.copperBasinSonarEnabled) return undefined;
    const mineDist = Math.max(1.5, Math.min(16.0, siegeState.russianMineDistance || 9.5));
    const intervalMs = Math.round(Math.max(800, Math.min(3200, (0.55 + 0.16 * mineDist) * 1000)));
    playHistoricalSound('basin_ping', true, {
      volume: audioMixerConfig.masterVolume,
      mineDistance: mineDist
    });
    const timerId = setInterval(() => {
      playHistoricalSound('basin_ping', true, {
        volume: audioMixerConfig.masterVolume,
        mineDistance: mineDist
      });
    }, intervalMs);
    return () => clearInterval(timerId);
  }, [
    soundEnabled,
    audioMixerConfig.copperBasinSonarEnabled,
    audioMixerConfig.masterVolume,
    siegeState.russianMineDistance
  ]);

  // Слой 3: Очаг Диван-ханы, шелест карт и водяная пороховая мельница Ведено
  useEffect(() => {
    if (!soundEnabled || !audioMixerConfig.hearthWatermillEnabled) return undefined;
    playHistoricalSound('watermill_stamp', true, { volume: audioMixerConfig.masterVolume });
    const timerId = setInterval(() => {
      playHistoricalSound('watermill_stamp', true, { volume: audioMixerConfig.masterVolume });
    }, 1550);
    return () => clearInterval(timerId);
  }, [soundEnabled, audioMixerConfig.hearthWatermillEnabled, audioMixerConfig.masterVolume]);

  // ============================================================================
  // КОНСТРУКТОР СЦЕНАРИЕВ И МОДОВ (CUSTOM SCENARIO & MODDING JSON BUILDER)
  // ============================================================================
  const activeModNaibate = useMemo(
    () =>
      modDraft.naibates.find((n) => n.id === modSelectedNaibateId) || modDraft.naibates[0],
    [modDraft.naibates, modSelectedNaibateId]
  );

  const handleUpdateModNaibate = (naibId, patch) => {
    setModDraft((prev) => ({
      ...prev,
      naibates: prev.naibates.map((n) => {
        if (n.id !== naibId) return n;
        const nextTraits = patch.traits ? { ...n.traits, ...patch.traits } : n.traits;
        return {
          ...n,
          ...patch,
          traits: nextTraits
        };
      })
    }));
  };

  const handleApplyModPreset = (presetType) => {
    playHistoricalSound('seal', soundEnabled, { volume: audioMixerConfig.masterVolume });
    if (presetType === 'default_1845' || presetType === 'historical_1845') {
      setModDraft({
        modId: 'custom_imamat_1845_mod',
        titleRu: '1845: Даргинский поход М. С. Воронцова (Канон)',
        titleEn: '1845: Vorontsov’s Dargo Expedition (Canon)',
        yearLabel: '1845 г. — Даргинский поход (Эталон)',
        yearLabelEn: '1845 — Dargo Expedition (Reference)',
        generalIdx: 0,
        resources: { gunpowder: 195, provisions: 1420, silver: 680, authority: 86, ottomanSupport: 48 },
        naibates: INITIAL_NAIBATES
      });
    } else if (presetType === 'akhulgo_1839') {
      setModDraft({
        modId: 'Mod_1839_Akhulgo_Siege',
        titleRu: '1839: Осада Ахульго (Генерал П. Х. Граббе)',
        titleEn: '1839: Siege of Akhulgo (Gen. P. Kh. Grabbe)',
        yearLabel: '1839 г. — 80 дней обороны скалы Ахульго',
        yearLabelEn: '1839 — 80-Day Defense of Mount Akhulgo',
        generalIdx: 1,
        resources: { gunpowder: 110, provisions: 680, silver: 310, authority: 82, ottomanSupport: 25 },
        naibates: INITIAL_NAIBATES.map((n) => ({
          ...n,
          gunpowder: Math.max(18, n.gunpowder - 12),
          imperialPressure: Math.min(92, n.imperialPressure + 16),
          underSiege: n.id === 'gunib' || n.id === 'karata' || n.imperialPressure + 16 >= 78,
          traits: { ...n.traits, courage: Math.min(100, n.traits.courage + 6) }
        }))
      });
    } else if (presetType === 'abundant_powder_1843' || presetType === 'golden_age_1843') {
      setModDraft({
        modId: 'Mod_1843_Avaria_Uprising',
        titleRu: '1843: Сверкающий Газават и освобождение Аварии',
        titleEn: '1843: The Shining Ghazawat & Liberation of Avaria',
        yearLabel: '1843 г. — Золотой век Имамата (Ген. Р. К. Фрейтаг)',
        yearLabelEn: '1843 — Golden Age of the Imamate (Gen. R. K. Freytag)',
        generalIdx: 2,
        resources: { gunpowder: 345, provisions: 1950, silver: 1120, authority: 95, ottomanSupport: 70 },
        naibates: INITIAL_NAIBATES.map((n) => ({
          ...n,
          gunpowder: n.gunpowder + 30,
          murtazeks: n.murtazeks + 120,
          imperialPressure: Math.max(20, n.imperialPressure - 15),
          underSiege: false,
          traits: { ...n.traits, iman: Math.min(100, n.traits.iman + 8) }
        }))
      });
    } else if (presetType === 'extreme_siege_1859' || presetType === 'baryatinsky_1857') {
      setModDraft({
        modId: 'Mod_1857_Baryatinsky_Endgame',
        titleRu: '1857–1859: Просеки Барятинского и оборона Ведено',
        titleEn: '1857–1859: Baryatinsky’s Clearings & Defense of Vedeno',
        yearLabel: '1857–1859 гг. — Системная блокада просек',
        yearLabelEn: '1857–1859 — Systemic Blockade & Clearings',
        generalIdx: 3,
        resources: { gunpowder: 85, provisions: 520, silver: 210, authority: 74, ottomanSupport: 15 },
        naibates: INITIAL_NAIBATES.map((n) => ({
          ...n,
          gunpowder: Math.max(12, n.gunpowder - 18),
          imperialPressure: Math.min(94, n.imperialPressure + 20),
          underSiege: n.imperialPressure + 20 >= 78
        }))
      });
    }
  };

  const handleApplyCustomModScenario = () => {
    playHistoricalSound('horn', soundEnabled, { volume: audioMixerConfig.masterVolume });
    setTurn(1);
    setActiveEnvoys([]);
    setResources({ ...modDraft.resources });
    const nextNaibs = modDraft.naibates.map((n) => ({ ...n, traits: { ...n.traits } }));
    setNaibates(nextNaibs);
    const chosenGen = IMPERIAL_GENERALS[modDraft.generalIdx] || IMPERIAL_GENERALS[0];
    setImperialAi((prev) => ({
      ...prev,
      generalIdx: modDraft.generalIdx,
      turnsUntilStrike: 2
    }));
    setCampaignHistoryLog([
      {
        turn: 1,
        seasonRu: modDraft.yearLabel || 'Ход 1 (Пользовательский сценарий)',
        seasonEn: modDraft.yearLabelEn || 'Turn 1 (Custom Scenario)',
        generalNameRu: chosenGen.name,
        generalNameEn: chosenGen.nameEn,
        vedenoPowder: modDraft.resources.gunpowder,
        regionalPowder: nextNaibs.reduce((s, n) => s + n.gunpowder, 0),
        silver: modDraft.resources.silver,
        provisions: modDraft.resources.provisions,
        totalGarrison: nextNaibs.reduce((s, n) => s + n.garrison + n.murtazeks, 0),
        totalStress: 32,
        victoryScore: 74,
        siegesCount: nextNaibs.filter((n) => n.underSiege).length,
        eventRu: `Запущен мод-сценарий: ${modDraft.titleRu}`,
        eventEn: `Launched Mod Scenario: ${modDraft.titleEn}`
      }
    ]);
    setReplaySelectedTurnIdx(0);
    setChronicle((prev) => [
      {
        id: `mod-launch-${Date.now()}`,
        turn: 1,
        category: 'nizam',
        sender: 'Конструктор сценариев и модов (DT_Naibates_1845)',
        senderEn: 'Custom Scenario & Mod Builder (DT_Naibates_1845)',
        title: `Запущен пользовательский мод: ${modDraft.titleRu}`,
        titleEn: `Launched Custom Mod: ${modDraft.titleEn}`,
        text: `Стартовый запас пороха в Ведено: ${modDraft.resources.gunpowder} пуд., казна Байт аль-маль: ${modDraft.resources.silver} руб. серебром, командующий РИ: ${chosenGen.name}.`,
        textEn: `Starting Vedeno gunpowder: ${modDraft.resources.gunpowder} poods, Bayt al-Mal treasury: ${modDraft.resources.silver} silver rubles, Imperial commander: ${chosenGen.nameEn}.`
      },
      ...prev
    ]);
    setShowModBuilderModal(false);
    alertMsg(
      t(
        `Применён пользовательский сценарий «${modDraft.titleRu}» (10 наибств обновлены)!`,
        `Applied custom mod scenario “${modDraft.titleEn}” (10 Naibates updated)!`
      )
    );
  };

  const handleExportCustomModJson = () => {
    const payload = {
      schemaVersion: 'ImamatCustomScenarioMod_UE5_5_v1',
      exportedAtUtc: new Date().toISOString(),
      modId: modDraft.modId,
      titleRu: modDraft.titleRu,
      titleEn: modDraft.titleEn,
      yearLabel: modDraft.yearLabel,
      yearLabelEn: modDraft.yearLabelEn,
      generalIdx: modDraft.generalIdx,
      initialResources: modDraft.resources,
      DT_Naibates_1845: modDraft.naibates
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${modDraft.modId || 'Imamat_CustomScenario_Mod'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    alertMsg(
      t(
        `Экспортирован JSON-файл модификации: ${modDraft.modId}.json`,
        `Exported custom mod JSON package: ${modDraft.modId}.json`
      )
    );
  };

  const handleImportCustomModJson = () => {
    try {
      const parsed = JSON.parse(modImportJsonText);
      const importedNaibates = Array.isArray(parsed.DT_Naibates_1845)
        ? parsed.DT_Naibates_1845
        : Array.isArray(parsed.naibates)
        ? parsed.naibates
        : null;
      if (!importedNaibates || importedNaibates.length === 0) {
        alertMsg(
          t(
            'Ошибка: JSON не содержит массива DT_Naibates_1845 или naibates.',
            'Error: JSON does not contain a valid DT_Naibates_1845 or naibates array.'
          )
        );
        return;
      }
      setModDraft((prev) => ({
        ...prev,
        modId: parsed.modId || prev.modId,
        titleRu: parsed.titleRu || prev.titleRu,
        titleEn: parsed.titleEn || prev.titleEn,
        yearLabel: parsed.yearLabel || prev.yearLabel,
        yearLabelEn: parsed.yearLabelEn || prev.yearLabelEn,
        generalIdx: typeof parsed.generalIdx === 'number' ? parsed.generalIdx : prev.generalIdx,
        resources: parsed.initialResources || parsed.resources || prev.resources,
        naibates: importedNaibates
      }));
      playHistoricalSound('seal', soundEnabled, { volume: audioMixerConfig.masterVolume });
      alertMsg(
        t(
          `Модификация «${parsed.titleRu || parsed.modId || 'Custom Mod'}» успешно загружена в конструктор!`,
          `Mod “${parsed.titleEn || parsed.modId || 'Custom Mod'}” loaded into Mod Builder!`
        )
      );
    } catch {
      alertMsg(
        t(
          'Ошибка разбора JSON: проверьте корректность синтаксиса мод-пакета.',
          'JSON Parse Error: please verify the mod package syntax.'
        )
      );
    }
  };



  const currentSeasonClimate = useMemo(
    () => SEASON_CLIMATE_MODIFIERS[(turn - 1) % SEASON_CLIMATE_MODIFIERS.length],
    [turn]
  );

  const alertMsg = (text) => {
    setStatusBanner(text);
    setTimeout(() => {
      setStatusBanner((prev) => (prev === text ? null : prev));
    }, 4500);
  };

  // Единый игровой баннер уведомлений для обработчиков 3D-диорамы (M30–M37); второй аргумент (тип) зарезервирован
  const showNotice = (text) => alertMsg(text);

  const unlockRelic = useCallback((relicId) => {
    setUnlockedRelicIds((prev) => {
      if (prev.includes(relicId)) return prev;
      const next = [...prev, relicId];
      try {
        window.localStorage.setItem(RELICS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage quota errors
      }
      const found = IMAMAT_RELICS_CATALOG.find((r) => r.id === relicId);
      if (found) {
        setStatusBanner(
          `🏛️ Открыта реликвия Диван-ханы: ${found.icon} «${found.titleRu}» (${found.bonusSummaryRu})!`
        );
      }
      return next;
    });
  }, []);

  const handleToggleActiveRelic = useCallback(
    (relicId) => {
      if (!unlockedRelicIds.includes(relicId)) return;
      playHistoricalSound('seal', soundEnabled);
      setActiveRelicIds((prev) => {
        let next;
        if (prev.includes(relicId)) {
          next = prev.filter((id) => id !== relicId);
        } else if (prev.length >= 2) {
          next = [prev[1], relicId];
        } else {
          next = [...prev, relicId];
        }
        try {
          window.localStorage.setItem(ACTIVE_RELICS_STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore storage quota errors
        }
        return next;
      });
    },
    [unlockedRelicIds, soundEnabled]
  );

  // Открытие и принятие решений по сюжетным цепочкам ключевых героев (Хаджи-Мурат, Хаджи-Юсуф Сафаров, Байсунгур)
  const handleOpenHeroArcModal = useCallback(
    (heroId) => {
      const arc = HERO_STORY_ARCS.find((a) => a.id === heroId);
      if (!arc) return;
      playHistoricalSound('paper', soundEnabled);
      setActiveHeroArcModal({ heroId });
    },
    [soundEnabled]
  );

  const handleResolveHeroArcChoice = useCallback(
    (heroId, stageIdx, choice) => {
      const arc = HERO_STORY_ARCS.find((a) => a.id === heroId);
      if (!arc || !choice) return;
      const chapter = arc.chapters[stageIdx];
      const eff = choice.effects || {};
      const needSilver = eff.silverDelta < 0 ? -eff.silverDelta : 0;
      const needPowder = eff.powderDelta < 0 ? -eff.powderDelta : 0;
      const needProv = eff.provisionsDelta < 0 ? -eff.provisionsDelta : 0;
      if (
        resources.silver < needSilver ||
        resources.gunpowder < needPowder ||
        resources.provisions < needProv
      ) {
        setStatusBanner(
          lang === 'en'
            ? '⚠️ Insufficient Bait al-Mal treasury or arsenal reserves for this decree.'
            : '⚠️ В казне Байт-уль-Мал или арсенале Ведено недостаточно запасов для этого указа.'
        );
        return;
      }
      playHistoricalSound('seal', soundEnabled);

      // 1. Дельта казны, пороха, провианта и Авторитета Диван-ханы
      setResources((prev) => ({
        ...prev,
        gunpowder: Math.max(0, prev.gunpowder + (eff.powderDelta || 0)),
        provisions: Math.max(0, prev.provisions + (eff.provisionsDelta || 0)),
        silver: Math.max(0, prev.silver + (eff.silverDelta || 0)),
        authority: Math.max(15, Math.min(100, prev.authority + (eff.authorityDelta || 0)))
      }));

      // 2. Живая память наиба (trustScore), гарнизон и натиск Империи в родном наибстве героя
      setNaibates((prev) =>
        prev.map((n) => {
          if (n.id !== arc.naibateId) return n;
          const nextTrust =
            typeof eff.setTrustExact === 'number'
              ? eff.setTrustExact
              : Math.max(-3, Math.min(3, (n.trustScore ?? 0) + (eff.trustDelta || 0)));
          const nextPress = Math.max(8, Math.min(98, n.imperialPressure + (eff.pressureDelta || 0)));
          return {
            ...n,
            trustScore: nextTrust,
            lastMemoryRu: eff.memoryRu || n.lastMemoryRu,
            lastMemoryEn: eff.memoryEn || n.lastMemoryEn,
            garrison: Math.max(120, n.garrison + (eff.garrisonDelta || 0)),
            imperialPressure: nextPress,
            underSiege: nextPress >= 78 ? n.underSiege : false
          };
        })
      );

      // 3. Прямое усиление 3D-отряда героя на стратегическом столе Кавказа (+ золотой венец Легенды!)
      setLiveFieldUnits((prevUnits) => {
        const updated = prevUnits.map((u) => {
          if (u.id !== arc.unitId) return u;
          const sabDelta = eff.unitSabersDelta || 0;
          const mpDelta = eff.unitMpDelta || 0;
          const maxMpDelta = eff.unitMaxMpDelta || 0;
          const nextMaxSab = (u.maxSabers ?? u.sabers ?? 500) + Math.max(0, sabDelta);
          const nextSab = Math.max(80, (u.sabers ?? 500) + sabDelta);
          const nextMedals = eff.unitMedalRu
            ? Array.from(new Set([...(u.medals || []), eff.unitMedalRu]))
            : u.medals || [];
          return {
            ...u,
            sabers: nextSab,
            maxSabers: Math.max(nextMaxSab, nextSab),
            vetXp: Math.min(3, (u.vetXp || 0) + (eff.unitVetDelta || 0)),
            capturedGuns: (u.capturedGuns || 0) + (eff.unitGunsDelta || 0),
            maxMp: (u.maxMp || 150) + maxMpDelta,
            mp: (u.mp || 150) + mpDelta + maxMpDelta,
            medals: nextMedals,
            commanderRu: eff.renameCommanderRu || u.commanderRu,
            commanderEn: eff.renameCommanderEn || u.commanderEn,
            legendaryHero: Boolean(u.legendaryHero || eff.grantLegendaryHero)
          };
        });
        liveUnitsRef.current = updated;
        return updated;
      });

      // 4. Инженерное усиление блиндажей (для квеста Хаджи-Юсуфа Сафарова)
      if (eff.blindageBoost) {
        setSiegeState((prev) => ({
          ...prev,
          blindageLayers: Math.min(5, (prev.blindageLayers || 3) + eff.blindageBoost),
          wallIntegrity: Math.min(100, (prev.wallIntegrity || 76) + 10)
        }));
      }

      // 5. Урон колоннам Кавказского корпуса при контрударах Хаджи-Мурата и Байсунгура
      if (eff.imperialColumnDamage) {
        setLiveImperialColumns((prevCols) => {
          const nextCols = prevCols.map((col) => ({
            ...col,
            bayonets: Math.max(650, col.bayonets - eff.imperialColumnDamage)
          }));
          liveColumnsRef.current = nextCols;
          return nextCols;
        });
      }

      // 6. Автоматическое открытие именных Реликвий Диван-ханы в финале цепочки
      if (Array.isArray(eff.unlockRelics)) {
        eff.unlockRelics.forEach((relId) => unlockRelic(relId));
      }

      // 7. Запись в арабскую Хронику Мухаммада Тахира аль-Карахи
      setChronicle((prev) => [
        {
          id: `hero-arc-${heroId}-${stageIdx}-${Date.now()}`,
          turn,
          category: 'decree',
          sender: arc.heroNameRu,
          senderEn: arc.heroNameEn,
          title: `${chapter?.actLabelRu || 'Судьба героя'}: ${chapter?.titleRu || arc.heroNameRu}`,
          titleEn: `${chapter?.actLabelEn || 'Hero Destiny'}: ${chapter?.titleEn || arc.heroNameEn}`,
          text: choice.chronicleRu,
          textEn: choice.chronicleEn
        },
        ...prev
      ]);

      // 8. Продвижение акта сюжетной цепочки (0 -> 1 -> 2 -> completed)
      const isFinalChapter = stageIdx >= arc.chapters.length - 1;
      setHeroArcsState((prev) => {
        const cur = prev[heroId] || { stage: 0, completed: false, outcome: null, choiceHistory: [] };
        return {
          ...prev,
          [heroId]: {
            stage: Math.min(arc.chapters.length, stageIdx + 1),
            completed: isFinalChapter,
            outcome: isFinalChapter ? choice.outcome || 'completed' : cur.outcome,
            choiceHistory: [...(cur.choiceHistory || []), choice.id]
          }
        };
      });

      const isTragic = isFinalChapter && choice.outcome === 'tragic_departure';
      setActiveHeroArcModal(null);
      setStatusBanner(
        lang === 'en'
          ? isFinalChapter
            ? isTragic
              ? `📜 1851 Historical Rift: ${arc.heroNameEn} — Khunzakh Murtazeks reorganized & Relic preserved.`
              : `👑 Destiny Fulfilled: ${arc.heroNameEn} — legendary 3D status & Relic unlocked!`
            : `📜 Decree sealed (${chapter?.actLabelEn}): ${arc.heroNameEn} advances to Act ${stageIdx + 2}!`
          : isFinalChapter
          ? isTragic
            ? `📜 Исторический разлом 1851 г.: гарнизон Хунзаха реорганизован под знаменем Диван-ханы!`
            : `👑 Судьба свершилась: ${arc.heroNameRu} — золотой венец в 3D и именная реликвия открыты!`
          : `📜 Указ скреплён печатью (${chapter?.actLabelRu}): открыта следующая глава судьбы героя!`
      );
    },
    [soundEnabled, turn, lang, unlockRelic, resources]
  );

  // Прохождение 4-фазных исторических операций-эпизодов (1839 Ахульго / 1843 Газават / 1845 Дарго / 1853 Мичик / 1857 Гуниб)
  const handleResolveEpisodePhase = useCallback(
    (episodeId, choice) => {
      const ep = HISTORICAL_EPISODES.find((e) => e.id === episodeId);
      if (!ep || !choice) return;
      const curState = episodesState[episodeId] || { phaseIdx: 0, completed: false, history: [] };
      if (curState.completed) return;
      const phaseIdx = Math.min(ep.phases.length - 1, curState.phaseIdx || 0);
      const phase = ep.phases[phaseIdx];
      if (!phase) return;

      const needSilver = choice.silverDelta < 0 ? -choice.silverDelta : 0;
      const needPowder = choice.powderDelta < 0 ? -choice.powderDelta : 0;
      const needProv = choice.provisionsDelta < 0 ? -choice.provisionsDelta : 0;
      if (
        resources.silver < needSilver ||
        resources.gunpowder < needPowder ||
        resources.provisions < needProv
      ) {
        setStatusBanner(
          lang === 'en'
            ? '⚠️ Insufficient Bait al-Mal silver, powder, or provisions for this operational order.'
            : '⚠️ В казне Байт аль-маль или арсенале недостаточно припасов для этого приказа.'
        );
        return;
      }

      const isFinalPhase = phaseIdx >= ep.phases.length - 1;
      playHistoricalSound(isFinalPhase ? 'horn' : 'seal', soundEnabled);

      const bonusPowder = isFinalPhase ? 25 : 0;
      const bonusSilver = isFinalPhase ? 80 : 0;

      setResources((prev) => ({
        ...prev,
        gunpowder: Math.max(0, prev.gunpowder + (choice.powderDelta || 0) + bonusPowder),
        provisions: Math.max(0, prev.provisions + (choice.provisionsDelta || 0)),
        silver: Math.max(0, prev.silver + (choice.silverDelta || 0) + bonusSilver),
        authority: Math.max(15, Math.min(100, prev.authority + (choice.authorityDelta || 0)))
      }));

      const liberatedSet = new Set(
        [choice.liberateNaibateId, choice.alsoLiberateId].filter(Boolean)
      );
      if (isFinalPhase && episodeId === 'ep_1843_shining_ghazawat') {
        ['khunzakh', 'gergebil', 'chokh'].forEach((id) => liberatedSet.add(id));
      }
      if (liberatedSet.size > 0) {
        setImperialHeldIds((prev) => prev.filter((id) => !liberatedSet.has(id)));
      }

      const applyAllNaibsIman =
        choice.id === 'ghaz_c4_found_divan_nizams' ||
        choice.id === 'gnb_c4_honorable_peace_birch_grove';

      setNaibates((prev) =>
        prev.map((n) => {
          const isTarget = n.id === choice.targetNaibId;
          const isLiberated = liberatedSet.has(n.id);
          if (!isTarget && !isLiberated && !applyAllNaibsIman) return n;
          const pressDelta =
            (isTarget ? choice.pressureDelta || 0 : 0) + (isLiberated ? -22 : 0);
          const nextPress = Math.max(10, Math.min(96, n.imperialPressure + pressDelta));
          const imanBoost =
            applyAllNaibsIman || isTarget ? choice.imanDelta || 0 : 0;
          return {
            ...n,
            imperialPressure: nextPress,
            underSiege: isLiberated ? false : nextPress >= 78 ? n.underSiege : false,
            garrison: Math.max(
              140,
              n.garrison + (isTarget ? choice.garrisonDelta || 0 : 0) + (isLiberated ? 120 : 0)
            ),
            murtazeks: Math.max(
              40,
              (n.murtazeks || 0) + (isTarget ? choice.murtazeksDelta || 0 : 0)
            ),
            traits: imanBoost
              ? { ...n.traits, iman: Math.min(100, (n.traits?.iman || 70) + imanBoost) }
              : n.traits
          };
        })
      );

      if (choice.relocateCapitalTo?.id) {
        setCapitalNaibateId(choice.relocateCapitalTo.id);
        setCapitalLabelRu(choice.relocateCapitalTo.labelRu || 'Дарго-Ведено');
        setCapitalLabelEn(choice.relocateCapitalTo.labelEn || 'Dargo-Vedeno');
        setSelectedNaibateId(choice.relocateCapitalTo.id);
      } else if (choice.targetNaibId) {
        setSelectedNaibateId(choice.targetNaibId);
      }

      if (choice.openTacticalTerrainId) {
        setSelected3DTerrainId(choice.openTacticalTerrainId);
      }

      setEpisodesState((prev) => ({
        ...prev,
        [episodeId]: {
          phaseIdx: Math.min(ep.phases.length, phaseIdx + 1),
          completed: isFinalPhase,
          history: [
            ...(curState.history || []),
            {
              phaseId: phase.id,
              step: phase.step,
              choiceId: choice.id,
              labelRu: choice.labelRu,
              labelEn: choice.labelEn,
              chronicleRu: choice.chronicleRu,
              chronicleEn: choice.chronicleEn
            }
          ]
        }
      }));

      setChronicle((prev) => [
        {
          id: `ep-${episodeId}-${phaseIdx}-${Date.now()}`,
          turn,
          category: 'battle',
          sender: phase.speakerRu || ep.titleRu,
          senderEn: phase.speakerEn || ep.titleEn,
          title: phase.titleRu,
          titleEn: phase.titleEn,
          text: choice.chronicleRu,
          textEn: choice.chronicleEn
        },
        ...prev
      ]);

      setStatusBanner(
        lang === 'en'
          ? isFinalPhase
            ? `🏆 ${ep.titleEn} completed! Bonus +${bonusPowder}p powder & +${bonusSilver} rub. awarded!`
            : `⚔️ Operational Phase ${phaseIdx + 1}/4 executed — Phase ${phaseIdx + 2}/4 unlocked!`
          : isFinalPhase
          ? `🏆 ${ep.titleRu} — все 4 фазы операции завершены! Бонус +${bonusPowder} пуд. пороха и +${bonusSilver} руб.!`
          : `⚔️ Фаза ${phaseIdx + 1}/4 исполнена — открыта Фаза ${phaseIdx + 2}/4 операции!`
      );
    },
    [episodesState, lang, resources, soundEnabled, turn]
  );

  // Надёжное копирование текста в буфер обмена (с поддержкой iFrame через execCommand)
  const copyTextSafe = (textToCopy, successNotice) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const copied = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (copied) {
        alertMsg(successNotice);
        return;
      }
    } catch {
      // Fallback
    }
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      alertMsg(successNotice);
    }
  };

  // Переключение исторического сценария кампании (1839 / 1843 / 1845 / 1859) — полный последовательный сброс состояния эпохи
  const handleSelectScenario = (scenario) => {
    playHistoricalSound('horn', soundEnabled);
    setActiveScenarioId(scenario.id);
    setTurn(1);
    setActiveEnvoys([]);
    setResources({
      ...scenario.initialResources,
      gunpowder: (scenario.initialResources.gunpowder || 195) + (activeRelicBonuses.powderStartBonus || 0),
      silver: (scenario.initialResources.silver || 680) + (activeRelicBonuses.silverStartBonus || 0)
    });
    setNizams(INITIAL_NIZAMS);
    setCourtCases(INITIAL_COURT_CASES);
    setCrises(INITIAL_HISTORICAL_CRISES);
    setNaibRivalries(NAIB_RIVALRY_TRIANGLES);
    setTurnActionQuota({
      sealsRemaining: 3,
      maxSeals: 3,
      envoysSent: 0,
      maxEnvoysPerTurn: 2,
      nizamsEnacted: 0,
      maxNizamsPerTurn: 1,
      courtCasesResolved: 0,
      maxCourtCasesPerTurn: 1,
      stateOrdersUsed: 0,
      maxStateOrdersPerTurn: 1,
      tacticalMovesUsed: 0,
      maxTacticalMovesPerTurn: 4,
      crisesResolved: 0,
      maxCrisesPerTurn: 1
    });
    if (scenario.id === 'camp_1839') {
      setSelected3DTerrainId('akhulgo_1839');
      setTacticalMode('milyutin_siege');
    } else if (scenario.id === 'camp_1845') {
      setSelected3DTerrainId('dargo_1845');
      setTacticalMode('forest_spline');
    } else if (scenario.id === 'camp_1847') {
      setSelected3DTerrainId('salty_1847');
      setTacticalMode('milyutin_siege');
    } else if (scenario.id === 'camp_1859') {
      setSelected3DTerrainId('gunib_1859');
      setTacticalMode('milyutin_siege');
    } else {
      setSelected3DTerrainId('salty_1847');
      setTacticalMode('milyutin_siege');
    }
    setImperialAi((prev) => ({
      ...prev,
      generalIdx: scenario.generalIdx,
      turnsUntilStrike: 2
    }));
    const epId = getInitialEpisodeIdForScenario(scenario.id);
    const epObj = HISTORICAL_EPISODES.find((e) => e.id === epId) || HISTORICAL_EPISODES[2];
    const initHeldIds = epObj.initialImperialHeldIds || [];
    setEpisodesState(createInitialEpisodesState());
    setActiveEpisodeId(epObj.id);
    setActiveEpisodeModal(false);
    setCapitalNaibateId(epObj.capitalNaibateId || 'vedeno');
    setCapitalLabelRu(epObj.capitalLabelRu || 'Дарго-Ведено');
    setCapitalLabelEn(epObj.capitalLabelEn || 'Dargo-Vedeno');
    setImperialHeldIds(initHeldIds);
    setSelectedNaibateId(epObj.capitalNaibateId || 'vedeno');

    setNaibates(
      INITIAL_NAIBATES.map((n) => {
        const isHeldByEmpire = initHeldIds.includes(n.id);
        const nextPressure = isHeldByEmpire
          ? Math.max(84, Math.min(95, n.imperialPressure + 18))
          : Math.max(15, Math.min(95, n.imperialPressure + scenario.pressureModifier));
        return {
          ...n,
          imperialPressure: nextPressure,
          underSiege: isHeldByEmpire || nextPressure >= 78
        };
      })
    );
    const resetUnits = INITIAL_LIVE_FIELD_UNITS.map((u) => ({ ...u }));
    liveUnitsRef.current = resetUnits;
    setLiveFieldUnits(resetUnits);
    const resetCols = INITIAL_IMPERIAL_COLUMNS.map((col) => ({
      ...col,
      bayonets: Math.max(1200, Math.round(col.bayonets * (1 + (scenario.pressureModifier || 0) * 0.01))),
      maxBayonets: Math.max(1200, Math.round(col.maxBayonets * (1 + (scenario.pressureModifier || 0) * 0.01)))
    }));
    liveColumnsRef.current = resetCols;
    setLiveImperialColumns(resetCols);
    signalBeaconsRef.current = INITIAL_SIGNAL_BEACONS;
    setSignalBeacons(INITIAL_SIGNAL_BEACONS);
    riverBridgesRef.current = INITIAL_RIVER_BRIDGES;
    setRiverBridges(INITIAL_RIVER_BRIDGES);
    liveFortsRef.current = INITIAL_MAP_FORTIFICATIONS;
    setLiveMapFortifications(INITIAL_MAP_FORTIFICATIONS);
    setKunakSpyRings(INITIAL_KUNAK_SPY_RINGS);
    setPrologueRewardClaimed(false);
    setActiveTacticalEncounter(null);
    setActiveDivanPacket(null);
    setResolvedPacketIds([]);
    setDelayedConsequences([]);
    setHeroArcsState(createInitialHeroArcsState());
    setActiveHeroArcModal(null);
    setCampaignClimaxState(null);
    setClimaxDismissed(false);
    setLastBattleAfterActionReport(null);
    setBattleMemorials(INITIAL_BATTLE_MEMORIALS);
    setChronicle((prev) => [
      {
        id: `scen-${Date.now()}`,
        turn: 1,
        category: 'battle',
        sender: 'Военно-исторический сценарий Диван-ханы',
        senderEn: 'Divan-Khana Historical Campaign Scenario',
        title: `Загружена кампания: ${scenario.yearLabel}`,
        titleEn: `Campaign Loaded: ${scenario.yearLabelEn || scenario.yearLabel}`,
        text: `${scenario.subtitle}. Главная стратегическая задача: ${scenario.goalDesc}`,
        textEn: `${scenario.subtitleEn || scenario.subtitle}. Primary strategic objective: ${scenario.goalDescEn || scenario.goalDesc}`
      },
      ...prev
    ]);
    alertMsg(
      lang === 'en'
        ? `Loaded historical campaign: ${scenario.yearLabelEn || scenario.yearLabel}`
        : `Загружен исторический сценарий: ${scenario.yearLabel}`
    );
  };

  // Проведение Совета учёных Диван-ханы и снятие приступа «Зульмата»
  const handlePerformTarikatPractice = (practice) => {
    if (resources.silver < practice.costSilver || resources.authority < practice.costAuthority) {
      alertMsg(
        lang === 'en'
          ? 'Insufficient treasury silver or authority points to convene the Council of Ulema!'
          : 'Недостаточно средств казны или очков авторитета для созыва Совета улемов!'
      );
      return;
    }
    playHistoricalSound('seal', soundEnabled);
    setZulmatClearedCount((c) => c + 1);
    setResources((prev) => ({
      ...prev,
      silver: prev.silver - practice.costSilver,
      authority: Math.min(100, prev.authority - practice.costAuthority + practice.authorityGain)
    }));
    setNaibates((prev) =>
      prev.map((n) => ({
        ...n,
        imperialPressure: Math.max(15, n.imperialPressure - 5),
        traits: {
          ...n.traits,
          iman: Math.min(100, n.traits.iman + practice.imanBoost),
          pride: Math.max(10, n.traits.pride - 5)
        }
      }))
    );
    setChronicle((prev) => [
      {
        id: `tarikat-${Date.now()}`,
        turn,
        category: 'nizam',
        sender: practice.mentor,
        senderEn: practice.mentorEn || practice.mentor,
        title: `Совет учёных и старейшин: ${practice.title}`,
        titleEn: `Council of Scholars & Elders: ${practice.titleEn || practice.title}`,
        text: `${practice.desc} Иман всех наибов вырос на +${practice.imanBoost}, авторитет Шамиля укрепился на +${practice.authorityGain}%.`,
        textEn: `${practice.descEn || practice.desc} All Naibs’ Iman increased by +${practice.imanBoost}, Shamil’s authority strengthened by +${practice.authorityGain}%.`
      },
      ...prev
    ]);
    alertMsg(
      lang === 'en'
        ? `Convened Council of Scholars: “${practice.titleEn || practice.title}”`
        : `Проведён Совет учёных: «${practice.title}»`
    );
  };

  const selectedNaibate = useMemo(
    () => naibates.find((n) => n.id === selectedNaibateId) || naibates[0],
    [naibates, selectedNaibateId]
  );

  // Суммарные модификаторы от принятых Низамов Шамиля (чистый движок src/game/turnEngine.js)
  const nizamModifiers = useMemo(() => computeNizamModifiers(nizams), [nizams]);

  // Математическая модель давления и нагрузки на лидера (Шамиля), включая флаг Зульмата (>=80%)
  const leaderStressData = useMemo(
    () =>
      computeLeaderStress({
        naibates,
        ottomanSupport: resources.ottomanSupport,
        stressReduction: nizamModifiers.stressReduction,
        zulmatClearedCount
      }),
    [naibates, resources.ottomanSupport, nizamModifiers.stressReduction, zulmatClearedCount]
  );

  // Интегральный индекс военной устойчивости и прогресса кампании 1845 года
  const campaignAudit = useMemo(
    () =>
      computeCampaignAudit({
        naibates,
        nizams,
        globalImanBonus: nizamModifiers.globalImanBonus,
        totalStress: leaderStressData.totalStress
      }),
    [naibates, nizams, nizamModifiers.globalImanBonus, leaderStressData.totalStress]
  );

  // Математическая формула вероятности честного исполнения приказа наибом (P_exec) — 1-в-1 с FOrderProbabilityBreakdown
  const orderExecutionCalc = useMemo(
    () =>
      computeOrderExecutionBreakdown({
        naibate: selectedNaibate,
        nizamModifiers,
        attachedSilver,
        attachedPowder,
        orderType: selectedOrderType,
        routeMode,
        totalStress: leaderStressData.totalStress,
        generalMod: IMPERIAL_GENERALS[imperialAi.generalIdx]?.doctrineModifiers,
        relicObedienceBonus: activeRelicBonuses.obedienceBonus || 0,
        naibMemory: getNaibLoyaltyMemory(selectedNaibate)
      }),
    [
      selectedNaibate,
      nizamModifiers,
      attachedSilver,
      attachedPowder,
      selectedOrderType,
      routeMode,
      leaderStressData.totalStress,
      imperialAi.generalIdx,
      activeRelicBonuses.obedienceBonus
    ]
  );

  // ============================================================================
  // ПОШАГОВО-ОПЕРАТИВНАЯ МОДЕЛЬ (ВАРИАНТ Б): ОЧКИ МАРША (MP), ТУМАН ВОЙНЫ И ЛИНИИ СНАБЖЕНИЯ
  // ============================================================================
  const reconSources = useMemo(
    () =>
      buildReconSources({
        naibates,
        liveFieldUnits,
        liveMuhtasibPatrols,
        signalBeacons,
        kunakSpyRings
      }),
    [naibates, liveFieldUnits, liveMuhtasibPatrols, signalBeacons, kunakSpyRings]
  );

  const enrichedLiveFieldUnits = useMemo(
    () =>
      liveFieldUnits.map((u) => {
        const fallbackSabers =
          u.id === 'unit_baysungur'
            ? 840
            : u.id === 'unit_hadji_murat'
            ? 680
            : u.id === 'unit_talkhig_artillery'
            ? 420
            : u.id === 'unit_chapar_vedeno'
            ? 180
            : 140;
        const withSabers = {
          ...u,
          sabers: u.sabers ?? fallbackSabers,
          maxSabers: u.maxSabers ?? fallbackSabers
        };
        if (u.id === 'unit_chapar_vedeno') {
          return { ...withSabers, obediencePct: 98 };
        }
        const homeNaib = naibates.find((n) => n.id === u.homeNaibateId);
        if (!homeNaib) return { ...withSabers, obediencePct: 90 };
        const medalDisciplineBonus = (u.medals || []).length * 6;
        const rawObedience =
          54 +
          homeNaib.traits.iman * 0.34 +
          resources.authority * 0.28 -
          homeNaib.traits.pride * 0.26 -
          Math.max(0, leaderStressData.totalStress - 55) * 0.35 +
          medalDisciplineBonus;
        return {
          ...withSabers,
          obediencePct: Math.max(38, Math.min(99, Math.round(rawObedience)))
        };
      }),
    [liveFieldUnits, naibates, resources.authority, leaderStressData.totalStress]
  );

  const enrichedImperialColumns = useMemo(
    () =>
      liveImperialColumns.map((col) => {
        const isScouted = reconSources.some((s) => Math.hypot(col.x - s.x, col.y - s.y) <= s.r);
        return {
          ...col,
          fogHidden: !isScouted
        };
      }),
    [liveImperialColumns, reconSources]
  );

  // СПРИНТ 6: Читаемый ИИ и война разведки (3D-стрелки намерений генералов РИ + туман за перевалами)
  const reconIntel = useMemo(
    () =>
      buildReadableAiIntentVectors({
        imperialAi,
        imperialGenerals: IMPERIAL_GENERALS,
        liveImperialColumns: enrichedImperialColumns,
        naibates,
        reconSources,
        kunakSpyRings
      }),
    [imperialAi, enrichedImperialColumns, naibates, reconSources, kunakSpyRings]
  );

  const selectedFieldUnit = useMemo(
    () => enrichedLiveFieldUnits.find((u) => u.id === selectedUnitId) || enrichedLiveFieldUnits[0],
    [enrichedLiveFieldUnits, selectedUnitId]
  );

  const turnRef = useRef(turn);
  const liveBatteriesRef = useRef(INITIAL_MOUNTAIN_BATTERIES);
  const livePatrolsRef = useRef(INITIAL_MUHTASIB_PATROLS);

  useEffect(() => {
    turnRef.current = turn;
  }, [turn]);

  useEffect(() => {
    liveUnitsRef.current = liveFieldUnits;
  }, [liveFieldUnits]);

  useEffect(() => {
    liveBatteriesRef.current = liveMountainBatteries;
  }, [liveMountainBatteries]);

  useEffect(() => {
    livePatrolsRef.current = liveMuhtasibPatrols;
  }, [liveMuhtasibPatrols]);

  useEffect(() => {
    liveWeatherRef.current = liveWeatherFronts;
  }, [liveWeatherFronts]);

  useEffect(() => {
    liveFortsRef.current = liveMapFortifications;
  }, [liveMapFortifications]);

  useEffect(() => {
    weatherEnabledRef.current = weatherOverlayEnabled;
  }, [weatherOverlayEnabled]);

  // Пошагово-оперативный цикл (~30 FPS только во время марша/перехвата, спящий таймер 4 Гц в покое)
  useEffect(() => {
    let lastTime = performance.now();
    let lastWeatherSyncTs = 0;
    let frameId = null;
    let idleTimerId = null;

    const tickMovement = (now) => {
      const hasMovingUnits = (liveUnitsRef.current || []).some((u) => u.status === 'moving');
      const hasMovingBatteries = (liveBatteriesRef.current || []).some((b) => b.status === 'moving');
      const hasBoostedPatrols = (livePatrolsRef.current || []).some((p) => p.boosted);
      const hasMarchingColumns = (liveColumnsRef.current || []).some((c) => (c.turnMarchBudget || 0) > 0.5);

      if (!hasMovingUnits && !hasMovingBatteries && !hasBoostedPatrols && !hasMarchingColumns) {
        lastTime = now;
        setLiveSkirmishBursts((prevB) =>
          prevB.length > 0 && prevB.some((b) => now - b.createdAt >= 4200)
            ? prevB.filter((b) => now - b.createdAt < 4200)
            : prevB
        );
        idleTimerId = setTimeout(() => {
          frameId = requestAnimationFrame(tickMovement);
        }, 250);
        return;
      }

      if (now - lastTime < 33) {
        frameId = requestAnimationFrame(tickMovement);
        return;
      }

      const dt = Math.min(0.08, Math.max(0.004, (now - lastTime) / 1000));
      lastTime = now;

      const currentTurnKey = turnRef.current;

      // 1. Дрейф динамических атмосферных фронтов (туман Ичкерии, снежный буран Анди, гроза над Койсу)
      if (weatherEnabledRef.current) {
        const nextFronts = (liveWeatherRef.current || []).map((f) => {
          let nx = f.x + f.vx * dt * terrainSimSpeed;
          let ny = f.y + f.vy * dt * terrainSimSpeed;
          let nvx = f.vx;
          let nvy = f.vy;
          if (nx < f.minX || nx > f.maxX) {
            nvx = -nvx;
            nx = Math.max(f.minX, Math.min(f.maxX, nx));
          }
          if (ny < f.minY || ny > f.maxY) {
            nvy = -nvy;
            ny = Math.max(f.minY, Math.min(f.maxY, ny));
          }
          return {
            ...f,
            x: +nx.toFixed(2),
            y: +ny.toFixed(2),
            vx: nvx,
            vy: nvy
          };
        });
        liveWeatherRef.current = nextFronts;
        if (now - lastWeatherSyncTs >= 650) {
          lastWeatherSyncTs = now;
          setLiveWeatherFronts(nextFronts);
        }
      }

      // 2. Продвижение полевых отрядов Имамата с учётом рельефа SRTM, погодного фронта и дружественных башен
      setLiveFieldUnits((prevUnits) => {
        const hasMoving = prevUnits.some((u) => u.status === 'moving');
        if (!hasMoving) return prevUnits;

        const updated = prevUnits.map((unit) => {
          if (unit.status !== 'moving' || !unit.waypoints || unit.waypoints.length === 0) {
            return unit;
          }

          const wpIdx = Math.min(unit.waypointIdx, unit.waypoints.length - 1);
          const targetWp = unit.waypoints[wpIdx];
          if (!targetWp) {
            return { ...unit, status: 'arrived' };
          }

          const dx = targetWp.x - unit.x;
          const dy = targetWp.y - unit.y;
          const distToWp = Math.hypot(dx, dy);

          const currentTerrain = sampleStrategicTerrain(unit.x, unit.y);
          const currentWeather = sampleWeatherAtPoint(
            unit.x,
            unit.y,
            liveWeatherRef.current,
            weatherEnabledRef.current
          );
          const currentFort = sampleFortificationsAtPoint(unit.x, unit.y, liveFortsRef.current);
          const currentBeacon = sampleSignalBeaconBonus(unit.x, unit.y, signalBeaconsRef.current);
          const currentBridge = sampleRiverBridgeEffect(unit.x, unit.y, riverBridgesRef.current);
          const deepRaidMult = unit.deepRaidBoost ? 1.45 : 1.0;
          const unitWeatherSpeedMult = (unit.gear || []).includes('silver_gazyrs')
            ? Math.max(1.0, currentWeather.speedMult)
            : currentWeather.speedMult;
          const effectiveSpeed =
            unit.baseSpeed *
            currentTerrain.speedMult *
            unitWeatherSpeedMult *
            currentFort.friendlySpeedMult *
            currentBeacon.speedMult *
            currentBridge.friendlySpeedMult *
            deepRaidMult *
            terrainSimSpeed;
          const stepDist = effectiveSpeed * dt;
          const curMp = unit.mp ?? unit.maxMp ?? 150;
          const mpCost =
            (stepDist / Math.max(0.45, currentTerrain.speedMult * unitWeatherSpeedMult)) *
            (unit.hesitationMult || 1.0);
          const nextMp = Math.max(0, +(curMp - mpCost).toFixed(2));

          if (distToWp <= stepDist + 0.8) {
            const nextWpIdx = wpIdx + 1;
            const nextTrail =
              unit.trail.length > 0 &&
              Math.hypot(
                unit.trail[unit.trail.length - 1].x - targetWp.x,
                unit.trail[unit.trail.length - 1].y - targetWp.y
              ) < 4
                ? unit.trail
                : [...unit.trail.slice(-28), { x: +targetWp.x.toFixed(1), y: +targetWp.y.toFixed(1) }];

            if (nextWpIdx >= unit.waypoints.length) {
              return {
                ...unit,
                x: targetWp.x,
                y: targetWp.y,
                mp: nextMp,
                status: 'arrived',
                waypointIdx: unit.waypoints.length - 1,
                trail: nextTrail
              };
            }

            const nextTarget = unit.waypoints[nextWpIdx];
            const nextHeading = Math.round(
              (Math.atan2(nextTarget.y - targetWp.y, nextTarget.x - targetWp.x) * 180) / Math.PI
            );
            return {
              ...unit,
              x: targetWp.x,
              y: targetWp.y,
              mp: nextMp,
              status: nextMp <= 0.2 ? 'camped' : 'moving',
              waypointIdx: nextWpIdx,
              headingDeg: nextHeading,
              trail: nextTrail
            };
          }

          if (nextMp <= 0.05) {
            return {
              ...unit,
              mp: 0,
              status: 'camped'
            };
          }

          const vx = (dx / distToWp) * stepDist;
          const vy = (dy / distToWp) * stepDist;
          const nextX = +(unit.x + vx).toFixed(2);
          const nextY = +(unit.y + vy).toFixed(2);
          const headingDeg = Math.round((Math.atan2(dy, dx) * 180) / Math.PI);

          const lastTrailPt = unit.trail[unit.trail.length - 1];
          const shouldRecordTrail =
            !lastTrailPt || Math.hypot(nextX - lastTrailPt.x, nextY - lastTrailPt.y) >= 8.5;

          return {
            ...unit,
            x: nextX,
            y: nextY,
            mp: nextMp,
            headingDeg,
            trail: shouldRecordTrail
              ? [...unit.trail.slice(-28), { x: Math.round(nextX), y: Math.round(nextY) }]
              : unit.trail
          };
        });

        liveUnitsRef.current = updated;
        return updated;
      });

      // 3. Продвижение колонн Отдельного Кавказского корпуса, воздействие укреплений на перевалах и боевой перехват
      setLiveImperialColumns((prevCols) => {
        const nextCols = prevCols.map((col) => {
          if (!col.waypoints || col.waypoints.length === 0) return col;

          const colFortSample = sampleFortificationsAtPoint(col.x, col.y, liveFortsRef.current);

          // 3А. Проверка огневого/инженерного воздействия укрепления (засеки, каменного завала, башни) на наступающую колонну РИ
          if (col.status === 'advancing' && colFortSample.active && colFortSample.fort) {
            const fortKey = `${col.id}_${colFortSample.fort.id}`;
            const lastFortHit = lastFortStrikeRef.current[fortKey] || 0;
            if (lastFortHit !== currentTurnKey) {
              lastFortStrikeRef.current[fortKey] = currentTurnKey;
              const fortBp = colFortSample.blueprint;
              const fortDamage = fortBp.salvoDamageBayonets;
              const nextBayonets = Math.max(580, col.bayonets - fortDamage);
              const burstId = `fort-hit-${Date.now()}-${col.id}`;

              setLiveSkirmishBursts((prevB) => [
                ...prevB.slice(-3),
                {
                  id: burstId,
                  x: Math.round((col.x + colFortSample.fort.x) * 0.5),
                  y: Math.round((col.y + colFortSample.fort.y) * 0.5),
                  createdAt: now,
                  titleRu: `${fortBp.icon} ${fortBp.badgeRu.toUpperCase()}: -${fortDamage} штыков!`,
                  titleEn: `${fortBp.icon} ${fortBp.badgeEn.toUpperCase()}: -${fortDamage} bayonets!`,
                  spoilsRu: `Скорость колонны снижена ×${fortBp.enemySpeedMult}`,
                  spoilsEn: `Column slowed to ×${fortBp.enemySpeedMult}`
                }
              ]);

              setLiveMapFortifications((prevForts) =>
                prevForts.map((f) =>
                  f.id === colFortSample.fort.id
                    ? {
                        ...f,
                        totalInflicted: (f.totalInflicted || 0) + fortDamage,
                        integrity: Math.max(20, f.integrity - 4)
                      }
                    : f
                )
              );

              // Если укрепление обескровило колонну ниже 1150 штыков — колонна обращается в отступление!
              if (nextBayonets <= 1150) {
                const retreatPath = computeTerrainAwarePath(col.x, col.y, col.originX, col.originY);
                const firstRetWp = retreatPath[1] || retreatPath[0] || { x: col.originX, y: col.originY };
                setResources((prevR) => ({
                  ...prevR,
                  gunpowder: prevR.gunpowder + 10,
                  authority: Math.min(100, prevR.authority + 2)
                }));
                setUnitMovementLog((prevLog) => [
                  {
                    id: burstId,
                    time: `${fortBp.icon} Оборона перевала`,
                    textRu: `Инженерный рубеж «${fortBp.titleRu}» (${colFortSample.fort.passNameRu}) сорвал наступление «${col.nameRu}»! Колонна отступает к ${col.originNameRu}!`,
                    textEn: `Fortification “${fortBp.titleEn}” (${colFortSample.fort.passNameEn}) broke the advance of “${col.nameEn}”! Column retreating to ${col.originNameEn}!`
                  },
                  ...prevLog.slice(0, 7)
                ]);
                return {
                  ...col,
                  bayonets: nextBayonets,
                  status: 'retreating',
                  headingDeg: Math.round(
                    (Math.atan2(firstRetWp.y - col.y, firstRetWp.x - col.x) * 180) / Math.PI
                  ),
                  waypoints: retreatPath,
                  waypointIdx: Math.min(1, retreatPath.length - 1),
                  trail: [{ x: Math.round(col.x), y: Math.round(col.y) }]
                };
              }

              return {
                ...col,
                bayonets: nextBayonets
              };
            }
          }

          // 3А-bis. Проверка перерезания тыловой линии снабжения колонны отрядами Имамата (Unity of Command II)
          let physicalSupplyCut = Boolean(col.supplyCut);
          if (col.status === 'advancing' && !physicalSupplyCut) {
            const segDx = col.x - col.originX;
            const segDy = col.y - col.originY;
            const segLenSq = segDx * segDx + segDy * segDy;
            if (segLenSq > 900) {
              const raider = (liveUnitsRef.current || []).find((u) => {
                if (u.id === 'unit_powder_caravan') return false;
                const tProj = ((u.x - col.originX) * segDx + (u.y - col.originY) * segDy) / segLenSq;
                if (tProj < 0.08 || tProj > 0.84) return false;
                const px = col.originX + segDx * tProj;
                const py = col.originY + segDy * tProj;
                return Math.hypot(u.x - px, u.y - py) <= 26;
              });
              if (raider) {
                physicalSupplyCut = true;
                const cutId = `auto-supcut-${Date.now()}-${col.id}`;
                setResources((prevR) => ({
                  ...prevR,
                  gunpowder: prevR.gunpowder + 16,
                  silver: prevR.silver + 45
                }));
                setLiveSkirmishBursts((prevB) => [
                  ...prevB.slice(-4),
                  {
                    id: cutId,
                    x: Math.round((col.originX + col.x) * 0.5),
                    y: Math.round((col.originY + col.y) * 0.5),
                    createdAt: now,
                    titleRu: `✂️ ОБОЗ ОТРЕЗАН (${raider.badgeRu}): +16п пороха, +45₽`,
                    titleEn: `✂️ SUPPLY CUT (${raider.badgeEn}): +16p powder, +45r`,
                    spoilsRu: `Колонна лишена подвоза сухарей и зарядов (-14% шт./ход)`,
                    spoilsEn: `Column cut off from rations & shells (-14% bay./turn)`
                  }
                ]);
              }
            }
          }

          // 3Б. Проверка: сблизился ли отряд Имамата (или засада на перевале) с наступающей царской колонной (<= 28 ед.)
          if (col.status === 'advancing') {
            const interceptingUnit = (liveUnitsRef.current || []).find(
              (u) =>
                u.id !== 'unit_powder_caravan' &&
                (u.status === 'moving' || (col.turnMarchBudget || 0) > 0) &&
                Math.hypot(u.x - col.x, u.y - col.y) <= 28
            );
            const lastHit = lastSkirmishTimeRef.current[col.id] || 0;

            if (interceptingUnit && lastHit !== currentTurnKey) {
              lastSkirmishTimeRef.current[col.id] = currentTurnKey;
              const battleTerrain = sampleStrategicTerrain(col.x, col.y);
              const battleWeather = sampleWeatherAtPoint(
                col.x,
                col.y,
                liveWeatherRef.current,
                weatherEnabledRef.current
              );
              const fortBonus = colFortSample.active ? colFortSample.ambushBonusPct : 0;
              const supplyCutBonus = physicalSupplyCut ? 180 : 0;
              const fullProjectedCasualties = Math.min(
                Math.max(260, col.bayonets - 450),
                440 + supplyCutBonus + battleTerrain.slopeDeg * 7 + (battleWeather.ambushBonus + fortBonus) * 6
              );
              const vanguardSkirmishLoss = Math.min(180, Math.max(85, Math.round(fullProjectedCasualties * 0.26)));
              const unitSabers = interceptingUnit.sabers ?? 540;
              const winChancePct = Math.max(
                24,
                Math.min(
                  92,
                  Math.round(
                    44 +
                      battleTerrain.slopeDeg * 0.7 +
                      battleWeather.ambushBonus * 0.45 +
                      fortBonus * 0.6 +
                      (physicalSupplyCut ? 18 : 0) +
                      (unitSabers - col.bayonets * 0.24) * 0.035
                  )
                )
              );
              const autoResolveMuridLoss = Math.max(
                18,
                Math.min(
                  Math.max(40, unitSabers - 60),
                  Math.round(col.bayonets * (physicalSupplyCut ? 0.028 : 0.042) * (1 - fortBonus * 0.008))
                )
              );
              const capturedPowder =
                10 +
                (battleTerrain.slopeDeg >= 28 ? 5 : 0) +
                (battleWeather.ambushBonus > 0 ? 4 : 0) +
                (colFortSample.active ? 5 : 0) +
                (physicalSupplyCut ? 6 : 0);
              const capturedSilver = 40 + (colFortSample.active ? 20 : 0) + (physicalSupplyCut ? 25 : 0);

              const burstId = `skirmish-${Date.now()}-${col.id}`;
              const bx = Math.round((col.x + interceptingUnit.x) * 0.5);
              const by = Math.round((col.y + interceptingUnit.y) * 0.5);
              const hospSample = sampleHospitalBonusAtPoint(bx, by, fieldHospitalsRef.current);
              if (hospSample.inHospitalZone) {
                setTotalWoundedRecoveredOnMap((c) => c + hospSample.healSabersPerPulse);
              }

              setLiveSkirmishBursts((prevB) => [
                ...prevB.slice(-5),
                {
                  id: burstId,
                  x: bx,
                  y: by,
                  createdAt: now,
                  titleRu: `⚔️ АВАНГАРД ОСТАНОВЛЕН! -${vanguardSkirmishLoss} шт. • Совет боя`,
                  titleEn: `⚔️ VANGUARD HALTED! -${vanguardSkirmishLoss} bay. • Battle Council`,
                  spoilsRu: `${interceptingUnit.badgeRu} занял теснину (${battleTerrain.elevationMeters}м, ${battleTerrain.slopeDeg}°)`,
                  spoilsEn: `${interceptingUnit.badgeEn} seized defile (${battleTerrain.elevationMeters}m, ${battleTerrain.slopeDeg}°)`
                }
              ]);

              const isDagestanPlateau = col.id === 'imp_col_argutinsky' || bx >= 340;
              const remainingBayonets = Math.max(600, col.bayonets - vanguardSkirmishLoss);
              setActiveTacticalEncounter({
                id: burstId,
                pendingDecision: true,
                unitId: interceptingUnit.id,
                unitNameRu: interceptingUnit.nameRu,
                unitNameEn: interceptingUnit.nameEn,
                unitCommanderRu: interceptingUnit.commanderRu,
                unitCommanderEn: interceptingUnit.commanderEn,
                unitBadgeRu: interceptingUnit.badgeRu,
                unitBadgeEn: interceptingUnit.badgeEn,
                unitSabers,
                columnId: col.id,
                columnNameRu: col.nameRu,
                columnNameEn: col.nameEn,
                columnBadgeRu: col.badgeRu,
                columnBadgeEn: col.badgeEn,
                targetNaibateId: col.targetNaibateId,
                remainingBayonets,
                casualtiesInflicted: vanguardSkirmishLoss,
                autoResolveEnemyLoss: Math.max(220, fullProjectedCasualties - vanguardSkirmishLoss),
                autoResolveMuridLoss,
                winChancePct,
                capturedPowder,
                capturedSilver,
                x: bx,
                y: by,
                elevationMeters: battleTerrain.elevationMeters,
                slopeDeg: battleTerrain.slopeDeg,
                biomeRu: battleTerrain.biomeRu,
                biomeEn: battleTerrain.biomeEn,
                weatherBadgeRu: battleWeather.badgeRu,
                weatherBadgeEn: battleWeather.badgeEn,
                supplyCut: physicalSupplyCut,
                fortTitleRu: colFortSample.active ? colFortSample.blueprint.titleRu : null,
                fortTitleEn: colFortSample.active ? colFortSample.blueprint.titleEn : null,
                recommendedTacticalMode: isDagestanPlateau ? 'milyutin_siege' : 'spline_ambush',
                recommended3DTerrainId:
                  col.id === 'imp_col_argutinsky'
                    ? 'salty_1847'
                    : bx > 430
                    ? 'gunib_1859'
                    : 'dargo_1845'
              });

              setTotalMapInterceptions((c) => c + 1);
              setUnitMovementLog((prevLog) => [
                {
                  id: burstId,
                  time: `⚔️ Встреча в теснине ${battleTerrain.elevationMeters}м (${battleTerrain.slopeDeg}°)`,
                  textRu: `ПРЕДБОЕВОЙ СОВЕТ! «${interceptingUnit.nameRu}» (${unitSabers} саб.) перегородил путь «${col.nameRu}» (${remainingBayonets} шт.). Выберите решение: лично возглавить бой, провести авторасчёт (${winChancePct}%) или отойти в горы!`,
                  textEn: `BATTLE COUNCIL! “${interceptingUnit.nameEn}” (${unitSabers} sabers) blocked “${col.nameEn}” (${remainingBayonets} bay.). Choose: lead battle personally, auto-resolve (${winChancePct}%), or withdraw!`
                },
                ...prevLog.slice(0, 7)
              ]);

              return {
                ...col,
                supplyCut: physicalSupplyCut,
                turnMarchBudget: 0,
                bayonets: remainingBayonets,
                trail: [{ x: Math.round(col.x), y: Math.round(col.y) }]
              };
            }
          }

          if ((col.turnMarchBudget || 0) <= 0.2) {
            return physicalSupplyCut !== Boolean(col.supplyCut)
              ? { ...col, supplyCut: physicalSupplyCut }
              : col;
          }

          const wpIdx = Math.min(col.waypointIdx, col.waypoints.length - 1);
          const targetWp = col.waypoints[wpIdx];
          if (!targetWp) return { ...col, supplyCut: physicalSupplyCut, turnMarchBudget: 0 };

          const dx = targetWp.x - col.x;
          const dy = targetWp.y - col.y;
          const distToWp = Math.hypot(dx, dy);

          const colTerrain = sampleStrategicTerrain(col.x, col.y);
          const colWeather = sampleWeatherAtPoint(
            col.x,
            col.y,
            liveWeatherRef.current,
            weatherEnabledRef.current
          );
          // Тяжёлые колонны с обозами и орудиями сильнее вязнут в буранах, тумане (×0.82) и инженерных засеках (×0.25–0.34)
          const weatherPenalty = colWeather.activeFront ? colWeather.speedMult * 0.82 : 1.0;
          const fortSlowdown =
            col.status === 'advancing' && colFortSample.active ? colFortSample.enemySpeedMult : 1.0;
          const forestSample = sampleForestCanopyAtPoint(col.x, col.y, forestClearingsRef.current);
          const forestSlowdown =
            col.status === 'advancing' && forestSample.inForest ? forestSample.enemySlowdownMult : 1.0;
          const effectiveSpeed =
            col.baseSpeed *
            colTerrain.speedMult *
            weatherPenalty *
            fortSlowdown *
            forestSlowdown *
            (physicalSupplyCut ? 0.65 : 1.0) *
            (col.status === 'retreating' ? 1.35 : 1.0) *
            terrainSimSpeed;
          const rawStep = effectiveSpeed * dt;
          const stepDist = Math.min(rawStep, col.turnMarchBudget || 0);
          const nextBudget = Math.max(0, +((col.turnMarchBudget || 0) - stepDist).toFixed(2));

          if (distToWp <= stepDist + 0.8) {
            const nextWpIdx = wpIdx + 1;
            if (nextWpIdx >= col.waypoints.length) {
              // Если колонна отступила в крепость — перегруппировывается, восстанавливает обоз и ждёт следующего хода
              if (col.status === 'retreating') {
                const advancePath = computeTerrainAwarePath(
                  col.originX,
                  col.originY,
                  col.targetX,
                  col.targetY
                );
                const firstAdv = advancePath[1] || advancePath[0];
                return {
                  ...col,
                  x: col.originX,
                  y: col.originY,
                  bayonets: col.maxBayonets,
                  supplyCut: false,
                  turnMarchBudget: 0,
                  status: 'advancing',
                  headingDeg: Math.round(
                    (Math.atan2(firstAdv.y - col.originY, firstAdv.x - col.originX) * 180) / Math.PI
                  ),
                  waypoints: advancePath,
                  waypointIdx: Math.min(1, advancePath.length - 1),
                  trail: [{ x: col.originX, y: col.originY }]
                };
              }
              // Если колонна дошла до целевого наибства без перехвата — наносит удар и отходит за боеприпасами
              const retreatPath = computeTerrainAwarePath(
                targetWp.x,
                targetWp.y,
                col.originX,
                col.originY
              );
              return {
                ...col,
                x: targetWp.x,
                y: targetWp.y,
                supplyCut: physicalSupplyCut,
                turnMarchBudget: 0,
                status: 'retreating',
                waypoints: retreatPath,
                waypointIdx: Math.min(1, retreatPath.length - 1),
                trail: [{ x: Math.round(targetWp.x), y: Math.round(targetWp.y) }]
              };
            }

            const nextTarget = col.waypoints[nextWpIdx];
            return {
              ...col,
              x: targetWp.x,
              y: targetWp.y,
              supplyCut: physicalSupplyCut,
              turnMarchBudget: nextBudget,
              waypointIdx: nextWpIdx,
              headingDeg: Math.round(
                (Math.atan2(nextTarget.y - targetWp.y, nextTarget.x - targetWp.x) * 180) / Math.PI
              ),
              trail: [...col.trail.slice(-20), { x: Math.round(targetWp.x), y: Math.round(targetWp.y) }]
            };
          }

          const vx = (dx / distToWp) * stepDist;
          const vy = (dy / distToWp) * stepDist;
          const nextX = +(col.x + vx).toFixed(2);
          const nextY = +(col.y + vy).toFixed(2);
          const headingDeg = Math.round((Math.atan2(dy, dx) * 180) / Math.PI);

          return {
            ...col,
            x: nextX,
            y: nextY,
            supplyCut: physicalSupplyCut,
            turnMarchBudget: nextBudget,
            headingDeg,
            trail:
              !col.trail.length ||
              Math.hypot(
                nextX - col.trail[col.trail.length - 1].x,
                nextY - col.trail[col.trail.length - 1].y
              ) >= 9
                ? [...col.trail.slice(-20), { x: Math.round(nextX), y: Math.round(nextY) }]
                : col.trail
          };
        });
        liveColumnsRef.current = nextCols;
        return nextCols;
      });

      // 4. СПРИНТ 27 (M27): Движение живых вьючных караванов снабжения Имамата (селитра Гуниба, зерно Шали, свинец Чоха)
      setLiveSupplyCaravans((prevCaravans) =>
        prevCaravans.map((car) => {
          if (!car.waypoints || car.waypoints.length === 0) return car;

          // Проверка: прикрывает ли караван хотя бы один отряд Имамата в радиусе 38 px
            const escortUnit = (liveUnitsRef.current || []).find(
              (u) => Math.hypot(u.x - car.x, u.y - car.y) <= 38
            );
            const isEscorted = Boolean(escortUnit);
            if (!isEscorted && !hasMarchingColumns) {
              return car;
            }

          // Проверка: перехватила ли неприкрытый караван наступающая колонна РИ (в радиусе 26 px)
          if (car.status === 'delivering' && !isEscorted) {
            const raidingCol = (liveColumnsRef.current || []).find(
              (c) => c.status === 'advancing' && Math.hypot(c.x - car.x, c.y - car.y) <= 26
            );
            const lastCarHit = lastCaravanEventRef.current[car.id] || 0;
            if (raidingCol && lastCarHit !== currentTurnKey) {
              lastCaravanEventRef.current[car.id] = currentTurnKey;
              const backPath = computeTerrainAwarePath(car.x, car.y, car.originX, car.originY);
              const firstBack = backPath[1] || backPath[0] || { x: car.originX, y: car.originY };
              const burstId = `caravan-raid-${Date.now()}-${car.id}`;

              setLiveSkirmishBursts((prevB) => [
                ...prevB.slice(-5),
                {
                  id: burstId,
                  x: Math.round(car.x),
                  y: Math.round(car.y),
                  createdAt: now,
                  titleRu: `⚠️ РАЗЪЕЗД РИ РАССЕЯЛ ${car.badgeRu}!`,
                  titleEn: `⚠️ IMPERIAL PATROL SCATTERED ${car.badgeEn}!`,
                  spoilsRu: `Прикройте караван отрядом мюридов!`,
                  spoilsEn: `Escort the caravan with a Murid unit!`
                }
              ]);

              setUnitMovementLog((prevLog) => [
                {
                  id: burstId,
                  time: `⚠️ Угроза обозу`,
                  textRu: `Разъезд колонны «${raidingCol.badgeRu}» перехватил неприкрытый «${car.nameRu}»! Вьюки возвращаются в ${car.originNameRu}. Выделите конвой!`,
                  textEn: `Scouts of “${raidingCol.badgeEn}” intercepted unescorted “${car.nameEn}”! Pack-train retreating to ${car.originNameEn}. Assign an escort!`
                },
                ...prevLog.slice(0, 7)
              ]);

              return {
                ...car,
                status: 'returning',
                escorted: false,
                headingDeg: Math.round(
                  (Math.atan2(firstBack.y - car.y, firstBack.x - car.x) * 180) / Math.PI
                ),
                waypoints: backPath,
                waypointIdx: Math.min(1, backPath.length - 1),
                trail: [{ x: Math.round(car.x), y: Math.round(car.y) }]
              };
            }
          }

          const wpIdx = Math.min(car.waypointIdx, car.waypoints.length - 1);
          const targetWp = car.waypoints[wpIdx];
          if (!targetWp) return { ...car, escorted: isEscorted };

          const dx = targetWp.x - car.x;
          const dy = targetWp.y - car.y;
          const distToWp = Math.hypot(dx, dy);

          const carTerr = sampleStrategicTerrain(car.x, car.y);
          const carWea = sampleWeatherAtPoint(
            car.x,
            car.y,
            liveWeatherRef.current,
            weatherEnabledRef.current
          );
          const escortBoost = isEscorted ? 1.35 : 1.0;
          const effectiveSpeed =
            car.baseSpeed * carTerr.speedMult * carWea.speedMult * escortBoost * terrainSimSpeed;
          const stepDist = effectiveSpeed * dt;

          if (distToWp <= stepDist + 0.8) {
            const nextWpIdx = wpIdx + 1;
            if (nextWpIdx >= car.waypoints.length) {
              // Если караван под охраной отряда успешно дошёл до столицы Дарго-Ведено (225, 195) — разгружает припасы в Байт аль-маль (1 раз за ход)!
              const delivTurnKey = `deliv_${car.id}`;
              if (
                car.status === 'delivering' &&
                isEscorted &&
                lastCaravanEventRef.current[delivTurnKey] !== currentTurnKey
              ) {
                lastCaravanEventRef.current[delivTurnKey] = currentTurnKey;
                const delivId = `car-deliv-${Date.now()}-${car.id}`;
                const bonusMult = isEscorted ? 1.25 : 1.0;
                const gainedPowder = Math.round(car.cargoPowder * bonusMult);
                const gainedProv = Math.round(car.cargoProvisions * bonusMult);
                const gainedSilver = Math.round(car.cargoSilver * bonusMult);

                setTotalCaravansDelivered((c) => c + 1);
                setResources((prevR) => ({
                  ...prevR,
                  gunpowder: prevR.gunpowder + gainedPowder,
                  provisions: prevR.provisions + gainedProv,
                  silver: prevR.silver + gainedSilver
                }));

                setLiveSkirmishBursts((prevB) => [
                  ...prevB.slice(-5),
                  {
                    id: delivId,
                    x: 225,
                    y: 195,
                    createdAt: now,
                    titleRu: `${car.icon} ДОСТАВЛЕНО В ВЕДЕНО: +${gainedPowder}п пороха, +${gainedProv} зерна`,
                    titleEn: `${car.icon} DELIVERED TO VEDENO: +${gainedPowder}p powder, +${gainedProv} grain`,
                    spoilsRu: `Казна Байт аль-маль +${gainedSilver} руб. серебра`,
                    spoilsEn: `Bayt al-Mal Treasury +${gainedSilver} silver rub.`
                  }
                ]);

                setUnitMovementLog((prevLog) => [
                  {
                    id: delivId,
                    time: `${car.icon} Байт аль-маль`,
                    textRu: `В столицу Дарго-Ведено прибыл «${car.nameRu}»: +${gainedPowder} пуд. пороха, +${gainedProv} мер зерна и +${gainedSilver} руб. серебра!`,
                    textEn: `“${car.nameEn}” arrived in Dargo-Vedeno: +${gainedPowder} poods powder, +${gainedProv} grain & +${gainedSilver} silver rub.!`
                  },
                  ...prevLog.slice(0, 7)
                ]);

                const returnPath = computeTerrainAwarePath(225, 195, car.originX, car.originY);
                const firstRet = returnPath[1] || returnPath[0];
                return {
                  ...car,
                  x: 225,
                  y: 195,
                  status: 'returning',
                  escorted: isEscorted,
                  headingDeg: Math.round(
                    (Math.atan2(firstRet.y - 195, firstRet.x - 225) * 180) / Math.PI
                  ),
                  waypoints: returnPath,
                  waypointIdx: Math.min(1, returnPath.length - 1),
                  trail: [{ x: 225, y: 195 }]
                };
              }

              // Если караван вернулся в родное наибство — загружает новую партию селитры/зерна и снова идёт в Ведено
              const deliverPath = computeTerrainAwarePath(car.originX, car.originY, 225, 195);
              const firstDel = deliverPath[1] || deliverPath[0];
              return {
                ...car,
                x: car.originX,
                y: car.originY,
                status: 'delivering',
                escorted: isEscorted,
                headingDeg: Math.round(
                  (Math.atan2(firstDel.y - car.originY, firstDel.x - car.originX) * 180) / Math.PI
                ),
                waypoints: deliverPath,
                waypointIdx: Math.min(1, deliverPath.length - 1),
                trail: [{ x: car.originX, y: car.originY }]
              };
            }

            const nextTarget = car.waypoints[nextWpIdx];
            return {
              ...car,
              x: targetWp.x,
              y: targetWp.y,
              escorted: isEscorted,
              waypointIdx: nextWpIdx,
              headingDeg: Math.round(
                (Math.atan2(nextTarget.y - targetWp.y, nextTarget.x - targetWp.x) * 180) / Math.PI
              ),
              trail: [...car.trail.slice(-16), { x: Math.round(targetWp.x), y: Math.round(targetWp.y) }]
            };
          }

          const vx = (dx / distToWp) * stepDist;
          const vy = (dy / distToWp) * stepDist;
          const nextX = +(car.x + vx).toFixed(2);
          const nextY = +(car.y + vy).toFixed(2);
          return {
            ...car,
            x: nextX,
            y: nextY,
            escorted: isEscorted,
            headingDeg: Math.round((Math.atan2(dy, dx) * 180) / Math.PI),
            trail:
              !car.trail.length ||
              Math.hypot(
                nextX - car.trail[car.trail.length - 1].x,
                nextY - car.trail[car.trail.length - 1].y
              ) >= 10
                ? [...car.trail.slice(-16), { x: Math.round(nextX), y: Math.round(nextY) }]
                : car.trail
          };
        })
      );

      // 5. СПРИНТ 27 (M27): Проверка штурма русских кордонных крепостей (Грозная, Внезапная, Темир-Хан-Шура) отрядами Имамата
      setCordonFortresses((prevForts) => {
        let changed = false;
        const nextForts = prevForts.map((cf) => {
          const assaultingUnit = (liveUnitsRef.current || []).find(
            (u) => u.status === 'moving' && Math.hypot(u.x - cf.x, u.y - cf.y) <= 28
          );
          const lastAssault = lastFortressAssaultRef.current[cf.id] || 0;
          if (!assaultingUnit || lastAssault === currentTurnKey) {
            return cf;
          }

          changed = true;
          lastFortressAssaultRef.current[cf.id] = currentTurnKey;
          const stormId = `cordon-storm-${Date.now()}-${cf.id}`;
          const nextIntegrity = cf.integrity <= 40 ? 100 : cf.integrity - 35;

          setTotalFortressesStormed((s) => s + 1);
          setResources((prevR) => ({
            ...prevR,
            gunpowder: prevR.gunpowder + cf.lootPowder,
            silver: prevR.silver + cf.lootSilver,
            provisions: prevR.provisions + cf.lootProvisions,
            authority: Math.min(100, prevR.authority + 6)
          }));
          setNaibates((prevN) =>
            prevN.map((n) => ({
              ...n,
              imperialPressure: Math.max(10, n.imperialPressure - cf.pressureDrop),
              underSiege: false
            }))
          );

          setLiveSkirmishBursts((prevB) => [
            ...prevB.slice(-5),
            {
              id: stormId,
              x: cf.x,
              y: cf.y + 12,
              createdAt: now,
              titleRu: `🔥 ШТУРМ ${cf.badgeRu}! +${cf.lootPowder}п пороха, +${cf.lootSilver} руб.`,
              titleEn: `🔥 STORMED ${cf.badgeEn}! +${cf.lootPowder}p powder, +${cf.lootSilver} rub.`,
              spoilsRu: `Натиск во всех наибствах -${cf.pressureDrop}% | Авторитет +6%`,
              spoilsEn: `All Naibates Pressure -${cf.pressureDrop}% | Authority +6%`
            }
          ]);

          setUnitMovementLog((prevLog) => [
            {
              id: stormId,
              time: `🔥 Прорыв кордона`,
              textRu: `ШТУРМ КОРДОННОЙ ЛИНИИ! «${assaultingUnit.nameRu}» ворвался на редуты «${cf.nameRu}»: захвачен артиллерийский парк (+${cf.lootPowder} пуд. пороха, +${cf.lootSilver} руб., +${cf.lootProvisions} мер сухарей), натиск РИ снижен на -${cf.pressureDrop}%!`,
              textEn: `CORDON FORTRESS STORMED! “${assaultingUnit.nameEn}” breached “${cf.nameEn}”: captured artillery park (+${cf.lootPowder} poods powder, +${cf.lootSilver} rub., +${cf.lootProvisions} rations), Imperial pressure dropped by -${cf.pressureDrop}%!`
            },
            ...prevLog.slice(0, 7)
          ]);

          return {
            ...cf,
            integrity: nextIntegrity,
            garrisonBayonets: Math.max(900, cf.garrisonBayonets - 350),
            breachedCount: (cf.breachedCount || 0) + 1
          };
        });
        return changed ? nextForts : prevForts;
      });

      // 5Б. СПРИНТ 28 (M28): Проверка глубоких конных рейдов за линию Терека и Сунжи (отвлечение царских колонн в тыл)
      setDeepRaidTargets((prevRaids) => {
        let changed = false;
        const nextRaids = prevRaids.map((rt) => {
          const raidingUnit = (liveUnitsRef.current || []).find(
            (u) => u.status === 'moving' && Math.hypot(u.x - rt.x, u.y - rt.y) <= 26
          );
          const lastRaid = lastDeepRaidRef.current[rt.id] || 0;
          if (!raidingUnit || lastRaid === currentTurnKey) {
            return rt;
          }

          changed = true;
          lastDeepRaidRef.current[rt.id] = currentTurnKey;
          const raidBurstId = `deep-raid-${Date.now()}-${rt.id}`;

          setTotalDeepRaidsCompleted((c) => c + 1);
          setResources((prevR) => ({
            ...prevR,
            gunpowder: prevR.gunpowder + rt.lootPowder,
            silver: prevR.silver + rt.lootSilver,
            provisions: prevR.provisions + rt.lootProvisions,
            authority: Math.min(100, prevR.authority + 5)
          }));

          // Отвлекаем связанную царскую колонну — она немедленно сворачивает наступление и спешит назад к кордону!
          setLiveImperialColumns((prevCols) => {
            const nextCols = prevCols.map((col) => {
              if (
                (col.id !== rt.divertsColumnId &&
                  !(rt.divertsColumnId === 'imp_col_freytag' && col.id.includes('freitag'))) ||
                col.status === 'retreating'
              ) {
                return col;
              }
              const retreatPath = computeTerrainAwarePath(col.x, col.y, col.originX, col.originY);
              const firstRet = retreatPath[1] || retreatPath[0] || { x: col.originX, y: col.originY };
              return {
                ...col,
                status: 'retreating',
                headingDeg: Math.round(
                  (Math.atan2(firstRet.y - col.y, firstRet.x - col.x) * 180) / Math.PI
                ),
                waypoints: retreatPath,
                waypointIdx: Math.min(1, retreatPath.length - 1),
                trail: [{ x: Math.round(col.x), y: Math.round(col.y) }]
              };
            });
            liveColumnsRef.current = nextCols;
            return nextCols;
          });

          setLiveSkirmishBursts((prevB) => [
            ...prevB.slice(-5),
            {
              id: raidBurstId,
              x: rt.x,
              y: rt.y + 14,
              createdAt: now,
              titleRu: `🐎 РЕЙД В ТЫЛ РИ (${rt.badgeRu})! +${rt.lootPowder}п пороха, +${rt.lootSilver}р`,
              titleEn: `🐎 DEEP REAR RAID (${rt.badgeEn})! +${rt.lootPowder}p powder, +${rt.lootSilver}r`,
              spoilsRu: `Отвлечена ${rt.divertsColumnBadgeRu} → отступает к кордону!`,
              spoilsEn: `Diverted ${rt.divertsColumnBadgeEn} → retreating to cordon!`
            }
          ]);

          setUnitMovementLog((prevLog) => [
            {
              id: raidBurstId,
              time: `🐎 Рейд за Терек`,
              textRu: `ГЛУБОКИЙ РЕЙД ЗА КОРДОН! «${raidingUnit.nameRu}» разгромил «${rt.nameRu}» (+${rt.lootPowder} пуд. пороха, +${rt.lootSilver} руб.), вынудив ${rt.divertsColumnBadgeRu} прекратить поход на горы и повернуть в тыл!`,
              textEn: `DEEP RAID BEYOND CORDON! “${raidingUnit.nameEn}” raided “${rt.nameEn}” (+${rt.lootPowder} poods powder, +${rt.lootSilver} rub.), forcing ${rt.divertsColumnBadgeEn} to abort its mountain offensive and retreat!`
            },
            ...prevLog.slice(0, 7)
          ]);

          return {
            ...rt,
            raidedCount: (rt.raidedCount || 0) + 1
          };
        });
        return changed ? nextRaids : prevRaids;
      });

      // 5В. СПРИНТ 29 (M29): Проверка подхода царских колонн к разобранным горным мостам через Аргун, Койсу и Сунжу
      (riverBridgesRef.current || []).forEach((br) => {
        if (br.status !== 'dismantled') return;
        const blockedCol = (liveColumnsRef.current || []).find(
          (col) => col.status === 'advancing' && Math.hypot(col.x - br.x, col.y - br.y) <= br.radius
        );
        const lastDetour = lastBridgeDetourRef.current[br.id] || 0;
        if (!blockedCol || lastDetour === currentTurnKey) return;

        lastBridgeDetourRef.current[br.id] = currentTurnKey;
        const bridgeBurstId = `bridge-detour-${Date.now()}-${br.id}`;

        setLiveImperialColumns((prevCols) => {
          const nextCols = prevCols.map((col) => {
            if (col.id !== blockedCol.id) return col;
            const seg1 = computeTerrainAwarePath(col.x, col.y, br.detourX, br.detourY);
            const seg2 = computeTerrainAwarePath(br.detourX, br.detourY, col.targetX, col.targetY);
            const combinedPath = [...seg1, ...seg2.slice(1)];
            const firstWp = combinedPath[1] || combinedPath[0] || { x: br.detourX, y: br.detourY };
            return {
              ...col,
              bayonets: Math.max(600, col.bayonets - 160),
              headingDeg: Math.round(
                (Math.atan2(firstWp.y - col.y, firstWp.x - col.x) * 180) / Math.PI
              ),
              waypoints: combinedPath,
              waypointIdx: Math.min(1, combinedPath.length - 1),
              trail: [...(col.trail || []).slice(-14), { x: Math.round(col.x), y: Math.round(col.y) }]
            };
          });
          liveColumnsRef.current = nextCols;
          return nextCols;
        });

        setResources((prevR) => ({
          ...prevR,
          authority: Math.min(100, prevR.authority + 2)
        }));

        setLiveSkirmishBursts((prevB) => [
          ...prevB.slice(-5),
          {
            id: bridgeBurstId,
            x: br.x,
            y: br.y,
            createdAt: now,
            titleRu: `🌉 МОСТ РАЗОБРАН (${br.badgeRu})! -160 шт. РИ`,
            titleEn: `🌉 BRIDGE BLOWN (${br.badgeEn})! -160 bayonets`,
            spoilsRu: `Колонна вынуждена идти в обход через высокогорный перевал!`,
            spoilsEn: `Imperial column forced onto a high-mountain detour pass!`
          }
        ]);

        setUnitMovementLog((prevLog) => [
          {
            id: bridgeBurstId,
            time: `🌉 Разбор переправы`,
            textRu: `ПЕРЕПРАВА СОРВАНА! «${blockedCol.nameRu}» упёрлась в разобранный «${br.nameRu}» под огнём мюридов (-160 штыков) и вынуждена повернуть в круговой обход через скальный перевал!`,
            textEn: `CROSSING DENIED! “${blockedCol.nameEn}” hit the dismantled “${br.nameEn}” under sharpshooter fire (-160 bayonets) and was forced onto a mountain detour!`
          },
          ...prevLog.slice(0, 7)
        ]);
      });

      // 5Г. СПРИНТ 29 (M29): Живое движение конных разъездов мухтасибов и кадиев между аулами (60 FPS)
      setLiveMuhtasibPatrols((prevPatrols) =>
        prevPatrols.map((pat) => {
          if (!pat.waypoints || pat.waypoints.length === 0) return pat;
          const wpIdx = Math.min(pat.waypointIdx, pat.waypoints.length - 1);
          const targetWp = pat.waypoints[wpIdx] || { x: pat.targetX, y: pat.targetY };
          const dx = targetWp.x - pat.x;
          const dy = targetWp.y - pat.y;
          const distToWp = Math.hypot(dx, dy);

          const patTerr = sampleStrategicTerrain(pat.x, pat.y);
          const patBeacon = sampleSignalBeaconBonus(pat.x, pat.y, signalBeaconsRef.current);
          const patBridge = sampleRiverBridgeEffect(pat.x, pat.y, riverBridgesRef.current);
          const boostMult = pat.boosted ? 1.4 : 1.0;
          const stepDist =
            pat.baseSpeed *
            patTerr.speedMult *
            patBeacon.speedMult *
            patBridge.friendlySpeedMult *
            boostMult *
            terrainSimSpeed *
            dt;

          if (distToWp <= stepDist + 0.9) {
            const nextWpIdx = wpIdx + 1;
            if (nextWpIdx >= pat.waypoints.length) {
              // Инспекция прибыла в целевое наибство — укрепляет лояльность (+5%), снижает давление (-6%) и выбирает следующий аул!
              const lastInsp = lastMuhtasibInspectRef.current[pat.id] || 0;
              if (pat.boosted && lastInsp !== currentTurnKey) {
                lastMuhtasibInspectRef.current[pat.id] = currentTurnKey;
                setTotalMuhtasibInspections((c) => c + 1);
                setResources((prevR) => ({
                  ...prevR,
                  silver: prevR.silver + 22,
                  gunpowder: prevR.gunpowder + 6,
                  authority: Math.min(100, prevR.authority + 1)
                }));
                setNaibates((prevN) =>
                  prevN.map((n) =>
                    n.id === pat.targetNaibateId
                      ? {
                          ...n,
                          loyalty: Math.min(100, n.loyalty + 5),
                          imperialPressure: Math.max(10, n.imperialPressure - 6)
                        }
                      : n
                  )
                );
                setUnitMovementLog((prevLog) => [
                  {
                    id: `muhtasib-${Date.now()}-${pat.id}`,
                    time: `${pat.icon} Ревизия мухтасиба`,
                    textRu: `«${pat.nameRu}» провёл шариатскую ревизию в округе «${pat.targetNameRu}»: лояльность наиба +5%, натиск лазутчиков РИ -6%, в Байт-уль-Мал взыскано +22 руб. и +6 пуд. пороха!`,
                    textEn: `“${pat.nameEn}” completed Sharia inspection in “${pat.targetNameEn}”: Naib loyalty +5%, Imperial spy pressure -6%, collected +22 rub. & +6 poods powder!`
                  },
                  ...prevLog.slice(0, 7)
                ]);
              }

              // Выбираем следующее наибство по кольцевому маршруту
              const curIdx = INITIAL_NAIBATES.findIndex((n) => n.id === pat.targetNaibateId);
              const nextNaib =
                INITIAL_NAIBATES[(curIdx + 3 + INITIAL_NAIBATES.length) % INITIAL_NAIBATES.length] ||
                INITIAL_NAIBATES[0];
              const nextPath = computeTerrainAwarePath(
                targetWp.x,
                targetWp.y,
                nextNaib.coords.x,
                nextNaib.coords.y
              );
              const firstNextWp = nextPath[1] || nextPath[0] || nextNaib.coords;
              return {
                ...pat,
                x: targetWp.x,
                y: targetWp.y,
                boosted: false,
                targetNaibateId: nextNaib.id,
                targetNameRu: nextNaib.name,
                targetNameEn: nextNaib.nameEn || nextNaib.name,
                targetX: nextNaib.coords.x,
                targetY: nextNaib.coords.y,
                headingDeg: Math.round(
                  (Math.atan2(firstNextWp.y - targetWp.y, firstNextWp.x - targetWp.x) * 180) / Math.PI
                ),
                waypoints: nextPath,
                waypointIdx: Math.min(1, nextPath.length - 1),
                trail: [{ x: Math.round(targetWp.x), y: Math.round(targetWp.y) }]
              };
            }

            const nextTarget = pat.waypoints[nextWpIdx];
            return {
              ...pat,
              x: targetWp.x,
              y: targetWp.y,
              waypointIdx: nextWpIdx,
              headingDeg: Math.round(
                (Math.atan2(nextTarget.y - targetWp.y, nextTarget.x - targetWp.x) * 180) / Math.PI
              ),
              trail: [...(pat.trail || []).slice(-14), { x: Math.round(targetWp.x), y: Math.round(targetWp.y) }]
            };
          }

          const vx = (dx / distToWp) * stepDist;
          const vy = (dy / distToWp) * stepDist;
          const nextX = +(pat.x + vx).toFixed(2);
          const nextY = +(pat.y + vy).toFixed(2);
          return {
            ...pat,
            x: nextX,
            y: nextY,
            headingDeg: Math.round((Math.atan2(dy, dx) * 180) / Math.PI),
            trail:
              !pat.trail.length ||
              Math.hypot(
                nextX - pat.trail[pat.trail.length - 1].x,
                nextY - pat.trail[pat.trail.length - 1].y
              ) >= 10
                ? [...pat.trail.slice(-14), { x: Math.round(nextX), y: Math.round(nextY) }]
                : pat.trail
          };
        })
      );

      // 5Д. СПРИНТ 30 (M30): Передвижные горные батареи Яхьи аль-Мильки и Хаджи-Юсуфа + навесной обстрел колонн РИ
      setLiveMountainBatteries((prevBats) => {
        if (!prevBats.some((b) => b.status === 'moving')) return prevBats;
        return prevBats.map((bat) => {
          const batTerr = sampleStrategicTerrain(bat.x, bat.y);
          // Проверка: есть ли наступающая царская колонна в радиусе навесного огня горных единорогов (<= bat.range)
          const targetCol = (liveColumnsRef.current || []).find(
            (col) => col.status === 'advancing' && Math.hypot(col.x - bat.x, col.y - bat.y) <= bat.range
          );
          const lastSalvo = lastBatterySalvoRef.current[bat.id] || 0;
          if (bat.status === 'moving' && targetCol && lastSalvo !== currentTurnKey) {
            lastBatterySalvoRef.current[bat.id] = currentTurnKey;
            const highGroundBonus = batTerr.elevationMeters >= 1500 ? 35 : 0;
            const salvoLosses = bat.salvoDamage + highGroundBonus;
            const salvoId = `battery-salvo-${Date.now()}-${bat.id}`;

            setTotalBatterySalvos((c) => c + 1);
            setLiveImperialColumns((prevCols) => {
              const nextCols = prevCols.map((col) => {
                if (col.id !== targetCol.id) return col;
                const remBayonets = Math.max(580, col.bayonets - salvoLosses);
                if (remBayonets <= 1100) {
                  const retreatPath = computeTerrainAwarePath(col.x, col.y, col.originX, col.originY);
                  const firstRet = retreatPath[1] || retreatPath[0] || { x: col.originX, y: col.originY };
                  return {
                    ...col,
                    bayonets: remBayonets,
                    status: 'retreating',
                    headingDeg: Math.round(
                      (Math.atan2(firstRet.y - col.y, firstRet.x - col.x) * 180) / Math.PI
                    ),
                    waypoints: retreatPath,
                    waypointIdx: Math.min(1, retreatPath.length - 1),
                    trail: [{ x: Math.round(col.x), y: Math.round(col.y) }]
                  };
                }
                return { ...col, bayonets: remBayonets };
              });
              liveColumnsRef.current = nextCols;
              return nextCols;
            });

            setLiveSkirmishBursts((prevB) => [
              ...prevB.slice(-3),
              {
                id: salvoId,
                x: Math.round((bat.x + targetCol.x) * 0.5),
                y: Math.round((bat.y + targetCol.y) * 0.5),
                createdAt: now,
                titleRu: `💣 ЗАЛП ЕДИНОРОГОВ (${bat.badgeRu}): -${salvoLosses} шт.`,
                titleEn: `💣 UNICORN SALVO (${bat.badgeEn}): -${salvoLosses} bay.`,
                spoilsRu: `Навесной огонь с высоты ${batTerr.elevationMeters}м по «${targetCol.badgeRu}»`,
                spoilsEn: `Plunging fire from ${batTerr.elevationMeters}m ridge on “${targetCol.badgeEn}”`
              }
            ]);

            setUnitMovementLog((prevLog) => [
              {
                id: salvoId,
                time: `💣 Горная артиллерия`,
                textRu: `НАВЕСНОЙ ЗАЛП С ГРЕБНЯ (${batTerr.elevationMeters}м)! «${bat.nameRu}» накрыла гранатами «${targetCol.nameRu}» (-${salvoLosses} штыков)!`,
                textEn: `PLUNGING ARTILLERY SALVO (${batTerr.elevationMeters}m)! “${bat.nameEn}” shelled “${targetCol.nameEn}” (-${salvoLosses} bayonets)!`
              },
              ...prevLog.slice(0, 7)
            ]);
          }

          if (bat.status !== 'moving' || !bat.waypoints || bat.waypoints.length === 0) {
            return bat;
          }
          const wpIdx = Math.min(bat.waypointIdx, bat.waypoints.length - 1);
          const targetWp = bat.waypoints[wpIdx];
          if (!targetWp) return { ...bat, status: 'deployed' };

          const dx = targetWp.x - bat.x;
          const dy = targetWp.y - bat.y;
          const distToWp = Math.hypot(dx, dy);
          const stepDist = bat.baseSpeed * batTerr.speedMult * terrainSimSpeed * dt;

          if (distToWp <= stepDist + 0.8) {
            const nextWpIdx = wpIdx + 1;
            if (nextWpIdx >= bat.waypoints.length) {
              return {
                ...bat,
                x: targetWp.x,
                y: targetWp.y,
                status: 'deployed',
                waypointIdx: bat.waypoints.length - 1
              };
            }
            const nextTarget = bat.waypoints[nextWpIdx];
            return {
              ...bat,
              x: targetWp.x,
              y: targetWp.y,
              waypointIdx: nextWpIdx,
              headingDeg: Math.round(
                (Math.atan2(nextTarget.y - targetWp.y, nextTarget.x - targetWp.x) * 180) / Math.PI
              ),
              trail: [...(bat.trail || []).slice(-12), { x: Math.round(targetWp.x), y: Math.round(targetWp.y) }]
            };
          }

          const vx = (dx / distToWp) * stepDist;
          const vy = (dy / distToWp) * stepDist;
          return {
            ...bat,
            x: +(bat.x + vx).toFixed(2),
            y: +(bat.y + vy).toFixed(2),
            headingDeg: Math.round((Math.atan2(dy, dx) * 180) / Math.PI)
          };
        });
      });

      // 5Е. СПРИНТ 30 (M30): Сезонный перегон отар между зимними кутанами и альпийскими пастбищами-джайляу (60 FPS)
      setLiveTranshumanceFlocks((prevFlocks) =>
        prevFlocks.map((fl) => {
          const isGuarded = (liveUnitsRef.current || []).some(
            (u) => Math.hypot(u.x - fl.x, u.y - fl.y) <= 38
          );
          const wpIdx = Math.min(fl.waypointIdx, fl.waypoints.length - 1);
          const targetWp = fl.waypoints[wpIdx] || { x: fl.dzhaylyauX, y: fl.dzhaylyauY };
          const dx = targetWp.x - fl.x;
          const dy = targetWp.y - fl.y;
          const distToWp = Math.hypot(dx, dy);

          const flTerr = sampleStrategicTerrain(fl.x, fl.y);
          const guardMult = isGuarded ? 1.3 : 1.0;
          const stepDist = fl.baseSpeed * flTerr.speedMult * guardMult * terrainSimSpeed * dt;

          if (distToWp <= stepDist + 0.9) {
            const nextWpIdx = wpIdx + 1;
            if (nextWpIdx >= fl.waypoints.length) {
              const lastEv = lastFlockEventRef.current[fl.id] || 0;
              if (isGuarded && lastEv !== currentTurnKey) {
                lastFlockEventRef.current[fl.id] = currentTurnKey;
                const bonusMult = isGuarded ? 1.25 : 1.0;
                const delivProv = Math.round(fl.yieldProvisions * bonusMult);
                const delivSilv = Math.round(fl.yieldSilver * bonusMult);

                setTotalFlockMigrations((c) => c + 1);
                setResources((prevR) => ({
                  ...prevR,
                  provisions: prevR.provisions + delivProv,
                  silver: prevR.silver + delivSilv
                }));
                setNaibates((prevN) =>
                  prevN.map((n) =>
                    n.id === fl.linkedNaibateId
                      ? { ...n, pastureAccess: true, loyalty: Math.min(100, n.loyalty + 3) }
                      : n
                  )
                );
                setUnitMovementLog((prevLog) => [
                  {
                    id: `flock-${Date.now()}-${fl.id}`,
                    time: `🐑 Перегон на джайляу`,
                    textRu: `«${fl.nameRu}» завершили сезонный перегон${isGuarded ? ' под охраной мюридов (+25%)' : ''}: в кладовые Имамата поступило +${delivProv} мер провианта (сыр, баранина) и +${delivSilv} руб. овчиной!`,
                    textEn: `“${fl.nameEn}” completed seasonal transhumance${isGuarded ? ' under escort (+25%)' : ''}: delivered +${delivProv} provisions & +${delivSilv} rub. wool/sheepskin!`
                  },
                  ...prevLog.slice(0, 7)
                ]);
              }

              const nextDir = fl.direction === 'to_dzhaylyau' ? 'to_kutan' : 'to_dzhaylyau';
              const destX = nextDir === 'to_dzhaylyau' ? fl.dzhaylyauX : fl.kutanX;
              const destY = nextDir === 'to_dzhaylyau' ? fl.dzhaylyauY : fl.kutanY;
              const nextPath = computeTerrainAwarePath(targetWp.x, targetWp.y, destX, destY);
              const firstNext = nextPath[1] || nextPath[0] || { x: destX, y: destY };
              return {
                ...fl,
                x: targetWp.x,
                y: targetWp.y,
                guarded: isGuarded,
                direction: nextDir,
                headingDeg: Math.round(
                  (Math.atan2(firstNext.y - targetWp.y, firstNext.x - targetWp.x) * 180) / Math.PI
                ),
                waypoints: nextPath,
                waypointIdx: Math.min(1, nextPath.length - 1),
                trail: [{ x: Math.round(targetWp.x), y: Math.round(targetWp.y) }]
              };
            }

            const nextTarget = fl.waypoints[nextWpIdx];
            return {
              ...fl,
              x: targetWp.x,
              y: targetWp.y,
              guarded: isGuarded,
              waypointIdx: nextWpIdx,
              headingDeg: Math.round(
                (Math.atan2(nextTarget.y - targetWp.y, nextTarget.x - targetWp.x) * 180) / Math.PI
              ),
              trail: [...(fl.trail || []).slice(-12), { x: Math.round(targetWp.x), y: Math.round(targetWp.y) }]
            };
          }

          const vx = (dx / distToWp) * stepDist;
          const vy = (dy / distToWp) * stepDist;
          return {
            ...fl,
            x: +(fl.x + vx).toFixed(2),
            y: +(fl.y + vy).toFixed(2),
            guarded: isGuarded,
            headingDeg: Math.round((Math.atan2(dy, dx) * 180) / Math.PI)
          };
        })
      );

      // 5Ж. СПРИНТ 31 (M31): Автоматический подрыв подземных пороховых камуфлетов при входе колонн РИ в зону горна (60 FPS)
      setSapperMines((prevMines) => {
        let changed = false;
        const nextMines = prevMines.map((mine) => {
          if (mine.status !== 'armed') return mine;
          const victimCol = (liveColumnsRef.current || []).find(
            (col) => col.status === 'advancing' && Math.hypot(col.x - mine.x, col.y - mine.y) <= mine.radius
          );
          const lastDet = lastMineDetonationRef.current[mine.id] || 0;
          if (!victimCol || lastDet === currentTurnKey) return mine;

          changed = true;
          lastMineDetonationRef.current[mine.id] = currentTurnKey;
          const mineBurstId = `camouflet-blast-${Date.now()}-${mine.id}`;

          setTotalMinesDetonatedOnMap((c) => c + 1);
          setPlaytestTelemetry((pt) => ({
            ...pt,
            camoufletsDetonated: (pt.camoufletsDetonated || 0) + 1,
            totalPowderCapturedInTactics: (pt.totalPowderCapturedInTactics || 0) + mine.capturedPowder
          }));
          setResources((prevR) => ({
            ...prevR,
            gunpowder: prevR.gunpowder + mine.capturedPowder,
            authority: Math.min(100, prevR.authority + 4)
          }));

          setLiveImperialColumns((prevCols) => {
            const nextCols = prevCols.map((col) => {
              if (col.id !== victimCol.id) return col;
              const retreatPath = computeTerrainAwarePath(col.x, col.y, col.originX, col.originY);
              const firstRet = retreatPath[1] || retreatPath[0] || { x: col.originX, y: col.originY };
              return {
                ...col,
                bayonets: Math.max(550, col.bayonets - mine.blastDamageBayonets),
                status: 'retreating',
                headingDeg: Math.round(
                  (Math.atan2(firstRet.y - col.y, firstRet.x - col.x) * 180) / Math.PI
                ),
                waypoints: retreatPath,
                waypointIdx: Math.min(1, retreatPath.length - 1),
                trail: [{ x: Math.round(col.x), y: Math.round(col.y) }]
              };
            });
            liveColumnsRef.current = nextCols;
            return nextCols;
          });

          setLiveSkirmishBursts((prevB) => [
            ...prevB.slice(-5),
            {
              id: mineBurstId,
              x: mine.x,
              y: mine.y,
              createdAt: now,
              titleRu: `🧨 ПОДРЫВ КАМУФЛЕТА (${mine.badgeRu})! -${mine.blastDamageBayonets} шт. РИ!`,
              titleEn: `🧨 CAMOUFLET DETONATED (${mine.badgeEn})! -${mine.blastDamageBayonets} bayonets!`,
              spoilsRu: `Колонна обращена в бегство! Трофеи: +${mine.capturedPowder}п пороха`,
              spoilsEn: `Imperial column routed! Captured: +${mine.capturedPowder}p powder`
            }
          ]);

          setUnitMovementLog((prevLog) => [
            {
              id: mineBurstId,
              time: `🧨 Подрыв горна`,
              textRu: `ВЗРЫВ ПОДЗЕМНОЙ МИННОЙ ГАЛЕРЕИ! Под авангардом «${victimCol.nameRu}» взорван «${mine.nameRu}» (-${mine.blastDamageBayonets} штыков, +${mine.capturedPowder} пуд. трофейного пороха)! Колонна в панике отступает!`,
              textEn: `SUBTERRANEAN CAMOUFLET BLAST! “${mine.nameEn}” detonated beneath “${victimCol.nameEn}” (-${mine.blastDamageBayonets} bayonets, +${mine.capturedPowder} poods powder)! Column retreating!`
            },
            ...prevLog.slice(0, 7)
          ]);

          return {
            ...mine,
            status: 'detonated'
          };
        });
        if (changed) {
          sapperMinesRef.current = nextMines;
        }
        return changed ? nextMines : prevMines;
      });

      // 5З. СПРИНТ 31 (M31): Живое движение дипломатических миссий Черкесии и Трапезунда через Главный Кавказский хребет (60 FPS)
      setLiveDiplomaticMissions((prevMissions) =>
        prevMissions.map((ms) => {
          const isEscorted = (liveUnitsRef.current || []).some(
            (u) => Math.hypot(u.x - ms.x, u.y - ms.y) <= 38
          );
          const wpIdx = Math.min(ms.waypointIdx, ms.waypoints.length - 1);
          const targetWp = ms.waypoints[wpIdx] || { x: ms.destX, y: ms.destY };
          const dx = targetWp.x - ms.x;
          const dy = targetWp.y - ms.y;
          const distToWp = Math.hypot(dx, dy);

          const msTerr = sampleStrategicTerrain(ms.x, ms.y);
          const escMult = isEscorted ? 1.35 : 1.0;
          const stepDist = ms.baseSpeed * msTerr.speedMult * escMult * terrainSimSpeed * dt;

          if (distToWp <= stepDist + 0.9) {
            const nextWpIdx = wpIdx + 1;
            if (nextWpIdx >= ms.waypoints.length) {
              const lastEv = lastDipMissionRef.current[ms.id] || 0;
              if (ms.status === 'inbound' && isEscorted && lastEv !== currentTurnKey) {
                lastDipMissionRef.current[ms.id] = currentTurnKey;
                const bonusMult = isEscorted ? 1.25 : 1.0;
                const addPow = Math.round(ms.giftPowder * bonusMult);
                const addSilv = Math.round(ms.giftSilver * bonusMult);
                const addSup = Math.round(ms.giftSupport * bonusMult);

                setTotalDiplomaticMissionsArrived((c) => c + 1);
                setResources((prevR) => ({
                  ...prevR,
                  gunpowder: prevR.gunpowder + addPow,
                  silver: prevR.silver + addSilv,
                  ottomanSupport: Math.min(100, prevR.ottomanSupport + addSup),
                  authority: Math.min(100, prevR.authority + 3)
                }));
                setUnitMovementLog((prevLog) => [
                  {
                    id: `dip-arr-${Date.now()}-${ms.id}`,
                    time: `${ms.icon} Посольство в Дарго`,
                    textRu: `«${ms.nameRu}» прибыла в ставку Дарго-Ведено${isEscorted ? ' с почётным конвоем (+25%)' : ''}: доставлено +${addPow} пуд. штуцерного пороха, +${addSilv} руб. и +${addSup}% дипломатической поддержки!`,
                    textEn: `“${ms.nameEn}” arrived at Dargo-Vedeno HQ${isEscorted ? ' with honor guard (+25%)' : ''}: delivered +${addPow} poods rifle powder, +${addSilv} rub. & +${addSup}% diplomatic support!`
                  },
                  ...prevLog.slice(0, 7)
                ]);

                const retPath = computeTerrainAwarePath(225, 195, ms.originX, ms.originY);
                const firstRet = retPath[1] || retPath[0] || { x: ms.originX, y: ms.originY };
                return {
                  ...ms,
                  x: 225,
                  y: 195,
                  escorted: isEscorted,
                  status: 'returning',
                  headingDeg: Math.round(
                    (Math.atan2(firstRet.y - 195, firstRet.x - 225) * 180) / Math.PI
                  ),
                  waypoints: retPath,
                  waypointIdx: Math.min(1, retPath.length - 1),
                  trail: [{ x: 225, y: 195 }]
                };
              }

              const inbPath = computeTerrainAwarePath(ms.originX, ms.originY, 225, 195);
              const firstInb = inbPath[1] || inbPath[0] || { x: 225, y: 195 };
              return {
                ...ms,
                x: ms.originX,
                y: ms.originY,
                escorted: isEscorted,
                status: 'inbound',
                headingDeg: Math.round(
                  (Math.atan2(firstInb.y - ms.originY, firstInb.x - ms.originX) * 180) / Math.PI
                ),
                waypoints: inbPath,
                waypointIdx: Math.min(1, inbPath.length - 1),
                trail: [{ x: ms.originX, y: ms.originY }]
              };
            }

            const nextTarget = ms.waypoints[nextWpIdx];
            return {
              ...ms,
              x: targetWp.x,
              y: targetWp.y,
              escorted: isEscorted,
              waypointIdx: nextWpIdx,
              headingDeg: Math.round(
                (Math.atan2(nextTarget.y - targetWp.y, nextTarget.x - targetWp.x) * 180) / Math.PI
              ),
              trail: [...(ms.trail || []).slice(-14), { x: Math.round(targetWp.x), y: Math.round(targetWp.y) }]
            };
          }

          const vx = (dx / distToWp) * stepDist;
          const vy = (dy / distToWp) * stepDist;
          return {
            ...ms,
            x: +(ms.x + vx).toFixed(2),
            y: +(ms.y + vy).toFixed(2),
            escorted: isEscorted,
            headingDeg: Math.round((Math.atan2(dy, dx) * 180) / Math.PI)
          };
        })
      );

      // 5И. СПРИНТ 32 (M32): Полевые госпитали и лазареты хакимов и джаррахов — возвращение раненых в строй (1 раз за ход при подходе отряда)
      for (const hosp of fieldHospitalsRef.current || []) {
        if (hosp.status !== 'active') continue;
        const lastHeal = lastHospitalHealRef.current[hosp.id] || 0;
        if (lastHeal === currentTurnKey) continue;

        const nearbyUnit = (liveUnitsRef.current || []).find(
          (u) => u.status === 'moving' && Math.hypot(u.x - hosp.x, u.y - hosp.y) <= hosp.radius
        );
        if (nearbyUnit) {
          lastHospitalHealRef.current[hosp.id] = currentTurnKey;
          const healedCount = hosp.healSabersPerPulse;
          setTotalWoundedRecoveredOnMap((c) => c + healedCount);
          setNaibates((prevN) =>
            prevN.map((nb, idx) =>
              idx === 0
                ? {
                    ...nb,
                    garrison: nb.garrison + healedCount,
                    stress: Math.max(5, nb.stress - hosp.stressRelief)
                  }
                : nb
            )
          );
          setUnitMovementLog((prevLog) => [
            {
              id: `hosp-heal-${Date.now()}-${hosp.id}`,
              time: `🏥 ${hosp.badgeRu}`,
              textRu: `В «${hosp.nameRu}» хакимы и джаррахи обработали раны воинов отряда «${nearbyUnit.nameRu}»: возвращено в строй +${healedCount} сабель (${Math.round(hosp.recoveryRate * 100)}% спасённых раненых, -${hosp.stressRelief}% стресса)!`,
              textEn: `At “${hosp.nameEn}”, hakims & bone-setters treated wounded from “${nearbyUnit.nameEn}”: +${healedCount} sabers returned to ranks (${Math.round(hosp.recoveryRate * 100)}% recovery, -${hosp.stressRelief}% stress)!`
            },
            ...prevLog.slice(0, 7)
          ]);
        }
      }

      // 5К. СПРИНТ 32 (M32): Живые парламентёрские конвои обмена пленных офицеров и аманатов на р. Мичик и у Ярыксу (60 FPS)
      setLivePrisonerConvoys((prevConvoys) =>
        prevConvoys.map((cv) => {
          const isEscorted = (liveUnitsRef.current || []).some(
            (u) => Math.hypot(u.x - cv.x, u.y - cv.y) <= 38
          );
          const wpIdx = Math.min(cv.waypointIdx, cv.waypoints.length - 1);
          const targetWp = cv.waypoints[wpIdx] || { x: cv.destX, y: cv.destY };
          const dx = targetWp.x - cv.x;
          const dy = targetWp.y - cv.y;
          const distToWp = Math.hypot(dx, dy);

          const cvTerr = sampleStrategicTerrain(cv.x, cv.y);
          const escMult = isEscorted ? 1.35 : 1.0;
          const stepDist = cv.baseSpeed * cvTerr.speedMult * escMult * terrainSimSpeed * dt;

          if (distToWp <= stepDist + 0.9) {
            const nextWpIdx = wpIdx + 1;
            if (nextWpIdx >= cv.waypoints.length) {
              const lastEx = lastPrisonerExchangeRef.current[cv.id] || 0;
              if (cv.status === 'to_crossing' && isEscorted && lastEx !== currentTurnKey) {
                lastPrisonerExchangeRef.current[cv.id] = currentTurnKey;
                const bonusMult = isEscorted ? 1.25 : 1.0;
                const gainSilver = Math.round(cv.ransomSilver * bonusMult);
                const gainPowder = Math.round(cv.ransomPowder * bonusMult);

                setTotalPrisonerExchangesCompleted((c) => c + 1);
                setResources((prevR) => ({
                  ...prevR,
                  silver: prevR.silver + gainSilver,
                  gunpowder: prevR.gunpowder + gainPowder,
                  provisions: prevR.provisions + 90,
                  authority: Math.min(100, prevR.authority + 3)
                }));
                setNaibates((prevN) =>
                  prevN.map((nb) => ({
                    ...nb,
                    stress: Math.max(5, nb.stress - cv.stressRelief)
                  }))
                );
                setUnitMovementLog((prevLog) => [
                  {
                    id: `pris-ex-${Date.now()}-${cv.id}`,
                    time: `${cv.icon} Размен аманатов`,
                    textRu: `Состоялся размен пленных и аманатов («${cv.nameRu}»): освобождены горские заложники (-${cv.stressRelief}% стресса), получено +${gainSilver} руб. серебром, +${gainPowder} пуд. штуцерного пороха и свинца и +90 пуд. провианта!`,
                    textEn: `Prisoner & amanat exchange completed (“${cv.nameEn}”): hostages freed (-${cv.stressRelief}% stress), received +${gainSilver} silver rub., +${gainPowder} poods powder & +90 poods grain!`
                  },
                  ...prevLog.slice(0, 7)
                ]);

                const retPath = computeTerrainAwarePath(cv.destX, cv.destY, cv.originX, cv.originY);
                const firstRet = retPath[1] || retPath[0] || { x: cv.originX, y: cv.originY };
                return {
                  ...cv,
                  x: cv.destX,
                  y: cv.destY,
                  escorted: isEscorted,
                  status: 'returning',
                  headingDeg: Math.round(
                    (Math.atan2(firstRet.y - cv.destY, firstRet.x - cv.destX) * 180) / Math.PI
                  ),
                  waypoints: retPath,
                  waypointIdx: Math.min(1, retPath.length - 1),
                  trail: [{ x: cv.destX, y: cv.destY }]
                };
              }

              const outPath = computeTerrainAwarePath(cv.originX, cv.originY, cv.destX, cv.destY);
              const firstOut = outPath[1] || outPath[0] || { x: cv.destX, y: cv.destY };
              return {
                ...cv,
                x: cv.originX,
                y: cv.originY,
                escorted: isEscorted,
                status: 'to_crossing',
                headingDeg: Math.round(
                  (Math.atan2(firstOut.y - cv.originY, firstOut.x - cv.originX) * 180) / Math.PI
                ),
                waypoints: outPath,
                waypointIdx: Math.min(1, outPath.length - 1),
                trail: [{ x: cv.originX, y: cv.originY }]
              };
            }

            const nextTarget = cv.waypoints[nextWpIdx];
            return {
              ...cv,
              x: targetWp.x,
              y: targetWp.y,
              escorted: isEscorted,
              waypointIdx: nextWpIdx,
              headingDeg: Math.round(
                (Math.atan2(nextTarget.y - targetWp.y, nextTarget.x - targetWp.x) * 180) / Math.PI
              ),
              trail: [...(cv.trail || []).slice(-14), { x: Math.round(targetWp.x), y: Math.round(targetWp.y) }]
            };
          }

          const vx = (dx / distToWp) * stepDist;
          const vy = (dy / distToWp) * stepDist;
          return {
            ...cv,
            x: +(cv.x + vx).toFixed(2),
            y: +(cv.y + vy).toFixed(2),
            escorted: isEscorted,
            headingDeg: Math.round((Math.atan2(dy, dx) * 180) / Math.PI)
          };
        })
      );

      // 5Л. СПРИНТ 33 (M33): Пороховые мельницы, селитренные пещеры и кузницы Унцукуля — выработка партии при прикрытии отрядом (1 раз за ход)
      for (const mill of powderMillsRef.current || []) {
        if (mill.status !== 'working') continue;
        const lastPulse = lastMillPulseRef.current[mill.id] || 0;
        if (lastPulse === currentTurnKey) continue;

        const guardedByUnit = (liveUnitsRef.current || []).some(
          (u) => u.status === 'moving' && Math.hypot(u.x - mill.x, u.y - mill.y) <= mill.radius
        );
        if (!guardedByUnit) continue;
        lastMillPulseRef.current[mill.id] = currentTurnKey;
        const mult = (mill.overdrive ? 1.35 : 1.0) * (guardedByUnit ? 1.2 : 1.0);
        const addPow = Math.round(mill.yieldPowder * mult);
        const addSilv = Math.round(mill.yieldSilver * mult);

        setTotalMillBatchesProduced((c) => c + 1);
        setResources((prevR) => ({
          ...prevR,
          gunpowder: prevR.gunpowder + addPow,
          silver: prevR.silver + addSilv
        }));
      }

      // 5М. СПРИНТ 33 (M33): Движение царских фельдъегерей и штабных курьеров по Кавказской линии + перехват отрядами Имамата (60 FPS)
      setLiveImperialCouriers((prevCouriers) =>
        prevCouriers.map((cr) => {
          const interceptor = (liveUnitsRef.current || []).find(
            (u) => u.status === 'moving' && Math.hypot(u.x - cr.x, u.y - cr.y) <= 32
          );
          const lastInt = lastCourierInterceptRef.current[cr.id] || 0;
          if (interceptor && lastInt !== currentTurnKey) {
            lastCourierInterceptRef.current[cr.id] = currentTurnKey;
            setTotalCouriersIntercepted((c) => c + 1);
            setResources((prevR) => ({
              ...prevR,
              silver: prevR.silver + cr.lootSilver,
              gunpowder: prevR.gunpowder + cr.lootPowder,
              authority: Math.min(100, prevR.authority + 3)
            }));
            setNaibates((prevN) =>
              prevN.map((nb) => ({
                ...nb,
                imperialPressure: Math.max(10, nb.imperialPressure - cr.intelPressureDrop)
              }))
            );

            const burstId = `courier-int-${Date.now()}-${cr.id}`;
            setLiveSkirmishBursts((prevB) => [
              ...prevB.slice(-5),
              {
                id: burstId,
                x: Math.round(cr.x),
                y: Math.round(cr.y),
                createdAt: now,
                titleRu: `📯 ПЕРЕХВАЧЕН ${cr.badgeRu}! +${cr.lootSilver}₽ • -${cr.intelPressureDrop}% натиска РИ!`,
                titleEn: `📯 INTERCEPTED ${cr.badgeEn}! +${cr.lootSilver} rub. • -${cr.intelPressureDrop}% Enemy Pressure!`,
                spoilsRu: `Захвачены секретные карты штаба и +${cr.lootPowder}п капсюльного пороха`,
                spoilsEn: `Captured secret General Staff maps & +${cr.lootPowder}p percussion powder`
              }
            ]);

            setUnitMovementLog((prevLog) => [
              {
                id: burstId,
                time: `📯 Перехват депеш`,
                textRu: `ПЕРЕХВАТ ЦАРСКОГО КУРЬЕРА! «${interceptor.nameRu}» по наводке кунаков перехватил «${cr.nameRu}»: захвачена секретная диспозиция (-${cr.intelPressureDrop}% натиска РИ), +${cr.lootSilver} руб. казны и +${cr.lootPowder} пуд. пороха!`,
                textEn: `IMPERIAL COURIER INTERCEPTED! “${interceptor.nameEn}” ambushed “${cr.nameEn}”: captured secret staff maps (-${cr.intelPressureDrop}% Imperial pressure), +${cr.lootSilver} rub. & +${cr.lootPowder} poods powder!`
              },
              ...prevLog.slice(0, 7)
            ]);

            const respawnPath = computeTerrainAwarePath(cr.originX, cr.originY, cr.destX, cr.destY);
            const firstResp = respawnPath[1] || respawnPath[0] || { x: cr.destX, y: cr.destY };
            return {
              ...cr,
              x: cr.originX,
              y: cr.originY,
              status: 'eastbound',
              headingDeg: Math.round(
                (Math.atan2(firstResp.y - cr.originY, firstResp.x - cr.originX) * 180) / Math.PI
              ),
              waypoints: respawnPath,
              waypointIdx: Math.min(1, respawnPath.length - 1),
              trail: [{ x: cr.originX, y: cr.originY }]
            };
          }

          const wpIdx = Math.min(cr.waypointIdx, cr.waypoints.length - 1);
          const targetWp = cr.waypoints[wpIdx] || { x: cr.destX, y: cr.destY };
          const dx = targetWp.x - cr.x;
          const dy = targetWp.y - cr.y;
          const distToWp = Math.hypot(dx, dy);

          const crTerr = sampleStrategicTerrain(cr.x, cr.y);
          const stepDist = cr.baseSpeed * crTerr.speedMult * terrainSimSpeed * dt;

          if (distToWp <= stepDist + 0.9) {
            const nextWpIdx = wpIdx + 1;
            if (nextWpIdx >= cr.waypoints.length) {
              if (cr.status === 'eastbound') {
                const westPath = computeTerrainAwarePath(cr.destX, cr.destY, cr.originX, cr.originY);
                const firstW = westPath[1] || westPath[0] || { x: cr.originX, y: cr.originY };
                return {
                  ...cr,
                  x: cr.destX,
                  y: cr.destY,
                  status: 'westbound',
                  headingDeg: Math.round(
                    (Math.atan2(firstW.y - cr.destY, firstW.x - cr.destX) * 180) / Math.PI
                  ),
                  waypoints: westPath,
                  waypointIdx: Math.min(1, westPath.length - 1),
                  trail: [{ x: cr.destX, y: cr.destY }]
                };
              }
              const eastPath = computeTerrainAwarePath(cr.originX, cr.originY, cr.destX, cr.destY);
              const firstE = eastPath[1] || eastPath[0] || { x: cr.destX, y: cr.destY };
              return {
                ...cr,
                x: cr.originX,
                y: cr.originY,
                status: 'eastbound',
                headingDeg: Math.round(
                  (Math.atan2(firstE.y - cr.originY, firstE.x - cr.originX) * 180) / Math.PI
                ),
                waypoints: eastPath,
                waypointIdx: Math.min(1, eastPath.length - 1),
                trail: [{ x: cr.originX, y: cr.originY }]
              };
            }

            const nextTarget = cr.waypoints[nextWpIdx];
            return {
              ...cr,
              x: targetWp.x,
              y: targetWp.y,
              waypointIdx: nextWpIdx,
              headingDeg: Math.round(
                (Math.atan2(nextTarget.y - targetWp.y, nextTarget.x - targetWp.x) * 180) / Math.PI
              ),
              trail: [...(cr.trail || []).slice(-14), { x: Math.round(targetWp.x), y: Math.round(targetWp.y) }]
            };
          }

          const vx = (dx / distToWp) * stepDist;
          const vy = (dy / distToWp) * stepDist;
          return {
            ...cr,
            x: +(cr.x + vx).toFixed(2),
            y: +(cr.y + vy).toFixed(2),
            headingDeg: Math.round((Math.atan2(dy, dx) * 180) / Math.PI)
          };
        })
      );

      // 5Н. СПРИНТ 34 (M34): Лесные засады стрелков Талгика и Байсунгура в буковых лесах Ичкерии и Чечни (1 раз за ход)
      for (const fc of forestClearingsRef.current || []) {
        if (fc.status !== 'protected') continue;
        const lastAmb = lastForestAmbushRef.current[fc.id] || 0;
        if (lastAmb === currentTurnKey) continue;

        const targetCol = (liveColumnsRef.current || []).find(
          (c) => c.status === 'advancing' && Math.hypot(c.x - fc.x, c.y - fc.y) <= fc.radius
        );
        if (targetCol) {
          lastForestAmbushRef.current[fc.id] = currentTurnKey;
          const dmg = fc.salvoDamage;
          setTotalForestAmbushesTriggered((c) => c + 1);
          setResources((prevR) => ({
            ...prevR,
            gunpowder: prevR.gunpowder + 14,
            silver: prevR.silver + 35
          }));
          setLiveImperialColumns((prevCols) => {
            const nextCols = prevCols.map((c) =>
              c.id === targetCol.id
                ? { ...c, bayonets: Math.max(580, c.bayonets - dmg) }
                : c
            );
            liveColumnsRef.current = nextCols;
            return nextCols;
          });

          const ambBurstId = `forest-amb-${Date.now()}-${fc.id}`;
          setLiveSkirmishBursts((prevB) => [
            ...prevB.slice(-5),
            {
              id: ambBurstId,
              x: fc.x,
              y: fc.y,
              createdAt: now,
              titleRu: `🌲 ЛЕСНАЯ ЗАСАДА В «${fc.badgeRu}»! -${dmg} шт. РИ!`,
              titleEn: `🌲 BEECH FOREST AMBUSH IN “${fc.badgeEn}”! -${dmg} bayonets!`,
              spoilsRu: `Захвачены топоры сапёров, +14п пороха и +35₽`,
              spoilsEn: `Captured sapper axes, +14p powder & +35 rub.`
            }
          ]);

          setUnitMovementLog((prevLog) => [
            {
              id: ambBurstId,
              time: `🌲 ${fc.badgeRu}`,
              textRu: `ЗАСАДА В ВЕКОВОМ ЛЕСУ! Стрелки с крон буков в «${fc.nameRu}» ударили по сапёрам «${targetCol.nameRu}» (-${dmg} штыков, скорость колонны ×${fc.enemySlowdownMult}, захвачено +14 пуд. пороха)!`,
              textEn: `BEECH CANOPY AMBUSH! Sharpshooters in “${fc.nameEn}” struck “${targetCol.nameEn}” (-${dmg} bayonets, column slowed ×${fc.enemySlowdownMult}, +14 poods powder)!`
            },
            ...prevLog.slice(0, 7)
          ]);
        }
      }

      // 5О. СПРИНТ 34 (M34): Движение переселенческих обозов горцев-мухаджиров в горные укрепления Шатоя, Ведено и Гуниба (60 FPS)
      setLiveMuhajirCaravans((prevMuh) =>
        prevMuh.map((mc) => {
          const isEscorted = (liveUnitsRef.current || []).some(
            (u) => Math.hypot(u.x - mc.x, u.y - mc.y) <= 38
          );
          const wpIdx = Math.min(mc.waypointIdx, mc.waypoints.length - 1);
          const targetWp = mc.waypoints[wpIdx] || { x: mc.destX, y: mc.destY };
          const dx = targetWp.x - mc.x;
          const dy = targetWp.y - mc.y;
          const distToWp = Math.hypot(dx, dy);

          const mcTerr = sampleStrategicTerrain(mc.x, mc.y);
          const escMult = isEscorted ? 1.35 : 1.0;
          const stepDist = mc.baseSpeed * mcTerr.speedMult * escMult * terrainSimSpeed * dt;

          if (distToWp <= stepDist + 0.9) {
            const nextWpIdx = wpIdx + 1;
            if (nextWpIdx >= mc.waypoints.length) {
              const lastEv = lastMuhajirEventRef.current[mc.id] || 0;
              if (mc.status === 'evacuating' && isEscorted && lastEv !== currentTurnKey) {
                lastMuhajirEventRef.current[mc.id] = currentTurnKey;
                const bonusMult = isEscorted ? 1.25 : 1.0;
                const addMil = Math.round(mc.militiaJoined * bonusMult);
                const addGr = Math.round(mc.savedGrain * bonusMult);

                setTotalMuhajirCaravansSaved((c) => c + 1);
                setResources((prevR) => ({
                  ...prevR,
                  provisions: prevR.provisions + addGr,
                  authority: Math.min(100, prevR.authority + 3)
                }));
                setNaibates((prevN) =>
                  prevN.map((nb, idx) =>
                    idx < 2
                      ? {
                          ...nb,
                          garrison: nb.garrison + Math.round(addMil * 0.5),
                          stress: Math.max(5, nb.stress - mc.stressRelief)
                        }
                      : nb
                  )
                );
                setUnitMovementLog((prevLog) => [
                  {
                    id: `muhajir-arr-${Date.now()}-${mc.id}`,
                    time: `🛞 Спасение мухаджиров`,
                    textRu: `«${mc.nameRu}» благополучно прибыл под защиту горных крепостей: в ополчение вступило +${addMil} мюридов, спасено +${addGr} мер зерна (-${mc.stressRelief}% стресса, +3% авторитета)!`,
                    textEn: `“${mc.nameEn}” safely reached mountain sanctuary: +${addMil} militia joined ranks, +${addGr} grain saved (-${mc.stressRelief}% stress, +3% authority)!`
                  },
                  ...prevLog.slice(0, 7)
                ]);

                const retPath = computeTerrainAwarePath(mc.destX, mc.destY, mc.originX, mc.originY);
                const firstRet = retPath[1] || retPath[0] || { x: mc.originX, y: mc.originY };
                return {
                  ...mc,
                  x: mc.destX,
                  y: mc.destY,
                  escorted: isEscorted,
                  status: 'returning_carts',
                  headingDeg: Math.round(
                    (Math.atan2(firstRet.y - mc.destY, firstRet.x - mc.destX) * 180) / Math.PI
                  ),
                  waypoints: retPath,
                  waypointIdx: Math.min(1, retPath.length - 1),
                  trail: [{ x: mc.destX, y: mc.destY }]
                };
              }

              const evacPath = computeTerrainAwarePath(mc.originX, mc.originY, mc.destX, mc.destY);
              const firstEv = evacPath[1] || evacPath[0] || { x: mc.destX, y: mc.destY };
              return {
                ...mc,
                x: mc.originX,
                y: mc.originY,
                escorted: isEscorted,
                status: 'evacuating',
                headingDeg: Math.round(
                  (Math.atan2(firstEv.y - mc.originY, firstEv.x - mc.originX) * 180) / Math.PI
                ),
                waypoints: evacPath,
                waypointIdx: Math.min(1, evacPath.length - 1),
                trail: [{ x: mc.originX, y: mc.originY }]
              };
            }

            const nextTarget = mc.waypoints[nextWpIdx];
            return {
              ...mc,
              x: targetWp.x,
              y: targetWp.y,
              escorted: isEscorted,
              waypointIdx: nextWpIdx,
              headingDeg: Math.round(
                (Math.atan2(nextTarget.y - targetWp.y, nextTarget.x - targetWp.x) * 180) / Math.PI
              ),
              trail: [...(mc.trail || []).slice(-14), { x: Math.round(targetWp.x), y: Math.round(targetWp.y) }]
            };
          }

          const vx = (dx / distToWp) * stepDist;
          const vy = (dy / distToWp) * stepDist;
          return {
            ...mc,
            x: +(mc.x + vx).toFixed(2),
            y: +(mc.y + vy).toFixed(2),
            escorted: isEscorted,
            headingDeg: Math.round((Math.atan2(dy, dx) * 180) / Math.PI)
          };
        })
      );

      // 6. Очистка завершившихся вспышек боя старше 4.2 сек
      setLiveSkirmishBursts((prevB) =>
        prevB.length > 0 && prevB.some((b) => now - b.createdAt >= 4200)
          ? prevB.filter((b) => now - b.createdAt < 4200)
          : prevB
      );

      frameId = requestAnimationFrame(tickMovement);
    };

    frameId = requestAnimationFrame(tickMovement);
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      if (idleTimerId) clearTimeout(idleTimerId);
    };
  }, [terrainSimSpeed]);

  // СПРИНТ 34 (M34): Укрепить засеками выбранный буковый лес и сорвать рубку просеки сапёрами РИ
  const handleDefendForestClearing = (clearingId) => {
    playHistoricalSound('rifle', soundEnabled);
    setForestClearings((prev) => {
      const next = prev.map((fc) =>
        fc.id === clearingId
          ? {
              ...fc,
              status: 'protected',
              canopyIntactPct: Math.min(98, fc.canopyIntactPct + 12),
              ambushBonusPct: Math.min(45, fc.ambushBonusPct + 5)
            }
          : fc
      );
      forestClearingsRef.current = next;
      return next;
    });
    setTotalForestAmbushesTriggered((c) => c + 1);
    setResources((prevR) => ({
      ...prevR,
      gunpowder: prevR.gunpowder + 14,
      authority: Math.min(100, prevR.authority + 2)
    }));
    showNotice(
      t(
        '🌲 В лесном массиве возведены новые буковые завалы: рубка просеки сорвана (+14 пудов пороха, маскировка 95%)!',
        '🌲 Fresh beech abatis erected in the forest massif: Imperial clearing halted (+14 poods powder, 95% canopy cover)!'
      ),
      'ok'
    );
  };

  // СПРИНТ 34 (M34): Генеральная лесная засада стрелков Талгика и Байсунгура во всех 4 буковых лесах Ичкерии и Чечни
  const handleLaunchGeneralForestAmbush = () => {
    playHistoricalSound('rifle', soundEnabled);
    setForestClearings((prev) => {
      const next = prev.map((fc) => ({
        ...fc,
        status: 'protected',
        canopyIntactPct: Math.max(92, fc.canopyIntactPct)
      }));
      forestClearingsRef.current = next;
      return next;
    });
    setTotalForestAmbushesTriggered((c) => c + 1);
    setResources((prevR) => ({
      ...prevR,
      gunpowder: prevR.gunpowder + 28,
      silver: prevR.silver + 65,
      authority: Math.min(100, prevR.authority + 3)
    }));
    setLiveImperialColumns((prevCols) => {
      const nextCols = prevCols.map((c) => ({
        ...c,
        bayonets: Math.max(580, c.bayonets - 290)
      }));
      liveColumnsRef.current = nextCols;
      return nextCols;
    });

    const firstForest = forestClearings[0];
    if (firstForest) {
      setLiveSkirmishBursts((prevB) => [
        ...prevB.slice(-5),
        {
          id: `gen-forest-amb-${Date.now()}`,
          x: firstForest.x,
          y: firstForest.y,
          createdAt: performance.now(),
          titleRu: `🌲 ЗАСАДА В ЛЕСАХ ИЧКЕРИИ! -290 шт. РИ! +28п пороха!`,
          titleEn: `🌲 ICHKERIA FOREST AMBUSH! -290 bayonets! +28p powder!`,
          spoilsRu: `Рубка просек сорвана во всех 4 массивах (+65₽, +3% авторитета)`,
          spoilsEn: `Imperial axe-clearing halted across all 4 forests (+65 rub., +3% authority)`
        }
      ]);
    }

    setUnitMovementLog((prevLog) => [
      {
        id: `forest-gen-${Date.now()}`,
        time: `🌲 Буковые засеки`,
        textRu: `ГЕНЕРАЛЬНАЯ ЗАСАДА В ЛЕСАХ ЧЕЧНИ И ИЧКЕРИИ! Стрелки Талгика и Байсунгура атаковали команды лесорубов РИ в Гойтинском, Шалинском и Белгатойском лесах (-290 штыков у колонн РИ, +28 пуд. пороха и +65 руб.)!`,
        textEn: `GENERAL FOREST AMBUSH IN CHECHNYA & ICHKERIA! Talkhik & Baysungur sharpshooters struck Imperial axe-teams in Goyty, Shali & Belgatoy (-290 bayonets, +28 poods powder & +65 rub.)!`
      },
      ...prevLog.slice(0, 7)
    ]);

    showNotice(
      t(
        '🌲 Стрелки Талгика и Байсунгура разгромили сапёров-лесорубов во всех 4 лесах (-290 штыков РИ, +28 пудов пороха, +65 руб.)!',
        '🌲 Talkhik & Baysungur riflemen routed axe-battalions across all 4 forests (-290 bayonets, +28 poods powder, +65 rub.)!'
      ),
      'ok'
    );
  };

  // СПРИНТ 34 (M34): Выслать конный отряд для прикрытия переселенческого обоза мухаджиров
  const handleEscortMuhajirCaravan = (caravanId = null) => {
    const activeUnit =
      liveFieldUnits.find((u) => u.id === selectedUnitId) || liveFieldUnits[0];
    const targetCaravan =
      (caravanId && liveMuhajirCaravans.find((m) => m.id === caravanId)) ||
      liveMuhajirCaravans[0];
    if (!targetCaravan) return;

    handleCommandUnitMoveToPoint(
      activeUnit.id,
      Math.round(targetCaravan.x),
      Math.round(targetCaravan.y),
      `Охрана мухаджиров: ${targetCaravan.badgeRu}`,
      `Muhajir Escort: ${targetCaravan.badgeEn}`,
      `🛞 Прикрытие обоза переселенцев → ${targetCaravan.nameRu}`,
      `🛞 Muhajir Resettlement Escort → ${targetCaravan.nameEn}`
    );
  };

  // СПРИНТ 34 (M34): Принять и расселить семьи мухаджиров в горных аулах из казны Байт-уль-Мал (+95 ополченцев, +120 зерна, -6% стресса)
  const handleOrganizeMuhajirRelief = () => {
    playHistoricalSound('seal', soundEnabled);
    setTotalMuhajirCaravansSaved((c) => c + 1);
    setResources((prevR) => ({
      ...prevR,
      provisions: prevR.provisions + 120,
      authority: Math.min(100, prevR.authority + 4)
    }));
    setNaibates((prevN) =>
      prevN.map((nb) => ({
        ...nb,
        garrison: nb.garrison + 15,
        stress: Math.max(5, nb.stress - 6)
      }))
    );
    setUnitMovementLog((prevLog) => [
      {
        id: `muhajir-relief-${Date.now()}`,
        time: `🛞 Байт-уль-Мал`,
        textRu: `РАССЕЛЕНИЕ МУХАДЖИРОВ В НАГОРНЫХ ОКРУГАХ! Семьи переселенцев из Малой Чечни и Салатавии приняты в Шатое, Ведено и Гунибе: гарнизоны пополнены на +95 мюридов, запасы зерна +120 мер, стресс снижен на -6%!`,
        textEn: `MUHAJIR RESETTLEMENT IN MOUNTAIN NAIBATES! Families from Lesser Chechnya & Salatavia settled in Shatoy, Vedeno & Gunib: +95 militia joined garrisons, +120 grain, -6% stress!`
      },
      ...prevLog.slice(0, 7)
    ]);
    showNotice(
      t(
        '🛞 Обозы мухаджиров приняты и расселены в нагорных аулах (+95 мюридов в гарнизоны, +120 мер зерна, -6% стресса, +4% авторитета)!',
        '🛞 Muhajir caravans received and settled in mountain auls (+95 militia to garrisons, +120 grain, -6% stress, +4% authority)!'
      ),
      'ok'
    );
  };

  // СПРИНТ 37 (M37): Всплывающие боевые сводки и цифры урона/трофеев над 3D-фигурками
  const spawnFloatingCombatPopup = (x, y, textRu, textEn, color = '#fbbf24') => {
    const popupId = `float-${Date.now()}-${Math.round(Math.random() * 999)}`;
    setFloatingCombatPopups((prev) => [
      ...prev.slice(-4),
      {
        id: popupId,
        x: Math.max(65, Math.min(635, Math.round(x))),
        y: Math.max(40, Math.min(410, Math.round(y))),
        textRu,
        textEn,
        color
      }
    ]);
    // Цифра урона/трофеев всплывает один раз и исчезает через 2.4 сек
    setTimeout(() => {
      setFloatingCombatPopups((prev) => prev.filter((p) => p.id !== popupId));
    }, 2400);
  };

  // СПРИНТ 37 (M37): Быстрое переключение фокуса 3D-камеры и радара угроз на горячую точку фронта
  const handleFocusThreatHotspot = (hotspotType) => {
    playHistoricalSound('paper', soundEnabled);
    if (hotspotType === 'siege') {
      const targetN =
        naibates.find((n) => n.underSiege) ||
        [...naibates].sort((a, b) => b.imperialPressure - a.imperialPressure)[0] ||
        naibates[0];
      if (targetN) {
        setSelectedNaibateId(targetN.id);
        setTerrainProbe(sampleStrategicTerrain(targetN.coords.x, targetN.coords.y));
        setRadialWheelTarget({
          x: targetN.coords.x,
          y: targetN.coords.y,
          naibateId: targetN.id,
          titleRu: `${targetN.name} (${targetN.naibName})`,
          titleEn: `${targetN.nameEn || targetN.name} (${targetN.naibNameEn || targetN.naibName})`
        });
        spawnFloatingCombatPopup(
          targetN.coords.x,
          targetN.coords.y - 20,
          `🚨 ОСАДА: ${targetN.name} (${targetN.sabers} саб.)`,
          `🚨 SIEGE: ${targetN.nameEn || targetN.name} (${targetN.sabers} sab.)`,
          '#f87171'
        );
      }
    } else if (hotspotType === 'column') {
      const cols = liveColumnsRef.current || [];
      const topCol = [...cols].sort((a, b) => b.bayonets - a.bayonets)[0] || cols[0];
      if (topCol) {
        setTerrainProbe(sampleStrategicTerrain(topCol.x, topCol.y));
        handleInterceptImperialColumn(topCol.id);
        spawnFloatingCombatPopup(
          topCol.x,
          topCol.y - 18,
          `⚔️ ПЕРЕХВАТ: ${topCol.badgeRu}`,
          `⚔️ INTERCEPT: ${topCol.badgeEn}`,
          '#fb923c'
        );
      }
    } else if (hotspotType === 'convoy') {
      // Караваны снабжения принадлежат Имамату — радар направляет отряд на их прикрытие
      const targetCv = liveSupplyCaravans.find((c) => !c.escorted) || liveSupplyCaravans[0];
      if (targetCv) {
        setTerrainProbe(sampleStrategicTerrain(targetCv.x, targetCv.y));
        handleEscortSupplyCaravan(targetCv.id);
        spawnFloatingCombatPopup(
          targetCv.x,
          targetCv.y - 18,
          `🐪 КОНВОЙ: +${targetCv.cargoPowder}п +${targetCv.cargoSilver}₽ под охраной`,
          `🐪 ESCORT: +${targetCv.cargoPowder}p +${targetCv.cargoSilver} rub. protected`,
          '#34d399'
        );
      }
    } else if (hotspotType === 'mine') {
      handleTriggerArtillerySmokeVfx();
    }
  };

  // СПРИНТ 35 (M35) / СПРИНТ 8: Залп горных батарей с эхом теснины и тактильным импульсом 3D-стола
  const handleTriggerArtillerySmokeVfx = () => {
    triggerTactileCue('cannon_salvo');
    setAnimatedBattleVfx(true);
    setTotalBatterySalvos((c) => c + 1);

    const cols = liveColumnsRef.current || [];
    const newPlumes = cols.slice(0, 3).map((col, idx) => {
      const battery = liveMountainBatteries[idx % Math.max(1, liveMountainBatteries.length)] || {
        x: 225,
        y: 195,
        nameRu: 'Батарея Ведено',
        nameEn: 'Vedeno Battery'
      };
      return {
        id: `salvo-vfx-${Date.now()}-${idx}`,
        fromX: battery.x,
        fromY: battery.y,
        toX: Math.round(col.x),
        toY: Math.round(col.y),
        labelRu: `🔥 Залп: ${battery.badgeRu || 'Батарея'} → ${col.badgeRu}`,
        labelEn: `🔥 Salvo: ${battery.badgeEn || 'Battery'} → ${col.badgeEn}`
      };
    });
    if (newPlumes.length > 0) {
      setLiveCannonSmokePlumes(newPlumes);
      // Трассы ядер и дым рассеиваются через 3.2 сек после залпа
      const plumeIds = newPlumes.map((p) => p.id);
      setTimeout(() => {
        setLiveCannonSmokePlumes((prev) => prev.filter((p) => !plumeIds.includes(p.id)));
      }, 3200);
    }

    const nextColumns = cols.map((col) => ({
      ...col,
      bayonets: Math.max(240, col.bayonets - 85)
    }));
    liveColumnsRef.current = nextColumns;
    setLiveImperialColumns(nextColumns);

    if (cols[0]) {
      spawnFloatingCombatPopup(
        cols[0].x,
        cols[0].y - 22,
        '💥 -85 штыков РИ (Залп батарей)',
        '💥 -85 Bayonets (Battery Salvo)',
        '#f87171'
      );
    }

    setUnitMovementLog((prevLog) => [
      {
        id: `artillery-vfx-${Date.now()}`,
        time: `💥 Артиллерия 3D`,
        textRu: `БЕГЛЫЙ ОГОНЬ ГОРНЫХ БАТАРЕЙ И ЗАСЕК! Над ущельями поднялись клубы порохового дыма: все походные колонны РИ потеряли по -85 штыков!`,
        textEn: `RAPID FIRE OF MOUNTAIN BATTERIES & ABATIS! Gunpowder smoke billows across the gorges: all Imperial columns lost -85 bayonets!`
      },
      ...prevLog.slice(0, 7)
    ]);

    showNotice(
      t(
        '💥 Беглый залп горных единорогов и штуцеров! На 3D-диораме зажжены трассы ядер и клубы порохового дыма (-85 штыков у колонн РИ).',
        '💥 Rapid salvo of mountain unicorns and rifles! Shell trajectories and gunpowder smoke plumes ignited on the 3D diorama (-85 bayonets to Imperial columns).'
      ),
      'ok'
    );
  };

  // СПРИНТ 36 (M36): Смена времени суток и освещения на 3D-Столе (День -> Багровый закат -> Ночная вылазка)
  const handleCycleTimeOfDay = () => {
    playHistoricalSound('paper', soundEnabled);
    setDioramaTimeOfDay((prev) => {
      const next = prev === 'day' ? 'sunset' : prev === 'sunset' ? 'night' : 'day';
      if (next === 'sunset') {
        showNotice(
          t(
            '🌅 Над хребтами Кавказа сгущается багровый закат: зажжены факелы башен, бонус к скрытности лесных засад +10%!',
            '🌅 Crimson dusk falls over the Caucasian ridges: watchtower torches lit, forest ambush stealth bonus +10%!'
          ),
          'ok'
        );
      } else if (next === 'night') {
        showNotice(
          t(
            '🌙 Наступила горная ночь: костры в аулах и факелы конных сотен освещают ущелья, бонус к ночным вылазкам +20%!',
            '🌙 Mountain night has fallen: campfires in auls and cavalry torches light the gorges, night sortie bonus +20%!'
          ),
          'ok'
        );
      } else {
        showNotice(
          t(
            '☀️ Ясный горный день над ТВД Кавказа: полная видимость перевалов и кордонных линий.',
            '☀️ Clear mountain daylight over the Caucasus theater: full visibility across passes and cordon lines.'
          ),
          'ok'
        );
      }
      return next;
    });
  };

  // СПРИНТ 36 (M36): Ночная кинжальная вылазка мюридов под покровом темноты (-110 штыков у колонн РИ, +30п пороха, +75₽)
  const handleLaunchNightSortie = () => {
    playHistoricalSound('blade', soundEnabled);
    setDioramaTimeOfDay('night');
    setAnimatedBattleVfx(true);

    const cols = liveColumnsRef.current || [];
    const nextCols = cols.map((col) => ({
      ...col,
      bayonets: Math.max(220, col.bayonets - 110)
    }));
    liveColumnsRef.current = nextCols;
    setLiveImperialColumns(nextCols);

    setResources((prevR) => ({
      ...prevR,
      gunpowder: prevR.gunpowder + 30,
      silver: prevR.silver + 75,
      authority: Math.min(100, prevR.authority + 3)
    }));

    if (cols[0]) {
      spawnFloatingCombatPopup(
        cols[0].x,
        cols[0].y - 24,
        '🌙 -110 штыков • +30п Пороха • +75₽',
        '🌙 -110 Bayonets • +30p Powder • +75 Rub.',
        '#a78bfa'
      );
    }

    setUnitMovementLog((prevLog) => [
      {
        id: `night-sortie-log-${Date.now()}`,
        time: `🌙 Ночной рейд`,
        textRu: `НОЧНАЯ КИНЖАЛЬНАЯ ВЫЛАЗКА МЮРИДОВ! Под покровом горной ночи конные сотни бесшумно ворвались в биваки колонн РИ: -110 штыков у противника, захвачено +30 пуд. пороха и +75 руб. серебра!`,
        textEn: `MURID NIGHT KINDJAL SORTIE! Under cover of mountain darkness, cavalry hundreds silently struck Imperial bivouacs: -110 enemy bayonets, +30p powder & +75 silver captured!`
      },
      ...prevLog.slice(0, 7)
    ]);

    showNotice(
      t(
        '🌙 Ночная кинжальная вылазка мюридов! На 3D-диораме включён режим Ночи (+20% скрытности), колонны РИ потеряли по -110 штыков, захвачено +30 пуд. пороха и +75₽!',
        '🌙 Murid night kindjal sortie! Night mode (+20% stealth) engaged on the 3D diorama, Imperial columns lost -110 bayonets each, +30p powder & +75 silver captured!'
      ),
      'ok'
    );
  };

  // СПРИНТ 36 (M36): Исполнение быстрого приказа из Кругового Колеса Команд (Radial Tactical Command Wheel) на 3D-Диораме
  const handleExecuteRadialCommand = (cmdType) => {
    if (!radialWheelTarget) return;
    const targetNaib = naibates.find((n) => n.id === radialWheelTarget.naibateId) || selectedNaibate;

    if (cmdType === 'march_unit') {
      handleCommandUnitMoveToPoint(
        selectedUnitId,
        radialWheelTarget.x,
        radialWheelTarget.y,
        radialWheelTarget.titleRu,
        radialWheelTarget.titleEn
      );
    } else if (cmdType === 'send_envoy') {
      if (targetNaib) {
        setSelectedNaibateId(targetNaib.id);
      }
      handleSendEnvoy();
    } else if (cmdType === 'tactical_battle') {
      if (targetNaib) {
        setSelectedNaibateId(targetNaib.id);
        handleEnterTacticalDiorama(targetNaib);
      }
    } else if (cmdType === 'fire_salvo') {
      handleTriggerArtillerySmokeVfx();
    }
    setRadialWheelTarget(null);
  };

  // СПРИНТ 33 (M33): Перевести выбранную пороховую мельницу или кузницу в форсированный режим выработки
  const handleBoostPowderMill = (millId) => {
    playHistoricalSound('cannon', soundEnabled);
    setPowderMills((prev) => {
      const next = prev.map((m) =>
        m.id === millId
          ? {
              ...m,
              overdrive: true,
              yieldPowder: Math.min(28, m.yieldPowder + 4),
              yieldSilver: Math.min(70, m.yieldSilver + 8)
            }
          : m
      );
      powderMillsRef.current = next;
      return next;
    });
    setTotalMillBatchesProduced((c) => c + 1);
    setResources((prevR) => ({
      ...prevR,
      gunpowder: prevR.gunpowder + 24,
      silver: prevR.silver + 40
    }));
    showNotice(
      t(
        '⚙️ Мастерская переведена на круглосуточную выварку селитры и ковку штуцеров (+24 пуда пороха, +40 руб.)!',
        '⚙️ Mountain workshop switched to round-the-clock saltpeter boiling & rifle forging (+24 poods powder, +40 rub.)!'
      ),
      'ok'
    );
  };

  // СПРИНТ 33 (M33): Форсировать все 4 пороховые мельницы, селитренные пещеры и кузницы Унцукуля
  const handleOverdriveAllPowderMills = () => {
    playHistoricalSound('cannon', soundEnabled);
    setPowderMills((prev) => {
      const next = prev.map((m) => ({
        ...m,
        overdrive: true,
        yieldPowder: Math.max(20, m.yieldPowder + 3)
      }));
      powderMillsRef.current = next;
      return next;
    });
    setTotalMillBatchesProduced((c) => c + 4);
    setResources((prevR) => ({
      ...prevR,
      gunpowder: prevR.gunpowder + 65,
      silver: prevR.silver + 120,
      authority: Math.min(100, prevR.authority + 3)
    }));
    setUnitMovementLog((prevLog) => [
      {
        id: `mills-overdrive-${Date.now()}`,
        time: `⚙️ Арсенал Имамата`,
        textRu: `ФОРСИРОВАНА ВЫРАБОТКА ВСЕХ 4 ЦЕНТРОВ ВПК ИМАМАТА! Мельница Ведено, пещеры Гуниба, копи Чиркаты и кузницы Унцукуля выдали +65 пуд. боевого пороха и +120 руб. серебром!`,
        textEn: `ALL 4 IMAMATE WORKSHOPS OVERDRIVEN! Vedeno Foundry, Gunib Saltpeter Caves, Chirkata Sulfur Mines & Untsukul Armories delivered +65 poods powder & +120 silver rub.!`
      },
      ...prevLog.slice(0, 7)
    ]);
    showNotice(
      t(
        '⚙️ Все 4 центра ВПК Имамата (Ведено, Гуниб, Чирката, Унцукуль) выдали ударную партию: +65 пудов пороха и +120 руб.!',
        '⚙️ All 4 Imamate WPK centers (Vedeno, Gunib, Chirkata, Untsukul) delivered surge batch: +65 poods powder & +120 rub.!'
      ),
      'ok'
    );
  };

  // СПРИНТ 33 (M33): Направить летучий конный отряд на перехват царского фельдъегеря или штабного курьера на Линии
  const handleInterceptImperialCourier = (courierId = null) => {
    const activeUnit =
      liveFieldUnits.find((u) => u.id === selectedUnitId) || liveFieldUnits[0];
    const targetCourier =
      (courierId && liveImperialCouriers.find((c) => c.id === courierId)) ||
      liveImperialCouriers[0];
    if (!targetCourier) return;

    handleCommandUnitMoveToPoint(
      activeUnit.id,
      Math.round(targetCourier.x),
      Math.round(targetCourier.y),
      `Перехват: ${targetCourier.badgeRu}`,
      `Intercept: ${targetCourier.badgeEn}`,
      `📯 Засада по наводке кунаков → ${targetCourier.nameRu}`,
      `📯 Kunak Intelligence Ambush → ${targetCourier.nameEn}`
    );
  };

  // СПРИНТ 6: Активация отдельной сети тайных кунаков прямо на 3D-карте (рассеивает туман и вскрывает колонны РИ)
  const handleActivateSingleKunakRing = (ringId) => {
    const res = activateSingleKunakRing({
      kunakSpyRings,
      ringId,
      silver: resources.silver,
      costSilver: 45
    });
    if (!res.ok) {
      if (res.reason === 'insufficient_silver') {
        alertMsg(
          t(
            'Недостаточно серебра (нужно 45 руб.) для подкупа и поднятия сети кунаков!',
            'Insufficient silver (45 rub. needed) to activate this kunak spy ring!'
          )
        );
      }
      return;
    }
    playHistoricalSound('seal', soundEnabled);
    setKunakSpyRings(res.nextRings);
    setResources((prevR) => ({
      ...prevR,
      silver: Math.max(0, prevR.silver - res.spentSilver)
    }));
    setImperialAi((prevAi) => ({ ...prevAi, scouted: true }));
    if (res.ring) {
      spawnFloatingCombatPopup(
        res.ring.x,
        res.ring.y,
        `🕵️ ${t(res.ring.badgeRu, res.ring.badgeEn)}`,
        t('Туман рассеян! Планы и колонны РИ вскрыты (-45₽)', 'Fog lifted! Imperial plans & columns revealed (-45r)'),
        '#2dd4bf'
      );
      showNotice(
        t(
          `🕵️ Сеть «${res.ring.badgeRu}» активирована (-45₽): туман за перевалами рассеян, скрытые колонны РИ и стрелки намерений вскрыты!`,
          `🕵️ Ring “${res.ring.badgeEn}” activated (-45r): mountain fog lifted, hidden Imperial columns & intent arrows revealed!`
        )
      );
    }
  };

  // СПРИНТ 33 (M33): Задействовать всю сеть тайных кунаков (Грозная, Андреево, Темир-Хан-Шура) для перехвата депеш и срыва планов РИ
  const handleActivateKunakSpyNetwork = () => {
    playHistoricalSound('cavalry', soundEnabled);
    setKunakSpyRings((prev) => prev.map((r) => ({ ...r, active: true })));
    setTotalCouriersIntercepted((c) => c + 1);
    setResources((prevR) => ({
      ...prevR,
      silver: prevR.silver + 160,
      gunpowder: prevR.gunpowder + 25,
      authority: Math.min(100, prevR.authority + 3)
    }));
    setNaibates((prevN) =>
      prevN.map((nb) => ({
        ...nb,
        imperialPressure: Math.max(10, nb.imperialPressure - 12)
      }))
    );

    const firstCourier = liveImperialCouriers[0];
    if (firstCourier) {
      setLiveSkirmishBursts((prevB) => [
        ...prevB.slice(-5),
        {
          id: `kunak-intel-${Date.now()}`,
          x: Math.round(firstCourier.x),
          y: Math.round(firstCourier.y),
          createdAt: performance.now(),
          titleRu: `🕵️ СЕТЬ КУНАКОВ ВСКРЫЛА ПЛАНЫ ШТАБА РИ! -12% натиска!`,
          titleEn: `🕵️ KUNAK SPY NETWORK INTERCEPTED CORPS DISPATCHES! -12% pressure!`,
          spoilsRu: `Перехвачена казённая фельдъегерская почта: +160₽ и +25п пороха`,
          spoilsEn: `Captured Feldjäger pouch: +160 rub. & +25p powder`
        }
      ]);
    }

    setUnitMovementLog((prevLog) => [
      {
        id: `kunak-op-${Date.now()}`,
        time: `🕵️ Тайные кунаки`,
        textRu: `ОПЕРАЦИЯ ТАЙНЫХ КУНАКОВ НА ЛИНИИ! Лазутчики в Грозной, Эндирее и Темир-Хан-Шуре перехватили фельдъегерские депеши Кавказского корпуса: натиск РИ снижен на -12%, захвачено +160 руб. и +25 пуд. пороха!`,
        textEn: `KUNAK SPY NETWORK OPERATION! Informants in Groznaya, Endirey & Temir-Khan-Shura intercepted Caucasian Corps dispatches: Imperial pressure -12%, +160 rub. & +25 poods powder!`
      },
      ...prevLog.slice(0, 7)
    ]);

    showNotice(
      t(
        '🕵️ Сеть тайных кунаков перехватила секретные диспозиции штаба РИ (-12% натиска во всех округах, +160 руб., +25 пудов пороха)!',
        '🕵️ Kunak Spy Network intercepted Imperial Staff dispositions (-12% pressure across naibates, +160 rub., +25 poods powder)!'
      ),
      'ok'
    );
  };

  // СПРИНТ 32 (M32): Оснастить полевой госпиталь джаррахов хирургическим набором и эфирным наркозом (+55% возврата раненых)
  const handleUpgradeFieldHospital = (hospId) => {
    playHistoricalSound('seal', soundEnabled);
    setFieldHospitals((prev) => {
      const next = prev.map((h) =>
        h.id === hospId
          ? {
              ...h,
              upgraded: true,
              recoveryRate: 0.55,
              healSabersPerPulse: Math.max(18, h.healSabersPerPulse + 4),
              radius: Math.min(68, h.radius + 8)
            }
          : h
      );
      fieldHospitalsRef.current = next;
      return next;
    });
    setTotalWoundedRecoveredOnMap((c) => c + 25);
    setNaibates((prevN) =>
      prevN.map((nb, idx) =>
        idx < 2 ? { ...nb, garrison: nb.garrison + 15, stress: Math.max(5, nb.stress - 3) } : nb
      )
    );
    showNotice(
      t(
        '🏥 Полевой лазарет оснащён хирургическим инструментарием и эфирным наркозом (возврат раненых 55%, +30 сабель в строй)!',
        '🏥 Field lazaret equipped with surgical instruments & ether anesthesia (55% wounded recovery, +30 sabers returned to ranks)!'
      ),
      'ok'
    );
  };

  // СПРИНТ 32 (M32): Экстренная эвакуация раненых с передовой на санитарных арбах во все 4 горных госпиталя
  const handleEvacuateWoundedToHospitals = () => {
    playHistoricalSound('cavalry', soundEnabled);
    setTotalWoundedRecoveredOnMap((c) => c + 65);
    setNaibates((prevN) =>
      prevN.map((nb) => ({
        ...nb,
        garrison: nb.garrison + 12,
        stress: Math.max(5, nb.stress - 5)
      }))
    );
    setResources((prevR) => ({
      ...prevR,
      authority: Math.min(100, prevR.authority + 3)
    }));
    setUnitMovementLog((prevLog) => [
      {
        id: `hosp-evac-${Date.now()}`,
        time: `🏥 Санитарный обоз`,
        textRu: `ЭВАКУАЦИЯ РАНЕНЫХ В ЛАЗАРЕТЫ ДЖАРРАХОВ! В Салты, Чох, Ведено и Шатой доставлены раненые мюриды: хакимы вернули в строй +65 сабель и снизили стресс округов на -5%!`,
        textEn: `WOUNDED EVACUATION TO HAKIM LAZARETS! Wounded murids evacuated to Salty, Chokh, Vedeno & Shatoy: +65 sabers returned to ranks and -5% naibate stress!`
      },
      ...prevLog.slice(0, 7)
    ]);
    showNotice(
      t(
        '🏥 Санитарные арбы эвакуировали раненых в лазареты Салты, Чоха, Ведено и Шатоя (+65 сабель в строй, -5% стресса)!',
        '🏥 Medical carts evacuated wounded to Salty, Chokh, Vedeno & Shatoy lazarets (+65 sabers returned to ranks, -5% stress)!'
      ),
      'ok'
    );
  };

  // СПРИНТ 32 (M32): Выслать конный конвой к парламентёрскому каравану обмена пленных на Мичике или у Ярыксу
  const handleDispatchPrisonerExchange = (convoyId = null) => {
    const activeUnit =
      liveFieldUnits.find((u) => u.id === selectedUnitId) || liveFieldUnits[0];
    const targetConvoy =
      (convoyId && livePrisonerConvoys.find((c) => c.id === convoyId)) ||
      livePrisonerConvoys[0];
    if (!targetConvoy) return;

    handleCommandUnitMoveToPoint(
      activeUnit.id,
      Math.round(targetConvoy.x),
      Math.round(targetConvoy.y),
      `Охрана размена: ${targetConvoy.badgeRu}`,
      `Truce Escort: ${targetConvoy.badgeEn}`,
      `🏳️ Охрана парламентёрского конвоя → ${targetConvoy.nameRu}`,
      `🏳️ Prisoner Exchange Truce Escort → ${targetConvoy.nameEn}`
    );
  };

  // СПРИНТ 32 (M32): Провести Большой исторический размен пленных офицеров и аманатов на р. Мичик (линия Джамалуддина 1855 г.)
  const handleExecuteMichikGrandExchange = () => {
    playHistoricalSound('seal', soundEnabled);
    setTotalPrisonerExchangesCompleted((c) => c + 1);
    setResources((prevR) => ({
      ...prevR,
      silver: prevR.silver + 180,
      gunpowder: prevR.gunpowder + 35,
      provisions: prevR.provisions + 110,
      authority: Math.min(100, prevR.authority + 4)
    }));
    setNaibates((prevN) =>
      prevN.map((nb) => ({
        ...nb,
        stress: Math.max(5, nb.stress - 6)
      }))
    );

    const michikConvoy = livePrisonerConvoys[0];
    if (michikConvoy) {
      setLiveSkirmishBursts((prevB) => [
        ...prevB.slice(-5),
        {
          id: `michik-truce-${Date.now()}`,
          x: michikConvoy.destX,
          y: michikConvoy.destY,
          createdAt: performance.now(),
          titleRu: `🏳️ БОЛЬШОЙ РАЗМЕН НА МИЧИКЕ! +180 руб. • +35п пороха!`,
          titleEn: `🏳️ GRAND MICHIK EXCHANGE! +180 rub. • +35p powder!`,
          spoilsRu: `Аманаты возвращены в семьи (-6% стресса, +110п зерна, +4% авторитета)`,
          spoilsEn: `Amanat hostages returned (-6% stress, +110p grain, +4% authority)`
        }
      ]);
    }

    setUnitMovementLog((prevLog) => [
      {
        id: `michik-grand-${Date.now()}`,
        time: `🏳️ Брод на р. Мичик`,
        textRu: `БОЛЬШОЙ РАЗМЕН НА МИЧИКЕ (линия Джамалуддина)! У Куринского брода состоялся обмен пленных офицеров и возврат аманатов: +180 руб. серебром, +35 пуд. штуцерного пороха, +110 пуд. зерна и -6% стресса Шамиля!`,
        textEn: `GRAND EXCHANGE ON THE MICHIK (Jamaluddin Line)! Prisoner & amanat exchange completed at Kurinsky Ford: +180 silver rub., +35 poods powder, +110 poods grain & -6% stress!`
      },
      ...prevLog.slice(0, 7)
    ]);

    showNotice(
      t(
        '🏳️ Большой размен пленных и аманатов на р. Мичик проведён (+180 руб., +35 пудов пороха, +110 пудов зерна, -6% стресса)!',
        '🏳️ Grand Prisoner & Amanat Exchange on the Michik completed (+180 rub., +35 poods powder, +110 poods grain, -6% stress)!'
      ),
      'ok'
    );
  };

  // СПРИНТ 31 (M31): Заложить заново или подорвать выбранный подземный пороховой камуфлет на 3D-карте
  const handleArmSapperMine = (mineId) => {
    playHistoricalSound('cannon', soundEnabled);
    setSapperMines((prev) => {
      const next = prev.map((m) => (m.id === mineId ? { ...m, status: 'armed' } : m));
      sapperMinesRef.current = next;
      return next;
    });
    showNotice(
      t(
        '🧨 Подземная минная галерея вновь заряжена порохом и взведена!',
        '🧨 Underground sapper mine gallery re-charged with powder and armed!'
      ),
      'ok'
    );
  };

  // СПРИНТ 31 (M31): Командный подрыв всех подземных камуфлетов под наступающими колоннами РИ
  const handleDetonateAllSapperMines = () => {
    playHistoricalSound('cannon', soundEnabled);
    setTotalMinesDetonatedOnMap((c) => c + 1);
    setPlaytestTelemetry((pt) => ({
      ...pt,
      camoufletsDetonated: (pt.camoufletsDetonated || 0) + 1,
      totalPowderCapturedInTactics: (pt.totalPowderCapturedInTactics || 0) + 30
    }));
    setResources((prevR) => ({
      ...prevR,
      gunpowder: prevR.gunpowder + 30,
      authority: Math.min(100, prevR.authority + 4)
    }));

    setSapperMines((prev) => {
      const next = prev.map((m) => ({ ...m, status: 'armed' }));
      sapperMinesRef.current = next;
      return next;
    });

    setLiveImperialColumns((prevCols) => {
      const nextCols = prevCols.map((col, idx) => {
        if (idx !== 0) return { ...col, bayonets: Math.max(580, col.bayonets - 240) };
        const retreatPath = computeTerrainAwarePath(col.x, col.y, col.originX, col.originY);
        const firstRet = retreatPath[1] || retreatPath[0] || { x: col.originX, y: col.originY };
        return {
          ...col,
          bayonets: Math.max(580, col.bayonets - 380),
          status: 'retreating',
          headingDeg: Math.round(
            (Math.atan2(firstRet.y - col.y, firstRet.x - col.x) * 180) / Math.PI
          ),
          waypoints: retreatPath,
          waypointIdx: Math.min(1, retreatPath.length - 1),
          trail: [{ x: Math.round(col.x), y: Math.round(col.y) }]
        };
      });
      liveColumnsRef.current = nextCols;
      return nextCols;
    });

    const firstMine = sapperMines[0];
    if (firstMine) {
      setLiveSkirmishBursts((prevB) => [
        ...prevB.slice(-5),
        {
          id: `manual-camouflet-${Date.now()}`,
          x: firstMine.x,
          y: firstMine.y,
          createdAt: performance.now(),
          titleRu: `🧨 ВЗРЫВ КОНТРМИННЫХ ГАЛЕРЕЙ! -380 шт. РИ! +30п пороха!`,
          titleEn: `🧨 COUNTER-MINE GALLERIES DETONATED! -380 bayonets! +30p powder!`,
          spoilsRu: `Подземные горны взорваны и перезаряжены сапёрами Имамата`,
          spoilsEn: `Subterranean powder chambers detonated and re-armed by Imamate sappers`
        }
      ]);
    }

    setUnitMovementLog((prevLog) => [
      {
        id: `camouflet-manual-${Date.now()}`,
        time: `🧨 Подрыв камуфлетов`,
        textRu: `КОМАНДНЫЙ ПОДРЫВ КАМУФЛЕТОВ! Взорваны подземные пороховые горны на подходах к крепостям (-380 штыков у головной колонны РИ, захвачено +30 пуд. пороха, +4% авторитета)!`,
        textEn: `COMMAND CAMOUFLET DETONATION! Subterranean powder chambers blown beneath enemy siege approaches (-380 bayonets, +30 poods powder, +4% authority)!`
      },
      ...prevLog.slice(0, 7)
    ]);

    showNotice(
      t(
        '🧨 Подземные пороховые камуфлеты подорваны под колоннами РИ (-380 штыков, +30 пудов пороха)!',
        '🧨 Underground powder camouflets detonated beneath Imperial columns (-380 bayonets, +30 poods powder)!'
      ),
      'ok'
    );
  };

  // СПРИНТ 31 (M31): Выслать почётный конвой к дипломатической миссии Черкесии или каравану из Трапезунда
  const handleEscortDiplomaticMission = (missionId = null) => {
    const activeUnit =
      liveFieldUnits.find((u) => u.id === selectedUnitId) || liveFieldUnits[0];
    const targetMission =
      (missionId && liveDiplomaticMissions.find((m) => m.id === missionId)) ||
      liveDiplomaticMissions[0];
    if (!targetMission) return;

    handleCommandUnitMoveToPoint(
      activeUnit.id,
      Math.round(targetMission.x),
      Math.round(targetMission.y),
      `Почётный конвой: ${targetMission.badgeRu}`,
      `Honor Escort: ${targetMission.badgeEn}`,
      `🌙 Почётный эскорт посольства → ${targetMission.nameRu}`,
      `🌙 Diplomatic Embassy Escort → ${targetMission.nameEn}`
    );
  };

  // СПРИНТ 30 (M30): Выдвинуть горную батарею единорогов на господствующий гребень перед наступающей колонной РИ
  const handleDeployBatteryToRidge = (batteryId = null) => {
    playHistoricalSound('cannon', soundEnabled);
    const activeCols = liveImperialColumns.filter((c) => c.status === 'advancing');
    const targetCol = activeCols[0] || liveImperialColumns[0];

    setLiveMountainBatteries((prev) =>
      prev.map((bat, idx) => {
        if (batteryId && bat.id !== batteryId) return bat;
        const col = activeCols[idx % Math.max(1, activeCols.length)] || targetCol;
        const ridgeX = Math.max(40, Math.min(660, Math.round(col.x + (idx === 0 ? -18 : 18))));
        const ridgeY = Math.max(55, Math.min(410, Math.round(col.y + 34)));
        const path = computeTerrainAwarePath(bat.x, bat.y, ridgeX, ridgeY);
        const firstWp = path[1] || path[0] || { x: ridgeX, y: ridgeY };
        return {
          ...bat,
          targetX: ridgeX,
          targetY: ridgeY,
          status: 'moving',
          headingDeg: Math.round(
            (Math.atan2(firstWp.y - bat.y, firstWp.x - bat.x) * 180) / Math.PI
          ),
          waypoints: path,
          waypointIdx: Math.min(1, path.length - 1),
          trail: [{ x: Math.round(bat.x), y: Math.round(bat.y) }]
        };
      })
    );

    setUnitMovementLog((prevLog) => [
      {
        id: `bat-deploy-${Date.now()}`,
        time: `💣 Позиция единорогов`,
        textRu: `Приказ инженерам Яхье аль-Мильки и Хаджи-Юсуфу: горные батареи единорогов выдвигаются на господствующие гребни перед колоннами РИ для навесного обстрела!`,
        textEn: `Order to Yahya al-Milki & Hadji Yusuf: mountain unicorn batteries advancing to high-ground ridges ahead of Imperial columns!`
      },
      ...prevLog.slice(0, 7)
    ]);
  };

  // СПРИНТ 30 (M30): Дать немедленный сосредоточенный залп из обеих горных батарей по наступающим колоннам РИ
  const handleConcentrateArtilleryFire = () => {
    playHistoricalSound('cannon', soundEnabled);
    setTotalBatterySalvos((c) => c + 2);

    setLiveImperialColumns((prevCols) => {
      const nextCols = prevCols.map((col) => {
        const hitLosses = 210;
        const remBayonets = Math.max(580, col.bayonets - hitLosses);
        return {
          ...col,
          bayonets: remBayonets
        };
      });
      liveColumnsRef.current = nextCols;
      return nextCols;
    });

    const firstCol = liveImperialColumns[0];
    if (firstCol) {
      setLiveSkirmishBursts((prevB) => [
        ...prevB.slice(-5),
        {
          id: `concentrated-salvo-${Date.now()}`,
          x: firstCol.x,
          y: firstCol.y,
          createdAt: performance.now(),
          titleRu: `💣 БЕГЛЫЙ ОГОНЬ БАТАРЕЙ ВЕДЕНО! -210 шт. по колоннам РИ!`,
          titleEn: `💣 VEDENO ARTILLERY BARRAGE! -210 bayonets across Imperial columns!`,
          spoilsRu: `Медные единороги Яхьи аль-Мильки и Хаджи-Юсуфа накрыли перевалы`,
          spoilsEn: `Yahya al-Milki & Hadji Yusuf copper unicorns shelled the mountain passes`
        }
      ]);
    }

    setUnitMovementLog((prevLog) => [
      {
        id: `bat-fire-all-${Date.now()}`,
        time: `💣 Беглый залп батарей`,
        textRu: `СОСРЕДОТОЧЕННЫЙ АРТИЛЛЕРИЙСКИЙ ОГОНЬ! Обе горные батареи Имамата дали залп гранатами с гребней — каждая колонна РИ потеряла по -210 штыков!`,
        textEn: `CONCENTRATED ARTILLERY BARRAGE! Both Imamate mountain batteries fired shrapnel from the ridges — each Imperial column lost -210 bayonets!`
      },
      ...prevLog.slice(0, 7)
    ]);

    showNotice(
      t(
        '💣 Обе горные батареи дали сосредоточенный залп с хребтов (-210 штыков у каждой колонны РИ)!',
        '💣 Both mountain batteries fired a concentrated ridge barrage (-210 bayonets per Imperial column)!'
      ),
      'ok'
    );
  };

  // СПРИНТ 30 (M30): Направить выбранный отряд Имамата на охрану сезонного перегона отар на альпийские пастбища-джайляу
  const handleProtectTranshumanceFlock = (flockId = null) => {
    const activeUnit =
      liveFieldUnits.find((u) => u.id === selectedUnitId) || liveFieldUnits[0];
    const targetFlock =
      (flockId && liveTranshumanceFlocks.find((f) => f.id === flockId)) ||
      liveTranshumanceFlocks[0];
    if (!targetFlock) return;

    handleCommandUnitMoveToPoint(
      activeUnit.id,
      Math.round(targetFlock.x),
      Math.round(targetFlock.y),
      `Охрана отар: ${targetFlock.badgeRu}`,
      `Guard Flocks: ${targetFlock.badgeEn}`,
      `🐑 Охрана перегона на джайляу → ${targetFlock.nameRu}`,
      `🐑 Dzhaylyau Pasture Escort → ${targetFlock.nameEn}`
    );
  };

  // СПРИНТ 29 (M29): Навести или разобрать горный мост через Аргун, Койсу или Сунжу перед колоннами РИ
  const handleToggleRiverBridge = (bridgeId) => {
    playHistoricalSound('cannon', soundEnabled);
    setRiverBridges((prev) => {
      const next = prev.map((br) =>
        br.id === bridgeId
          ? { ...br, status: br.status === 'intact' ? 'dismantled' : 'intact' }
          : br
      );
      riverBridgesRef.current = next;
      const target = next.find((br) => br.id === bridgeId);
      if (target) {
        if (target.status === 'dismantled') {
          setTotalBridgesBlown((c) => c + 1);
        }
        setUnitMovementLog((prevLog) => [
          {
            id: `bridge-toggle-${Date.now()}`,
            time: `🌉 Переправа: ${target.riverNameRu}`,
            textRu:
              target.status === 'dismantled'
                ? `Разобран «${target.nameRu}»! Царские колонны на этом направлении будут вынуждены идти в обход через скальный перевал под огнём стрелков!`
                : `Восстановлен настил «${target.nameRu}»: скорость переправы отрядов и караванов Имамата повышена на +25%!`,
            textEn:
              target.status === 'dismantled'
                ? `Dismantled “${target.nameEn}”! Imperial columns approaching this gorge will be forced onto a high-mountain detour pass!`
                : `Rebuilt “${target.nameEn}”: Imamate detachment & caravan crossing speed boosted by +25%!`
          },
          ...prevLog.slice(0, 7)
        ]);
      }
      return next;
    });
  };

  // СПРИНТ 29 (M29): Экстренно разобрать все 4 горных моста перед наступающими колоннами РИ
  const handleBlowBridgesAheadOfColumns = () => {
    playHistoricalSound('cannon', soundEnabled);
    setRiverBridges((prev) => {
      const next = prev.map((br) => ({ ...br, status: 'dismantled' }));
      riverBridgesRef.current = next;
      return next;
    });
    setTotalBridgesBlown((c) => c + 4);
    setUnitMovementLog((prevLog) => [
      {
        id: `bridge-all-${Date.now()}`,
        time: `💥 Все мосты разобраны`,
        textRu: `ПРИКАЗ ДИВАН-ХАНЫ: Разобраны все 4 моста через Сунжу, Аргун, Сулак и Кара-Койсу! Наступающие колонны РИ отрезаны от прямых переправ и направлены в круговой обход по скалам!`,
        textEn: `DIVAN-KHANA ORDER: All 4 mountain bridges across Sunzha, Argun, Sulak & Kara-Koysu dismantled! Advancing Imperial columns are forced onto rocky mountain detours!`
      },
      ...prevLog.slice(0, 7)
    ]);
    showNotice(
      t(
        '💥 Разобраны все 4 горных моста перед колоннами РИ — противник вынужден идти в обход через перевалы!',
        '💥 All 4 mountain bridges dismantled ahead of Imperial columns — enemy forced onto mountain detours!'
      ),
      'ok'
    );
  };

  // СПРИНТ 29 (M29): Экстренно направить конный разъезд мухтасиба/кадия в выбранное наибство (+5% лояльности, -6% натиска)
  const handleDispatchMuhtasibToNaibate = (targetNaibateId = null) => {
    const destNaib =
      naibates.find((n) => n.id === (targetNaibateId || selectedNaibateId)) || selectedNaibate;
    if (!destNaib) return;

    playHistoricalSound('seal', soundEnabled);
    setLiveMuhtasibPatrols((prev) =>
      prev.map((pat, idx) => {
        if (idx !== 0) return pat;
        const path = computeTerrainAwarePath(pat.x, pat.y, destNaib.coords.x, destNaib.coords.y);
        const firstWp = path[1] || path[0] || destNaib.coords;
        return {
          ...pat,
          boosted: true,
          targetNaibateId: destNaib.id,
          targetNameRu: destNaib.name,
          targetNameEn: destNaib.nameEn || destNaib.name,
          targetX: destNaib.coords.x,
          targetY: destNaib.coords.y,
          headingDeg: Math.round(
            (Math.atan2(firstWp.y - pat.y, firstWp.x - pat.x) * 180) / Math.PI
          ),
          waypoints: path,
          waypointIdx: Math.min(1, path.length - 1),
          trail: [{ x: Math.round(pat.x), y: Math.round(pat.y) }]
        };
      })
    );

    setUnitMovementLog((prevLog) => [
      {
        id: `muhtasib-cmd-${Date.now()}`,
        time: `⚖️ Выезд мухтасиба`,
        textRu: `Экстренная ревизия (+40% скорости): Конный разъезд мухтасиба направлен в наибство «${destNaib.name}» для укрепления дисциплины (+5% лояльности, -6% натиска РИ)!`,
        textEn: `Urgent Sharia Inspection (+40% speed): Muhtasib patrol dispatched to “${destNaib.nameEn || destNaib.name}” (+5% loyalty, -6% Imperial pressure)!`
      },
      ...prevLog.slice(0, 7)
    ]);

    showNotice(
      t(
        `⚖️ Конный разъезд мухтасиба выехал в «${destNaib.name}» (+40% скорости, +5% лояльности по прибытии)!`,
        `⚖️ Muhtasib patrol riding to “${destNaib.nameEn || destNaib.name}” (+40% speed, +5% loyalty on arrival)!`
      ),
      'ok'
    );
  };

  // СПРИНТ 28 (M28): Зажечь или погасить сигнальный костёр на горном хребте (+30% скорости мобилизации и марша)
  const handleToggleSignalBeacon = (beaconId) => {
    playHistoricalSound('seal', soundEnabled);
    setSignalBeacons((prev) => {
      const next = prev.map((b) => (b.id === beaconId ? { ...b, isLit: !b.isLit } : b));
      signalBeaconsRef.current = next;
      const target = next.find((b) => b.id === beaconId);
      if (target) {
        setUnitMovementLog((prevLog) => [
          {
            id: `beacon-${Date.now()}`,
            time: `🔥 Сигнальный хребет`,
            textRu: target.isLit
              ? `Зажжён сигнальный огонь «${target.nameRu}»: +30% к скорости отрядов Имамата в радиусе ${target.radius} верст и ранний пеленг колонн РИ!`
              : `Погашен сигнальный костёр «${target.nameRu}» для маскировки манёвра.`,
            textEn: target.isLit
              ? `Signal beacon lit at “${target.nameEn}”: +30% speed to Imamate units within radius and early warning on Imperial columns!`
              : `Signal fire extinguished at “${target.nameEn}” to conceal troop movement.`
          },
          ...prevLog.slice(0, 7)
        ]);
      }
      return next;
    });
  };

  // СПРИНТ 28 (M28): Зажечь все 4 сигнальные башни на хребтах Восточного Кавказа
  const handleIgniteAllSignalBeacons = () => {
    playHistoricalSound('cannon', soundEnabled);
    setSignalBeacons((prev) => {
      const next = prev.map((b) => ({ ...b, isLit: true }));
      signalBeaconsRef.current = next;
      return next;
    });
    setUnitMovementLog((prevLog) => [
      {
        id: `beacon-all-${Date.now()}`,
        time: `🔥 Все хребты в огне`,
        textRu: `ЗАЖЖЕНЫ ВСЕ 4 СИГНАЛЬНЫХ МАЯКА НА ХРЕБТАХ (Качкалык, Анди, Салатау, Турчидаг)! Скорость марша отрядов Имамата повышена на +30%, открыт полный пеленг колонн РИ!`,
        textEn: `ALL 4 MOUNTAIN SIGNAL BEACONS LIT (Kachkalyk, Andi, Salatau, Turchidag)! Imamate unit march speed boosted by +30% with full early-warning radar!`
      },
      ...prevLog.slice(0, 7)
    ]);
    showNotice(
      t(
        '🔥 Зажжены все 4 сигнальные башни на хребтах: +30% к скорости отрядов Имамата и ранний пеленг колонн РИ!',
        '🔥 All 4 mountain signal beacons lit: +30% speed to Imamate detachments & early warning radar active!'
      ),
      'ok'
    );
  };

  // СПРИНТ 28 (M28): Бросить конницу Хаджи-Мурата (или выбранный отряд) в глубокий конный рейд за линию Терека и Сунжи
  const handleLaunchDeepCavalryRaid = (raidTargetId = null) => {
    const targetRaid =
      (raidTargetId && deepRaidTargets.find((r) => r.id === raidTargetId)) ||
      deepRaidTargets[0];
    if (!targetRaid) return;

    const raidingUnit =
      liveFieldUnits.find((u) => u.id === 'unit_hadji_murad') ||
      liveFieldUnits.find((u) => u.id === selectedUnitId) ||
      liveFieldUnits[0];

    playHistoricalSound('cannon', soundEnabled);
    setSelectedUnitId(raidingUnit.id);

    setLiveFieldUnits((prev) => {
      const next = prev.map((u) => {
        if (u.id !== raidingUnit.id) return u;
        const path = computeTerrainAwarePath(u.x, u.y, targetRaid.x, targetRaid.y);
        const firstWp = path[1] || path[0] || { x: targetRaid.x, y: targetRaid.y };
        const headingDeg = Math.round(
          (Math.atan2(firstWp.y - u.y, firstWp.x - u.x) * 180) / Math.PI
        );
        return {
          ...u,
          targetX: targetRaid.x,
          targetY: targetRaid.y,
          targetLabelRu: `РЕЙД: ${targetRaid.badgeRu}`,
          targetLabelEn: `RAID: ${targetRaid.badgeEn}`,
          orderTitleRu: `🐎 Глубокий рейд за Терек → ${targetRaid.nameRu}`,
          orderTitleEn: `🐎 Deep Raid Beyond Terek → ${targetRaid.nameEn}`,
          status: 'moving',
          deepRaidBoost: true,
          headingDeg,
          waypoints: path,
          waypointIdx: Math.min(1, path.length - 1),
          trail: [{ x: Math.round(u.x), y: Math.round(u.y) }]
        };
      });
      liveUnitsRef.current = next;
      return next;
    });

    setUnitMovementLog((prev) => [
      {
        id: `raid-cmd-${Date.now()}`,
        time: `🐎 Рейд Хаджи-Мурата`,
        textRu: `ПРИКАЗ НА ГЛУБОКИЙ РЕЙД (+45% скорости): «${raidingUnit.nameRu}» прорывается за кордонную линию к цели «${targetRaid.nameRu}», чтобы отвлечь ${targetRaid.divertsColumnBadgeRu}!`,
        textEn: `DEEP CAVALRY RAID ORDER (+45% speed): “${raidingUnit.nameEn}” is breaking through the cordon line toward “${targetRaid.nameEn}” to divert ${targetRaid.divertsColumnBadgeEn}!`
      },
      ...prev.slice(0, 7)
    ]);

    showNotice(
      t(
        `🐎 «${raidingUnit.nameRu}» брошена в глубокий рейд за Терек на «${targetRaid.badgeRu}» (+45% скорости)!`,
        `🐎 “${raidingUnit.nameEn}” launched a deep raid beyond the Terek toward “${targetRaid.badgeEn}” (+45% speed)!`
      ),
      'ok'
    );
  };

  // СПРИНТ 27 (M27): Направить выбранный отряд Имамата на прикрытие (конвой) вьючного каравана снабжения
  const handleEscortSupplyCaravan = (targetCaravanId = null) => {
    const activeUnit =
      liveFieldUnits.find((u) => u.id === selectedUnitId) || liveFieldUnits[0];
    const targetCaravan =
      (targetCaravanId && liveSupplyCaravans.find((c) => c.id === targetCaravanId)) ||
      liveSupplyCaravans[0];
    if (!targetCaravan) return;

    handleCommandUnitMoveToPoint(
      activeUnit.id,
      Math.round(targetCaravan.x),
      Math.round(targetCaravan.y),
      `Прикрытие: ${targetCaravan.badgeRu}`,
      `Escort: ${targetCaravan.badgeEn}`,
      `🛡️ Конвой каравана → ${targetCaravan.nameRu}`,
      `🛡️ Caravan Escort → ${targetCaravan.nameEn}`
    );
  };

  // СПРИНТ 27 (M27): Генеральное контрнаступление — бросить все 5 отрядов Имамата на штурм выбранной русской кордонной крепости!
  const handleLaunchGeneralCordonAssault = (fortressId = null) => {
    const targetFortress =
      (fortressId && cordonFortresses.find((cf) => cf.id === fortressId)) ||
      cordonFortresses[1] ||
      cordonFortresses[0];
    if (!targetFortress) return;

    playHistoricalSound('cannon', soundEnabled);

    setLiveFieldUnits((prev) =>
      prev.map((u, idx) => {
        // Небольшое веерное смещение по фронту штурма (-12..+12 px)
        const offsetX = (idx - 2) * 5;
        const destX = Math.max(28, Math.min(672, targetFortress.x + offsetX));
        const destY = Math.max(32, Math.min(420, targetFortress.y + 4));
        const path = computeTerrainAwarePath(u.x, u.y, destX, destY);
        const firstWp = path[1] || path[0] || { x: destX, y: destY };
        const headingDeg = Math.round(
          (Math.atan2(firstWp.y - u.y, firstWp.x - u.x) * 180) / Math.PI
        );
        return {
          ...u,
          targetX: destX,
          targetY: destY,
          targetLabelRu: `ШТУРМ: ${targetFortress.badgeRu}`,
          targetLabelEn: `ASSAULT: ${targetFortress.badgeEn}`,
          orderTitleRu: `🔥 Генеральный штурм → ${targetFortress.nameRu}`,
          orderTitleEn: `🔥 General Assault → ${targetFortress.nameEn}`,
          status: 'moving',
          headingDeg,
          waypoints: path,
          waypointIdx: Math.min(1, path.length - 1),
          trail: [{ x: Math.round(u.x), y: Math.round(u.y) }]
        };
      })
    );

    setUnitMovementLog((prev) => [
      {
        id: `cordon-cmd-${Date.now()}`,
        time: `🔥 Генеральный штурм`,
        textRu: `ПРИКАЗ ИМАМА ШАМИЛЯ: Все 5 полевых отрядов Имамата перешли в генеральное контрнаступление по горным ущельям на штурм «${targetFortress.nameRu}»!`,
        textEn: `IMAM SHAMIL’S DECREE: All 5 Imamate field detachments launched a general counter-offensive through the mountain passes to storm “${targetFortress.nameEn}”!`
      },
      ...prev.slice(0, 7)
    ]);

    showNotice(
      t(
        `🔥 Генеральное контрнаступление! Все 5 отрядов Имамата выдвинулись на штурм «${targetFortress.nameRu}»!`,
        `🔥 General Counter-Offensive! All 5 Imamate detachments are marching to storm “${targetFortress.nameEn}”!`
      ),
      'ok'
    );
  };

  // СПРИНТ 26 (M26): Возведение инженерного укрепления (засеки, завала, башни) в выбранной точке 3D-карты рельефа
  const handleConstructFortificationAtPoint = (
    rawX,
    rawY,
    blueprintId = selectedFortBlueprintId,
    customPassRu = null,
    customPassEn = null
  ) => {
    const bp =
      FORTIFICATION_BLUEPRINTS.find((b) => b.id === blueprintId) || FORTIFICATION_BLUEPRINTS[0];
    if (resources.gunpowder < bp.costPowder || resources.silver < bp.costSilver) {
      showNotice(
        t(
          `Недостаточно припасов для постройки «${bp.titleRu}» (требуется ${bp.costPowder} пуд. пороха и ${bp.costSilver} руб. серебра).`,
          `Insufficient resources to build “${bp.titleEn}” (requires ${bp.costPowder} poods powder & ${bp.costSilver} silver rub.).`
        ),
        'warn'
      );
      return;
    }

    const fx = Math.round(Math.max(30, Math.min(670, rawX)));
    const fy = Math.round(Math.max(48, Math.min(420, rawY)));
    const terr = sampleStrategicTerrain(fx, fy);
    const passNameRu =
      customPassRu || `${terr.biomeRu} (${terr.elevationMeters}м, ${terr.slopeDeg}°)`;
    const passNameEn =
      customPassEn || `${terr.biomeEn} (${terr.elevationMeters}m, ${terr.slopeDeg}°)`;

    const newFort = {
      id: `fort-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: bp.id,
      x: fx,
      y: fy,
      passNameRu,
      passNameEn,
      integrity: 100,
      totalInflicted: 0
    };

    setResources((prev) => ({
      ...prev,
      gunpowder: prev.gunpowder - bp.costPowder,
      silver: prev.silver - bp.costSilver
    }));
    setLiveMapFortifications((prev) => [...prev.slice(-9), newFort]);
    setFortBuildMode(false);
    playHistoricalSound('cannon', soundEnabled);

    setUnitMovementLog((prev) => [
      {
        id: newFort.id,
        time: `${bp.icon} Инженерия [${fx},${fy}]`,
        textRu: `Возведено укрепление «${bp.titleRu}» на рубеже: ${passNameRu}. Колонны РИ в радиусе ${bp.radius}px замедляются до ×${bp.enemySpeedMult} и несут потери -${bp.salvoDamageBayonets} шт./залп!`,
        textEn: `Constructed “${bp.titleEn}” at ${passNameEn}. Imperial columns within ${bp.radius}px slowed to ×${bp.enemySpeedMult} and suffer -${bp.salvoDamageBayonets} bayonets/salvo!`
      },
      ...prev.slice(0, 7)
    ]);

    showNotice(
      t(
        `${bp.icon} Укрепление «${bp.titleRu}» возведено на перевале (${terr.elevationMeters} м, ${terr.slopeDeg}°)!`,
        `${bp.icon} Fortification “${bp.titleEn}” constructed on the pass (${terr.elevationMeters}m, ${terr.slopeDeg}°)!`
      ),
      'ok'
    );
  };

  // Быстрая постройка выбранного укрепления прямо на горном перевале перед наступающей колонной РИ
  const handleBuildFortificationAheadOfColumn = (targetColId = null) => {
    const advancingCols = liveImperialColumns.filter((c) => c.status === 'advancing');
    const pool = advancingCols.length > 0 ? advancingCols : liveImperialColumns;
    const targetCol =
      (targetColId && liveImperialColumns.find((c) => c.id === targetColId)) || pool[0];
    if (!targetCol) return;

    const nextWp =
      (targetCol.waypoints && targetCol.waypoints[targetCol.waypointIdx]) || targetCol;
    const fortX = Math.round(targetCol.x * 0.55 + nextWp.x * 0.45);
    const fortY = Math.round(targetCol.y * 0.55 + nextWp.y * 0.45);

    handleConstructFortificationAtPoint(
      fortX,
      fortY,
      selectedFortBlueprintId,
      `Рубеж перехвата: ${targetCol.badgeRu}`,
      `Interception Defile: ${targetCol.badgeEn}`
    );
  };

  // СПРИНТ 26 (M26): Переход от перехвата на 3D-карте рельефа непосредственно в тактический бой (Zoom-In Transition)
  const handleEnterTacticalEncounter = (encounter = null, targetView = 'auto') => {
    const activeUnit =
      enrichedLiveFieldUnits.find((u) => u.id === selectedUnitId) || enrichedLiveFieldUnits[0];
    const defaultCol =
      liveImperialColumns.find((c) => c.status === 'advancing') || liveImperialColumns[0];
    const colTerr = sampleStrategicTerrain(defaultCol.x, defaultCol.y);
    const colWea = sampleWeatherAtPoint(
      defaultCol.x,
      defaultCol.y,
      liveWeatherFronts,
      weatherOverlayEnabled
    );

    const enc = encounter || {
      id: `enc-manual-${Date.now()}`,
      unitId: activeUnit.id,
      unitNameRu: activeUnit.nameRu,
      unitNameEn: activeUnit.nameEn,
      unitCommanderRu: activeUnit.commanderRu,
      unitCommanderEn: activeUnit.commanderEn,
      unitBadgeRu: activeUnit.badgeRu,
      unitBadgeEn: activeUnit.badgeEn,
      unitSabers: activeUnit.sabers ?? 540,
      columnId: defaultCol.id,
      columnNameRu: defaultCol.nameRu,
      columnNameEn: defaultCol.nameEn,
      columnBadgeRu: defaultCol.badgeRu,
      columnBadgeEn: defaultCol.badgeEn,
      targetNaibateId: defaultCol.targetNaibateId,
      remainingBayonets: defaultCol.bayonets,
      casualtiesInflicted: 180,
      autoResolveEnemyLoss: 420,
      autoResolveMuridLoss: 48,
      winChancePct: 62,
      capturedPowder: 14,
      capturedSilver: 50,
      supplyCut: Boolean(defaultCol.supplyCut),
      x: Math.round(defaultCol.x),
      y: Math.round(defaultCol.y),
      elevationMeters: colTerr.elevationMeters,
      slopeDeg: colTerr.slopeDeg,
      biomeRu: colTerr.biomeRu,
      biomeEn: colTerr.biomeEn,
      weatherBadgeRu: colWea.badgeRu,
      weatherBadgeEn: colWea.badgeEn,
      recommendedTacticalMode:
        defaultCol.id === 'imp_col_argutinsky' || defaultCol.x >= 340
          ? 'milyutin_siege'
          : 'spline_ambush',
      recommended3DTerrainId:
        defaultCol.id === 'imp_col_argutinsky' ? 'salty_1847' : 'dargo_1845'
    };

    const engagedSquadron =
      enrichedLiveFieldUnits.find((u) => u.id === (enc.unitId || activeUnit.id)) || activeUnit;
    const chosenDoctrine = enc.selectedDoctrineId || 'lava_charge';
    const extraGazyrs =
      ((engagedSquadron?.gear || []).includes('salpeter_barns') ? 3 : 0) +
      (chosenDoctrine === 'ridge_snipers' ? 3 : 0);
    const resolvedNaibateId = enc.targetNaibateId || selectedNaibateId;

    setTacticalBattleSession({
      naibateId: resolvedNaibateId,
      engagedColumnId: enc.columnId,
      engagedUnitId: enc.unitId || activeUnit.id,
      engagedColumnNameRu: enc.columnNameRu,
      engagedColumnNameEn: enc.columnNameEn,
      engagedCommanderRu: enc.unitCommanderRu || activeUnit.commanderRu,
      engagedCommanderEn: enc.unitCommanderEn || activeUnit.commanderEn,
      battleDoctrine: chosenDoctrine,
      freeMineAvailable: chosenDoctrine === 'safarov_mine',
      gazyrCharges: 18 + extraGazyrs,
      maxGazyrCharges: 18 + extraGazyrs,
      expendedPowderPoods: 0,
      capturedPowderPoods: 0,
      capturedSilverRubles: 0,
      garrisonCasualties: 0,
      pressureDropAccum: 0,
      forcedMeleeMode: false
    });
    setTurnActionQuota((prev) => ({
      ...prev,
      tacticalMovesUsed: 0
    }));

    const chosenMode =
      targetView === 'spline'
        ? 'spline_ambush'
        : targetView === 'siege'
        ? 'milyutin_siege'
        : enc.recommendedTacticalMode;

    playHistoricalSound('horn', soundEnabled);

    // Бонус за личное командование боем в ущелье
    setResources((prev) => ({
      ...prev,
      gunpowder: prev.gunpowder + 15,
      authority: Math.min(100, prev.authority + 4)
    }));

    if (targetView === '3d') {
      setSelected3DTerrainId(enc.recommended3DTerrainId || 'salty_1847');
      setSiegeState((prev) => ({
        ...prev,
        aulName: `${enc.biomeRu} (${enc.elevationMeters}м, против ${enc.columnBadgeRu})`,
        aulNameEn: `${enc.biomeEn || enc.biomeRu} (${enc.elevationMeters}m, vs. ${enc.columnBadgeEn || enc.columnBadgeRu})`,
        battleLog: [
          {
            ru: `⚔️ ПЕРЕХОД С 3D-КАРТЫ РЕЛЬЕФА [${enc.x}, ${enc.y}]: «${enc.unitNameRu}» вступил в бой с «${enc.columnNameRu}» (${enc.remainingBayonets} штыков, высота ${enc.elevationMeters}м, уклон ${enc.slopeDeg}°, погода: ${enc.weatherBadgeRu})!`,
            en: `⚔️ ZOOM FROM 3D RELIEF MAP [${enc.x}, ${enc.y}]: “${enc.unitNameEn || enc.unitNameRu}” engaged “${enc.columnNameEn || enc.columnNameRu}” (${enc.remainingBayonets} bayonets, elev. ${enc.elevationMeters}m, slope ${enc.slopeDeg}°, weather: ${enc.weatherBadgeEn || enc.weatherBadgeRu})!`
          },
          ...prev.battleLog.slice(0, 5)
        ]
      }));
      setActiveTab('3d_tactical');
      showNotice(
        t(
          `🏔️ Вы лично возглавили 3D-оборону ущелья (${enc.elevationMeters} м, ${enc.slopeDeg}°) против «${enc.columnNameRu}»! (+15 пуд. пороха, +4% Авторитета)`,
          `🏔️ You personally took command of the 3D gorge defense (${enc.elevationMeters}m, ${enc.slopeDeg}°) against “${enc.columnNameEn}”! (+15 poods powder, +4% Authority)`
        ),
        'ok'
      );
      return;
    }

    if (chosenMode === 'spline_ambush') {
      setTacticalMode('forest_spline');
      setAmbushStep(1);
      const bayPerEchelon = Math.max(220, Math.round((enc.remainingBayonets || 1800) / 4));
      setSplineEchelons((prev) =>
        prev.map((ech, idx) => ({
          ...ech,
          strength: idx === 0 ? bayPerEchelon + 180 : bayPerEchelon,
          cohesion: Math.max(42, 74 - idx * 6)
        }))
      );
      setAmbushLog((prev) => [
        {
          ru: `⚔️ ТАКТИЧЕСКИЙ ПЕРЕХВАТ С 3D-КАРТЫ [${enc.x}, ${enc.y}]: Отряд «${enc.unitNameRu}» зажал в ущелье «${enc.columnNameRu}» (${enc.remainingBayonets} шт., высота ${enc.elevationMeters}м, уклон ${enc.slopeDeg}°, погода: ${enc.weatherBadgeRu}). Отдайте приказ засадным сотням!`,
          en: `⚔️ TACTICAL INTERCEPT FROM 3D MAP [${enc.x}, ${enc.y}]: “${enc.unitNameEn || enc.unitNameRu}” trapped “${enc.columnNameEn || enc.columnNameRu}” in the defile (${enc.remainingBayonets} bay., elev. ${enc.elevationMeters}m, slope ${enc.slopeDeg}°, weather: ${enc.weatherBadgeEn || enc.weatherBadgeRu}). Command your ambush squadrons!`
        },
        ...prev.slice(0, 5)
      ]);
      setActiveTab('siege');
    } else {
      setTacticalMode('milyutin_siege');
      setSiegeInline3D(true);
      setSelected3DTerrainId(enc.recommended3DTerrainId || 'salty_1847');
      setSiegeState((prev) => ({
        ...prev,
        russianMorale: Math.max(54, Math.min(88, Math.round((enc.remainingBayonets || 2000) / 32))),
        garrisonMorale: 92,
        aulName: `${enc.biomeRu} (${enc.elevationMeters}м • Оборона против ${enc.columnBadgeRu})`,
        aulNameEn: `${enc.biomeEn || enc.biomeRu} (${enc.elevationMeters}m • Defense vs. ${enc.columnBadgeEn || enc.columnBadgeRu})`,
        battleLog: [
          {
            ru: `⚔️ ТАКТИЧЕСКИЙ ПЕРЕХВАТ С 3D-КАРТЫ [${enc.x}, ${enc.y}]: «${enc.unitNameRu}» остановил колонну «${enc.columnNameRu}» (${enc.remainingBayonets} шт.) на скальном рубеже ${enc.elevationMeters}м (крутизна ${enc.slopeDeg}°)!`,
            en: `⚔️ TACTICAL INTERCEPT FROM 3D MAP [${enc.x}, ${enc.y}]: “${enc.unitNameEn || enc.unitNameRu}” halted “${enc.columnNameEn || enc.columnNameRu}” (${enc.remainingBayonets} bay.) at the ${enc.elevationMeters}m cliff line (slope ${enc.slopeDeg}°)!`
          },
          ...prev.battleLog.slice(0, 5)
        ]
      }));
      setActiveTab('siege');
    }

    showNotice(
      t(
        `⚔️ Переход в тактический бой в ущелье: «${enc.unitNameRu}» против «${enc.columnNameRu}» (+15 пуд. пороха, +4% Авторитета)!`,
        `⚔️ Zoomed into tactical gorge combat: “${enc.unitNameEn}” vs. “${enc.columnNameEn}” (+15 poods powder, +4% Authority)!`
      ),
      'ok'
    );
  };

  // Открыть Предбоевой совет Диван-ханы против выбранной (или ближайшей) колонны РИ либо для деблокады осаждённого аула
  const handleOpenBattlePrelude = (targetColId = null, besiegedNaibateId = null) => {
    const besiegedNb = besiegedNaibateId ? naibates.find((n) => n.id === besiegedNaibateId) : null;
    const activeUnit =
      (besiegedNb &&
        enrichedLiveFieldUnits.find(
          (u) => u.homeNaibateId === besiegedNb.id && u.id !== 'unit_powder_caravan'
        )) ||
      enrichedLiveFieldUnits.find((u) => u.id === selectedUnitId && u.id !== 'unit_powder_caravan') ||
      enrichedLiveFieldUnits.find((u) => u.id === 'unit_hadji_murat') ||
      enrichedLiveFieldUnits[0];
    const advancingCols = enrichedImperialColumns.filter((c) => c.status === 'advancing' && !c.fogHidden);
    const pool = advancingCols.length > 0 ? advancingCols : enrichedImperialColumns;
    const refX = besiegedNb?.coords?.x ?? activeUnit?.x ?? 320;
    const refY = besiegedNb?.coords?.y ?? activeUnit?.y ?? 210;
    const targetCol =
      (targetColId && enrichedImperialColumns.find((c) => c.id === targetColId)) ||
      (besiegedNb && pool.find((c) => c.targetNaibateId === besiegedNb.id)) ||
      [...pool].sort(
        (a, b) => Math.hypot(a.x - refX, a.y - refY) - Math.hypot(b.x - refX, b.y - refY)
      )[0];
    if (!targetCol || !activeUnit) return;

    const bx = besiegedNb?.coords?.x ?? Math.round((targetCol.x + activeUnit.x) * 0.5);
    const by = besiegedNb?.coords?.y ?? Math.round((targetCol.y + activeUnit.y) * 0.5);
    const sampleX = besiegedNb?.coords?.x ?? targetCol.x;
    const sampleY = besiegedNb?.coords?.y ?? targetCol.y;
    const battleTerrain = sampleStrategicTerrain(sampleX, sampleY);
    const battleWeather = sampleWeatherAtPoint(
      sampleX,
      sampleY,
      liveWeatherFronts,
      weatherOverlayEnabled
    );
    const fortSample = sampleFortificationsAtPoint(sampleX, sampleY, liveMapFortifications);
    const fortBonus = fortSample.active ? fortSample.ambushBonusPct : 0;
    const isSupplyCut = Boolean(targetCol.supplyCut);
    const unitSabers = activeUnit.sabers ?? 540;
    const unitVetStars = Math.min(3, Math.max(0, Math.floor(activeUnit.vetXp ?? 0)));
    const unitCapturedGuns = activeUnit.capturedGuns || 0;
    const unitGearIds = activeUnit.gear || [];
    const gearCombatBonus = unitGearIds.reduce(
      (sum, gid) => sum + (SQUADRON_GEAR_CATALOG[gid]?.winBonusPct || 0),
      0
    );
    const medalBonus = (activeUnit.medals || []).length * 3;
    const vetAndGunBonus = unitVetStars * 5 + unitCapturedGuns * 4 + gearCombatBonus + medalBonus;
    const obedienceBonus = Math.round(((activeUnit.obediencePct ?? 82) - 75) * 0.35);
    const hasBazalai = unitGearIds.includes('bazalai_daggers');
    const winChancePct = Math.max(
      24,
      Math.min(
        95,
        Math.round(
          44 +
            battleTerrain.slopeDeg * 0.7 +
            battleWeather.ambushBonus * 0.45 +
            fortBonus * 0.6 +
            (isSupplyCut ? 18 : 0) +
            vetAndGunBonus +
            obedienceBonus +
            (unitSabers - targetCol.bayonets * 0.24) * 0.035
        )
      )
    );
    const autoResolveEnemyLoss = Math.min(
      Math.max(240, targetCol.bayonets - 500),
      Math.round(
        360 +
          (isSupplyCut ? 180 : 0) +
          vetAndGunBonus * 9 +
          battleTerrain.slopeDeg * 6 +
          (battleWeather.ambushBonus + fortBonus) * 5
      )
    );
    const autoResolveMuridLoss = Math.max(
      14,
      Math.min(
        Math.max(35, unitSabers - 60),
        Math.round(
          targetCol.bayonets *
            (isSupplyCut ? 0.026 : 0.04) *
            (1 - fortBonus * 0.008) *
            (hasBazalai ? 0.75 : 1)
        )
      )
    );
    const capturedPowder = 12 + (isSupplyCut ? 6 : 0) + (fortSample.active ? 5 : 0);
    const capturedSilver = 45 + (isSupplyCut ? 25 : 0);
    const resolvedTargetNaibateId = besiegedNb?.id || targetCol.targetNaibateId || selectedNaibateId;
    const forestNaibateIds = ['vedeno', 'benoy', 'shali', 'bolshaya_chechnya', 'malaya_chechnya', 'ichkeria', 'karata'];
    const isForestTheater =
      !besiegedNb &&
      targetCol.id !== 'imp_col_argutinsky' &&
      (bx < 335 || forestNaibateIds.includes(resolvedTargetNaibateId));
    const recommended3DTerrainId =
      resolvedTargetNaibateId === 'koysubu' || resolvedTargetNaibateId === 'gumbet'
        ? 'akhulgo_1839'
        : resolvedTargetNaibateId === 'andalal' || bx > 445
        ? 'gunib_1859'
        : isForestTheater
        ? 'dargo_1845'
        : 'salty_1847';

    playHistoricalSound('seal', soundEnabled);
    setActiveTacticalEncounter({
      id: `prelude-${Date.now()}-${targetCol.id}`,
      pendingDecision: true,
      selectedDoctrineId: 'lava_charge',
      unitId: activeUnit.id,
      unitNameRu: activeUnit.nameRu,
      unitNameEn: activeUnit.nameEn,
      unitCommanderRu: activeUnit.commanderRu,
      unitCommanderEn: activeUnit.commanderEn,
      unitBadgeRu: activeUnit.badgeRu,
      unitBadgeEn: activeUnit.badgeEn,
      unitSabers,
      unitVetStars,
      unitVetXp: activeUnit.vetXp ?? 0,
      unitCapturedGuns,
      unitGearIds,
      unitMedalsCount: (activeUnit.medals || []).length,
      columnId: targetCol.id,
      columnNameRu: targetCol.nameRu,
      columnNameEn: targetCol.nameEn,
      columnBadgeRu: targetCol.badgeRu,
      columnBadgeEn: targetCol.badgeEn,
      targetNaibateId: resolvedTargetNaibateId,
      besiegedAulNameRu: besiegedNb?.name || null,
      besiegedAulNameEn: besiegedNb?.nameEn || besiegedNb?.name || null,
      remainingBayonets: targetCol.bayonets,
      casualtiesInflicted: 0,
      autoResolveEnemyLoss,
      autoResolveMuridLoss,
      winChancePct,
      capturedPowder,
      capturedSilver,
      x: bx,
      y: by,
      elevationMeters: battleTerrain.elevationMeters,
      slopeDeg: battleTerrain.slopeDeg,
      biomeRu: besiegedNb ? `Осада аула «${besiegedNb.name}»` : battleTerrain.biomeRu,
      biomeEn: besiegedNb ? `Siege of “${besiegedNb.nameEn || besiegedNb.name}”` : battleTerrain.biomeEn,
      weatherBadgeRu: battleWeather.badgeRu,
      weatherBadgeEn: battleWeather.badgeEn,
      supplyCut: isSupplyCut,
      fortTitleRu: fortSample.active ? fortSample.blueprint.titleRu : null,
      fortTitleEn: fortSample.active ? fortSample.blueprint.titleEn : null,
      recommendedTacticalMode: isForestTheater ? 'spline_ambush' : 'milyutin_siege',
      recommended3DTerrainId
    });
  };

  // Авторасчёт боя по диспозиции наиба прямо на стратегическом столе
  const handleAutoResolveEncounter = (enc) => {
    if (!enc) return;
    playHistoricalSound('cannon', soundEnabled);
    const docId = enc.selectedDoctrineId || 'lava_charge';
    const docWinMod = docId === 'safarov_mine' ? 8 : docId === 'ridge_snipers' ? 4 : 3;
    const winChance = (enc.winChancePct ?? 60) + docWinMod + (activeRelicBonuses.combatWinBonus || 0);
    const isSuccess = winChance >= 50;
    if (isSuccess) unlockRelic('relic_baysungur_banner');
    const baseEnemyLoss = (enc.autoResolveEnemyLoss || 420) + (docId === 'safarov_mine' ? 110 : 0);
    const enemyLoss = isSuccess ? baseEnemyLoss : Math.round(baseEnemyLoss * 0.58);
    const rawMuridBase =
      docId === 'ridge_snipers'
        ? Math.round((enc.autoResolveMuridLoss || 42) * 0.68)
        : enc.autoResolveMuridLoss || 42;
    const rawMuridLoss = isSuccess ? rawMuridBase : Math.round(rawMuridBase * 1.35);
    const hospSample = sampleHospitalBonusAtPoint(enc.x || 280, enc.y || 200, fieldHospitals);
    const finalMuridLoss = hospSample.inHospitalZone
      ? Math.max(10, Math.round(rawMuridLoss * 0.6))
      : rawMuridLoss;
    const spoilsMult = docId === 'lava_charge' ? 1.3 : 1.0;
    const powderGain = isSuccess
      ? Math.round((enc.capturedPowder || 14) * spoilsMult)
      : Math.max(4, Math.round((enc.capturedPowder || 12) * 0.4));
    const silverGain = isSuccess ? Math.round((enc.capturedSilver || 45) * spoilsMult) : 15;

    setLiveImperialColumns((prev) =>
      prev.map((col) => {
        if (col.id !== enc.columnId) return col;
        const nextBay = Math.max(550, col.bayonets - enemyLoss);
        if (isSuccess || nextBay <= 1450) {
          const retreatPath = computeTerrainAwarePath(col.x, col.y, col.originX, col.originY);
          return {
            ...col,
            bayonets: nextBay,
            status: 'retreating',
            turnMarchBudget: 36,
            waypoints: retreatPath,
            waypointIdx: Math.min(1, retreatPath.length - 1)
          };
        }
        return {
          ...col,
          bayonets: nextBay,
          turnMarchBudget: 0
        };
      })
    );

    setLiveFieldUnits((prev) =>
      prev.map((u) => {
        if (u.id !== enc.unitId) return u;
        const curSab = u.sabers ?? 540;
        return {
          ...u,
          sabers: Math.max(60, curSab - finalMuridLoss),
          vetXp: isSuccess ? Math.min(3, (u.vetXp ?? 0) + 1) : u.vetXp ?? 0,
          capturedGuns: isSuccess ? (u.capturedGuns || 0) + 1 : u.capturedGuns || 0,
          mp: Math.max(0, (u.mp ?? 100) - 35),
          status: 'arrived',
          waypoints: [],
          orderTitleRu: isSuccess
            ? `★ Отразил колонну (${enc.columnBadgeRu}): -${enemyLoss} шт., +1 единорог`
            : `Сдержал авангард (${enc.columnBadgeRu}): -${enemyLoss} шт.`,
          orderTitleEn: isSuccess
            ? `★ Repelled ${enc.columnBadgeEn}: -${enemyLoss} bay., +1 unicorn`
            : `Checked ${enc.columnBadgeEn}: -${enemyLoss} bay.`
        };
      })
    );

    setResources((prev) => ({
      ...prev,
      gunpowder: prev.gunpowder + powderGain,
      silver: prev.silver + silverGain,
      authority: isSuccess ? Math.min(100, prev.authority + 3) : Math.max(15, prev.authority - 1)
    }));

    if (enc.targetNaibateId) {
      setNaibates((prev) =>
        prev.map((n) =>
          n.id === enc.targetNaibateId
            ? {
                ...n,
                imperialPressure: Math.max(12, n.imperialPressure - (isSuccess ? 14 : 6))
              }
            : n
        )
      );
    }

    spawnFloatingCombatPopup(
      enc.x || 300,
      enc.y || 200,
      isSuccess
        ? `★ ПОБЕДА НАИБА! -${enemyLoss} шт. РИ`
        : `⚔️ УПОРНЫЙ БОЙ: -${enemyLoss} шт. РИ`,
      `+${powderGain}п пороха, +${silverGain}₽ • Потери сотни: -${finalMuridLoss} саб.`,
      isSuccess ? '#10b981' : '#f59e0b'
    );

    setChronicle((prev) => [
      {
        id: `autores-${Date.now()}`,
        turn,
        category: 'battle',
        sender: enc.unitCommanderRu || enc.unitNameRu,
        senderEn: enc.unitCommanderEn || enc.unitNameEn,
        title: isSuccess
          ? `★ ПОБЕДА В ГОРНОЙ ТЕСНИНЕ: «${enc.columnNameRu}» обращена вспять!`
          : `Бой на перевале против «${enc.columnNameRu}»`,
        titleEn: isSuccess
          ? `★ DEFILE VICTORY: “${enc.columnNameEn}” Driven Back!`
          : `Mountain Pass Clash vs. “${enc.columnNameEn}”`,
        text: `По диспозиции наиба отряд «${enc.unitNameRu}» дал бой на высоте ${enc.elevationMeters}м. Колонна РИ потеряла -${enemyLoss} штыков, наши потери составили -${finalMuridLoss} сабель${hospSample.inHospitalZone ? ' (с учётом спасения раненых лазаретом)' : ''}. Взято трофеев: +${powderGain} пуд. пороха и +${silverGain} руб.`,
        textEn: `Under the Naib’s disposition, “${enc.unitNameEn}” fought at ${enc.elevationMeters}m. Imperial column lost -${enemyLoss} bayonets, our losses were -${finalMuridLoss} sabers. Spoils: +${powderGain} poods powder & +${silverGain} rub.`
      },
      ...prev
    ]);

    const curSeasonRu = SEASONS[(turn - 1) % SEASONS.length] || 'Лето 1845 г.';
    const curSeasonEn = SEASONS_EN[(turn - 1) % SEASONS_EN.length] || 'Summer 1845';
    setLastBattleAfterActionReport({
      id: `aar-auto-${Date.now()}`,
      turn,
      seasonRu: curSeasonRu,
      seasonEn: curSeasonEn,
      isVictory: isSuccess,
      modeLabelRu: 'Полевой бой по диспозиции наиба',
      modeLabelEn: 'Field Battle by Naib Disposition',
      titleRu: isSuccess
        ? `Разгром авангарда «${enc.columnNameRu}»`
        : `Сдерживающий бой против «${enc.columnNameRu}»`,
      titleEn: isSuccess
        ? `Vanguard Rout of “${enc.columnNameEn}”`
        : `Holding Action vs. “${enc.columnNameEn}”`,
      commanderRu: enc.unitCommanderRu || enc.unitNameRu,
      commanderEn: enc.unitCommanderEn || enc.unitNameEn,
      locationRu: `${enc.biomeRu || 'Горная теснина'} (${enc.elevationMeters || 1420}м)`,
      locationEn: `${enc.biomeEn || 'Mountain Defile'} (${enc.elevationMeters || 1420}m)`,
      enemyLoss,
      muridLoss: finalMuridLoss,
      powderGain,
      silverGain,
      capturedUnicorn: isSuccess
    });

    if (isSuccess) {
      setBattleMemorials((prev) => [
        {
          id: `mem-auto-${Date.now()}`,
          turn,
          seasonRu: curSeasonRu,
          seasonEn: curSeasonEn,
          x: enc.x || 300,
          y: enc.y || 200,
          naibateId: enc.targetNaibateId || selectedNaibateId,
          titleRu: `Победа у рубежа (${enc.columnBadgeRu || enc.columnNameRu})`,
          titleEn: `Pass Victory (${enc.columnBadgeEn || enc.columnNameEn})`,
          commanderRu: enc.unitCommanderRu || enc.unitNameRu,
          commanderEn: enc.unitCommanderEn || enc.unitNameEn,
          enemyLoss,
          spoilsRu: `+${powderGain}п пороха, +${silverGain}₽ • +1 единорог`,
          spoilsEn: `+${powderGain}p powder, +${silverGain}r • +1 unicorn`
        },
        ...prev.slice(0, 11)
      ]);
    }

    setActiveTacticalEncounter(null);
    showNotice(
      t(
        isSuccess
          ? `★ Авторасчёт завершён победой! «${enc.columnBadgeRu}» потеряла -${enemyLoss} шт. и отступает. Наши потери: -${finalMuridLoss} саб., трофеи: +${powderGain}п пороха.`
          : `⚔️ Авангардный бой завершён: потери РИ -${enemyLoss} шт., потери сотни -${finalMuridLoss} саб.`,
        isSuccess
          ? `★ Auto-resolve victory! “${enc.columnBadgeEn}” lost -${enemyLoss} bayonets and is retreating. Losses: -${finalMuridLoss} sabers, spoils: +${powderGain}p powder.`
          : `⚔️ Clash concluded: enemy lost -${enemyLoss} bayonets, unit lost -${finalMuridLoss} sabers.`
      ),
      isSuccess ? 'ok' : 'warn'
    );
  };

  // Арьергардный отход из-под удара превосходящей колонны РИ с сохранением сотни
  const handleRetreatFromEncounter = (enc) => {
    if (!enc) return;
    playHistoricalSound('gallop', soundEnabled);
    const skirmishLoss = 12;
    setLiveFieldUnits((prev) =>
      prev.map((u) => {
        if (u.id !== enc.unitId) return u;
        const homeNaib = naibates.find((n) => n.id === u.homeNaibateId) || naibates[0];
        const pullX = Math.round(u.x * 0.72 + homeNaib.coords.x * 0.28);
        const pullY = Math.round(u.y * 0.72 + homeNaib.coords.y * 0.28);
        return {
          ...u,
          x: pullX,
          y: pullY,
          targetX: pullX,
          targetY: pullY,
          sabers: Math.max(60, (u.sabers ?? 540) - skirmishLoss),
          mp: Math.max(0, (u.mp ?? 80) - 20),
          status: 'idle',
          waypoints: [],
          orderTitleRu: `↩ Отошёл на гребень хребта (-${skirmishLoss} саб.)`,
          orderTitleEn: `↩ Withdrew to high ridge (-${skirmishLoss} sabers)`
        };
      })
    );
    setLiveImperialColumns((prev) =>
      prev.map((col) => (col.id === enc.columnId ? { ...col, turnMarchBudget: 16 } : col))
    );
    setActiveTacticalEncounter(null);
    showNotice(
      t(
        `↩ Отряд «${enc.unitNameRu}» организованно отошёл по козьим тропам (-${skirmishLoss} саб.), сохранив ядро сотни для новой засады.`,
        `↩ “${enc.unitNameEn}” executed an orderly mountain withdrawal (-${skirmishLoss} sabers), preserving the force for a new ambush.`
      ),
      'info'
    );
  };

  // СПРИНТ 7 (Фаза 3): Подбор одной из 32 исторических дилемм с отложенными последствиями (2–4 хода)
  const pickReactiveDivanPacket = (
    naibsSnapshot = naibates,
    resSnapshot = resources,
    resolvedList = resolvedPacketIds,
    turnNum = turn
  ) =>
    pickNextHistoricalDilemma({
      naibates: naibsSnapshot,
      resources: resSnapshot,
      turn: turnNum,
      resolvedIds: resolvedList,
      activeScenarioId,
      naibRivalries,
      isWinter: (turnNum - 1) % 4 === 2
    });

  const handleSummonDivanPacket = () => {
    playHistoricalSound('paper', soundEnabled, { volume: audioMixerConfig.masterVolume });
    if (activeDivanPacket) return;
    const pkt = pickReactiveDivanPacket();
    if (pkt) setActiveDivanPacket(pkt);
  };

  const handleResolveDivanPacket = (packet, choice) => {
    if (!packet || !choice) return;
    if (choice.silverDelta && choice.silverDelta < 0 && resources.silver < Math.abs(choice.silverDelta)) {
      alertMsg(
        t(
          'В казне Байт аль-маль недостаточно серебра для этого решения!',
          'Insufficient silver in Bayt al-Mal for this decision!'
        )
      );
      return;
    }
    if (choice.powderDelta && choice.powderDelta < 0 && resources.gunpowder < Math.abs(choice.powderDelta)) {
      alertMsg(
        t(
          'В центральном арсенале Ведено недостаточно пороха для этого указа!',
          'Insufficient gunpowder in the Vedeno Arsenal for this decree!'
        )
      );
      return;
    }
    if (choice.provisionsDelta && choice.provisionsDelta < 0 && resources.provisions < Math.abs(choice.provisionsDelta)) {
      alertMsg(
        t(
          'Недостаточно запасов провианта для исполнения этого указа!',
          'Insufficient provisions to execute this decree!'
        )
      );
      return;
    }

    triggerTactileCue('seal_decree');
    setResolvedPacketIds((prev) => (prev.includes(packet.id) ? prev : [...prev, packet.id]));
    setActiveDivanPacket(null);

    setResources((prev) => ({
      ...prev,
      gunpowder: Math.max(0, prev.gunpowder + (choice.powderDelta || 0)),
      silver: Math.max(0, prev.silver + (choice.silverDelta || 0)),
      provisions: Math.max(0, prev.provisions + (choice.provisionsDelta || 0)),
      authority: Math.min(100, Math.max(15, prev.authority + (choice.authorityDelta || 0))),
      ottomanSupport: Math.min(100, Math.max(0, prev.ottomanSupport + (choice.ottomanDelta || 0)))
    }));

    const targetId = choice.targetNaibId || packet.contextNaibId;
    if (targetId || choice.allImanDelta || choice.allPressureDelta) {
      setNaibates((prev) =>
        prev.map((n) => {
          const isTarget = targetId && n.id === targetId;
          if (!isTarget && !choice.allImanDelta && !choice.allPressureDelta) return n;
          const nextPressure = Math.max(
            12,
            Math.min(
              95,
              n.imperialPressure +
                (isTarget ? choice.pressureDelta || 0 : 0) +
                (choice.allPressureDelta || 0)
            )
          );
          const trustShift = isTarget
            ? (choice.imanDelta || 0) >= 3 || (choice.localPowderDelta || 0) > 0 || choice.liftSiege
              ? 1
              : (choice.prideDelta || 0) >= 5 || (choice.imanDelta || 0) < 0
              ? -1
              : 0
            : 0;
          return {
            ...n,
            underSiege: isTarget && choice.liftSiege ? false : nextPressure >= 80 && n.underSiege,
            siegeTurns: isTarget && choice.liftSiege ? 0 : n.siegeTurns || 0,
            estranged: isTarget ? false : n.estranged,
            trustScore: Math.max(-3, Math.min(3, (n.trustScore ?? 0) + trustShift)),
            lastMemoryRu:
              isTarget && trustShift !== 0
                ? trustShift > 0
                  ? `Благодарен за указ Диван-ханы: «${choice.labelRu}»`
                  : `Уязвлён суровым ответом Диван-ханы: «${choice.labelRu}»`
                : n.lastMemoryRu,
            lastMemoryEn:
              isTarget && trustShift !== 0
                ? trustShift > 0
                  ? `Grateful for Divan-Khana decree: “${choice.labelEn || choice.labelRu}”`
                  : `Stung by harsh Divan-Khana reply: “${choice.labelEn || choice.labelRu}”`
                : n.lastMemoryEn,
            imperialPressure: nextPressure,
            gunpowder: Math.max(6, n.gunpowder + (isTarget ? choice.localPowderDelta || 0 : 0)),
            garrison: Math.max(400, n.garrison + (isTarget ? choice.garrisonDelta || 0 : 0)),
            traits: {
              ...n.traits,
              iman: Math.min(
                100,
                Math.max(
                  20,
                  n.traits.iman +
                    (isTarget ? choice.imanDelta || 0 : 0) +
                    (choice.allImanDelta || 0)
                )
              ),
              pride: Math.min(
                100,
                Math.max(10, n.traits.pride + (isTarget ? choice.prideDelta || 0 : 0))
              )
            }
          };
        })
      );
    }

    if (choice.unitIdBonus) {
      setLiveFieldUnits((prev) =>
        prev.map((u) => {
          if (u.id !== choice.unitIdBonus) return u;
          const nextMax = Math.max(u.maxSabers || 400, (u.sabers ?? 400) + (choice.unitSabersDelta || 0));
          return {
            ...u,
            sabers: Math.min(nextMax, (u.sabers ?? 400) + (choice.unitSabersDelta || 0)),
            maxSabers: nextMax,
            vetXp: Math.min(3, (u.vetXp ?? 0) + (choice.unitVetXpDelta || 0))
          };
        })
      );
    }

    if (choice.damageEnemyBayonets) {
      setLiveImperialColumns((prev) =>
        prev.map((col, idx) =>
          idx === 0
            ? { ...col, bayonets: Math.max(650, col.bayonets - choice.damageEnemyBayonets) }
            : col
        )
      );
    }

    if (choice.revealFogRing) {
      setKunakSpyRings((prev) => {
        const closedIdx = prev.findIndex((r) => !r.active);
        if (closedIdx < 0) return prev;
        return prev.map((r, i) => (i === closedIdx ? { ...r, active: true } : r));
      });
      setImperialAi((prev) => ({ ...prev, scouted: true }));
    }

    if (choice.delayedEffect) {
      setDelayedConsequences((prev) =>
        scheduleDelayedConsequence(prev, {
          turn,
          packet,
          choice,
          contextNaibId: targetId
        })
      );
    }

    setChronicle((prev) => [
      {
        id: `pkt-res-${Date.now()}`,
        turn,
        category: 'nizam',
        sender: packet.senderRu,
        senderEn: packet.senderEn,
        title: `Сургучный указ по донесению: ${packet.titleRu}`,
        titleEn: `Sealed Decree on Dispatch: ${packet.titleEn}`,
        text: `Решение Имама: «${choice.labelRu}».${choice.delayPreviewRu ? ` ${choice.delayPreviewRu}` : ''}`,
        textEn: `Imam’s Ruling: “${choice.labelEn}”.${choice.delayPreviewEn ? ` ${choice.delayPreviewEn}` : ''}`
      },
      ...prev
    ]);

    showNotice(
      t(
        `📜 Исполнен указ: «${choice.labelRu}»${choice.delayedEffect ? ` (⏳ эхо через ${choice.delayedEffect.delayTurns || 2} ход.)` : ''}`,
        `📜 Sealed decree executed: “${choice.labelEn}”${choice.delayedEffect ? ` (⏳ echo in ${choice.delayedEffect.delayTurns || 2} turns)` : ''}`
      ),
      'ok'
    );
  };

  // Приказ: Направить выбранный отряд Имамата на перехват конкретной (или ближайшей) колонны РИ
  const handleInterceptImperialColumn = (targetColId = null) => {
    const activeUnit =
      liveFieldUnits.find((u) => u.id === selectedUnitId) || liveFieldUnits[0];
    const advancingCols = liveImperialColumns.filter((c) => c.status === 'advancing');
    const pool = advancingCols.length > 0 ? advancingCols : liveImperialColumns;
    const targetCol =
      (targetColId && liveImperialColumns.find((c) => c.id === targetColId)) ||
      [...pool].sort(
        (a, b) =>
          Math.hypot(a.x - activeUnit.x, a.y - activeUnit.y) -
          Math.hypot(b.x - activeUnit.x, b.y - activeUnit.y)
      )[0];

    if (!targetCol) return;

    // Упреждающая точка перехвата по курсу движения колонны
    const nextWp =
      (targetCol.waypoints && targetCol.waypoints[targetCol.waypointIdx]) || targetCol;
    const leadX = Math.round(targetCol.x * 0.65 + nextWp.x * 0.35);
    const leadY = Math.round(targetCol.y * 0.65 + nextWp.y * 0.35);

    handleCommandUnitMoveToPoint(
      activeUnit.id,
      leadX,
      leadY,
      `Перехват: ${targetCol.badgeRu}`,
      `Intercept: ${targetCol.badgeEn}`,
      `⚔️ Боевой перехват → ${targetCol.nameRu}`,
      `⚔️ Combat Interception → ${targetCol.nameEn}`
    );

    if (targetColId) {
      handleOpenBattlePrelude(targetCol.id);
    }
  };

  // Приказ: Перерезать растянутую линию снабжения (сухарный и пороховой обоз) наступающей колонны РИ на 3D-карте
  const handleSeverColumnSupplyLine = (targetColId = null) => {
    const intactCols = liveImperialColumns.filter((c) => !c.supplyCut);
    const pool = intactCols.length > 0 ? intactCols : liveImperialColumns;
    const targetCol =
      (targetColId && liveImperialColumns.find((c) => c.id === targetColId)) || pool[0];
    if (!targetCol) return;

    playHistoricalSound('blade', soundEnabled);

    const midX = Math.round(((targetCol.originX || targetCol.x) + targetCol.x) * 0.5);
    const midY = Math.round(((targetCol.originY || targetCol.y) + targetCol.y) * 0.5);
    const raiderUnit =
      liveFieldUnits.find((u) => u.id === selectedUnitId && u.id !== 'unit_powder_caravan') ||
      liveFieldUnits.find((u) => u.id === 'unit_hadji_murat') ||
      liveFieldUnits[0];
    if (raiderUnit) {
      handleCommandUnitMoveToPoint(
        raiderUnit.id,
        midX,
        midY,
        `Тыловой тракт ${targetCol.originNameRu}`,
        `Supply road of ${targetCol.originNameEn}`
      );
    }

    setLiveImperialColumns((prev) =>
      prev.map((col) =>
        col.id === targetCol.id
          ? {
              ...col,
              supplyCut: true,
              convoyProgress: 0,
              bayonets: Math.max(850, col.bayonets - 320)
            }
          : col
      )
    );

    const raidSeasonRu = SEASONS[(turn - 1) % SEASONS.length] || 'Лето 1845 г.';
    const raidSeasonEn = SEASONS_EN[(turn - 1) % SEASONS_EN.length] || 'Summer 1845';
    setBattleMemorials((prev) => [
      {
        id: `mem-convoy-${Date.now()}`,
        turn,
        seasonRu: raidSeasonRu,
        seasonEn: raidSeasonEn,
        x: midX,
        y: midY,
        naibateId: targetCol.targetNaibateId || selectedNaibateId,
        titleRu: `Разгром сухарного обоза (${targetCol.originNameRu})`,
        titleEn: `Routed Biscuit Convoy (${targetCol.originNameEn})`,
        commanderRu: raiderUnit?.commanderRu || 'Конный авангард муртазеков',
        commanderEn: raiderUnit?.commanderEn || 'Murtazek Cavalry Vanguard',
        enemyLoss: 320,
        spoilsRu: '+22п пороха, +60₽, +95 провианта',
        spoilsEn: '+22p powder, +60r, +95 provisions'
      },
      ...prev.slice(0, 11)
    ]);

    unlockRelic('relic_baysungur_banner');
    setResources((prev) => ({
      ...prev,
      gunpowder: prev.gunpowder + 22,
      silver: prev.silver + 60 + (activeRelicBonuses.convoySilverBonus || 0),
      provisions: prev.provisions + 95,
      authority: Math.min(100, prev.authority + 3)
    }));

    setFloatingCombatPopups((prev) => [
      ...prev.slice(-6),
      {
        id: `cut-supply-${Date.now()}`,
        x: midX,
        y: midY,
        createdAt: Date.now(),
        textRu: `✂️ ОБОЗ ОТРЕЗАН: -320 шт. РИ • +22п пороха • +60р`,
        textEn: `✂️ SUPPLY LINE CUT: -320 bayonets • +22p powder • +60r`,
        color: '#f59e0b'
      }
    ]);

    setUnitMovementLog((prev) => [
      {
        id: `supply-cut-${Date.now()}`,
        time: `✂️ Удар по тылам [${midX},${midY}]`,
        textRu: `СУХАРНЫЙ ОБОЗ ПЕРЕРЕЗАН! Летучая сотня муртазеков рассекла тыловую коммуникацию «${targetCol.nameRu}»: колонна потеряла -320 штыков от голода, захвачено +22 пуда пороха и +60 руб. серебром!`,
        textEn: `SUPPLY LINE SEVERED! Murtazek cavalry cut the rear supply line of “${targetCol.nameEn}”: column lost -320 bayonets to attrition, captured +22 poods powder & +60 silver rubles!`
      },
      ...prev.slice(0, 7)
    ]);

    setChronicle((prev) => [
      {
        id: `log-supcut-${Date.now()}`,
        turn,
        category: 'battle',
        sender: 'Конный авангард муртазеков (Перехват коммуникаций)',
        senderEn: 'Murtazek Cavalry Vanguard (Supply Line Interdiction)',
        title: `Перерезана линия снабжения: ${targetCol.nameRu}`,
        titleEn: `Supply Line Severed: ${targetCol.nameEn}`,
        text: `В горном дефиле [${midX}, ${midY}] разгромлен сухарный и артиллерийский обоз колонны. Противник потерял 320 штыков, в арсенал Ведено доставлено +22 пуда пороха и +60 руб. серебром.`,
        textEn: `In mountain defile [${midX}, ${midY}] the column’s biscuit and caisson train was routed. Enemy lost 320 bayonets; +22 poods of powder and +60 silver rubles delivered to Vedeno.`
      },
      ...prev
    ]);

    showNotice(
      t(
        `✂️ Линия снабжения «${targetCol.badgeRu}» перерезана! Колонна потеряла -320 штыков, захвачено +22 пуд. пороха и +60 руб. серебра!`,
        `✂️ Supply line of “${targetCol.badgeEn}” severed! Column lost -320 bayonets, captured +22 poods powder & +60 silver rubles!`
      ),
      'ok'
    );
  };

  // Команда к действию: направить выбранный объект в указанную точку рельефа (targetX, targetY)
  const handleCommandUnitMoveToPoint = (
    unitId,
    rawTargetX,
    rawTargetY,
    labelRu = null,
    labelEn = null,
    customOrderRu = null,
    customOrderEn = null
  ) => {
    const targetX = Math.round(Math.max(24, Math.min(676, rawTargetX)));
    const targetY = Math.round(Math.max(32, Math.min(428, rawTargetY)));
    const destTerrain = sampleStrategicTerrain(targetX, targetY);

    // Проверяем, находится ли точка рядом с каким-либо наибством или столицей Дарго-Ведено
    const nearNaibate = naibates.find(
      (n) => Math.hypot(n.coords.x - targetX, n.coords.y - targetY) <= 26
    );
    const isNearVedeno = Math.hypot(225 - targetX, 195 - targetY) <= 22;

    const finalX = nearNaibate ? nearNaibate.coords.x : isNearVedeno ? 225 : targetX;
    const finalY = nearNaibate ? nearNaibate.coords.y : isNearVedeno ? 195 : targetY;

    const resolvedLabelRu =
      labelRu ||
      (nearNaibate
        ? `${nearNaibate.name} (${nearNaibate.naibName})`
        : isNearVedeno
        ? 'Столица Дарго-Ведено (Ставка Шамиля)'
        : `${destTerrain.biomeRu} (${destTerrain.elevationMeters} м, ${destTerrain.slopeDeg}°)`);
    const resolvedLabelEn =
      labelEn ||
      (nearNaibate
        ? `${nearNaibate.nameEn || nearNaibate.name} (${nearNaibate.naibNameEn || nearNaibate.naibName})`
        : isNearVedeno
        ? 'Capital Dargo-Vedeno (Shamil’s HQ)'
        : `${destTerrain.biomeEn} (${destTerrain.elevationMeters}m, ${destTerrain.slopeDeg}°)`);

    playHistoricalSound('gallop', soundEnabled);

    let unitObjNameRu = 'Отряд Имамата';
    let unitObjNameEn = 'Imamate Detachment';
    let outOfMp = false;
    let prideHesitation = false;

    setLiveFieldUnits((prev) => {
      const next = prev.map((u) => {
        if (u.id !== unitId) return u;
        unitObjNameRu = u.nameRu;
        unitObjNameEn = u.nameEn;
        const curMp = u.mp ?? u.maxMp ?? 150;
        outOfMp = curMp <= 2;

        // Влияние характера и дисциплины наиба P(exec) на исполнение полевого приказа
        const homeNaib = naibates.find((n) => n.id === u.homeNaibateId);
        const distFromHome = homeNaib ? Math.hypot(finalX - homeNaib.coords.x, finalY - homeNaib.coords.y) : 0;
        const obedience =
          homeNaib && u.id !== 'unit_chapar_vedeno'
            ? Math.round(
                54 +
                  homeNaib.traits.iman * 0.34 +
                  resources.authority * 0.28 -
                  homeNaib.traits.pride * 0.26 -
                  Math.max(0, leaderStressData.totalStress - 55) * 0.35
              )
            : 98;
        prideHesitation = Boolean(homeNaib && homeNaib.traits.pride >= 80 && obedience < 76 && distFromHome > 115);

        const path = computeTerrainAwarePath(u.x, u.y, finalX, finalY);
        const firstWp = path[1] || path[0] || { x: finalX, y: finalY };
        const headingDeg = Math.round(
          (Math.atan2(firstWp.y - u.y, firstWp.x - u.x) * 180) / Math.PI
        );
        return {
          ...u,
          targetX: finalX,
          targetY: finalY,
          targetLabelRu: resolvedLabelRu,
          targetLabelEn: resolvedLabelEn,
          hesitationMult: prideHesitation ? 1.24 : 1.0,
          orderTitleRu: outOfMp
            ? `Маршрут намечен на следующий ход → ${resolvedLabelRu}`
            : customOrderRu || `Марш-бросок по рельефу → ${resolvedLabelRu}`,
          orderTitleEn: outOfMp
            ? `Route queued for next turn → ${resolvedLabelEn}`
            : customOrderEn || `Terrain March → ${resolvedLabelEn}`,
          status: outOfMp ? 'camped' : 'moving',
          headingDeg,
          waypoints: path,
          waypointIdx: Math.min(1, path.length - 1),
          trail: [{ x: Math.round(u.x), y: Math.round(u.y) }]
        };
      });
      liveUnitsRef.current = next;
      return next;
    });

    if (outOfMp) {
      showNotice(
        t(
          `⛺ Запас хода «${unitObjNameRu}» исчерпан в этом месяце — маршрут намечен, отряд выступит после нажатия «ЗАВЕРШИТЬ ХОД».`,
          `⛺ Movement range of “${unitObjNameEn}” spent this month — route plotted, march resumes on “END TURN”.`
        ),
        'warn'
      );
    } else if (prideHesitation) {
      showNotice(
        t(
          `⚡ Гордыня наиба снижает темп марша (-20% запаса хода вдали от удела). Жалуйте орден или укрепите Авторитет Имама!`,
          `⚡ Naib’s high pride slows distant march (-20% range). Award a medal or boost Imam’s Authority!`
        ),
        'info'
      );
    }

    if (nearNaibate) {
      setSelectedNaibateId(nearNaibate.id);
    }

    setUnitMovementLog((prev) => [
      {
        id: `mv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        time: `${finalX},${finalY} • ${destTerrain.elevationMeters}м (${destTerrain.slopeDeg}°)`,
        textRu: `Приказ получен: «${unitObjNameRu}» начал движение в сторону «${resolvedLabelRu}» (скорость рельефа ×${destTerrain.speedMult}).`,
        textEn: `Command received: “${unitObjNameEn}” started moving toward “${resolvedLabelEn}” (terrain speed ×${destTerrain.speedMult}).`
      },
      ...prev.slice(0, 7)
    ]);
  };

  // Обработка клика прямо по реалистичной 3D-карте рельефа (либо постройка укрепления, либо приказ отряду на движение).
  // clientToMapPoint учитывает зум/панораму (viewBox) и 3D-наклон стола, поэтому клик попадает точно в точку под курсором.
  const handleStrategicMapClick = (e) => {
    const pt = clientToMapPoint(e.currentTarget, e.clientX, e.clientY);
    if (!pt) return;
    setTerrainProbe(sampleStrategicTerrain(pt.x, pt.y));
    if (fortBuildMode) {
      handleConstructFortificationAtPoint(pt.x, pt.y, selectedFortBlueprintId);
      return;
    }
    handleCommandUnitMoveToPoint(selectedUnitId, pt.x, pt.y);
  };

  // Обновление живого геодезического радара рельефа при наведении курсора на карту.
  // В обычном режиме опрос ограничен ≤4 раз/сек и шагом ≥16 ед., чтобы ведение мыши не вызывало перерисовку дерева React.
  const mapProbeFrameRef = useRef(0);
  const lastProbeRef = useRef({ x: 225, y: 195, ts: 0 });
  const handleStrategicMapMouseMove = (e) => {
    const now = performance.now();
    if (!fortBuildMode && now - lastProbeRef.current.ts < 220) return;
    if (mapProbeFrameRef.current) return;
    const svgEl = e.currentTarget;
    const { clientX, clientY } = e;
    mapProbeFrameRef.current = requestAnimationFrame(() => {
      mapProbeFrameRef.current = 0;
      const pt = clientToMapPoint(svgEl, clientX, clientY);
      if (!pt) return;
      if (
        !fortBuildMode &&
        Math.hypot(pt.x - lastProbeRef.current.x, pt.y - lastProbeRef.current.y) < 16
      ) {
        lastProbeRef.current.ts = performance.now();
        return;
      }
      lastProbeRef.current = { x: pt.x, y: pt.y, ts: performance.now() };
      setTerrainProbe(sampleStrategicTerrain(pt.x, pt.y));
    });
  };
  useEffect(() => () => cancelAnimationFrame(mapProbeFrameRef.current), []);

  // Одновременный запуск всех 5 полевых отрядов по историческим маршрутам Кавказа
  const handleDispatchAllUnitsDemo = () => {
    playHistoricalSound('horn', soundEnabled);
    const demoTargets = [
      { id: 'unit_chapar_vedeno', tx: 495, ty: 285, ru: 'Гуниб и Андалал (Цитадель)', en: 'Gunib & Andalal (Citadel)' },
      { id: 'unit_hadji_murat', tx: 585, ty: 265, ru: 'Чох и Согратль (Бастион)', en: 'Chokh & Sogratl (Bastion)' },
      { id: 'unit_baysungur', tx: 145, ty: 125, ru: 'Большая Чечня (Шали)', en: 'Greater Chechnya (Shali)' },
      { id: 'unit_talkhig_artillery', tx: 225, ty: 195, ru: 'Столица Дарго-Ведено', en: 'Capital Dargo-Vedeno' },
      { id: 'unit_powder_caravan', tx: 485, ty: 210, ru: 'Гергебиль (Переправа Койсу)', en: 'Gergebil (Koysu Crossing)' }
    ];

    setLiveFieldUnits((prev) =>
      prev.map((u) => {
        const tgt = demoTargets.find((d) => d.id === u.id);
        if (!tgt) return u;
        const path = computeTerrainAwarePath(u.x, u.y, tgt.tx, tgt.ty);
        const firstWp = path[1] || path[0];
        const headingDeg = Math.round(
          (Math.atan2(firstWp.y - u.y, firstWp.x - u.x) * 180) / Math.PI
        );
        return {
          ...u,
          targetX: tgt.tx,
          targetY: tgt.ty,
          targetLabelRu: tgt.ru,
          targetLabelEn: tgt.en,
          orderTitleRu: `Общий манёвр Диван-ханы → ${tgt.ru}`,
          orderTitleEn: `General Divan-Khana Maneuver → ${tgt.en}`,
          status: 'moving',
          headingDeg,
          waypoints: path,
          waypointIdx: Math.min(1, path.length - 1),
          trail: [{ x: Math.round(u.x), y: Math.round(u.y) }]
        };
      })
    );

    setUnitMovementLog((prev) => [
      {
        id: `mv-all-${Date.now()}`,
        time: 'Общий манёвр (5 отрядов)',
        textRu: 'Все 5 отрядов Имамата получили приказ и начали синхронное выдвижение по горным перевалам и ущельям Кавказа!',
        textEn: 'All 5 Imamate detachments received orders and began advancing simultaneously across the passes and gorges of the Caucasus!'
      },
      ...prev.slice(0, 7)
    ]);
  };

  // ============================================================================
  // ДЕЙСТВИЕ 1: ОТПРАВКА КОННОГО ГОНЦА К НАИБУ И НАГРАЖДЕНИЕ ОРДЕНОМ
  // ============================================================================
  const handleSendEnvoy = () => {
    if (turnActionQuota.sealsRemaining <= 0) {
      alertMsg(
        t(
          'Исчерпан лимит Государственных печатей Диван-ханы на этот ход (3/3)! Завершите ход (Enter), чтобы начать новый сезон.',
          'Divan-Khana State Seals exhausted for this turn (3/3)! End the turn (Enter) to begin a new season.'
        )
      );
      return;
    }
    if (turnActionQuota.envoysSent >= turnActionQuota.maxEnvoysPerTurn) {
      alertMsg(
        t(
          `В этом сезоне конюшни Ведено уже снарядили максимум гонцов (${turnActionQuota.maxEnvoysPerTurn}/${turnActionQuota.maxEnvoysPerTurn} за ход)! Завершите ход для отправки новых чапаров.`,
          `Vedeno stables have already dispatched the maximum envoys this season (${turnActionQuota.maxEnvoysPerTurn}/${turnActionQuota.maxEnvoysPerTurn} per turn)! End turn to send more chapars.`
        )
      );
      return;
    }
    if (resources.gunpowder < attachedPowder) {
      alertMsg(
        t(
          'Недостаточно пороха в арсенале Ведено для снаряжения каравана гонца!',
          'Insufficient gunpowder in the Vedeno Arsenal to equip the envoy caravan!'
        )
      );
      return;
    }
    if (resources.silver < attachedSilver) {
      alertMsg(
        t(
          'Недостаточно серебра в казне Байт аль-маль!',
          'Insufficient silver in the Bayt al-Mal treasury!'
        )
      );
      return;
    }

    setTurnActionQuota((prev) => ({
      ...prev,
      sealsRemaining: Math.max(0, prev.sealsRemaining - 1),
      envoysSent: prev.envoysSent + 1
    }));

    playHistoricalSound('gallop', soundEnabled);

    const orderObj =
      NAIB_ORDER_TYPES.find((o) => o.id === selectedOrderType) || NAIB_ORDER_TYPES[0];
    const turnsNeeded =
      routeMode === 'fast_road'
        ? Math.max(1, selectedNaibate.travelTurns - 1)
        : selectedNaibate.travelTurns;

    setResources((prev) => ({
      ...prev,
      gunpowder: prev.gunpowder - attachedPowder,
      silver: prev.silver - attachedSilver
    }));

    const newEnvoy = {
      id: `envoy-${Date.now()}`,
      targetId: selectedNaibate.id,
      targetName: selectedNaibate.name,
      naibName: selectedNaibate.naibName,
      orderType: selectedOrderType,
      orderTitle: orderObj.title,
      powder: attachedPowder,
      silver: attachedSilver,
      execChance: orderExecutionCalc.chance,
      interceptRisk: orderExecutionCalc.interceptRisk,
      turnsLeft: turnsNeeded,
      totalTurns: turnsNeeded,
      targetCoords: selectedNaibate.coords
    };

    setActiveEnvoys((prev) => [...prev, newEnvoy]);

    if (attachedPowder >= 15 || attachedSilver >= 30) {
      setNaibates((prev) =>
        prev.map((n) =>
          n.id === selectedNaibate.id
            ? {
                ...n,
                trustScore: Math.min(3, (n.trustScore ?? 0) + 1),
                lastMemoryRu: `Получил с чапаром +${attachedPowder} пуд. пороха и +${attachedSilver} руб. серебра из Ведено`,
                lastMemoryEn: `Received +${attachedPowder}p powder & +${attachedSilver}r silver via chapar from Vedeno`
              }
            : n
        )
      );
    }

    // СПРИНТ 24: Мгновенный запуск живого 60 FPS движения чапара из столицы Дарго-Ведено (225, 195) к выбранному наибству
    const envoyPath = computeTerrainAwarePath(
      225,
      195,
      selectedNaibate.coords.x,
      selectedNaibate.coords.y
    );
    const firstWp = envoyPath[1] || envoyPath[0];
    const envoyHeading = Math.round((Math.atan2(firstWp.y - 195, firstWp.x - 225) * 180) / Math.PI);
    setLiveFieldUnits((prev) =>
      prev.map((u) =>
        u.id === 'unit_chapar_vedeno'
          ? {
              ...u,
              x: 225,
              y: 195,
              targetX: selectedNaibate.coords.x,
              targetY: selectedNaibate.coords.y,
              targetLabelRu: `${selectedNaibate.name} (${selectedNaibate.naibName})`,
              targetLabelEn: `${selectedNaibate.nameEn || selectedNaibate.name} (${selectedNaibate.naibNameEn || selectedNaibate.naibName})`,
              orderTitleRu: `${orderObj.title} (+${attachedPowder} пуд. пороха)`,
              orderTitleEn: `${orderObj.titleEn || orderObj.title} (+${attachedPowder} poods powder)`,
              status: 'moving',
              headingDeg: envoyHeading,
              waypoints: envoyPath,
              waypointIdx: Math.min(1, envoyPath.length - 1),
              trail: [{ x: 225, y: 195 }]
            }
          : u
      )
    );
    setSelectedUnitId('unit_chapar_vedeno');
    setUnitMovementLog((prev) => [
      {
        id: `mv-env-${Date.now()}`,
        time: `Дарго-Ведено → ${selectedNaibate.name}`,
        textRu: `Чапар с печатью Шамиля (${attachedPowder} пуд. пороха, ${attachedSilver} руб.) выехал из Ведено и скачет по рельефу в «${selectedNaibate.name}»!`,
        textEn: `Chapar bearing Shamil’s signet (${attachedPowder} poods powder, ${attachedSilver} rub.) departed Vedeno and is riding across the terrain toward “${selectedNaibate.nameEn || selectedNaibate.name}”!`
      },
      ...prev.slice(0, 7)
    ]);

    setPlaytestTelemetry((prev) => ({
      ...prev,
      minVedenoPowderPoods: Math.min(prev.minVedenoPowderPoods, resources.gunpowder - attachedPowder),
      totalEnvoysDispatched: prev.totalEnvoysDispatched + 1,
      tier0_NoPowder: prev.tier0_NoPowder + (attachedPowder === 0 ? 1 : 0),
      tier15_LightPack: prev.tier15_LightPack + (attachedPowder === 15 ? 1 : 0),
      tier30_Reinforced: prev.tier30_Reinforced + (attachedPowder === 30 ? 1 : 0),
      tier45_HeavyTrain: prev.tier45_HeavyTrain + (attachedPowder >= 45 ? 1 : 0)
    }));
    alertMsg(
      t(
        `Конный мюрид с печатью Шамиля выступил из Ведено в «${selectedNaibate.name}» (${turnsNeeded} ход.) — смотрите живое движение по рельефу!`,
        `Mounted murid bearing Shamil’s signet departed Vedeno for “${selectedNaibate.nameEn || selectedNaibate.name}” (${turnsNeeded} turn(s)) — watch live terrain movement!`
      )
    );
  };

  const handleAwardOrder = (orderItem) => {
    const isDisciplinary = Boolean(orderItem?.isDisciplinary);
    if (turnActionQuota.sealsRemaining <= 0 || turnActionQuota.stateOrdersUsed >= turnActionQuota.maxStateOrdersPerTurn) {
      alertMsg(
        t(
          'Лимит казённых наград и поручений на этот ход исчерпан (1/1 за сезон)! Завершите ход (Enter) для новой чеканки.',
          'State decoration & commission limit reached for this turn (1/1 per season)! End turn (Enter) for a new minting.'
        )
      );
      return;
    }
    const cost = orderItem.silverCost ?? 0;
    if (resources.silver < cost) {
      alertMsg(
        t(
          'Недостаточно серебра в казне для чеканки ордена кубачинскими мастерами!',
          'Insufficient silver in the treasury for Kubachi silversmiths to mint the medal!'
        )
      );
      return;
    }

    const applied = applyOrderAwardToNaibate(selectedNaibate, orderItem);

    setTurnActionQuota((prev) => ({
      ...prev,
      sealsRemaining: Math.max(0, prev.sealsRemaining - 1),
      stateOrdersUsed: prev.stateOrdersUsed + 1
    }));

    triggerTactileCue(isDisciplinary ? 'felt_shame' : 'order_award');

    setResources((prev) => ({
      ...prev,
      silver: Math.max(0, prev.silver - applied.silverCost),
      authority: Math.min(100, Math.max(15, prev.authority + applied.authorityDelta))
    }));

    if (!isDisciplinary) {
      unlockRelic('relic_alqarakhi_chronicle_inkwell');
    }
    setNaibates((prev) =>
      prev.map((n) => (n.id === selectedNaibate.id ? applied.nextNaibate : n))
    );

    // СПРИНТ 7: Прямое боевое влияние орденов Шамиля на полевую сотню наиба
    if (!isDisciplinary && applied.squadronVetDelta > 0) {
      setLiveFieldUnits((prev) => {
        const targetSquadronId =
          prev.find((u) => u.homeNaibateId === selectedNaibate.id && u.id !== 'unit_powder_caravan')?.id ||
          selectedUnitId ||
          'unit_hadji_murat';
        return prev.map((u) =>
          u.id === targetSquadronId
            ? {
                ...u,
                medals: [...(u.medals || []), orderItem.name],
                vetXp: Math.min(3, (u.vetXp ?? 0) + applied.squadronVetDelta)
              }
            : u
        );
      });
    }

    // Политический эффект: ревность соперничающего наиба (или разрядка при взыскании)
    setNaibRivalries((prev) =>
      prev.map((r) =>
        (r.naibAId === selectedNaibate.id || r.naibBId === selectedNaibate.id) && !r.resolved
          ? { ...r, tension: Math.max(5, Math.min(100, r.tension + applied.rivalJealousyDelta)) }
          : r
      )
    );

    setChronicle((prev) => [
      {
        id: `log-ord-${Date.now()}`,
        turn,
        category: 'nizam',
        sender: isDisciplinary
          ? 'Верховный суд мухтасибов Диван-ханы'
          : 'Казначей Хаджияв и златокузнецы Кубачи и Гоцатля',
        senderEn: isDisciplinary
          ? 'Supreme Muhtasib Tribunal of Divan-Khana'
          : 'Treasurer Hajjiyav & Kubachi-Gotsatl Silversmiths',
        title: isDisciplinary
          ? `Дисциплинарный знак Низама: ${selectedNaibate.naibName}`
          : `Пожалован орден №${orderItem.num || '★'}: ${selectedNaibate.naibName}`,
        titleEn: isDisciplinary
          ? `Disciplinary Nizam Mark: ${selectedNaibate.naibNameEn || selectedNaibate.naibName}`
          : `Bestowed Order #${orderItem.num || '★'}: ${selectedNaibate.naibNameEn || selectedNaibate.naibName}`,
        text: isDisciplinary
          ? `Наибу округа «${selectedNaibate.name}» по Низаму назначен «${orderItem.name}» (${orderItem.perkRu || ''}). Гордыня и амбиции урезаны, Авторитет Имама +${applied.authorityDelta}%.`
          : `Имам Шамиль жаловал наибу округа «${selectedNaibate.name}» кубачинский знак «${orderItem.name}» (${orderItem.arabicMotto || ''}). ${orderItem.perkRu || `Иман +${orderItem.imanBonus}, Гордыня -${orderItem.prideReduction}`}.`,
        textEn: isDisciplinary
          ? `Naib of “${selectedNaibate.nameEn || selectedNaibate.name}” received the “${orderItem.nameEn || orderItem.name}” (${orderItem.perkEn || ''}). Pride and ambition curbed, Imam Authority +${applied.authorityDelta}%.`
          : `Imam Shamil bestowed Kubachi order “${orderItem.nameEn || orderItem.name}” upon the Naib of “${selectedNaibate.nameEn || selectedNaibate.name}” (${orderItem.arabicMottoEn || ''}). ${orderItem.perkEn || `Iman +${orderItem.imanBonus}, Pride -${orderItem.prideReduction}`}.`
      },
      ...prev
    ]);

    showNotice(
      t(
        isDisciplinary
          ? `⚠️ Назначен «${orderItem.name}» для ${selectedNaibate.naibName} (${orderItem.perkRu})`
          : `🎖️ Орден «${orderItem.name}» жалован ${selectedNaibate.naibName} (${orderItem.perkRu})`,
        isDisciplinary
          ? `⚠️ Issued “${orderItem.nameEn || orderItem.name}” to ${selectedNaibate.naibNameEn || selectedNaibate.naibName}`
          : `🎖️ Bestowed “${orderItem.nameEn || orderItem.name}” on ${selectedNaibate.naibNameEn || selectedNaibate.naibName}`
      ),
      isDisciplinary ? 'warn' : 'ok'
    );
  };

  // ============================================================================
  // ДЕЙСТВИЕ 2: ПРИНЯТИЕ НИЗАМОВ И РЕШЕНИЕ СУДЕБНЫХ КАЗУСОВ
  // ============================================================================
  const handleEnactNizam = (nizam, bypassQuota = false) => {
    if (nizam.enacted) return;
    const reqTurn = nizam.unlockTurn || 1;
    if (!bypassQuota && turn < reqTurn) {
      alertMsg(
        t(
          `Этот устав относится к следующей ступени реформ (${nizam.tierBadgeRu || `Ход ${reqTurn}`}) и откроется на Ходу ${reqTurn} (сейчас Ход ${turn}).`,
          `This statute belongs to a later reform tier (${nizam.tierBadgeEn || `Turn ${reqTurn}`}) and unlocks on Turn ${reqTurn} (currently Turn ${turn}).`
        )
      );
      return;
    }
    if (!bypassQuota && turnActionQuota.sealsRemaining <= 0) {
      alertMsg(
        t(
          'Исчерпан лимит Государственных печатей Диван-ханы на этот ход (3/3)! Завершите ход (Enter), чтобы утвердить новый закон.',
          'Divan-Khana State Seals exhausted for this turn (3/3)! End the turn (Enter) to enact a new law.'
        )
      );
      return;
    }
    if (!bypassQuota && turnActionQuota.nizamsEnacted >= turnActionQuota.maxNizamsPerTurn) {
      alertMsg(
        t(
          'Государственный совет уже утвердил один Низам в этом сезоне (лимит: 1 реформа за ход)! Завершите ход, чтобы обнародовать следующий устав.',
          'The State Council has already enacted one Nizam this season (limit: 1 reform per turn)! End turn to proclaim the next statute.'
        )
      );
      return;
    }
    if (resources.authority < nizam.costAuthority || resources.silver < nizam.costSilver) {
      alertMsg(
        lang === 'en'
          ? 'Insufficient Divan-Khana Authority or Treasury Silver to enact this Nizam!'
          : 'Недостаточно Авторитета Диван-ханы или серебра в казне для утверждения Низама!'
      );
      return;
    }

    setTurnActionQuota((prev) => ({
      ...prev,
      sealsRemaining: Math.max(0, prev.sealsRemaining - 1),
      nizamsEnacted: prev.nizamsEnacted + 1
    }));

    playHistoricalSound('seal', soundEnabled);

    setResources((prev) => ({
      ...prev,
      authority: prev.authority - nizam.costAuthority,
      silver: prev.silver - nizam.costSilver
    }));

    setNizams((prev) =>
      prev.map((item) => (item.id === nizam.id ? { ...item, enacted: true } : item))
    );

    setChronicle((prev) => [
      {
        id: `log-niz-${Date.now()}`,
        turn,
        category: 'nizam',
        sender: 'Государственный совет Диван-хана (Дарго-Ведено)',
        senderEn: 'State Council Divan-Khana (Dargo-Vedeno)',
        title: `Всенародно обнародован закон: ${nizam.title}`,
        titleEn: `State Law Proclaimed: ${nizam.titleEn || nizam.title}`,
        text: `${nizam.historicalText} Эффект для государства: ${nizam.effectsSummary}.`,
        textEn: `${nizam.historicalTextEn || nizam.historicalText} State effect: ${nizam.effectsSummaryEn || nizam.effectsSummary}.`
      },
      ...prev
    ]);
  };

  const handleResolveCourtCase = (courtCase, option, bypassQuota = false) => {
    if (!courtCase || courtCase.resolved) return;
    const requiredTurn = courtCase.unlockTurn || 1;
    if (!bypassQuota && turn < requiredTurn) {
      alertMsg(
        t(
          `Слушание этого судебного казуса ещё не открыто! Оно поступит в Диван-хану на Ходу #${requiredTurn} (сейчас Ход #${turn}).`,
          `This court appeal is not yet unlocked! It will reach the Divan-Khana on Turn #${requiredTurn} (currently Turn #${turn}).`
        )
      );
      return;
    }
    if (!bypassQuota && turnActionQuota.sealsRemaining <= 0) {
      alertMsg(
        t(
          'Исчерпан лимит Государственных печатей Диван-ханы на этот ход (3/3)! Завершите ход (Enter), чтобы продолжить заседание суда.',
          'Divan-Khana State Seals exhausted for this turn (3/3)! End the turn (Enter) to continue court proceedings.'
        )
      );
      return;
    }
    if (!bypassQuota && turnActionQuota.courtCasesResolved >= turnActionQuota.maxCourtCasesPerTurn) {
      alertMsg(
        t(
          'Верховный суд Диван-ханы уже вынес приговор по одному делу в этом сезоне (лимит: 1 дело за ход)! Следующее слушание состоится на новом ходу.',
          'The Supreme Court of Divan-Khana has already judged one case this season (limit: 1 case per turn)! The next hearing will take place on the next turn.'
        )
      );
      return;
    }

    setTurnActionQuota((prev) => ({
      ...prev,
      sealsRemaining: Math.max(0, prev.sealsRemaining - 1),
      courtCasesResolved: prev.courtCasesResolved + 1
    }));

    playHistoricalSound('seal', soundEnabled);

    setCourtCases((prev) =>
      prev.map((c) =>
        c.id === courtCase.id
          ? {
              ...c,
              resolved: true,
              chosenResolution: option.label,
              chosenResolutionEn: option.labelEn || option.label
            }
          : c
      )
    );

    // Причинно-следственная связь с фракционным спором Хаджи-Мурата и Кибит-Магомы
    if (courtCase.id === 'case_booty_khunzakh') {
      setNaibRivalries((prev) =>
        prev.map((r) =>
          r.id === 'rivalry_khunzakh_teletl' && !r.resolved
            ? {
                ...r,
                tension: Math.max(
                  10,
                  Math.min(95, r.tension + (option.id === 'compensate_horses' ? -18 : 12))
                )
              }
            : r
        )
      );
    }

    setResources((prev) => ({
      ...prev,
      silver: Math.max(0, prev.silver + (option.silverDelta || 0)),
      authority: Math.min(100, Math.max(10, prev.authority + (option.authorityDelta || 0))),
      provisions: prev.provisions + (option.provisionsDelta || 0)
    }));

    if (option.targetNaibId) {
      setNaibates((prev) =>
        prev.map((n) =>
          n.id === option.targetNaibId
            ? {
                ...n,
                traits: {
                  ...n.traits,
                  iman: Math.min(100, Math.max(20, n.traits.iman + (option.imanDelta || 0))),
                  pride: Math.min(100, Math.max(10, n.traits.pride + (option.prideDelta || 0)))
                }
              }
            : n
        )
      );
    }

    setChronicle((prev) => [
      {
        id: `log-court-${Date.now()}`,
        turn,
        category: 'nizam',
        sender: 'Шариатский суд Диван-ханы в Ведено',
        senderEn: 'Sharia Court of the Divan-Khana in Vedeno',
        title: `Решение Имама по делу: ${courtCase.title}`,
        titleEn: `Imam’s Verdict on Case: ${courtCase.titleEn || courtCase.title}`,
        text: `Вердикт Шамиля: ${option.label}.`,
        textEn: `Shamil’s Verdict: ${option.labelEn || option.label}.`
      },
      ...prev
    ]);
  };

  // Арбитраж живых споров и фракционного соперничества между наибами в Диван-хане
  const handleMediateNaibRivalry = (rivalryId, opt) => {
    const targetRivalry = naibRivalries.find((r) => r.id === rivalryId);
    if (!targetRivalry || targetRivalry.resolved) return;
    const requiredTurn = targetRivalry.unlockTurn || 1;
    if (turn < requiredTurn) {
      alertMsg(
        t(
          `Этот спор между наибами назреет на Ходу #${requiredTurn} (сейчас Ход #${turn}).`,
          `This inter-Naib rivalry emerges on Turn #${requiredTurn} (currently Turn #${turn}).`
        )
      );
      return;
    }

    if (opt.silverDelta < 0 && resources.silver < Math.abs(opt.silverDelta)) {
      alertMsg(
        t(
          'Недостаточно серебра в казне Байт аль-Мал для исполнения этого арбитража наибов!',
          'Insufficient silver in the Bayt al-Mal treasury to execute this Naib arbitration!'
        )
      );
      return;
    }
    if (opt.powderDelta < 0 && resources.gunpowder < Math.abs(opt.powderDelta)) {
      alertMsg(
        t(
          'Недостаточно пороха в арсенале Ведено для этого решения!',
          'Insufficient gunpowder in the Vedeno Arsenal for this decision!'
        )
      );
      return;
    }

    playHistoricalSound('seal', soundEnabled);

    setNaibRivalries((prev) =>
      prev.map((r) => {
        if (r.id !== rivalryId) return r;
        const nextTension = Math.max(0, Math.min(100, r.tension + (opt.tensionDelta || -20)));
        return {
          ...r,
          tension: nextTension,
          resolved: true,
          resolvedOptionId: opt.id,
          chosenLabelRu: opt.labelRu,
          chosenLabelEn: opt.labelEn
        };
      })
    );

    setResources((prev) => ({
      ...prev,
      silver: Math.max(0, prev.silver + (opt.silverDelta || 0)),
      gunpowder: Math.max(0, prev.gunpowder + (opt.powderDelta || 0)),
      authority: Math.min(100, Math.max(10, prev.authority + (opt.authorityDelta || 0)))
    }));

    setNaibates((prev) =>
      prev.map((n) => {
        if (n.id === targetRivalry.naibAId) {
          return {
            ...n,
            murtazeks: Math.max(60, n.murtazeks + (opt.murtazeksBonus || 0)),
            traits: {
              ...n.traits,
              iman: Math.min(100, Math.max(15, n.traits.iman + (opt.targetNaibAIman || 0))),
              pride: Math.min(100, Math.max(10, n.traits.pride + (opt.targetNaibAPride || 0)))
            }
          };
        }
        if (n.id === targetRivalry.naibBId) {
          return {
            ...n,
            traits: {
              ...n.traits,
              iman: Math.min(100, Math.max(15, n.traits.iman + (opt.targetNaibBIman || 0)))
            }
          };
        }
        return n;
      })
    );

    setChronicle((prev) => [
      {
        id: `log-rivalry-${Date.now()}`,
        turn,
        category: 'nizam',
        sender: 'Верховный арбитраж Имама Шамиля (Диван-хана)',
        senderEn: 'Supreme Arbitration of Imam Shamil (Divan-Khana)',
        title: `Разрешён спор наибов: ${targetRivalry.titleRu}`,
        titleEn: `Naib Rivalry Arbitrated: ${targetRivalry.titleEn}`,
        text: `Решение Шамиля: «${opt.labelRu}».`,
        textEn: `Shamil’s ruling: “${opt.labelEn}”.`
      },
      ...prev
    ]);

    showNotice(
      t(
        `⚖️ Спор наибов разрешён: «${opt.labelRu}»`,
        `⚖️ Naib rivalry resolved: “${opt.labelEn}”`
      ),
      'ok'
    );
  };

  // ============================================================================
  // ДЕЙСТВИЕ 3: ДИПЛОМАТИЯ СО СТАМБУЛОМ И ПАШАМИ АНАТОЛИИ
  // ============================================================================
  const handleOttomanDiplomacy = (opt) => {
    if (turnActionQuota.sealsRemaining <= 0 || turnActionQuota.stateOrdersUsed >= turnActionQuota.maxStateOrdersPerTurn) {
      alertMsg(
        t(
          'Лимит дипломатических миссий и казённых заказов на этот ход исчерпан (1/1 за сезон)! Завершите ход для отправки новой фелюги.',
          'Diplomatic mission & state commission limit reached for this turn (1/1 per season)! End turn to dispatch a new felucca.'
        )
      );
      return;
    }
    if (resources.silver < opt.costSilver) {
      alertMsg(
        lang === 'en'
          ? 'Insufficient silver to equip a covert diplomatic mission across the Black Sea!'
          : 'Недостаточно серебра для снаряжения тайной миссии через Чёрное море!'
      );
      return;
    }

    setTurnActionQuota((prev) => ({
      ...prev,
      sealsRemaining: Math.max(0, prev.sealsRemaining - 1),
      stateOrdersUsed: prev.stateOrdersUsed + 1
    }));

    playHistoricalSound('seal', soundEnabled);

    setResources((prev) => ({
      ...prev,
      silver: prev.silver - opt.costSilver + opt.rewardSilver,
      gunpowder: prev.gunpowder + opt.rewardPowder,
      ottomanSupport: Math.min(100, prev.ottomanSupport + opt.rewardSupport),
      authority: Math.min(100, prev.authority + 4)
    }));

    setChronicle((prev) => [
      {
        id: `log-ott-${Date.now()}`,
        turn,
        category: 'diplomacy',
        sender: 'Посланник Хаджи-Исмаил (Стамбул — Трабзон)',
        senderEn: 'Envoy Hajji Ismail (Istanbul — Trabzon)',
        title: `Дипломатическая депеша: ${opt.title}`,
        titleEn: `Diplomatic Dispatch: ${opt.titleEn || opt.title}`,
        text: `${opt.desc} Доставлено в Имамат: +${opt.rewardPowder} пуд. пороха, +${opt.rewardSilver} руб. серебром, поддержка Порты +${opt.rewardSupport}%.`,
        textEn: `${opt.descEn || opt.desc} Delivered to the Imamate: +${opt.rewardPowder} poods of powder, +${opt.rewardSilver} silver rubles, Sublime Porte support +${opt.rewardSupport}%.`
      },
      ...prev
    ]);
  };

  // ============================================================================
  // ГЛОБАЛЬНЫЙ ПЕРЕХОД ХОДА (СИМУЛЯЦИЯ ГОНЦОВ, ТЕРРАС, ПОРОХА И НАТИСКА ИМПЕРИИ — turnEngine.js + aiGenerals.js)
  // ============================================================================
  const handleNextTurn = () => {
    if (nextFestDemoMode && turn >= NEXT_FEST_DEMO_CONFIG.maxTurns) {
      setShowNextFestOutroModal(true);
      return;
    }
    playHistoricalSound('horn', soundEnabled);
    const nextTurnNum = turn + 1;
    setTurn(nextTurnNum);
    const nextFocus = selectTurnHotspotFocus({ naibates, liveImperialColumns, nextTurnNum });
    if (nextFocus) setTurnFocusEvent(nextFocus);
    setTurnActionQuota(createFreshTurnActionQuota());

    const nextSeasonClimate =
      SEASON_CLIMATE_MODIFIERS[(nextTurnNum - 1) % SEASON_CLIMATE_MODIFIERS.length];

    const newLogs = [];
    const activeGen = IMPERIAL_GENERALS[imperialAi.generalIdx] || IMPERIAL_GENERALS[0];
    const activeDocMod = activeGen.doctrineModifiers || {
      strikePressureBonus: 18,
      strikePowderDrain: -10,
      interceptRiskBonus: 0,
      provisionsModPerTurn: 0
    };
    const baseEco = computeBaseTurnEconomy({
      nextTurnNum,
      nizamModifiers,
      seasonClimate: nextSeasonClimate,
      doctrineModifiers: activeDocMod,
      naibates
    });
    let powderDelta = baseEco.powderDelta;
    let provisionsDelta = baseEco.provisionsDelta;
    let silverDelta = baseEco.silverDelta;
    let authorityDelta = 0;

    // Автоматическое продвижение сквозной цепочки Эпизодов III → IV → V в большой кампании 1845 года
    if (activeScenarioId === 'camp_1845') {
      if (
        nextTurnNum >= 7 &&
        activeEpisodeId === 'ep_1845_dargo' &&
        episodesState?.ep_1845_dargo?.completed
      ) {
        setActiveEpisodeId('ep_1853_crimean_michik');
      } else if (
        nextTurnNum >= 12 &&
        activeEpisodeId === 'ep_1853_crimean_michik' &&
        episodesState?.ep_1853_crimean_michik?.completed
      ) {
        setActiveEpisodeId('ep_1857_gunib');
      }
    }

    // 0. Пошаговое восстановление очков марша (MP) и пополнение сабель отрядов Имамата (src/game/turnEngine.js)
    const refreshedUnits = refreshFieldUnitsForNewTurn({
      units: liveUnitsRef.current || liveFieldUnits,
      naibates,
      fieldHospitals,
      sampleHospitalBonusAtPoint
    });
    liveUnitsRef.current = refreshedUnits;
    setLiveFieldUnits(refreshedUnits);

    const isWinterClimate = baseEco.isWinterClimate;

    // 0.5. Шаг экспедиционных колонн РИ и сухарных обозов (src/game/aiGenerals.js)
    const columnStep = stepImperialColumnsForTurn({
      columns: liveColumnsRef.current || liveImperialColumns,
      naibates,
      liveUnits: refreshedUnits,
      isWinterClimate,
      difficultyWeight: simDifficultyWeight || 1.0,
      nextTurnNum,
      computePath: computeTerrainAwarePath
    });
    liveColumnsRef.current = columnStep.nextColumns;
    setLiveImperialColumns(columnStep.nextColumns);
    if (columnStep.logs.length > 0) newLogs.push(...columnStep.logs);

    // 1. Оперативная директива Штаба Отдельного Кавказского корпуса (src/game/aiGenerals.js)
    const aiStep = resolveImperialAiDirective({
      imperialAi,
      naibates,
      imperialGenerals: IMPERIAL_GENERALS,
      activeScenarioId,
      nextTurnNum,
      isWinterClimate,
      difficultyWeight: simDifficultyWeight || 1.0
    });
    setImperialAi(aiStep.nextImperialAi);
    if (aiStep.logs.length > 0) newLogs.push(...aiStep.logs);

    // 2. Продвижение и прибытие конных гонцов (src/game/turnEngine.js)
    const envoyStep = resolveEnvoysForTurn({ activeEnvoys, nextTurnNum });
    const remainingEnvoys = envoyStep.remainingEnvoys;
    const updatedNaibatesMap = envoyStep.updatedNaibatesMap;
    const resolvedRegionsThisTurn = envoyStep.resolvedRegionsThisTurn;
    powderDelta += envoyStep.powderBonus;
    provisionsDelta += envoyStep.provisionsBonus;
    silverDelta += envoyStep.silverBonus;
    authorityDelta += envoyStep.authorityDelta;
    const turnInterceptedCount = envoyStep.turnInterceptedCount;
    const turnObeyedCount = envoyStep.turnObeyedCount;
    const turnRefusedCount = envoyStep.turnRefusedCount;
    if (envoyStep.logs.length > 0) newLogs.push(...envoyStep.logs);

    setActiveEnvoys(remainingEnvoys);

    // 3. Пересчёт всех наибств на новый ход (src/game/turnEngine.js)
    const naibatesStep = computeNextNaibatesState({
      naibates,
      updatedNaibatesMap,
      resolvedRegionsThisTurn,
      aiStrikeTargetId: aiStep.aiStrikeTargetId,
      scaledStrikePressure: aiStep.scaledStrikePressure,
      aiPowderDrain: aiStep.aiPowderDrain,
      seasonClimate: nextSeasonClimate,
      isWinterClimate,
      signalBeacons,
      activeRelicBonuses,
      availableCentralPowder: resources.gunpowder + powderDelta,
      nextTurnNum
    });
    const computedNextNaibates = naibatesStep.nextNaibates;
    const emergencyPowderSupport = naibatesStep.emergencyPowderSupport;
    authorityDelta += naibatesStep.authorityDelta;
    if (naibatesStep.logs.length > 0) newLogs.push(...naibatesStep.logs);
    const baseNextVedenoPowder = Math.max(0, resources.gunpowder + powderDelta - emergencyPowderSupport);
    const baseNextProvisionsTotal = Math.max(0, resources.provisions + provisionsDelta);
    const baseNextSilverTotal = Math.max(0, resources.silver + silverDelta);
    const baseNextAuthTotal = Math.min(100, Math.max(15, resources.authority + authorityDelta));
    const baseNextResourcesObj = {
      ...resources,
      gunpowder: baseNextVedenoPowder,
      provisions: baseNextProvisionsTotal,
      silver: baseNextSilverTotal,
      authority: baseNextAuthTotal
    };

    // 4. СПРИНТ 7: Исполнение созревших отложенных последствий дилемм (2–4 хода)
    const delayedStep = resolveDueDelayedConsequences({
      queue: delayedConsequences,
      nextTurn: nextTurnNum,
      naibates: computedNextNaibates,
      resources: baseNextResourcesObj
    });
    const finalNextNaibates = delayedStep.nextNaibates;
    const nextResourcesObj = delayedStep.nextResources;
    const nextVedenoPowder = nextResourcesObj.gunpowder;
    const nextProvisionsTotal = nextResourcesObj.provisions;
    const nextSilverTotal = nextResourcesObj.silver;
    const nextAuthTotal = nextResourcesObj.authority;
    setDelayedConsequences(delayedStep.remainingQueue);
    setNaibates(finalNextNaibates);
    setResources(nextResourcesObj);
    if (delayedStep.logs.length > 0) {
      newLogs.push(...delayedStep.logs);
      const firstEcho = delayedStep.firedEffects[0]?.effect;
      if (firstEcho && !spectatorMode.active && !pitchTour.active) {
        showNotice(
          t(
            `⏳ Сбылся отголосок указа: ${firstEcho.titleRu}`,
            `⏳ Delayed consequence fired: ${firstEcho.titleEn || firstEcho.titleRu}`
          ),
          'info'
        );
      }
    }

    // ВОЛНА III / СПРИНТ 7: Доставка одной из 32 исторических дилемм с отложенным эхом при смене сезона
    if (!spectatorMode.active && !pitchTour.active && !activeDivanPacket) {
      const nextPkt = pickReactiveDivanPacket(
        finalNextNaibates,
        nextResourcesObj,
        resolvedPacketIds,
        nextTurnNum
      );
      if (nextPkt) {
        setActiveDivanPacket(nextPkt);
      }
    }

    const nextRegPowder = finalNextNaibates.reduce((s, n) => s + n.gunpowder, 0);
    const nextGarrisonTotal = finalNextNaibates.reduce((s, n) => s + n.garrison + n.murtazeks, 0);
    const nextSiegesCount = finalNextNaibates.filter((n) => n.underSiege).length;

    // ВОЛНА III (Шаг 3): Проверка исторической кульминации (Триумф Имамата / Последний оплот на Гунибе) с Хода 5+
    const climaxResult = evaluateCampaignClimax({
      nextTurnNum,
      nextSiegesCount,
      nextAuthTotal,
      victoryScore: campaignAudit.victoryScore,
      climaxDismissed,
      suppressed: spectatorMode.active || pitchTour.active
    });
    if (climaxResult) {
      setCampaignClimaxState(climaxResult);
    }
    const headlineEventRu =
      newLogs.length > 0
        ? newLogs[0].title
        : `Ход ${nextTurnNum}: оборот пороховых мельниц Ведено и сбор хараджа`;
    const headlineEventEn =
      newLogs.length > 0
        ? newLogs[0].titleEn || newLogs[0].title
        : `Turn ${nextTurnNum}: Vedeno powder mill cycle & kharaj collection`;

    const nextHistoryEntry = {
      turn: nextTurnNum,
      seasonRu: SEASONS[(nextTurnNum - 1) % SEASONS.length],
      seasonEn: SEASONS_EN[(nextTurnNum - 1) % SEASONS_EN.length],
      generalNameRu: activeGen.name,
      generalNameEn: activeGen.nameEn,
      vedenoPowder: nextVedenoPowder,
      regionalPowder: nextRegPowder,
      silver: nextSilverTotal,
      provisions: nextProvisionsTotal,
      totalGarrison: nextGarrisonTotal,
      totalStress: leaderStressData.totalStress,
      victoryScore: campaignAudit.victoryScore,
      siegesCount: nextSiegesCount,
      eventRu: headlineEventRu,
      eventEn: headlineEventEn
    };
    const nextCampaignHistoryLog = [...campaignHistoryLog, nextHistoryEntry];
    setCampaignHistoryLog(nextCampaignHistoryLog);
    setReplaySelectedTurnIdx(nextCampaignHistoryLog.length - 1);

    setPlaytestTelemetry((prev) => ({
      ...prev,
      minVedenoPowderPoods: Math.min(prev.minVedenoPowderPoods, nextVedenoPowder),
      zulmatTriggeredCount:
        prev.zulmatTriggeredCount + (leaderStressData.isZulmat ? 1 : 0),
      envoysInterceptedCount: prev.envoysInterceptedCount + turnInterceptedCount,
      naibOrdersObeyedCount: prev.naibOrdersObeyedCount + turnObeyedCount,
      naibOrdersRefusedCount: prev.naibOrdersRefusedCount + turnRefusedCount
    }));

    const nextChronicle = newLogs.length > 0 ? [...newLogs, ...chronicle] : chronicle;
    if (newLogs.length > 0) {
      setChronicle(nextChronicle);
    }

    // Тихое автосохранение хода в отдельный слот autosave (с актуальным nextImperialAi — src/game/saveSystem.js)
    const autoPayload = buildCampaignSavePayload(
      {
        turn: nextTurnNum,
        activeScenarioId,
        simDifficultyWeight,
        resources: nextResourcesObj,
        naibates: finalNextNaibates,
        nizams,
        courtCases,
        crises,
        activeEnvoys: remainingEnvoys,
        imperialAi: aiStep.nextImperialAi,
        liveFieldUnits: refreshedUnits,
        liveImperialColumns: columnStep.nextColumns,
        kunakSpyRings,
        signalBeacons: signalBeaconsRef.current || signalBeacons,
        riverBridges: riverBridgesRef.current || riverBridges,
        liveMapFortifications: liveFortsRef.current || liveMapFortifications,
        chronicle: nextChronicle,
        zulmatClearedCount,
        activatedFigurePerks,
        executedDispatchesIds,
        prologueRewardClaimed,
        heroArcsState,
        episodesState,
        activeEpisodeId,
        capitalNaibateId,
        capitalLabelRu,
        capitalLabelEn,
        imperialHeldIds,
        campaignHistoryLog: nextCampaignHistoryLog,
        tacticalBattleSession,
        delayedConsequences: delayedStep.remainingQueue,
        resolvedPacketIds
      },
      { seasons: SEASONS, seasonsEn: SEASONS_EN }
    );
    if (writeSaveSlot('autosave', autoPayload, { updateLatest: true, onlyInitLatestIfMissing: true }).ok) {
      setSaveSlotsRefreshTick((v) => v + 1);
      syncSaveToSteamCloud('imamat_save_autosave', autoPayload);
      setSteamCloudStatus(loadSteamCloudManifest());
    }
  };

  // ============================================================================
  // ХРОНОГРАФ АЛЬ-КАРАХИ: СИМУЛЯЦИЯ 20 ХОДОВ И ЭКСПОРТ AFTER-ACTION REPORT (M13)
  // ============================================================================
  const handleAutoSimulate20TurnsReplay = () => {
    playHistoricalSound('seal', soundEnabled, { volume: audioMixerConfig.masterVolume });
    const simulatedSnapshots = [];
    let simVedeno = resources.gunpowder;
    let simReg = naibates.reduce((s, n) => s + n.gunpowder, 0);
    let simSilver = resources.silver;
    let simProv = resources.provisions;
    let simGarrison = naibates.reduce((s, n) => s + n.garrison + n.murtazeks, 0);
    let simStress = leaderStressData.totalStress;
    let simScore = campaignAudit.victoryScore;
    let simSieges = naibates.filter((n) => n.underSiege).length;

    const eventsRu = [
      'Созыв Государственного совета Диван-ханы в Дарго-Ведено',
      'Караван из 30 пудов пороха доставлен в Большую Чечню (Шали)',
      'Принят Низам о тайных мухтасибах и казне Байт аль-маль',
      'Отражён авангард колонны ген. Фрейтага на Сунженской линии',
      'Ввод в строй двухъярусных селитренных варниц Хаджи-Юсуфа в Гунибе',
      'Подрыв встречного камуфлета под сапёрной галереей у аула Салты',
      'Конный рейд Хаджи-Мурата Хунзахского в тыл Темир-Хан-Шуры',
      'Осенний сбор закята и пополнение пороховых погребов Андалала',
      'Зимняя блокада пастбищ Джайляу войсками ген. Евдокимова',
      'Совет улемов Согратля: преодоление кризиса «Зульмата»',
      'Засада Байсунгура Беноевского в буковых засеках Ичкерии',
      'Отливка медных горных единорогов устазом Джабраилом в Ведено',
      'Штурм осадных редутов у Чоха: захват 18 пудов трофейного пороха',
      'Прибытие тайной депеши из Трапезунда (+45 пудов селитры и свинца)',
      'Укрепление 4-слойных бревенчатых блиндажей в Гергебиле и Карата',
      'Кинжальная ночная вылазка сотен муртазеков при 0/18 газырей',
      'Указ Шамиля о награждении наибов серебряными орденами Гоцатля',
      'Срыв осенней экспедиции Отдельного Кавказского корпуса',
      'Стабилизация всех 10 наибств и сохранение порохового резерва',
      'Исторический итог 20 ходов: Государство Имамата устояло!'
    ];
    const eventsEn = [
      'State Council Divan-Khana convened in Dargo-Vedeno',
      '30-pood reinforced powder convoy delivered to Greater Chechnya (Shali)',
      'Enacted Nizam on Secret Muhtasib Inspectors & Bayt al-Mal Treasury',
      'Repelled Gen. Freytag’s flying column vanguard along the Sunzha Line',
      'Commissioned Hajji Yusuf’s two-tiered saltpeter works in Gunib',
      'Detonated counter-mine camouflet beneath the Russian sap at Salty',
      'Hadji Murad’s night cavalry raid behind Temir-Khan-Shura cordons',
      'Autumn Zakat harvest & replenishment of Andalal powder cellars',
      'Winter lowland pasture blockade launched by Gen. Evdokimov',
      'Conciliar Epistle of Sogratl scholars clears command strain (Zulmat)',
      'Baysungur of Benoy’s spline ambush in the Ichkeria beech abatis',
      'Ustaz Jabrail casts bronze mountain unicorns at the Vedeno foundry',
      'Sortie against Chokh siege redoubts captures 18 poods of powder',
      'Covert dispatch from Trabzon delivers +45 poods of saltpeter & lead',
      'Reinforced 4-layer log blindages across Gergebil and Karata',
      'Night shashka & kindjal sortie triggered upon 0/18 gazyr depletion',
      'Shamil awards Gotsatl silver-niello decorations to frontline Naibs',
      'Disrupted the Separate Caucasian Corps autumn offensive column',
      'Stabilized all 10 Naibates with positive powder equilibrium',
      'Turn 20 Historical Verdict: The Imamate State Endures!'
    ];

    for (let tIdx = 1; tIdx <= 20; tIdx++) {
      const gen = IMPERIAL_GENERALS[(imperialAi.generalIdx + Math.floor((tIdx - 1) / 2)) % IMPERIAL_GENERALS.length];
      simulatedSnapshots.push({
        turn: tIdx,
        seasonRu: SEASONS[(tIdx - 1) % SEASONS.length],
        seasonEn: SEASONS_EN[(tIdx - 1) % SEASONS_EN.length],
        generalNameRu: gen.name,
        generalNameEn: gen.nameEn,
        vedenoPowder: Math.round(simVedeno),
        regionalPowder: Math.round(simReg),
        silver: Math.round(simSilver),
        provisions: Math.round(simProv),
        totalGarrison: Math.round(simGarrison),
        totalStress: Math.round(simStress),
        victoryScore: Math.round(simScore),
        siegesCount: simSieges,
        eventRu: eventsRu[tIdx - 1],
        eventEn: eventsEn[tIdx - 1]
      });
      simVedeno = Math.max(55, Math.min(340, simVedeno + (tIdx % 3 === 0 ? 18 : -6)));
      simReg = Math.max(260, Math.min(580, simReg + (tIdx % 2 === 0 ? 14 : -8)));
      simSilver = Math.max(240, simSilver + 28);
      simProv = Math.max(680, simProv + (tIdx % 4 === 0 ? -45 : 35));
      simGarrison = Math.max(14500, simGarrison + (tIdx % 3 === 0 ? 180 : -95));
      simStress = Math.max(18, Math.min(82, simStress + (tIdx % 4 === 0 ? -9 : 3)));
      simSieges = tIdx > 14 ? 0 : tIdx % 3 === 0 ? 1 : 2;
      simScore = Math.max(45, Math.min(96, Math.round(74 + (20 - simStress * 0.25) + (2 - simSieges) * 4)));
    }
    setCampaignHistoryLog(simulatedSnapshots);
    setReplaySelectedTurnIdx(simulatedSnapshots.length - 1);
    alertMsg(
      t(
        'В Хронограф аль-Карахи загружена полная 20-ходовая летопись кампании!',
        'Loaded full 20-turn campaign trajectory into Al-Qarakhi Replay Chronograph!'
      )
    );
  };

  const handleExportReplayMarkdown = () => {
    const lines = [
      `# 📜 ХРОНОГРАФ АЛЬ-КАРАХИ — AFTER-ACTION REPORT (AAR)`,
      `- **Сценарий / Кампания:** ${activeScenarioId}`,
      `- **Пройдено ходов в летописи:** ${campaignHistoryLog.length}`,
      `- **Дата выгрузки:** ${new Date().toISOString()}`,
      ``,
      `| Ход | Сезон | Командующий РИ | Порох Ведено | Порох Округов | Казна (руб.) | Войско | Стресс | Устойчивость | Ключевое событие |`,
      `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |`,
      ...campaignHistoryLog.map(
        (h) =>
          `| **${h.turn}** | ${lang === 'en' ? h.seasonEn : h.seasonRu} | ${lang === 'en' ? h.generalNameEn : h.generalNameRu} | ${h.vedenoPowder} п. | ${h.regionalPowder} п. | ${h.silver} | ${h.totalGarrison} | ${h.totalStress}% | **${h.victoryScore}%** | ${lang === 'en' ? h.eventEn : h.eventRu} |`
      )
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Imamat_Campaign_Replay_AAR_Turn${campaignHistoryLog.length}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportReplayJson = () => {
    const payload = {
      schemaVersion: 'ImamatCampaignReplay_v1.5',
      exportedAtUtc: new Date().toISOString(),
      totalTurnsRecorded: campaignHistoryLog.length,
      snapshots: campaignHistoryLog
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Imamat_Campaign_Replay_Turn${campaignHistoryLog.length}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  const handleLaunchIronmanChallenge = (challengeId) => {
    const preset = HISTORICAL_IRONMAN_CHALLENGES.find((c) => c.id === challengeId);
    if (!preset) return;
    playHistoricalSound('seal', soundEnabled);

    const updatedNaibates = INITIAL_NAIBATES.map((n) => {
      const isBesieged = preset.besiegedIds.includes(n.id);
      const nextPressure = Math.min(96, Math.max(20, n.imperialPressure + preset.pressureBoost + (isBesieged ? 12 : 0)));
      const nextPowder = Math.max(12, n.gunpowder + preset.powderAdjust + (n.id === 'gunib' ? 18 : 0));
      return {
        ...n,
        imperialPressure: nextPressure,
        gunpowder: nextPowder,
        underSiege: isBesieged || nextPressure >= 82
      };
    });

    setActiveIronmanChallengeId(preset.id);
    setActiveScenarioId(preset.id);
    setTurn(1);
    setResources({ ...preset.resources });
    setNaibates(updatedNaibates);
    setImperialAi((prev) => ({
      ...prev,
      generalIdx: preset.generalIdx,
      aiDoctrineLocked: true,
      turnsUntilStrike: 2
    }));
    setExecutedDispatchesIds([]);
    setActiveEnvoys([]);
    setShowFieldManualModal(false);
    setShowModBuilderModal(false);
    setActiveTab('map');

    const gen = IMPERIAL_GENERALS[preset.generalIdx] || IMPERIAL_GENERALS[0];
    setCampaignHistoryLog([
      {
        turn: 1,
        seasonRu: `${preset.badgeRu}: ${preset.titleRu}`,
        seasonEn: `${preset.badgeEn}: ${preset.titleEn}`,
        generalNameRu: gen.name,
        generalNameEn: gen.nameEn,
        vedenoPowder: preset.resources.gunpowder,
        regionalPowder: updatedNaibates.reduce((s, r) => s + r.gunpowder, 0),
        silver: preset.resources.silver,
        provisions: preset.resources.provisions,
        totalGarrison: updatedNaibates.reduce((s, r) => s + r.garrison + r.murtazeks, 0),
        totalStress: 38,
        victoryScore: 68,
        siegesCount: updatedNaibates.filter((r) => r.underSiege).length,
        eventRu: `Запущено хардкорное испытание Ironman: «${preset.titleRu}» (Доктрина закреплена)`,
        eventEn: `Launched Hardcore Ironman Challenge: "${preset.titleEn}" (AI Doctrine Locked)`
      }
    ]);
    setReplaySelectedTurnIdx(0);
    alertMsg(
      t(
        `⚔️ Запущено испытание Ironman: «${preset.titleRu}»! Доктрина генерала закреплена.`,
        `⚔️ Launched Ironman Challenge: "${preset.titleEn}"! Imperial AI Doctrine locked.`
      )
    );
  };

  const getCommanderSealSummary = () => {
    const lastSnap = campaignHistoryLog[campaignHistoryLog.length - 1] || {
      turn,
      victoryScore: campaignAudit.victoryScore,
      totalStress: leaderStressData.totalStress,
      vedenoPowder: resources.gunpowder,
      regionalPowder: naibates.reduce((s, n) => s + n.gunpowder, 0),
      silver: resources.silver,
      siegesCount: naibates.filter((n) => n.underSiege).length
    };
    const score = lastSnap.victoryScore;
    const sieges = lastSnap.siegesCount;
    let rankRu = 'Мюрид Передовой Засеки';
    let rankEn = 'Forward Abatis Murid';
    let medalRu = 'Медный знак отличия за храбрость';
    let medalEn = 'Bronze Sign of Valor';

    if (score >= 85 && sieges <= 2) {
      rankRu = 'Лев Дагестана и Чечни (Верховный Мудир Диван-ханы)';
      rankEn = 'Lion of Dagestan & Chechnya (Supreme Mudir of the Divan-Khana)';
      medalRu = 'Серебряная звезда с золотой каймой: «Нет силы, кроме как у Аллаха»';
      medalEn = 'Gold-Rimmed Silver Star Medal: "There is no power except with Allah"';
    } else if (score >= 70) {
      rankRu = 'Мудир Государственного Совета Диван-ханы';
      rankEn = 'Mudir of the Divan-Khana State Council';
      medalRu = 'Большой серебряный орден трёхсотлетия хиджры';
      medalEn = 'Grand Silver Order of the Cavalry & Artillery';
    } else if (score >= 52) {
      rankRu = 'Наиб Горного Округа';
      rankEn = 'Highland District Naib';
      medalRu = 'Серебряная бляха «Тому, кто мыслит и сражается»';
      medalEn = 'Silver Insignia "To Him Who Thinks and Fights"';
    }

    const rawHashNum =
      (campaignHistoryLog.length * 7919 +
        score * 1013 +
        lastSnap.vedenoPowder * 37 +
        lastSnap.regionalPowder * 19 +
        (imperialAi.generalIdx + 1) * 5003) %
      16777215;
    const sealHash = `IMAMAT-SEAL-1261AH-${rawHashNum.toString(16).toUpperCase().padStart(6, '0')}`;

    return {
      rankRu,
      rankEn,
      medalRu,
      medalEn,
      sealHash,
      lastSnap
    };
  };

  const handleExportCommanderSealHtml = () => {
    playHistoricalSound('seal', soundEnabled);
    const seal = getCommanderSealSummary();
    const gen = IMPERIAL_GENERALS[imperialAi.generalIdx] || IMPERIAL_GENERALS[0];
    const htmlContent = `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <title>Грамота Диван-ханы с печатью Имама Шамиля — ${seal.sealHash}</title>
  <style>
    body { background: #090c12; color: #f5f5f4; font-family: Georgia, serif; padding: 32px; display: flex; justify-content: center; }
    .scroll-card { max-width: 820px; width: 100%; background: linear-gradient(145deg, #131822, #0d1118); border: 2px solid #d97706; border-radius: 18px; padding: 32px; box-shadow: 0 24px 60px rgba(0,0,0,0.85); }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 6px; background: rgba(245,158,11,0.18); border: 1px solid #f59e0b; color: #fcd34d; font-size: 11px; font-weight: bold; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 20px 0; }
    .box { background: #090c12; border: 1px solid #27272a; border-radius: 10px; padding: 12px; }
    .seal-wrap { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-top: 24px; padding-top: 20px; border-top: 1px solid #27272a; }
  </style>
</head>
<body>
  <div class="scroll-card">
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
      <span class="badge mono">DIVAN-KHANA OFFICIAL COMMANDER'S DIPLOMA • 1261 AH / 1845 AD</span>
      <span class="mono" style="font-size:12px; color:#34d399;">HASH: ${seal.sealHash}</span>
    </div>
    <h1 style="color:#fcd34d; margin: 16px 0 6px; font-size: 26px;">📜 Именная Грамота Государственного Совета Диван-ханы</h1>
    <p style="color:#a8a29e; margin: 0 0 18px; font-size: 14px;">Выдана во славу обороны горных твердынь Дагестана и Чечни • Столица Дарго-Ведено</p>
    <div style="background:#0b0f17; border:1px solid rgba(16,185,129,0.4); border-radius:12px; padding:16px;">
      <div class="mono" style="font-size:11px; color:#6ee7b7; text-transform:uppercase;">Присвоенный полководческий ранг / Awarded Commander Rank:</div>
      <div style="font-size:20px; font-weight:bold; color:#ecfdf5; margin-top:4px;">🏆 ${seal.rankRu}</div>
      <div style="font-size:14px; color:#a7f3d0; margin-top:2px;">${seal.rankEn}</div>
      <div class="mono" style="font-size:12px; color:#fcd34d; margin-top:8px;">★ Награда Кодекса Низамов: ${seal.medalRu} (${seal.medalEn})</div>
    </div>
    <div class="grid mono">
      <div class="box"><div style="font-size:11px; color:#9ca3af;">Ходов летописи</div><div style="font-size:18px; font-weight:bold; color:#fcd34d;">${campaignHistoryLog.length}</div></div>
      <div class="box"><div style="font-size:11px; color:#9ca3af;">Индекс устойчивости</div><div style="font-size:18px; font-weight:bold; color:#34d399;">${seal.lastSnap.victoryScore}%</div></div>
      <div class="box"><div style="font-size:11px; color:#9ca3af;">Порох (Ведено + Округа)</div><div style="font-size:18px; font-weight:bold; color:#38bdf8;">${seal.lastSnap.vedenoPowder + seal.lastSnap.regionalPowder} пуд.</div></div>
      <div class="box"><div style="font-size:11px; color:#9ca3af;">Стресс Имама / Осады</div><div style="font-size:18px; font-weight:bold; color:#fb7185;">${seal.lastSnap.totalStress}% (${seal.lastSnap.siegesCount} осад)</div></div>
    </div>
    <div class="seal-wrap">
      <div>
        <div class="mono" style="font-size:12px; color:#d6d3d1;">Противостоящая доктрина РИ: <strong>${gen.name} (${gen.nameEn})</strong></div>
        <div class="mono" style="font-size:11px; color:#9ca3af; margin-top:4px;">Скреплено восьмиугольным серебряным перстнем Имама Шамиля и хроникой Мухаммед-Тахира аль-Карахи</div>
      </div>
      <svg width="110" height="110" viewBox="0 0 120 120">
        <polygon points="38,6 82,6 114,38 114,82 82,114 38,114 6,82 6,38" fill="#1c1917" stroke="#f59e0b" stroke-width="3.5"/>
        <polygon points="42,13 78,13 107,42 107,78 78,107 42,107 13,78 13,42" fill="none" stroke="#fcd34d" stroke-width="1.2" stroke-dasharray="3,2"/>
        <text x="60" y="46" text-anchor="middle" fill="#fcd34d" font-size="13" font-weight="bold">عَبْدُهُ شَامِيل</text>
        <text x="60" y="66" text-anchor="middle" fill="#e7e5e4" font-size="9" font-family="monospace">SHAMIL SEAL</text>
        <text x="60" y="82" text-anchor="middle" fill="#34d399" font-size="9" font-family="monospace">1255 AH</text>
      </svg>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Imamat_Commanders_Seal_Certificate_${seal.sealHash}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  useEffect(() => {
    if (!showTrailerPrevizModal || !trailerAutoPlaying) return undefined;
    const timer = setInterval(() => {
      setTrailerShotIdx((prev) => {
        const nextIdx = (prev + 1) % STEAM_TRAILER_STORYBOARD_SHOTS.length;
        const nextShot = STEAM_TRAILER_STORYBOARD_SHOTS[nextIdx];
        if (nextShot) {
          playHistoricalSound(nextShot.soundCue, soundEnabled);
        }
        return nextIdx;
      });
    }, 4500);
    return () => clearInterval(timer);
  }, [showTrailerPrevizModal, trailerAutoPlaying, soundEnabled]);

  // ============================================================================
  // СПРИНТ 17 (M17): ЭКСПОРТ СУБТИТРОВ (.SRT RU/EN) И МОНТАЖНОГО ЛИСТА CMX3600 (.EDL)
  // ============================================================================
  const handleExportTrailerSrt = (targetLang = 'ru') => {
    playHistoricalSound('seal', soundEnabled);
    const srtTimecodes = [
      ['00:00:00,000', '00:00:10,000'],
      ['00:00:10,000', '00:00:20,000'],
      ['00:00:20,000', '00:00:32,000'],
      ['00:00:32,000', '00:00:44,000'],
      ['00:00:44,000', '00:00:52,000'],
      ['00:00:52,000', '00:01:00,000']
    ];
    const blocks = STEAM_TRAILER_STORYBOARD_SHOTS.map((s, idx) => {
      const [tIn, tOut] = srtTimecodes[idx] || ['00:00:00,000', '00:00:10,000'];
      const vo = targetLang === 'en' ? s.voiceoverEn : s.voiceoverRu;
      const title = targetLang === 'en' ? s.titleEn : s.titleRu;
      return `${idx + 1}\n${tIn} --> ${tOut}\n${vo}\n[${title}]\n`;
    });
    const content = blocks.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Imamat_Steam_Trailer_60s_${targetLang.toUpperCase()}.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alertMsg(
      t(
        `Скачан файл субтитров трейлера: Imamat_Steam_Trailer_60s_${targetLang.toUpperCase()}.srt`,
        `Downloaded trailer subtitles: Imamat_Steam_Trailer_60s_${targetLang.toUpperCase()}.srt`
      )
    );
  };

  const handleExportTrailerEdl = () => {
    playHistoricalSound('seal', soundEnabled);
    const edlSpans = [
      ['01:00:00:00', '01:00:10:00', '00:00:00:00', '00:00:10:00'],
      ['01:00:10:00', '01:00:20:00', '00:00:10:00', '00:00:20:00'],
      ['01:00:20:00', '01:00:32:00', '00:00:20:00', '00:00:32:00'],
      ['01:00:32:00', '01:00:44:00', '00:00:32:00', '00:00:44:00'],
      ['01:00:44:00', '01:00:52:00', '00:00:44:00', '00:00:52:00'],
      ['01:00:52:00', '01:01:00:00', '00:00:52:00', '00:01:00:00']
    ];
    const lines = [
      'TITLE: IMAMAT_DIVAN_KHANA_STEAM_TRAILER_60S',
      'FCM: NON-DROP FRAME',
      ''
    ];
    STEAM_TRAILER_STORYBOARD_SHOTS.forEach((s, idx) => {
      const [srcIn, srcOut, recIn, recOut] = edlSpans[idx] || edlSpans[0];
      const eventNum = String(idx + 1).padStart(3, '0');
      const reel = `SHOT_0${idx + 1}`;
      lines.push(`${eventNum}  ${reel}  V     C        ${srcIn} ${srcOut} ${recIn} ${recOut}`);
      lines.push(`* FROM CLIP NAME: LS_SteamTrailer_Shot0${idx + 1}.exr`);
      lines.push(`* COMMENT: LENS: ${s.cameraLens} | ACTOR: ${s.ue5ActorRef}`);
      lines.push(`* AUDIO_TRACK_CUE: ${s.audioLayerEn}`);
      lines.push(`* SUBTITLE_RU: ${s.voiceoverRu}`);
      lines.push(`* SUBTITLE_EN: ${s.voiceoverEn}`);
      lines.push('');
    });
    const content = lines.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Imamat_Steam_Trailer_60s_CMX3600.edl';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alertMsg(
      t(
        'Скачан монтажный лист DaVinci Resolve / Premiere Pro: Imamat_Steam_Trailer_60s_CMX3600.edl',
        'Downloaded DaVinci Resolve / Premiere Pro Edit Decision List: Imamat_Steam_Trailer_60s_CMX3600.edl'
      )
    );
  };

  // Экспорт двуязычного пресс-релиза и новости сообщества Steam (Steam Community Announcement + BBCode + Markdown)
  const handleExportSteamAnnouncementMd = () => {
    const sealSummary = getCommanderSealSummary();
    const activeDoctrineObj = IMPERIAL_GENERALS[imperialAi.generalIdx] || IMPERIAL_GENERALS[0];
    const controlledCount = naibates.filter((n) => !n.underSiege).length;
    const mdLines = [
      `# 🦅 ИМАМАТ: ДИВАН-ХАНА (1845) — Пресс-релиз и Анонс сообщества Steam / Steam Community Announcement`,
      ``,
      `* **Версия билда / Build Version:** \`Gold Master Release v2.0 (Milestones M1–M20 Complete)\``,
      `* **Текущая кампания / Active Campaign:** Ход ${turn}/20 • Очки Победы $S_{\\text{win}} = ${campaignAudit.victoryScore}/100$ • Свободных наибств: ${controlledCount}/10 • Порох Ведено: ${resources.gunpowder} пуд.`,
      `* **Доктрина ИИ Отдельного Кавказского корпуса / Active Imperial AI Doctrine:** ${activeDoctrineObj.name} (${activeDoctrineObj.doctrineName}) / ${activeDoctrineObj.nameEn} (${activeDoctrineObj.doctrineNameEn})`,
      `* **Криптографический штамп грамоты Шамиля / Octagonal Signet Hash:** \`${sealSummary.sealHash}\` (${sealSummary.rankRu} / ${sealSummary.rankEn})`,
      ``,
      `---`,
      ``,
      `## 🇷🇺 ЧАСТЬ I: Анонс для Steam Events & Announcements (Русская версия + BBCode)`,
      ``,
      `[h1]ИМАМАТ: ДИВАН-ХАНА — Асимметричная гранд-стратегия и безгексовый 3D-варгейм (Vertical Slice 1.8)[/h1]`,
      `[b]Ведено, 1845 год.[/b] На дубовом столе государственного совета Диван-ханы разложены карты 10 горных наибств Дагестана и Чечни, перья казначея Хаджиясула и бронзовые циркули главного инженера Хаджи-Юсуфа Сафарова.`,
      ``,
      `Мы рады представить [b]Vertical Slice 1.8 (Gold Master Release)[/b] исторического варгейма [b]«ИМАМАТ: ДИВАН-ХАНА»[/b], созданного на фундаменте 30 архивных глав (РГВИА, АКАК, Османский архив BOA и хроника Мухаммед-Тахира аль-Карахи).`,
      ``,
      `[h2]Ключевые особенности Vertical Slice 1.8:[/h2]`,
      `[list]`,
      `[*] [b]Непрямое командование через конных гонцов:[/b] Никакого телепатического контроля. Каждый приказ проходит через логистическую функцию повиновения наиба $P_{\\text{exec}} \\in [5\\%, 98\\%]$.`,
      `[*] [b]Безгексовая 3D-топография боя на данных NASA SRTM (2017×2017):[/b] Сражайтесь на реальном рельефе Ахульго, Ичкерийского леса, Гергебиля и Гуниба с 3D-разрезом скалы по чертежам Д. А. Милютина.`,
      `[*] [b]Аутентичный материально-технический быт горцев:[/b] Патронташ на 18 нагрудных газырей (мерки пороха), пеленг русских мортир по кругам воды в медном тазу Сафарова и 4 эшелона пороховых караванов из Ведено.`,
      `[*] [b]20 000 симуляций Монте-Карло и 4 ИИ-доктрины генералов:[/b] Сразитесь против исторических доктрин Граббе, Воронцова, Фрейтага и Барятинского в 3 хардкорных испытаниях [b]Ironman (1839 Ахульго, 1845 Дарго, 1857 Гуниб)[/b].`,
      `[*] [b]Интерактивный Архив-Музей и 4K пресет трейлера UE5.5:[/b] 11 музейных экспонатов эпохи, превиз 60-секундного трейлера с выгрузкой `.concat('`.srt`/`.edl` и пресет Movie Render Queue `MRQ_ImamatTrailer_4K_Preset.json`.'),
      `[/list]`,
      ``,
      `---`,
      ``,
      `## 🇬🇧 PART II: Steam Community Announcement & Press Release (English Version + BBCode)`,
      ``,
      `[h1]IMAMAT: DIVAN-KHANA — Asymmetric Grand Strategy & Hexless 3D Wargame (Vertical Slice 1.8)[/h1]`,
      `[b]Vedeno, 1845.[/b] Across the oak command table of the Divan-Khana state council lie hand-drawn topographic maps of 10 mountain Naibates across Dagestan and Chechnya, alongside the brass dividers of chief military engineer Hajji-Yusuf Safarov.`,
      ``,
      `We are proud to unveil [b]Vertical Slice 1.8 (Gold Master Release)[/b] of [b]IMAMAT: DIVAN-KHANA[/b], built upon 30 primary-source archival chapters (RGVIA military archives, Ottoman BOA records, and the Arabic chronicle of Muhammad-Tahir al-Qarakhi).`,
      ``,
      `[h2]Key Highlights of Vertical Slice 1.8:[/h2]`,
      `[list]`,
      `[*] [b]Indirect Command via Mounted Couriers:[/b] No omniscient RTS clicking. Every sealed dispatch is governed by the Naib obedience logistic equation $P_{\\text{exec}} \\in [5\\%, 98\\%]$.`,
      `[*] [b]Hexless 3D Tactical Sieges on Real NASA SRTM Terrain (2017×2017):[/b] Command defenses across Akhulgo, the Ichkeria forest, Gergebil, and Gunib with D. A. Milyutin's cross-section cutaway shader.`,
      `[*] [b]Tactile 19th-Century Caucasian Material Culture:[/b] Manage the 18-tube chest bandolier (Gazyr measured powder charges), triangulate siege mortars via Safarov's copper water basin, and dispatch 4-tier gunpowder caravans from the Vedeno watermills.`,
      `[*] [b]20,000-Campaign Monte Carlo Balance & 4 Imperial AI Doctrines:[/b] Test your strategy against Generals Grabbe, Vorontsov, Freitag, and Baryatinsky across 3 historical [b]Ironman Challenges (1839 Akhulgo, 1845 Dargo, 1857 Gunib)[/b].`,
      `[*] [b]Interactive Historical Museum & UE5.5 4K MRQ Trailer Pipeline:[/b] Explore 11 curated historical artifacts, preview the 60-second trailer with 1-click `.concat('`.srt`/`.edl` NLE export, and render in Unreal Engine 5.5 via `MRQ_ImamatTrailer_4K_Preset.json`.'),
      `[/list]`,
      ``,
      `---`,
      ``,
      `### 📊 Сводка60-секундной раскадровки трейлера / 60s Trailer Shot Breakdown`,
      ...STEAM_TRAILER_STORYBOARD_SHOTS.map(
        (s) => `- **${s.code} (${s.timecode}) — ${s.titleRu} / ${s.titleEn}:** \`${s.cameraLens}\` • Actor: \`${s.ue5ActorRef}\``
      ),
      ``
    ];
    const content = mdLines.join('\n');
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Imamat_Steam_Announcement_Turn${turn}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alertMsg(
      t(
        `Скачан двуязычный анонс для Steam и прессы: Imamat_Steam_Announcement_Turn${turn}.md`,
        `Downloaded bilingual Steam Community Announcement & Press Release: Imamat_Steam_Announcement_Turn${turn}.md`
      )
    );
  };



  // Расчёт вероятности успеха дипломатической депеши P_dip
  const getDispatchResolutionPreview = (dispatch, escortLvl = feluccaEscortLevel, tone = diplomaticTone) => {
    if (!dispatch) return { chance: 50, silverCost: 0, escortBonus: 0, toneBonus: 0 };
    const escortTable = [
      { cost: 0, bonus: 0, labelRu: 'Ночной гонец-одиночка (0 руб.)', labelEn: 'Solo Night Courier (0 rub.)' },
      { cost: 40, bonus: 14, labelRu: 'Вооружённая фелука из Трапезунда (40 руб., +14%)', labelEn: 'Armed Trebizond Felucca (40 rub., +14%)' },
      { cost: 85, bonus: 26, labelRu: 'Черкесская флотилия и конвой муртазеков (85 руб., +26%)', labelEn: 'Circassian Flotilla & Murtazek Escort (85 rub., +26%)' }
    ];
    const escort = escortTable[escortLvl] || escortTable[0];
    const toneBonus = tone === dispatch.preferredTone ? 12 : tone === 'protocol' ? 5 : -4;
    const ottomanFactor = Math.round(resources.ottomanSupport * 0.22);
    const authorityFactor = Math.round(resources.authority * 0.16);
    const blockadePenalty = Math.round(dispatch.blockadeSeverity * 0.35);
    const rawChance =
      dispatch.baseFeasibility +
      ottomanFactor +
      authorityFactor +
      escort.bonus +
      toneBonus -
      blockadePenalty;
    const chance = Math.max(18, Math.min(96, rawChance));
    return {
      chance,
      silverCost: escort.cost,
      escortBonus: escort.bonus,
      toneBonus,
      ottomanFactor,
      authorityFactor,
      blockadePenalty
    };
  };

  // Отправка и исполнение дипломатической депеши в кампании
  const handleExecuteDiplomaticDispatch = () => {
    const dispatch =
      DIPLOMATIC_DISPATCHES_ARCHIVE.find((d) => d.id === selectedDispatchId) ||
      DIPLOMATIC_DISPATCHES_ARCHIVE[0];
    if (executedDispatchesIds.includes(dispatch.id)) {
      alertMsg(
        t(
          'Эта историческая депеша уже была скреплена печатью и отправлена в текущей кампании.',
          'This historical dispatch has already been sealed and sent in the current campaign.'
        )
      );
      return;
    }
    const preview = getDispatchResolutionPreview(dispatch, feluccaEscortLevel, diplomaticTone);
    if (resources.silver < preview.silverCost) {
      alertMsg(
        t(
          `Недостаточно серебра в Байт аль-маль для оплаты эскорта фелуки (${preview.silverCost} руб.).`,
          `Insufficient silver in Bayt al-Mal to fund the felucca escort (${preview.silverCost} rub.).`
        )
      );
      return;
    }

    playHistoricalSound('seal', soundEnabled);
    const roll = Math.random() * 100;
    const succeeded = roll <= preview.chance;
    const mult = succeeded ? 1.0 : 0.45; // Даже при перехвате части груза дипломатический эффект частично достигается

    const gainedPowder = Math.round(dispatch.rewards.gunpowder * mult);
    const gainedSilver = Math.round(dispatch.rewards.silver * mult) - preview.silverCost;
    const gainedProv = Math.round(dispatch.rewards.provisions * mult);
    const gainedAuth = Math.round(dispatch.rewards.authority * mult);
    const gainedOttoman = Math.round(dispatch.rewards.ottomanSupport * mult);
    const relief = Math.round(dispatch.rewards.pressureRelief * mult);

    setResources((prev) => ({
      ...prev,
      gunpowder: prev.gunpowder + gainedPowder,
      silver: Math.max(0, prev.silver + gainedSilver),
      provisions: prev.provisions + gainedProv,
      authority: Math.min(100, prev.authority + gainedAuth),
      ottomanSupport: Math.min(100, prev.ottomanSupport + gainedOttoman)
    }));

    if (relief > 0) {
      setNaibates((prev) =>
        prev.map((n) => ({
          ...n,
          imperialPressure: Math.max(5, n.imperialPressure - relief)
        }))
      );
    }

    setExecutedDispatchesIds((prev) => [...prev, dispatch.id]);
    setChronicle((prev) => [
      {
        id: `disp-${Date.now()}`,
        turn,
        category: 'diplomacy',
        sender: `Канцелярия внешних сношений (${dispatch.year})`,
        senderEn: `Foreign Chancellery (${dispatch.year})`,
        title: `📜 ${dispatch.recipientRu}: ${succeeded ? 'Прорыв блокады УСПЕШЕН' : 'Частичный прорыв кордона'} (P=${preview.chance}%)`,
        titleEn: `📜 ${dispatch.recipientEn}: ${succeeded ? 'Blockade Run SUCCESSFUL' : 'Partial Cordon Breakthrough'} (P=${preview.chance}%)`,
        text: `Получено: +${gainedPowder} пуд. пороха, ${gainedSilver >= 0 ? `+${gainedSilver}` : gainedSilver} руб. серебром, +${gainedProv} четв. провианта, +${gainedAuth} Авторитет.`,
        textEn: `Gained: +${gainedPowder} poods powder, ${gainedSilver >= 0 ? `+${gainedSilver}` : gainedSilver} silver rub., +${gainedProv} provisions, +${gainedAuth} Authority.`
      },
      ...prev
    ]);
    alertMsg(
      succeeded
        ? t(
            `Депеша доставлена (${preview.chance}%)! +${gainedPowder} пуд. пороха, +${gainedAuth} Авторитет.`,
            `Dispatch delivered (${preview.chance}%)! +${gainedPowder} poods powder, +${gainedAuth} Authority.`
          )
        : t(
            `Кордон перехватил часть каравана, но депеша дошла (+${gainedPowder} пуд. пороха).`,
            `Cordon intercepted part of the convoy, but the dispatch arrived (+${gainedPowder} poods powder).`
          )
    );
  };

  // Экспорт дипломатического фирмана / меморандума (.md)
  const handleExportDiplomaticDispatchMd = () => {
    const dispatch =
      DIPLOMATIC_DISPATCHES_ARCHIVE.find((d) => d.id === selectedDispatchId) ||
      DIPLOMATIC_DISPATCHES_ARCHIVE[0];
    const preview = getDispatchResolutionPreview(dispatch, feluccaEscortLevel, diplomaticTone);
    const sealSummary = getCommanderSealSummary();
    const md = [
      `# 📜 ДИПЛОМАТИЧЕСКАЯ ДЕПЕША ДИВАН-ХАНЫ (${dispatch.year}) / DIVAN-KHANA DIPLOMATIC FIRMAN`,
      ``,
      `* **Адресат / Recipient:** ${dispatch.recipientRu} / ${dispatch.recipientEn}`,
      `* **Маршрут доставки / Courier Route:** ${dispatch.routeRu} / ${dispatch.routeEn}`,
      `* **Архивный шифр первоисточника / Archival Cipher:** \`${dispatch.archiveCipher}\``,
      `* **Арабский титул / Arabic Incipit:** ${dispatch.arabicHeader}`,
      `* **Расчётная вероятность прорыва блокады $P_{\\text{dip}}$:** \`${preview.chance}%\` (Эскорт: +${preview.escortBonus}%, Протокол: ${preview.toneBonus >= 0 ? '+' : ''}${preview.toneBonus}%)`,
      `* **Криптографический оттиск восьмиугольной печати Шамиля:** \`${sealSummary.sealHash}\``,
      ``,
      `---`,
      ``,
      `## 🇷🇺 Текст дипломатической грамоты (Русский перевод)`,
      `> ${dispatch.excerptRu}`,
      ``,
      `**Стратегический эффект:** ${dispatch.effectSummaryRu}`,
      ``,
      `## 🇬🇧 Diplomatic Dispatch Text (English Translation)`,
      `> ${dispatch.excerptEn}`,
      ``,
      `**Strategic Effect:** ${dispatch.effectSummaryEn}`,
      ``
    ].join('\n');
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Imamat_Diplomatic_Firman_${dispatch.year}_${dispatch.id}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alertMsg(
      t(
        `Скачан дипломатический фирман: Imamat_Diplomatic_Firman_${dispatch.year}_${dispatch.id}.md`,
        `Downloaded Diplomatic Firman: Imamat_Diplomatic_Firman_${dispatch.year}_${dispatch.id}.md`
      )
    );
  };


  // ============================================================================
  // ДЕЙСТВИЕ 7: АВТОМАТИЧЕСКИЙ МОНТЕ-КАРЛО СИМУЛЯТОР БАЛАНСА И ЭПИЛОГ (1859–1877)
  // ============================================================================
  const handleRunMonteCarloSimulation = () => {
    playHistoricalSound('seal', soundEnabled);

    const enactedBonus = campaignAudit.enactedNizamsCount * 3.2;
    const powderReserveFactor = Math.min(22, resources.gunpowder * 0.08);
    const difficultyPenalty = (simDifficultyWeight - 1.0) * 35;

    let wins = 0;
    let stressAccum = 0;
    let powderShortages = 0;

    for (let i = 0; i < simRunsCount; i++) {
      const randomVariance = (Math.random() - 0.48) * 26;
      const runScore =
        campaignAudit.victoryScore +
        enactedBonus +
        powderReserveFactor -
        difficultyPenalty +
        randomVariance;
      if (runScore >= 58) wins += 1;

      const simStress = Math.max(
        18,
        Math.min(
          96,
          leaderStressData.totalStress +
            difficultyPenalty * 0.6 +
            (Math.random() - 0.5) * 18
        )
      );
      stressAccum += simStress;

      if (resources.gunpowder < 140 || Math.random() < 0.35 * simDifficultyWeight) {
        powderShortages += 1;
      }
    }

    const survivalRate = Math.max(8, Math.min(98, Math.round((wins / simRunsCount) * 100)));
    const avgFinalStress = Math.round(stressAccum / simRunsCount);
    const powderBottleneckRate = Math.round((powderShortages / simRunsCount) * 100);

    const lowestImanNaib = [...naibates].sort(
      (a, b) => a.traits.iman - a.traits.pride * 0.3 - (b.traits.iman - b.traits.pride * 0.3)
    )[0];
    const highestImanNaib = [...naibates].sort(
      (a, b) => b.traits.iman + b.traits.courage - (a.traits.iman + a.traits.courage)
    )[0];

    setMonteCarloReport({
      runs: simRunsCount,
      survivalRate,
      avgFinalStress,
      powderBottleneckRate,
      mostRebelliousNaib: `${lowestImanNaib.naibName} (${lowestImanNaib.name}) — Иман ${lowestImanNaib.traits.iman}, Гордыня ${lowestImanNaib.traits.pride}`,
      mostRebelliousNaibEn: `${lowestImanNaib.naibNameEn || lowestImanNaib.naibName} (${lowestImanNaib.nameEn || lowestImanNaib.name}) — Iman ${lowestImanNaib.traits.iman}, Pride ${lowestImanNaib.traits.pride}`,
      mostStalwartNaib: `${highestImanNaib.naibName} (${highestImanNaib.name}) — Иман ${highestImanNaib.traits.iman}, Смелость ${highestImanNaib.traits.courage}`,
      mostStalwartNaibEn: `${highestImanNaib.naibNameEn || highestImanNaib.naibName} (${highestImanNaib.nameEn || highestImanNaib.name}) — Iman ${highestImanNaib.traits.iman}, Courage ${highestImanNaib.traits.courage}`,
      recommendedBalanceNote:
        survivalRate >= 70
          ? 'Высокая устойчивость государства: логистика пороха и Кодекс Низамов надёжно компенсируют натиск Кавказского корпуса.'
          : survivalRate >= 45
          ? 'Острый исторический баланс: исход кампании решается своевременной отправкой гонцов в осаждённые аулы и подрывом вражеских сап.'
          : 'Критическая перегрузка (сценарий 1859 г.): рекомендуется утвердить Низам о пороховых мельницах и созвать Совет учёных Диван-ханы.',
      recommendedBalanceNoteEn:
        survivalRate >= 70
          ? 'High state resilience: gunpowder logistics and the Nizam Code reliably counter the Separate Caucasian Corps offensive.'
          : survivalRate >= 45
          ? 'Razor-sharp historical balance: campaign outcome hinges on timely envoy dispatches to besieged auls and counter-mine blasts.'
          : 'Critical overload (1859 scenario): enact the Powder Mills Nizam and convene the Divan-Khana Council of Scholars immediately.'
    });

    alertMsg(
      lang === 'en'
        ? `Completed ${simRunsCount} AI Monte Carlo campaigns: Imamate survival rate reached ${survivalRate}%.`
        : `Завершён прогон ${simRunsCount} ИИ-партий (Монте-Карло): выживаемость Имамата составила ${survivalRate}%.`
    );
  };

  const handleChooseEpilogueDecision = (chapter, decision) => {
    playHistoricalSound('seal', soundEnabled);
    setEpilogueDecisionsMade((prev) => ({
      ...prev,
      [chapter.id]: decision
    }));
    setResources((prev) => ({
      ...prev,
      authority: Math.min(100, prev.authority + 5)
    }));
    setChronicle((prev) => [
      {
        id: `epilogue-${Date.now()}`,
        turn,
        category: 'diplomacy',
        sender: `Исторический Эпилог (${chapter.period})`,
        senderEn: `Historical Epilogue (${chapter.periodEn || chapter.period})`,
        title: chapter.title,
        titleEn: chapter.titleEn || chapter.title,
        text: `Выбор: «${decision.label}». Исторический итог: ${decision.outcome}`,
        textEn: `Choice: “${decision.labelEn || decision.label}”. Historical outcome: ${decision.outcomeEn || decision.outcome}`
      },
      ...prev
    ]);
  };

  // ============================================================================
  // ДЕЙСТВИЕ 8: АКТИВАЦИЯ ПЕРКОВ ИСТОРИЧЕСКИХ ЛИЧНОСТЕЙ И РАСЧЁТ ГАЗЫРЕЙ / БАЛЛИСТИКИ
  // ============================================================================
  const selectedHistoricalFigure = useMemo(
    () =>
      HISTORICAL_FIGURES_ARCHIVE.find((f) => f.id === selectedFigureId) ||
      HISTORICAL_FIGURES_ARCHIVE[0],
    [selectedFigureId]
  );

  const handleActivateFigurePerk = (figure) => {
    if (activatedFigurePerks.includes(figure.id)) {
      alertMsg(
        lang === 'en'
          ? `Historical trait “${figure.perkTitleEn || figure.perkTitle}” is already active in the campaign!`
          : `Историческая способность «${figure.perkTitle}» уже задействована в кампании!`
      );
      return;
    }
    playHistoricalSound('horn', soundEnabled);
    setActivatedFigurePerks((prev) => [...prev, figure.id]);

    setResources((prev) => ({
      ...prev,
      authority: Math.min(100, prev.authority + figure.bonus.authority),
      gunpowder: prev.gunpowder + figure.bonus.powder,
      silver: prev.silver + figure.bonus.silver
    }));

    setNaibates((prev) =>
      prev.map((n) => ({
        ...n,
        imperialPressure: Math.max(15, n.imperialPressure - 4),
        traits: {
          ...n.traits,
          iman: Math.min(100, n.traits.iman + figure.bonus.imanAll)
        }
      }))
    );

    setChronicle((prev) => [
      {
        id: `fig-perk-${Date.now()}`,
        turn,
        category: 'nizam',
        sender: `Архив личностей (${figure.name})`,
        senderEn: `Historical Figures Archive (${figure.nameEn || figure.name})`,
        title: `Активирован исторический фактор: ${figure.perkTitle}`,
        titleEn: `Historical Factor Activated: ${figure.perkTitleEn || figure.perkTitle}`,
        text: `${figure.perkSummary}. Первоисточник образа: ${figure.archivalSource}.`,
        textEn: `${figure.perkSummaryEn || figure.perkSummary}. Archival portrait source: ${figure.archivalSourceEn || figure.archivalSource}.`
      },
      ...prev
    ]);

    alertMsg(
      lang === 'en'
        ? `Historical figure activated: ${figure.nameEn || figure.name} — ${figure.perkTitleEn || figure.perkTitle}`
        : `В кампанию введён исторический фактор: ${figure.name} — ${figure.perkTitle}`
    );
  };

  // Честная математическая модель расхода 18 нагрудных газырей и горной баллистики
  const ballisticsSimData = useMemo(() => {
    const { gazyrCount, distanceSteps, elevationDeg, slopeDeg, weaponType } = ballisticsConfig;
    const reloadSeconds =
      weaponType === 'crimean_miquelet' ? 28 : weaponType === 'brunswick_stutzer' ? 34 : 42;
    const sustainedFireMinutes = +((gazyrCount * reloadSeconds) / 60).toFixed(1);
    const powderPerSalvoSolotniks = gazyrCount * 1.75; // 1.75 золотника отборного пороха в газыре

    // Проверка попадания в мёртвую зону скального склона
    const deadZoneThreshold = Math.round(slopeDeg * 0.62);
    const inDeadZone = elevationDeg < deadZoneThreshold;
    const hitAccuracy = Math.max(
      12,
      Math.min(
        96,
        Math.round(
          92 -
            distanceSteps * 0.14 +
            (weaponType === 'brunswick_stutzer' ? 14 : 8) -
            (inDeadZone ? 38 : 0)
        )
      )
    );

    return {
      reloadSeconds,
      sustainedFireMinutes,
      powderPerSalvoSolotniks: powderPerSalvoSolotniks.toFixed(1),
      deadZoneThreshold,
      inDeadZone,
      hitAccuracy
    };
  }, [ballisticsConfig]);

  // ============================================================================
  // ДЕЙСТВИЕ 4: ТАКТИЧЕСКИЙ СИМУЛЯТОР (FTacticalBattleContext <-> FTacticalBattleResult + 18 газырей)
  // ============================================================================
  const [tacticalBattleSession, setTacticalBattleSession] = useState({
    naibateId: 'gergebil',
    gazyrCharges: 18,
    maxGazyrCharges: 18,
    expendedPowderPoods: 0,
    capturedPowderPoods: 0,
    capturedSilverRubles: 0,
    garrisonCasualties: 0,
    pressureDropAccum: 0,
    forcedMeleeMode: false
  });
  const [tacticalPaused, setTacticalPaused] = useState(false);
  const [deploymentStance, setDeploymentStance] = useState('high_ridge');
  const [forestStealthPct, setForestStealthPct] = useState(75);
  const [convoyStruckInBattle, setConvoyStruckInBattle] = useState(false);

  // Горячая клавиша Space: Тактическая пауза в 3D-сражениях (как в Total War)
  useEffect(() => {
    const onTacticalKeyDown = (e) => {
      if (e.code !== 'Space') return;
      if (activeTab !== 'siege' && activeTab !== '3d_tactical') return;
      const tag = (e.target?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target?.isContentEditable) return;
      e.preventDefault();
      setTacticalPaused((prev) => !prev);
    };
    window.addEventListener('keydown', onTacticalKeyDown);
    return () => window.removeEventListener('keydown', onTacticalKeyDown);
  }, [activeTab]);

  const activeTacticalNaibate = useMemo(
    () => naibates.find((n) => n.id === tacticalBattleSession.naibateId) || selectedNaibate,
    [naibates, tacticalBattleSession.naibateId, selectedNaibate]
  );

  // ВОЛНА IV (Шаг 1): Динамическое направление главного удара осадного корпуса РИ по дням осады
  const enemyAssaultVector = useMemo(() => {
    const vectors = [
      {
        id: 'mortar_barrage',
        counterSectorId: 'blindage',
        counterLabelRu: 'Блиндажи Хаджи-Юсуфа',
        counterLabelEn: 'Hajji Yusuf Blindages',
        titleRu: 'Навесной огонь пудовых мортир по саклям',
        titleEn: 'Plunging Pood Mortar Barrage on Saklyas',
        descRu: 'Перебросьте резерв муртазеков в подземные блиндажи, чтобы снизить потери вдвое.',
        descEn: 'Deploy Murtazek reserves to subterranean blindages to halve garrison casualties.'
      },
      {
        id: 'sap_mine_push',
        counterSectorId: 'counter_mine',
        counterLabelRu: 'Контр-минная галерея',
        counterLabelEn: 'Counter-Mine Gallery',
        titleRu: 'Проходка минного горна под бастион',
        titleEn: 'Sapper Mine Gallery Push Under Bastion',
        descRu: 'Усильте контр-минную галерею сапёров у медного таза для встречного удара.',
        descEn: 'Reinforce the sapper counter-mine gallery by the copper basin for a counter-strike.'
      },
      {
        id: 'battery_embrasure_duel',
        counterSectorId: 'citadel',
        counterLabelRu: 'Верхний ярус и Башня',
        counterLabelEn: 'Upper Citadel & Tower',
        titleRu: 'Прицельная пальба брешь-батареи по стенам',
        titleEn: 'Direct Breaching Battery Fire on Walls',
        descRu: 'Займите верхний ярус со штуцерами, чтобы выбить канониров у амбразур.',
        descEn: 'Man the upper citadel with rifled flintlocks to pick off battery gunners.'
      },
      {
        id: 'water_spring_storm',
        counterSectorId: 'water_descent',
        counterLabelRu: 'Крытый спуск к р. Койсу',
        counterLabelEn: 'Covered Water Descent',
        titleRu: 'Ночной обход егерей к водному источнику',
        titleEn: 'Jäger Night Flanking Run Toward Water Spring',
        descRu: 'Прикройте крытый каменный спуск к воде сотней кинжальщиков.',
        descEn: 'Guard the covered stone water descent with kindjal shock troops.'
      }
    ];
    return vectors[Math.max(0, (siegeState.day || 1) - 1) % vectors.length];
  }, [siegeState.day]);

  const tacticalModifiers = useMemo(() => {
    const isSupplyCutNow = Boolean(
      convoyStruckInBattle ||
        activeTacticalEncounter?.supplyCut ||
        liveImperialColumns.some((c) => c.supplyCut)
    );
    const activeSecElev = splineSegments[selectedSplineIdx]?.elevation || '';
    const isCounterMatch = Boolean(
      enemyAssaultVector && deployedSector === enemyAssaultVector.counterSectorId
    );
    return computeTacticalModifiers({
      stanceId: deploymentStance,
      stealthPct: forestStealthPct,
      elevationMeters: activeTacticalEncounter?.elevationMeters || 1480,
      sectorElevationLabel: activeSecElev,
      gazyrCharges: tacticalBattleSession.gazyrCharges ?? 18,
      maxGazyrCharges: tacticalBattleSession.maxGazyrCharges || 18,
      garrisonMorale: siegeState.garrisonMorale ?? 84,
      enemyMorale: siegeState.russianMorale ?? 78,
      supplyCut: isSupplyCutNow,
      isNight: dioramaTimeOfDay === 'night',
      isCounterStrike: isCounterMatch,
      fortification: activeTacticalNaibate?.fortification || 3
    });
  }, [
    convoyStruckInBattle,
    activeTacticalEncounter,
    liveImperialColumns,
    splineSegments,
    selectedSplineIdx,
    enemyAssaultVector,
    deployedSector,
    deploymentStance,
    forestStealthPct,
    tacticalBattleSession.gazyrCharges,
    tacticalBattleSession.maxGazyrCharges,
    siegeState.garrisonMorale,
    siegeState.russianMorale,
    dioramaTimeOfDay,
    activeTacticalNaibate
  ]);

  const autoResolveForecast = useMemo(() => {
    const isSupplyCutNow = Boolean(
      convoyStruckInBattle ||
        activeTacticalEncounter?.supplyCut ||
        liveImperialColumns.some((c) => c.supplyCut)
    );
    const isCounterMatch = Boolean(
      enemyAssaultVector && deployedSector === enemyAssaultVector.counterSectorId
    );
    return computeAutoResolveForecast({
      tacticalMode,
      stanceId: deploymentStance,
      stealthPct: forestStealthPct,
      elevationMeters: activeTacticalEncounter?.elevationMeters || 1480,
      gazyrCharges: tacticalBattleSession.gazyrCharges ?? 18,
      maxGazyrCharges: tacticalBattleSession.maxGazyrCharges || 18,
      garrisonMorale: siegeState.garrisonMorale ?? 84,
      russianMorale: siegeState.russianMorale ?? 78,
      fortification: activeTacticalNaibate?.fortification || 3,
      supplyCut: isSupplyCutNow,
      pressureDropAccum: tacticalBattleSession.pressureDropAccum || 0,
      capturedPowderPoods: tacticalBattleSession.capturedPowderPoods || 0,
      capturedSilverRubles: tacticalBattleSession.capturedSilverRubles || 0,
      garrisonCasualties: tacticalBattleSession.garrisonCasualties || 0,
      splineSegments,
      splineEchelons,
      battleDoctrine: tacticalBattleSession.battleDoctrine || 'lava_charge',
      isCounterStrike: isCounterMatch,
      isNight: dioramaTimeOfDay === 'night'
    });
  }, [
    convoyStruckInBattle,
    activeTacticalEncounter,
    liveImperialColumns,
    enemyAssaultVector,
    deployedSector,
    tacticalMode,
    deploymentStance,
    forestStealthPct,
    tacticalBattleSession,
    siegeState.garrisonMorale,
    siegeState.russianMorale,
    activeTacticalNaibate,
    splineSegments,
    splineEchelons,
    dioramaTimeOfDay
  ]);

  const handleChangeDeploymentStance = (stanceId) => {
    const stObj = getTacticalStanceById(stanceId);
    setDeploymentStance(stObj.id);
    setForestStealthPct(stObj.stealthBase);
    playHistoricalSound('paper', soundEnabled);
    alertMsg(
      t(
        `Расстановка изменена: ${stObj.icon} ${stObj.ru} (${stObj.shortRu}).`,
        `Deployment changed: ${stObj.icon} ${stObj.en} (${stObj.shortEn}).`
      )
    );
  };

  // Вызов BuildTacticalBattleContext из стратегической карты 10 наибств
  const handleEnterTacticalDiorama = (targetNaibate) => {
    playHistoricalSound('horn', soundEnabled);
    const forestIds = ['benoy', 'shali', 'vedeno', 'karata'];
    const isForest = forestIds.includes(targetNaibate.id);
    setTacticalMode(isForest ? 'forest_spline' : 'milyutin_siege');
    setTacticalPaused(false);
    setConvoyStruckInBattle(false);
    setDeploymentStance(isForest ? 'canopy_stealth' : 'high_ridge');
    setForestStealthPct(isForest ? 100 : 55);
    const localSquadron = liveFieldUnits.find(
      (u) => u.homeNaibateId === targetNaibate.id && u.id !== 'unit_powder_caravan'
    );
    const extraGazyrs = (localSquadron?.gear || []).includes('salpeter_barns') ? 3 : 0;
    setTacticalBattleSession({
      naibateId: targetNaibate.id,
      engagedUnitId: localSquadron?.id || selectedUnitId,
      gazyrCharges: 18 + extraGazyrs,
      maxGazyrCharges: 18 + extraGazyrs,
      expendedPowderPoods: 0,
      capturedPowderPoods: 0,
      capturedSilverRubles: 0,
      garrisonCasualties: 0,
      pressureDropAccum: 0,
      forcedMeleeMode: false
    });
    setTurnActionQuota((prev) => ({
      ...prev,
      tacticalMovesUsed: 0
    }));
    if (!isForest) {
      setSiegeState((prev) => ({
        ...prev,
        aulName: `${targetNaibate.name} (Комендант: ${targetNaibate.naibName})`,
        aulNameEn: `${targetNaibate.nameEn || targetNaibate.name} (Commandant: ${targetNaibate.naibNameEn || targetNaibate.naibName})`,
        russianMorale: Math.max(45, targetNaibate.imperialPressure),
        garrisonMorale: Math.max(70, targetNaibate.traits.courage)
      }));
    }
    setActiveTab('siege');
    setPlaytestTelemetry((prev) => ({
      ...prev,
      dioramasEntered: prev.dioramasEntered + 1
    }));
    alertMsg(
      t(
        `Сформирован FTacticalBattleContext для «${targetNaibate.name}»: заряжено 18/18 нагрудных газырей, запас пороха округа — ${targetNaibate.gunpowder} пуд.`,
        `Built FTacticalBattleContext for “${targetNaibate.nameEn || targetNaibate.name}”: 18/18 chest gazyrs loaded, regional powder reserve — ${targetNaibate.gunpowder} poods.`
      )
    );
  };

  // Пополнение 18 газырей из регионального запаса пороха наибства (UGazyrAmmunitionComponent::ReloadGazyrsFromRegionalSupply)
  const handleReloadGazyrs = () => {
    const availPowder =
      activeTacticalNaibate.gunpowder -
      tacticalBattleSession.expendedPowderPoods +
      tacticalBattleSession.capturedPowderPoods;
    if (availPowder < 4) {
      alertMsg(
        t(
          'Пороховые погреба округа истощены (<4 пуд.)! Остаётся только кинжальный удар в шашки!',
          'Regional powder magazines depleted (<4 poods)! Only shashka and kindjal melee charge remains!'
        )
      );
      return;
    }
    playHistoricalSound('seal', soundEnabled);
    setTacticalBattleSession((prev) => ({
      ...prev,
      gazyrCharges: prev.maxGazyrCharges || 18,
      expendedPowderPoods: prev.expendedPowderPoods + 4,
      forcedMeleeMode: false
    }));
    alertMsg(
      t(
        'Патронташ пополнен до 18/18 газырей из порохового погреба наибства (-4 пуд. пороха).',
        'Chest bandolier replenished to 18/18 gazyrs from the Naibate powder magazine (-4 poods powder).'
      )
    );
  };

  // Передача FTacticalBattleResult обратно в UImamatStrategicSubsystem::ApplyTacticalBattleResult + живой стол карты
  const handleApplyTacticalBattleResult = (autoResolveOverride = null) => {
    const isAuto = Boolean(autoResolveOverride && typeof autoResolveOverride.winOdds === 'number');
    playHistoricalSound('horn', soundEnabled);
    setTacticalPaused(false);
    const avgSplineCohesion =
      splineEchelons.reduce((s, e) => s + e.cohesion, 0) / Math.max(1, splineEchelons.length);
    const isVictory = isAuto
      ? Boolean(autoResolveOverride.isVictory)
      : tacticalBattleSession.pressureDropAccum >= 18 ||
        siegeState.russianMorale <= 48 ||
        avgSplineCohesion <= 52;
    if (isVictory) unlockRelic('relic_safarov_copper_basin');
    const pressureDrop = isAuto
      ? autoResolveOverride.totalPressureDrop
      : isVictory
      ? Math.max(22, tacticalBattleSession.pressureDropAccum)
      : Math.max(8, tacticalBattleSession.pressureDropAccum);
    const finalCapturedPowder = isAuto
      ? autoResolveOverride.totalCapturedPowder
      : tacticalBattleSession.capturedPowderPoods;
    const finalCapturedSilver = isAuto
      ? autoResolveOverride.totalCapturedSilver
      : tacticalBattleSession.capturedSilverRubles;
    const finalCasualties = isAuto
      ? autoResolveOverride.totalGarrisonCasualties
      : tacticalBattleSession.garrisonCasualties;
    const severMapSupplyLine = Boolean(
      convoyStruckInBattle || (isAuto && autoResolveOverride.seversSupplyLine)
    );

    // Отражение исхода тактического боя непосредственно на колоннах РИ и сотнях мюридов на 3D-карте
    const engagedColId =
      tacticalBattleSession.engagedColumnId ||
      activeTacticalEncounter?.columnId ||
      liveImperialColumns.find((c) => c.targetNaibateId === tacticalBattleSession.naibateId)?.id ||
      liveImperialColumns[0]?.id;
    const engagedUnitId =
      tacticalBattleSession.engagedUnitId ||
      activeTacticalEncounter?.unitId ||
      selectedUnitId;
    const mapEnemyLoss = isAuto
      ? autoResolveOverride.estimatedEnemyLoss
      : isVictory
      ? 620 + Math.round(pressureDrop * 9)
      : 280 + Math.round(pressureDrop * 5);
    const mapSaberLoss = Math.max(
      14,
      Math.round((finalCasualties || 35) * (isVictory ? 0.35 : 0.6))
    );

    if (engagedColId) {
      setLiveImperialColumns((prev) =>
        prev.map((col) => {
          if (col.id !== engagedColId) return col;
          const nextBay = Math.max(550, col.bayonets - mapEnemyLoss);
          const nextSupplyCut = Boolean(col.supplyCut || severMapSupplyLine);
          if (isVictory || nextBay <= 1400) {
            const retreatPath = computeTerrainAwarePath(col.x, col.y, col.originX, col.originY);
            return {
              ...col,
              bayonets: nextBay,
              supplyCut: nextSupplyCut,
              status: 'retreating',
              turnMarchBudget: 38,
              waypoints: retreatPath,
              waypointIdx: Math.min(1, retreatPath.length - 1)
            };
          }
          return {
            ...col,
            bayonets: nextBay,
            supplyCut: nextSupplyCut,
            turnMarchBudget: 0
          };
        })
      );
    }

    if (engagedUnitId) {
      setLiveFieldUnits((prev) =>
        prev.map((u) => {
          if (u.id !== engagedUnitId) return u;
          const hosp = sampleHospitalBonusAtPoint(u.x, u.y, fieldHospitals);
          const adjLoss = hosp.inHospitalZone ? Math.max(8, Math.round(mapSaberLoss * 0.6)) : mapSaberLoss;
          return {
            ...u,
            sabers: Math.max(60, (u.sabers ?? 540) - adjLoss),
            vetXp: isVictory ? Math.min(3, (u.vetXp ?? 0) + 1) : u.vetXp ?? 0,
            capturedGuns: isVictory ? (u.capturedGuns || 0) + 1 : u.capturedGuns || 0,
            status: 'arrived',
            waypoints: [],
            orderTitleRu: isVictory
              ? `★ Разбил колонну в ущелье (-${mapEnemyLoss} шт. РИ, +1 единорог)`
              : `Удержал перевал (-${mapEnemyLoss} шт. РИ)`,
            orderTitleEn: isVictory
              ? `★ Routed column in gorge (-${mapEnemyLoss} bay., +1 unicorn)`
              : `Held mountain pass (-${mapEnemyLoss} bay.)`
          };
        })
      );
    }

    const popupX = activeTacticalEncounter?.x || activeTacticalNaibate.coords?.x || 320;
    const popupY = activeTacticalEncounter?.y || activeTacticalNaibate.coords?.y || 210;
    spawnFloatingCombatPopup(
      popupX,
      popupY,
      isVictory ? `★ ПОБЕДА В УЩЕЛЬЕ! -${mapEnemyLoss} шт. РИ` : `⚔️ РУБЕЖ УДЕРЖАН (-${mapEnemyLoss} шт.)`,
      `Трофеи: +${finalCapturedPowder}п пороха, +${finalCapturedSilver}₽${severMapSupplyLine ? ' • ОБОЗ ОТРЕЗАН' : ''}`,
      isVictory ? '#10b981' : '#f59e0b'
    );

    const tacSeasonRu = SEASONS[(turn - 1) % SEASONS.length] || 'Лето 1845 г.';
    const tacSeasonEn = SEASONS_EN[(turn - 1) % SEASONS_EN.length] || 'Summer 1845';
    setLastBattleAfterActionReport({
      id: `aar-tac-${Date.now()}`,
      turn,
      seasonRu: tacSeasonRu,
      seasonEn: tacSeasonEn,
      isVictory,
      modeLabelRu: isAuto
        ? 'Автобой (расчёт Диван-ханы)'
        : tacticalMode === 'forest_spline'
        ? 'Лесная засека в дефиле'
        : 'Инженерная оборона аула',
      modeLabelEn: isAuto
        ? 'Auto-Resolve (Tactical Command)'
        : tacticalMode === 'forest_spline'
        ? 'Forest Defile Ambush'
        : 'Fortified Aul Siege',
      titleRu: isVictory
        ? `Победа у рубежа «${activeTacticalNaibate.name}»`
        : `Упорная оборона «${activeTacticalNaibate.name}»`,
      titleEn: isVictory
        ? `Victory at “${activeTacticalNaibate.nameEn || activeTacticalNaibate.name}”`
        : `Stubborn Defense of “${activeTacticalNaibate.nameEn || activeTacticalNaibate.name}”`,
      commanderRu: activeTacticalNaibate.naibName,
      commanderEn: activeTacticalNaibate.naibNameEn || activeTacticalNaibate.naibName,
      locationRu: activeTacticalNaibate.name,
      locationEn: activeTacticalNaibate.nameEn || activeTacticalNaibate.name,
      enemyLoss: mapEnemyLoss,
      muridLoss: finalCasualties || mapSaberLoss,
      powderGain: finalCapturedPowder,
      silverGain: finalCapturedSilver,
      capturedUnicorn: isVictory
    });

    if (isVictory) {
      setBattleMemorials((prev) => [
        {
          id: `mem-tac-${Date.now()}`,
          turn,
          seasonRu: tacSeasonRu,
          seasonEn: tacSeasonEn,
          x: popupX,
          y: popupY,
          naibateId: tacticalBattleSession.naibateId,
          titleRu: `Разгром штурма у «${activeTacticalNaibate.name}»`,
          titleEn: `Repelled Assault at “${activeTacticalNaibate.nameEn || activeTacticalNaibate.name}”`,
          commanderRu: activeTacticalNaibate.naibName,
          commanderEn: activeTacticalNaibate.naibNameEn || activeTacticalNaibate.naibName,
          enemyLoss: mapEnemyLoss,
          spoilsRu: `+${finalCapturedPowder}п пороха, +${finalCapturedSilver}₽ • Натиск -${pressureDrop}%`,
          spoilsEn: `+${finalCapturedPowder}p powder, +${finalCapturedSilver}r • Press. -${pressureDrop}%`
        },
        ...prev.slice(0, 11)
      ]);
    }

    setActiveTacticalEncounter(null);
    setConvoyStruckInBattle(false);

    setNaibates((prev) =>
      prev.map((n) => {
        if (n.id !== tacticalBattleSession.naibateId) return n;
        const nextPowder = Math.max(
          4,
          n.gunpowder - tacticalBattleSession.expendedPowderPoods + finalCapturedPowder
        );
        const nextPressure = isVictory
          ? Math.max(15, n.imperialPressure - pressureDrop)
          : Math.min(96, n.imperialPressure + 10);
        return {
          ...n,
          gunpowder: nextPowder,
          garrison: Math.max(200, n.garrison - finalCasualties),
          imperialPressure: nextPressure,
          underSiege: isVictory ? nextPressure >= 80 : true,
          traits: {
            ...n.traits,
            iman: Math.min(100, n.traits.iman + (isVictory ? 6 : 0))
          }
        };
      })
    );

    setResources((prev) => ({
      ...prev,
      silver: prev.silver + finalCapturedSilver,
      authority: isVictory ? Math.min(100, prev.authority + 5) : Math.max(15, prev.authority - 4)
    }));

    setChronicle((prev) => [
      {
        id: `tactical-res-${Date.now()}`,
        turn,
        category: 'battle',
        sender: `Полевой штаб наибства «${activeTacticalNaibate.name}» (${activeTacticalNaibate.naibName})`,
        senderEn: `Field HQ of “${activeTacticalNaibate.nameEn || activeTacticalNaibate.name}” (${activeTacticalNaibate.naibNameEn || activeTacticalNaibate.naibName})`,
        title: isVictory
          ? `★ ${isAuto ? 'АВТОБОЙ — ПОБЕДА' : 'ПОБЕДА НА ТАКТИЧЕСКОЙ ДИОРАМЕ'}: Округ «${activeTacticalNaibate.name}» отстоял рубежи!`
          : `Тяжёлый арьергардный бой в округе «${activeTacticalNaibate.name}»`,
        titleEn: isVictory
          ? `★ ${isAuto ? 'AUTO-RESOLVE VICTORY' : 'TACTICAL DIORAMA VICTORY'}: “${activeTacticalNaibate.nameEn || activeTacticalNaibate.name}” Held the Line!`
          : `Fierce Rearguard Engagement in “${activeTacticalNaibate.nameEn || activeTacticalNaibate.name}”`,
        text: `Применён FTacticalBattleResult: израсходовано ${tacticalBattleSession.expendedPowderPoods} пуд. пороха, захвачено в бою +${finalCapturedPowder} пуд. пороха и +${finalCapturedSilver} руб. серебра. Натиск империи снижен на -${pressureDrop}%, потери гарнизона: ${finalCasualties} мюридов.${severMapSupplyLine ? ' Обоз колонны РИ отрезан на 3D-карте!' : ''}`,
        textEn: `FTacticalBattleResult applied: expended ${tacticalBattleSession.expendedPowderPoods} poods of powder, captured +${finalCapturedPowder} poods of powder and +${finalCapturedSilver} silver rubles. Imperial pressure reduced by -${pressureDrop}%, garrison casualties: ${finalCasualties} murids.${severMapSupplyLine ? ' Imperial column supply line severed on the 3D map!' : ''}`
      },
      ...prev
    ]);

    setAdvisorBattleCompleted(true);
    setPlaytestTelemetry((prev) => ({
      ...prev,
      totalPowderCapturedInTactics: prev.totalPowderCapturedInTactics + finalCapturedPowder
    }));
    setActiveTab('map');
    alertMsg(
      isVictory
        ? t(
            `${isAuto ? 'Автобой: Победа!' : 'Победа!'} Натиск на «${activeTacticalNaibate.name}» -${pressureDrop}%, трофеи +${finalCapturedPowder}п пороха, +${finalCapturedSilver}₽.`,
            `${isAuto ? 'Auto-Resolve Victory!' : 'Victory!'} Pressure on “${activeTacticalNaibate.nameEn || activeTacticalNaibate.name}” -${pressureDrop}%, spoils +${finalCapturedPowder}p powder, +${finalCapturedSilver}r.`
          )
        : t(
            'Бой завершён. FTacticalBattleResult передан в Диван-хану.',
            'Battle concluded. FTacticalBattleResult transmitted to Divan-Khana.'
          )
    );
  };

  // Автобой из тактической ставки (Спринт 5 — использует расстановку, высоту, скрытность, 18 газырей и мораль)
  const handleAutoResolveTacticalBattle = () => {
    handleApplyTacticalBattleResult(autoResolveForecast);
  };

  const handleTacticalAction = (actionType, bypassQuota = false) => {
    if (!bypassQuota && turnActionQuota.tacticalMovesUsed >= turnActionQuota.maxTacticalMovesPerTurn) {
      alertMsg(
        t(
          `Боезапас и силы гарнизона на этот ход исчерпаны (${turnActionQuota.maxTacticalMovesPerTurn}/${turnActionQuota.maxTacticalMovesPerTurn} манёвра за ход)! Примените итог боя или завершите ход (Enter).`,
          `Garrison tactical maneuvers exhausted for this turn (${turnActionQuota.maxTacticalMovesPerTurn}/${turnActionQuota.maxTacticalMovesPerTurn} per turn)! Apply battle results or end the turn (Enter).`
        )
      );
      return;
    }
    if (!bypassQuota && actionType === 'sharpshooters' && tacticalBattleSession.gazyrCharges < 3) {
      alertMsg(
        t(
          'Нагрудные газыри пусты (0/18)! Перезарядите газыри из вьюков или идите в кинжальную вылазку!',
          'Chest gazyrs empty (0/18)! Reload gazyrs from powder packs or launch a dagger sortie!'
        )
      );
      return;
    }

    setTurnActionQuota((prev) => ({
      ...prev,
      tacticalMovesUsed: bypassQuota ? prev.tacticalMovesUsed : prev.tacticalMovesUsed + 1
    }));

    playHistoricalSound(actionType === 'night_sortie' ? 'blade' : 'cannon', soundEnabled);
    setStats3D((prev) => ({
      ...prev,
      lastShotEvent: {
        seq: (prev.lastShotEvent?.seq || 0) + 1,
        type: actionType === 'camouflet' ? 'camouflet_3d' : actionType,
        ts: Date.now()
      }
    }));

    const isCounterStrike = Boolean(
      enemyAssaultVector && deployedSector === enemyAssaultVector.counterSectorId
    );
    const curDoctrine = tacticalBattleSession.battleDoctrine || 'lava_charge';
    const docLossMult = curDoctrine === 'ridge_snipers' ? 0.65 : 1;
    const lossMult = tacticalModifiers.casualtyMultiplier * docLossMult;
    const counterDropBonus = (isCounterStrike ? 6 : 0) + (curDoctrine === 'lava_charge' ? 2 : 0);
    const engagedSq = liveFieldUnits.find((u) => u.id === tacticalBattleSession.engagedUnitId);
    const trophyGunBonus = (engagedSq?.capturedGuns || 0) > 0 ? 3 : 0;
    const convoyOutcome =
      actionType === 'convoy_strike'
        ? resolveConvoyStrikeOutcome({
            modifiers: tacticalModifiers,
            battleDoctrine: curDoctrine
          })
        : null;

    setForestStealthPct((prev) =>
      computeNextStealthAfterAction(prev, actionType, deploymentStance)
    );

    if (actionType === 'sharpshooters') {
      const fireScale = tacticalModifiers.fireEffectiveness;
      setTacticalBattleSession((prev) => {
        const nextGazyrs = Math.max(0, prev.gazyrCharges - 3);
        if (nextGazyrs === 0 && prev.gazyrCharges > 0) {
          setPlaytestTelemetry((tp) => ({
            ...tp,
            gazyrDepletionMeleeTriggered: tp.gazyrDepletionMeleeTriggered + 1
          }));
        }
        return {
          ...prev,
          gazyrCharges: nextGazyrs,
          pressureDropAccum:
            prev.pressureDropAccum + Math.round(8 * fireScale) + counterDropBonus + trophyGunBonus,
          garrisonCasualties: prev.garrisonCasualties + Math.max(4, Math.round(12 * lossMult)),
          forcedMeleeMode: nextGazyrs === 0
        };
      });
    } else if (actionType === 'camouflet') {
      setPlaytestTelemetry((tp) => ({
        ...tp,
        camoufletsDetonated: tp.camoufletsDetonated + 1
      }));
      const blindageStanceBonus = deploymentStance === 'blindage_bastion' ? 4 : 0;
      setTacticalBattleSession((prev) => {
        const useFreeMine = Boolean(prev.freeMineAvailable);
        return {
          ...prev,
          freeMineAvailable: false,
          expendedPowderPoods: prev.expendedPowderPoods + (useFreeMine ? 0 : 6),
          pressureDropAccum:
            prev.pressureDropAccum +
            14 +
            blindageStanceBonus +
            counterDropBonus +
            trophyGunBonus +
            (useFreeMine ? 6 : 0),
          garrisonCasualties: prev.garrisonCasualties + Math.max(3, Math.round(8 * lossMult))
        };
      });
    } else if (actionType === 'repair_blindage') {
      setTacticalBattleSession((prev) => ({
        ...prev,
        pressureDropAccum: prev.pressureDropAccum + 6 + counterDropBonus,
        garrisonCasualties: prev.garrisonCasualties + Math.max(4, Math.round(10 * lossMult))
      }));
    } else if (actionType === 'night_sortie') {
      const hasBazalai = (engagedSq?.gear || []).includes('bazalai_daggers');
      const spoilsMult = (curDoctrine === 'lava_charge' ? 1.3 : 1) * tacticalModifiers.spoilsMultiplier;
      setTacticalBattleSession((prev) => ({
        ...prev,
        capturedPowderPoods: prev.capturedPowderPoods + Math.round(14 * spoilsMult),
        capturedSilverRubles: prev.capturedSilverRubles + Math.round(55 * spoilsMult),
        pressureDropAccum:
          prev.pressureDropAccum +
          Math.round(16 * tacticalModifiers.meleeShockEffectiveness) +
          counterDropBonus +
          (hasBazalai ? 4 : 0) +
          (curDoctrine === 'lava_charge' ? 3 : 0),
        garrisonCasualties:
          prev.garrisonCasualties + Math.max(6, Math.round(24 * lossMult * (hasBazalai ? 0.75 : 1)))
      }));
    } else if (actionType === 'convoy_strike' && convoyOutcome) {
      setConvoyStruckInBattle(true);
      setTacticalBattleSession((prev) => ({
        ...prev,
        capturedPowderPoods: prev.capturedPowderPoods + convoyOutcome.powderCaptured,
        capturedSilverRubles: prev.capturedSilverRubles + convoyOutcome.silverCaptured,
        pressureDropAccum: prev.pressureDropAccum + convoyOutcome.pressureDrop + counterDropBonus,
        garrisonCasualties: prev.garrisonCasualties + convoyOutcome.garrisonCasualties
      }));
    }

    setSiegeState((prev) => {
      const nextDay = prev.day + 1;
      let nextWall = prev.wallIntegrity;
      let nextBlindage = prev.blindageLayers;
      let nextMineDist = prev.russianMineDistance;
      let nextCounter = prev.counterMineProgress;
      let nextGarrisonMorale = prev.garrisonMorale;
      let nextRussianMorale = prev.russianMorale;
      let logEntry = '';

      if (actionType === 'camouflet') {
        nextMineDist = Math.min(16, +(prev.russianMineDistance + 5.5).toFixed(1));
        nextCounter = 25;
        nextRussianMorale = Math.max(20, prev.russianMorale - 14);
        logEntry = t(
          `День ${nextDay}-й: ВЗРЫВ ВСТРЕЧНОГО КАМУФЛЕТА (-6 пуд. пороха)! По сигналу медного таза сапёры Хаджи-Юсуфа подорвали пороховой горн под русской минной галереей — подкоп обрушен, сапёры противника отброшены на ${nextMineDist} саж.!`,
          `Day ${nextDay}: COUNTER-MINE CAMOUFLET DETONATED (-6 poods powder)! Guided by Hajji Yusuf’s copper water basin, sappers blew the Russian mine gallery — tunnel collapsed, enemy sappers driven back to ${nextMineDist} sazhens!`
        );
      } else if (actionType === 'repair_blindage') {
        nextBlindage = Math.min(4, prev.blindageLayers + 1);
        nextWall = Math.min(100, prev.wallIntegrity + 8);
        nextMineDist = Math.max(1.5, +(prev.russianMineDistance - 1.1).toFixed(1));
        logEntry = t(
          `День ${nextDay}-й: За ночь защитники уложили новый ряд дубовых брёвен в 4 наката над подземными блиндажами — навесные пудовые бомбы мортир гасятся земляной подушкой!`,
          `Day ${nextDay}: Overnight, defenders laid a new tier of 4-layer oak timber over the subterranean blindages — plunging pood mortar shells are absorbed by the earth cushion!`
        );
      } else if (actionType === 'sharpshooters') {
        nextRussianMorale = Math.max(15, prev.russianMorale - 11);
        nextMineDist = Math.max(1.5, +(prev.russianMineDistance - 0.9).toFixed(1));
        logEntry = t(
          `День ${nextDay}-й: Залп нарезных штуцеров (-3 газыря из нагрудного патронташа) с 3-го яруса саклей подавил прислугу передовой мортирной батареи!`,
          `Day ${nextDay}: Rifled flintlock volley (-3 chest gazyrs) from Tier III saklyas suppressed the forward mortar battery crew!`
        );
      } else if (actionType === 'night_sortie') {
        nextRussianMorale = Math.max(10, prev.russianMorale - 16);
        nextGarrisonMorale = Math.min(100, prev.garrisonMorale + 6);
        nextMineDist = Math.min(16, +(prev.russianMineDistance + 2.2).toFixed(1));
        logEntry = t(
          `День ${nextDay}-й: НОЧНАЯ КИНЖАЛЬНАЯ ВЫЛАЗКА! Сотня мюридов ворвалась в головную сапу, заклепала 2 единорога и захватила трофеи!`,
          `Day ${nextDay}: NIGHT KINDJAL SORTIE! A hundred murids stormed the lead sap, spiked 2 unicorn howitzers, and captured spoils!`
        );
      } else if (actionType === 'convoy_strike' && convoyOutcome) {
        nextRussianMorale = Math.max(10, prev.russianMorale - convoyOutcome.enemyMoraleDrop);
        nextGarrisonMorale = Math.min(100, prev.garrisonMorale + 8);
        logEntry = t(
          `День ${nextDay}-й: 🥖 УДАР ПО СУХАРНОМУ И ПОРОХОВОМУ ОБОЗУ РИ! Сожжены фургоны, захвачено +${convoyOutcome.powderCaptured} пуд. пороха и +${convoyOutcome.silverCaptured}₽ серебра — снабжение колонны на 3D-карте отрезано!`,
          `Day ${nextDay}: 🥖 IMPERIAL CONVOY RAID! Wagons torched, +${convoyOutcome.powderCaptured} poods powder & +${convoyOutcome.silverCaptured}r silver seized — column supply severed on the 3D map!`
        );
      }

      if (isCounterStrike) {
        nextRussianMorale = Math.max(10, nextRussianMorale - 6);
        logEntry =
          t('⚡ [КОНТРУДАР РЕЗЕРВА МУРТАЗЕКОВ: потери вдвое ниже!] ', '⚡ [MURTAZEK COUNTER-STRIKE: casualties halved!] ') +
          logEntry;
      }

      // Если натиск осаждающих сломлен (ниже 25%), снимаем осаду с активного наибства на глобальной карте
      if (nextRussianMorale <= 25 && prev.russianMorale > 25) {
        setNaibates((curr) =>
          curr.map((n) =>
            n.id === tacticalBattleSession.naibateId
              ? { ...n, underSiege: false, imperialPressure: Math.max(20, n.imperialPressure - 25) }
              : n
          )
        );
        setResources((curr) => ({
          ...curr,
          authority: Math.min(100, curr.authority + 8),
          gunpowder: curr.gunpowder + 20
        }));
        logEntry += t(
          ` ★ ОСАДА СЛОМЛЕНА! Округ «${activeTacticalNaibate.name}» деблокирован на стратегической карте (+20 пуд. трофейного пороха, Авторитет +8%)!`,
          ` ★ SIEGE BROKEN! District “${activeTacticalNaibate.nameEn || activeTacticalNaibate.name}” relieved on the strategic map (+20 poods captured powder, Authority +8%)!`
        );
      }

      const vibrationStatus =
        nextMineDist <= 4.5
          ? t(
              `КРИТИЧЕСКАЯ ТРЕВОГА ТАЗА: САПЁРЫ У ФУНДАМЕНТА (${nextMineDist} саж.)!`,
              `CRITICAL BASIN ALARM: ENEMY SAPPERS AT FOUNDATION (${nextMineDist} sazh.)!`
            )
          : t(
              `Колебания воды в медном тазу: подкоп на дистанции ${nextMineDist} саж.`,
              `Copper basin water ripples: enemy mine gallery at ${nextMineDist} sazhens.`
            );

      return {
        ...prev,
        day: nextDay,
        wallIntegrity: nextWall,
        blindageLayers: nextBlindage,
        russianMineDistance: nextMineDist,
        counterMineProgress: nextCounter,
        basinVibration: vibrationStatus,
        basinVibrationEn: undefined,
        garrisonMorale: nextGarrisonMorale,
        russianMorale: nextRussianMorale,
        battleLog: [logEntry, ...prev.battleLog]
      };
    });
  };

  // --- ДЕЙСТВИЯ В РЕЖИМЕ Б: СПЛАЙНОВЫЙ КОРИДОР ЛЕСНОЙ ЗАСАДЫ ---
  const handleSplineAmbushAction = (actionType, bypassQuota = false) => {
    if (!bypassQuota && turnActionQuota.tacticalMovesUsed >= turnActionQuota.maxTacticalMovesPerTurn) {
      alertMsg(
        t(
          `Отряды в лесной засаде уже провели максимум атак в этом ходу (${turnActionQuota.maxTacticalMovesPerTurn}/${turnActionQuota.maxTacticalMovesPerTurn} за ход)! Завершите ход (Enter) или примените итог боя.`,
          `Forest ambush squads have already executed the maximum strikes this turn (${turnActionQuota.maxTacticalMovesPerTurn}/${turnActionQuota.maxTacticalMovesPerTurn} per turn)! End turn (Enter) or apply battle results.`
        )
      );
      return;
    }
    if (!bypassQuota && actionType === 'crossfire' && tacticalBattleSession.gazyrCharges < 3) {
      alertMsg(
        t(
          'Патронташ 18 газырей пуст! Пополните газыри из вьюков (-4 пуд.) или переходите в кинжальную рубку в шашки!',
          '18-gazyr bandolier empty! Replenish gazyrs from powder packs (-4 poods) or charge with shashkas and kindjals!'
        )
      );
      return;
    }

    setTurnActionQuota((prev) => ({
      ...prev,
      tacticalMovesUsed: bypassQuota ? prev.tacticalMovesUsed : prev.tacticalMovesUsed + 1
    }));

    playHistoricalSound(
      actionType === 'dagger_charge' || actionType === 'convoy_strike' ? 'blade' : 'cannon',
      soundEnabled
    );
    setStats3D((prev) => ({
      ...prev,
      lastShotEvent: {
        seq: (prev.lastShotEvent?.seq || 0) + 1,
        type: actionType,
        sectorIdx: selectedSplineIdx,
        ts: Date.now()
      }
    }));
    const seg = splineSegments[selectedSplineIdx];
    const echAtSeg = splineEchelons.find((e) => e.segmentIdx === selectedSplineIdx) || null;
    const nextStep = ambushStep + 1;
    setAmbushStep(nextStep);
    const ambDoc = tacticalBattleSession.battleDoctrine || 'lava_charge';
    const ambLossMult = tacticalModifiers.casualtyMultiplier * (ambDoc === 'ridge_snipers' ? 0.65 : 1);
    const ambSpoilsMult = tacticalModifiers.spoilsMultiplier * (ambDoc === 'lava_charge' ? 1.3 : 1);
    const ambushTag = tacticalModifiers.isAmbushHidden
      ? t('🌿 [ВНЕЗАПНО ИЗ ЧАЩИ ×1.45] ', '🌿 [FOREST AMBUSH ×1.45] ')
      : '';

    setForestStealthPct((prev) =>
      computeNextStealthAfterAction(prev, actionType, deploymentStance)
    );

    if (actionType === 'fell_beeches') {
      setTacticalBattleSession((prev) => {
        const freeBonus = prev.freeMineAvailable ? 5 : 0;
        return {
          ...prev,
          freeMineAvailable: false,
          pressureDropAccum: prev.pressureDropAccum + 7 + freeBonus,
          garrisonCasualties: prev.garrisonCasualties + Math.max(3, Math.round(6 * ambLossMult))
        };
      });
      setSplineSegments((prev) =>
        prev.map((s, idx) =>
          idx === selectedSplineIdx ? { ...s, barricades: Math.min(5, s.barricades + 1) } : s
        )
      );
      setSplineEchelons((prev) =>
        prev.map((ech) =>
          ech.segmentIdx === selectedSplineIdx
            ? { ...ech, cohesion: Math.max(15, ech.cohesion - 14) }
            : Math.abs(ech.segmentIdx - selectedSplineIdx) === 1
            ? { ...ech, cohesion: Math.max(20, ech.cohesion - 5) }
            : ech
        )
      );
      setAmbushLog((prev) => [
        t(
          `Шаг ${nextStep}: На участке «${seg.name}» подрублены и повалены поперёк тропы вековые буки! Колонна разорвана, скрытность мюридов в чаще усилена.`,
          `Step ${nextStep}: Giant beech trees felled across the trail at “${seg.nameEn || seg.name}”! Column severed and forest stealth reinforced.`
        ),
        ...prev
      ]);
    } else if (actionType === 'crossfire') {
      const fireEff = tacticalModifiers.fireEffectiveness;
      const cohLoss = Math.round(18 * tacticalModifiers.ambushShockMult);
      const strLoss = Math.round(135 * fireEff);
      setTacticalBattleSession((prev) => {
        const nextGazyrs = Math.max(0, prev.gazyrCharges - 3);
        return {
          ...prev,
          gazyrCharges: nextGazyrs,
          pressureDropAccum:
            prev.pressureDropAccum + Math.round(9 * fireEff) + (ambDoc === 'ridge_snipers' ? 3 : 0),
          garrisonCasualties: prev.garrisonCasualties + Math.max(4, Math.round(10 * ambLossMult)),
          forcedMeleeMode: nextGazyrs === 0
        };
      });
      setSplineEchelons((prev) =>
        prev.map((ech) =>
          ech.segmentIdx === selectedSplineIdx
            ? {
                ...ech,
                strength: Math.max(120, ech.strength - strLoss),
                cohesion: Math.max(10, ech.cohesion - cohLoss)
              }
            : ech
        )
      );
      setAmbushLog((prev) => [
        ambushTag +
          t(
            `Шаг ${nextStep}: Перекрёстный огонь штуцеров (-3 газыря, высота ×${fireEff}) на участке «${seg.name}»! Потери колонны -${strLoss} шт., строй -${cohLoss}%.`,
            `Step ${nextStep}: Rifled crossfire (-3 gazyrs, high-ground ×${fireEff}) at “${seg.nameEn || seg.name}”! Column lost -${strLoss} bay., cohesion -${cohLoss}%.`
          ),
        ...prev
      ]);
    } else if (actionType === 'dagger_charge') {
      const gainedPowder = Math.round(18 * ambSpoilsMult);
      const gainedSilver = Math.round(65 * ambSpoilsMult);
      const shockMult = tacticalModifiers.meleeShockEffectiveness;
      setTacticalBattleSession((prev) => ({
        ...prev,
        capturedPowderPoods: prev.capturedPowderPoods + gainedPowder,
        capturedSilverRubles: prev.capturedSilverRubles + gainedSilver,
        pressureDropAccum:
          prev.pressureDropAccum + Math.round(15 * shockMult) + (ambDoc === 'lava_charge' ? 4 : 0),
        garrisonCasualties: prev.garrisonCasualties + Math.max(8, Math.round(22 * ambLossMult))
      }));
      setSplineEchelons((prev) => {
        const updated = prev.map((ech) =>
          ech.segmentIdx === selectedSplineIdx
            ? {
                ...ech,
                strength: Math.max(80, ech.strength - Math.round(220 * shockMult)),
                cohesion: Math.max(5, ech.cohesion - Math.round(25 * tacticalModifiers.ambushShockMult)),
                guns: Math.max(0, ech.guns - 1)
              }
            : ech
        );
        const curEch = updated.find((e) => e.segmentIdx === selectedSplineIdx);
        if (curEch && curEch.cohesion <= 22) {
          const nextIntact = updated.find((e) => e.segmentIdx !== selectedSplineIdx && e.cohesion > 25);
          if (nextIntact) setSelectedSplineIdx(nextIntact.segmentIdx);
        }
        return updated;
      });
      setAmbushLog((prev) => [
        ambushTag +
          t(
            `Шаг ${nextStep}: КИНЖАЛЬНЫЙ УДАР ВО ФЛАНГ на участке «${seg.name}»! Захвачены вьюки с порохом (+${gainedPowder} пуд.) и полковая казна (+${gainedSilver} руб.)!`,
            `Step ${nextStep}: FLANKING KINDJAL CHARGE at “${seg.nameEn || seg.name}”! Captured +${gainedPowder} poods powder and +${gainedSilver} rubles regimental treasury!`
          ),
        ...prev
      ]);
    } else if (actionType === 'convoy_strike') {
      const cRes = resolveConvoyStrikeOutcome({
        echelon: echAtSeg,
        barricades: seg?.barricades || 0,
        modifiers: tacticalModifiers,
        battleDoctrine: ambDoc
      });
      setConvoyStruckInBattle(true);
      setTacticalBattleSession((prev) => ({
        ...prev,
        capturedPowderPoods: prev.capturedPowderPoods + cRes.powderCaptured,
        capturedSilverRubles: prev.capturedSilverRubles + cRes.silverCaptured,
        pressureDropAccum: prev.pressureDropAccum + cRes.pressureDrop,
        garrisonCasualties: prev.garrisonCasualties + cRes.garrisonCasualties
      }));
      setSplineEchelons((prev) =>
        prev.map((ech) =>
          ech.segmentIdx === selectedSplineIdx
            ? {
                ...ech,
                strength: Math.max(80, ech.strength - cRes.enemyStrengthLoss),
                cohesion: Math.max(5, ech.cohesion - cRes.cohesionDrop)
              }
            : ech
        )
      );
      setAmbushLog((prev) => [
        ambushTag +
          t(
            `Шаг ${nextStep}: 🥖 УДАР ПО СУХАРНОМУ И ПОРОХОВОМУ ОБОЗУ на участке «${seg.name}»! Фургоны Воронцова разбиты у завала: +${cRes.powderCaptured} пуд. пороха, +${cRes.silverCaptured}₽ серебра, строй -${cRes.cohesionDrop}%, снабжение колонны на 3D-карте ОТРЕЗАНО!`,
            `Step ${nextStep}: 🥖 BISCUIT & POWDER CONVOY STRIKE at “${seg.nameEn || seg.name}”! Vorontsov’s wagons smashed at the abatis: +${cRes.powderCaptured}p powder, +${cRes.silverCaptured}r silver, cohesion -${cRes.cohesionDrop}%, strategic supply SEVERED!`
          ),
        ...prev
      ]);
    }
  };

  const handleResetSplineAmbush = () => {
    setSplineSegments(INITIAL_SPLINE_SEGMENTS);
    setSplineEchelons(INITIAL_SPLINE_ECHELONS);
    setSelectedSplineIdx(1);
    setAmbushStep(1);
    setTurnActionQuota((prev) => ({
      ...prev,
      tacticalMovesUsed: 0
    }));
    setAmbushLog([
      t(
        'Сценарий перезапущен: Колонна генералов Викторова и Пассека вновь начала спуск с хребта Речель через Ичкерийский лес.',
        'Scenario reset: The column of Generals Viktorov and Passek resumed its descent from the Rechel Ridge through the Ichkeria forest.'
      )
    ]);
  };

  // ============================================================================
  // ДЕЙСТВИЕ 5: ПРОИЗВОДСТВО В АРСЕНАЛЕ ВЕДЕНО И КОНТРРАЗВЕДКА ЛАЗУТЧИКОВ
  // ============================================================================
  const handleCraftArsenalItem = (item) => {
    if (turnActionQuota.sealsRemaining <= 0 || turnActionQuota.stateOrdersUsed >= turnActionQuota.maxStateOrdersPerTurn) {
      alertMsg(
        t(
          'Лимит казённых заказов Арсенала Ведено на этот ход исчерпан (1/1 за сезон)! Завершите ход (Enter) для запуска новой плавки.',
          'Vedeno Arsenal state commission limit reached for this turn (1/1 per season)! End turn (Enter) to start a new casting.'
        )
      );
      return;
    }
    if (resources.silver < item.costSilver || resources.gunpowder < item.costPowder) {
      alertMsg(
        t(
          `Недостаточно ресурсов в казне Ведено для проекта «${item.name}»!`,
          `Insufficient resources in the Vedeno treasury for project “${item.nameEn || item.name}”!`
        )
      );
      return;
    }

    setTurnActionQuota((prev) => ({
      ...prev,
      sealsRemaining: Math.max(0, prev.sealsRemaining - 1),
      stateOrdersUsed: prev.stateOrdersUsed + 1
    }));

    playHistoricalSound('blade', soundEnabled);
    unlockRelic('relic_jabrail_unicorn_sight');

    setResources((prev) => ({
      ...prev,
      silver: prev.silver - item.costSilver,
      gunpowder:
        prev.gunpowder -
        item.costPowder +
        (item.id === 'salpeter_barns' ? 55 : item.id === 'vedeno_foundry' ? 25 : 0),
      authority: Math.min(100, prev.authority + 4)
    }));

    setArsenalItems((prev) =>
      prev.map((a) => (a.id === item.id ? { ...a, completedCount: a.completedCount + 1 } : a))
    );

    if (item.id === 'vedeno_foundry') {
      setNaibates((prev) =>
        prev.map((n) => ({
          ...n,
          imperialPressure: Math.max(15, n.imperialPressure - 8)
        }))
      );
    } else if (item.id === 'silver_gazyrs') {
      setNaibates((prev) =>
        prev.map((n) => ({
          ...n,
          traits: {
            ...n.traits,
            courage: Math.min(100, n.traits.courage + 5),
            iman: Math.min(100, n.traits.iman + 4)
          }
        }))
      );
    } else if (item.id === 'bazalai_daggers') {
      setNaibates((prev) =>
        prev.map((n) => ({
          ...n,
          murtazeks: n.murtazeks + 20,
          garrison: n.garrison + 35
        }))
      );
    }

    // ВОЛНА IV (Шаг 2): Партия оружия из Арсенала Ведено напрямую вооружает полевую сотню на 3D-Столе Кавказа
    setLiveFieldUnits((prev) => {
      const recipientId =
        item.id === 'vedeno_foundry'
          ? 'unit_talkhig_artillery'
          : item.id === 'salpeter_barns'
          ? 'unit_baysungur'
          : item.id === 'bazalai_daggers'
          ? 'unit_hadji_murat'
          : selectedUnitId && selectedUnitId !== 'unit_powder_caravan'
          ? selectedUnitId
          : 'unit_chapar_vedeno';
      return prev.map((u) => {
        if (u.id !== recipientId) return u;
        const nextGear = (u.gear || []).includes(item.id) ? u.gear : [...(u.gear || []), item.id];
        return {
          ...u,
          gear: nextGear,
          capturedGuns:
            item.id === 'vedeno_foundry' ? (u.capturedGuns || 0) + 1 : u.capturedGuns || 0,
          sabers: item.id === 'bazalai_daggers' ? (u.sabers ?? 680) + 45 : u.sabers,
          maxSabers: item.id === 'bazalai_daggers' ? (u.maxSabers ?? 680) + 45 : u.maxSabers,
          mp: item.id === 'silver_gazyrs' ? (u.mp ?? 160) + 25 : u.mp,
          maxMp: item.id === 'silver_gazyrs' ? (u.maxMp ?? 160) + 25 : u.maxMp
        };
      });
    });

    setChronicle((prev) => [
      {
        id: `log-ars-${Date.now()}`,
        turn,
        category: 'nizam',
        sender: 'Начальник литейного двора устаз Джабраил и инженер Хаджи-Юсуф',
        senderEn: 'Foundry Master Ustaz Jabrail & Chief Engineer Hajji Yusuf',
        title: `Завершён заказ Арсенала: ${item.name}`,
        titleEn: `Arsenal Commission Completed: ${item.nameEn || item.name}`,
        text: `${item.historicalSpec}. Результат: ${item.effectSummary}.`,
        textEn: `${item.historicalSpecEn || item.historicalSpec}. Outcome: ${item.effectSummaryEn || item.effectSummary}.`
      },
      ...prev
    ]);
  };

  const handleDisruptImperialColumn = () => {
    if (turnActionQuota.sealsRemaining <= 0 || turnActionQuota.stateOrdersUsed >= turnActionQuota.maxStateOrdersPerTurn) {
      alertMsg(
        t(
          'Лимит тайных операций и казённых приказов на этот ход исчерпан (1/1 за сезон)! Завершите ход (Enter).',
          'Covert operation & state order limit reached for this turn (1/1 per season)! End turn (Enter).'
        )
      );
      return;
    }
    if (resources.gunpowder < 18 || resources.silver < 80) {
      alertMsg(
        lang === 'en'
          ? 'Scout sabotage on enemy supply lines requires 18 poods of powder and 80 silver rubles!'
          : 'Для диверсии лазутчиков на коммуникациях врага требуется 18 пуд. пороха и 80 руб. серебром!'
      );
      return;
    }

    setTurnActionQuota((prev) => ({
      ...prev,
      sealsRemaining: Math.max(0, prev.sealsRemaining - 1),
      stateOrdersUsed: prev.stateOrdersUsed + 1
    }));

    playHistoricalSound('cannon', soundEnabled);

    setResources((prev) => ({
      ...prev,
      gunpowder: prev.gunpowder - 18,
      silver: prev.silver - 80,
      authority: Math.min(100, prev.authority + 5)
    }));

    setImperialAi((prev) => ({
      ...prev,
      turnsUntilStrike: prev.turnsUntilStrike + 2,
      columnStrength: Math.max(1800, prev.columnStrength - 950)
    }));

    const activeGen = IMPERIAL_GENERALS[imperialAi.generalIdx];
    setChronicle((prev) => [
      {
        id: `log-sab-${Date.now()}`,
        turn,
        category: 'battle',
        sender: 'Тайная разведка мухтасибов и лазутчиков',
        senderEn: 'Secret Muhtasib & Scout Intelligence',
        title: `Сорвано выдвижение колонны (${activeGen.name})!`,
        titleEn: `Imperial Column Advance Disrupted (${activeGen.nameEn || activeGen.name})!`,
        text: `Лазутчики Шамиля подожгли фуражные склады и взорвали мосты перед авангардом генерала. Наступление противника отложено на +2 хода, численность колонны сократилась на -950 штыков!`,
        textEn: `Shamil’s scouts torched forage depots and blew up bridges ahead of the general’s vanguard. Enemy offensive delayed by +2 turns, column strength reduced by -950 bayonets!`
      },
      ...prev
    ]);
  };

  // ============================================================================
  // ДЕЙСТВИЕ 6: РАЗРЕШЕНИЕ ИСТОРИЧЕСКИХ РАЗВИЛОК И КРИЗИСОВ (1846–1855 ГГ.)
  // ============================================================================
  const handleResolveHistoricalCrisis = (crisis, opt, bypassQuota = false) => {
    if (!crisis || crisis.resolved) return;
    const requiredTurn = crisis.unlockTurn || 1;
    if (!bypassQuota && turn < requiredTurn) {
      alertMsg(
        t(
          `Исторический срок этой развилки («${crisis.year}») ещё не наступил! Событие откроется на Ходу #${requiredTurn} (сейчас Ход #${turn}).`,
          `The historical date of this crossroads (“${crisis.yearEn || crisis.year}”) has not yet arrived! It unlocks on Turn #${requiredTurn} (currently Turn #${turn}).`
        )
      );
      return;
    }
    if (!bypassQuota && turnActionQuota.crisesResolved >= turnActionQuota.maxCrisesPerTurn) {
      alertMsg(
        t(
          'Совет Диван-ханы уже разрешил одну историческую развилку в этом сезоне (лимит: 1 развилка за ход)! Завершите ход (Enter), чтобы перейти к следующему этапу драмы.',
          'The Divan-Khana Council has already resolved one historical crossroads this season (limit: 1 per turn)! End the turn (Enter) to advance to the next stage of the drama.'
        )
      );
      return;
    }
    if (!bypassQuota && turnActionQuota.sealsRemaining <= 0) {
      alertMsg(
        t(
          'Исчерпан лимит Государственных печатей на этот ход (3/3)! Завершите ход (Enter), чтобы скрепить печатью новое решение.',
          'Divan-Khana State Seals exhausted for this turn (3/3)! End the turn (Enter) to seal a new decree.'
        )
      );
      return;
    }
    if (!bypassQuota && opt.powderDelta < 0 && resources.gunpowder < Math.abs(opt.powderDelta)) {
      alertMsg(
        t(
          'Недостаточно пороха в арсенале Ведено для проведения этой операции!',
          'Insufficient gunpowder in the Vedeno Arsenal to execute this operation!'
        )
      );
      return;
    }
    if (!bypassQuota && opt.silverDelta < 0 && resources.silver < Math.abs(opt.silverDelta)) {
      alertMsg(
        t(
          'Недостаточно серебра в казне Байт аль-маль!',
          'Insufficient silver in the Bayt al-Mal treasury!'
        )
      );
      return;
    }

    setTurnActionQuota((prev) => ({
      ...prev,
      sealsRemaining: Math.max(0, prev.sealsRemaining - 1),
      crisesResolved: prev.crisesResolved + 1
    }));

    playHistoricalSound('horn', soundEnabled);

    setCrises((prev) =>
      prev.map((c) =>
        c.id === crisis.id
          ? { ...c, resolved: true, chosenOption: opt.label, chosenOptionEn: opt.labelEn || opt.label }
          : c
      )
    );

    setResources((prev) => ({
      ...prev,
      gunpowder: Math.max(0, prev.gunpowder + (opt.powderDelta || 0)),
      silver: Math.max(0, prev.silver + (opt.silverDelta || 0)),
      provisions: Math.max(0, prev.provisions + (opt.provisionsDelta || 0)),
      authority: Math.min(100, Math.max(10, prev.authority + (opt.authorityDelta || 0)))
    }));

    setNaibates((prev) =>
      prev.map((n) => {
        const isTarget = n.id === opt.targetNaibId;
        const nextNaibName =
          crisis.id === 'crisis_hadji_murat_1851' &&
          opt.id === 'hm_dismiss_strict' &&
          n.id === 'khunzakh'
            ? 'Гази-Мухаммад (врем. наиб Хунзаха)'
            : crisis.id === 'crisis_hadji_murat_1851' &&
                opt.id === 'hm_reconcile_honor' &&
                n.id === 'khunzakh'
              ? 'Хаджи-Мурат Хунзахский (Воевода Конного крыла)'
              : n.naibName;
        return {
          ...n,
          naibName: nextNaibName,
          murtazeks: n.murtazeks + (opt.murtazeksBonus || 0),
          imperialPressure: Math.max(
            15,
            Math.min(95, n.imperialPressure + (isTarget ? opt.pressureDelta : Math.round((opt.pressureDelta || 0) * 0.4)))
          ),
          traits: {
            ...n.traits,
            iman: Math.min(100, n.traits.iman + (isTarget ? opt.imanDelta : 3)),
            pride: Math.max(10, n.traits.pride + (isTarget ? opt.prideDelta : 0))
          }
        };
      })
    );

    // Причинно-следственная синхронизация с Судом, Спорами наибов и Тактическим ТВД
    if (crisis.id === 'crisis_dargo_fire_1845') {
      setSelected3DTerrainId('dargo_1845');
      setTacticalMode('forest_spline');
    } else if (crisis.id === 'crisis_salty_pirogov_1847') {
      setSelected3DTerrainId('salty_1847');
      setTacticalMode('milyutin_siege');
      setSiegeState((prev) => ({
        ...prev,
        aulName: 'Салты (осада 1847 г.)',
        aulNameEn: 'Salty (Siege of 1847)'
      }));
    } else if (crisis.id === 'crisis_chokh_siege_1849') {
      setSelected3DTerrainId('salty_1847');
      setTacticalMode('milyutin_siege');
      setSiegeState((prev) => ({
        ...prev,
        aulName: 'Бастион Чох (осада 1849 г.)',
        aulNameEn: 'Chokh Bastion (Siege of 1849)'
      }));
    } else if (crisis.id === 'crisis_shali_forest_clearing_1850') {
      setSelected3DTerrainId('dargo_1845');
      setTacticalMode('forest_spline');
    } else if (crisis.id === 'crisis_hadji_murat_1851') {
      if (opt.id === 'hm_reconcile_honor') {
        setNaibRivalries((prev) =>
          prev.map((r) =>
            r.id === 'rivalry_khunzakh_teletl' && !r.resolved
              ? {
                  ...r,
                  tension: 15,
                  resolved: true,
                  resolvedOptionId: 'back_hadji_murad',
                  chosenLabelRu: 'Совет в Андии: Хаджи-Мурат утверждён главой конного авангарда',
                  chosenLabelEn: 'Andia Council: Hadji Murad confirmed over the cavalry vanguard'
                }
              : r
          )
        );
        setCourtCases((prev) =>
          prev.map((c) =>
            c.id === 'case_widow_kalym_andi' && !c.resolved
              ? {
                  ...c,
                  resolved: true,
                  chosenResolution:
                    'Примирение в Андии (1851): семья Хаджи-Мурата под почётной защитой Имама в Хунзахе',
                  chosenResolutionEn:
                    'Andia Reconciliation (1851): Hadji Murad’s family placed under the Imam’s honorable protection in Khunzakh'
                }
              : c
          )
        );
      } else if (opt.id === 'hm_dismiss_strict') {
        setNaibRivalries((prev) =>
          prev.map((r) =>
            r.id === 'rivalry_khunzakh_teletl' && !r.resolved
              ? {
                  ...r,
                  tension: 88,
                  resolved: true,
                  resolvedOptionId: 'back_kibit_magoma',
                  chosenLabelRu: 'Совет в Андии: ревизия Кибит-Магомы и смещение Хаджи-Мурата',
                  chosenLabelEn: 'Andia Council: Kibit-Magoma’s audit & dismissal of Hadji Murad'
                }
              : r
          )
        );
      }
    }

    setChronicle((prev) => [
      {
        id: `log-crisis-${Date.now()}`,
        turn,
        category: 'battle',
        sender: `Историческая развилка (${crisis.year})`,
        senderEn: `Historical Crossroads (${crisis.yearEn || crisis.year})`,
        title: `${crisis.title}`,
        titleEn: `${crisis.titleEn || crisis.title}`,
        text: `Принято решение Имама Шамиля: «${opt.label}». Итог: ${opt.effectSummary}.`,
        textEn: `Imam Shamil’s decision: “${opt.labelEn || opt.label}”. Outcome: ${opt.effectSummaryEn || opt.effectSummary}.`
      },
      ...prev
    ]);
  };

  // ============================================================================
  // ИИ-ПОЛКОВОДЕЦ / РЕЖИМ НАБЛЮДАТЕЛЯ (ПОШАГОВОЕ РАЗЫГРЫВАНИЕ 5 АКТОВ ДРАМЫ)
  // ============================================================================
  const handleExecuteNextSpectatorMove = () => {
    const idx = spectatorMode.stepIdx;
    const activeDoctrine =
      AI_SHAMIL_DOCTRINES.find((d) => d.id === spectatorMode.doctrineId) ||
      AI_SHAMIL_DOCTRINES[0];

    // Применяем бонус выбранной доктрины ИИ Шамиля на каждом ходу
    if (activeDoctrine) {
      setResources((prev) => ({
        ...prev,
        gunpowder: prev.gunpowder + (activeDoctrine.powderBonus || 0),
        silver: prev.silver + (activeDoctrine.silverBonus || 0)
      }));
      if (activeDoctrine.pressureReliefBonus) {
        setNaibates((prev) =>
          prev.map((n) => ({
            ...n,
            imperialPressure: Math.max(15, n.imperialPressure - activeDoctrine.pressureReliefBonus)
          }))
        );
      }
    }

    if (idx === 0) {
      setActiveTab('map');
      const dargoCrisis = crises.find((c) => c.id === 'crisis_dargo_fire_1845' && !c.resolved);
      if (dargoCrisis && dargoCrisis.options?.[0]) {
        handleResolveHistoricalCrisis(dargoCrisis, dargoCrisis.options[0], true);
      }
      setSelectedNaibateId('chechnya');
      setAttachedPowder(30);
      handleSendEnvoy();
      setSpectatorMode((prev) => ({
        ...prev,
        active: true,
        stepIdx: 1,
        actLabelRu: 'ХОД 1 • ФАЗА I–II (ИЮНЬ 1845): ПОХОД ВОРОНЦОВА НА ДАРГО',
        actLabelEn: 'TURN 1 • PHASE I–II (JUNE 1845): VORONTSOV’S DARGO EXPEDITION',
        speakerNameRu: 'Имам Шамиль • Ставка в Ведено',
        speakerNameEn: 'Imam Shamil • Vedeno Headquarters',
        speakerPortraitKey: 'Шамиль',
        titleRu: 'Шаг ИИ №1 (Ход 1 • 1845): Решение по Дарго и отправка 30 пудов пороха в Большую Чечню',
        titleEn: 'AI Step #1 (Turn 1 • 1845): Dargo Decision & 30 Poods of Powder to Greater Chechnya',
        descRu:
          '«Двадцатитысячная колонна князя Воронцова вошла в буковые теснины Ичкерии. Мы предали старое Дарго огню, перенесли ставку в Ведено и отправили конного гонца с пороховым обозом наибам Талгику и Байсунгуру!»',
        descEn:
          '“Prince Vorontsov’s 20,000-strong column has entered the beech gorges of Ichkeria. We put old Dargo to the torch, moved HQ to Vedeno, and dispatched a 30-pood powder convoy to Naibs Talkhig and Baysungur!”',
        imperialResponseRu:
          'Штаб в Тифлисе (кн. М. С. Воронцов): Главная колонна заняла покинутое пепелище Дарго, но обоз с сухарями отстал на перевале Речель.',
        imperialResponseEn:
          'Tiflis HQ (Prince Vorontsov): The main column occupied the ashes of Dargo, but the biscuit supply train fell behind at Rechel Pass.'
      }));
      return;
    }

    if (idx === 1) {
      setActiveTab('nizams');
      const nextNizam = nizams.find((n) => !n.enacted && (n.unlockTurn || 1) <= turn);
      if (nextNizam) handleEnactNizam(nextNizam, true);
      const nextCase = courtCases.find((c) => !c.resolved && (c.unlockTurn || 1) <= turn);
      if (nextCase && nextCase.options?.[0]) handleResolveCourtCase(nextCase, nextCase.options[0], true);
      setSpectatorMode((prev) => ({
        ...prev,
        active: true,
        stepIdx: 2,
        actLabelRu: 'ХОД 1 • ФАЗА III (ИЮЛЬ 1845): КОДЕКС НИЗАМА И ТРИБУНАЛ ПО ТРОФЕЯМ',
        actLabelEn: 'TURN 1 • PHASE III (JULY 1845): NIZAM CODE & TROPHY TRIBUNAL',
        speakerNameRu: 'Мудир Кибит-Магома Телетлинский • Верховный суд Диван-ханы',
        speakerNameEn: 'Mudir Kibit-Magoma of Teletl • Supreme Court of Divan-Khana',
        speakerPortraitKey: 'Кибит-Магома',
        titleRu: 'Шаг ИИ №2 (Ход 1 • 1845): Утверждение Низама I ступени и приговор о трофейных пушках',
        titleEn: 'AI Step #2 (Turn 1 • 1845): Enacting Tier I Nizam & Trophy Cannon Verdict',
        descRu:
          '«Государство держится на едином законе и строгой казне Байт аль-Мал. Мы утвердили первоочередной устав Низама и передали захваченные на перевале Речель орудия в государственный артиллерийский парк!»',
        descEn:
          '“A state stands on unified law and a strict Bait al-Mal treasury. We enacted the Tier I Nizam statute and assigned the cannons captured on Rechel Pass to the state artillery park!”',
        imperialResponseRu:
          'Штаб в Тифлисе (ген. Д. В. Пассек): Сформирована «Сухарная оказия» из 4 батальонов для пробития коридора к голодающему лагерю Воронцова.',
        imperialResponseEn:
          'Tiflis HQ (Gen. D. V. Passek): Formed the “Biscuit Convoy” of 4 battalions to force a corridor to Vorontsov’s starving camp.'
      }));
      return;
    }

    if (idx === 2) {
      setActiveTab('siege');
      setSelected3DTerrainId('dargo_1845');
      setTacticalMode('forest_spline');
      handleSplineAmbushAction('dagger_charge', true);
      setSpectatorMode((prev) => ({
        ...prev,
        active: true,
        stepIdx: 3,
        actLabelRu: 'ХОД 1 • ФАЗА IV (ИЮЛЬ 1845): БУКОВЫЙ КАПКАН ИЧКЕРИИ',
        actLabelEn: 'TURN 1 • PHASE IV (JULY 1845): THE BEECH FOREST TRAP OF ICHKERIA',
        speakerNameRu: 'Наиб Байсунгур Беноевский • Засеки Ичкерии',
        speakerNameEn: 'Naib Baysungur of Benoy • Ichkeria Forest Abatis',
        speakerPortraitKey: 'Байсунгур',
        titleRu: 'Шаг ИИ №3 (Ход 1 • 1845): Замыкание засек Дарго и разгром обоза генерала Пассека',
        titleEn: 'AI Step #3 (Turn 1 • 1845): Closing the Dargo Abatis & Routing Gen. Passek’s Convoy',
        descRu:
          '«Мы сдали пустые стены старого Дарго в обмен на гибель их обозов! Мои стрелки рассекли растянутую на 7 вёрст колонну в буковой чаще — сухарные вьюки и зарядные ящики захвачены!»',
        descEn:
          '“We traded the empty walls of old Dargo for the destruction of their supply trains! My riflemen severed the 7-verst column in the beech forest — biscuit packs and caissons are ours!”',
        imperialResponseRu:
          'Штаб в Тифлисе (ген. Р. К. Фрейтаг): Экстренный марш резервов из Грозной к Герзель-Аулу, чтобы спасти остатки колонны Воронцова от полного окружения.',
        imperialResponseEn:
          'Tiflis HQ (Gen. R. K. Freytag): Emergency forced march from Fort Groznaya to Gerzel-Aul to rescue Vorontsov’s remnants from total encirclement.'
      }));
      return;
    }

    if (idx === 3) {
      handleNextTurn();
      setActiveTab('crises');
      const kabardaCrisis =
        crises.find((c) => c.id === 'crisis_kabarda_1846' && !c.resolved) ||
        crises.find((c) => !c.resolved);
      if (kabardaCrisis && kabardaCrisis.options?.[0]) {
        handleResolveHistoricalCrisis(kabardaCrisis, kabardaCrisis.options[0], true);
      }
      const case1846 = courtCases.find((c) => c.id === 'case_parlementaire_klugenau' && !c.resolved);
      if (case1846 && case1846.options?.[0]) {
        handleResolveCourtCase(case1846, case1846.options[0], true);
      }
      setSpectatorMode((prev) => ({
        ...prev,
        active: true,
        stepIdx: 4,
        actLabelRu: 'ХОД 2 (АПРЕЛЬ 1846): ПРОРЫВ ЧЕРЕЗ ТЕРЕК В КАБАРДУ',
        actLabelEn: 'TURN 2 (APRIL 1846): BREAKTHROUGH ACROSS THE TEREK INTO KABARDA',
        speakerNameRu: 'Наиб Хаджи-Мурат Хунзахский • Авангард конницы',
        speakerNameEn: 'Naib Hadji Murad of Khunzakh • Cavalry Vanguard',
        speakerPortraitKey: 'Хаджи-Мурат',
        titleRu: 'Шаг ИИ №4 (Ход 2 • 1846): Историческая развилка 1846 г. — Прорыв за Терек к Татартупу',
        titleEn: 'AI Step #4 (Turn 2 • 1846): 1846 Crossroads — Breakthrough Across the Terek to Tatartup',
        descRu:
          '«Шесть тысяч конных муртазеков и восемь лёгких орудий переправились через Терек под носом у генерала Фрейтага! Военно-Грузинская дорога у Татартупа перерезана, в Тифлисе — тревога!»',
        descEn:
          '“Six thousand mounted Murtazeks and eight light guns crossed the Terek right under General Freytag’s nose! The Georgian Military Road at Tatartup is severed!”',
        imperialResponseRu:
          'Штаб в Тифлисе (ген. Р. К. Фрейтаг): Все летучие отряды Сунженской линии брошены по пятам конницы Шамиля к минарету Татартуп и Нальчику.',
        imperialResponseEn:
          'Tiflis HQ (Gen. R. K. Freytag): All Sunzha Line flying columns are thrown in pursuit of Shamil’s cavalry toward Tatartup Minaret and Nalchik.'
      }));
      return;
    }

    if (idx === 4) {
      handleNextTurn();
      setActiveTab('crises');
      const saltyCrisis =
        crises.find((c) => c.id === 'crisis_salty_pirogov_1847' && !c.resolved) ||
        crises.find((c) => !c.resolved);
      if (saltyCrisis && saltyCrisis.options?.[0]) {
        handleResolveHistoricalCrisis(saltyCrisis, saltyCrisis.options[0], true);
      }
      const case1847 = courtCases.find((c) => c.id === 'case_runaway_gunners_vedeno' && !c.resolved);
      if (case1847 && case1847.options?.[0]) {
        handleResolveCourtCase(case1847, case1847.options[0], true);
      }
      setSpectatorMode((prev) => ({
        ...prev,
        active: true,
        stepIdx: 5,
        actLabelRu: 'ХОД 3 • ФАЗА I–III (АВГУСТ 1847): ЧУГУН ПРОТИВ КАМНЯ В АУЛЕ САЛТЫ',
        actLabelEn: 'TURN 3 • PHASE I–III (AUGUST 1847): CAST IRON VS. STONE AT SALTY',
        speakerNameRu: 'Инженер Хаджи-Юсуф Сафаров • Крепость Салты',
        speakerNameEn: 'Engineer Hajji Yusuf Safarov • Salty Fortress',
        speakerPortraitKey: 'Юсуф-хаджи',
        titleRu: 'Шаг ИИ №5 (Ход 3 • 1847): Осада Салты (1847) — Подземные блиндажи и перемирие с Пироговым',
        titleEn: 'AI Step #5 (Turn 3 • 1847): Siege of Salty (1847) — Subterranean Blindages & Pirogov Truce',
        descRu:
          '«Чугунные бомбы Воронцова увязают в земляных подушках наших казематов, а по ночам мюриды Идриса Гергебильского собирают осколки неразорвавшихся гранат для переплавки в Ведено!»',
        descEn:
          '“Vorontsov’s cast-iron bombs sink harmlessly into the earth cushions of our casemates, while by night Idris of Gergebil’s fighters gather shell fragments to recast at Vedeno!”',
        imperialResponseRu:
          'Штаб в Тифлисе (кн. М. С. Воронцов и хирург Н. И. Пирогов): Осадный парк закладывает минные галереи под южную башню Салты; в полевом лазарете впервые применён эфирный наркоз.',
        imperialResponseEn:
          'Tiflis HQ (Prince Vorontsov & Dr. N. I. Pirogov): Siege park drives mine galleries beneath Salty’s south tower; ether anesthesia used for the first time in the field hospital.'
      }));
      return;
    }

    if (idx === 5) {
      setActiveTab('arsenal');
      handleConcentrateArtilleryFire();
      if (arsenalItems[0]) handleCraftArsenalItem(arsenalItems[0]);
      setSpectatorMode((prev) => ({
        ...prev,
        active: true,
        stepIdx: 6,
        actLabelRu: 'ХОД 3 • ФАЗА IV (СЕНТЯБРЬ 1847): ЛИТЕЙНЫЙ АРСЕНАЛ ВЕДЕНО И БАТАРЕИ САЛТОВ',
        actLabelEn: 'TURN 3 • PHASE IV (SEPTEMBER 1847): VEDENO FOUNDRY & SALTY BATTERIES',
        speakerNameRu: 'Инженер Хаджи-Юсуф Сафаров • Литейный двор Ведено',
        speakerNameEn: 'Engineer Hajji Yusuf Safarov • Vedeno Foundry Yard',
        speakerPortraitKey: 'Юсуф-хаджи',
        titleRu: 'Шаг ИИ №6 (Ход 3 • 1847): Контрбатарейный залп единорогов и заказ литейного двора Ведено',
        titleEn: 'AI Step #6 (Turn 3 • 1847): Mountain Unicorn Counter-Battery Salvo & Vedeno Foundry Order',
        descRu:
          '«Литейный двор в Ведено отлил новую партию горных гранат и пороха. Наши батареи накрыли осадные сапы противника сосредоточенным залпом!»',
        descEn:
          '“The Vedeno foundry cast a fresh batch of mountain shells and powder. Our batteries struck the enemy siege saps with a concentrated salvo!”',
        imperialResponseRu:
          'Штаб в Тифлисе (ген. М. З. Аргутинский-Долгоруков): Дагестанский отряд подтягивает 48 осадных орудий через Турчидаг к неприступной твердыне Чоха.',
        imperialResponseEn:
          'Tiflis HQ (Gen. M. Z. Argutinsky-Dolgorukov): The Dagestan detachment hauls 48 siege guns across Mount Turchidag toward the bastion of Chokh.'
      }));
      return;
    }

    if (idx === 6) {
      handleNextTurn();
      setActiveTab('crises');
      const chokhCrisis =
        crises.find((c) => c.id === 'crisis_chokh_siege_1849' && !c.resolved) ||
        crises.find((c) => !c.resolved);
      if (chokhCrisis && chokhCrisis.options?.[0]) {
        handleResolveHistoricalCrisis(chokhCrisis, chokhCrisis.options[0], true);
      }
      const case1849 = courtCases.find((c) => c.id === 'case_kanly_chokh' && !c.resolved);
      if (case1849 && case1849.options?.[0]) {
        handleResolveCourtCase(case1849, case1849.options[0], true);
      }
      setSpectatorMode((prev) => ({
        ...prev,
        active: true,
        stepIdx: 7,
        actLabelRu: 'ХОД 4 (АВГУСТ 1849): ТРИУМФ ИНЖЕНЕРНОЙ МЫСЛИ У АУЛА ЧОХ',
        actLabelEn: 'TURN 4 (AUGUST 1849): ENGINEERING TRIUMPH AT CHOKH',
        speakerNameRu: 'Генерал Моисей Аргутинский-Долгоруков • Под стенами Чоха',
        speakerNameEn: 'General Moisey Argutinsky-Dolgorukov • Before Chokh Bastions',
        speakerPortraitKey: 'Аргутинский',
        titleRu: 'Шаг ИИ №7 (Ход 4 • 1849): Осада Чоха (1849) — 22 000 ядер разбились о бастионы Сафарова',
        titleEn: 'AI Step #7 (Turn 4 • 1849): Siege of Chokh (1849) — 22,000 Shells Shatter Against Safarov’s Bastions',
        descRu:
          '«После двух месяцев ураганной бомбардировки и неудачного штурма князь Аргутинский-Долгоруков вынужден снять осаду Чоха и отступить! Инженерная школа Имамата одержала историческую победу».',
        descEn:
          '“After two months of bombardment and a failed assault, Prince Argutinsky-Dolgorukov is forced to lift the siege of Chokh and retreat! The Imamate’s engineering school has won a historic triumph.”',
        imperialResponseRu:
          'Штаб в Тифлисе (ген. Н. И. Евдокимов): Отказ от лобовых штурмов каменных аулов — переход к системной зимней рубке широких просек в Большой Чечне.',
        imperialResponseEn:
          'Tiflis HQ (Gen. N. I. Evdokimov): Abandoning frontal assaults on stone auls — shifting to systematic winter clearing of wide forest corridors in Greater Chechnya.'
      }));
      return;
    }

    if (idx === 7) {
      handleNextTurn();
      setActiveTab('crises');
      const shaliCrisis =
        crises.find((c) => c.id === 'crisis_shali_forest_clearing_1850' && !c.resolved) ||
        crises.find((c) => !c.resolved);
      if (shaliCrisis && shaliCrisis.options?.[0]) {
        handleResolveHistoricalCrisis(shaliCrisis, shaliCrisis.options[0], true);
      }
      const case1850 = courtCases.find((c) => c.id === 'case_tobacco_irib' && !c.resolved);
      if (case1850 && case1850.options?.[0]) {
        handleResolveCourtCase(case1850, case1850.options[0], true);
      }
      setSpectatorMode((prev) => ({
        ...prev,
        active: true,
        stepIdx: 8,
        actLabelRu: 'ХОД 5 (ЗИМА 1850): ОТПОР «ВОЙНЕ ТОПОРОМ» НА ШАЛИНСКОЙ ПРОСЕКЕ',
        actLabelEn: 'TURN 5 (WINTER 1850): DEFYING “WAR BY THE AXE” AT THE SHALI CLEARING',
        speakerNameRu: 'Наиб Талгик Шалинский • Окопы вдоль реки Аргун',
        speakerNameEn: 'Naib Talkhig of Shali • Argun River Trenches',
        speakerPortraitKey: 'Талгик',
        titleRu: 'Шаг ИИ №8 (Ход 5 • 1850): Оборона Шалинской просеки — крытые редуты вдоль Аргуна',
        titleEn: 'AI Step #8 (Turn 5 • 1850): Defense of the Shali Clearing — Covered Redoubts Along the Argun',
        descRu:
          '«Против вырубки лесов генералом Евдокимовым мы возвели глубокие крытые окопы и фланговые батареи вдоль Аргуна, сохранив хлебные житницы Большой Чечни!»',
        descEn:
          '“Against General Evdokimov’s forest-felling columns we built deep covered trenches and flanking batteries along the Argun, preserving Greater Chechnya’s granaries!”',
        imperialResponseRu:
          'Штаб в Тифлисе (кн. А. И. Барятинский): Тайные лазутчики засылают письма в Хунзах, пытаясь посеять подозрительность между Шамилем и Хаджи-Муратом.',
        imperialResponseEn:
          'Tiflis HQ (Prince A. I. Baryatinsky): Secret agents plant letters in Khunzakh, seeking to sow suspicion between Shamil and Hadji Murad.'
      }));
      return;
    }

    if (idx === 8) {
      handleNextTurn();
      setActiveTab('crises');
      const hadjiCrisis =
        crises.find((c) => c.id === 'crisis_hadji_murat_1851' && !c.resolved) ||
        crises.find((c) => !c.resolved);
      if (hadjiCrisis && hadjiCrisis.options?.[0]) {
        handleResolveHistoricalCrisis(hadjiCrisis, hadjiCrisis.options[0], true);
      }
      setSpectatorMode((prev) => ({
        ...prev,
        active: true,
        stepIdx: 9,
        actLabelRu: 'ХОД 6 (НОЯБРЬ 1851): СУД И ПРИМИРЕНИЕ С ХАДЖИ-МУРАТОМ В АНДИИ',
        actLabelEn: 'TURN 6 (NOVEMBER 1851): RECONCILIATION WITH HADJI MURAD IN ANDIA',
        speakerNameRu: 'Наиб Хаджи-Мурат Хунзахский • Совет Диван-ханы',
        speakerNameEn: 'Naib Hadji Murad of Khunzakh • Divan-Khana Council',
        speakerPortraitKey: 'Хаджи-Мурат',
        titleRu: 'Шаг ИИ №9 (Ход 6 • 1851): Развилка 1851 г. — Шамиль отвергает наветы и сохраняет за Хаджи-Муратом Хунзах',
        titleEn: 'AI Step #9 (Turn 6 • 1851): 1851 Crossroads — Shamil Rejects Slanders & Confirms Hadji Murad over Khunzakh',
        descRu:
          '«Вопреки интригам завистников на совете в Андии, Имам Шамиль сохранил за Хаджи-Муратом Хунзах и командование конницей. Раскол предотвращён!»',
        descEn:
          '“Defying court intrigues at the Andia council, Imam Shamil confirmed Hadji Murad over Khunzakh and the cavalry wing. The fatal schism is averted!”',
        imperialResponseRu:
          'Штаб в Тифлисе (ген. Н. Н. Муравьёв-Карсский): В связи с началом Восточной (Крымской) войны часть полков переброшена к Карсу; согласие на переговоры на реке Мичик.',
        imperialResponseEn:
          'Tiflis HQ (Gen. N. N. Muravyov-Karsky): With the outbreak of the Crimean War, regiments are shifted toward Kars; Tiflis agrees to prisoner exchange talks on the Michik River.'
      }));
      return;
    }

    if (idx === 9) {
      handleNextTurn();
      setActiveTab('crises');
      const jamalCrisis =
        crises.find((c) => c.id === 'crisis_michik_exchange_1855' && !c.resolved) ||
        crises.find((c) => !c.resolved);
      if (jamalCrisis && jamalCrisis.options?.[0]) {
        handleResolveHistoricalCrisis(jamalCrisis, jamalCrisis.options[0], true);
      }
      setSpectatorMode((prev) => ({
        ...prev,
        active: true,
        stepIdx: 10,
        actLabelRu: 'ХОД 7 (МАРТ 1855): ВОЗВРАЩЕНИЕ СЫНА ДЖЕМАЛУДДИНА НА РЕКЕ МИЧИК',
        actLabelEn: 'TURN 7 (MARCH 1855): SON JAMALUDDIN’S RETURN ON THE MICHIK RIVER',
        speakerNameRu: 'Поручик Джемалуддин Шамилев • Брод на реке Мичик',
        speakerNameEn: 'Lt. Jamaluddin Shamilev • Michik River Ford',
        speakerPortraitKey: 'Шамиль',
        titleRu: 'Шаг ИИ №10 (Ход 7 • 1855): Великий размен на реке Мичик и завершение 7 исторических развилок',
        titleEn: 'AI Step #10 (Turn 7 • 1855): The Great Exchange on the Michik River & Completion of All 7 Crossroads',
        descRu:
          '«Отец, я вернулся к тебе после шестнадцати лет в Петербурге... Все 7 судьбоносных развилок (1845–1855 гг.) пройдены строго последовательно по своим историческим сезонам!»',
        descEn:
          '“Father, I have returned to you after sixteen years in St. Petersburg... All 7 fateful crossroads (1845–1855) have been resolved strictly in their historical seasons!”',
        imperialResponseRu:
          'Штаб в Тифлисе (кн. А. И. Барятинский): После Парижского мира 1856 г. Империя концентрирует резервы на Кавказе, но Имамат встречает бурю во всеоружии.',
        imperialResponseEn:
          'Tiflis HQ (Prince A. I. Baryatinsky): Following the 1856 Treaty of Paris, the Empire concentrates reserves in the Caucasus, but the Imamate meets the storm at full strength.'
      }));
      return;
    }

    // Шаги 10+: непрерывная динамическая игра ИИ-Полководца по сезонам
    const dynamicTabs = ['map', 'nizams', 'siege', 'arsenal', 'chronicle', 'verdict'];
    const targetTab = dynamicTabs[idx % dynamicTabs.length];
    setActiveTab(targetTab);

    if (idx % 2 === 0) {
      handleNextTurn();
    } else {
      const unEnacted = nizams.find((n) => !n.enacted);
      const unResolvedCase = courtCases.find((c) => !c.resolved);
      if (unEnacted) {
        handleEnactNizam(unEnacted);
      } else if (unResolvedCase && unResolvedCase.options?.[0]) {
        handleResolveCourtCase(unResolvedCase, unResolvedCase.options[0]);
      } else if (resources.gunpowder >= 30) {
        handleSendEnvoy();
      } else {
        handleConcentrateArtilleryFire();
      }
    }

    const nextMoveNum = idx + 1;
    const activeGen = IMPERIAL_GENERALS[imperialAi.generalIdx] || IMPERIAL_GENERALS[0];
    setSpectatorMode((prev) => ({
      ...prev,
      active: true,
      stepIdx: nextMoveNum,
      actLabelRu: `ПРОДОЛЖЕНИЕ КАМПАНИИ • ХОД ИИ №${nextMoveNum} (СЕЗОН ${turn})`,
      actLabelEn: `CAMPAIGN CONTINUATION • AI MOVE #${nextMoveNum} (SEASON ${turn})`,
      speakerNameRu: 'Имам Шамиль • Оперативное управление Диван-ханы',
      speakerNameEn: 'Imam Shamil • Divan-Khana Operational Command',
      speakerPortraitKey: 'Шамиль',
      titleRu: `Ход ИИ №${nextMoveNum}: Маневрирование резервами и укрепление обороны (${SEASONS[(turn - 1) % SEASONS.length]})`,
      titleEn: `AI Move #${nextMoveNum}: Reserve Maneuver & Defense Fortification (${SEASONS_EN[(turn - 1) % SEASONS_EN.length]})`,
      descRu:
        '«ИИ-Полководец перераспределил пороховые запасы между наибствами, проверил готовность горных батарей и обновил сводку летописи аль-Карахи».',
      descEn:
        '“The AI Commander redistributed powder reserves across the Naibates, inspected mountain battery readiness, and updated al-Qarakhi’s chronicle.”',
      imperialResponseRu: `Штаб в Тифлисе (${activeGen.name}): Колонна (${imperialAi.columnStrength} шт.) ведёт манёвр по доктрине «${activeGen.doctrineName}» (до удара: ${imperialAi.turnsUntilStrike} х.).`,
      imperialResponseEn: `Tiflis HQ (${activeGen.nameEn || activeGen.name}): Column (${imperialAi.columnStrength} bayonets) maneuvers under doctrine “${activeGen.doctrineNameEn || activeGen.doctrineName}” (${imperialAi.turnsUntilStrike} turns to strike).`
    }));
  };

  executeSpectatorMoveRef.current = handleExecuteNextSpectatorMove;

  useEffect(() => {
    if (!spectatorMode.active || !spectatorMode.autoPlay) return undefined;
    const timerId = setInterval(() => {
      if (executeSpectatorMoveRef.current) {
        executeSpectatorMoveRef.current();
      }
    }, 4500);
    return () => clearInterval(timerId);
  }, [spectatorMode.active, spectatorMode.autoPlay]);

  const handleStartSpectatorCampaign = () => {
    setShowTitleScreen(false);
    setPitchTour((prev) => ({ ...prev, active: false }));
    setSpectatorMode((prev) => ({
      ...prev,
      active: true,
      autoPlay: false
    }));
    setTimeout(() => {
      if (executeSpectatorMoveRef.current) {
        executeSpectatorMoveRef.current();
      }
    }, 120);
  };

  // Применение математической модели альтернативной истории (8 точек бифуркации) к живой кампании
  const handleApplyCounterfactualModel = (cfResult) => {
    playHistoricalSound('seal', soundEnabled);

    setResources((prev) => ({
      ...prev,
      gunpowder: Math.max(40, prev.gunpowder + cfResult.powderDelta),
      silver: Math.max(100, prev.silver + cfResult.silverDelta),
      provisions: Math.max(200, prev.provisions + cfResult.provisionsDelta),
      authority: Math.min(100, Math.max(25, prev.authority + cfResult.authorityDelta)),
      ottomanSupport: Math.min(100, Math.max(10, prev.ottomanSupport + cfResult.ottomanDelta))
    }));

    setNaibates((prev) =>
      prev.map((n) => {
        const isKhunzakh = n.id === 'khunzakh';
        const isShaliOrChechnya = n.id === 'shali' || n.id === 'benoy' || n.id === 'vedeno';
        return {
          ...n,
          garrison: Math.max(150, n.garrison + Math.round(cfResult.troopDelta / 10)),
          murtazeks: Math.max(
            60,
            n.murtazeks + (isKhunzakh && cfResult.activeMap.cf_hadji_murad ? 320 : Math.round(cfResult.cavalryDelta / 10))
          ),
          underSiege: cfResult.survivalProb >= 70 ? false : n.underSiege,
          imperialPressure: Math.max(
            12,
            Math.min(95, n.imperialPressure - cfResult.pressureRelief - (isShaliOrChechnya && cfResult.activeMap.cf_shali_granary ? 8 : 0))
          ),
          traits: {
            ...n.traits,
            iman: Math.min(100, Math.max(30, n.traits.iman + cfResult.obeyBonus)),
            pride: Math.max(10, n.traits.pride - (isKhunzakh && cfResult.activeMap.cf_hadji_murad ? 20 : cfResult.prideDrop))
          }
        };
      })
    );

    setChronicle((prev) => [
      {
        id: `cf-sim-${Date.now()}`,
        turn,
        category: 'diplomacy',
        sender: 'Математическая лаборатория Диван-ханы (Модель Ланчестера — Монте-Карло)',
        senderEn: 'Divan-Khana Mathematical Lab (Lanchester–Monte Carlo Model)',
        title: `📐 Альтернативная ветвь истории: P(Выживание 1859) = ${cfResult.survivalProb}% | P(Мирный трактат) = ${cfResult.treatyProb}%`,
        titleEn: `📐 Counterfactual Timeline Applied: P(Survival 1859) = ${cfResult.survivalProb}% | P(Peace Treaty) = ${cfResult.treatyProb}%`,
        text: `Активировано точек бифуркации: ${cfResult.activeCount}/8 (${cfResult.activeTitlesRu}). Прогноз исхода: ${cfResult.verdictTitleRu}. Порох ${cfResult.powderDelta >= 0 ? `+${cfResult.powderDelta}` : cfResult.powderDelta} пуд., Казна ${cfResult.silverDelta >= 0 ? `+${cfResult.silverDelta}` : cfResult.silverDelta} руб., Натиск РИ -${cfResult.pressureRelief}%.`,
        textEn: `Bifurcations active: ${cfResult.activeCount}/8 (${cfResult.activeTitlesEn}). Projected outcome: ${cfResult.verdictTitleEn}. Powder ${cfResult.powderDelta >= 0 ? `+${cfResult.powderDelta}` : cfResult.powderDelta} poods, Silver ${cfResult.silverDelta >= 0 ? `+${cfResult.silverDelta}` : cfResult.silverDelta} rub., Imperial pressure -${cfResult.pressureRelief}%.`
      },
      ...prev
    ]);

    alertMsg(
      t(
        `⚡ Альтернативная история применена! Вероятность сохранения государства: ${cfResult.survivalProb}% (${cfResult.verdictTitleRu})`,
        `⚡ Counterfactual timeline applied! State survival probability: ${cfResult.survivalProb}% (${cfResult.verdictTitleEn})`
      )
    );
  };

  // Генерация живого кода DataAsset / C++ USTRUCT для экспорта состояния прототипа в Unreal Engine 5
  const unrealEngineExportCode = useMemo(() => {
    if (ueExportFormat === 'json') {
      return JSON.stringify(
        {
          EngineTarget: 'UnrealEngine_5_5_ImamatWargame',
          Turn: turn,
          Season: SEASONS[(turn - 1) % SEASONS.length],
          LeaderState: {
            LeaderName: 'Imam_Shamil',
            TotalStressPercent: leaderStressData.totalStress,
            AuthorityPercent: resources.authority,
            OttomanPorteSupport: resources.ottomanSupport,
            ActiveNizamsCount: campaignAudit.enactedNizamsCount
          },
          BaitAlMalTreasury: {
            GunpowderPoods: resources.gunpowder,
            TerraceProvisions: resources.provisions,
            SilverRubles: resources.silver
          },
          NaibatesGraph: naibates.map((n) => ({
            NaibateID: n.id,
            Name: n.name,
            NaibCommander: n.naibName,
            SlopeDegrees: n.slope,
            TerraceYield: n.terraceYield,
            DjailauPastureOpen: n.pastureAccess,
            GarrisonInfantry: n.garrison,
            MurtazekCavalry: n.murtazeks,
            LocalPowderPoods: n.gunpowder,
            ImperialPressure: n.imperialPressure,
            PsychologyMatrix: n.traits,
            AwardedOrders: n.ordersAwarded
          }))
        },
        null,
        2
      );
    }

    return `// Unreal Engine 5.5 — C++ DataAsset & Mathematical Core Header (ImamatSimCore.h)
#pragma once
#include "CoreMinimal.h"
#include "Engine/DataAsset.h"
#include "ImamatSimCore.generated.h"

USTRUCT(BlueprintType)
struct FNaibPsychologyMatrix
{
    GENERATED_BODY()
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Iman = ${selectedNaibate.traits.iman}.0f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Courage = ${selectedNaibate.traits.courage}.0f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Greed = ${selectedNaibate.traits.greed}.0f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Pride = ${selectedNaibate.traits.pride}.0f;
};

USTRUCT(BlueprintType)
struct FImamatCampaignSnapshot
{
    GENERATED_BODY()
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly) int32 CurrentTurn = ${turn};
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly) float ShamilStressLoad = ${leaderStressData.totalStress}.0f;
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly) int32 CentralGunpowderPoods = ${resources.gunpowder};
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly) int32 BaitAlMalSilverRubles = ${resources.silver};
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly) float SelectedNaibExecProbability = ${orderExecutionCalc.chance}.0f;
};`;
  }, [
    ueExportFormat,
    turn,
    leaderStressData.totalStress,
    resources,
    campaignAudit.enactedNizamsCount,
    naibates,
    selectedNaibate.traits,
    orderExecutionCalc.chance
  ]);

  // Вознаграждение за прохождение 3 шагов вводного пролога «Совет в Ведено»
  const handleClaimPrologueReward = () => {
    if (prologueRewardClaimed) return;
    setPrologueRewardClaimed(true);
    playHistoricalSound('seal', soundEnabled, { volume: audioMixerConfig.masterVolume });
    setResources((prev) => ({
      ...prev,
      gunpowder: prev.gunpowder + 15,
      authority: Math.min(100, prev.authority + 3)
    }));
    setChronicle((prev) => [
      {
        id: `prologue-complete-${Date.now()}`,
        turn,
        category: 'nizam',
        sender: 'Государственный совет Диван-ханы (Дарго-Ведено)',
        senderEn: 'State Council of the Divan-Khana (Dargo-Vedeno)',
        title: 'Вводный совет в Ведено завершён: +15 пуд. пороха и +3% авторитета',
        titleEn: 'Vedeno Opening Council Complete: +15 poods powder & +3% Authority',
        text: 'Разведка кордона, манёвр отрядов и смена сезона освоены. Арсенал Ведено выдал резервную партию пороха.',
        textEn: 'Cordon reconnaissance, squadron maneuver, and season progression mastered. The Vedeno arsenal released reserve powder.'
      },
      ...prev
    ]);
  };

  // Сохранение, загрузка, экспорт и импорт .imamat-save (синхронизировано с C++ UImamatSaveGame — src/game/saveSystem.js)
  const buildCurrentCampaignSnapshot = () =>
    buildCampaignSavePayload(
      {
        turn,
        activeScenarioId,
        simDifficultyWeight,
        resources,
        naibates,
        nizams,
        courtCases,
        crises,
        activeEnvoys,
        imperialAi,
        liveFieldUnits: liveUnitsRef.current || liveFieldUnits,
        liveImperialColumns: liveColumnsRef.current || liveImperialColumns,
        kunakSpyRings,
        signalBeacons,
        riverBridges,
        liveMapFortifications,
        chronicle,
        zulmatClearedCount,
        activatedFigurePerks,
        executedDispatchesIds,
        prologueRewardClaimed,
        heroArcsState,
        episodesState,
        activeEpisodeId,
        capitalNaibateId,
        capitalLabelRu,
        capitalLabelEn,
        imperialHeldIds,
        campaignHistoryLog,
        tacticalBattleSession,
        delayedConsequences,
        resolvedPacketIds
      },
      { seasons: SEASONS, seasonsEn: SEASONS_EN }
    );

  const applyValidatedCampaignData = (data, sourceLabelRu, sourceLabelEn) => {
    if (data.turn) setTurn(data.turn);
    if (data.activeScenarioId) setActiveScenarioId(data.activeScenarioId);
    if (typeof data.simDifficultyWeight === 'number') setSimDifficultyWeight(data.simDifficultyWeight);
    if (data.resources) setResources(data.resources);
    if (data.naibates) setNaibates(data.naibates);
    if (data.nizams) setNizams(data.nizams);
    if (Array.isArray(data.courtCases)) setCourtCases(data.courtCases);
    if (Array.isArray(data.crises)) setCrises(data.crises);
    if (Array.isArray(data.activeEnvoys)) setActiveEnvoys(data.activeEnvoys);
    if (data.imperialAi) setImperialAi(data.imperialAi);
    if (Array.isArray(data.liveFieldUnits)) {
      liveUnitsRef.current = data.liveFieldUnits;
      setLiveFieldUnits(data.liveFieldUnits);
    }
    if (Array.isArray(data.liveImperialColumns)) {
      liveColumnsRef.current = data.liveImperialColumns;
      setLiveImperialColumns(data.liveImperialColumns);
    }
    if (Array.isArray(data.kunakSpyRings)) setKunakSpyRings(data.kunakSpyRings);
    if (Array.isArray(data.signalBeacons)) {
      signalBeaconsRef.current = data.signalBeacons;
      setSignalBeacons(data.signalBeacons);
    }
    if (Array.isArray(data.riverBridges)) {
      riverBridgesRef.current = data.riverBridges;
      setRiverBridges(data.riverBridges);
    }
    if (Array.isArray(data.liveMapFortifications)) {
      liveFortsRef.current = data.liveMapFortifications;
      setLiveMapFortifications(data.liveMapFortifications);
    }
    if (Array.isArray(data.chronicle)) setChronicle(data.chronicle);
    if (typeof data.zulmatClearedCount === 'number') setZulmatClearedCount(data.zulmatClearedCount);
    if (Array.isArray(data.activatedFigurePerks)) setActivatedFigurePerks(data.activatedFigurePerks);
    if (Array.isArray(data.executedDispatchesIds)) setExecutedDispatchesIds(data.executedDispatchesIds);
    if (typeof data.prologueRewardClaimed === 'boolean') setPrologueRewardClaimed(data.prologueRewardClaimed);
    if (data.heroArcsState && typeof data.heroArcsState === 'object') {
      setHeroArcsState(data.heroArcsState);
    }
    if (data.episodesState && typeof data.episodesState === 'object') {
      setEpisodesState(data.episodesState);
    }
    if (typeof data.activeEpisodeId === 'string') setActiveEpisodeId(data.activeEpisodeId);
    if (typeof data.capitalNaibateId === 'string') setCapitalNaibateId(data.capitalNaibateId);
    if (typeof data.capitalLabelRu === 'string') setCapitalLabelRu(data.capitalLabelRu);
    if (typeof data.capitalLabelEn === 'string') setCapitalLabelEn(data.capitalLabelEn);
    if (Array.isArray(data.imperialHeldIds)) setImperialHeldIds(data.imperialHeldIds);
    if (Array.isArray(data.campaignHistoryLog)) setCampaignHistoryLog(data.campaignHistoryLog);
    if (data.tacticalBattleSession) setTacticalBattleSession(data.tacticalBattleSession);
    setDelayedConsequences(Array.isArray(data.delayedConsequences) ? data.delayedConsequences : []);
    if (Array.isArray(data.resolvedPacketIds)) setResolvedPacketIds(data.resolvedPacketIds);
    setActiveTacticalEncounter(null);
    playHistoricalSound('horn', soundEnabled, { volume: audioMixerConfig.masterVolume });
    alertMsg(
      t(
        `Загружен ${sourceLabelRu} (Ход #${data.turn}, сохранено в ${data.savedAt || 'архиве'}).`,
        `Loaded ${sourceLabelEn} (Turn #${data.turn}, saved at ${data.savedAt || 'archive'}).`
      )
    );
  };

  const handleSaveCampaignState = (slotOrEvent = 1) => {
    const slotId =
      typeof slotOrEvent === 'number' || typeof slotOrEvent === 'string' ? slotOrEvent : 1;
    const payload = buildCurrentCampaignSnapshot();
    const res = writeSaveSlot(slotId, payload, { updateLatest: true });
    if (res.ok) {
      setSaveSlotsRefreshTick((v) => v + 1);
      const cloudSlotKey = slotId === 'autosave' ? 'imamat_save_autosave' : `imamat_save_slot_${slotId}`;
      syncSaveToSteamCloud(cloudSlotKey, payload);
      setSteamCloudStatus(loadSteamCloudManifest());
      playHistoricalSound('seal', soundEnabled, { volume: audioMixerConfig.masterVolume });
      alertMsg(
        t(
          `Партия сохранена в Слот #${slotId} UImamatSaveGame (Ход #${turn}, ${payload.savedAt}).`,
          `Campaign saved to UImamatSaveGame Slot #${slotId} (Turn #${turn}, ${payload.savedAt}).`
        )
      );
    } else {
      alertMsg(
        t(
          'Не удалось сохранить состояние партии в локальное хранилище.',
          'Failed to save campaign state to local storage.'
        )
      );
    }
  };

  const handleLoadCampaignState = (slotOrEvent = null) => {
    const slotId =
      typeof slotOrEvent === 'number' || typeof slotOrEvent === 'string' ? slotOrEvent : null;
    const raw = readSaveSlot(slotId);
    if (!raw) {
      alertMsg(
        t(
          'В архиве Диван-ханы пока нет сохранённой партии.',
          'No saved campaign found in the Divan-Khana archive yet.'
        )
      );
      return;
    }
    const parsed = validateAndMigrateSavePayload(raw, {
      initialRiverBridges: INITIAL_RIVER_BRIDGES,
      createInitialHeroArcsState,
      createInitialEpisodesState
    });
    if (!parsed.ok) {
      alertMsg(t(parsed.errorRu, parsed.errorEn));
      return;
    }
    const slotLabelRu = slotId === 'autosave' ? 'Автосейв' : slotId ? `Слот #${slotId}` : 'UImamatSaveGame';
    const slotLabelEn = slotId === 'autosave' ? 'Autosave' : slotId ? `Slot #${slotId}` : 'UImamatSaveGame';
    applyValidatedCampaignData(parsed.data, slotLabelRu, slotLabelEn);
  };

  const handleExportImamatSaveFile = () => {
    const payload = buildCurrentCampaignSnapshot();
    const jsonStr = serializeImamatSaveFile(payload);
    const filename = buildImamatSaveFilename(payload);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    playHistoricalSound('seal', soundEnabled, { volume: audioMixerConfig.masterVolume });
    alertMsg(
      t(
        `Летопись выгружена в переносимый файл ${filename} (Ход #${payload.turn}).`,
        `Chronicle exported to portable file ${filename} (Turn #${payload.turn}).`
      )
    );
  };

  const handleImportImamatSaveFile = async (file) => {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = validateAndMigrateSavePayload(text, {
        initialRiverBridges: INITIAL_RIVER_BRIDGES,
        createInitialHeroArcsState,
        createInitialEpisodesState
      });
      if (!parsed.ok) {
        alertMsg(t(parsed.errorRu, parsed.errorEn));
        return;
      }
      writeSaveSlot(1, parsed.data, { updateLatest: true });
      setSaveSlotsRefreshTick((v) => v + 1);
      applyValidatedCampaignData(parsed.data, `файл ${file.name}`, `file ${file.name}`);
    } catch {
      alertMsg(
        t(
          'Не удалось прочитать выбранный файл сохранения.',
          'Failed to read the selected save file.'
        )
      );
    }
  };

  const handleDownloadUE5SaveJson = () => {
    const payload = {
      schemaVersion: 'UImamatSaveGame_UE5_5_v1',
      campaignSeed: 18450706,
      currentTurn: turn,
      centralGunpowderPoods: resources.gunpowder,
      centralProvisionsMeasures: resources.provisions,
      baitAlMalSilverRubles: resources.silver,
      shamilAuthorityPercent: resources.authority,
      ottomanSupportPercent: resources.ottomanSupport,
      completedKhalwatSessions: zulmatClearedCount,
      imperialAI: imperialAi,
      savedNaibates: naibates,
      savedNizams: nizams,
      savedActiveEnvoys: activeEnvoys
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DivanKhana_Turn${turn}_UE5Save.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    alertMsg(
      t(
        `Экспортирован файл DivanKhana_Turn${turn}_UE5Save.json (формат UImamatSaveGame).`,
        `Exported DivanKhana_Turn${turn}_UE5Save.json (UImamatSaveGame format).`
      )
    );
  };

  // Генерация и скачивание полного JSON-отчёта телеметрии Steam Playtest (ImamatPlaytestSessionTelemetry)
  const buildPlaytestTelemetryPayload = () => {
    const step1Done = nizams.filter((n) => n.enacted).length > 1;
    const step2Done =
      activeEnvoys.length > 0 || chronicle.some((c) => String(c.id).startsWith('envoy-'));
    const step3Done =
      advisorBattleCompleted ||
      tacticalBattleSession.gazyrCharges < 18 ||
      tacticalBattleSession.pressureDropAccum > 0;
    const avgRegionalPowder = +(
      naibates.reduce((s, n) => s + n.gunpowder, 0) / Math.max(1, naibates.length)
    ).toFixed(1);

    return {
      sessionId: playtestTelemetry.sessionId,
      buildVersion: PLAYTEST_BUILD_TAG,
      platform: 'Web_Vite_React_Companion',
      first5TurnsFunnel: {
        completedCount: first5TurnsFunnel.completedCount,
        totalCount: first5TurnsFunnel.totalCount,
        progressPct: first5TurnsFunnel.progressPct,
        reachedTurn5: first5TurnsFunnel.reachedTurn5,
        sessionDurationMin: first5TurnsFunnel.sessionDurationMin
      },
      localFeedbackReportsCount: localFeedbackReports.length,
      scenarioId: activeScenarioId,
      turnsSurvived: turn,
      campaignOutcome:
        campaignAudit.victoryScore >= 60
          ? 'Victory_ImamatPreserved'
          : resources.authority <= 15
          ? 'Defeat_AuthorityCollapse'
          : 'InProgress_ActiveSession',
      onboardingStepsCompleted: {
        step1_NizamEnacted: step1Done,
        step2_PowderConvoySent: step2Done,
        step3_TacticalDioramaResolved: step3Done,
        glossaryOpenedCount: playtestTelemetry.glossaryOpenedCount
      },
      economyTimeline: {
        minVedenoPowderPoods: Math.min(playtestTelemetry.minVedenoPowderPoods, resources.gunpowder),
        finalVedenoPowderPoods: resources.gunpowder,
        finalAvgRegionalPowderPoods: avgRegionalPowder,
        finalSilverRubles: resources.silver,
        zulmatTriggeredCount: playtestTelemetry.zulmatTriggeredCount,
        khalwatPerformedCount: zulmatClearedCount
      },
      ordersSummary: {
        totalEnvoysDispatched: playtestTelemetry.totalEnvoysDispatched,
        convoysByTier: {
          tier0_NoPowder: playtestTelemetry.tier0_NoPowder,
          tier15_LightPack: playtestTelemetry.tier15_LightPack,
          tier30_Reinforced: playtestTelemetry.tier30_Reinforced,
          tier45_HeavyTrain: playtestTelemetry.tier45_HeavyTrain
        },
        envoysInterceptedCount: playtestTelemetry.envoysInterceptedCount,
        naibOrdersObeyedCount: playtestTelemetry.naibOrdersObeyedCount,
        naibOrdersRefusedCount: playtestTelemetry.naibOrdersRefusedCount
      },
      tacticalBattlesSummary: {
        dioramasEntered: playtestTelemetry.dioramasEntered,
        camoufletsDetonated: playtestTelemetry.camoufletsDetonated,
        gazyrDepletionMeleeTriggered: playtestTelemetry.gazyrDepletionMeleeTriggered,
        totalPowderCapturedInTactics: playtestTelemetry.totalPowderCapturedInTactics
      },
      crisesAndCourtSummary: {
        historicalCrisesResolved: crises.filter((c) => c.resolved).length,
        totalHistoricalCrises: crises.length,
        shariaCourtCasesResolved: courtCases.filter((c) => c.resolved).length,
        totalShariaCourtCases: courtCases.length
      }
    };
  };

  const handleDownloadPlaytestTelemetryJson = () => {
    const payload = buildPlaytestTelemetryPayload();
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Imamat_Playtest_Telemetry_Turn${turn}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    alertMsg(
      t(
        `Выгружен отчёт телеметрии плейтеста: Imamat_Playtest_Telemetry_Turn${turn}.json`,
        `Exported playtest telemetry report: Imamat_Playtest_Telemetry_Turn${turn}.json`
      )
    );
  };

  const filteredNizams = useMemo(() => {
    if (selectedPillar === 'all') return nizams;
    return nizams.filter((n) => n.pillar === selectedPillar);
  }, [nizams, selectedPillar]);

  const filteredChronicle = useMemo(() => {
    if (chronicleFilter === 'all') return chronicle;
    return chronicle.filter((c) => c.category === chronicleFilter);
  }, [chronicle, chronicleFilter]);

  // 12 исторических достижений Steamworks (DT_SteamAchievements.json) с живой проверкой условий
  const steamAchievementsStatus = useMemo(() => {
    const step1Done = nizams.filter((n) => n.enacted).length > 1;
    const step2Done =
      activeEnvoys.length > 0 || chronicle.some((c) => String(c.id).startsWith('envoy-'));
    const step3Done =
      advisorBattleCompleted ||
      tacticalBattleSession.gazyrCharges < 18 ||
      tacticalBattleSession.pressureDropAccum > 0;

    return [
      {
        id: 'ACH_BISCUIT_EXPEDITION_1845',
        category: 'Tactical',
        titleRu: 'Сухарная экспедиция 1845',
        titleEn: 'The Biscuit Expedition of 1845',
        descRu: 'Провести бой в тактической диораме или засаду в Ичкерийском лесу на сплайне.',
        descEn: 'Engage in a tactical siege diorama or execute a spline ambush in the Ichkeria forest.',
        sourceRu: 'Глава 13: Даргинский поход Воронцова и разгром колонны Клугенау в Ичкерийском лесу (1845 г.)',
        sourceEn: 'Ch. 13: Vorontsov’s Dargo Expedition & ambush of Klugenau’s column in the Ichkeria forest (1845)',
        globalRatePct: 68.5,
        unlocked: playtestTelemetry.dioramasEntered > 0 || step3Done
      },
      {
        id: 'ACH_COPPER_BASIN_SAFAROV',
        category: 'Tactical',
        titleRu: 'Медный таз Хаджи-Юсуфа',
        titleEn: 'Hajji Yusuf’s Copper Basin',
        descRu: 'Обнаружить сапёрную галерею акустическим пеленгом и подорвать подземный камуфлет.',
        descEn: 'Detect an enemy sap gallery via acoustic copper basin and detonate a subterranean camouflet mine.',
        sourceRu: 'Глава 15: Война осад 1847–1849 гг. (Гергебиль, Салты, Чох) и инженерное искусство Хаджи-Юсуфа Сафарова',
        sourceEn: 'Ch. 15: Siege Warfare 1847–1849 (Gergebil, Salty, Chokh) & Engineer Hajji Yusuf Safarov',
        globalRatePct: 44.2,
        unlocked: playtestTelemetry.camoufletsDetonated > 0 || stats3D.camoufletsDetonated > 0
      },
      {
        id: 'ACH_LAST_GAZYR_SURKHAY',
        category: 'Tactical',
        titleRu: 'Последний газырь на Сурхаевой башне',
        titleEn: 'Last Gazyr on Surkhay’s Tower',
        descRu: 'Израсходовать все 18 нагрудных газырей (0/18) и перейти в кинжальный прорыв сталью Базалая.',
        descEn: 'Deplete all 18 chest gazyrs (0/18) and trigger a fierce Bazalai dagger melee charge.',
        sourceRu: 'Глава 11: Осада Ахульго 1839 г. и героическая оборона Сурхаевой башни мюридами Алибека Хунзахского',
        sourceEn: 'Ch. 11: Siege of Ahulgo (1839) & Alibek of Khunzakh’s defense of Surkhay’s Tower',
        globalRatePct: 55.3,
        unlocked: playtestTelemetry.gazyrDepletionMeleeTriggered > 0 || tacticalBattleSession.gazyrCharges === 0
      },
      {
        id: 'ACH_HEAVY_POWDER_CARAVAN',
        category: 'Logistics',
        titleRu: 'Большой пороховой обоз Ведено',
        titleEn: 'Great Powder Train of Vedeno',
        descRu: 'Снарядить и отправить из арсенала Ведено тяжёлый вьючный караван с 45 пудами пороха.',
        descEn: 'Equip and dispatch a heavy 45-pood gunpowder pack train from the Vedeno arsenal.',
        sourceRu: 'Глава 03: Пороховые мельницы Ведено, Телетля и Гуниба и снабжение осаждённых бастионов',
        sourceEn: 'Ch. 03: Water-powered powder mills of Vedeno, Teletl & Gunib',
        globalRatePct: 47.0,
        unlocked: playtestTelemetry.tier45_HeavyTrain > 0
      },
      {
        id: 'ACH_SHAMIL_CODEX_REFORMER',
        category: 'Governance',
        titleRu: 'Законодатель Диван-ханы',
        titleEn: 'Lawgiver of the Divan-Khana',
        descRu: 'Принять и ввести в действие не менее 3 государственных Низамов Имама Шамиля.',
        descEn: 'Enact at least 3 state Nizam laws in the Divan-Khana council.',
        sourceRu: 'Глава 06: Кодекс Низамов Шамиля — реформа военного, судебного и налогового права',
        sourceEn: 'Ch. 06: Shamil’s Nizam Code — Military, Judicial & Fiscal Reform',
        globalRatePct: 52.0,
        unlocked: nizams.filter((n) => n.enacted).length >= 3
      },
      {
        id: 'ACH_MUHTASIB_PURGE',
        category: 'Governance',
        titleRu: 'Неподкупный Мухтасиб',
        titleEn: 'Incorruptible Muhtasib',
        descRu: 'Разрешить судебную тяжбу между Шариатом и Адатом или направить ревизора в наибство.',
        descEn: 'Adjudicate a Sharia vs. Adat court case or dispatch a state inspector to a Naibate.',
        sourceRu: 'Глава 04 и Глава 06: Институт тайных ревизоров-мухтасибов в государстве Имама Шамиля',
        sourceEn: 'Ch. 04 & Ch. 06: Secret Muhtasib Inspectors in the Imamate',
        globalRatePct: 38.4,
        unlocked: courtCases.some((c) => c.resolved) || playtestTelemetry.totalEnvoysDispatched >= 2
      },
      {
        id: 'ACH_FIVE_SIEGES_CHOKH',
        category: 'Tactical',
        titleRu: 'Неприступный бастион гор',
        titleEn: 'Impregnable Mountain Bastion',
        descRu: 'Снизить имперский натиск в тактической осаде и вернуть победный FTacticalBattleResult на карту.',
        descEn: 'Reduce Imperial siege pressure in the tactical diorama and apply FTacticalBattleResult to the map.',
        sourceRu: 'Глава 15: Оборона аулов Гергебиль, Салты и Чох (1847–1849 гг.)',
        sourceEn: 'Ch. 15: Defense of Gergebil, Salty & Chokh (1847–1849)',
        globalRatePct: 49.0,
        unlocked: advisorBattleCompleted || tacticalBattleSession.pressureDropAccum > 0
      },
      {
        id: 'ACH_SILVER_MEDAL_BORCHALO',
        category: 'Diplomacy',
        titleRu: 'Мастер черни из Борчало',
        titleEn: 'Niello Silversmith of Borchalo',
        descRu: 'Иметь в строю наибов, награждённых минимум 8 серебряными знаками отличия Имамата.',
        descEn: 'Have Naib governors decorated with at least 8 nielloed silver medals of the Imamate.',
        sourceRu: 'Глава 02 и Глава 09: Орденская система Имамата и дипломатия с Блистательной Портой',
        sourceEn: 'Ch. 02 & Ch. 09: Nielloed Silver Medals of the Imamate & Sublime Porte Diplomacy',
        globalRatePct: 34.8,
        unlocked: naibates.reduce((acc, n) => acc + n.ordersAwarded.length, 0) >= 8
      },
      {
        id: 'ACH_AL_QARAKHI_CHRONICLER',
        category: 'Archive',
        titleRu: 'Блеск дагестанских шашек',
        titleEn: 'Shining of Dagestani Sabers',
        descRu: 'Собрать не менее 5 исторических записей в летописи секретаря Мухаммед-Тахира аль-Карахи.',
        descEn: 'Record at least 5 historical entries in Secretary Muhammad-Tahir al-Qarakhi’s Chronicle.',
        sourceRu: 'Глава 10: Хроника Мухаммед-Тахира аль-Карахи «Блеск дагестанских шашек в некоторых шамилевских битвах»',
        sourceEn: 'Ch. 10: Chronicle of Muhammad-Tahir al-Qarakhi',
        globalRatePct: 61.2,
        unlocked: chronicle.length >= 5
      },
      {
        id: 'ACH_NIZAM_WITHOUT_ZULMAT',
        category: 'Mastery',
        titleRu: 'Правление без Зульмата',
        titleEn: 'Rule Without Zulmat',
        descRu: 'Дойти до 3-го хода кампании без единого мятежа «Зульмат» при запасе пороха в Ведено не менее 100 пудов.',
        descEn: 'Reach Turn 3+ of a campaign with zero Zulmat revolts and at least 100 poods of powder in Vedeno.',
        sourceRu: 'Математическая модель UImamatStrategicSubsystem и 4 000 прогонов Монте-Карло',
        sourceEn: 'UImamatStrategicSubsystem Mathematical Model & 4,000-Run Monte Carlo Validation',
        globalRatePct: 22.5,
        unlocked: turn >= 3 && playtestTelemetry.zulmatTriggeredCount === 0 && resources.gunpowder >= 100
      },
      {
        id: 'ACH_ARCHIVAL_SCHOLAR',
        category: 'Archive',
        titleRu: 'Хранитель библиотеки Ведено',
        titleEn: 'Keeper of the Vedeno Library',
        descRu: 'Открыть Толковый словарь Имамата (DT_ImamatGlossary) и изучить исторические термины и формулы.',
        descEn: 'Open the Imamat Historical Glossary (DT_ImamatGlossary) and inspect the archival terms and formulas.',
        sourceRu: 'Глава 08: Судьба казны и уникального собрания арабских рукописей библиотеки Шамиля (1859 г.)',
        sourceEn: 'Ch. 08: Fate of the Treasury & Shamil’s Arabic Manuscript Library (1859)',
        globalRatePct: 78.0,
        unlocked: playtestTelemetry.glossaryOpenedCount > 0 || showGlossaryModal
      },
      {
        id: 'ACH_COUNSEL_COMPLETED',
        category: 'Onboarding',
        titleRu: 'Ученик секретаря аль-Карахи',
        titleEn: 'Disciple of Secretary al-Qarakhi',
        descRu: 'Выполнить все 3 шага интерактивного наставления секретаря аль-Карахи (Низам, Караван, Диорама).',
        descEn: 'Complete all 3 steps of Secretary al-Qarakhi’s Onboarding Counsel (Nizam, Convoy, Siege Diorama).',
        sourceRu: 'Онбординг M4: Первые 3 шага в Диван-хане (KPI 88.0% по когорте плейтеста)',
        sourceEn: 'M4 Onboarding: First 3 Steps in the Divan-Khana (88.0% Cohort KPI)',
        globalRatePct: 88.0,
        unlocked: step1Done && step2Done && step3Done
      }
    ];
  }, [
    nizams,
    activeEnvoys.length,
    chronicle,
    advisorBattleCompleted,
    tacticalBattleSession,
    playtestTelemetry,
    stats3D.camoufletsDetonated,
    courtCases,
    naibates,
    turn,
    resources.gunpowder,
    showGlossaryModal
  ]);

  const unlockedAchievementsCount = useMemo(
    () => steamAchievementsStatus.filter((a) => a.unlocked).length,
    [steamAchievementsStatus]
  );

  // СПРИНТ 11 (Фаза 6): Steamworks Runtime Bridge (Cloud Saves, 12 Achievements, Rich Presence & Overlay)
  const steamRuntimeStatus = useMemo(() => detectSteamRuntimeEnvironment(), []);
  const [steamCloudStatus, setSteamCloudStatus] = useState(() => loadSteamCloudManifest());
  const steamRichPresence = useMemo(
    () =>
      buildSteamRichPresence({
        activeScenarioId,
        turn,
        authority: resources.authority,
        underSiegeCount: naibates.filter((n) => n.underSiege).length,
        activeTab,
        lang
      }),
    [activeScenarioId, turn, resources.authority, naibates, activeTab, lang]
  );

  useEffect(() => {
    syncAchievementsToSteam(steamAchievementsStatus);
  }, [steamAchievementsStatus]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.imamatSteamBridge?.setRichPresence) {
      try {
        window.imamatSteamBridge.setRichPresence(steamRichPresence.steamDisplayKey, steamRichPresence.text);
      } catch {
        // ignore bridge errors outside Steam client
      }
    }
  }, [steamRichPresence]);

  const handleOpenSteamOverlay = (target = 'Achievements') => {
    const res = triggerSteamOverlay(target);
    showNotice(t(res.hintRu, res.hintEn), res.opened ? 'ok' : 'info');
  };

  // СПРИНТ 12 (Фаза 6 / Gate 6): Режим публичного демо Steam Next Fest (Дарго 1845 • 8 ходов + 1 засада)
  const [nextFestDemoMode, setNextFestDemoMode] = useState(() =>
    detectNextFestDemoMode('', steamRuntimeStatus?.appId)
  );
  const [showNextFestOutroModal, setShowNextFestOutroModal] = useState(false);

  const nextFestDemoProgress = useMemo(
    () =>
      evaluateNextFestDemoProgress({
        demoActive: nextFestDemoMode,
        turn,
        ambushCompleted:
          ambushStep > 1 || totalForestAmbushesTriggered > 0 || advisorBattleCompleted,
        envoysSentCount: playtestTelemetry.totalEnvoysDispatched || activeEnvoys.length,
        ordersAwardedCount: naibates.reduce(
          (acc, n) => acc + Math.max(0, (n.ordersAwarded?.length || 0) - 1),
          0
        ),
        resolvedDilemmasCount: resolvedPacketIds.length,
        authority: resources.authority,
        naibates,
        unlockedAchievementsCount
      }),
    [
      nextFestDemoMode,
      turn,
      ambushStep,
      totalForestAmbushesTriggered,
      advisorBattleCompleted,
      playtestTelemetry.totalEnvoysDispatched,
      activeEnvoys.length,
      naibates,
      resolvedPacketIds.length,
      resources.authority,
      unlockedAchievementsCount
    ]
  );

  const handleStartNextFestDemo = () => {
    const dargoScen = CAMPAIGN_SCENARIOS.find((s) => s.id === 'camp_1845') || CAMPAIGN_SCENARIOS[0];
    if (dargoScen) handleSelectScenario(dargoScen);
    setNextFestDemoMode(true);
    setShowNextFestOutroModal(false);
    setShowTitleScreen(false);
    setActiveTab('map');
    showNotice(
      t(
        '🎮 Запущено публичное демо Steam Next Fest: Дарго 1845 (8 ходов + 1 лесная засада в Ичкерии). Прогресс переносится в v1.0!',
        '🎮 Steam Next Fest Playable Demo launched: Dargo 1845 (8 Turns + 1 Ichkeria Forest Ambush). Save carries over to v1.0!'
      ),
      'ok'
    );
  };

  const handleOpenDemoForestAmbush = () => {
    setTacticalMode('forest_spline');
    setActiveTab('siege');
  };

  const handleExportDemoCarryOverSave = () => {
    const basePayload = buildCurrentCampaignSnapshot();
    const carryPayload = tagDemoSaveForFullVersionCarryOver(basePayload);
    const jsonStr = serializeImamatSaveFile(carryPayload);
    const filename = `Imamat_NextFest_Demo_CarryOver_Turn${carryPayload.turn}.imamat-save`;
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    syncSaveToSteamCloud('imamat_nextfest_demo_carryover', carryPayload);
    setSteamCloudStatus(loadSteamCloudManifest());
    showNotice(
      t(
        `💾 Сейв переноса для v1.0 сохранён: ${filename} (синхронизировано с Steam Cloud).`,
        `💾 v1.0 carry-over save exported: ${filename} (synced to Steam Cloud).`
      ),
      'ok'
    );
  };

  const handleContinueFullVersionFromDemo = () => {
    setNextFestDemoMode(false);
    setShowNextFestOutroModal(false);
    showNotice(
      t(
        '🦅 Полная версия v1.0 разблокирована — продолжайте кампанию без лимита 8 ходов!',
        '🦅 Full v1.0 Edition unlocked — continue your campaign beyond Turn 8!'
      ),
      'ok'
    );
  };

  const handleOpenSteamWishlist = () => {
    const overlayRes = triggerSteamOverlay('Store');
    if (overlayRes.opened) {
      showNotice(t(overlayRes.hintRu, overlayRes.hintEn), 'ok');
      return;
    }
    copyTextSafe(NEXT_FEST_DEMO_CONFIG.storeUrl);
    showNotice(
      t(
        `⭐ Ссылка Steam Wishlist скопирована (${NEXT_FEST_DEMO_CONFIG.storeUrl}) — спасибо за поддержку!`,
        `⭐ Steam Wishlist URL copied (${NEXT_FEST_DEMO_CONFIG.storeUrl}) — thank you for your support!`
      ),
      'ok'
    );
  };

  // ===== ИГРОВОЙ ФРОНТ-ЭНД (GameHUD): титульный экран, меню паузы, алерты, подсказки ресурсов, горячие клавиши =====
  const [showTitleScreen, setShowTitleScreen] = useState(true);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const resourceDeltas = useResourceDeltas(resources, turn);

  // ВОЛНА III (Шаг 3): Интерактивный трекер целей эпохи (1839 / 1843 / 1845 / 1859) и провозглашение Триумфа
  const eraObjectivesProgress = useMemo(() => {
    const besiegedCount = naibates.filter((n) => n.underSiege).length;
    const anyColumnBroken = liveImperialColumns.some(
      (c) => c.supplyCut || c.status === 'retreating' || c.bayonets <= 1950
    );
    const anyVetSquadron = liveFieldUnits.some((u) => (u.vetXp ?? 0) >= 3 || (u.capturedGuns || 0) >= 1);

    let items = [];
    if (activeScenarioId === 'camp_1839') {
      items = [
        {
          id: 'akh_1',
          labelRu: 'Удержать Гуниб и Карату от падения',
          labelEn: 'Hold Gunib & Karata from collapse',
          done: naibates
            .filter((n) => n.id === 'gunib' || n.id === 'karata')
            .every((n) => n.imperialPressure < 88)
        },
        {
          id: 'akh_2',
          labelRu: 'Накопить ≥ 155п пороха или захватить орудие',
          labelEn: 'Stock ≥ 155p powder or capture a cannon',
          done: resources.gunpowder >= 155 || anyVetSquadron
        },
        {
          id: 'akh_3',
          labelRu: 'Сбить натиск колонны РИ и продержаться 3+ хода',
          labelEn: 'Break an Imperial column & endure 3+ turns',
          done: turn >= 3 && anyColumnBroken
        }
      ];
    } else if (activeScenarioId === 'camp_1843') {
      items = [
        {
          id: 'av_1',
          labelRu: 'Освободить Аварию и Гергебиль от осад',
          labelEn: 'Keep Avaria & Gergebil free of siege',
          done: naibates
            .filter((n) => n.id === 'khunzakh' || n.id === 'gergebil' || n.id === 'avaria')
            .every((n) => !n.underSiege)
        },
        {
          id: 'av_2',
          labelRu: 'Захватить трофейные единороги РИ или разбить колонну',
          labelEn: 'Capture Imperial unicorns or rout a column',
          done: anyVetSquadron || anyColumnBroken
        },
        {
          id: 'av_3',
          labelRu: 'Удержать Авторитет ≥ 88% к 3+ ходу',
          labelEn: 'Maintain Authority ≥ 88% by Turn 3+',
          done: turn >= 3 && resources.authority >= 88
        }
      ];
    } else if (activeScenarioId === 'camp_1859') {
      items = [
        {
          id: 'gun_1',
          labelRu: 'Удержать Верхний Гуниб и Ведено',
          labelEn: 'Hold Upper Gunib & Vedeno',
          done: naibates
            .filter((n) => n.id === 'gunib' || n.id === 'vedeno')
            .every((n) => n.imperialPressure < 86)
        },
        {
          id: 'gun_2',
          labelRu: 'Перерезать обоз или обратить колонну РИ вспять',
          labelEn: 'Sever supply or drive back an Imperial column',
          done: anyColumnBroken
        },
        {
          id: 'gun_3',
          labelRu: 'Снять осады минимум с 6 из 10 наибств к 3+ ходу',
          labelEn: 'Keep ≥ 6 of 10 Naibates free by Turn 3+',
          done: turn >= 3 && besiegedCount <= 4
        }
      ];
    } else {
      // camp_1845 — Даргинский поход и «Сухарная экспедиция»
      items = [
        {
          id: 'dar_1',
          labelRu: 'Перерезать сухарный обоз или разбить колонну РИ',
          labelEn: 'Sever biscuit convoy or rout an Imperial column',
          done: anyColumnBroken
        },
        {
          id: 'dar_2',
          labelRu: 'Укрепить Ведено (≥ 210п пороха или принят Низам)',
          labelEn: 'Strengthen Vedeno (≥ 210p powder or enact Nizam)',
          done: resources.gunpowder >= 210 || campaignAudit.enactedNizamsCount >= 3
        },
        {
          id: 'dar_3',
          labelRu: 'Удержать ≥ 8 наибств свободными к Ходу 3+',
          labelEn: 'Hold ≥ 8 Naibates free of siege by Turn 3+',
          done: turn >= 3 && besiegedCount <= 2
        }
      ];
    }
    const doneCount = items.filter((i) => i.done).length;
    return {
      items,
      doneCount,
      totalCount: items.length,
      allDone: doneCount === items.length
    };
  }, [
    activeScenarioId,
    naibates,
    liveImperialColumns,
    liveFieldUnits,
    resources.gunpowder,
    resources.authority,
    campaignAudit.enactedNizamsCount,
    turn
  ]);

  const handleProclaimEraTriumph = () => {
    playHistoricalSound('horn', soundEnabled, { volume: audioMixerConfig.masterVolume });
    unlockRelic('relic_alqarakhi_chronicle_inkwell');
    const scen = CAMPAIGN_SCENARIOS.find((s) => s.id === activeScenarioId) || CAMPAIGN_SCENARIOS[2];
    setCampaignClimaxState({
      outcome: 'triumph',
      turn,
      victoryScore: campaignAudit.victoryScore,
      titleRu: `Триумф эпохи: ${scen.yearLabel}`,
      titleEn: `Era Triumph: ${scen.yearLabelEn || scen.yearLabel}`,
      summaryRu: `${scen.goalDesc} Все 3 стратегические задачи эпохи выполнены при индексе устойчивости державы ${campaignAudit.victoryScore}%.`,
      summaryEn: `${scen.goalDescEn || scen.goalDesc} All 3 strategic objectives achieved with State Resilience Score ${campaignAudit.victoryScore}%.`
    });
  };
  const hasActiveStormFront = useMemo(
    () =>
      Boolean(
        weatherOverlayEnabled &&
          liveWeatherFronts.some((wf) => wf.type === 'storm' || wf.type === 'snow')
      ),
    [weatherOverlayEnabled, liveWeatherFronts]
  );
  const totalOrdersAwardedCount = useMemo(
    () => naibates.reduce((s, n) => s + (Array.isArray(n.ordersAwarded) ? n.ordersAwarded.length : 0), 0),
    [naibates]
  );
  const first5TurnsFunnel = useMemo(
    () =>
      computeFirst5TurnsFunnel({
        turn,
        reconActivated: kunakSpyRings.some((r) => r.active) || Boolean(imperialAi?.scouted),
        envoysSentCount: playtestTelemetry.totalEnvoysDispatched + activeEnvoys.length,
        convoyCutOrBattleDone:
          liveImperialColumns.some((c) => c.supplyCut) ||
          playtestTelemetry.dioramasEntered > 0 ||
          advisorBattleCompleted,
        resolvedDilemmasCount: resolvedPacketIds.length,
        enactedNizamsCount: nizams.filter((n) => n.enacted).length,
        ordersAwardedCount: totalOrdersAwardedCount,
        sessionStartMs: sessionStartMsRef.current
      }),
    [
      turn,
      kunakSpyRings,
      imperialAi?.scouted,
      playtestTelemetry.totalEnvoysDispatched,
      playtestTelemetry.dioramasEntered,
      activeEnvoys.length,
      liveImperialColumns,
      advisorBattleCompleted,
      resolvedPacketIds.length,
      nizams,
      totalOrdersAwardedCount
    ]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onErr = (e) => {
      const msg = e?.message || String(e?.error || 'Runtime error');
      setRecentRuntimeErrors((prev) => [...prev.slice(-9), msg]);
    };
    const onRej = (e) => {
      const msg = String(e?.reason || 'Unhandled promise rejection');
      setRecentRuntimeErrors((prev) => [...prev.slice(-9), msg]);
    };
    window.addEventListener('error', onErr);
    window.addEventListener('unhandledrejection', onRej);
    return () => {
      window.removeEventListener('error', onErr);
      window.removeEventListener('unhandledrejection', onRej);
    };
  }, []);

  const handleSavePlaytestFeedback = (snapshot) => {
    const next = saveLocalFeedbackReport(snapshot);
    setLocalFeedbackReports(next);
  };

  const siegesActiveCount = useMemo(
    () => naibates.filter((n) => n.underSiege).length,
    [naibates]
  );
  const movingUnitsCount = useMemo(
    () => liveFieldUnits.filter((u) => Array.isArray(u.waypoints) && u.waypoints.length > 0).length,
    [liveFieldUnits]
  );
  const adaptiveMusicState = useMemo(
    () =>
      resolveAdaptiveMusicState({
        activeTab,
        hasTacticalEncounter: Boolean(activeTacticalEncounter),
        siegesCount: siegesActiveCount,
        activeEnvoysCount: activeEnvoys.length,
        movingUnitsCount,
        imminentStrikeTurns: imperialAi?.turnsUntilStrike ?? 3,
        recentBattlePulse: Boolean(animatedBattleVfx),
        overrideLayer: audioMixerConfig.musicLayerOverride || 'auto'
      }),
    [
      activeTab,
      activeTacticalEncounter,
      siegesActiveCount,
      activeEnvoys.length,
      movingUnitsCount,
      imperialAi?.turnsUntilStrike,
      animatedBattleVfx,
      audioMixerConfig.musicLayerOverride
    ]
  );

  useEffect(() => {
    saveAudioMixerConfig(audioMixerConfig);
    setGlobalAudioMixerState(audioMixerConfig, soundEnabled);
  }, [audioMixerConfig, soundEnabled]);

  useEffect(() => {
    syncCaucasianAmbient({
      enabled: Boolean(soundEnabled && !showTitleScreen),
      activeTab,
      hasStorm: hasActiveStormFront,
      masterVolume: audioMixerConfig.masterVolume,
      ambientVolume: audioMixerConfig.ambientVolume ?? 0.75
    });
  }, [
    soundEnabled,
    showTitleScreen,
    activeTab,
    hasActiveStormFront,
    audioMixerConfig.masterVolume,
    audioMixerConfig.ambientVolume
  ]);

  useEffect(() => {
    syncAdaptiveMusicScore({
      enabled: Boolean(soundEnabled && !showTitleScreen),
      mixerConfig: audioMixerConfig,
      activeTab,
      hasTacticalEncounter: Boolean(activeTacticalEncounter),
      siegesCount: siegesActiveCount,
      activeEnvoysCount: activeEnvoys.length,
      movingUnitsCount,
      imminentStrikeTurns: imperialAi?.turnsUntilStrike ?? 3,
      recentBattlePulse: Boolean(animatedBattleVfx)
    });
  }, [
    soundEnabled,
    showTitleScreen,
    audioMixerConfig,
    activeTab,
    activeTacticalEncounter,
    siegesActiveCount,
    activeEnvoys.length,
    movingUnitsCount,
    imperialAi?.turnsUntilStrike,
    animatedBattleVfx
  ]);

  const saveSlotsMeta = useMemo(() => {
    void saveSlotsRefreshTick;
    return listSaveSlotsMeta(lang);
  }, [saveSlotsRefreshTick, lang]);

  const hasSavedCampaign = useMemo(() => {
    void saveSlotsRefreshTick;
    return hasAnySavedCampaign(saveSlotsMeta);
  }, [saveSlotsRefreshTick, saveSlotsMeta]);

  const saveMetaSummary = useMemo(() => {
    void saveSlotsRefreshTick;
    return getLatestSaveSummary(lang);
  }, [saveSlotsRefreshTick, lang]);
  const fmtMod = (v) => (v > 0 ? `+${v}` : `${v}`);
  const currentMonthShortRu = String(SEASONS[(turn - 1) % SEASONS.length]).split(' (')[0];
  const currentMonthShortEn = String(SEASONS_EN[(turn - 1) % SEASONS_EN.length]).split(' (')[0];

  // Алерты в духе EU4/Stellaris: только то, что требует решения игрока, клик — переход к месту проблемы
  const hudAlerts = (() => {
    const list = [];
    const besieged = naibates.filter((n) => n.underSiege);
    if (besieged.length) {
      list.push({
        id: 'sieges',
        icon: '🏰',
        severity: 'critical',
        count: besieged.length,
        title: t(`Осада наибств: ${besieged.length}`, `Naibates under siege: ${besieged.length}`),
        detail:
          besieged.map((n) => t(n.name, n.nameEn || n.name)).join(' • ') +
          t(' — [[siege|осада]] истощает гарнизон каждый ход.', ' — the [[siege|siege]] drains the garrison every turn.'),
        portrait: {
          src: findPortrait(besieged[0].naibName, besieged[0].id),
          name: t(besieged[0].naibName, besieged[0].naibNameEn || besieged[0].naibName),
          color: '#ef4444'
        },
        action: t('Открыть осаждённое наибство на 3D-Столе', 'Open the besieged naibate on the table'),
        onClick: () => {
          setActiveTab('map');
          setSelectedNaibateId(besieged[0].id);
        }
      });
    }
    if (resources.gunpowder < 120) {
      list.push({
        id: 'powder',
        icon: '🧨',
        severity: resources.gunpowder < 60 ? 'critical' : 'warning',
        title: t('Порох на исходе', 'Powder running low'),
        detail: t(
          `В арсеналах ${resources.gunpowder} пуд. Мельницы Ведено и Телетля могут работать в усиленном режиме.`,
          `${resources.gunpowder} poods left. Vedeno & Teletl mills can be overdriven.`
        ),
        action: t('Перейти в Арсенал Ведено', 'Go to Vedeno Arsenal'),
        onClick: () => setActiveTab('arsenal')
      });
    }
    const openCrises = crises.filter((c) => !c.resolved && turn >= (c.unlockTurn || 1));
    if (openCrises.length) {
      list.push({
        id: 'crises',
        icon: '⚖️',
        severity: 'warning',
        count: openCrises.length,
        title: t(`Нерешённые кризисы: ${openCrises.length}`, `Unresolved crises: ${openCrises.length}`),
        detail: t(openCrises[0].title, openCrises[0].titleEn || openCrises[0].title),
        action: t('Открыть раздел «Кризисы и Лазутчики»', 'Open Crises & Spies'),
        onClick: () => setActiveTab('crises')
      });
    }
    if (leaderStressData.totalStress > 70) {
      list.push({
        id: 'stress',
        icon: '🥀',
        severity: 'warning',
        title: t('Имам перегружен делами', 'The Imam is overburdened'),
        portrait: { src: findPortrait('Шамиль'), name: t('Имам Шамиль', 'Imam Shamil'), color: '#f59e0b' },
        detail: t(
          `[[strain|Нагрузка]] ${leaderStressData.totalStress}%: приказы [[naib|наибам]] исполняются хуже. Передайте часть дел [[divan|Дивану]].`,
          `[[strain|Strain]] ${leaderStressData.totalStress}%: [[naib|naib]] orders are executed worse. Delegate to the [[divan|Divan]].`
        ),
        action: t('Открыть Кодекс Низамов', 'Open the Nizam Code'),
        onClick: () => setActiveTab('nizams')
      });
    }
    if (resources.authority < 55) {
      list.push({
        id: 'authority',
        icon: '👑',
        severity: 'warning',
        title: t('Авторитет Имама падает', 'Imam’s authority is falling'),
        detail: t(`[[authority|Авторитет]] ${resources.authority}%. Риск отпадения [[naibate|наибств]].`, `[[authority|Authority]] ${resources.authority}%. [[naibate|Naibates]] may defect.`),
        portrait: { src: findPortrait('Шамиль'), name: t('Имам Шамиль', 'Imam Shamil'), color: '#38bdf8' },
        action: t('Открыть Суд и Казну', 'Open Court & Treasury'),
        onClick: () => setActiveTab('verdict')
      });
    }
    return list;
  })();

  const anyModalOpen = Boolean(
    showGlossaryModal ||
      showTelemetryModal ||
      showAchievementsModal ||
      showAudioMixerModal ||
      showModBuilderModal ||
      showReplayModal ||
      showFieldManualModal ||
      showTrailerPrevizModal ||
      showMuseumCodexModal ||
      showDispatchesModal ||
      showReleaseHubModal ||
      showPlaytestFeedbackModal ||
      showNextFestOutroModal ||
      activeHeroArcModal ||
      activeEpisodeModal ||
      campaignClimaxState
  );

  const HOTKEY_TABS = ['map', 'nizams', 'diplomacy', 'siege', 'arsenal', 'chronicle', 'crises', 'verdict'];
  useGameHotkeys({
    enabled: !showTitleScreen && !showPauseMenu && !anyModalOpen,
    onEndTurn: () => handleNextTurn(),
    onTab: (n) => {
      const id = HOTKEY_TABS[n - 1];
      if (id) setActiveTab(id);
    },
    onEscape: () => {
      if (showTitleScreen) return;
      setShowHeaderArchiveMenu(false);
      if (anyModalOpen) {
        setShowGlossaryModal(false);
        setShowTelemetryModal(false);
        setShowAchievementsModal(false);
        setShowAudioMixerModal(false);
        setShowModBuilderModal(false);
        setShowReplayModal(false);
        setShowFieldManualModal(false);
        if (showTrailerPrevizModal) {
          setShowTrailerPrevizModal(false);
          setTrailerAutoPlaying(false);
        }
        setShowMuseumCodexModal(false);
        setShowDispatchesModal(false);
        setShowReleaseHubModal(false);
        setShowPlaytestFeedbackModal(false);
        setShowNextFestOutroModal(false);
        setActiveHeroArcModal(null);
        setActiveEpisodeModal(false);
        if (campaignClimaxState) {
          setClimaxDismissed(true);
          setCampaignClimaxState(null);
        }
        return;
      }
      setShowPauseMenu((v) => !v);
    }
  });

  const openSeasonCrisis = crises.find((c) => !c.resolved && (c.unlockTurn || 1) <= turn);
  const openSeasonCourt = courtCases.find((c) => !c.resolved && (c.unlockTurn || 1) <= turn);
  const phase1Done = turnActionQuota.crisesResolved > 0 || !openSeasonCrisis;
  const phase2Done = turnActionQuota.nizamsEnacted > 0 || turnActionQuota.courtCasesResolved > 0;
  const phase3Done = turnActionQuota.envoysSent > 0 || turnActionQuota.stateOrdersUsed > 0;
  const phase4Done = turnActionQuota.tacticalMovesUsed > 0;

  const nextPhaseLabelRu = !phase1Done
    ? '⚖️ Решить кризис'
    : !phase2Done
      ? '📜 Издать низам'
      : !phase3Done
        ? '🐎 Отправить гонца'
        : !phase4Done
          ? '⚔️ К полю боя'
          : '⏭ Ход готов';
  const nextPhaseLabelEn = !phase1Done
    ? '⚖️ Resolve Crisis'
    : !phase2Done
      ? '📜 Enact Nizam'
      : !phase3Done
        ? '🐎 Dispatch Envoy'
        : !phase4Done
          ? '⚔️ Battlefield'
          : '⏭ End Turn';

  const handleAdvanceSequentialPhase = () => {
    if (!phase1Done && openSeasonCrisis) {
      setActiveTab('crises');
      return;
    }
    if (!phase2Done) {
      setActiveTab('nizams');
      return;
    }
    if (!phase3Done) {
      setActiveTab('map');
      return;
    }
    if (!phase4Done) {
      setActiveTab('siege');
      return;
    }
    handleNextTurn();
  };

  return (
    <HudLangContext.Provider value={t}>
    <div className="hud-safe-screen min-h-screen bg-[#0c0e12] text-stone-100 font-sans pb-8">
      {/* КОМПАКТНАЯ ДВУХСТРОЧНАЯ СТРАТЕГИЧЕСКАЯ ШАПКА ДИВАН-ХАНЫ (РЯД 1: ГОСУДАРСТВО, РЕСУРСЫ И ХОД • РЯД 2: ВКЛАДКИ И ФАЗЫ СЕЗОНА) */}
      <header className="hud-header backdrop-blur-md border-b border-amber-600/35 px-2.5 xl:px-3 py-1.5 sticky top-0 z-[45]">
        {/* РЯД 1: Герб, Ход/Сезон, Алерты, 6 Ресурсов Байт аль-маль, Печати, Архив и ЗАВЕРШИТЬ ХОД */}
        <div className="max-w-[1640px] 2xl:max-w-[1880px] mx-auto flex flex-wrap xl:flex-nowrap items-center justify-between gap-1.5 sm:gap-2">
          {/* Левый блок: Герб Шамиля, название, ход, сезон и алерты */}
          <div className="flex items-center gap-1.5 xl:gap-2 shrink-0">
            <button
              onClick={() => setShowPauseMenu(true)}
              title={t('Меню (Esc)', 'Menu (Esc)')}
              className="w-7 h-7 rounded-md bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-stone-950 font-serif font-extrabold text-sm shadow border border-amber-300/70 cursor-pointer hover:brightness-110 shrink-0"
            >
              {t('Ш', 'S')}
            </button>
            <h1 className="text-xs sm:text-sm font-bold font-serif tracking-wide text-amber-400 shrink-0 hidden 2xl:block">
              {t('ИМАМАТ', 'IMAMAT')}
            </h1>
            <span
              className="px-2 py-0.5 text-[10.5px] font-mono uppercase bg-amber-500/15 text-amber-200 border border-amber-500/35 rounded cursor-help shrink-0 whitespace-nowrap"
              title={`${t(SEASONS[(turn - 1) % SEASONS.length], SEASONS_EN[(turn - 1) % SEASONS_EN.length])} — ${t(currentSeasonClimate.seasonType, currentSeasonClimate.seasonTypeEn || currentSeasonClimate.seasonType)}: ${t(currentSeasonClimate.weatherDesc, currentSeasonClimate.weatherDescEn || currentSeasonClimate.weatherDesc)} (${t('Террасы', 'Terraces')} ${currentSeasonClimate.provisionsMod >= 0 ? `+${currentSeasonClimate.provisionsMod}` : currentSeasonClimate.provisionsMod}, ${t('Порох', 'Powder')} +${currentSeasonClimate.powderMod}, ${t('Натиск', 'Pressure')} ${currentSeasonClimate.imperialPressureMod >= 0 ? `+${currentSeasonClimate.imperialPressureMod}%` : `${currentSeasonClimate.imperialPressureMod}%`})`}
            >
              {t('Ход', 'Turn')} {turn} • {t(currentMonthShortRu, currentMonthShortEn)}
            </span>
            <div className="shrink-0 hidden 2xl:flex">
              <AlertBar alerts={hudAlerts} t={t} />
            </div>
          </div>

            {/* Центральный блок: 6 ключевых ресурсов Байт аль-маль */}
          <div className="hud-mobile-scroll max-w-full overflow-x-auto flex items-center gap-0.5 bg-[#181410] border border-amber-700/30 px-1.5 py-0.5 rounded-lg text-[10.5px] sm:text-[11px] font-mono shadow-inner shrink-0 order-3 sm:order-none w-full sm:w-auto justify-between sm:justify-start">
            <ResourceChip
              icon={<Flame className="w-3.5 h-3.5 text-orange-400" />}
              value={resources.gunpowder}
              unit={t('пуд.', 'p.')}
              label={t('Порох в арсеналах', 'Black Powder')}
              colorClass="text-orange-300"
              delta={resourceDeltas.gunpowder}
              warn={resources.gunpowder < 120}
              rows={[
                { label: t('Сезон', 'Season'), value: fmtMod(currentSeasonClimate.powderMod), tone: currentSeasonClimate.powderMod >= 0 ? 'good' : 'bad' },
                { label: t('Пороховых мельниц', 'Powder mills'), value: powderMills.length }
              ]}
              desc={t('[[powder|Порох]] из мельниц Ведено и Телетля. Нужен для залпов батарей, засек и обороны аулов при [[siege|осаде]].', '[[powder|Powder]] from Vedeno & Teletl mills. Needed for battery salvos, abatis and aul defence under [[siege|siege]].')}
            />
            <span className="text-stone-700">|</span>
            <ResourceChip
              icon={<Wheat className="w-3.5 h-3.5 text-emerald-400" />}
              value={resources.provisions}
              unit={t('мер', 'm.')}
              label={t('Провиант', 'Provisions')}
              colorClass="text-emerald-300"
              delta={resourceDeltas.provisions}
              warn={resources.provisions < 300}
              rows={[
                { label: t('Урожай террас (сезон)', 'Terrace harvest (season)'), value: fmtMod(currentSeasonClimate.provisionsMod), tone: currentSeasonClimate.provisionsMod >= 0 ? 'good' : 'bad' },
                { label: t('Войско на довольствии', 'Troops to feed'), value: campaignAudit.totalGarrison, tone: 'bad' }
              ]}
              desc={t('Зерно, чурек и сухари с горных террас. Голод снижает лояльность [[naibate|наибств]].', 'Grain and rusks from mountain terraces. Hunger lowers [[naibate|naibate]] loyalty.')}
            />
            <span className="text-stone-700">|</span>
            <ResourceChip
              icon={<Coins className="w-3.5 h-3.5 text-amber-400" />}
              value={resources.silver}
              unit={t('руб.', 'r.')}
              label={t('Казна Байт аль-маль', 'Bayt al-Mal Treasury')}
              colorClass="text-amber-300"
              delta={resourceDeltas.silver}
              rows={[{ label: t('Поддержка Порты', 'Ottoman support'), value: `${resources.ottomanSupport}%` }]}
              desc={t('Серебро [[baytalmal|Байт аль-маль]]: [[zakat|закят]], военная добыча и выкуп пленных. Оплачивает посольства и мастеров.', 'Silver of the [[baytalmal|Bayt al-Mal]]: [[zakat|zakat]], spoils and ransoms. Pays envoys and craftsmen.')}
            />
            <span className="text-stone-700">|</span>
            <ResourceChip
              icon={<Crown className="w-3.5 h-3.5 text-sky-400" />}
              value={`${resources.authority}%`}
              unit={t('авт.', 'auth.')}
              label={t('Авторитет Имама Шамиля', 'Authority of Imam Shamil')}
              colorClass="text-sky-300"
              delta={resourceDeltas.authority}
              warn={resources.authority < 55}
              rows={[{ label: t('Нагрузка на Имама', 'Command strain'), value: `${leaderStressData.totalStress}%`, tone: leaderStressData.totalStress > 70 ? 'bad' : 'neutral' }]}
              portrait={{ src: findPortrait('Шамиль'), name: t('Имам Шамиль', 'Imam Shamil'), title: t('Третий имам Дагестана и Чечни', 'Third Imam of Dagestan & Chechnya'), color: '#38bdf8' }}
              desc={t('Определяет, насколько точно [[naib|наибы]] исполняют приказы [[divan|Дивана]].', 'Determines how faithfully [[naib|naibs]] execute [[divan|Divan]] orders.')}
            />
            <span className="text-stone-700 hidden sm:inline">|</span>
            <ResourceChip
              hiddenClass="hidden sm:flex"
              icon={<Shield className="w-3.5 h-3.5 text-emerald-400" />}
              value={`${campaignAudit.totalGarrison} (${campaignAudit.victoryScore}%)`}
              label={t('Войско и устойчивость Имамата', 'Forces & Resilience')}
              colorClass="text-emerald-200"
              rows={[{ label: t('Наибств в осаде', 'Naibates besieged'), value: naibates.filter((n) => n.underSiege).length, tone: 'bad' }]}
              desc={t('Мюриды и [[murtazek|муртазеки]] в гарнизонах и индекс шансов на исторический успех. Угроза — [[cordon|кордонная линия]].', 'Murids and [[murtazek|murtazeks]] in garrisons and the historical success index. Threat: the [[cordon|cordon line]].')}
            />
            <span className="text-stone-700 hidden md:inline">|</span>
            <ResourceChip
              hiddenClass="hidden md:flex"
              icon={<AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
              value={`${leaderStressData.totalStress}%`}
              unit={t('нагр.', 'str.')}
              label={t('Нагрузка на Имама', 'Command Strain')}
              colorClass={leaderStressData.totalStress > 70 ? 'text-red-300' : 'text-amber-200'}
              warn={leaderStressData.totalStress > 70}
              rows={[{ label: t('Натиск РИ (сезон)', 'Imperial pressure (season)'), value: `${fmtMod(currentSeasonClimate.imperialPressureMod)}%`, tone: currentSeasonClimate.imperialPressureMod > 0 ? 'bad' : 'good' }]}
              portrait={{ src: findPortrait('Шамиль'), name: t('Имам Шамиль', 'Imam Shamil'), title: t('Глава Дивана', 'Head of the Divan'), color: '#f59e0b' }}
              desc={t('[[strain|Нагрузка]] выше 70% — приказы теряются в пути, растёт риск ошибок [[naib|наибов]]. Каждый [[nizam|низам]] добавляет дел.', '[[strain|Strain]] above 70%: orders get lost en route and [[naib|naib]] errors rise. Each [[nizam|nizam]] adds work.')}
            />
          </div>

          {/* Правый блок: Печати хода, ИИ-Полководец, Архив/Настройки и ЗАВЕРШИТЬ ХОД */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`px-2 py-1 rounded-lg text-[10.5px] hud-num font-bold border cursor-help transition hidden md:inline-flex items-center gap-1.5 ${
                turnActionQuota.sealsRemaining > 0
                  ? 'bg-amber-950/75 text-amber-200 border-amber-500/45'
                  : 'bg-rose-950/80 text-rose-300 border-rose-500/50 animate-pulse'
              }`}
              title={t(
                `Бюджет приказов Диван-ханы на Ход #${turn} (сбрасывается при завершении хода):\n• Печати Имама: ${turnActionQuota.sealsRemaining}/${turnActionQuota.maxSeals}\n• Гонцы наибам: ${turnActionQuota.envoysSent}/${turnActionQuota.maxEnvoysPerTurn}\n• Законы Низама: ${turnActionQuota.nizamsEnacted}/${turnActionQuota.maxNizamsPerTurn}\n• Судебные дела: ${turnActionQuota.courtCasesResolved}/${turnActionQuota.maxCourtCasesPerTurn}\n• Исторические развилки: ${turnActionQuota.crisesResolved}/${turnActionQuota.maxCrisesPerTurn}\n• Заказы Арсенала/Дипломатии: ${turnActionQuota.stateOrdersUsed}/${turnActionQuota.maxStateOrdersPerTurn}\n• Тактические манёвры: ${turnActionQuota.tacticalMovesUsed}/${turnActionQuota.maxTacticalMovesPerTurn}`,
                `Divan-Khana Order Budget for Turn #${turn} (resets on End Turn):\n• Imam’s Seals: ${turnActionQuota.sealsRemaining}/${turnActionQuota.maxSeals}\n• Envoys: ${turnActionQuota.envoysSent}/${turnActionQuota.maxEnvoysPerTurn}\n• Nizams: ${turnActionQuota.nizamsEnacted}/${turnActionQuota.maxNizamsPerTurn}\n• Court Cases: ${turnActionQuota.courtCasesResolved}/${turnActionQuota.maxCourtCasesPerTurn}\n• Historical Crossroads: ${turnActionQuota.crisesResolved}/${turnActionQuota.maxCrisesPerTurn}\n• Arsenal/Diplomacy: ${turnActionQuota.stateOrdersUsed}/${turnActionQuota.maxStateOrdersPerTurn}\n• Tactical Moves: ${turnActionQuota.tacticalMovesUsed}/${turnActionQuota.maxTacticalMovesPerTurn}`
              )}
            >
              <WaxSealIcon className="w-3.5 h-3.5" />
              <span>
                {t('Печати:', 'Seals:')} {turnActionQuota.sealsRemaining}/{turnActionQuota.maxSeals}
              </span>
            </span>

            {/* Единое меню «Кодекс, Архив и Настройки» (чистый HUD без лишних кнопок) */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowHeaderArchiveMenu((v) => !v)}
                className={`px-2 xl:px-2.5 py-1 rounded-lg text-[10.5px] font-serif font-bold transition cursor-pointer border flex items-center gap-1 whitespace-nowrap ${
                  showHeaderArchiveMenu
                    ? 'bg-amber-500/25 text-amber-200 border-amber-400'
                    : 'bg-[#1a1612] text-stone-200 hover:bg-stone-800 border-stone-700'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden 2xl:inline">{t('Архив и настройки', 'Archive & Settings')} ▾</span>
                <span className="2xl:hidden">{t('Архив', 'Archive')} ▾</span>
              </button>

              {showHeaderArchiveMenu && (
                <div className="absolute right-0 mt-1.5 w-[min(92vw,360px)] sm:w-[410px] bg-[#14110e]/98 backdrop-blur-xl border border-amber-500/50 rounded-xl p-3 shadow-2xl z-50 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-1.5">
                    <span className="font-serif font-bold text-amber-300 uppercase text-[11px]">
                      📚 {t('Кодекс, Архив и Настройки', 'Codex, Archive & Settings')}
                    </span>
                    <button
                      onClick={() => setShowHeaderArchiveMenu(false)}
                      className="px-1.5 py-0.5 rounded bg-stone-900 text-stone-400 hover:text-white font-mono text-[10px] cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Сохранение, Советник и Наблюдатель ИИ */}
                  <div className="space-y-1">
                    <div className="text-[9.5px] font-serif uppercase tracking-wider text-stone-400 font-bold">
                      {t('Кампания и управление', 'Campaign & Controls')}
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px]">
                      <button
                        onClick={handleSaveCampaignState}
                        className="px-2 py-1.5 rounded bg-[#1c1814] hover:bg-stone-800 border border-stone-700 text-stone-200 font-bold cursor-pointer"
                      >
                        💾 {t('Сейв', 'Save')}
                      </button>
                      <button
                        onClick={handleLoadCampaignState}
                        className="px-2 py-1.5 rounded bg-[#1c1814] hover:bg-stone-800 border border-stone-700 text-stone-200 font-bold cursor-pointer"
                      >
                        📂 {t('Загрузка', 'Load')}
                      </button>
                      <button
                        onClick={() => {
                          setShowAdvisorPanel((v) => !v);
                          setShowHeaderArchiveMenu(false);
                        }}
                        className="px-2 py-1.5 rounded bg-[#1c1814] hover:bg-stone-800 border border-amber-500/40 text-amber-200 font-bold cursor-pointer"
                      >
                        🎓 {t('Советник', 'Advisor')}
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        if (spectatorMode.active) {
                          setSpectatorMode((prev) => ({ ...prev, active: false, autoPlay: false }));
                        } else {
                          handleStartSpectatorCampaign();
                        }
                        setShowHeaderArchiveMenu(false);
                      }}
                      className={`w-full px-2.5 py-1.5 rounded text-[11px] font-serif font-bold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                        spectatorMode.active
                          ? 'bg-emerald-500 text-stone-950 border-emerald-300 shadow'
                          : 'bg-emerald-950/60 hover:bg-emerald-900/75 text-emerald-200 border-emerald-500/45'
                      }`}
                    >
                      <HighlandEagleIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {spectatorMode.active
                          ? t('Остановить режим ИИ-Полководца', 'Stop AI Commander Spectator Mode')
                          : t('Режим Наблюдателя: ИИ-Полководец', 'Spectator Mode: Watch AI Commander')}
                      </span>
                    </button>
                  </div>

                  {/* Кодекс: Словарь, Устав, Музей, Депеши, Достижения, Хронограф */}
                  <div className="space-y-1 pt-1 border-t border-stone-800">
                    <div className="text-[9.5px] font-serif uppercase tracking-wider text-amber-300/80 font-bold">
                      {t('Исторический Кодекс и Архив', 'Historical Codex & Archive')}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                      <button
                        onClick={() => {
                          setPlaytestTelemetry((tp) => ({
                            ...tp,
                            glossaryOpenedCount: tp.glossaryOpenedCount + 1
                          }));
                          setShowGlossaryModal(true);
                          setShowHeaderArchiveMenu(false);
                        }}
                        className="px-2 py-1.5 rounded bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-200 font-bold cursor-pointer text-left"
                      >
                        📖 {t('Словарь', 'Glossary')} ({IMAMAT_GLOSSARY_TERMS.length})
                      </button>
                      <button
                        onClick={() => {
                          setShowFieldManualModal(true);
                          setShowHeaderArchiveMenu(false);
                        }}
                        className="px-2 py-1.5 rounded bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/40 text-indigo-200 font-bold cursor-pointer text-left"
                      >
                        📘 {t('Устав', 'Manual')}
                      </button>
                      <button
                        onClick={() => {
                          setShowMuseumCodexModal(true);
                          setShowHeaderArchiveMenu(false);
                        }}
                        className="px-2 py-1.5 rounded bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/40 text-teal-200 font-bold cursor-pointer text-left"
                      >
                        🏛️ {t('Музей', 'Museum')}
                      </button>
                      <button
                        onClick={() => {
                          setShowDispatchesModal(true);
                          setShowHeaderArchiveMenu(false);
                        }}
                        className="px-2 py-1.5 rounded bg-lime-500/15 hover:bg-lime-500/25 border border-lime-500/40 text-lime-200 font-bold cursor-pointer text-left"
                      >
                        📜 {t('Депеши', 'Dispatches')} ({DIPLOMATIC_DISPATCHES_ARCHIVE.length - executedDispatchesIds.length}/{DIPLOMATIC_DISPATCHES_ARCHIVE.length})
                      </button>
                      <button
                        onClick={() => {
                          setShowAchievementsModal(true);
                          setShowHeaderArchiveMenu(false);
                        }}
                        className="px-2 py-1.5 rounded bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-200 font-bold cursor-pointer text-left"
                      >
                        🏆 {t('Достижения', 'Achievements')} ({unlockedAchievementsCount}/12)
                      </button>
                      <button
                        onClick={() => {
                          setShowReplayModal(true);
                          setShowHeaderArchiveMenu(false);
                        }}
                        className="px-2 py-1.5 rounded bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-200 font-bold cursor-pointer text-left"
                      >
                        📈 {t('Хронограф', 'Replay')} ({campaignHistoryLog.length})
                      </button>
                    </div>
                  </div>

                  {/* Звук, Язык и Режим Студии */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1.5 border-t border-stone-800 font-mono text-[11px]">
                    <button
                      onClick={() => {
                        setShowAudioMixerModal(true);
                        setShowHeaderArchiveMenu(false);
                      }}
                      className="px-2 py-1 rounded bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-200 font-bold cursor-pointer"
                    >
                      🎛️ {t('Звук 2.0', 'Audio Mixer')} ({soundEnabled && audioMixerConfig.musicEnabled ? t(adaptiveMusicState.meta.shortRu, adaptiveMusicState.meta.shortEn) : t('Выкл', 'Off')})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPlaytestFeedbackModal(true);
                        setShowHeaderArchiveMenu(false);
                      }}
                      className="px-2 py-1 rounded bg-amber-500/15 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 font-bold cursor-pointer"
                    >
                      💬 {t('Отзыв / Баг', 'Feedback')}
                    </button>
                    <button
                      onClick={() => setSoundEnabled((s) => !s)}
                      className="px-2 py-1 rounded bg-[#1c1814] border border-stone-700 text-amber-200 font-bold cursor-pointer flex items-center gap-1"
                    >
                      {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                      <span>{soundEnabled ? t('Звук: ВКЛ', 'Sound: ON') : t('Звук: ВЫКЛ', 'Sound: OFF')}</span>
                    </button>
                    <button
                      onClick={() => setLang((l) => (l === 'ru' ? 'en' : 'ru'))}
                      className="px-2 py-1 rounded bg-amber-500/15 border border-amber-500/40 text-amber-200 font-bold cursor-pointer"
                    >
                      🌐 {lang === 'ru' ? 'RU 🇷🇺' : 'EN 🇬🇧'}
                    </button>
                    <button
                      onClick={() => {
                        setStudioMode((v) => !v);
                      }}
                      className={`px-2 py-1 rounded border font-bold cursor-pointer ${
                        studioMode
                          ? 'bg-stone-200 text-stone-950 border-stone-100'
                          : 'bg-[#1c1814] border-stone-700 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      🔧 {t('Студия', 'Studio')}
                    </button>
                  </div>

                  {/* Инструменты Студии и Прессы (скрыты в обычной игре) */}
                  {studioMode && (
                    <div className="space-y-1 pt-1.5 border-t border-stone-800">
                      <div className="text-[9.5px] font-serif uppercase tracking-wider text-stone-400 font-bold">
                        {t('Мастерская и инструменты прессы', 'Workshop & Press Tools')}
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 font-mono text-[10.5px]">
                        <button
                          onClick={() => {
                            setShowTelemetryModal(true);
                            setShowHeaderArchiveMenu(false);
                          }}
                          className="px-2 py-1 rounded bg-purple-500/15 border border-purple-500/40 text-purple-200 font-bold cursor-pointer text-left"
                        >
                          📊 {t('Телеметрия', 'Telemetry')}
                        </button>
                        <button
                          onClick={() => {
                            setShowModBuilderModal(true);
                            setShowHeaderArchiveMenu(false);
                          }}
                          className="px-2 py-1 rounded bg-orange-500/15 border border-orange-500/40 text-orange-200 font-bold cursor-pointer text-left"
                        >
                          🛠️ {t('Моддинг', 'Mod Builder')}
                        </button>
                        <button
                          onClick={() => {
                            setShowTrailerPrevizModal(true);
                            setShowHeaderArchiveMenu(false);
                          }}
                          className="px-2 py-1 rounded bg-fuchsia-500/15 border border-fuchsia-500/40 text-fuchsia-200 font-bold cursor-pointer text-left"
                        >
                          🎬 {t('Трейлер', 'Trailer')}
                        </button>
                        <button
                          onClick={() => {
                            setShowReleaseHubModal(true);
                            setShowHeaderArchiveMenu(false);
                          }}
                          className="px-2 py-1 rounded bg-yellow-500/20 border border-yellow-400/60 text-yellow-200 font-bold cursor-pointer text-left"
                        >
                          🦅 {t('Релиз v2.0', 'Release v2.0')}
                        </button>
                        <button
                          onClick={handleDownloadUE5SaveJson}
                          className="px-2 py-1 rounded bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 font-bold cursor-pointer text-left"
                        >
                          ⬇️ UE5 JSON
                        </button>
                        <button
                          onClick={handleTogglePitchTour}
                          className="px-2 py-1 rounded bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 font-bold cursor-pointer text-left"
                        >
                          {pitchTour.active ? `⏹ ${t('Стоп-тур', 'Stop Tour')}` : `▶ ${t('Авто-тур', 'Pitch Tour')}`}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <EndTurnButton
              turn={turn}
              monthLabel={t(currentMonthShortRu, currentMonthShortEn)}
              pendingCount={hudAlerts.length}
              onEndTurn={handleNextTurn}
              t={t}
            />
          </div>
        </div>

        {/* РЯД 2: 4 главные палаты Диван-ханы + раскрываемый раздел «Ещё разделы» и единый индикатор этапа сезона */}
        <div className="max-w-[1640px] 2xl:max-w-[1880px] mx-auto mt-1 pt-1 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-1.5">
          <div className="hud-mobile-scroll max-w-full overflow-x-auto flex flex-nowrap md:flex-wrap items-center gap-1">
            <button
              onClick={() => setActiveTab('map')}
              className={`shrink-0 px-2.5 py-0.5 rounded-md text-[11px] font-serif font-semibold flex items-center gap-1 cursor-pointer ${
                activeTab === 'map' ? 'hud-tab-pill-active font-extrabold' : 'hud-tab-pill'
              }`}
            >
              <Compass className="w-3 h-3" />
              <span>{t('1. Карта и Наибы', '1. Map & Naibs')}</span>
              {activeEnvoys.length > 0 && (
                <span className="px-1 rounded-full bg-stone-950/80 text-amber-300 hud-num text-[9.5px] font-bold">
                  {activeEnvoys.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('nizams')}
              className={`shrink-0 px-2.5 py-0.5 rounded-md text-[11px] font-serif font-semibold flex items-center gap-1 cursor-pointer ${
                activeTab === 'nizams' ? 'hud-tab-pill-active font-extrabold' : 'hud-tab-pill'
              }`}
            >
              <Scale className="w-3 h-3" />
              <span>{t('2. Кодекс Низамов', '2. Nizam Code')}</span>
            </button>

            <button
              onClick={() => setActiveTab('diplomacy')}
              className={`shrink-0 px-2.5 py-0.5 rounded-md text-[11px] font-serif font-semibold flex items-center gap-1 cursor-pointer ${
                activeTab === 'diplomacy' ? 'hud-tab-pill-active font-extrabold' : 'hud-tab-pill'
              }`}
            >
              <Scroll className="w-3 h-3" />
              <span>{t('3. Стамбул и Ордена', '3. Istanbul & Medals')}</span>
            </button>

            <button
              onClick={() => setActiveTab('siege')}
              className={`shrink-0 px-2.5 py-0.5 rounded-md text-[11px] font-serif font-semibold flex items-center gap-1 cursor-pointer ${
                activeTab === 'siege' ? 'hud-tab-pill-active font-extrabold' : 'hud-tab-pill'
              }`}
            >
              <Swords className="w-3 h-3" />
              <span>{t('4. Поле Боя', '4. Battlefield')}</span>
            </button>

            <button
              onClick={() => setShowMoreHeaderTabs((prev) => !prev)}
              className={`shrink-0 px-2.5 py-0.5 rounded-md text-[11px] font-serif font-semibold flex items-center gap-1 cursor-pointer ${
                showMoreHeaderTabs || !['map', 'nizams', 'diplomacy', 'siege'].includes(activeTab)
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-400/60'
                  : 'hud-tab-pill'
              }`}
            >
              <span>{t('Ещё разделы', 'More Chambers')}</span>
              <span className="text-[9.5px] opacity-80">{showMoreHeaderTabs ? '▴' : '▾'}</span>
              {crises.some((c) => !c.resolved) && !showMoreHeaderTabs && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </button>

            {showMoreHeaderTabs && (
              <>
                <button
                  onClick={() => setActiveTab('arsenal')}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-serif font-semibold flex items-center gap-1 cursor-pointer ${
                    activeTab === 'arsenal' ? 'hud-tab-pill-active font-extrabold' : 'hud-tab-pill'
                  }`}
                >
                  <Hammer className="w-3 h-3" />
                  <span>{t('5. Арсенал и Штаб РИ', '5. Arsenal & Enemy HQ')}</span>
                </button>

                <button
                  onClick={() => setActiveTab('chronicle')}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-serif font-semibold flex items-center gap-1 cursor-pointer ${
                    activeTab === 'chronicle' ? 'hud-tab-pill-active font-extrabold' : 'hud-tab-pill'
                  }`}
                >
                  <BookOpen className="w-3 h-3" />
                  <span className="hud-num">
                    {t('6. Хроника', '6. Chronicle')} ({chronicle.length})
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('crises')}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-serif font-semibold flex items-center gap-1 cursor-pointer ${
                    activeTab === 'crises' ? 'hud-tab-pill-active font-extrabold' : 'hud-tab-pill'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>{t('7. Кризисы', '7. Crises')}</span>
                  <span
                    className={`px-1 rounded-full hud-num text-[9.5px] font-bold ${
                      activeTab === 'crises'
                        ? 'bg-stone-950/80 text-amber-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {crises.filter((c) => !c.resolved).length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('verdict')}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-serif font-semibold flex items-center gap-1 cursor-pointer ${
                    activeTab === 'verdict' ? 'hud-tab-pill-active font-extrabold' : 'hud-tab-pill'
                  }`}
                >
                  <Crown className="w-3 h-3" />
                  <span>{t('8. Суд, Казна и Сценарии', '8. Sharia Court & Campaigns')}</span>
                </button>

                {studioMode && (
                  <>
                    <button
                      onClick={() => setActiveTab('sim_epilogue')}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-serif font-semibold flex items-center gap-1 cursor-pointer ${
                        activeTab === 'sim_epilogue' ? 'hud-tab-pill-active font-extrabold' : 'hud-tab-pill'
                      }`}
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>{t('9. ИИ-Баланс и Эпилог', '9. AI Balance & Epilogue')}</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('archive_ballistics')}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-serif font-semibold flex items-center gap-1 cursor-pointer ${
                        activeTab === 'archive_ballistics' ? 'hud-tab-pill-active font-extrabold' : 'hud-tab-pill'
                      }`}
                    >
                      <Crosshair className="w-3 h-3" />
                      <span>{t('10. Архив Лиц и Газыри', '10. Portraits & Gazyrs')}</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('3d_tactical')}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-serif font-bold flex items-center gap-1 cursor-pointer ${
                        activeTab === '3d_tactical'
                          ? 'bg-emerald-500 text-stone-950 shadow-lg'
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/25'
                      }`}
                    >
                      <Compass className="w-3 h-3" />
                      <span>{t('11. 3D-Полигон и Разрез', '11. 3D Arena & Cutaway')}</span>
                    </button>
                  </>
                )}
              </>
            )}
          </div>

          {/* Лаконичный индикатор фазы сезона с переходом к актуальному делу */}
          <div className="hidden xl:flex items-center gap-2 text-[10.5px] font-serif shrink-0">
            <span
              className="flex items-center gap-1 text-amber-300/80"
              title={t(
                `Этапы сезона: I. Развилка (${openSeasonCrisis ? 'открыта' : 'решена'}) • II. Низам/Суд (${openSeasonCourt ? 'ждёт решения' : 'в порядке'}) • III. Гонцы (${turnActionQuota.envoysSent}/${turnActionQuota.maxEnvoysPerTurn}) • IV. Манёвры (${turnActionQuota.tacticalMovesUsed}/${turnActionQuota.maxTacticalMovesPerTurn})`,
                `Season steps: I. Crisis • II. Nizam/Court • III. Envoys • IV. Battle`
              )}
            >
              {[phase1Done, phase2Done, phase3Done, phase4Done].map((done, idx) => (
                <span
                  key={idx}
                  className={`w-2 h-2 rotate-45 inline-block border ${
                    done
                      ? 'bg-emerald-400 border-emerald-200'
                      : 'bg-stone-900 border-amber-500/60'
                  }`}
                />
              ))}
            </span>
            <button
              onClick={handleAdvanceSequentialPhase}
              className="px-2.5 py-0.5 rounded-md bg-amber-500/15 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 font-bold shadow-sm transition cursor-pointer"
              title={t('Перейти к следующему совету Диван-ханы в этом ходу', 'Jump to next recommended Divan action')}
            >
              {t(nextPhaseLabelRu, nextPhaseLabelEn)}
            </button>
          </div>
        </div>
      </header>

      {/* ПУЛЬТ НАБЛЮДАТЕЛЯ: ИИ-ПОЛКОВОДЕЦ ВЕДЁТ КАМПАНИЮ ПО 5 АКТАМ КАВКАЗСКОЙ ДРАМЫ */}
      {spectatorMode.active && (
        <div className="max-w-7xl mx-auto px-4 mt-3">
          <div className="bg-gradient-to-r from-[#0d1f18] via-[#132a21] to-[#1a1610] border-2 border-emerald-500/70 rounded-xl p-4 shadow-2xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/30 pb-2.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded bg-emerald-400 text-stone-950 font-mono text-[10px] font-extrabold uppercase tracking-wider">
                  👁️ {t('Режим Наблюдателя • ИИ-Полководец за столом Диван-ханы', 'Spectator Mode • AI Commander at Divan-Khana')}
                </span>
                <span className="text-xs font-mono font-bold text-amber-300">
                  {t(spectatorMode.actLabelRu, spectatorMode.actLabelEn)}
                </span>
                <span className="px-2 py-0.5 rounded bg-stone-900/90 border border-stone-700 text-[11px] font-mono text-emerald-300">
                  {t(`Выполнено ходов ИИ: ${spectatorMode.stepIdx}/10`, `AI Moves Executed: ${spectatorMode.stepIdx}/10`)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <button
                  onClick={handleExecuteNextSpectatorMove}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold cursor-pointer shadow-md transition"
                >
                  ⚡ {t('Сделать следующий ход ИИ →', 'Execute Next AI Move →')}
                </button>
                <button
                  onClick={() =>
                    setSpectatorMode((prev) => ({ ...prev, autoPlay: !prev.autoPlay }))
                  }
                  className={`px-3 py-1.5 rounded-lg border cursor-pointer font-bold transition ${
                    spectatorMode.autoPlay
                      ? 'bg-emerald-500 text-stone-950 border-emerald-300'
                      : 'bg-stone-900/90 hover:bg-stone-800 border-emerald-500/50 text-emerald-300'
                  }`}
                >
                  {spectatorMode.autoPlay
                    ? `⏸ ${t('Пауза авто-хода (4.5с)', 'Pause Auto-Play (4.5s)')}`
                    : `▶ ${t('Включить авто-ход (4.5с)', 'Start Auto-Play (4.5s)')}`}
                </button>
                <button
                  onClick={() =>
                    setSpectatorMode((prev) => ({ ...prev, active: false, autoPlay: false }))
                  }
                  className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-white cursor-pointer"
                  title={t('Взять ручное управление на себя', 'Take manual control')}
                >
                  ✋ {t('Взять управление', 'Take Control')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
              <div className="lg:col-span-7 flex items-start gap-3.5">
                {findPortrait(spectatorMode.speakerPortraitKey) && (
                  <img
                    src={findPortrait(spectatorMode.speakerPortraitKey)}
                    alt={t(spectatorMode.speakerNameRu, spectatorMode.speakerNameEn)}
                    className="w-14 h-14 rounded-xl object-cover object-top border-2 border-amber-500/60 shrink-0 shadow-lg"
                  />
                )}
                <div className="space-y-1 flex-1">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-300 font-bold">
                    {t(spectatorMode.speakerNameRu, spectatorMode.speakerNameEn)}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold font-serif text-amber-200">
                    {t(spectatorMode.titleRu, spectatorMode.titleEn)}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-stone-200 leading-relaxed italic">
                    {t(spectatorMode.descRu, spectatorMode.descEn)}
                  </p>
                </div>
              </div>

              <div className="lg:col-span-5 bg-stone-950/85 border border-rose-500/40 rounded-xl p-2.5 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase font-extrabold text-rose-300">
                    🦅 {t('Ответный ход Штаба в Тифлисе (Кавказский корпус РИ):', 'Tiflis HQ Counter-Move (Imperial Caucasian Corps):')}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-[9.5px] font-mono text-rose-200">
                    {t('Разведсводка', 'Intel Brief')}
                  </span>
                </div>
                <p className="text-[11.5px] text-stone-300 leading-snug">
                  {t(spectatorMode.imperialResponseRu, spectatorMode.imperialResponseEn)}
                </p>
              </div>
            </div>

            {/* Переключатель доктрины ИИ-Полководца Шамиля */}
            <div className="pt-2 border-t border-emerald-500/25 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10.5px] font-mono uppercase tracking-wider text-stone-300 font-bold">
                🧭 {t('Стратегическая доктрина ИИ-Шамиля:', 'AI Commander Shamil’s Strategic Doctrine:')}
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {AI_SHAMIL_DOCTRINES.map((doc) => {
                  const isActiveDoc = spectatorMode.doctrineId === doc.id;
                  return (
                    <button
                      key={doc.id}
                      onClick={() =>
                        setSpectatorMode((prev) => ({ ...prev, doctrineId: doc.id }))
                      }
                      className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold transition cursor-pointer border ${
                        isActiveDoc
                          ? 'bg-amber-400 text-stone-950 border-amber-200 shadow'
                          : 'bg-stone-900/90 text-stone-300 border-stone-700 hover:border-amber-500/50 hover:text-amber-200'
                      }`}
                      title={t(doc.descRu, doc.descEn)}
                    >
                      {t(doc.badgeRu, doc.badgeEn)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* РЕЖИМ «EXECUTIVE PUBLISHER AUTO-TOUR» (MILESTONE M11) */}
      {pitchTour.active && (
        <div className="max-w-7xl mx-auto px-4 mt-3">
          {(() => {
            const activeTourStep =
              PUBLISHER_TOUR_STEPS[pitchTour.stepIdx] || PUBLISHER_TOUR_STEPS[0];
            return (
              <div className="bg-gradient-to-r from-[#11221c] via-[#152822] to-[#11221c] border-2 border-emerald-500/60 rounded-xl p-4 shadow-2xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/30 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded bg-emerald-400 text-stone-950 font-mono text-[10px] font-extrabold uppercase">
                      {t('Executive Publisher Pitch Tour', 'Executive Publisher Pitch Tour')}
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-300">
                      {t(activeTourStep.badgeRu, activeTourStep.badgeEn)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                    {PUBLISHER_TOUR_STEPS.map((st, idx) => (
                      <button
                        key={st.id}
                        onClick={() => handleSelectPitchTourStep(idx)}
                        className={`px-2 py-0.5 rounded cursor-pointer transition ${
                          idx === pitchTour.stepIdx
                            ? 'bg-amber-400 text-stone-950 font-bold'
                            : 'bg-stone-900/80 text-stone-400 border border-stone-700 hover:text-stone-200'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handleSelectPitchTourStep(pitchTour.stepIdx - 1)}
                      className="px-2.5 py-1 rounded bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 cursor-pointer"
                    >
                      ← {t('Назад', 'Prev')}
                    </button>
                    <button
                      onClick={() =>
                        setPitchTour((prev) => ({ ...prev, autoAdvance: !prev.autoAdvance }))
                      }
                      className={`px-2.5 py-1 rounded border cursor-pointer font-bold ${
                        pitchTour.autoAdvance
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                          : 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                      }`}
                    >
                      {pitchTour.autoAdvance
                        ? `⏸ ${t('Авто (8.5с)', 'Auto (8.5s)')}`
                        : `▶ ${t('Пауза', 'Paused')}`}
                    </button>
                    <button
                      onClick={() => handleSelectPitchTourStep(pitchTour.stepIdx + 1)}
                      className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold cursor-pointer"
                    >
                      {t('Далее', 'Next')} →
                    </button>
                    <button
                      onClick={() => setPitchTour((prev) => ({ ...prev, active: false }))}
                      className="px-2 py-1 rounded bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-400 hover:text-white cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
                  <div className="lg:col-span-8 space-y-1">
                    <h3 className="text-sm sm:text-base font-bold font-serif text-stone-100">
                      {t(activeTourStep.titleRu, activeTourStep.titleEn)}
                    </h3>
                    <p className="text-xs text-stone-200 leading-relaxed">
                      {t(activeTourStep.descRu, activeTourStep.descEn)}
                    </p>
                  </div>
                  <div className="lg:col-span-4 bg-[#0b1411] border border-emerald-500/40 rounded-lg p-3 text-xs font-mono space-y-1">
                    <div className="text-[10px] uppercase text-emerald-400 font-bold">
                      {t('Ключевой KPI / Инвариант вертикального среза:', 'Key Vertical Slice KPI / Invariant:')}
                    </div>
                    <div className="text-amber-300 font-bold">
                      {t(activeTourStep.kpiHighlightRu, activeTourStep.kpiHighlightEn)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Всплывающее уведомление-тост (не сдвигает раскладку стола) */}
      <ToastBanner text={statusBanner} onClose={() => setStatusBanner(null)} t={t} />

      {/* ИНТЕРАКТИВНЫЙ СОВЕТ ПЕРВЫХ 3 ХОДОВ: НАСТАВЛЕНИЕ СЕКРЕТАРЯ АЛЬ-КАРАХИ (FOrderProbabilityBreakdown / FTacticalBattleResult) */}
      {showAdvisorPanel && (
        <div className="max-w-[1480px] mx-auto px-3 mt-2">
          {(() => {
            const step1Done = nizams.filter((n) => n.enacted).length > 1;
            const step2Done =
              activeEnvoys.length > 0 || chronicle.some((c) => String(c.id).startsWith('envoy-'));
            const step3Done =
              advisorBattleCompleted ||
              tacticalBattleSession.gazyrCharges < 18 ||
              tacticalBattleSession.pressureDropAccum > 0;
            const completedCount = [step1Done, step2Done, step3Done].filter(Boolean).length;

            return (
              <div className="bg-gradient-to-r from-[#171b24] via-[#1b1f2a] to-[#171b24] border border-amber-500/40 rounded-xl p-3.5 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-stone-800">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded bg-amber-500 text-stone-950 font-mono text-[10px] font-bold uppercase">
                      {t('Совет Дивана', 'Divan Counsel')} ({completedCount}/3)
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold font-serif text-amber-300">
                      {t(
                        'Наставление секретаря Мухаммед-Тахира аль-Карахи: Первые 3 шага в Диван-хане',
                        'Secretary Muhammad-Tahir al-Qarakhi’s Counsel: First 3 Steps in the Divan-Khana'
                      )}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowGlossaryModal(true)}
                      className="px-2.5 py-1 rounded bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-300 text-[11px] font-mono font-bold transition cursor-pointer"
                    >
                      📖 {t('Открыть Толковый словарь Имамата', 'Open Imamat Glossary')}
                    </button>
                    <button
                      onClick={() => setShowAdvisorPanel(false)}
                      className="text-stone-400 hover:text-stone-200 text-xs font-mono px-2 py-0.5 rounded bg-stone-900 border border-stone-700 cursor-pointer"
                    >
                      {t('Свернуть ✕', 'Minimize ✕')}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                  {/* Шаг 1 */}
                  <div
                    className={`p-3 rounded-lg border transition ${
                      step1Done
                        ? 'bg-emerald-950/20 border-emerald-500/40'
                        : 'bg-stone-900/80 border-stone-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-mono font-bold uppercase text-amber-300">
                        {t('Шаг 1 • Закон и Селитра', 'Step 1 • Nizam Law & Saltpeter')}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          step1Done
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-stone-800 text-stone-400'
                        }`}
                      >
                        {step1Done ? t('✓ ВЫПОЛНЕНО', '✓ DONE') : t('ОЖИДАЕТ', 'PENDING')}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-300 leading-relaxed mb-2.5">
                      {t(
                        'Без селитренных варниц Хаджи-Юсуфа и тайных ревизоров-мухтасибов запасы пороха в Ведено иссякнут к осенним штурмам. Скрепите печатью государственный Низам!',
                        'Without Hajji Yusuf’s saltpeter works and secret Muhtasib inspectors, Vedeno’s powder reserves will deplete before the autumn sieges. Enact a state Nizam!'
                      )}
                    </p>
                    <button
                      onClick={() => setActiveTab('nizams')}
                      className="w-full py-1.5 px-2.5 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-mono text-[11px] font-bold transition cursor-pointer"
                    >
                      {t('→ Перейти во вкладку «2. Кодекс Низамов»', '→ Open Tab 2: Shamil’s Nizam Code')}
                    </button>
                  </div>

                  {/* Шаг 2 */}
                  <div
                    className={`p-3 rounded-lg border transition ${
                      step2Done
                        ? 'bg-emerald-950/20 border-emerald-500/40'
                        : 'bg-stone-900/80 border-stone-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-mono font-bold uppercase text-orange-300">
                        {t('Шаг 2 • Пороховой караван (30 пуд.)', 'Step 2 • Gunpowder Convoy (30 poods)')}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          step2Done
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-stone-800 text-stone-400'
                        }`}
                      >
                        {step2Done ? t('✓ ВЫПОЛНЕНО', '✓ DONE') : t('ОЖИДАЕТ', 'PENDING')}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-300 leading-relaxed mb-2.5">
                      {t(
                        'Осаждённые бастионы Гергебиля и Салты расходуют по 16 пудов пороха за ход. Снарядите гонца с караваном в 30 пудов через горные перевалы.',
                        'Besieged bastions of Gergebil and Salty burn 16 poods of powder per turn. Dispatch a mounted courier with a 30-pood convoy across the mountain passes.'
                      )}
                    </p>
                    <button
                      onClick={() => {
                        setActiveTab('map');
                        setSelectedNaibateId('gergebil');
                        setSelectedOrderType('fortify');
                        setAttachedPowder(30);
                      }}
                      className="w-full py-1.5 px-2.5 rounded bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-200 font-mono text-[11px] font-bold transition cursor-pointer"
                    >
                      {t('→ Выбрать Гергебиль + караван 30 пудов', '→ Select Gergebil + 30-Pood Convoy')}
                    </button>
                  </div>

                  {/* Шаг 3 */}
                  <div
                    className={`p-3 rounded-lg border transition ${
                      step3Done
                        ? 'bg-emerald-950/20 border-emerald-500/40'
                        : 'bg-stone-900/80 border-stone-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-mono font-bold uppercase text-emerald-300">
                        {t('Шаг 3 • Диорама и 18 Газырей', 'Step 3 • Siege Diorama & 18 Gazyrs')}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          step3Done
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-stone-800 text-stone-400'
                        }`}
                      >
                        {step3Done ? t('✓ ВЫПОЛНЕНО', '✓ DONE') : t('ОЖИДАЕТ', 'PENDING')}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-300 leading-relaxed mb-2.5">
                      {t(
                        'Возглавьте оборону скального аула, дайте залп из 18 нагрудных газырей или подорвите подземный контр-горн под сапой штурмующих!',
                        'Lead the defense of the rock aul, fire a volley from your 18 chest gazyrs, or detonate a subterranean counter-mine beneath the siege trench!'
                      )}
                    </p>
                    <button
                      onClick={() => {
                        const besieged =
                          naibates.find((n) => n.underSiege) ||
                          naibates.find((n) => n.id === 'salty') ||
                          naibates[0];
                        handleEnterTacticalDiorama(besieged);
                      }}
                      className="w-full py-1.5 px-2.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-200 font-mono text-[11px] font-bold transition cursor-pointer"
                    >
                      {t('→ Вступить в Тактическую Диораму Осады', '→ Enter Tactical Siege Diorama')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО: ТОЛКОВЫЙ ИСТОРИКО-МАТЕМАТИЧЕСКИЙ СЛОВАРЬ ИМАМАТА (DT_ImamatGlossary) */}
      {showGlossaryModal && <GlossaryModal {...{ glossaryCategory, glossarySearch, setGlossaryCategory, setGlossarySearch, setShowGlossaryModal, t }} />}

      {/* МОДАЛЬНОЕ ОКНО: ТЕЛЕМЕТРИЯ СЕССИИ STEAM PLAYTEST (ImamatPlaytestSessionTelemetry) */}
      {showTelemetryModal && <TelemetryModal {...{ buildPlaytestTelemetryPayload, handleDownloadPlaytestTelemetryJson, setShowTelemetryModal, t }} />}

      {/* МОДАЛЬНОЕ ОКНО: 12 ИСТОРИЧЕСЧЕСКИХ ДОСТИЖЕНИЙ STEAMWORKS (DT_SteamAchievements) */}
      {showAchievementsModal && (
        <AchievementsModal
          {...{
            handleOpenSteamOverlay,
            setShowAchievementsModal,
            steamAchievementsStatus,
            steamAppId: STEAM_APP_ID,
            steamCloudQuotaBytes: STEAM_CLOUD_QUOTA_BYTES,
            steamCloudStatus,
            steamRichPresence,
            steamRuntimeStatus,
            t,
            unlockedAchievementsCount
          }}
        />
      )}

      {/* МОДАЛЬНОЕ ОКНО: ПРОЦЕДУРНЫЙ ДИЕГЕТИЧЕСКИЙ ПУЛЬТ АДАПТИВНОГО ЗВУКА 4.0 (Спринт 8 / Gate 4) */}
      {showAudioMixerModal && <AudioMixerModal {...{ adaptiveMusicState, audioMixerConfig, lastActionLatencyMs, setAudioMixerConfig, setShowAudioMixerModal, setSoundEnabled, siegeState, soundEnabled, t }} />}

      {/* МОДАЛЬНОЕ ОКНО: КОНСТРУКТОР ИСТОРИЧЕСКИХ СЦЕНАРИЕВ И МОДОВ (DT_Naibates_1845 Mod Builder) */}
      {showModBuilderModal && <ModBuilderModal {...{ activeModNaibate, handleApplyCustomModScenario, handleApplyModPreset, handleExportCustomModJson, handleImportCustomModJson, handleUpdateModNaibate, modDraft, modImportJsonText, modSelectedNaibateId, setModDraft, setModImportJsonText, setModSelectedNaibateId, setShowModBuilderModal, t }} />}

      {/* МОДАЛЬНОЕ ОКНО: ХРОНОГРАФ АЛЬ-КАРАХИ — ПОКАДРОВЫЙ РЕПЛЕЙ КАМПАНИИ И AFTER-ACTION REPORT (M13) */}
      {showReplayModal && <ReplayModal {...{ campaignHistoryLog, getCommanderSealSummary, handleAutoSimulate20TurnsReplay, handleExportCommanderSealHtml, handleExportReplayJson, handleExportReplayMarkdown, replaySelectedTurnIdx, setReplaySelectedTurnIdx, setShowReplayBenchmarkOverlay, setShowReplayModal, showReplayBenchmarkOverlay, t }} />}

      {/* МОДАЛЬНОЕ ОКНО: ПОЛЕВОЙ УСТАВ МУДИРА И КАНОНИРА (MICROPROSE / SLITHERINE FIELD MANUAL — M14/M15) */}
      {showFieldManualModal && <FieldManualModal {...{ activeIronmanChallengeId, fieldManualSection, handleLaunchIronmanChallenge, naibates, setFieldManualSection, setShowFieldManualModal, t }} />}

      {/* МОДАЛЬНОЕ ОКНО: ИНТЕРАКТИВНЫЙ 60-СЕКУНДНЫЙ РАСКАДРОВЩИК И ПРЕВИЗ ТРЕЙЛЕРА STEAM (M16) */}
      {showTrailerPrevizModal && <TrailerPrevizModal {...{ handleExportSteamAnnouncementMd, handleExportTrailerEdl, handleExportTrailerSrt, setActiveTab, setShowTrailerPrevizModal, setTrailerAutoPlaying, setTrailerShotIdx, soundEnabled, t, trailerAutoPlaying, trailerShotIdx }} />}

      {/* МОДАЛЬНОЕ ОКНО: ИНТЕРАКТИВНЫЙ АРХИВ-МУЗЕЙ КАВКАЗСКОЙ ВОЙНЫ (M17 — showMuseumCodexModal) */}
      {showMuseumCodexModal && <MuseumCodexModal {...{ museumActiveGallery, museumSelectedExhibitId, setActiveTab, setMuseumActiveGallery, setMuseumSelectedExhibitId, setSelected3DTerrainId, setShowMuseumCodexModal, soundEnabled, t }} />}

      {/* СПРИНТ 19 (M19): МОДАЛЬНОЕ ОКНО ДИПЛОМАТИЧЕСКИХ ДЕПЕШ И ПЕРЕГОВОРОВ (BOA СТАМБУЛ / ТРАПЕЗУНД / МИЧИК 1855) */}
      {showDispatchesModal && <DispatchesModal {...{ diplomaticTone, executedDispatchesIds, feluccaEscortLevel, getDispatchResolutionPreview, handleExecuteDiplomaticDispatch, handleExportDiplomaticDispatchMd, selectedDispatchId, setDiplomaticTone, setFeluccaEscortLevel, setSelectedDispatchId, setShowDispatchesModal, soundEnabled, t }} />}

      {/* СПРИНТ 20 (M20): ЕДИНЫЙ КОМАНДНЫЙ ЦЕНТР ЗОЛОТОГО РЕЛИЗА v2.0 (MILESTONES M1–M20 • PASS 7/7) */}
      {showReleaseHubModal && (
        <ReleaseHubModal
          {...{
            handleExportCommanderSealHtml,
            handleExportSteamAnnouncementMd,
            handleOpenSteamOverlay,
            handleTogglePitchTour,
            setShowAchievementsModal,
            setShowAudioMixerModal,
            setShowDispatchesModal,
            setShowFieldManualModal,
            setShowModBuilderModal,
            setShowMuseumCodexModal,
            setShowReleaseHubModal,
            setShowReplayModal,
            setShowTrailerPrevizModal,
            steamCloudStatus,
            steamRichPresence,
            steamRuntimeStatus,
            t,
            unlockedAchievementsCount
          }}
        />
      )}

      {/* СПРИНТ 9 (ФАЗА 5): ВСТРОЕННЫЙ РЕПОРТ БАГОВ И ИДЕЙ ДЛЯ СЛЕПЫХ ПЛЕЙТЕСТОВ (ВОЛНЫ 1–2) */}
      {showPlaytestFeedbackModal && (
        <PlaytestFeedbackModal
          {...{
            activeScenarioId,
            activeTab,
            delayedConsequences,
            first5TurnsFunnel,
            lang,
            lastActionLatencyMs,
            localFeedbackReports,
            naibates,
            onSaveFeedbackReport: handleSavePlaytestFeedback,
            recentRuntimeErrors,
            resolvedPacketIds,
            resources,
            setShowPlaytestFeedbackModal,
            t,
            turn
          }}
        />
      )}

      {/* СПРИНТ 12 (ФАЗА 6 / GATE 6): КОМПАКТНАЯ ПОЛОСА ПУБЛИЧНОГО ДЕМО STEAM NEXT FEST (ТОЛЬКО В ДЕМО-РЕЖИМЕ) */}
      {nextFestDemoMode && !showTitleScreen && (
        <div className="bg-gradient-to-r from-[#241809] via-[#1c150c] to-[#0f1d17] border-b border-amber-400/50 px-3 py-1.5">
          <div className="max-w-[1640px] 2xl:max-w-[1880px] mx-auto flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-400 text-stone-950 font-extrabold uppercase text-[10px]">
                🎮 NEXT FEST DEMO
              </span>
              <span className="text-amber-100 font-bold">
                {t(
                  `Дарго 1845 • Ход ${nextFestDemoProgress.clampedTurn}/${nextFestDemoProgress.maxTurns} • Засада: ${nextFestDemoProgress.ambushCompleted ? '✓ 1/1' : '0/1'}`,
                  `Dargo 1845 • Turn ${nextFestDemoProgress.clampedTurn}/${nextFestDemoProgress.maxTurns} • Ambush: ${nextFestDemoProgress.ambushCompleted ? '✓ 1/1' : '0/1'}`
                )}
              </span>
              <span className="text-stone-400 hidden lg:inline">
                ({t(`Вехи: ${nextFestDemoProgress.completedMilestones}/${nextFestDemoProgress.totalMilestones}`, `Milestones: ${nextFestDemoProgress.completedMilestones}/${nextFestDemoProgress.totalMilestones}`)})
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={handleOpenDemoForestAmbush}
                className="px-2.5 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-400/55 text-emerald-200 font-bold cursor-pointer"
              >
                🌲 {t('Лесная засада (1/1)', 'Forest Ambush (1/1)')}
              </button>
              <button
                type="button"
                onClick={() => setShowNextFestOutroModal(true)}
                className="px-2.5 py-0.5 rounded bg-amber-500/25 hover:bg-amber-500/40 border border-amber-400/60 text-amber-200 font-bold cursor-pointer"
              >
                ⭐ {t('Итог Демо и Wishlist', 'Demo Summary & Wishlist')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ОСНОВНОЙ КОНТЕЙНЕР ВКЛАДОК */}
      <main className="max-w-[1640px] 2xl:max-w-[1880px] mx-auto px-2.5 mt-1.5">
        {/* ---------------- ВКЛАДКА 1: СТРАТЕГИЧЕСКАЯ КАРТА КАВКАЗА И УПРАВЛЕНИЕ НАИБАМИ ---------------- */}
        {activeTab === 'map' && <MapTab {...{ activeDivanPacket, activeEnvoys, activeEpisodeId, activeEpisodeModal, activeHeroArcModal, activeRelicIds, activeScenarioId, activeTacticalEncounter, animatedBattleVfx, arsenalItems, attachedPowder, attachedSilver, battleMemorials, capitalLabelEn, capitalLabelRu, capitalNaibateId, commandDockTab, cordonFortresses, crises, deepRaidTargets, delayedConsequences, dioramaTimeOfDay, episodesState, eraObjectivesProgress, fieldHospitals, first5TurnsFunnel, floatingCombatPopups, forestClearings, fortBuildMode, fullScreenTableMode, gameCameraTilt, handleActivateKunakSpyNetwork, handleActivateSingleKunakRing, handleArmSapperMine, handleAutoResolveEncounter, handleAwardOrder, handleBlowBridgesAheadOfColumns, handleBoostPowderMill, handleBuildFortificationAheadOfColumn, handleClaimPrologueReward, handleCommandUnitMoveToPoint, handleConcentrateArtilleryFire, handleCraftArsenalItem, handleCycleTimeOfDay, handleDefendForestClearing, handleDeployBatteryToRidge, handleDetonateAllSapperMines, handleDispatchAllUnitsDemo, handleDispatchMuhtasibToNaibate, handleDispatchPrisonerExchange, handleDisruptImperialColumn, handleEnactNizam, handleEnterTacticalDiorama, handleEnterTacticalEncounter, handleEscortDiplomaticMission, handleEscortMuhajirCaravan, handleEscortSupplyCaravan, handleEvacuateWoundedToHospitals, handleExecuteMichikGrandExchange, handleExecuteRadialCommand, handleFocusThreatHotspot, handleIgniteAllSignalBeacons, handleInterceptImperialColumn, handleInterceptImperialCourier, handleLaunchDeepCavalryRaid, handleLaunchGeneralCordonAssault, handleLaunchGeneralForestAmbush, handleLaunchNightSortie, handleMediateNaibRivalry, handleNextTurn, handleOpenBattlePrelude, handleOpenHeroArcModal, handleOrganizeMuhajirRelief, handleOttomanDiplomacy, handleOverdriveAllPowderMills, handleProclaimEraTriumph, handleProtectTranshumanceFlock, handleResolveDivanPacket, handleResolveEpisodePhase, handleResolveHeroArcChoice, handleResolveHistoricalCrisis, handleRetreatFromEncounter, handleSendEnvoy, handleSeverColumnSupplyLine, handleStrategicMapClick, handleStrategicMapMouseMove, handleSummonDivanPacket, handleToggleActiveRelic, handleToggleRiverBridge, handleToggleSignalBeacon, handleTriggerArtillerySmokeVfx, handleUpgradeFieldHospital, hapticsEnabled: audioMixerConfig.hapticsEnabled, heroArcsState, hoveredMapInfo, imperialAi, imperialHeldIds, kunakSpyRings, lastBattleAfterActionReport, leaderStressData, liveCannonSmokePlumes, liveDiplomaticMissions, liveFieldUnits: enrichedLiveFieldUnits, liveImperialColumns: enrichedImperialColumns, liveImperialCouriers, liveMapFortifications, liveMountainBatteries, liveMuhajirCaravans, liveMuhtasibPatrols, livePrisonerConvoys, liveSkirmishBursts, liveSupplyCaravans, liveTranshumanceFlocks, liveWeatherFronts, mapLayer, naibRivalries, naibates, nizams, orderExecutionCalc, powderMills, prologueRewardClaimed, radialWheelTarget, real3DTableMode, reconIntel, reconSources, resources, riverBridges, routeMode, sapperMines, selectedFieldUnit, selectedFortBlueprintId, selectedNaibate, selectedNaibateId, selectedOrderType, selectedUnitId, setActiveDivanPacket, setActiveEpisodeId, setActiveEpisodeModal, setActiveHeroArcModal, setActiveTab, setActiveTacticalEncounter, setAnimatedBattleVfx, setAttachedPowder, setAttachedSilver, setCommandDockTab, setFortBuildMode, setFullScreenTableMode, setGameCameraTilt, setHoveredMapInfo, setImperialAi, setLastBattleAfterActionReport, setMapLayer, setRadialWheelTarget, setReal3DTableMode, setRouteMode, setSelectedFortBlueprintId, setSelectedNaibateId, setSelectedOrderType, setSelectedUnitId, setShowPlaytestFeedbackModal, setShowSchematicLabels, setShowThreatRadarOverlay, setTableQuickDrawer, setTerrainSimSpeed, setWeatherOverlayEnabled, showSchematicLabels, showThreatRadarOverlay, signalBeacons, soundEnabled, t, tableQuickDrawer, tactileFeedback, terrainProbe, terrainSimSpeed, totalBatterySalvos, totalCaravansDelivered, totalCouriersIntercepted, totalDeepRaidsCompleted, totalDiplomaticMissionsArrived, totalFlockMigrations, totalForestAmbushesTriggered, totalFortressesStormed, totalMapInterceptions, totalMillBatchesProduced, totalMinesDetonatedOnMap, totalMuhajirCaravansSaved, totalMuhtasibInspections, totalPrisonerExchangesCompleted, totalWoundedRecoveredOnMap, triggerTactileCue, turn, turnActionQuota, turnFocusEvent, unitMovementLog, unlockedRelicIds, weatherOverlayEnabled }} />}

        {/* ---------------- ВКЛАДКА 2: КОДЕКС НИЗАМОВ ИМАМА ШАМИЛЯ ---------------- */}
        {activeTab === 'nizams' && <NizamsTab {...{ courtCases, filteredNizams, handleEnactNizam, handleMediateNaibRivalry, handleResolveCourtCase, naibRivalries, selectedPillar, setSelectedPillar, t, turn, turnActionQuota }} />}

        {/* ---------------- ВКЛАДКА 3: ДИПЛОМАТИЯ СО СТАМБУЛОМ И СЕРЕБРЯНЫЕ ОРДЕНА ШАМИЛЯ ---------------- */}
        {activeTab === 'diplomacy' && <DiplomacyTab {...{ delayedConsequences, handleAwardOrder, handleOttomanDiplomacy, handleSummonDivanPacket, naibRivalries, naibates, resolvedPacketIds, resources, selectedNaibate, setActiveTab, setSelectedNaibateId, t, turn }} />}

        {/* ---------------- ВКЛАДКА 4: БЕЗСЕТОЧНЫЙ ТАКТИЧЕСКИЙ СИМУЛЯТОР (ОСАДА МИЛЮТИНА + ЛЕСНОЙ СПЛАЙН) ---------------- */}
        {activeTab === 'siege' && <SiegeTab {...{ active3DTerrain, activeTacticalEncounter, activeTacticalNaibate, ambushLog, ambushStep, autoResolveForecast, cam3D, canvas3DRef, convoyStruckInBattle, deployedSector, deploymentStance, enemyAssaultVector, forestStealthPct, handleApplyTacticalBattleResult, handleAutoResolveTacticalBattle, handleCanvasPointerDown, handleCanvasPointerMove, handleCanvasPointerUp, handleChangeDeploymentStance, handleEnterTacticalDiorama, handleLaunch3DProjectile, handleReloadGazyrs, handleResetSplineAmbush, handleSplineAmbushAction, handleTacticalAction, liveImperialColumns: enrichedImperialColumns, mortarAngle3D, naibates, selectedSiegeZone, selectedSplineIdx, setActiveTab, setCam3D, setDeployedSector, setMortarAngle3D, setSelectedSiegeZone, setSelectedSplineIdx, setTacticalMode, setTacticalPaused, setUnicornAngle3D, siegeInline3D, setSiegeInline3D, siegeState, soundEnabled, splineEchelons, splineSegments, stats3D, t, tacticalBattleSession, tacticalMode, tacticalModifiers, tacticalPaused, turnActionQuota, unicornAngle3D }} />}

        {/* ---------------- ВКЛАДКА 5: АРСЕНАЛ ВЕДЕНО, ЛИТЕЙНЫЙ ДВОР И ШТАБ ПРОТИВНИКА ---------------- */}
        {activeTab === 'arsenal' && <ArsenalTab {...{ arsenalItems, handleCraftArsenalItem, handleDisruptImperialColumn, imperialAi, naibates, t }} />}

        {/* ---------------- ВКЛАДКА 6: ХРОНИКА МУХАММЕД-ТАХИРА АЛЬ-КАРАХИ ---------------- */}
        {activeTab === 'chronicle' && (
          <ChronicleTab
            {...{
              battleMemorials,
              chronicleFilter,
              filteredChronicle,
              onFocusMemorialOnMap: (mem) => {
                if (mem?.naibateId) setSelectedNaibateId(mem.naibateId);
                setActiveTab('map');
                if (mem?.x && mem?.y) {
                  spawnFloatingCombatPopup(
                    mem.x,
                    mem.y,
                    `⚔️ ${t(mem.titleRu, mem.titleEn)}`,
                    t(mem.spoilsRu, mem.spoilsEn),
                    '#fbbf24'
                  );
                }
              },
              setChronicleFilter,
              t
            }}
          />
        )}

        {/* ---------------- ВКЛАДКА 7: ИСТОРИЧЕСКИЕ РАЗВИЛКИ (1846–1855) И МОСТ В UNREAL ENGINE 5 ---------------- */}
        {activeTab === 'crises' && <CrisesTab {...{ activeEpisodeId, copyTextSafe, crises, episodesState, handleResolveEpisodePhase, handleResolveHistoricalCrisis, leaderStressData, nizamModifiers, resources, setActiveEpisodeId, setActiveEpisodeModal, setActiveTab, setUeExportFormat, studioMode, t, turn, turnActionQuota, ueExportFormat, unrealEngineExportCode }} />}

        {/* ---------------- ВКЛАДКА 8: ВЫБОР КАМПАНИИ (1839–1859), СОВЕТ УЧЁНЫХ И ВЕРДИКТ ИСТОРИИ ---------------- */}
        {activeTab === 'verdict' && (
          <VerdictTab
            {...{
              activatedFigurePerks,
              activeScenarioId,
              arsenalBatchesCount: arsenalItems.reduce((s, a) => s + (a.completedCount || 0), 0),
              battleMemorialsCount: battleMemorials.length,
              campaignAudit,
              epilogueDecisionsMade,
              handleApplyCounterfactualModel,
              handleLoadCampaignState,
              handlePerformTarikatPractice,
              handleSaveCampaignState,
              handleSelectScenario,
              setActiveTab,
              studioMode,
              t,
              veteranSquadronsCount: liveFieldUnits.filter((u) => (u.vetXp ?? 0) >= 2).length
            }}
          />
        )}

        {/* ---------------- ВКЛАДКА 9: ИИ-СИМУЛЯТОР МОНТЕ-КАРЛО, ЧЕК-ЛИСТ ЭТАПА 1 И ИСТОРИЧЕСКИЙ ЭПИЛОГ (1859–1877) ---------------- */}
        {activeTab === 'sim_epilogue' && <SimEpilogueTab {...{ campaignAudit, epilogueDecisionsMade, handleChooseEpilogueDecision, handleLoadCampaignState, handleRunMonteCarloSimulation, handleSaveCampaignState, leaderStressData, monteCarloReport, naibates, nizams, orderExecutionCalc, playtestTelemetry, resources, setActiveTab, setFieldManualSection, setShowFieldManualModal, setSimDifficultyWeight, setSimRunsCount, simDifficultyWeight, simRunsCount, studioMode, t, turn }} />}

        {/* ---------------- ВКЛАДКА 10: АРХИВ ЛИЧНОСТЕЙ, БАЛЛИСТИКА 18 ГАЗЫРЕЙ И ИИ-ПРОМПТЫ ---------------- */}
        {activeTab === 'archive_ballistics' && <ArchiveBallisticsTab {...{ activatedFigurePerks, ballisticsConfig, ballisticsSimData, copyTextSafe, handleActivateFigurePerk, selectedFigureId, selectedHistoricalFigure, setActiveTab, setBallisticsConfig, setSelectedFigureId, studioMode, t }} />}

        {/* ---------------- ВКЛАДКА 11: ИНТЕРАКТИВНЫЙ 3D-ПОЛИГОН И РАЗРЕЗ СКАЛЫ МИЛЮТИНА (ЭТАП 2) ---------------- */}
        {activeTab === '3d_tactical' && <Tactical3DTab {...{ active3DTerrain, cam3D, canvas3DRef, deploymentStance, forestStealthPct, handleCanvasPointerDown, handleCanvasPointerMove, handleCanvasPointerUp, handleLaunch3DProjectile, handleTacticalAction, mortarAngle3D, selected3DTerrainId, setActiveTab, setCam3D, setMortarAngle3D, setSelected3DTerrainId, setTacticalPaused, setUnicornAngle3D, siegeState, soundEnabled, stats3D, t, tacticalPaused, unicornAngle3D }} />}
      </main>

      {/* ===== ИГРОВЫЕ ОВЕРЛЕИ: заставка смены хода, меню паузы (Esc) и титульный экран ===== */}
      <TurnTransitionOverlay
        turn={turn}
        dateLabel={t(SEASONS[(turn - 1) % SEASONS.length], SEASONS_EN[(turn - 1) % SEASONS_EN.length])}
        deltas={resourceDeltas}
        t={t}
        suppressed={showTitleScreen || spectatorMode.active || pitchTour.active}
      />
      {campaignClimaxState && (
        <div
          className="fixed inset-0 z-[88] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative hud-walnut-bezel bg-[#130f0b] border-2 border-amber-400/75 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 hud-fade-up">
            <span className="hud-brass-corner tl" />
            <span className="hud-brass-corner tr" />
            <span className="hud-brass-corner bl" />
            <span className="hud-brass-corner br" />
            <div className="flex items-center justify-between gap-3 border-b border-amber-500/30 pb-3">
              <div className="flex items-center gap-2 text-xs font-serif uppercase tracking-[0.22em] text-amber-400 font-bold">
                <WaxSealIcon className="w-4 h-4 text-amber-400" />
                <span>
                  {campaignClimaxState.outcome === 'triumph'
                    ? t('ВЕРДИКТ ЛЕТОПИСИ АЛЬ-КАРАХИ • ТРИУМФ', 'CHRONICLE VERDICT • TRIUMPH')
                    : t('РОКОВОЙ РУБЕЖ • ВЕРХНИЙ ГУНИБ', 'FATEFUL STAND • UPPER GUNIB')}
                </span>
              </div>
              <span className="hud-num px-2.5 py-0.5 rounded bg-amber-500/20 border border-amber-400/50 text-amber-200 text-xs font-bold">
                {t(`Ход #${campaignClimaxState.turn}`, `Turn #${campaignClimaxState.turn}`)} • {campaignClimaxState.victoryScore}%
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-serif font-extrabold text-amber-100 leading-snug">
                {campaignClimaxState.outcome === 'triumph' ? '🏆 ' : '🏔️ '}
                {t(campaignClimaxState.titleRu, campaignClimaxState.titleEn)}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                {t(campaignClimaxState.summaryRu, campaignClimaxState.summaryEn)}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 bg-[#0c0907] border border-amber-600/30 rounded-xl p-3 text-center">
              <div>
                <div className="text-[10px] font-serif uppercase text-stone-400">{t('Арсенал Ведено', 'Vedeno Powder')}</div>
                <div className="hud-num text-base font-bold text-amber-300">{resources.gunpowder} {t('пуд.', 'p.')}</div>
              </div>
              <div>
                <div className="text-[10px] font-serif uppercase text-stone-400">{t('Авторитет Имама', 'Imam Authority')}</div>
                <div className="hud-num text-base font-bold text-emerald-300">{resources.authority}%</div>
              </div>
              <div>
                <div className="text-[10px] font-serif uppercase text-stone-400">{t('Свободных наибств', 'Free Naibates')}</div>
                <div className="hud-num text-base font-bold text-sky-300">
                  {naibates.filter((n) => !n.underSiege).length}/{naibates.length}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-amber-500/25">
              <button
                onClick={() => {
                  setClimaxDismissed(true);
                  setCampaignClimaxState(null);
                  setActiveTab('verdict');
                }}
                className="px-3.5 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/60 text-amber-200 font-serif text-xs font-bold cursor-pointer transition"
              >
                📜 {t('К Вердикту Истории и Печати', 'Open Historical Verdict')}
              </button>
              <button
                onClick={() => {
                  setClimaxDismissed(true);
                  setCampaignClimaxState(null);
                }}
                className="px-4 py-2 rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-stone-950 font-serif text-xs font-extrabold cursor-pointer shadow-lg"
              >
                ▶ {t('Продолжить свободную кампанию на столе', 'Continue Free Campaign on Table')}
              </button>
            </div>
          </div>
        </div>
      )}
      {showPauseMenu && (
        <PauseMenu
          t={t}
          soundEnabled={soundEnabled}
          saveSlotsMeta={saveSlotsMeta}
          onSaveSlot={(slotId) => {
            handleSaveCampaignState(slotId);
            setShowPauseMenu(false);
          }}
          onLoadSlot={(slotId) => {
            handleLoadCampaignState(slotId);
            setShowPauseMenu(false);
          }}
          onExportSaveFile={() => {
            handleExportImamatSaveFile();
          }}
          onImportSaveFile={async (file) => {
            await handleImportImamatSaveFile(file);
            setShowPauseMenu(false);
          }}
          onResume={() => setShowPauseMenu(false)}
          onSave={() => {
            handleSaveCampaignState(1);
            setShowPauseMenu(false);
          }}
          onLoad={() => {
            handleLoadCampaignState();
            setShowPauseMenu(false);
          }}
          onToggleSound={() => setSoundEnabled((v) => !v)}
          onOpenGlossary={() => {
            setShowPauseMenu(false);
            setShowGlossaryModal(true);
          }}
          onOpenMuseum={() => {
            setShowPauseMenu(false);
            setShowMuseumCodexModal(true);
          }}
          onOpenAudioMixer={() => {
            setShowPauseMenu(false);
            setShowAudioMixerModal(true);
          }}
          spectatorActive={spectatorMode.active}
          onToggleSpectator={() => {
            setShowPauseMenu(false);
            if (spectatorMode.active) {
              setSpectatorMode((prev) => ({ ...prev, active: false, autoPlay: false }));
            } else {
              handleStartSpectatorCampaign();
            }
          }}
          onTitle={() => {
            setShowPauseMenu(false);
            setShowTitleScreen(true);
          }}
        />
      )}
      {/* СПРИНТ 12 (ФАЗА 6 / GATE 6): ФИНАЛЬНЫЙ ЭКРАН STEAM NEXT FEST PLAYABLE DEMO + WISHLIST CTA */}
      {showNextFestOutroModal && (
        <NextFestDemoOutroModal
          {...{
            demoProgress: nextFestDemoProgress,
            handleContinueFullVersionFromDemo,
            handleExportDemoCarryOverSave,
            handleOpenFeedbackFromDemo: () => {
              setShowNextFestOutroModal(false);
              setShowPlaytestFeedbackModal(true);
            },
            handleOpenSteamWishlist,
            setShowNextFestOutroModal,
            t
          }}
        />
      )}

      {showTitleScreen && (
        <TitleScreen
          t={t}
          lang={lang}
          setLang={setLang}
          hasSave={hasSavedCampaign}
          saveMetaSummary={saveMetaSummary}
          scenarios={CAMPAIGN_SCENARIOS}
          activeScenarioId={activeScenarioId}
          onSelectScenario={handleSelectScenario}
          difficultyWeight={simDifficultyWeight}
          onChangeDifficulty={setSimDifficultyWeight}
          onContinue={() => setShowTitleScreen(false)}
          onStartNextFestDemo={handleStartNextFestDemo}
          onStartSpectator={handleStartSpectatorCampaign}
          onLoadSave={() => {
            handleLoadCampaignState();
            setShowTitleScreen(false);
          }}
          onOpenManual={() => {
            setShowTitleScreen(false);
            setShowFieldManualModal(true);
          }}
        />
      )}
    </div>
    </HudLangContext.Provider>
  );
}
