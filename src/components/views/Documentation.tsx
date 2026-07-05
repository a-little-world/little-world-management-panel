import {
  Select,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { Background, ReactFlow, ReactFlowProvider } from '@xyflow/react';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import useSWR from 'swr';
import issueCreateImage from '../../assets/documentation/github_issues/repo_issues_create_highlighted.png';
import projectBoardImage from '../../assets/documentation/github_issues/little_world_project_panel.png';
import issuesTabImage from '../../assets/documentation/github_issues/repo_issues_highlighed.png';
import onboardingManagementUsersPermissionsImage from '../../assets/documentation/onboarding_management_users/onboarding_management_users_relevant_permissions_labeled.png';
import preMatchingCheckOffCompleteImage from '../../assets/documentation/prematching_check_off/prematching_check_off_complete_page_censored.png';
import preMatchingCheckOffSelectionImage from '../../assets/documentation/prematching_check_off/prematching_checkoff_user_selection_preview_censored.png';
import journeyOverviewAlphaMdx from '../../content/documentation/journey-overview-alpha.mdx';
import preMatchingCheckoffsMdx from '../../content/documentation/how-pre-matching-check-offs-work.mdx';
import multiUserManagementMdx from '../../content/documentation/multi-user-management-and-management-onboarding.mdx';
import reportingBugsAndIssuesMdx from '../../content/documentation/reporting-bugs-and-issues.mdx';

import {
  ALGORITHM_ROUTE,
  DOCUMENTATION_ROUTE,
  JOURNEY_OVERVIEW_DOCUMENTATION_ROUTE,
  JOURNEY_OVERVIEW_ROUTE,
  MATCH_JOURNEY_DOCUMENTATION_ROUTE,
  MULTI_USER_MANAGEMENT_DOCUMENTATION_ROUTE,
  PRE_MATCHING_CHECKOFFS_DOCUMENTATION_ROUTE,
  PREMATCH_APPOINTMENTS_ROUTE,
  REPORTING_BUGS_DOCUMENTATION_ROUTE,
  USER_JOURNEY_DOCUMENTATION_ROUTE,
} from '../../router/routes';
import {
  dataFetcher,
  useFilterOptions,
  useMatchesFilterOptions,
  usePrematchAppointmentsListData,
  usePrematchingAppointmentsFilterOptions,
} from '../../store';
import { buildGraph, JourneyPayload } from './JourneyOverview';

import '@xyflow/react/dist/style.css';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../atoms/Table';
import ManagementUserInlineLink from '../atoms/ManagementUserInlineLink';

interface DocumentationLink {
  id: string;
  title: string;
  description: string;
  route: string;
}

interface JourneyListDocumentationRow {
  name: string;
  description: string | null;
  source_file: string | null;
  source_line: number | null;
  source_url: string | null;
}

const DocumentationContainer = styled.div`
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

const DocumentationHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.large};
  text-align: center;
`;

const DocumentationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.large};
`;

const DocumentationCard = styled(Link)`
  display: block;
  background: ${({ theme }) => theme.color.surface.primary};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.medium};
  padding: ${({ theme }) => theme.spacing.large};
  transition: all 0.2s ease;
  text-decoration: none;
  color: inherit;

  &:hover {
    border-color: ${({ theme }) => theme.color.border.selected};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
    text-decoration: none;
    color: inherit;
  }

  &:active {
    transform: translateY(0);
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.color.border.selected};
    outline-offset: 2px;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

const CardTitle = styled(Text)`
  color: ${({ theme }) => theme.color.text.primary};
  font-weight: 600;
`;

const CardDescription = styled(Text)`
  color: ${({ theme }) => theme.color.text.secondary};
  line-height: 1.6;
`;

const DocumentationPageContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium};
`;

const DocumentationPageTopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.small};
`;

const DemoPanel = styled.section`
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.small};
  background: ${({ theme }) => theme.color.surface.secondary};
  padding: ${({ theme }) => theme.spacing.medium};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
`;

const DemoHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.small};
`;

const OpenAppointmentsButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.small};
  padding: ${({ theme }) => theme.spacing.xxxsmall}
    ${({ theme }) => theme.spacing.xsmall};
  color: ${({ theme }) => theme.color.text.secondary};
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: 0.7rem;
  font-weight: 600;

  &:hover {
    color: ${({ theme }) => theme.color.text.primary};
    border-color: ${({ theme }) => theme.color.border.selected};
  }
`;

const DemoControls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.small};
`;

const DemoSelect = styled(Select)`
  min-width: 280px;

  div[data-radix-popper-content-wrapper] {
    z-index: 30 !important;
  }
`;

const DemoImageRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.small};

  @media (max-width: ${({ theme }) => theme.breakpoints.medium}) {
    grid-template-columns: 1fr;
  }
`;

const JourneyOverviewOpenButton = styled(Link)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.medium};
  padding: ${({ theme }) => theme.spacing.medium};
  background: ${({ theme }) => theme.color.surface.secondary};
  text-decoration: none;
  color: inherit;

  &:hover {
    border-color: ${({ theme }) => theme.color.border.selected};
  }
`;

const JourneyPreview = styled.div`
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.small};
  padding: 0;
  background: ${({ theme }) => theme.color.surface.primary};
  overflow: hidden;
  height: 220px;

  .react-flow__attribution {
    display: none;
  }
`;

const JourneyPreviewMessage = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.small};
`;

const BackToDocumentationLink = styled(Link)`
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
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

const ViewOnGitHubButton = styled.a`
  display: inline-flex;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.small};
  padding: ${({ theme }) => theme.spacing.xxxsmall}
    ${({ theme }) => theme.spacing.xsmall};
  color: ${({ theme }) => theme.color.text.secondary};
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: 0.7rem;
  font-weight: 600;

  &:hover {
    color: ${({ theme }) => theme.color.text.primary};
    border-color: ${({ theme }) => theme.color.border.selected};
  }
`;

const ReportingPagePanel = styled.section`
  background: ${({ theme }) => theme.color.surface.primary};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.medium};
  padding: ${({ theme }) => theme.spacing.large};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.large};
`;

const ReportingMainTitle = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.color.text.primary};
  font-size: 2rem;
  line-height: 1.2;
`;

const MarkdownDocument = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium};

  h1,
  h2,
  p,
  ul,
  pre {
    margin: 0;
  }

  h2 {
    color: ${({ theme }) => theme.color.text.primary};
    font-size: 1.625rem;
    line-height: 1.25;
    margin-top: ${({ theme }) => theme.spacing.small};
  }

  p,
  li {
    color: ${({ theme }) => theme.color.text.primary};
    line-height: 1.6;
  }

  ul {
    list-style: disc;
    list-style-position: outside;
    padding-left: ${({ theme }) => theme.spacing.medium};
  }

  li + li {
    margin-top: ${({ theme }) => theme.spacing.xxsmall};
  }

  pre {
    border: 1px solid ${({ theme }) => theme.color.border.subtle};
    border-radius: ${({ theme }) => theme.radius.small};
    background: ${({ theme }) => theme.color.surface.secondary};
    padding: ${({ theme }) => theme.spacing.small};
    overflow-x: auto;
  }

  code {
    color: ${({ theme }) => theme.color.text.primary};
    font-size: 0.875rem;
  }

  a {
    color: ${({ theme }) => theme.color.text.primary};
    font-weight: 600;
    text-decoration: underline;
    text-underline-offset: ${({ theme }) => theme.spacing.xxxsmall};
  }

  a:hover {
    color: ${({ theme }) => theme.color.text.secondary};
  }
`;

const VisualGuideCard = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
`;

const InlineIssueImages = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.medium};

  @media (max-width: ${({ theme }) => theme.breakpoints.medium}) {
    grid-template-columns: 1fr;
  }
