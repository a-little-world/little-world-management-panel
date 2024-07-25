import {
  Button,
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
          <OptionsContainer onSubmit={() => {}}>
            {/* <Text type={TextTypes.Body3} bold>
              Email Template Parameters
            </Text> */}
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
          </OptionsContainer>
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
