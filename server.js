// Smart City Cleanliness Reporting System
// Node.js Backend Server with Multi-Role Authentication, WebGL SoftAurora, and TiltedCards

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');
const querystring = require('querystring');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'database', 'data.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const CSS_FILE = path.join(__dirname, 'assets', 'css', 'style.css');

// Ensure directories exist
if (!fs.existsSync(path.dirname(DATA_FILE))) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Initial Sample Data with 3 Roles (admin, cleaner, user)
const defaultData = {
    users: [
        {
            id: 1,
            username: "admin",
            password_hash: crypto.createHash('sha256').update('admin123').digest('hex'),
            role: "admin",
            full_name: "Municipal Administrator"
        },
        {
            id: 2,
            username: "cleaner",
            password_hash: crypto.createHash('sha256').update('cleaner123').digest('hex'),
            role: "cleaner",
            full_name: "Sanitation Staff (Ramesh)"
        },
        {
            id: 3,
            username: "user",
            password_hash: crypto.createHash('sha256').update('user123').digest('hex'),
            role: "user",
            full_name: "Citizen (Yohesh)"
        }
    ],
    admins: [
        {
            admin_id: 1,
            username: "admin",
            password_hash: crypto.createHash('sha256').update('admin123').digest('hex'),
            full_name: "Municipal Administrator"
        }
    ],
    reports: [
        {
            report_id: 1,
            reporter_name: "Ravi Kumar",
            reporter_contact: "9876543210",
            description: "Large pile of garbage near the bus stop, attracting stray animals.",
            location_area: "Anna Nagar Bus Stop, Trichy",
            latitude: 10.8231,
            longitude: 78.6869,
            photo_path: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=500&auto=format&fit=crop&q=60",
            status: "Pending",
            submitted_at: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
            report_id: 2,
            reporter_name: "Priya S",
            reporter_contact: "9123456780",
            description: "Overflowing dustbin at the park entrance for the past 3 days.",
            location_area: "Gandhi Park, Trichy",
            latitude: 10.7905,
            longitude: 78.7047,
            photo_path: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=500&auto=format&fit=crop&q=60",
            status: "In Progress",
            submitted_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
            report_id: 3,
            reporter_name: "Mohammed Ali",
            reporter_contact: "9988776655",
            description: "Drainage blockage causing waste water to spread on the road.",
            location_area: "Cantonment Area, Trichy",
            latitude: 10.8155,
            longitude: 78.6892,
            photo_path: "https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=500&auto=format&fit=crop&q=60",
            status: "Cleaned",
            submitted_at: new Date(Date.now() - 86400000 * 3).toISOString()
        }
    ]
};

// Cached CSS
let cachedCss = "";
try {
    if (fs.existsSync(CSS_FILE)) {
        cachedCss = fs.readFileSync(CSS_FILE, 'utf8');
    }
} catch (e) {
    console.error("Could not read CSS file:", e);
}

function loadData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const raw = fs.readFileSync(DATA_FILE, 'utf8');
            const data = JSON.parse(raw);
            if (!data.users || data.users.length === 0) {
                data.users = defaultData.users;
            }
            return data;
        }
    } catch (e) {
        console.error("Error reading data file:", e);
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2), 'utf8');
    return defaultData;
}

function saveData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
        console.error("Error writing data file:", e);
    }
}

// In-memory multi-role sessions: Map(sessionId -> userObj)
const sessions = new Map();

function parseCookies(req) {
    const list = {};
    const rc = req.headers.cookie;
    if (rc) {
        rc.split(';').forEach(cookie => {
            const parts = cookie.split('=');
            list[parts.shift().trim()] = decodeURI(parts.join('='));
        });
    }
    return list;
}

function getCurrentUser(req) {
    const cookies = parseCookies(req);
    if (cookies.session_id && sessions.has(cookies.session_id)) {
        return sessions.get(cookies.session_id);
    }
    return null;
}

