// Source/ImamatWargame/Private/Strategic/ImamatStrategicSubsystem.cpp
#include "Strategic/ImamatStrategicSubsystem.h"
#include "Strategic/ImamatSaveGame.h"
#include "Kismet/GameplayStatics.h"
#include "Dom/JsonObject.h"
#include "Serialization/JsonWriter.h"
#include "Serialization/JsonSerializer.h"
#include "Math/UnrealMathUtility.h"

void UImamatStrategicSubsystem::Initialize(FSubsystemCollectionBase& Collection)
{
    Super::Initialize(Collection);
    CampaignRNG.Initialize(CampaignSeed);
}

void UImamatStrategicSubsystem::InitializeFromDataTables(UDataTable* NaibatesTable, UDataTable* NizamsTable, int32 InSeed)
{
    CampaignSeed = InSeed;
    CampaignRNG.Initialize(CampaignSeed);

    if (NaibatesTable)
    {
        Naibates.Empty();
        const TMap<FName, uint8*>& RowMap = NaibatesTable->GetRowMap();
        for (const TPair<FName, uint8*>& Pair : RowMap)
        {
            if (const FNaibateRegionRow* Row = reinterpret_cast<const FNaibateRegionRow*>(Pair.Value))
            {
                Naibates.Add(Pair.Key, *Row);
            }
        }
    }

    if (NizamsTable)
    {
        Nizams.Empty();
        const TMap<FName, uint8*>& RowMap = NizamsTable->GetRowMap();
        for (const TPair<FName, uint8*>& Pair : RowMap)
        {
            if (const FShamilNizamRow* Row = reinterpret_cast<const FShamilNizamRow*>(Pair.Value))
            {
                Nizams.Add(Pair.Key, *Row);
            }
        }
    }
}

void UImamatStrategicSubsystem::GetAggregatedNizamModifiers(
    float& OutStressReduction,
    float& OutGlobalImanBonus,
    float& OutGreedReductionPercent,
    float& OutPrideReductionPercent,
    int32& OutPowderPerTurn,
    int32& OutProvisionsPerTurn,
    int32& OutSilverPerTurn) const
{
    OutStressReduction = 0.0f;
    OutGlobalImanBonus = 0.0f;
    OutGreedReductionPercent = 0.0f;
    OutPrideReductionPercent = 0.0f;
    OutPowderPerTurn = 0;
    OutProvisionsPerTurn = 0;
    OutSilverPerTurn = 0;

    for (const TPair<FName, FShamilNizamRow>& Pair : Nizams)
    {
        const FShamilNizamRow& Niz = Pair.Value;
        if (Niz.bEnacted)
        {
            OutStressReduction += Niz.StressReduction;
            OutGlobalImanBonus += Niz.GlobalImanBonus;
            OutGreedReductionPercent = FMath::Min(70.0f, OutGreedReductionPercent + Niz.GreedPenaltyReductionPercent);
            OutPrideReductionPercent = FMath::Min(70.0f, OutPrideReductionPercent + Niz.PridePenaltyReductionPercent);
            OutPowderPerTurn += Niz.PowderPerTurnBonus;
            OutProvisionsPerTurn += Niz.ProvisionsPerTurnBonus;
            OutSilverPerTurn += Niz.SilverPerTurnBonus;
        }
    }
}

