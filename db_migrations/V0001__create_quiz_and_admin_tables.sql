-- Создаём таблицу для хранения результатов тестирования
CREATE TABLE IF NOT EXISTS quiz_responses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    age_range VARCHAR(50),
    body_type VARCHAR(100),
    style_preferences TEXT,
    color_preferences TEXT,
    wardrobe_goals TEXT,
    budget_range VARCHAR(100),
    lifestyle VARCHAR(255),
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создаём таблицу для администраторов
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Добавляем администратора (хеш пароля 123789456h)
INSERT INTO admins (email, password_hash) 
VALUES ('pells1ze@gmail.com', '123789456h')
ON CONFLICT (email) DO NOTHING;