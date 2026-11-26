# ИМАМАТ: ДИВАН-ХАНА — Полный пакет классов C++20, HLSL и Blueprints для Unreal Engine 5.5 (Этап 2: Vertical Slice)

Настоящий инженерный документ представляет собой полную спецификацию и исходный код модуля `ImamatWargame` для **Unreal Engine 5.5+**. Архитектура объединяет проверенное в прототипе Этапа 1 математическое ядро (психология наибов, логистика пороха и гонцов, Кодекс из 12 Низамов Шамиля, нагрузка на правителя $\text{Stress}_{\text{total}}$) с трёхмерным рельефом Кавказа (`World Partition` + `Nanite Landscape`), физикой разрушений каменных аулов (`Chaos Destruction`) и безсеточной (*Gridless*) тактикой осад и лесных засад.

## 1. Геодезический пайплайн: Импорт спутниковых высот NASA SRTM (Квадрат «Гуниб — Ахульго — Салты — Дарго»)

### 1.1. Геодезическая привязка полигона (WGS84 / UTM Zone 38N)

Театр военных действий Нагорного Дагестана и горной Чечни (Ичкерии) укладывается в единый прямоугольный сектор `World Partition` размером $115\text{ км} \times 105\text{ км}$, охватывающий растровые тайлы миссии **NASA SRTM 1 Arc-Second Global ($30\text{ м}$)** `N42E045`, `N42E046`, `N42E047`, `N43E045`, `N43E046`:

* **Северо-Западный угол (Ведено — Шали — Большая Чечня):** $\phi_{\max} = 43.1500^\circ\text{ N}$, $\lambda_{\min} = 45.7500^\circ\text{ E}$
* **Юго-Восточный угол (Гуниб — Салты — Чох — Согратль):** $\phi_{\min} = 42.2000^\circ\text{ N}$, $\lambda_{\max} = 47.1500^\circ\text{ E}$

| Исторический узел (Цитадель / Рубеж) | Широта ($\phi$, WGS84) | Долгота ($\lambda$, WGS84) | Абсолютная высота ($h_{\text{abs}}$) | Уклон скального массива ($\theta$) |
| ----- | ----- | ----- | ----- | ----- |
| **Скала Ахульго и Сурхаева башня (1839)** | $42.6786^\circ\text{ N}$ | $46.8550^\circ\text{ E}$ | $620\text{ м}$ (над р. Койсу — $190\text{ м}$) | $72^\circ\text{--}84^\circ$ |
| **Старое Дарго и хребет Речель (1845)** | $42.9522^\circ\text{ N}$ | $46.2361^\circ\text{ E}$ | $1180\text{ м}$ (перевал — $2140\text{ м}$) | $38^\circ\text{--}62^\circ$ |
| **Столица Новое Дарго — Ведено (1845–1859)** | $42.9694^\circ\text{ N}$ | $46.0961^\circ\text{ E}$ | $760\text{ м}$ | $24^\circ\text{--}45^\circ$ |
| **Аул Гергебиль и слияние Койсу (1843–1848)** | $42.5083^\circ\text{ N}$ | $47.0625^\circ\text{ E}$ | $790\text{ м}$ | $55^\circ\text{--}76^\circ$ |
| **Аул Салты и Салтинская теснина (1847)** | $42.3931^\circ\text{ N}$ | $47.0658^\circ\text{ E}$ | $1290\text{ м}$ | $64^\circ\text{--}81^\circ$ |
| **Хунзахское плато и каньон Цолотль** | $42.5436^\circ\text{ N}$ | $46.7058^\circ\text{ E}$ | $1760\text{ м}$ | $70^\circ\text{--}88^\circ$ (обрыв) |
| **Аул Телетль и хребет Турчидаг** | $42.3519^\circ\text{ N}$ | $46.6972^\circ\text{ E}$ | $1680\text{ м}$ (вершина — $2858\text{ м}$) | $62^\circ\text{--}79^\circ$ |
| **Плато Верхний Гуниб и гора Маяк (1859)** | $42.3867^\circ\text{ N}$ | $46.9317^\circ\text{ E}$ | $1520\text{ м}\text{--}2352\text{ м}$ | $75^\circ\text{--}89^\circ$ |

### 1.2. Математический расчёт масштаба `Z-Scale` и `XY-Scale` в Unreal Engine 5.5

В Unreal Engine 5 диапазон 16-битной карты высот $[0, 65535]$ преобразуется в локальные вертикальные координаты по закону $[-256.0\text{ см}, +255.992\text{ см}]$ при `Z-Scale` $= 1.0$, что соответствует базовому вертикальному размаху $512\text{ см}$ ($5.12\text{ м}$).

Для точного воспроизведения перепада высот Дагестана и Чечни от уреза воды Андийского Койсу ($h_{\min} = 180\text{ м}$) до гребня Богосского хребта и горы Аддала-Шухгельмеэр ($h_{\max} = 4151\text{ м}$) расчётный коэффициент `Z-Scale` вычисляется по формуле:

$$
\Delta H = h_{\max} - h_{\min} = 4151 - 180 = 3971\text{ м}
$$

$$
Z_{\text{scale}} = \frac{\Delta H \times 100}{512} = \frac{397100}{512} = 775.5859375
$$

Для тактических полигонов осад (`Level Instance` размером $4096\text{ м} \times 4096\text{ м}$ при сетке ландшафта $4033 \times 4033$ вершин) горизонтальный масштаб составляет:

$$
XY_{\text{scale}} = \frac{4096\text{ м} \times 100\text{ см/м}}{4032} = 101.5873\text{ см}
$$

### 1.3. Полный Python-пайплайн подготовки высот, фильтрации пустот SRTM и генерации Splat-масок (`prepare_caucasus_srtm_ue5.py`)

Скрипт склеивает геодезические тайлы `.hgt` / `.tif`, очищает радарные пустоты (`NoData = -32768`) в глубоких каньонах Койсу, интерполирует матрицу на регулярную координатную сетку `World Partition` ровно $8129 \times 8129$ вершин (без риска ошибки округления на $\pm 1$ пиксель), учитывает анизотропию шага сетки по широте и долготе ($\Delta x \neq \Delta y$) и генерирует 16-битный файл высот `Imamat_Caucasus_Height_16bit.png` вместе с 5 масками слоёв для `M_Caucasus_MasterLandscape`:

