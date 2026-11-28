/** A guest (`User.is_temporary`) has no name stored. */
export const GUEST_ACCOUNT_LABEL = 'Guest Account';

export const displayUserName = (
  user?: {
    is_temporary?: boolean;
    profile?: { first_name?: string | null; second_name?: string | null };
  } | null,
) => {
  if (!user) return '';
  if (user.is_temporary) return GUEST_ACCOUNT_LABEL;
  return `${user.profile?.first_name ?? ''} ${user.profile?.second_name ?? ''}`.trim();
};
