import { Select, Text } from '@a-little-world/little-world-design-system';
import React, { useMemo, useRef } from 'react';
import { createSearchParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import {
  getMatchesExportPage,
  getMatchesListPaginationMeta,
} from '../../api/index';
import { useMatchListData, useMatchesFilterOptions } from '../../store';
import {
  DownloadSettingsModal,
  ExportDownloadFormat,
} from '../blocks/DownloadSettingsModal';
import FiltersToolbar from '../blocks/FiltersToolbar';
import { MatchesTable } from '../blocks/MatchesTable';
import {
  PaginatedCsvDownloader,
  PaginatedCsvDownloaderHandle,
} from '../blocks/PaginatedCsvDownloader';
import { SelectedMatchesSheet } from '../blocks/SelectedMatchesSheet';
import { SelectedUsersSheet } from '../blocks/SelectedUsersSheet';

const StyledDropdown = styled(Select)`
  div[data-radix-popper-content-wrapper] {
    z-index: 20 !important;
  }
`;

const orderingOptions = [
  {
    value: 'created_at',
    label: '(Asc) Created At',
  },
  {
    value: '-created_at',
    label: '(Desc) Created At',
  },
];

const matchTypeOptions = [
  { value: 'all', label: 'All' },
  { value: 'standard', label: 'Standard' },
  { value: 'random_call', label: 'Random Call' },
];

const MATCH_EXPORT_HEADERS = [
  'uuid',
  'status',
  'match_type',
  'bucket',
  'created_at',
  'updated_at',
  'latest_interaction_at',
  'active',
  'confirmed',
  'total_messages_counter',
  'total_mutal_video_calls_counter',
  'completed_off_plattform',
  'first_message_from_learner',
  'first_message_from_volunteer',
  'most_recent_message_from_learner',
  'most_recent_message_from_volunteer',
  'unmatching_type',
  'unmatch_reason',
  'is_manual_unmatch',
  'video_call_success_units',
  'notes',
  'user1.id',
  'user1.uuid',
  'user1.email',
  'user1.profile.first_name',
  'user1.profile.second_name',
  'user1.profile.user_type',
  'user2.id',
  'user2.uuid',
  'user2.email',
  'user2.profile.first_name',
  'user2.profile.second_name',
  'user2.profile.user_type',
];

export function Matches() {
  let [searchParams, setSearchParams] = useSearchParams();
  const orderBy = searchParams.get('order_by') || '-created_at';
  const matchType = searchParams.get('match_type') ?? '';
  const list = searchParams.get('list') || 'all';
  const [downloadSettingsOpen, setDownloadSettingsOpen] = React.useState(false);
  const [downloadFormat, setDownloadFormat] =
    React.useState<ExportDownloadFormat>('csv');
  const [selectedHeaders, setSelectedHeaders] = React.useState<string[]>([]);
  const paginatedDownloaderRef = useRef<PaginatedCsvDownloaderHandle>(null);
  const searchParamsString = useMemo(
    () => createSearchParams(searchParams).toString(),
    [searchParams],
  );
  const { filterOptions, isLoading: filtersLoading } =
    useMatchesFilterOptions();

  const { matchList, isLoading: matchesLoading } = useMatchListData(
    searchParams.toString(),
  );

  const changeList = (list: string) => {
    searchParams.set('list', list);
    setSearchParams(searchParams);
  };

  const changeMatchType = (val: string) => {
    if (val === 'all') {
      searchParams.delete('match_type');
    } else {
      searchParams.set('match_type', val);
    }
    setSearchParams(searchParams);
  };

  const exportPageSize = useMemo(() => {
    const parsedPageSize = Number(searchParams.get('page_size') || '50');
    return Number.isFinite(parsedPageSize) && parsedPageSize > 0
      ? parsedPageSize
      : 50;
  }, [searchParams]);

  const handleDownload = () => {
    if (selectedHeaders.length === 0) {
      setDownloadSettingsOpen(true);
      return;
    }
    paginatedDownloaderRef.current?.startPreparation();
  };

  const handleSettingsSave = (headers: string[]) => {
    setSelectedHeaders(headers);
  };

  return (
    <>
      <FiltersToolbar
        bundleDownloadAndSettings
        showDownloadButton
        downloadDisabled={!list || selectedHeaders.length === 0}
        onDownloadClick={handleDownload}
        showSettingsButton
        settingsDisabled={false}
        onSettingsClick={() => setDownloadSettingsOpen(true)}
        showPagination
        paginationList={matchList}
        isLoading={filtersLoading}
        loadingText="Loading matches..."
      >
        <StyledDropdown
          value={list}
          options={filterOptions?.lists?.map(
            ({ name, description }: { name: string; description: string }) => ({
              value: name,
              label: description,
            }),
          )}
          onValueChange={changeList}
          placeholder="Select a match list..."
          cannotError
        />
        <StyledDropdown
          value={matchType}
          options={matchTypeOptions}
          onValueChange={changeMatchType}
          placeholder="Match type..."
          cannotError
          maxWidth="160px"
        />
        <StyledDropdown
          value={orderBy}
          options={orderingOptions}
          onValueChange={(val: string) => {
            searchParams.set('order_by', val);
            setSearchParams(searchParams);
          }}
          placeholder="Order by..."
          cannotError
          maxWidth="160px"
        />
      </FiltersToolbar>
      <PaginatedCsvDownloader
        ref={paginatedDownloaderRef}
        downloadFormat={downloadFormat}
        selectedHeaders={selectedHeaders}
        fileName={`${list}-matches-${new Date().toLocaleDateString('de')}.csv`}
        resetToken={`${searchParamsString}:${selectedHeaders.join(',')}`}
        fetchMeta={() =>
          getMatchesListPaginationMeta({
            searchParams: searchParamsString,
            pageSize: exportPageSize,
          })
        }
        fetchPage={({ page, pageSize }) =>
          getMatchesExportPage({
            searchParams: searchParamsString,
            page,
            pageSize,
            selectedHeaders,
          })
        }
        onError={error => console.log({ error })}
      />
      {matchesLoading ? (
        <Text center>Loading matches list '{list}' ...</Text>
      ) : (
        <MatchesTable matchList={matchList} list={list} />
      )}
      <SelectedUsersSheet />
      <SelectedMatchesSheet />
      <DownloadSettingsModal
        selectedFormat={downloadFormat}
        selectedHeaders={selectedHeaders}
        setSelectedFormat={setDownloadFormat}
        setSelectedHeaders={setSelectedHeaders}
        open={downloadSettingsOpen}
        onClose={() => setDownloadSettingsOpen(false)}
        onSave={handleSettingsSave}
        availableHeaders={MATCH_EXPORT_HEADERS}
        title="Match Export Settings"
        description="Choose which match fields should be included in the CSV export."
      />
    </>
  );
}

export default Matches;
