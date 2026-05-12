# DocuTrak UI/UX Liquid Glass Improvement Plan

Last updated: 2026-05-13

## Goal

Evolve DocuTrak from a solid "premium dark" mobile UI into a polished liquid glass experience while improving real workflows: adding documents, scanning expiry risk, editing entities, restoring backups, and reviewing attached images.

The target feel is calm, trustworthy, and high-end. Liquid glass should support clarity, not compete with document data.

## Current UI/UX Review

### What Works Well

- The app has a strong dark visual base with clear status colors for healthy, expiring, and expired records.
- The dashboard already gives users fast answers through a hero banner, stats, quick actions, and prioritized document lists.
- Inline creation of entity/document types reduces form friction.
- Swipe actions keep list rows clean.
- Empty states are present and guide first-time use.
- Existing dependencies already include `expo-blur` and `expo-linear-gradient`, so the app can support a glass system without adding a large visual dependency.

### Main Problems To Fix

- Visual style is inconsistent: gradients, opaque cards, shadows, chips, settings groups, and form inputs all use slightly different surface rules.
- The current look is mostly opaque card UI, not liquid glass. There is little translucency, layered depth, edge highlight, or background refraction.
- Many validation errors still use blocking native alerts, which interrupts form entry.
- Success feedback is quiet. Users save or restore data without a lightweight confirmation pattern.
- Swipe gestures are useful but under-discoverable.
- Settings feels functional but not premium; it needs clearer grouping and better controls.
- The image detail experience is too limited for document photos. Users need tap-to-view, zoom, and clearer attachment affordances.
- Accessibility coverage is thin: icon buttons and swipe actions need explicit labels, roles, and hints.

## Liquid Glass Design Direction

### Visual Principles

- Use a deep, low-noise background with subtle layered light, not decorative blobs.
- Build glass from four ingredients: translucent fill, blur, hairline border, soft highlight, and restrained shadow.
- Keep document information readable first. Glass intensity should reduce when content density increases.
- Use status color as small, precise accents rather than flooding whole cards.
- Prefer consistent reusable surfaces over custom per-screen styling.

### Proposed Token Additions

Add these concepts to `src/theme/theme.js`:

- `glassFill`: translucent surface fill for major panels.
- `glassFillStrong`: slightly more opaque fill for forms and dense lists.
- `glassBorder`: high-edge border for glass surfaces.
- `glassHighlight`: top/inner highlight color.
- `glassShadow`: soft depth color.
- `backdropTint`: screen-level overlay tint for dark/light modes.
- `dangerGlass`, `warningGlass`, `successGlass`: status-tinted translucent fills.

Dark theme should stay the primary personality. Light mode should become frosted and clean, not flat white.

### Proposed Shared Components

- `GlassSurface`: reusable wrapper using `BlurView`, translucent fill, border, optional gradient highlight, and Android fallback opacity.
- `GlassButton`: icon-first button treatment for header actions, form toggles, and quick actions.
- `GlassListItem`: dense list row with status rail, icon well, swipe affordance, and consistent hit targets.
- `GlassTextInput`: input wrapper with focused, error, disabled, and helper text states.
- `Toast`: lightweight success/error confirmation for save, delete, backup, restore.
- `ConfirmSheet`: branded bottom-sheet confirmation replacing destructive native alerts where practical.
- `ImageViewerModal`: full-screen image preview with zoom-ready layout and document metadata.

## UX Improvement Plan

### Phase 1: Foundation

1. Define glass tokens in `src/theme/theme.js`.
2. Add `GlassSurface`, `GlassButton`, `GlassTextInput`, and `Toast`.
3. Replace repeated opaque card styles in dashboard components with shared glass surfaces.
4. Add accessibility defaults to shared touch components.
5. Keep Android performance safe with a reduced-blur fallback when necessary.

Acceptance criteria:

- Dashboard renders with a coherent glass system in dark and light themes.
- Existing spacing and text hierarchy remain readable.
- No new UI dependency is needed beyond current Expo packages.

### Phase 2: Dashboard Refresh

1. Rebuild `HeroBanner` as a glass status panel with a subtle gradient wash and clearer priority copy.
2. Convert `StatsRow` to compact glass metrics with consistent status accents.
3. Redesign `QuickActions` as icon-first glass buttons.
4. Convert `DocumentCard` to `GlassListItem` with a small swipe hint.
5. Add dashboard list caps for large expired/expiring sets and provide a clear "view all" route later when report/list filtering exists.

