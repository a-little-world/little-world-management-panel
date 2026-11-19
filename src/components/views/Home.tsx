import {
  Accordion,
  Tag,
  TagSizes,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import React from 'react';
import useSWR from 'swr';

import type { MatchingPanelUser } from '../../api/index';
import {
  fetchOpenAssignedTaskCount,
  openAssignedTaskCountEndpoint,
} from '../../api/supportTasks';
import { hasPanelCapability } from '../../helpers/panelCapabilities';
import { useVisiblePanelNavigation } from '../../router/panelNavigation';
import { SUPPORT_TASKS_ROUTE } from '../../router/routes';
import { useGlobalState } from '../../store';
import NavigationTiles from '../blocks/NavigationTiles';

function PanelUserPermissionsOverview({ user }: { user: MatchingPanelUser }) {
  const enabledPermissions = (user.permissions ?? []).filter(
    row => row.enabled,
  );

  if (!enabledPermissions.length && !user.is_staff) {
    return null;
  }

  return (
    <div className="flex flex-col p-8 w-full max-w-4xl m-auto">
      <Accordion
        items={[
          {
            header: 'Your Permissions',
            content: enabledPermissions.map(row => (
              <Tag
                key={row.permission}
                bold
                size={TagSizes.small}
                color="#2563eb"
              >
                {row.label ?? row.codename}
              </Tag>
            )),
          },
        ]}
      />
    </div>
  );
}

const Home = () => {
  const { panelUser } = useGlobalState();
  const user = panelUser as MatchingPanelUser;
  const hasName = Boolean(user?.first_name || user?.last_name);
  const hasPermissions =
    user?.is_staff || (user?.permissions ?? []).some(row => row.enabled);
  const { data: myOpenTasks } = useSWR(
    hasPanelCapability(user, 'support_tasks')
      ? openAssignedTaskCountEndpoint()
      : null,
    fetchOpenAssignedTaskCount,
  );
  const visibleTabs = useVisiblePanelNavigation().map(entry => ({
    ...entry,
    badge: entry.path === SUPPORT_TASKS_ROUTE ? myOpenTasks?.count : undefined,
  }));

  return (
    <div className="w-full overflow-auto">
      {hasName && (
        <section className="flex flex-col items-center text-center gap-4 px-6 pt-10 pb-4 shrink-0 w-full">
          {hasName && (
            <Text type={TextTypes.Heading4} tag="h1" center>
              Welcome, {user.first_name} {user.last_name}
            </Text>
          )}
        </section>
      )}
      {visibleTabs.length > 0 ? (
        <NavigationTiles items={visibleTabs} />
      ) : (
        <section className="flex flex-col items-center gap-2 px-6 py-6">
          <Text type={TextTypes.Body5} center>
            You don&apos;t have access to any pages yet.
          </Text>
          <Text type={TextTypes.Body6} center>
            Ask an admin if you think you should.
          </Text>
        </section>
      )}
      {hasPermissions && <PanelUserPermissionsOverview user={user} />}
    </div>
  );
};

export default Home;
