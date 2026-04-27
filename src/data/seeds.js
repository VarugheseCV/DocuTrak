const SCHEMA_VERSION = 1;

const defaultProfile = {
  email: "",
  language: "English",
  themeMode: "dark",
  alertDays: 30,
  profession: "",
  country: "",
  area: ""
};

const seedEntityTypes = [
  "Individuals",
  "Vehicles",
  "Company",
  "Land",
  "Flat & Buildings",
  "Employees"
].map((name, index) => ({
  id: `entity-type-${index + 1}`,
  name,
  active: true
}));

const seedEntities = [];

const seedDocumentTypes = [
  "Passport",
  "Indian Driving License",
  "Oman Driving License",
  "UAE Driving License",
  "Medical Insurance India",
  "Oman Visa",
  "UAE Visa",
  "US Visa",
  "Land Tax",
  "Building Tax",
  "Car Registration",
  "Car Insurance",
  "Car Warranty Expiry",
  "Car Battery Warranty Expiry",
  "Tire Warranty Expiry",
  "Company Registration",
  "Chamber Certificate",
  "Labor Registration",
  "Fire & Safety Certificate"
].map((name, index) => ({
  id: `document-type-${index + 1}`,
  name,
  active: true
}));

function createInitialState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    profile: defaultProfile,
    entityTypes: seedEntityTypes,
    entities: seedEntities,
    documentTypes: seedDocumentTypes,
    documentRecords: [],
    images: [],
    adSlots: {
      dashboard: true,
      listScreens: true,
      reports: true,
      settings: true
    },
    lastBackupAt: null
  };
}

module.exports = {
  SCHEMA_VERSION,
  defaultProfile,
  seedEntityTypes,
  seedEntities,
  seedDocumentTypes,
  createInitialState
};
