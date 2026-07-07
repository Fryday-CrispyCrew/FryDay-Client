module.exports = {
  type: "widget",
  name: "FrydayWidget",
  bundleIdentifier: "com.crispycrew.fryday.widget",
  deploymentTarget: "18.0",
  entitlements: {
    "com.apple.security.application-groups": [
      "group.com.fryday.shared"
    ]
  }
};