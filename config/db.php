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
?>

