# mobile_app — Progress Log

Expo SDK 54 (`default@sdk-54`) React Native app that shares the existing
Node.js/Express + MongoDB JWT backend in `server/` with the Vite web client in
`client/`. **No Firebase.** `client/` is read-only reference.

## Discovered backend contract (source of truth)

Base URL: `https://industrial-ai-dig7.onrender.com/api/v1` (Render free tier — may cold start).

| Concern | Value |
| --- | --- |
| Auth middleware | `server/middlewares/auth.js` — already accepts `Authorization: Bearer <token>` (cookie checked first, Bearer fallback). |
| JWT payload | `{ id: <userId> }` signed with `config.jwt.secret`, `expiresIn: 30d` (`server/services/authService.js`). |
| Login/Register response | `{ success: true, data: { user, accessToken } }` — token field name is **`accessToken`**. |
| Current user | `GET /auth/me` → `{ success, data: <user> }`. Update: `PUT /auth/me`. |
| User fields (sanitized) | `_id, name, email, role, department, avatar, provider, isEmailVerified, createdAt, updatedAt` (`server/utils/filePaths.js#sanitizeUserForResponse`). |
| Documents | `GET /documents` → **`{ success, data: { data: Document[], pagination: { page, limit, total, pages } } }`** (nested — `BaseRepository.findAll` returns `{ data, pagination }`, then the controller wraps it again in `data`); `GET /documents/:id`; `DELETE /documents/:id`. |
| Upload document | `POST /documents/upload` — Multer field name **`file`** + text fields `title`, `description`. |
| Profile image | `POST /documents/profile-image` — Multer field **`image`**. |
| Analytics metrics | `GET /analytics/metrics` → `{ totalLogins, activeUsers, totalDocuments, uploadsToday, viewsThisWeek }`. |
| Analyze PDF | `POST /analytics/analyze-document` — Multer field **`document`** (PDF only) → `{ summary, pieChartData[], growthAndDegradationData[] }`. |
| AI chat | `POST /ai/chat` with `{ prompt, documentId }`. |
| Health | `GET /health`. |

Client theme tokens (`client/src/styles/globals.css`): primary `#1b4d8c`, primary-dark `#0f2d54`, accent `#f97316`, sidebar `#0f172a`, sidebar-hover `#1e293b`, sidebar-active `#1b4d8c`, background `#f1f5f9`, muted `#64748b`, border `#e2e8f0`, success `#22c55e`, warning `#eab308`, destructive `#ef4444`.

Left-sidebar navigation (`client/src/components/navigation/Sidebar.jsx`): Dashboard, Documents, Upload, AI Assistant, Analytics, Notifications, Users, Settings, Profile.

## Step checklist

- [x] **Step 0** — Create this `mobile_app/PROGRESS.md`.
- [x] **Step 1** — Expo SDK 54 deps + `.env`.
- [x] **Step 2** — Backend compatibility (Bearer ✓, CORS no-Origin, `lastLogin*`).
- [x] **Step 3** — `services/api.ts` + AuthContext.
- [x] **Step 4** — Drawer & screens + typecheck.

### Round 2 — Bug fixes & feature round (this request)

Constraints: do NOT touch `client/`; do NOT remove existing animations or `ServerWakeBanner`; stay **100% Expo Go compatible** (no `react-native-keyboard-controller`, no custom native dev build). Update this file after every numbered step.

- [x] **R2-Step 1** — Fix documents not displaying after upload.
- [x] **R2-Step 2** — Keyboard overlap fix + smooth Reanimated keyboard animation.
- [x] **R2-Step 3** — Profile image upload & avatar rendering.
- [x] **R2-Step 4** — Full dark mode support.
- [x] **R2-Step 5** — Verify (`tsc` + `expo lint`).

---

## Step 0 — Checkpointing bootstrap
**Status:** [x] Done

- Files created:
  - `mobile_app/PROGRESS.md` — this file (continuous handoff log).
- Backend facts recorded above.
- Next step: Step 1 (install deps in `mobile_app/`).

---

