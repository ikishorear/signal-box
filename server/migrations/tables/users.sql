CREATE TYPE Auth_Provider AS ENUM('EMAIL', 'GOOGLE', 'MICROSOFT')
CREATE TYPE User_Role AS ENUM('ADMIN', 'USER')

CREATE TABLE Users(
    UserID UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE CHECK(char_length(phone) BETWEEN 10 AND 15),
    password TEXT,
    auth_provider Auth_Provider DEFAULT 'EMAIL',
    role User_Role DEFAULT 'USER',
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMPTZ DEFAULT NOW(),
    updatedAt TIMESTAMPTZ DEFAULT NOW()
)

CREATE INDEX index_users_email ON Users(email) WHERE isActive = true