import {
  ButtonAppearance,
  Link,
  Loading,
  LoadingSizes,
} from '@a-little-world/little-world-design-system';
import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import useSWR from 'swr';

import { getEditEmailRoute } from '../../../routes';
import { dataFetcher } from '../../../store';
import SendEmailSheet from '../../blocks/SendEmailSheet';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
  min-height: 0;
`;

const LoadingContainer = styled.div`
  display: flex;
  padding: ${({ theme }) => theme.spacing.medium};
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const SendWrapper = styled.div`
  background: ${({ theme }) => theme.color.surface.primary};
  width: 100%;
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.small};
  gap: ${({ theme }) => theme.spacing.small};
  justify-content: flex-end;
`;

export function SendDynamicTemplateView() {
  const { emailTemplateName } = useParams();
  const { data: dynamicEmail, isLoading } = useSWR(
    `/api/matching/emails/dynamic_templates/${emailTemplateName}/`,
    dataFetcher,
    {},
  );

  return isLoading ? (
    <LoadingContainer>
      <Loading size={LoadingSizes.Large} inline={false} />
    </LoadingContainer>
  ) : (
    <Container>
      <SendWrapper>
        <Link
          to={getEditEmailRoute(dynamicEmail?.id)}
          buttonAppearance={ButtonAppearance.Secondary}
        >
          Edit Template
        </Link>
        <SendEmailSheet
          emailTemplateName={emailTemplateName}
          subject={dynamicEmail?.subject}
        />
      </SendWrapper>
      <div
        dangerouslySetInnerHTML={{ __html: dynamicEmail?.template }}
        style={{ overflow: 'scroll' }}
      />
    </Container>
  );
}
