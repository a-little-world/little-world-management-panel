import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';

import type { MatchingPanelUser } from '../api';
import {
  OPEN_CHAT_ACCESS_USERS_ENDPOINT,
  OPEN_CHAT_CONFIGURATION_ENDPOINT,
  createOpenChatChat,
  deleteOpenChatChat,
  fetchOpenChatAccessUsers,
  fetchOpenChatConfiguration,
  fetchOpenChatMessages,
  fetchOpenChatsForUser,
  normalizeOpenChatBrowserUrl,
  resolveOpenChatBrowserHost,
  sendOpenChatMessage,
  type OpenChatInteraction,
  type OpenChatInteractionDetail,
  type OpenChatListItem,
  type OpenChatMessage,
} from '../api/openChat';
import {
  createAuthorizedOpenChatClient,
  fetchOpenChatInteractionDetailDirect,
  fetchOpenChatInteractionsDirect,
} from '../api/openChatBrowserClient';
import {
  MANAGEMENT_PERMISSION_EDIT_OPEN_CHAT_CONFIGURATION,
  MANAGEMENT_PERMISSION_MANAGE_OPEN_CHAT_ACCESS,
  MANAGEMENT_PERMISSION_OPEN_CHAT_ACCESS,
} from '../constants/managementPermissions';
import {
  buildOpenChatInteractionPageUrl,
  withOpenChatLightTheme,
} from '../helpers/chat';
import { hasManagementPermission } from '../helpers/managementPermissions';
import { getOpenChatChatRoute, OPEN_CHAT_ROUTE } from '../router/routes';
import {
  LEGACY_OPEN_CHAT_TAB_CONFIGURATION,
  looksLikeUuid,
  OPEN_CHAT_MESSAGES_REFRESH_INTERVAL_MS,
  OPEN_CHAT_QUERY_PARAM_TAB,
  OPEN_CHAT_TAB_CHAT,
  OPEN_CHAT_TAB_HOME,
  OPEN_CHAT_TAB_INTERACTIONS,
  resolveOpenChatTab,
  type OpenChatTab,
} from '../components/blocks/openChat/openChatConstants';
import { formatOpenChatAccessUserName } from '../components/blocks/openChat/openChatHelpers';

