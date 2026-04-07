import React from 'react';

import { useManagementTasksListData } from '../../store';

type ManagementTask = {
  id: number;
  user: number;
  created_by: number | null;
  state: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }
  return date.toLocaleString();
};

export function ManagementTasks() {
  const { managementTasksList, isLoading, error } = useManagementTasksListData('');

  const tasks: ManagementTask[] = Array.isArray(managementTasksList)
    ? managementTasksList
    : managementTasksList?.results || [];

  if (isLoading) {
    return <div className="p-4 text-center">Loading management tasks...</div>;
  }

  if (error) {
    return <div className="p-4 text-center">Error: {error.message}</div>;
  }

  if (!tasks.length) {
    return <div className="p-4 text-center">No management tasks found.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Management Tasks</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-2 border-b">ID</th>
              <th className="text-left p-2 border-b">User</th>
              <th className="text-left p-2 border-b">State</th>
              <th className="text-left p-2 border-b">Description</th>
              <th className="text-left p-2 border-b">Updated</th>
              <th className="text-left p-2 border-b">Created</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id} className="border-b">
                <td className="p-2">{task.id}</td>
                <td className="p-2">{task.user}</td>
                <td className="p-2">{task.state}</td>
                <td className="p-2">{task.description || '-'}</td>
                <td className="p-2">{formatDateTime(task.updated_at)}</td>
                <td className="p-2">{formatDateTime(task.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManagementTasks;