```python
# prepare_caucasus_srtm_ue5.py
# Зависимости: pip install numpy rasterio scipy imageio
import json
import numpy as np
import rasterio
from rasterio.merge import merge
from scipy.interpolate import RegularGridInterpolator
from scipy.ndimage import sobel, gaussian_filter, distance_transform_edt
import imageio.v3 as iio

# Границы квадрата «Гуниб — Ахульго — Салты — Дарго» (WGS84: West, South, East, North)
BBOX_WGS84 = (45.75, 42.20, 47.15, 43.15)
H_MIN_METERS = 180.0
H_MAX_METERS = 4151.0
UE5_GRID_SIZE = 8129  # Точная сетка UE5.5 World Partition (64x64 компонента, 127x127 квадов)
EXTENT_X_METERS = 115300.0  # Протяжённость по долготе (1.40 град. на широте 42.675 N)
EXTENT_Y_METERS = 105500.0  # Протяжённость по широте (0.95 град.)

HISTORICAL_NODES = {
    "vedeno":   {"lat": 42.9694, "lon": 46.0961, "title": "Столица Дарго-Ведено"},
    "dargo":    {"lat": 42.9522, "lon": 46.2361, "title": "Старое Дарго и хребет Речель"},
    "benoy":    {"lat": 42.9981, "lon": 46.3214, "title": "Ичкерия и Беной"},
    "shali":    {"lat": 43.1481, "lon": 45.9019, "title": "Большая Чечня (Шали)"},
    "karata":   {"lat": 42.5892, "lon": 46.3411, "title": "Карата и Андия"},
    "khunzakh": {"lat": 42.5436, "lon": 46.7058, "title": "Авария и Хунзах"},
    "akhulgo":  {"lat": 42.6786, "lon": 46.8550, "title": "Скала Ахульго"},
    "gergebil": {"lat": 42.5083, "lon": 47.0625, "title": "Гергебиль"},
    "salty":    {"lat": 42.3931, "lon": 47.0658, "title": "Аул Салты"},
    "gunib":    {"lat": 42.3867, "lon": 46.9317, "title": "Плато Верхний Гуниб"},
    "teletl":   {"lat": 42.3519, "lon": 46.6972, "title": "Гидатль и Телетль"}
}

def fill_srtm_voids(elevation_array):
    """Заполняет радарные пустоты SRTM (-32768 / NaN) в теснинах методом ближайшего соседа."""
    invalid_mask = np.isnan(elevation_array) | (elevation_array < -500.0)
    if np.any(invalid_mask) and not np.all(invalid_mask):
        indices = distance_transform_edt(
            invalid_mask,
            return_distances=False,
            return_indices=True
        )
        return elevation_array[tuple(indices)]
    return elevation_array

def build_ue5_landscape_package(srtm_files, output_prefix="Imamat_Caucasus"):
    datasets = [rasterio.open(f) for f in srtm_files]
    try:
        mosaic, _ = merge(datasets, bounds=BBOX_WGS84)
        raw_elevation = mosaic[0].astype(np.float32)
    finally:
        for ds in datasets:
            ds.close()

    # 1. Очистка радарных пустот SRTM перед интерполяцией
    clean_elevation = fill_srtm_voids(raw_elevation)

    # 2. Точная билинейная интерполяция на сетку ровно 8129 x 8129 вершин
    src_rows, src_cols = clean_elevation.shape
    y_old = np.linspace(0.0, 1.0, src_rows)
    x_old = np.linspace(0.0, 1.0, src_cols)
    interp_func = RegularGridInterpolator((y_old, x_old), clean_elevation, method="linear")

    y_new = np.linspace(0.0, 1.0, UE5_GRID_SIZE)
    x_new = np.linspace(0.0, 1.0, UE5_GRID_SIZE)
    grid_y, grid_x = np.meshgrid(y_new, x_new, indexing="ij")
    elevation_resampled = interp_func((grid_y, grid_x)).astype(np.float32)

    assert elevation_resampled.shape == (UE5_GRID_SIZE, UE5_GRID_SIZE), "Нарушена размерность сетки UE5!"

    # 3. Устранение ступенчатых артефактов квантования SRTM при сохранении острых скальных гребней
    elevation_smooth = gaussian_filter(elevation_resampled, sigma=0.65)

    # 4. Нормализация высот в 16-битный беззнаковый диапазон uint16 [0..65535]
    clipped = np.clip(elevation_smooth, H_MIN_METERS, H_MAX_METERS)
    norm_01 = (clipped - H_MIN_METERS) / (H_MAX_METERS - H_MIN_METERS)
    heightmap_u16 = np.round(norm_01 * 65535.0).astype(np.uint16)

    # 5. Анизотропное вычисление градиента высоты и крутизны склона в градусах
    cell_size_x_m = EXTENT_X_METERS / float(UE5_GRID_SIZE - 1)
    cell_size_y_m = EXTENT_Y_METERS / float(UE5_GRID_SIZE - 1)
    dz_dx = sobel(clipped, axis=1) / (8.0 * cell_size_x_m)
    dz_dy = sobel(clipped, axis=0) / (8.0 * cell_size_y_m)
    slope_deg = np.degrees(np.arctan(np.hypot(dz_dx, dz_dy)))

    # 6. Генерация 8-битных Splat-масок (Weightmaps) для Landscape Layer Blend в UE 5.5
    mask_cliff = np.clip((slope_deg - 52.0) / 14.0, 0.0, 1.0)
    mask_terraces = np.where(
        (slope_deg >= 20.0) & (slope_deg <= 54.0) & (clipped >= 550.0) & (clipped <= 2150.0),
        1.0, 0.0
    )
    mask_djailau = np.where((slope_deg < 26.0) & (clipped > 1900.0), 1.0, 0.0)
    mask_beech_forest = np.where(
        (slope_deg >= 12.0) & (slope_deg <= 48.0) & (clipped >= 450.0) & (clipped <= 1850.0),
        1.0, 0.0
    )
    mask_river_canyon = np.where((clipped < 750.0) & (slope_deg < 18.0), 1.0, 0.0)

    iio.imwrite(f"{output_prefix}_Height_16bit.png", heightmap_u16)
    iio.imwrite(f"{output_prefix}_Weight_01_LimestoneCliff.png", (mask_cliff * 255).astype(np.uint8))
    iio.imwrite(f"{output_prefix}_Weight_02_AgriTerraces.png", (mask_terraces * 255).astype(np.uint8))
    iio.imwrite(f"{output_prefix}_Weight_03_DjailauPastures.png", (mask_djailau * 255).astype(np.uint8))
    iio.imwrite(f"{output_prefix}_Weight_04_IchkeriaBeechForest.png", (mask_beech_forest * 255).astype(np.uint8))
    iio.imwrite(f"{output_prefix}_Weight_05_KoisuRiverbed.png", (mask_river_canyon * 255).astype(np.uint8))

    z_scale = ((H_MAX_METERS - H_MIN_METERS) * 100.0) / 512.0
    metadata = {
        "UE5_GridResolution": [UE5_GRID_SIZE, UE5_GRID_SIZE],
        "UE5_ZScale": round(z_scale, 6),
        "CellSizeMetersXY": [round(cell_size_x_m, 3), round(cell_size_y_m, 3)],
        "MinElevationMeters": H_MIN_METERS,
        "MaxElevationMeters": H_MAX_METERS,
        "BoundingBoxWGS84": BBOX_WGS84,
        "HistoricalNodes": HISTORICAL_NODES
    }
    with open(f"{output_prefix}_UE5_Metadata.json", "w", encoding="utf-8") as fp:
        json.dump(metadata, fp, ensure_ascii=False, indent=2)

    print(f"[SRTM -> UE5.5] Готово! Сетка: {UE5_GRID_SIZE}x{UE5_GRID_SIZE}, Z-Scale = {z_scale:.5f}")
```

## 2. Конфигурация сборки модуля C++20 (`ImamatWargame.Build.cs`)

Модуль подключает подсистемы `Landscape`, `ChaosSolverEngine`, `GeometryCollectionEngine` (разрушение каменных саклей от попаданий пудовых мортир и подрыва подземных камуфлетов), `PCG` (процедурная генерация вековых буков на хребте Речель) и `Niagara`:

```csharp
// Source/ImamatWargame/ImamatWargame.Build.cs
using UnrealBuildTool;

public class ImamatWargame : ModuleRules
{
    public ImamatWargame(ReadOnlyTargetRules Target) : base(Target)
    {
        PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;
        CppStandard = CppStandardVersion.Cpp20;

        PublicDependencyModuleNames.AddRange(new string[]
        {
            "Core",
            "CoreUObject",
            "Engine",
            "InputCore",
            "EnhancedInput",
            "AIModule",
            "GameplayTasks",
            "NavigationSystem",
            "Landscape",
            "Foliage",
            "Chaos",
            "ChaosSolverEngine",
            "GeometryCollectionEngine",
            "FieldSystemEngine",
            "PCG",
            "Niagara",
            "UMG",
            "Slate",
            "SlateCore",
            "Json",
            "JsonUtilities"
        });
    }
}
```

## 3. Стратегическое ядро C++: Государство, Наибы, Низамы и логистика гонцов

### 3.1. Типы данных, структуры психологии наибов и Кодекса Низамов (`ImamatStrategicTypes.h`)

