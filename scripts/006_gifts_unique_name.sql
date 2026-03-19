-- Garante idempotência e evita duplicação por nome no banco.
-- (Import em massa já ignora duplicados, mas o UNIQUE dá robustez.)
CREATE UNIQUE INDEX IF NOT EXISTS idx_gifts_name_unique ON gifts (name);

