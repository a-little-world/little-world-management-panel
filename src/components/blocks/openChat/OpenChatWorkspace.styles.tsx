import { Text, TextTypes } from '@a-little-world/little-world-design-system';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { ListPanel } from '../../atoms/PageLayout';
import { ORANGE_40 } from '../../../constants';

export const WorkspaceGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(17.5rem, 20rem) minmax(0, 1fr);
  gap: ${({ theme }) => theme.spacing.medium};
  min-height: 0;
  flex: 1;
  align-items: stretch;

  ${({ theme }) => `
    @media (max-width: ${theme.breakpoints.medium}) {
      grid-template-columns: 1fr;
    }
  `}
`;

export const SidebarPanel = styled(ListPanel)`
  height: 100%;
  min-height: 0;
`;

export const SidebarHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.small};
  border-bottom: 1px solid ${({ theme }) => theme.color.border.subtle};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
  flex-shrink: 0;
`;

export const SidebarScroll = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxsmall};
  padding: ${({ theme }) => theme.spacing.xsmall};
`;

export const ActorCard = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xsmall};
`;

export const ActorMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
  min-width: 0;
`;

export const MetaLabel = styled(Text).attrs({
  type: TextTypes.Body7,
  tag: 'span' as const,
})`
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.color.text.tertiary};
  font-weight: 600;
`;

export const MainPanelCard = styled.div`
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.medium};
  background: ${({ theme }) => theme.color.surface.primary};
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
`;

export const MainPanelHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.small};
  border-bottom: 1px solid ${({ theme }) => theme.color.border.subtle};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.small};
  flex-shrink: 0;
`;

export const MainPanelHeaderMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xsmall};
  min-width: 0;
`;

export const MainPanelHeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
  min-width: 0;
`;

export const MainPanelBody = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const HeaderActionsRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xsmall};
  flex-wrap: wrap;
`;

export const ActorSelectWrap = styled.div`
  min-width: 12rem;
`;

export const ActorSelect = styled.select`
  min-height: 2.5rem;
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.xxsmall};
  padding: ${({ theme }) => theme.spacing.xxsmall}
    ${({ theme }) => theme.spacing.small};
  background: ${({ theme }) => theme.color.surface.primary};
  color: ${({ theme }) => theme.color.text.primary};
  font-size: 0.875rem;
  width: 100%;
`;

export const ConversationRowButton = styled.button<{ $active: boolean }>`
  border: 0;
  border-left: 3px solid
    ${({ $active }) => ($active ? ORANGE_40 : 'transparent')};
  border-radius: ${({ theme }) => theme.radius.xxsmall};
  background: ${({ theme, $active }) =>
    $active ? theme.color.surface.secondary : 'transparent'};
  cursor: pointer;
  text-align: left;
  padding: ${({ theme }) => theme.spacing.xsmall};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xsmall};
  width: 100%;

  &:hover {
    background: ${({ theme }) => theme.color.surface.secondary};
  }
`;

export const ConversationRowMain = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
`;

export const ConversationRowTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
`;

export const ConversationPreview = styled(Text).attrs({
  type: TextTypes.Body7,
  tag: 'span' as const,
})`
  color: ${({ theme }) => theme.color.text.secondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ConversationActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
  flex-shrink: 0;
`;

export const DeleteConfirmRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

export const InteractionRowButton = styled(ConversationRowButton)``;

export const ExternalLinkButton = styled.a`
  color: ${({ theme }) => theme.color.text.link};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xxsmall};
  border-radius: ${({ theme }) => theme.radius.xxsmall};

  &:hover {
    background: ${({ theme }) => theme.color.surface.secondary};
  }
`;

export const InteractionWidgetNavButton = styled.button`
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.color.text.link};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
`;

export const InteractionWidgetHeader = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const OpenChatMessagesScroll = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
  border: 2px solid ${({ theme }) => theme.color.border.minimal};
  border-radius: ${({ theme }) => theme.radius.medium};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
  padding: ${({ theme }) => theme.spacing.small};
  overflow-y: auto;
  overflow-x: hidden;
  margin: ${({ theme }) => theme.spacing.small};
  margin-bottom: 0;
`;

export const ChatPanelLayout = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;

export const InteractionFrame = styled.iframe`
  border: 0;
  width: 100%;
  flex: 1;
  min-height: min(60vh, 560px);
  background: ${({ theme }) => theme.color.surface.primary};
`;

export const InteractionFrameContainer = styled.div`
  flex: 1;
  min-height: min(60vh, 560px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const InteractionViewerHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.small};
  padding: ${({ theme }) => theme.spacing.small};
  border-bottom: 1px solid ${({ theme }) => theme.color.border.subtle};
  flex-shrink: 0;
`;

export const InteractionViewerTitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
  min-width: 0;
`;

export const InteractionViewerTitle = styled(Text).attrs({
  type: TextTypes.Body5,
  tag: 'h2' as const,
})`
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const HomeCardContent = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: ${({ theme }) => theme.spacing.small};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium};
`;

export const HomeSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xsmall};
`;

export const HomeSectionTitle = styled(Text).attrs({
  type: TextTypes.Body6,
  tag: 'h3' as const,
})`
  margin: 0;
  color: ${({ theme }) => theme.color.text.secondary};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

export const ConfigConnectionCard = styled.div`
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.small};
  background: ${({ theme }) => theme.color.surface.secondary};
  overflow: hidden;
`;

export const ConfigConnectionCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.small};
  padding: ${({ theme }) => theme.spacing.xsmall} ${({ theme }) => theme.spacing.small};
  border-bottom: 1px solid ${({ theme }) => theme.color.border.subtle};
  background: ${({ theme }) => theme.color.surface.primary};
`;

export const ConfigConnectionCardTitle = styled(Text).attrs({
  type: TextTypes.Body5,
  tag: 'h4' as const,
})`
  margin: 0;
  font-weight: 600;
`;

export const ConfigConnectionCardBody = styled.div`
  padding: ${({ theme }) => theme.spacing.small};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
`;

export const ConfigFieldsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
  gap: ${({ theme }) => theme.spacing.small};
`;

export const ConfigFieldItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
  min-width: 0;
`;

export const ConfigFieldLabel = styled.span`
  color: ${({ theme }) => theme.color.text.tertiary};
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

export const ConfigFieldValue = styled.span`
  color: ${({ theme }) => theme.color.text.primary};
  font-size: 0.8125rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  word-break: break-all;
`;

export const ConfigHeaderNavLink = styled(Link)<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  border: 1px solid
    ${({ theme, $active }) =>
      $active ? theme.color.border.minimal : theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.xxsmall};
  padding: ${({ theme }) => theme.spacing.xxsmall}
    ${({ theme }) => theme.spacing.small};
  background: ${({ theme, $active }) =>
    $active ? theme.color.surface.primary : theme.color.surface.secondary};
  color: ${({ theme }) => theme.color.text.link};
  text-decoration: none;
  min-height: 2.5rem;
  font-size: 0.875rem;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};

  &:hover {
    background: ${({ theme }) => theme.color.surface.primary};
    text-decoration: underline;
  }
`;

export const CompactConfigForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
`;

export const CompactConfigFormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: ${({ theme }) => theme.spacing.small};
`;

export const ComposerFooter = styled.div`
  border-top: 1px solid ${({ theme }) => theme.color.border.subtle};
  padding: ${({ theme }) => theme.spacing.small};
  flex-shrink: 0;
  margin-top: auto;
  background: ${({ theme }) => theme.color.surface.primary};
`;

export const EmptySidebarState = styled.div`
  padding: ${({ theme }) => theme.spacing.small};
`;
