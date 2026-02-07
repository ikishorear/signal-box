CREATE TYPE SAType AS ENUM('IMAGE', 'VIDEO', 'AUDIO', 'URL', 'OTHERS')

CREATE TABLE SignalAttachments(
    SignalAttachmentID UUID PRIMARY KEY,
    SignalID UUID NOT NULL,
    SignalAttachmentURL TEXT NOT NULL,
    SignalAttachmentType SAType DEFAULT 'URL',
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMPTZ DEFAULT NOW()

    CONSTRAINT fk_signals
        FOREIGN KEY (SignalID)
        REFERENCES Signals(SignalID)
        ON DELETE CASCADE
)

CREATE INDEX index_signalattachments_signalID ON SignalAttachments(SignalID) WHERE isActive = true