#!/usr/bin/env python3
"""
headless_balance_sim.py
Консольный валидатор математического баланса (Headless Monte-Carlo Simulator),
1-в-1 повторяющий C++20 логику UImamatStrategicSubsystem (ImamatStrategicSubsystem.cpp).

Прогоняет 1,000 партий по 20 ходов на экспортированных таблицах:
  - DT_Naibates_1845.json (10 наибств)
  - DT_ShamilNizams.json (12 законов Кодекса Низама)
  - DT_CampaignScenarios.json

Сравнивает 4 архетипа стратегии игрока, строит кривую истощения/накопления пороха
(Ходы 1, 5, 10, 15, 20), частоту кризиса «Зульмат» (Stress >= 80%) и выживаемость Имамата.
"""

import copy
import json
import math
import os
import random
from dataclasses import dataclass, field
from typing import Dict, List, Tuple

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATATABLES_DIR = os.path.join(BASE_DIR, "04_UE5_ImamatWargame", "Content", "DataTables")

# 6 сезонных модификаторов из App.jsx (климатический цикл года)
SEASONAL_CYCLE = [
    {"provisionsMod": 35, "powderMod": 5, "pressureMod": 4.0},    # Июнь: открытие перевалов
    {"provisionsMod": 45, "powderMod": 0, "pressureMod": 3.0},    # Июль: грозы в горах
    {"provisionsMod": 85, "powderMod": 8, "pressureMod": 2.0},    # Август: жатва на террасах
    {"provisionsMod": 50, "powderMod": 12, "pressureMod": -2.0},  # Сентябрь: сгон отар и рейды
    {"provisionsMod": 15, "powderMod": 4, "pressureMod": -4.0},   # Октябрь: распутица и ранний снег
    {"provisionsMod": -25, "powderMod": 6, "pressureMod": -5.0},  # Ноябрь: блокада кутанов
]

DOCTRINE_TARGETS = {
    0: ["gergebil", "chokh", "gunib", "teletl", "irib", "khunzakh"],  # Grabbe / Argutinsky (Siege Ram)
    1: ["shali", "vedeno", "benoy", "michik"],                        # Freytag (Flying Cordons)
    2: ["vedeno", "karata", "benoy", "khunzakh"],                     # Vorontsov (Deep Column)
    3: ["vedeno", "shali", "benoy", "gunib"],                         # Baryatinsky / Evdokimov (Forest Axe)
}

DOCTRINE_SPECS = {
    0: {
        "id": "Grabbe_Argutinsky_SiegeRam",
        "nameRu": "Граббе / Аргутинский (1839/49): Таранный штурм и мины",
        "nameEn": "Grabbe / Argutinsky (1839/49): Siege Ram & Mine Galleries",
        "strike_pressure_bonus": 4.0,
        "strike_powder_drain": 14,
        "intercept_risk_bonus": 2.0,
        "provisions_mod_per_turn": 0,
        "drift_bonus": 0.35,
    },
    1: {
        "id": "Freytag_FlyingCordons",
        "nameRu": "Р. К. Фрейтаг (1844): Летучие кордоны и перехват чапаров",
        "nameEn": "R. K. Freitag (1844): Flying Cordons & Envoy Interception",
        "strike_pressure_bonus": 0.0,
        "strike_powder_drain": 9,
        "intercept_risk_bonus": 12.0,
        "provisions_mod_per_turn": -40,
        "drift_bonus": 0.15,
    },
    2: {
        "id": "Vorontsov_DeepColumn",
        "nameRu": "Кн. М. С. Воронцов (1845): Глубокий клин на Дарго",
        "nameEn": "Prince M. S. Vorontsov (1845): Deep Column to Dargo",
        "strike_pressure_bonus": 5.0,
        "strike_powder_drain": 12,
        "intercept_risk_bonus": 5.0,
        "provisions_mod_per_turn": 30,
        "drift_bonus": 0.25,
    },
    3: {
        "id": "Baryatinsky_ForestCut",
        "nameRu": "Кн. А. И. Барятинский (1857): Вырубка просек и зимняя блокада",
        "nameEn": "Prince A. I. Baryatinsky (1857): Forest Clearing & Blockade",
        "strike_pressure_bonus": 6.5,
        "strike_powder_drain": 13,
        "intercept_risk_bonus": 9.0,
        "provisions_mod_per_turn": -90,
        "drift_bonus": 0.65,
    },
}


