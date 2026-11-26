#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
IMAMAT: DIVAN-KHANA — Master Unreal Engine 5.5 String Table & Localization Exporter (Milestone M19)
Combines base UI/Naibates/Formula strings from DT_ImamatLocalization_RU_EN.json (49 rows)
with the 11 Historical Archive Museum Exhibits, 6 Steam Trailer Storyboard Shots,
3 Historical Ironman Challenges, and 5 Diplomatic Dispatches into:
  - 04_UE5_ImamatWargame/Content/DataTables/ST_ImamatMaster_RU_EN.json
  - 04_UE5_ImamatWargame/Content/DataTables/ST_ImamatMaster_RU_EN.csv
"""

import csv
import json
import pathlib

ROOT_DIR = pathlib.Path(__file__).resolve().parents[2]
DT_DIR = ROOT_DIR / "04_UE5_ImamatWargame" / "Content" / "DataTables"

EXTENDED_M19_ROWS = [
    # 6 Steam 60s Gameplay Trailer Storyboard Shots (M16–M18)
    {
        "RowName": "TRAILER_SHOT_01_DIVAN_TABLE",
        "Category": "Trailer_60s",
        "RuText": "Дубовый стол государственного совета Диван-ханы в Дарго-Ведено: расчёт вероятности повиновения наиба P_exec и отправка конного гонца.",
        "EnText": "Oak command table of the Divan-Khana state council in Dargo-Vedeno: computing Naib obedience P_exec and dispatching a mounted courier."
    },
    {
        "RowName": "TRAILER_SHOT_02_SIGNET_STAMP",
        "Category": "Trailer_60s",
        "RuText": "Восьмиугольный серебряный перстень-печать Шамиля опускается на сургуч приказа; конный муртазек скачет сквозь ущелье Андийского Койсу.",
        "EnText": "Shamil's octagonal silver signet ring presses into sealing wax; a Murtazek rider gallops through the Andi Koysu gorge."
    },
    {
        "RowName": "TRAILER_SHOT_03_MILYUTIN_CUTAWAY",
        "Category": "Trailer_60s",
        "RuText": "Геодезический 3D-разрез скалы Д. А. Милютина и круги на воде в медном тазу инженера Хаджи-Юсуфа Сафарова: подрыв встречного камуфлета.",
        "EnText": "D. A. Milyutin's 3D cross-section cutaway and concentric ripples in engineer Hajji-Yusuf Safarov's copper water basin: counter-mine camouflet detonation."
    },
    {
        "RowName": "TRAILER_SHOT_04_ICHKERIA_18_GAZYRS",
        "Category": "Trailer_60s",
        "RuText": "Лесная засада в буковых засеках Ичкерии: отстрел 18 нагрудных газырей до 0/18 и стремительная контратака в шашки под буркой.",
        "EnText": "Forest ambush in the Ichkeria beech abatis: firing all 18 chest gazyrs down to 0/18 and launching a downhill shashka charge."
    },
    {
        "RowName": "TRAILER_SHOT_05_NIZAM_GERGEBIL",
        "Category": "Trailer_60s",
        "RuText": "Принятие статей Кодекса Низамов (проба пороха на бумаге) и артиллерийская дуэль на бастионах Гергебиля и Салты.",
        "EnText": "Enacting the Nizam Code (gunpowder flash-paper test) and artillery duel atop the bastions of Gergebil and Salty."
    },
    {
        "RowName": "TRAILER_SHOT_06_GUNIB_PACKSHOT",
        "Category": "Trailer_60s",
        "RuText": "Вертикальная панорама плато Верхнего Гуниба над облаками и финальный титул ИМАМАТ: ДИВАН-ХАНА — Добавьте в Желаемое в Steam.",
        "EnText": "Vertical crane reveal of the Upper Gunib plateau above the clouds and packshot IMAMAT: DIVAN-KHANA — Wishlist on Steam."
    },
    # 11 Historical Archive Museum Exhibits (M17)
    {
        "RowName": "MUSEUM_EX_01_SHAMIL_DENIER",
        "Category": "Museum_Portraits",
        "RuText": "Имам Шамиль (Альбуминовый фотопортрет А. И. Деньера, Санкт-Петербург, октябрь 1859 г., Эрмитаж / ГАРФ).",
        "EnText": "Imam Shamil (Albumen print by A. I. Denier, St. Petersburg, October 1859, Hermitage / GARF)."
    },
    {
        "RowName": "MUSEUM_EX_02_HADJI_MURAT_GAGARIN",
        "Category": "Museum_Portraits",
        "RuText": "Наиб Хаджи-Мурат Хунзахский (Акварель с натуры кн. Г. Г. Гагарина, Тифлис, 1851 г., Русский музей).",
        "EnText": "Naib Hadji Murad of Khunzakh (Watercolor from life by Prince G. G. Gagarin, Tiflis, 1851, Russian Museum)."
    },
    {
        "RowName": "MUSEUM_EX_03_SAFAROV_ENGINEER",
        "Category": "Museum_Portraits",
        "RuText": "Мудир и главный военный инженер Хаджи-Юсуф Сафаров — создатель минных галерей, 3-накатных блиндажей и сонара медного таза.",
        "EnText": "Mudir and Chief Military Engineer Hajji-Yusuf Safarov — architect of counter-mines, 3-layer log blindages, and the copper basin sonar."
    },
    {
        "RowName": "MUSEUM_EX_04_GHAZI_MUHAMMAD_MARSHAL",
        "Category": "Museum_Portraits",
        "RuText": "Старший сын имама Гази-Мухаммад — наиб Карата (1850–1859) и впоследствии османский маршал (мушир) в Стамбуле и Медине.",
        "EnText": "Eldest active military son Ghazi-Muhammad — Naib of Karata (1850–1859) and later Ottoman Field Marshal (Mushir) in Istanbul and Medina."
    },
    {
        "RowName": "MUSEUM_EX_05_BAZALAI_GURDA_ARMS",
        "Category": "Museum_Weapons",
        "RuText": "Кинжал кама старого Чилла-Базалая (Казанище) и шашка волчок «Гурда» с клеймом генуэзских челюстей.",
        "EnText": "Kama dagger by Old Chilla-Bazalai (Kazanishche) and 'Gurda' shashka saber bearing the Genoese jaws hallmark."
    },
    {
        "RowName": "MUSEUM_EX_06_18_GAZYRS_KRIMKAKH",
        "Category": "Museum_Weapons",
        "RuText": "18 нагрудных газырей черкески (отмеренные заряды пороха Ведено) и нарезная кремнёвая винтовка крым-ках (Кубачи / Харбук).",
        "EnText": "18 chest gazyr tubes (pre-measured Vedeno gunpowder charges) and a Kubachi/Kharbuk rifled flintlock musket (Krim-Kakh)."
    },
    {
        "RowName": "MUSEUM_EX_07_VEDENO_BRONZE_UNICORN",
        "Category": "Museum_Weapons",
        "RuText": "Горный бронзовый единорог литейного двора Дарго-Ведено и чугунные гранаты с деревянными дистанционными трубками.",
        "EnText": "Mountain bronze licorne cannon cast at the Dargo-Vedeno foundry with fused cast-iron shells."
    },
    {
        "RowName": "MUSEUM_EX_08_SILVER_ORDERS_SEAL",
        "Category": "Museum_Orders",
        "RuText": "Серебряные чернёные ордена Шамиля («Кто думает о последствиях — тот не храбрец») и восьмиугольная печать Диван-ханы.",
        "EnText": "Shamil's nielloed silver orders ('He who ponders the consequences lacks courage') and the octagonal signet seal of the Divan-Khana."
    },
    {
        "RowName": "MUSEUM_EX_09_MILYUTIN_ATLAS_1839",
        "Category": "Museum_Maps",
        "RuText": "Геодезический план и вертикальный разрез скалы Старого и Нового Ахульго (капитан Генштаба Д. А. Милютин, 1839 г., РГВИА ф. 846).",
        "EnText": "Geodetic survey plan and vertical cutaway of Old and New Akhulgo (General Staff Capt. D. A. Milyutin, 1839, RGVIA F. 846)."
    },
    {
        "RowName": "MUSEUM_EX_10_SAFAROV_ARABIC_MAP_1856",
        "Category": "Museum_Maps",
        "RuText": "Арабоязычная военно-административная карта наибств Имамата Хаджи-Юсуфа Сафарова и хроника Мухаммед-Тахира аль-Карахи.",
        "EnText": "Hajji-Yusuf Safarov's 1856 Arabic administrative map of the Imamate Naibates and the chronicle of Muhammad-Tahir al-Qarakhi."
    },
    {
        "RowName": "MUSEUM_EX_11_THREE_ARCHIVES_SYNTHESIS",
        "Category": "Museum_Sources",
        "RuText": "Синтез трёх архивных корпусов (31 глава, 2.23 МБ): труды проф. Х. М. Доного, АКАК/РГВИА и Османский архив BOA в Стамбуле.",
        "EnText": "Synthesis of three archival corpora (31 chapters, 2.23 MB): works of Prof. Kh. M. Donogo, AKAK/RGVIA, and the Ottoman BOA archive in Istanbul."
    },
    # 3 Historical Ironman Challenges (M15)
    {
        "RowName": "IRONMAN_01_AKHULGO_1839",
        "Category": "Ironman_Challenge",
        "RuText": "Испытание Ironman 1839: 80 дней блокады Ахульго (доктрина ген. П. Х. Граббе «Осадный таран и мины», порох Ведено 115 пуд.).",
        "EnText": "Ironman Challenge 1839: 80 Days of Akhulgo (Gen. P. Kh. Grabbe 'Siege Ram & Mines' doctrine, Vedeno gunpowder 115 poods)."
    },
    {
        "RowName": "IRONMAN_02_DARGO_1845",
        "Category": "Ironman_Challenge",
        "RuText": "Испытание Ironman 1845: Сухарная экспедиция в Ичкерийском лесу (доктрина кн. М. С. Воронцова «Глубокий клин на Дарго»).",
        "EnText": "Ironman Challenge 1845: The Biscuit Expedition in Ichkeria (Prince M. S. Vorontsov 'Deep Column to Dargo' doctrine)."
    },
    {
        "RowName": "IRONMAN_03_GUNIB_1857",
        "Category": "Ironman_Challenge",
        "RuText": "Испытание Ironman 1857–1859: Просеки и кольцо кн. А. И. Барятинского (критический дефицит пороха 85 пуд. и тотальная блокада).",
        "EnText": "Ironman Challenge 1857–1859: Prince A. I. Baryatinsky's Forest Clearings & Ring (critical powder shortage 85 poods and total blockade)."
    },
    # 5 Diplomatic Dispatches & Treaties (M19)
    {
        "RowName": "DISPATCH_01_SULTAN_ABDULMEJID_1853",
        "Category": "Diplomacy_Chancellery",
        "RuText": "Фирман султану Абдул-Меджиду I и сераскиру Риза-паше (Стамбул / Трапезунд, 1853, BOA İ.DH. 284/17852): прорыв фелуки с порохом.",
        "EnText": "Firman to Sultan Abdülmejid I & Serasker Riza Pasha (Istanbul / Trebizond, 1853, BOA İ.DH. 284/17852): felucca gunpowder blockade run."
    },
    {
        "RowName": "DISPATCH_02_MICHIK_JAMALUDDIN_1855",
        "Category": "Diplomacy_Chancellery",
        "RuText": "Трактат на реке Мичик (10 марта 1855 г., РГВИА ф. 846): обмен поручика Джемалуддина и 40 000 руб. серебром на княгинь Чавчавадзе и Орбелиани.",
        "EnText": "Michik River Treaty (March 10, 1855, RGVIA F. 846): exchange of Lt. Jamaluddin and 40,000 silver rubles for Princesses Chavchavadze and Orbeliani."
    },
    {
        "RowName": "DISPATCH_03_ANATOLIAN_MUSHIR_1854",
        "Category": "Diplomacy_Chancellery",
        "RuText": "Депеша муширу Анатолийской армии Абди-паше у Карса (июль 1854 г., BOA A.MKT.UM): диверсия в Кахетии и караван селитры.",
        "EnText": "Dispatch to Anatolian Mushir Abdi Pasha at Kars (July 1854, BOA A.MKT.UM): Kakheti diversion and nitre caravan."
    },
    {
        "RowName": "DISPATCH_04_KABARDA_MANIFESTO_1846",
        "Category": "Diplomacy_Chancellery",
        "RuText": "Воззвание с восьмиугольной печатью к князьям и узденям Кабарды (апрель 1846 г., РГВИА ф. ВУА): прорыв кордонов на Тереке и Сунже.",
        "EnText": "Octagonal Signet Manifesto to the Princes & Uzdens of Kabarda (April 1846, RGVIA F. VUA): breaking the Terek and Sunzha cordons."
    },
    {
        "RowName": "DISPATCH_05_VORONTSOV_PARLEY_1845",
        "Category": "Diplomacy_Chancellery",
        "RuText": "Парламентёрская нота Диван-ханы князю М. С. Воронцову (июль 1845 г., АКАК т. X): трёхдневное перемирие на перевалах Анди.",
        "EnText": "Divan-Khana Truce Note to Prince M. S. Vorontsov (July 1845, AKAK Vol. X): three-day parley on the Andi passes."
    }
]


def main():
    base_loc_path = DT_DIR / "DT_ImamatLocalization_RU_EN.json"
    base_rows = json.loads(base_loc_path.read_text(encoding="utf-8")) if base_loc_path.exists() else []

    existing_keys = {r.get("Name") or r.get("Key") for r in base_rows}
    master_rows = list(base_rows)
    for row in EXTENDED_M19_ROWS:
        r_key = row["RowName"]
        if r_key not in existing_keys:
            master_rows.append({
                "Name": r_key,
                "Key": r_key,
                "Namespace": f"Imamat_{row['Category']}",
                "SourceStringRU": row["RuText"],
                "TranslationEN": row["EnText"],
                "HistoricalContextNote": f"Milestone M16–M19 ({row['Category']})",
            })

    out_json = DT_DIR / "ST_ImamatMaster_RU_EN.json"
    out_csv = DT_DIR / "ST_ImamatMaster_RU_EN.csv"

    out_json.write_text(json.dumps(master_rows, ensure_ascii=False, indent=2), encoding="utf-8")

    with out_csv.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["---", "Key", "Namespace", "SourceStringRU", "TranslationEN", "HistoricalContextNote"],
        )
        writer.writeheader()
        for r in master_rows:
            writer.writerow({
                "---": r.get("Name", r.get("Key", "")),
                "Key": r.get("Key", r.get("Name", "")),
                "Namespace": r.get("Namespace", "Imamat_General"),
                "SourceStringRU": r.get("SourceStringRU", ""),
                "TranslationEN": r.get("TranslationEN", ""),
                "HistoricalContextNote": r.get("HistoricalContextNote", ""),
            })

    print("=" * 88)
    print(" IMAMAT: DIVAN-KHANA — UE5.5 MASTER STRING TABLE EXPORTER (MILESTONE M19)")
    print("=" * 88)
    print(f"  [OK] Base DT_ImamatLocalization_RU_EN rows : {len(base_rows)}")
    print(f"  [OK] Extended M16–M19 rows added           : {len(EXTENDED_M19_ROWS)}")
    print(f"  [OK] Total Master String Table rows        : {len(master_rows)}")
    print(f"  [OK] JSON -> {out_json} ({out_json.stat().st_size:,} bytes)")
    print(f"  [OK] CSV  -> {out_csv} ({out_csv.stat().st_size:,} bytes)")
    print("=" * 88)


if __name__ == "__main__":
    main()
