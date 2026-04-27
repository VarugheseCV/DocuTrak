import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from "react-native";
import { createInitialState } from "./src/data/seeds";
import { loadState, replaceState, saveState } from "./src/data/store";
import {
  buildExpiryReport,
  createId,
  filterRows,
  findDuplicateDocumentRecord,
  sortRows
} from "./src/domain/documents";
import { exportBackup, importBackup } from "./src/services/backupService";
import { scheduleExpiryNotifications } from "./src/services/notifications";

const screens = [
  { key: "dashboard", title: "Dashboard", icon: "grid-outline" },
  { key: "entityTypes", title: "Entity Types", icon: "layers-outline" },
  { key: "entities", title: "Entities", icon: "people-outline" },
  { key: "documents", title: "Documents", icon: "document-text-outline" },
  { key: "records", title: "Data Entry", icon: "create-outline" },
  { key: "reports", title: "Reports", icon: "alert-circle-outline" },
  { key: "settings", title: "Settings", icon: "settings-outline" }
];

const palettes = {
  light: {
    primary: "#F97316",
    onPrimary: "#FFFFFF",
    primaryContainer: "#FFE0C2",
    onPrimaryContainer: "#3B1700",
    secondary: "#0284C7",
    secondaryContainer: "#CDEBFF",
    onSecondaryContainer: "#001E2E",
    tertiary: "#38BDF8",
    error: "#BA1A1A",
    surface: "#FFFBF8",
    surfaceDim: "#DED8D2",
    surfaceContainerLowest: "#FFFFFF",
    surfaceContainerLow: "#FFF4EA",
    surfaceContainer: "#F7EEE8",
    surfaceContainerHigh: "#F0E8E1",
    surfaceContainerHighest: "#E9E1DA",
    onSurface: "#211A15",
    onSurfaceVariant: "#53443A",
    outline: "#85746A",
    outlineVariant: "#D7C3B7",
    adBackground: "#FFF7ED",
    adBorder: "#FDBA74",
    adText: "#9A3412",
    mode: "light"
  },
  dark: {
    primary: "#FB923C",
    onPrimary: "#331300",
    primaryContainer: "#7C2D12",
    onPrimaryContainer: "#FFDBC8",
    secondary: "#38BDF8",
    secondaryContainer: "#0C4A6E",
    onSecondaryContainer: "#D7F2FF",
    tertiary: "#7DD3FC",
    error: "#FFB4AB",
    surface: "#090A0C",
    surfaceDim: "#090A0C",
    surfaceContainerLowest: "#000000",
    surfaceContainerLow: "#101114",
    surfaceContainer: "#17191D",
    surfaceContainerHigh: "#202329",
    surfaceContainerHighest: "#2B2F36",
    onSurface: "#F2F0ED",
    onSurfaceVariant: "#D4C7BE",
    outline: "#9F8F84",
    outlineVariant: "#4E453E",
    adBackground: "#1C140C",
    adBorder: "#EA580C",
    adText: "#FDBA74",
    mode: "dark"
  }
};

let md3 = palettes.light;
let styles;

export default function App() {
  const [state, setState] = useState(createInitialState());
  const [screen, setScreen] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [themeMode, setThemeMode] = useState("dark");

  md3 = palettes[themeMode];
  styles = createStyles(md3);

  useEffect(() => {
    loadState().then((loaded) => {
      setState(loaded);
      setThemeMode(loaded.profile?.themeMode === "light" ? "light" : "dark");
      setLoading(false);
    });
  }, []);

  async function commit(updater) {
    const nextState = typeof updater === "function" ? updater(state) : updater;
    setState(nextState);
    await saveState(nextState);
  }

  const activeScreen = screens.find((item) => item.key === screen);

  if (loading) {
    return (
      <Shell title="DocuTrak">
        <Text style={styles.muted}>Loading local records...</Text>
      </Shell>
    );
  }

  return (
    <Shell title={activeScreen?.title || "DocuTrak"} screen={screen} onNavigate={setScreen}>
      {screen === "dashboard" && <Dashboard state={state} onNavigate={setScreen} />}
      {screen === "entityTypes" && (
        <SimpleCatalog
          title="Entity Types"
          rows={state.entityTypes}
          adSlot="Entity type sponsor slot"
          onSave={(rows) => commit({ ...state, entityTypes: rows })}
          createPrefix="entity-type"
        />
      )}
      {screen === "entities" && <EntitiesScreen state={state} onCommit={commit} />}
      {screen === "documents" && (
        <SimpleCatalog
          title="Documents"
          rows={state.documentTypes}
          adSlot="Document services ad slot"
          onSave={(rows) => commit({ ...state, documentTypes: rows })}
          createPrefix="document-type"
        />
      )}
      {screen === "records" && <RecordsScreen state={state} onCommit={commit} />}
      {screen === "reports" && <ReportsScreen state={state} onCommit={commit} />}
      {screen === "settings" && (
        <SettingsScreen
          state={state}
          onCommit={commit}
          themeMode={themeMode}
          onThemeModeChange={setThemeMode}
        />
      )}
    </Shell>
  );
}

