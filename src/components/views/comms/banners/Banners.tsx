import {
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
  StatusMessage,
  StatusTypes,
  Tag,
  TagAppearance,
  Text,
  TextTypes,
  Toast,
  TrashIcon,
} from '@a-little-world/little-world-design-system';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'styled-components';
import useSWR, { mutate } from 'swr';

import {
  ADMIN_BANNERS_ENDPOINT,
  Banner,
  deleteBanner,
  fetchAdminBanners,
} from '../../../../api/banners';
import { BANNERS_ROUTE } from '../../../../router/routes';
import {
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../atoms/Tabs';
import { usePageHeader } from '../../../blocks/LayoutHeaderContext';

const buildBannerEditRoute = (id: number | 'new') => `${BANNERS_ROUTE}${id}/`;
const formatDateTime = (value: string | null) =>
  value ? new Date(value).toLocaleString('en-GB') : '—';
type BannerTab = 'active-or-upcoming' | 'inactive';

const hasFutureActivation = (banner: Banner, now: Date) => {
  if (!banner.activation_time) return false;
  const activationDate = new Date(banner.activation_time);
  return !Number.isNaN(activationDate.getTime()) && activationDate > now;
};

function Banners() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [tab, setTab] = useState<BannerTab>('active-or-upcoming');
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    id: number;
    headline: string;
    title: string;
  } | null>(null);

  const { data, error, isLoading } = useSWR<Banner[]>(
    ADMIN_BANNERS_ENDPOINT,
    fetchAdminBanners,
    { revalidateOnFocus: true, revalidateOnMount: true },
  );

  const { activeOrUpcomingBanners, inactiveBanners } = useMemo(() => {
    const now = new Date();
    const banners = data ?? [];

    const activeOrUpcomingBanners = banners.filter(
      banner => banner.active || hasFutureActivation(banner, now),
    );
    const inactiveBanners = banners.filter(
      banner => !banner.active && !hasFutureActivation(banner, now),
    );

    return { activeOrUpcomingBanners, inactiveBanners };
  }, [data]);

  const currentList =
    tab === 'active-or-upcoming' ? activeOrUpcomingBanners : inactiveBanners;

  const closeDeleteModal = () => {
    if (deleting) return;
    setBannerToDelete(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!bannerToDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteBanner(bannerToDelete.id);
      await mutate(ADMIN_BANNERS_ENDPOINT);
      setToast({
        id: Date.now(),
        headline: 'Success',
        title: `Banner “${bannerToDelete.name}” deleted.`,
      });
      setBannerToDelete(null);
    } catch (e: any) {
      setDeleteError(e?.message || 'Failed to delete banner.');
    } finally {
      setDeleting(false);
    }
  };

  usePageHeader({
    actions: (
      <Button
        appearance={ButtonAppearance.Primary}
        size={ButtonSizes.Small}
        onClick={() => navigate(buildBannerEditRoute('new'))}
      >
        Create banner
      </Button>
    ),
  });

  return (
    <PageContainer>
      <PageHeader>
        <StatusMessage type={StatusTypes.Warning} visible withBorder>
          Active means the banner is live on the site. If an activation or
          expiration date is set, the active status updates automatically at
          those times.
        </StatusMessage>
      </PageHeader>

      {error && (
        <StatusMessage type={StatusTypes.Error} visible>
          Failed to load banners.
        </StatusMessage>
      )}

      <Tabs value={tab} onValueChange={value => setTab(value as BannerTab)}>
        <TabsList>
          <TabsTrigger value="active-or-upcoming">
            Active or upcoming
          </TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>
        <TabsContent value={tab}>
          <ListPanel>
            <ListScroll>
              {isLoading ? (
                <div style={{ padding: '1rem 1.25rem' }}>
                  <Loading size={LoadingSizes.Medium} />
                </div>
              ) : currentList.length === 0 ? (
                <div style={{ padding: '1rem 1.25rem' }}>
                  <Text type={TextTypes.Body4}>No banners in this tab.</Text>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead className="w-32 text-center">
                        Activation
                      </TableHead>
                      <TableHead className="w-32 text-center">Expiry</TableHead>
                      <TableHead className="w-32 text-center">Filter</TableHead>
                      <TableHead className="w-28 text-center">Status</TableHead>
                      <TableHead className="w-24 text-center">Type</TableHead>
                      <TableHead className="w-28 text-center">
                        Priority
                      </TableHead>
                      <TableHead className="w-[5.5rem] text-center">
                        Edit
                      </TableHead>
                      <TableHead className="w-16 text-center">Delete</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentList.map(banner => (
                      <TableRow key={banner.id}>
                        <TableCell>{banner.name}</TableCell>
                        <TableCell>{banner.title || '—'}</TableCell>
                        <TableCell className="text-center">
                          {formatDateTime(banner.activation_time)}
                        </TableCell>
                        <TableCell className="text-center">
                          {formatDateTime(banner.expiration_time)}
                        </TableCell>
                        <TableCell className="text-center">
                          {banner.custom_filter || 'none'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Tag
                            appearance={
                              banner.active
                                ? TagAppearance.success
                                : TagAppearance.error
                            }
                          >
                            {banner.active ? 'Active' : 'Inactive'}
                          </Tag>
                        </TableCell>
                        <TableCell className="text-center">
                          {banner.type}
                        </TableCell>
                        <TableCell className="text-center">
                          {banner.filter_priority}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            appearance={ButtonAppearance.Secondary}
                            size={ButtonSizes.Small}
                            onClick={() =>
                              navigate(buildBannerEditRoute(banner.id))
                            }
                          >
                            Edit
                          </Button>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            type="button"
                            variation={ButtonVariations.Icon}
                            size={ButtonSizes.Small}
                            disabled={deleting}
                            title={`Delete ${banner.name}`}
                            onClick={() => {
                              setDeleteError(null);
                              setBannerToDelete(banner);
                            }}
                          >
                            <TrashIcon
                              label={`delete ${banner.name}`}
                              width={16}
                              height={16}
                              color={theme.color.status.error}
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
        </TabsContent>
      </Tabs>

      <Modal open={Boolean(bannerToDelete)} onClose={closeDeleteModal}>
        <Card width={CardSizes.Medium}>
          <CardHeader>Delete banner permanently?</CardHeader>
          <CardContent>
            <Text>
              This will permanently delete
              {bannerToDelete ? ` “${bannerToDelete.name}”` : ' this banner'}.
              This cannot be undone.
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
          headline={toast.headline}
          title={toast.title}
          onClose={() => setToast(null)}
        />
      )}
    </PageContainer>
  );
}

export default Banners;
