// Source/ImamatWargame/Private/Tactical/TacticalSiegeManager.cpp
#include "Tactical/TacticalSiegeManager.h"
#include "Kismet/KismetMaterialLibrary.h"
#include "Engine/World.h"

ATacticalSiegeManager::ATacticalSiegeManager()
{
    PrimaryActorTick.bCanEverTick = false;
}

void ATacticalSiegeManager::SetMilyutinCutawayPlane(FVector PlaneOrigin, FVector PlaneNormal, bool bEnableCutaway)
{
    CutawayPlaneWorldY = PlaneOrigin.Y;
    if (CutawayMPC && GetWorld())
    {
        UKismetMaterialLibrary::SetVectorParameterValue(
            GetWorld(),
            CutawayMPC,
            FName("CutawayPlaneOrigin"),
            FLinearColor(PlaneOrigin.X, PlaneOrigin.Y, PlaneOrigin.Z, bEnableCutaway ? 1.0f : 0.0f)
        );

        // Защита от нулевого вектора нормали, исключающая NaN в HLSL-шейдере
        const FVector SafeNorm = PlaneNormal.IsNearlyZero()
            ? FVector(0.0f, 1.0f, 0.0f)
            : PlaneNormal.GetSafeNormal();

        UKismetMaterialLibrary::SetVectorParameterValue(
            GetWorld(),
            CutawayMPC,
            FName("CutawayPlaneNormal"),
            FLinearColor(SafeNorm.X, SafeNorm.Y, SafeNorm.Z, 0.0f)
        );
    }
}

bool ATacticalSiegeManager::SimulateArtilleryShot(
    EArtilleryOrdnanceType OrdnanceType,
    FVector MuzzleLocation,
    FVector CliffCrestLocation,
    FVector TargetSaklyaLocation,
    float LaunchAngleDegrees,
    float InitialSpeedCmPerSec,
    TArray<FVector>& OutTrajectoryPoints,
    bool& bOutBlockedByCliffDeadZone,
    float& OutEffectiveStructureDamage) const
{
    OutTrajectoryPoints.Empty();

    const float SafeSpeed = FMath::Max(500.0f, InitialSpeedCmPerSec);
    const float clampedAngleDeg = FMath::Clamp(LaunchAngleDegrees, 2.0f, 85.0f);
    const float LaunchRad = FMath::DegreesToRadians(clampedAngleDeg);
    const float CosAngle = FMath::Max(0.05f, FMath::Cos(LaunchRad));
    const float GravityCmPerSecSq = 980.0f;

    const float Dist2DToCrest = FMath::Max(1.0f, FVector::Dist2D(MuzzleLocation, CliffCrestLocation));
    const float Dist2DToTarget = FMath::Max(Dist2DToCrest + 10.0f, FVector::Dist2D(MuzzleLocation, TargetSaklyaLocation));

    // Вычисляем реальную высоту параболы снаряда над точкой перегиба скалы с учётом гравитационного проседания
    const float TimeToCrest = Dist2DToCrest / (SafeSpeed * CosAngle);
    const float ProjectileZAtCrest =
        MuzzleLocation.Z +
        (Dist2DToCrest * FMath::Tan(LaunchRad)) -
        (0.5f * GravityCmPerSecSq * TimeToCrest * TimeToCrest);

    bOutBlockedByCliffDeadZone = (ProjectileZAtCrest < CliffCrestLocation.Z);

    const FVector Dir2D = (TargetSaklyaLocation - MuzzleLocation).GetSafeNormal2D();
    const FVector InitialVelocity =
        (Dir2D * (CosAngle * SafeSpeed)) +
        FVector(0.0f, 0.0f, FMath::Sin(LaunchRad) * SafeSpeed);

    const FVector GravityVec(0.0f, 0.0f, -GravityCmPerSecSq);
    const int32 NumSteps = 80;
    const float TotalFlightTime = (Dist2DToTarget / (SafeSpeed * CosAngle)) * 1.15f;
    const float TimeStep = FMath::Max(0.02f, TotalFlightTime / static_cast<float>(NumSteps));

    for (int32 Step = 0; Step <= NumSteps; ++Step)
    {
        const float T = Step * TimeStep;
        const FVector Pos = MuzzleLocation + (InitialVelocity * T) + (0.5f * GravityVec * T * T);
        OutTrajectoryPoints.Add(Pos);

        const float CurrentDist2D = FVector::Dist2D(MuzzleLocation, Pos);
        if (bOutBlockedByCliffDeadZone && CurrentDist2D >= Dist2DToCrest)
        {
            break;
        }
        if (!bOutBlockedByCliffDeadZone && (CurrentDist2D >= Dist2DToTarget || (Step > 4 && Pos.Z <= TargetSaklyaLocation.Z)))
        {
            break;
        }
    }

    if (bOutBlockedByCliffDeadZone)
    {
        OutEffectiveStructureDamage = 0.0f;
        return false;
    }

    // Расчёт поглощения удара пудовой бомбы дубовыми накатами блиндажа Хаджи-Юсуфа Сафарова
    const float BaseOrdnanceDamage = (OrdnanceType == EArtilleryOrdnanceType::OnePoodMortar) ? 65.0f : 38.0f;
    const float BlindageMitigation = FMath::Clamp(static_cast<float>(BlindageTimberLayers) * 0.18f, 0.0f, 0.72f);
    OutEffectiveStructureDamage = BaseOrdnanceDamage * (1.0f - BlindageMitigation);
    return true;
}

float ATacticalSiegeManager::CalculateCopperBasinSeismicRipple(bool& bOutCriticalProximityAlert) const
{
    const float SafeDist = FMath::Max(1.0f, RussianMineDistanceSazhens);
    const float Intensity = FMath::Clamp(12.5f / (SafeDist * SafeDist), 0.04f, 1.0f);
    bOutCriticalProximityAlert = (RussianMineDistanceSazhens <= 4.5f);
    return Intensity;
}

void ATacticalSiegeManager::DetonateUndergroundCamouflet(
    float PowderChargePoods,
    FVector CamoufletWorldOrigin,
    float& OutUpdatedDistanceSazhens)
{
    const float PushbackSazhens = FMath::Clamp(PowderChargePoods * 0.36f, 2.5f, 6.8f);
    RussianMineDistanceSazhens = FMath::Min(18.0f, RussianMineDistanceSazhens + PushbackSazhens);
    OutUpdatedDistanceSazhens = RussianMineDistanceSazhens;

    const float BlastRadiusCm = FMath::Clamp(PowderChargePoods * 45.0f, 350.0f, 1200.0f);
    OnCamoufletDetonated.Broadcast(CamoufletWorldOrigin, BlastRadiusCm, RussianMineDistanceSazhens);
}
