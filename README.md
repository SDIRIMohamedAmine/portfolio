# Portfolio + Admin CMS
### React (CRA) · Tailwind CSS · Framer Motion · Supabase

A fully dynamic personal portfolio with a private admin panel at `/admin-space`.
Your brother can log in and edit everything — profile, skills, projects, experience — without touching code.

---

## ⚡ Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Supabase
1. Go to [supabase.com](https://supabase.com) → create a free project
2. Open **SQL Editor** → paste the entire contents of `supabase_schema.sql` → click **Run**
3. Go to **Authentication → Users → Add user** — create your brother's account with email + password
4. Go to **Settings → API** — copy your **Project URL** and **anon public key**

### 3. Configure environment
```bash
cp .env.example .env
```
Then edit `.env`:
```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-public-key
REACT_APP_ADMIN_EMAIL=your-brother@email.com
```
> ⚠️ The admin email **must match** the email you created in Supabase Auth.

### 4. Start the app
```bash
npm start
```
Opens at **http://localhost:3000**

---

## 📁 Project Structure

```
portfolio/
├── public/
│   └── index.html
├── src/
│   ├── index.js                    ← CRA entry point
│   ├── App.js                      ← React Router (all routes)
│   ├── index.css                   ← Tailwind + global styles
│   │
│   ├── supabase/
│   │   └── client.js               ← Supabase instance
│   │
│   ├── context/
│   │   ├── AuthContext.jsx         ← Login state, isAdmin check
│   │   └── PortfolioContext.jsx    ← Fetches & provides all portfolio data
│   │
│   ├── hooks/
│   │   └── useActiveSection.js     ← Scroll spy for navbar highlight
│   │
│   ├── pages/
│   │   └── PortfolioPage.jsx       ← The main public portfolio (loader + sections)
│   │
│   └── components/
│       ├── Navbar.jsx
│       ├── Hero.jsx
│       ├── About.jsx
│       ├── Projects.jsx
│       ├── Experience.jsx
│       ├── Contact.jsx
│       ├── Footer.jsx
│       ├── ProtectedRoute.jsx      ← Auth guard for /admin-space
│       │
│       ├── ui/
│       │   ├── SectionTitle.jsx    ← Reusable animated section header
│       │   ├── Modal.jsx           ← Reusable modal dialog
│       │   └── Toast.jsx           ← Notification component
│       │
│       └── admin/
│           ├── AdminLogin.jsx      ← /admin-space/login page
│           ├── AdminDashboard.jsx  ← Main admin UI with sidebar
│           └── editors/
│               ├── ProfileEditor.jsx    ← Edit bio, name, socials
│               ├── SkillsEditor.jsx     ← Add/edit/delete skills
│               ├── ProjectsEditor.jsx   ← Add/edit/delete projects
│               └── ExperienceEditor.jsx ← Add/edit/delete timeline entries
│
├── supabase_schema.sql    ← Run this in Supabase SQL Editor once
├── .env.example           ← Copy to .env and fill in
├── craco.config.js        ← Enables Tailwind with CRA (no ejecting)
├── tailwind.config.js
└── package.json
```

---

## 🗺️ Routes

| URL | Description |
|---|---|
| `/` | Public portfolio |
| `/admin-space/login` | Login page |
| `/admin-space` | Admin dashboard (protected) |

---

## 🔐 How the Admin Auth Works

1. **Login**: Your brother visits `/admin-space/login`, enters his email + password
2. **Supabase Auth**: Verifies credentials against your Supabase project
3. **Email check**: `AuthContext` also verifies the logged-in email matches `REACT_APP_ADMIN_EMAIL`
4. **Double protection**: Even if someone else logs in with a different Supabase user, they'll see "Access Denied"
5. **Session**: Supabase stores the session in localStorage — stays logged in across page reloads

---

## 🗄️ Database Tables

| Table | Purpose |
|---|---|
| `portfolio_info` | Single row — name, bio, email, social links |
| `skills` | Skill badges (name, category, emoji icon) |
| `projects` | Portfolio projects with tech stack, images, links |
| `experience` | Career/education timeline entries |

**Row Level Security:**
- `anon` role → **SELECT only** (public visitors)
- `authenticated` role → **full CRUD** (your brother when logged in)

---

## ✏️ What Can Be Edited in Admin Panel

### Profile Section
- Full name, first/last name
- Job title & tagline
- Email, location
- Short bio + extended bio
- Resume URL
- GitHub, LinkedIn, Twitter links

### Skills Section
- Add new skill (name + emoji icon + category)
- Edit any skill
- Delete skill
- Categories: Frontend / Backend / Tools

### Projects Section
- Add new project with:
  - Title, description
  - Tech stack (comma-separated)
  - Image URL (Unsplash or any direct image link)
  - Live demo URL, GitHub URL
  - Featured toggle
  - Card gradient color
  - Display order
- Edit existing projects
- Delete projects
- Image preview in the editor form

### Experience Section
- Add timeline entries (jobs, internships, education)
- Each entry: role, company, company URL, period, location, type
- Description + bullet point highlights (one per line)
- Display order control
- Edit / delete any entry

---

## 🎨 Customization

### Accent color
Edit `tailwind.config.js`:
```js
accent: {
  gold: '#e8b04b',    // ← Change this to your preferred color
}
```

### Fonts
Edit `public/index.html` (Google Fonts link) and `tailwind.config.js`:
```js
fontFamily: {
  display: ['Syne', 'sans-serif'],  // ← Headings
  body: ['Outfit', 'sans-serif'],   // ← Body text
  mono: ['JetBrains Mono', 'monospace'],
}
```

---

## 🚢 Deployment

### Netlify (recommended for CRA)
```bash
npm run build
# Then drag & drop the /build folder to netlify.com/drop
# Or connect your GitHub repo for auto-deploys
```
Add environment variables in Netlify: **Site Settings → Environment Variables**

### Vercel
```bash
npx vercel
# Add env vars in the Vercel dashboard
```

---

## 📧 Wiring the Contact Form

The form currently simulates a send. To make it real, swap the handler in `src/components/Contact.jsx`:

**Option A — EmailJS (free, no backend):**
```bash
npm install @emailjs/browser
```
```js
import emailjs from '@emailjs/browser';
await emailjs.send('SERVICE_ID', 'TEMPLATE_ID', form, 'PUBLIC_KEY');
```

**Option B — Save messages to Supabase:**
```sql
-- Add to supabase_schema.sql:
CREATE TABLE contact_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT,
  email      TEXT,
  message    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
```js
await supabase.from('contact_messages').insert(form);
```

---

## 🛠️ Tech Stack

| Tool | Version | Why |
|---|---|---|
| React (CRA) | 18 | UI framework — no Vite |
| CRACO | 7 | Adds Tailwind to CRA without ejecting |
| Tailwind CSS | 3 | Utility-first styling |
| Framer Motion | 11 | Smooth animations |
| React Router | 6 | Client-side routing |
| Supabase JS | 2 | Auth + database client |
| Lucide React | latest | Icons |
