<?php
require_once '../config/db.php';
if (session_status() === PHP_SESSION_NONE) session_start();
if (!isset($_SESSION['admin_id'])) {
    header("Location: login.php");
    exit;
}
$pageTitle = "Admin Panel";
$basePath = "../";

$statusFilter = $_GET['status'] ?? '';
$sql = "SELECT * FROM reports WHERE 1=1";
$params = [];
$types = "";
if ($statusFilter !== '' && in_array($statusFilter, ['Pending', 'In Progress', 'Cleaned'])) {
    $sql .= " AND status = ?";
    $params[] = $statusFilter;
    $types .= "s";
}
$sql .= " ORDER BY submitted_at DESC";
$stmt = $conn->prepare($sql);
if ($params) $stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();

$total = $conn->query("SELECT COUNT(*) c FROM reports")->fetch_assoc()['c'];
$pending = $conn->query("SELECT COUNT(*) c FROM reports WHERE status='Pending'")->fetch_assoc()['c'];
$progress = $conn->query("SELECT COUNT(*) c FROM reports WHERE status='In Progress'")->fetch_assoc()['c'];
$cleaned = $conn->query("SELECT COUNT(*) c FROM reports WHERE status='Cleaned'")->fetch_assoc()['c'];

require_once '../includes/header.php';
?>

<div class="admin-shell">
    <aside class="admin-sidebar">
        <h3>Welcome, <?php echo htmlspecialchars($_SESSION['admin_name']); ?></h3>
        <div class="stat-mini"><span>Total</span><strong><?php echo $total; ?></strong></div>
        <div class="stat-mini"><span>Pending</span><strong><?php echo $pending; ?></strong></div>
        <div class="stat-mini"><span>In Progress</span><strong><?php echo $progress; ?></strong></div>
        <div class="stat-mini"><span>Cleaned</span><strong><?php echo $cleaned; ?></strong></div>
        <div style="padding:16px 20px;">
            <a href="?status=" style="color:#fff; opacity:0.85; display:block; margin-bottom:8px;">All Reports</a>
            <a href="?status=Pending" style="color:#fff; opacity:0.85; display:block; margin-bottom:8px;">Pending</a>
            <a href="?status=In+Progress" style="color:#fff; opacity:0.85; display:block; margin-bottom:8px;">In Progress</a>
            <a href="?status=Cleaned" style="color:#fff; opacity:0.85; display:block;">Cleaned</a>
            <hr style="border:0; border-top:1px solid rgba(255,255,255,0.15); margin:16px 0;">
            <a href="cleaners.php" style="color:var(--amber-500); font-weight:700; display:block; margin-bottom:8px;">🧹 Manage Cleaners &amp; Areas</a>
            <a href="../cleaner.php" style="color:#fff; opacity:0.85; display:block;">&rarr; Open Cleaner Portal</a>
        </div>
    </aside>

    <div class="admin-content">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:10px;">
            <h2 class="section-title" style="text-align:left; margin:0;">
                Manage Reports <?php echo $statusFilter ? ' — ' . htmlspecialchars($statusFilter) : ''; ?>
            </h2>
            <a href="cleaners.php" class="btn btn-secondary btn-small">🧹 Cleaners &amp; Areas &rarr;</a>
        </div>

        <?php if ($result->num_rows === 0): ?>
            <div class="empty-state">
                <div class="icon">🧹</div>
                <p>No reports in this category.</p>
            </div>
        <?php else: ?>
        <div style="overflow-x:auto;">
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Photo</th>
                    <th>Location</th>
                    <th>Assigned Cleaner</th>
                    <th class="desc-cell">Description</th>
                    <th>Reporter</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Update</th>
                </tr>
            </thead>
            <tbody>
                <?php while ($row = $result->fetch_assoc()):
                    $badgeClass = 'badge-' . str_replace(' ', '-', $row['status']);
                ?>
                <tr>
                    <td><img class="thumb" src="../<?php echo htmlspecialchars($row['photo_path']); ?>" alt="report photo"
                             onerror="this.src='https://via.placeholder.com/70x55/e6f5ee/1a6b4a?text=No+Img'"></td>
                    <td><strong><?php echo htmlspecialchars($row['location_area']); ?></strong></td>
                    <td>
                        <strong><?php echo htmlspecialchars($row['assigned_cleaner_name'] ?: 'Unassigned'); ?></strong><br>
                        <?php if ($row['assignment_type'] === 'Primary'): ?>
                            <span class="assignment-badge-primary">Primary</span>
                        <?php elseif ($row['assignment_type'] === 'Replacement'): ?>
                            <span class="assignment-badge-replacement">Temporary Replacement</span>
                        <?php else: ?>
                            <span style="font-size:11px; color:#9ca3af;">Unassigned</span>
                        <?php endif; ?>
                    </td>
                    <td class="desc-cell"><?php echo htmlspecialchars(mb_strimwidth($row['description'], 0, 90, '...')); ?></td>
                    <td><?php echo htmlspecialchars($row['reporter_name']); ?><br>
                        <small style="color:var(--gray-500);"><?php echo htmlspecialchars($row['reporter_contact']); ?></small></td>
                    <td><?php echo date('d M Y', strtotime($row['submitted_at'])); ?></td>
                    <td><span class="badge <?php echo $badgeClass; ?>"><?php echo htmlspecialchars($row['status']); ?></span></td>
                    <td>
                        <form class="status-form" action="update_status.php" method="POST">
                            <input type="hidden" name="report_id" value="<?php echo $row['report_id']; ?>">
                            <input type="hidden" name="current_status" value="<?php echo htmlspecialchars($statusFilter); ?>">
                            <select name="status">
                                <option value="Pending" <?php echo $row['status'] === 'Pending' ? 'selected' : ''; ?>>Pending</option>
                                <option value="In Progress" <?php echo $row['status'] === 'In Progress' ? 'selected' : ''; ?>>In Progress</option>
                                <option value="Cleaned" <?php echo $row['status'] === 'Cleaned' ? 'selected' : ''; ?>>Cleaned</option>
                            </select>
                            <button type="submit" class="btn btn-secondary btn-small">Save</button>
                        </form>
                    </td>
                </tr>
                <?php endwhile; ?>
            </tbody>
        </table>
        </div>
        <?php endif; ?>
    </div>
</div>

<?php require_once '../includes/footer.php'; ?>
