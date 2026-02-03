CREATE TYPE Auth_Provider AS ENUM('EMAIL', 'GOOGLE', 'MICROSOFT')
CREATE TYPE User_Role AS ENUM('ADMIN', 'USER')

CREATE TABLE Users(
    UserID UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    auth_provider Auth_Provider DEFAULT 'EMAIL',
    role User_Role DEFAULT 'USER',
    avatar BYTEA,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMPTZ DEFAULT NOW(),
    updatedAt TIMESTAMPTZ DEFAULT NOW()
)

-- Implement trigger for updatedAt
