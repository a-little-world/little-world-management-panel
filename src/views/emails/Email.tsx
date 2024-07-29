import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  Text,
  TextInput,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { render as renderEmail } from '@react-email/render';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { registerInput } from '../../blocks/SelectedUsersSheet';
import EmailBuilder from '../../emails/Builder';
import emailsData from '../../emails/data';
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
  align-items: center;
  flex-direction: column;
`;

const Email = () => {
  const { emailTemplateName } = useParams();
  const [showBackendPreview, setShowBackendPreview] = React.useState(false);
  const [backendPreviewHTML, setBackendPreviewHTML] = React.useState('<h1>No Preview fetched, enter the dependencies and click render!</h1>');
  const email = emailsData[emailTemplateName ?? 'undefined'];
  const {
    watch,
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    defaultValues: {},
  });



  const {
    data: backendTemplateInfo,
  } = useSWR(`/api/matching/emails/templates/${emailTemplateName}/info/`, dataFetcher, {});

  const fetchBackendPreview = async (data: any) => {
    const url = `/api/matching/emails/templates/${emailTemplateName}/`
    const search = new URLSearchParams(watch()).toString();
    const response = await fetch(`/api/matching/emails/templates/${emailTemplateName}/?${search}`);
    const html = await response.text();
    setBackendPreviewHTML(html);
  }

  const onSendEmail = async () => {
    const url = `/api/matching/emails/templates/${emailTemplateName}/send/`
    await fetch(url, {
      method: 'POST',
      body: JSON.stringify(watch()),
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookiesAsObject().csrftoken,
      },
    });
  }

  const onDownload = () => {
    const html = renderEmail(<EmailBuilder content={email.content} preview={email.preview} />);
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
          <OptionsContainer onSubmit={() => { }}>

            <Text type={TextTypes.Body3} bold>
              Email Template Parameters
            </Text>
            <Text type={TextTypes.Body6}>
              The automatic templates are stored in the backend and it's parameters are dynamicly injected.
              Here is an overview of the templates current backend configuration:
            </Text>
            <Text type={TextTypes.Body4} bold>
              Detected Backend Variables:
            </Text>
            <Text type={TextTypes.Body6}>
              We automatically process the template for replacable backend variables, and found:
            </Text>
            {backendTemplateInfo?.params.map((variable: string) => (
              <Text key={variable} type={TextTypes.Body5} bold>
                - {variable}
              </Text>
            ))}
            <Text type={TextTypes.Body6}>
              So sending this email requires setting these variables:
            </Text>
            {backendTemplateInfo?.dependencies?.map((dep: string) => (
              <><TextInput {...registerInput({
                register,
                name: dep?.query_id_field,
                options: { required: 'error.required' },
              })}
                id={dep?.query_id_field}
                label={`- ${dep?.id} ( by id query param: ${dep?.query_id_field} )`}
                error={errors?.[dep?.id]?.message}
                placeholder="Enter a value" />
              </>
            ))}
            <Toolbar>
              <Button
                size={ButtonSizes.Small}
                onClick={fetchBackendPreview}
              >
                Update Backend Email Preview
              </Button>
              <Button
                size={ButtonSizes.Small}
                onClick={onSendEmail}
              >
                Send Email
              </Button>
            </Toolbar>
            <Text type={TextTypes.Body4} bold>
              Email Subject:
            </Text>
            {backendTemplateInfo?.config?.subject}
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
              View & Send
            </Text>
            <Text type={TextTypes.Body6}>
              View the final rendered backend email, with or without dynamicly injecting parameters.
            </Text>
            <Text type={TextTypes.Body3} bold>
              Export Email
            </Text>
            <Text type={TextTypes.Body6}>
              You wan't to make a change to this email?
              Then edit the text and download the updated content and template to transmit it to the dev team.
            </Text>
            <Toolbar>
              <Button
                size={ButtonSizes.Small}
                onClick={onDownload}
              >
                Download JSON Content
              </Button>
              <Button
                size={ButtonSizes.Small}
                onClick={onDownload}
              >
                Download HTML Template
              </Button>
            </Toolbar>
          </OptionsContainer>
          <TemplateWrapper>
            <div className='relative'>
              <div className='absolute top-0 right-0'>
                <Button
                  appearance={ButtonAppearance.Secondary}
                  size={ButtonSizes.Small}
                  onClick={() => setShowBackendPreview(!showBackendPreview)}
                >
                  {showBackendPreview ? 'Back to Email Builder' : 'Show Backend Preview'}
                </Button>
              </div>
            </div>
            {showBackendPreview && <div dangerouslySetInnerHTML={{ __html: backendPreviewHTML }} />}
            {!showBackendPreview && <EmailBuilder content={email.content} preview={email.preview} />}
          </TemplateWrapper>
        </Content>
      ) : (
        <div>No Template exists for this email. Please check the path</div>
      )}
    </Container >
  );
};

export default Email;
