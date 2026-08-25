<?php
require_once 'config/db.php';
$pageTitle = "Public Dashboard";

$statusFilter = $_GET['status'] ?? '';
$search = trim($_GET['q'] ?? '');

$sql = "SELECT * FROM reports WHERE 1=1";
$params = [];
$types = "";

if ($statusFilter !== '' && in_array($statusFilter, ['Pending', 'In Progress', 'Cleaned'])) {
    $sql .= " AND status = ?";
    $params[] = $statusFilter;
    $types .= "s";
}
if ($search !== '') {
    $sql .= " AND (location_area LIKE ? OR description LIKE ?)";
    $like = "%$search%";
    $params[] = $like;
    $params[] = $like;
    $types .= "ss";
}
$sql .= " ORDER BY submitted_at DESC";

$stmt = $conn->prepare($sql);
if ($params) {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$result = $stmt->get_result();

require_once 'includes/header.php';
?>

<section class="section">
    <div class="container">
        <h2 class="section-title">Public Dashboard</h2>
        <p class="section-subtitle">Live view of all cleanliness reports submitted by citizens</p>

        <div class="filter-bar">
            <form method="GET">
                <input type="text" name="q" placeholder="Search location or keyword..." value="<?php echo htmlspecialchars($search); ?>">
                <select name="status">
                    <option value="">All Statuses</option>
                    <option value="Pending" <?php echo $statusFilter === 'Pending' ? 'selected' : ''; ?>>Pending</option>
                    <option value="In Progress" <?php echo $statusFilter === 'In Progress' ? 'selected' : ''; ?>>In Progress</option>
                    <option value="Cleaned" <?php echo $statusFilter === 'Cleaned' ? 'selected' : ''; ?>>Cleaned</option>
                </select>
                <button type="submit" class="btn btn-secondary btn-small">Filter</button>
                <a href="dashboard.php" class="btn btn-outline btn-small" style="color:var(--green-700); border-color:var(--green-700);">Reset</a>
            </form>
            <a href="report.php" class="btn btn-primary btn-small">+ New Report</a>
        </div>

        <?php if ($result->num_rows === 0): ?>
            <div class="empty-state">
                <div class="icon">🧹</div>
                <p>No reports found. Try adjusting your filters, or be the first to report an issue!</p>
            </div>
        <?php else: ?>
            <div class="report-grid">
                <?php while ($row = $result->fetch_assoc()):
                    $badgeClass = 'badge-' . str_replace(' ', '-', $row['status']);
                ?>
                    <div class="report-card">
                        <img src="<?php echo htmlspecialchars($row['photo_path']); ?>" alt="Reported issue photo"
                             onerror="this.src='https://via.placeholder.com/400x250/e6f5ee/1a6b4a?text=No+Photo'">
                        <div class="content">
                            <div class="location">📍 <?php echo htmlspecialchars($row['location_area']); ?></div>
                            <div class="desc"><?php echo htmlspecialchars(mb_strimwidth($row['description'], 0, 120, '...')); ?></div>
                            <div class="meta">Reported by <?php echo htmlspecialchars($row['reporter_name']); ?> on <?php echo date('d M Y', strtotime($row['submitted_at'])); ?></div>
                            <span class="badge <?php echo $badgeClass; ?>"><?php echo htmlspecialchars($row['status']); ?></span>
                        </div>
                    </div>
                <?php endwhile; ?>
            </div>
        <?php endif; ?>
    </div>
</section>

<?php require_once 'includes/footer.php'; ?>
