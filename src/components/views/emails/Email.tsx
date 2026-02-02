import {
  ArrowLeftIcon,
  Button,
  ButtonAppearance,
  ButtonSizes,
  Link,
  Loading,
  StatusMessage,
  StatusTypes,
  Text,
  TextInput,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { render as renderEmail } from '@react-email/render';
import { some } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import useSWR from 'swr';

import { sendEmail } from '../../../api';
import EmailBuilder from '../../../emails/Builder';
import emailsData from '../../../emails/data';
import { getUnsubscribeUrl } from '../../../emails/shared/constants';
import { dataFetcher, registerInput } from '../../../store';
import TextField from '../../atoms/TextField';
import {
  Container,
  Content,
  OptionsContainer,
  PageHeading,
  TemplateWrapper,
  Toolbar,
} from './styles';

const Option = styled.div`
  display: flex;
  flex-direction: column;
`;

const DynamicVariables = styled.ul`
  list-style-type: disc;
  padding-inline-start: ${({ theme }) => theme.spacing.small};
  margin-top: ${({ theme }) => theme.spacing.xxsmall};
`;

const Email = () => {
  const { emailTemplateName } = useParams();
  const [showBackendPreview, setShowBackendPreview] = React.useState(false);
  const [backendPreviewHTML, setBackendPreviewHTML] = React.useState(
    '<h1>No Preview fetched, enter the dependencies and click render!</h1>',
  );
  const [emailSent, setEmailSent] = useState(false);
  const email = emailsData[emailTemplateName ?? 'undefined'];
  const {
    watch,
    register,
    formState: { errors },
    setError,
  } = useForm({
    defaultValues: {},
  });
  const emailVariables = watch();

  const { data: backendTemplateInfo, isLoading: templateLoading } = useSWR(
    `/api/matching/emails/templates/${emailTemplateName}/info/`,
    dataFetcher,
    {},
  );

  useEffect(() => {
    setEmailSent(false);
  }, [emailVariables]);

  const fetchBackendPreview = async (data: any) => {
    const search = new URLSearchParams(emailVariables).toString();
    const response = await fetch(
      `/api/matching/emails/templates/${emailTemplateName}/?${search}`,
    );
    const html = await response.text();
    setBackendPreviewHTML(html);
    setShowBackendPreview(true);
  };

  const onSendEmail = async () => {
    sendEmail({
      body: watch(),
      emailTemplateName,
      onSuccess: () => setEmailSent(true),
      onError: error => {
        setError('root.serverError', {
          type: error.status,
          message: error.message,
        });
      },
    });
  };

  const onDownload = async () => {
    const html = await renderEmail(
      <EmailBuilder
        content={email.content}
        preview={email.preview}
        theme={email.theme}
        unsubscribeLink={getUnsubscribeUrl(email.category_id)}
      />,
    );
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${emailTemplateName}.html`;
    a.click();
  };

  const cannotPreview = templateLoading || some(emailVariables, val => !val);
  const displayServerMessage = emailSent || !!errors?.root?.serverError;

  return (
    <Container>
      <PageHeading type={TextTypes.Heading4} center>
        {emailTemplateName} Template
      </PageHeading>
      {email ? (
        <Content>
          <OptionsContainer>
            <Text type={TextTypes.Body3} bold>
              Email Template Parameters
            </Text>
            <Text type={TextTypes.Body6}>
              The automatic templates are stored in the backend and it's
              parameters are dynamicly injected. Here is an overview of the
              templates current backend configuration:
            </Text>
            {templateLoading ? (
              <Loading />
            ) : (
              <>
                <Option>
                  <Text type={TextTypes.Body4} bold>
                    Email Subject:
                  </Text>
                  <TextField $active>
                    {backendTemplateInfo?.config?.subject}
                  </TextField>

                  <Text type={TextTypes.Body4} bold>
                    Detected Backend Variables:
                  </Text>
                  <Text type={TextTypes.Body6}>
                    We automatically process the template for replacable backend
                    variables, and found:
                  </Text>
                  <DynamicVariables>
                    {backendTemplateInfo?.params.map((variable: string) => (
                      <Text key={variable} type={TextTypes.Body5} bold tag="li">
                        {variable}
                      </Text>
                    ))}
                  </DynamicVariables>
                </Option>
                <Option>
                  <Text type={TextTypes.Body6}>
                    Sending this email requires setting these variables:
                  </Text>
                  {backendTemplateInfo?.dependencies?.map((dep: string) => (
                    <>
                      <TextInput
                        {...registerInput({
                          register,
                          name: dep?.query_id_field,
                          options: { required: 'error.required' },
                        })}
                        id={dep?.query_id_field}
                        label={`${dep?.id} ( by id query param: ${dep?.query_id_field} )`}
                        error={errors?.[dep?.id]?.message}
                        placeholder="Enter a value"
                      />
                    </>
                  ))}
                  {displayServerMessage && (
                    <StatusMessage
                      visible={emailSent || !!errors?.root?.serverError}
                      type={emailSent ? StatusTypes.Success : StatusTypes.Error}
                    >
                      {emailSent
                        ? 'Email sent successfully'
                        : errors?.root?.serverError?.message}
                    </StatusMessage>
                  )}
                  <Toolbar>
                    <Button
                      appearance={ButtonAppearance.Secondary}
                      size={ButtonSizes.Small}
                      onClick={fetchBackendPreview}
                      disabled={cannotPreview}
                    >
                      Preview Email
                    </Button>
                    <Button
                      size={ButtonSizes.Small}
                      onClick={onSendEmail}
                      disabled={cannotPreview || emailSent}
                    >
                      Send Email
                    </Button>
                    <Link
                      href={`${window.location.origin}/api/matching/emails/templates/${emailTemplateName}/test/`}
                      target="_blank"
                      style={{ textAlign: 'center' }}
                    >
                      View Rendered Example with placeholders
                    </Link>
                  </Toolbar>
                </Option>
              </>
            )}

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
            <Option>
              <Text type={TextTypes.Body3} bold>
                Export Email
              </Text>
              <Text type={TextTypes.Body6}>
                You wan't to make a change to this email? Then edit the text and
                download the updated content and template to transmit it to the
                dev team.
              </Text>
              <Toolbar style={{ marginTop: '16px' }}>
                <Button size={ButtonSizes.Small} onClick={onDownload}>
                  Download JSON Content
                </Button>
                <Button size={ButtonSizes.Small} onClick={onDownload}>
                  Download HTML Template
                </Button>
              </Toolbar>
            </Option>
          </OptionsContainer>
          <TemplateWrapper>
            <div className="relative">
              <div className="absolute top-2 left-2">
                {showBackendPreview && (
                  <Button
                    appearance={ButtonAppearance.Secondary}
                    size={ButtonSizes.Small}
                    onClick={() => setShowBackendPreview(!showBackendPreview)}
                  >
                    <ArrowLeftIcon height={16} width={16} label="back icon" />{' '}
                    Back to Email Builder
                  </Button>
                )}
              </div>
            </div>
            {showBackendPreview && (
              <div dangerouslySetInnerHTML={{ __html: backendPreviewHTML }} />
            )}
            {!showBackendPreview && (
              <EmailBuilder
                content={email.content}
                preview={email.preview}
                unsubscribeLink={getUnsubscribeUrl(email.category_id)}
                theme={email.theme}
              />
            )}
          </TemplateWrapper>
        </Content>
      ) : (
        <div>No Template exists for this email. Please check the path</div>
      )}
    </Container>
  );
};

export default Email;
