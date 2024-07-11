import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  ButtonVariations,
  Label,
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
  //   padding: ${({ theme }) => theme.spacing.small};
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
  background: ${({ theme }) => theme.color.surface.secondary};
  border-radius: ${({ theme }) => theme.radius.xxsmall};
`;

const TemplateWrapper = styled.div`
  background: ${({ theme }) => theme.color.surface.primary};
  padding: ${({ theme }) => theme.spacing.small};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.xxsmall};
`;

export const EMAIL_TEMPLATES = {
  welcome: {
    label: 'Welcome Email',
    id: 'welcome',
    Component: WelcomeEmail,
    options: [{ name: 'verificationCode', label: 'Verification Code' }],
    subject: 'Wilkommen bei Little World',
  },
  'reset-password': {
    label: 'Reset Password',
    id: 'reset-password',
    component: null,
  },
};

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.small};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
`;

const PageHeading = styled(Text)`
  text-transform: capitalize;
`;

const Email = () => {
  const { emailTemplateName, ...rest } = useParams();
  const email = EMAIL_TEMPLATES[emailTemplateName];
  const {
    watch,
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    defaultValues: {
      subject: email.subject || '',
    },
  });
  const navigate = useNavigate();
  const onRenderHtml = data => {
    const queryString = new URLSearchParams(data).toString();
    navigate(`rendered?${queryString}`);
  };

  const onPrepareSend = data => {
    const queryString = new URLSearchParams(data).toString();
    navigate(`rendered?${queryString}`);
  };

  return (
    <Container>
      <PageHeading type={TextTypes.Heading4}>
        {emailTemplateName} Template
      </PageHeading>
      <Content>
        <Variables onSubmit={handleSubmit(onRenderHtml)}>
          <Text type={TextTypes.Body3} bold>
            Email Template Parameters
          </Text>

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
          <Text type={TextTypes.Body3} bold>
            Send Email
          </Text>
          <TextInput
            {...registerInput({
              register,
              name: 'subject',
              options: { required: 'error.required' },
            })}
            id={'subject'}
            label={'Subject'}
            error={errors?.subject?.message}
            placeholder="Enter the subject"
          />
          <TextInput
            {...registerInput({
              register,
              name: 'recipients',
              options: { required: 'error.required' },
            })}
            id={'recipients'}
            label={'Send Email to:'}
            labelTooltip="To send to multiple recipients at once, enter emails separated by a comma but without any spaces inbetween email address and comma."
            error={errors?.recipients?.message}
            placeholder="Enter emails of the recipients"
          />
          <Toolbar>
            <Button
              type="submit"
              size={ButtonSizes.Small}
              onClick={onPrepareSend}
            >
              Send
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
        <TemplateWrapper>{<email.Component {...watch()} />}</TemplateWrapper>
      </Content>
    </Container>
  );
};

export default Email;
