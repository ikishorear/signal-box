CREATE TABLE ThreadAttachments(
    ThreadAttachmentID UUID PRIMARY KEY,
    ThreadID UUID NOT NULL,
    ThreadAttachmentURL TEXT NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMPTZ DEFAULT NOW()
)