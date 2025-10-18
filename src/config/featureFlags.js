// Centralized feature flags for the app
// CRA exposes env vars prefixed with REACT_APP_

const toBool = (val, defaultValue = true) => {
  if (val === undefined || val === null || val === '') return defaultValue;
  const s = String(val).toLowerCase().trim();
  if (['1', 'true', 'yes', 'y', 'on'].includes(s)) return true;
  if (['0', 'false', 'no', 'n', 'off'].includes(s)) return false;
  return defaultValue;
};

export const defaultFeatureFlags = Object.freeze({
  enableGpt5: true,
});

export function getFeatureFlags() {
  const enableGpt5 = toBool(process.env.REACT_APP_ENABLE_GPT5, defaultFeatureFlags.enableGpt5);
  const flags = { enableGpt5 };
  return Object.freeze(flags);
}

export default getFeatureFlags;