def clamp(val: float, low: float, high: float) -> float:
    return max(low, min(high, val))


@dataclass
class EnvoyPacket:
    target_id: str
    order_type: str  # "RaidSupplyLine" | "FortifyBlindages" | "CollectZakat" | "MobilizeMurtazeks"
    route_mode: str  # "SecretMountainPath" | "FastImperialRoad"
    powder: int
    silver: int
    exec_chance: float
    intercept_risk: float
    turns_left: int


class HeadlessStrategicSubsystem:
    """Точное зеркало C++ класса UImamatStrategicSubsystem."""

    def __init__(self, naibates_raw: list, nizams_raw: list, seed: int, locked_doctrine: int = None):
        self.rng = random.Random(seed)
        self.current_turn = 1
        self.central_gunpowder = 195
        self.central_provisions = 1420
        self.bait_al_mal_silver = 680
        self.shamil_authority = 86.0
        self.ottoman_support = 48.0
        self.completed_khalwat_sessions = 0

        self.naibates: Dict[str, dict] = {
            row["NaibateID"]: copy.deepcopy(row) for row in naibates_raw
        }
        self.nizams: Dict[str, dict] = {
            row["NizamID"]: copy.deepcopy(row) for row in nizams_raw
        }
        self.active_envoys: List[EnvoyPacket] = []

        self.locked_doctrine = locked_doctrine
        self.active_doctrine = locked_doctrine if locked_doctrine is not None else 2  # Default Vorontsov
        self.imperial_target_id = DOCTRINE_TARGETS[self.active_doctrine][0]
        self.turns_until_strike = 2

        # Метрики телеметрии партии
        self.envoys_sent = 0
        self.envoys_intercepted = 0
        self.orders_executed = 0
        self.orders_sabotaged = 0
        self.zulmat_turns = 0
        self.powder_shortage_turns = 0

    def get_aggregated_nizam_modifiers(self) -> Tuple[float, float, float, float, int, int, int]:
        stress_red = 0.0
        iman_bon = 0.0
        greed_red = 0.0
        pride_red = 0.0
        pow_bon = 0
        prov_bon = 0
        silv_bon = 0

        for niz in self.nizams.values():
            if niz["bEnacted"]:
                stress_red += niz["StressReduction"]
                iman_bon += niz["GlobalImanBonus"]
                greed_red = min(70.0, greed_red + niz["GreedPenaltyReductionPercent"])
                pride_red = min(70.0, pride_red + niz["PridePenaltyReductionPercent"])
                pow_bon += niz["PowderPerTurnBonus"]
                prov_bon += niz["ProvisionsPerTurnBonus"]
                silv_bon += niz["SilverPerTurnBonus"]

        return stress_red, iman_bon, greed_red, pride_red, pow_bon, prov_bon, silv_bon

    def calculate_leader_stress(self) -> Tuple[float, bool]:
        if not self.naibates:
            return 18.0, False

        stress_red, _, _, _, _, _, _ = self.get_aggregated_nizam_modifiers()

        total_pressure = 0.0
        low_powder_regions = 0
        proud_unruly_naibs = 0

        for reg in self.naibates.values():
            total_pressure += reg["ImperialPressure"]
            if reg["GunpowderPoods"] < 35:
                low_powder_regions += 1
            if reg["Traits"]["Pride"] > 80.0 and reg["Traits"]["Iman"] < 75.0:
                proud_unruly_naibs += 1

        avg_pressure = total_pressure / float(len(self.naibates))
        raw_stress = (
            (avg_pressure * 0.55)
            + (low_powder_regions * 7.5)
            + (proud_unruly_naibs * 8.0)
            - (self.ottoman_support * 0.22)
            - stress_red
            - (self.completed_khalwat_sessions * 9.0)
        )
        final_stress = clamp(round(raw_stress), 12.0, 98.0)
        return final_stress, (final_stress >= 80.0)

    def get_order_probability_breakdown(
        self,
        target_id: str,
        order_type: str,
        route_mode: str,
        attached_powder: int,
        attached_silver: int,
    ) -> dict:
        reg = self.naibates.get(target_id)
        if not reg:
            return {"exec_chance": 0.0, "intercept_risk": 100.0, "travel_turns": 2}

        _, iman_bon, greed_red, pride_red, _, _, _ = self.get_aggregated_nizam_modifiers()
        traits = reg["Traits"]

        effective_iman = clamp(traits["Iman"] + iman_bon, 0.0, 100.0)
        base_iman = effective_iman * 0.52
        base_courage = traits["Courage"] * 0.34

        silver_factor = 1.25 if attached_silver < 30 else 0.45
        greed_pen = traits["Greed"] * 0.28 * (1.0 - greed_red / 100.0) * silver_factor

        pride_weight = 1.20 if order_type == "CollectZakat" else 0.75
        pride_pen = traits["Pride"] * 0.22 * (1.0 - pride_red / 100.0) * pride_weight

        supply_bonus = min(22.0, (attached_powder * 0.42) + (attached_silver * 0.12))
        leader_stress, _ = self.calculate_leader_stress()
        stress_pen = 8.0 if leader_stress > 75.0 else 0.0

        exec_chance = clamp(
            round(base_iman + base_courage + supply_bonus - greed_pen - pride_pen - stress_pen),
            25.0,
            98.0,
        )

        if attached_powder >= 45:
            convoy_pen = 16.0
        elif attached_powder >= 30:
            convoy_pen = 8.0
        else:
            convoy_pen = 0.0

        doc_spec = DOCTRINE_SPECS.get(self.active_doctrine, DOCTRINE_SPECS[2])
        doc_intercept_bonus = doc_spec["intercept_risk_bonus"] if self.locked_doctrine is not None else 0.0

        if route_mode == "FastImperialRoad":
            base_road = clamp(round(reg["ImperialPressure"] * 0.38), 5.0, 45.0)
            intercept_risk = clamp(base_road + convoy_pen + doc_intercept_bonus, 5.0, 75.0)
            travel_turns = max(1, reg["BaseTravelTurns"] - 1)
        else:
            base_mountain = clamp(round(reg["ImperialPressure"] * 0.12), 4.0, 22.0)
            intercept_risk = clamp(base_mountain + convoy_pen + doc_intercept_bonus * 0.65, 4.0, 55.0)
            travel_turns = max(1, reg["BaseTravelTurns"])

        return {
            "exec_chance": exec_chance,
            "convoy_intercept_penalty": convoy_pen,
            "intercept_risk": intercept_risk,
            "travel_turns": travel_turns,
        }

    def send_envoy_with_order(
        self,
        target_id: str,
        order_type: str,
        route_mode: str,
        attached_powder: int,
        attached_silver: int,
    ) -> bool:
        if attached_powder < 0 or attached_silver < 0:
            return False
        if self.central_gunpowder < attached_powder or self.bait_al_mal_silver < attached_silver:
            return False
        if target_id not in self.naibates:
            return False

        self.central_gunpowder -= attached_powder
        self.bait_al_mal_silver -= attached_silver

        bd = self.get_order_probability_breakdown(
            target_id, order_type, route_mode, attached_powder, attached_silver
        )
        self.active_envoys.append(
            EnvoyPacket(
                target_id=target_id,
                order_type=order_type,
                route_mode=route_mode,
                powder=attached_powder,
                silver=attached_silver,
                exec_chance=bd["exec_chance"],
                intercept_risk=bd["intercept_risk"],
                turns_left=bd["travel_turns"],
            )
        )
        self.envoys_sent += 1
        return True

    def enact_shamil_nizam(self, nizam_id: str) -> bool:
        niz = self.nizams.get(nizam_id)
        if not niz or niz["bEnacted"]:
            return False
        if self.shamil_authority < niz["CostAuthority"] or self.bait_al_mal_silver < niz["CostSilver"]:
            return False

        self.shamil_authority = clamp(self.shamil_authority - niz["CostAuthority"], 10.0, 100.0)
        self.bait_al_mal_silver -= niz["CostSilver"]
        niz["bEnacted"] = True
        return True

    def rotate_imperial_doctrine_and_target(self) -> None:
        if self.locked_doctrine is None:
            self.active_doctrine = (self.active_doctrine + 1) % 4
        preferred = DOCTRINE_TARGETS.get(self.active_doctrine, ["karata"])
        for cand in preferred:
            if cand in self.naibates and cand != self.imperial_target_id:
                self.imperial_target_id = cand
                return
        for k in self.naibates:
            if k != self.imperial_target_id:
                self.imperial_target_id = k
                return

    def process_next_strategic_turn(self, prov_mod: int, pow_mod: int, press_mod: float) -> None:
        self.current_turn += 1
        _, _, _, _, pow_bon, prov_bon, silv_bon = self.get_aggregated_nizam_modifiers()
        doc_spec = DOCTRINE_SPECS.get(self.active_doctrine, DOCTRINE_SPECS[2])
        use_doc_mods = self.locked_doctrine is not None

        turn_powder_delta = 8 + pow_bon + pow_mod
        turn_prov_delta = 110 + prov_bon + prov_mod + (doc_spec["provisions_mod_per_turn"] if use_doc_mods else 0)
        turn_silver_delta = 52 + silv_bon

        # 1. Удар колонны Кавказского корпуса
        struck_region = None
        if self.turns_until_strike <= 1:
            struck_region = self.imperial_target_id
            attacked = self.naibates.get(self.imperial_target_id)
            if attacked:
                strike_press = 18.0 + (doc_spec["strike_pressure_bonus"] if use_doc_mods else 0.0)
                strike_drain = doc_spec["strike_powder_drain"] if use_doc_mods else 10
                attacked["ImperialPressure"] = min(96.0, attacked["ImperialPressure"] + strike_press)
                attacked["GunpowderPoods"] = max(4, attacked["GunpowderPoods"] - strike_drain)
                attacked["bUnderSiege"] = attacked["ImperialPressure"] >= 80.0
            self.rotate_imperial_doctrine_and_target()
            self.turns_until_strike = 2
        else:
            self.turns_until_strike -= 1

        # 2. Движение конных гонцов
        resolved_regions_this_turn = set()
        for i in range(len(self.active_envoys) - 1, -1, -1):
            env = self.active_envoys[i]
            env.turns_left -= 1
            if env.turns_left <= 0:
                intercepted = (self.rng.uniform(0.0, 100.0) < env.intercept_risk)
                if intercepted:
                    self.envoys_intercepted += 1
                else:
                    executed = (self.rng.uniform(0.0, 100.0) < env.exec_chance)
                    target_reg = self.naibates.get(env.target_id)
                    if target_reg:
                        target_reg["GunpowderPoods"] += env.powder
                        if executed:
                            self.orders_executed += 1
                            resolved_regions_this_turn.add(env.target_id)
                            if env.order_type == "RaidSupplyLine":
                                target_reg["ImperialPressure"] = max(15.0, target_reg["ImperialPressure"] - 18.0)
                                target_reg["Traits"]["Iman"] = min(100.0, target_reg["Traits"]["Iman"] + 4.0)
                                target_reg["bUnderSiege"] = target_reg["ImperialPressure"] >= 80.0
                                turn_powder_delta += 12
                                turn_silver_delta += 65
                            elif env.order_type == "FortifyBlindages":
                                target_reg["ImperialPressure"] = max(15.0, target_reg["ImperialPressure"] - 24.0)
                                target_reg["Traits"]["Iman"] = min(100.0, target_reg["Traits"]["Iman"] + 5.0)
                                target_reg["bUnderSiege"] = False
                            elif env.order_type == "CollectZakat":
                                turn_silver_delta += 135
                                turn_prov_delta += 160
                                turn_powder_delta += 10
                            elif env.order_type == "MobilizeMurtazeks":
                                target_reg["GarrisonInfantry"] += 220
                                target_reg["MurtazekCavalry"] += 90
                                target_reg["ImperialPressure"] = max(15.0, target_reg["ImperialPressure"] - 12.0)
                                target_reg["bUnderSiege"] = target_reg["ImperialPressure"] >= 80.0
                        else:
                            self.orders_sabotaged += 1
                            self.shamil_authority = max(15.0, self.shamil_authority - 3.0)
                self.active_envoys.pop(i)

        # 3. Естественный дрейф натиска и расход пороха в 10 наибствах
        doc_drift_bonus = doc_spec["drift_bonus"] if use_doc_mods else 0.0
        for key, reg in self.naibates.items():
            if key != struck_region and key not in resolved_regions_this_turn:
                drift = self.rng.uniform(-0.5, 3.2) + (press_mod * 0.45) + doc_drift_bonus
                reg["ImperialPressure"] = clamp(reg["ImperialPressure"] + drift, 15.0, 96.0)
            reg["bUnderSiege"] = reg["ImperialPressure"] >= 80.0

            powder_burn = 6 if reg["bUnderSiege"] else 3
            reg["GunpowderPoods"] = max(4, reg["GunpowderPoods"] - powder_burn)

            if reg["GunpowderPoods"] < 24 and self.central_gunpowder >= 12:
                reg["GunpowderPoods"] += 2
                turn_powder_delta -= 2

            pasture_delta = 25 if reg["bPastureAccessOpen"] else -15
            reg["ProvisionsMeasures"] = max(
                80,
                reg["ProvisionsMeasures"] + round(reg["TerraceYieldPercent"] * 0.4) + pasture_delta - 20,
            )

        self.central_gunpowder = max(0, self.central_gunpowder + turn_powder_delta)
        self.central_provisions = max(0, self.central_provisions + turn_prov_delta)
        self.bait_al_mal_silver = max(0, self.bait_al_mal_silver + turn_silver_delta)

        stress, zulmat = self.calculate_leader_stress()
        if zulmat:
            self.zulmat_turns += 1
        if self.central_gunpowder < 60 or any(r["GunpowderPoods"] < 20 for r in self.naibates.values()):
            self.powder_shortage_turns += 1


