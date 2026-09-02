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

// Lookup cleaner record
$username = $_SESSION['username'] ?? 'cleaner';
$nameLike = '%' . ($_SESSION['full_name'] ?? 'Ramesh') . '%';
$cleanerStmt = $conn->prepare("SELECT * FROM cleaners WHERE username = ? OR name LIKE ? LIMIT 1");
$cleanerStmt->bind_param("ss", $username, $nameLike);
$cleanerStmt->execute();
$myCleaner = $cleanerStmt->get_result()->fetch_assoc();
$cleanerStmt->close();

if (!$myCleaner) {
    $myCleaner = $conn->query("SELECT * FROM cleaners LIMIT 1")->fetch_assoc();
}

$cleanerId = $myCleaner ? (int)$myCleaner['cleaner_id'] : 0;

// Find areas this cleaner is covering as replacement
$coveringFor = [];
if ($cleanerId) {
    $covRes = $conn->query("SELECT * FROM cleaners WHERE is_on_leave = 1 AND replacement_cleaner_id = $cleanerId");
    if ($covRes) {
        $coveringFor = $covRes->fetch_all(MYSQLI_ASSOC);
    }
}

$statusFilter = $_GET['status'] ?? '';
$scope = $_GET['scope'] ?? 'assigned'; // 'assigned' or 'all'

$whereClauses = [];
$params = [];
$types = "";

if ($scope === 'assigned' && $cleanerId) {
    $whereClauses[] = "assigned_cleaner_id = ?";
    $params[] = $cleanerId;
    $types .= "i";
}

if (in_array($statusFilter, ['Pending', 'In Progress', 'Cleaned'])) {
    $whereClauses[] = "status = ?";
    $params[] = $statusFilter;
    $types .= "s";
}

$whereSql = !empty($whereClauses) ? " WHERE " . implode(" AND ", $whereClauses) : "";
$sql = "SELECT * FROM reports" . $whereSql . " ORDER BY submitted_at DESC";
$stmt = $conn->prepare($sql);
if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$reports = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

// Stats count (for current scope)
$baseCountSql = "SELECT COUNT(*) AS c FROM reports" . ($scope === 'assigned' && $cleanerId ? " WHERE assigned_cleaner_id = $cleanerId" : "");
$total = $conn->query($baseCountSql)->fetch_assoc()['c'];
$pending = $conn->query($baseCountSql . ($scope === 'assigned' && $cleanerId ? " AND status = 'Pending'" : " WHERE status = 'Pending'"))->fetch_assoc()['c'];
$progress = $conn->query($baseCountSql . ($scope === 'assigned' && $cleanerId ? " AND status = 'In Progress'" : " WHERE status = 'In Progress'"))->fetch_assoc()['c'];
$cleaned = $conn->query($baseCountSql . ($scope === 'assigned' && $cleanerId ? " AND status = 'Cleaned'" : " WHERE status = 'Cleaned'"))->fetch_assoc()['c'];

require_once 'includes/header.php';
?>