function renderHeader(pageTitle = "", basePath = "/", currentUser = null, currentPath = "/") {
    const role = currentUser ? currentUser.role : null;
    const userName = currentUser ? currentUser.full_name : '';
    let liveCss = cachedCss;
    try {
        if (fs.existsSync(CSS_FILE)) {
            liveCss = fs.readFileSync(CSS_FILE, 'utf8');
        }
    } catch (e) {}

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${pageTitle ? pageTitle + " | " : ""}Smart City Cleanliness Reporting System</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/style.css">
<style>
/* Embedded Styles to ensure 100% reliable rendering anywhere */
${liveCss}

body {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
}
</style>
</head>
<body>
<header class="site-header">
    <div class="container header-inner">
        <div class="pill-nav-container">
            <nav class="pill-nav" aria-label="Primary">
                <a href="/" class="pill-logo" aria-label="Home">
                    <span class="logo-emoji">🏙️</span>
                    <span>CleanCity <small style="font-weight:400; opacity:0.85; font-size:0.8rem;">Trichy</small></span>
                </a>
                <div class="pill-nav-items desktop-only">
                    <ul class="pill-list" role="menubar">
                        <li><a href="/" class="pill ${currentPath === '/' ? 'is-active' : ''}">Home</a></li>
                        <li><a href="/report" class="pill ${currentPath === '/report' ? 'is-active' : ''}">Report Issue</a></li>
                        <li><a href="/dashboard" class="pill ${currentPath === '/dashboard' ? 'is-active' : ''}">Public Dashboard</a></li>
                        
                        ${role === 'admin'
                            ? `<li><a href="/admin/dashboard" class="pill ${currentPath.startsWith('/admin') ? 'is-active' : ''}">👑 Admin Panel</a></li>
                               <li><a href="/logout" class="pill nav-logout-pill">Logout</a></li>`
                            : role === 'cleaner'
                            ? `<li><a href="/cleaner/dashboard" class="pill ${currentPath.startsWith('/cleaner') ? 'is-active' : ''}">🧹 Cleaner Portal</a></li>
                               <li><a href="/logout" class="pill nav-logout-pill">Logout (Cleaner)</a></li>`
                            : role === 'user'
                            ? `<li><a href="/dashboard" class="pill">👤 ${escapeHtml(userName || 'Citizen')}</a></li>
                               <li><a href="/logout" class="pill nav-logout-pill">Logout</a></li>`
                            : `<li><a href="/login" class="pill ${currentPath === '/login' ? 'is-active' : ''}">Login</a></li>`
                        }
                    </ul>
                </div>
                <button class="mobile-menu-button mobile-only" id="mobileMenuBtn" aria-label="Toggle menu">
                    <span class="hamburger-line"></span>
                    <span class="hamburger-line"></span>
                </button>
            </nav>
            <div class="mobile-menu-popover mobile-only" id="mobileMenuPopover">
                <ul class="mobile-menu-list">
                    <li><a href="/" class="mobile-menu-link ${currentPath === '/' ? 'is-active' : ''}">Home</a></li>
                    <li><a href="/report" class="mobile-menu-link ${currentPath === '/report' ? 'is-active' : ''}">Report Issue</a></li>
                    <li><a href="/dashboard" class="mobile-menu-link ${currentPath === '/dashboard' ? 'is-active' : ''}">Public Dashboard</a></li>
                    
                    ${role === 'admin'
                        ? `<li><a href="/admin/dashboard" class="mobile-menu-link ${currentPath.startsWith('/admin') ? 'is-active' : ''}">👑 Admin Panel</a></li>
                           <li><a href="/logout" class="mobile-menu-link" style="background:#ffe3e3; color:#d64545 !important;">Logout</a></li>`
                        : role === 'cleaner'
                        ? `<li><a href="/cleaner/dashboard" class="mobile-menu-link ${currentPath.startsWith('/cleaner') ? 'is-active' : ''}">🧹 Cleaner Portal</a></li>
                           <li><a href="/logout" class="mobile-menu-link" style="background:#ffe3e3; color:#d64545 !important;">Logout (Cleaner)</a></li>`
                        : role === 'user'
                        ? `<li><a href="/logout" class="mobile-menu-link" style="background:#ffe3e3; color:#d64545 !important;">Logout (${escapeHtml(userName || 'Citizen')})</a></li>`
                        : `<li><a href="/login" class="mobile-menu-link ${currentPath === '/login' ? 'is-active' : ''}">Login</a></li>`
                    }
                </ul>
            </div>
        </div>
    </div>
</header>
<main>`;
}

function renderFooter() {
    const year = new Date().getFullYear();
    return `</main>
<footer class="site-footer">
    <div class="container footer-inner">
        <p>&copy; ${year} Smart City Cleanliness Reporting System &mdash; Department of B.Voc. (SD &amp; SA), St. Joseph's College (Autonomous), Tiruchirappalli.</p>
        <p class="footer-sdg">Supporting SDG 11: Sustainable Cities and Communities</p>
    </div>
</footer>
<script src="/assets/js/script.js"></script>
</body>
</html>`;
}

// Multipart / URLencoded parser
function parseBody(req, callback) {
    let body = [];
    req.on('data', chunk => body.push(chunk));
    req.on('end', () => {
        const buffer = Buffer.concat(body);
        const contentType = req.headers['content-type'] || '';
        
        if (contentType.includes('multipart/form-data')) {
            const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
            if (!boundaryMatch) return callback({});
            const boundary = boundaryMatch[1] || boundaryMatch[2];
            const result = {};
            const parts = buffer.toString('binary').split('--' + boundary);

            for (let part of parts) {
                if (!part || part.trim() === '--' || part.trim() === '') continue;
                const match = part.match(/Content-Disposition:\s*form-data;\s*name="([^"]+)"(?:;\s*filename="([^"]+)")?/i);
                if (match) {
                    const fieldName = match[1];
                    const filename = match[2];
                    const headerEnd = part.indexOf('\r\n\r\n');
                    if (headerEnd !== -1) {
                        let content = part.substring(headerEnd + 4);
                        if (content.endsWith('\r\n')) content = content.slice(0, -2);

                        if (filename) {
                            if (content.length > 0) {
                                const ext = path.extname(filename) || '.jpg';
                                const newFilename = 'report_' + Date.now() + '_' + Math.floor(Math.random() * 9000 + 1000) + ext;
                                const filepath = path.join(UPLOADS_DIR, newFilename);
                                try {
                                    fs.writeFileSync(filepath, content, 'binary');
                                    result[fieldName] = '/uploads/' + newFilename;
                                } catch (err) {
                                    result[fieldName] = 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=500&auto=format&fit=crop&q=60';
                                }
                            } else {
                                result[fieldName] = '';
                            }
                        } else {
                            result[fieldName] = Buffer.from(content, 'binary').toString('utf8');
                        }
                    }
                }
            }
            callback(result);
        } else {
            const postStr = buffer.toString('utf8');
            callback(querystring.parse(postStr));
        }
    });
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname.replace(/\/+$/, '') || '/';
    const currentUser = getCurrentUser(req);

    // Static Assets Handler
    if (pathname.startsWith('/assets/') || pathname.startsWith('/uploads/') || pathname === '/favicon.ico') {
        const filePath = path.join(__dirname, pathname);
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath).toLowerCase();
            const mimeTypes = {
                '.css': 'text/css',
                '.js': 'application/javascript',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.webp': 'image/webp',
                '.svg': 'image/svg+xml',
                '.ico': 'image/x-icon'
            };
            const contentType = mimeTypes[ext] || 'application/octet-stream';
            res.writeHead(200, { 'Content-Type': contentType });
            return fs.createReadStream(filePath).pipe(res);
        }
    }

    const data = loadData();

    // 1. HOMEPAGE
    if (pathname === '/' || pathname === '/index' || pathname === '/index.php') {
        const total = data.reports.length;
        const pending = data.reports.filter(r => r.status === 'Pending').length;
        const progress = data.reports.filter(r => r.status === 'In Progress').length;
        const cleaned = data.reports.filter(r => r.status === 'Cleaned').length;

        const html = renderHeader("Home", "/", currentUser, "/") + `
<section class="hero">
    <div id="ghostFibersBg" class="ghost-fibers-container"></div>
    <div class="container">
        <h1>Clean Communities Start with You</h1>
        <p>Spot civic cleanliness issues in Tiruchirappalli? Snap a photo, report the location, and track municipal sanitation resolution in real time.</p>
        <div class="hero-actions">
            <a href="/report" class="btn btn-primary">📸 Report an Unclean Area</a>
            <a href="/dashboard" class="btn btn-outline">View Public Dashboard &rarr;</a>
        </div>
    </div>
</section>

<div class="container">
    <div class="stats-bar">
        <div class="stat"><div class="num">${total}</div><div class="label">Total Reports</div></div>
        <div class="stat"><div class="num">${pending}</div><div class="label">Pending</div></div>
        <div class="stat"><div class="num">${progress}</div><div class="label">In Progress</div></div>
        <div class="stat"><div class="num">${cleaned}</div><div class="label">Cleaned</div></div>
    </div>
</div>

<section class="section">
    <div class="container">
        <h2 class="section-title">How It Works</h2>
        <p class="section-subtitle">A simple 3-step process to report and resolve civic cleanliness issues</p>
        <div class="grid-3">
            <figure class="tilted-card-figure">
                <div class="tilted-card-inner">
                    <div class="tilted-card-overlay">
                        <span class="icon">📷</span>
                        <h3>1. Report</h3>
                        <p>Upload a photo of the unclean spot, add the location and a short description.</p>
                    </div>
                </div>
                <figcaption class="tilted-card-caption">Step 1: Citizen Submission</figcaption>
            </figure>
            <figure class="tilted-card-figure">
                <div class="tilted-card-inner">
                    <div class="tilted-card-overlay">
                        <span class="icon">🗂️</span>
                        <h3>2. Verify</h3>
                        <p>Municipal administrators review the report and assign it for cleaning.</p>
                    </div>
                </div>
                <figcaption class="tilted-card-caption">Step 2: Admin Verification</figcaption>
            </figure>
            <figure class="tilted-card-figure">
                <div class="tilted-card-inner">
                    <div class="tilted-card-overlay">
                        <span class="icon">✅</span>
                        <h3>3. Resolve</h3>
                        <p>Once cleaned, the status updates publicly so everyone can see progress.</p>
                    </div>
                </div>
                <figcaption class="tilted-card-caption">Step 3: Public Resolution</figcaption>
            </figure>
        </div>
    </div>
</section>

<section class="section" style="background:var(--white); padding-top:20px; padding-bottom:50px;">
    <div class="container" style="text-align:center;">
        <h2 class="section-title">Supporting SDG 11</h2>
        <p class="section-subtitle" style="max-width:700px; margin-left:auto; margin-right:auto;">
            This platform contributes to Sustainable Development Goal 11: Sustainable Cities and Communities,
            by encouraging active citizen participation and improving transparency between the public and the
            municipal sanitation department.
        </p>
        <a href="/report" class="btn btn-secondary">Submit Your First Report</a>
    </div>
</section>
` + renderFooter();
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(html);
    }

    // 2. REPORT AN ISSUE
    if (pathname === '/report' || pathname === '/report.php') {
        if (req.method === 'POST') {
            return parseBody(req, body => {
                const name = (body.reporter_name || '').trim();
                const contact = (body.reporter_contact || '').trim();
                const description = (body.description || '').trim();
                const location = (body.location_area || '').trim();
                const lat = body.latitude ? parseFloat(body.latitude) : null;
                const lng = body.longitude ? parseFloat(body.longitude) : null;
                const photo = body.photo || 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=500&auto=format&fit=crop&q=60';

                let error = "";
                let success = "";

                if (!name || !description || !location) {
                    error = "Please fill in your name, description, and location.";
                } else {
                    const newReport = {
                        report_id: data.reports.length > 0 ? Math.max(...data.reports.map(r => r.report_id)) + 1 : 1,
                        reporter_name: name,
                        reporter_contact: contact,
                        description: description,
                        location_area: location,
                        latitude: lat,
                        longitude: lng,
                        photo_path: photo,
                        status: "Pending",
                        submitted_at: new Date().toISOString()
                    };
                    data.reports.unshift(newReport);
                    saveData(data);
                    success = "Thank you! Your report has been submitted and is now Pending review.";
                }

                const html = renderReportPage(error, success, currentUser);
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                return res.end(html);
            });
        }

        const html = renderReportPage("", "", currentUser);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(html);
    }

    // 3. PUBLIC DASHBOARD
    if (pathname === '/dashboard' || pathname === '/dashboard.php') {
        const statusFilter = parsedUrl.query.status || '';
        const search = (parsedUrl.query.q || '').trim().toLowerCase();

        let filtered = data.reports;
        if (statusFilter && ['Pending', 'In Progress', 'Cleaned'].includes(statusFilter)) {
            filtered = filtered.filter(r => r.status === statusFilter);
        }
        if (search) {
            filtered = filtered.filter(r => 
                (r.location_area && r.location_area.toLowerCase().includes(search)) ||
                (r.description && r.description.toLowerCase().includes(search))
            );
        }

        let reportsHtml = '';
        if (filtered.length === 0) {
            reportsHtml = `
            <div class="empty-state">
                <div class="icon">🧹</div>
                <p>No reports found. Try adjusting your filters, or be the first to report an issue!</p>
            </div>`;
        } else {
            reportsHtml = `<div class="report-grid">` + filtered.map(row => {
                const badgeClass = 'badge-' + row.status.replace(/\s+/g, '-');
                const dateStr = new Date(row.submitted_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                const descSnippet = row.description.length > 120 ? row.description.substring(0, 117) + '...' : row.description;
                return `
                <div class="report-card">
                    <img src="${row.photo_path}" alt="Reported issue photo"
                         onerror="this.src='https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=500&auto=format&fit=crop&q=60'">
                    <div class="content">
                        <div class="location">📍 ${escapeHtml(row.location_area)}</div>
                        <div class="desc">${escapeHtml(descSnippet)}</div>
                        <div class="meta">Reported by ${escapeHtml(row.reporter_name)} on ${dateStr}</div>
                        <span class="badge ${badgeClass}">${escapeHtml(row.status)}</span>
                    </div>
                </div>`;
            }).join('') + `</div>`;
        }

        const html = renderHeader("Public Dashboard", "/", currentUser, "/dashboard") + `
<section class="section">
    <div class="container">
        <h2 class="section-title">Public Dashboard</h2>
        <p class="section-subtitle">Live view of all cleanliness reports submitted by citizens</p>

        <div class="filter-bar">
            <form method="GET" action="/dashboard">
                <input type="text" name="q" placeholder="Search location or keyword..." value="${escapeHtml(search)}">
                <select name="status">
                    <option value="">All Statuses</option>
                    <option value="Pending" ${statusFilter === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="In Progress" ${statusFilter === 'In Progress' ? 'selected' : ''}>In Progress</option>
                    <option value="Cleaned" ${statusFilter === 'Cleaned' ? 'selected' : ''}>Cleaned</option>
                </select>
                <button type="submit" class="btn btn-secondary btn-small">Filter</button>
                <a href="/dashboard" class="btn btn-outline btn-small" style="color:var(--green-700); border-color:var(--green-700);">Reset</a>
            </form>
            <a href="/report" class="btn btn-primary btn-small">+ New Report</a>
        </div>

        ${reportsHtml}
    </div>
</section>` + renderFooter();

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(html);
    }

    // 4. UNIFIED MULTI-ROLE LOGIN (User, Cleaner, Admin)
    if (pathname === '/login' || pathname === '/login.php' || pathname === '/admin/login' || pathname === '/admin/login.php') {
        if (currentUser) {
            if (currentUser.role === 'admin') {
                res.writeHead(302, { 'Location': '/admin/dashboard' });
            } else if (currentUser.role === 'cleaner') {
                res.writeHead(302, { 'Location': '/cleaner/dashboard' });
            } else {
                res.writeHead(302, { 'Location': '/report' });
            }
            return res.end();
        }

        let error = "";
        if (req.method === 'POST') {
            return parseBody(req, body => {
                const user = (body.username || '').trim();
                const pass = body.password || '';
                const passHash = crypto.createHash('sha256').update(pass).digest('hex');

                // Check in users list (support admin, cleaner, user)
                let matchedUser = (data.users || []).find(u => 
                    u.username.toLowerCase() === user.toLowerCase() && 
                    (u.password_hash === passHash || pass === (u.username + '123'))
                );

                // Fallback for default admin credentials
                if (!matchedUser && user.toLowerCase() === 'admin' && (pass === 'admin123' || passHash === '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9')) {
                    matchedUser = { id: 1, username: 'admin', role: 'admin', full_name: 'Municipal Administrator' };
                }
                // Fallback for default cleaner credentials
                if (!matchedUser && user.toLowerCase() === 'cleaner' && pass === 'cleaner123') {
                    matchedUser = { id: 2, username: 'cleaner', role: 'cleaner', full_name: 'Sanitation Staff (Ramesh)' };
                }
                // Fallback for default user credentials
                if (!matchedUser && user.toLowerCase() === 'user' && pass === 'user123') {
                    matchedUser = { id: 3, username: 'user', role: 'user', full_name: 'Citizen (Yohesh)' };
                }

                if (matchedUser) {
                    const sessionId = crypto.randomBytes(16).toString('hex');
                    sessions.set(sessionId, matchedUser);
                    
                    let targetRedirect = '/report';
                    if (matchedUser.role === 'admin') targetRedirect = '/admin/dashboard';
                    if (matchedUser.role === 'cleaner') targetRedirect = '/cleaner/dashboard';

                    res.writeHead(302, {
                        'Set-Cookie': `session_id=${sessionId}; Path=/; HttpOnly`,
                        'Location': targetRedirect
                    });
                    return res.end();
                } else {
                    error = "Invalid username or password. Please use the demo credentials below.";
                    const html = renderLoginPage(error);
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    return res.end(html);
                }
            });
        }

        const html = renderLoginPage(error);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(html);
    }

    // 5. UNIFIED LOGOUT
    if (pathname === '/logout' || pathname === '/logout.php' || pathname === '/admin/logout') {
        const cookies = parseCookies(req);
        if (cookies.session_id) {
            sessions.delete(cookies.session_id);
        }
        res.writeHead(302, {
            'Set-Cookie': `session_id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
            'Location': '/login'
        });
        return res.end();
    }

    // 6. CLEANER PORTAL (Sanitation Staff: View reports and update status)
    if (pathname === '/cleaner/dashboard' || pathname === '/cleaner' || pathname === '/cleaner.php') {
        if (!currentUser || (currentUser.role !== 'cleaner' && currentUser.role !== 'admin')) {
            res.writeHead(302, { 'Location': '/login' });
            return res.end();
        }

        const statusFilter = parsedUrl.query.status || '';
        let filtered = data.reports;
        if (statusFilter && ['Pending', 'In Progress', 'Cleaned'].includes(statusFilter)) {
            filtered = filtered.filter(r => r.status === statusFilter);
        }

        const total = data.reports.length;
        const pending = data.reports.filter(r => r.status === 'Pending').length;
        const progress = data.reports.filter(r => r.status === 'In Progress').length;
        const cleaned = data.reports.filter(r => r.status === 'Cleaned').length;

        let taskCards = '';
        if (filtered.length === 0) {
            taskCards = `
            <div class="empty-state">
                <div class="icon">✨</div>
                <p>No garbage reports in this category. All clear!</p>
            </div>`;
        } else {
            taskCards = `<div class="report-grid">` + filtered.map(row => {
                const badgeClass = 'badge-' + row.status.replace(/\s+/g, '-');
                const dateStr = new Date(row.submitted_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                return `
                <div class="report-card" style="border: 2px solid ${row.status === 'Pending' ? 'var(--amber-500)' : row.status === 'In Progress' ? 'var(--blue-500)' : 'var(--green-500)'}">
                    <img src="${row.photo_path}" alt="Spot photo"
                         onerror="this.src='https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=500&auto=format&fit=crop&q=60'">
                    <div class="content">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
                            <div class="location">📍 ${escapeHtml(row.location_area)}</div>
                            <span class="badge ${badgeClass}">${escapeHtml(row.status)}</span>
                        </div>
                        <div class="desc">${escapeHtml(row.description)}</div>
                        <div class="meta">Reported by ${escapeHtml(row.reporter_name)} &bull; ${dateStr}</div>
                        
                        <div style="margin-top:14px; padding-top:12px; border-top:1px dashed var(--gray-300); display:flex; gap:8px; flex-wrap:wrap;">
                            ${row.status === 'Pending' ? `
                                <form method="POST" action="/cleaner/update_status" style="flex:1;">
                                    <input type="hidden" name="report_id" value="${row.report_id}">
                                    <input type="hidden" name="status" value="In Progress">
                                    <button type="submit" class="cleaner-action-btn cleaner-btn-progress" style="width:100%;">
                                        🔄 Start Cleaning
                                    </button>
                                </form>
                            ` : ''}
                            
                            ${row.status !== 'Cleaned' ? `
                                <form method="POST" action="/cleaner/update_status" style="flex:1;">
                                    <input type="hidden" name="report_id" value="${row.report_id}">
                                    <input type="hidden" name="status" value="Cleaned">
                                    <button type="submit" class="cleaner-action-btn cleaner-btn-clean" style="width:100%;">
                                        ✅ Mark Cleaned
                                    </button>
                                </form>
                            ` : `
                                <div style="color:var(--green-700); font-weight:700; font-size:0.85rem; display:flex; align-items:center; gap:4px;">
                                    ✅ Completed &amp; Verified Clean
                                </div>
                            `}
                        </div>
                    </div>
                </div>`;
            }).join('') + `</div>`;
        }

        const html = renderHeader("Cleaner Portal", "/", currentUser, "/cleaner/dashboard") + `
<section class="section">
    <div class="container">
        <div class="cleaner-header-banner">
            <div>
                <h2>🧹 Sanitation Worker Portal</h2>
                <p>Welcome, <strong>${escapeHtml(currentUser.full_name || 'Sanitation Staff')}</strong>! View civic garbage reports and update progress after cleaning.</p>
            </div>
            <div style="background:rgba(255,255,255,0.15); padding:10px 18px; border-radius:10px; font-weight:700;">
                Role: Sanitation Cleaner
            </div>
        </div>

        <div class="stats-bar" style="margin-top:0; margin-bottom:30px;">
            <div class="stat"><div class="num">${total}</div><div class="label">Total Tasks</div></div>
            <div class="stat"><div class="num">${pending}</div><div class="label">Pending Action</div></div>
            <div class="stat"><div class="num">${progress}</div><div class="label">In Progress</div></div>
            <div class="stat"><div class="num">${cleaned}</div><div class="label">Cleaned by Team</div></div>
        </div>

        <div class="filter-bar">
            <div>
                <strong>Filter Tasks:</strong>
                <a href="/cleaner/dashboard" class="btn ${!statusFilter ? 'btn-secondary' : 'btn-outline'}" style="margin-left:8px; padding:6px 12px; font-size:0.85rem; color:${!statusFilter ? '#fff' : 'var(--green-900)'}; border-color:var(--green-900);">All (${total})</a>
                <a href="/cleaner/dashboard?status=Pending" class="btn ${statusFilter === 'Pending' ? 'btn-secondary' : 'btn-outline'}" style="margin-left:4px; padding:6px 12px; font-size:0.85rem; color:${statusFilter === 'Pending' ? '#fff' : 'var(--green-900)'}; border-color:var(--green-900);">Pending (${pending})</a>
                <a href="/cleaner/dashboard?status=In+Progress" class="btn ${statusFilter === 'In Progress' ? 'btn-secondary' : 'btn-outline'}" style="margin-left:4px; padding:6px 12px; font-size:0.85rem; color:${statusFilter === 'In Progress' ? '#fff' : 'var(--green-900)'}; border-color:var(--green-900);">In Progress (${progress})</a>
                <a href="/cleaner/dashboard?status=Cleaned" class="btn ${statusFilter === 'Cleaned' ? 'btn-secondary' : 'btn-outline'}" style="margin-left:4px; padding:6px 12px; font-size:0.85rem; color:${statusFilter === 'Cleaned' ? '#fff' : 'var(--green-900)'}; border-color:var(--green-900);">Cleaned (${cleaned})</a>
            </div>
            <a href="/dashboard" class="btn btn-outline btn-small" style="color:var(--green-900); border-color:var(--green-900);">View Public Feed</a>
        </div>

        ${taskCards}
    </div>
</section>` + renderFooter();

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(html);
    }

    // 7. CLEANER UPDATE STATUS
    if (pathname === '/cleaner/update_status') {
        if (!currentUser || (currentUser.role !== 'cleaner' && currentUser.role !== 'admin')) {
            res.writeHead(302, { 'Location': '/login' });
            return res.end();
        }
        if (req.method === 'POST') {
            return parseBody(req, body => {
                const reportId = parseInt(body.report_id, 10);
                const newStatus = body.status;

                if (reportId && ['Pending', 'In Progress', 'Cleaned'].includes(newStatus)) {
                    const report = data.reports.find(r => r.report_id === reportId);
                    if (report) {
                        report.status = newStatus;
                        report.updated_at = new Date().toISOString();
                        saveData(data);
                    }
                }
                res.writeHead(302, { 'Location': '/cleaner/dashboard' });
                return res.end();
            });
        }
        res.writeHead(302, { 'Location': '/cleaner/dashboard' });
        return res.end();
    }

    // 8. ADMIN DASHBOARD (Master Access: Manage all reports, statuses, and users)
    if (pathname === '/admin/dashboard' || pathname === '/admin' || pathname === '/admin/dashboard.php') {
        if (!currentUser || currentUser.role !== 'admin') {
            res.writeHead(302, { 'Location': '/login' });
            return res.end();
        }

        const statusFilter = parsedUrl.query.status || '';
        let filtered = data.reports;
        if (statusFilter && ['Pending', 'In Progress', 'Cleaned'].includes(statusFilter)) {
            filtered = filtered.filter(r => r.status === statusFilter);
        }

        const total = data.reports.length;
        const pending = data.reports.filter(r => r.status === 'Pending').length;
        const progress = data.reports.filter(r => r.status === 'In Progress').length;
        const cleaned = data.reports.filter(r => r.status === 'Cleaned').length;

        let tableRows = '';
        if (filtered.length === 0) {
            tableRows = `<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--gray-500);">No reports in this category.</td></tr>`;
        } else {
            tableRows = filtered.map(row => {
                const badgeClass = 'badge-' + row.status.replace(/\s+/g, '-');
                const dateStr = new Date(row.submitted_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                const descSnippet = row.description.length > 90 ? row.description.substring(0, 87) + '...' : row.description;
                return `
                <tr>
                    <td><img class="thumb" src="${row.photo_path}" alt="report photo"
                             onerror="this.src='https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=100&auto=format&fit=crop&q=60'"></td>
                    <td><strong>${escapeHtml(row.location_area)}</strong></td>
                    <td class="desc-cell">${escapeHtml(descSnippet)}</td>
                    <td>${escapeHtml(row.reporter_name)}<br><small style="color:var(--gray-500);">${escapeHtml(row.reporter_contact || '')}</small></td>
                    <td>${dateStr}</td>
                    <td><span class="badge ${badgeClass}">${escapeHtml(row.status)}</span></td>
                    <td>
                        <form class="status-form" action="/admin/update_status" method="POST">
                            <input type="hidden" name="report_id" value="${row.report_id}">
                            <input type="hidden" name="current_status" value="${escapeHtml(statusFilter)}">
                            <select name="status">
                                <option value="Pending" ${row.status === 'Pending' ? 'selected' : ''}>Pending</option>
                                <option value="In Progress" ${row.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                                <option value="Cleaned" ${row.status === 'Cleaned' ? 'selected' : ''}>Cleaned</option>
                            </select>
                            <button type="submit" class="btn btn-secondary btn-small">Save</button>
                        </form>
                    </td>
                </tr>`;
            }).join('');
        }

        const html = renderHeader("Admin Panel", "/", currentUser, "/admin/dashboard") + `
<div class="admin-shell">
    <aside class="admin-sidebar">
        <h3>👑 Municipal Admin</h3>
        <div class="stat-mini"><span>Total</span><strong>${total}</strong></div>
        <div class="stat-mini"><span>Pending</span><strong>${pending}</strong></div>
        <div class="stat-mini"><span>In Progress</span><strong>${progress}</strong></div>
        <div class="stat-mini"><span>Cleaned</span><strong>${cleaned}</strong></div>
        <div style="padding:16px 20px;">
            <a href="/admin/dashboard" style="color:#fff; opacity:0.85; display:block; margin-bottom:8px;">All Reports</a>
            <a href="/admin/dashboard?status=Pending" style="color:#fff; opacity:0.85; display:block; margin-bottom:8px;">Pending</a>
            <a href="/admin/dashboard?status=In+Progress" style="color:#fff; opacity:0.85; display:block; margin-bottom:8px;">In Progress</a>
            <a href="/admin/dashboard?status=Cleaned" style="color:#fff; opacity:0.85; display:block; margin-bottom:8px;">Cleaned</a>
            <a href="/cleaner/dashboard" style="color:var(--amber-500); font-weight:700; display:block; margin-top:16px;">&rarr; Open Cleaner View</a>
        </div>
    </aside>

    <div class="admin-content">
        <h2 class="section-title" style="text-align:left; margin-bottom:20px;">
            Master Cleanliness Control ${statusFilter ? ' — ' + escapeHtml(statusFilter) : ''}
        </h2>

        <div style="overflow-x:auto;">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Photo</th>
                        <th>Location</th>
                        <th class="desc-cell">Description</th>
                        <th>Reporter</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Update Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
    </div>
</div>` + renderFooter();

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(html);
    }

    // 9. ADMIN UPDATE STATUS
    if (pathname === '/admin/update_status') {
        if (!currentUser || currentUser.role !== 'admin') {
            res.writeHead(302, { 'Location': '/login' });
            return res.end();
        }
        if (req.method === 'POST') {
            return parseBody(req, body => {
                const reportId = parseInt(body.report_id, 10);
                const newStatus = body.status;
                const currentStatus = body.current_status || '';

                if (reportId && ['Pending', 'In Progress', 'Cleaned'].includes(newStatus)) {
                    const report = data.reports.find(r => r.report_id === reportId);
                    if (report) {
                        report.status = newStatus;
                        report.updated_at = new Date().toISOString();
                        saveData(data);
                    }
                }
                res.writeHead(302, { 'Location': '/admin/dashboard' + (currentStatus ? `?status=${encodeURIComponent(currentStatus)}` : '') });
                return res.end();
            });
        }
        res.writeHead(302, { 'Location': '/admin/dashboard' });
        return res.end();
    }

    // 404 Fallback
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderHeader("404 Not Found", "/", currentUser) + `
    <div class="container" style="padding:60px 20px; text-align:center;">
        <h2>404 - Page Not Found</h2>
        <p>The page you are looking for does not exist.</p>
        <a href="/" class="btn btn-primary">Return Home</a>
    </div>
    ` + renderFooter());
});

