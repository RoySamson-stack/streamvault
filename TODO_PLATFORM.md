# Platform TODO

## Android TV APK (without Android Studio UI)
Option A: Gradle CLI (requires Java + Android SDK installed)
```
cd android
./gradlew assembleDebug
```
APK output:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

## CI Build (optional)
Set up a CI workflow to run `./gradlew assembleDebug` and upload the APK as an artifact.