<section class="section">
    <div class="container">
        <div class="cleaner-header-banner">
            <div>
                <h2>🧹 Sanitation Worker Portal</h2>
                <p>Welcome, <strong><?php echo htmlspecialchars($myCleaner ? $myCleaner['name'] : ($_SESSION['full_name'] ?? 'Sanitation Staff')); ?></strong>!</p>
                <div style="margin-top:8px; display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
                    <span style="background:rgba(255,255,255,0.2); padding:4px 12px; border-radius:9999px; font-size:0.85rem; font-weight:700;">
                        📍 Assigned Ward: <?php echo htmlspecialchars($myCleaner ? $myCleaner['assigned_area'] : 'Trichy City'); ?>
                    </span>
                    <?php if ($myCleaner && $myCleaner['is_on_leave']): ?>
                        <span class="cleaner-badge-leave">🏖️ You are On Leave</span>
                    <?php else: ?>
                        <span class="cleaner-badge-available">● Available on Duty</span>
                    <?php endif; ?>
                </div>

                <?php if (!empty($coveringFor)): ?>
                    <div style="margin-top:10px; background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.3); padding:8px 14px; border-radius:10px; font-size:0.85rem;">
                        🔄 <strong>Temporary Replacement Notice:</strong> You are currently covering 
                        <strong><?php echo implode(', ', array_map(fn($c) => htmlspecialchars($c['assigned_area']) . ' (' . htmlspecialchars($c['name']) . ' on leave)', $coveringFor)); ?></strong>.
                    </div>
                <?php endif; ?>
            </div>
            <div style="background:rgba(255,255,255,0.15); padding:10px 18px; border-radius:10px; font-weight:700; text-align:right;">
                Role: Sanitation Cleaner
            </div>
        </div>

        <?php if ($myCleaner && $myCleaner['is_on_leave']): ?>
            <div class="leave-alert-banner">
                <span style="font-size:1.8rem;">🏖️</span>
                <div>
                    <strong style="font-size:1.05rem;">You are currently marked On Leave</strong>
                    <div style="font-size:0.9rem; opacity:0.95; margin-top:3px;">
                        New missions reported in your permanently assigned area (<strong><?php echo htmlspecialchars($myCleaner['assigned_area']); ?></strong>) are temporarily redirected to your replacement cleaner. Enjoy your leave!
                    </div>
                </div>
            </div>
        <?php endif; ?>

        <div class="stats-bar" style="margin-top:0; margin-bottom:30px;">
            <div class="stat"><div class="num"><?php echo $total; ?></div><div class="label">Total Tasks</div></div>
            <div class="stat"><div class="num"><?php echo $pending; ?></div><div class="label">Pending Action</div></div>
            <div class="stat"><div class="num"><?php echo $progress; ?></div><div class="label">In Progress</div></div>
            <div class="stat"><div class="num"><?php echo $cleaned; ?></div><div class="label">Cleaned by Team</div></div>
        </div>

        <div class="filter-bar">
            <div>
                <strong>Filter Tasks:</strong>
                <a href="cleaner.php?scope=<?php echo urlencode($scope); ?>" class="btn <?php echo empty($statusFilter) ? 'btn-secondary' : 'btn-outline'; ?>" style="margin-left:8px; padding:6px 12px; font-size:0.85rem; color:<?php echo empty($statusFilter) ? '#fff' : 'var(--green-900)'; ?>; border-color:var(--green-900);">All (<?php echo $total; ?>)</a>
                <a href="cleaner.php?scope=<?php echo urlencode($scope); ?>&status=Pending" class="btn <?php echo $statusFilter === 'Pending' ? 'btn-secondary' : 'btn-outline'; ?>" style="margin-left:4px; padding:6px 12px; font-size:0.85rem; color:<?php echo $statusFilter === 'Pending' ? '#fff' : 'var(--green-900)'; ?>; border-color:var(--green-900);">Pending (<?php echo $pending; ?>)</a>
                <a href="cleaner.php?scope=<?php echo urlencode($scope); ?>&status=In+Progress" class="btn <?php echo $statusFilter === 'In Progress' ? 'btn-secondary' : 'btn-outline'; ?>" style="margin-left:4px; padding:6px 12px; font-size:0.85rem; color:<?php echo $statusFilter === 'In Progress' ? '#fff' : 'var(--green-900)'; ?>; border-color:var(--green-900);">In Progress (<?php echo $progress; ?>)</a>
                <a href="cleaner.php?scope=<?php echo urlencode($scope); ?>&status=Cleaned" class="btn <?php echo $statusFilter === 'Cleaned' ? 'btn-secondary' : 'btn-outline'; ?>" style="margin-left:4px; padding:6px 12px; font-size:0.85rem; color:<?php echo $statusFilter === 'Cleaned' ? '#fff' : 'var(--green-900)'; ?>; border-color:var(--green-900);">Cleaned (<?php echo $cleaned; ?>)</a>
            </div>
            <div style="display:flex; gap:8px;">
                <a href="cleaner.php?scope=<?php echo $scope === 'assigned' ? 'all' : 'assigned'; ?>" class="btn btn-outline btn-small" style="color:var(--green-900); border-color:var(--green-900);">
                    <?php echo $scope === 'assigned' ? '🌐 View All City Reports' : '🎯 View My Assigned Only'; ?>
                </a>
                <a href="dashboard.php" class="btn btn-outline btn-small" style="color:var(--green-900); border-color:var(--green-900);">Public Feed</a>
            </div>
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
                    $isReplacement = ($row['assignment_type'] ?? '') === 'Replacement';
                ?>
                <div class="report-card" style="border: 2px solid <?php echo $row['status'] === 'Pending' ? 'var(--amber-500)' : ($row['status'] === 'In Progress' ? 'var(--blue-500)' : 'var(--green-500)'); ?>">
                    <img src="<?php echo htmlspecialchars($row['photo_path']); ?>" alt="Spot photo"
                         onerror="this.src='https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=500&auto=format&fit=crop&q=60'">
                    <div class="content">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
                            <div class="location">📍 <?php echo htmlspecialchars($row['location_area']); ?></div>
                            <span class="badge <?php echo $badgeClass; ?>"><?php echo htmlspecialchars($row['status']); ?></span>
                        </div>

                        <div style="margin-bottom:8px;">
                            <?php if ($isReplacement): ?>
                                <span class="assignment-badge-replacement">🔄 Temporary Replacement Mission</span>
                            <?php else: ?>
                                <span class="assignment-badge-primary">📍 Primary Area Mission</span>
                            <?php endif; ?>
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
