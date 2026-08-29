const { withEntitlementsPlist } = require('@expo/config-plugins');

// This app only ever schedules local notifications (see src/lib/notifications.ts) -
// it never sends remote/APNs push. expo-notifications' own config plugin adds
// the aps-environment entitlement unconditionally regardless, and a free/personal
// Apple Developer team (see AGENTS.md context: this project is currently signed
// with one) cannot be granted the Push Notifications capability at all, which
// fails every build's code signing. Strip the key here, after expo-notifications'
// plugin has already added it, since local notifications don't need it.
//
// Expo composes same-file mods in reverse of app.json's plugins array order
// (each newly-registered mod runs before the chain that existed when it was
// added) - so this plugin must be listed BEFORE "expo-notifications" in
// app.json for its deletion to run after that plugin's addition.
module.exports = function withoutPushEntitlement(config) {
  return withEntitlementsPlist(config, (config) => {
    delete config.modResults['aps-environment'];
    return config;
  });
};
