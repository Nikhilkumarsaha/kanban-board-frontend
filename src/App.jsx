import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Plus, Search, Settings, Share2, X } from 'lucide-react';
import { Section } from './components/Section';
import { SettingsModal } from './components/SettingsModal';
import { useBoardStore } from './store/board-store';

function App() {
  const [isAddingSectionOpen, setIsAddingSectionOpen] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const { 
    sections, 
    addSection, 
    moveTask, 
    setSearchQuery,
    initializeBoard,
    isLoading,
    error 
  } = useBoardStore();

  useEffect(() => {
    initializeBoard();
  }, [initializeBoard]);

  const handleDragEnd = (result) => {
    const { source, destination, type } = result;

    if (!destination) return;

    if (type === 'task') {
      moveTask(
        source.droppableId,
        destination.droppableId,
        result.draggableId,
        destination.index
      );
    }
  };

  const handleAddSection = (e) => {
    e.preventDefault();
    if (newSectionTitle.trim()) {
      addSection(newSectionTitle.trim());
      setNewSectionTitle('');
      setIsAddingSectionOpen(false);
    }
  };

  const handleCancel = () => {
    setNewSectionTitle('');
    setIsAddingSectionOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
     <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Kanban Board</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button 
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setShowSettingsModal(true)}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="board" type="section" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex space-x-4 overflow-x-auto pb-4"
              >
                {sections.map((section, index) => (
                  <Section key={section.id} section={section} index={index} />
                ))}
                {provided.placeholder}

                <div className="w-80 flex-shrink-0">
                  {isAddingSectionOpen ? (
                    <div className="bg-white rounded-lg shadow p-3">
                      <form onSubmit={handleAddSection} className="space-y-3">
                        <input
                          type="text"
                          value={newSectionTitle}
                          onChange={(e) => setNewSectionTitle(e.target.value)}
                          placeholder="Enter section title..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          autoFocus
                        />
                        <div className="flex space-x-2">
                          <button
                            type="submit"
                            className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                          >
                            Add Section
                          </button>
                          <button
                            type="button"
                            onClick={handleCancel}
                            className="p-1.5 text-gray-500 hover:text-gray-700 rounded"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAddingSectionOpen(true)}
                      className="w-full h-12 flex items-center justify-center space-x-2 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Add Section</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </main>

      {showSettingsModal && (
        <SettingsModal onClose={() => setShowSettingsModal(false)} />
      )}
    </div>
  );
}
export default App;

