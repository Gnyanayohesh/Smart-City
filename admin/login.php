<?php
require_once '../config/db.php';
if (session_status() === PHP_SESSION_NONE) session_start();
$pageTitle = "Admin Login";
$basePath = "../";
$error = "";

if (isset($_SESSION['admin_id'])) {
    header("Location: dashboard.php");
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    $stmt = $conn->prepare("SELECT admin_id, username, password, full_name FROM admins WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $res = $stmt->get_result();

    if ($res->num_rows === 1) {
        $admin = $res->fetch_assoc();
        if (password_verify($password, $admin['password'])) {
            $_SESSION['admin_id'] = $admin['admin_id'];
            $_SESSION['admin_name'] = $admin['full_name'];
            header("Location: dashboard.php");
            exit;
        } else {
            $error = "Invalid username or password.";
        }
    } else {
        $error = "Invalid username or password.";
    }
    $stmt->close();
}

require_once '../includes/header.php';
?>

<div class="login-wrap">
    <div class="form-card" style="max-width:420px;">
        <h2>🔐 Admin Login</h2>
        <p style="color:var(--gray-500); margin-top:-8px; font-size:0.9rem;">Municipal sanitation team access only.</p>

        <?php if ($error): ?>
            <div class="alert alert-error"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>

        <form method="POST">
            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" name="username" required autofocus>
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
            </div>
            <button type="submit" class="btn btn-primary btn-full">Login</button>
        </form>
        <p class="hint" style="margin-top:16px;">Default demo login: <strong>admin</strong> / <strong>admin123</strong></p>
    </div>
</div>

<?php require_once '../includes/footer.php'; ?>