def apply_player_strategy(sim: HeadlessStrategicSubsystem, strategy_name: str, turn_idx: int) -> None:
    """Моделирует действия игрока в фазу указов Диван-ханы перед завершением хода."""
    if strategy_name == "1_Passive_Adat_Baseline":
        # Игрок не принимает Низамов и раз в 2 хода шлёт гонца без серебра
        if turn_idx % 2 == 0:
            most_pressured = max(sim.naibates.values(), key=lambda r: r["ImperialPressure"])
            sim.send_envoy_with_order(most_pressured["NaibateID"], "RaidSupplyLine", "SecretMountainPath", 10, 0)

    elif strategy_name == "2_Greedy_Zakat_No_Muhtasibs":
        # Игрок спамит сбор закята без судебной реформы и без субсидий серебром
        targets = sorted(sim.naibates.values(), key=lambda r: r["TerraceYieldPercent"], reverse=True)
        pick = targets[turn_idx % len(targets)]
        sim.send_envoy_with_order(pick["NaibateID"], "CollectZakat", "FastImperialRoad", 5, 0)

    elif strategy_name == "3_Military_Powder_And_Fortify":
        # Приоритет на пороховые мельницы и строительство подземных блиндажей Сафарова
        if not sim.nizams["nizam_powder_mills"]["bEnacted"]:
            sim.enact_shamil_nizam("nizam_powder_mills")
        elif not sim.nizams["nizam_orders_statute"]["bEnacted"]:
            sim.enact_shamil_nizam("nizam_orders_statute")

        besieged = [r for r in sim.naibates.values() if r["bUnderSiege"] or r["ImperialPressure"] >= 70.0]
        convoy_tier = 45 if sim.central_gunpowder >= 260 else (30 if sim.central_gunpowder >= 160 else 15)
        if besieged:
            target = max(besieged, key=lambda r: r["ImperialPressure"])
            sim.send_envoy_with_order(target["NaibateID"], "FortifyBlindages", "SecretMountainPath", convoy_tier, 30)
        else:
            low_pow = min(sim.naibates.values(), key=lambda r: r["GunpowderPoods"])
            sim.send_envoy_with_order(low_pow["NaibateID"], "RaidSupplyLine", "SecretMountainPath", convoy_tier, 30)

    elif strategy_name == "4_Divan_Khana_Master_Strategy":
        # Комбинированная стратегия: Мухтасибы + Пороховые мельницы + Халват при высоком стрессе + 3-уровневые караваны (15/30/45 пуд.)
        for niz_id in ["nizam_powder_mills", "nizam_muhtasibs", "nizam_supreme_court", "nizam_shahid_widows"]:
            if not sim.nizams[niz_id]["bEnacted"] and sim.shamil_authority >= 62.0:
                if sim.enact_shamil_nizam(niz_id):
                    break

        stress, _ = sim.calculate_leader_stress()
        if stress >= 62.0 and sim.completed_khalwat_sessions < 3:
            sim.completed_khalwat_sessions += 1
            sim.shamil_authority = min(100.0, sim.shamil_authority + 7.0)

        # Отправка 1-2 гонцов в ход: снятие осады + переброска пороховых обозов (15/30/45 пуд.)
        besieged = sorted(
            [r for r in sim.naibates.values() if r["bUnderSiege"] or r["ImperialPressure"] >= 68.0],
            key=lambda r: r["ImperialPressure"],
            reverse=True,
        )
        if besieged:
            t1 = besieged[0]
            silver_sub = 40 if t1["Traits"]["Greed"] >= 40 else 30
            convoy_t1 = 30 if (t1["GunpowderPoods"] < 35 and sim.central_gunpowder >= 180) else 15
            sim.send_envoy_with_order(t1["NaibateID"], "FortifyBlindages", "SecretMountainPath", convoy_t1, silver_sub)

        # Второй гонец в наибство с низким порохом (30 или 45 пудов при избытке в Ведено) или для сбора закята
        low_pow = min(sim.naibates.values(), key=lambda r: r["GunpowderPoods"])
        if low_pow["GunpowderPoods"] < 42:
            convoy_t2 = 45 if sim.central_gunpowder >= 260 else (30 if sim.central_gunpowder >= 160 else 15)
            sim.send_envoy_with_order(low_pow["NaibateID"], "RaidSupplyLine", "SecretMountainPath", convoy_t2, 30)
        elif sim.bait_al_mal_silver < 260:
            loyal = max(sim.naibates.values(), key=lambda r: r["Traits"]["Iman"] - r["Traits"]["Pride"] * 0.5)
            sim.send_envoy_with_order(loyal["NaibateID"], "CollectZakat", "SecretMountainPath", 0, 30)


