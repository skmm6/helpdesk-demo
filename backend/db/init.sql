CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    subject TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'Новый',
    assigned_to TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);