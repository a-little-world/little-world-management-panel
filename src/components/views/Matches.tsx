import { Dropdown, Text } from '@a-little-world/little-world-design-system';
import React from 'react';
import { createSearchParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import { getMatchListExport } from '../../api/index';
import { useMatchListData, useMatchesFilterOptions } from '../../store';
import { DownloadSettingsModal } from '../blocks/DownloadSettingsModal';
import FiltersToolbar from '../blocks/FiltersToolbar';
import { MatchesTable } from '../blocks/MatchesTable';
import { SelectedMatchesSheet } from '../blocks/SelectedMatchesSheet';
import { SelectedUsersSheet } from '../blocks/SelectedUsersSheet';

const StyledDropdown = styled(Dropdown)`
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
  'notes',
  'user1.id',
  'user1.hash',
  'user1.email',
  'user1.profile.first_name',
  'user1.profile.second_name',
  'user1.profile.user_type',
  'user2.id',
  'user2.hash',
  'user2.email',
  'user2.profile.first_name',
  'user2.profile.second_name',
  'user2.profile.user_type',
];

const DEFAULT_MATCH_EXPORT_HEADERS = [
  'uuid',
  'status',
  'match_type',
  'bucket',
  'created_at',
  'user1.email',
  'user2.email',
];

const resolveHeaderValue = (row: any, header: string) =>
  header.split('.').reduce((acc, key) => acc?.[key], row);

const escapeCsvValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = Array.isArray(value) ? value.join(', ') : String(value);

  if (
    stringValue.includes(',') ||
    stringValue.includes('"') ||
    stringValue.includes('\n')
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

export function Matches() {
  let [searchParams, setSearchParams] = useSearchParams();
  const orderBy = searchParams.get('order_by') || '-created_at';
  const matchType = searchParams.get('match_type') ?? '';
  const list = searchParams.get('list') || 'all';
  const [downloadSettingsOpen, setDownloadSettingsOpen] = React.useState(false);
  const [selectedHeaders, setSelectedHeaders] = React.useState<string[]>(
    DEFAULT_MATCH_EXPORT_HEADERS,
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

  const handleDownload = () => {
    getMatchListExport({
      searchParams: createSearchParams(searchParams).toString(),
      onSuccess: response => {
        const headers = selectedHeaders.join(',');
        const csvRows = response.map((row: Record<string, any>) =>
          selectedHeaders
            .map((header: string) =>
              escapeCsvValue(resolveHeaderValue(row, header)),
            )
            .join(','),
        );

        const csvContent = [headers, ...csvRows].join('\n');

        const blob = new Blob([csvContent], {
          type: 'text/csv;charset=utf-8;',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${list}-matches-${new Date().toLocaleDateString('de')}.csv`;
        a.click();
      },
      onError: error => console.log({ error }),
    });
  };

  const handleSettingsSave = (headers: string[]) => {
    setSelectedHeaders(headers);
  };

  return (
    <>
      <FiltersToolbar
        showDownloadButton
        downloadDisabled={!list || selectedHeaders.length === 0}
        onDownloadClick={handleDownload}
        showSettingsButton
        settingsDisabled={!list || matchesLoading}
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
      {matchesLoading ? (
        <Text center>Loading matches list '{list}' ...</Text>
      ) : (
        <MatchesTable matchList={matchList} list={list} />
      )}
      <SelectedUsersSheet />
      <SelectedMatchesSheet />
      <DownloadSettingsModal
        selectedHeaders={selectedHeaders}
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
