CREATE TABLE Threads(
    ThreadID UUID PRIMARY KEY,
    SignalID UUID NOT NULL,
    UserID UUID NOT NULL,
    Comment TEXT NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMPTZ DEFAULT NOW()
    updatedAt TIMESTAMPTZ DEFAULT NOW()

    CONSTRAINT fk_signals
        FOREIGN KEY (SignalID)
        REFERENCES Signals(SignalID)
        ON DELETE CASCADE
    
    CONSTRAINT fk_users
        FOREIGN KEY (UserID)
        REFERENCES Users(UserID)
        ON DELETE CASCADE
)