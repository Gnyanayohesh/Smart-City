<?php
require_once 'config/db.php';
if (session_status() === PHP_SESSION_NONE) session_start();
$pageTitle = "Login";
$error = "";

if (isset($_SESSION['role'])) {
    if ($_SESSION['role'] === 'admin') {
        header("Location: admin/dashboard.php");
    } elseif ($_SESSION['role'] === 'cleaner') {
        header("Location: cleaner.php");
    } else {
        header("Location: report.php");
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    // Check predefined multi-role demo credentials
    if ($username === 'admin' && ($password === 'admin123' || $password === 'admin')) {
        $_SESSION['admin_id'] = 1;
        $_SESSION['role'] = 'admin';
        $_SESSION['full_name'] = 'Municipal Administrator';
        header("Location: admin/dashboard.php");
        exit;
    } elseif ($username === 'cleaner' && ($password === 'cleaner123' || $password === 'cleaner')) {
        $_SESSION['user_id'] = 2;
        $_SESSION['role'] = 'cleaner';
        $_SESSION['full_name'] = 'Sanitation Staff (Ramesh)';
        header("Location: cleaner.php");
        exit;
    } elseif ($username === 'user' && ($password === 'user123' || $password === 'user')) {
        $_SESSION['user_id'] = 3;
        $_SESSION['role'] = 'user';
        $_SESSION['full_name'] = 'Citizen (Yohesh)';
        header("Location: report.php");
        exit;
    } else {
        $error = "Invalid username or password. Please select a demo account below.";
    }
}

require_once 'includes/header.php';
?>

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

        <?php if ($error): ?>
            <div class="alert alert-error"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>

        <form method="POST" id="loginForm">
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

<?php require_once 'includes/footer.php'; ?>
