# Clippy

Clippy is a lightweight browser clipboard library for saving, searching, organizing, and reusing text, image, and file clips.

This repository is a local MVP. It is ready to use as a private, single-browser clipboard, but it is not yet an online multi-device service.

## Current features

- Save text clips or upload images and files up to 2 MB.
- Search clips and filter by text, image, file, or pinned status.
- Copy text clips back to the system clipboard.
- Download saved images and files.
- Pin and delete clips.
- Sort clips newest-first or oldest-first.
- Export and import a JSON backup.
- Persist data in the browser's local storage.

## Run locally

Open `index.html` in a modern browser. No build step or dependency installation is required.

For the most predictable clipboard permissions, serve the folder from a local web server instead of opening the file directly. For example, with Python installed:

```text
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Data and privacy

Clippy currently stores clips only in the current browser profile. There is no account system, cloud database, or cross-device synchronization yet. Uploaded files and image data are stored locally as data URLs, so large libraries can run into browser storage limits.

Use **Export backup** before clearing browser data or moving to another browser. The exported JSON includes the saved clip content and attachment data.

## Before launching online

The online version needs authentication, an API, HTTPS, server-side encrypted storage, object storage for attachments, per-user access controls, rate limiting, validation, and conflict resolution. The current local-storage data model can serve as the client-side prototype, but the connected-device UI should not be enabled until those services exist.