```cpp
// Source/ImamatWargame/Public/Strategic/ImamatStrategicTypes.h
#pragma once

#include "CoreMinimal.h"
#include "Engine/DataTable.h"
#include "ImamatStrategicTypes.generated.h"

UENUM(BlueprintType)
enum class ENaibOrderType : uint8
{
    RaidSupplyLine     UMETA(DisplayName = "Ночной набег на царский обоз и кордон"),
    FortifyBlindages   UMETA(DisplayName = "Возвести подземные блиндажи в 3-4 наката"),
    CollectZakat       UMETA(DisplayName = "Собрать зейкат, селитру и провиант с террас"),
    MobilizeMurtazeks  UMETA(DisplayName = "Созвать ополчение муртазеков (1 с 10 дворов)")
};

UENUM(BlueprintType)
enum class EEnvoyRouteMode : uint8
{
    SecretMountainPath UMETA(DisplayName = "Тайная горная тропа (Низкий риск перехвата)"),
    FastImperialRoad   UMETA(DisplayName = "Быстрый тракт (-1 ход, риск засады пластунов)")
};

UENUM(BlueprintType)
enum class EImperialDoctrine : uint8
{
    VorontsovDeepThrust  UMETA(DisplayName = "М. С. Воронцов: Экспедиция в сердце гор (Дарго)"),
    ArgutinskySiegeRam   UMETA(DisplayName = "М. З. Аргутинский: Осадный таран и минная война"),
    FreytagFlyingColumns UMETA(DisplayName = "Р. К. Фрейтаг: Летучие колонны и перехват гонцов"),
    EvdokimovForestAxe   UMETA(DisplayName = "Н. И. Евдокимов: Система топора и блокада Джайляу")
};

UENUM(BlueprintType)
enum class ENizamPillar : uint8
{
    Judicial UMETA(DisplayName = "Судебная и административная реформа (Шариат и Мухтасибы)"),
    Military UMETA(DisplayName = "Военная реформа (Муртазеки, Порох и Серебряные ордена)"),
    Tax      UMETA(DisplayName = "Налоговая реформа (Казна Байт аль-маль, Хумс и Террасы)"),
    Family   UMETA(DisplayName = "Семейная и социальная реформа (Калым и Призрение вдов)")
};

/**
 * Четырёхмерная матрица личности наиба для проверки выполнения приказов Шамиля
 */
USTRUCT(BlueprintType)
struct FNaibPsychologyMatrix
{
    GENERATED_BODY()

    /** Иман: религиозное рвение и преданность делу Газавата [0..100] */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Psychology", meta = (ClampMin = "0.0", ClampMax = "100.0"))
    float Iman = 80.0f;

    /** Смелость: решительность в бою и готовность стоять в осаде до конца [0..100] */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Psychology", meta = (ClampMin = "0.0", ClampMax = "100.0"))
    float Courage = 88.0f;

    /** Алчность: склонность требовать серебряные субсидии и утаивать хумс [0..100] */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Psychology", meta = (ClampMin = "0.0", ClampMax = "100.0"))
    float Greed = 35.0f;

    /** Гордыня: честолюбие, обидчивость и ревность к возвышению других наибов [0..100] */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Psychology", meta = (ClampMin = "0.0", ClampMax = "100.0"))
    float Pride = 60.0f;
};

/**
 * Запись о наибстве для DataTable (DT_Naibates_1845)
 */
USTRUCT(BlueprintType)
struct FNaibateRegionRow : public FTableRowBase
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Identity")
    FName NaibateID;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Identity")
    FText RegionName;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Identity")
    FText NaibName;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Identity")
    FText NaibTitle;

    /** Координаты узла на глобальном ландшафте UE 5.5 */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Geography")
    FVector WorldCoordinates = FVector::ZeroVector;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Geography")
    int32 BaseTravelTurns = 2;

    /** Средний уклон ущелья в градусах по данным NASA SRTM */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Geography")
    float SlopeDegrees = 70.0f;

    /** Продуктивность искусственных горных террас [0..100%] */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Economy")
    float TerraceYieldPercent = 65.0f;

    /** Сохраняется ли доступ отар к альпийским лугам Джайляу и зимним кутанам */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Economy")
    bool bPastureAccessOpen = true;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Forces")
    int32 GarrisonInfantry = 1400;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Forces")
    int32 MurtazekCavalry = 450;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Supply")
    int32 GunpowderPoods = 45;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Supply")
    int32 ProvisionsMeasures = 400;

    /** Военный нажим царских колонн на округ [0..100%] */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Warfare")
    float ImperialPressure = 58.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Warfare")
    bool bUnderSiege = false;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Psychology")
    FNaibPsychologyMatrix Traits;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Honors")
    TArray<FString> OrdersAwarded;
};

/**
 * Закон из Кодекса Низамов Шамиля (DT_ShamilNizams)
 */
USTRUCT(BlueprintType)
struct FShamilNizamRow : public FTableRowBase
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Nizam")
    FName NizamID;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Nizam")
    ENizamPillar Pillar = ENizamPillar::Judicial;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Nizam")
    FText Title;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Nizam", meta = (MultiLine = true))
    FText HistoricalText;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Cost")
    float CostAuthority = 12.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Cost")
    int32 CostSilver = 70;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "State")
    bool bEnacted = false;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Modifiers")
    float StressReduction = 6.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Modifiers")
    float GlobalImanBonus = 5.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Modifiers")
    float GreedPenaltyReductionPercent = 0.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Modifiers")
    float PridePenaltyReductionPercent = 0.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Modifiers")
    int32 PowderPerTurnBonus = 0;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Modifiers")
    int32 ProvisionsPerTurnBonus = 0;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Modifiers")
    int32 SilverPerTurnBonus = 0;
};

/**
 * Активный конный гонец с печатью Шамиля и вьюками пороха на горном маршруте
 */
USTRUCT(BlueprintType)
struct FEnvoyCaravanPacket
{
    GENERATED_BODY()

    UPROPERTY(BlueprintReadOnly, Category = "Envoy")
    FGuid EnvoyID;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Envoy")
    FName TargetNaibateID;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Envoy")
    ENaibOrderType OrderType = ENaibOrderType::RaidSupplyLine;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Envoy")
    EEnvoyRouteMode RouteMode = EEnvoyRouteMode::SecretMountainPath;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Envoy")
    int32 AttachedPowderPoods = 15;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Envoy")
    int32 AttachedSilverRubles = 40;

    UPROPERTY(BlueprintReadOnly, Category = "Envoy")
    float ExecutionChancePercent = 80.0f;

    UPROPERTY(BlueprintReadOnly, Category = "Envoy")
    float InterceptRiskPercent = 10.0f;

    UPROPERTY(BlueprintReadOnly, Category = "Envoy")
    int32 TurnsLeft = 2;

    UPROPERTY(BlueprintReadOnly, Category = "Envoy")
    int32 TotalTurns = 2;
};

/**
 * Результаты прогона серии партий методом Монте-Карло для калибровки баланса
 */
USTRUCT(BlueprintType)
struct FMonteCarloBalanceReport
{
    GENERATED_BODY()

    UPROPERTY(BlueprintReadOnly, Category = "Balance")
    int32 TotalSimulatedCampaigns = 100;

    UPROPERTY(BlueprintReadOnly, Category = "Balance")
    float ImamatSurvivalRatePercent = 68.0f;

    UPROPERTY(BlueprintReadOnly, Category = "Balance")
    float AverageFinalLeaderStress = 54.0f;

    UPROPERTY(BlueprintReadOnly, Category = "Balance")
    float PowderBottleneckFrequencyPercent = 41.0f;
};
```

### 3.2. Подсистема управления Имаматом (`UImamatStrategicSubsystem.h` и `.cpp`)

Подсистема реализует формулы нагрузки на Имама Шамиля ($\text{Stress}_{\text{total}}$), проверку риска духовного кризиса *«Зульмат»*, вероятность исполнения приказа наибом ($P_{\text{exec}}$), циклическую смену доктрин командующих Отдельным Кавказским корпусом (Воронцов $\to$ Аргутинский $\to$ Фрейтаг $\to$ Евдокимов) и встроенный генератор Монте-Карло для автоматического тестирования баланса:

$$
\text{Stress}_{\text{total}} = \text{clamp}\left(0.55 \cdot \overline{P}_{\text{imp}} + 7.5 \cdot N_{\text{low\_powder}} + 8.0 \cdot N_{\text{proud}} - 0.22 \cdot S_{\text{Porte}} - R_{\text{Nizam}} - 9.0 \cdot N_{\text{khalwat}}, \; 12, \; 98\right)
$$

$$
P_{\text{exec}} = \text{clamp}\left(0.52 \cdot \text{Iman}_{\text{eff}} + 0.34 \cdot \text{Courage} + B_{\text{supply}} - F_{\text{greed}} - F_{\text{pride}} - P_{\text{stress}}, \; 25, \; 98\right)
$$

