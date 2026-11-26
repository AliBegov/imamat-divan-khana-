// Source/ImamatWargame/Public/Tactical/ForestSplineAmbushController.h
#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Components/SplineComponent.h"
#include "ForestSplineAmbushController.generated.h"

USTRUCT(BlueprintType)
struct FImperialSplineEchelon
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ambush|Echelon")
    FName EchelonID;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ambush|Echelon")
    FText EchelonTitle;

    /** Дистанция вдоль сплайна лесной дороги в сантиметрах */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ambush|Echelon")
    float DistanceAlongSplineCm = 0.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ambush|Echelon")
    int32 BayonetStrength = 980;

    /** Сплочённость строя [0..100%]: при падении ниже 55% эшелон уязвим для кинжальной рубки */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ambush|Echelon")
    float CohesionPercent = 72.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ambush|Echelon")
    int32 MountainGunsCount = 2;
};

UCLASS()
class IMAMATWARGAME_API AForestSplineAmbushController : public AActor
{
    GENERATED_BODY()

public:
    AForestSplineAmbushController();

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Ambush|Spline")
    TObjectPtr<USplineComponent> ForestRoadSpline;

    /** Дистанции поваленных буковых завалов (засек) вдоль сплайна дороги */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ambush|Barricades")
    TArray<float> BeechBarricadeSplineLocationsCm;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ambush|Column")
    TArray<FImperialSplineEchelon> ColumnEchelons;

    /**
     * Валит вековые буки поперёк лесной тропы в точке SplineDistanceCm (с проверкой минимального интервала), разрывая колонну
     */
    UFUNCTION(BlueprintCallable, Category = "Ambush|Tactics")
    bool FellBeechTreesAbattis(float SplineDistanceCm, float ImpactRadiusCm = 5000.0f);

    /**
     * Продвигает эшелоны колонны по сплайну лесной дороги с учётом торможения перед буковыми завалами
     */
    UFUNCTION(BlueprintCallable, Category = "Ambush|Tactics")
    void AdvanceColumnAlongSpline(float BaseAdvanceStepCm = 3500.0f);

    /**
     * Наносит перекрёстный залп штуцеров с лесных высот по скучившемуся у завала эшелону
     */
    UFUNCTION(BlueprintCallable, Category = "Ambush|Tactics")
    void ExecuteForestCrossfireVolley(int32 TargetEchelonIndex);

    /**
     * Бросает сотни мюридов с кинжалами «Базалай» и шашками во фланг расстроенного обоза
     */
    UFUNCTION(BlueprintCallable, Category = "Ambush|Tactics")
    void LaunchFlankingDaggerCharge(
        int32 TargetEchelonIndex,
        int32& OutCapturedPowderPoods,
        int32& OutCapturedProvisions,
        int32& OutCapturedSilverRubles
    );
};
