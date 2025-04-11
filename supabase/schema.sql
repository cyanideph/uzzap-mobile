-- Drop existing tables and types if they exist
DROP TABLE IF EXISTS message_status CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chatroom_members CASCADE;
DROP TABLE IF EXISTS chatrooms CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS provinces CASCADE;
DROP TABLE IF EXISTS regions CASCADE;

DROP TYPE IF EXISTS user_status CASCADE;
DROP TYPE IF EXISTS message_type CASCADE;
DROP TYPE IF EXISTS offline_delivery_method CASCADE;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_status AS ENUM ('online', 'offline', 'away');
CREATE TYPE message_type AS ENUM ('text', 'image', 'file');
CREATE TYPE offline_delivery_method AS ENUM ('sms', 'email', 'server');

-- Create tables
CREATE TABLE regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE provinces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    mobile_number TEXT NOT NULL UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    region_id UUID REFERENCES regions(id),
    province_id UUID REFERENCES provinces(id),
    status user_status DEFAULT 'offline',
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (id)
);

CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'light',
    notifications BOOLEAN DEFAULT true,
    auto_message_display BOOLEAN DEFAULT true,
    offline_delivery offline_delivery_method DEFAULT 'server',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id)
);

CREATE TABLE chatrooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    is_group BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (id)
);

CREATE TABLE chatroom_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chatroom_id UUID REFERENCES chatrooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(chatroom_id, user_id)
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chatroom_id UUID REFERENCES chatrooms(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT,
    type message_type DEFAULT 'text',
    media_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (id)
);

CREATE TABLE message_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(message_id, user_id)
);

-- Create indexes
CREATE INDEX idx_profiles_mobile_number ON profiles(mobile_number);
CREATE INDEX idx_profiles_region_id ON profiles(region_id);
CREATE INDEX idx_profiles_province_id ON profiles(province_id);
CREATE INDEX idx_chatroom_members_chatroom_id ON chatroom_members(chatroom_id);
CREATE INDEX idx_chatroom_members_user_id ON chatroom_members(user_id);
CREATE INDEX idx_messages_chatroom_id ON messages(chatroom_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatroom_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_status ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles policies
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Settings policies
CREATE POLICY "Users can view their own settings"
    ON settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
    ON settings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
    ON settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings"
    ON settings FOR DELETE
    USING (auth.uid() = user_id);

-- Chatrooms policies
CREATE POLICY "Users can view chatrooms they are members of"
    ON chatrooms FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chatroom_members
            WHERE chatroom_members.chatroom_id = chatrooms.id
            AND chatroom_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create chatrooms"
    ON chatrooms FOR INSERT
    WITH CHECK (auth.uid() = created_by);

-- Chatroom members policies
CREATE POLICY "Users can view chatroom members"
    ON chatroom_members FOR SELECT
    USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM chatrooms
        WHERE chatrooms.id = chatroom_members.chatroom_id
        AND chatrooms.created_by = auth.uid()
    ));

CREATE POLICY "Users can insert themselves into chatrooms"
    ON chatroom_members FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chatroom membership"
    ON chatroom_members FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chatroom membership"
    ON chatroom_members FOR DELETE
    USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view messages in their chatrooms"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chatroom_members
            WHERE chatroom_members.chatroom_id = messages.chatroom_id
            AND chatroom_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages in their chatrooms"
    ON messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM chatroom_members
            WHERE chatroom_members.chatroom_id = messages.chatroom_id
            AND chatroom_members.user_id = auth.uid()
        )
    );

-- Message status policies
CREATE POLICY "Users can view their message status"
    ON message_status FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their message status"
    ON message_status FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their message status"
    ON message_status FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chatrooms_updated_at
    BEFORE UPDATE ON chatrooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 