`;

const heartbeat = keyframes`
  0% {
    opacity: 0.45;
    transform: scale(0.995);
  }

  50% {
    opacity: 0.8;
    transform: scale(1);
  }

  100% {
    opacity: 0.45;
    transform: scale(0.995);
  }
`;

const GuideImageFrame = styled.div<{
  $loaded: boolean;
  $maxWidth?: string;
  $minHeight?: string;
}>`
  position: relative;
  width: 100%;
  max-width: ${({ $maxWidth }) => $maxWidth ?? 'none'};
  min-height: ${({ $loaded, $minHeight }) =>
    $loaded ? '0' : ($minHeight ?? '220px')};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.small};
  overflow: hidden;
  background: ${({ theme }) => theme.color.surface.secondary};
`;

const GuideImageSkeleton = styled.div`
  position: absolute;
  inset: 0;
  background: ${({ theme }) => theme.color.surface.secondary};
  animation: ${heartbeat} 1.4s ease-in-out infinite;
`;

const GuideImage = styled.img<{ $loaded: boolean }>`
  width: 100%;
  height: auto;
  display: block;
  opacity: ${({ $loaded }) => ($loaded ? 1 : 0)};
  transition: opacity 0.2s ease;
`;

const DocumentationImageWithPlaceholder = ({
  src,
  alt,
  maxWidth,
  minHeight,
}: {
  src: string;
  alt: string;
  maxWidth?: string;
  minHeight?: string;
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);

  return (
    <GuideImageFrame
      $loaded={isLoaded}
      $maxWidth={maxWidth}
      $minHeight={minHeight}
    >
      {!isLoaded && <GuideImageSkeleton />}
      <GuideImage
        src={src}
        alt={alt}
        $loaded={isLoaded}
        onLoad={() => setIsLoaded(true)}
      />
    </GuideImageFrame>
  );
};

const MANAGEMENT_USER_MENTION_RE =
  /@([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;

const renderTextWithMentions = (text: string, keyPrefix: string) => {
  const matches = [...text.matchAll(MANAGEMENT_USER_MENTION_RE)];
  if (!matches.length) {
    return text;
  }

  const output: React.ReactNode[] = [];
  let cursor = 0;

  matches.forEach((match, index) => {
    const mentionStart = match.index ?? 0;
    const mentionText = match[0];
    const email = match[1];

    if (mentionStart > cursor) {
      output.push(text.slice(cursor, mentionStart));
    }

    output.push(
      <ManagementUserInlineLink
        key={`${keyPrefix}-${email}-${index}`}
        email={email}
        tab="chat"
      />,
    );

    cursor = mentionStart + mentionText.length;
  });

  if (cursor < text.length) {
    output.push(text.slice(cursor));
  }

  return output;
};

const renderMentionsInNode = (
  node: React.ReactNode,
  keyPrefix: string,
): React.ReactNode => {
  if (typeof node === 'string') {
    return renderTextWithMentions(node, keyPrefix);
  }

  if (Array.isArray(node)) {
    const output: React.ReactNode[] = [];

    const appendNode = (value: React.ReactNode) => {
      if (Array.isArray(value)) {
        output.push(...value);
      } else {
        output.push(value);
      }
    };

    const getMailtoEmail = (child: React.ReactNode) => {
      if (!React.isValidElement<any>(child)) {
        return null;
      }

      const props = child.props as { href?: unknown };
      const href = props.href;
      if (typeof href !== 'string' || !href.startsWith('mailto:')) {
        return null;
      }

      return decodeURIComponent(href.replace('mailto:', '')).trim();
    };

    for (let index = 0; index < node.length; index += 1) {
      const child = node[index];
      const nextChild = node[index + 1];

      if (typeof child === 'string') {
        const nextEmail = getMailtoEmail(nextChild);
        if (child === '@' && nextEmail) {
          appendNode(
            <ManagementUserInlineLink
              key={`${keyPrefix}-mailto-${nextEmail}-${index}`}
              email={nextEmail}
              tab="chat"
            />,
          );
          index += 1;
          continue;
        }

        appendNode(renderTextWithMentions(child, `${keyPrefix}-${index}`));
        continue;
      }

      const mailtoEmail = getMailtoEmail(child);
      if (mailtoEmail) {
        const lastOutputIndex = output.length - 1;
        const lastOutput = output[lastOutputIndex];

        if (typeof lastOutput === 'string' && lastOutput.endsWith('@')) {
          output[lastOutputIndex] = lastOutput.slice(0, -1);
        }

        appendNode(
          <ManagementUserInlineLink
            key={`${keyPrefix}-mailto-${mailtoEmail}-${index}`}
            email={mailtoEmail}
            tab="chat"
          />,
        );
        continue;
      }

      appendNode(renderMentionsInNode(child, `${keyPrefix}-${index}`));
    }

    return output;
  }

  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return React.cloneElement(node, {
      ...node.props,
      children: renderMentionsInNode(node.props.children, `${keyPrefix}-child`),
    });
  }

  return node;
};

const reportingMarkdownComponents: any = {
  p: ({ children, ...props }: { children: React.ReactNode }) => (
    <p {...props}>{renderMentionsInNode(children, 'paragraph')}</p>
  ),
  li: ({ children, ...props }: { children: React.ReactNode }) => (
    <li {...props}>{renderMentionsInNode(children, 'list-item')}</li>
  ),
  a: ({ href, children, ...props }: any) => {
    if (typeof href === 'string' && href.startsWith('/')) {
      return <Link to={href}>{children}</Link>;
    }

    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  },
};

const markdownLinkComponents: any = {
  a: ({ href, children, ...props }: any) => {
    if (typeof href === 'string' && href.startsWith('/')) {
      return <Link to={href}>{children}</Link>;
    }

    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  },
};

const REPORTING_BUGS_MDX_URL =
  'https://github.com/a-little-world/little-world-management-panel/blob/main/src/content/documentation/reporting-bugs-and-issues.mdx';
const PRE_MATCHING_CHECKOFFS_MDX_URL =
  'https://github.com/a-little-world/little-world-management-panel/blob/main/src/content/documentation/how-pre-matching-check-offs-work.mdx';
const JOURNEY_OVERVIEW_ALPHA_MDX_URL =
  'https://github.com/a-little-world/little-world-management-panel/blob/main/src/content/documentation/journey-overview-alpha.mdx';
const MULTI_USER_MANAGEMENT_MDX_URL =
  'https://github.com/a-little-world/little-world-management-panel/blob/main/src/content/documentation/multi-user-management-and-management-onboarding.mdx';

const PREMATCH_ORDERING_OPTIONS = [
  { value: 'start_time', label: '(Asc) Starts At' },
  { value: '-start_time', label: '(Desc) Starts At' },
];

function PreMatchingLiveSelectorDemo() {
  const [selectedList, setSelectedList] = React.useState('all');
  const [orderBy, setOrderBy] = React.useState('-start_time');
  const { filterOptions, isLoading: isLoadingFilters } =
    usePrematchingAppointmentsFilterOptions();

  const query = React.useMemo(() => {
    const params = new URLSearchParams({
      list: selectedList,
      order_by: orderBy,
      page_size: '20',
    });
    return params.toString();
  }, [selectedList, orderBy]);

  const openAppointmentsLink = `${PREMATCH_APPOINTMENTS_ROUTE}?${query}`;

  const { prematchAppointmentsList, isLoading } =
    usePrematchAppointmentsListData(query);

  const listOptions =
    filterOptions?.lists?.map((item: { name: string; description: string }) => ({
      value: item.name,
      label: item.description,
    })) ?? [];

  const appointments = prematchAppointmentsList?.results ?? [];

  return (
    <DemoPanel>
      <DemoHeaderRow>
        <Text type={TextTypes.Heading4} tag="h3">
          Live Pre-Matching Selector (same backend API)
        </Text>
        <OpenAppointmentsButton to={openAppointmentsLink}>
          Open appointment
        </OpenAppointmentsButton>
      </DemoHeaderRow>
      <Text type={TextTypes.Body6}>
        This demo uses `/api/matching/prematchingappointments/filters/` and
        `/api/matching/prematchingappointments/` directly.
      </Text>

      <DemoControls>
        <DemoSelect
          value={selectedList}
          options={listOptions}
          onValueChange={setSelectedList}
          placeholder="Select appointment date/time"
          cannotError
        />
        <DemoSelect
          value={orderBy}
          options={PREMATCH_ORDERING_OPTIONS}
          onValueChange={setOrderBy}
          placeholder="Order by"
          cannotError
        />
      </DemoControls>

      {(isLoadingFilters || isLoading) && (
        <Text type={TextTypes.Body6}>Loading appointment data...</Text>
      )}

      {!isLoading && appointments.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Starts At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.slice(0, 5).map((appointment: any) => (
              <TableRow key={appointment.uuid}>
                <TableCell>
                  {appointment.user?.profile?.first_name}{' '}
                  {appointment.user?.profile?.second_name}
                </TableCell>
                <TableCell>{appointment.user?.email}</TableCell>
                <TableCell>{appointment.start_time}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {!isLoading && appointments.length === 0 && (
        <Text type={TextTypes.Body6}>
          No appointments found for this selection.
        </Text>
      )}
    </DemoPanel>
  );
}

function JourneyOverviewGraphPreview() {
  const { data, error, isLoading } = useSWR<JourneyPayload>(
    '/api/matching/journeys/overview/',
    dataFetcher,
  );
  const graph = React.useMemo(() => buildGraph(data), [data]);

  const previewNodes = React.useMemo(
    () =>
      graph.nodes.map(node => ({
        id: node.id,
        position: {
          x: node.position.x * 0.24,
          y: node.position.y * 0.24,
        },
        draggable: false,
        selectable: false,
        data: {
          label: (node.data as any)?.step?.title || node.id,
        },
      })),
    [graph.nodes],
  );

  const previewEdges = React.useMemo(
    () =>
      graph.edges.map(edge => ({
        ...edge,
        label: undefined,
      })),
    [graph.edges],
  );

  if (isLoading) {
    return (
      <JourneyPreview>
        <JourneyPreviewMessage>
          <Text type={TextTypes.Body7}>Loading preview...</Text>
        </JourneyPreviewMessage>
      </JourneyPreview>
    );
  }

  if (error || !previewNodes.length) {
    return (
      <JourneyPreview>
        <JourneyPreviewMessage>
          <Text type={TextTypes.Body7}>Preview not available yet.</Text>
        </JourneyPreviewMessage>
      </JourneyPreview>
    );
  }

  return (
    <JourneyPreview>
      <ReactFlowProvider>
        <ReactFlow
          nodes={previewNodes}
          edges={previewEdges}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.05}
          maxZoom={1}
          nodesConnectable={false}
          nodesDraggable={false}
          elementsSelectable={false}
          zoomOnScroll={false}
          panOnScroll={false}
          panOnDrag={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={22} />
        </ReactFlow>
      </ReactFlowProvider>
    </JourneyPreview>
  );
}

const TablePanel = styled.div`
  overflow-x: auto;
