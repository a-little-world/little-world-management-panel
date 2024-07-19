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
import { render as renderEmail } from '@react-email/render';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { registerInput } from '../blocks/SelectedUsersSheet';
import EmailBuilder from '../emails/Builder';
import emailsData from '../emails/data';
import ResetPasswordEmail from '../emails/templates/ResetPassword';
import WelcomeEmail from '../emails/templates/Welcome';

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.small};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
  height: 100%;
  min-height: 0px;
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.small};
  padding: ${({ theme }) => theme.spacing.small};
`;
const Content = styled.div`
  //   padding: ${({ theme }) => theme.spacing.small};
  gap: ${({ theme }) => theme.spacing.small};
  display: flex;
  height: 100%;
  min-height: 0px;
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
  overflow: scroll;
  width: 100%;
`;

export const EMAIL_TEMPLATES = {
  welcome: {
    label: 'Welcome Email',
    id: 'welcome',
    Component: WelcomeEmail,
    options: [],
    subject: 'Wilkommen bei Little World',
  },
  'reset-password': {
    label: 'Reset Password',
    id: 'reset-password',
    Component: ResetPasswordEmail,
    options: [],
  },
};

const PageHeading = styled(Text)`
  text-transform: capitalize;
`;

const Email = () => {
  const { emailTemplateName, ...rest } = useParams();
  const email = emailsData[emailTemplateName ?? 'undefined'];
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

  const onDownload = () => {
    const html = renderEmail(<email.Component />);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${emailTemplateName}.html`;
    a.click();
  };
  console.log({ email });
  return (
    <Container>
      <PageHeading type={TextTypes.Heading4}>
        {emailTemplateName} Template
      </PageHeading>
      {email ? (
        <Content>
          <Variables onSubmit={() => {}}>
            <Text type={TextTypes.Body3} bold>
              Email Template Parameters
            </Text>
            {email.options?.map((option: { name: string; label: string }) => (
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
              Export Email
            </Text>
            <Toolbar>
              <Button
                type="submit"
                size={ButtonSizes.Small}
                onClick={onDownload}
              >
                Download Django Template
              </Button>
            </Toolbar>
          </Variables>
          <TemplateWrapper>
            <EmailBuilder content={email.content} preview={email.preview} />
          </TemplateWrapper>
        </Content>
      ) : (
        <div>No Template exists for this email. Please check the path</div>
      )}
    </Container>
  );
};

export default Email;
