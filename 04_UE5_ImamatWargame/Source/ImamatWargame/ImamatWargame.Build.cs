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
            "RenderCore",
            "RHI",
            "Projects",
            "Json",
            "JsonUtilities"
        });
    }
}
