import { isEmpty } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';

import { dataFetcher } from '../store';

interface InfiniteScrollArgs {
  url: string;
  fetchCondition?: boolean;
  initialPage?: number;
  initialTotalPages?: number;
}

const useInfiniteScroll = ({
  url,
  fetchCondition = true,
  initialPage = 1,
  initialTotalPages = 1,
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
    { revalidateOnFocus: false, keepPreviousData: true },
  );

  useEffect(() => {
    if (data && !isEmpty(data?.messages.results)) {
      setItems(prevItems => [...prevItems, ...data.messages.results]);
      setTotalPages(data.messages.pages_total);
    }
  }, [data, error]);

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
