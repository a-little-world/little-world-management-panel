import type { UIMatch } from 'react-router-dom';

export const DEFAULT_PAGE_TITLE = 'Management Portal';

export type RouteHandle = {
  title?: string | ((params: Record<string, string | undefined>) => string);
};

declare module 'react-router-dom' {
  interface RouteHandle {
    title?: string | ((params: Record<string, string | undefined>) => string);
  }
}

export function routeTitle(title: RouteHandle['title']): { handle: RouteHandle } {
  return { handle: { title } };
}

export function getPageTitle(matches: UIMatch[]): string {
  for (let i = matches.length - 1; i >= 0; i--) {
    const handle = matches[i].handle as RouteHandle | undefined;
    if (handle?.title === undefined) continue;

    if (typeof handle.title === 'function') {
      return handle.title(matches[i].params);
    }

    return handle.title;
  }

  return DEFAULT_PAGE_TITLE;
}
