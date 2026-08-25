<?php if (session_status() === PHP_SESSION_NONE) session_start(); 
$currentPage = basename($_SERVER['PHP_SELF']);
$currentDir = basename(dirname($_SERVER['PHP_SELF']));
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
                <a href="<?php echo isset($basePath) ? $basePath : ''; ?>index.php" class="pill-logo" aria-label="Home">
                    <span class="logo-emoji">🏙️</span>
                    <span>CleanCity <small style="font-weight:400; opacity:0.85; font-size:0.8rem;">Trichy</small></span>
                </a>
                <div class="pill-nav-items desktop-only">
                    <ul class="pill-list" role="menubar">
                        <li><a href="<?php echo isset($basePath) ? $basePath : ''; ?>index.php" class="pill <?php echo ($currentPage === 'index.php') ? 'is-active' : ''; ?>">Home</a></li>
                        <li><a href="<?php echo isset($basePath) ? $basePath : ''; ?>report.php" class="pill <?php echo ($currentPage === 'report.php') ? 'is-active' : ''; ?>">Report Issue</a></li>
                        <li><a href="<?php echo isset($basePath) ? $basePath : ''; ?>dashboard.php" class="pill <?php echo ($currentPage === 'dashboard.php') ? 'is-active' : ''; ?>">Public Dashboard</a></li>
                        <?php if (isset($_SESSION['admin_id'])): ?>
                            <li><a href="<?php echo isset($basePath) ? $basePath : ''; ?>admin/dashboard.php" class="pill <?php echo ($currentDir === 'admin' && $currentPage === 'dashboard.php') ? 'is-active' : ''; ?>">Admin Panel</a></li>
                            <li><a href="<?php echo isset($basePath) ? $basePath : ''; ?>admin/logout.php" class="pill nav-logout-pill">Logout</a></li>
                        <?php else: ?>
                            <li><a href="<?php echo isset($basePath) ? $basePath : ''; ?>admin/login.php" class="pill <?php echo ($currentPage === 'login.php') ? 'is-active' : ''; ?>">Admin Login</a></li>
                        <?php endif; ?>
                    </ul>
                </div>
                <button class="mobile-menu-button mobile-only" id="mobileMenuBtn" aria-label="Toggle menu">
                    <span class="hamburger-line"></span>
                    <span class="hamburger-line"></span>
                </button>
            </nav>
            <div class="mobile-menu-popover mobile-only" id="mobileMenuPopover">
                <ul class="mobile-menu-list">
                    <li><a href="<?php echo isset($basePath) ? $basePath : ''; ?>index.php" class="mobile-menu-link <?php echo ($currentPage === 'index.php') ? 'is-active' : ''; ?>">Home</a></li>
                    <li><a href="<?php echo isset($basePath) ? $basePath : ''; ?>report.php" class="mobile-menu-link <?php echo ($currentPage === 'report.php') ? 'is-active' : ''; ?>">Report Issue</a></li>
                    <li><a href="<?php echo isset($basePath) ? $basePath : ''; ?>dashboard.php" class="mobile-menu-link <?php echo ($currentPage === 'dashboard.php') ? 'is-active' : ''; ?>">Public Dashboard</a></li>
                    <?php if (isset($_SESSION['admin_id'])): ?>
                        <li><a href="<?php echo isset($basePath) ? $basePath : ''; ?>admin/dashboard.php" class="mobile-menu-link <?php echo ($currentDir === 'admin' && $currentPage === 'dashboard.php') ? 'is-active' : ''; ?>">Admin Panel</a></li>
                        <li><a href="<?php echo isset($basePath) ? $basePath : ''; ?>admin/logout.php" class="mobile-menu-link" style="background:#ffe3e3; color:#d64545 !important;">Logout</a></li>
                    <?php else: ?>
                        <li><a href="<?php echo isset($basePath) ? $basePath : ''; ?>admin/login.php" class="mobile-menu-link <?php echo ($currentPage === 'login.php') ? 'is-active' : ''; ?>">Admin Login</a></li>
                    <?php endif; ?>
                </ul>
            </div>
        </div>
    </div>
</header>
<main>
