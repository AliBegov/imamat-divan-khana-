// Source/ImamatWargame/Public/Strategic/ImamatStrategicTypes.h
#pragma once

#include "CoreMinimal.h"
#include "Engine/DataTable.h"
#include "ImamatStrategicTypes.generated.h"

UENUM(BlueprintType)
enum class ENaibOrderType : uint8
{
    RaidSupplyLine     UMETA(DisplayName = "Ночной набег на царский обоз и кордон"),
    FortifyBlindages   UMETA(DisplayName = "Возвести подземные блиндажи в 3-4 наката"),
    CollectZakat       UMETA(DisplayName = "Собрать зейкат, селитру и провиант с террас"),
    MobilizeMurtazeks  UMETA(DisplayName = "Созвать ополчение муртазеков (1 с 10 дворов)")
};

UENUM(BlueprintType)
enum class EEnvoyRouteMode : uint8
{
    SecretMountainPath UMETA(DisplayName = "Тайная горная тропа (Низкий риск перехвата)"),
    FastImperialRoad   UMETA(DisplayName = "Быстрый тракт (-1 ход, риск засады пластунов)")
};

UENUM(BlueprintType)
enum class EImperialDoctrine : uint8
{
    VorontsovDeepThrust  UMETA(DisplayName = "М. С. Воронцов: Экспедиция в сердце гор (Дарго)"),
    ArgutinskySiegeRam   UMETA(DisplayName = "М. З. Аргутинский: Осадный таран и минная война"),
    FreytagFlyingColumns UMETA(DisplayName = "Р. К. Фрейтаг: Летучие колонны и перехват гонцов"),
    EvdokimovForestAxe   UMETA(DisplayName = "Н. И. Евдокимов: Система топора и блокада Джайляу")
};

UENUM(BlueprintType)
enum class ENizamPillar : uint8
{
    Judicial UMETA(DisplayName = "Судебная и административная реформа (Шариат и Мухтасибы)"),
    Military UMETA(DisplayName = "Военная реформа (Муртазеки, Порох и Серебряные ордена)"),
    Tax      UMETA(DisplayName = "Налоговая реформа (Казна Байт аль-маль, Хумс и Террасы)"),
    Family   UMETA(DisplayName = "Семейная и социальная реформа (Калым и Призрение вдов)")
};

UENUM(BlueprintType)
enum class ETacticalBattleMode : uint8
{
    MountainSiegeCutaway UMETA(DisplayName = "Горная осада с геодезическим разрезом скалы (Салты 1847 / Ахульго 1839 / Гуниб 1859)"),
    ForestSplineAmbush   UMETA(DisplayName = "Сплайновая лесная засада в Чечне (Ичкерия / Сухарная экспедиция 1845)")
};

/**
 * Четырёхмерная матрица личности наиба для проверки выполнения приказов Шамиля
 */
USTRUCT(BlueprintType)
struct FNaibPsychologyMatrix
{
    GENERATED_BODY()

    /** Иман: религиозное рвение и преданность делу Газавата [0..100] */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Psychology", meta = (ClampMin = "0.0", ClampMax = "100.0"))
    float Iman = 80.0f;

    /** Смелость: решительность в бою и готовность стоять в осаде до конца [0..100] */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Psychology", meta = (ClampMin = "0.0", ClampMax = "100.0"))
    float Courage = 88.0f;

    /** Алчность: склонность требовать серебряные субсидии и утаивать хумс [0..100] */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Psychology", meta = (ClampMin = "0.0", ClampMax = "100.0"))
    float Greed = 35.0f;

    /** Гордыня: честолюбие, обидчивость и ревность к возвышению других наибов [0..100] */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Psychology", meta = (ClampMin = "0.0", ClampMax = "100.0"))
    float Pride = 60.0f;
};

/**
 * Прозрачная декомпозиция вероятности выполнения приказа P(exec) для UI-тултипа Диван-ханы
 * Закрывает риск "Opaque Math" (игрок видит каждый фактор до отправки гонца)
 */
USTRUCT(BlueprintType)
struct FOrderProbabilityBreakdown
{
    GENERATED_BODY()

