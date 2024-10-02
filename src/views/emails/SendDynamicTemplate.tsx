import {
  ButtonAppearance,
  Link,
} from '@a-little-world/little-world-design-system';
import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import useSWR from 'swr';

import SendEmailSheet from '../../blocks/SendEmailSheet';
import { CREATE_NEW_EMAIL_ROUTE } from '../../routes';
import { dataFetcher } from '../../store';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
  min-height: 0;
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
  const { data: dynamicEmail } = useSWR(
    `/api/matching/emails/dynamic_templates/${emailTemplateName}/`,
    dataFetcher,
    {},
  );

  return (
    <Container>
      <SendWrapper>
        <Link
          to={`${CREATE_NEW_EMAIL_ROUTE}?template=${dynamicEmail?.uuid}`}
          buttonAppearance={ButtonAppearance.Secondary}
        >
          Edit Template
        </Link>
        <SendEmailSheet emailTemplateName={emailTemplateName} />
      </SendWrapper>
      <div
        dangerouslySetInnerHTML={{ __html: dynamicEmail?.template }}
        style={{ overflow: 'scroll' }}
      />
    </Container>
  );
}
