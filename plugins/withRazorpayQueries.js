const { withAndroidManifest, withInfoPlist } = require('@expo/config-plugins');

const withRazorpayQueries = (config) => {
  // Add iOS queries
  config = withInfoPlist(config, (config) => {
    if (!config.modResults.LSApplicationQueriesSchemes) {
      config.modResults.LSApplicationQueriesSchemes = [];
    }
    const schemes = ['paytm', 'paytmmp', 'gpay', 'upi', 'phonepe', 'tez', 'bhim'];
    schemes.forEach((scheme) => {
      if (!config.modResults.LSApplicationQueriesSchemes.includes(scheme)) {
        config.modResults.LSApplicationQueriesSchemes.push(scheme);
      }
    });
    return config;
  });

  // Add Android queries
  config = withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;
    const manifest = androidManifest.manifest;
    
    if (!manifest.queries) {
      manifest.queries = [];
    }
    
    // Check if queries array is present, if not add it
    let queries = manifest.queries[0];
    if (!queries) {
      queries = { package: [], intent: [] };
      manifest.queries.push(queries);
    }
    if (!queries.package) {
      queries.package = [];
    }
    if (!queries.intent) {
      queries.intent = [];
    }

    const packages = [
      'net.one97.paytm',
      'com.google.android.apps.nbu.paisa.user',
      'com.phonepe.app',
      'in.amazon.mShop.android.shopping',
      'in.org.npci.upiapp'
    ];

    packages.forEach((pkg) => {
      const exists = queries.package.find(p => p.$['android:name'] === pkg);
      if (!exists) {
        queries.package.push({ $: { 'android:name': pkg } });
      }
    });

    // Also add generic UPI intent query
    const upiIntentExists = queries.intent.find(i => 
      i.action && i.action.length > 0 && i.action[0].$['android:name'] === 'android.intent.action.VIEW' &&
      i.data && i.data.length > 0 && i.data[0].$['android:scheme'] === 'upi'
    );
    if (!upiIntentExists) {
      queries.intent.push({
        action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
        data: [{ $: { 'android:scheme': 'upi' } }]
      });
    }

    return config;
  });

  return config;
};

module.exports = withRazorpayQueries;
