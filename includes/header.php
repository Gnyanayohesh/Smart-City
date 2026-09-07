<?php if (session_status() === PHP_SESSION_NONE) session_start();
$currentPage = basename($_SERVER['PHP_SELF']);
$currentDir = basename(dirname($_SERVER['PHP_SELF']));
$role = isset($_SESSION['role']) ? $_SESSION['role'] : (isset($_SESSION['admin_id']) ? 'admin' : null);
$userFullName = isset($_SESSION['full_name']) ? $_SESSION['full_name'] : '';
$base = isset($basePath) ? $basePath : '';
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?php echo isset($pageTitle) ? htmlspecialchars($pageTitle) . " | " : ""; ?>Smart City Cleanliness Reporting System</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="icon" type="image/png" href="<?php echo $base; ?>assets/images/logo.png">
<link rel="stylesheet" href="<?php echo $base; ?>assets/css/style.css">
</head>
<body>
<div class="site-noise" aria-hidden="true"></div>
<header class="site-header">
    <div class="container header-inner">
        <a class="brand-lockup" href="<?php echo $base; ?>index.php" aria-label="CleanCity Trichy home">
            <span class="brand-symbol"><img src="<?php echo $base; ?>assets/images/logo.png" alt="CleanCity Logo" class="brand-logo-img"></span>
            <span class="brand-copy"><strong>CleanCity</strong><small>TRICHY / CIVIC NETWORK</small></span>
        </a>
        <div class="header-status"><span class="status-dot"></span> PUBLIC SERVICE / LIVE</div>
        <nav class="site-nav" aria-label="Primary navigation">
            <a href="<?php echo $base; ?>index.php" class="nav-link <?php echo ($currentPage === 'index.php') ? 'is-active' : ''; ?>">Overview</a>
            <a href="<?php echo $base; ?>report.php" class="nav-link <?php echo ($currentPage === 'report.php') ? 'is-active' : ''; ?>">Report issue</a>
            <a href="<?php echo $base; ?>dashboard.php" class="nav-link <?php echo ($currentPage === 'dashboard.php') ? 'is-active' : ''; ?>">Live board</a>
            <?php if ($role === 'admin'): ?>
                <a href="<?php echo $base; ?>admin/dashboard.php" class="nav-link <?php echo ($currentDir === 'admin' && $currentPage === 'dashboard.php') ? 'is-active' : ''; ?>">Admin</a>
                <a href="<?php echo $base; ?>logout.php" class="nav-link nav-logout-pill">Exit</a>
            <?php elseif ($role === 'cleaner'): ?>
                <a href="<?php echo $base; ?>cleaner.php" class="nav-link <?php echo ($currentPage === 'cleaner.php') ? 'is-active' : ''; ?>">My missions</a>
                <a href="<?php echo $base; ?>logout.php" class="nav-link nav-logout-pill">Exit</a>
            <?php elseif ($role === 'user'): ?>
                <span class="nav-user">/ <?php echo htmlspecialchars($userFullName ?: 'Citizen'); ?></span>
                <a href="<?php echo $base; ?>logout.php" class="nav-link nav-logout-pill">Exit</a>
            <?php else: ?>
                <a href="<?php echo $base; ?>login.php" class="nav-link <?php echo ($currentPage === 'login.php') ? 'is-active' : ''; ?>">Sign in</a>
            <?php endif; ?>
        </nav>
        <button class="mobile-menu-button" id="mobileMenuBtn" aria-label="Toggle menu" type="button" aria-expanded="false"><span></span><span></span></button>
    </div>
    <div class="mobile-menu-popover" id="mobileMenuPopover" aria-hidden="true">
        <a href="<?php echo $base; ?>index.php" class="mobile-menu-link">Overview</a>
        <a href="<?php echo $base; ?>report.php" class="mobile-menu-link">Report issue</a>
        <a href="<?php echo $base; ?>dashboard.php" class="mobile-menu-link">Live board</a>
        <?php if ($role === 'admin'): ?><a href="<?php echo $base; ?>admin/dashboard.php" class="mobile-menu-link">Admin</a><?php endif; ?>
        <?php if ($role === 'cleaner'): ?><a href="<?php echo $base; ?>cleaner.php" class="mobile-menu-link">My missions</a><?php endif; ?>
        <?php if ($role): ?><a href="<?php echo $base; ?>logout.php" class="mobile-menu-link">Exit session</a><?php else: ?><a href="<?php echo $base; ?>login.php" class="mobile-menu-link">Sign in</a><?php endif; ?>
    </div>
</header>
<main>