function Shell({ title, screen, onNavigate, children }) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>DocuTrak</Text>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        <View style={styles.platformPill}>
          <Ionicons name={Platform.OS === "ios" ? "logo-apple" : "logo-android"} size={16} color={md3.primary} />
          <Text style={styles.platformText}>Local first</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
      {onNavigate && screen !== "records" && (
        <Pressable style={styles.fab} onPress={() => onNavigate("records")} accessibilityLabel="Add document record">
          <Ionicons name="add" size={22} color={md3.onPrimaryContainer} />
          <Text style={styles.fabText}>Record</Text>
        </Pressable>
      )}
      {onNavigate && <BottomTabs active={screen} onNavigate={onNavigate} />}
    </SafeAreaView>
  );
}

function Dashboard({ state, onNavigate }) {
  const expiring = buildExpiryReport(state);
  const nextExpiry = expiring[0];
  const totals = [
    ["Entities", state.entities.length, "people-outline"],
    ["Records", state.documentRecords.length, "folder-open-outline"],
    ["Expiring", expiring.length, "warning-outline"],
    ["Alert Days", state.profile.alertDays, "notifications-outline"]
  ];
  return (
    <View style={styles.screenStack}>
      <View style={styles.heroPanel}>
        <View style={styles.heroIcon}>
          <Ionicons name="shield-checkmark-outline" size={30} color={md3.primary} />
        </View>
        <Text style={styles.heroTitle}>
          {nextExpiry ? `${nextExpiry.documentType?.name || "Document"} needs attention` : "Documents are under control"}
        </Text>
        <Text style={styles.heroText}>
          {nextExpiry
            ? `${nextExpiry.entity?.name || "Entity"} expires in ${nextExpiry.daysRemaining} day${nextExpiry.daysRemaining === 1 ? "" : "s"}.`
            : `No active documents are expiring within ${state.profile.alertDays} days.`}
        </Text>
        <View style={styles.heroActions}>
          <IconButton icon="add" label="Add record" onPress={() => onNavigate("records")} />
          <IconButton variant="secondary" icon="bar-chart-outline" label="View reports" onPress={() => onNavigate("reports")} />
        </View>
      </View>
      <View style={styles.statsRow}>
        {totals.map(([label, value, icon]) => (
          <View style={styles.stat} key={label}>
            <View style={styles.statIcon}>
              <Ionicons name={icon} size={17} color={md3.primary} />
            </View>
            <View>
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          </View>
        ))}
      </View>
      <AdSlot label="Dashboard advertisement slot" />
      <View style={styles.grid}>
        {screens
          .filter((item) => item.key !== "dashboard")
          .map((item) => (
            <Pressable key={item.key} style={styles.navTile} onPress={() => onNavigate(item.key)}>
              <View style={styles.navIcon}>
                <Ionicons name={item.icon} size={23} color={md3.primary} />
              </View>
              <Text style={styles.navText}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={18} color={md3.onSurfaceVariant} />
            </Pressable>
          ))}
      </View>
      <View style={styles.panel}>
        <SectionHeader title="Expiry Alerts" subtitle={`Next ${state.profile.alertDays} days`} />
        {expiring.length === 0 ? (
          <EmptyState icon="checkmark-circle-outline" title="Nothing urgent" text="New alerts will appear here when active documents approach their expiry date." />
        ) : (
          expiring.slice(0, 5).map((item) => <RecordSummary key={item.id} item={item} />)
        )}
      </View>
    </View>
  );
}

