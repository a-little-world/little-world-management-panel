import styled from 'styled-components';

/**
 * Company-specific styling only. The editor shell — panes, section titles, dividers — is
 * shared with the course and survey editors and lives in `components/atoms/EditorShell.styles`.
 */

export const LoadingWrap = styled.div`
  padding: ${({ theme }) => theme.spacing.large};
  display: flex;
  justify-content: center;
`;

/** Name input with its Rename button beside it, inside a cohort table cell. */
export const CohortNameCell = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

/** New cohort name, slug and the Add button on one line, aligned to the inputs' base. */
export const AddCohortRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.small};
`;

/** Logo first, then the name / slug / description block; wraps under each other when narrow. */
export const DetailsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.medium};
`;

export const LogoColumn = styled.div`
  flex: 0 0 220px;
  max-width: 100%;
`;

export const DetailsFields = styled.div`
  flex: 1 1 320px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
`;

/** Read-only logo: the stored image, or a placeholder saying there is none. */
export const LogoFrame = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

export const LogoBox = styled.div`
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xsmall};
  border: 1px dashed ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.xsmall};
  background: ${({ theme }) => theme.color.surface.secondary};
`;

export const LogoImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

/** Two columns of flags where there is room, one on narrow screens. */
export const FlagGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.small};
`;

export const FlagCell = styled.div`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xsmall}
    ${({ theme }) => theme.spacing.small};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.xsmall};
`;

export const SignupLinkActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xsmall};
`;
