import { useState, useRef, useEffect } from 'react'
import {
  Container,
  Typography,
  Button,
  Box,
  TextField,
  Paper,
  AppBar,
  Toolbar,
} from '@mui/material'
import { Add as AddIcon, Logout as LogoutIcon } from '@mui/icons-material'
import TaskList from './components/TaskList'
import TaskForm from './components/TaskForm'
import Login from './components/Login'
import Register from './components/Register'
import NotebookBackground from './components/NotebookBackground'
import { isAuthenticated, logout } from './services/auth'
import './App.css'

function App() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated())
  const [currentView, setCurrentView] = useState('tasks') // 'tasks', 'login', or 'register'
  const addButtonRef = useRef(null)

  useEffect(() => {
    if (!isAuthenticated()) {
      setCurrentView('login')
    }
  }, [])

  const handleAddClick = () => {
    setSelectedTask(null)
    setIsFormOpen(true)
  }

  const handleEditTask = (task) => {
    setSelectedTask(task)
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setSelectedTask(null)
    if (addButtonRef.current) {
      addButtonRef.current.focus()
    }
  }

  const handleTaskSaved = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
    setCurrentView('tasks')
  }

  const handleLogout = () => {
    logout()
    setIsLoggedIn(false)
    setCurrentView('login')
  }

  if (!isLoggedIn) {
    return (
      <>
        <NotebookBackground />
        {currentView === 'login' ? (
          <Login 
            onLoginSuccess={handleLoginSuccess}
            onRegisterClick={() => setCurrentView('register')}
          />
        ) : (
          <Register
            onRegisterSuccess={handleLoginSuccess}
            onLoginClick={() => setCurrentView('login')}
          />
        )}
      </>
    )
  }

  return (
    <>
      <NotebookBackground />
      <Box sx={{ pt: 4 }}>
        <Container maxWidth="md">
          <Paper 
            elevation={3}
            sx={{ 
              backgroundColor: '#ffffff',
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              height: '64px',
              px: 3,
              borderRadius: 3,
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#111827',
                fontWeight: 600,
              }}
            >
              Todo Test App
            </Typography>
            <Button
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{
                color: '#6B7280',
                '&:hover': {
                  backgroundColor: '#F3F4F6',
                },
              }}
            >
              Logout
            </Button>
          </Paper>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4,
            borderRadius: 3,
            backgroundColor: '#ffffff',
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3
          }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#1a1a1a' }}>
              My Tasks
            </Typography>
          </Box>

          <Box 
            component="form" 
            sx={{ 
              display: 'flex', 
              gap: 2,
              mb: 4
            }}
            onSubmit={(e) => {
              e.preventDefault()
              handleAddClick()
            }}
          >
            <TextField
              fullWidth
              placeholder="Add a new task..."
              variant="outlined"
              sx={{
                backgroundColor: '#fff',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  },
                },
              }}
              onClick={handleAddClick}
              aria-label="New task input"
            />
            <Button
              ref={addButtonRef}
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddClick}
              sx={{
                backgroundColor: '#6366F1',
                borderRadius: 2,
                px: 3,
                '&:hover': {
                  backgroundColor: '#4F46E5',
                },
                whiteSpace: 'nowrap',
              }}
              aria-label="Add new task"
            >
              Add Task
            </Button>
          </Box>

          <TaskList
            key={refreshKey}
            onEditTask={handleEditTask}
            onTasksChange={handleTaskSaved}
          />
          <TaskForm
            open={isFormOpen}
            onClose={handleFormClose}
            task={selectedTask}
            onTaskSaved={handleTaskSaved}
          />
        </Paper>
      </Container>
    </>
  )
}

export default App
