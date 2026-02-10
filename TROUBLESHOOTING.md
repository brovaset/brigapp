# Troubleshooting

## Runtime ChunkLoadError (Turbopack HMR chunk failed to load)

**Error:** `Failed to load chunk /_next/static/chunks/... [turbopack]/browser/dev/hmr-client/...`

This usually means the dev server’s cache is out of date or the browser is loading an old chunk.

**Fix:**

1. Stop the dev server (Ctrl+C).
2. Clear the Next.js cache and restart:
   ```bash
   npm run clean
   npm run dev
   ```
3. Hard-refresh the browser (Ctrl+Shift+R or Cmd+Shift+R) or open the app in a new tab.

**If it still happens:** run without Turbopack (uses Webpack instead):

```bash
npm run dev:webpack
```

Then hard-refresh the browser.

**When using another device on the network:** Use `http://localhost:3000` on the machine running the dev server. If you must use the machine’s IP (e.g. `http://192.168.1.43:3000`), ChunkLoadErrors can occur; clearing cache and restarting often fixes it.
