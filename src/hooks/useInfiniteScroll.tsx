import { isEmpty } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';

import { dataFetcher } from '../store';

interface InfiniteScrollArgs {
  url: string;
  fetchCondition?: boolean;
  initialPage?: number;
  initialTotalPages?: number;
  revalidateOnFocus?: boolean;
  refreshInterval?: number;
}

const mergePageOneResults = (prevItems: any[], pageResults: any[]) => {
  const incomingIds = new Set(pageResults.map(message => message.uuid));
  const olderLoaded = prevItems.filter(message => !incomingIds.has(message.uuid));
  return [...pageResults, ...olderLoaded];
};

const appendPageResults = (prevItems: any[], pageResults: any[]) => {
  const existingIds = new Set(prevItems.map(message => message.uuid));
  const newResults = pageResults.filter(message => !existingIds.has(message.uuid));
  return [...prevItems, ...newResults];
};

const useInfiniteScroll = ({
  url,
  fetchCondition = true,
  initialPage = 1,
  initialTotalPages = 1,
  revalidateOnFocus = false,
  refreshInterval,
}: InfiniteScrollArgs) => {
  const [items, setItems] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const { data, error, isValidating, mutate } = useSWR(
    fetchCondition && currentPage <= totalPages
      ? `${url}?page=${currentPage}`
      : null,
    dataFetcher,
    {
      revalidateOnFocus,
      keepPreviousData: true,
      ...(refreshInterval ? { refreshInterval } : {}),
    },
  );

  const { data: latestPageData } = useSWR(
    fetchCondition && refreshInterval && currentPage > 1
      ? `${url}?page=1`
      : null,
    dataFetcher,
    {
      revalidateOnFocus,
      refreshInterval,
      dedupingInterval: refreshInterval,
    },
  );

  useEffect(() => {
    if (!data?.messages?.results) {
      return;
    }

    setTotalPages(data.messages.pages_total);
    setItems(prevItems =>
      currentPage === 1
        ? mergePageOneResults(prevItems, data.messages.results)
        : appendPageResults(prevItems, data.messages.results),
    );
  }, [data, currentPage]);

  useEffect(() => {
    if (!latestPageData?.messages?.results) {
      return;
    }

    setTotalPages(latestPageData.messages.pages_total);
    setItems(prevItems =>
      mergePageOneResults(prevItems, latestPageData.messages.results),
    );
  }, [latestPageData]);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      const target = entries[0];
      if (
        target.isIntersecting &&
        !isEmpty(items) &&
        !isValidating &&
        currentPage !== totalPages
      ) {
        setCurrentPage(page => page + 1);
      }
    });

    if (scrollRef.current) {
      observer.observe(scrollRef.current);
    }

    return () => {
      if (scrollRef.current) {
        observer.unobserve(scrollRef.current);
      }
    };
  }, [items, currentPage, isValidating]);

  return {
    scrollRef,
    results: items,
    data,
    loading: isValidating,
    currentPage,
    totalPages,
    mutate,
    setResults: setItems,
    fetchError: error,
  };
};

export default useInfiniteScroll;