## Step 1 — Expo SDK 54 Dependencies & Environment
**Status:** [x] Done

- Command run: `npx expo install @react-navigation/drawer react-native-reanimated react-native-worklets react-native-gesture-handler expo-secure-store expo-document-picker expo-haptics`
  - Result: `6 SDK 54 native modules + 1 other package` installed. `added 4 packages, audited 928` (the rest were already pinned in `package.json`).
- Files created/modified:
  - `mobile_app/package.json` — added `@react-navigation/drawer@^7.14.5`, `expo-document-picker@~14.0.8`, `expo-secure-store@~15.0.8`. Already present & unchanged: `react-native-reanimated@~4.1.1`, `react-native-worklets@0.5.1`, `react-native-gesture-handler@~2.28.0`, `expo-haptics@~15.0.8`.
  - `mobile_app/app.json` — CLI auto-added the `"expo-secure-store"` config plugin to `plugins[]`. Left `expo-router` + `expo-splash-screen` intact.
  - `mobile_app/.env` — `EXPO_PUBLIC_API_URL=https://industrial-ai-dig7.onrender.com/api/v1` (create-only; no secrets).
- Isolation: `mobile_app/package.json` untouched by `client/` and `server/`; each keeps its own `node_modules`/lockfile.
- Package versions are SDK-54 resolved (all good for Reanimated 4 + worklets).
- Chrome plugin requirement: `react-native-reanimated/plugin` is **not** needed to be added manually — SDK 54's `babel-preset-expo` auto-includes it via `react-native-worklets`. No `babel.config.js` was required (none present in `mobile_app/`).
- Next step: Step 2 — verify/adjust `server/` for mobile (Bearer ✓ already, CORS no-Origin, `lastLogin*` schema fields).

---

## Step 2 — Minimal Backend Compatibility Check
**Status:** [x] Done

Findings + changes (all in `server/`, no `client/` touched, no Firebase):

1. **Bearer auth — already compliant, no change.** `server/middlewares/auth.js` reads `req.cookies.accessToken` first, then falls back to `Authorization: Bearer <token>`. Mobile sends the Bearer header.
2. **JWT in JSON body — already compliant.** `POST /auth/login` & `POST /auth/register` respond `{ success, data: { user, accessToken } }`. Mobile stores `data.accessToken` in SecureStore. Token field = `accessToken`; JWT payload = `{ id }`.
3. **CORS no-Origin — CHANGED.** `server/app.js` previously used `origin: allowedOrigins` (array), which yields no `Access-Control-Allow-Origin` header when the request has no `Origin` (native apps/curl). Replaced with an `origin` **function**: `if (!origin) return callback(null, true)` then `callback(null, allowedOrigins.includes(origin))`. Vercel + localhost rules preserved; disallowed browser origins still get no ACAO header (same as before).
4. **User schema — CHANGED.** Added to `server/models/User.js`:
   - `lastLoginAt: { type: Date, default: null }`
   - `lastLoginPlatform: { type: String, enum: ['web', 'mobile'], default: 'web' }`
5. **Login tracking — CHANGED.** New `authService.recordLogin(userId, platform)` (`server/services/authService.js`, also added to default export) normalizes `platform === 'mobile' ? 'mobile' : 'web'` and sets both fields via `UserRepository.updateById`. `authController.login` calls `await authService.recordLogin(user._id || user.id, req.headers['x-platform'] || 'web')` after a successful login. Mobile's API client sends `x-platform: mobile`; anything else defaults to `web`.
   - `sanitizeUserForResponse` strips secrets only; `lastLoginAt`/`lastLoginPlatform` are returned as-is to clients (additive, no breaking change).

- **Does `server/` need to be pushed to Render? YES.** The mobile client targets `https://industrial-ai-dig7.onrender.com/api/v1` (Render free tier), so the CORS no-Origin handler and the `lastLoginAt`/`lastLoginPlatform` tracking only take effect after Render redeploys. Auth/documents/analytics already worked with Bearer, but push to realise Step 2 features.
- Verification: IDE diagnostics on all three edited files → **0 errors**.
- Next step: Step 3 — `mobile_app/services/api.ts` (Bearer + `x-platform: mobile` auto-attach, SecureStore token, >3s slow-request tracking) and the AuthContext.

