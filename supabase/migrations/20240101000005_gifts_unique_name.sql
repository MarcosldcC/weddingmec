-- Unique index para evitar presentes duplicados por nome
CREATE UNIQUE INDEX IF NOT EXISTS idx_gifts_name_unique ON gifts (name);
