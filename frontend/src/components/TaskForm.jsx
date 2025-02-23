import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Box,
} from '@mui/material';
import { createTask, updateTask } from '../services/api';

const TaskForm = ({ open, onClose, task, onTaskSaved }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_completed: false,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        is_completed: task.is_completed,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        is_completed: false,
      });
    }
    setErrors({});
  }, [task]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (task) {
        await updateTask(task.id, formData);
      } else {
        await createTask(formData);
      }
      onTaskSaved();
      onClose();
    } catch (err) {
      console.error('Error saving task:', err);
      setErrors({ submit: 'Failed to save task' });
    }
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'is_completed' ? checked : value,
    }));
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm" 
      fullWidth
      aria-labelledby="task-dialog-title"
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        },
      }}
    >
      <DialogTitle 
        id="task-dialog-title"
        sx={{ 
          pb: 1,
          fontWeight: 600,
        }}
      >
        {task ? 'Edit Task' : 'New Task'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              autoFocus
              name="title"
              label="Task title"
              type="text"
              fullWidth
              value={formData.title}
              onChange={handleChange}
              error={!!errors.title}
              helperText={errors.title}
              required
              inputProps={{
                'aria-label': 'Task title',
                maxLength: 100,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                },
              }}
            />
            <TextField
              name="description"
              label="Description (optional)"
              type="text"
              fullWidth
              multiline
              rows={4}
              value={formData.description}
              onChange={handleChange}
              inputProps={{
                'aria-label': 'Task description',
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                },
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.is_completed}
                  onChange={handleChange}
                  name="is_completed"
                  inputProps={{
                    'aria-label': 'Mark task as completed',
                  }}
                  sx={{
                    color: '#6366F1',
                    '&.Mui-checked': {
                      color: '#6366F1',
                    },
                  }}
                />
              }
              label="Mark as completed"
            />
          </Box>
          {errors.submit && (
            <Box 
              sx={{ color: 'error.main', mt: 2 }}
              role="alert"
            >
              {errors.submit}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={onClose}
            sx={{
              color: '#6B7280',
              '&:hover': {
                backgroundColor: '#F3F4F6',
              },
            }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained"
            sx={{
              backgroundColor: '#6366F1',
              '&:hover': {
                backgroundColor: '#4F46E5',
              },
              borderRadius: 1,
              px: 3,
            }}
          >
            {task ? 'Save Changes' : 'Create Task'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TaskForm; 