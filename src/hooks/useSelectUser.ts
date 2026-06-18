import { useState } from 'react';

import { addUserByUuid } from '../api/index';
import { apiFetch } from '../api/helpers';
import { useGlobalState } from '../store';

const useSelectUser = () => {
  const { selectUser } = useGlobalState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<{ message: string }>();

  const onError = (error: any) => {
    setError({
      message: error?.message || 'Issue sending message',
    });
    setIsSubmitting(false);
  };

  const onSelectUser = ({ userId }: { userId: string }) => {
    setIsSubmitting(true);
    const userIds = userId.split(',').map(id => id.trim());
    for (const id of userIds) {
      addUserByUuid(id, onError, (res: any) => {
        setIsSubmitting(false);
        selectUser(res);
      });
    }
  };

  const selectExactUser = async (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    try {
      const user = await apiFetch(`/api/matching/users/${trimmedQuery}/`);
      selectUser(user);
    } catch {
      // Not every search term is an exact user id/email. Keep regular search flow.
    }
  };

  return {
    error,
    isSubmitting,
    onSelectUser,
    selectExactUser,
  };
};

export default useSelectUser;
