CREATE TABLE Profiles(
    UserID UUID PRIMARY KEY,
    firstName TEXT,
    lastName TEXT,
    avatar BYTEA,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMPTZ DEFAULT NOW(),
    updatedAt TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_profiles_users
        FOREIGN KEY (UserID)
        REFERENCES Users(UserID)
        ON DELETE CASCADE
)