---

## Step 3 — Centralized API & Auth Layer
**Status:** [x] Done

Files created (all under `mobile_app/`):
- `services/api.ts` — Single API client. Exports `API_URL` (from `EXPO_PUBLIC_API_URL`), `SLOW_REQUEST_MS = 3000`, `tokenStore` (SecureStore key `industrial_ai_token`), `subscribeToSlowRequests()`, `ApiError`, and typed endpoint groups. The internal `request<T>()` helper **auto-attaches `Authorization: Bearer <token>`** from SecureStore and always sends **`x-platform: mobile`**; for `auth: false` (login/register) no token is sent. JSON bodies set `Content-Type: application/json`; multipart bodies pass `FormData` and let `fetch` set the boundary. A `setTimeout(3000)` increments a global slow-counter → notifies subscribers (Render cold-start banner).
  - `authApi`: `login`/`register` → `POST /auth/login`|`/auth/register` (returns `{ token: data.accessToken, user: data.user }`), `me` → `GET /auth/me`, `updateProfile` → `PUT /auth/me`, `logout` → `POST /auth/logout`.
  - `documentsApi`: `list` `GET /documents`, `getById` `GET /documents/:id`, `upload` `POST /documents/upload` (FormData), `remove` `DELETE /documents/:id`.
  - `analyticsApi`: `metrics` `GET /analytics/metrics`, `analyzePdf` `POST /analytics/analyze-document` (FormData).
  - `aiApi`: `chat(prompt, documentId)` `POST /ai/chat` → `data.text`.
  - Types: `ApiUser`, `AuthResult`, `ApiDocument`, `AnalyticsMetrics`, `PieDatum`, `GrowthDatum`, `AnalysisResult`, `RegisterPayload`.
- `hooks/use-server-wake.ts` — `useServerWake()` subscribes to the slow-request bus, returns `boolean`.
- `components/ServerWakeBanner.tsx` — Orange "Waking up server…" banner (ActivityIndicator + cloud icon) shown when `useServerWake()` is true.
- `context/AuthContext.tsx` — `AuthProvider` + `useAuth()`. On launch `restoreSession()` reads the SecureStore token and validates it via `authApi.me()` (auto-login across restarts); on failure it clears SecureStore and falls back to auth screens. `signIn`/`signUp` persist token + set user and fire `Haptics.notificationAsync(Success)`. `signOut` calls `POST /auth/logout` (best-effort) then clears SecureStore. Exposes `{ user, token, loading, isAuthenticated, signIn, signUp, signOut, refreshUser }`.
- `components/ui/Screen.tsx` — Shared screen shell: `SafeAreaView` (edges left/right) + `ScrollView` with `<RefreshControl>` + `<ServerWakeBanner>` + optional title/subtitle header.
- `components/ui/primitives.tsx` — `Card`, `SectionTitle`, `PrimaryButton` (primary/ghost/danger, loading, icon), `TextField`, `StatCard`, `Badge`, `EmptyState`.
- `app/login.tsx` — Login in `KeyboardAvoidingView` + `ScrollView keyboardShouldPersistTaps="handled"`; email/password; error box; calls `signIn`; link to `/register`.
- `app/register.tsx` — Register (name/email/password/confirm) with min-6 + match validation; calls `signUp`; link to `/login`.

Files modified (`mobile_app/`):
- `app/_layout.tsx` — Rewrote. `unstable_settings = { anchor: '(drawer)' }`; app wrapped in `GestureHandlerRootView` + `AuthProvider`; while `loading` shows a spinner; then a `Stack` with `Stack.Protected guard={isAuthenticated}` → `(drawer)` and `Stack.Protected guard={!isAuthenticated}` → `login`/`register`. Imports `'react-native-reanimated'` first.
- `constants/theme.ts` — Added `AppPalette` mirroring the web tokens (primary `#1b4d8c`, primaryDark `#0f2d54`, sidebar `#0f172a`, sidebarHover `#1e293b`, sidebarActive `#1b4d8c`, accent `#f97316`, background `#f1f5f9`, etc.).
- `constants/navigation.ts` — `DRAWER_ITEMS` (9 items) mirroring the web sidebar.