function SimpleCatalog({ title, rows, onSave, createPrefix, adSlot }) {
  const [draftName, setDraftName] = useState("");
  const [query, setQuery] = useState("");
  const visible = filterRows(sortRows(rows, "name"), query);

  function addRow() {
    const name = draftName.trim();
    if (!name) {
      Alert.alert("Name required", `Enter a ${title.toLowerCase()} name.`);
      return;
    }
    onSave([...rows, { id: createId(createPrefix), name, active: true }]);
    setDraftName("");
  }

  return (
    <View style={styles.screenStack}>
      <AdSlot label={adSlot} />
      <View style={styles.panel}>
        <SectionHeader title={`Add ${title.slice(0, -1)}`} subtitle="Keep names short and easy to recognize." />
        <FormRow>
          <TextInput
            style={styles.input}
            value={draftName}
            placeholder={`Add ${title.toLowerCase()}`}
            placeholderTextColor={md3.outline}
            onChangeText={setDraftName}
          />
          <IconButton icon="add" label="Add" onPress={addRow} />
        </FormRow>
      </View>
      <SearchBox value={query} onChangeText={setQuery} />
      {visible.map((row) => (
        <View key={row.id} style={styles.listRow}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>{row.name}</Text>
            <Text style={styles.muted}>{row.active ? "Active" : "Inactive"}</Text>
          </View>
          <Switch
            value={row.active}
            onValueChange={(active) => onSave(rows.map((item) => (item.id === row.id ? { ...item, active } : item)))}
          />
        </View>
      ))}
      {visible.length === 0 && <EmptyState icon="search-outline" title="No matches" text="Try a different search term or add a new item." />}
    </View>
  );
}

function EntitiesScreen({ state, onCommit }) {
  const [name, setName] = useState("");
  const [entityTypeId, setEntityTypeId] = useState(state.entityTypes[0]?.id || "");
  const [query, setQuery] = useState("");
  const rows = state.entities.map((entity) => ({
    ...entity,
    entityTypeName: state.entityTypes.find((type) => type.id === entity.entityTypeId)?.name || "Unknown"
  }));
  const visible = filterRows(sortRows(rows, "name"), query);

  function addEntity() {
    if (!name.trim() || !entityTypeId) {
      Alert.alert("Entity incomplete", "Enter an entity name and select an entity type.");
      return;
    }
    onCommit({
      ...state,
      entities: [...state.entities, { id: createId("entity"), name: name.trim(), entityTypeId, active: true }]
    });
    setName("");
  }

  return (
    <View style={styles.screenStack}>
      <AdSlot label="Entity services ad slot" />
      <View style={styles.panel}>
        <SectionHeader title="Add Entity" subtitle="People, vehicles, companies, properties, or anything that owns documents." />
        <TextInput style={styles.input} value={name} placeholder="Entity name" placeholderTextColor={md3.outline} onChangeText={setName} />
        <PickerLike
          label="Entity type"
          value={entityTypeId}
          options={state.entityTypes.filter((type) => type.active).map((type) => [type.id, type.name])}
          onChange={setEntityTypeId}
        />
        <IconButton icon="add" label="Add entity" onPress={addEntity} />
      </View>
      <SearchBox value={query} onChangeText={setQuery} />
      {visible.map((entity) => (
        <View key={entity.id} style={styles.listRow}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>{entity.name}</Text>
            <Text style={styles.muted}>{entity.entityTypeName}</Text>
          </View>
          <Switch
            value={entity.active}
            onValueChange={(active) =>
              onCommit({
                ...state,
                entities: state.entities.map((item) => (item.id === entity.id ? { ...item, active } : item))
              })
            }
          />
        </View>
      ))}
      {visible.length === 0 && <EmptyState icon="search-outline" title="No entities found" text="Add an entity or clear the search filter." />}
    </View>
  );
}

