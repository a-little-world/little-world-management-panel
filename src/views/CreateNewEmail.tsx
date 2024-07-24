import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  ButtonVariations,
  Dropdown,
  InfoIcon,
  Text,
  TextTypes,
  ToolTip,
} from '@a-little-world/little-world-design-system';
import { render as renderEmail } from '@react-email/render';
import { forIn, isEmpty, map, mapKeys, pullAt } from 'lodash';
import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';

import { registerInput } from '../blocks/SelectedUsersSheet';
import EmailBuilder, { ContentTypes } from '../emails/Builder';
import emailsData from '../emails/data';
import communityEmails from '../emails/data/community';
import { BackendVars } from '../emails/templates/backendVars';

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
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.small};
  width: 100%;
  flex-wrap: wrap;
`;
const Content = styled.div`
  gap: ${({ theme }) => theme.spacing.small};
  display: flex;
  height: 100%;
  min-height: 0px;
  flex-wrap: wrap;

  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    flex-wrap: nowrap;
  }
`;

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

const BlocksContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing.small};
  background: ${({ theme }) => theme.color.surface.secondary};
  border-radius: ${({ theme }) => theme.radius.xxsmall};
  gap: ${({ theme }) => theme.spacing.small};
  width: 100%;

  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    max-width: 400px;
  }
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

const TemplateWrapper = styled.div`
  background: ${({ theme }) => theme.color.surface.primary};
  padding: ${({ theme }) => theme.spacing.small};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.xxsmall};
  overflow: scroll;
  width: 100%;
  min-height: 0;
  height: 100%;
`;

const PageHeading = styled(Text)`
  text-transform: capitalize;
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

  const onDownload = () => {
    const html = renderEmail(<email.Component />);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${emailTemplateName}.html`;
    a.click();
  };

  const handleTemplateSelect = value => {
    setSelectedTemplate(communityEmails[value]);
    setNewEmail(communityEmails[value]?.content);
  };

  const addBlock = (value: string) => {
    console.log({ value });
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
          <Button
            type="submit"
            size={ButtonSizes.Small}
            onClick={onSendTemplate}
          >
            Send Email
          </Button>
          <Button
            type="submit"
            appearance={ButtonAppearance.Secondary}
            size={ButtonSizes.Small}
            onClick={onDownload}
          >
            Download Django Template
          </Button>
        </ButtonsContainer>
      </Toolbar>
      <Content>
        <BlocksContainer>
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
        </BlocksContainer>
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
