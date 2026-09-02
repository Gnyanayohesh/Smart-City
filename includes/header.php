<?php if (session_status() === PHP_SESSION_NONE) session_start(); 
$currentPage = basename($_SERVER['PHP_SELF']);
$currentDir = basename(dirname($_SERVER['PHP_SELF']));
$role = isset($_SESSION['role']) ? $_SESSION['role'] : (isset($_SESSION['admin_id']) ? 'admin' : null);
$userFullName = isset($_SESSION['full_name']) ? $_SESSION['full_name'] : '';
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?php echo isset($pageTitle) ? htmlspecialchars($pageTitle) . " | " : ""; ?>Smart City Cleanliness Reporting System</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="<?php echo isset($basePath) ? $basePath : ''; ?>assets/css/style.css">
</head>
<body>
<header class="site-header">
    <div class="container header-inner">
        <div class="pill-nav-container">
            <nav class="pill-nav" aria-label="Primary">
                <a href="<?php echo isset($basePath) ? $basePath : ''; ?>index.php" class="pill-logo cursor-target" aria-label="Home">
                    <span class="logo-emoji">🏙️</span>
                    <span>CleanCity <small style="font-weight:400; opacity:0.85; font-size:0.8rem;">Trichy</small></span>
                </a>
                <div class="pill-nav-items desktop-only">
                    <ul class="pill-list" role="menubar">
                        <li><a href="<?php echo isset($basePath) ? $basePath : ''; ?>index.php" class="pill cursor-target <?php echo ($currentPage === 'index.php') ? 'is-active' : ''; ?>">Home</a></li>
                        <li><a href="<?php echo isset($basePath) ? $basePath : ''; ?>report.php" class="pill cursor-target <?php echo ($currentPage === 'report.php') ? 'is-active' : ''; ?>">Report Issue</a></li>
                        <li><a href="<?php echo isset($basePath) ? $basePath : ''; ?>dashboard.php" class="pill cursor-target <?php echo ($currentPage === 'dashboard.php') ? 'is-active' : ''; ?>">Public Dashboard</a></li>
                        
                        <?php if ($role === 'admin'): ?>
                            <li><a href="<?php echo isset($basePath) ? $basePath : ''; ?>admin/dashboard.php" class="pill cursor-target <?php echo ($currentDir === 'admin' && $currentPage === 'dashboard.php') ? 'is-active' : ''; ?>">👑 Admin Panel</a></li>
                            <li><a href="<?php echo isset($basePath) ? $basePath : ''; ?>logout.php" class="pill cursor-target nav-logout-pill">Logout</a></li>
                        <?php elseif ($role === 'cleaner'): ?>
                            <li><a href="<?php echo isset($basePath) ? $basePath : ''; ?>cleaner.php" class="pill cursor-target <?php echo ($currentPage === 'cleaner.php') ? 'is-active' : ''; ?>">🧹 Cleaner Portal</a></li>
                            <li><a href="<?php echo isset($basePath) ? $basePath : ''; ?>logout.php" class="pill cursor-target nav-logout-pill">Logout (Cleaner)</a></li>
                        <?php elseif ($role === 'user'): ?>
                            <li><a href="<?php echo isset($basePath) ? $basePath : ''; ?>dashboard.php" class="pill cursor-target">👤 <?php echo htmlspecialchars($userFullName ?: 'Citizen'); ?></a></li>
                            <li><a href="<?php echo isset($basePath) ? $basePath : ''; ?>logout.php" class="pill cursor-target nav-logout-pill">Logout</a></li>
                        <?php else: ?>
                            <li><a href="<?php echo isset($basePath) ? $basePath : ''; ?>login.php" class="pill cursor-target <?php echo ($currentPage === 'login.php') ? 'is-active' : ''; ?>">Login</a></li>
                        <?php endif; ?>
                    </ul>
                </div>
                <button class="mobile-menu-button mobile-only cursor-target" id="mobileMenuBtn" aria-label="Toggle menu" type="button" aria-expanded="false">
                    <span class="hamburger-line"></span>
                    <span class="hamburger-line"></span>
                </button>
            </nav>
            <div class="mobile-menu-popover mobile-only" id="mobileMenuPopover" aria-hidden="true">
                <ul class="mobile-menu-list">
                    <li><a href="<?php echo isset($basePath) ? $basePath : ''; ?>index.php" class="mobile-menu-link cursor-target <?php echo ($currentPage === 'index.php') ? 'is-active' : ''; ?>">🏠 Home</a></li>
                    <li><a href="<?php echo isset($basePath) ? $basePath : ''; ?>report.php" class="mobile-menu-link cursor-target <?php echo ($currentPage === 'report.php') ? 'is-active' : ''; ?>">📸 Report Issue</a></li>
                    <li><a href="<?php echo isset($basePath) ? $basePath : ''; ?>dashboard.php" class="mobile-menu-link cursor-target <?php echo ($currentPage === 'dashboard.php') ? 'is-active' : ''; ?>">📊 Public Dashboard</a></li>
                    <?php if ($role === 'admin'): ?>
                        <li><a href="<?php echo isset($basePath) ? $basePath : ''; ?>admin/dashboard.php" class="mobile-menu-link cursor-target <?php echo ($currentDir === 'admin' && $currentPage === 'dashboard.php') ? 'is-active' : ''; ?>">👑 Admin Panel</a></li>
                        <li><a href="<?php echo isset($basePath) ? $basePath : ''; ?>logout.php" class="mobile-menu-link cursor-target" style="background:#ffe3e3; color:#d64545 !important;">🚪 Logout</a></li>
                    <?php elseif ($role === 'cleaner'): ?>
                        <li><a href="<?php echo isset($basePath) ? $basePath : ''; ?>cleaner.php" class="mobile-menu-link cursor-target <?php echo ($currentPage === 'cleaner.php') ? 'is-active' : ''; ?>">🧹 Cleaner Portal</a></li>
                        <li><a href="<?php echo isset($basePath) ? $basePath : ''; ?>logout.php" class="mobile-menu-link cursor-target" style="background:#ffe3e3; color:#d64545 !important;">🚪 Logout (Cleaner)</a></li>
                    <?php elseif ($role === 'user'): ?>
                        <li><a href="<?php echo isset($basePath) ? $basePath : ''; ?>logout.php" class="mobile-menu-link cursor-target" style="background:#ffe3e3; color:#d64545 !important;">🚪 Logout (<?php echo htmlspecialchars($userFullName ?: 'Citizen'); ?>)</a></li>
                    <?php else: ?>
                        <li><a href="<?php echo isset($basePath) ? $basePath : ''; ?>login.php" class="mobile-menu-link cursor-target <?php echo ($currentPage === 'login.php') ? 'is-active' : ''; ?>">🔑 Login</a></li>
                    <?php endif; ?>
                </ul>
            </div>
        </div>
    </div>
</header>
<main>
