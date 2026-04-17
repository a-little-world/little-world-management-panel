import { Text, TextTypes } from '@a-little-world/little-world-design-system';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { ALGORITHM_ROUTE } from '../../router/routes';

// Types
interface DocumentationLink {
  id: string;
  title: string;
  description: string;
  route: string;
}

// Styled Components
const DocumentationContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.large};
  max-width: 800px;
  margin: 0 auto;
`;

const DocumentationHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.small};
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

// Documentation data
const documentationLinks: DocumentationLink[] = [
  {
    id: 'algorithm',
    title: 'Matching Algorithm',
    description:
      'Comprehensive guide to our custom matching algorithm that pairs learners with volunteers. Learn about scoring elements including gender preferences, time slot overlap, language levels, interests, and distance calculations. Understand how we achieve maximum cardinality matching to optimize successful pairings.',
    route: ALGORITHM_ROUTE,
  },
];

export const Documentation: React.FC = () => {
  return (
    <DocumentationContainer>
      <DocumentationHeader>
        <Text type={TextTypes.Heading3} tag="h1">
          Documentation
        </Text>
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

export default Documentation;
