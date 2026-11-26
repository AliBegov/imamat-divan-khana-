// Source/ImamatWargame/Private/Core/DivanKhanaTablePawn.cpp
#include "Core/DivanKhanaTablePawn.h"
#include "Camera/CameraComponent.h"
#include "Components/PointLightComponent.h"
#include "Engine/World.h"
#include "GameFramework/PlayerController.h"
#include "GameFramework/SpringArmComponent.h"
#include "Kismet/GameplayStatics.h"
#include "Strategic/ImamatStrategicSubsystem.h"

ADivanKhanaTablePawn::ADivanKhanaTablePawn()
{
    PrimaryActorTick.bCanEverTick = true;

    TableRoot = CreateDefaultSubobject<USceneComponent>(TEXT("TableRoot"));
    RootComponent = TableRoot;

    CameraBoom = CreateDefaultSubobject<USpringArmComponent>(TEXT("CameraBoom"));
    CameraBoom->SetupAttachment(TableRoot);
    CameraBoom->TargetArmLength = 210.0f;
    CameraBoom->bDoCollisionTest = false;
    CameraBoom->SetRelativeRotation(FRotator(-52.0f, 0.0f, 0.0f));

    DiegeticCamera = CreateDefaultSubobject<UCameraComponent>(TEXT("DiegeticCamera"));
    DiegeticCamera->SetupAttachment(CameraBoom, USpringArmComponent::SocketName);
    DiegeticCamera->FieldOfView = 48.0f;

    ChiragOilLampLight = CreateDefaultSubobject<UPointLightComponent>(TEXT("ChiragOilLampLight"));
    ChiragOilLampLight->SetupAttachment(TableRoot);
    ChiragOilLampLight->SetRelativeLocation(FVector(-65.0f, 82.0f, 44.0f));
    ChiragOilLampLight->Intensity = 4200.0f;
    ChiragOilLampLight->AttenuationRadius = 380.0f;
    ChiragOilLampLight->SetLightColor(FLinearColor(1.0f, 0.68f, 0.32f));

    InitializeTableNaibateCoordinates();
}

void ADivanKhanaTablePawn::InitializeTableNaibateCoordinates()
{
    // Координаты 10 латунных жетонов наибств на поверхности стола (в сантиметрах относительно центра карты)
    TableNaibateLocalOffsets.Add(FName("vedeno"),   FVector( 24.0f, -38.0f, 2.0f));
    TableNaibateLocalOffsets.Add(FName("benoy"),    FVector( 38.0f, -14.0f, 2.5f));
    TableNaibateLocalOffsets.Add(FName("shali"),    FVector( 52.0f, -62.0f, 1.5f));
    TableNaibateLocalOffsets.Add(FName("karata"),   FVector(  6.0f,  -4.0f, 3.2f));
    TableNaibateLocalOffsets.Add(FName("khunzakh"), FVector( -8.0f,  26.0f, 3.6f));
    TableNaibateLocalOffsets.Add(FName("gergebil"), FVector(-14.0f,  52.0f, 3.0f));
    TableNaibateLocalOffsets.Add(FName("gunib"),    FVector(-28.0f,  46.0f, 4.2f));
    TableNaibateLocalOffsets.Add(FName("chokh"),    FVector(-38.0f,  64.0f, 3.8f));
    TableNaibateLocalOffsets.Add(FName("teletl"),   FVector(-32.0f,  22.0f, 3.5f));
    TableNaibateLocalOffsets.Add(FName("irib"),     FVector(-48.0f,  58.0f, 4.0f));
}

void ADivanKhanaTablePawn::BeginPlay()
{
    Super::BeginPlay();

    if (UGameInstance* GI = GetGameInstance())
    {
        if (UImamatStrategicSubsystem* StratSub = GI->GetSubsystem<UImamatStrategicSubsystem>())
        {
            StratSub->OnStressChanged.AddDynamic(this, &ADivanKhanaTablePawn::HandleLeaderStressUpdated);
            bool bZulmat = false;
            const float InitialStress = StratSub->CalculateLeaderStress(bZulmat);
            HandleLeaderStressUpdated(InitialStress, bZulmat);
        }
    }

    TransitionToFocus(EDivanCameraFocus::StrategicMapOverview, FName("vedeno"));
}

