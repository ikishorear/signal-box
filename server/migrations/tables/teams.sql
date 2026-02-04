CREATE TABLE Teams(
    TeamID UUID PRIMARY KEY,
    TeamName TEXT UNIQUE NOT NULL,
    TeamDescription TEXT,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMPTZ DEFAULT NOW(),
    updatedAt TIMESTAMPTZ DEFAULT NOW()
)

-- Triggers for updatedAt