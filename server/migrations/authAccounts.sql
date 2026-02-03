CREATE PType AS ENUM('GOOGLE', 'MICROSOFT', 'OTHERS')

CREATE TABLE AuthAccounts(
    AuthAccountID UUID PRIMARY KEY,
    UserID UUID NOT NULL,
    Provider PType,
    ProviderUserID UUID,
    token TEXT,
    isActive BOOLEAN TRUE,
    createdAt TIMESTAMPTZ DEFAULT NOW()
)