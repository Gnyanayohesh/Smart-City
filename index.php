<?php
require_once 'config/db.php';
$pageTitle = "Home";

$total = $conn->query("SELECT COUNT(*) c FROM reports")->fetch_assoc()['c'];
$pending = $conn->query("SELECT COUNT(*) c FROM reports WHERE status='Pending'")->fetch_assoc()['c'];
$progress = $conn->query("SELECT COUNT(*) c FROM reports WHERE status='In Progress'")->fetch_assoc()['c'];
$cleaned = $conn->query("SELECT COUNT(*) c FROM reports WHERE status='Cleaned'")->fetch_assoc()['c'];

require_once 'includes/header.php';
?>
<section class="landing-hero">
    <div class="hero-grid-lines" aria-hidden="true"></div>
    <div class="container landing-hero-inner">
        <div class="eyebrow"><span class="eyebrow-index">001</span> CIVIC CLEANLINESS / TIRUCHIRAPPALLI</div>
        <h1>Make the<br><em>invisible</em> visible.</h1>
        <div class="hero-bottomline">
            <p>One photo. One location. One accountable response. CleanCity turns everyday observations into a public record of action.</p>
            <div class="hero-actions"><a href="report.php" class="btn btn-primary">Start a report <span>↗</span></a><a href="dashboard.php" class="text-link">Explore live board <span>→</span></a></div>
        </div>
    </div>
</section>

<section class="signal-strip">
    <div class="container signal-grid">
        <div class="signal-intro"><span class="section-number">/ 02</span><strong>THE CITY, IN SIGNALS</strong><p>Every report is a data point. Every resolution is visible.</p></div>
        <div class="signal-stat"><span class="stat-label">ALL REPORTS</span><strong><?php echo $total; ?></strong><span class="stat-rule"></span></div>
        <div class="signal-stat"><span class="stat-label">PENDING</span><strong><?php echo $pending; ?></strong><span class="stat-rule"></span></div>
        <div class="signal-stat"><span class="stat-label">IN PROGRESS</span><strong><?php echo $progress; ?></strong><span class="stat-rule"></span></div>
        <div class="signal-stat"><span class="stat-label">RESOLVED</span><strong><?php echo $cleaned; ?></strong><span class="stat-rule"></span></div>
    </div>
</section>

<section class="section process-section">
    <div class="container">
        <div class="section-heading"><span class="section-number">/ 03</span><h2>From observation<br>to resolution.</h2><p>A simple civic loop designed to keep everyone informed.</p></div>
        <div class="process-grid">
            <article class="process-card"><span class="process-index">01</span><span class="process-icon">+</span><h3>Report</h3><p>Capture the issue with a photo, a location, and a clear description.</p><a href="report.php">Submit evidence <span>↗</span></a></article>
            <article class="process-card process-card-dark"><span class="process-index">02</span><span class="process-icon">◎</span><h3>Route</h3><p>The municipal team verifies the report and routes it to the right cleaner.</p><a href="dashboard.php">See the network <span>↗</span></a></article>
            <article class="process-card"><span class="process-index">03</span><span class="process-icon">✓</span><h3>Resolve</h3><p>Progress is updated publicly, so a clean result is shared by everyone.</p><a href="login.php">Access portal <span>↗</span></a></article>
        </div>
    </div>
</section>

<section class="manifesto-section"><div class="container manifesto-inner"><span class="section-number">/ 04</span><p>“A clean street is not just a service delivered. It is a promise kept in public.”</p><a href="report.php" class="btn btn-secondary">Add your signal <span>↗</span></a></div></section>
<?php require_once 'includes/footer.php'; ?>