Notes:
- **No `babel.config.js` needed**: SDK 54's `babel-preset-expo` auto-includes the Reanimated/worklets plugin.
- **Server push**: irrelevant to Step 3 (client-only), but Step 2's server changes still require a Render redeploy.
- Next step: Step 4 — drawer layout + screens.

---

## Step 4 — Hamburger Drawer & Screens
**Status:** [x] Done

Files created (all under `mobile_app/app/(drawer)/`):
- `_layout.tsx` — `expo-router/drawer` wrapped in `GestureHandlerRootView`. Custom `drawerContent` (`CustomDrawerContent`) uses `DrawerContentScrollView` + `usePathname()` active detection: brand header ("IAI / Industrial AI"), the 9 `DRAWER_ITEMS` sections, logged-in **user name + email** with avatar initial, and a **Logout** button that calls `signOut()` (clears SecureStore). Header is dark (`primaryDark`) with the default hamburger; `drawerStyle` uses the sidebar color; `Drawer.Screen` entries declared for all 9 routes.
- `index.tsx` (Dashboard) — `analyticsApi.metrics()` + `documentsApi.list()`; 4 `StatCard`s (Total Documents, Active Users, Uploads Today, Total Logins) + Recent Documents list; pull-to-refresh.
- `documents.tsx` — `documentsApi.list()`; upload CTA → `/upload`; per-card delete with `Alert` confirm (`documentsApi.remove`); pull-to-refresh.
- `upload.tsx` — `expo-document-picker` → `FormData` with Multer field **`file`** + `title` + `description` → `documentsApi.upload`; **`Haptics.NotificationFeedbackType.Success`** on success.
- `ai-chat.tsx` — Document chip selector (`documentsApi.list`) + chat thread + `KeyboardAvoidingView` input; `aiApi.chat(prompt, documentId)`; **haptics on AI response (analysis completion)**.
- `analytics.tsx` — `analyticsApi.metrics()` stat cards; PDF pick via `expo-document-picker` (`type: 'application/pdf'`) → `FormData` Multer field **`document`** → `analyticsApi.analyzePdf`; renders `summary`, pie breakdown (legend) and growth data as lightweight bar rows (no extra chart dep); **haptics on analysis completion**; pull-to-refresh.
- `notifications.tsx` — Static feed mirroring `client/src/pages/Notifications/Notifications.jsx` (no backend endpoint); pull-to-refresh.
- `users.tsx` — Static team list mirroring `client/src/pages/UserManagement/UserManagement.jsx` (no backend endpoint); pull-to-refresh.
- `settings.tsx` — Company name / email-notifications `Switch` / language / 2FA `Switch` / delete-account (mirrors web Settings); save haptic.
- `profile.tsx` — Avatar initial + name/email/role/department; `authApi.updateProfile` → `refreshUser()` on save; haptic.

Files deleted (default Expo template, only self-referenced):
- `app/(tabs)/{_layout,index,explore}.tsx`, `app/modal.tsx`, `components/{haptic-tab,hello-wave,parallax-scroll-view,themed-text,themed-view,external-link}.tsx`, `components/ui/{collapsible,icon-symbol,icon-symbol.ios}.tsx`, `hooks/{use-theme-color,use-color-scheme,use-color-scheme.web}.ts`.

Verification:
- `npx tsc --noEmit` → **exit 0 (no type errors)**.
- `npx expo lint` → **exit 0 (no lint errors)**.
- IDE diagnostics across the workspace → **0 errors**.

Handoff state: **All Steps 0–4 are complete.** Remaining action outside this repo: push the `server/` changes (Step 2) to Render so the live API reflects the CORS no-Origin handler and `lastLoginAt`/`lastLoginPlatform` tracking. The mobile app targets `https://industrial-ai-dig7.onrender.com/api/v1`.

