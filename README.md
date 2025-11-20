# 🔗 Decentralized Gamified Trading Platform

## 📖 Overview  
This project is a **blockchain-based trading system** that combines secure digital asset ownership with gamified mechanics. Users can acquire items, trade securely via smart contracts, manage their inventory, and interact socially within a decentralized marketplace.  

The system introduces **automatic item drops**, rarity-based assets, and crafting mechanics to keep users engaged, while ensuring transparency and fairness through blockchain technology.  

---

## ✨ Features  
- **Wallet Integration** – Manage tokens and assets securely.  
- **Item Acquisition** – Receive items automatically (e.g., every 1 minute) with rarity levels.  
- **Inventory Management** – Organize and track owned assets.  
- **Secure Trading** – Peer-to-peer trades powered by smart contracts.  
- **Marketplace & Auctions** – List items for sale or bidding.  
- **Crafting System** – Combine items to create stronger or rarer ones.  
- **Chat System** – Real-time messaging between traders.  
- **Notifications** – Alerts for trades, new items, and offers.  
- **Leaderboards & Missions** – Gamified challenges to boost engagement.  

---

## ⚙️ Tech Stack  
- **Blockchain:** Ethereum / Polygon / BNB Smart Chain (EVM-compatible)  
- **Smart Contracts:** Solidity  
- **Frontend:** React.js + Vite  
- **Backend (optional):** Node.js / Spring Boot  
- **Storage:** IPFS/Arweave (item metadata), SQL/NoSQL (non-critical data)  

---

## 🎮 How It Works  
1. Users connect their blockchain wallet.  
2. Every minute, new items are dropped and stored in the user’s inventory.  
3. Users can trade items securely through smart contracts or list them on the marketplace.  
4. Crafting allows combining items to generate rarer assets.(Optional)  
5. Chat, notifications, and leaderboards keep the experience interactive and social.  

---

## 🚀 Getting Started  

### Prerequisites  
- **Node.js** (v18 or higher) and npm installed  
- **MySQL** (v8.0 or higher) installed and running
- **MetaMask** or WalletConnect-compatible wallet (for blockchain features)

### Setup  

#### 1. Database Setup
First, create a MySQL database:
```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE batibot;

# Create user (optional, or use root)
CREATE USER 'batibot_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON batibot.* TO 'batibot_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file with MySQL configuration
# Copy this template:
```

Create a `.env` file in the `backend` directory:
```env
PORT=3001
FRONTEND_URL=http://localhost:5173

# MySQL Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=batibot
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT Secret (change this to a random string)
JWT_SECRET=your-secret-key-change-this-in-production

# Admin Creation Key (for creating admin users)
ADMIN_CREATION_KEY=super-secret-admin-key
```

```bash
# Start the backend server
npm run dev
```

The server will automatically:
- Connect to MySQL database
- Create all required tables
- Seed initial data (categories, rarities, etc.)

#### 3. Frontend Setup
```bash
cd frontend/batibot-frontend

# Install dependencies
npm install

# Create .env file (optional - defaults work for local development)
# VITE_API_BASE_URL=http://localhost:3001/api

# Start the frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

#### 4. Create an Admin Account
1. Register a regular user account through the frontend
2. Use the admin creation endpoint:
```bash
curl -X POST http://localhost:3001/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "your_password",
    "adminKey": "super-secret-admin-key"
  }'
```

📌 Roadmap

 - Wallet integration

 - Basic item drops

 - Inventory system

 - Trade + smart contracts

 - Marketplace & auctions

 - Chat & notifications

 - Leaderboards and quests
