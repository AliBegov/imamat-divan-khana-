// Source/ImamatWargame/Public/Tactical/GazyrAmmunitionComponent.h
#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "GazyrAmmunitionComponent.generated.h"

UENUM(BlueprintType)
enum class ECaucasianWeaponClass : uint8
{
    DagestanRifledMiquelet UMETA(DisplayName = "Дагестанская нарезная кремневая винтовка (28 сек)"),
    BrunswickStutzer       UMETA(DisplayName = "Штуцер системы Брунсвика (34 сек)"),
    CapturedSmoothMusket   UMETA(DisplayName = "Пехотное гладкоствольное ружьё (42 сек)")
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnGazyrSalvoFired, int32, RemainingGazyrs);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnGazyrsExhaustedDrawBazalaiDaggers);

UCLASS(ClassGroup=(ImamatTactical), meta=(BlueprintSpawnableComponent))
class IMAMATWARGAME_API UGazyrAmmunitionComponent : public UActorComponent
{
    GENERATED_BODY()

public:
    UGazyrAmmunitionComponent();

protected:
    virtual void BeginPlay() override;

public:
    /** Ёмкость нагрудной газырницы черкески [12..24, исторический эталон — 18 газырей] */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Gazyrs", meta = (ClampMin = "12", ClampMax = "24"))
    int32 MaxGazyrCount = 18;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Gazyrs")
    int32 CurrentGazyrsLeft = 18;

    /** Масса порохового заряда в одном газыре в золотниках (1 золотник = 4.2657 г) */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Gazyrs")
    float ChargeZolotniks = 1.75f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Gazyrs")
    ECaucasianWeaponClass WeaponClass = ECaucasianWeaponClass::DagestanRifledMiquelet;

    UPROPERTY(BlueprintAssignable, Category = "Gazyrs|Events")
    FOnGazyrSalvoFired OnGazyrSalvoFired;

    UPROPERTY(BlueprintAssignable, Category = "Gazyrs|Events")
    FOnGazyrsExhaustedDrawBazalaiDaggers OnGazyrsExhaustedDrawBazalaiDaggers;

    /** Возвращает время перезарядки с шомпола в секундах */
    UFUNCTION(BlueprintCallable, BlueprintPure, Category = "Gazyrs")
    float GetReloadSecondsPerShot() const;

    /** Вычисляет общее время непрерывного огневого боя (в минутах) до перехода в кинжальную рубку */
    UFUNCTION(BlueprintCallable, BlueprintPure, Category = "Gazyrs")
    float GetSustainedFirefightMinutes() const;

    /** Производит залп сотни, списывая 1 газырь у каждого стрелка */
    UFUNCTION(BlueprintCallable, Category = "Gazyrs")
    bool ExecuteRifleVolley();

    /** Пополняет газыри из вьюков порохового каравана гонца */
    UFUNCTION(BlueprintCallable, Category = "Gazyrs")
    void RefillGazyrsFromPackMules(int32 RestoredCount);
};
