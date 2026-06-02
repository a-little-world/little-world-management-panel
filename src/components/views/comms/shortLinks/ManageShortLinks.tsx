import {
  ArchiveIcon,
  Button,
  ButtonAppearance,
  ButtonSizes,
  ButtonVariations,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardSizes,
  Loading,
  LoadingSizes,
  Modal,
  PencilIcon,
  StatusMessage,
  StatusTypes,
  Tag,
  TagAppearance,
  Text,
  TextInput,
  TextTypes,
  Toast,
} from '@a-little-world/little-world-design-system';
import React, { useDeferredValue, useMemo, useState } from 'react';
import useSWR, { mutate } from 'swr';

import { useTheme } from 'styled-components';
import {
  ADMIN_SHORT_LINKS_ENDPOINT,
  AdminShortLink,
  archiveAdminShortLink,
  createAdminShortLink,
  fetchAdminShortLinks,
  updateAdminShortLink,
} from '../../../../api/shortLinks';
import {
  Description,
  ListPanel,
  ListScroll,
  PageContainer,
  PageHeader,
} from '../../../atoms/PageLayout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../atoms/Table';
import { usePageHeader } from '../../../blocks/LayoutHeaderContext';
import LinkForm, { LinkFormValues } from './EditShortLink';

const getDefaultFormValues = (): LinkFormValues => ({
  tag: '',
  url: '',
  tracking_cookies_enabled: false,
  register_at_app_root: false,
  tracking_cookies: [],
});

const getEditFormValues = (link: AdminShortLink): LinkFormValues => ({
  tag: link.tag,
  url: link.url,
  tracking_cookies_enabled: link.tracking_cookies_enabled,
  register_at_app_root: link.register_at_app_root,
  tracking_cookies: link.tracking_cookies?.length
    ? link.tracking_cookies.map(c => ({ ...c }))
    : [],
});

function normalizeCookies(rows: LinkFormValues['tracking_cookies']) {
  return rows
    .map(r => ({
      name: r.name.trim(),
      value: r.value.trim(),
    }))
    .filter(r => r.name.length > 0 || r.value.length > 0);
}

