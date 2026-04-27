import * as FileSystem from "expo-file-system";
import * as SecureStore from "expo-secure-store";
import { createInitialState, defaultProfile, SCHEMA_VERSION } from "./seeds";

const DATA_FILE = `${FileSystem.documentDirectory}docutrak-data.json`;
const PROFILE_KEY = "docutrak-profile";

export async function loadState() {
  try {
    const info = await FileSystem.getInfoAsync(DATA_FILE);
    const baseState = info.exists
      ? JSON.parse(await FileSystem.readAsStringAsync(DATA_FILE))
      : createInitialState();
    const profileJson = await SecureStore.getItemAsync(PROFILE_KEY);
    const profile = profileJson ? JSON.parse(profileJson) : baseState.profile || defaultProfile;
    return migrateState({
      ...baseState,
      profile: {
        ...defaultProfile,
        ...profile
      }
    });
  } catch (error) {
    console.warn("Unable to load local data, using initial state.", error);
    return createInitialState();
  }
}

export async function saveState(state) {
  const nextState = migrateState(state);
  await SecureStore.setItemAsync(PROFILE_KEY, JSON.stringify(nextState.profile));
  await FileSystem.writeAsStringAsync(DATA_FILE, JSON.stringify(nextState, null, 2));
  return nextState;
}

export async function replaceState(state) {
  return saveState(migrateState(state));
}

function migrateState(state) {
  return {
    ...createInitialState(),
    ...state,
    schemaVersion: SCHEMA_VERSION,
    profile: {
      ...defaultProfile,
      ...(state.profile || {})
    },
    entityTypes: state.entityTypes || [],
    entities: state.entities || [],
    documentTypes: state.documentTypes || [],
    documentRecords: state.documentRecords || [],
    images: state.images || []
  };
}
