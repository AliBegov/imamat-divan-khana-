// Source/ImamatWargame/Public/Core/DivanKhanaTablePawn.h
#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Pawn.h"
#include "GameFramework/GameModeBase.h"
#include "Strategic/ImamatStrategicTypes.h"
#include "DivanKhanaTablePawn.generated.h"

class USpringArmComponent;
class UCameraComponent;
class UPointLightComponent;
class UImamatStrategicSubsystem;

/**
 * Диегетические зоны фокуса камеры над деревянным столом Имама Шамиля в Дарго-Ведено
 */
UENUM(BlueprintType)
enum class EDivanCameraFocus : uint8
{
    StrategicMapOverview UMETA(DisplayName = "Общий план карты 10 наибств"),
    NaibateCloseUp       UMETA(DisplayName = "Крупный план наибства и печати"),
    NizamScrollsLedger   UMETA(DisplayName = "Свитки Кодекса Низама и Байт-уль-Маль"),
    ZulmatOilLamp        UMETA(DisplayName = "Масляный чираг и Халват (Кризис Зульмат)"),
    TacticalDioramaZoom  UMETA(DisplayName = "3D-Диорама тактического боя (Разрез Милютина)")
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnTableFocusChanged, EDivanCameraFocus, NewFocus, FName, FocusedNaibateID);

/**
 * ADivanKhanaTablePawn
 * Диегетическая камера и контроллер стола совета Диван-ханы:
 * обеспечивает бесшовный перелёт от стратегической карты Кавказа к свитками Низама,
 * масляному чирагу «Зульмата» и тактической 3D-диораме осады/сплайна без загрузочных экранов.
 */
UCLASS(BlueprintType, Blueprintable)
class IMAMATWARGAME_API ADivanKhanaTablePawn : public APawn
{
    GENERATED_BODY()

public:
    ADivanKhanaTablePawn();

    virtual void BeginPlay() override;
    virtual void Tick(float DeltaTime) override;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Camera")
    TObjectPtr<USceneComponent> TableRoot;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Camera")
    TObjectPtr<USpringArmComponent> CameraBoom;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Camera")
    TObjectPtr<UCameraComponent> DiegeticCamera;

    /** Диегетический масляный светильник (чираг) над картой, затухающий при росте Стресса («Зульмат») */
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "DiegeticLighting")
    TObjectPtr<UPointLightComponent> ChiragOilLampLight;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Camera|Interpolation")
    float CameraInterpSpeed = 5.5f;

    UPROPERTY(BlueprintReadOnly, Category = "Camera|State")
    EDivanCameraFocus CurrentFocus = EDivanCameraFocus::StrategicMapOverview;

    UPROPERTY(BlueprintReadOnly, Category = "Camera|State")
    FName ActiveNaibateID = FName("vedeno");

    UPROPERTY(BlueprintAssignable, Category = "Events")
    FOnTableFocusChanged OnTableFocusChanged;

    /** Плавный перелёт камеры к выбранной зоне стола Шамиля */
    UFUNCTION(BlueprintCallable, Category = "DivanKhana|Camera")
    void TransitionToFocus(EDivanCameraFocus TargetFocus, FName OptionalNaibateID = NAME_None);

    /** Быстрый переход из стратегической карты в 3D-макет тактического боя (Салты / Ичкерия) */
    UFUNCTION(BlueprintCallable, Category = "DivanKhana|Camera")
    FTacticalBattleContext EnterTacticalDioramaForNaibate(FName NaibateID);

    /** Возврат из тактической 3D-диорамы на стратегическую карту с применением FTacticalBattleResult */
    UFUNCTION(BlueprintCallable, Category = "DivanKhana|Camera")
    void ReturnFromDioramaWithResult(const FTacticalBattleResult& BattleResult);

    /** Вращение и наклон камеры над 3D-диорамой (мышью или клавишами) */
    UFUNCTION(BlueprintCallable, Category = "DivanKhana|Input")
    void OrbitTableCamera(float YawDeltaDegrees, float PitchDeltaDegrees, float ZoomDelta);

    /** Трассировка луча курсора по объектам на столе (жетоны 10 наибств, сургучная печать, ручка разреза Милютина) */
    UFUNCTION(BlueprintCallable, Category = "DivanKhana|Input")
    bool TraceTableInteractiveToken(FVector2D ScreenPosition, FName& OutHitNaibateID) const;

protected:
    UFUNCTION()
    void HandleLeaderStressUpdated(float NewStress, bool bIsZulmatWarning);

private:
    FVector TargetAnchorLocation = FVector::ZeroVector;
    FRotator TargetBoomRotation = FRotator(-52.0f, 0.0f, 0.0f);
    float TargetArmLength = 210.0f;
    float TargetFieldOfView = 48.0f;

    float CurrentStressPercent = 29.0f;
    bool bInZulmatCrisis = false;
    float LampFlickerAccumulator = 0.0f;

    /** Карта мировых координат 10 наибств на пергаментном полотне стола в Ведено (в см) */
    TMap<FName, FVector> TableNaibateLocalOffsets;

    void InitializeTableNaibateCoordinates();
};

/**
 * Базовый игровой режим резиденции Шамиля в Дарго-Ведено
 */
UCLASS()
class IMAMATWARGAME_API ADivanKhanaGameMode : public AGameModeBase
{
    GENERATED_BODY()

public:
    ADivanKhanaGameMode();
};
