// Source/ImamatWargame/Public/Strategic/ImamatStrategicSubsystem.h
#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "Math/RandomStream.h"
#include "Strategic/ImamatStrategicTypes.h"
#include "ImamatStrategicSubsystem.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_ThreeParams(FOnEnvoyArrivedEvent, FName, NaibateID, bool, bIntercepted, bool, bOrderExecuted);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnStressChangedEvent, float, NewStressPercent, bool, bZulmatCrisisActive);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnImperialStrikeEvent, FName, TargetNaibateID, EImperialDoctrine, DoctrineUsed);

UCLASS()
class IMAMATWARGAME_API UImamatStrategicSubsystem : public UGameInstanceSubsystem
{
    GENERATED_BODY()

public:
    virtual void Initialize(FSubsystemCollectionBase& Collection) override;

    /** Детерминированный сид кампании для 100% воспроизводимости сохранений и реплеев */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Imamat|Determinism")
    int32 CampaignSeed = 18450706;

    UPROPERTY(BlueprintReadOnly, Category = "Imamat|Determinism")
    FRandomStream CampaignRNG;

    /** Текущий номер хода и индекс климатического сезона */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Imamat|Campaign")
    int32 CurrentTurn = 1;

    /** Центральная казна Байт аль-маль и арсенал в Дарго-Ведено */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Imamat|Treasury")
    int32 CentralGunpowderPoods = 195;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Imamat|Treasury")
    int32 CentralProvisionsMeasures = 1420;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Imamat|Treasury")
    int32 BaitAlMalSilverRubles = 680;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Imamat|State")
    float ShamilAuthorityPercent = 86.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Imamat|State")
    float OttomanSupportPercent = 48.0f;

    /** Число проведённых духовных уединений (Халват) с шейхом Джамалуддином */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Imamat|Tarikat")
    int32 CompletedKhalwatSessions = 0;

    /** Таблица всех наибств и законов Низама */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Imamat|Data")
    TMap<FName, FNaibateRegionRow> Naibates;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Imamat|Data")
    TMap<FName, FShamilNizamRow> Nizams;

    UPROPERTY(BlueprintReadOnly, Category = "Imamat|Envoys")
    TArray<FEnvoyCaravanPacket> ActiveEnvoys;

    /** Контекст текущего или последнего 3D-тактического сражения (Мост 70% Стратегия -> 30% Тактика) */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Imamat|TacticalBridge")
    FTacticalBattleContext PendingTacticalContext;

    /** Состояние ИИ Отдельного Кавказского корпуса */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Imamat|ImperialAI")
    EImperialDoctrine ActiveImperialDoctrine = EImperialDoctrine::VorontsovDeepThrust;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Imamat|ImperialAI")
    FName ImperialTargetNaibateID = FName("karata");

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Imamat|ImperialAI")
    int32 TurnsUntilImperialStrike = 2;

    /** Делегаты для связи с UMG-интерфейсом Диван-ханы и 3D-картой */
    UPROPERTY(BlueprintAssignable, Category = "Imamat|Events")
    FOnEnvoyArrivedEvent OnEnvoyArrived;

    UPROPERTY(BlueprintAssignable, Category = "Imamat|Events")
    FOnStressChangedEvent OnStressChanged;

    UPROPERTY(BlueprintAssignable, Category = "Imamat|Events")
    FOnImperialStrikeEvent OnImperialStrike;

    /** Загружает стартовые таблицы наибств и Низамов из DataTables (DT_Naibates_1845, DT_ShamilNizams) */
    UFUNCTION(BlueprintCallable, Category = "Imamat|Data")
    void InitializeFromDataTables(UDataTable* NaibatesTable, UDataTable* NizamsTable, int32 InSeed = 18450706);

    /** Вычисляет суммарные бонусы от всех утверждённых законов Кодекса Низама */
    UFUNCTION(BlueprintCallable, BlueprintPure, Category = "Imamat|Math")
    void GetAggregatedNizamModifiers(
        float& OutStressReduction,
        float& OutGlobalImanBonus,
        float& OutGreedReductionPercent,
        float& OutPrideReductionPercent,
        int32& OutPowderPerTurn,
        int32& OutProvisionsPerTurn,
        int32& OutSilverPerTurn
    ) const;

    /** Вычисляет нагрузку на правителя Stress_total [12..98%] и порог «Зульмата» */
    UFUNCTION(BlueprintCallable, BlueprintPure, Category = "Imamat|Math")
    float CalculateLeaderStress(bool& bOutZulmatWarning) const;

