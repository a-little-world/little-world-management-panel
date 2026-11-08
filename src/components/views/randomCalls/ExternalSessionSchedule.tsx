import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  ButtonVariations,
  Loading,
  LoadingSizes,
  Modal,
  PencilIcon,
  StatusMessage,
  StatusTypes,
  Text,
  TextTypes,
  Toast,
} from '@a-little-world/little-world-design-system';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { parseISO } from 'date-fns';
import React, { useMemo, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import useSWR, { mutate } from 'swr';

import { formatCompanyLabel } from '../../../api/companies';
import {
  ADMIN_EXTERNAL_SESSIONS_ENDPOINT,
  createExternalSession,
  ExternalSession,
  externalSessionLandingUrl,
  fetchExternalSessions,
  updateExternalSession,
} from '../../../api/partnerEventRegistrations';
import {
  berlinParts,
  berlinWallToIso,
  formatBerlinDateTime,
  parseIsoToDate,
} from '../../../helpers/berlinDates';
import { CopyableLink, copyResultToast } from '../../atoms/CopyableLink';
import {
  Description,
  ListPanel,
  ListScroll,
  PageContainer,
  PageHeader,
} from '../../atoms/PageLayout';
import { DataTable } from '../../blocks/DataTable';
import { usePageHeader } from '../../blocks/LayoutHeaderContext';
import ExternalSessionForm, {
  ExternalSessionFormValues,
  NO_COMPANY,
} from './ExternalSessionForm';

const LoadingWrap = styled.div`
  padding: ${({ theme }) => theme.spacing.large};
`;

const columnHelper = createColumnHelper<ExternalSession>();

const timeValue = (date: Date) =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

const timeFromIso = (iso: string) => {
  const { h, mi } = berlinParts(parseISO(iso).getTime());
  const hour = h === 24 ? 0 : h;
  return `${String(hour).padStart(2, '0')}:${String(mi).padStart(2, '0')}`;
};

const toBerlinIso = (date: Date, time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return berlinWallToIso(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hours,
    minutes,
    0,
    0,
  );
};

const emptyForm = (): ExternalSessionFormValues => {
  const now = new Date();
  const end = new Date(now);
  end.setMinutes(end.getMinutes() + 30);
  return {
    name: '',
    companyId: NO_COMPANY,
    startDate: now,
    startTime: timeValue(now),
    endTime: timeValue(end),
  };
};

const formFromSession = (
  session: ExternalSession,
): ExternalSessionFormValues => ({
  name: session.name,
  companyId:
    session.company_id == null ? NO_COMPANY : String(session.company_id),
  startDate: parseIsoToDate(session.start_time),
  startTime: timeFromIso(session.start_time),
  endTime: timeFromIso(session.end_time),
});

function ExternalSessionSchedule() {
  const theme = useTheme();
  const { data, error, isLoading } = useSWR(
    ADMIN_EXTERNAL_SESSIONS_ENDPOINT,
    fetchExternalSessions,
    { revalidateOnFocus: true, revalidateOnMount: true },
  );

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ExternalSession | null>(null);
  const [formInitialValues, setFormInitialValues] =
    useState<ExternalSessionFormValues>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    id: number;
    headline: string;
    title: string;
  } | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormInitialValues(emptyForm());
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (session: ExternalSession) => {
    setEditing(session);
    setFormInitialValues(formFromSession(session));
    setFormError(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setFormOpen(false);
    setEditing(null);
  };

  const handleSave = async (form: ExternalSessionFormValues) => {
    if (!form.startDate) {
      setFormError('Select a date.');
      return;
    }
    const start = toBerlinIso(form.startDate, form.startTime);
    const end = toBerlinIso(form.startDate, form.endTime);
    if (end <= start) {
      setFormError('End time must be after start time.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const body = {
        name: form.name,
        company_id:
          form.companyId === NO_COMPANY ? null : Number(form.companyId),
        start_time: start,
        end_time: end,
      };
      const saved = editing
        ? await updateExternalSession(editing.uuid, body)
        : await createExternalSession(body);
      await mutate(ADMIN_EXTERNAL_SESSIONS_ENDPOINT);
      setToast({
        id: Date.now(),
        headline: 'Success',
        title: editing
          ? `Updated ${saved.name}. Landing: ${externalSessionLandingUrl(saved.landing_path)}`
          : `Created ${saved.name}. Landing: ${externalSessionLandingUrl(saved.landing_path)}`,
      });
      setFormOpen(false);
      setEditing(null);
    } catch (submitError) {
      setFormError(
        submitError instanceof Error
          ? submitError.message
          : 'Could not save the session.',
      );
    } finally {
      setSaving(false);
    }
  };

  usePageHeader({
    actions: (
      <Button
        appearance={ButtonAppearance.Primary}
        size={ButtonSizes.Small}
        onClick={openCreate}
      >
        Create session
      </Button>
    ),
  });

  const columns = useMemo<ColumnDef<ExternalSession, any>[]>(
    () => [
      columnHelper.accessor('name', {
        header: 'Name',
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
      columnHelper.accessor('start_time', {
        header: 'Starts',
        cell: ({ getValue }) => (
          <Text type={TextTypes.Body6} tag="span">
            {formatBerlinDateTime(getValue())}
          </Text>
        ),
      }),
      columnHelper.accessor('end_time', {
        header: 'Ends',
        cell: ({ getValue }) => (
          <Text type={TextTypes.Body6} tag="span">
            {formatBerlinDateTime(getValue())}
          </Text>
        ),
      }),
      columnHelper.accessor('landing_path', {
        header: 'Landing',
        cell: ({ row, getValue }) => (
          <CopyableLink
            url={externalSessionLandingUrl(getValue())}
            label={row.original.name}
            onCopied={result => setToast(copyResultToast(result))}
          />
        ),
      }),
      columnHelper.accessor('registration_count', {
        header: 'Registrations',
        cell: ({ getValue }) => (
          <Text type={TextTypes.Body6} tag="span">
            {getValue()}
          </Text>
        ),
      }),
      columnHelper.display({
        id: 'edit',
        header: 'Edit',
        cell: ({ row }) => (
          <Button
            variation={ButtonVariations.Circle}
            appearance={ButtonAppearance.Secondary}
            size={ButtonSizes.Medium}
            onClick={() => openEdit(row.original)}
            color={theme.color.text.accent}
          >
            <PencilIcon label="edit icon" width={16} height={16} />
          </Button>
        ),
      }),
    ],
    [theme],
  );

  return (
    <PageContainer>
      <PageHeader>
        <Description>
          One-off random-call lobbies used for Adventsgespräche landings. The
          lobby name becomes the URL slug when there is no company. Times are in
          Berlin.
        </Description>
      </PageHeader>

      {error && (
        <StatusMessage type={StatusTypes.Error} visible>
          Failed to load external sessions.
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

      <Modal open={formOpen} onClose={closeForm}>
        <ExternalSessionForm
          editingSession={editing}
          companies={data?.companies ?? []}
          saving={saving}
          formError={formError}
          initialValues={formInitialValues}
          onCancel={closeForm}
          onSubmit={handleSave}
        />
      </Modal>

      {toast && (
        <Toast
          key={toast.id}
          headline={toast.headline}
          title={toast.title}
          onClose={() => setToast(null)}
        />
      )}
    </PageContainer>
  );
}

export default ExternalSessionSchedule;
