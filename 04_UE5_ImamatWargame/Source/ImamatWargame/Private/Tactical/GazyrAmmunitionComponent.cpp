// Source/ImamatWargame/Private/Tactical/GazyrAmmunitionComponent.cpp
#include "Tactical/GazyrAmmunitionComponent.h"

UGazyrAmmunitionComponent::UGazyrAmmunitionComponent()
{
    PrimaryComponentTick.bCanEverTick = false;
    CurrentGazyrsLeft = MaxGazyrCount;
}

void UGazyrAmmunitionComponent::BeginPlay()
{
    Super::BeginPlay();
    // Синхронизируем текущий боезапас с параметром MaxGazyrCount, заданным в Blueprint-архетипе
    CurrentGazyrsLeft = MaxGazyrCount;
}

float UGazyrAmmunitionComponent::GetReloadSecondsPerShot() const
{
    switch (WeaponClass)
    {
        case ECaucasianWeaponClass::DagestanRifledMiquelet: return 28.0f;
        case ECaucasianWeaponClass::BrunswickStutzer:       return 34.0f;
        default:                                            return 42.0f;
    }
}

float UGazyrAmmunitionComponent::GetSustainedFirefightMinutes() const
{
    return (static_cast<float>(CurrentGazyrsLeft) * GetReloadSecondsPerShot()) / 60.0f;
}

bool UGazyrAmmunitionComponent::ExecuteRifleVolley()
{
    if (CurrentGazyrsLeft <= 0)
    {
        OnGazyrsExhaustedDrawBazalaiDaggers.Broadcast();
        return false;
    }

    CurrentGazyrsLeft--;
    OnGazyrSalvoFired.Broadcast(CurrentGazyrsLeft);

    if (CurrentGazyrsLeft == 0)
    {
        OnGazyrsExhaustedDrawBazalaiDaggers.Broadcast();
    }
    return true;
}

void UGazyrAmmunitionComponent::RefillGazyrsFromPackMules(int32 RestoredCount)
{
    if (RestoredCount <= 0)
    {
        return;
    }
    CurrentGazyrsLeft = FMath::Clamp(CurrentGazyrsLeft + RestoredCount, 0, MaxGazyrCount);
}