    UPROPERTY(BlueprintReadOnly, Category = "Breakdown")
    float EffectiveIman = 80.0f;

    UPROPERTY(BlueprintReadOnly, Category = "Breakdown")
    float BaseImanContribution = 41.6f;

    UPROPERTY(BlueprintReadOnly, Category = "Breakdown")
    float BaseCourageContribution = 29.9f;

    UPROPERTY(BlueprintReadOnly, Category = "Breakdown")
    float SupplyBonus = 0.0f;

    UPROPERTY(BlueprintReadOnly, Category = "Breakdown")
    float GreedPenalty = 0.0f;

    UPROPERTY(BlueprintReadOnly, Category = "Breakdown")
    float PridePenalty = 0.0f;

    UPROPERTY(BlueprintReadOnly, Category = "Breakdown")
    float LeaderStressPenalty = 0.0f;

    UPROPERTY(BlueprintReadOnly, Category = "Breakdown")
    float FinalExecutionChancePercent = 75.0f;

    UPROPERTY(BlueprintReadOnly, Category = "Breakdown")
    float ConvoyInterceptPenalty = 0.0f;

    UPROPERTY(BlueprintReadOnly, Category = "Breakdown")
    float FinalInterceptRiskPercent = 10.0f;

    UPROPERTY(BlueprintReadOnly, Category = "Breakdown")
    int32 EstimatedTravelTurns = 2;
};

/**
 * Запись о наибстве для DataTable (DT_Naibates_1845)
 */
USTRUCT(BlueprintType)
struct FNaibateRegionRow : public FTableRowBase
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Identity")
    FName NaibateID;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Identity")
    FText RegionName;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Identity")
    FText GeographicSubregion;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Identity")
    FText NaibName;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Identity")
    FText NaibTitle;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Identity", meta = (MultiLine = true))
    FText HistoricalBio;

    /** Координаты узла на глобальном ландшафте UE 5.5 */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Geography")
    FVector WorldCoordinates = FVector::ZeroVector;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Geography")
    int32 BaseTravelTurns = 2;

    /** Средний уклон ущелья в градусах по данным NASA SRTM */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Geography")
    float SlopeDegrees = 70.0f;

    /** Продуктивность искусственных горных террас [0..100%] */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Economy")
    float TerraceYieldPercent = 65.0f;

    /** Сохраняется ли доступ отар к альпийским лугам Джайляу и зимним кутанам */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Economy")
    bool bPastureAccessOpen = true;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Forces")
    int32 GarrisonInfantry = 1400;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Forces")
    int32 MurtazekCavalry = 450;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Supply")
    int32 GunpowderPoods = 45;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Supply")
    int32 ProvisionsMeasures = 400;

    /** Военный нажим царских колонн на округ [0..100%] */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Warfare")
    float ImperialPressure = 58.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Warfare")
    bool bUnderSiege = false;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Psychology")
    FNaibPsychologyMatrix Traits;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Honors")
    TArray<FString> OrdersAwarded;
};

/**
 * Закон из Кодекса Низамов Шамиля (DT_ShamilNizams)
 */
USTRUCT(BlueprintType)
struct FShamilNizamRow : public FTableRowBase
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Nizam")
    FName NizamID;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Nizam")
    ENizamPillar Pillar = ENizamPillar::Judicial;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Nizam")
    FText Title;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Nizam")
    FText YearAndLocation;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Nizam", meta = (MultiLine = true))
    FText HistoricalText;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Cost")
    float CostAuthority = 12.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Cost")
    int32 CostSilver = 70;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "State")
    bool bEnacted = false;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Modifiers")
    float StressReduction = 6.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Modifiers")
    float GlobalImanBonus = 5.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Modifiers")
    float GreedPenaltyReductionPercent = 0.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Modifiers")
    float PridePenaltyReductionPercent = 0.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Modifiers")
    int32 PowderPerTurnBonus = 0;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Modifiers")
    int32 ProvisionsPerTurnBonus = 0;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Modifiers")
    int32 SilverPerTurnBonus = 0;
};

