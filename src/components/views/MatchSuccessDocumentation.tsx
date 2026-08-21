import {
  ArrowLeftIcon,
  Select,
  Tag,
  TagAppearance,
  TagSizes,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import useSWR from 'swr';

import {
  MATCH_SUCCESS_DOCS_URL,
  type MatchSuccessDocumentation as MatchSuccessDocumentationPayload,
  type MatchSuccessVersionDocs,
} from '../../api/matchSuccess';
import { DOCUMENTATION_ROUTE } from '../../router/routes';
import { dataFetcher } from '../../store';
import LoadingSpinner from '../atoms/LoadingSpinner';

const Page = styled.div`
  flex: 1;
  min-height: 0;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
  padding: ${({ theme }) => theme.spacing.large};
  max-width: 1200px;
  margin: 0 auto;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium};
`;

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.small};
  text-align: center;
`;

const BackLink = styled(Link)`
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxsmall};
  padding: ${({ theme }) => theme.spacing.xxxsmall}
    ${({ theme }) => theme.spacing.xsmall};
  border-radius: ${({ theme }) => theme.radius.small};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  color: ${({ theme }) => theme.color.text.secondary};
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.color.text.primary};
    border-color: ${({ theme }) => theme.color.border.selected};
  }
`;

const Panel = styled.section`
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.small};
  background: ${({ theme }) => theme.color.surface.primary};
  padding: ${({ theme }) => theme.spacing.medium};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.small};
  flex-wrap: wrap;
`;

const VersionSelect = styled(Select)`
  min-width: 280px;
  max-width: 100%;
`;

const CriteriaList = styled.dl`
  display: grid;
  grid-template-columns: minmax(8rem, max-content) 1fr;
  column-gap: ${({ theme }) => theme.spacing.medium};
  row-gap: ${({ theme }) => theme.spacing.xxsmall};
  margin: 0;
`;

const CriteriaTerm = styled(Text).attrs({
  tag: 'dt' as const,
  type: TextTypes.Body6,
})`
  color: ${({ theme }) => theme.color.text.secondary};
`;

const CriteriaValue = styled(Text).attrs({
  tag: 'dd' as const,
  type: TextTypes.Body6,
  bold: true,
})`
  margin: 0;
`;

const BandTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const BandHeadCell = styled.th`
  text-align: left;
  padding: ${({ theme }) => theme.spacing.xxsmall} 0;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.subtle};
  color: ${({ theme }) => theme.color.text.secondary};
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const BandCell = styled.td`
  padding: ${({ theme }) => theme.spacing.xxsmall} 0;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.subtle};
`;

const ErrorText = styled(Text)`
  color: ${({ theme }) => theme.color.text.error};
`;

function versionOptions(versions: MatchSuccessVersionDocs[]) {
  return versions.map(version => ({
    value: version.id,
    label: version.is_active
      ? `${version.id} — ${version.title} (active)`
      : `${version.id} — ${version.title}`,
  }));
}

