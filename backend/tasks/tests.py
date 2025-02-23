from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Task
from django.utils import timezone
from datetime import datetime

User = get_user_model()

class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/register/'
        self.login_url = '/api/token/'
        self.tasks_url = '/api/tasks/'
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        self.login_data = {
            'username': 'testuser',
            'password': 'testpass123'
        }

    def test_user_registration_success(self):
        """Test successful user registration"""
        response = self.client.post(self.register_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username=self.user_data['username']).exists())
        user = User.objects.get(username=self.user_data['username'])
        self.assertEqual(user.email, self.user_data['email'])

    def test_user_registration_duplicate_username(self):
        """Test registration with duplicate username"""
        # Create first user
        self.client.post(self.register_url, self.user_data, format='json')
        
        # Try to create user with same username
        duplicate_user = {
            'username': 'testuser',
            'email': 'another@example.com',
            'password': 'anotherpass123'
        }
        response = self.client.post(self.register_url, duplicate_user, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data)

    def test_user_registration_invalid_email(self):
        """Test registration with invalid email"""
        invalid_user = {
            'username': 'newuser',
            'email': 'invalid-email',
            'password': 'testpass123'
        }
        response = self.client.post(self.register_url, invalid_user, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_user_registration_missing_fields(self):
        """Test registration with missing required fields"""
        incomplete_data = {'username': 'testuser'}
        response = self.client.post(self.register_url, incomplete_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)
        self.assertIn('email', response.data)

    def test_user_login_success(self):
        """Test successful user login and token generation"""
        # Create user first
        self.client.post(self.register_url, self.user_data, format='json')
        
        # Attempt login
        response = self.client.post(self.login_url, self.login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_user_login_wrong_credentials(self):
        """Test login with wrong credentials"""
        # Create user first
        self.client.post(self.register_url, self.user_data, format='json')
        
        # Attempt login with wrong password
        wrong_credentials = {
            'username': 'testuser',
            'password': 'wrongpass'
        }
        response = self.client.post(self.login_url, wrong_credentials, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_access_protected_route_without_token(self):
        """Test accessing protected route without authentication"""
        response = self.client.get(self.tasks_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_access_protected_route_with_token(self):
        """Test accessing protected route with valid authentication"""
        # Create user and get token
        self.client.post(self.register_url, self.user_data, format='json')
        response = self.client.post(self.login_url, self.login_data, format='json')
        token = response.data['access']
        
        # Access protected route with token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(self.tasks_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_token_refresh(self):
        """Test refreshing access token"""
        # Create user and get tokens
        self.client.post(self.register_url, self.user_data, format='json')
        response = self.client.post(self.login_url, self.login_data, format='json')
        refresh_token = response.data['refresh']
        
        # Attempt to refresh token
        refresh_url = '/api/token/refresh/'
        response = self.client.post(refresh_url, {'refresh': refresh_token}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

class TaskTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Create a test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        # Authenticate the client
        auth_response = self.client.post('/api/token/', {
            'username': 'testuser',
            'password': 'testpass123'
        }, format='json')
        token = auth_response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        # Create a test task
        self.task_data = {
            'title': 'Test Task',
            'description': 'Test Description',
            'is_completed': False
        }
        self.task = Task.objects.create(user=self.user, **self.task_data)

    def test_create_task_success(self):
        """Test successful task creation"""
        response = self.client.post('/api/tasks/', self.task_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Task.objects.count(), 2)
        self.assertEqual(response.data['title'], self.task_data['title'])
        self.assertEqual(response.data['description'], self.task_data['description'])
        self.assertEqual(response.data['is_completed'], self.task_data['is_completed'])
        self.assertIn('id', response.data)
        self.assertIn('created_at', response.data)
        self.assertIn('updated_at', response.data)

    def test_create_task_without_title(self):
        """Test task creation without required title field"""
        invalid_data = {
            'description': 'Test Description',
            'is_completed': False
        }
        response = self.client.post('/api/tasks/', invalid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('title', response.data)

    def test_create_task_with_empty_title(self):
        """Test task creation with empty title"""
        invalid_data = {
            'title': '',
            'description': 'Test Description',
            'is_completed': False
        }
        response = self.client.post('/api/tasks/', invalid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('title', response.data)

    def test_create_task_with_long_title(self):
        """Test task creation with title exceeding max length"""
        invalid_data = {
            'title': 'x' * 101,  # Max length is 100
            'description': 'Test Description'
        }
        response = self.client.post('/api/tasks/', invalid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('title', response.data)

    def test_get_task_list_empty(self):
        """Test getting task list when no tasks exist"""
        Task.objects.all().delete()
        response = self.client.get('/api/tasks/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 0)

    def test_get_task_list_pagination(self):
        """Test task list pagination"""
        # Create 15 additional tasks
        for i in range(15):
            Task.objects.create(user=self.user, title=f'Task {i}', description=f'Description {i}')
        
        response = self.client.get('/api/tasks/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 10)  # Default page size
        self.assertIsNotNone(response.data['next'])
        self.assertIsNone(response.data['previous'])

    def test_get_task_list_ordering(self):
        """Test task list ordering by created_at"""
        Task.objects.create(user=self.user, title='Newer Task')
        response = self.client.get('/api/tasks/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['results'][0]['title'], 'Newer Task')

    def test_get_task_detail_not_found(self):
        """Test getting non-existent task"""
        response = self.client.get('/api/tasks/999/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_task_partial(self):
        """Test partial update (PATCH) of a task"""
        patch_data = {'title': 'Updated Task Title'}
        response = self.client.patch(f'/api/tasks/{self.task.id}/', patch_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], patch_data['title'])
        self.assertEqual(response.data['description'], self.task_data['description'])

    def test_update_task_invalid_data(self):
        """Test update with invalid data"""
        invalid_data = {
            'title': '',
            'is_completed': 'not_a_boolean'
        }
        response = self.client.put(f'/api/tasks/{self.task.id}/', invalid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('title', response.data)
        self.assertIn('is_completed', response.data)

    def test_update_nonexistent_task(self):
        """Test updating a non-existent task"""
        response = self.client.put('/api/tasks/999/', self.task_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_task_not_found(self):
        """Test deleting a non-existent task"""
        response = self.client.delete('/api/tasks/999/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_task_user_isolation(self):
        """Test that users can only access their own tasks"""
        # Create another user and their task
        other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='otherpass123'
        )
        other_task = Task.objects.create(
            user=other_user,
            title='Other User Task',
            description='This task belongs to another user'
        )
        
        # Try to access other user's task
        response = self.client.get(f'/api/tasks/{other_task.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        # Try to update other user's task
        response = self.client.put(
            f'/api/tasks/{other_task.id}/',
            {'title': 'Updated Title'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        # Try to delete other user's task
        response = self.client.delete(f'/api/tasks/{other_task.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        # Verify the task still exists
        self.assertTrue(Task.objects.filter(id=other_task.id).exists())

    def test_create_task_with_additional_fields(self):
        """Test task creation with additional unexpected fields"""
        data_with_extra = {
            **self.task_data,
            'extra_field': 'extra_value',
            'created_at': timezone.now()
        }
        response = self.client.post('/api/tasks/', data_with_extra, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertNotIn('extra_field', response.data)
        
    def test_bulk_task_operations(self):
        """Test creating multiple tasks and retrieving them"""
        tasks_to_create = [
            {'title': f'Bulk Task {i}', 'description': f'Bulk Description {i}'} 
            for i in range(5)
        ]
        
        for task_data in tasks_to_create:
            response = self.client.post('/api/tasks/', task_data, format='json')
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        response = self.client.get('/api/tasks/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 6)  # 5 new + 1 from setUp
