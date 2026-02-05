CREATE TABLE Profiles(
    ProfileID UUID PRIMARY KEY,
    UserID UUID NOT NULL,
    firstName TEXT,
    lastName TEXT,
    avatar BYTEA,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMPTZ DEFAULT NOW(),
    updatedAt TIMESTAMPTZ DEFAULT NOW()

    CONSTRAINT fk_profiles_users
        FOREIGN KEY (UserID)
        REFERENCES Users(UserID)
        ON DELETE CASCADE
)