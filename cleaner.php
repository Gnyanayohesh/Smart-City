<?php
require_once 'config/db.php';
if (session_status() === PHP_SESSION_NONE) session_start();

if (!isset($_SESSION['role']) || ($_SESSION['role'] !== 'cleaner' && $_SESSION['role'] !== 'admin')) {
    header("Location: login.php");
    exit;
}

$pageTitle = "Cleaner Portal";

// Handle status update
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['report_id'], $_POST['status'])) {
    $reportId = (int)$_POST['report_id'];
    $newStatus = $_POST['status'];
    if (in_array($newStatus, ['Pending', 'In Progress', 'Cleaned'])) {
        $stmt = $conn->prepare("UPDATE reports SET status = ? WHERE report_id = ?");
        $stmt->bind_param("si", $newStatus, $reportId);
        $stmt->execute();
        $stmt->close();
    }
    header("Location: cleaner.php");
    exit;
}

$statusFilter = $_GET['status'] ?? '';
$whereClause = "";
$params = [];
$types = "";

if (in_array($statusFilter, ['Pending', 'In Progress', 'Cleaned'])) {
    $whereClause = " WHERE status = ?";
    $params[] = $statusFilter;
    $types .= "s";
}

$sql = "SELECT * FROM reports" . $whereClause . " ORDER BY submitted_at DESC";
$stmt = $conn->prepare($sql);
if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$reports = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

$total = $conn->query("SELECT COUNT(*) AS c FROM reports")->fetch_assoc()['c'];
$pending = $conn->query("SELECT COUNT(*) AS c FROM reports WHERE status = 'Pending'")->fetch_assoc()['c'];
$progress = $conn->query("SELECT COUNT(*) AS c FROM reports WHERE status = 'In Progress'")->fetch_assoc()['c'];
$cleaned = $conn->query("SELECT COUNT(*) AS c FROM reports WHERE status = 'Cleaned'")->fetch_assoc()['c'];

require_once 'includes/header.php';
?>

