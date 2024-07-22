import {
  Accordion,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { map } from 'lodash';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import automatedEmails from '../emails/data/automated';
import marketingEmails from '../emails/data/marketing';
import partnershipsEmails from '../emails/data/partnerships';

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.small};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
`;

const Template = styled(Link)`
  background: ${({ theme }) => theme.color.surface.primary};
  border: 1px solid ${({ theme }) => theme.color.border.bold};
  border-radius: ${({ theme }) => theme.radius.xxsmall};
  color: ${({ theme }) => theme.color.text.heading};
  padding: ${({ theme }) => theme.spacing.xsmall};
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
`;

const GROUPED_TEMPLATES = {
  Automated: map(automatedEmails),
  Marketing: map(marketingEmails),
  Partnerships: map(partnershipsEmails),
};

const Emails = () => {
  const GROUPED_TEMPLATES = {
    Automated: map(automatedEmails),
    Marketing: map(marketingEmails),
    Partnerships: map(partnershipsEmails),
  };
  return (
    <Container>
      <Text type={TextTypes.Heading4}>Email Templates</Text>
      <Accordion
        contentClassName={'emailGroup'}
        items={map(GROUPED_TEMPLATES, (item, header) => {
          return {
            header,
            content: item.map(template => (
              <Template key={template.id} to={template.id}>
                <Text>{template.label}</Text>
              </Template>
            )),
          };
        })}
      />
    </Container>
  );
};

export default Emails;