    /** Возвращает прозрачную декомпозицию всех слагаемых P(exec) для UI-тултипа Диван-ханы */
    UFUNCTION(BlueprintCallable, BlueprintPure, Category = "Imamat|Math")
    FOrderProbabilityBreakdown GetOrderProbabilityBreakdown(
        FName TargetNaibateID,
        ENaibOrderType OrderType,
        EEnvoyRouteMode RouteMode,
        int32 AttachedPowder,
        int32 AttachedSilver
    ) const;

    /** Вычисляет вероятность честного выполнения приказа наибом P(exec) и риск перехвата гонца */
    UFUNCTION(BlueprintCallable, BlueprintPure, Category = "Imamat|Math")
    void CalculateOrderExecutionProbability(
        FName TargetNaibateID,
        ENaibOrderType OrderType,
        EEnvoyRouteMode RouteMode,
        int32 AttachedPowder,
        int32 AttachedSilver,
        float& OutExecutionChance,
        float& OutInterceptRisk
    ) const;

    /** Снаряжает и отправляет конного гонца из Ведено в выбранное наибство */
    UFUNCTION(BlueprintCallable, Category = "Imamat|Orders")
    bool SendEnvoyWithOrder(
        FName TargetNaibateID,
        ENaibOrderType OrderType,
        EEnvoyRouteMode RouteMode,
        int32 AttachedPowder,
        int32 AttachedSilver
    );

    /** Утверждает закон из Кодекса Низамов Шамиля */
    UFUNCTION(BlueprintCallable, Category = "Imamat|Nizams")
    bool EnactShamilNizam(FName NizamID);

    /** Формирует пакет данных для бесшовного перехода в 3D-тактический бой (Салты 1847 / Дарго 1845) */
    UFUNCTION(BlueprintCallable, Category = "Imamat|TacticalBridge")
    FTacticalBattleContext BuildTacticalBattleContext(FName NaibateID, FName TerrainID, ETacticalBattleMode BattleMode);

    /** Применяет результаты 3D-тактического боя обратно к стратегической карте Имамата */
    UFUNCTION(BlueprintCallable, Category = "Imamat|TacticalBridge")
    void ApplyTacticalBattleResult(const FTacticalBattleResult& Result);

    /** Завершает стратегический ход (движение гонцов, экономика террас и удар Кавказского корпуса) */
    UFUNCTION(BlueprintCallable, Category = "Imamat|Turn")
    void ProcessNextStrategicTurn(int32 SeasonalProvisionsMod, int32 SeasonalPowderMod, float SeasonalPressureMod);

    /** Запускает быстрый детерминированный C++ прогон Монте-Карло для проверки баланса кампании */
    UFUNCTION(BlueprintCallable, Category = "Imamat|Balance")
    FMonteCarloBalanceReport RunMonteCarloBalanceSimulation(int32 NumRuns = 100, float ImperialDifficultyMultiplier = 1.0f) const;

    /** Детерминированное сохранение партии в слот USaveGame (сохраняет состояние FRandomStream, 10 наибств и гонцов) */
    UFUNCTION(BlueprintCallable, Category = "Imamat|SaveLoad")
    bool SaveCampaignToSlot(const FString& SlotName = TEXT("DivanKhana_AutoSave"), int32 UserIndex = 0);

    /** Загрузка партии из слота USaveGame с восстановлением детерминированного генератора FRandomStream */
    UFUNCTION(BlueprintCallable, Category = "Imamat|SaveLoad")
    bool LoadCampaignFromSlot(const FString& SlotName = TEXT("DivanKhana_AutoSave"), int32 UserIndex = 0);

    /** Экспорт текущего состояния кампании в JSON-строку (совместимую с веб-песочницей Диван-ханы) */
    UFUNCTION(BlueprintCallable, Category = "Imamat|SaveLoad")
    FString ExportCampaignToJsonString() const;

    /** Экспорт отчёта телеметрии сессии для Steam Playtest (ImamatPlaytestSessionTelemetry) */
    UFUNCTION(BlueprintCallable, Category = "Imamat|Telemetry")
    FString ExportPlaytestTelemetryToJsonString() const;

private:
    /** Ротация генерала и выбор новой приоритетной цели для Отдельного Кавказского корпуса */
    void RotateImperialDoctrineAndTarget();
};
