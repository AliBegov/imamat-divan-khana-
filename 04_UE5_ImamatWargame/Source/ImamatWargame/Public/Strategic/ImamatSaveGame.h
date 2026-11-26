// Source/ImamatWargame/Public/Strategic/ImamatSaveGame.h
#pragma once

#include "CoreMinimal.h"
#include "GameFramework/SaveGame.h"
#include "Strategic/ImamatStrategicTypes.h"
#include "ImamatSaveGame.generated.h"

/**
 * UImamatSaveGame
 * Полный детерминированный слепок стратегической кампании Диван-ханы:
 * хранит сид генератора FRandomStream, состояние казны Ведено, все 10 наибств,
 * 12 законов Кодекса Низама, активных конных гонцов в пути и доктрину ИИ Кавказского корпуса.
 */
UCLASS(BlueprintType)
class IMAMATWARGAME_API UImamatSaveGame : public USaveGame
{
    GENERATED_BODY()

public:
    UPROPERTY(VisibleAnywhere, BlueprintReadWrite, Category = "SaveGame|Meta")
    FString SaveSlotTitle = TEXT("Кампания 1845 г. — Ставка Дарго-Ведено");

    UPROPERTY(VisibleAnywhere, BlueprintReadWrite, Category = "SaveGame|Meta")
    FDateTime SavedTimestampUtc;

    UPROPERTY(VisibleAnywhere, BlueprintReadWrite, Category = "SaveGame|Determinism")
    int32 CampaignSeed = 18450706;

    UPROPERTY(VisibleAnywhere, BlueprintReadWrite, Category = "SaveGame|Determinism")
    int32 CurrentRNGSeedState = 18450706;

    UPROPERTY(VisibleAnywhere, BlueprintReadWrite, Category = "SaveGame|Campaign")
    int32 CurrentTurn = 1;

    UPROPERTY(VisibleAnywhere, BlueprintReadWrite, Category = "SaveGame|Treasury")
    int32 CentralGunpowderPoods = 195;

    UPROPERTY(VisibleAnywhere, BlueprintReadWrite, Category = "SaveGame|Treasury")
    int32 CentralProvisionsMeasures = 1420;

    UPROPERTY(VisibleAnywhere, BlueprintReadWrite, Category = "SaveGame|Treasury")
    int32 BaitAlMalSilverRubles = 680;

    UPROPERTY(VisibleAnywhere, BlueprintReadWrite, Category = "SaveGame|State")
    float ShamilAuthorityPercent = 86.0f;

    UPROPERTY(VisibleAnywhere, BlueprintReadWrite, Category = "SaveGame|State")
    float OttomanSupportPercent = 48.0f;

    UPROPERTY(VisibleAnywhere, BlueprintReadWrite, Category = "SaveGame|State")
    int32 CompletedKhalwatSessions = 0;

    UPROPERTY(VisibleAnywhere, BlueprintReadWrite, Category = "SaveGame|ImperialAI")
    EImperialDoctrine ActiveImperialDoctrine = EImperialDoctrine::VorontsovDeepThrust;

    UPROPERTY(VisibleAnywhere, BlueprintReadWrite, Category = "SaveGame|ImperialAI")
    FName ImperialTargetNaibateID = FName("karata");

    UPROPERTY(VisibleAnywhere, BlueprintReadWrite, Category = "SaveGame|ImperialAI")
    int32 TurnsUntilImperialStrike = 2;

    UPROPERTY(VisibleAnywhere, BlueprintReadWrite, Category = "SaveGame|Data")
    TMap<FName, FNaibateRegionRow> SavedNaibates;

    UPROPERTY(VisibleAnywhere, BlueprintReadWrite, Category = "SaveGame|Data")
    TMap<FName, FShamilNizamRow> SavedNizams;

    UPROPERTY(VisibleAnywhere, BlueprintReadWrite, Category = "SaveGame|Envoys")
    TArray<FEnvoyCaravanPacket> SavedActiveEnvoys;
};
