import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  ButtonVariations,
  Link,
  Loading,
  LoadingSizes,
  PencilIcon,
  StatusMessage,
  StatusTypes,
  Tag,
  TagAppearance,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';

import { useTheme } from 'styled-components';
import {
  ADMIN_SURVEY_CAMPAIGNS_ENDPOINT,
  fetchSurveyAudienceOptions,
  fetchSurveyCampaigns,
  SurveyAudienceFilterOption,
  SurveyCampaign,
} from '../../../../api/surveys';
import { formatBerlinDate } from '../../../../helpers/berlinDates';
import {
  getSurveyEditRoute,
  getSurveyResponsesRoute,
} from '../../../../router/routes';
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

type SurveyTab = 'live' | 'draft';

const formatWindow = (campaign: SurveyCampaign) => {
  if (!campaign.starts_at && !campaign.ends_at) return 'Always';
  return `${formatBerlinDate(campaign.starts_at)} → ${formatBerlinDate(campaign.ends_at)}`;
};

const describeAudience = (campaign: SurveyCampaign) =>
  campaign.audience_label ||
  (campaign.audience_type === 'company'
    ? campaign.audience_value || 'Company'
    : campaign.audience_type === 'filter'
      ? campaign.audience_value
      : 'Everyone');

/**
 * The served labels spell the rule out in full — "First qualifying call (10 min or longer;
 * excludes random calls)" — which is right for a form and far too long for a table cell. The
 * qualifier lives in brackets, so trimming there gives a column heading without restating the
 * labels here and letting them drift again.
 */
const shortLabel = (label: string) => label.split(' (')[0];

const describeEligibleAfter = (
  campaign: SurveyCampaign,
  options: SurveyAudienceFilterOption[] | undefined,
) => {
  const match = (options ?? []).find(
    option => option.value === (campaign.eligible_after_event ?? ''),
  );
  return match
    ? shortLabel(match.label)
    : campaign.eligible_after_event || 'Immediately';
};

/** Only meaningful alongside a condition — a bound on nothing is not a date worth showing. */
const describeEligibleSince = (campaign: SurveyCampaign) =>
  campaign.eligible_after_event && campaign.eligible_after_since
    ? formatBerlinDate(campaign.eligible_after_since)
    : '—';

const describeRepeat = (campaign: SurveyCampaign) =>
  campaign.repeat_scope === 'context'
    ? `Once per ${campaign.context_type || 'context'}`
    : 'Once per user';

const describeResponses = (campaign: SurveyCampaign) => {
  if (!campaign.offered) return '—';
  const rate = Math.round((campaign.answered / campaign.offered) * 100);
  return `${campaign.answered}/${campaign.offered} (${rate}%)`;
};

/**
 * Offers the client confirmed it actually painted. An offered count that climbs while this
 * stays at zero is a broken client — the exact failure that hid the old post-call survey for
 * a year — so it gets its own column rather than being folded into the answer rate.
 */
const describeDelivery = (campaign: SurveyCampaign) => {
  if (!campaign.offered) return '—';
  return `${campaign.rendered}/${campaign.offered}`;
};

