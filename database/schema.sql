-- ClipTrack database schema (MySQL 8 / MariaDB 10.4+, works with XAMPP)
-- Run this once in phpMyAdmin (Import tab) or: mysql -u root -p < database/schema.sql

CREATE DATABASE IF NOT EXISTS cliptrack CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cliptrack;

CREATE TABLE IF NOT EXISTS staff (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  work_start TIME NOT NULL DEFAULT '09:00:00',
  work_end TIME NOT NULL DEFAULT '18:00:00',
  work_days VARCHAR(20) NOT NULL DEFAULT '1,2,3,4,5,6',   -- 0=Sun ... 6=Sat
  active TINYINT(1) NOT NULL DEFAULT 1
);

-- Module 1: user accounts (admin and staff only, customers do not log in)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  role ENUM('admin','staff') NOT NULL,
  full_name VARCHAR(80) NOT NULL,
  staff_id INT NULL,
  FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE SET NULL
);

-- Module 5: services and pricing
CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration_min INT NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1
);

-- Module 4: which staff can perform which services
CREATE TABLE IF NOT EXISTS staff_services (
  staff_id INT NOT NULL,
  service_id INT NOT NULL,
  PRIMARY KEY (staff_id, service_id),
  FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- Module 6: clients (matched by contact number)
CREATE TABLE IF NOT EXISTS clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  contact VARCHAR(20) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_clients_contact (contact)
);

-- Modules 2 and 3: appointments (online requests and walk-ins)
CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  service_id INT NOT NULL,
  staff_id INT NOT NULL,
  appt_date DATE NOT NULL,
  appt_time TIME NOT NULL,
  status ENUM('pending','confirmed','completed','cancelled','no-show') NOT NULL DEFAULT 'pending',
  source ENUM('online','walk-in') NOT NULL DEFAULT 'online',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id),
  FOREIGN KEY (service_id) REFERENCES services(id),
  FOREIGN KEY (staff_id) REFERENCES staff(id),
  INDEX idx_appt_staff_date (staff_id, appt_date)
);

-- Module 8: billing (cash only), used in Sprint 3
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  appointment_id INT NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  method ENUM('cash') NOT NULL DEFAULT 'cash',
  paid_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id)
);

-- Module 9: feedback, used in Sprint 3
CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  appointment_id INT NOT NULL UNIQUE,
  rating TINYINT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id)
);

-- Module 1: audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  actor VARCHAR(80) NOT NULL,
  action_text VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