export function useOpenChatWorkspace(currentUser: MatchingPanelUser) {
  const navigate = useNavigate();
  const { chatUuid: routeChatUuid } = useParams<{ chatUuid?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedOpenChatUserUuid = searchParams.get('user_uuid')?.trim() ?? '';
  const requestedTab = searchParams.get(OPEN_CHAT_QUERY_PARAM_TAB);
  const selectedTab = resolveOpenChatTab(requestedTab);

  const canAccess = hasManagementPermission(
    currentUser,
    MANAGEMENT_PERMISSION_OPEN_CHAT_ACCESS,
  );
  const canManageOpenChatAccess = hasManagementPermission(
    currentUser,
    MANAGEMENT_PERMISSION_MANAGE_OPEN_CHAT_ACCESS,
  );
  const canEditOpenChatConfiguration = hasManagementPermission(
    currentUser,
    MANAGEMENT_PERMISSION_EDIT_OPEN_CHAT_CONFIGURATION,
  );

  const {
    data: configuration,
    error: configurationError,
    isLoading: isConfigurationLoading,
  } = useSWR(OPEN_CHAT_CONFIGURATION_ENDPOINT, fetchOpenChatConfiguration, {
    revalidateOnFocus: true,
  });

  const openChatUserUuid =
    requestedOpenChatUserUuid ||
    configuration?.matching_user_uuid?.trim() ||
    '';

  const {
    data: users,
    error: usersError,
    isLoading: isUsersLoading,
  } = useSWR(
    canManageOpenChatAccess ? OPEN_CHAT_ACCESS_USERS_ENDPOINT : null,
    fetchOpenChatAccessUsers,
    { revalidateOnFocus: true },
  );

  const selectedUser = useMemo(
    () => users?.find(user => user.uuid === openChatUserUuid),
    [users, openChatUserUuid],
  );
  const targetUserId =
    selectedUser?.id ?? configuration?.matching_user_id ?? null;
  const actorDisplayName = selectedUser
    ? formatOpenChatAccessUserName(selectedUser)
    : configuration?.open_chat_user || 'Open Chat';
  const interactionBrowserOrigin = useMemo(
    () =>
      resolveOpenChatBrowserHost(selectedUser?.configuration ?? configuration),
    [selectedUser, configuration],
  );
  const interactionClient = useMemo(() => {
    if (!openChatUserUuid || !interactionBrowserOrigin) {
      return null;
    }
    return createAuthorizedOpenChatClient({
      baseUrl: interactionBrowserOrigin,
      userUuid: openChatUserUuid,
      scopes: ['interactions:list', 'interactions:read'],
    });
  }, [interactionBrowserOrigin, openChatUserUuid]);

  const {
    data: chatsData,
    error: chatsError,
    isLoading: isChatsLoading,
    mutate: refreshChats,
  } = useSWR(
    selectedTab === OPEN_CHAT_TAB_CHAT && openChatUserUuid
      ? `/open-chat/chats/${openChatUserUuid}`
      : null,
    () => fetchOpenChatsForUser(openChatUserUuid),
    { revalidateOnFocus: true },
  );

  const chats = chatsData?.results ?? [];
  const selectedChatUuid =
    selectedTab === OPEN_CHAT_TAB_CHAT ? (routeChatUuid ?? null) : null;

  const [createChatError, setCreateChatError] = useState<string | null>(null);
  const [deleteChatError, setDeleteChatError] = useState<string | null>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [deletingChatUuid, setDeletingChatUuid] = useState<string | null>(null);
  const [pendingCreatedChatUuid, setPendingCreatedChatUuid] = useState<
    string | null
  >(null);

  const {
    data: interactionsData,
    error: interactionsError,
    isLoading: isInteractionsLoading,
  } = useSWR(
    interactionClient
      ? `/open-chat/interactions/direct/${openChatUserUuid}`
      : null,
    () => fetchOpenChatInteractionsDirect(interactionClient!),
    { revalidateOnFocus: true },
  );

  const interactions = interactionsData?.results ?? [];
  const selectedInteractionUuid =
    selectedTab === OPEN_CHAT_TAB_INTERACTIONS ? (routeChatUuid ?? null) : null;

  const {
    data: interactionDetailData,
    error: interactionDetailError,
    isLoading: isInteractionDetailLoading,
  } = useSWR(
    selectedTab === OPEN_CHAT_TAB_INTERACTIONS &&
      selectedInteractionUuid &&
      interactionClient
      ? `/open-chat/interactions/direct/detail/${openChatUserUuid}/${selectedInteractionUuid}`
      : null,
    () =>
      fetchOpenChatInteractionDetailDirect(
        interactionClient!,
        selectedInteractionUuid as string,
      ),
    { revalidateOnFocus: true },
  );

  const {
    data: messagesData,
    error: messagesError,
    isLoading: isMessagesLoading,
    mutate: refreshMessages,
  } = useSWR(
    selectedChatUuid && looksLikeUuid(selectedChatUuid)
      ? `/open-chat/messages/${selectedChatUuid}`
      : null,
    () => fetchOpenChatMessages(selectedChatUuid as string),
    {
      revalidateOnFocus: true,
      refreshInterval: OPEN_CHAT_MESSAGES_REFRESH_INTERVAL_MS,
    },
  );

  const [draftMessage, setDraftMessage] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const navigateToChat = useCallback(
    (chatUuid: string, replace = false) => {
      const nextSearchParams = new URLSearchParams(searchParams);
      nextSearchParams.set(OPEN_CHAT_QUERY_PARAM_TAB, OPEN_CHAT_TAB_CHAT);
      const serializedSearchParams = nextSearchParams.toString();
      navigate(
        `${getOpenChatChatRoute(chatUuid)}${
          serializedSearchParams ? `?${serializedSearchParams}` : ''
        }`,
        { replace },
      );
    },
    [navigate, searchParams],
  );

  const navigateToInteraction = useCallback(
    (interactionUuid: string, replace = false) => {
      const nextSearchParams = new URLSearchParams(searchParams);
      nextSearchParams.set(
        OPEN_CHAT_QUERY_PARAM_TAB,
        OPEN_CHAT_TAB_INTERACTIONS,
      );
      const serializedSearchParams = nextSearchParams.toString();
      navigate(
        `${getOpenChatChatRoute(interactionUuid)}${
          serializedSearchParams ? `?${serializedSearchParams}` : ''
        }`,
        { replace },
      );
    },
    [navigate, searchParams],
  );

  const handleSelectTab = useCallback(
    (tab: OpenChatTab) => {
      const nextSearchParams = new URLSearchParams(searchParams);
      nextSearchParams.set(OPEN_CHAT_QUERY_PARAM_TAB, tab);
      const serializedSearchParams = nextSearchParams.toString();
      if (tab === OPEN_CHAT_TAB_INTERACTIONS || tab === OPEN_CHAT_TAB_HOME) {
        navigate(
          `${OPEN_CHAT_ROUTE}${serializedSearchParams ? `?${serializedSearchParams}` : ''}`,
        );
        return;
      }
      setSearchParams(nextSearchParams, { replace: true });
    },
    [navigate, searchParams, setSearchParams],
  );

  const handleSelectActor = useCallback(
    (userUuid: string) => {
      const nextSearchParams = new URLSearchParams(searchParams);
      nextSearchParams.set('user_uuid', userUuid);
      navigate(`${OPEN_CHAT_ROUTE}?${nextSearchParams.toString()}`, {
        replace: true,
      });
    },
    [navigate, searchParams],
  );

  useEffect(() => {
    if (
      requestedTab === OPEN_CHAT_TAB_CHAT ||
      requestedTab === OPEN_CHAT_TAB_INTERACTIONS ||
      requestedTab === OPEN_CHAT_TAB_HOME ||
      requestedTab === LEGACY_OPEN_CHAT_TAB_CONFIGURATION
    ) {
      return;
    }
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set(OPEN_CHAT_QUERY_PARAM_TAB, OPEN_CHAT_TAB_HOME);
    setSearchParams(nextSearchParams, { replace: true });
  }, [requestedTab, searchParams, setSearchParams]);

  useEffect(() => {
    if (selectedTab !== OPEN_CHAT_TAB_CHAT || !chats.length) {
      return;
    }

    if (
      pendingCreatedChatUuid &&
      chats.some(chat => chat.uuid === pendingCreatedChatUuid)
    ) {
      setPendingCreatedChatUuid(null);
    }

    const routeChatExists = selectedChatUuid
      ? chats.some(chat => chat.uuid === selectedChatUuid)
      : false;

    if (!selectedChatUuid) {
      navigateToChat(chats[0].uuid, true);
      return;
    }

    if (routeChatExists) {
      return;
    }

    if (pendingCreatedChatUuid && selectedChatUuid === pendingCreatedChatUuid) {
      return;
    }

    navigateToChat(chats[0].uuid, true);
  }, [
    chats,
    selectedChatUuid,
    navigateToChat,
    pendingCreatedChatUuid,
    selectedTab,
  ]);

  useEffect(() => {
    if (selectedTab !== OPEN_CHAT_TAB_INTERACTIONS || !interactions.length) {
      return;
    }
    const routeInteractionExists = selectedInteractionUuid
      ? interactions.some(
          interaction => interaction.interaction_id === selectedInteractionUuid,
        )
      : false;
    if (!selectedInteractionUuid || !routeInteractionExists) {
      navigateToInteraction(interactions[0].interaction_id, true);
    }
  }, [
    interactions,
    selectedInteractionUuid,
    selectedTab,
    navigateToInteraction,
  ]);

  const selectedChat: OpenChatListItem | null =
    chats.find(chat => chat.uuid === selectedChatUuid) ?? null;

  const selectedInteraction: OpenChatInteraction | null =
    interactions.find(
      interaction => interaction.interaction_id === selectedInteractionUuid,
    ) ?? null;

  const selectedInteractionDetail: OpenChatInteractionDetail | null =
    interactionDetailData ?? selectedInteraction;

  const interactionFrameUrl = useMemo(() => {
    const sharedUrl = selectedInteractionDetail?.shared_interaction_url;
    if (sharedUrl) {
      try {
        return withOpenChatLightTheme(
          normalizeOpenChatBrowserUrl(sharedUrl, interactionBrowserOrigin),
        );
      } catch {
        // Fallback to interaction page URL below.
      }
    }
    if (!interactionBrowserOrigin || !selectedInteractionUuid) {
      return null;
    }
    return buildOpenChatInteractionPageUrl(
      interactionBrowserOrigin,
      selectedInteractionUuid,
    );
  }, [
    selectedInteractionDetail,
    interactionBrowserOrigin,
    selectedInteractionUuid,
  ]);

  const orderedMessages: OpenChatMessage[] = useMemo(
    () => [...(messagesData?.results ?? [])].reverse(),
    [messagesData?.results],
  );

  const handleCreateChat = async () => {
    if (!targetUserId) {
      return;
    }

    setCreateChatError(null);
    setIsCreatingChat(true);

    try {
      const result = await createOpenChatChat(targetUserId);
      setPendingCreatedChatUuid(result.chat_uuid);
      navigateToChat(result.chat_uuid);
      void refreshChats();
    } catch (error) {
      setPendingCreatedChatUuid(null);
      setCreateChatError(
        error instanceof Error ? error.message : 'Could not create chat.',
      );
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleDeleteChat = async (chatUuid: string) => {
    if (deletingChatUuid) {
      return;
    }

    setDeleteChatError(null);
    setDeletingChatUuid(chatUuid);

    try {
      await deleteOpenChatChat(chatUuid);
      if (selectedChatUuid === chatUuid) {
        const nextSearchParams = new URLSearchParams(searchParams);
        nextSearchParams.set(OPEN_CHAT_QUERY_PARAM_TAB, OPEN_CHAT_TAB_CHAT);
        const serializedSearchParams = nextSearchParams.toString();
        navigate(
          `${OPEN_CHAT_ROUTE}${serializedSearchParams ? `?${serializedSearchParams}` : ''}`,
          { replace: true },
        );
      }
      await refreshChats();
    } catch (error) {
      setDeleteChatError(
        error instanceof Error ? error.message : 'Could not delete chat.',
      );
    } finally {
      setDeletingChatUuid(null);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!selectedChatUuid) {
      return;
    }

    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    setIsSending(true);
    setSendError(null);

    try {
      await sendOpenChatMessage(selectedChatUuid, trimmed);
      setDraftMessage('');
      await refreshMessages();
      await refreshChats();
    } catch (error) {
      setSendError(
        error instanceof Error ? error.message : 'Could not send message.',
      );
    } finally {
      setIsSending(false);
    }
  };

  const showMissingTargetUserUuid = !openChatUserUuid;

  const topLevelError =
    configurationError ||
    (canManageOpenChatAccess && usersError) ||
    chatsError ||
    interactionsError ||
    interactionDetailError;

  const topLevelErrorMessage = configurationError
    ? 'Could not load Open Chat configuration.'
    : usersError
      ? 'Could not load open chat users.'
      : chatsError
        ? 'Could not load chats for this user.'
        : interactionsError
          ? 'Could not load interactions for this user.'
          : interactionDetailError
            ? 'Could not load interaction details.'
            : null;

  const isSidebarLoading =
    isConfigurationLoading && !requestedOpenChatUserUuid
      ? true
      : (canManageOpenChatAccess && isUsersLoading) ||
        (selectedTab === OPEN_CHAT_TAB_CHAT
          ? isChatsLoading
          : selectedTab === OPEN_CHAT_TAB_INTERACTIONS
            ? isInteractionsLoading
            : false);

  return {
    canAccess,
    canManageOpenChatAccess,
    canEditOpenChatConfiguration,
    configuration,
    configurationError,
    users,
    usersError,
    selectedUser,
    openChatUserUuid,
    actorDisplayName,
    targetUserId,
    selectedTab,
    chats,
    selectedChatUuid,
    selectedChat,
    interactions,
    selectedInteractionUuid,
    selectedInteractionDetail,
    interactionClient,
    interactionFrameUrl,
    orderedMessages,
    messagesError,
    isMessagesLoading,
    isInteractionDetailLoading,
    isInteractionsLoading,
    isChatsLoading,
    draftMessage,
    setDraftMessage,
    sendError,
    isSending,
    createChatError,
    deleteChatError,
    isCreatingChat,
    deletingChatUuid,
    showMissingTargetUserUuid,
    topLevelError,
    topLevelErrorMessage,
    isSidebarLoading,
    currentUser,
    handleSelectTab,
    handleSelectActor,
    navigateToChat,
    navigateToInteraction,
    handleCreateChat,
    handleDeleteChat,
    handleSendMessage,
  };
}

export type OpenChatWorkspaceState = ReturnType<typeof useOpenChatWorkspace>;
