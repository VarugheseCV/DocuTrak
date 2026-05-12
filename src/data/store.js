import { Platform } from "react-native";
import { createInitialState, defaultProfile, SCHEMA_VERSION } from "./seeds";

// On web, expo-secure-store and expo-file-system have limited support.
// We use lazy imports and wrap calls to gracefully fall back to localStorage.
let _FileSystem = null;
let _SecureStore = null;

function getFileSystem() {
  if (_FileSystem) return _FileSystem;
  if (Platform.OS === "web") {
    _FileSystem = {
      documentDirectory: "",
      readAsStringAsync: async (key) => {
        const v = localStorage.getItem(key);
        if (v == null) throw new Error("not found");
        return v;
      },
      writeAsStringAsync: async (key, value) => localStorage.setItem(key, value),
    };
  } else {
    _FileSystem = require("expo-file-system/legacy");
  }
  return _FileSystem;
}

function getSecureStore() {
  if (_SecureStore) return _SecureStore;
  if (Platform.OS === "web") {
    _SecureStore = {
      getItemAsync: async (key) => localStorage.getItem(key),
      setItemAsync: async (key, value) => localStorage.setItem(key, value),
    };
  } else {
    _SecureStore = require("expo-secure-store");
  }
  return _SecureStore;
}

function getDataFilePath() {
  if (Platform.OS === "web") return "docutrak-data";
  return `${getFileSystem().documentDirectory}docutrak-data.json`;
}

const PROFILE_KEY = "docutrak-profile";

export async function loadState() {
  try {
    const FS = getFileSystem();
    const SS = getSecureStore();
    let baseState;
    try {
      const content = await FS.readAsStringAsync(getDataFilePath());
      baseState = JSON.parse(content);
    } catch (e) {
      baseState = createInitialState();
    }
    const profileJson = await SS.getItemAsync(PROFILE_KEY);
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
  const FS = getFileSystem();
  const SS = getSecureStore();
  const nextState = migrateState(state);
  await SS.setItemAsync(PROFILE_KEY, JSON.stringify(nextState.profile));
  await FS.writeAsStringAsync(getDataFilePath(), JSON.stringify(nextState, null, 2));
  return nextState;
}

export async function replaceState(state) {
  return saveState(migrateState(state));
}

function migrateState(state) {
  const documentRecords = (state.documentRecords || []).map((record) => ({
    ...record,
    status: record.status === "Expired" ? "Active" : record.status || "Active"
  }));

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
    documentRecords,
    images: state.images || []
  };
}