`;

const ListReferenceCell = styled.div`
  display: flex;
  min-width: 280px;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
`;

const InlineLink = styled.a`
  color: ${({ theme }) => theme.color.text.primary};
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: ${({ theme }) => theme.spacing.xxxsmall};

  &:hover {
    color: ${({ theme }) => theme.color.text.secondary};
  }
`;

const SourceLink = styled(InlineLink)`
  color: ${({ theme }) => theme.color.text.secondary};
  font-size: 0.75rem;
  font-weight: 500;
`;

const RouteBadge = styled.span`
  background: ${({ theme }) => theme.color.surface.secondary};
  color: ${({ theme }) => theme.color.text.secondary};
  padding: ${({ theme }) => theme.spacing.xsmall}
    ${({ theme }) => theme.spacing.small};
  border-radius: ${({ theme }) => theme.radius.small};
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const documentationLinks: DocumentationLink[] = [
  {
    id: 'algorithm',
    title: 'Matching Algorithm',
    description:
      'Comprehensive guide to our custom matching algorithm that pairs learners with volunteers. Learn about scoring elements including gender preferences, time slot overlap, language levels, interests, and distance calculations. Understand how we achieve maximum cardinality matching to optimize successful pairings.',
    route: ALGORITHM_ROUTE,
  },
  {
    id: 'journey-overview-alpha',
    title: 'User & Match Journey Overview (Alpha)',
    description:
      'Preview the new alpha journey overview for user and match lifecycle insights.',
    route: JOURNEY_OVERVIEW_DOCUMENTATION_ROUTE,
  },
  {
    id: 'user-journey',
    title: 'User Journey Documentation',
    description:
      'All user list filters from the backend registry, including descriptions, source references, and direct links into the matching users page.',
    route: USER_JOURNEY_DOCUMENTATION_ROUTE,
  },
  {
    id: 'match-journey',
    title: 'Match Journey Documentation',
    description:
      'All match list filters from the backend registry, including descriptions, source references, and direct links into the matching matches page.',
    route: MATCH_JOURNEY_DOCUMENTATION_ROUTE,
  },
  {
    id: 'reporting-bugs-and-issues',
    title: 'Reporting Bugs and Issues',
    description:
      'How to report bugs in the open-source repository and where to file sensitive internal issues.',
    route: REPORTING_BUGS_DOCUMENTATION_ROUTE,
  },
  {
    id: 'pre-matching-check-offs',
    title: 'How Pre-Matching Check-offs Work',
    description:
      'How attendee check-offs update onboarding state and trigger follow-up emails in the pre-matching flow.',
    route: PRE_MATCHING_CHECKOFFS_DOCUMENTATION_ROUTE,
  },
  {
    id: 'multi-user-management-and-management-onboarding',
    title: 'Multi User Management and Management Onboarding',
    description:
      'Step-by-step process for onboarding management users and assigning required panel permissions.',
    route: MULTI_USER_MANAGEMENT_DOCUMENTATION_ROUTE,
  },
];