---

## R2-Step 1 — Fix Documents Not Displaying After Upload
**Status:** [x] Done

**Root cause found:** `GET /api/v1/documents` returns a **doubly-nested** payload:
`{ success: true, data: { data: Document[], pagination: {...} } }`. Chain of evidence:
`server/controllers/documentController.js#getDocuments` → `res.json({ success, data: docs })`
where `server/services/documentService.js` → `DocumentRepository.findByUploader()` →
`server/repositories/BaseRepository.js#findAll` returns `{ data, pagination }`.
So `res.data` was an **object**, not an array → the list never rendered.

Files changed (all under `mobile_app/`; `client/` untouched):

1. `services/api.ts`
   - Added recursive helper `extractDocumentArray(payload)` that finds the first document array in
     a bare array, `{ data: [...] }`, `{ data: { documents: [...] } }`, `{ documents: [...] }`, etc.
     (walks `data`, `documents`, `items`, `results`, `list`, `payload`, `result`).
   - `documentsApi.list()` now `request<unknown>('/documents')` → `extractDocumentArray(res) ?? []`
     and is typed to always return `ApiDocument[]`. `getById`/`upload`/`remove` unchanged (their
     single-object `res.data` shape is correct).
2. `app/(drawer)/documents.tsx` — `useEffect` → **`useFocusEffect`** (from `expo-router`) so returning
   to the screen after an upload immediately refetches & displays the new document (no manual pull-to-refresh).
3. `app/(drawer)/index.tsx` — same `useEffect` → **`useFocusEffect`** so "Recent Documents" refreshes on focus.
4. `app/(drawer)/ai-chat.tsx` — same `useEffect` → **`useFocusEffect`** so the document chip selector refreshes on focus.
5. `app/(drawer)/upload.tsx` — verified Multer FormData: field **`file`** with RN descriptor
   `{ uri, name, type: file.mimeType }` + `title` + `description`. Upload errors now `console.warn('[upload] failed:', ...)`
   and surface the backend validation message via `setError(message)`.

Note: `client/src/services/api/documents.js` returns `response.data.data` for the same reason — confirming the nested shape.
- Next: R2-Step 2 — keyboard overlap fix + Reanimated keyboard animation.

---

## R2-Step 2 — Keyboard Overlap Fix + Smooth Reanimated Keyboard Animation
**Status:** [x] Done

Fully Expo-Go compatible: only React Native `Keyboard` events + `react-native-reanimated`.
**No** `react-native-keyboard-controller`, no native rebuild.

Files changed (all under `mobile_app/`):

1. **`hooks/use-animated-keyboard-height.ts` (NEW)** — Reanimated keyboard utilities:
   - `useAnimatedKeyboardHeight(extraOffset)` → `{ height, paddingStyle, liftStyle }`. Subscribes to
     `keyboardWillShow`/`keyboardWillHide` (iOS) and `keyboardDidShow`/`keyboardDidHide` (Android) and
     drives a `useSharedValue` via `withTiming`/`Easing.out(Easing.ease)`; `paddingStyle`
     (`paddingBottom: height + extraOffset`) and `liftStyle` (`translateY: -height`) are `useAnimatedStyle`s.
   - `KeyboardScrollContext` + `useKeyboardScrollTarget()` + `useKeyboardAwareScroll()` — a small
     scroll-view helper that keeps the focused input above the keyboard on Android via
     `scrollResponderScrollNativeHandleToKeyboard` (re-scrolled on `keyboardDidShow`). No native module.
2. **`components/ui/Screen.tsx`** — Uses `Animated.ScrollView`; Android gets the animated keyboard
   `paddingStyle` (base 40) on the content, iOS uses `automaticallyAdjustKeyboardInsets`. Keeps
   `keyboardShouldPersistTaps="handled"`; wraps children in `KeyboardScrollContext.Provider`.
3. **`components/ui/primitives.tsx`** — `TextField` now forwards focus to the enclosing screen's
   `setFocusedInput(findNodeHandle(input))` (Android only) so the focused field auto-scrolls into view.
