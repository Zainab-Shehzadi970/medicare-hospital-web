# Medicare Hospital: Website and Doctor Dashboard

Web application for Medicare Hospital built with Next.js. It has a public landing page and a doctor dashboard where doctors see their appointments in real time. Appointments are booked by patients from the Android app and stored in Supabase.

## Features

### Landing page
- Header, hero section with quick OPD slot search, about, services, doctors, facilities, testimonials, FAQ, emergency section and footer
- Responsive design with a red / white color scheme

### Doctor dashboard (`/doctor-appointments`)
- Doctor login (Supabase Auth)
- Summary cards, tabs and search for appointments
- Appointments table with Complete and Cancel actions
- Real-time updates: a new booking from the patient app appears without refreshing the page
- Each doctor sees only their own appointments (Row Level Security)

## Tech Stack
- Next.js (Pages Router)
- Tailwind CSS
- Supabase: Auth, PostgreSQL, Realtime

## Related Repository
Patient Android app (React Native): https://github.com/Zainab-Shehzadi970/Medicare-Hospital-System

## Getting Started

### Prerequisites
- Node.js 20 or newer

### Setup
1. Install packages:
```bash
   npm install
```
2. Create a `.env.local` file in the project root:
```
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-PUBLISHABLE-KEY
```
   Use only the publishable (anon) key. Never put the `service_role` / secret key here.
3. Run the development server:
```bash
   npm run dev
```
4. Open http://localhost:3000 for the landing page and http://localhost:3000/doctor-appointments for the doctor dashboard.

## Database
The Supabase backend (tables `profiles`, `departments`, `doctors`, `doctor_schedules`, `appointments`, Row Level Security policies and realtime) is shared with the patient app. Doctor accounts are created in Supabase Auth and linked to a row in the `doctors` table.