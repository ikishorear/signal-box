CREATE TYPE SignalType AS ENUM('IDEA', 'RISK', 'CONCERN', 'FEEDBACK')
CREATE TYPE SignalStatusType AS ENUM('OPEN', 'DISCUSSING', 'DECIDED')

CREATE TABLE Signals(
    SignalID UUID PRIMARY KEY,
    SignalProjectID UUID NOT NULL,
    SignalTitle VARCHAR(20) NOT NULL,
    SignalDescription TEXT NOT NULL,
    SignalStatus SignalStatusType DEFAULT 'OPEN',
    SignalType SignalType DEFAULT 'IDEA',
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMPTZ DEFAULT NOW(),
    updatedAt TIMESTAMPTZ DEFAULT NOW()
)

-- Triggers for updatedAt