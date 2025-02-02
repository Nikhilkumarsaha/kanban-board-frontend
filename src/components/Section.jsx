import React, { useState } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { Plus, MoreVertical, Edit2, Trash2, X } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { AddTaskModal } from './AddTaskModal';
import { useBoardStore } from '../store/board-store';

export function Section({ section, index }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(section.title);
  const addTask = useBoardStore((state) => state.addTask);
  const updateSection = useBoardStore((state) => state.updateSection);
  const deleteSection = useBoardStore((state) => state.deleteSection);
  const searchQuery = useBoardStore((state) => state.searchQuery);

  const filteredTasks = section.tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateTitle = (e) => {
    e.preventDefault();
    if (editTitle.trim()) {
      updateSection(section.id, editTitle.trim());
      setIsEditing(false);
    }
  };

  return (
    <Draggable draggableId={section.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="w-80 flex-shrink-0"
        >
          <div
            {...provided.dragHandleProps}
            className="bg-gray-100 rounded-lg p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              {isEditing ? (
                <form onSubmit={handleUpdateTitle} className="flex-1 flex items-center space-x-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded-md text-sm"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="p-1 text-blue-600 hover:text-blue-700"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditTitle(section.title);
                    }}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="flex items-center space-x-2">
                  <h2 className="font-semibold text-gray-900">{section.title}</h2>
                  <span className="text-gray-500 text-sm">
                    {filteredTasks.length}
                  </span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="p-1 hover:bg-gray-200 rounded-full"
                >
                  <Plus className="w-5 h-5 text-gray-600" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1 hover:bg-gray-200 rounded-full"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowMenu(false);
                        }}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Title
                      </button>
                      <button
                        onClick={() => {
                          deleteSection(section.id);
                          setShowMenu(false);
                        }}
                        className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Section
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Droppable droppableId={section.id} type="task">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-3"
                >
                  {filteredTasks.map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <TaskCard task={task} sectionId={section.id} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {filteredTasks.length === 0 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
              >
                Add Task
              </button>
            )}
          </div>

          {showAddModal && (
            <AddTaskModal
              onClose={() => setShowAddModal(false)}
              onAdd={(task) => addTask(section.id, task)}
            />
          )}
        </div>
      )}
    </Draggable>
  );
}