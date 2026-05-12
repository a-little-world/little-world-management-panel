import { useState } from 'react';

import { addUserByUuid } from '../api/index';
import { useGlobalState } from '../store';

const useSelectUser = () => {
  const { selectUser } = useGlobalState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState();

  const onError = error => {
    setError({
      message: error?.message || 'Issue sending message',
    });
    setIsSubmitting(false);
  };

  const onSelectUser = ({ userId }: { userId: string }) => {
    setIsSubmitting(true);
    const userIds = userId.split(',').map(id => id.trim())
    for (const id of userIds) {
      addUserByUuid(id, onError, (res: any) => {
        setIsSubmitting(false);
        selectUser(res);
      });
    }
  };

  return {
    error,
    isSubmitting,
    onSelectUser,
  };
};

export default useSelectUser;
