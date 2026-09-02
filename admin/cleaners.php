<?php
require_once '../config/db.php';
if (session_status() === PHP_SESSION_NONE) session_start();
if (!isset($_SESSION['admin_id'])) {
    header("Location: login.php");
    exit;
}
$pageTitle = "Cleaner Management & Area Assignments";
$basePath = "../";

// Handle Actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'toggle_leave' && isset($_POST['cleaner_id'], $_POST['status'])) {
        $cleanerId = (int)$_POST['cleaner_id'];
        $status = $_POST['status']; // 'leave' or 'available'

        if ($status === 'leave') {
            // Find an available replacement cleaner
            $repId = !empty($_POST['replacement_cleaner_id']) ? (int)$_POST['replacement_cleaner_id'] : null;
            if (!$repId) {
                $availRes = $conn->query("SELECT cleaner_id FROM cleaners WHERE is_on_leave = 0 AND cleaner_id != $cleanerId LIMIT 1");
                if ($availRes && $row = $availRes->fetch_assoc()) {
                    $repId = (int)$row['cleaner_id'];
                }
            }
            $stmt = $conn->prepare("UPDATE cleaners SET is_on_leave = 1, replacement_cleaner_id = ? WHERE cleaner_id = ?");
            $stmt->bind_param("ii", $repId, $cleanerId);
            $stmt->execute();
            $stmt->close();
        } else {
            // Return from leave: clear replacement, permanent area assignment remains intact
            $stmt = $conn->prepare("UPDATE cleaners SET is_on_leave = 0, replacement_cleaner_id = NULL WHERE cleaner_id = ?");
            $stmt->bind_param("i", $cleanerId);
            $stmt->execute();
            $stmt->close();
        }
        header("Location: cleaners.php");
        exit;
    }

    if ($action === 'set_replacement' && isset($_POST['cleaner_id'], $_POST['replacement_cleaner_id'])) {
        $cleanerId = (int)$_POST['cleaner_id'];
        $repId = (int)$_POST['replacement_cleaner_id'];
        $stmt = $conn->prepare("UPDATE cleaners SET replacement_cleaner_id = ? WHERE cleaner_id = ? AND is_on_leave = 1");
        $stmt->bind_param("ii", $repId, $cleanerId);
        $stmt->execute();
        $stmt->close();
        header("Location: cleaners.php");
        exit;
    }

    if ($action === 'update_area' && isset($_POST['cleaner_id'], $_POST['assigned_area'])) {
        $cleanerId = (int)$_POST['cleaner_id'];
        $area = trim($_POST['assigned_area']);
        if ($area !== '') {
            $stmt = $conn->prepare("UPDATE cleaners SET assigned_area = ? WHERE cleaner_id = ?");
            $stmt->bind_param("si", $area, $cleanerId);
            $stmt->execute();
            $stmt->close();
        }
        header("Location: cleaners.php");
        exit;
    }

    if ($action === 'add_cleaner' && isset($_POST['name'], $_POST['assigned_area'])) {
        $name = trim($_POST['name']);
        $area = trim($_POST['assigned_area']);
        $contact = trim($_POST['contact'] ?? '');
        $username = trim($_POST['username'] ?? '') ?: strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $name));

        if ($name !== '' && $area !== '') {
            $stmt = $conn->prepare("INSERT INTO cleaners (username, name, contact, assigned_area, is_on_leave, replacement_cleaner_id) VALUES (?, ?, ?, ?, 0, NULL)");
            $stmt->bind_param("ssss", $username, $name, $contact, $area);
            $stmt->execute();
            $stmt->close();
        }
        header("Location: cleaners.php");
        exit;
    }
}

// Fetch stats
$totalCleaners = (int)($conn->query("SELECT COUNT(*) c FROM cleaners")->fetch_assoc()['c'] ?? 0);
$availableCleaners = (int)($conn->query("SELECT COUNT(*) c FROM cleaners WHERE is_on_leave = 0")->fetch_assoc()['c'] ?? 0);
$onLeaveCleaners = (int)($conn->query("SELECT COUNT(*) c FROM cleaners WHERE is_on_leave = 1")->fetch_assoc()['c'] ?? 0);

// Fetch all cleaners
$cleanersSql = "SELECT c.*, r.name AS replacement_name, r.assigned_area AS replacement_area 
                FROM cleaners c 
                LEFT JOIN cleaners r ON c.replacement_cleaner_id = r.cleaner_id 
                ORDER BY c.cleaner_id ASC";
