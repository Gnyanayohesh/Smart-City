<?php if (session_status() === PHP_SESSION_NONE) session_start(); ?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?php echo isset($pageTitle) ? htmlspecialchars($pageTitle) . " | " : ""; ?>Smart City Cleanliness Reporting System</title>
<link rel="stylesheet" href="<?php echo isset($basePath) ? $basePath : ''; ?>assets/css/style.css">
</head>
<body>
<header class="site-header">
    <div class="container header-inner">
        <a href="<?php echo isset($basePath) ? $basePath : ''; ?>index.php" class="logo">
            <span class="logo-icon">🏙️</span> CleanCity <span class="logo-sub">Trichy</span>
        </a>
        <nav class="main-nav">
            <a href="<?php echo isset($basePath) ? $basePath : ''; ?>index.php">Home</a>
            <a href="<?php echo isset($basePath) ? $basePath : ''; ?>report.php">Report an Issue</a>
            <a href="<?php echo isset($basePath) ? $basePath : ''; ?>dashboard.php">Public Dashboard</a>
            <?php if (isset($_SESSION['admin_id'])): ?>
                <a href="<?php echo isset($basePath) ? $basePath : ''; ?>admin/dashboard.php">Admin Panel</a>
                <a href="<?php echo isset($basePath) ? $basePath : ''; ?>admin/logout.php" class="nav-logout">Logout</a>
            <?php else: ?>
                <a href="<?php echo isset($basePath) ? $basePath : ''; ?>admin/login.php">Admin Login</a>
            <?php endif; ?>
        </nav>
    </div>
</header>
<main>
