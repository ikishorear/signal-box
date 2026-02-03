CREATE TYPE Auth_Provider AS ENUM('Email', 'Google', 'Microsoft')
CREATE TYPE User_Role AS ENUM('Admin', 'User')

CREATE TABLE Users(
    UserID UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    auth_provider Auth_Provider DEFAULT 'Email',
    role User_Role DEFAULT 'User',
    avatar BYTEA,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMPTZ DEFAULT NOW(),
    updatedAt TIMESTAMPTZ DEFAULT NOW()
)

-- Implement trigger for updatedAt
