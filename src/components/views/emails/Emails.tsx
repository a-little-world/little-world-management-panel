import {
  Accordion,
  AccordionContent,
  Button,
  ButtonAppearance,
  ButtonSizes,
  ButtonVariations,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardSizes,
  Link,
  Modal,
  StatusMessage,
  StatusTypes,
  Text,
  TextTypes,
  Toast,
  TrashIcon,
} from '@a-little-world/little-world-design-system';
import { render as renderEmail } from '@react-email/render';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { map, sortBy } from 'lodash';
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled, { css, useTheme } from 'styled-components';
import useSWR from 'swr';

import { deleteDynamicTemplate } from '../../../api';
import EmailBuilder from '../../../emails/Builder';
import emailData from '../../../emails/data';
import automatedEmails, {
  getAutomatedPatentmatchEmails,
} from '../../../emails/data/automated';
import marketingEmails from '../../../emails/data/marketing';
import partnershipsEmails from '../../../emails/data/partnerships';
import { getUnsubscribeUrl } from '../../../emails/shared/constants';
import { getCookiesAsObject } from '../../../lib/utils';
import {
  CREATE_NEW_EMAIL_ROUTE,
  SEND_DYNAMIC_EMAIL_ROUTE,
} from '../../../router/routes';
import { dataFetcher } from '../../../store';
import AutoEmailStatusTag, {
  AutoEmailStatus,
} from '../../atoms/AutoEmailStatusTag';
import LoadingSpinner from '../../atoms/LoadingSpinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../atoms/Tabs';
import { DataTable } from '../../blocks/DataTable';

interface AutoEmailFlags {
  [templateId: string]: {
    group: string | null;
    status: AutoEmailStatus;
  };
}

interface DynamicTemplateRow {
  template_name: string;
  subject: string;
}

interface BackendTemplateRow {
  id: string;
  label: string;
  status?: AutoEmailStatus;
}

const Container = styled.div`
  height: 100%;
`;

const TabPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
  padding: ${({ theme }) => theme.spacing.small};

  ${({ theme }) => css`
    @media (min-width: ${theme.breakpoints.medium}) {
      padding: ${theme.spacing.medium};
    }
  `}
`;

type EmailsTab = 'automated' | 'dynamic';

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.small};
  flex-wrap: wrap;
`;

const EmailGrouping = styled(AccordionContent)`
  flex-direction: column;
  background: ${({ theme }) => theme.color.surface.primary};
  padding: 0;
`;

const GROUPED_TEMPLATES = {
  Automated: map(automatedEmails),
  Marketing: map(marketingEmails),
  Partnerships: map(partnershipsEmails),
  AutomatedPatenmatch: map(getAutomatedPatentmatchEmails()),
};

const columnHelper = createColumnHelper<BackendTemplateRow>();

function buildTemplateColumns(
  withStatus: boolean,
): ColumnDef<BackendTemplateRow, any>[] {
  return [
    columnHelper.accessor('label', {
      header: 'Email',
      cell: ({ getValue }) => (
        <Text type={TextTypes.Body6} tag="span">
          {getValue()}
        </Text>
      ),
    }),
    ...(withStatus
      ? [
          columnHelper.accessor('status', {
            header: 'Status',
            cell: ({ getValue }) => {
              const status = getValue();
              return status ? (
                <AutoEmailStatusTag status={status} />
              ) : (
                <Text type={TextTypes.Body6} tag="span">
                  —
                </Text>
              );
            },
          }),
        ]
      : []),
    columnHelper.display({
      id: 'view',
      header: '',
      cell: ({ row }) => (
        <Link href={row.original.id} relative>
          View
        </Link>
      ),
    }),
  ];
}

const dynamicColumnHelper = createColumnHelper<DynamicTemplateRow>();

