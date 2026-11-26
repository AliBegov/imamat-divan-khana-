# Телеметрия Steam Playtest и Чек-лист предрелизного QA-контроля

> **Назначение:** Сбор объективных метрик баланса, UX-узких мест и стабильности во время закрытого и открытого тестирования (Steam Playtest / Steam Next Fest Demo).

---

## 1. JSON-СХЕМА ТЕЛЕМЕТРИИ СЕССИИ ИГРОКА (`ImamatPlaytestTelemetrySchema.json`)

Каждый билд для Steam Playtest и веб-прототип формируют обезличенный пакет телеметрии в конце партии (при победе, поражении или выходе на 20-м ходу). Схема полностью совместима с `UImamatSaveGame` и валидатором Монте-Карло `headless_balance_sim.py`:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "ImamatPlaytestSessionTelemetry",
  "type": "object",
  "required": [
    "sessionId",
    "buildVersion",
    "scenarioId",
    "turnsSurvived",
    "campaignOutcome",
    "onboardingStepsCompleted",
    "economyTimeline",
    "ordersSummary",
    "tacticalBattlesSummary"
  ],
  "properties": {
    "sessionId": { "type": "string", "format": "uuid" },
    "buildVersion": { "type": "string", "example": "0.4.0-M4-VerticalSlice" },
    "platform": { "type": "string", "enum": ["Win64_DX12", "Mac_MetalSM6", "Web_Vite_React"] },
    "scenarioId": { "type": "string", "enum": ["camp_1839", "camp_1843", "camp_1845", "camp_1859"] },
    "turnsSurvived": { "type": "integer", "minimum": 1, "maximum": 40 },
    "campaignOutcome": {
      "type": "string",
      "enum": ["Victory_ImamatPreserved", "Defeat_CapitalFallen", "Defeat_AuthorityCollapse", "Quit_MidCampaign"]
    },
    "onboardingStepsCompleted": {
      "type": "object",
      "properties": {
        "step1_NizamEnacted": { "type": "boolean" },
        "step2_PowderConvoySent": { "type": "boolean" },
        "step3_TacticalDioramaResolved": { "type": "boolean" },
        "glossaryOpenedCount": { "type": "integer" }
      }
    },
    "economyTimeline": {
      "type": "object",
      "properties": {
        "minVedenoPowderPoods": { "type": "integer" },
        "finalVedenoPowderPoods": { "type": "integer" },
        "finalAvgRegionalPowderPoods": { "type": "number" },
        "finalSilverRubles": { "type": "integer" },
        "zulmatTriggeredCount": { "type": "integer" },
        "khalwatPerformedCount": { "type": "integer" }
      }
    },
    "ordersSummary": {
      "type": "object",
      "properties": {
        "totalEnvoysDispatched": { "type": "integer" },
        "convoysByTier": {
          "type": "object",
          "properties": {
            "tier0_NoPowder": { "type": "integer" },
            "tier15_LightPack": { "type": "integer" },
            "tier30_Reinforced": { "type": "integer" },
            "tier45_HeavyTrain": { "type": "integer" }
          }
        },
        "envoysInterceptedCount": { "type": "integer" },
        "naibOrdersObeyedCount": { "type": "integer" },
        "naibOrdersRefusedCount": { "type": "integer" }
      }
    },
    "tacticalBattlesSummary": {
      "type": "object",
      "properties": {
        "dioramasEntered": { "type": "integer" },
        "camoufletsDetonated": { "type": "integer" },
        "gazyrDepletionMeleeTriggered": { "type": "integer" },
        "totalPowderCapturedInTactics": { "type": "integer" }
      }
    }
  }
}
```

---

## 2. ЦЕЛЕВЫЕ KPI ПЛЕЙТЕСТА (PLAYTEST BALANCE & UX BENCHMARKS)

| Метрика плейтеста | Целевой коридор (Target KPI) | Сигнал тревоги (Red Flag) | План корректировки (Action Item) |
| :--- | :--- | :--- | :--- |
| **Завершение 3 шагов Онбординга (`onboardingStepsCompleted`)** | $\ge 82\%$ новых игроков проходят все 3 шага за первые 10 минут | $< 60\%$ игроков находят кнопку отправки каравана или Кодекс Низамов | Подсветить пульсирующей рамкой вкладку «Кодекс Низамов» на 1-м ходу при пустом списке указов. |
| **Выживаемость на 10-м ходу (Кампания 1845 г.)** | $55\% \text{--} 70\%$ в первой партии; $\ge 85\%$ со второй партии | $< 35\%$ (игроки массово гибнут от порохового голода на 7–8 ходу) | Снизить расход пороха в осаде с `16` до `13` пудов/ход на уровне сложности «Алим (Нормальный)». |
| **Доля использования караванов 30 и 45 пудов** | $40\% \text{--} 65\%$ от всех военных приказов в осаждённые округа | $< 15\%$ (игроки забывают менять дефолтный переключатель 15 пудов) | Автоматически предлагать пресет `30 пудов`, если целевое наибство находится в статусе `bIsUnderSiege == true`. |
| **Частота срабатывания «Зульмата» за 20 ходов** | $0.5 \text{--} 1.5$ раза за партию у среднего игрока | $> 3$ раз за партию (вызывает фрустрацию от блокировки указов) | Увеличить длительность иммунитета после духовного совета Тариката (*Халват*) с 2 до 3 ходов. |
| **Переход в рукопашную при `0/18` газырей** | $\ge 50\%$ тактических боёв завершаются кинжальной вылазкой | $< 15\%$ (бои заканчиваются раньше, чем тратится половина патронташа) | Увеличить плотность эшелонов на сплайне Дарго, требующую 4–5 залпов штуцеров перед сближением. |

---

## 3. ЧЕК-ЛИСТ ПРЕДРЕЛИЗНОГО QA-КОНТРОЛЯ (RELEASE CANDIDATE QA CHECKLIST)

### А. Математическое ядро и Стратегический цикл (`UImamatStrategicSubsystem`)
- [x] **10 исторических наибств в графе:** Все 10 узлов (`khunzakh`, `vedeno`, `gunib`, `chokh`, `gergebil`, `salty`, `benoy`, `irib`, `andi`, `karata`) корректно загружаются из `DT_Naibates_1845.json` и отображаются на карте.
- [x] **Инвариант `ResolvedRegionsThisTurn`:** Повторный захват одного и того же наибства в кольцо осады на том же ходу после прорыва исключён (`Same-Turn Siege Re-Latch Bug` устранён и проверен на 4 000 прогонах).
- [x] **Формула `FOrderProbabilityBreakdown`:** Плашка декомпозиции в UI с точностью до `0.1%` совпадает с реальным броском `EvaluateOrderProbabilityBreakdown`.
- [x] **3-уровневые пороховые караваны:** При выборе `15`, `30` и `45` пудов корректно списывается порох из казны Ведено, начисляется бонус снабжения (`до +22%`) и применяется штраф к заметности каравана (`0%` / `+8%` / `+16%`).

### Б. Тактическая диорама и 3D-разрез (`AGazyrTacticalController` & `3d_tactical`)
- [x] **Двусторонний мост `Strategia <-> Taktika`:** Кнопка входа в тактический бой передаёт текущие запасы пороха наибства, а кнопка завершения боя возвращает `FTacticalBattleResult` (трофейный порох, серебро, потери и снижение натиска) обратно на стратегическую карту.
- [x] **Инвариант 18 газырей (`UGazyrAmmunitionComponent`):** Каждый залп штуцеров списывает 3 газыря из 18; при `0/18` кнопка стрельбы блокируется и активируется бонус кинжального боя; пополнение до `18/18` списывает 4 пуда пороха.
- [x] **16-bit SRTM-карты высот для UE5 Landscape:** Все 20 текстур (`2017x2017` `.png` и `.r16` + весовые маски `_Weight_Cliff`, `_Weight_Terraces`, `_Weight_Forest`) сгенерированы и верифицированы по манифесту `UE5_Landscape_Import_Manifest.json`.

### В. Сохранения, Онбординг и Сборка (`UImamatSaveGame` & Build)
- [x] **Сериализация `UImamatSaveGame`:** Кнопки `💾 Сейв`, `📂 Загрузка` и `⬇️ UE5 JSON` сохраняют и восстанавливают полное состояние партии (ход, ресурсы, 10 наибств, гонцов, Низамы и хронику).
- [x] **Онбординг первых 3 ходов и Толковый словарь (`DT_ImamatGlossary`):** Панель «Наставление секретаря аль-Карахи» автоматически отмечает выполнение 3 стартовых шагов, а модальное окно словаря ищет по всем 12 терминам и формулам.
- [x] **Чистая продакшн-сборка:** `npm run build` в `03_Веб_прототип_Диван_Хана` завершается за `1.17s` с 0 ошибок и 0 предупреждений.
