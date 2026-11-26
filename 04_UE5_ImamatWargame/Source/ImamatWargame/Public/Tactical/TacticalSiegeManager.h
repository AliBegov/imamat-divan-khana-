// Source/ImamatWargame/Public/Tactical/TacticalSiegeManager.h
#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "TacticalSiegeManager.generated.h"

class UMaterialParameterCollection;

UENUM(BlueprintType)
enum class EArtilleryOrdnanceType : uint8
{
    OnePoodMortar      UMETA(DisplayName = "Пудовая мортира (Навесная парабола 45-70 град.)"),
    MountainUnicornGun UMETA(DisplayName = "Горный единорог (Настильный огонь 6-30 град.)")
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_ThreeParams(
    FOnCamoufletDetonatedEvent,
    FVector, WorldOrigin,
    float, BlastRadiusCm,
    float, NewMineDistanceSazhens
);

UCLASS()
class IMAMATWARGAME_API ATacticalSiegeManager : public AActor
{
    GENERATED_BODY()

public:
    ATacticalSiegeManager();

    /** Коллекция параметров материалов (MPC) для управления плоскостью геодезического разреза Милютина в реальном времени */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Siege|MilyutinCutaway")
    TObjectPtr<UMaterialParameterCollection> CutawayMPC;

    /** Текущее положение плоскости геодезического разреза вдоль оси Y в мировых координатах */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Siege|MilyutinCutaway")
    float CutawayPlaneWorldY = 0.0f;

    /** Число дубовых накатов над подземными блиндажами аула [1..4] */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Siege|Blindages", meta = (ClampMin = "1", ClampMax = "4"))
    int32 BlindageTimberLayers = 3;

    /** Дистанция от головы русской подземной сапы до фундамента башни в саженях (1 сажень = 213.36 см) */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Siege|MiningWarfare")
    float RussianMineDistanceSazhens = 9.5f;

    /** Делегат для вызова Chaos Field System и Niagara VFX при подрыве подземного камуфлета */
    UPROPERTY(BlueprintAssignable, Category = "Siege|MiningWarfare")
    FOnCamoufletDetonatedEvent OnCamoufletDetonated;

    /**
     * Сдвигает плоскость геодезического разреза скалы («Нож Милютина»), обнажая подземные галереи и блиндажи в 3D
     */
    UFUNCTION(BlueprintCallable, Category = "Siege|MilyutinCutaway")
    void SetMilyutinCutawayPlane(FVector PlaneOrigin, FVector PlaneNormal, bool bEnableCutaway);

    /**
     * Вычисляет баллистическую траекторию снаряда и проверяет с учётом гравитации, перехватывается ли ядро скальным обрывом (Мёртвая зона)
     */
    UFUNCTION(BlueprintCallable, Category = "Siege|Ballistics")
    bool SimulateArtilleryShot(
        EArtilleryOrdnanceType OrdnanceType,
        FVector MuzzleLocation,
        FVector CliffCrestLocation,
        FVector TargetSaklyaLocation,
        float LaunchAngleDegrees,
        float InitialSpeedCmPerSec,
        TArray<FVector>& OutTrajectoryPoints,
        bool& bOutBlockedByCliffDeadZone,
        float& OutEffectiveStructureDamage
    ) const;

    /**
     * Вычисляет амплитуду сейсмических волн в медном тазу с водой Хаджи-Юсуфа Сафарова [0..1]
     */
    UFUNCTION(BlueprintCallable, BlueprintPure, Category = "Siege|CopperBasin")
    float CalculateCopperBasinSeismicRipple(bool& bOutCriticalProximityAlert) const;

    /**
     * Подрывает встречный подземный камуфлет: обрушивает сапёрную галерею врага и отбрасывает подкоп назад
     */
    UFUNCTION(BlueprintCallable, Category = "Siege|MiningWarfare")
    void DetonateUndergroundCamouflet(float PowderChargePoods, FVector CamoufletWorldOrigin, float& OutUpdatedDistanceSazhens);
};
