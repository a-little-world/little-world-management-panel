import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  ButtonVariations,
  Card,
  CardSizes,
  Dropdown,
  InfoIcon,
  Modal,
  Text,
  TextInput,
  TextTypes,
  ToolTip,
} from '@a-little-world/little-world-design-system';
import { render as renderEmail } from '@react-email/render';
import { isEmpty, isNumber, map, pullAt } from 'lodash';
import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';

import SendEmailSheet from '../../blocks/SendEmailSheet';
import EmailBuilder, {
  BlocksWithLink,
  ContentTypes,
} from '../../emails/Builder';
import communityEmails from '../../emails/data/community';
import { BackendVars } from '../../emails/templates/backendVars';
import { getCookiesAsObject } from '../../lib/utils';
import { registerInput } from '../../store';
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

const SaveTemplateForm = styled.form`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xsmall};
  flex: 1;
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
  flex: 1;
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
  const [emailSenderOpen, setEmailSenderOpen] = useState(false);
  const theme = useTheme();

  const showComponent = useCallback(() => setIsVisible(true), []);
  const hideComponent = useCallback(() => setIsVisible(false), []);
  const [showHrefEditor, setShowHrefEditor] = useState<null | number>(null);

  const {
    watch,
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

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

  const handleTextUpdate = ({
    text,
    index,
  }: {
    text: string;
    index: number;
  }) => {
    const dataCopy = [...newEmail];
    dataCopy[index].text = text;

    setNewEmail(dataCopy);
  };

  const handleHrefUpdate = data => {
    const dataCopy = [...newEmail];
    dataCopy[showHrefEditor].href = data.url;
    setNewEmail(dataCopy);
    setShowHrefEditor(null);
  };

  const addBlock = (value: string) => {
    setNewEmail(current => [
      ...current,
      {
        text: 'Placeholder text. Please update',
        type: value,
      },
    ]);
    if (BlocksWithLink.includes(value)) setShowHrefEditor(newEmail.length);
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
    setEmailSenderOpen(true);
  };
  console.log({ showHrefEditor });

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
        <ButtonsContainer>
          <SaveTemplateForm onSubmit={handleSubmit(onSaveDynamicTemplate)}>
            <TextInput
              id={'template_name'}
              {...registerInput({
                register,
                name: 'template_name',
                options: { required: 'Required' },
              })}
              placeholder="Template Name"
              label="Template Name"
              error={errors.template_name?.message}
            />
            <Button size={ButtonSizes.Small} type="submit">
              Save Template
            </Button>
            <SendEmailSheet />
          </SaveTemplateForm>
        </ButtonsContainer>
        <ToolTip
          trigger={
            <Button
              appearance={ButtonAppearance.Secondary}
              variation={ButtonVariations.Icon}
              size={ButtonSizes.Small}
              color={theme.color.surface.bold}
              borderColor={theme.color.surface.bold}
            >
              <InfoIcon circular width="16" height="16" />
            </Button>
          }
          text={`Available dynamic variables:
            ${map(BackendVars, variable => variable).join('\n')}`}
        />
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
              openHrefEditor={setShowHrefEditor}
              updateText={handleTextUpdate}
            />
          )}
        </TemplateWrapper>
      </Content>
      <Modal
        open={isNumber(showHrefEditor)}
        onClose={() => setShowHrefEditor(null)}
      >
        <Card width={CardSizes.Small}>
          <form onSubmit={handleHrefUpdate}>
            <TextInput
              label={'Displayed Text'}
              value={newEmail[showHrefEditor]?.text}
              readOnly
            />
            <TextInput
              key={showHrefEditor}
              {...registerInput({
                register,
                name: 'url',
                options: { required: 'Required' },
              })}
              id="edit_url"
              label="Edit url"
              error={errors?.url?.message}
              placeholder={'url of link or button'}
              defaultValue={newEmail[showHrefEditor]?.href ?? null}
            />
            <Button type="submit" size={ButtonSizes.Stretch}>
              Update Url
            </Button>
          </form>
        </Card>
      </Modal>
    </Container>
  );
};

export default CreateNewEmail;