4. **`app/(drawer)/ai-chat.tsx`** — Removed `KeyboardAvoidingView`; the chat container is now an
   `Animated.View` with the smooth keyboard `paddingStyle` so the input bar + send button glide up
   directly above the keyboard.
5. **`app/login.tsx`** & **`app/register.tsx`** — Removed `KeyboardAvoidingView`; `Animated.ScrollView`
   with the animated `paddingStyle` (Android) + `automaticallyAdjustKeyboardInsets` (iOS) + the
   keyboard-scroll context, so every focused `TextField` stays visible.
6. **`app/(drawer)/upload.tsx`** — Covered automatically: it renders `TextField`s inside `<Screen />`,
   so the title, description area and Upload button lift above the keyboard and auto-scroll on focus.
   No screen-specific code needed.
7. **`app/(drawer)/analytics.tsx`** — Renders inside `<Screen />`; the analyze button is covered by the
   shared animated padding. (No `TextInput` on this screen, so there is no overlap to fix.)

Notes: `Animated.ScrollView`'s ref is typed via `ComponentRef<typeof Animated.ScrollView>`.
`npx tsc --noEmit` → exit 0.
- Next: R2-Step 3 — profile image upload & avatar rendering.

---

## R2-Step 3 — Profile Image Upload & Avatar Rendering
**Status:** [x] Done

Dependency: ran `npx expo install expo-image-picker` inside `mobile_app/` → **`expo-image-picker@~17.0.11`**
(SDK-54 matched). No `app.json` config plugin needed for **Expo Go** (Expo Go bundles the photo-library
permissions); a production/dev build would need the plugin with `NSPhotoLibraryUsageDescription`.

Files changed (all under `mobile_app/`):

1. **`services/api.ts`**
   - Added `resolveAssetUrl(path?)` — prefixes relative paths (e.g. `/uploads/...`) with the server origin
     (`API_URL` with `/api/v1` stripped) and returns full `http(s)://` URLs unchanged.
   - Added `UploadableFile` type and `documentsApi.uploadProfileImage(file)` → `POST /documents/profile-image`
     with `FormData` under the Multer field **`image`** (`{ uri, name, type }`); returns the updated `ApiUser`.
2. **`app/(drawer)/profile.tsx`** — Shows the real avatar `<Image source={{ uri: resolveAssetUrl(user.avatar) }}>`
   (falls back to the name initial when empty) with a camera `Pressable` badge. `pickAvatar()` requests media
   library permission, launches the gallery with `mediaTypes: ['images']`, `allowsEditing: true`,
   `aspect: [1, 1]`, `quality: 0.8`, uploads via `uploadProfileImage`, calls `refreshUser()` and fires a success
   haptic (`Haptics.NotificationFeedbackType.Success`). Shows a spinner while uploading.
3. **`app/(drawer)/_layout.tsx`** — The drawer footer avatar now renders the uploaded `<Image>` when
   `resolveAssetUrl(user.avatar)` exists, else the initial. Added `avatarImage` style + `overflow: 'hidden'`.

Notes: server stores `avatar` as `/uploads/<filename>` (`server/utils/filePaths.js#normalizeStoredUploadPath`)
and serves `/uploads` via `express.static` (`server/app.js`), so `resolveAssetUrl` builds the correct URL.
`npx tsc --noEmit` → exit 0.
- Next: R2-Step 4 — full dark mode support.

---

## R2-Step 4 — Full Dark Mode Support
**Status:** [x] Done

Persisted `'light' | 'dark'` mode + dynamic palettes consumed via `useTheme()` so switching
updates the entire app immediately. No new native deps (reuses `expo-secure-store`).

Files changed (all under `mobile_app/`; `client/` untouched):

1. **`constants/theme.ts`** — Added `Palette` interface, `LightPalette` (the existing web tokens)
   and `DarkPalette` (deep-slate: bg `#0b1220`, cards `#111827`/`#1e293b`, border `#334155`,
   text `#f8fafc`, muted `#94a3b8`, primary `#3b82f6`, accent `#f97316`). Removed the now-unused
   static `AppPalette` alias (no component imports it anymore) and the unused `Colors`/`Fonts`.
