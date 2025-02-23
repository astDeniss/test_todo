# Django Backend Developer Coding Test Task

This task focuses on building a RESTful API and implementing best practices in Django.

## Task: Build a Simple Task Management API Objective

The candidate is required to create a RESTful API for a task management system with the following features:

## Requirements

### Stack

- Django REST Framework for backend
- React for frontend
- SQLite for database

### Models

Create a model for Task with the following fields:
- `id` (auto-generated)
- `title` (string, max length 100)
- `description` (text, optional)
- `is_completed` (boolean, default: False)
- `created_at` (timestamp, auto-generated)
- `updated_at` (timestamp, auto-generated)

### API Endpoints

Use Django REST Framework (DRF) to create the following endpoints:
- `GET /tasks/`: List all tasks
- `GET /tasks/{id}/`: Retrieve a specific task by ID
- `POST /tasks/`: Create a new task
- `PUT /tasks/{id}/`: Update an existing task
- `DELETE /tasks/{id}/`: Delete a task

### Validation

- Implement validation for the task fields (e.g., ensure the title is not empty)
- Return appropriate HTTP status codes for different scenarios (e.g., 201 for created, 404 for not found)

### Authentication (Bonus)

- Implement user authentication using Django's built-in authentication system
- Ensure that only authenticated users can create, update, or delete tasks

### Testing

- Write unit tests for the API endpoints using Django's testing framework
- Ensure that tests cover all CRUD operations and edge cases (e.g., invalid data)

## Requirements for Submission

- The project should be structured and follow best practices for Django development
- Include a README.md file with clear instructions on how to set up and run the project locally
- Use SQLite as the database for simplicity

## Evaluation Criteria

- **Code Quality**: Clean, modular, and well-documented code
- **Functionality**: All features should work as described
- **Best Practices**: Proper use of Django REST Framework
- **Testing**: Comprehensive unit tests that cover various scenarios
- **Error Handling**: Robust validation and error handling for API requests