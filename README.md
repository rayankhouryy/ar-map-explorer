# 🌍 AR Map Explorer

**Create and discover location-based AR experiences anywhere in the world**

AR Map Explorer is a full-stack application that allows users to create, share, and discover augmented reality content anchored to real-world GPS locations. Built with FastAPI backend and React Native frontend.

![AR Map Explorer](docs/app-preview.png)

## ✨ Features

### 🗺️ **For Explorers**
- **Discover AR Content**: Find nearby AR experiences on an interactive map
- **Distance Gating**: Content reveals as you get closer to locations
- **Category Filtering**: Browse by Art, Menus, Wayfinding, Info, and more
- **Offline Support**: Download content for offline viewing
- **Social Features**: Rate, comment, and share AR experiences

### 🎨 **For Creators**
- **Camera Integration**: Capture photos and videos directly in-app
- **GPS Anchoring**: Precisely anchor content to real-world locations
- **Rich Media Upload**: Support for images, videos, 3D models, and PDFs
- **Content Management**: Edit, update, and manage your creations
- **Analytics Dashboard**: Track views, engagement, and user feedback

### 🏢 **For Businesses (Tenant Admins)**
- **Team Management**: Invite and manage creator accounts
- **Content Moderation**: Review and approve user-generated content
- **Advanced Analytics**: Detailed insights and reporting
- **Custom Branding**: White-label solutions available

## 🏗️ Architecture

```
AR Map Explorer/
├── frontend/          # React Native + Expo mobile app
├── backend/           # FastAPI REST API server
├── database/          # PostgreSQL with PostGIS (optional)
└── docs/             # Documentation and assets
```

### **Tech Stack**

**Frontend:**
- React Native 0.81.4
- Expo SDK 54.0.0
- React Navigation 6.x
- React Native Paper (Material Design)
- Axios for API calls
- Expo Camera, Location, Image Picker

**Backend:**
- FastAPI 0.104.1
- SQLAlchemy 2.0.23 (ORM)
- PostgreSQL (Database)
- Alembic (Migrations)
- JWT Authentication
- File upload handling
- Geospatial queries with PostGIS (optional)

## 🚀 Quick Start

### **Prerequisites**

Before you begin, ensure you have the following installed:

