import {
  ReactNode,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from 'react';
import { useMatches } from 'react-router-dom';

import { getPageTitle } from '../../router/routeHandle';
import type { BreadcrumbsProps } from '../atoms/Breadcrumbs';

export type LayoutHeaderOverride = {
  title?: ReactNode;
  breadcrumbs?: BreadcrumbsProps;
  actions?: ReactNode;
  showMenu?: boolean;
};

const headerListeners = new Set<() => void>();
let headerVersion = 0;
let headerOverride: { owner: object; config: LayoutHeaderOverride } | null =
  null;

function subscribeHeader(listener: () => void) {
  headerListeners.add(listener);
  return () => {
    headerListeners.delete(listener);
  };
}

function getHeaderVersion() {
  return headerVersion;
}

function notifyHeaderUpdate() {
  headerVersion += 1;
  headerListeners.forEach(listener => listener());
}

/**
 * Write-only. Pages call this to publish header config (breadcrumbs, actions).
 * Does not render anything — only Header.tsx renders the bar.
 */
export function usePageHeader(config: LayoutHeaderOverride) {
  const owner = useRef({}).current;

  useLayoutEffect(() => {
    headerOverride = { owner, config };
    notifyHeaderUpdate();
  });

  useLayoutEffect(
    () => () => {
      // another page published after this one — its config must survive our teardown
      if (headerOverride?.owner !== owner) {
        return;
      }
      headerOverride = null;
      notifyHeaderUpdate();
    },
    [owner],
  );
}

/**
 * Read-only. Header.tsx calls this to get what to render (title, breadcrumbs,
 * actions or default menu). Does not render anything itself.
 */
export function useLayoutHeader() {
  useSyncExternalStore(subscribeHeader, getHeaderVersion, getHeaderVersion);

  const matches = useMatches();
  const override = headerOverride?.config;
  const routeTitle = getPageTitle(matches);

  return {
    title: override?.breadcrumbs?.current ?? override?.title ?? routeTitle,
    breadcrumbs: override?.breadcrumbs,
    actions: override?.actions,
    showMenu: override?.showMenu,
  };
}
