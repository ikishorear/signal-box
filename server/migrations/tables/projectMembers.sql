CREATE TYPE ProjectMemberRoleType AS ENUM('Owner', 'Member')

CREATE TABLE ProjectMembers(
    ProjectMemberID UUID PRIMARY KEY,
    ProjectID UUID NOT NULL,
    UserID UUID NOT NULL,
    ProjectMemberRole ProjectMemberRoleType DEFAULT 'Member',
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMPTZ DEFAULT NOW(),
    updatedAt TIMESTAMPTZ DEFAULT NOW()

    CONSTRAINT fk_project_pm
        FOREIGN KEY (ProjectID)
        REFERENCES Projects(ProjectID)
        ON DELETE CASCADE
    
    CONSTRAINT fk_project_users
        FOREIGN KEY (UserID)
        REFERENCES Users(UserID)
        ON DELETE CASCADE
)