- **Node.js** 20.19.5+ ([Download](https://nodejs.org/))
- **Python** 3.10+ ([Download](https://python.org/))
- **PostgreSQL** 14+ ([Download](https://postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/))
- **Expo Go** app on your mobile device ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### **1. Clone the Repository**

```bash
git clone https://github.com/your-username/ar-map-explorer.git
cd ar-map-explorer
```

### **2. Backend Setup**

#### **Install PostgreSQL and Create Database**

**macOS (Homebrew):**
```bash
brew install postgresql
brew services start postgresql
createdb ar_map_explorer
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb ar_map_explorer
```

**Windows:**
1. Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Use pgAdmin or psql to create database `ar_map_explorer`

#### **Setup Python Environment**

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

#### **Configure Environment Variables**

Create `.env` file in the `backend/` directory:

```bash
# Database
DATABASE_URL=postgresql://your_username@localhost:5432/ar_map_explorer

# Security
SECRET_KEY=your-super-secret-key-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Optional: Redis for caching
REDIS_URL=redis://localhost:6379

# Optional: AWS S3 for file storage
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET_NAME=your_bucket_name
```

**Replace `your_username` with your system username** (check with `whoami` command)

#### **Initialize Database**

```bash
# Run database migrations
alembic upgrade head

# Optional: Create initial data
python scripts/init_db.py
```

#### **Start Backend Server**

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

✅ **Backend should now be running at:** `http://localhost:8001`
📖 **API Documentation:** `http://localhost:8001/docs`

### **3. Frontend Setup**

#### **Install Node.js Dependencies**

```bash
cd frontend

# Install dependencies
npm install

# If you encounter peer dependency issues:
npm install --legacy-peer-deps
```

#### **Configure API Endpoint**

Update `frontend/src/services/api.ts` with your backend URL:

```typescript
const BASE_URL = __DEV__ 
  ? 'http://YOUR_LOCAL_IP:8001/api/v1'  // Replace with your computer's IP
  : 'https://your-production-api.com/api/v1';
```

**Find your local IP:**
```bash
# macOS/Linux:
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows:
ipconfig | findstr "IPv4"
```

#### **Start Frontend Development Server**

```bash
# Start Expo development server
npm start

# Alternative with tunnel (for remote testing):
npm run start:tunnel
```

### **4. Mobile App Setup**

1. **Install Expo Go** on your mobile device
2. **Scan QR Code** displayed in terminal with Expo Go (Android) or Camera app (iOS)
3. **Grant Permissions** when prompted:
   - 📍 Location access (required for AR anchoring)
   - 📷 Camera access (required for content creation)
   - 🖼️ Photo library access (optional)

## 📱 Usage Guide

### **Getting Started**

1. **Register Account**: Choose between Explorer or Creator role
2. **Grant Permissions**: Allow location and camera access
3. **Explore Map**: Browse nearby AR content
4. **Create Content**: (Creators only) Use camera to capture and anchor AR experiences

### **Creating AR Content**

1. Navigate to **Create** tab
2. Tap **"📸 Capture & Create"**
3. Take photo or select from library
4. Add title, description, and category
5. Content is automatically anchored to your GPS location
6. Tap **"Create AR Artifact"** to publish

### **Discovering Content**

1. Open **Map** tab
2. Move around to see nearby content markers
3. Tap markers to view content details
4. Get closer to locations to unlock full AR experiences

## 🛠️ Development

### **Project Structure**

```
ar-map-explorer/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/    # API route handlers
│   │   ├── core/                # Configuration, security, database
│   │   ├── models/              # SQLAlchemy models
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── services/            # Business logic
│   │   └── utils/               # Helper functions
│   ├── alembic/                 # Database migrations
│   ├── requirements.txt         # Python dependencies
│   └── main.py                  # FastAPI app entry point
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── screens/             # App screens/pages
│   │   ├── services/            # API clients, utilities
│   │   ├── contexts/            # React contexts (auth, etc.)
│   │   └── types/               # TypeScript type definitions
│   ├── package.json             # Node.js dependencies
│   └── App.tsx                  # React Native app entry point
└── README.md
```

### **Adding New Features**

#### **Backend API Endpoint**

1. Create route handler in `backend/app/api/v1/endpoints/`
2. Add database model in `backend/app/models/`
3. Create Pydantic schema in `backend/app/schemas/`
4. Implement business logic in `backend/app/services/`
5. Add route to `backend/app/api/v1/api.py`

#### **Frontend Screen**

1. Create component in `frontend/src/screens/`
2. Add navigation route in `frontend/src/types/navigation.ts`
3. Update `frontend/App.tsx` with new route
4. Add API calls in `frontend/src/services/api.ts`

### **Database Migrations**

```bash
cd backend

# Create new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### **Testing**

#### **Backend Tests**

```bash
cd backend
pytest
```

#### **Frontend Tests**

```bash
cd frontend
npm test
```

## 🔧 Configuration

### **Environment Variables**

#### **Backend (.env)**

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user@localhost:5432/ar_map_explorer` |
| `SECRET_KEY` | JWT signing key | `your-secret-key-here` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `AWS_ACCESS_KEY_ID` | AWS access key for S3 | `AKIAIOSFODNN7EXAMPLE` |
| `MAX_IMAGE_SIZE_MB` | Maximum image upload size | `10` |
| `MAX_FILE_SIZE_MB` | Maximum file upload size | `50` |

#### **Frontend (api.ts)**

| Setting | Description | Example |
|---------|-------------|---------|
| `BASE_URL` | Backend API endpoint | `http://192.168.1.100:8001/api/v1` |

### **Deployment Configuration**

#### **Production Backend**

```bash
# Install production dependencies
pip install gunicorn

# Run with Gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

#### **Production Frontend**

```bash
# Build for production
expo build:android
expo build:ios

# Or publish to Expo
expo publish
```

## 🐛 Troubleshooting

### **Common Issues**

#### **Backend Won't Start**

```bash
# Check Python version
python --version  # Should be 3.10+

# Check database connection
psql -d ar_map_explorer -c "SELECT 1;"

# Check environment variables
echo $DATABASE_URL
```

#### **Frontend Connection Issues**

```bash
# Check Node.js version
node --version  # Should be 20+

# Clear Expo cache
expo start --clear

# Reset Metro bundler
npx react-native start --reset-cache
```

#### **Mobile App Issues**

1. **"Network Error"**: Check that backend is running and IP address is correct
2. **"Permission Denied"**: Grant location and camera permissions in device settings
3. **"Expo Go SDK Mismatch"**: Update Expo Go app or downgrade Expo SDK

#### **Database Migration Errors**

```bash
# Reset database (WARNING: This deletes all data)
dropdb ar_map_explorer
createdb ar_map_explorer
alembic upgrade head
```

### **Debug Mode**

#### **Backend Debug**

```bash
# Start with debug logging
python -m uvicorn app.main:app --log-level debug --reload
```

#### **Frontend Debug**

```bash
# Start with debug logging
EXPO_DEBUG=1 expo start
```

## 📊 Performance Optimization

### **Backend Optimization**

- **Database Indexing**: Add indexes for frequently queried fields
- **Caching**: Use Redis for caching API responses
- **Connection Pooling**: Configure SQLAlchemy connection pool
- **File Storage**: Use AWS S3 or CDN for large files

### **Frontend Optimization**

- **Image Optimization**: Compress images before upload
- **Lazy Loading**: Load content as user scrolls
- **Caching**: Cache API responses and images locally
- **Bundle Size**: Use Expo's bundle analyzer

## 📈 Monitoring

### **Backend Monitoring**

```bash
# Health check endpoint
curl http://localhost:8001/health

# API documentation
open http://localhost:8001/docs
```

### **Performance Metrics**

- API response times
- Database query performance
- File upload success rates
- User engagement metrics

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### **Code Style**

#### **Backend**

```bash
# Format code
black app/
flake8 app/
```

#### **Frontend**

```bash
# Format code
npm run lint
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: [GitHub Issues](https://github.com/your-username/ar-map-explorer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/ar-map-explorer/discussions)

## 🎯 Roadmap

### **Phase 1 (Current)**
- ✅ Basic AR content creation and discovery
- ✅ GPS-based anchoring
- ✅ User authentication and roles
- ✅ Mobile app with camera integration

### **Phase 2 (Next)**
- 🔄 3D model support (GLB/GLTF)
- 🔄 Advanced AR features (occlusion, lighting)
- 🔄 Social features (comments, ratings)
- 🔄 Content moderation tools

### **Phase 3 (Future)**
- 📋 Web AR viewer
- 📋 Advanced analytics dashboard
- 📋 Multi-tenant architecture
- 📋 Enterprise features

## 🎉 Acknowledgments

- **FastAPI** for the amazing Python web framework
- **Expo** for simplifying React Native development
- **React Navigation** for seamless mobile navigation
- **PostgreSQL** for robust database capabilities

---

**Happy AR Creating! 🚀✨**

For questions or support, please open an issue or reach out to the development team.