<section class="section">
    <div class="container">
        <div class="cleaner-header-banner">
            <div>
                <h2>🧹 Sanitation Worker Portal</h2>
                <p>Welcome, <strong><?php echo htmlspecialchars($_SESSION['full_name'] ?? 'Sanitation Staff'); ?></strong>! View civic garbage reports and update progress after cleaning.</p>
            </div>
            <div style="background:rgba(255,255,255,0.15); padding:10px 18px; border-radius:10px; font-weight:700;">
                Role: Sanitation Cleaner
            </div>
        </div>

        <div class="stats-bar" style="margin-top:0; margin-bottom:30px;">
            <div class="stat"><div class="num"><?php echo $total; ?></div><div class="label">Total Tasks</div></div>
            <div class="stat"><div class="num"><?php echo $pending; ?></div><div class="label">Pending Action</div></div>
            <div class="stat"><div class="num"><?php echo $progress; ?></div><div class="label">In Progress</div></div>
            <div class="stat"><div class="num"><?php echo $cleaned; ?></div><div class="label">Cleaned by Team</div></div>
        </div>

        <div class="filter-bar">
            <div>
                <strong>Filter Tasks:</strong>
                <a href="cleaner.php" class="btn <?php echo empty($statusFilter) ? 'btn-secondary' : 'btn-outline'; ?>" style="margin-left:8px; padding:6px 12px; font-size:0.85rem; color:<?php echo empty($statusFilter) ? '#fff' : 'var(--green-900)'; ?>; border-color:var(--green-900);">All (<?php echo $total; ?>)</a>
                <a href="cleaner.php?status=Pending" class="btn <?php echo $statusFilter === 'Pending' ? 'btn-secondary' : 'btn-outline'; ?>" style="margin-left:4px; padding:6px 12px; font-size:0.85rem; color:<?php echo $statusFilter === 'Pending' ? '#fff' : 'var(--green-900)'; ?>; border-color:var(--green-900);">Pending (<?php echo $pending; ?>)</a>
                <a href="cleaner.php?status=In+Progress" class="btn <?php echo $statusFilter === 'In Progress' ? 'btn-secondary' : 'btn-outline'; ?>" style="margin-left:4px; padding:6px 12px; font-size:0.85rem; color:<?php echo $statusFilter === 'In Progress' ? '#fff' : 'var(--green-900)'; ?>; border-color:var(--green-900);">In Progress (<?php echo $progress; ?>)</a>
                <a href="cleaner.php?status=Cleaned" class="btn <?php echo $statusFilter === 'Cleaned' ? 'btn-secondary' : 'btn-outline'; ?>" style="margin-left:4px; padding:6px 12px; font-size:0.85rem; color:<?php echo $statusFilter === 'Cleaned' ? '#fff' : 'var(--green-900)'; ?>; border-color:var(--green-900);">Cleaned (<?php echo $cleaned; ?>)</a>
            </div>
            <a href="dashboard.php" class="btn btn-outline btn-small" style="color:var(--green-900); border-color:var(--green-900);">View Public Feed</a>
        </div>

        <?php if (empty($reports)): ?>
            <div class="empty-state">
                <div class="icon">✨</div>
                <p>No garbage reports in this category. All clear!</p>
            </div>
        <?php else: ?>
            <div class="report-grid">
                <?php foreach ($reports as $row): 
                    $badgeClass = 'badge-' . str_replace(' ', '-', $row['status']);
                    $dateStr = date('d M Y', strtotime($row['submitted_at']));
                ?>
                <div class="report-card" style="border: 2px solid <?php echo $row['status'] === 'Pending' ? 'var(--amber-500)' : ($row['status'] === 'In Progress' ? 'var(--blue-500)' : 'var(--green-500)'); ?>">
                    <img src="<?php echo htmlspecialchars($row['photo_path']); ?>" alt="Spot photo"
                         onerror="this.src='https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=500&auto=format&fit=crop&q=60'">
                    <div class="content">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
                            <div class="location">📍 <?php echo htmlspecialchars($row['location_area']); ?></div>
                            <span class="badge <?php echo $badgeClass; ?>"><?php echo htmlspecialchars($row['status']); ?></span>
                        </div>
                        <div class="desc"><?php echo htmlspecialchars($row['description']); ?></div>
                        <div class="meta">Reported by <?php echo htmlspecialchars($row['reporter_name']); ?> &bull; <?php echo $dateStr; ?></div>
                        
                        <div style="margin-top:14px; padding-top:12px; border-top:1px dashed var(--gray-300); display:flex; gap:8px; flex-wrap:wrap;">
                            <?php if ($row['status'] === 'Pending'): ?>
                                <form method="POST" style="flex:1;">
                                    <input type="hidden" name="report_id" value="<?php echo $row['report_id']; ?>">
                                    <input type="hidden" name="status" value="In Progress">
                                    <button type="submit" class="cleaner-action-btn cleaner-btn-progress" style="width:100%;">
                                        🔄 Start Cleaning
                                    </button>
                                </form>
                            <?php endif; ?>
                            
                            <?php if ($row['status'] !== 'Cleaned'): ?>
                                <form method="POST" style="flex:1;">
                                    <input type="hidden" name="report_id" value="<?php echo $row['report_id']; ?>">
                                    <input type="hidden" name="status" value="Cleaned">
                                    <button type="submit" class="cleaner-action-btn cleaner-btn-clean" style="width:100%;">
                                        ✅ Mark Cleaned
                                    </button>
                                </form>
                            <?php else: ?>
                                <div style="color:var(--green-700); font-weight:700; font-size:0.85rem; display:flex; align-items:center; gap:4px;">
                                    ✅ Completed &amp; Verified Clean
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>
</section>

<?php require_once 'includes/footer.php'; ?>