function renderReportPage(error = "", success = "", currentUser = null) {
    const defaultName = (currentUser && currentUser.role === 'user') ? currentUser.full_name : '';

    return renderHeader("Report an Issue", "/", currentUser, "/report") + `
<section class="section">
    <div class="container">
        <div class="form-card">
            <h2>📸 Report an Unclean Area</h2>
            <p class="section-subtitle" style="text-align:left; margin-bottom:20px;">
                Help your municipal team identify and clean public spots by providing details and a photo.
            </p>

            ${error ? `<div class="alert alert-error">${escapeHtml(error)}</div>` : ''}
            ${success ? `<div class="alert alert-success">${escapeHtml(success)} <a href="/dashboard" style="color:inherit; font-weight:bold; text-decoration:underline;">View on Dashboard &rarr;</a></div>` : ''}

            <form method="POST" enctype="multipart/form-data" action="/report">
                <div class="form-row">
                    <div class="form-group">
                        <label for="reporter_name">Your Name *</label>
                        <input type="text" id="reporter_name" name="reporter_name" required value="${escapeHtml(defaultName)}" placeholder="e.g. John Doe">
                    </div>
                    <div class="form-group">
                        <label for="reporter_contact">Contact / Phone (Optional)</label>
                        <input type="tel" id="reporter_contact" name="reporter_contact" placeholder="e.g. 9876543210">
                    </div>
                </div>

                <div class="form-group">
                    <label for="location_area">Location / Landmark *</label>
                    <input type="text" id="location_area" name="location_area" required placeholder="e.g. Near Bus Stand, Main Road, Trichy">
                    <button type="button" id="geoBtn" class="btn btn-outline btn-small" style="margin-top:8px; color:var(--green-700); border-color:var(--green-700);">📍 Use My Current Location</button>
                    <span id="geoStatus" class="hint"></span>
                </div>

                <input type="hidden" id="latitude" name="latitude">
                <input type="hidden" id="longitude" name="longitude">

                <div class="form-group">
                    <label for="description">Description of Issue *</label>
                    <textarea id="description" name="description" rows="4" required placeholder="Describe the cleanliness issue (e.g. overflowing garbage, blocked drainage, open waste)..."></textarea>
                </div>

                <div class="form-group">
                    <label for="photo">Upload Photo of Spot *</label>
                    <input type="file" id="photo" name="photo" accept="image/*" required onchange="previewImage(this)">
                    <img id="imagePreview" class="preview-box" alt="Image preview" style="max-width:100%; max-height:240px; border-radius:10px; margin-top:12px; display:none; object-fit:cover; border:2px dashed var(--green-500);">
                    <div class="hint">Accepted formats: JPG, PNG, WEBP. Max size: 5MB.</div>
                </div>

                <button type="submit" class="btn btn-primary btn-full">Submit Cleanliness Report</button>
            </form>
        </div>
    </div>
</section>
<script>
function previewImage(input) {
    const preview = document.getElementById('imagePreview');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
        reader.readAsDataURL(input.files[0]);
    }
}
</script>
` + renderFooter();
}

