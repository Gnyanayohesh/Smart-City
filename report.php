<?php
require_once 'config/db.php';
$pageTitle = "Report an Issue";

$success = "";
$error = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['reporter_name'] ?? '');
    $contact = trim($_POST['reporter_contact'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $location = trim($_POST['location_area'] ?? '');
    $lat = !empty($_POST['latitude']) ? $_POST['latitude'] : null;
    $lng = !empty($_POST['longitude']) ? $_POST['longitude'] : null;

    if ($name === '' || $description === '' || $location === '') {
        $error = "Please fill in your name, description, and location.";
    } elseif (!isset($_FILES['photo']) || $_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
        $error = "Please upload a photo of the issue.";
    } else {
        $allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        $fileType = $_FILES['photo']['type'];
        $fileSize = $_FILES['photo']['size'];

        if (!in_array($fileType, $allowed)) {
            $error = "Only JPG, PNG, or WEBP images are allowed.";
        } elseif ($fileSize > 5 * 1024 * 1024) {
            $error = "Image must be smaller than 5MB.";
        } else {
            $ext = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
            $newName = 'report_' . time() . '_' . rand(1000, 9999) . '.' . $ext;
            $destDir = __DIR__ . '/uploads/';
            if (!is_dir($destDir)) mkdir($destDir, 0755, true);
            $destPath = $destDir . $newName;

            if (move_uploaded_file($_FILES['photo']['tmp_name'], $destPath)) {
                $stmt = $conn->prepare("INSERT INTO reports (reporter_name, reporter_contact, description, location_area, latitude, longitude, photo_path, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')");
                $photoPathForDb = 'uploads/' . $newName;
                $stmt->bind_param("ssssdds", $name, $contact, $description, $location, $lat, $lng, $photoPathForDb);
                if ($stmt->execute()) {
                    $success = "Thank you! Your report has been submitted and is now Pending review.";
                    $_POST = [];
                } else {
                    $error = "Something went wrong while saving your report. Please try again.";
                }
                $stmt->close();
            } else {
                $error = "Failed to upload the photo. Please try again.";
            }
        }
    }
}

require_once 'includes/header.php';
?>

<section class="section">
    <div class="container">
        <div class="form-card">
            <h2>📸 Report an Unclean Area</h2>
            <p style="color:var(--gray-500); margin-top:-8px;">Help keep the city clean by reporting waste or unclean public spaces.</p>

            <?php if ($success): ?>
                <div class="alert alert-success"><?php echo htmlspecialchars($success); ?></div>
            <?php endif; ?>
            <?php if ($error): ?>
                <div class="alert alert-error"><?php echo htmlspecialchars($error); ?></div>
            <?php endif; ?>

            <form method="POST" enctype="multipart/form-data" id="reportForm">
                <div class="form-row">
                    <div class="form-group">
                        <label for="reporter_name">Your Name *</label>
                        <input type="text" id="reporter_name" name="reporter_name" required
                               value="<?php echo htmlspecialchars($_POST['reporter_name'] ?? ''); ?>">
                    </div>
                    <div class="form-group">
                        <label for="reporter_contact">Phone / Email (optional)</label>
                        <input type="text" id="reporter_contact" name="reporter_contact"
                               value="<?php echo htmlspecialchars($_POST['reporter_contact'] ?? ''); ?>">
                    </div>
                </div>

                <div class="form-group">
                    <label for="location_area">Location / Area *</label>
                    <input type="text" id="location_area" name="location_area" required
                           placeholder="e.g. Near Anna Nagar Bus Stop, Trichy"
                           value="<?php echo htmlspecialchars($_POST['location_area'] ?? ''); ?>">
                    <div class="hint"><button type="button" class="btn btn-small btn-secondary" id="useLocationBtn">📍 Use My Current Location</button> <span id="locStatus"></span></div>
                    <input type="hidden" name="latitude" id="latitude">
                    <input type="hidden" name="longitude" id="longitude">
                </div>

                <div class="form-group">
                    <label for="description">Description *</label>
                    <textarea id="description" name="description" required placeholder="Describe the issue (e.g. overflowing garbage bin, litter, drainage blockage)..."><?php echo htmlspecialchars($_POST['description'] ?? ''); ?></textarea>
                </div>

                <div class="form-group">
                    <label for="photo">Upload Photo *</label>
                    <input type="file" id="photo" name="photo" accept="image/png, image/jpeg, image/webp" required>
                    <div class="hint">JPG, PNG or WEBP, max 5MB.</div>
                </div>

                <button type="submit" class="btn btn-primary btn-full">Submit Report</button>
            </form>
        </div>
    </div>
</section>

<script src="assets/js/script.js"></script>

<?php require_once 'includes/footer.php'; ?>
