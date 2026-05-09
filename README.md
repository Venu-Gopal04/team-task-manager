# TaskFlow — Team Task Manager

A full-stack web application for managing projects and tasks with role-based access control. Built as part of a software engineering assessment.
🚀 Live Demo

**Frontend:** https://taskflow-frontend-zri4.onrender.com

**Backend API:** https://team-task-manager-smgi.onrender.com/api

**GitHub:** https://github.com/Venu-Gopal04/team-task-manager


📸 Screenshots

Dashboard (Admin)
- Real-time stats showing To Do, In Progress, Done, and Overdue tasks
- Recent tasks list with project name, assignee, due date, and priority

Tasks Page (Admin)
- Full task list with filter buttons
- Create, assign, and delete tasks
- Overdue detection in red

Projects Page
- Admin can create and delete projects
- Members can only view projects they belong to

Member View
- No create/delete buttons visible
- Can only update task status
- Sees only assigned tasks



🛠️ Tech Stack

 Frontend
- React 18
- Vite
- TailwindCSS
- React Router DOM
- Axios

Backend
- Node.js
- Express.js
- PostgreSQL
- JWT (JSON Web Tokens)
- bcryptjs

Deployment
- Frontend: Render (Static Site)
- Backend: Render (Web Service)
- Database: Render (PostgreSQL)



✨ Features

### Authentication
- User registration with name, email, password, and role selection
- Secure login with JWT token
- Token stored in localStorage
- Protected routes — redirects to login if not authenticated

Role-Based Access Control
| Feature | Admin | Member |
|---|---|---|
| Create projects | ✅ | ❌ |
| Delete projects | ✅ | ❌ |
| Create tasks | ✅ | ❌ |
| Assign tasks | ✅ | ❌ |
| Delete tasks | ✅ | ❌ |
| View projects | ✅ | ✅ |
| View tasks | ✅ | ✅ |
| Update task status | ✅ | ✅ |
| View dashboard | ✅ | ✅ |

Project Management
- Admin can create projects with name and description
- Admin can delete projects
- Members are added to projects to view tasks

 Task Management
- Create tasks with title, description, project, assignee, due date, priority
- Priority levels: Low, Medium, High
- Status tracking: To Do, In Progress, Done
- Filter tasks by status
- Automatic overdue detection (highlighted in red)

Dashboard
- Live stats: To Do count, In Progress count, Done count, Overdue count
- Recent tasks list with all details
- Stats update in real time when status changes


🗄️ Database Schema

users
| Column | Type | Description |
|---|---|---|
| id | SERIAL PRIMARY KEY | Unique user ID |
| name | VARCHAR(100) | Full name |
| email | VARCHAR(150) UNIQUE | Email address |
| password | VARCHAR(255) | Hashed password |
| role | VARCHAR(20) | admin or member |
| created_at | TIMESTAMP | Registration date |

projects
| Column | Type | Description |
|---|---|---|
| id | SERIAL PRIMARY KEY | Unique project ID |
| name | VARCHAR(150) | Project name |
| description | TEXT | Project description |
| owner_id | INTEGER | References users(id) |
| created_at | TIMESTAMP | Creation date |

project_members
| Column | Type | Description |
|---|---|---|
| project_id | INTEGER | References projects(id) |
| user_id | INTEGER | References users(id) |

tasks
| Column | Type | Description |
|---|---|---|
| id | SERIAL PRIMARY KEY | Unique task ID |
| title | VARCHAR(200) | Task title |
| description | TEXT | Task details |
| project_id | INTEGER | References projects(id) |
| assignee_id | INTEGER | References users(id) |
| status | VARCHAR(20) | todo, in_progress, done |
| priority | VARCHAR(20) | low, medium, high |
| due_date | DATE | Deadline |
| created_at | TIMESTAMP | Creation date |
| updated_at | TIMESTAMP | Last updated |



🔌 API Endpoints

Auth
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | /api/auth/register | Register new user | Public |
| POST | /api/auth/login | Login user | Public |

Projects
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | /api/projects | Get all projects | Auth |
| POST | /api/projects | Create project | Admin |
| DELETE | /api/projects/:id | Delete project | Admin |
| POST | /api/projects/:id/members | Add member | Admin |
| GET | /api/projects/:id/members | Get members | Auth |

Tasks
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | /api/tasks | Get all tasks | Auth |
| POST | /api/tasks | Create task | Admin |
| PATCH | /api/tasks/:id/status | Update status | Auth |
| PUT | /api/tasks/:id | Update task | Admin |
| DELETE | /api/tasks/:id | Delete task | Admin |

Users
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | /api/users | Get all users | Admin |
| GET | /api/users/me | Get own profile | Auth |


🚀 Running Locally

 Prerequisites
- Node.js v18+
- PostgreSQL
- Git

Step 1 — Clone the repo
```bash
git clone https://github.com/Venu-Gopal04/team-task-manager.git
cd team-task-manager
```

 Step 2 — Setup Backend
```bash
cd backend
npm install
```

Create `.env` file in backend folder:

PORT=5000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/taskmanager
JWT_SECRET=your_secret_key_here
NODE_ENV=development
 Step 3 — Setup Database
Open pgAdmin or psql and run:
```sql
CREATE DATABASE taskmanager;
```
Then run the schema from `backend/schema.sql`

### Step 4 — Setup Frontend
```bash
cd ../frontend
npm install
```

Create `.env` file in frontend folder:

VITE_API_URL=http://localhost:5000/api

### Step 5 — Run Both Servers

Backend (terminal 1):
```bash
cd backend
npm run dev
```

Frontend (terminal 2):
```bash
cd frontend
npm run dev
```

Open browser: `http://localhost:5173`


 📁 Project Structure

eam-task-manager/
├── backend/
│   ├── middleware/
│   │   └── auth.js          # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js          # Register and login routes
│   │   ├── projects.js      # Project CRUD routes
│   │   ├── tasks.js         # Task CRUD routes
│   │   └── users.js         # User routes
│   ├── db.js                # PostgreSQL connection
│   ├── server.js            # Express app entry point
│   ├── schema.sql           # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js     # Axios instance with auth header
│   │   ├── components/
│   │   │   ├── Navbar.jsx   # Navigation bar
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Auth state management
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Projects.jsx
│   │   │   └── Tasks.jsx
│   │   ├── App.jsx          # Routes configuration
│   │   └── main.jsx
│   └── package.json
└── .gitignore



🔐 Security
- Passwords hashed using bcryptjs (12 rounds)
- JWT tokens expire in 7 days
- Role-based middleware protects admin routes
- Environment variables for all sensitive data
- SSL enabled for production database connection

👨‍💻 Author

Venugopal Ganji
 GitHub: [@Venu-Gopal04](https://github.com/Venu-Gopal04)
