# CyberSprint 2026

A comprehensive cyber security workshop and CTF event management system.

## Features

- Student Registration Portal
- Teacher Dashboard
- Admin Panel
- QR Code Generation
- Email Notifications
- Attendance Tracking

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with:
```
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

5. Run production build:
```bash
node dist/index.js
```

## Deployment

### Vercel
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables (MONGO_URI)
4. Deploy

### Other Platforms
- Ensure `dist` folder is deployed
- Set start command: `node dist/index.js`
- Add environment variables

## Pages

- `/` - Landing page
- `/register.html` - Student registration
- `/teacher.html` - Teacher portal
- `/admin.html` - Admin panel

## API Endpoints

- `/api/students` - Student management
- `/api/attendance` - Attendance tracking
- `/api/auth` - Authentication
- `/api/admin` - Admin operations