function buildDynamicTemplateColumns({
  deleteColor,
  deleting,
  onDelete,
}: {
  deleteColor: string;
  deleting: boolean;
  onDelete: (template: DynamicTemplateRow) => void;
}): ColumnDef<DynamicTemplateRow, any>[] {
  return [
    dynamicColumnHelper.accessor('template_name', {
      header: 'Template',
      cell: ({ getValue }) => (
        <Text type={TextTypes.Body6} tag="span">
          {getValue()}
        </Text>
      ),
    }),
    dynamicColumnHelper.accessor('subject', {
      header: 'Subject',
      cell: ({ getValue }) => (
        <Text type={TextTypes.Body6} tag="span">
          {getValue()}
        </Text>
      ),
    }),
    dynamicColumnHelper.display({
      id: 'view',
      header: '',
      cell: ({ row }) => (
        <Link
          href={SEND_DYNAMIC_EMAIL_ROUTE.replace(
            ':emailTemplateName',
            row.original.template_name,
          )}
        >
          View
        </Link>
      ),
    }),
    dynamicColumnHelper.display({
      id: 'delete',
      header: '',
      cell: ({ row }) => (
        <Button
          type="button"
          variation={ButtonVariations.Icon}
          size={ButtonSizes.Small}
          disabled={deleting}
          title={`Delete ${row.original.template_name}`}
          onClick={() => onDelete(row.original)}
        >
          <TrashIcon
            label={`delete ${row.original.template_name}`}
            width={16}
            height={16}
            color={deleteColor}
          />
        </Button>
      ),
    }),
  ];
}

async function developmentUpdateBackendEmailTemplatesAndConfiguration({
  backendEmailConfig,
}) {
  console.log('Syncing backend emails');

  const updateBackendEmailConfig = newConfig => {
    return fetch(`/api/matching/emails/config/overwrite/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookiesAsObject().csrftoken,
      },
      body: JSON.stringify(newConfig),
    });
  };

  const overwriteBackendEmailTemplate = (key, html) => {
    return fetch(`/api/matching/emails/templates/${key}/overwrite/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookiesAsObject().csrftoken,
      },
      body: JSON.stringify({
        html: html,
      }),
    });
  };

  const newEmailConfig = backendEmailConfig;
  const templateToUpload = [];

  // Process all templates sequentially since renderEmail is now async
  for (const [key, value] of Object.entries(emailData)) {
    console.log(`TEMPLATE: ${key}: ${value}`, value);
    const email = value;
    const html = await renderEmail(
      <EmailBuilder
        content={email.content}
        preview={email.preview}
        theme={email.theme}
        unsubscribeLink={getUnsubscribeUrl(email.category_id)}
      />,
    );
    const templateDict = {
      id: key,
      sender_id: email?.sender_id ?? 'noreply',
      category_id: email.category_id,
      subject: value?.subject ?? 'No Subject',
      theme: email.theme || 'little-world',
      template: 'react_emails/' + key + '.html',
    };
    templateToUpload.push({
      key: key,
      html: html,
    });

    newEmailConfig.emails[key] = templateDict;
  }

  const promises = [];
  promises.push(updateBackendEmailConfig(newEmailConfig));
  templateToUpload.forEach(template => {
    promises.push(overwriteBackendEmailTemplate(template.key, template.html));
  });

  return Promise.all(promises);
}

