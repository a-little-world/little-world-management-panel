import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  Loading,
  LoadingSizes,
  StatusMessage,
  StatusTypes,
  Tag,
  TagAppearance,
} from '@a-little-world/little-world-design-system';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';

import { Banner, fetchAdminBanners } from '../../../../api/banners';
import { BANNERS_ROUTE } from '../../../../routes';
import {
  Description,
  HeaderText,
  ListPanel,
  ListScroll,
  PageContainer,
  PageHeader,
  Title,
  TitleRow,
} from '../../../atoms/PageLayout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../atoms/Table';

const buildBannerEditRoute = (id: number | 'new') => `${BANNERS_ROUTE}${id}/`;
const formatDateTime = (value: string | null) =>
  value ? new Date(value).toLocaleString('en-GB') : '—';

function Banners() {
  const navigate = useNavigate();
  const { data, error, isLoading } = useSWR<Banner[]>(
    '/api/admin/banners/',
    fetchAdminBanners,
    { revalidateOnFocus: true, revalidateOnMount: true },
  );

  return (
    <PageContainer>
      <PageHeader>
        <HeaderText>
          <TitleRow>
            <Title>Banners</Title>
            <Button
              appearance={ButtonAppearance.Primary}
              size={ButtonSizes.Small}
              onClick={() => navigate(buildBannerEditRoute('new'))}
            >
              Create banner
            </Button>
          </TitleRow>
          <Description>
            Manage active and scheduled communication banners.
          </Description>
        </HeaderText>
      </PageHeader>

      {error && (
        <StatusMessage type={StatusTypes.Error} visible>
          Failed to load banners.
        </StatusMessage>
      )}

      <ListPanel>
        <ListScroll>
          {isLoading ? (
            <div style={{ padding: '1rem 1.25rem' }}>
              <Loading size={LoadingSizes.Medium} />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-32 text-center">Activation</TableHead>
                  <TableHead className="w-32 text-center">Expiry</TableHead>
                  <TableHead className="w-32 text-center">Filter</TableHead>
                  <TableHead className="w-28 text-center">Status</TableHead>
                  <TableHead className="w-24 text-center">Type</TableHead>
                  <TableHead className="w-28 text-center">Priority</TableHead>
                  <TableHead className="w-[5.5rem] text-center">Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data ?? []).map(banner => (
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
                    <TableCell className="text-center">{banner.type}</TableCell>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ListScroll>
      </ListPanel>
    </PageContainer>
  );
}

export default Banners;
