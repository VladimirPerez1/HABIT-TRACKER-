-- Crear base de datos
CREATE DATABASE HabitTrackerDB;
GO

USE HabitTrackerDB;
GO

-- Tabla Users
CREATE TABLE Users (
    id INT PRIMARY KEY IDENTITY(1,1),
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    full_name NVARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- Índice para búsquedas por email
CREATE INDEX idx_users_email ON Users(email);

-- Tabla Categories
CREATE TABLE Categories (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(100) NOT NULL,
    color NVARCHAR(7) DEFAULT '#6366f1',
    icon NVARCHAR(50) DEFAULT 'star',
    user_id INT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Tabla Habits
CREATE TABLE Habits (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    category_id INT NULL,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    frequency NVARCHAR(50) DEFAULT 'daily', -- daily, weekly, custom
    reminder_time TIME NULL,
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Categories(id) ON DELETE SET NULL
);

CREATE INDEX idx_habits_user ON Habits(user_id);
CREATE INDEX idx_habits_active ON Habits(is_active);

-- Tabla HabitTracking
CREATE TABLE HabitTracking (
    id INT PRIMARY KEY IDENTITY(1,1),
    habit_id INT NOT NULL,
    completed_date DATE NOT NULL,
    completed BIT DEFAULT 1,
    mood_rating INT CHECK (mood_rating BETWEEN 1 AND 5),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (habit_id) REFERENCES Habits(id) ON DELETE CASCADE,
    CONSTRAINT unique_habit_date UNIQUE (habit_id, completed_date)
);

CREATE INDEX idx_tracking_habit ON HabitTracking(habit_id);
CREATE INDEX idx_tracking_date ON HabitTracking(completed_date);

-- Tabla HabitNotes
CREATE TABLE HabitNotes (
    id INT PRIMARY KEY IDENTITY(1,1),
    habit_id INT NOT NULL,
    tracking_id INT NULL,
    note_text NVARCHAR(MAX) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (habit_id) REFERENCES Habits(id) ON DELETE CASCADE,
    FOREIGN KEY (tracking_id) REFERENCES HabitTracking(id) ON DELETE NO ACTION
);

-- Tabla Routines
CREATE TABLE Routines (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    time_schedule TIME NULL,
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Tabla RoutineHabits (relación muchos a muchos)
CREATE TABLE RoutineHabits (
    id INT PRIMARY KEY IDENTITY(1,1),
    routine_id INT NOT NULL,
    habit_id INT NOT NULL,
    order_index INT DEFAULT 0,
    FOREIGN KEY (routine_id) REFERENCES Routines(id) ON DELETE CASCADE,
    FOREIGN KEY (habit_id) REFERENCES Habits(id) ON DELETE NO ACTION,
    CONSTRAINT unique_routine_habit UNIQUE (routine_id, habit_id)
);