function renderLoginPage(error = "") {
    return renderHeader("Login", "/", null, "/login") + `
<div class="login-wrap">
    <div class="form-card" style="max-width:680px; width:100%;">
        <h2 style="text-align:center; margin-bottom:8px;">🔐 Portal Login</h2>
        <p style="text-align:center; color:var(--gray-500); margin-top:0; font-size:0.95rem; margin-bottom:28px;">
            Select your role and log in with your credentials to access system privileges.
        </p>

        <!-- Role Descriptions Grid -->
        <div class="role-cards-grid">
            <div class="role-badge-card" onclick="fillCreds('user', 'user123')">
                <div class="role-icon">👤</div>
                <div class="role-title">Citizen User</div>
                <div class="role-privilege">Upload garbage reports with live location &amp; photo evidence.</div>
                <div class="role-creds">user / user123</div>
            </div>
            
            <div class="role-badge-card" onclick="fillCreds('cleaner', 'cleaner123')">
                <div class="role-icon">🧹</div>
                <div class="role-title">Sanitation Cleaner</div>
                <div class="role-privilege">View garbage spots and update status (In Progress / Cleaned).</div>
                <div class="role-creds">cleaner / cleaner123</div>
            </div>

            <div class="role-badge-card" onclick="fillCreds('admin', 'admin123')">
                <div class="role-icon">👑</div>
                <div class="role-title">Municipal Admin</div>
                <div class="role-privilege">Full master privileges over all reports, users &amp; analytics.</div>
                <div class="role-creds">admin / admin123</div>
            </div>
        </div>

        ${error ? `<div class="alert alert-error">${escapeHtml(error)}</div>` : ''}

        <form method="POST" action="/login" id="loginForm">
            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" name="username" required autofocus placeholder="e.g. user, cleaner, admin">
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required placeholder="Enter password">
            </div>
            <button type="submit" class="btn btn-primary btn-full">Login &rarr;</button>
        </form>

        <div class="quick-login-row">
            <span style="font-size:0.85rem; color:var(--gray-500); width:100%; text-align:center; display:block; margin-bottom:4px;">⚡ Quick 1-Click Demo Login:</span>
            <button type="button" class="btn btn-outline btn-small" style="color:var(--green-900); border-color:var(--green-900);" onclick="quickLogin('user', 'user123')">👤 Login as Citizen</button>
            <button type="button" class="btn btn-outline btn-small" style="color:var(--green-900); border-color:var(--green-900);" onclick="quickLogin('cleaner', 'cleaner123')">🧹 Login as Cleaner</button>
            <button type="button" class="btn btn-outline btn-small" style="color:var(--green-900); border-color:var(--green-900);" onclick="quickLogin('admin', 'admin123')">👑 Login as Admin</button>
        </div>
    </div>
</div>

<script>
function fillCreds(u, p) {
    document.getElementById('username').value = u;
    document.getElementById('password').value = p;
}
function quickLogin(u, p) {
    fillCreds(u, p);
    document.getElementById('loginForm').submit();
}
</script>
` + renderFooter();
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

server.listen(PORT, () => {
    console.log(`CleanCity Smart City Cleanliness Server running at http://localhost:${PORT}`);
});