function RecordsScreen({ state, onCommit }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("entityName");
  const rows = state.documentRecords.map((record) => ({
    ...record,
    entityName: state.entities.find((entity) => entity.id === record.entityId)?.name || "Unknown",
    documentName: state.documentTypes.find((type) => type.id === record.documentTypeId)?.name || "Unknown"
  }));
  const visible = filterRows(sortRows(rows, sortKey), query);

  return (
    <View style={styles.screenStack}>
      <AdSlot label="Data entry advertisement slot" />
      <View style={styles.actionBar}>
        <IconButton icon="add" label="New record" onPress={() => setModalOpen(true)} />
        <PickerLike
          label="Sort"
          value={sortKey}
          compact
          options={[
            ["entityName", "Entity"],
            ["documentName", "Document"],
            ["expiryDate", "Expiry"],
            ["status", "Status"]
          ]}
          onChange={setSortKey}
        />
      </View>
      <SearchBox value={query} onChangeText={setQuery} />
      {visible.map((item) => (
        <View key={item.id} style={styles.cardRow}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>{item.entityName}</Text>
            <Text style={styles.bodyText}>{item.documentName}</Text>
            <View style={styles.metaRow}>
              <StatusBadge status={item.status} />
              <Text style={styles.muted}>Expiry: {item.expiryDate || "Not set"}</Text>
            </View>
            {!!item.description && <Text style={styles.bodyText}>{item.description}</Text>}
            <ImageStrip state={state} imageIds={item.imageIds || []} />
          </View>
          <Switch
            value={item.status === "Active"}
            onValueChange={(active) =>
              onCommit({
                ...state,
                documentRecords: state.documentRecords.map((record) =>
                  record.id === item.id ? { ...record, status: active ? "Active" : "In-Active" } : record
                )
              })
            }
          />
        </View>
      ))}
      {visible.length === 0 && <EmptyState icon="folder-open-outline" title="No records yet" text="Add your first document record to start tracking expiries." />}
      <RecordEditor
        state={state}
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(record, images) => {
          const duplicate = findDuplicateDocumentRecord(state.documentRecords, record);
          if (duplicate) {
            Alert.alert("Duplicate document", "The same active entity and document already exists.");
            return;
          }
          onCommit({
            ...state,
            images: [...state.images, ...images],
            documentRecords: [...state.documentRecords, record]
          });
          setModalOpen(false);
        }}
      />
    </View>
  );
}

function RecordEditor({ state, visible, onClose, onSave }) {
  const [entityId, setEntityId] = useState(state.entities[0]?.id || "");
  const [documentTypeId, setDocumentTypeId] = useState(state.documentTypes[0]?.id || "");
  const [expiryDate, setExpiryDate] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Image access needed", "Allow image access to attach document photos.");
      return;
    }
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8
    });
    if (picked.canceled) {
      return;
    }
    const asset = picked.assets[0];
    const id = createId("image");
    const ext = asset.uri.split(".").pop() || "jpg";
    const target = `${FileSystem.documentDirectory}${id}.${ext}`;
    await FileSystem.copyAsync({ from: asset.uri, to: target });
    setImages([...images, { id, uri: target, originalName: asset.fileName || `${id}.${ext}` }]);
  }

  function save() {
    if (!entityId || !documentTypeId || !expiryDate.trim()) {
      Alert.alert("Record incomplete", "Select entity, document, and expiry date.");
      return;
    }
    onSave(
      {
        id: createId("document-record"),
        entityId,
        documentTypeId,
        expiryDate: expiryDate.trim(),
        description: description.trim(),
        imageIds: images.map((image) => image.id),
        status: "Active"
      },
      images
    );
    setExpiryDate("");
    setDescription("");
    setImages([]);
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.modalHeader}>
            <Text style={styles.sectionTitle}>New Document Record</Text>
            <IconOnlyButton icon="close" label="Close" onPress={onClose} />
          </View>
          <View style={styles.panel}>
          <PickerLike
            label="Entity"
            value={entityId}
            options={state.entities.filter((entity) => entity.active).map((entity) => [entity.id, entity.name])}
            onChange={setEntityId}
          />
          <PickerLike
            label="Document"
            value={documentTypeId}
            options={state.documentTypes.filter((type) => type.active).map((type) => [type.id, type.name])}
            onChange={setDocumentTypeId}
          />
          <TextInput style={styles.input} value={expiryDate} placeholder="Expiry date YYYY-MM-DD" onChangeText={setExpiryDate} />
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            value={description}
            placeholder="Description"
            onChangeText={setDescription}
          />
          <FormRow>
            <IconButton icon="image-outline" label="Attach image" onPress={pickImage} />
            <IconButton icon="checkmark" label="Save record" onPress={save} />
          </FormRow>
          <ImageStrip state={{ images }} imageIds={images.map((image) => image.id)} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function ReportsScreen({ state, onCommit }) {
  const report = buildExpiryReport(state);

  async function schedule() {
    const count = await scheduleExpiryNotifications(state);
    Alert.alert("Alerts scheduled", `${count} active expiry reminder${count === 1 ? "" : "s"} scheduled.`);
  }

  return (
    <View style={styles.screenStack}>
      <AdSlot label="Expiry report advertisement slot" />
      <View style={styles.panel}>
        <SectionHeader title="Expiry Report" subtitle={`Documents expiring within ${state.profile.alertDays} days`} />
        {report.length === 0 ? (
          <EmptyState icon="checkmark-done-circle-outline" title="All clear" text="There are no active documents in the current alert window." />
        ) : (
          report.map((item) => <RecordSummary key={item.id} item={item} />)
        )}
      </View>
      <IconButton icon="notifications-outline" label="Schedule local alerts" onPress={schedule} />
      <IconButton
        icon="open-outline"
        label="Check Play Store updates"
        onPress={() => Linking.openURL("market://details?id=com.docutrak.mobile").catch(() => Linking.openURL("https://play.google.com/store/apps/details?id=com.docutrak.mobile"))}
      />
    </View>
  );
}

