import * as Sentry from "@sentry/nuxt";
 
Sentry.init({
  dsn: "https://5bbfe5b126e9040f6e38a2e24d8217f4@o141283.ingest.us.sentry.io/4509566373658624",
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
