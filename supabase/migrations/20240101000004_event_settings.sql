-- Configurações do evento
CREATE TABLE IF NOT EXISTS event_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  wedding_datetime TIMESTAMPTZ,
  wedding_location TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO event_settings (id, wedding_datetime, wedding_location)
VALUES (1, '2024-09-28T00:00:00Z', 'Quinta do Freio, Sintra')
ON CONFLICT (id) DO NOTHING;
