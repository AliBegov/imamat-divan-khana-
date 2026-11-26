# ПРОИЗВОДСТВЕННЫЙ ПАКЕТ ПРЕВИЗА 1-ГО СЕЗОНА (`Previz_Production_S1`)
## Сериал-докудрама «Шамиль: свод неба и кремень» (`1797–1839`, Серии 1–8)

Этот каталог полностью автономен и содержит всё необходимое для рендера ключевых кадров (`16:9`), анимации видеошотов, озвучки и звукового дизайна 1-го сезона:

### Состав пакета
1. **[shamil_s1_continuity_registry.json](./shamil_s1_continuity_registry.json)** — машиночитаемая машина состояний:
   * `36` антропометрических паспортов персонажей (`immutable_traits_en` + `age_profiles` + `permanent_scars`);
   * `47` кодов послойного гардероба (`WARD_*`);
   * `32` паспорта локаций и подзон (`LOC_S1_*`);
   * правила причинной неизменности (`RULE_SHAMIL_SCAR_E03`, `RULE_SURKHAI_TOWER_RUBBLE_E07`, `RULE_MILYUTIN_SLING_E07`, `RULE_BRIDGE_CUT_E08`).
2. **[s1_previz_shots.json](./s1_previz_shots.json)** — мастер-манифест `72` ключевых шотов (`S1E01_SH01` … `S1E08_SH09`) с привязкой к документальным врезкам, `image_prompt_en`, `video_prompt_en` и `sfx_prompt_en`.
3. **[keyframes/](./keyframes)** — сгенерированные ключевые кадры `16:9` (с фиксацией портретного сходства, возраста и состояния костюма/среды).
4. **[audit_shamil_continuity.py](./audit_shamil_continuity.py)** — автоматический аудит преемственности и редакционных правил.
5. **[build_s1_previz_viewer.py](./build_s1_previz_viewer.py)** — сборщик автономного интерактивного просмотрщика [`../Shamil_S1_Previz_Viewer.html`](../Shamil_S1_Previz_Viewer.html).

### Быстрые команды проверки и пересборки
```bash
cd "/Users/alibegov/Downloads/Кавказская война/06_Сериал_Шамиль/Previz_Production_S1"
python3 audit_shamil_continuity.py
python3 build_s1_previz_viewer.py
```
