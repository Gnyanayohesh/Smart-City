<?php
require_once '../config/db.php';
if (session_status() === PHP_SESSION_NONE) session_start();
if (!isset($_SESSION['admin_id'])) {
    header("Location: login.php");
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $reportId = (int)($_POST['report_id'] ?? 0);
    $status = $_POST['status'] ?? '';
    $currentStatus = $_POST['current_status'] ?? '';
    $allowed = ['Pending', 'In Progress', 'Cleaned'];

    if ($reportId > 0 && in_array($status, $allowed)) {
        $stmt = $conn->prepare("UPDATE reports SET status = ? WHERE report_id = ?");
        $stmt->bind_param("si", $status, $reportId);
        $stmt->execute();
        $stmt->close();
    }
}

$redirect = "dashboard.php";
if (!empty($_POST['current_status'])) {
    $redirect .= "?status=" . urlencode($_POST['current_status']);
}
header("Location: " . $redirect);
exit;
?>
