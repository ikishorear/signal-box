CREATE PType AS ENUM('GOOGLE', 'MICROSOFT', 'OTHERS')

CREATE TABLE AuthAccounts(
    AuthAccountID UUID PRIMARY KEY,
    UserID UUID NOT NULL,
    Provider PType,
    ProviderUserID UUID,
    token TEXT,
    isActive BOOLEAN TRUE,
    createdAt TIMESTAMPTZ DEFAULT NOW()

    CONSTRAINT fk_auth_users
        FOREIGN KEY (UserID)
        REFERENCES Users(UserID)
        ON DELETE CASCADE
)