void ADivanKhanaTablePawn::Tick(float DeltaTime)
{
    Super::Tick(DeltaTime);

    // 1. Плавная интерполяция позиции, угла наклона и фокусного расстояния камеры над столом
    const FVector CurrentLoc = TableRoot->GetRelativeLocation();
    const FVector NextLoc = FMath::VInterpTo(CurrentLoc, TargetAnchorLocation, DeltaTime, CameraInterpSpeed);
    TableRoot->SetRelativeLocation(NextLoc);

    const FRotator CurrentRot = CameraBoom->GetRelativeRotation();
    const FRotator NextRot = FMath::RInterpTo(CurrentRot, TargetBoomRotation, DeltaTime, CameraInterpSpeed);
    CameraBoom->SetRelativeRotation(NextRot);

    CameraBoom->TargetArmLength = FMath::FInterpTo(CameraBoom->TargetArmLength, TargetArmLength, DeltaTime, CameraInterpSpeed);
    DiegeticCamera->FieldOfView = FMath::FInterpTo(DiegeticCamera->FieldOfView, TargetFieldOfView, DeltaTime, CameraInterpSpeed);

    // 2. Диегетическое мерцание масляного чирага в зависимости от Стресса Шамиля и кризиса «Зульмат»
    LampFlickerAccumulator += DeltaTime * (bInZulmatCrisis ? 14.0f : 4.2f);
    const float FlickerWave = FMath::Sin(LampFlickerAccumulator) * 0.5f + FMath::Cos(LampFlickerAccumulator * 2.3f) * 0.5f;
    const float BaseIntensity = FMath::Lerp(4600.0f, 1350.0f, FMath::Clamp(CurrentStressPercent / 100.0f, 0.0f, 1.0f));
    const float FlickerAmplitude = bInZulmatCrisis ? 620.0f : 140.0f;

    if (ChiragOilLampLight)
    {
        ChiragOilLampLight->SetIntensity(FMath::Max(400.0f, BaseIntensity + FlickerWave * FlickerAmplitude));
        const FLinearColor HealthyColor(1.0f, 0.68f, 0.32f);
        const FLinearColor ZulmatColor(0.85f, 0.28f, 0.14f);
        ChiragOilLampLight->SetLightColor(FMath::Lerp(HealthyColor, ZulmatColor, bInZulmatCrisis ? 0.85f : 0.0f));
    }
}

void ADivanKhanaTablePawn::TransitionToFocus(EDivanCameraFocus TargetFocus, FName OptionalNaibateID)
{
    CurrentFocus = TargetFocus;
    if (!OptionalNaibateID.IsNone())
    {
        ActiveNaibateID = OptionalNaibateID;
    }

    switch (TargetFocus)
    {
        case EDivanCameraFocus::StrategicMapOverview:
            TargetAnchorLocation = FVector::ZeroVector;
            TargetBoomRotation = FRotator(-56.0f, 0.0f, 0.0f);
            TargetArmLength = 215.0f;
            TargetFieldOfView = 48.0f;
            break;

        case EDivanCameraFocus::NaibateCloseUp:
            if (const FVector* FoundOffset = TableNaibateLocalOffsets.Find(ActiveNaibateID))
            {
                TargetAnchorLocation = *FoundOffset;
            }
            TargetBoomRotation = FRotator(-42.0f, 12.0f, 0.0f);
            TargetArmLength = 92.0f;
            TargetFieldOfView = 38.0f;
            break;

        case EDivanCameraFocus::NizamScrollsLedger:
            TargetAnchorLocation = FVector(-54.0f, -72.0f, 3.0f);
            TargetBoomRotation = FRotator(-64.0f, -18.0f, 0.0f);
            TargetArmLength = 105.0f;
            TargetFieldOfView = 42.0f;
            break;

        case EDivanCameraFocus::ZulmatOilLamp:
            TargetAnchorLocation = FVector(-62.0f, 78.0f, 12.0f);
            TargetBoomRotation = FRotator(-28.0f, 35.0f, 0.0f);
            TargetArmLength = 78.0f;
            TargetFieldOfView = 36.0f;
            break;

        case EDivanCameraFocus::TacticalDioramaZoom:
            if (const FVector* FoundOffset = TableNaibateLocalOffsets.Find(ActiveNaibateID))
            {
                TargetAnchorLocation = *FoundOffset;
            }
            TargetBoomRotation = FRotator(-34.0f, -24.0f, 0.0f);
            TargetArmLength = 64.0f;
            TargetFieldOfView = 34.0f;
            break;
    }

    OnTableFocusChanged.Broadcast(CurrentFocus, ActiveNaibateID);
}

