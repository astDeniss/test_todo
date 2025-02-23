import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Checkbox,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { getTasks, deleteTask, toggleTaskStatus } from '../services/api';

const TaskList = ({ onEditTask, onTasksChange }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await getTasks();
      setTasks(data.results);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      await fetchTasks();
      if (onTasksChange) onTasksChange();
    } catch (err) {
      setError('Failed to delete task');
      console.error('Error deleting task:', err);
    }
  };

  const handleToggleStatus = async (task) => {
    try {
      await toggleTaskStatus(task.id, task);
      await fetchTasks();
      if (onTasksChange) onTasksChange();
    } catch (err) {
      setError('Failed to update task status');
      console.error('Error updating task status:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const formattedDate = format(date, 'MMM d, yyyy h:mm a');
    const timeAgo = formatDistanceToNow(date, { addSuffix: true });
    return { formattedDate, timeAgo };
  };

  if (loading) {
    return (
      <Box 
        sx={{ display: 'flex', justifyContent: 'center', p: 4 }}
        role="status"
        aria-label="Loading tasks"
      >
        <CircularProgress sx={{ color: '#6366F1' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography 
        color="error" 
        align="center"
        role="alert"
      >
        {error}
      </Typography>
    );
  }

  if (tasks.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          py: 8,
        }}
        role="status"
        aria-label="No tasks found"
      >
        <Typography
          variant="body1"
          sx={{
            color: '#6B7280',
            textAlign: 'center',
          }}
        >
          No tasks yet. Add a new task to get started!
        </Typography>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      role="list"
      aria-label="Task list"
    >
      {tasks.map((task) => {
        const { formattedDate, timeAgo } = formatDate(task.created_at);
        return (
          <Box
            key={task.id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              p: 2,
              borderRadius: 1,
              backgroundColor: task.is_completed ? '#F9FAFB' : '#FFFFFF',
              border: '1px solid',
              borderColor: task.is_completed ? '#E5E7EB' : '#E5E7EB',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: '#D1D5DB',
                backgroundColor: '#F9FAFB',
              },
            }}
            role="listitem"
          >
            <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
              <Checkbox
                checked={task.is_completed}
                onChange={() => handleToggleStatus(task)}
                disableRipple
                inputProps={{
                  'aria-label': `Mark "${task.title}" as ${task.is_completed ? 'incomplete' : 'complete'}`,
                }}
                sx={{
                  color: '#6366F1',
                  padding: '4px',
                  '&.Mui-checked': {
                    color: '#6366F1',
                  },
                  '&:hover': {
                    backgroundColor: 'transparent',
                  },
                  '&.Mui-focusVisible': {
                    outline: 'none',
                  },
                  mt: 0.5,
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography
                  component="div"
                  sx={{
                    textDecoration: task.is_completed ? 'line-through' : 'none',
                    color: task.is_completed ? '#9CA3AF' : '#111827',
                  }}
                >
                  {task.title}
                </Typography>
                {task.description && (
                  <Typography
                    variant="body2"
                    component="div"
                    sx={{
                      color: '#6B7280',
                      mt: 0.5,
                      textDecoration: task.is_completed ? 'line-through' : 'none',
                    }}
                  >
                    {task.description}
                  </Typography>
                )}
              </Box>
              <Stack direction="row" spacing={1}>
                <IconButton
                  onClick={() => onEditTask(task)}
                  size="small"
                  disableRipple
                  aria-label={`Edit task "${task.title}"`}
                  sx={{
                    padding: '4px',
                    color: '#6B7280',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: '#4B5563',
                    },
                    '&:focus': {
                      outline: 'none',
                    },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  onClick={() => handleDelete(task.id)}
                  size="small"
                  disableRipple
                  aria-label={`Delete task "${task.title}"`}
                  sx={{
                    padding: '4px',
                    color: '#6B7280',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: '#DC2626',
                    },
                    '&:focus': {
                      outline: 'none',
                    },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 0.5,
                mt: -1,
              }}
            >
              <ScheduleIcon 
                sx={{ 
                  fontSize: 14,
                  color: '#9CA3AF',
                }} 
              />
              <Tooltip title={formattedDate} arrow placement="top">
                <Typography
                  variant="caption"
                  sx={{
                    color: '#9CA3AF',
                    fontSize: '0.75rem',
                  }}
                >
                  {timeAgo}
                </Typography>
              </Tooltip>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default TaskList; 