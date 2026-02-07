CREATE TYPE ProjectMemberRoleType AS ENUM('LEAD', 'MEMBER')

CREATE TABLE ProjectMembers(
    ProjectMemberID UUID PRIMARY KEY,
    ProjectID UUID NOT NULL,
    UserID UUID NOT NULL,
    ProjectMemberRole ProjectMemberRoleType DEFAULT 'MEMBER',
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMPTZ DEFAULT NOW(),
    updatedAt TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_project_pm
        FOREIGN KEY (ProjectID)
        REFERENCES Projects(ProjectID)
        ON DELETE CASCADE
    
    CONSTRAINT fk_project_users
        FOREIGN KEY (UserID)
        REFERENCES Users(UserID)
        ON DELETE CASCADE
    
    CONSTRAINT UNIQUE(ProjectID, UserID)
)

CREATE INDEX index_projectMembers_projectId ON ProjectMembers(ProjectID) WHERE isActive = true