float UImamatStrategicSubsystem::CalculateLeaderStress(bool& bOutZulmatWarning) const
{
    if (Naibates.Num() == 0)
    {
        bOutZulmatWarning = false;
        return 18.0f;
    }

    float StressRed = 0.0f, ImanBon = 0.0f, GreedRed = 0.0f, PrideRed = 0.0f;
    int32 PowBon = 0, ProvBon = 0, SilvBon = 0;
    GetAggregatedNizamModifiers(StressRed, ImanBon, GreedRed, PrideRed, PowBon, ProvBon, SilvBon);

    float TotalPressure = 0.0f;
    int32 LowPowderRegions = 0;
    int32 ProudUnrulyNaibs = 0;

    for (const TPair<FName, FNaibateRegionRow>& Pair : Naibates)
    {
        const FNaibateRegionRow& Reg = Pair.Value;
        TotalPressure += Reg.ImperialPressure;
        if (Reg.GunpowderPoods < 35)
        {
            LowPowderRegions++;
        }
        if (Reg.Traits.Pride > 80.0f && Reg.Traits.Iman < 75.0f)
        {
            ProudUnrulyNaibs++;
        }
    }

    const float AvgPressure = TotalPressure / static_cast<float>(Naibates.Num());
    const float RawStress =
        (AvgPressure * 0.55f) +
        (static_cast<float>(LowPowderRegions) * 7.5f) +
        (static_cast<float>(ProudUnrulyNaibs) * 8.0f) -
        (OttomanSupportPercent * 0.22f) -
        StressRed -
        (static_cast<float>(CompletedKhalwatSessions) * 9.0f);

    const float FinalStress = FMath::Clamp(FMath::RoundToFloat(RawStress), 12.0f, 98.0f);
    bOutZulmatWarning = (FinalStress >= 80.0f);
    return FinalStress;
}

FOrderProbabilityBreakdown UImamatStrategicSubsystem::GetOrderProbabilityBreakdown(
    FName TargetNaibateID,
    ENaibOrderType OrderType,
    EEnvoyRouteMode RouteMode,
    int32 AttachedPowder,
    int32 AttachedSilver) const
{
    FOrderProbabilityBreakdown Breakdown;
    const FNaibateRegionRow* Reg = Naibates.Find(TargetNaibateID);
    if (!Reg)
    {
        Breakdown.FinalExecutionChancePercent = 0.0f;
        Breakdown.FinalInterceptRiskPercent = 100.0f;
        return Breakdown;
    }

    float StressRed = 0.0f, ImanBon = 0.0f, GreedRed = 0.0f, PrideRed = 0.0f;
    int32 PowBon = 0, ProvBon = 0, SilvBon = 0;
    GetAggregatedNizamModifiers(StressRed, ImanBon, GreedRed, PrideRed, PowBon, ProvBon, SilvBon);

    Breakdown.EffectiveIman = FMath::Clamp(Reg->Traits.Iman + ImanBon, 0.0f, 100.0f);
    Breakdown.BaseImanContribution = Breakdown.EffectiveIman * 0.52f;
    Breakdown.BaseCourageContribution = Reg->Traits.Courage * 0.34f;

    const float SilverFactor = (AttachedSilver < 30) ? 1.25f : 0.45f;
    Breakdown.GreedPenalty = Reg->Traits.Greed * 0.28f * (1.0f - GreedRed / 100.0f) * SilverFactor;

    const float OrderPrideWeight = (OrderType == ENaibOrderType::CollectZakat) ? 1.20f : 0.75f;
    Breakdown.PridePenalty = Reg->Traits.Pride * 0.22f * (1.0f - PrideRed / 100.0f) * OrderPrideWeight;

    Breakdown.SupplyBonus = FMath::Min(22.0f, (AttachedPowder * 0.42f) + (AttachedSilver * 0.12f));

    bool bZulmat = false;
    const float LeaderStress = CalculateLeaderStress(bZulmat);
    Breakdown.LeaderStressPenalty = (LeaderStress > 75.0f) ? 8.0f : 0.0f;

    const float RawPositive = Breakdown.BaseImanContribution + Breakdown.BaseCourageContribution + Breakdown.SupplyBonus;
    const float RawNegative = Breakdown.GreedPenalty + Breakdown.PridePenalty + Breakdown.LeaderStressPenalty;

    Breakdown.FinalExecutionChancePercent = FMath::Clamp(
        FMath::RoundToFloat(RawPositive - RawNegative),
        25.0f,
        98.0f
    );

    if (AttachedPowder >= 45)
    {
        Breakdown.ConvoyInterceptPenalty = 16.0f;
    }
    else if (AttachedPowder >= 30)
    {
        Breakdown.ConvoyInterceptPenalty = 8.0f;
    }
    else
    {
        Breakdown.ConvoyInterceptPenalty = 0.0f;
    }

    if (RouteMode == EEnvoyRouteMode::FastImperialRoad)
    {
        const float BaseRoadRisk = FMath::Clamp(FMath::RoundToFloat(Reg->ImperialPressure * 0.38f), 5.0f, 45.0f);
        Breakdown.FinalInterceptRiskPercent = FMath::Clamp(BaseRoadRisk + Breakdown.ConvoyInterceptPenalty, 5.0f, 65.0f);
        Breakdown.EstimatedTravelTurns = FMath::Max(1, Reg->BaseTravelTurns - 1);
    }
    else
    {
        const float BaseMountainRisk = FMath::Clamp(FMath::RoundToFloat(Reg->ImperialPressure * 0.12f), 4.0f, 22.0f);
        Breakdown.FinalInterceptRiskPercent = FMath::Clamp(BaseMountainRisk + Breakdown.ConvoyInterceptPenalty, 4.0f, 42.0f);
        Breakdown.EstimatedTravelTurns = FMath::Max(1, Reg->BaseTravelTurns);
    }

    return Breakdown;
}

