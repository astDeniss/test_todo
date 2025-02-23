# ToDO Test Application


## Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Apply migrations:
```bash
python3 manage.py migrate
```

5. Run the development server:
```bash
python3 manage.py runserver
```

The API will be available at http://localhost:8000/api/

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The application will be available at http://localhost:5173/


## API Endpoints

### Authentication Endpoints
- `POST /api/register/`: Register a new user
- `POST /api/token/`: Obtain JWT tokens
- `POST /api/token/refresh/`: Refresh access token

### Task Endpoints (Protected Routes)
- `GET /api/tasks/`: List all tasks
- `GET /api/tasks/{id}/`: Retrieve a specific task
- `POST /api/tasks/`: Create a new task
- `PUT /api/tasks/{id}/`: Update a task
- `DELETE /api/tasks/{id}/`: Delete a task

## Testing

### Running Backend Tests


```bash
cd backend
python3 manage.py test tasks.tests
```

Test coverage includes:
- User registration and validation
- Authentication and token management
- Protected route access
- Task CRUD operations
- User isolation for tasks
- Input validation
- Error handling


## Tech Stack

### Backend
- Django
- Django REST Framework
- Simple JWT for authentication
- SQLite database
- Django CORS headers

### Frontend
- React
- Material-UI
- Axios for API calls
- React Router for navigation
- Vite for build tooling
