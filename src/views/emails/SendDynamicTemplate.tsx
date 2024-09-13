import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import useSWR from 'swr';

import SendEmailSheet from '../../blocks/SendEmailSheet';
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
        <SendEmailSheet emailTemplateName={emailTemplateName} />
      </SendWrapper>
      <div
        dangerouslySetInnerHTML={{ __html: dynamicEmail?.template }}
        style={{ overflow: 'scroll' }}
      />
    </Container>
  );
}
