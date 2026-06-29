#!/usr/bin/env bash
set -e

APP_URL="${1:-https://vaultsphere.vercel.app}"

echo "Building web app for $APP_URL ..."
NEXT_PUBLIC_APP_URL="$APP_URL" npm run build

echo "Syncing to Android..."
npx cap sync android

echo "Building Android TV APK..."
cd android
./gradlew assembleRelease

echo ""
echo "APK ready at: android/app/build/outputs/apk/release/app-release-unsigned.apk"
echo ""
echo "To install on your TV, either:"
echo "  1. Debug APK (no signing needed):"
echo "     cd android && ./gradlew assembleDebug"
echo "     adb install app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "  2. Release APK (requires signing):"
echo "     jarsigner -sigalg SHA1withRSA -digestalg SHA1 \\"
echo "       -keystore your-key.keystore \\"
echo "       app/build/outputs/apk/release/app-release-unsigned.apk alias_name"
echo "     adb install app/build/outputs/apk/release/app-release-unsigned.apk"
