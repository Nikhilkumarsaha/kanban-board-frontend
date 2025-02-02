import { create } from 'zustand';

const initialSections = [
  { id: '1', title: 'Todo', tasks: [] },
  { id: '2', title: 'In Progress', tasks: [] },
  { id: '3', title: 'Done', tasks: [] },
];

export const useBoardStore = create((set) => ({
  sections: initialSections,
  searchQuery: '',
  
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

  addTask: (sectionId, task) => set((state) => ({
    sections: state.sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          tasks: [...section.tasks, { ...task, id: crypto.randomUUID() }],
        };
      }
      return section;
    }),
  })),

  moveTask: (fromSectionId, toSectionId, taskId, toIndex) => set((state) => {
    const fromSection = state.sections.find((s) => s.id === fromSectionId);
    if (!fromSection) return state;

    const taskToMove = fromSection.tasks.find((t) => t.id === taskId);
    if (!taskToMove) return state;

    const updatedFromSection = {
      ...fromSection,
      tasks: fromSection.tasks.filter((t) => t.id !== taskId),
    };

    if (fromSectionId === toSectionId) {
      const reorderedTasks = [...updatedFromSection.tasks];
      reorderedTasks.splice(toIndex, 0, taskToMove);
      
      return {
        sections: state.sections.map((section) =>
          section.id === fromSectionId
            ? { ...section, tasks: reorderedTasks }
            : section
        ),
      };
    }

    return {
      sections: state.sections.map((section) => {
        if (section.id === fromSectionId) {
          return updatedFromSection;
        }
        if (section.id === toSectionId) {
          const newTasks = [...section.tasks];
          newTasks.splice(toIndex, 0, taskToMove);
          return { ...section, tasks: newTasks };
        }
        return section;
      }),
    };
  }),

  deleteTask: (sectionId, taskId) => set((state) => ({
    sections: state.sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          tasks: section.tasks.filter((task) => task.id !== taskId),
        };
      }
      return section;
    }),
  })),

  updateTask: (sectionId, taskId, updatedTask) => set((state) => ({
    sections: state.sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          tasks: section.tasks.map((task) => {
            if (task.id === taskId) {
              return { ...task, ...updatedTask };
            }
            return task;
          }),
        };
      }
      return section;
    }),
  })),

  setSearchQuery: (query) => set({ searchQuery: query }),
}));