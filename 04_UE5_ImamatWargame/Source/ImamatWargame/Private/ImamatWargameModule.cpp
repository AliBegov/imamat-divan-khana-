// Source/ImamatWargame/Private/ImamatWargameModule.cpp
#include "ImamatWargameModule.h"
#include "Misc/Paths.h"
#include "ShaderCore.h"

#define LOCTEXT_NAMESPACE "FImamatWargameModule"

void FImamatWargameModule::StartupModule()
{
    // Регистрация виртуальной директории шейдеров для подключения MF_MilyutinCutawaySection.hlsl
    const FString ShaderDirectory = FPaths::Combine(FPaths::ProjectDir(), TEXT("Shaders"));
    if (FPaths::DirectoryExists(ShaderDirectory))
    {
        AddShaderSourceDirectoryMapping(TEXT("/Project/Shaders"), ShaderDirectory);
    }
}

void FImamatWargameModule::ShutdownModule()
{
    ResetAllShaderSourceDirectoryMappings();
}

#undef LOCTEXT_NAMESPACE

IMPLEMENT_PRIMARY_GAME_MODULE(FImamatWargameModule, ImamatWargame, "ImamatWargame");
