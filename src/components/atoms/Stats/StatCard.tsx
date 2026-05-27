import styled from 'styled-components';

/**
 * Responsive grid wrapper for a row of stat cards.
 */
export const StatCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: ${({ theme }) => theme.spacing.small};
  padding: ${({ theme }) => theme.spacing.medium};
`;

/**
 * Individual stat card with a subtle tinted background.
 */
export const StatCard = styled.div`
  background: ${({ theme }) => theme.color.surface.secondary};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.small};
  padding: ${({ theme }) => theme.spacing.medium};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
`;

/**
 * Large numeric value displayed inside a stat card.
 */
export const StatValue = styled.p`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.color.text.heading};
  line-height: 1;
`;

/**
 * Small uppercase label beneath (or above) a stat value.
 */
export const StatLabel = styled.p`
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.color.text.secondary};
`;