void UImamatStrategicSubsystem::CalculateOrderExecutionProbability(
    FName TargetNaibateID,
    ENaibOrderType OrderType,
    EEnvoyRouteMode RouteMode,
    int32 AttachedPowder,
    int32 AttachedSilver,
    float& OutExecutionChance,
    float& OutInterceptRisk) const
{
    const FOrderProbabilityBreakdown Breakdown = GetOrderProbabilityBreakdown(
        TargetNaibateID,
        OrderType,
        RouteMode,
        AttachedPowder,
        AttachedSilver
    );
    OutExecutionChance = Breakdown.FinalExecutionChancePercent;
    OutInterceptRisk = Breakdown.FinalInterceptRiskPercent;
}

bool UImamatStrategicSubsystem::SendEnvoyWithOrder(
    FName TargetNaibateID,
    ENaibOrderType OrderType,
    EEnvoyRouteMode RouteMode,
    int32 AttachedPowder,
    int32 AttachedSilver)
{
    if (AttachedPowder < 0 || AttachedSilver < 0)
    {
        return false;
    }

    if (CentralGunpowderPoods < AttachedPowder || BaitAlMalSilverRubles < AttachedSilver)
    {
        return false;
    }

    const FNaibateRegionRow* Reg = Naibates.Find(TargetNaibateID);
    if (!Reg)
    {
        return false;
    }

    CentralGunpowderPoods -= AttachedPowder;
    BaitAlMalSilverRubles -= AttachedSilver;

    const FOrderProbabilityBreakdown Breakdown = GetOrderProbabilityBreakdown(
        TargetNaibateID,
        OrderType,
        RouteMode,
        AttachedPowder,
        AttachedSilver
    );

    FEnvoyCaravanPacket Packet;
    Packet.EnvoyID = FGuid::NewGuid();
    Packet.TargetNaibateID = TargetNaibateID;
    Packet.OrderType = OrderType;
    Packet.RouteMode = RouteMode;
    Packet.AttachedPowderPoods = AttachedPowder;
    Packet.AttachedSilverRubles = AttachedSilver;
    Packet.ExecutionChancePercent = Breakdown.FinalExecutionChancePercent;
    Packet.InterceptRiskPercent = Breakdown.FinalInterceptRiskPercent;
    Packet.TurnsLeft = Breakdown.EstimatedTravelTurns;
    Packet.TotalTurns = Breakdown.EstimatedTravelTurns;

    ActiveEnvoys.Add(Packet);
    return true;
}

bool UImamatStrategicSubsystem::EnactShamilNizam(FName NizamID)
{
    FShamilNizamRow* Niz = Nizams.Find(NizamID);
    if (!Niz || Niz->bEnacted)
    {
        return false;
    }

    if (ShamilAuthorityPercent < Niz->CostAuthority || BaitAlMalSilverRubles < Niz->CostSilver)
    {
        return false;
    }

    ShamilAuthorityPercent = FMath::Clamp(ShamilAuthorityPercent - Niz->CostAuthority, 10.0f, 100.0f);
    BaitAlMalSilverRubles -= Niz->CostSilver;
    Niz->bEnacted = true;

    bool bZulmat = false;
    const float UpdatedStress = CalculateLeaderStress(bZulmat);
    OnStressChanged.Broadcast(UpdatedStress, bZulmat);
    return true;
}

