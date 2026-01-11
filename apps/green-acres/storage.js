import { sendToAntenna } from '../../shared/bridge.js';

export async function saveAnalysis(advertId, data) {
  try {
    const dataToStore = { [advertId]: data };
    await sendToAntenna('PROXY_STORAGE_SET', { data: dataToStore });
    console.log(`💾 Saved analysis for ${advertId}`);
  } catch (err) {
    console.error('Failed to save to storage:', err);
  }
}

export async function getAnalysis(advertId) {
  try {
    const result = await sendToAntenna('PROXY_STORAGE_GET', {
      keys: [advertId],
    });
    return result[advertId] || null;
  } catch (err) {
    console.error('Failed to fetch from storage:', err);
    return null;
  }
}

export async function deleteAnalysis(advertId) {
  try {
    await sendToAntenna('PROXY_STORAGE_REMOVE', { keys: [advertId] });
    console.log(`🗑️ Deleted analysis for ${advertId}`);
  } catch (err) {
    console.error('Failed to delete:', err);
  }
}
