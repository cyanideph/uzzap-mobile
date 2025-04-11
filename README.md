# Uzzap Mobile App

A modern messaging application for connecting users in the Philippines.

## Overview

Uzzap is a feature-rich chat application built with React Native and Expo, leveraging Supabase for backend services. It enables users to send messages, create group chats, manage buddies, and explore new connections.

## Features

- **Authentication** - Secure signup and login with email
- **Profile Management** - Create and edit user profiles with avatars, mobile numbers, and regional information
- **Messaging** - Real-time private messaging between users
- **Group Chats** - Create and manage group conversations
- **Buddy System** - Add and manage contacts/buddies
- **User Discovery** - Explore and find new users
- **Contact Import** - Import contacts from your device
- **Dark/Light Themes** - Full support for both light and dark modes
- **Responsive Design** - Works across various device sizes

## Tech Stack

- **Frontend Framework**: React Native, Expo
- **Navigation**: Expo Router with Drawer Navigation
- **Backend & Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: React Context API
- **UI Components**: React Native components with custom theming
- **Icons**: Expo Vector Icons, Ionicons
- **Media**: Expo Image Picker, Expo AV for audio/video
- **Notifications**: Expo Notifications

## Project Structure

```
uzzap-mobile/
├── app/                    # Main application screens with file-based routing
│   ├── (drawer)/           # Drawer navigation screens
│   ├── (auth)/             # Authentication screens
│   ├── chatroom/           # Chatroom related screens
│   ├── chat/               # Individual chat screens
│   ├── profile/            # Profile related screens
│   └── _layout.tsx         # Root layout component
├── assets/                 # Static assets like images and fonts
├── components/             # Reusable UI components
│   ├── ui/                 # Base UI components
│   └── ...                 # Other components
├── constants/              # App constants
├── contexts/               # React context providers
├── hooks/                  # Custom React hooks
├── lib/                    # Utility libraries
│   └── supabase.ts         # Supabase client and API functions
├── supabase/               # Supabase related files
│   └── seed.sql            # Database seed file
└── types/                  # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI
- Supabase account and project

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd uzzap-mobile
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   - Create a `.env` file in the project root
   - Add your Supabase URL and anon key:
     ```
     EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
     EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. Start the development server
   ```bash
   npx expo start
   ```

### Database Setup

1. Create a new Supabase project
2. Run the SQL schema migrations from `supabase/seed.sql` in your Supabase SQL editor
3. Set up the necessary Supabase Auth providers (email/password)

## Key Features Implementation

### Drawer Navigation

The app uses a drawer-based navigation system for better scalability, providing easy access to:
- Messages
- Buddies
- Explore
- Profile
- Settings

### User Authentication

Authentication is managed through Supabase Auth with secure JWT tokens and context-based state management.

### Real-time Messaging

Messaging leverages Supabase's real-time subscription capabilities to deliver instant message updates.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Project Link: [https://github.com/yourusername/uzzap-mobile](https://github.com/yourusername/uzzap-mobile)