FTacticalBattleContext UImamatStrategicSubsystem::BuildTacticalBattleContext(
    FName NaibateID,
    FName TerrainID,
    ETacticalBattleMode BattleMode)
{
    FTacticalBattleContext Context;
    Context.NaibateID = NaibateID;
    Context.TerrainID = TerrainID;
    Context.BattleMode = BattleMode;
    Context.GazyrChargesPerFighter = 18;

    if (const FNaibateRegionRow* Reg = Naibates.Find(NaibateID))
    {
        Context.AvailableGunpowderPoods = Reg->GunpowderPoods;
        Context.GarrisonInfantry = Reg->GarrisonInfantry;
        Context.MurtazekCavalry = Reg->MurtazekCavalry;
        Context.CommanderTraits = Reg->Traits;
    }

    PendingTacticalContext = Context;
    return Context;
}

void UImamatStrategicSubsystem::ApplyTacticalBattleResult(const FTacticalBattleResult& Result)
{
    if (FNaibateRegionRow* Reg = Naibates.Find(Result.NaibateID))
    {
        Reg->GunpowderPoods = FMath::Max(0, Reg->GunpowderPoods - Result.ExpendedGunpowderPoods + Result.CapturedPowderPoods);
        Reg->GarrisonInfantry = FMath::Max(100, Reg->GarrisonInfantry - Result.GarrisonCasualties);

        if (Result.bImamatVictory)
        {
            Reg->ImperialPressure = FMath::Clamp(Reg->ImperialPressure - Result.ImperialPressureDrop, 12.0f, 96.0f);
            Reg->bUnderSiege = (Reg->ImperialPressure >= 80.0f);
            Reg->Traits.Iman = FMath::Min(100.0f, Reg->Traits.Iman + 6.0f);
            BaitAlMalSilverRubles += Result.CapturedSilverRubles;
            ShamilAuthorityPercent = FMath::Min(100.0f, ShamilAuthorityPercent + 5.0f);
        }
        else
        {
            Reg->ImperialPressure = FMath::Min(96.0f, Reg->ImperialPressure + 14.0f);
            Reg->bUnderSiege = true;
            ShamilAuthorityPercent = FMath::Max(15.0f, ShamilAuthorityPercent - 6.0f);
        }
    }

    bool bZulmat = false;
    const float UpdatedStress = CalculateLeaderStress(bZulmat);
    OnStressChanged.Broadcast(UpdatedStress, bZulmat);
}

void UImamatStrategicSubsystem::RotateImperialDoctrineAndTarget()
{
    const uint8 NextIndex = (static_cast<uint8>(ActiveImperialDoctrine) + 1) % 4;
    ActiveImperialDoctrine = static_cast<EImperialDoctrine>(NextIndex);

    TArray<FName> PreferredTargets;
    switch (ActiveImperialDoctrine)
    {
        case EImperialDoctrine::VorontsovDeepThrust:
            PreferredTargets = { FName("vedeno"), FName("karata"), FName("benoy"), FName("khunzakh") };
            break;
        case EImperialDoctrine::ArgutinskySiegeRam:
            PreferredTargets = { FName("gergebil"), FName("chokh"), FName("gunib"), FName("teletl"), FName("irib") };
            break;
        case EImperialDoctrine::FreytagFlyingColumns:
            PreferredTargets = { FName("shali"), FName("vedeno"), FName("benoy") };
            break;
        case EImperialDoctrine::EvdokimovForestAxe:
        default:
            PreferredTargets = { FName("vedeno"), FName("shali"), FName("benoy"), FName("gunib") };
            break;
    }

    for (const FName& CandidateID : PreferredTargets)
    {
        if (Naibates.Contains(CandidateID) && CandidateID != ImperialTargetNaibateID)
        {
            ImperialTargetNaibateID = CandidateID;
            return;
        }
    }

    for (const TPair<FName, FNaibateRegionRow>& Pair : Naibates)
    {
        if (Pair.Key != ImperialTargetNaibateID)
        {
            ImperialTargetNaibateID = Pair.Key;
            return;
        }
    }
}

