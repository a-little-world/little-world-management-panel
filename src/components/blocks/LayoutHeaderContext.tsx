import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { useMatches } from 'react-router-dom';

import type { BreadcrumbsProps } from '../atoms/Breadcrumbs';
import { getPageTitle } from '../../router/routeHandle';

export type LayoutHeaderOverride = {
  title?: ReactNode;
  breadcrumbs?: BreadcrumbsProps;
  actions?: ReactNode;
  showMenu?: boolean;
};

type LayoutHeaderContextValue = {
  overrideRef: React.RefObject<LayoutHeaderOverride | null>;
  hasOverride: boolean;
  setHasOverride: (value: boolean) => void;
};

const LayoutHeaderContext = createContext<LayoutHeaderContextValue | null>(
  null,
);

const headerListeners = new Set<() => void>();
let headerVersion = 0;

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

export function LayoutHeaderProvider({ children }: { children: ReactNode }) {
  const overrideRef = useRef<LayoutHeaderOverride | null>(null);
  const [hasOverride, setHasOverrideState] = useState(false);

  const setHasOverride = useCallback((value: boolean) => {
    setHasOverrideState(value);
  }, []);

  const value = useMemo(
    () => ({ overrideRef, hasOverride, setHasOverride }),
    [hasOverride, setHasOverride],
  );

  return (
    <LayoutHeaderContext.Provider value={value}>
      {children}
    </LayoutHeaderContext.Provider>
  );
}

function useLayoutHeaderContext() {
  const context = useContext(LayoutHeaderContext);
  if (!context) {
    throw new Error(
      'Layout header hooks must be used within LayoutHeaderProvider',
    );
  }
  return context;
}

/**
 * Write-only. Pages call this to publish header config (breadcrumbs, actions).
 * Does not render anything — only Header.tsx renders the bar.
 */
export function usePageHeader(config: LayoutHeaderOverride) {
  const { overrideRef, setHasOverride } = useLayoutHeaderContext();

  overrideRef.current = config;

  useLayoutEffect(() => {
    notifyHeaderUpdate();
  });

  useLayoutEffect(() => {
    setHasOverride(true);
    return () => {
      overrideRef.current = null;
      setHasOverride(false);
      notifyHeaderUpdate();
    };
  }, [overrideRef, setHasOverride]);
}

/**
 * Read-only. Header.tsx calls this to get what to render (title, breadcrumbs,
 * actions or default menu). Does not render anything itself.
 */
export function useLayoutHeader() {
  useSyncExternalStore(subscribeHeader, getHeaderVersion, getHeaderVersion);

  const matches = useMatches();
  const { overrideRef, hasOverride } = useLayoutHeaderContext();
  const override = hasOverride ? overrideRef.current : null;
  const routeTitle = getPageTitle(matches);

  return {
    title: override?.breadcrumbs?.current ?? override?.title ?? routeTitle,
    breadcrumbs: override?.breadcrumbs,
    actions: override?.actions,
    showMenu: override?.showMenu,
  };
}