Acceptance criteria:

- The dashboard communicates "what needs action now" within the first viewport.
- Expired and expiring records remain visually distinct without overwhelming the screen.
- Swipe actions are discoverable without cluttering every row.

### Phase 3: Forms And Data Entry

1. Replace form `Alert.alert` validation with inline errors for required fields and duplicates.
2. Use `GlassTextInput` for entity name, type name, notes, and date display.
3. Convert horizontal chips into segmented glass pills with selected, unselected, and disabled states.
4. Add save/loading state to prevent double taps while images are copying.
5. Add toast confirmation after successful save.
6. Make image upload clearer: empty, selected, replace, and remove states.

Acceptance criteria:

- Users can fix form mistakes without losing context.
- Save actions feel responsive and confirm completion.
- Form controls look related across Add Entity and Add Document.

### Phase 4: Entity And Document Detail

1. Refresh `EntityDetailScreen` rows using `GlassListItem`.
2. Redesign `DocumentDetailScreen` around a glass summary panel, image panel, notes panel, and sticky action bar.
3. Make document images tappable and open `ImageViewerModal`.
4. Add clearer destructive action confirmation with `ConfirmSheet`.
5. Surface computed status with a compact badge and relative expiry text.

Acceptance criteria:

- A user can inspect the most important document facts quickly.
- Attached images are readable enough to be useful.
- Edit/delete actions feel intentional and safe.

### Phase 5: Settings And Backup UX

1. Convert settings groups to glass panels with consistent row styling.
2. Replace the alert-days plus/minus-only control with a slider plus stepper or numeric entry.
3. Add visible backup/restore progress states.
4. Show toast confirmation for successful backup and restore.
5. Improve App Lock copy and disabled states when biometric hardware is unavailable.

Acceptance criteria:

- Settings feels premium but still operational.
- Backup and restore states are less ambiguous.
- Security controls communicate availability and consequence clearly.

### Phase 6: Onboarding And Empty States

1. Restyle onboarding with glass panels, calmer icon treatment, and clearer next-step flow.
2. Add a first-run path that guides users from onboarding to creating an entity, then adding a document.
3. Refresh empty states with glass-friendly icon wells and action buttons.

Acceptance criteria:

- First-time users know what to do next.
- Empty states look intentional, not like missing data.

## Accessibility And Usability Requirements

- Add `accessibilityRole`, `accessibilityLabel`, and `accessibilityHint` to icon-only and swipe-related controls.
- Maintain minimum 44 x 44 touch targets.
- Preserve contrast against glass backgrounds in both themes.
- Avoid relying on blur/color alone to communicate status.
- Add `numberOfLines` and predictable layout constraints for names, dates, and long document types.
- Keep animations short and optional-feeling; no workflow should depend on motion.

## Performance Requirements

- Use blur sparingly on scrolling rows; prefer translucent fallback surfaces for repeated list items if blur causes jank.
- Use `BlurView` mainly for headers, hero panels, modals, and grouped surfaces.
- Avoid animating expensive blur properties.
- Keep shadows modest on Android, where elevation and translucent layers can get heavy.
- Verify dashboard, entity list, document detail, and settings on a small Android viewport.

## Suggested Implementation Order

1. Theme tokens and shared glass components.
2. Dashboard components.
3. Form components and inline validation.
4. Detail screens and image viewer.
5. Settings and backup feedback.
6. Onboarding and empty states.
7. Accessibility audit and visual QA pass.

## QA Checklist

- `npm.cmd test`
- Android bundle/export sanity check.
- Manual pass through onboarding, add entity, add document, edit document, delete document, backup, restore, app lock toggle.
- Dark and light theme screenshots.
- Small-screen check for long entity/document names.
- Check touch target sizes and screen-reader labels for icon-only buttons.
- Confirm no text overlaps glass highlights or footer action bars.

## Non-Goals For The First UI Pass

- Do not build a marketing landing page.
- Do not add live ad-network integration.
- Do not add authentication or cloud sync.
- Do not add a full reports feature unless needed to support "view all" navigation.
- Do not use decorative orbs or heavy abstract backgrounds.

## Success Definition

The UI pass is successful when DocuTrak feels like one coherent liquid glass app, not a collection of styled screens, and the core tasks become easier: users can see urgency, add records, trust saves/backups, and inspect document images with less friction.