function VersionDetails({ version }: { version: MatchSuccessVersionDocs }) {
  const { details } = version;
  const bands = details.token_bands;
  const heuristicRows = [
    details.min_mutual_messages != null && {
      term: 'Min mutual messages',
      value: String(details.min_mutual_messages),
    },
    details.min_mutual_video_calls != null && {
      term: 'Min mutual video calls',
      value: String(details.min_mutual_video_calls),
    },
    details.contact_span_days != null && {
      term: 'Contact span',
      value: `${details.contact_span_days} days`,
    },
    details.days_since_last_interaction != null && {
      term: 'Days since last interaction',
      value: String(details.days_since_last_interaction),
    },
  ].filter(Boolean) as { term: string; value: string }[];

  return (
    <>
      <Text>{version.description}</Text>
      {version.uses_tokens && version.success_token_threshold != null && (
        <Text type={TextTypes.Body6}>
          Success token threshold: {version.success_token_threshold}
          {details.success_minutes != null
            ? ` (≥ ${details.success_minutes} minutes of qualifying calls, or off-platform completion)`
            : ''}
        </Text>
      )}
      {!version.can_be_active && (
        <Text>
          Comparison only — this version cannot be selected as the production
          rule.
        </Text>
      )}
      {bands && bands.length > 0 && (
        <BandTable>
          <thead>
            <tr>
              <BandHeadCell>Total qualifying minutes</BandHeadCell>
              <BandHeadCell>Tokens</BandHeadCell>
            </tr>
          </thead>
          <tbody>
            <tr>
              <BandCell>
                <Text type={TextTypes.Body6}>Below {bands[0].min_minutes}</Text>
              </BandCell>
              <BandCell>
                <Text type={TextTypes.Body6}>0</Text>
              </BandCell>
            </tr>
            {bands.map(band => {
              const isSuccess =
                version.success_token_threshold != null &&
                band.tokens === version.success_token_threshold;
              return (
                <tr key={`${band.min_minutes}-${band.tokens}`}>
                  <BandCell>
                    <Text
                      type={TextTypes.Body6}
                    >{`≥ ${band.min_minutes}`}</Text>
                  </BandCell>
                  <BandCell>
                    <Text type={TextTypes.Body6}>
                      {band.tokens}
                      {isSuccess ? ' (success threshold)' : ''}
                    </Text>
                  </BandCell>
                </tr>
              );
            })}
            {details.minutes_per_token_after_success != null && (
              <tr>
                <BandCell>
                  <Text type={TextTypes.Body6}>
                    Each further {details.minutes_per_token_after_success}{' '}
                    minutes after the success threshold
                  </Text>
                </BandCell>
                <BandCell>
                  <Text type={TextTypes.Body6}>+1</Text>
                </BandCell>
              </tr>
            )}
          </tbody>
        </BandTable>
      )}
      {heuristicRows.length > 0 && (
        <CriteriaList>
          {heuristicRows.map(row => (
            <React.Fragment key={row.term}>
              <CriteriaTerm>{row.term}</CriteriaTerm>
              <CriteriaValue>{row.value}</CriteriaValue>
            </React.Fragment>
          ))}
        </CriteriaList>
      )}
    </>
  );
}

export const MatchSuccessDocumentation: React.FC = () => {
  const { data, error, isLoading } = useSWR<MatchSuccessDocumentationPayload>(
    MATCH_SUCCESS_DOCS_URL,
    dataFetcher,
  );
  const [selectedVersionId, setSelectedVersionId] = React.useState<
    string | null
  >(null);

  const activeVersion = data?.versions.find(version => version.is_active);
  const selectedVersion =
    data?.versions.find(
      version => version.id === (selectedVersionId ?? data.active_version_id),
    ) ?? activeVersion;

  if (isLoading) {
    return (
      <Page>
        <LoadingSpinner />
      </Page>
    );
  }

  if (error || !data || !activeVersion || !selectedVersion) {
    return (
      <Page>
        <ErrorText>
          Could not load match success documentation from the server.
        </ErrorText>
      </Page>
    );
  }

  return (
    <Page>
      <Content>
        <BackLink to={DOCUMENTATION_ROUTE}>
          <ArrowLeftIcon label="Back to Documentation" width={16} height={16} />
          {'Back to Documentation'}
        </BackLink>
        <Header>
          <Text type={TextTypes.Heading3} tag="h1">
            Match Success
          </Text>
        </Header>

        <Panel>
          <Text type={TextTypes.Heading5} tag="h2">
            How we measure success
          </Text>
          <Text>{data.overview}</Text>
          <Text>{data.qualifying_call_rule}</Text>
        </Panel>

        <Panel>
          <PanelHeader>
            <Text type={TextTypes.Heading5} tag="h2">
              Current active version
            </Text>
            <Tag appearance={TagAppearance.success} size={TagSizes.small}>
              {activeVersion.id} active
            </Tag>
          </PanelHeader>
          <Text bold>{activeVersion.title}</Text>
          <VersionDetails version={activeVersion} />
        </Panel>

        <Panel>
          <Text type={TextTypes.Body4} tag="h2">
            All versions
          </Text>
          <Text>
            Select a registered version to read the rule the code currently
            implements for it. New versions appear here automatically.
          </Text>
          <VersionSelect
            value={selectedVersion.id}
            options={versionOptions(data.versions)}
            onValueChange={setSelectedVersionId}
            placeholder="Select a version"
            cannotError
          />
          <PanelHeader>
            <Text bold>{selectedVersion.title}</Text>
            {selectedVersion.is_active ? (
              <Tag appearance={TagAppearance.success} size={TagSizes.small}>
                Active
              </Tag>
            ) : (
              <Tag appearance={TagAppearance.outline} size={TagSizes.small}>
                {selectedVersion.can_be_active
                  ? 'Not active'
                  : 'Comparison only'}
              </Tag>
            )}
          </PanelHeader>
          <VersionDetails version={selectedVersion} />
        </Panel>
      </Content>
    </Page>
  );
};

export default MatchSuccessDocumentation;
