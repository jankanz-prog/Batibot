# MySQL Setup Guide for Batibot

## Quick Start

### 1. Install MySQL

**Windows:**
- Download MySQL Installer from https://dev.mysql.com/downloads/installer/
- Run the installer and follow the setup wizard
- Remember the root password you set

**macOS:**
```bash
brew install mysql
brew services start mysql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

### 2. Create Database

```bash
# Login to MySQL
mysql -u root -p

# Enter your root password when prompted
```

In MySQL prompt:
```sql
-- Create database
CREATE DATABASE batibot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (optional - you can use root if preferred)
CREATE USER 'batibot_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON batibot.* TO 'batibot_user'@'localhost';
FLUSH PRIVILEGES;

-- Verify database was created
SHOW DATABASES;

-- Exit MySQL
EXIT;
```

### 3. Configure Backend

Create a `.env` file in the `backend` directory:

```env
PORT=3001
FRONTEND_URL=http://localhost:5173

# MySQL Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=batibot
DB_USER=root                    # or 'batibot_user' if you created a separate user
DB_PASSWORD=your_mysql_password # your MySQL root password

# JWT Secret (generate a random string)
JWT_SECRET=your-secret-key-change-this-to-something-random

# Admin Creation Key
ADMIN_CREATION_KEY=super-secret-admin-key
```

### 4. Install Dependencies and Run

```bash
cd backend
npm install
npm run dev
```

The server will automatically:
- ✅ Connect to MySQL
- ✅ Create all database tables
- ✅ Seed initial data (item categories, rarities, etc.)

### 5. Verify Connection

You should see in the console:
```
MySQL connected successfully
Database tables created successfully
Server running on port 3001
```

## Troubleshooting

### Connection Refused
- **Check MySQL is running:**
  ```bash
  # Windows (run in PowerShell as Admin)
  Get-Service MySQL*
  
  # macOS/Linux
  sudo systemctl status mysql
  # or
  brew services list
  ```

### Authentication Error
- **Verify username and password** in `.env` file
- **Check if user has permissions:**
  ```sql
  SHOW GRANTS FOR 'batibot_user'@'localhost';
  ```

### Port Already in Use
- **Change MySQL port** in `.env` if 3306 is taken
- **Or change backend port** from 3001 to something else

### Database Doesn't Exist
- **Create it manually:**
  ```sql
  CREATE DATABASE batibot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```

## Default MySQL Ports
- **MySQL**: 3306 (default)
- **Backend API**: 3001 (default)
- **Frontend**: 5173 (default Vite port)

## Security Notes

⚠️ **For Production:**
1. Use a strong password for MySQL
2. Create a dedicated database user (not root)
3. Limit user privileges to only the `batibot` database
4. Change `JWT_SECRET` to a cryptographically secure random string
5. Change `ADMIN_CREATION_KEY` to something secure
6. Use environment variables, never commit `.env` to git

## Common Commands

```bash
# Start MySQL service
# Windows: net start MySQL
# macOS: brew services start mysql
# Linux: sudo systemctl start mysql

# Stop MySQL service
# Windows: net stop MySQL
# macOS: brew services stop mysql
# Linux: sudo systemctl stop mysql

# Access MySQL CLI
mysql -u root -p

# Backup database
mysqldump -u root -p batibot > backup.sql

# Restore database
mysql -u root -p batibot < backup.sql
```

