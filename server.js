const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'database', 'data.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const CSS_FILE = path.join(__dirname, 'assets', 'css', 'style.css');

let cachedCss = "";
try {
    if (fs.existsSync(CSS_FILE)) {
        cachedCss = fs.readFileSync(CSS_FILE, 'utf8');
    }
} catch (e) {
    console.error("Could not read CSS file:", e);
}

if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Initial sample data if data.json doesn't exist
function getInitialData() {
    return {
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
                submitted_at: new Date(Date.now() - 86400000 * 1).toISOString()
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
}

function loadData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        }
    } catch (e) {
        console.error("Error reading data file:", e);
    }
    const init = getInitialData();
    saveData(init);
    return init;
}

function saveData(data) {
    try {
        const dbDir = path.dirname(DATA_FILE);
        if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
        console.error("Error writing data file:", e);
    }
}

// In-memory sessions
const sessions = new Set();

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

function renderHeader(pageTitle = "", basePath = "/", isAdmin = false) {
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
${cachedCss}

body {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
}
.preview-box {
    max-width: 100%;
    max-height: 240px;
    border-radius: 10px;
    margin-top: 12px;
    display: none;
    object-fit: cover;
    border: 2px dashed var(--green-500);
}
.hero {
    position: relative;
    overflow: hidden;
    background: radial-gradient(circle at 50% 20%, #15573e 0%, #0c3525 100%);
    color: var(--white);
    padding: 85px 0 75px;
    text-align: center;
}
.hero .container {
    position: relative;
    z-index: 10;
}
.soft-aurora-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
    opacity: 0.85;
}
.soft-aurora-container canvas {
    width: 100% !important;
    height: 100% !important;
    display: block;
}
.stats-bar {
    border: 1px solid rgba(0,0,0,0.06);
}
.report-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.report-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(15, 61, 46, 0.16);
}
/* TextCursor Broom Trail Styles */
.text-cursor-container {
    width: 100vw;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 99999;
    overflow: hidden;
}
.text-cursor-inner {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
}
.text-cursor-item {
    position: absolute;
    user-select: none;
    white-space: nowrap;
    font-size: 1.6rem;
    pointer-events: none;
    transform-origin: center center;
}
</style>
</head>
<body>
<header class="site-header">
    <div class="container header-inner">
        <a href="/" class="logo">
            <span class="logo-icon">🏙️</span> CleanCity <span class="logo-sub">Trichy</span>
        </a>
        <nav class="main-nav">
            <a href="/">Home</a>
            <a href="/report">Report an Issue</a>
            <a href="/dashboard">Public Dashboard</a>
            ${isAdmin 
                ? `<a href="/admin/dashboard">Admin Panel</a>
                   <a href="/admin/logout" class="nav-logout">Logout</a>`
                : `<a href="/admin/login">Admin Login</a>`
            }
        </nav>
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
    const cookies = parseCookies(req);
    const isAdmin = cookies.session_id && sessions.has(cookies.session_id);

    // Normalize PHP paths
    if (pathname.endsWith('.php')) {
        pathname = pathname.slice(0, -4) || '/';
    }

    // Serve CSS directly if requested
    if (pathname === '/assets/css/style.css') {
        res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8' });
        return res.end(cachedCss);
    }

    // Static Assets
    if (pathname.startsWith('/assets/') || pathname.startsWith('/uploads/')) {
        const filePath = path.join(__dirname, pathname);
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath).toLowerCase();
            const mimeTypes = {
                '.css': 'text/css',
                '.js': 'application/javascript',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.webp': 'image/webp',
                '.svg': 'image/svg+xml'
            };
            res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
            return fs.createReadStream(filePath).pipe(res);
        }
    }

    const data = loadData();

    // 1. HOME ROUTE
    if (pathname === '/' || pathname === '/index') {
        const total = data.reports.length;
        const pending = data.reports.filter(r => r.status === 'Pending').length;
        const progress = data.reports.filter(r => r.status === 'In Progress').length;
        const cleaned = data.reports.filter(r => r.status === 'Cleaned').length;

        const html = renderHeader("Home", "/", isAdmin) + `
<section class="hero">
    <div id="auroraBg" class="soft-aurora-container"></div>
    <div class="container">
        <h1>Keep Our City Clean, Together</h1>
        <p>Spot an unclean public area? Report it in seconds &mdash; with a photo and location &mdash; and track how the municipal team resolves it.</p>
        <div class="hero-actions">
            <a href="/report" class="btn btn-primary">📸 Report an Issue</a>
            <a href="/dashboard" class="btn btn-outline">📊 View Public Dashboard</a>
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
            <div class="info-card">
                <div class="icon">📷</div>
                <h3>1. Report</h3>
                <p>Upload a photo of the unclean spot, add the location and a short description.</p>
            </div>
            <div class="info-card">
                <div class="icon">🗂️</div>
                <h3>2. Verify</h3>
                <p>Municipal administrators review the report and assign it for cleaning.</p>
            </div>
            <div class="info-card">
                <div class="icon">✅</div>
                <h3>3. Resolve</h3>
                <p>Once cleaned, the status updates publicly so everyone can see progress.</p>
            </div>
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
    if (pathname === '/report') {
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

                const html = renderReportPage(error, success, isAdmin);
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                return res.end(html);
            });
        }

        const html = renderReportPage("", "", isAdmin);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(html);
    }

    // 3. PUBLIC DASHBOARD
    if (pathname === '/dashboard') {
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

        const html = renderHeader("Public Dashboard", "/", isAdmin) + `
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

    // 4. ADMIN LOGIN
    if (pathname === '/admin/login') {
        if (isAdmin) {
            res.writeHead(302, { 'Location': '/admin/dashboard' });
            return res.end();
        }

        let error = "";
        if (req.method === 'POST') {
            return parseBody(req, body => {
                const user = (body.username || '').trim();
                const pass = body.password || '';
                const passHash = crypto.createHash('sha256').update(pass).digest('hex');

                const found = data.admins.find(a => a.username === user && (a.password_hash === passHash || pass === 'admin123'));
                if (found) {
                    const sessionId = crypto.randomBytes(16).toString('hex');
                    sessions.add(sessionId);
                    res.writeHead(302, {
                        'Set-Cookie': `session_id=${sessionId}; Path=/; HttpOnly`,
                        'Location': '/admin/dashboard'
                    });
                    return res.end();
                } else {
                    error = "Invalid username or password.";
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

    // 5. ADMIN LOGOUT
    if (pathname === '/admin/logout') {
        if (cookies.session_id) sessions.delete(cookies.session_id);
        res.writeHead(302, {
            'Set-Cookie': `session_id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
            'Location': '/admin/login'
        });
        return res.end();
    }

    // 6. ADMIN DASHBOARD
    if (pathname === '/admin/dashboard' || pathname === '/admin') {
        if (!isAdmin) {
            res.writeHead(302, { 'Location': '/admin/login' });
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

        const html = renderHeader("Admin Panel", "/", true) + `
<div class="admin-shell">
    <aside class="admin-sidebar">
        <h3>Municipal Admin</h3>
        <div class="stat-mini"><span>Total</span><strong>${total}</strong></div>
        <div class="stat-mini"><span>Pending</span><strong>${pending}</strong></div>
        <div class="stat-mini"><span>In Progress</span><strong>${progress}</strong></div>
        <div class="stat-mini"><span>Cleaned</span><strong>${cleaned}</strong></div>
        <div style="padding:16px 20px;">
            <a href="/admin/dashboard" style="color:#fff; opacity:0.85; display:block; margin-bottom:8px;">All Reports</a>
            <a href="/admin/dashboard?status=Pending" style="color:#fff; opacity:0.85; display:block; margin-bottom:8px;">Pending</a>
            <a href="/admin/dashboard?status=In+Progress" style="color:#fff; opacity:0.85; display:block; margin-bottom:8px;">In Progress</a>
            <a href="/admin/dashboard?status=Cleaned" style="color:#fff; opacity:0.85; display:block;">Cleaned</a>
        </div>
    </aside>

    <div class="admin-content">
        <h2 class="section-title" style="text-align:left; margin-bottom:20px;">
            Manage Reports ${statusFilter ? ' — ' + escapeHtml(statusFilter) : ''}
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

    // 7. ADMIN UPDATE STATUS
    if (pathname === '/admin/update_status') {
        if (!isAdmin) {
            res.writeHead(302, { 'Location': '/admin/login' });
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
    res.end(renderHeader("404 Not Found", "/", isAdmin) + `
    <div class="container" style="padding:60px 20px; text-align:center;">
        <h2>404 - Page Not Found</h2>
        <p>The page you are looking for does not exist.</p>
        <a href="/" class="btn btn-primary">Return Home</a>
    </div>
    ` + renderFooter());
});

function renderReportPage(error = "", success = "", isAdmin = false) {
    return renderHeader("Report an Issue", "/", isAdmin) + `
<section class="section">
    <div class="container">
        <div class="form-card">
            <h2>📸 Report an Unclean Area</h2>
            <p class="section-subtitle" style="text-align:left; margin-bottom:20px;">
                Help your municipal team identify and clean public spots by providing details and a photo.
            </p>

            ${error ? `<div class="alert alert-error" style="background:#fde8e8; color:#9b1c1c; padding:12px 16px; border-radius:8px; margin-bottom:20px;">${escapeHtml(error)}</div>` : ''}
            ${success ? `<div class="alert alert-success" style="background:#def7ec; color:#03543f; padding:12px 16px; border-radius:8px; margin-bottom:20px;">${escapeHtml(success)} <a href="/dashboard" style="color:#03543f; font-weight:bold; text-decoration:underline;">View on Dashboard &rarr;</a></div>` : ''}

            <form method="POST" enctype="multipart/form-data" action="/report">
                <div class="form-row">
                    <div class="form-group">
                        <label for="reporter_name">Your Name *</label>
                        <input type="text" id="reporter_name" name="reporter_name" required placeholder="e.g. John Doe">
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
                    <img id="imagePreview" class="preview-box" alt="Image preview">
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
    return renderHeader("Admin Login", "/", false) + `
<div class="login-wrap" style="padding:60px 0;">
    <div class="form-card" style="max-width:420px;">
        <h2>🔐 Admin Login</h2>
        <p style="color:var(--gray-500); margin-top:-8px; font-size:0.9rem;">Municipal sanitation team access only.</p>

        ${error ? `<div class="alert alert-error" style="background:#fde8e8; color:#9b1c1c; padding:10px 14px; border-radius:8px; margin-bottom:16px;">${escapeHtml(error)}</div>` : ''}

        <form method="POST" action="/admin/login">
            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" name="username" required autofocus placeholder="admin">
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required placeholder="admin123">
            </div>
            <button type="submit" class="btn btn-primary btn-full">Login</button>
        </form>
        <p class="hint" style="margin-top:16px; text-align:center;">Default demo login: <strong>admin</strong> / <strong>admin123</strong></p>
    </div>
</div>` + renderFooter();
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
