import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  ButtonVariations,
  Dropdown,
  InfoIcon,
  Text,
  TextInput,
  TextTypes,
  ToolTip,
} from '@a-little-world/little-world-design-system';
import { render as renderEmail } from '@react-email/render';
import { isEmpty, map, pullAt } from 'lodash';
import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';

import EmailBuilder, { ContentTypes } from '../../emails/Builder';
import communityEmails from '../../emails/data/community';
import { BackendVars } from '../../emails/templates/backendVars';
import { registerInput } from '../../store';
import { getCookiesAsObject } from '../../utils';
import {
  Container,
  Content,
  OptionsContainer,
  PageHeading,
  TemplateWrapper,
  Toolbar,
} from './styles';

const BlockOption = styled.button`
  display: flex;
  align-items: center;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.color.border.moderate};
  border-radius: ${({ theme }) => theme.radius.small};
  background: ${({ theme }) => theme.color.surface.accent};
  padding: ${({ theme }) => theme.spacing.small};
  text-transform: capitalize;
`;

const Blocks = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: ${({ theme }) => theme.spacing.small};
  overflow: scroll;
  height: 88px;

  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    height: unset;
  }
`;

const NothingSelected = styled.div`
  padding: ${({ theme }) => theme.spacing.small};
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
`;

const ButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.small};
`;

const swapArrayElements = ({
  array,
  index1,
  index2,
}: {
  array: any[];
  index1: number;
  index2: number;
}) => {
  if (
    index1 < 0 ||
    index2 < 0 ||
    index1 >= array.length ||
    index2 >= array.length
  ) {
    console.error('Invalid index passed to swapArrayElements()');

    return array;
  }

  [array[index1], array[index2]] = [array[index2], array[index1]];

  return array;
};

const CreateNewEmail = () => {
  const { emailTemplateName } = useParams();
  const [newEmail, setNewEmail] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editActionsVisible, setIsVisible] = useState<boolean>(false);
  const theme = useTheme();

  const showComponent = useCallback(() => setIsVisible(true), []);
  const hideComponent = useCallback(() => setIsVisible(false), []);

  const {
    watch,
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    defaultValues: {
      subject: newEmail?.subject || '',
    },
  });

  const onSaveDynamicTemplate = () => {
    fetch(`/api/matching/emails/dynamic_templates/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookiesAsObject().csrftoken,
      },
      body: JSON.stringify({
        template_name: watch('template_name'),
        template: renderEmail(<EmailBuilder content={newEmail} preview={''} />),
        subject: 'Test Subject',
        category_id: 'dynamic',
        sender_id: 'noreply',
      }),
    });
  };

  const handleTemplateSelect = value => {
    setSelectedTemplate(communityEmails[value]);
    setNewEmail(communityEmails[value]?.content);
  };

  const addBlock = (value: string) => {
    setNewEmail(current => [
      ...current,
      {
        text: 'Placeholder text. Please update',
        type: value,
      },
    ]);
  };

  const deleteBlock = (index: number) => {
    setNewEmail(current => {
      const newValues = [...current];
      pullAt(newValues, [index]);
      return newValues;
    });
  };

  const moveBlock = (oldIndex: number, newIndex: number) => {
    setNewEmail(current => {
      const newValues = [...current];
      return swapArrayElements({
        array: newValues,
        index1: oldIndex,
        index2: newIndex,
      });
    });
  };

  const onSendTemplate = () => {
    // addNewTemplate({ content:  })
  };

  return (
    <Container>
      <PageHeading type={TextTypes.Heading4}>New Email Creator</PageHeading>
      <Toolbar>
        <Dropdown
          label={'Start with a pre-existing template'}
          options={map(communityEmails, template => ({
            value: template.id,
            label: template.label,
          }))}
          onValueChange={handleTemplateSelect}
          placeholder="pick a template"
        />
        <ToolTip
          trigger={
            <Button
              appearance={ButtonAppearance.Secondary}
              // color={theme.color.surface.bold}
            >
              Dynamic Variables Info
              {/* <InfoIcon
                label={'vars info'}
                labelId={'varsInfo'}
                width={16}
                height={16}
              /> */}
            </Button>
          }
          text={`Available dynamic variables:
            ${map(BackendVars, variable => variable).join('\n')}`}
        />

        <ButtonsContainer>
          <form>
            <TextInput
              id={'template_name'}
              type={''}
              {...registerInput({
                register,
                name: 'template_name',
                options: { required: 'error.required' },
              })}
              placeholder="Template Name"
              label="Template Name"
            />
            <Button
              appearance={ButtonAppearance.Secondary}
              size={ButtonSizes.Small}
              onClick={onSaveDynamicTemplate}
            >
              Save Dynamic Template
            </Button>
          </form>
        </ButtonsContainer>
      </Toolbar>
      <Content>
        <OptionsContainer>
          <Text type={TextTypes.Body3} bold>
            Building Blocks
          </Text>
          <Blocks onSubmit={() => {}}>
            {map(ContentTypes, key => (
              <BlockOption
                key={key}
                onClick={() => addBlock(key)}
                type="button"
              >
                {key}
              </BlockOption>
            ))}
          </Blocks>
        </OptionsContainer>
        <TemplateWrapper>
          {isEmpty(newEmail) ? (
            <NothingSelected>
              <Text>
                Nothing Selected. Please start with an existing template or
                select a building block to get started.
              </Text>
            </NothingSelected>
          ) : (
            <EmailBuilder
              content={newEmail}
              editable
              preview={''}
              deleteBlock={deleteBlock}
              moveBlock={moveBlock}
            />
          )}
        </TemplateWrapper>
      </Content>
    </Container>
  );
};

export default CreateNewEmail;