```cpp
// Source/ImamatWargame/Public/Strategic/ImamatStrategicSubsystem.h
#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "Strategic/ImamatStrategicTypes.h"
#include "ImamatStrategicSubsystem.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_ThreeParams(FOnEnvoyArrivedEvent, FName, NaibateID, bool, bIntercepted, bool, bOrderExecuted);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnStressChangedEvent, float, NewStressPercent, bool, bZulmatCrisisActive);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnImperialStrikeEvent, FName, TargetNaibateID, EImperialDoctrine, DoctrineUsed);

UCLASS()
class IMAMATWARGAME_API UImamatStrategicSubsystem : public UGameInstanceSubsystem
{
    GENERATED_BODY()

public:
    virtual void Initialize(FSubsystemCollectionBase& Collection) override;

    /** Текущий номер хода и индекс климатического сезона */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Imamat|Campaign")
    int32 CurrentTurn = 1;

    /** Центральная казна Байт аль-маль и арсенал в Дарго-Ведено */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Imamat|Treasury")
    int32 CentralGunpowderPoods = 195;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Imamat|Treasury")
    int32 CentralProvisionsMeasures = 1420;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Imamat|Treasury")
    int32 BaitAlMalSilverRubles = 680;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Imamat|State")
    float ShamilAuthorityPercent = 86.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Imamat|State")
    float OttomanSupportPercent = 48.0f;

    /** Число проведённых духовных уединений (Халват) с шейхом Джамалуддином */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Imamat|Tarikat")
    int32 CompletedKhalwatSessions = 0;

    /** Таблица всех наибств и законов Низама */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Imamat|Data")
    TMap<FName, FNaibateRegionRow> Naibates;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Imamat|Data")
    TMap<FName, FShamilNizamRow> Nizams;

    UPROPERTY(BlueprintReadOnly, Category = "Imamat|Envoys")
    TArray<FEnvoyCaravanPacket> ActiveEnvoys;

    /** Состояние ИИ Отдельного Кавказского корпуса */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Imamat|ImperialAI")
    EImperialDoctrine ActiveImperialDoctrine = EImperialDoctrine::VorontsovDeepThrust;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Imamat|ImperialAI")
    FName ImperialTargetNaibateID = FName("karata");

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Imamat|ImperialAI")
    int32 TurnsUntilImperialStrike = 2;

    /** Делегаты для связи с UMG-интерфейсом Диван-ханы и 3D-картой */
    UPROPERTY(BlueprintAssignable, Category = "Imamat|Events")
    FOnEnvoyArrivedEvent OnEnvoyArrived;

    UPROPERTY(BlueprintAssignable, Category = "Imamat|Events")
    FOnStressChangedEvent OnStressChanged;

    UPROPERTY(BlueprintAssignable, Category = "Imamat|Events")
    FOnImperialStrikeEvent OnImperialStrike;

    /** Вычисляет суммарные бонусы от всех утверждённых законов Кодекса Низама */
    UFUNCTION(BlueprintCallable, BlueprintPure, Category = "Imamat|Math")
    void GetAggregatedNizamModifiers(
        float& OutStressReduction,
        float& OutGlobalImanBonus,
        float& OutGreedReductionPercent,
        float& OutPrideReductionPercent,
        int32& OutPowderPerTurn,
        int32& OutProvisionsPerTurn,
        int32& OutSilverPerTurn
    ) const;

    /** Вычисляет нагрузку на правителя Stress_total [12..98%] и порог «Зульмата» */
    UFUNCTION(BlueprintCallable, BlueprintPure, Category = "Imamat|Math")
    float CalculateLeaderStress(bool& bOutZulmatWarning) const;

    /** Вычисляет вероятность честного выполнения приказа наибом P(exec) и риск перехвата гонца */
    UFUNCTION(BlueprintCallable, BlueprintPure, Category = "Imamat|Math")
    void CalculateOrderExecutionProbability(
        FName TargetNaibateID,
        ENaibOrderType OrderType,
        EEnvoyRouteMode RouteMode,
        int32 AttachedPowder,
        int32 AttachedSilver,
        float& OutExecutionChance,
        float& OutInterceptRisk
    ) const;

    /** Снаряжает и отправляет конного гонца из Ведено в выбранное наибство */
    UFUNCTION(BlueprintCallable, Category = "Imamat|Orders")
    bool SendEnvoyWithOrder(
        FName TargetNaibateID,
        ENaibOrderType OrderType,
        EEnvoyRouteMode RouteMode,
        int32 AttachedPowder,
        int32 AttachedSilver
    );

    /** Утверждает закон из Кодекса Низамов Шамиля */
    UFUNCTION(BlueprintCallable, Category = "Imamat|Nizams")
    bool EnactShamilNizam(FName NizamID);

    /** Завершает стратегический ход (движение гонцов, экономика террас и удар Кавказского корпуса) */
    UFUNCTION(BlueprintCallable, Category = "Imamat|Turn")
    void ProcessNextStrategicTurn(int32 SeasonalProvisionsMod, int32 SeasonalPowderMod, float SeasonalPressureMod);

    /** Запускает быстрый C++ прогон Монте-Карло для проверки баланса кампании */
    UFUNCTION(BlueprintCallable, Category = "Imamat|Balance")
    FMonteCarloBalanceReport RunMonteCarloBalanceSimulation(int32 NumRuns = 100, float ImperialDifficultyMultiplier = 1.0f) const;

private:
    /** Ротация генерала и выбор новой приоритетной цели для Отдельного Кавказского корпуса */
    void RotateImperialDoctrineAndTarget();
};
```

Полная реализация логики в `ImamatStrategicSubsystem.cpp`:

