---
title: Database
description: Persist data with the per-mod SQLite database provided by SimpleScripting.
---

SimpleScripting gives every mod its own SQLite database at a fixed, validated path:

```
<server-root>/universe/SimpleScripting/<mod-id>/db/mod.sqlite
```

Directories are created automatically. Mods cannot override the location.

## Lifecycle

- The database opens on first use and stays open for the mod.
- Connections close on mod disable or reload.
- Data persists across reloads and uninstall.

## Isolation & Guardrails

- `ATTACH`, `DETACH`, `PRAGMA`, `VACUUM`, and `load_extension` are blocked.
- Connections run in WAL mode with `busy_timeout` and `foreign_keys` enabled.
- Default row limit: **10k rows** per query (errors if exceeded).
- Statement timeout: **5s**; busy timeout: **5s**.
- Optional size cap (~50MB) configurable via `simplescripting.db.*` system properties.
- Access is serialized per mod to prevent cross-thread contention.

## API

- `db.execute(sql, params?)` → `{ changes, lastInsertRowid? }`
- `db.query(sql, params?)` → `row[]`
- `db.queryOne(sql, params?)` → `row | null`
- `db.transaction(fn)` → result of `fn` (rolled back on throw)

### Parameters and row shape

- Use `?` placeholders; values may be `string | number | boolean | null | byte[] | Uint8Array | number[]` (for BLOB).
- Rows are plain JS objects keyed by column label.
- BLOB columns surface as byte arrays.

## Examples

```javascript
db.execute("CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, coins INTEGER)");
db.execute("INSERT INTO users (id, coins) VALUES (?, ?)", [playerId, 100]);

const top = db.query("SELECT id, coins FROM users WHERE coins > ?", [50]);
const one = db.queryOne("SELECT coins FROM users WHERE id = ?", [playerId]);
```

Transactional updates:

```javascript
db.transaction(() => {
  const row = db.queryOne("SELECT coins FROM users WHERE id = ?", [playerId]);
  const coins = row ? row.coins : 0;
  db.execute("UPDATE users SET coins = ? WHERE id = ?", [coins + 10, playerId]);
});
```

## Migrations & Best Practices

- Track schema versions in a `meta` table and run numbered upgrades during `onEnable`.
- Keep transactions short; avoid long-running queries.
- Index hot columns and avoid `SELECT *` inside loops.
- Store complex objects as JSON strings if needed.
- Monitor the row/size limits and adjust queries accordingly.
