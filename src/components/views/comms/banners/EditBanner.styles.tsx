import { Banner, Button } from '@a-little-world/little-world-design-system';
import styled, { css } from 'styled-components';

import { FormStack as BaseFormStack } from '../../../atoms/FormLayout';

export const Container = styled.div`
  width: 100%;
  max-height: calc(100dvh - 5rem);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

export const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  padding: ${({ theme }) => theme.spacing.medium};
`;

export const EditableFields = styled.div`
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.color.surface.primary};
  border-top: 1px solid ${({ theme }) => theme.color.border.subtle};
  /* Subtle top elevation so this section reads as its own panel. */
  box-shadow:
    0 -1px 0 rgba(255, 255, 255, 0.35),
    0 -10px 24px -18px rgba(0, 0, 0, 0.24);
  padding: ${({ theme }) => theme.spacing.medium};
  padding-bottom: 0;
  ${({ theme }) => css`
    @media (min-width: ${theme.breakpoints.medium}) {
      padding: ${theme.spacing.medium} ${theme.spacing.large} 0;
    }
  `}
`;

const PREVIEW_COMPACT_SCALE = 0.6;

export const PreviewBannerFrame = styled.div<{ $compact: boolean }>`
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  width: 100%;

  ${({ $compact }) =>
    $compact &&
    css`
      width: ${PREVIEW_COMPACT_SCALE * 100}%;
      margin-left: auto;
      margin-right: auto;
    `}
`;

export const PreviewBanner = styled(Banner)<{ $compact: boolean }>`
  width: 100%;

  ${({ $compact }) =>
    $compact &&
    css`
      /* Keep large previews visually smaller without changing the actual banner props. */
      zoom: ${PREVIEW_COMPACT_SCALE};

      @supports not (zoom: 1) {
        transform: scale(${PREVIEW_COMPACT_SCALE});
        transform-origin: top center;
      }
    `}
`;

export const BackButton = styled(Button)`
  gap: ${({ theme }) => theme.spacing.xxxsmall};
  font-weight: 600;
  padding: ${({ theme }) => theme.spacing.xxsmall} !important;
  flex-shrink: 0;
  text-align: left;

  > svg {
    flex-shrink: 0;
  }
`;

export const HeaderTopRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  width: 100%;
  gap: ${({ theme }) => theme.spacing.small};
`;

export const HeaderActions = styled.div`
  justify-self: end;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.small};
`;

export const FormStack = styled(BaseFormStack)`
  width: 100%;
`;

export const TopMetaRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.medium};
  width: 100%;

  ${({ theme }) => css`
    @media (min-width: ${theme.breakpoints.medium}) {
      grid-template-columns: 1fr 1fr;
    }
  `}
`;

export const TopMetaColumn = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.medium};
  min-width: 0;

  ${({ theme }) => css`
    @media (min-width: ${theme.breakpoints.medium}) {
      grid-template-columns: auto auto;
      align-items: start;
    }
  `}
`;

export const DatesRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.medium};
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing.small};

  ${({ theme }) => css`
    @media (min-width: ${theme.breakpoints.medium}) {
      grid-template-columns: 1fr 1fr;
    }
  `}
`;

export const TitleTextBlockRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.medium};
  width: 100%;
  align-items: stretch;

  ${({ theme }) => css`
    @media (min-width: ${theme.breakpoints.medium}) {
      grid-template-columns: 1fr 1fr;
    }
  `}
`;

export const TitleColorStack = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

export const TextBodyColumn = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 100%;
`;

export const CtaGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0 ${({ theme }) => theme.spacing.medium};
  width: 100%;

  ${({ theme }) => css`
    @media (min-width: ${theme.breakpoints.medium}) {
      grid-template-columns: 1fr 1fr;
    }
  `}
`;

export const ImagesRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.medium};
  width: 100%;
  align-items: start;

  ${({ theme }) => css`
    @media (min-width: ${theme.breakpoints.medium}) {
      grid-template-columns: 1fr 1fr;
    }
  `}
`;

export const LeftStack = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

export const BackgroundInputRow = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

export const HiddenFileInput = styled.input`
  display: none;
`;

export const DateField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxsmall};
  min-width: 0;
`;

export const AddBackgroundImageButton = styled(Button)`
  margin-bottom: ${({ theme }) => `calc(${theme.spacing.small} + 3px)`};
`;