void UImamatStrategicSubsystem::ProcessNextStrategicTurn(
    int32 SeasonalProvisionsMod,
    int32 SeasonalPowderMod,
    float SeasonalPressureMod)
{
    CurrentTurn++;

    float StressRed = 0.0f, ImanBon = 0.0f, GreedRed = 0.0f, PrideRed = 0.0f;
    int32 PowBon = 0, ProvBon = 0, SilvBon = 0;
    GetAggregatedNizamModifiers(StressRed, ImanBon, GreedRed, PrideRed, PowBon, ProvBon, SilvBon);

    int32 TurnPowderDelta = 8 + PowBon + SeasonalPowderMod;
    int32 TurnProvisionsDelta = 110 + ProvBon + SeasonalProvisionsMod;
    int32 TurnSilverDelta = 52 + SilvBon;

    // 1. Обработка удара колонны Отдельного Кавказского корпуса и смена доктрины
    FName StruckRegionThisTurn = NAME_None;
    if (TurnsUntilImperialStrike <= 1)
    {
        StruckRegionThisTurn = ImperialTargetNaibateID;
        const EImperialDoctrine ExecutedDoctrine = ActiveImperialDoctrine;

        if (FNaibateRegionRow* AttackedReg = Naibates.Find(ImperialTargetNaibateID))
        {
            AttackedReg->ImperialPressure = FMath::Min(96.0f, AttackedReg->ImperialPressure + 18.0f);
            AttackedReg->GunpowderPoods = FMath::Max(4, AttackedReg->GunpowderPoods - 10);
            AttackedReg->bUnderSiege = (AttackedReg->ImperialPressure >= 80.0f);
        }

        OnImperialStrike.Broadcast(StruckRegionThisTurn, ExecutedDoctrine);
        RotateImperialDoctrineAndTarget();
        TurnsUntilImperialStrike = 2;
    }
    else
    {
        TurnsUntilImperialStrike--;
    }

    // 2. Детерминированное разрешение маршрутов конных гонцов через CampaignRNG
    TSet<FName> ResolvedRegionsThisTurn;
    for (int32 i = ActiveEnvoys.Num() - 1; i >= 0; --i)
    {
        FEnvoyCaravanPacket& Env = ActiveEnvoys[i];
        Env.TurnsLeft--;

        if (Env.TurnsLeft <= 0)
        {
            const bool bIntercepted = (CampaignRNG.FRandRange(0.0f, 100.0f) < Env.InterceptRiskPercent);
            bool bExecuted = false;

            if (!bIntercepted)
            {
                bExecuted = (CampaignRNG.FRandRange(0.0f, 100.0f) < Env.ExecutionChancePercent);
                if (FNaibateRegionRow* TargetReg = Naibates.Find(Env.TargetNaibateID))
                {
                    TargetReg->GunpowderPoods += Env.AttachedPowderPoods;
                    if (bExecuted)
                    {
                        ResolvedRegionsThisTurn.Add(Env.TargetNaibateID);
                        if (Env.OrderType == ENaibOrderType::RaidSupplyLine)
                        {
                            TargetReg->ImperialPressure = FMath::Max(15.0f, TargetReg->ImperialPressure - 18.0f);
                            TargetReg->Traits.Iman = FMath::Min(100.0f, TargetReg->Traits.Iman + 4.0f);
                            TargetReg->bUnderSiege = (TargetReg->ImperialPressure >= 80.0f);
                            TurnPowderDelta += 12;
                            TurnSilverDelta += 65;
                        }
                        else if (Env.OrderType == ENaibOrderType::FortifyBlindages)
                        {
                            TargetReg->ImperialPressure = FMath::Max(15.0f, TargetReg->ImperialPressure - 24.0f);
                            TargetReg->Traits.Iman = FMath::Min(100.0f, TargetReg->Traits.Iman + 5.0f);
                            TargetReg->bUnderSiege = false;
                        }
                        else if (Env.OrderType == ENaibOrderType::CollectZakat)
                        {
                            TurnSilverDelta += 135;
                            TurnProvisionsDelta += 160;
                            TurnPowderDelta += 10;
                        }
                        else if (Env.OrderType == ENaibOrderType::MobilizeMurtazeks)
                        {
                            TargetReg->GarrisonInfantry += 220;
                            TargetReg->MurtazekCavalry += 90;
                            TargetReg->ImperialPressure = FMath::Max(15.0f, TargetReg->ImperialPressure - 12.0f);
                            TargetReg->bUnderSiege = (TargetReg->ImperialPressure >= 80.0f);
                        }
                    }
                    else
                    {
                        ShamilAuthorityPercent = FMath::Max(15.0f, ShamilAuthorityPercent - 3.0f);
                    }
                }
            }

            OnEnvoyArrived.Broadcast(Env.TargetNaibateID, bIntercepted, bExecuted);
            ActiveEnvoys.RemoveAt(i);
        }
    }

    // 3. Естественный прирост/расход в наибствах и актуализация статуса осады
    for (TPair<FName, FNaibateRegionRow>& Pair : Naibates)
    {
        FNaibateRegionRow& Reg = Pair.Value;
        if (Pair.Key != StruckRegionThisTurn && !ResolvedRegionsThisTurn.Contains(Pair.Key))
        {
            const float RandomDrift = CampaignRNG.FRandRange(-0.5f, 3.2f) + (SeasonalPressureMod * 0.45f);
            Reg.ImperialPressure = FMath::Clamp(Reg.ImperialPressure + RandomDrift, 15.0f, 96.0f);
        }
        Reg.bUnderSiege = (Reg.ImperialPressure >= 80.0f);

        const int32 PowderBurn = Reg.bUnderSiege ? 6 : 3;
        Reg.GunpowderPoods = FMath::Max(4, Reg.GunpowderPoods - PowderBurn);

        // Экстренная подкачка 2 пудов из арсенала Ведено при истощении округа
        if (Reg.GunpowderPoods < 24 && CentralGunpowderPoods >= 12)
        {
            Reg.GunpowderPoods += 2;
            TurnPowderDelta -= 2;
        }

        const int32 PastureDelta = Reg.bPastureAccessOpen ? 25 : -15;
        Reg.ProvisionsMeasures = FMath::Max(
            80,
            Reg.ProvisionsMeasures + FMath::RoundToInt(Reg.TerraceYieldPercent * 0.4f) + PastureDelta - 20
        );
    }

    CentralGunpowderPoods = FMath::Max(0, CentralGunpowderPoods + TurnPowderDelta);
    CentralProvisionsMeasures = FMath::Max(0, CentralProvisionsMeasures + TurnProvisionsDelta);
    BaitAlMalSilverRubles = FMath::Max(0, BaitAlMalSilverRubles + TurnSilverDelta);

    bool bZulmat = false;
    const float NextStress = CalculateLeaderStress(bZulmat);
    OnStressChanged.Broadcast(NextStress, bZulmat);
}

