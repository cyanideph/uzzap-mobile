-- Enable required extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clear existing data (if any)
TRUNCATE TABLE message_status CASCADE;
TRUNCATE TABLE messages CASCADE;
TRUNCATE TABLE chatroom_members CASCADE;
TRUNCATE TABLE chatrooms CASCADE;
TRUNCATE TABLE settings CASCADE;
TRUNCATE TABLE profiles CASCADE;
TRUNCATE TABLE provinces CASCADE;
TRUNCATE TABLE regions CASCADE;

-- Insert all Philippine regions
INSERT INTO regions (id, name, code) VALUES
    ('11111111-1111-1111-1111-111111111111', 'National Capital Region', 'NCR'),
    ('22222222-2222-2222-2222-222222222222', 'Cordillera Administrative Region', 'CAR'),
    ('33333333-3333-3333-3333-333333333333', 'Ilocos Region', 'Region I'),
    ('44444444-4444-4444-4444-444444444444', 'Cagayan Valley', 'Region II'),
    ('55555555-5555-5555-5555-555555555555', 'Central Luzon', 'Region III'),
    ('66666666-6666-6666-6666-666666666666', 'CALABARZON', 'Region IV-A'),
    ('77777777-7777-7777-7777-777777777777', 'MIMAROPA', 'Region IV-B'),
    ('88888888-8888-8888-8888-888888888888', 'Bicol Region', 'Region V'),
    ('99999999-9999-9999-9999-999999999999', 'Western Visayas', 'Region VI'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Central Visayas', 'Region VII'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Eastern Visayas', 'Region VIII'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Zamboanga Peninsula', 'Region IX'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Northern Mindanao', 'Region X'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Davao Region', 'Region XI'),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'SOCCSKSARGEN', 'Region XII'),
    ('13131313-1313-1313-1313-131313131313', 'Caraga', 'Region XIII'),
    ('14141414-1414-1414-1414-141414141414', 'Bangsamoro Autonomous Region in Muslim Mindanao', 'BARMM')
ON CONFLICT (id) DO NOTHING;

-- Insert provinces (keeping only a few for brevity)
INSERT INTO provinces (id, name, code, region_id) VALUES
    -- NCR
    ('11111111-1111-1111-1111-111111111111', 'Manila', 'MNL', '11111111-1111-1111-1111-111111111111'),
    ('11111111-1111-1111-1111-111111111112', 'Quezon City', 'QC', '11111111-1111-1111-1111-111111111111'),
    -- CAR
    ('22222222-2222-2222-2222-222222222221', 'Abra', 'ABR', '22222222-2222-2222-2222-222222222222')
ON CONFLICT (id) DO NOTHING;

-- Create sample users in auth.users
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES 
    ('d7bed82f-7a6e-4cc1-8e6d-ab2f2c4c5a6f', 'john.doe@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
    ('e8bed82f-7a6e-4cc1-8e6d-ab2f2c4c5a7f', 'jane.smith@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
    ('f9bed82f-7a6e-4cc1-8e6d-ab2f2c4c5a8f', 'mike.johnson@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample profiles with all required fields
INSERT INTO profiles (id, mobile_number, display_name, avatar_url, region_id, province_id, status)
VALUES 
    ('d7bed82f-7a6e-4cc1-8e6d-ab2f2c4c5a6f', '+639123456789', 'John Doe', 'https://example.com/avatars/john.jpg', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'online'),
    ('e8bed82f-7a6e-4cc1-8e6d-ab2f2c4c5a7f', '+639234567890', 'Jane Smith', 'https://example.com/avatars/jane.jpg', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111112', 'offline'),
    ('f9bed82f-7a6e-4cc1-8e6d-ab2f2c4c5a8f', '+639345678901', 'Mike Johnson', 'https://example.com/avatars/mike.jpg', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222221', 'away')
ON CONFLICT (id) DO NOTHING;

-- Insert sample settings
INSERT INTO settings (id, user_id, theme, notifications, auto_message_display, offline_delivery)
VALUES 
    (uuid_generate_v4(), 'd7bed82f-7a6e-4cc1-8e6d-ab2f2c4c5a6f', 'light', true, true, 'server'),
    (uuid_generate_v4(), 'e8bed82f-7a6e-4cc1-8e6d-ab2f2c4c5a7f', 'dark', true, false, 'email'),
    (uuid_generate_v4(), 'f9bed82f-7a6e-4cc1-8e6d-ab2f2c4c5a8f', 'light', false, true, 'sms')
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample chatrooms
INSERT INTO chatrooms (id, name, is_group, created_by) VALUES
    ('11111111-1111-1111-1111-111111111111', 'General Chat', true, 'd7bed82f-7a6e-4cc1-8e6d-ab2f2c4c5a6f'),
    ('22222222-2222-2222-2222-222222222222', 'Team Updates', true, 'e8bed82f-7a6e-4cc1-8e6d-ab2f2c4c5a7f'),
    ('33333333-3333-3333-3333-333333333333', NULL, false, 'd7bed82f-7a6e-4cc1-8e6d-ab2f2c4c5a6f')
ON CONFLICT (id) DO NOTHING;

-- Insert sample chatroom members with all required fields
INSERT INTO chatroom_members (id, chatroom_id, user_id, last_read_at) VALUES
    -- General Chat members
    (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'd7bed82f-7a6e-4cc1-8e6d-ab2f2c4c5a6f', NOW()),
    (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'e8bed82f-7a6e-4cc1-8e6d-ab2f2c4c5a7f', NOW()),
    (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'f9bed82f-7a6e-4cc1-8e6d-ab2f2c4c5a8f', NOW()),
    
    -- Team Updates members
    (uuid_generate_v4(), '22222222-2222-2222-2222-222222222222', 'd7bed82f-7a6e-4cc1-8e6d-ab2f2c4c5a6f', NOW()),
    (uuid_generate_v4(), '22222222-2222-2222-2222-222222222222', 'e8bed82f-7a6e-4cc1-8e6d-ab2f2c4c5a7f', NOW()),
    
    -- Private chat members
    (uuid_generate_v4(), '33333333-3333-3333-3333-333333333333', 'd7bed82f-7a6e-4cc1-8e6d-ab2f2c4c5a6f', NOW()),
    (uuid_generate_v4(), '33333333-3333-3333-3333-333333333333', 'e8bed82f-7a6e-4cc1-8e6d-ab2f2c4c5a7f', NOW())
ON CONFLICT (chatroom_id, user_id) DO NOTHING;

-- Insert sample messages with all required fields
INSERT INTO messages (id, chatroom_id, sender_id, content, type, media_url) VALUES
    -- General Chat messages
    ('aaaaaaaa-0001-4cc1-8e6d-ab2f2c4c5a6f', '11111111-1111-1111-1111-111111111111', 'd7bed82f-7a6e-4cc1-8e6d-ab2f2c4c5a6f', 'Hello everyone!', 'text', NULL),
    ('aaaaaaaa-0002-4cc1-8e6d-ab2f2c4c5a6f', '11111111-1111-1111-1111-111111111111', 'e8bed82f-7a6e-4cc1-8e6d-ab2f2c4c5a7f', 'Hi there!', 'text', NULL),
    ('aaaaaaaa-0003-4cc1-8e6d-ab2f2c4c5a6f', '11111111-1111-1111-1111-111111111111', 'f9bed82f-7a6e-4cc1-8e6d-ab2f2c4c5a8f', 'Good morning!', 'text', NULL),
    
    -- Team Updates messages with an image
    ('bbbbbbbb-0001-4cc1-8e6d-ab2f2c4c5a6f', '22222222-2222-2222-2222-222222222222', 'e8bed82f-7a6e-4cc1-8e6d-ab2f2c4c5a7f', 'Meeting agenda', 'image', 'https://example.com/images/agenda.jpg'),
    ('bbbbbbbb-0002-4cc1-8e6d-ab2f2c4c5a6f', '22222222-2222-2222-2222-222222222222', 'd7bed82f-7a6e-4cc1-8e6d-ab2f2c4c5a6f', 'Got it, thanks!', 'text', NULL),
    
    -- Private chat messages with a file
    ('cccccccc-0001-4cc1-8e6d-ab2f2c4c5a6f', '33333333-3333-3333-3333-333333333333', 'd7bed82f-7a6e-4cc1-8e6d-ab2f2c4c5a6f', 'Here''s the document', 'file', 'https://example.com/files/document.pdf'),
    ('cccccccc-0002-4cc1-8e6d-ab2f2c4c5a6f', '33333333-3333-3333-3333-333333333333', 'e8bed82f-7a6e-4cc1-8e6d-ab2f2c4c5a7f', 'Thanks, I''ll review it', 'text', NULL)
ON CONFLICT (id) DO NOTHING;

-- Insert sample message status
INSERT INTO message_status (id, message_id, user_id, is_read, read_at) VALUES
    -- Mark messages as read
    (uuid_generate_v4(), 'aaaaaaaa-0001-4cc1-8e6d-ab2f2c4c5a6f', 'd7bed82f-7a6e-4cc1-8e6d-ab2f2c4c5a6f', true, NOW()),
    (uuid_generate_v4(), 'aaaaaaaa-0002-4cc1-8e6d-ab2f2c4c5a6f', 'e8bed82f-7a6e-4cc1-8e6d-ab2f2c4c5a7f', true, NOW()),
    (uuid_generate_v4(), 'aaaaaaaa-0003-4cc1-8e6d-ab2f2c4c5a6f', 'f9bed82f-7a6e-4cc1-8e6d-ab2f2c4c5a8f', true, NOW()),
    (uuid_generate_v4(), 'bbbbbbbb-0001-4cc1-8e6d-ab2f2c4c5a6f', 'e8bed82f-7a6e-4cc1-8e6d-ab2f2c4c5a7f', true, NOW()),
    (uuid_generate_v4(), 'bbbbbbbb-0002-4cc1-8e6d-ab2f2c4c5a6f', 'd7bed82f-7a6e-4cc1-8e6d-ab2f2c4c5a6f', true, NOW()),
    (uuid_generate_v4(), 'cccccccc-0001-4cc1-8e6d-ab2f2c4c5a6f', 'd7bed82f-7a6e-4cc1-8e6d-ab2f2c4c5a6f', true, NOW()),
    (uuid_generate_v4(), 'cccccccc-0002-4cc1-8e6d-ab2f2c4c5a6f', 'e8bed82f-7a6e-4cc1-8e6d-ab2f2c4c5a7f', true, NOW())
ON CONFLICT (message_id, user_id) DO NOTHING; 