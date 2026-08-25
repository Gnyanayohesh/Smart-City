# Smart City Cleanliness Reporting System

A web-based application that lets citizens report unclean public areas
(with a photo and location), view all reports on a public dashboard, and
lets municipal admins verify reports and update their status
(Pending → In Progress → Cleaned).

Built with **PHP + MySQL + HTML/CSS/JavaScript**, designed to run on **XAMPP**
(as specified in the project document) — but works with any PHP/MySQL stack.

---

## 1. Requirements

- XAMPP (Apache + MySQL + PHP 7.4 or later) — https://www.apachefriends.org/
- A web browser (Google Chrome recommended)

## 2. Setup Instructions

1. **Install XAMPP** and start the **Apache** and **MySQL** modules from the
   XAMPP Control Panel.

2. **Copy the project folder.**
   Copy the entire `smart-city-cleanliness` folder into your XAMPP
   `htdocs` directory, e.g.:
   - Windows: `C:\xampp\htdocs\smart-city-cleanliness`
   - macOS: `/Applications/XAMPP/htdocs/smart-city-cleanliness`

3. **Create the database.**
   - Open `http://localhost/phpmyadmin` in your browser.
   - Click **Import**, choose the file `database/schema.sql` from this
     project, and click **Go**.
   - This creates the `smart_city_cleanliness` database with the
     `reports` and `admins` tables, a demo admin account, and 3 sample
     reports.

4. **Check the database connection settings** in `config/db.php` if your
   MySQL setup differs from the XAMPP default (host `localhost`, user
   `root`, no password).

5. **Make the uploads folder writable.**
   The `uploads/` folder needs write permission so uploaded photos can be
   saved there (on XAMPP/Windows this normally works out of the box; on
   macOS/Linux run `chmod 755 uploads`).

6. **Open the site.**
   Visit `http://localhost/smart-city-cleanliness/` in your browser.

## 3. Default Admin Login

| Field    | Value      |
|----------|------------|
| Username | `admin`    |
| Password | `admin123` |

Login at `http://localhost/smart-city-cleanliness/admin/login.php`.

**Change this password before any real deployment** — you can do this by
generating a new bcrypt hash with PHP's `password_hash()` and updating the
`admins` table.

## 4. Project Structure

```
smart-city-cleanliness/
├── index.php              Homepage
├── report.php              Citizen report submission form (with photo upload)
├── dashboard.php            Public dashboard (search + filter by status)
├── config/
│   └── db.php                Database connection settings
├── includes/
│   ├── header.php             Shared page header/nav
│   └── footer.php             Shared page footer
├── assets/
│   ├── css/style.css          All site styling
│   └── js/script.js           Geolocation "Use My Current Location" helper
├── admin/
│   ├── login.php               Admin login
│   ├── logout.php              Admin logout
│   ├── dashboard.php           Admin panel: view/filter all reports
│   └── update_status.php       Handles status updates (Pending/In Progress/Cleaned)
├── uploads/                   Uploaded citizen photos are stored here
└── database/
    └── schema.sql              Full database schema + sample data
```

## 5. Features Implemented

- Citizens can submit a report with name, contact, description, location,
  optional GPS coordinates (via browser geolocation), and a photo.
- Public dashboard shows all reports with search and status filtering.
- Status badges (Pending / In Progress / Cleaned) with color coding.
- Admin login (session-based, passwords hashed with bcrypt).
- Admin panel to view all reports in a table and update status inline.
- Sidebar with live counts (Total / Pending / In Progress / Cleaned).
- Responsive layout that works on mobile and desktop.
- Input validation and file-type/size checks on photo uploads.
- Prepared statements (mysqli) throughout to prevent SQL injection.

## 6. Possible Extensions (for the report/viva)

- Email/SMS notification to the citizen when their report's status changes.
- Google Maps integration to plot reports visually on a map.
- Multiple admin roles (super admin vs. field staff).
- "Before/after" photo pairs once cleaned.
- Export reports to CSV/Excel for municipal record-keeping.