function SurveyCampaigns() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<SurveyTab>('live');
  const theme = useTheme();

  const { data, error, isLoading } = useSWR<SurveyCampaign[]>(
    ADMIN_SURVEY_CAMPAIGNS_ENDPOINT,
    fetchSurveyCampaigns,
    { revalidateOnFocus: true, revalidateOnMount: true },
  );
  const { data: options } = useSWR(
    `${ADMIN_SURVEY_CAMPAIGNS_ENDPOINT}options/`,
    fetchSurveyAudienceOptions,
  );

  const { live, draft } = useMemo(() => {
    const campaigns = data ?? [];
    return {
      live: campaigns.filter(campaign => campaign.active),
      draft: campaigns.filter(campaign => !campaign.active),
    };
  }, [data]);

  const currentList = tab === 'live' ? live : draft;

  usePageHeader({
    actions: (
      <Button
        appearance={ButtonAppearance.Primary}
        size={ButtonSizes.Small}
        onClick={() => navigate(getSurveyEditRoute('new'))}
      >
        Create survey
      </Button>
    ),
  });

  return (
    <PageContainer>
      <PageHeader>
        <StatusMessage type={StatusTypes.Warning} visible withBorder>
          A survey is offered to anyone matching its audience while it is
          active, so switching a campaign on is what starts collecting answers.
          Retire a survey by deactivating it — campaigns with answers cannot be
          deleted. Note that once a user is shown a survey, they will not be
          shown the same one or another one for 12 hours.
        </StatusMessage>
      </PageHeader>

      {error && (
        <StatusMessage type={StatusTypes.Error} visible>
          Failed to load surveys.
        </StatusMessage>
      )}

      <Tabs value={tab} onValueChange={value => setTab(value as SurveyTab)}>
        <TabsList>
          <TabsTrigger value="live">Active</TabsTrigger>
          <TabsTrigger value="draft">Drafts and retired</TabsTrigger>
        </TabsList>
        <TabsContent value={tab}>
          <ListPanel>
            <ListScroll>
              {isLoading ? (
                <div className="px-5 py-8">
                  <Loading size={LoadingSizes.Medium} />
                </div>
              ) : currentList.length === 0 ? (
                <div className="px-5 py-8">
                  <Text type={TextTypes.Body5} center>
                    No surveys in this tab. Create one to start collecting
                    feedback.
                  </Text>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Audience</TableHead>
                      <TableHead className="w-40 text-center">
                        Questions
                      </TableHead>
                      <TableHead className="w-44 text-center">
                        Time Window
                      </TableHead>
                      <TableHead className="w-44 text-center">
                        Eligible after
                      </TableHead>
                      <TableHead className="w-40 text-center">
                        Eligibility valid from
                      </TableHead>
                      <TableHead className="w-36 text-center">
                        Repeats
                      </TableHead>
                      <TableHead className="w-36 text-center">
                        Delivered
                      </TableHead>
                      <TableHead className="w-36 text-center">
                        Answered
                      </TableHead>
                      <TableHead className="w-28 text-center">Rating</TableHead>
                      <TableHead className="w-28 text-center">Status</TableHead>
                      <TableHead className="w-[5.5rem] text-center">
                        Edit
                      </TableHead>
                      <TableHead className="w-40 text-center">
                        Responses
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentList.map(campaign => (
                      <TableRow key={campaign.id}>
                        <TableCell>{campaign.name || campaign.slug}</TableCell>
                        <TableCell>{describeAudience(campaign)}</TableCell>
                        <TableCell className="text-center">
                          {campaign.questions.length}
                        </TableCell>
                        <TableCell className="text-center">
                          {formatWindow(campaign)}
                        </TableCell>
                        <TableCell className="text-center">
                          {describeEligibleAfter(
                            campaign,
                            options?.eligible_after_events,
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {describeEligibleSince(campaign)}
                        </TableCell>
                        <TableCell className="text-center">
                          {describeRepeat(campaign)}
                        </TableCell>
                        <TableCell className="text-center">
                          {describeDelivery(campaign)}
                        </TableCell>
                        <TableCell className="text-center">
                          {describeResponses(campaign)}
                        </TableCell>
                        <TableCell className="text-center">
                          {campaign.mean_rating
                            ? campaign.mean_rating.toFixed(2)
                            : '—'}
                        </TableCell>
                        <TableCell className="text-center">
                          {campaign.active ? (
                            <Tag appearance={TagAppearance.success}>Active</Tag>
                          ) : (
                            <Tag appearance={TagAppearance.outline}>
                              {campaign.missing_copy.length
                                ? 'Incomplete'
                                : 'Inactive'}
                            </Tag>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variation={ButtonVariations.Circle}
                            appearance={ButtonAppearance.Secondary}
                            size={ButtonSizes.Medium}
                            onClick={() =>
                              navigate(getSurveyEditRoute(campaign.id))
                            }
                            color={theme.color.text.accent}
                          >
                            <PencilIcon
                              label="edit icon"
                              width={16}
                              height={16}
                            />
                          </Button>
                        </TableCell>
                        <TableCell className="text-center">
                          <Link to={getSurveyResponsesRoute(campaign.id)}>
                            View responses
                          </Link>
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
    </PageContainer>
  );
}

export default SurveyCampaigns;