FTacticalBattleContext ADivanKhanaTablePawn::EnterTacticalDioramaForNaibate(FName NaibateID)
{
    TransitionToFocus(EDivanCameraFocus::TacticalDioramaZoom, NaibateID);

    const bool bIsForestAmbush = (NaibateID == FName("benoy") || NaibateID == FName("shali") ||
                                  NaibateID == FName("vedeno") || NaibateID == FName("karata"));
    const ETacticalBattleMode Mode = bIsForestAmbush
        ? ETacticalBattleMode::ForestSplineAmbush
        : ETacticalBattleMode::MountainSiegeCutaway;
    const FName TerrainAsset = bIsForestAmbush
        ? FName("tactical_dargo_ichkeria")
        : FName("tactical_salti_siege");

    if (UGameInstance* GI = GetGameInstance())
    {
        if (UImamatStrategicSubsystem* StratSub = GI->GetSubsystem<UImamatStrategicSubsystem>())
        {
            return StratSub->BuildTacticalBattleContext(NaibateID, TerrainAsset, Mode);
        }
    }

    FTacticalBattleContext Fallback;
    Fallback.NaibateID = NaibateID;
    Fallback.TerrainID = TerrainAsset;
    Fallback.BattleMode = Mode;
    return Fallback;
}

void ADivanKhanaTablePawn::ReturnFromDioramaWithResult(const FTacticalBattleResult& BattleResult)
{
    if (UGameInstance* GI = GetGameInstance())
    {
        if (UImamatStrategicSubsystem* StratSub = GI->GetSubsystem<UImamatStrategicSubsystem>())
        {
            StratSub->ApplyTacticalBattleResult(BattleResult);
        }
    }

    TransitionToFocus(EDivanCameraFocus::StrategicMapOverview, BattleResult.NaibateID);
}

void ADivanKhanaTablePawn::OrbitTableCamera(float YawDeltaDegrees, float PitchDeltaDegrees, float ZoomDelta)
{
    TargetBoomRotation.Yaw = FMath::UnwindDegrees(TargetBoomRotation.Yaw + YawDeltaDegrees);
    TargetBoomRotation.Pitch = FMath::Clamp(TargetBoomRotation.Pitch + PitchDeltaDegrees, -78.0f, -18.0f);
    TargetArmLength = FMath::Clamp(TargetArmLength + ZoomDelta, 48.0f, 280.0f);
}

bool ADivanKhanaTablePawn::TraceTableInteractiveToken(FVector2D ScreenPosition, FName& OutHitNaibateID) const
{
    OutHitNaibateID = NAME_None;
    APlayerController* PC = Cast<APlayerController>(GetController());
    if (!PC)
    {
        return false;
    }

    FVector WorldOrigin, WorldDirection;
    if (!PC->DeprojectScreenPositionToWorld(ScreenPosition.X, ScreenPosition.Y, WorldOrigin, WorldDirection))
    {
        return false;
    }

    // Пересечение луча с плоскостью стола (Z = 0 в локальных координатах стола)
    if (FMath::Abs(WorldDirection.Z) < KINDA_SMALL_NUMBER)
    {
        return false;
    }

    const float T = (GetActorLocation().Z - WorldOrigin.Z) / WorldDirection.Z;
    if (T <= 0.0f)
    {
        return false;
    }

    const FVector HitPointLocal = (WorldOrigin + WorldDirection * T) - GetActorLocation();
    float ClosestDistSq = 18.0f * 18.0f; // Радиус захвата латунного жетона наибства (18 см)

    for (const TPair<FName, FVector>& Pair : TableNaibateLocalOffsets)
    {
        const float DistSq = FVector::DistSquaredXY(HitPointLocal, Pair.Value);
        if (DistSq < ClosestDistSq)
        {
            ClosestDistSq = DistSq;
            OutHitNaibateID = Pair.Key;
        }
    }

    return !OutHitNaibateID.IsNone();
}

void ADivanKhanaTablePawn::HandleLeaderStressUpdated(float NewStress, bool bIsZulmatWarning)
{
    CurrentStressPercent = NewStress;
    bInZulmatCrisis = bIsZulmatWarning;
}

ADivanKhanaGameMode::ADivanKhanaGameMode()
{
    DefaultPawnClass = ADivanKhanaTablePawn::StaticClass();
}