```cpp
// Source/ImamatWargame/Private/Strategic/ImamatStrategicSubsystem.cpp
#include "Strategic/ImamatStrategicSubsystem.h"
#include "Math/UnrealMathUtility.h"

void UImamatStrategicSubsystem::Initialize(FSubsystemCollectionBase& Collection)
{
    Super::Initialize(Collection);
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

void UImamatStrategicSubsystem::CalculateOrderExecutionProbability(
    FName TargetNaibateID,
    ENaibOrderType OrderType,
    EEnvoyRouteMode RouteMode,
    int32 AttachedPowder,
    int32 AttachedSilver,
    float& OutExecutionChance,
    float& OutInterceptRisk) const
{
    const FNaibateRegionRow* Reg = Naibates.Find(TargetNaibateID);
    if (!Reg)
    {
        OutExecutionChance = 0.0f;
        OutInterceptRisk = 100.0f;
        return;
    }

    float StressRed = 0.0f, ImanBon = 0.0f, GreedRed = 0.0f, PrideRed = 0.0f;
    int32 PowBon = 0, ProvBon = 0, SilvBon = 0;
    GetAggregatedNizamModifiers(StressRed, ImanBon, GreedRed, PrideRed, PowBon, ProvBon, SilvBon);

    const float EffectiveIman = FMath::Clamp(Reg->Traits.Iman + ImanBon, 0.0f, 100.0f);
    const float BasePositive = (EffectiveIman * 0.52f) + (Reg->Traits.Courage * 0.34f);

    const float SilverFactor = (AttachedSilver < 30) ? 1.25f : 0.45f;
    const float GreedPenalty = Reg->Traits.Greed * 0.28f * (1.0f - GreedRed / 100.0f) * SilverFactor;

    const float OrderPrideWeight = (OrderType == ENaibOrderType::CollectZakat) ? 1.20f : 0.75f;
    const float PridePenalty = Reg->Traits.Pride * 0.22f * (1.0f - PrideRed / 100.0f) * OrderPrideWeight;

    const float SupplyBonus = FMath::Min(18.0f, (AttachedPowder * 0.45f) + (AttachedSilver * 0.12f));

    bool bZulmat = false;
    const float LeaderStress = CalculateLeaderStress(bZulmat);
    const float StressPenalty = (LeaderStress > 75.0f) ? 8.0f : 0.0f;

    OutExecutionChance = FMath::Clamp(
        FMath::RoundToFloat(BasePositive + SupplyBonus - GreedPenalty - PridePenalty - StressPenalty),
        25.0f,
        98.0f
    );

    if (RouteMode == EEnvoyRouteMode::FastImperialRoad)
    {
        OutInterceptRisk = FMath::Clamp(FMath::RoundToFloat(Reg->ImperialPressure * 0.38f), 5.0f, 45.0f);
    }
    else
    {
        OutInterceptRisk = FMath::Clamp(FMath::RoundToFloat(Reg->ImperialPressure * 0.12f), 4.0f, 22.0f);
    }
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

    float ExecChance = 0.0f;
    float InterceptRisk = 0.0f;
    CalculateOrderExecutionProbability(TargetNaibateID, OrderType, RouteMode, AttachedPowder, AttachedSilver, ExecChance, InterceptRisk);

    const int32 TurnsNeeded = (RouteMode == EEnvoyRouteMode::FastImperialRoad)
        ? FMath::Max(1, Reg->BaseTravelTurns - 1)
        : FMath::Max(1, Reg->BaseTravelTurns);

    FEnvoyCaravanPacket Packet;
    Packet.EnvoyID = FGuid::NewGuid();
    Packet.TargetNaibateID = TargetNaibateID;
    Packet.OrderType = OrderType;
    Packet.RouteMode = RouteMode;
    Packet.AttachedPowderPoods = AttachedPowder;
    Packet.AttachedSilverRubles = AttachedSilver;
    Packet.ExecutionChancePercent = ExecChance;
    Packet.InterceptRiskPercent = InterceptRisk;
    Packet.TurnsLeft = TurnsNeeded;
    Packet.TotalTurns = TurnsNeeded;

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

void UImamatStrategicSubsystem::RotateImperialDoctrineAndTarget()
{
    // Циклическая смена командующего и доктрины Отдельного Кавказского корпуса
    const uint8 NextIndex = (static_cast<uint8>(ActiveImperialDoctrine) + 1) % 4;
    ActiveImperialDoctrine = static_cast<EImperialDoctrine>(NextIndex);

    TArray<FName> PreferredTargets;
    switch (ActiveImperialDoctrine)
    {
        case EImperialDoctrine::VorontsovDeepThrust:
            PreferredTargets = { FName("karata"), FName("benoy"), FName("khunzakh") };
            break;
        case EImperialDoctrine::ArgutinskySiegeRam:
            PreferredTargets = { FName("gergebil"), FName("teletl"), FName("irib") };
            break;
        case EImperialDoctrine::FreytagFlyingColumns:
            PreferredTargets = { FName("shali"), FName("benoy") };
            break;
        case EImperialDoctrine::EvdokimovForestAxe:
        default:
            PreferredTargets = { FName("shali"), FName("benoy"), FName("karata") };
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

    // Резервный выбор, если таблица содержит кастомные ID наибств
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

    int32 TurnPowderDelta = 18 + PowBon + SeasonalPowderMod;
    int32 TurnProvisionsDelta = 110 + ProvBon + SeasonalProvisionsMod;
    int32 TurnSilverDelta = 40 + SilvBon;

    // 1. Обработка удара колонны Отдельного Кавказского корпуса и смена доктрины
    FName StruckRegionThisTurn = NAME_None;
    if (TurnsUntilImperialStrike <= 1)
    {
        StruckRegionThisTurn = ImperialTargetNaibateID;
        const EImperialDoctrine ExecutedDoctrine = ActiveImperialDoctrine;

        if (FNaibateRegionRow* AttackedReg = Naibates.Find(ImperialTargetNaibateID))
        {
            AttackedReg->ImperialPressure = FMath::Min(96.0f, AttackedReg->ImperialPressure + 18.0f);
            AttackedReg->GunpowderPoods = FMath::Max(5, AttackedReg->GunpowderPoods - 10);
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

    // 2. Продвижение и разрешение маршрутов конных гонцов
    for (int32 i = ActiveEnvoys.Num() - 1; i >= 0; --i)
    {
        FEnvoyCaravanPacket& Env = ActiveEnvoys[i];
        Env.TurnsLeft--;

        if (Env.TurnsLeft <= 0)
        {
            const bool bIntercepted = (FMath::FRandRange(0.0f, 100.0f) < Env.InterceptRiskPercent);
            bool bExecuted = false;

            if (!bIntercepted)
            {
                bExecuted = (FMath::FRandRange(0.0f, 100.0f) < Env.ExecutionChancePercent);
                if (FNaibateRegionRow* TargetReg = Naibates.Find(Env.TargetNaibateID))
                {
                    TargetReg->GunpowderPoods += Env.AttachedPowderPoods;
                    if (bExecuted)
                    {
                        if (Env.OrderType == ENaibOrderType::RaidSupplyLine)
                        {
                            TargetReg->ImperialPressure = FMath::Max(15.0f, TargetReg->ImperialPressure - 15.0f);
                            TargetReg->Traits.Iman = FMath::Min(100.0f, TargetReg->Traits.Iman + 4.0f);
                            TurnPowderDelta += 14;
                            TurnSilverDelta += 65;
                        }
                        else if (Env.OrderType == ENaibOrderType::FortifyBlindages)
                        {
                            TargetReg->ImperialPressure = FMath::Max(15.0f, TargetReg->ImperialPressure - 20.0f);
                            TargetReg->Traits.Iman = FMath::Min(100.0f, TargetReg->Traits.Iman + 5.0f);
                            TargetReg->bUnderSiege = false;
                        }
                        else if (Env.OrderType == ENaibOrderType::CollectZakat)
                        {
                            TurnSilverDelta += 135;
                            TurnProvisionsDelta += 160;
                            TurnPowderDelta += 16;
                        }
                        else if (Env.OrderType == ENaibOrderType::MobilizeMurtazeks)
                        {
                            TargetReg->GarrisonInfantry += 220;
                            TargetReg->MurtazekCavalry += 90;
                            TargetReg->ImperialPressure = FMath::Max(15.0f, TargetReg->ImperialPressure - 8.0f);
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
        if (Pair.Key != StruckRegionThisTurn)
        {
            const float RandomDrift = FMath::FRandRange(2.0f, 6.0f) + SeasonalPressureMod;
            Reg.ImperialPressure = FMath::Clamp(Reg.ImperialPressure + RandomDrift, 15.0f, 96.0f);
        }
        if (Reg.ImperialPressure >= 82.0f)
        {
            Reg.bUnderSiege = true;
        }
        Reg.GunpowderPoods = FMath::Max(6, Reg.GunpowderPoods - 3);

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
        const float Variance = FMath::FRandRange(-13.0f, 13.0f);
        const float Score = (100.0f - BaseStress) * 0.65f + NizamBonus + PowderFactor - DifficultyPenalty + Variance;
        if (Score >= 48.0f)
        {
            SurvivedCount++;
        }

        const float SimStress = FMath::Clamp(BaseStress + DifficultyPenalty * 0.6f + FMath::FRandRange(-9.0f, 9.0f), 15.0f, 96.0f);
        StressSum += SimStress;

        if (CentralGunpowderPoods < 140 || FMath::FRand() < (0.35f * ImperialDifficultyMultiplier))
        {
            PowderShortageCount++;
        }
    }

    Report.ImamatSurvivalRatePercent = FMath::RoundToFloat((static_cast<float>(SurvivedCount) / Report.TotalSimulatedCampaigns) * 100.0f);
    Report.AverageFinalLeaderStress = FMath::RoundToFloat(StressSum / Report.TotalSimulatedCampaigns);
    Report.PowderBottleneckFrequencyPercent = FMath::RoundToFloat((static_cast<float>(PowderShortageCount) / Report.TotalSimulatedCampaigns) * 100.0f);
    return Report;
}
```

## 4. Безсеточный тактический модуль: Горная осада по Д. А. Милютину, 3D-баллистика и сейсмоскоп Хаджи-Юсуфа Сафарова

### 4.1. Менеджер горной осады и геодезического разреза скалы (`ATacticalSiegeManager.h` и `.cpp`)

Класс `ATacticalSiegeManager` управляет:

1. **Точной баллистической проверкой мёртвой зоны скального обрыва** с учётом гравитационного проседания траектории снаряда на дистанции гребня $D_{\text{crest}}$:

$$
Z_{\text{proj}}(D_{\text{crest}}) = Z_{\text{gun}} + D_{\text{crest}} \tan\alpha - \frac{g \cdot D_{\text{crest}}^2}{2 v_0^2 \cos^2\alpha}
$$

