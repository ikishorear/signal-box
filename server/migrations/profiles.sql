CREATE TABLE Profiles(
    ProfileID UUID PRIMARY KEY,
    UserID UUID NOT NULL,
    firstName TEXT,
    lastName TEXT,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMPTZ DEFAULT NOW(),
    updatedAt TIMESTAMPTZ DEFAULT NOW()
)

-- Trigger for updatedAt
-- Add forgien keys