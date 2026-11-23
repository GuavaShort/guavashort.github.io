import './attribution.js';

let active = false;
let clickEvent = '';

export function startAttribution(config) {
  if (active || config?.enabled !== true) return;
  if (
    typeof config.pixelId !== 'string' ||
    !config.pixelId.trim() ||
    (config.adjustToken !== undefined && typeof config.adjustToken !== 'string')
  ) {
    console.warn(
      'Attribution is enabled but pixelId is missing or adjustToken is invalid. Tracking was skipped.',
    );
    return;
  }
  try {
    window.AdAttribution.init(config);
    active = true;
    clickEvent = typeof config.clickEvent === 'string' ? config.clickEvent.trim() : '';
  } catch (error) {
    console.warn('Attribution initialization failed.', error);
  }
}

export function getAdjustClickUrl(playUrl) {
  return window.AdAttribution.getAdjustClickUrl(playUrl);
}

export function trackStoreClick(position, appId, platform) {
  if (!active || !clickEvent) return;
  try {
    window.AdAttribution.track(clickEvent, { position, app_id: appId, platform });
  } catch (error) {
    console.warn('Attribution click event failed.', error);
  }
}
