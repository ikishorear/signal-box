CREATE TABLE ThreadAttachments(
    ThreadAttachmentID UUID PRIMARY KEY,
    ThreadID UUID NOT NULL,
    ThreadAttachmentURL TEXT NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMPTZ DEFAULT NOW()

    CONSTRAINT fk_thread
        FOREIGN KEY (ThreadID)
        REFERENCES Threads(ThreadID)
        ON DELETE CASCADE
)

CREATE INDEX index_threadattachment_threadID on ThreadAttachments(ThreadID) WHERE isActive = true 