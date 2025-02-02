import { create } from 'zustand';
import * as api from '../api/boardApi';

export const useBoardStore = create((set, get) => ({
  sections: [],
  searchQuery: '',
  isLoading: false,
  error: null,
  
  initializeBoard: async () => {
    set({ isLoading: true });
    try {
      const { sections, tasks } = await api.fetchBoard();
      const sectionsWithTasks = sections.map(section => ({
        ...section,
        tasks: tasks
          .filter(task => task.status === section.title.toLowerCase().replace(' ', ''))
          .sort((a, b) => a.order - b.order)
      }));
      set({ 
        sections: sectionsWithTasks.sort((a, b) => a.order - b.order),
        isLoading: false,
        error: null 
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      console.error('Error fetching board:', error);
    }
  },

  addSection: async (title) => {
    try {
      const newSection = {
        id: crypto.randomUUID(),
        title,
      };

      const { sections, tasks } = await api.createSection(newSection);
      const sectionsWithTasks = sections.map(section => ({
        ...section,
        tasks: tasks
          .filter(task => task.status === section.title.toLowerCase().replace(' ', ''))
          .sort((a, b) => a.order - b.order)
      }));
      
      set({ 
        sections: sectionsWithTasks.sort((a, b) => a.order - b.order),
        error: null
      });
    } catch (error) {
      set({ error: error.message });
      console.error('Error adding section:', error);
    }
  },

  updateSection: async (sectionId, title) => {
    try {
      const { sections, tasks } = await api.updateSection(sectionId, { title });
      const sectionsWithTasks = sections.map(section => ({
        ...section,
        tasks: tasks
          .filter(task => task.status === section.title.toLowerCase().replace(' ', ''))
          .sort((a, b) => a.order - b.order)
      }));
      
      set({ 
        sections: sectionsWithTasks.sort((a, b) => a.order - b.order),
        error: null
      });
    } catch (error) {
      set({ error: error.message });
      console.error('Error updating section:', error);
    }
  },

  deleteSection: async (sectionId) => {
    try {
      const { sections, tasks } = await api.deleteSection(sectionId);
      const sectionsWithTasks = sections.map(section => ({
        ...section,
        tasks: tasks
          .filter(task => task.status === section.title.toLowerCase().replace(' ', ''))
          .sort((a, b) => a.order - b.order)
      }));
      
      set({ 
        sections: sectionsWithTasks.sort((a, b) => a.order - b.order),
        error: null
      });
    } catch (error) {
      set({ error: error.message });
      console.error('Error deleting section:', error);
    }
  },

  addTask: async (sectionId, task) => {
    const section = get().sections.find(s => s.id === sectionId);
    const tasks = section.tasks;
    const maxOrder = tasks.length > 0 ? Math.max(...tasks.map(t => t.order)) : -1;
    
    const newTask = {
      ...task,
      status: section.title.toLowerCase().replace(' ', ''),
      order: maxOrder + 1000
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
      const targetSectionTasks = toSection.tasks.filter(t => (t._id || t.id) !== taskId);
      
      const updatedTasks = [...targetSectionTasks];
      updatedTasks.splice(toIndex, 0, taskToMove);
      const reorderedTasks = updatedTasks.map((task, index) => ({
        ...task,
        order: index * 1000
      }));

      const updatedTask = {
        ...taskToMove,
        status: toSection.title.toLowerCase().replace(' ', ''),
        order: reorderedTasks[toIndex].order
      };

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

      const serverUpdatedTasks = await api.updateTask(taskId, updatedTask);

      for (const task of reorderedTasks) {
        if ((task._id || task.id) !== taskId) {
          await api.updateTask(task._id || task.id, { order: task.order });
        }
      }

      set((state) => ({
        sections: state.sections.map((section) => ({
          ...section,
          tasks: serverUpdatedTasks
            .filter(task => task.status === section.title.toLowerCase().replace(' ', ''))
            .sort((a, b) => a.order - b.order)
        })),
      }));
    } catch (error) {
      get().initializeBoard();
      set({ error: error.message });
      console.error('Error moving task:', error);
    }
  },

  deleteTask: async (sectionId, taskId) => {
    try {
      set((state) => ({
        sections: state.sections.map((section) => ({
          ...section,
          tasks: section.tasks.filter((task) => task._id !== taskId),
        })),
        error: null
      }));

      const updatedTasks = await api.deleteTask(taskId);

      set((state) => ({
        sections: state.sections.map((section) => ({
          ...section,
          tasks: updatedTasks
            .filter(task => task.status === section.title.toLowerCase().replace(' ', ''))
            .sort((a, b) => a.order - b.order)
        })),
      }));
    } catch (error) {
      get().initializeBoard();
      set({ error: error.message });
      console.error('Error deleting task:', error);
    }
  },

  updateTask: async (sectionId, taskId, updatedTask) => {
    try {
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

      set((state) => ({
        sections: state.sections.map((section) => ({
          ...section,
          tasks: updatedTasks
            .filter(task => task.status === section.title.toLowerCase().replace(' ', ''))
            .sort((a, b) => a.order - b.order)
        })),
      }));
    } catch (error) {
      get().initializeBoard();
      set({ error: error.message });
      console.error('Error updating task:', error);
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
}));