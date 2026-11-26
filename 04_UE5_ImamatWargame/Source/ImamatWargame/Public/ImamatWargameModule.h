// Source/ImamatWargame/Public/ImamatWargameModule.h
#pragma once

#include "CoreMinimal.h"
#include "Modules/ModuleManager.h"

class FImamatWargameModule : public IModuleInterface
{
public:
    virtual void StartupModule() override;
    virtual void ShutdownModule() override;
};
