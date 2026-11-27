#!/usr/bin/env bash
set -euo pipefail
# Stage Windows (Depot 3481841) and macOS (Depot 3481842) builds for Valve SteamPipe upload
PKG_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KIT_DIR="$(cd "$PKG_DIR/.." && pwd)"
STAGE_DIR="$KIT_DIR/StagedBuilds"

rm -rf "$STAGE_DIR"
mkdir -p "$STAGE_DIR/Windows" "$STAGE_DIR/Mac"

# Stage Windows Depot (3481841)
cp "$KIT_DIR/Imamat_DivanKhana_Standalone_Playtest.html" "$STAGE_DIR/Windows/"
cp "$KIT_DIR/Launch_Imamat_Windows_Desktop.bat" "$STAGE_DIR/Windows/"
cp "$PKG_DIR/electron-main.cjs" "$PKG_DIR/electron-preload.cjs" "$PKG_DIR/steam_appid.txt" "$STAGE_DIR/Windows/"
cp -R "$KIT_DIR/Workshop_Mods" "$STAGE_DIR/Windows/Workshop_Mods"

# Stage macOS Depot (3481842)
cp -R "$KIT_DIR/Imamat_DivanKhana_macOS.app" "$STAGE_DIR/Mac/"
cp "$PKG_DIR/steam_appid.txt" "$STAGE_DIR/Mac/"

echo "[OK] SteamPipe depots staged at: $STAGE_DIR"
echo "     Run: steamcmd +login <partner_account> +run_app_build ../Steamworks_Partner_Config/app_build_imamat_vertical_slice.vdf +quit"
