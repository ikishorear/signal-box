CREATE TYPE SAType AS ENUM('IMAGE', 'VIDEO', 'AUDIO', 'URL', 'OTHERS')

CREATE TABLE SignalAttachments(
    SignalAttachmentID UUID PRIMARY KEY,
    SignalID UUID NOT NULL,
    SignalAttachmentURL TEXT NOT NULL,
    SignalAttachmentType SAType DEFAULT 'URL',
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMPTZ DEFAULT NOW()
)