const Emails = () => {
  const { data: backendEmailConfiguration } = useSWR(
    '/api/matching/emails/config/',
    dataFetcher,
    {},
  );

  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: EmailsTab =
    searchParams.get('tab') === 'dynamic' ? 'dynamic' : 'automated';
  const onTabChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', value);
    setSearchParams(newParams, { replace: true });
  };
  const [templateToDelete, setTemplateToDelete] =
    useState<DynamicTemplateRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ id: number; title: string } | null>(
    null,
  );

  const {
    data: dynamicEmails,
    isLoading,
    mutate: mutateDynamicEmails,
  } = useSWR(
    '/api/matching/emails/dynamic_templates/?page_size=150',
    dataFetcher,
    {},
  );

  const { data: autoEmailFlags } = useSWR<AutoEmailFlags>(
    '/api/matching/emails/auto_email_flags/',
    dataFetcher,
    {},
  );

  const closeDeleteModal = () => {
    if (deleting) return;
    setTemplateToDelete(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!templateToDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteDynamicTemplate(templateToDelete.template_name);
      await mutateDynamicEmails();
      setToast({
        id: Date.now(),
        title: `Template “${templateToDelete.template_name}” deleted.`,
      });
      setTemplateToDelete(null);
    } catch (e: any) {
      setDeleteError(e?.message || 'Failed to delete template.');
    } finally {
      setDeleting(false);
    }
  };

  const onSyncBackendEmails = async () => {
    // 1 - fetches the current email confirguration from the backend
    // 2 - injects all the new email templates into the json
    // 3 - creates on zip file to download continaing all the email htmls and an updated emails.json
    await developmentUpdateBackendEmailTemplatesAndConfiguration({
      backendEmailConfig: backendEmailConfiguration,
    });
  };

  return (
    <Container>
      <Tabs value={tab} onValueChange={onTabChange}>
        <TabsList>
          <TabsTrigger value="automated">Automated</TabsTrigger>
          <TabsTrigger value="dynamic">Dynamic</TabsTrigger>
        </TabsList>
        <TabsContent value="automated">
          <TabPanel>
            <TopBar>
              <Text type={TextTypes.Heading4}>Backend Templates</Text>
              <Button
                appearance={ButtonAppearance.Secondary}
                onClick={onSyncBackendEmails}
              >
                [DEVELOPMENT] Sync Emails
              </Button>
            </TopBar>
            <Text type={TextTypes.Body4}>
              These are automated backend emails that must be updated in the
              backend. You may edit all of them in emails.json.
            </Text>
            <Text type={TextTypes.Body6}>
              The status shows whether an automatic email is actually delivered:
              &quot;Live&quot; emails are sent, &quot;Emulated&quot; emails are
              logged but never delivered, and &quot;Off&quot; emails are
              disabled entirely. &quot;Always on&quot; emails have no setting
              and are sent whenever their event happens; &quot;Unused&quot;
              emails are not sent anywhere.
            </Text>
            <Accordion
              ContentWrapper={EmailGrouping}
              items={map(GROUPED_TEMPLATES, (item, header) => {
                const rows: BackendTemplateRow[] = sortBy(
                  item as { id: string; label: string }[],
                  'label',
                ).map(template => ({
                  id: template.id,
                  label: template.label,
                  status: autoEmailFlags?.[template.id]?.status,
                }));
                // Only env-gated automatic emails have a delivery status
                const withStatus = rows.some(row => row.status);
                return {
                  header,
                  content: (
                    <DataTable
                      columns={buildTemplateColumns(withStatus)}
                      data={rows}
                    />
                  ),
                };
              })}
            />
          </TabPanel>
        </TabsContent>
        <TabsContent value="dynamic">
          <TabPanel>
            <TopBar>
              <Text type={TextTypes.Heading4}>Dynamic Templates</Text>
              <Link
                buttonSize={ButtonSizes.Small}
                buttonAppearance={ButtonAppearance.Primary}
                href={CREATE_NEW_EMAIL_ROUTE}
                style={{ maxWidth: '200px' }}
              >
                Create New
              </Link>
            </TopBar>
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <DataTable
                columns={buildDynamicTemplateColumns({
                  deleteColor: theme.color.status.error,
                  deleting,
                  onDelete: template => {
                    setDeleteError(null);
                    setTemplateToDelete(template);
                  },
                })}
                data={sortBy(dynamicEmails?.results ?? [], 'template_name')}
              />
            )}
          </TabPanel>
        </TabsContent>
      </Tabs>

      <Modal open={Boolean(templateToDelete)} onClose={closeDeleteModal}>
        <Card width={CardSizes.Medium}>
          <CardHeader>Delete template permanently?</CardHeader>
          <CardContent>
            <Text>
              This will permanently delete
              {templateToDelete
                ? ` “${templateToDelete.template_name}”`
                : ' this template'}
              . This cannot be undone.
            </Text>
            <StatusMessage
              type={StatusTypes.Error}
              visible={Boolean(deleteError)}
            >
              {deleteError}
            </StatusMessage>
          </CardContent>
          <CardFooter align="space-between">
            <Button
              appearance={ButtonAppearance.Secondary}
              size={ButtonSizes.Small}
              onClick={closeDeleteModal}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              size={ButtonSizes.Small}
              backgroundColor={theme.color.status.error}
              onClick={handleConfirmDelete}
              disabled={deleting}
              loading={deleting}
            >
              Delete permanently
            </Button>
          </CardFooter>
        </Card>
      </Modal>

      {toast && (
        <Toast
          key={toast.id}
          headline="Success"
          title={toast.title}
          onClose={() => setToast(null)}
        />
      )}
    </Container>
  );
};

export default Emails;