FMonteCarloBalanceReport UImamatStrategicSubsystem::RunMonteCarloBalanceSimulation(
    int32 NumRuns,
    float ImperialDifficultyMultiplier) const
{
    FMonteCarloBalanceReport Report;
    Report.TotalSimulatedCampaigns = FMath::Max(1, NumRuns);

    // Локальный детерминированный поток для воспроизводимого отчёта Монте-Карло
    FRandomStream SimRNG(CampaignSeed ^ 0x5A17);

    bool bZulmat = false;
    const float BaseStress = CalculateLeaderStress(bZulmat);

    int32 EnactedCount = 0;
    for (const TPair<FName, FShamilNizamRow>& Pair : Nizams)
    {
        if (Pair.Value.bEnacted) EnactedCount++;
    }

    int32 SurvivedCount = 0;
    int32 PowderShortageCount = 0;
    float StressSum = 0.0f;

    const float DifficultyPenalty = (ImperialDifficultyMultiplier - 1.0f) * 35.0f;
    const float NizamBonus = static_cast<float>(EnactedCount) * 3.2f;
    const float PowderFactor = FMath::Min(22.0f, static_cast<float>(CentralGunpowderPoods) * 0.08f);

    for (int32 RunIdx = 0; RunIdx < Report.TotalSimulatedCampaigns; ++RunIdx)
    {
        const float Variance = SimRNG.FRandRange(-13.0f, 13.0f);
        const float Score = (100.0f - BaseStress) * 0.65f + NizamBonus + PowderFactor - DifficultyPenalty + Variance;
        if (Score >= 48.0f)
        {
            SurvivedCount++;
        }

        const float SimStress = FMath::Clamp(BaseStress + DifficultyPenalty * 0.6f + SimRNG.FRandRange(-9.0f, 9.0f), 15.0f, 96.0f);
        StressSum += SimStress;

        if (CentralGunpowderPoods < 140 || SimRNG.FRand() < (0.35f * ImperialDifficultyMultiplier))
        {
            PowderShortageCount++;
        }
    }

    Report.ImamatSurvivalRatePercent = FMath::RoundToFloat((static_cast<float>(SurvivedCount) / Report.TotalSimulatedCampaigns) * 100.0f);
    Report.AverageFinalLeaderStress = FMath::RoundToFloat(StressSum / Report.TotalSimulatedCampaigns);
    Report.PowderBottleneckFrequencyPercent = FMath::RoundToFloat((static_cast<float>(PowderShortageCount) / Report.TotalSimulatedCampaigns) * 100.0f);
    return Report;
}