Если $Z_{\text{proj}}(D_{\text{crest}}) < Z_{\text{crest}}$, настильное ядро горного единорога врезается в известняковый обрыв, а верхние ярусы саклей остаются в **мёртвой зоне рельефа**;
2. **Амортизацией бревенчатых накатов блиндажей** ($L_{\text{layers}} \in \{1, 2, 3, 4\}$), снижающих фугасный импульс `Chaos` на $18\%$ за каждый дубовый накат с земляной подушкой;
3. **Медным тазом с водой Хаджи-Юсуфа Сафарова** и подрывом подземного **камуфлета** с генерацией события разрушения породы `OnCamoufletDetonated`:

```cpp
// Source/ImamatWargame/Public/Tactical/TacticalSiegeManager.h
#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "TacticalSiegeManager.generated.h"

class UMaterialParameterCollection;

UENUM(BlueprintType)
enum class EArtilleryOrdnanceType : uint8
{
    OnePoodMortar      UMETA(DisplayName = "Пудовая мортира (Навесная парабола 45-70 град.)"),
    MountainUnicornGun UMETA(DisplayName = "Горный единорог (Настильный огонь 6-30 град.)")
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_ThreeParams(
    FOnCamoufletDetonatedEvent,
    FVector, WorldOrigin,
    float, BlastRadiusCm,
    float, NewMineDistanceSazhens
);

UCLASS()
class IMAMATWARGAME_API ATacticalSiegeManager : public AActor
{
    GENERATED_BODY()

public:
    ATacticalSiegeManager();

    /** Коллекция параметров материалов (MPC) для управления плоскостью геодезического разреза Милютина в реальном времени */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Siege|MilyutinCutaway")
    TObjectPtr<UMaterialParameterCollection> CutawayMPC;

    /** Текущее положение плоскости геодезического разреза вдоль оси Y в мировых координатах */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Siege|MilyutinCutaway")
    float CutawayPlaneWorldY = 0.0f;

    /** Число дубовых накатов над подземными блиндажами аула [1..4] */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Siege|Blindages", meta = (ClampMin = "1", ClampMax = "4"))
    int32 BlindageTimberLayers = 3;

    /** Дистанция от головы русской подземной сапы до фундамента башни в саженях (1 сажень = 213.36 см) */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Siege|MiningWarfare")
    float RussianMineDistanceSazhens = 9.5f;

    /** Делегат для вызова Chaos Field System и Niagara VFX при подрыве подземного камуфлета */
    UPROPERTY(BlueprintAssignable, Category = "Siege|MiningWarfare")
    FOnCamoufletDetonatedEvent OnCamoufletDetonated;

    /**
     * Сдвигает плоскость геодезического разреза скалы («Нож Милютина»), обнажая подземные галереи и блиндажи в 3D
     */
    UFUNCTION(BlueprintCallable, Category = "Siege|MilyutinCutaway")
    void SetMilyutinCutawayPlane(FVector PlaneOrigin, FVector PlaneNormal, bool bEnableCutaway);

    /**
     * Вычисляет баллистическую траекторию снаряда и проверяет с учётом гравитации, перехватывается ли ядро скальным обрывом (Мёртвая зона)
     */
    UFUNCTION(BlueprintCallable, Category = "Siege|Ballistics")
    bool SimulateArtilleryShot(
        EArtilleryOrdnanceType OrdnanceType,
        FVector MuzzleLocation,
        FVector CliffCrestLocation,
        FVector TargetSaklyaLocation,
        float LaunchAngleDegrees,
        float InitialSpeedCmPerSec,
        TArray<FVector>& OutTrajectoryPoints,
        bool& bOutBlockedByCliffDeadZone,
        float& OutEffectiveStructureDamage
    ) const;

    /**
     * Вычисляет амплитуду сейсмических волн в медном тазу с водой Хаджи-Юсуфа Сафарова [0..1]
     */
    UFUNCTION(BlueprintCallable, BlueprintPure, Category = "Siege|CopperBasin")
    float CalculateCopperBasinSeismicRipple(bool& bOutCriticalProximityAlert) const;

    /**
     * Подрывает встречный подземный камуфлет: обрушивает сапёрную галерею врага и отбрасывает подкоп назад
     */
    UFUNCTION(BlueprintCallable, Category = "Siege|MiningWarfare")
    void DetonateUndergroundCamouflet(float PowderChargePoods, FVector CamoufletWorldOrigin, float& OutUpdatedDistanceSazhens);
};
```

Реализация в `TacticalSiegeManager.cpp`:

```cpp
// Source/ImamatWargame/Private/Tactical/TacticalSiegeManager.cpp
#include "Tactical/TacticalSiegeManager.h"
#include "Kismet/KismetMaterialLibrary.h"
#include "Engine/World.h"

ATacticalSiegeManager::ATacticalSiegeManager()
{
    PrimaryActorTick.bCanEverTick = false;
}

void ATacticalSiegeManager::SetMilyutinCutawayPlane(FVector PlaneOrigin, FVector PlaneNormal, bool bEnableCutaway)
{
    CutawayPlaneWorldY = PlaneOrigin.Y;
    if (CutawayMPC && GetWorld())
    {
        UKismetMaterialLibrary::SetVectorParameterValue(
            GetWorld(),
            CutawayMPC,
            FName("CutawayPlaneOrigin"),
            FLinearColor(PlaneOrigin.X, PlaneOrigin.Y, PlaneOrigin.Z, bEnableCutaway ? 1.0f : 0.0f)
        );

        // Защита от нулевого вектора нормали, исключающая NaN в HLSL-шейдере
        const FVector SafeNorm = PlaneNormal.IsNearlyZero()
            ? FVector(0.0f, 1.0f, 0.0f)
            : PlaneNormal.GetSafeNormal();

        UKismetMaterialLibrary::SetVectorParameterValue(
            GetWorld(),
            CutawayMPC,
            FName("CutawayPlaneNormal"),
            FLinearColor(SafeNorm.X, SafeNorm.Y, SafeNorm.Z, 0.0f)
        );
    }
}

bool ATacticalSiegeManager::SimulateArtilleryShot(
    EArtilleryOrdnanceType OrdnanceType,
    FVector MuzzleLocation,
    FVector CliffCrestLocation,
    FVector TargetSaklyaLocation,
    float LaunchAngleDegrees,
    float InitialSpeedCmPerSec,
    TArray<FVector>& OutTrajectoryPoints,
    bool& bOutBlockedByCliffDeadZone,
    float& OutEffectiveStructureDamage) const
{
    OutTrajectoryPoints.Empty();

    const float SafeSpeed = FMath::Max(500.0f, InitialSpeedCmPerSec);
    const float clampedAngleDeg = FMath::Clamp(LaunchAngleDegrees, 2.0f, 85.0f);
    const float LaunchRad = FMath::DegreesToRadians(clampedAngleDeg);
    const float CosAngle = FMath::Max(0.05f, FMath::Cos(LaunchRad));
    const float GravityCmPerSecSq = 980.0f;

    const float Dist2DToCrest = FMath::Max(1.0f, FVector::Dist2D(MuzzleLocation, CliffCrestLocation));
    const float Dist2DToTarget = FMath::Max(Dist2DToCrest + 10.0f, FVector::Dist2D(MuzzleLocation, TargetSaklyaLocation));

    // Вычисляем реальную высоту параболы снаряда над точкой перегиба скалы с учётом гравитационного проседания
    const float TimeToCrest = Dist2DToCrest / (SafeSpeed * CosAngle);
    const float ProjectileZAtCrest =
        MuzzleLocation.Z +
        (Dist2DToCrest * FMath::Tan(LaunchRad)) -
        (0.5f * GravityCmPerSecSq * TimeToCrest * TimeToCrest);

    bOutBlockedByCliffDeadZone = (ProjectileZAtCrest < CliffCrestLocation.Z);

    const FVector Dir2D = (TargetSaklyaLocation - MuzzleLocation).GetSafeNormal2D();
    const FVector InitialVelocity =
        (Dir2D * (CosAngle * SafeSpeed)) +
        FVector(0.0f, 0.0f, FMath::Sin(LaunchRad) * SafeSpeed);

    const FVector GravityVec(0.0f, 0.0f, -GravityCmPerSecSq);
    const int32 NumSteps = 80;
    const float TotalFlightTime = (Dist2DToTarget / (SafeSpeed * CosAngle)) * 1.15f;
    const float TimeStep = FMath::Max(0.02f, TotalFlightTime / static_cast<float>(NumSteps));

    for (int32 Step = 0; Step <= NumSteps; ++Step)
    {
        const float T = Step * TimeStep;
        const FVector Pos = MuzzleLocation + (InitialVelocity * T) + (0.5f * GravityVec * T * T);
        OutTrajectoryPoints.Add(Pos);

        const float CurrentDist2D = FVector::Dist2D(MuzzleLocation, Pos);
        if (bOutBlockedByCliffDeadZone && CurrentDist2D >= Dist2DToCrest)
        {
            break;
        }
        if (!bOutBlockedByCliffDeadZone && (CurrentDist2D >= Dist2DToTarget || (Step > 4 && Pos.Z <= TargetSaklyaLocation.Z)))
        {
            break;
        }
    }

    if (bOutBlockedByCliffDeadZone)
    {
        OutEffectiveStructureDamage = 0.0f;
        return false;
    }

    // Расчёт поглощения удара пудовой бомбы дубовыми накатами блиндажа Хаджи-Юсуфа Сафарова
    const float BaseOrdnanceDamage = (OrdnanceType == EArtilleryOrdnanceType::OnePoodMortar) ? 65.0f : 38.0f;
    const float BlindageMitigation = FMath::Clamp(static_cast<float>(BlindageTimberLayers) * 0.18f, 0.0f, 0.72f);
    OutEffectiveStructureDamage = BaseOrdnanceDamage * (1.0f - BlindageMitigation);
    return true;
}

float ATacticalSiegeManager::CalculateCopperBasinSeismicRipple(bool& bOutCriticalProximityAlert) const
{
    const float SafeDist = FMath::Max(1.0f, RussianMineDistanceSazhens);
    const float Intensity = FMath::Clamp(12.5f / (SafeDist * SafeDist), 0.04f, 1.0f);
    bOutCriticalProximityAlert = (RussianMineDistanceSazhens <= 4.5f);
    return Intensity;
}

void ATacticalSiegeManager::DetonateUndergroundCamouflet(
    float PowderChargePoods,
    FVector CamoufletWorldOrigin,
    float& OutUpdatedDistanceSazhens)
{
    const float PushbackSazhens = FMath::Clamp(PowderChargePoods * 0.36f, 2.5f, 6.8f);
    RussianMineDistanceSazhens = FMath::Min(18.0f, RussianMineDistanceSazhens + PushbackSazhens);
    OutUpdatedDistanceSazhens = RussianMineDistanceSazhens;

    const float BlastRadiusCm = FMath::Clamp(PowderChargePoods * 45.0f, 350.0f, 1200.0f);
    OnCamoufletDetonated.Broadcast(CamoufletWorldOrigin, BlastRadiusCm, RussianMineDistanceSazhens);
}
```