def simulate_cohort(
    naibates_raw: list,
    nizams_raw: list,
    strat: str,
    num_campaigns: int = 1000,
    num_turns: int = 20,
    locked_doctrine: int = None,
) -> dict:
    checkpoint_turns = [1, 5, 10, 15, 20]
    powder_curve = {t: 0.0 for t in checkpoint_turns}
    regional_powder_curve = {t: 0.0 for t in checkpoint_turns}
    stress_curve = {t: 0.0 for t in checkpoint_turns}

    survived_campaigns = 0
    campaigns_with_zulmat = 0
    total_zulmat_turns = 0
    total_envoys = 0
    total_intercepted = 0
    total_executed = 0
    total_sabotaged = 0
    final_besieged_sum = 0
    final_stress_sum = 0.0

    for run_idx in range(num_campaigns):
        seed = 18450706 + run_idx * 97 + (locked_doctrine * 1009 if locked_doctrine is not None else 0)
        sim = HeadlessStrategicSubsystem(naibates_raw, nizams_raw, seed=seed, locked_doctrine=locked_doctrine)

        s1, _ = sim.calculate_leader_stress()
        powder_curve[1] += sim.central_gunpowder
        regional_powder_curve[1] += sum(r["GunpowderPoods"] for r in sim.naibates.values()) / len(sim.naibates)
        stress_curve[1] += s1

        for t_step in range(1, num_turns + 1):
            apply_player_strategy(sim, strat, t_step)
            season = SEASONAL_CYCLE[(t_step - 1) % len(SEASONAL_CYCLE)]
            sim.process_next_strategic_turn(
                season["provisionsMod"], season["powderMod"], season["pressureMod"]
            )

            if t_step in checkpoint_turns and t_step > 1:
                st_now, _ = sim.calculate_leader_stress()
                powder_curve[t_step] += sim.central_gunpowder
                regional_powder_curve[t_step] += sum(
                    r["GunpowderPoods"] for r in sim.naibates.values()
                ) / len(sim.naibates)
                stress_curve[t_step] += st_now

        final_stress, _ = sim.calculate_leader_stress()
        final_stress_sum += final_stress
        besieged_cnt = sum(1 for r in sim.naibates.values() if r["bUnderSiege"])
        final_besieged_sum += besieged_cnt

        if besieged_cnt <= 4 and final_stress < 85.0:
            survived_campaigns += 1

        if sim.zulmat_turns > 0:
            campaigns_with_zulmat += 1
        total_zulmat_turns += sim.zulmat_turns
        total_envoys += sim.envoys_sent
        total_intercepted += sim.envoys_intercepted
        total_executed += sim.orders_executed
        total_sabotaged += sim.orders_sabotaged

    for t in checkpoint_turns:
        powder_curve[t] = round(powder_curve[t] / num_campaigns, 1)
        regional_powder_curve[t] = round(regional_powder_curve[t] / num_campaigns, 1)
        stress_curve[t] = round(stress_curve[t] / num_campaigns, 1)

    survival_rate = round((survived_campaigns / num_campaigns) * 100.0, 1)
    zulmat_prob = round((campaigns_with_zulmat / num_campaigns) * 100.0, 1)
    intercept_rate = round((total_intercepted / max(1, total_envoys)) * 100.0, 1)
    delivered = max(1, total_executed + total_sabotaged)
    obedience_rate = round((total_executed / delivered) * 100.0, 1)
    avg_besieged = round(final_besieged_sum / num_campaigns, 2)
    avg_final_stress = round(final_stress_sum / num_campaigns, 1)

    return {
        "campaignsSimulated": num_campaigns,
        "turnsPerCampaign": num_turns,
        "survivalRatePercent": survival_rate,
        "zulmatCrisisProbabilityPercent": zulmat_prob,
        "avgZulmatTurnsPerCampaign": round(total_zulmat_turns / num_campaigns, 2),
        "envoyInterceptionRatePercent": intercept_rate,
        "naibObedienceRatePercent": obedience_rate,
        "avgFinalBesiegedNaibatesOf10": avg_besieged,
        "avgFinalStressPercent": avg_final_stress,
        "centralArsenalPowderCurvePoods": powder_curve,
        "avgRegionalPowderCurvePoods": regional_powder_curve,
        "leaderStressCurvePercent": stress_curve,
        "totalEnvoysSent": total_envoys,
    }


