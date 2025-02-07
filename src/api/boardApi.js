const API_BASE_URL = import.meta.env.VITE_BACKEND_URI;

const getHeaders = () => {
  const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const fetchBoard = async () => {
  const response = await fetch(`${API_BASE_URL}/board`, {
    headers: getHeaders()
  });
  if (!response.ok) {
    throw new Error('Failed to fetch board data');
  }
  return response.json();
};

export const createSection = async (section) => {
  const response = await fetch(`${API_BASE_URL}/sections`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(section),
  });
  if (!response.ok) {
    throw new Error('Failed to create section');
  }
  return response.json();
};

export const updateSection = async (sectionId, updates) => {
  const response = await fetch(`${API_BASE_URL}/sections/${sectionId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    throw new Error('Failed to update section');
  }
  return response.json();
};

export const deleteSection = async (sectionId) => {
  const response = await fetch(`${API_BASE_URL}/sections/${sectionId}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!response.ok) {
    throw new Error('Failed to delete section');
  }
  return response.json();
};

export const createTask = async (task) => {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(task),
  });
  if (!response.ok) {
    throw new Error('Failed to create task');
  }
  return response.json();
};

export const updateTask = async (taskId, updates) => {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    throw new Error('Failed to update task');
  }
  return response.json();
};

export const deleteTask = async (taskId) => {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!response.ok) {
    throw new Error('Failed to delete task');
  }
  return response.json();
};