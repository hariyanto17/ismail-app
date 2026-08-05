# Developer Documentation: Branding & White-Label Customization

This document provides a guide on how the simple multi-brand architecture works in this project and explains how developers can create new customer-specific applications from this repository.

---

## 1. Overview

The repository acts as the master template (upstream repository) for all future POS products. To ensure long-term maintainability, the application isolates all brand-specific configurations:
- **Centralized Customization**: Customer-specific customization (company details, theme colors, assets, receipt formats) is isolated inside dedicated `branding/` folders.
- **Generic Core**: The core application logic, screens, utilities, and components remain entirely generic.
- **Zero Customer Dependency**: Business logic and features must never depend on or hardcode specific customer information.

---

## 2. Branding Folder Structure

The branding module follows a clean, isolated directory structure for both frontend and backend projects:

```text
mobile/src/branding/
    default/
        assets/
            logo.png
            bw-logo.png
        theme.ts
        receipt.ts
        index.ts

    index.ts

backend/src/branding/
    default/
        index.ts

    index.ts
```

### File Responsibilities
- **`default/`**: Contains the configurations and assets for the active brand.
- **`assets/`**: Brand-specific images, logos, and icons.
- **`theme.ts`**: Colors defining the brand's UI design system.
- **`receipt.ts`**: Custom receipt text formatting rules and template builder.
- **`default/index.ts`**: The main configuration object exposing company names, addresses, social handles, and support details.
- **`branding/index.ts` (Root)**: The single entrypoint that exports the active brand to the rest of the application.

---

## 3. Branding Responsibilities

The Branding module holds exclusive responsibility for:
- **Application Identification**: Name of the application.
- **Company Information**: Registration names, support email, copyright information.
- **Business Details**: Store address, phone numbers, website links, social media handles, support phone, and tax labels.
- **Theme System**: Primary, dark, light, secondary brand colors, and cart/footer backgrounds.
- **Assets**: High-resolution logos, black-and-white print logos, and base64 encoded strings for thermal printer compatibility.
- **Receipt System**: Custom headers, footers, thank-you notes, and transaction formatting rules.

---

## 4. Creating a New Brand

To create a brand customization (for example, `customer-a`) without modifying core application files, follow these steps:

### Step 1: Duplicate the Default Directory
Copy the `default` folder and rename it:
- **Backend**: Duplicate `backend/src/branding/default/` to `backend/src/branding/customer-a/`
- **Mobile**: Duplicate `mobile/src/branding/default/` to `mobile/src/branding/customer-a/`

### Step 2: Replace Brand Assets
Put the new brand logos in `mobile/src/branding/customer-a/assets/`:
- `logo.png`
- `bw-logo.png`
- Generate a new base64 string for the logo and update `logoBase64` inside the module (or import from a dedicated base64 file).

### Step 3: Configure Branding Parameters
Edit `index.ts` and `theme.ts` in the new directories:
- Update app names, copyright messages, email, phone numbers, and addresses.
- Update primary, primaryDark, primaryLight, and accent theme colors in `theme.ts`.

### Step 4: Activate the Brand
Update the root entrypoints to export from the new brand folder instead of `default`:

- **Backend (`backend/src/branding/index.ts`)**:
  ```typescript
  import { BackendBranding } from './customer-a';
  export { BackendBranding };
  export default BackendBranding;
  ```

- **Mobile (`mobile/src/branding/index.ts`)**:
  ```typescript
  import { Branding } from './customer-a';
  export { Branding };
  export default Branding;
  ```

---

## 5. Files That Should Be Customized

When configuring a new customer deployment, only customize:
- `branding/[brand_name]/index.ts`
- `branding/[brand_name]/theme.ts`
- `branding/[brand_name]/receipt.ts`
- `branding/[brand_name]/assets/*`

---

## 6. Native Branding

Certain platform configurations must remain native and cannot be centralized in TypeScript modules. When deploying a new brand, customize these files manually:
- **Application Display Name (Android)**: [strings.xml](file:///Users/hari/Documents/ismail/mobile/android/app/src/main/res/values/strings.xml) (edit `<string name="app_name">Customer App Name</string>`).
- **Application Metadata (Android/iOS)**: [app.json](file:///Users/hari/Documents/ismail/mobile/app.json) (edit the `displayName` property).
- **Application Package Names**: Android Package ID inside Gradle, and iOS Bundle Identifier inside Xcode targets.
- **Launcher Icons & Splash Screens**: Store launcher assets in Android's `mipmap` resource directories and iOS's Xcode asset catalog.

---

## 7. What Should NOT Be Modified

To keep downstream repositories maintainable and synchronized, **do not modify** the following when creating customer projects:
- Core React Native UI screens and layout components.
- API service calls and query parameters.
- Redux, slices, and RTK Query state management logic.
- Backend routing, controller logic, and authentication middleware.
- Prisma models, schema, and database structures.

Customizations should be isolated *exclusively* to the Branding module.

---

## 8. Upstream Synchronization

Keeping brand customizations isolated in the `branding/` folder allows downstream customer repositories to receive bug fixes and feature updates from the upstream master template with minimal merge conflicts.

To pull the latest changes from the master template:
```bash
# Add the upstream remote once
git remote add upstream <upstream-repo-url>

# Fetch and merge updates
git fetch upstream
git merge upstream/main
```
If a conflict occurs, keep the custom downstream files inside the `branding/` directory and merge all changes to the core application files.
