import React, { useCallback, useEffect, useMemo } from 'react';
import useSWR from 'swr';

import {
  Button,
  Dropdown,
  StatusMessage,
  StatusTypes,
  Text,
} from '@a-little-world/little-world-design-system';
import { isEmpty } from 'lodash';
import {
  dateToString,
  getTodayDateString,
  stringToDate,
} from '../../../../helpers/date';
import { cratePostFetcher } from '../../../../store';
import { DatePicker } from '../../../atoms/DatePicker';
import { SectionTitle } from '../../../atoms/Section';
import { downloadFile } from './helpers';
import { DatePickerContainer, DownloadBlock } from './styles';

const useDateRange = (defaultStartDate: string, defaultEndDate?: string) => {
  const [startDateString, setStartDateString] =
    React.useState(defaultStartDate);
  const [endDateString, setEndDateString] = React.useState(
    defaultEndDate || getTodayDateString(),
  );

  const startDate = useMemo(
    () => stringToDate(startDateString),
    [startDateString],
  );
  const endDate = useMemo(() => stringToDate(endDateString), [endDateString]);

  const updateStartDate = useCallback((date: Date | string) => {
    const dateString = typeof date === 'string' ? date : dateToString(date);
    setStartDateString(dateString);
  }, []);

  const updateEndDate = useCallback((date: Date | string) => {
    const dateString = typeof date === 'string' ? date : dateToString(date);
    setEndDateString(dateString);
  }, []);

  return {
    startDate,
    endDate,
    startDateString,
    endDateString,
    setStartDate: updateStartDate,
    setEndDate: updateEndDate,
  };
};

// Custom Hook for Debounced Mutate
const useDebouncedMutate = (mutate: () => void, delay: number = 500) => {
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const debouncedMutate = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      mutate();
    }, delay);
  }, [mutate, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedMutate;
};

interface DropdownOption {
  label: string;
  value: string;
}

interface ReportDownloadSectionProps {
  title: string;
  description?: string;
  /** Static endpoint for reports without dropdown */
  apiEndpoint?: string;
  /** When dropdown is used: builds endpoint from selected value (e.g. company in URL path) */
  apiEndpointBuilder?: (selectedOption: string) => string;
  apiParams?: Record<string, any>;
  downloadFilename:
    | string
    | ((
        startDate?: string,
        endDate?: string,
        selectedOption?: string,
      ) => string);
  downloadMimeType?: 'application/json' | 'text/plain';
  showDateRange?: boolean;
  defaultStartDate?: string;
  defaultEndDate?: string;
  transformData?: (data: any) => string | object;
  dropdownOptions?: DropdownOption[];
  dropdownLabel?: string;
}

const ReportDownloadSection: React.FC<ReportDownloadSectionProps> = ({
  title,
  description,
  apiEndpoint: apiEndpointProp,
  apiEndpointBuilder,
  apiParams,
  downloadFilename,
  downloadMimeType = 'application/json',
  showDateRange = false,
  defaultStartDate = '2021-01-01',
  defaultEndDate,
  transformData,
  dropdownOptions,
  dropdownLabel,
}) => {
  const {
    startDate,
    endDate,
    startDateString,
    endDateString,
    setStartDate,
    setEndDate,
  } = useDateRange(defaultStartDate, defaultEndDate);

  const [selectedDropdownValue, setSelectedDropdownValue] =
    React.useState<string>('');

  const effectiveEndpoint = useMemo(() => {
    if (apiEndpointBuilder && selectedDropdownValue) {
      return apiEndpointBuilder(selectedDropdownValue);
    }
    return apiEndpointProp ?? null;
  }, [apiEndpointBuilder, apiEndpointProp, selectedDropdownValue]);

  const fetcherParams = useMemo(() => {
    const params: Record<string, any> = { ...apiParams };
    if (showDateRange) {
      params.start_date = startDateString;
      params.end_date = endDateString;
    }
    return params;
  }, [startDateString, endDateString, apiParams, showDateRange]);

  const swrKey = effectiveEndpoint
    ? [effectiveEndpoint, startDateString, endDateString]
    : null;

  const fetcher = useCallback(
    ([url]: [string]) => cratePostFetcher(fetcherParams)(url, undefined),
    [fetcherParams],
  );

  const { data, error, isLoading, mutate } = useSWR(swrKey, fetcher, {});

  const debouncedMutate = useDebouncedMutate(mutate);

  const handleDropdownChange = useCallback((value: string) => {
    setSelectedDropdownValue(value);
  }, []);

  const handleStartDateChange = useCallback(
    (date: Date | string) => {
      setStartDate(date);
      debouncedMutate();
    },
    [setStartDate, debouncedMutate],
  );

  const handleEndDateChange = useCallback(
    (date: Date | string) => {
      setEndDate(date);
      debouncedMutate();
    },
    [setEndDate, debouncedMutate],
  );

  const handleDownload = useCallback(() => {
    if (!data) return;

    const content = transformData ? transformData(data) : data;
    const filename =
      typeof downloadFilename === 'function'
        ? downloadFilename(
            startDateString,
            endDateString,
            selectedDropdownValue,
          )
        : downloadFilename;

    downloadFile(content, filename, downloadMimeType);
  }, [
    data,
    transformData,
    downloadFilename,
    downloadMimeType,
    startDateString,
    endDateString,
    selectedDropdownValue,
  ]);

  return (
    <DownloadBlock>
      <SectionTitle>{title}</SectionTitle>
      {description && <Text tag="p">{description}</Text>}
      {dropdownLabel && (
        <Dropdown
          disabled={isEmpty(dropdownOptions)}
          label={dropdownLabel}
          value={selectedDropdownValue}
          options={dropdownOptions ?? []}
          onValueChange={handleDropdownChange}
          placeholder={`Select ${dropdownLabel?.toLowerCase() || 'option'}...`}
        />
      )}
      {showDateRange && (
        <DatePickerContainer>
          <DatePicker date={startDate} setDate={handleStartDateChange} />
          <DatePicker date={endDate} setDate={handleEndDateChange} />
        </DatePickerContainer>
      )}
      {error && (
        <StatusMessage visible type={StatusTypes.Error}>
          {error instanceof Error ? error.message : 'Failed to load data'}
        </StatusMessage>
      )}
      <Button
        onClick={handleDownload}
        disabled={
          (dropdownLabel && !selectedDropdownValue) || !data || isLoading
        }
      >
        {isLoading ? 'Loading...' : 'Download'}
      </Button>
    </DownloadBlock>
  );
};

export default ReportDownloadSection;