function Links() {
  const [linksToast, setLinksToast] = useState<{
    id: number;
    headline: string;
    title: string;
  } | null>(null);

  const theme = useTheme();
  const [searchInput, setSearchInput] = useState('');
  const deferredSearch = useDeferredValue(searchInput.trim());

  const listKey = useMemo(
    () => [ADMIN_SHORT_LINKS_ENDPOINT, deferredSearch] as const,
    [deferredSearch],
  );

  const { data, error, isLoading } = useSWR(
    listKey,
    ([, search]: readonly [typeof ADMIN_SHORT_LINKS_ENDPOINT, string]) =>
      fetchAdminShortLinks(search),
    { revalidateOnFocus: true, revalidateOnMount: true },
  );

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<AdminShortLink | null>(null);
  const [formInitialValues, setFormInitialValues] =
    useState<LinkFormValues>(getDefaultFormValues);
  const [saving, setSaving] = useState(false);

  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archivingLink, setArchivingLink] = useState<AdminShortLink | null>(
    null,
  );
  const [archiveSubmitting, setArchiveSubmitting] = useState(false);

  const openCreateModal = () => {
    setEditingLink(null);
    setFormInitialValues(getDefaultFormValues());
    setFormModalOpen(true);
  };

  const openEditModal = (link: AdminShortLink) => {
    setEditingLink(link);
    setFormInitialValues(getEditFormValues(link));
    setFormModalOpen(true);
  };

  const closeFormModal = () => {
    if (saving) return;
    setFormModalOpen(false);
    setEditingLink(null);
  };

  const handleSave = async (values: LinkFormValues) => {
    const cookies = normalizeCookies(values.tracking_cookies);
    const wasEditing = Boolean(editingLink);
    setSaving(true);
    setLinksToast(null);

    try {
      if (editingLink) {
        await updateAdminShortLink(editingLink.id, {
          url: values.url.trim(),
          tracking_cookies_enabled: values.tracking_cookies_enabled,
          tracking_cookies: cookies,
          register_at_app_root: values.register_at_app_root,
        });
      } else {
        await createAdminShortLink({
          tag: values.tag.trim(),
          url: values.url.trim(),
          tracking_cookies_enabled: values.tracking_cookies_enabled,
          tracking_cookies: cookies,
          register_at_app_root: values.register_at_app_root,
        });
      }
      await mutate(
        (key: unknown) =>
          Array.isArray(key) && key[0] === ADMIN_SHORT_LINKS_ENDPOINT,
      );
      setLinksToast({
        id: Date.now(),
        headline: 'Success',
        title: wasEditing
          ? 'Short link updated successfully.'
          : 'Short link created successfully.',
      });
      setFormModalOpen(false);
      setEditingLink(null);
    } catch (e: any) {
      setLinksToast({
        id: Date.now(),
        headline: 'Error',
        title: e?.message || 'Could not save short link.',
      });
    } finally {
      setSaving(false);
    }
  };

  const openArchiveModal = (link: AdminShortLink) => {
    setArchivingLink(link);
    setArchiveOpen(true);
  };

  const closeArchiveModal = () => {
    if (archiveSubmitting) return;
    setArchiveOpen(false);
    setArchivingLink(null);
  };

  const confirmArchive = async () => {
    if (!archivingLink) return;
    const archivedTag = archivingLink.tag;
    setArchiveSubmitting(true);
    setLinksToast(null);
    try {
      await archiveAdminShortLink(archivingLink.id);
      await mutate(
        (key: unknown) =>
          Array.isArray(key) && key[0] === ADMIN_SHORT_LINKS_ENDPOINT,
      );
      setLinksToast({
        id: Date.now(),
        headline: 'Success',
        title: `Archived “${archivedTag}”. It no longer redirects.`,
      });
      closeArchiveModal();
    } catch (e: any) {
      setLinksToast({
        id: Date.now(),
        headline: 'Error',
        title: e?.message || 'Could not archive short link.',
      });
    } finally {
      setArchiveSubmitting(false);
    }
  };

  usePageHeader({
    actions: (
      <Button
        appearance={ButtonAppearance.Primary}
        size={ButtonSizes.Small}
        onClick={openCreateModal}
      >
        Create short link
      </Button>
    ),
  });

  const formatDateTime = (value: string) =>
    new Date(value).toLocaleString('en-GB');

  return (
    <PageContainer>
      <PageHeader>
        <Description>
          Short links redirect visitors from <code>/links/&lt;tag&gt;/</code> on
          this site to the destination URL. Enable “home app root” when the link
          must work from <strong>home.little-world.com</strong>. Query
          parameters on the incoming request are merged onto the destination URL
          when the key is not already present (for example campaign{' '}
          <code>source</code> / <code>s</code>, and optional{' '}
          <code>user_hash</code> / <code>u</code> / <code>h</code>). Archived
          links stop redirecting but remain in the database for reporting.
        </Description>
      </PageHeader>

      {error && (
        <StatusMessage type={StatusTypes.Error} visible>
          Failed to load short links.
        </StatusMessage>
      )}

      <div style={{ marginBottom: '0.75rem', maxWidth: '22rem' }}>
        <TextInput
          id="short-links-search"
          label="Search"
          placeholder="Filter by tag or destination URL"
          value={searchInput}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchInput(e.target.value)
          }
        />
      </div>

      <ListPanel>
        <ListScroll>
          {isLoading ? (
            <div style={{ padding: '1rem 1.25rem' }}>
              <Loading size={LoadingSizes.Medium} />
            </div>
          ) : (data ?? []).length === 0 ? (
            <div style={{ padding: '1rem 1.25rem' }}>
              <Text type={TextTypes.Body4}>
                No short links yet, or nothing matches your search.
              </Text>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tag</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead className="w-44 text-center">Clicks</TableHead>
                  <TableHead className="w-28 text-center">Home root</TableHead>
                  <TableHead className="w-28 text-center">Tracking</TableHead>
                  <TableHead className="w-44">Updated</TableHead>
                  <TableHead className="w-28 text-left">Edit</TableHead>
                  <TableHead className="w-28 text-left">Archive</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data ?? []).map((link: AdminShortLink) => (
                  <TableRow key={link.id}>
                    <TableCell className="font-medium">{link.tag}</TableCell>
                    <TableCell
                      className="max-w-[18rem] truncate"
                      title={link.url}
                    >
                      {link.url}
                    </TableCell>
                    <TableCell className="text-center">
                      {link.click_count}
                    </TableCell>
                    <TableCell className="text-center">
                      <Tag
                        appearance={
                          link.register_at_app_root
                            ? TagAppearance.success
                            : TagAppearance.error
                        }
                      >
                        {link.register_at_app_root ? 'Yes' : 'No'}
                      </Tag>
                    </TableCell>
                    <TableCell className="text-center">
                      <Tag
                        appearance={
                          link.tracking_cookies_enabled
                            ? TagAppearance.success
                            : TagAppearance.error
                        }
                      >
                        {link.tracking_cookies_enabled ? 'On' : 'Off'}
                      </Tag>
                    </TableCell>
                    <TableCell>{formatDateTime(link.updated_at)}</TableCell>
                    <TableCell className="justify-center">
                      <Button
                        variation={ButtonVariations.Circle}
                        appearance={ButtonAppearance.Secondary}
                        size={ButtonSizes.Medium}
                        onClick={() => openEditModal(link)}
                        color={theme.color.text.accent}
                      >
                        <PencilIcon label="edit icon" width={16} height={16} />
                      </Button>
                    </TableCell>
                    <TableCell className="justify-center">
                      <Button
                        variation={ButtonVariations.Circle}
                        appearance={ButtonAppearance.Secondary}
                        size={ButtonSizes.Medium}
                        onClick={() => openArchiveModal(link)}
                        color={theme.color.text.error}
                      >
                        <ArchiveIcon
                          label="archive icon"
                          width={16}
                          height={16}
                        />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ListScroll>
      </ListPanel>

      <Modal open={formModalOpen} onClose={closeFormModal}>
        <LinkForm
          editingLink={editingLink}
          saving={saving}
          initialValues={formInitialValues}
          onCancel={closeFormModal}
          onSubmit={handleSave}
        />
      </Modal>

      <Modal open={archiveOpen} onClose={closeArchiveModal}>
        <Card width={CardSizes.Medium}>
          <CardHeader>Archive this short link?</CardHeader>
          <CardContent marginBottom="32px">
            <Text type={TextTypes.Body4}>
              {archivingLink ? (
                <>
                  The URL path <code>/links/{archivingLink.tag}/</code> will
                  stop redirecting. Analytics from past clicks are retained.
                </>
              ) : null}
            </Text>
          </CardContent>
          <CardFooter align="space-between">
            <Button
              appearance={ButtonAppearance.Secondary}
              size={ButtonSizes.Small}
              onClick={closeArchiveModal}
              disabled={archiveSubmitting}
            >
              Cancel
            </Button>
            <Button
              appearance={ButtonAppearance.Primary}
              size={ButtonSizes.Small}
              onClick={confirmArchive}
              disabled={archiveSubmitting}
            >
              {archiveSubmitting ? 'Archiving…' : 'Archive'}
            </Button>
          </CardFooter>
        </Card>
      </Modal>

      {linksToast && (
        <Toast
          key={linksToast.id}
          headline={linksToast.headline}
          title={linksToast.title}
          onClose={() => setLinksToast(null)}
        />
      )}
    </PageContainer>
  );
}

export default Links;
