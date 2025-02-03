import React, { useState } from 'react';
import { MoreVertical, Calendar, Trash2, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { useBoardStore } from '../store/board-store';
import { EditTaskModal } from './EditTaskModal';

export function TaskCard({ task, sectionId }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const deleteTask = useBoardStore((state) => state.deleteTask);
  const updateTask = useBoardStore((state) => state.updateTask);

  const taskId = task._id || task.id;

  return (
    <>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-gray-900">{task.title}</h3>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                <button
                  onClick={() => {
                    setShowEditModal(true);
                    setShowMenu(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    deleteTask(sectionId, taskId);
                    setShowMenu(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-600">{task.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img
              src={task.assignee.avatar}
              alt={task.assignee.name}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm text-gray-600">{task.assignee.name}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-1" />
            {format(new Date(task.dueDate), 'MMM d')}
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditTaskModal
          task={task}
          onClose={() => setShowEditModal(false)}
          onUpdate={(updatedTask) => updateTask(sectionId, taskId, updatedTask)}
        />
      )}
    </>
  );
}