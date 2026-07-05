import { Text, TextTypes } from '@a-little-world/little-world-design-system';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import reportingBugsAndIssuesMdx from '../../content/documentation/reporting-bugs-and-issues.mdx';

import {
  ALGORITHM_ROUTE,
  DOCUMENTATION_ROUTE,
  MATCH_JOURNEY_DOCUMENTATION_ROUTE,
  REPORTING_BUGS_DOCUMENTATION_ROUTE,
  USER_JOURNEY_DOCUMENTATION_ROUTE,
} from '../../router/routes';
import { useFilterOptions, useMatchesFilterOptions } from '../../store';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../atoms/Table';

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

const MarkdownDocument = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium};

  h1,
  h2,
  p,
  ul {
    margin: 0;
  }

  p,
  li {
    color: ${({ theme }) => theme.color.text.primary};
    line-height: 1.6;
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.xxsmall};
    padding-left: ${({ theme }) => theme.spacing.medium};
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
        <Link to={DOCUMENTATION_ROUTE}>Back to Documentation</Link>
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

export const ReportingBugsAndIssuesDocumentation: React.FC = () => {
  return (
    <DocumentationContainer>
      <DocumentationPageContent>
        <Link to={DOCUMENTATION_ROUTE}>Back to Documentation</Link>
        <MarkdownDocument>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {reportingBugsAndIssuesMdx}
          </ReactMarkdown>
        </MarkdownDocument>
      </DocumentationPageContent>
    </DocumentationContainer>
  );
};

export default Documentation;
