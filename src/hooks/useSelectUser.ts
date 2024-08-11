import { useState } from 'react';

import { addUserByHash } from '../api/index';
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

  const onSelectUser = ({ userHash }: { userHash: string }) => {
    setIsSubmitting(true);
    addUserByHash(userHash, onError, (res: any) => {
      setIsSubmitting(false);
      selectUser(res);
    });
  };

  return {
    error,
    isSubmitting,
    onSelectUser,
  };
};

export default useSelectUser;
