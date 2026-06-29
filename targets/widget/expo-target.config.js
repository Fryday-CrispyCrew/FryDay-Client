module.exports = {
  type: "widget",
  name: "FrydayWidget",
  bundleIdentifier: "com.crispycrew.fryday.widget",
  deploymentTarget: "17.0",
  entitlements: {
    "com.apple.security.application-groups": [
      "group.com.fryday.shared"
    ]
  }
};