bool UImamatStrategicSubsystem::SaveCampaignToSlot(const FString& SlotName, int32 UserIndex)
{
    UImamatSaveGame* SaveObj = Cast<UImamatSaveGame>(UGameplayStatics::CreateSaveGameObject(UImamatSaveGame::StaticClass()));
    if (!SaveObj)
    {
        return false;
    }

    SaveObj->SavedTimestampUtc = FDateTime::UtcNow();
    SaveObj->CampaignSeed = CampaignSeed;
    SaveObj->CurrentRNGSeedState = CampaignRNG.GetCurrentSeed();
    SaveObj->CurrentTurn = CurrentTurn;
    SaveObj->CentralGunpowderPoods = CentralGunpowderPoods;
    SaveObj->CentralProvisionsMeasures = CentralProvisionsMeasures;
    SaveObj->BaitAlMalSilverRubles = BaitAlMalSilverRubles;
    SaveObj->ShamilAuthorityPercent = ShamilAuthorityPercent;
    SaveObj->OttomanSupportPercent = OttomanSupportPercent;
    SaveObj->CompletedKhalwatSessions = CompletedKhalwatSessions;
    SaveObj->ActiveImperialDoctrine = ActiveImperialDoctrine;
    SaveObj->ImperialTargetNaibateID = ImperialTargetNaibateID;
    SaveObj->TurnsUntilImperialStrike = TurnsUntilImperialStrike;
    SaveObj->SavedNaibates = Naibates;
    SaveObj->SavedNizams = Nizams;
    SaveObj->SavedActiveEnvoys = ActiveEnvoys;

    return UGameplayStatics::SaveGameToSlot(SaveObj, SlotName, UserIndex);
}