def run_monte_carlo_suite(num_campaigns: int = 1000, num_turns: int = 20) -> dict:
    with open(os.path.join(DATATABLES_DIR, "DT_Naibates_1845.json"), "r", encoding="utf-8") as f:
        naibates_raw = json.load(f)
    with open(os.path.join(DATATABLES_DIR, "DT_ShamilNizams.json"), "r", encoding="utf-8") as f:
        nizams_raw = json.load(f)

    strategies = [
        "1_Passive_Adat_Baseline",
        "2_Greedy_Zakat_No_Muhtasibs",
        "3_Military_Powder_And_Fortify",
        "4_Divan_Khana_Master_Strategy",
    ]

    full_report = {}
    matrix_16k_report = {
        "totalCampaignsSimulated": len(strategies) * len(DOCTRINE_SPECS) * num_campaigns,
        "campaignsPerCell": num_campaigns,
        "turnsPerCampaign": num_turns,
        "doctrines": DOCTRINE_SPECS,
        "matrix": {},
    }

    print("=" * 116)
    print(f"HEADLESS C++ VALIDATOR: 4,000 БАЗОВЫХ + 16,000 МАТРИЧНЫХ ПАРТИЙ (4 СТРАТЕГИИ × 4 ДОКТРИНЫ × {num_turns} ХОДОВ)")
    print("=" * 116)

    for strat in strategies:
        base_res = simulate_cohort(naibates_raw, nizams_raw, strat, num_campaigns, num_turns, locked_doctrine=None)
        total_envoys = base_res.pop("totalEnvoysSent")

        doctrine_breakdown = {}
        for doc_idx, doc_spec in DOCTRINE_SPECS.items():
            doc_res = simulate_cohort(
                naibates_raw, nizams_raw, strat, num_campaigns, num_turns, locked_doctrine=doc_idx
            )
            doc_res.pop("totalEnvoysSent")
            doctrine_breakdown[doc_spec["id"]] = {
                "doctrineIndex": doc_idx,
                "nameRu": doc_spec["nameRu"],
                "nameEn": doc_spec["nameEn"],
                **doc_res,
            }

        base_res["doctrineMatrix"] = doctrine_breakdown
        full_report[strat] = base_res
        matrix_16k_report["matrix"][strat] = doctrine_breakdown

        powder_curve = base_res["centralArsenalPowderCurvePoods"]
        regional_powder_curve = base_res["avgRegionalPowderCurvePoods"]
        stress_curve = base_res["leaderStressCurvePercent"]

        print(f"\n▶ СТРАТЕГИЯ: {strat}")
        print(
            f"  Выживаемость Имамата: {base_res['survivalRatePercent']:5.1f}% | Вероятность «Зульмата» (Stress>=80%): {base_res['zulmatCrisisProbabilityPercent']:5.1f}% "
            f"| Ср. осад к 20 ходу: {base_res['avgFinalBesiegedNaibatesOf10']}/10"
        )
        print(
            f"  Повиновение наибов P(exec): {base_res['naibObedienceRatePercent']:5.1f}% | Перехват гонцов: {base_res['envoyInterceptionRatePercent']:4.1f}% "
            f"(Всего гонцов за 1000 игр: {total_envoys})"
        )
        print(
            f"  Кривая пороха в Арсенале Ведено (пуд.): Ход 1={powder_curve[1]} -> Ход 5={powder_curve[5]} "
            f"-> Ход 10={powder_curve[10]} -> Ход 15={powder_curve[15]} -> Ход 20={powder_curve[20]}"
        )
        print(
            f"  Средний запас пороха в округах (пуд.):  Ход 1={regional_powder_curve[1]} -> Ход 5={regional_powder_curve[5]} "
            f"-> Ход 10={regional_powder_curve[10]} -> Ход 15={regional_powder_curve[15]} -> Ход 20={regional_powder_curve[20]}"
        )
        print(
            f"  Кривая Стресса Шамиля (%):             Ход 1={stress_curve[1]}% -> Ход 5={stress_curve[5]}% "
            f"-> Ход 10={stress_curve[10]}% -> Ход 15={stress_curve[15]}% -> Ход 20={stress_curve[20]}%"
        )
        print("  Матрица выживаемости против 4 ИИ-доктрин командующих Кавказским корпусом (4 × 1,000 партий):")
        for doc_id, dcell in doctrine_breakdown.items():
            print(
                f"    • [{doc_id:27s}] Выживание={dcell['survivalRatePercent']:5.1f}% | "
                f"Зульмат={dcell['zulmatCrisisProbabilityPercent']:5.1f}% | "
                f"Перехват={dcell['envoyInterceptionRatePercent']:4.1f}% | "
                f"Осад={dcell['avgFinalBesiegedNaibatesOf10']:.2f}/10 | "
                f"Стресс T20={dcell['leaderStressCurvePercent'][20]:4.1f}%"
            )

    out_path = os.path.join(DATATABLES_DIR, "MonteCarlo_1000x20_Report.json")
    with open(out_path, "w", encoding="utf-8") as out_f:
        json.dump(full_report, out_f, ensure_ascii=False, indent=2)

    matrix_out_path = os.path.join(DATATABLES_DIR, "MonteCarlo_16000_DoctrineMatrix_Report.json")
    with open(matrix_out_path, "w", encoding="utf-8") as mat_f:
        json.dump(matrix_16k_report, mat_f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 116)
    print(f"[OK] Полный JSON-отчёт Монте-Карло сохранён в: {out_path}")
    print(f"[OK] Матрица 16,000 партий (4x4 Doctrine Matrix) сохранена в: {matrix_out_path}")
    return full_report


if __name__ == "__main__":
    run_monte_carlo_suite(1000, 20)
