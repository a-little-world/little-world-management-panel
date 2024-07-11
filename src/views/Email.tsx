import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  ButtonVariations,
  Link,
  Text,
  TextInput,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { registerInput } from '../blocks/SelectedUsersSheet';
import WelcomeEmail from '../emails/WelcomeEmail';

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.small};
`;
const Content = styled.div`
  background: ${({ theme }) => theme.color.surface.secondary};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  padding: ${({ theme }) => theme.spacing.small};
  gap: ${({ theme }) => theme.spacing.small};
  display: flex;
`;

const Option = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
`;

const Variables = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px;
  padding: ${({ theme }) => theme.spacing.small};
`;

const TemplateWrapper = styled.div`
  background: ${({ theme }) => theme.color.surface.primary};
  padding: ${({ theme }) => theme.spacing.small};
`;

export const EMAIL_TEMPLATES = {
  welcome: {
    label: 'Welcome Email',
    id: 'welcome',
    Component: WelcomeEmail,
    options: [{ name: 'verificationCode', label: 'Verification Code' }],
  },
  'reset-password': {
    label: 'Reset Password',
    id: 'reset-password',
    component: null,
  },
};

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.small};
`;

const Email = () => {
  const { emailTemplateName, ...rest } = useParams();
  const {
    getValues,
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();
  const navigate = useNavigate();
  const onSaveVariables = data => {
    const queryString = new URLSearchParams(data).toString();
    navigate(`rendered?${queryString}`);
  };
  const email = EMAIL_TEMPLATES[emailTemplateName];
  console.log({ ...rest, email });

  return (
    <Container>
      <Text type={TextTypes.Heading4}>{emailTemplateName} Template</Text>
      <Content>
        <Variables onSubmit={handleSubmit(onSaveVariables)}>
          {email.options.map((option: { name: string; label: string }) => (
            <Option key={option.name}>
              <TextInput
                {...registerInput({
                  register,
                  name: option.name,
                  options: { required: 'error.required' },
                })}
                id={option.name}
                label={option.label}
                error={errors?.[option.name]?.message}
                placeholder="Enter a value"
              />
            </Option>
          ))}

          <Toolbar>
            <Button type="submit" size={ButtonSizes.Small}>
              Go to Send
            </Button>
            <Button
              type="submit"
              size={ButtonSizes.Small}
              appearance={ButtonAppearance.Secondary}
            >
              Render Html
            </Button>
          </Toolbar>
        </Variables>
        <TemplateWrapper>{<email.Component {...getValues} />}</TemplateWrapper>
      </Content>
    </Container>
  );
};

export default Email;
