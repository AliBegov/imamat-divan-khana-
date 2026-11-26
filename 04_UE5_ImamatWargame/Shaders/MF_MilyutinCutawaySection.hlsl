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
