import { create } from 'zustand';
import * as api from '../api/boardApi';

const initialSections = [
  { id: '1', title: 'Todo', tasks: [] },
  { id: '2', title: 'In Progress', tasks: [] },
  { id: '3', title: 'Done', tasks: [] },
];

export const useBoardStore = create((set, get) => ({
  sections: initialSections,
  searchQuery: '',
  isLoading: false,
  error: null,
  
  initializeBoard: async () => {
    set({ isLoading: true });
    try {
      const tasks = await api.fetchTasks();
      const sections = get().sections.map(section => ({
        ...section,
        tasks: tasks.filter(task => task.status === section.title.toLowerCase().replace(' ', ''))
      }));
      set({ sections, isLoading: false, error: null });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      console.error('Error fetching tasks:', error);
    }
  },

  addSection: (title) => set((state) => ({
    sections: [...state.sections, {
      id: crypto.randomUUID(),
      title,
      tasks: [],
    }],
  })),

  updateSection: (sectionId, title) => set((state) => ({
    sections: state.sections.map((section) => 
      section.id === sectionId ? { ...section, title } : section
    ),
  })),

  deleteSection: (sectionId) => set((state) => ({
    sections: state.sections.filter((section) => section.id !== sectionId),
  })),

  addTask: async (sectionId, task) => {
    const section = get().sections.find(s => s.id === sectionId);
    const newTask = {
      ...task,
      status: section.title.toLowerCase().replace(' ', ''),
    };

    try {
      const updatedTasks = await api.createTask(newTask);
      set((state) => ({
        sections: state.sections.map((section) => ({
          ...section,
          tasks: updatedTasks.filter(task => 
            task.status === section.title.toLowerCase().replace(' ', '')
          ),
        })),
        error: null
      }));
    } catch (error) {
      set({ error: error.message });
      console.error('Error adding task:', error);
    }
  },


  moveTask: async (fromSectionId, toSectionId, taskId, toIndex) => {
    const fromSection = get().sections.find((s) => s.id === fromSectionId);
    const toSection = get().sections.find((s) => s.id === toSectionId);
    
    if (!fromSection || !toSection) return;

    const taskToMove = fromSection.tasks.find((t) => (t._id || t.id) === taskId);
    if (!taskToMove) return;

    try {
      // Optimistically update the UI
      set((state) => {
        const newSections = state.sections.map(section => {
          if (section.id === fromSectionId) {
            return {
              ...section,
              tasks: section.tasks.filter(t => (t._id || t.id) !== taskId)
            };
          }
          if (section.id === toSectionId) {
            const newTasks = [...section.tasks];
            const updatedTask = {
              ...taskToMove,
              status: toSection.title.toLowerCase().replace(' ', '')
            };
            newTasks.splice(toIndex, 0, updatedTask);
            return {
              ...section,
              tasks: newTasks
            };
          }
          return section;
        });
        return { sections: newSections, error: null };
      });

      // Make API call
      const updatedTask = {
        ...taskToMove,
        status: toSection.title.toLowerCase().replace(' ', '')
      };
      const updatedTasks = await api.updateTask(taskId, updatedTask);

      // Update with server response
      set((state) => ({
        sections: state.sections.map((section) => ({
          ...section,
          tasks: updatedTasks.filter(task => 
            task.status === section.title.toLowerCase().replace(' ', '')
          ),
        })),
      }));
    } catch (error) {
      // Revert optimistic update on error
      get().initializeBoard();
      set({ error: error.message });
      console.error('Error moving task:', error);
    }
  },
  deleteTask: async (sectionId, taskId) => {
    try {
      // Optimistically remove the task
      set((state) => ({
        sections: state.sections.map((section) => ({
          ...section,
          tasks: section.tasks.filter((task) => task._id !== taskId),
        })),
        error: null
      }));

      const updatedTasks = await api.deleteTask(taskId);

      // Update with server response
      set((state) => ({
        sections: state.sections.map((section) => ({
          ...section,
          tasks: updatedTasks.filter(task => 
            task.status === section.title.toLowerCase().replace(' ', '')
          ),
        })),
      }));
    } catch (error) {
      // Revert optimistic update on error
      get().initializeBoard();
      set({ error: error.message });
      console.error('Error deleting task:', error);
    }
  },

  updateTask: async (sectionId, taskId, updatedTask) => {
    try {
      // Optimistically update the task
      set((state) => ({
        sections: state.sections.map((section) => ({
          ...section,
          tasks: section.tasks.map((task) => 
            task._id === taskId ? { ...task, ...updatedTask } : task
          ),
        })),
        error: null
      }));

      const updatedTasks = await api.updateTask(taskId, updatedTask);

      // Update with server response
      set((state) => ({
        sections: state.sections.map((section) => ({
          ...section,
          tasks: updatedTasks.filter(task => 
            task.status === section.title.toLowerCase().replace(' ', '')
          ),
        })),
      }));
    } catch (error) {
      // Revert optimistic update on error
      get().initializeBoard();
      set({ error: error.message });
      console.error('Error updating task:', error);
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
}));