import {
  Loading,
  LoadingSizes,
  Select,
  StatusMessage,
  StatusTypes,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import useSWR from 'swr';

import { formatCompanyLabel } from '../../../api/companies';
import {
  ADMIN_PARTNER_EVENT_REGISTRATIONS_ENDPOINT,
  fetchPartnerEventRegistrations,
  PartnerEventRegistration,
} from '../../../api/partnerEventRegistrations';
import { formatBerlinDateTime } from '../../../helpers/berlinDates';
import {
  Description,
  ListPanel,
  ListScroll,
  PageContainer,
  PageHeader,
} from '../../atoms/PageLayout';
import { DataTable } from '../../blocks/DataTable';
import { FiltersToolbar } from '../../blocks/FiltersToolbar';

const ALL_TIMES = 'ALL';

const LoadingWrap = styled.div`
  padding: ${({ theme }) => theme.spacing.large};
`;

const StyledDropdown = styled(Select)`
  div[data-radix-popper-content-wrapper] {
    z-index: ${({ theme }) => theme.zIndex.dropdown} !important;
  }
`;

const columnHelper = createColumnHelper<PartnerEventRegistration>();

const columns: ColumnDef<PartnerEventRegistration, any>[] = [
  columnHelper.accessor('email', {
    header: 'Email',
    cell: ({ getValue }) => (
      <Text type={TextTypes.Body6} tag="span" bold>
        {getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor(row => formatCompanyLabel(row.company), {
    id: 'company',
    header: 'Company',
    cell: ({ getValue }) => (
      <Text type={TextTypes.Body6} tag="span">
        {getValue() || '—'}
      </Text>
    ),
  }),
  columnHelper.accessor('lobby_name', {
    header: 'Session',
    cell: ({ getValue }) => (
      <Text type={TextTypes.Body6} tag="span">
        {getValue() || '—'}
      </Text>
    ),
  }),
  columnHelper.accessor('appointment_starts_at', {
    header: 'Appointment',
    cell: ({ getValue }) => (
      <Text type={TextTypes.Body6} tag="span">
        {formatBerlinDateTime(getValue())}
      </Text>
    ),
  }),
  columnHelper.accessor('newsletter_subscribed', {
    header: 'Newsletter',
    cell: ({ getValue }) => (
      <Text type={TextTypes.Body6} tag="span">
        {getValue() ? 'Yes' : 'No'}
      </Text>
    ),
  }),
  columnHelper.accessor('registered_at', {
    header: 'Registered',
    cell: ({ getValue }) => (
      <Text type={TextTypes.Body6} tag="span">
        {formatBerlinDateTime(getValue())}
      </Text>
    ),
  }),
];

function SpecialEventRegistrations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const appointmentParam = searchParams.get('appointment_starts_at') || '';

  const listParams = useMemo(() => {
    const params = new URLSearchParams();
    if (appointmentParam) {
      params.set('appointment_starts_at', appointmentParam);
    }
    return params.toString();
  }, [appointmentParam]);

  const { data, error, isLoading } = useSWR(
    [ADMIN_PARTNER_EVENT_REGISTRATIONS_ENDPOINT, listParams] as const,
    ([, queryString]) => fetchPartnerEventRegistrations(queryString),
    { revalidateOnFocus: true, revalidateOnMount: true },
  );

  const appointmentTimes = data?.appointment_times;
  const selectedAppointment =
    appointmentParam && appointmentTimes?.includes(appointmentParam)
      ? appointmentParam
      : ALL_TIMES;

  const appointmentOptions = useMemo(
    () => [
      { value: ALL_TIMES, label: 'All times' },
      ...(appointmentTimes ?? []).map(value => ({
        value,
        label: formatBerlinDateTime(value),
      })),
    ],
    [appointmentTimes],
  );

  const changeAppointment = (value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (!value || value === ALL_TIMES) {
      nextParams.delete('appointment_starts_at');
    } else {
      nextParams.set('appointment_starts_at', value);
    }
    nextParams.set('tab', 'external');
    nextParams.set('section', 'registrations');
    setSearchParams(nextParams);
  };

  return (
    <PageContainer>
      <PageHeader>
        <Description>
          Emails registered on external-session landings. Filter by the
          appointment times already stored in the database.
        </Description>
      </PageHeader>

      <FiltersToolbar
        showPagination={false}
        showPageSizeDropdown={false}
        isLoading={isLoading && !data}
        loadingText="Loading appointments..."
      >
        <StyledDropdown
          label="Appointment"
          value={selectedAppointment}
          options={appointmentOptions}
          onValueChange={changeAppointment}
          placeholder="Select a time..."
          cannotError
        />
      </FiltersToolbar>

      {error && (
        <StatusMessage type={StatusTypes.Error} visible>
          Failed to load registrations.
        </StatusMessage>
      )}

      <ListPanel>
        <ListScroll>
          {isLoading && !data ? (
            <LoadingWrap>
              <Loading size={LoadingSizes.Medium} />
            </LoadingWrap>
          ) : (
            <DataTable columns={columns} data={data?.results ?? []} />
          )}
        </ListScroll>
      </ListPanel>
    </PageContainer>
  );
}

export default SpecialEventRegistrations;
