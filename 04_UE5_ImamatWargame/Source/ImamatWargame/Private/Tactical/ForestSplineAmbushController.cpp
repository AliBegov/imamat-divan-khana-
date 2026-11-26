// Source/ImamatWargame/Private/Tactical/ForestSplineAmbushController.cpp
#include "Tactical/ForestSplineAmbushController.h"
#include "Math/UnrealMathUtility.h"

AForestSplineAmbushController::AForestSplineAmbushController()
{
    PrimaryActorTick.bCanEverTick = false;
    ForestRoadSpline = CreateDefaultSubobject<USplineComponent>(TEXT("IchkeriaForestRoadSpline"));
    RootComponent = ForestRoadSpline;
}

bool AForestSplineAmbushController::FellBeechTreesAbattis(float SplineDistanceCm, float ImpactRadiusCm)
{
    // Защита от наложения нескольких завалов в одну и ту же точку сплайна (минимум 800 см между засеками)
    for (const float ExistingDist : BeechBarricadeSplineLocationsCm)
    {
        if (FMath::Abs(ExistingDist - SplineDistanceCm) < 800.0f)
        {
            return false;
        }
    }

    BeechBarricadeSplineLocationsCm.Add(SplineDistanceCm);

    for (FImperialSplineEchelon& Ech : ColumnEchelons)
    {
        if (FMath::Abs(Ech.DistanceAlongSplineCm - SplineDistanceCm) <= ImpactRadiusCm)
        {
            Ech.CohesionPercent = FMath::Max(12.0f, Ech.CohesionPercent - 15.0f);
        }
    }
    return true;
}

void AForestSplineAmbushController::AdvanceColumnAlongSpline(float BaseAdvanceStepCm)
{
    const float MaxSplineLen = ForestRoadSpline ? ForestRoadSpline->GetSplineLength() : 100000.0f;

    for (FImperialSplineEchelon& Ech : ColumnEchelons)
    {
        const float ProposedDist = FMath::Min(MaxSplineLen, Ech.DistanceAlongSplineCm + BaseAdvanceStepCm);
        bool bBlockedByAbattis = false;

        for (const float BarricadeDist : BeechBarricadeSplineLocationsCm)
        {
            if (BarricadeDist >= Ech.DistanceAlongSplineCm && BarricadeDist <= ProposedDist + 400.0f)
            {
                // Эшелон упирается в поваленные буки, теряет темп и скучивается под огнём
                Ech.DistanceAlongSplineCm = FMath::Max(Ech.DistanceAlongSplineCm, BarricadeDist - 250.0f);
                Ech.CohesionPercent = FMath::Max(10.0f, Ech.CohesionPercent - 8.0f);
                bBlockedByAbattis = true;
                break;
            }
        }

        if (!bBlockedByAbattis)
        {
            Ech.DistanceAlongSplineCm = ProposedDist;
        }
    }
}

void AForestSplineAmbushController::ExecuteForestCrossfireVolley(int32 TargetEchelonIndex)
{
    if (!ColumnEchelons.IsValidIndex(TargetEchelonIndex))
    {
        return;
    }

    FImperialSplineEchelon& Ech = ColumnEchelons[TargetEchelonIndex];
    Ech.BayonetStrength = FMath::Max(100, Ech.BayonetStrength - 135);
    Ech.CohesionPercent = FMath::Max(8.0f, Ech.CohesionPercent - 18.0f);
}

void AForestSplineAmbushController::LaunchFlankingDaggerCharge(
    int32 TargetEchelonIndex,
    int32& OutCapturedPowderPoods,
    int32& OutCapturedProvisions,
    int32& OutCapturedSilverRubles)
{
    OutCapturedPowderPoods = 0;
    OutCapturedProvisions = 0;
    OutCapturedSilverRubles = 0;

    if (!ColumnEchelons.IsValidIndex(TargetEchelonIndex))
    {
        return;
    }

    FImperialSplineEchelon& Ech = ColumnEchelons[TargetEchelonIndex];
    const float CohesionVulnerability = (Ech.CohesionPercent < 55.0f) ? 1.45f : 0.75f;

    Ech.BayonetStrength = FMath::Max(60, Ech.BayonetStrength - FMath::RoundToInt(220.0f * CohesionVulnerability));
    Ech.CohesionPercent = FMath::Max(5.0f, Ech.CohesionPercent - 25.0f);
    Ech.MountainGunsCount = FMath::Max(0, Ech.MountainGunsCount - 1);

    OutCapturedPowderPoods = FMath::RoundToInt(18.0f * CohesionVulnerability);
    OutCapturedProvisions = FMath::RoundToInt(140.0f * CohesionVulnerability);
    OutCapturedSilverRubles = FMath::RoundToInt(65.0f * CohesionVulnerability);
}