/**
 * Серебряные ордена и знаки отличия Имамата (DT_ShamilOrders)
 */
USTRUCT(BlueprintType)
struct FShamilOrderRow : public FTableRowBase
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Order")
    FName OrderID;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Order")
    FText OrderName;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Order")
    FText ArabicMotto;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Order")
    FText CraftDescription;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Cost")
    int32 SilverCost = 95;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Modifiers")
    float ImanBonus = 12.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Modifiers")
    float PrideReduction = 14.0f;
};

/**
 * Дипломатические миссии в Стамбул, Трабзон и Каир (DT_OttomanDiplomacy)
 */
USTRUCT(BlueprintType)
struct FOttomanDiplomacyRow : public FTableRowBase
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Diplomacy")
    FName OptionID;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Diplomacy")
    FText Title;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Diplomacy", meta = (MultiLine = true))
    FText Description;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Cost")
    int32 CostSilver = 110;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Rewards")
    int32 RewardPowderPoods = 25;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Rewards")
    int32 RewardSilverRubles = 260;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Rewards")
    float RewardSupportPercent = 14.0f;
};

/**
 * Исторические сценарии кампаний (DT_CampaignScenarios)
 */
USTRUCT(BlueprintType)
struct FCampaignScenarioRow : public FTableRowBase
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Scenario")
    FName ScenarioID;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Scenario")
    FText YearLabel;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Scenario")
    FText Subtitle;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Scenario", meta = (MultiLine = true))
    FText GoalDescription;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "InitialState")
    int32 InitialGunpowderPoods = 195;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "InitialState")
    int32 InitialProvisionsMeasures = 1420;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "InitialState")
    int32 InitialSilverRubles = 680;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "InitialState")
    float InitialAuthorityPercent = 86.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "InitialState")
    float InitialOttomanSupportPercent = 48.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "InitialState")
    float PressureModifier = 0.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "InitialState")
    EImperialDoctrine StartingGeneralDoctrine = EImperialDoctrine::VorontsovDeepThrust;
};

/**
 * Топографические 3D-полигоны для тактического режима (DT_Tactical3DTerrains)
 */
USTRUCT(BlueprintType)
struct FTactical3DTerrainRow : public FTableRowBase
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Terrain")
    FName TerrainID;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Terrain")
    FText Title;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Terrain")
    FText Subtitle;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Terrain")
    ETacticalBattleMode BattleMode = ETacticalBattleMode::MountainSiegeCutaway;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Geodesy")
    float CliffSteepness = 1.35f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Geodesy")
    float GorgeDepth = 1.15f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Geodesy")
    int32 TerraceSteps = 3;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Geodesy")
    FText ElevationLabel;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Geodesy")
    float DeadZoneAngleDegrees = 39.0f;
};

/**
 * Сегменты сплайнового коридора лесной засады в Ичкерии (DT_SplineAmbushSegments)
 */
USTRUCT(BlueprintType)
struct FSplineAmbushSegmentRow : public FTableRowBase
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ambush")
    FName SegmentID;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ambush")
    FText SegmentName;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ambush")
    FText ElevationLabel;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ambush")
    FText WidthDescription;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ambush")
    int32 InitialAbatisBarricades = 1;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ambush")
    int32 InitialAmbushSquads = 2;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ambush")
    FVector MapCoordinates = FVector::ZeroVector;
};

/**
 * Исторические развилки и судебные казусы Диван-ханы (DT_HistoricalCrises)
 */
