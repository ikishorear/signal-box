CREATE TYPE ProjectMemberRoleType AS ENUM('Owner', 'Member')

CREATE TABLE ProjectMembers(
    ProjectMemberID UUID PRIMARY KEY,
    ProjectID UUID NOT NULL,
    UserID UUID NOT NULL,
    ProjectMemberRole ProjectMemberRoleType DEFAULT 'Member',
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMPTZ DEFAULT NOW(),
    updatedAt TIMESTAMPTZ DEFAULT NOW()
)

-- Implement triggers for updatedAt