// Minimal AI configuration that reflects the GPT-5 feature flag
import { getFeatureFlags } from './featureFlags';

export function getAIConfig() {
  const flags = getFeatureFlags();
  return Object.freeze({
    model: flags.enableGpt5 ? 'gpt-5' : 'gpt-4.1',
    features: { gpt5: flags.enableGpt5 },
  });
}

export default getAIConfig;
