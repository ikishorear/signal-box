CREATE TYPE TeamMemeberType AS ENUM('LEAD', 'MEMBER')

CREATE TABLE TeamMembers(
    TeamMemberID UUID PRIMARY KEY,
    UserID UUID NOT NULL,
    TeamID UUID NOT NULL,
    TeamMemberRole TeamMemeberType DEFAULT 'MEMBER',
    isActive BOOELAN DEFAULT TRUE,
    createdAt TIMESTAMPTZ DEFAULT NOW(),
    updatedAt TIMESTAMPTZ DEFAULT NOW()

    CONSTRAINT fk_users
        FOREIGN KEY (UserID)
        REFERENCES Users(UserID)
        DELETE ON CASCADE
)
