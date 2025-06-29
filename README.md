# Xelendar - Your Personal Calendar Companion

A modern, intelligent calendar application built with Next.js, React, and Supabase. Xelendar combines natural language processing with a beautiful, responsive interface to help you organize your life effortlessly.


## 🌟 Features

### 📅 **Smart Calendar Management**
- **Multiple Views**: Calendar, Timeline, and Agenda views
- **Drag & Drop**: Intuitive event management
- **Recurring Events**: Flexible recurrence patterns (daily, weekly, monthly, yearly)
- **Event Colors**: Customizable event colors for better organization

### 🤖 **AI-Powered Natural Language Input**
- **Smart Parsing**: Create events using natural language
- **Examples**:
  - "Meeting with John tomorrow at 2pm"
  - "Dentist appointment next Friday"
  - "Math test on Monday"
  - "Birthday party on June 30"
- **Date Intelligence**: Understands "today", "tomorrow", "next week", "on [day]", etc.

### 🔔 **Smart Notifications**
- **Browser Notifications**: Real-time reminders for upcoming events
- **Customizable Timing**: Set notification time (default: 15 minutes before)
- **Permission Management**: Easy notification permission handling
- **Background Checking**: Automatic notification checking every minute

### 🎨 **Modern User Interface**
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark/Light Mode**: Automatic theme switching with manual toggle
- **Keyboard Shortcuts**: Power user shortcuts for quick navigation
- **Beautiful Animations**: Smooth transitions and hover effects

### ⚡ **Performance & Security**
- **Fast Loading**: Built with Next.js for optimal performance
- **Privacy First**: Your data stays private and secure
- **Real-time Updates**: Instant synchronization across devices
- **Offline Support**: Basic functionality works offline

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Supabase account (free tier available)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/xelendar.git
cd xelendar
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Groq AI API (for natural language processing)
GROQ_API_KEY=your_groq_api_key
```

### 4. Database Setup
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor
3. Copy your project URL and anon key to `.env.local`

### 5. AI Setup (Optional)
1. Sign up for Groq AI at [groq.com](https://groq.com)
2. Get your API key and add it to `.env.local`
3. Without Groq, the app will still work but without natural language parsing

### 6. Run the Development Server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗️ Architecture

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful, customizable icons
- **Sonner**: Toast notifications

### Backend
- **Supabase**: Backend-as-a-Service (PostgreSQL + Auth + Real-time)
- **Groq AI**: Natural language processing for event creation

### Key Components
```
app/
├── components/          # React components
│   ├── Calendar.tsx    # Main calendar view
│   ├── EventModal.tsx  # Event creation/editing
│   ├── EventSidebar.tsx # Quick add and event list
│   ├── TimelineView.tsx # Timeline view
│   └── ...
├── api/                # API routes
│   └── parse-event/    # AI event parsing
├── lib/                # Utilities and services
│   ├── supabaseClient.ts
│   ├── aiService.ts
│   └── notificationService.ts
└── types/              # TypeScript type definitions
```

## 📋 Database Schema

### Events Table
```sql
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME,
  color TEXT DEFAULT '#3B82F6',
  recurrence JSONB,
  is_recurring BOOLEAN DEFAULT FALSE,
  original_event_id UUID REFERENCES events(id),
  notification_enabled BOOLEAN DEFAULT TRUE,
  notification_time INTEGER DEFAULT 15,
  notification_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🎯 Features in Detail

### Natural Language Processing
The app uses Groq AI to parse natural language into structured event data:

**Supported Patterns:**
- `"Meeting with John tomorrow at 2pm"`
- `"Dentist appointment next Friday"`
- `"Math test on Monday"`
- `"Birthday party on June 30"`
- `"Team standup on Friday"`
- `"Conference call in 3 days"`

**Date Intelligence:**
- `"today"` → Current date
- `"tomorrow"` → Next day
- `"on [day]"` → This week's occurrence
- `"next [day]"` → Next week's occurrence
- `"in X days"` → Relative date calculation

### Event Management
- **Create Events**: Via modal, quick add, or natural language
- **Edit Events**: Click any event to modify details
- **Delete Events**: Hover over events to see delete button
- **Recurring Events**: Set up daily, weekly, monthly, or yearly patterns
- **Event Colors**: Choose from predefined colors or custom hex values

### Views
1. **Calendar View**: Traditional month view with event display
2. **Timeline View**: Chronological list of upcoming events
3. **Agenda View**: Grouped by date with detailed information

### Notifications
- **Browser Permissions**: Request notification access on first use
- **Smart Timing**: Configurable reminder time (default: 15 minutes)
- **Background Service**: Checks for upcoming events every minute
- **Visual Indicators**: Shows notification status in header

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt + K` | Show/hide shortcuts panel |
| `Alt + N` | Create new event |
| `Alt + C` | Switch to calendar view |
| `Alt + T` | Switch to timeline view |
| `Alt + S` | Toggle sidebar |
| `Alt + ←` | Previous month/period |
| `Alt + →` | Next month/period |
| `Alt + H` | Go to today |
| `Alt + Q` | Focus quick add input |
| `Escape` | Close modal/shortcuts |

## 🔧 Configuration

### Environment Variables
```env
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional (for AI features)
GROQ_API_KEY=your_groq_api_key
```

### Customization
- **Colors**: Modify the color palette in `app/globals.css`
- **Icons**: Replace icons from Lucide React library
- **Styling**: Customize with Tailwind CSS classes
- **Features**: Enable/disable features in component files

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Use TypeScript for all new code
- Follow the existing code style
- Add tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend services
- [Groq](https://groq.com/) - AI processing
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Lucide](https://lucide.dev/) - Icons

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/xelendar/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/xelendar/discussions)
- **Email**: yousofabdelrehim@gmail.com

## 🔄 Changelog

### v1.0.0 (Current)
- ✅ Natural language event creation
- ✅ Multiple calendar views
- ✅ Smart notifications
- ✅ Recurring events
- ✅ Dark/light mode
- ✅ Keyboard shortcuts
- ✅ Responsive design
- ✅ Real-time synchronization

---

**Made with ❤️**