function SettingsScreen({ state, onCommit, themeMode, onThemeModeChange }) {
  const [profile, setProfile] = useState(state.profile);

  async function saveProfile() {
    await onCommit({ ...state, profile });
    Alert.alert("Settings saved", "Language, alert days, and targeting fields were saved locally.");
  }

  async function backup() {
    const result = await exportBackup(state);
    await onCommit({ ...state, lastBackupAt: result.manifest.createdAt });
    Alert.alert("Backup ready", "Use the share sheet to save the backup to Google Drive.");
  }

  async function restore() {
    try {
      const payload = await importBackup();
      if (!payload) {
        return;
      }
      Alert.alert("Restore backup?", "This replaces local DocuTrak data on this phone.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore",
          style: "destructive",
          onPress: async () => {
            const restored = await replaceState(payload.data);
            onCommit(restored);
          }
        }
      ]);
    } catch (error) {
      Alert.alert("Restore failed", error.message);
    }
  }

  return (
    <View style={styles.screenStack}>
      <AdSlot label="Settings advertisement slot" />
      <View style={styles.panel}>
      <SectionHeader title="Profile" subtitle="Stored only on this phone." />
      <TextInput style={styles.input} value={profile.email} placeholder="Email ID" placeholderTextColor={md3.outline} onChangeText={(email) => setProfile({ ...profile, email })} />
      <TextInput
        style={styles.input}
        value={profile.language}
        placeholder="Language"
        placeholderTextColor={md3.outline}
        onChangeText={(language) => setProfile({ ...profile, language })}
      />
      <TextInput
        style={styles.input}
        value={String(profile.alertDays)}
        keyboardType="number-pad"
        placeholder="Alert days"
        placeholderTextColor={md3.outline}
        onChangeText={(alertDays) => setProfile({ ...profile, alertDays: Number(alertDays || 0) })}
      />
      </View>
      <View style={styles.panel}>
      <SectionHeader title="Presentation" subtitle="Inspired by Innovations IT: orange, light blue, and clean contrast." />
      <View style={styles.themeToggleRow}>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>{themeMode === "dark" ? "Dark mode" : "Light mode"}</Text>
          <Text style={styles.muted}>
            {themeMode === "dark" ? "Black surfaces with orange and light blue accents." : "White surfaces with the same brand accents."}
          </Text>
        </View>
        <Switch
          value={themeMode === "dark"}
          onValueChange={(enabled) => {
            const nextMode = enabled ? "dark" : "light";
            const nextProfile = { ...profile, themeMode: nextMode };
            onThemeModeChange(nextMode);
            setProfile(nextProfile);
            onCommit({ ...state, profile: nextProfile });
          }}
          thumbColor={themeMode === "dark" ? md3.primary : md3.surfaceContainerHighest}
          trackColor={{ false: md3.outlineVariant, true: md3.secondaryContainer }}
        />
      </View>
      </View>
      <View style={styles.panel}>
      <SectionHeader title="Ad Targeting Fields" subtitle="Used later if live ads are enabled." />
      <TextInput
        style={styles.input}
        value={profile.profession}
        placeholder="Profession"
        placeholderTextColor={md3.outline}
        onChangeText={(profession) => setProfile({ ...profile, profession })}
      />
      <TextInput style={styles.input} value={profile.country} placeholder="Country" placeholderTextColor={md3.outline} onChangeText={(country) => setProfile({ ...profile, country })} />
      <TextInput style={styles.input} value={profile.area} placeholder="Area" placeholderTextColor={md3.outline} onChangeText={(area) => setProfile({ ...profile, area })} />
      <IconButton icon="save-outline" label="Save settings" onPress={saveProfile} />
      </View>
      <View style={styles.panel}>
      <SectionHeader title="Backup" subtitle="Export or restore a local backup bundle." />
      <IconButton icon="cloud-upload-outline" label="Backup to Google Drive" onPress={backup} />
      <IconButton variant="secondary" icon="cloud-download-outline" label="Restore backup" onPress={restore} />
      {!!state.lastBackupAt && <Text style={styles.muted}>Last backup: {new Date(state.lastBackupAt).toLocaleString()}</Text>}
      </View>
    </View>
  );
}

