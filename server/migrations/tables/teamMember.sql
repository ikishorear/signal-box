CREATE TYPE TeamMemeberType AS ENUM('LEAD', 'MEMBER')

CREATE TABLE TeamMembers(
    UserID UUID NOT NULL,
    TeamID UUID NOT NULL,
    TeamMemberRole TeamMemeberType DEFAULT 'MEMBER',
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMPTZ DEFAULT NOW(),
    updatedAt TIMESTAMPTZ DEFAULT NOW()

    CONSTRAINT fk_users
        FOREIGN KEY (UserID)
        REFERENCES Users(UserID)
        DELETE ON CASCADE
    
    CONSTRAINT fk_teams
        FOREIGN KEY (TeamID)
        REFERENCES Teams(TeamID)
        DELETE ON CASCADE
)
