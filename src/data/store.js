import * as FileSystem from "expo-file-system/legacy";
import * as SecureStore from "expo-secure-store";
import { createInitialState, defaultProfile, SCHEMA_VERSION } from "./seeds";

const DATA_FILE = `${FileSystem.documentDirectory}docutrak-data.json`;
const PROFILE_KEY = "docutrak-profile";

export async function loadState() {
  try {
    let baseState;
    try {
      const content = await FileSystem.readAsStringAsync(DATA_FILE);
      baseState = JSON.parse(content);
    } catch (e) {
      baseState = createInitialState();
    }
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