2. **`context/ThemeContext.tsx` (NEW)** — `ThemeProvider` + `useTheme()` exposing
   `{ mode, colors, isDark, loading, toggleTheme, setMode }`. Mode persists across restarts via
   SecureStore key `industrial_ai_theme` on native / `localStorage` on web (mirrors `tokenStore`);
   initial default follows the system color scheme.
3. **`app/_layout.tsx`** — Wrapped the tree in `<ThemeProvider>` (outside `AuthProvider`). The
   loading spinner + Stack `contentStyle` use `colors`, and `<StatusBar style={isDark ? 'light' : 'dark'} />`
   is now dynamic.
4. **`components/ui/Screen.tsx`**, **`components/ui/primitives.tsx`**, **`components/ServerWakeBanner.tsx`** —
   Migrated to `useTheme()`; every `StyleSheet.create` became a `createStyles(colors[, isDark])`
   factory memoized per component. The wake banner swaps to a dark-orange tone in dark mode.
5. **`app/login.tsx`**, **`app/register.tsx`** — Same migration; error boxes use dark-friendly reds in dark mode.
6. **`app/(drawer)/_layout.tsx`** — Drawer/header styles come from `colors`; added a **Sun/Moon quick
   toggle** (`themeToggle` Pressable with haptic `selectionAsync`) in the drawer footer.
7. **`app/(drawer)/settings.tsx`** — Added an **Appearance → Dark Mode `Switch`** (haptic on toggle)
   bound to `isDark`/`toggleTheme`.
8. **`app/(drawer)/{index,documents,upload,ai-chat,analytics,notifications,users,profile}.tsx`** —
   All migrated to `useTheme()`; hardcoded greys/blues (`rgba(27,77,140,0.1)`, `#e2e8f0`, `#334155`, ...)
   replaced with palette tokens so they adapt to the active theme.

- Next: R2-Step 5 — run `tsc` + `expo lint`.

---

## R2-Step 5 — Verify
**Status:** [x] Done

- `npx tsc --noEmit` → **exit 0 (no type errors)**.
- `npx expo lint` → **exit 0 (no lint errors)**.
- **`npx expo start -c` is recommended**: `expo-image-picker` (R2-Step 3) is a newly added native
  module — restart the dev server with `-c` (clear Metro cache) so it is picked up in Expo Go.
  Dark mode itself needs no restart (JS-only change).

---

## R2-Step 6 — Fix Android Expo Go Reanimated useAnimatedStyle Object Freeze Crash
**Status:** [x] Done

**Root cause:** Passing a `useAnimatedStyle` result into `<Animated.ScrollView>`'s `contentContainerStyle` causes React Native / Reanimated view descriptor cleanup to attempt assigning `current = undefined` on a frozen style descriptor inside `react-native-reanimated/src/hook/useAnimatedStyle.ts`.

**Fix applied:**
1. **`hooks/use-animated-keyboard-height.ts`** — Added `keyboardSpacerStyle = useAnimatedStyle(() => ({ height: Platform.OS === 'android' ? height.value : 0 }))`. Preserved existing `paddingStyle` and `liftStyle`.
2. **`components/ui/Screen.tsx`** — Kept `<Animated.ScrollView>`'s `contentContainerStyle={styles.content}` completely static, and rendered a Reanimated `<Animated.View style={keyboardSpacerStyle} />` as the last child inside the `<Animated.ScrollView>`.
3. **`app/login.tsx`** & **`app/register.tsx`** — Kept `contentContainerStyle={styles.content}` static and rendered `<Animated.View style={keyboardSpacerStyle} />` as the last child inside `<Animated.ScrollView>`.
4. Audited `ai-chat.tsx`, `upload.tsx`, and `analytics.tsx` — confirmed full compliance with Reanimated rules without disabling any features.

Verification: `npx tsc --noEmit` inside `mobile_app/` passed with 0 errors.
