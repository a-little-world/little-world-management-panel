import {
  Button,
  ButtonAppearance,
  Link,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import React from 'react';
import styled from 'styled-components';

const Templates = styled.ul``;
const Template = styled.li`
  background: ${({ theme }) => theme.color.surface.secondary};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  padding: ${({ theme }) => theme.spacing.small};
  display: flex;
  align-items: center;
`;

const templates = [
  { label: 'Welcome Email', id: 'welcome' },
  { label: 'Reset Password', id: 'reset-password' },
];

const Emails = () => {
  return (
    <div>
      <Text type={TextTypes.Heading3}>Email Templates</Text>
      <Templates>
        {templates.map(template => (
          <Template key={template.id}>
            <Text>{template.label}</Text>
            <Link
              to={template.id}
              buttonAppearance={ButtonAppearance.Secondary}
            >
              View
            </Link>
            <Button>Send</Button>
          </Template>
        ))}
      </Templates>
    </div>
  );
};

export default Emails;
