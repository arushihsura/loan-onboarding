# MongoDB Setup Guide

[*] This project uses **MongoDB** for data persistence.

## Quick Start

### Option 1: Local MongoDB (Recommended for Development)

#### Windows

1. [Download MongoDB Community Edition](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. MongoDB will start as a Windows service automatically
4. Verify connection:
   ```powershell
   mongosh
   ```

#### macOS

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux (Ubuntu)

```bash
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

### Option 2: Docker (Easiest)

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Option 3: MongoDB Atlas Cloud (Production)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority`
4. Update `.env.local`:
   ```
   MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
   ```

## Verify Connection

Connect to MongoDB with mongosh:

```bash
mongosh
```

Test query:
```javascript
use loan_video
db.users.find()
```

## Database Collections

The following collections are automatically created:

[*] **users** - User accounts and status
- Indexes: phone, email

[*] **loan_applications** - Eligibility check records
- Indexes: phone, user_id

[*] **loan_offers** - Loan offer records
- Indexes: phone, user_id

[*] **video_verifications** - Video verification records
- Indexes: phone, user_id

## Backend Integration

The backend uses:
- **pymongo** - MongoDB Python driver
- **motor** - Async MongoDB driver for FastAPI

Environment variables in `.env.local`:
```
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=loan_video
```

## Run Backend with MongoDB

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Logs will show:
```
[+] MongoDB connected and initialized
[+] Created collection: users
[+] Created collection: loan_applications
[+] Created collection: loan_offers
[+] Created collection: video_verifications
```

## Common Operations

### View all users

```javascript
db.users.find().pretty()
```

### View loan applications

```javascript
db.loan_applications.find().pretty()
```

### Delete all data (reset)

```javascript
db.users.deleteMany({})
db.loan_applications.deleteMany({})
db.loan_offers.deleteMany({})
db.video_verifications.deleteMany({})
```

### Export data

```bash
mongoexport --uri "mongodb://localhost:27017/loan_video" --collection users --out users.json
```

### Import data

```bash
mongoimport --uri "mongodb://localhost:27017/loan_video" --collection users --file users.json
```

## Troubleshooting

**Error: Cannot connect to MongoDB**
- Verify MongoDB is running: `mongosh`
- Check MONGODB_URL in `.env.local`
- Ensure port 27017 is not blocked

**Error: Database not found**
- MongoDB automatically creates databases on first write
- Run the backend once to initialize collections

**Error: Permission denied**
- Check MongoDB user credentials
- For Atlas, ensure IP is whitelisted in security settings