const getListUrl = (target: 'users' | 'matches', listId: string) => {
  const params = new URLSearchParams({
    order_by: target === 'users' ? '-date_joined' : '-created_at',
    page_size: '50',
    list: listId,
  });
  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  return `${origin}/matching/${target}/?${params.toString()}`;
};

function JourneyListDocumentationTable({
  rows,
  target,
}: {
  rows: JourneyListDocumentationRow[];
  target: 'users' | 'matches';
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>list_id / Code reference</TableHead>
          <TableHead>List description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length ? (
          rows.map(row => (
            <TableRow key={row.name}>
              <TableCell>
                <ListReferenceCell>
                  <InlineLink href={getListUrl(target, row.name)}>
                    {row.name}
                  </InlineLink>
                  {row.source_url ? (
                    <SourceLink
                      href={row.source_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {row.source_file}:L{row.source_line}
                    </SourceLink>
                  ) : (
                    <Text type={TextTypes.Body7} tag="span">
                      No source reference
                    </Text>
                  )}
                </ListReferenceCell>
              </TableCell>
              <TableCell>
                <Text type={TextTypes.Body6} tag="span">
                  {row.description || 'No description available'}
                </Text>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={2}>No lists found.</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

function JourneyListDocumentationPage({
  title,
  description,
  rows,
  target,
  isLoading,
  error,
}: {
  title: string;
  description: string;
  rows: JourneyListDocumentationRow[];
  target: 'users' | 'matches';
  isLoading: boolean;
  error: unknown;
}) {
  return (
    <DocumentationContainer>
      <DocumentationPageContent>
        <BackToDocumentationLink to={DOCUMENTATION_ROUTE}>
          {'<- Back to Documentation'}
        </BackToDocumentationLink>
        <DocumentationHeader>
          <Text type={TextTypes.Heading3} tag="h1">
            {title}
          </Text>
          <Text type={TextTypes.Body4}>{description}</Text>
        </DocumentationHeader>

        {isLoading && (
          <Text type={TextTypes.Body5}>Loading documentation...</Text>
        )}
        {Boolean(error) && (
          <Text type={TextTypes.Body5}>
            Could not load documentation from the backend.
          </Text>
        )}
        {!isLoading && !error && (
          <TablePanel>
            <JourneyListDocumentationTable rows={rows} target={target} />
          </TablePanel>
        )}
      </DocumentationPageContent>
    </DocumentationContainer>
  );
}

export const Documentation: React.FC = () => {
  return (
    <DocumentationContainer>
      <DocumentationHeader>
        <Text type={TextTypes.Body4}>
          Explore our comprehensive documentation to understand how our system
          works
        </Text>
      </DocumentationHeader>

      <DocumentationList>
        {documentationLinks.map(link => (
          <DocumentationCard key={link.id} to={link.route}>
            <CardHeader>
              <CardTitle type={TextTypes.Heading4} tag="h3">
                {link.title}
              </CardTitle>
              <RouteBadge>{link.route}</RouteBadge>
            </CardHeader>
            <CardDescription type={TextTypes.Body5}>
              {link.description}
            </CardDescription>
          </DocumentationCard>
        ))}
      </DocumentationList>
    </DocumentationContainer>
  );
};

export const UserJourneyDocumentation: React.FC = () => {
  const { filterOptions, isLoading, error } = useFilterOptions();

  return (
    <JourneyListDocumentationPage
      title="User Journey Documentation"
      description="Registered user lists from the backend matching panel filter registry. Click a list_id to open that list in the users table."
      rows={filterOptions?.lists || []}
      target="users"
      isLoading={isLoading}
      error={error}
    />
  );
};

export const MatchJourneyDocumentation: React.FC = () => {
  const { filterOptions, isLoading, error } = useMatchesFilterOptions();

  return (
    <JourneyListDocumentationPage
      title="Match Journey Documentation"
      description="Registered match lists from the backend match journey registry. Click a list_id to open that list in the matches table."
      rows={filterOptions?.lists || []}
      target="matches"
      isLoading={isLoading}
      error={error}
    />
  );
};

export const JourneyOverviewDocumentation: React.FC = () => {
  return (
    <DocumentationContainer>
      <DocumentationPageContent>
        <DocumentationPageTopRow>
          <BackToDocumentationLink to={DOCUMENTATION_ROUTE}>
            {'<- Back to Documentation'}
          </BackToDocumentationLink>
          <ViewOnGitHubButton
            href={JOURNEY_OVERVIEW_ALPHA_MDX_URL}
            target="_blank"
            rel="noreferrer"
          >
            View on GitHub
          </ViewOnGitHubButton>
        </DocumentationPageTopRow>
        <ReportingPagePanel>
          <MarkdownDocument>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownLinkComponents}
            >
              {journeyOverviewAlphaMdx}
            </ReactMarkdown>
          </MarkdownDocument>

          <JourneyOverviewOpenButton to={JOURNEY_OVERVIEW_ROUTE}>
            <Text type={TextTypes.Heading4} tag="span">
              Open Journey Overview
            </Text>
            <JourneyOverviewGraphPreview />
          </JourneyOverviewOpenButton>
        </ReportingPagePanel>
      </DocumentationPageContent>
    </DocumentationContainer>
  );
};

export const ReportingBugsAndIssuesDocumentation: React.FC = () => {
  return (
    <DocumentationContainer>
      <DocumentationPageContent>
        <DocumentationPageTopRow>
          <BackToDocumentationLink to={DOCUMENTATION_ROUTE}>
            {'<- Back to Documentation'}
          </BackToDocumentationLink>
          <ViewOnGitHubButton
            href={REPORTING_BUGS_MDX_URL}
            target="_blank"
            rel="noreferrer"
          >
            View on GitHub
          </ViewOnGitHubButton>
        </DocumentationPageTopRow>
        <ReportingPagePanel>
          <VisualGuideCard>
            <ReportingMainTitle>
              Reporting Bugs and Issues on GitHub
            </ReportingMainTitle>
            <Text type={TextTypes.Body5}>
              Use the repository Issues tab and then the create issue button.
            </Text>
            <InlineIssueImages>
              <DocumentationImageWithPlaceholder
                src={issuesTabImage}
                alt="Repository navigation with Issues tab highlighted"
                maxWidth="440px"
                minHeight="160px"
              />
              <DocumentationImageWithPlaceholder
                src={issueCreateImage}
                alt="Repository issues page with Create issue button highlighted"
                maxWidth="440px"
                minHeight="160px"
              />
            </InlineIssueImages>
          </VisualGuideCard>

          <MarkdownDocument>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={reportingMarkdownComponents}
            >
              {reportingBugsAndIssuesMdx}
            </ReactMarkdown>
          </MarkdownDocument>

          <DocumentationImageWithPlaceholder
            src={projectBoardImage}
            alt="Little World GitHub project board overview"
            maxWidth="860px"
            minHeight="260px"
          />

        </ReportingPagePanel>
      </DocumentationPageContent>
    </DocumentationContainer>
  );
};

export default Documentation;

export const MultiUserManagementDocumentation: React.FC = () => {
  return (
    <DocumentationContainer>
      <DocumentationPageContent>
        <DocumentationPageTopRow>
          <BackToDocumentationLink to={DOCUMENTATION_ROUTE}>
            {'<- Back to Documentation'}
          </BackToDocumentationLink>
          <ViewOnGitHubButton
            href={MULTI_USER_MANAGEMENT_MDX_URL}
            target="_blank"
            rel="noreferrer"
          >
            View on GitHub
          </ViewOnGitHubButton>
        </DocumentationPageTopRow>
        <ReportingPagePanel>
          <MarkdownDocument>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownLinkComponents}
            >
              {multiUserManagementMdx}
            </ReactMarkdown>
          </MarkdownDocument>

          <DocumentationImageWithPlaceholder
            src={onboardingManagementUsersPermissionsImage}
            alt="Labeled management user permission settings"
            maxWidth="920px"
            minHeight="260px"
          />
        </ReportingPagePanel>
      </DocumentationPageContent>
    </DocumentationContainer>
  );
};

export const PreMatchingCheckoffsDocumentation: React.FC = () => {
  return (
    <DocumentationContainer>
      <DocumentationPageContent>
        <DocumentationPageTopRow>
          <BackToDocumentationLink to={DOCUMENTATION_ROUTE}>
            {'<- Back to Documentation'}
          </BackToDocumentationLink>
          <ViewOnGitHubButton
            href={PRE_MATCHING_CHECKOFFS_MDX_URL}
            target="_blank"
            rel="noreferrer"
          >
            View on GitHub
          </ViewOnGitHubButton>
        </DocumentationPageTopRow>
        <ReportingPagePanel>
          <MarkdownDocument>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownLinkComponents}
            >
              {preMatchingCheckoffsMdx}
            </ReactMarkdown>
          </MarkdownDocument>

          <PreMatchingLiveSelectorDemo />

          <DemoImageRow>
            <DocumentationImageWithPlaceholder
              src={preMatchingCheckOffCompleteImage}
              alt="Prematching check-off page overview"
              maxWidth="520px"
              minHeight="180px"
            />
            <DocumentationImageWithPlaceholder
              src={preMatchingCheckOffSelectionImage}
              alt="Prematching user selection and confirmation preview"
              maxWidth="520px"
              minHeight="180px"
            />
          </DemoImageRow>
        </ReportingPagePanel>
      </DocumentationPageContent>
    </DocumentationContainer>
  );
};
