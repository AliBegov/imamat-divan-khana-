// Source/ImamatWargameEditor.Target.cs
using UnrealBuildTool;
using System.Collections.Generic;

public class ImamatWargameEditorTarget : TargetRules
{
    public ImamatWargameEditorTarget(TargetInfo Target) : base(Target)
    {
        Type = TargetType.Editor;
        DefaultBuildSettings = BuildSettingsVersion.V5;
        IncludeOrderVersion = EngineIncludeOrderVersion.Unreal5_5;
        CppStandard = CppStandardVersion.Cpp20;
        ExtraModuleNames.Add("ImamatWargame");
    }
}
