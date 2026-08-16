#!/bin/bash
# Local iOS simulator build for Dfood-app.
#
# This is the FIRST native build this project has ever had — ios/ and
# android/ are gitignored and have never been generated. Everything so far
# ran through Expo Go, which ships a fixed set of native modules. This build
# links this project's actual native dependencies for real, including a few
# Expo Go doesn't include by default (e.g. @react-native-masked-view/masked-view
# from the progressive-blur component). If something fails to link, that's
# new information, not a regression — report the exact error.
#
# No Apple Developer account or EAS login needed for a simulator build.
# Needs: Xcode + command line tools installed locally.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> Generating native ios/ project (prebuild)"
npx expo prebuild --platform ios --clean

echo "==> Building and launching on the iOS Simulator"
npx expo run:ios

# For a physical device instead of the simulator:
#   npx expo run:ios --device
#
# For a distributable build (TestFlight/App Store), you'll need an Apple
# Developer account and `eas login`, then:
#   npx eas build --platform ios --profile preview