USTRUCT(BlueprintType)
struct FHistoricalCrisisRow : public FTableRowBase
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Crisis")
    FName CrisisID;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Crisis")
    FText YearLabel;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Crisis")
    FText Title;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Crisis", meta = (MultiLine = true))
    FText HistoricalContext;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "OptionA")
    FText OptionALabel;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "OptionA")
    int32 OptionAPowderDelta = 0;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "OptionA")
    int32 OptionASilverDelta = 0;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "OptionA")
    int32 OptionAProvisionsDelta = 0;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "OptionA")
    float OptionAAuthorityDelta = 0.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "OptionA")
    FName OptionATargetNaibateID;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "OptionA")
    float OptionAImanDelta = 0.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "OptionA")
    float OptionAPrideDelta = 0.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "OptionB")
    FText OptionBLabel;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "OptionB")
    int32 OptionBPowderDelta = 0;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "OptionB")
    int32 OptionBSilverDelta = 0;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "OptionB")
    int32 OptionBProvisionsDelta = 0;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "OptionB")
    float OptionBAuthorityDelta = 0.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "OptionB")
    FName OptionBTargetNaibateID;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "OptionB")
    float OptionBImanDelta = 0.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "OptionB")
    float OptionBPrideDelta = 0.0f;
};

/**
 * Контекст перехода из 70% Гранд-стратегии в 30% 3D-Тактический бой (Осада Салтов / Засада Дарго)
 */
USTRUCT(BlueprintType)
struct FTacticalBattleContext
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Bridge")
    FName NaibateID = FName("gergebil");

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Bridge")
    FName TerrainID = FName("salty_1847");

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Bridge")
    ETacticalBattleMode BattleMode = ETacticalBattleMode::MountainSiegeCutaway;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Bridge")
    int32 AvailableGunpowderPoods = 48;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Bridge")
    int32 GarrisonInfantry = 1380;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Bridge")
    int32 MurtazekCavalry = 410;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Bridge")
    int32 GazyrChargesPerFighter = 18;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Bridge")
    FNaibPsychologyMatrix CommanderTraits;
};

/**
 * Итог 3D-Тактического боя для возврата в UImamatStrategicSubsystem
 */
USTRUCT(BlueprintType)
struct FTacticalBattleResult
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Bridge")
    FName NaibateID = FName("gergebil");

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Bridge")
    bool bImamatVictory = true;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Bridge")
    int32 ExpendedGunpowderPoods = 18;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Bridge")
    int32 CapturedPowderPoods = 25;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Bridge")
    int32 CapturedSilverRubles = 80;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Bridge")
    int32 GarrisonCasualties = 110;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Bridge")
    float ImperialPressureDrop = 28.0f;
};

/**
 * Активный конный гонец с печатью Шамиля и вьюками пороха на горном маршруте
 */
USTRUCT(BlueprintType)
struct FEnvoyCaravanPacket
{
    GENERATED_BODY()

    UPROPERTY(BlueprintReadOnly, Category = "Envoy")
    FGuid EnvoyID;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Envoy")
    FName TargetNaibateID;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Envoy")
    ENaibOrderType OrderType = ENaibOrderType::RaidSupplyLine;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Envoy")
    EEnvoyRouteMode RouteMode = EEnvoyRouteMode::SecretMountainPath;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Envoy")
    int32 AttachedPowderPoods = 15;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Envoy")
    int32 AttachedSilverRubles = 40;

    UPROPERTY(BlueprintReadOnly, Category = "Envoy")
    float ExecutionChancePercent = 80.0f;

    UPROPERTY(BlueprintReadOnly, Category = "Envoy")
    float InterceptRiskPercent = 10.0f;

    UPROPERTY(BlueprintReadOnly, Category = "Envoy")
    int32 TurnsLeft = 2;

    UPROPERTY(BlueprintReadOnly, Category = "Envoy")
    int32 TotalTurns = 2;
};

/**
 * Результаты прогона серии партий методом Монте-Карло для калибровки баланса
 */
USTRUCT(BlueprintType)
struct FMonteCarloBalanceReport
{
    GENERATED_BODY()

    UPROPERTY(BlueprintReadOnly, Category = "Balance")
    int32 TotalSimulatedCampaigns = 100;

    UPROPERTY(BlueprintReadOnly, Category = "Balance")
    float ImamatSurvivalRatePercent = 68.0f;

    UPROPERTY(BlueprintReadOnly, Category = "Balance")
    float AverageFinalLeaderStress = 54.0f;

    UPROPERTY(BlueprintReadOnly, Category = "Balance")
    float PowderBottleneckFrequencyPercent = 41.0f;
};

