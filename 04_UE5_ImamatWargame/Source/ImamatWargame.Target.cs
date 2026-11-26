// Source/ImamatWargame.Target.cs
using UnrealBuildTool;
using System.Collections.Generic;

public class ImamatWargameTarget : TargetRules
{
    public ImamatWargameTarget(TargetInfo Target) : base(Target)
    {
        Type = TargetType.Game;
        DefaultBuildSettings = BuildSettingsVersion.V5;
        IncludeOrderVersion = EngineIncludeOrderVersion.Unreal5_5;
        CppStandard = CppStandardVersion.Cpp20;
        ExtraModuleNames.Add("ImamatWargame");
    }
}
