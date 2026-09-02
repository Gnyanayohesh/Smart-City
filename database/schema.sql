-- ============================================================
-- Smart City Cleanliness Reporting System
-- Database Schema (MySQL / MariaDB - works with XAMPP)
-- ============================================================

CREATE DATABASE IF NOT EXISTS smart_city_cleanliness;
USE smart_city_cleanliness;

-- --------------------------------------------------------
-- Table: admins
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default admin login:
--   username: admin
--   password: admin123
-- (password below is a bcrypt hash of "admin123", generated with PHP password_hash)
INSERT INTO admins (username, password, full_name)
VALUES ('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Municipal Administrator')
ON DUPLICATE KEY UPDATE username = username;

-- --------------------------------------------------------
-- Table: cleaners
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS cleaners (
    cleaner_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE DEFAULT NULL,
    name VARCHAR(100) NOT NULL,
    contact VARCHAR(50),
    assigned_area VARCHAR(100) NOT NULL,
    is_on_leave TINYINT(1) NOT NULL DEFAULT 0,
    replacement_cleaner_id INT NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (replacement_cleaner_id) REFERENCES cleaners(cleaner_id) ON DELETE SET NULL
);

-- Default cleaners data
INSERT INTO cleaners (cleaner_id, username, name, contact, assigned_area, is_on_leave, replacement_cleaner_id)
VALUES
(1, 'cleaner', 'Ramesh Kumar', '9876500001', 'Anna Nagar', 0, NULL),
(2, 'suresh', 'Suresh Babu', '9876500002', 'Gandhi Park', 0, NULL),
(3, 'murugan', 'Murugan S', '9876500003', 'Cantonment', 1, 1),
(4, 'karthik', 'Karthik V', '9876500004', 'Thillai Nagar', 0, NULL)
ON DUPLICATE KEY UPDATE name = VALUES(name), assigned_area = VALUES(assigned_area);

-- --------------------------------------------------------
-- Table: reports
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    reporter_name VARCHAR(100) NOT NULL,
    reporter_contact VARCHAR(50),
    description TEXT NOT NULL,
    location_area VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) DEFAULT NULL,
    longitude DECIMAL(11, 8) DEFAULT NULL,
    photo_path VARCHAR(255) NOT NULL,
    status ENUM('Pending', 'In Progress', 'Cleaned') NOT NULL DEFAULT 'Pending',
    assigned_cleaner_id INT NULL DEFAULT NULL,
    assigned_cleaner_name VARCHAR(100) NULL DEFAULT NULL,
    assignment_type ENUM('Primary', 'Replacement', 'Unassigned') NOT NULL DEFAULT 'Unassigned',
    admin_remarks TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_cleaner_id) REFERENCES cleaners(cleaner_id) ON DELETE SET NULL
);

-- --------------------------------------------------------
-- Sample data (optional - remove if not needed)
-- --------------------------------------------------------
INSERT INTO reports (reporter_name, reporter_contact, description, location_area, latitude, longitude, photo_path, status, assigned_cleaner_id, assigned_cleaner_name, assignment_type)
VALUES
('Ravi Kumar', '9876543210', 'Large pile of garbage near the bus stop, attracting stray animals.', 'Anna Nagar Bus Stop, Trichy', 10.8231, 78.6869, 'uploads/sample1.jpg', 'Pending', 1, 'Ramesh Kumar', 'Primary'),
('Priya S', '9123456780', 'Overflowing dustbin at the park entrance for the past 3 days.', 'Gandhi Park, Trichy', 10.7905, 78.7047, 'uploads/sample2.jpg', 'In Progress', 2, 'Suresh Babu', 'Primary'),
('Mohammed Ali', '9988776655', 'Drainage blockage causing waste water to spread on the road.', 'Cantonment Area, Trichy', 10.8155, 78.6892, 'uploads/sample3.jpg', 'Cleaned', 1, 'Ramesh Kumar', 'Replacement');

