// Local stand-in for a cron job: triggers the dispatcher every minute.
// Usage: npm run scheduler   (reads .env.local via node --env-file)
const { APP_PROTOCOL = "http", APP_ROOT_DOMAIN = "localhost:3000", CRON_SECRET } = process.env;
const INTERVAL_MS = 60_000;
const endpoint = `${APP_PROTOCOL}://${APP_ROOT_DOMAIN}/api/cron/dispatch`;

if (!CRON_SECRET) {
  console.error("CRON_SECRET is not set");
  process.exit(1);
}

const tick = async () => {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { authorization: `Bearer ${CRON_SECRET}` },
    });
    console.log(new Date().toISOString(), response.status, await response.text());
  } catch (error) {
    console.error(new Date().toISOString(), "dispatch failed:", error.message);
  }
};

console.log(`Triggering ${endpoint} every ${INTERVAL_MS / 1000}s`);
await tick();
setInterval(tick, INTERVAL_MS);
