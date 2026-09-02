<?php
require_once 'config/db.php';
$pageTitle = "Home";

$total = $conn->query("SELECT COUNT(*) c FROM reports")->fetch_assoc()['c'];
$pending = $conn->query("SELECT COUNT(*) c FROM reports WHERE status='Pending'")->fetch_assoc()['c'];
$progress = $conn->query("SELECT COUNT(*) c FROM reports WHERE status='In Progress'")->fetch_assoc()['c'];
$cleaned = $conn->query("SELECT COUNT(*) c FROM reports WHERE status='Cleaned'")->fetch_assoc()['c'];

require_once 'includes/header.php';
?>

<section class="hero">
    <div id="galaxyBg" class="galaxy-container"></div>
    <div class="container">
        <h1>Keep Our City Clean, Together</h1>
        <p>Spot an unclean public area? Report it in seconds &mdash; with a photo and location &mdash; and track how the municipal team resolves it.</p>
        <div class="hero-actions">
            <a href="report.php" class="btn btn-primary">📸 Report an Issue</a>
            <a href="dashboard.php" class="btn btn-outline">📊 View Public Dashboard</a>
        </div>
    </div>
</section>

<div class="container">
    <div class="stats-bar">
        <div class="stat"><div class="num"><?php echo $total; ?></div><div class="label">Total Reports</div></div>
        <div class="stat"><div class="num"><?php echo $pending; ?></div><div class="label">Pending</div></div>
        <div class="stat"><div class="num"><?php echo $progress; ?></div><div class="label">In Progress</div></div>
        <div class="stat"><div class="num"><?php echo $cleaned; ?></div><div class="label">Cleaned</div></div>
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

<section class="section" style="background:var(--white); padding-top:10px;">
    <div class="container" style="text-align:center;">
        <h2 class="section-title">Supporting SDG 11</h2>
        <p class="section-subtitle" style="max-width:700px; margin-left:auto; margin-right:auto;">
            This platform contributes to Sustainable Development Goal 11: Sustainable Cities and Communities,
            by encouraging active citizen participation and improving transparency between the public and the
            municipal sanitation department.
        </p>
        <a href="report.php" class="btn btn-secondary">Submit Your First Report</a>
    </div>
</section>

<?php require_once 'includes/footer.php'; ?>
