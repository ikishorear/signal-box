CREATE TABLE Threads(
    ThreadID UUID PRIMARY KEY,
    ParentThreadID UUID DEFAULT NULL, 
    SignalID UUID NOT NULL,
    UserID UUID NOT NULL,
    Comment TEXT NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMPTZ DEFAULT NOW(),
    updatedAt TIMESTAMPTZ DEFAULT NOW()

    CONSTRAINT fk_signals
        FOREIGN KEY (SignalID)
        REFERENCES Signals(SignalID)
        ON DELETE CASCADE
    
    CONSTRAINT fk_users
        FOREIGN KEY (UserID)
        REFERENCES Users(UserID)
        ON DELETE CASCADE
    
    CONSTRAINT fk_parent_thread
        FOREIGN KEY (ParentThreadID)
        REFERENCES Threads(ThreadID)
        ON DELETE CASCADE
)