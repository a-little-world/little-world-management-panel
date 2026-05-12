import {
  ButtonAppearance,
  ButtonSizes,
  ButtonVariations,
  Card,
  CardSizes,
  Button as DSButton,
  Modal,
  Text,
  TextInput,
} from '@a-little-world/little-world-design-system';
import { createColumnHelper } from '@tanstack/react-table';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { apiFetch } from '../../api/helpers';
import { formatDate } from '../../helpers/date';
import { useDynamicUserListData, useGlobalState } from '../../store';
import SelectBox from '../atoms/SelectBox';
import { DataTable } from '../blocks/DataTable';

interface DynamicUserList {
  id: number;
  name: string;
  description: string;
  users: number[];
  created_at: string;
  updated_at: string;
}

interface User {
  id: number;
  username: string;
  email: string;
}

interface CreateListModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    users: number[];
  }) => void;
}

interface ModifyListModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    users: number[];
  }) => void;
  initialData: DynamicUserList;
}

interface ViewUsersModalProps {
  open: boolean;
  onClose: () => void;
  list: DynamicUserList;
}

interface Option {
  label: string;
  value: string | number;
  disabled?: boolean;
}

function CreateListModal({ open, onClose, onSubmit }: CreateListModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { selectedUsers } = useGlobalState();

  const handleSubmit = () => {
    setIsSubmitting(true);
    const selectedUserIds = Object.values(selectedUsers).map(user => user.id);
    onSubmit({
      name,
      description,
      users: selectedUserIds,
    });
    setName('');
    setDescription('');
    setIsSubmitting(false);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Card width={CardSizes.Medium}>
        <div className="space-y-4 p-4">
          <Text>Create New Dynamic User List</Text>
          <TextInput
            label="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter list name"
          />
          <TextInput
            label="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Enter list description"
          />
          <div className="space-y-2">
            <Text bold>Selected Users:</Text>
            <div className="max-h-40 overflow-y-auto border rounded p-2">
              {Object.values(selectedUsers).map(user => (
                <div key={user.uuid ?? user.hash} className="flex items-center gap-2 py-1">
                  <Text>{user.email}</Text>
                </div>
              ))}
              {Object.keys(selectedUsers).length === 0 && (
                <Text className="text-gray-500">No users selected</Text>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <DSButton
              appearance={ButtonAppearance.Secondary}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </DSButton>
            <DSButton
              appearance={ButtonAppearance.Primary}
              onClick={handleSubmit}
              disabled={!name || !description || isSubmitting}
            >
              Create
            </DSButton>
          </div>
        </div>
      </Card>
    </Modal>
  );
}

function ModifyListModal({
  open,
  onClose,
  onSubmit,
  initialData,
}: ModifyListModalProps) {
  const [id, setId] = useState(initialData.id);
  const [name, setName] = useState(initialData.name);
  const [description, setDescription] = useState(initialData.description);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { selectedUsers } = useGlobalState();

  const handleSubmit = () => {
    setIsSubmitting(true);
    const selectedUserIds = Object.values(selectedUsers).map(user => user.id);
    onSubmit({
      name: name,
      description: description,
      users: selectedUserIds,
    });
    setIsSubmitting(false);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Card width={CardSizes.Medium}>
        <div className="space-y-4 p-4">
          <Text>Modify Dynamic User List</Text>
          <Text>Instance id: {id}</Text>
          <TextInput
            label="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter list name"
          />
          <TextInput
            label="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Enter list description"
          />
          <div className="space-y-2">
            <Text variant="body-small" weight="medium">
              Selected Users:
            </Text>
            <div className="max-h-40 overflow-y-auto border rounded p-2">
              {Object.values(selectedUsers).map(user => (
                <div key={user.uuid ?? user.hash} className="flex items-center gap-2 py-1">
                  <Text variant="body-small">{user.email}</Text>
                </div>
              ))}
              {Object.keys(selectedUsers).length === 0 && (
                <Text variant="body-small" className="text-gray-500">
                  No users selected
                </Text>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <DSButton
              appearance={ButtonAppearance.Secondary}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </DSButton>
            <DSButton
              appearance={ButtonAppearance.Primary}
              onClick={handleSubmit}
              disabled={!name || !description || isSubmitting}
            >
              Save
            </DSButton>
          </div>
        </div>
      </Card>
    </Modal>
  );
}

function ViewUsersModal({ open, onClose, list }: ViewUsersModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    console.log('ViewUsersModal effect triggered:', { open, listId: list?.id });

    const fetchListData = async () => {
      if (!list?.id) {
        console.log('No list ID available');
        return;
      }

      try {
        console.log('Starting to fetch users for list:', list.id);
        setIsLoading(true);
        const response = await apiFetch<User[]>(
          `/api/dynamic_user_lists/${list.id}/`,
        );
        console.log('API Response:', response);

        if (isMounted) {
          if (Array.isArray(response)) {
            console.log('Setting users:', response);
            setUsers(response);
          } else {
            console.error('Unexpected response format:', response);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching list data:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (open && list?.id) {
      console.log('Conditions met, calling fetchListData');
      fetchListData();
    }

    return () => {
      isMounted = false;
    };
  }, [open, list?.id]);

  const { mutate } = useDynamicUserListData(null);

  const handleDeleteSelected = async (user_id, list_id) => {
    if (!user_id) return;

    try {
      const response = await fetch(
        `/api/dynamic_user_lists/${list_id}/${user_id}/`,
        {
          method: 'DELETE',
          headers: {
            'X-CSRFToken':
              document.cookie.split('csrftoken=')[1]?.split(';')[0] || '',
          },
          credentials: 'same-origin',
        },
      );
      if (!response.ok) {
        throw new Error(`Failed to remove user ${user_id}`);
      }
      mutate();
      setUsers(prev => prev.filter(user => user.id != user_id));
    } catch (error) {
      console.error('Error removing user from message lists:', error);
    }
  };

  if (!list) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Card width={CardSizes.Medium}>
        <div className="space-y-4 p-4">
          <div className="flex justify-between items-center">
            <div className="w-full">
              <div className="block text-gray-600 text-sm w-full">Listname</div>
              <Text variant="heading-small">{list.name}</Text>
            </div>
            <DSButton
              variation={ButtonVariations.secondary}
              size={ButtonSizes.Small}
              onClick={onClose}
            >
              Close
            </DSButton>
          </div>

          <div className="w-full">
            <div className="block text-gray-600 text-sm w-full">
              Description
            </div>
            <Text variant="body-small" className="">
              {list.description}
            </Text>
          </div>
          <div className="space-y-2">
            <Text variant="body-small" weight="medium">
              Users in List:
            </Text>
            {isLoading ? (
              <Text variant="body-small">Loading users...</Text>
            ) : (
              <div className="max-h-96 overflow-y-auto border rounded p-2 space-y-2">
                {users && users.length > 0 ? (
                  users.map(user => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between py-1 px-2 bg-gray-50 rounded"
                    >
                      <Text variant="body-small">{user.email}</Text>
                      <Text variant="body-small" className="text-gray-500">
                        ID: {user.id}
                      </Text>

                      <DSButton
                        variation={ButtonVariations.danger}
                        onClick={() => handleDeleteSelected(user.id, list.id)}
                        key={user.id}
                      >
                        Remove
                      </DSButton>
                    </div>
                  ))
                ) : (
                  <Text variant="body-small" className="text-gray-500">
                    No users in this list
                  </Text>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </Modal>
  );
}

const columnHelper = createColumnHelper<DynamicUserList>();

export function MessageListsTable({ messageLists, onSelectionChange }) {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [modifyModalOpen, setModifyModalOpen] = useState(false);
  const [viewUsersModalOpen, setViewUsersModalOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<DynamicUserList | null>(
    null,
  );

  const { mutate } = useDynamicUserListData(null);

  const handleCheckboxChange = (id: number) => {
    setSelectedRows(prev => {
      const newSelection = prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id];
      onSelectionChange(newSelection);
      return newSelection;
    });
  };

  const handleModify = (list: DynamicUserList) => {
    setSelectedList(list);
    setModifyModalOpen(true);
  };

  const handleViewUsers = async (list: DynamicUserList) => {
    console.log('handleViewUsers called with list:', list);
    setSelectedList(list);
    setViewUsersModalOpen(true);
  };

  const handleModifySubmit = async (data: {
    name: string;
    description: string;
    users: number[];
  }) => {
    if (!selectedList) return;

    try {
      await apiFetch(`/api/dynamic_user_lists/${selectedList.id}/`, {
        method: 'PUT',
        body: data,
      });
      mutate(); // Refresh the list
      setModifyModalOpen(false);
      // The parent component will handle the refresh via mutate
    } catch (error) {
      console.error('Error modifying dynamic user list:', error);
    }
  };

  if (!messageLists) {
    return null;
  }

  const columns = [
    columnHelper.display({
      id: 'select',
      header: 'Selected',
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <SelectBox
            checked={selectedRows.includes(row.original.id)}
            onChange={() => handleCheckboxChange(row.original.id)}
          />
        </div>
      ),
    }),
    columnHelper.accessor('name', {
      header: 'Name',
      cell: ({ row }) => <span>{row.original.name}</span>,
    }),
    columnHelper.accessor('description', {
      header: 'Description',
      cell: ({ row }) => <span>{row.original.description}</span>,
    }),
    columnHelper.accessor('users', {
      header: 'Users',
      cell: ({ row }) => <span>{row.original.users.length} users</span>,
    }),
    columnHelper.accessor('created_at', {
      header: 'Created',
      cell: ({ row }) => <span>{formatDate(row.original.created_at)}</span>,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <DSButton
            variation={ButtonVariations.secondary}
            size={ButtonSizes.Small}
            onClick={() => handleModify(row.original)}
          >
            Modify
          </DSButton>
          <DSButton
            variation={ButtonVariations.secondary}
            size={ButtonSizes.Small}
            onClick={() => handleViewUsers(row.original)}
          >
            View Users
          </DSButton>
        </div>
      ),
    }),
  ];

  return (
    <>
      <DataTable columns={columns} data={messageLists} />
      {selectedList && (
        <>
          <ModifyListModal
            open={modifyModalOpen}
            onClose={() => {
              setModifyModalOpen(false);
              setSelectedList(null);
            }}
            onSubmit={handleModifySubmit}
            initialData={selectedList}
          />
          <ViewUsersModal
            open={viewUsersModalOpen}
            onClose={() => {
              setViewUsersModalOpen(false);
              setSelectedList(null);
            }}
            list={selectedList}
          />
        </>
      )}
    </>
  );
}

export function DynamicUserListView() {
  const [searchParams] = useSearchParams();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const { messageLists, isLoading, error, mutate } =
    useDynamicUserListData(null);

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return;

    try {
      // Delete all selected items
      await Promise.all(
        selectedIds.map(async id => {
          const response = await fetch(`/api/dynamic_user_lists/${id}/`, {
            method: 'DELETE',
            headers: {
              'X-CSRFToken':
                document.cookie.split('csrftoken=')[1]?.split(';')[0] || '',
            },
            credentials: 'same-origin',
          });
          if (!response.ok) {
            throw new Error(`Failed to delete item ${id}`);
          }
        }),
      );

      // Fetch fresh data after deletion
      mutate();

      setSelectedIds([]); // Clear selection
    } catch (error) {
      console.error('Error deleting message lists:', error);
    }
  };

  const handleCreateList = async (data: {
    name: string;
    description: string;
    users: number[];
  }) => {
    try {
      await apiFetch('/api/dynamic_user_lists/', {
        method: 'POST',
        body: data,
      });

      mutate(); // Refresh the list
      setCreateModalOpen(false); // Close the modal after successful creation
    } catch (error) {
      console.error('Error creating dynamic user list:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dynamic User Lists</h1>
        <div className="flex gap-2">
          <DSButton
            variation={ButtonVariations.danger}
            onClick={handleDeleteSelected}
            disabled={selectedIds.length === 0}
          >
            Delete Selected ({selectedIds.length})
          </DSButton>
          <DSButton
            variation={ButtonVariations.primary}
            onClick={() => setCreateModalOpen(true)}
          >
            Create New List
          </DSButton>
        </div>
      </div>

      <MessageListsTable
        messageLists={messageLists}
        onSelectionChange={setSelectedIds}
      />

      <CreateListModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateList}
      />
    </div>
  );
}

export default DynamicUserListView;
