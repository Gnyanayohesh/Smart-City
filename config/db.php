<?php
/**
 * Database connection settings.
 * Supports environment variables for cloud hosting (e.g. Railway, Render, TiDB, Aiven)
 * or defaults to standard local XAMPP (MySQL on localhost, user root, no password).
 */

$DB_HOST = getenv('DB_HOST') ?: "localhost";
$DB_USER = getenv('DB_USER') ?: "root";
$DB_PASS = getenv('DB_PASS') !== false ? getenv('DB_PASS') : "";
$DB_NAME = getenv('DB_NAME') ?: "smart_city_cleanliness";
$DB_PORT = getenv('DB_PORT') ? (int)getenv('DB_PORT') : 3306;

$conn = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME, $DB_PORT);

if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error .
        "<br>Make sure MySQL service is running and database schema is imported.");
}

$conn->set_charset("utf8mb4");

// Ensure cleaners table exists
$conn->query("CREATE TABLE IF NOT EXISTS cleaners (
    cleaner_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE DEFAULT NULL,
    name VARCHAR(100) NOT NULL,
    contact VARCHAR(50),
    assigned_area VARCHAR(100) NOT NULL,
    is_on_leave TINYINT(1) NOT NULL DEFAULT 0,
    replacement_cleaner_id INT NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

// Ensure assignment columns exist on reports table
$colCheck = $conn->query("SHOW COLUMNS FROM reports LIKE 'assigned_cleaner_id'");
if ($colCheck && $colCheck->num_rows === 0) {
    $conn->query("ALTER TABLE reports ADD COLUMN assigned_cleaner_id INT NULL DEFAULT NULL");
    $conn->query("ALTER TABLE reports ADD COLUMN assigned_cleaner_name VARCHAR(100) NULL DEFAULT NULL");
    $conn->query("ALTER TABLE reports ADD COLUMN assignment_type ENUM('Primary', 'Replacement', 'Unassigned') NOT NULL DEFAULT 'Unassigned'");
}

// Seed default cleaners if empty
$cCount = $conn->query("SELECT COUNT(*) as c FROM cleaners");
if ($cCount && $cCount->fetch_assoc()['c'] == 0) {
    $conn->query("INSERT INTO cleaners (cleaner_id, username, name, contact, assigned_area, is_on_leave, replacement_cleaner_id) VALUES
        (1, 'cleaner', 'Ramesh Kumar', '9876500001', 'Anna Nagar', 0, NULL),
        (2, 'suresh', 'Suresh Babu', '9876500002', 'Gandhi Park', 0, NULL),
        (3, 'murugan', 'Murugan S', '9876500003', 'Cantonment', 1, 1),
        (4, 'karthik', 'Karthik V', '9876500004', 'Thillai Nagar', 0, NULL)");
}
?>

