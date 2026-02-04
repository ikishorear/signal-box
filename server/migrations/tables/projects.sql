CREATE TABLE Projects(
    ProjectID UUID PRIMARY KEY,
    TeamID UUID NOT NULL,
    ProjectName VARCHAR(20) NOT NULL,
    ProjectDescription TEXT NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMPTZ DEFAULT NOW(),
    updatedAt TIMESTAMPTZ DEFAULT NOW()

    CONSTRAINT fk_projects_team
        FOREIGN KEY (TeamID)
        REFERENCES Teams(TeamID)
        ON DELETE CASCADE
)

