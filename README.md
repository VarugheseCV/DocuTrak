# DocuTrak Mobile

Android-first Expo React Native app for tracking document expiry dates.

## What v1 Includes

- Local-first document tracking for entities, document types, expiry dates, descriptions, images, and active/inactive status.
- Seed data from `Mobile_Application.docx`.
- Dashboard, entity types, entities, documents, data entry, reports, backup, and settings.
- Duplicate prevention for the same active entity plus document pair.
- Local notification scheduling based on the user's alert-day setting.
- Manual backup/restore bundle that can be shared to Google Drive from the Android share sheet.
- Reserved ad slots without live ad-network integration.

## Apple Support

iOS remains possible through Expo, but App Store publishing is intentionally deferred until the Apple Developer Program cost is justified.

## Run

```bash
npm.cmd install
npm.cmd run android
```

## Test

```bash
npm.cmd test
```