bool UImamatStrategicSubsystem::LoadCampaignFromSlot(const FString& SlotName, int32 UserIndex)
{
    if (!UGameplayStatics::DoesSaveGameExist(SlotName, UserIndex))
    {
        return false;
    }

    UImamatSaveGame* LoadedObj = Cast<UImamatSaveGame>(UGameplayStatics::LoadGameFromSlot(SlotName, UserIndex));
    if (!LoadedObj)
    {
        return false;
    }

    CampaignSeed = LoadedObj->CampaignSeed;
    CampaignRNG.Initialize(LoadedObj->CurrentRNGSeedState);
    CurrentTurn = LoadedObj->CurrentTurn;
    CentralGunpowderPoods = LoadedObj->CentralGunpowderPoods;
    CentralProvisionsMeasures = LoadedObj->CentralProvisionsMeasures;
    BaitAlMalSilverRubles = LoadedObj->BaitAlMalSilverRubles;
    ShamilAuthorityPercent = LoadedObj->ShamilAuthorityPercent;
    OttomanSupportPercent = LoadedObj->OttomanSupportPercent;
    CompletedKhalwatSessions = LoadedObj->CompletedKhalwatSessions;
    ActiveImperialDoctrine = LoadedObj->ActiveImperialDoctrine;
    ImperialTargetNaibateID = LoadedObj->ImperialTargetNaibateID;
    TurnsUntilImperialStrike = LoadedObj->TurnsUntilImperialStrike;
    Naibates = LoadedObj->SavedNaibates;
    Nizams = LoadedObj->SavedNizams;
    ActiveEnvoys = LoadedObj->SavedActiveEnvoys;

    bool bZulmat = false;
    const float UpdatedStress = CalculateLeaderStress(bZulmat);
    OnStressChanged.Broadcast(UpdatedStress, bZulmat);
    return true;
}

FString UImamatStrategicSubsystem::ExportCampaignToJsonString() const
{
    TSharedPtr<FJsonObject> RootObj = MakeShared<FJsonObject>();
    RootObj->SetStringField(TEXT("schemaVersion"), TEXT("ImamatSaveGame_UE5_v1"));
    RootObj->SetNumberField(TEXT("campaignSeed"), CampaignSeed);
    RootObj->SetNumberField(TEXT("currentRNGSeedState"), CampaignRNG.GetCurrentSeed());
    RootObj->SetNumberField(TEXT("currentTurn"), CurrentTurn);
    RootObj->SetNumberField(TEXT("centralGunpowderPoods"), CentralGunpowderPoods);
    RootObj->SetNumberField(TEXT("centralProvisionsMeasures"), CentralProvisionsMeasures);
    RootObj->SetNumberField(TEXT("baitAlMalSilverRubles"), BaitAlMalSilverRubles);
    RootObj->SetNumberField(TEXT("shamilAuthorityPercent"), ShamilAuthorityPercent);
    RootObj->SetNumberField(TEXT("ottomanSupportPercent"), OttomanSupportPercent);
    RootObj->SetNumberField(TEXT("completedKhalwatSessions"), CompletedKhalwatSessions);

    FString OutputString;
    TSharedRef<TJsonWriter<>> Writer = TJsonWriterFactory<>::Create(&OutputString);
    FJsonSerializer::Serialize(RootObj.ToSharedRef(), Writer);
    return OutputString;
}

FString UImamatStrategicSubsystem::ExportPlaytestTelemetryToJsonString() const
{
    TSharedPtr<FJsonObject> RootObj = MakeShared<FJsonObject>();
    RootObj->SetStringField(TEXT("buildVersion"), TEXT("0.5.0-M5-PlaytestReady"));
    RootObj->SetStringField(TEXT("platform"), TEXT("UE5_5_Native"));
    RootObj->SetNumberField(TEXT("turnsSurvived"), CurrentTurn);
    RootObj->SetNumberField(TEXT("finalVedenoPowderPoods"), CentralGunpowderPoods);
    RootObj->SetNumberField(TEXT("finalSilverRubles"), BaitAlMalSilverRubles);
    RootObj->SetNumberField(TEXT("khalwatPerformedCount"), CompletedKhalwatSessions);

    float RegionalPowderSum = 0.0f;
    for (const TPair<FName, FNaibateStateRow>& Pair : Naibates)
    {
        RegionalPowderSum += static_cast<float>(Pair.Value.LocalGunpowderPoods);
    }
    const float AvgRegionalPowder = Naibates.Num() > 0 ? (RegionalPowderSum / Naibates.Num()) : 0.0f;
    RootObj->SetNumberField(TEXT("finalAvgRegionalPowderPoods"), AvgRegionalPowder);

    FString OutputString;
    TSharedRef<TJsonWriter<>> Writer = TJsonWriterFactory<>::Create(&OutputString);
    FJsonSerializer::Serialize(RootObj.ToSharedRef(), Writer);
    return OutputString;
}