function RecordSummary({ item }) {
  return (
    <View style={styles.summaryRow}>
      <View style={styles.summaryIcon}>
        <Ionicons name={item.daysRemaining <= 7 ? "alert-circle" : "time-outline"} size={20} color={item.daysRemaining <= 7 ? md3.error : md3.primary} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{item.documentType?.name || item.documentName}</Text>
        <Text style={styles.bodyText}>{item.entity?.name || item.entityName}</Text>
        <Text style={styles.muted}>{item.daysRemaining} day{item.daysRemaining === 1 ? "" : "s"} remaining | {item.expiryDate}</Text>
      </View>
    </View>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {!!subtitle && <Text style={styles.muted}>{subtitle}</Text>}
    </View>
  );
}

function SearchBox({ value, onChangeText }) {
  return (
    <View style={styles.searchBox}>
      <Ionicons name="search" size={18} color={md3.outline} />
      <TextInput
        style={styles.searchInput}
        value={value}
        placeholder="Search"
        placeholderTextColor={md3.outline}
        onChangeText={onChangeText}
      />
    </View>
  );
}

function EmptyState({ icon, title, text }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name={icon} size={30} color={md3.primary} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

function StatusBadge({ status }) {
  const active = status === "Active";
  return (
    <View style={[styles.badge, active ? styles.badgeActive : styles.badgeInactive]}>
      <Text style={[styles.badgeText, active ? styles.badgeTextActive : styles.badgeTextInactive]}>{status}</Text>
    </View>
  );
}

function PickerLike({ label, value, options, onChange, compact }) {
  return (
    <View style={compact ? styles.pickerCompact : styles.pickerBlock}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {options.map(([id, name]) => (
          <Pressable key={id} style={[styles.choice, value === id && styles.choiceActive]} onPress={() => onChange(id)}>
            <Text style={[styles.choiceText, value === id && styles.choiceTextActive]}>{name}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function ImageStrip({ state, imageIds }) {
  const images = imageIds
    .map((id) => state.images.find((image) => image.id === id))
    .filter(Boolean);
  if (images.length === 0) {
    return null;
  }
  return (
    <ScrollView horizontal style={styles.imageStrip}>
      {images.map((image) => (
        <Image key={image.id} source={{ uri: image.uri }} style={styles.thumb} />
      ))}
    </ScrollView>
  );
}

function FormRow({ children }) {
  return <View style={styles.formRow}>{children}</View>;
}

function IconButton({ icon, label, onPress, variant = "primary" }) {
  return (
    <Pressable style={[styles.button, variant === "secondary" && styles.buttonSecondary]} onPress={onPress} accessibilityLabel={label}>
      <Ionicons name={icon} size={18} color={variant === "secondary" ? md3.primary : md3.onPrimary} />
      <Text style={[styles.buttonText, variant === "secondary" && styles.buttonTextSecondary]}>{label}</Text>
    </Pressable>
  );
}

function IconOnlyButton({ icon, label, onPress }) {
  return (
    <Pressable style={styles.iconOnlyButton} onPress={onPress} accessibilityLabel={label}>
      <Ionicons name={icon} size={21} color={md3.onSurface} />
    </Pressable>
  );
}

function BottomTabs({ active, onNavigate }) {
  const items = [
    screens[0],
    screens[4],
    screens[5],
    screens[6]
  ];
  return (
    <View style={styles.bottomTabs}>
      {items.map((item) => {
        const selected = active === item.key;
        return (
          <Pressable key={item.key} style={styles.tabItem} onPress={() => onNavigate(item.key)}>
            <View style={[styles.tabIndicator, selected && styles.tabIndicatorActive]}>
              <Ionicons name={item.icon} size={21} color={selected ? md3.onSecondaryContainer : md3.onSurfaceVariant} />
            </View>
            <Text style={[styles.tabText, selected && styles.tabTextActive]}>{item.title}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function AdSlot({ label }) {
  return (
    <View style={styles.adSlot}>
      <Ionicons name="megaphone-outline" size={16} color={md3.adText} />
      <Text style={styles.adText}>{label}</Text>
    </View>
  );
}

function createStyles(md3) {
return StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: md3.surfaceContainerLow
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: md3.surface,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  brand: {
    color: md3.primary,
    fontSize: 13,
    fontWeight: "800"
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: "800",
    color: md3.onSurface
  },
  platformPill: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: md3.secondaryContainer
  },
  platformText: {
    fontSize: 12,
    color: md3.onSecondaryContainer,
    fontWeight: "700"
  },
  content: {
    padding: 16,
    paddingBottom: 96,
    gap: 14
  },
  screenStack: {
    gap: 14
  },
  heroPanel: {
    backgroundColor: md3.surfaceContainerLowest,
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: md3.outlineVariant,
    shadowColor: md3.onSurface,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    gap: 10
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: md3.primaryContainer,
    alignItems: "center",
    justifyContent: "center"
  },
  heroTitle: {
    fontSize: 25,
    lineHeight: 31,
    fontWeight: "900",
    color: md3.onSurface
  },
  heroText: {
    color: md3.onSurfaceVariant,
    fontSize: 15,
    lineHeight: 21
  },
  heroActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 4
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  stat: {
    flexGrow: 1,
    flexBasis: "45%",
    backgroundColor: md3.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: md3.outlineVariant,
    borderRadius: 20,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: md3.secondaryContainer,
    alignItems: "center",
    justifyContent: "center"
  },
  statValue: {
    fontSize: 22,
    fontWeight: "900",
    color: md3.primary
  },
  statLabel: {
    color: md3.onSurfaceVariant,
    fontWeight: "700"
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  navTile: {
    flexBasis: "47%",
    flexGrow: 1,
    minHeight: 112,
    borderRadius: 24,
    backgroundColor: md3.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: md3.outlineVariant,
    padding: 14,
    justifyContent: "space-between",
    shadowColor: md3.onSurface,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1
  },
  navIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: md3.secondaryContainer,
    alignItems: "center",
    justifyContent: "center"
  },
  navText: {
    fontSize: 15,
    fontWeight: "800",
    color: md3.onSurface
  },
  panel: {
    backgroundColor: md3.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: md3.outlineVariant,
    borderRadius: 24,
    padding: 16,
    gap: 10
  },
  sectionHeader: {
    gap: 3,
    marginBottom: 2
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: md3.onSurface
  },
  input: {
    backgroundColor: md3.surfaceContainerLow,
    borderWidth: 1,
    borderColor: md3.outlineVariant,
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 15,
    color: md3.onSurface,
    flex: 1,
    marginBottom: 10
  },
  textArea: {
    minHeight: 92,
    textAlignVertical: "top"
  },
  formRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap"
  },
  actionBar: {
    backgroundColor: md3.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: md3.outlineVariant,
    borderRadius: 24,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap"
  },
  button: {
    minHeight: 44,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: md3.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginBottom: 10
  },
  buttonSecondary: {
    backgroundColor: md3.secondaryContainer,
    borderWidth: 1,
    borderColor: md3.secondaryContainer
  },
  buttonText: {
    color: md3.onPrimary,
    fontWeight: "800"
  },
  buttonTextSecondary: {
    color: md3.onSecondaryContainer
  },
  iconOnlyButton: {
    width: 42,
    height: 42,
    borderRadius: 20,
    backgroundColor: md3.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: md3.outlineVariant,
    alignItems: "center",
    justifyContent: "center"
  },
  listRow: {
    backgroundColor: md3.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: md3.outlineVariant,
    borderRadius: 24,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10
  },
  cardRow: {
    backgroundColor: md3.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: md3.outlineVariant,
    borderRadius: 24,
    padding: 14,
    flexDirection: "row",
    gap: 10
  },
  rowText: {
    flex: 1,
    gap: 3
  },
  rowTitle: {
    color: md3.onSurface,
    fontSize: 16,
    fontWeight: "900"
  },
  bodyText: {
    color: md3.onSurfaceVariant,
    fontSize: 14
  },
  muted: {
    color: md3.onSurfaceVariant,
    fontSize: 13
  },
  summaryRow: {
    borderWidth: 1,
    borderColor: md3.outlineVariant,
    borderRadius: 20,
    padding: 12,
    gap: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: md3.surfaceContainerLow
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: md3.secondaryContainer,
    alignItems: "center",
    justifyContent: "center"
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap"
  },
  pickerBlock: {
    marginBottom: 10,
    gap: 6
  },
  pickerCompact: {
    flex: 1,
    minWidth: 180,
    marginBottom: 10,
    gap: 6
  },
  label: {
    color: md3.onSurfaceVariant,
    fontWeight: "800",
    fontSize: 13
  },
  choice: {
    borderWidth: 1,
    borderColor: md3.outlineVariant,
    borderRadius: 999,
    backgroundColor: md3.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginRight: 8
  },
  choiceActive: {
    backgroundColor: md3.secondaryContainer,
    borderColor: md3.secondaryContainer
  },
  choiceText: {
    color: md3.onSurfaceVariant,
    fontWeight: "700"
  },
  choiceTextActive: {
    color: md3.onSecondaryContainer
  },
  adSlot: {
    minHeight: 42,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: md3.adBorder,
    backgroundColor: md3.adBackground,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  adText: {
    color: md3.adText,
    fontWeight: "700",
    flex: 1
  },
  imageStrip: {
    marginTop: 8
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 14,
    marginRight: 8,
    backgroundColor: md3.surfaceContainerHighest
  },
  divider: {
    height: 1,
    backgroundColor: md3.outlineVariant,
    marginVertical: 8
  },
  searchBox: {
    minHeight: 48,
    borderRadius: 28,
    backgroundColor: md3.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: md3.surfaceContainerHigh,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  searchInput: {
    flex: 1,
    color: md3.onSurface,
    fontSize: 15,
    paddingVertical: 10
  },
  emptyState: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: md3.outlineVariant,
    backgroundColor: md3.surfaceContainerLowest,
    padding: 18,
    alignItems: "center",
    gap: 7
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: md3.onSurface
  },
  emptyText: {
    color: md3.onSurfaceVariant,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4
  },
  badgeActive: {
    backgroundColor: md3.secondaryContainer
  },
  badgeInactive: {
    backgroundColor: md3.surfaceContainer
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "900"
  },
  badgeTextActive: {
    color: md3.onSecondaryContainer
  },
  badgeTextInactive: {
    color: md3.onSurfaceVariant
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4
  },
  themeToggleRow: {
    minHeight: 76,
    borderRadius: 20,
    backgroundColor: md3.surfaceContainerLow,
    borderWidth: 1,
    borderColor: md3.outlineVariant,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  bottomTabs: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 10,
    minHeight: 64,
    borderRadius: 28,
    backgroundColor: md3.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: md3.outlineVariant,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    shadowColor: md3.onSurface,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    minHeight: 56
  },
  tabIndicator: {
    minWidth: 56,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  tabIndicatorActive: {
    backgroundColor: md3.secondaryContainer
  },
  tabText: {
    color: md3.onSurfaceVariant,
    fontSize: 11,
    fontWeight: "800"
  },
  tabTextActive: {
    color: md3.primary
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 86,
    minHeight: 56,
    borderRadius: 16,
    paddingHorizontal: 18,
    backgroundColor: md3.primaryContainer,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: md3.onSurface,
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6
  },
  fabText: {
    color: md3.onPrimaryContainer,
    fontWeight: "900",
    fontSize: 14
  }
});
}
