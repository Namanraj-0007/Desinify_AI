# DesinifyAI - Config verification TODO

## Step 1: Validate & tighten environment loading
- [x] Inspect `backend/app/config/settings.py` and `backend/app/main.py`.
- [x] Identify current issues: no masked config printing, insufficient fail-fast validation for Mongo vars, redundant dotenv loading.
- [x] Add masked dump + validators in `backend/app/config/settings.py`.
- [x] Update `backend/app/main.py` to:

  - ensure `.env` loading is consistent (single source of truth)
  - print masked loaded configuration on startup
  - fail fast for all required env vars
  - validate `GOOGLE_REDIRECT_URI` against callback route path

## Step 2: Verify mappings and remove conflicts
- [ ] Ensure `settings` singleton is the only Settings instance.
- [ ] Verify Mongo client uses `settings.mongodb_uri` and `settings.database_name`.
- [ ] Verify Mongo ping connects successfully with Atlas values.
- [ ] Verify CORS_ORIGINS splitting into list.
- [ ] Verify hardcoded secrets/URLs/ports are absent.

## Step 3: Final verification
- [ ] Run backend startup and confirm logs.
- [ ] Show every modified file + explanation.