$cleanersResult = $conn->query($cleanersSql);
$cleaners = $cleanersResult ? $cleanersResult->fetch_all(MYSQLI_ASSOC) : [];

// Available cleaners list for dropdowns
$availableList = array_filter($cleaners, fn($c) => !$c['is_on_leave']);

require_once '../includes/header.php';
?>

<div class="admin-shell">
    <aside class="admin-sidebar">
        <h3>👑 Municipal Admin</h3>
        <div class="stat-mini"><span>Total Staff</span><strong><?php echo $totalCleaners; ?></strong></div>
        <div class="stat-mini"><span>Available</span><strong><?php echo $availableCleaners; ?></strong></div>
        <div class="stat-mini"><span>On Leave</span><strong><?php echo $onLeaveCleaners; ?></strong></div>
        <div style="padding:16px 20px;">
            <a href="cleaners.php" style="color:var(--amber-500); font-weight:700; display:block; margin-bottom:10px;">
                🧹 Cleaner List &amp; Areas
            </a>
            <a href="dashboard.php" style="color:#fff; opacity:0.85; display:block; margin-bottom:8px;">
                📋 Cleanliness Reports
            </a>
            <a href="../cleaner.php" style="color:#fff; opacity:0.85; display:block;">
                &rarr; Open Cleaner Portal
            </a>
        </div>
    </aside>

    <div class="admin-content">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:10px;">
            <div>
                <h2 class="section-title" style="text-align:left; margin:0 0 4px 0;">
                    🧹 Cleaner Management &amp; Area Assignments
                </h2>
                <p style="color:var(--gray-500); margin:0;">
                    View sanitation workers, their permanent ward assignments, leave status, and designated temporary replacement cleaners.
                </p>
            </div>
            <a href="dashboard.php" class="btn btn-outline btn-small">
                &larr; Back to Reports Dashboard
            </a>
        </div>

        <div style="overflow-x:auto; background:var(--white); border-radius:var(--radius); border:1px solid var(--gray-200); box-shadow:var(--shadow-sm); margin-bottom:30px;">
            <table class="admin-table" style="margin:0;">
                <thead>
                    <tr>
                        <th>Cleaner Name</th>
                        <th>Assigned Area (Permanent)</th>
                        <th>Leave Status</th>
                        <th>Temporary Replacement Cleaner</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($cleaners)): ?>
                        <tr><td colspan="4" style="text-align:center; padding:30px; color:var(--gray-500);">No cleaners registered yet.</td></tr>
                    <?php else: ?>
                        <?php foreach ($cleaners as $c): ?>
                            <tr>
                                <td>
                                    <strong><?php echo htmlspecialchars($c['name']); ?></strong><br>
                                    <small style="color:var(--gray-500);"><?php echo htmlspecialchars($c['contact'] ?: 'No contact'); ?> &bull; @<?php echo htmlspecialchars($c['username'] ?: 'cleaner'); ?></small>
                                </td>
                                <td>
                                    <form method="POST" action="cleaners.php" style="display:flex; gap:6px; align-items:center;">
                                        <input type="hidden" name="action" value="update_area">
                                        <input type="hidden" name="cleaner_id" value="<?php echo $c['cleaner_id']; ?>">
                                        <input type="text" name="assigned_area" value="<?php echo htmlspecialchars($c['assigned_area']); ?>" required
                                               style="padding:6px 10px; font-size:0.85rem; border:1px solid var(--gray-300); border-radius:6px; width:160px;">
                                        <button type="submit" class="btn btn-outline btn-small" style="padding:4px 8px; font-size:0.75rem;">Save</button>
                                    </form>
                                    <small style="color:var(--gray-500); font-size:11px;">Permanent Ward Assignment</small>
                                </td>
                                <td>
                                    <?php if ($c['is_on_leave']): ?>
                                        <div style="display:flex; flex-direction:column; gap:6px; align-items:flex-start;">
                                            <span class="cleaner-badge-leave">🏖️ On Leave</span>
                                            <form method="POST" action="cleaners.php">
                                                <input type="hidden" name="action" value="toggle_leave">
                                                <input type="hidden" name="cleaner_id" value="<?php echo $c['cleaner_id']; ?>">
                                                <input type="hidden" name="status" value="available">
                                                <button type="submit" class="btn btn-secondary btn-small" style="font-size:0.75rem; padding:4px 10px; background:#0f764a;">
                                                    Mark Available (Return)
                                                </button>
                                            </form>
                                        </div>
                                    <?php else: ?>
                                        <div style="display:flex; flex-direction:column; gap:6px; align-items:flex-start;">
                                            <span class="cleaner-badge-available">● Available</span>
                                            <form method="POST" action="cleaners.php">
                                                <input type="hidden" name="action" value="toggle_leave">
                                                <input type="hidden" name="cleaner_id" value="<?php echo $c['cleaner_id']; ?>">
                                                <input type="hidden" name="status" value="leave">
                                                <button type="submit" class="btn btn-outline btn-small" style="font-size:0.75rem; padding:4px 10px; color:#b45309; border-color:#fde68a; background:#fff8e6;">
                                                    Mark On Leave
                                                </button>
                                            </form>
                                        </div>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <?php if ($c['is_on_leave']): ?>
                                        <div>
                                            <strong><?php echo htmlspecialchars($c['replacement_name'] ?: 'Not Set'); ?></strong>
                                            <div style="font-size:11px; color:var(--gray-500); margin-bottom:6px;">
                                                Covering missions for <?php echo htmlspecialchars($c['assigned_area']); ?>
                                            </div>
                                            <form method="POST" action="cleaners.php" style="display:flex; gap:6px; align-items:center;">
                                                <input type="hidden" name="action" value="set_replacement">
                                                <input type="hidden" name="cleaner_id" value="<?php echo $c['cleaner_id']; ?>">
                                                <select name="replacement_cleaner_id" style="padding:4px 8px; font-size:0.8rem; border:1px solid var(--gray-300); border-radius:6px;">
                                                    <?php foreach ($availableList as $other): 
                                                        if ($other['cleaner_id'] == $c['cleaner_id']) continue;
                                                    ?>
                                                        <option value="<?php echo $other['cleaner_id']; ?>" <?php echo ($c['replacement_cleaner_id'] == $other['cleaner_id']) ? 'selected' : ''; ?>>
                                                            <?php echo htmlspecialchars($other['name']); ?> (<?php echo htmlspecialchars($other['assigned_area']); ?>)
                                                        </option>
                                                    <?php endforeach; ?>
                                                </select>
                                                <button type="submit" class="btn btn-secondary btn-small" style="padding:4px 8px; font-size:0.75rem;">Set</button>
                                            </form>
                                        </div>
                                    <?php else: ?>
                                        <span style="color:var(--gray-400); font-size:0.85rem;">— (Active on duty)</span>
                                    <?php endif; ?>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>

        <!-- Add Cleaner Form -->
        <div class="cleaner-manage-card">
            <h3 style="margin-top:0; color:var(--green-900);">➕ Register New Cleaner</h3>
            <p style="color:var(--gray-500); font-size:0.9rem; margin-bottom:16px;">
                Add a new municipal sanitation worker and assign their designated city ward.
            </p>
            <form method="POST" action="cleaners.php" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)) 120px; gap:12px; align-items:end;">
                <input type="hidden" name="action" value="add_cleaner">
                <div>
                    <label style="display:block; font-size:0.8rem; font-weight:700; margin-bottom:4px; color:var(--green-900);">Cleaner Name *</label>
                    <input type="text" name="name" required placeholder="e.g. Senthil Kumar"
                           style="width:100%; padding:10px; border:1px solid var(--gray-300); border-radius:8px;">
                </div>
                <div>
                    <label style="display:block; font-size:0.8rem; font-weight:700; margin-bottom:4px; color:var(--green-900);">Assigned Area *</label>
                    <input type="text" name="assigned_area" required placeholder="e.g. Woraiyur"
                           style="width:100%; padding:10px; border:1px solid var(--gray-300); border-radius:8px;">
                </div>
                <div>
                    <label style="display:block; font-size:0.8rem; font-weight:700; margin-bottom:4px; color:var(--green-900);">Contact Number</label>
                    <input type="text" name="contact" placeholder="e.g. 9876500005"
                           style="width:100%; padding:10px; border:1px solid var(--gray-300); border-radius:8px;">
                </div>
                <div>
                    <label style="display:block; font-size:0.8rem; font-weight:700; margin-bottom:4px; color:var(--green-900);">Username</label>
                    <input type="text" name="username" placeholder="e.g. senthil"
                           style="width:100%; padding:10px; border:1px solid var(--gray-300); border-radius:8px;">
                </div>
                <div>
                    <button type="submit" class="btn btn-secondary" style="width:100%; padding:10px;">
                        + Add
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<?php require_once '../includes/footer.php'; ?>
