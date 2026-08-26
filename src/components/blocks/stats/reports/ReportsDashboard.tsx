import { Text, TextTypes } from '@a-little-world/little-world-design-system';
import { find } from 'lodash';
import React, { useMemo } from 'react';
import { useFilterOptions } from '../../../../store';
import ReportDownloadSection from './ReportDownloadSection';
import { DashboardContainer, ReportsList } from './styles';

const FilterKeys = {
  Company: 'state__company',
} as const;

// Specific Report Components
export function UserLossStatisticDownloadBlock() {
  return (
    <ReportDownloadSection
      title="User Sign-Up Loss Statistics"
      description="This data is cleaned and buckets should be 'distinct' there is a duplication check performed by the backend, found duplicates would be outputted in 'intersecting_ids_lists' some lists maybe be ignored like 'all' they are also listed."
      apiEndpoint="/api/matching/users/statistics/user_signup_loss/"
      downloadFilename="user_signup_loss.json"
      downloadMimeType="application/json"
      showDateRange
      defaultStartDate="2021-01-01"
    />
  );
}

function MatchQualityStatisticDownloadBlock() {
  return (
    <ReportDownloadSection
      title="Match Quality Statistic"
      description="Match outcomes under the active match-success version: successful, in flight, kickoff, and did not succeed. Standard and Random Call matches only."
      apiEndpoint="/api/matching/users/statistics/match_quality/"
      downloadFilename="match_quality.json"
      downloadMimeType="application/json"
      showDateRange
      defaultStartDate="2021-01-01"
    />
  );
}

function MarketingCampaignReportDownloadBlock() {
  return (
    <ReportDownloadSection
      title="Marketing Campaign Report"
      apiEndpoint="/api/matching/users/statistics/marketing_campaign/"
      downloadFilename={(startDate, endDate) =>
        `marketing_campaign_report_${startDate}_to_${endDate}.txt`
      }
      downloadMimeType="text/plain"
      showDateRange
      defaultStartDate="2025-10-01"
      transformData={data => data?.report ?? ''}
    />
  );
}

function CompanyReportDownloadBlock() {
  const { filterOptions } = useFilterOptions();
  const companyChoices = find(
    filterOptions?.filters,
    element => element.name === FilterKeys.Company,
  )?.choices;

  const dropdownOptions = useMemo(() => {
    if (!companyChoices) return undefined;
    return companyChoices.map(
      ({ tag, value }: { tag: string; value: string }) => ({
        label: tag,
        value: value,
      }),
    );
  }, [companyChoices]);

  return (
    <ReportDownloadSection
      title="Company Report"
      description="Download a report for all users of a specific company."
      apiEndpointBuilder={company =>
        `/api/matching/users/statistics/company_users_report/${company}/`
      }
      apiParams={{ format: 'csv' }}
      downloadFilename={(startDate, endDate, selectedCompany) =>
        `company_report_${selectedCompany || 'all'}_${startDate || ''}_to_${endDate || ''}.csv`
      }
      downloadMimeType="text/csv"
      transformData={data => data?.csv ?? ''}
      showDateRange
      defaultStartDate="2025-01-01"
      dropdownOptions={dropdownOptions}
      dropdownLabel="Company"
    />
  );
}

function ShortLinkCampaignSummaryDownloadBlock() {
  return (
    <ReportDownloadSection
      title="Short-Link Campaign Summary"
      description="Clicks for mini/sinnvoll/nebenan (independent of users) plus campaign user overview with learner/volunteer split."
      apiEndpoint="/api/matching/users/statistics/short_link_campaign_summary/"
      downloadFilename={(startDate: string = '', endDate: string = '') =>
        `short_link_campaign_summary_${startDate}_to_${endDate}.txt`
      }
      downloadMimeType="text/plain"
      showDateRange
      defaultStartDate="2025-01-01"
      transformData={(data: { report?: string }) => data?.report ?? ''}
    />
  );
}

const ReportsDashboard: React.FC = () => {
  return (
    <DashboardContainer>
      <Text center type={TextTypes.Heading4} tag="h2">
        Download Center
      </Text>
      <ReportsList>
        <UserLossStatisticDownloadBlock />
        <CompanyReportDownloadBlock />
        <ShortLinkCampaignSummaryDownloadBlock />
        <MatchQualityStatisticDownloadBlock />
        <MarketingCampaignReportDownloadBlock />
      </ReportsList>
    </DashboardContainer>
  );
};

export default ReportsDashboard;