### 4.2. Шейдер геодезического разреза скалы по Д. А. Милютину (`MF_MilyutinCutawaySection.hlsl`)

Чтобы в **Unreal Engine 5.5** рассекать 3D-скалу Ахульго, Салтов или Гуниба точно так же, как в нашей 11-й вкладке прототипа, в мастер-материал ландшафта и каменных саклей добавляется узел `Custom HLSL` (`MF_MilyutinCutawaySection`), связанный с `CutawayMPC` и защищённый от деления на ноль при неинициализированной нормали:

```hlsl
// MF_MilyutinCutawaySection.hlsl
// Входы узла Custom в Material Editor UE 5.5:
//   float3 WorldPos         (Absolute World Position)
//   float4 CutawayOrigin    (RGB = Origin XYZ, A = EnableFlag 0..1 из CutawayMPC)
//   float3 CutawayNormal    (Нормаль секущей плоскости из CutawayMPC)
//   float3 BaseRockAlbedo   (Базовый цвет породы скалы)
// Дополнительные выходы (Additional Outputs):
//   float  OutOpacityMask   (Подключается в Opacity Mask материала Masked)
//   float3 OutEmissive      (Подсветка линии геодезического среза и подземных галерей)

if (CutawayOrigin.a < 0.5)
{
    OutOpacityMask = 1.0;
    OutEmissive = float3(0.0, 0.0, 0.0);
    return BaseRockAlbedo;
}

// Защита от NaN, если вектор нормали в MPC ещё не инициализирован (длина == 0)
float NormalLenSq = dot(CutawayNormal, CutawayNormal);
float3 SafeNormal = (NormalLenSq > 0.0001) ? (CutawayNormal * rsqrt(NormalLenSq)) : float3(0.0, 1.0, 0.0);

float SignedDist = dot(WorldPos - CutawayOrigin.xyz, SafeNormal);

// Отсекаем породу перед плоскостью разреза Милютина
if (SignedDist < 0.0)
{
    OutOpacityMask = 0.0;
    OutEmissive = float3(0.0, 0.0, 0.0);
    return float3(0.0, 0.0, 0.0);
}

OutOpacityMask = 1.0;

// Золотистая чертёжная кромка шириной 35 см вдоль линии геодезического сечения А-Б
float EdgeFactor = 1.0 - saturate(SignedDist / 35.0);
OutEmissive = EdgeFactor * float3(0.96, 0.62, 0.04) * 2.5;

return lerp(BaseRockAlbedo, float3(0.16, 0.13, 0.10), EdgeFactor);
```

## 5. Баллистика 18 нагрудных газырей и Сплайновый коридор лесной засады в Ичкерии

### 5.1. Компонент 18 нагрудных газырей и кинжальной атаки (`UGazyrAmmunitionComponent.h` и `.cpp`)

Каждый воин Имамата носит на груди черкески газырницу (стандартно $N_{\text{gazyr}} = 18\text{ трубок}$ с серебряными колпачками, содержащих по $1.75\text{ золотника} \approx 7.46\text{ г}$ ружейного пороха). После расстрела 18-го газыря компонент автоматически переключает ИИ отряда в режим рукопашного штурма с кинжалами *кама* («Базалай») и шашками («Гурда»):

```cpp
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
```

```cpp
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
```

### 5.2. Контроллер лесной засады на сплайне («Сухарная экспедиция» 1845 г. — `AForestSplineAmbushController.h` и `.cpp`)

Управляет извилистой лесной дорогой вдоль `USplineComponent` от хребта Речель к Дарго, пошаговым продвижением эшелонов с проверкой блокировки буковыми завалами (`AdvanceColumnAlongSpline`), рубкой вековых буков без дублирования в одной точке и кинжальными ударами во фланг обоза при падении сплочённости строя ($\text{Cohesion} < 55\%$):

```cpp
// Source/ImamatWargame/Public/Tactical/ForestSplineAmbushController.h
#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Components/SplineComponent.h"
#include "ForestSplineAmbushController.generated.h"

USTRUCT(BlueprintType)
struct FImperialSplineEchelon
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ambush|Echelon")
    FName EchelonID;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ambush|Echelon")
    FText EchelonTitle;

    /** Дистанция вдоль сплайна лесной дороги в сантиметрах */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ambush|Echelon")
    float DistanceAlongSplineCm = 0.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ambush|Echelon")
    int32 BayonetStrength = 980;

    /** Сплочённость строя [0..100%]: при падении ниже 55% эшелон уязвим для кинжальной рубки */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ambush|Echelon")
    float CohesionPercent = 72.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ambush|Echelon")
    int32 MountainGunsCount = 2;
};

UCLASS()
class IMAMATWARGAME_API AForestSplineAmbushController : public AActor
{
    GENERATED_BODY()

public:
    AForestSplineAmbushController();

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Ambush|Spline")
    TObjectPtr<USplineComponent> ForestRoadSpline;

    /** Дистанции поваленных буковых завалов (засек) вдоль сплайна дороги */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ambush|Barricades")
    TArray<float> BeechBarricadeSplineLocationsCm;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ambush|Column")
    TArray<FImperialSplineEchelon> ColumnEchelons;

    /**
     * Валит вековые буки поперёк лесной тропы в точке SplineDistanceCm (с проверкой минимального интервала), разрывая колонну
     */
    UFUNCTION(BlueprintCallable, Category = "Ambush|Tactics")
    bool FellBeechTreesAbattis(float SplineDistanceCm, float ImpactRadiusCm = 5000.0f);

    /**
     * Продвигает эшелоны колонны по сплайну лесной дороги с учётом торможения перед буковыми завалами
     */
    UFUNCTION(BlueprintCallable, Category = "Ambush|Tactics")
    void AdvanceColumnAlongSpline(float BaseAdvanceStepCm = 3500.0f);

    /**
     * Наносит перекрёстный залп штуцеров с лесных высот по скучившемуся у завала эшелону
     */
    UFUNCTION(BlueprintCallable, Category = "Ambush|Tactics")
    void ExecuteForestCrossfireVolley(int32 TargetEchelonIndex);

    /**
     * Бросает сотни мюридов с кинжалами «Базалай» и шашками во фланг расстроенного обоза
     */
    UFUNCTION(BlueprintCallable, Category = "Ambush|Tactics")
    void LaunchFlankingDaggerCharge(
        int32 TargetEchelonIndex,
        int32& OutCapturedPowderPoods,
        int32& OutCapturedProvisions,
        int32& OutCapturedSilverRubles
    );
};
```

