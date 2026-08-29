const { withXcodeProject } = require('@expo/config-plugins');

// No SENTRY_ORG/SENTRY_PROJECT/SENTRY_AUTH_TOKEN is configured (see .env.example),
// so neither of the two sentry-cli calls @sentry/react-native's own plugin wires
// into the native build can authenticate - they fail every local build. Setting
// SENTRY_DISABLE_AUTO_UPLOAD=true in .env only helps builds launched through
// `expo run:ios` (which loads .env before invoking xcodebuild); a build started
// directly in Xcode.app never sees that file, and each Run Script build phase is
// its own independent shell process anyway - one phase having the var set doesn't
// propagate to the other. Bake the same env var straight into both build phases'
// own shell scripts instead, so it works no matter how the build is triggered:
//  - "Upload Debug Symbols to Sentry" (native dSYM upload, sentry-xcode-debug-files.sh)
//  - "Bundle React Native code and images" (JS sourcemap upload, sentry-xcode.sh)
//
// Must run AFTER @sentry/react-native's plugin has set up both phases - per
// Expo's mod ordering (same as withoutPushEntitlement.js), that means this
// plugin has to be listed BEFORE "@sentry/react-native" in app.json.
function disableSentryUpload(phase) {
  if (phase && !phase.shellScript.includes('SENTRY_DISABLE_AUTO_UPLOAD')) {
    const withoutQuotes = JSON.parse(phase.shellScript);
    phase.shellScript = JSON.stringify(`export SENTRY_DISABLE_AUTO_UPLOAD=true\n${withoutQuotes}`);
  }
}

module.exports = function withSentryUploadDisabled(config) {
  return withXcodeProject(config, (config) => {
    const xcodeProject = config.modResults;
    disableSentryUpload(xcodeProject.pbxItemByComment('Upload Debug Symbols to Sentry', 'PBXShellScriptBuildPhase'));
    disableSentryUpload(
      xcodeProject.pbxItemByComment('Bundle React Native code and images', 'PBXShellScriptBuildPhase'),
    );
    return config;
  });
};