/**
 * Строка толкового историко-математического словаря Имамата (DT_ImamatGlossary)
 */
USTRUCT(BlueprintType)
struct FImamatGlossaryRow : public FTableRowBase
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Glossary")
    FName TermID;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Glossary")
    FText TermNameRu;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Glossary")
    FText ArabicScript;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Glossary")
    FText Category;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Glossary", meta = (MultiLine = true))
    FText HistoricalDescription;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Glossary", meta = (MultiLine = true))
    FText GameplayFormulaInvariant;
};

/**
 * Сводка телеметрии сессии игрока для Steam Playtest (ImamatPlaytestSessionTelemetry)
 */
USTRUCT(BlueprintType)
struct FImamatPlaytestTelemetry
{
    GENERATED_BODY()

    UPROPERTY(BlueprintReadOnly, Category = "Telemetry")
    FString BuildVersion = TEXT("0.5.0-M5-PlaytestReady");

    UPROPERTY(BlueprintReadOnly, Category = "Telemetry")
    int32 TurnsSurvived = 1;

    UPROPERTY(BlueprintReadOnly, Category = "Telemetry")
    int32 TotalEnvoysDispatched = 0;

    UPROPERTY(BlueprintReadOnly, Category = "Telemetry")
    int32 Tier15ConvoysCount = 0;

    UPROPERTY(BlueprintReadOnly, Category = "Telemetry")
    int32 Tier30ConvoysCount = 0;

    UPROPERTY(BlueprintReadOnly, Category = "Telemetry")
    int32 Tier45ConvoysCount = 0;

    UPROPERTY(BlueprintReadOnly, Category = "Telemetry")
    int32 EnvoysInterceptedCount = 0;

    UPROPERTY(BlueprintReadOnly, Category = "Telemetry")
    int32 NaibOrdersObeyedCount = 0;

    UPROPERTY(BlueprintReadOnly, Category = "Telemetry")
    int32 NaibOrdersRefusedCount = 0;

    UPROPERTY(BlueprintReadOnly, Category = "Telemetry")
    int32 TacticalDioramasEntered = 0;

    UPROPERTY(BlueprintReadOnly, Category = "Telemetry")
    int32 CamoufletsDetonated = 0;

    UPROPERTY(BlueprintReadOnly, Category = "Telemetry")
    int32 GazyrDepletionMeleeTriggered = 0;
};

/**
 * Строка двуязычной таблицы локализации (RU / EN) для системы LOCTEXT / String Table в UE 5.5
 */
USTRUCT(BlueprintType)
struct FImamatLocalizationRow : public FTableRowBase
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Localization")
    FName Key;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Localization")
    FString Namespace = TEXT("Imamat_UI");

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Localization", meta = (MultiLine = true))
    FText SourceStringRU;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Localization", meta = (MultiLine = true))
    FText TranslationEN;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Localization")
    FString HistoricalContextNote;
};

/**
 * Строка исторического достижения Steamworks (DT_SteamAchievements) для интеграции с OnlineSubsystemSteam
 */
USTRUCT(BlueprintType)
struct FImamatAchievementRow : public FTableRowBase
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Achievements")
    FName AchievementID;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Achievements")
    FString Category = TEXT("Tactical");

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Achievements")
    FText TitleRU;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Achievements")
    FText TitleEN;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Achievements", meta = (MultiLine = true))
    FText DescriptionRU;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Achievements", meta = (MultiLine = true))
    FText DescriptionEN;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Achievements", meta = (MultiLine = true))
    FString HistoricalArchiveSource;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Achievements")
    float TargetGlobalUnlockRatePct = 25.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Achievements")
    bool bIsHiddenSecret = false;
};

/**
 * Строка судебного казуса Шариата против Адата (DT_CourtCases_1845)
 */
USTRUCT(BlueprintType)
struct FImamatCourtCaseRow : public FTableRowBase
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Court")
    FName CaseID;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Court")
    FText Title;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Court")
    FText TriggerCondition;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Court", meta = (MultiLine = true))
    FText Description;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Court")
    FName TargetNaibateID;
};