```cpp
// Source/ImamatWargame/Private/Tactical/ForestSplineAmbushController.cpp
#include "Tactical/ForestSplineAmbushController.h"
#include "Math/UnrealMathUtility.h"

AForestSplineAmbushController::AForestSplineAmbushController()
{
    PrimaryActorTick.bCanEverTick = false;
    ForestRoadSpline = CreateDefaultSubobject<USplineComponent>(TEXT("IchkeriaForestRoadSpline"));
    RootComponent = ForestRoadSpline;
}

bool AForestSplineAmbushController::FellBeechTreesAbattis(float SplineDistanceCm, float ImpactRadiusCm)
{
    // Защита от наложения нескольких завалов в одну и ту же точку сплайна (минимум 800 см между засеками)
    for (const float ExistingDist : BeechBarricadeSplineLocationsCm)
    {
        if (FMath::Abs(ExistingDist - SplineDistanceCm) < 800.0f)
        {
            return false;
        }
    }

    BeechBarricadeSplineLocationsCm.Add(SplineDistanceCm);

    for (FImperialSplineEchelon& Ech : ColumnEchelons)
    {
        if (FMath::Abs(Ech.DistanceAlongSplineCm - SplineDistanceCm) <= ImpactRadiusCm)
        {
            Ech.CohesionPercent = FMath::Max(12.0f, Ech.CohesionPercent - 15.0f);
        }
    }
    return true;
}

void AForestSplineAmbushController::AdvanceColumnAlongSpline(float BaseAdvanceStepCm)
{
    const float MaxSplineLen = ForestRoadSpline ? ForestRoadSpline->GetSplineLength() : 100000.0f;

    for (FImperialSplineEchelon& Ech : ColumnEchelons)
    {
        const float ProposedDist = FMath::Min(MaxSplineLen, Ech.DistanceAlongSplineCm + BaseAdvanceStepCm);
        bool bBlockedByAbattis = false;

        for (const float BarricadeDist : BeechBarricadeSplineLocationsCm)
        {
            if (BarricadeDist >= Ech.DistanceAlongSplineCm && BarricadeDist <= ProposedDist + 400.0f)
            {
                // Эшелон упирается в поваленные буки, теряет темп и скучивается под огнём
                Ech.DistanceAlongSplineCm = FMath::Max(Ech.DistanceAlongSplineCm, BarricadeDist - 250.0f);
                Ech.CohesionPercent = FMath::Max(10.0f, Ech.CohesionPercent - 8.0f);
                bBlockedByAbattis = true;
                break;
            }
        }

        if (!bBlockedByAbattis)
        {
            Ech.DistanceAlongSplineCm = ProposedDist;
        }
    }
}

void AForestSplineAmbushController::ExecuteForestCrossfireVolley(int32 TargetEchelonIndex)
{
    if (!ColumnEchelons.IsValidIndex(TargetEchelonIndex))
    {
        return;
    }

    FImperialSplineEchelon& Ech = ColumnEchelons[TargetEchelonIndex];
    Ech.BayonetStrength = FMath::Max(100, Ech.BayonetStrength - 135);
    Ech.CohesionPercent = FMath::Max(8.0f, Ech.CohesionPercent - 18.0f);
}

void AForestSplineAmbushController::LaunchFlankingDaggerCharge(
    int32 TargetEchelonIndex,
    int32& OutCapturedPowderPoods,
    int32& OutCapturedProvisions,
    int32& OutCapturedSilverRubles)
{
    OutCapturedPowderPoods = 0;
    OutCapturedProvisions = 0;
    OutCapturedSilverRubles = 0;

    if (!ColumnEchelons.IsValidIndex(TargetEchelonIndex))
    {
        return;
    }

    FImperialSplineEchelon& Ech = ColumnEchelons[TargetEchelonIndex];
    const float CohesionVulnerability = (Ech.CohesionPercent < 55.0f) ? 1.45f : 0.75f;

    Ech.BayonetStrength = FMath::Max(60, Ech.BayonetStrength - FMath::RoundToInt(220.0f * CohesionVulnerability));
    Ech.CohesionPercent = FMath::Max(5.0f, Ech.CohesionPercent - 25.0f);
    Ech.MountainGunsCount = FMath::Max(0, Ech.MountainGunsCount - 1);

    OutCapturedPowderPoods = FMath::RoundToInt(18.0f * CohesionVulnerability);
    OutCapturedProvisions = FMath::RoundToInt(140.0f * CohesionVulnerability);
    OutCapturedSilverRubles = FMath::RoundToInt(65.0f * CohesionVulnerability);
}
```

## 6. Архитектура Blueprints, ИИ-деревьев поведения (Behavior Trees / GOAP) и UMG-интерфейса в Unreal Engine 5.5

| Класс Blueprint / Ассет UE 5.5 | Базовый C++ класс | Роль и связка в движке |
| ----- | ----- | ----- |
| `BP_ImamatGameInstance` | `UGameInstance` | Инициализирует `UImamatStrategicSubsystem`, загружает таблицы `DT_Naibates_1845` и `DT_ShamilNizams` и связывает сейвы с тактическими уровнями. |
| `BP_DivanKhana_TablePawn` | `APawn` | Камера игрока в 3D-зале Диван-ханы в Ведено: плавный наезд на рельефный стол Кавказа, интерактивная сургучная печать Шамиля и витрина кубачинских орденов. |
| `BP_MountedMuridEnvoy` | `ACharacter` | 3D-всадник в черкеске и бурке, скачущий по `USplineComponent` горных троп из Ведено в Хунзах, Беной, Телетль и Гергебиль. |
| `BP_SiegeManager_Salty1847` | `ATacticalSiegeManager` | Управляет осадой Салтов / Ахульго: двигает плоскость разреза `CutawayMPC`, спавнит круги на воде в медном тазу Хаджи-Юсуфа через `NS_CopperBasinRipples` и взрывает `GC_StoneSaklya_Cluster`. |
| `BP_AmbushSpline_Dargo1845` | `AForestSplineAmbushController` | Генерирует буковый лес Ичкерии через граф `PCG_IchkeriaBeechForest`, обрушивает срубленные буки поперёк дороги и управляет фланговой атакой мюридов. |
| `BT_NaibAutonomousAI` | `UBehaviorTree` | Дерево поведения наиба: проверяет $P_{\text{exec}}$, наличие пороха и серебряных субсидий перед началом рейда или укреплением блиндажей. |
| `BT_ImperialGeneral_GOAP` | `UBehaviorTree` | ИИ командующего Кавказским корпусом: переключает доктрины Воронцова (прорыв к Дарго), Аргутинского (осада мортирами), Фрейтага (перехват гонцов) и Евдокимова (рубка просек). |
| `WBP_DivanKhana_MasterHUD` | `UUserWidget` | Главный UMG-интерфейс, подписанный на делегаты `OnStressChanged`, `OnEnvoyArrived` и `OnImperialStrike`. |