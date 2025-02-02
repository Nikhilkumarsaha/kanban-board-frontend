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
        tasks: tasks
          .filter(task => task.status === section.title.toLowerCase().replace(' ', ''))
          .sort((a, b) => a.order - b.order)
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
    const tasks = section.tasks;
    const maxOrder = tasks.length > 0 ? Math.max(...tasks.map(t => t.order)) : -1;
    
    const newTask = {
      ...task,
      status: section.title.toLowerCase().replace(' ', ''),
      order: maxOrder + 1
    };

    try {
      const updatedTasks = await api.createTask(newTask);
      set((state) => ({
        sections: state.sections.map((section) => ({
          ...section,
          tasks: updatedTasks
            .filter(task => task.status === section.title.toLowerCase().replace(' ', ''))
            .sort((a, b) => a.order - b.order)
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
      // Get all tasks in the target section
      const targetSectionTasks = toSection.tasks.filter(t => (t._id || t.id) !== taskId);
      
      // Calculate new orders for all affected tasks
      const updatedTasks = [...targetSectionTasks];
      updatedTasks.splice(toIndex, 0, taskToMove);
      const reorderedTasks = updatedTasks.map((task, index) => ({
        ...task,
        order: index * 1000 // Use large intervals to allow for future insertions
      }));

      // Update the moved task with new status and order
      const updatedTask = {
        ...taskToMove,
        status: toSection.title.toLowerCase().replace(' ', ''),
        order: reorderedTasks[toIndex].order
      };

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
            return {
              ...section,
              tasks: reorderedTasks
            };
          }
          return section;
        });
        return { sections: newSections, error: null };
      });

      // Update the task on the server
      const serverUpdatedTasks = await api.updateTask(taskId, updatedTask);

      // Update all tasks in the target section with their new orders
      for (const task of reorderedTasks) {
        if ((task._id || task.id) !== taskId) {
          await api.updateTask(task._id || task.id, { order: task.order });
        }
      }

      // Final state update with server response
      set((state) => ({
        sections: state.sections.map((section) => ({
          ...section,
          tasks: serverUpdatedTasks
            .filter(task => task.status === section.title.toLowerCase().replace(' ', ''))
            .sort((a, b) => a.order - b.order)
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
          tasks: updatedTasks
            .filter(task => task.status === section.title.toLowerCase().replace(' ', ''))
            .sort((a, b) => a.order - b.order)
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
          ).sort((a, b) => a.order - b.order),
        })),
        error: null
      }));

      const updatedTasks = await api.updateTask(taskId, updatedTask);

      // Update with server response
      set((state) => ({
        sections: state.sections.map((section) => ({
          ...section,
          tasks: updatedTasks
            .filter(task => task.status === section.title.toLowerCase().replace(' ', ''))
            .sort((a, b) => a.order - b.order)
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