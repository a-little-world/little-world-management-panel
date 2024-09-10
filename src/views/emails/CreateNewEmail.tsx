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
import { filter, isEmpty, isNumber, map, pullAt } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import styled, { useTheme } from 'styled-components';
import useSWR from 'swr';

import LoadingSpinner from '../../atoms/LoadingSpinner';
import SendEmailSheet from '../../blocks/SendEmailSheet';
import EmailBuilder, {
  BlocksWithLink,
  ContentTypes,
} from '../../emails/Builder';
import { BackendVars } from '../../emails/templates/backendVars';
import { getCookiesAsObject } from '../../lib/utils';
import { dataFetcher, registerInput } from '../../store';
import {
  Container,
  Content,
  OptionsContainer,
  PageHeading,
  TemplateWrapper,
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
  align-items: flex-end;
  width: 100%;
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
  gap: ${({ theme }) => theme.spacing.small};
  flex: 1;
  margin-bottom: 14px;
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

const HrefEditor = ({ handleUpdate, href, text }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  return (
    <Card width={CardSizes.Small}>
      <form onSubmit={handleSubmit(handleUpdate)}>
        <TextInput
          {...registerInput({
            register,
            name: 'text',
            options: { required: 'Required' },
          })}
          id="edit_text"
          error={errors?.text?.message}
          placeholder="Enter text to be displayed"
          label={'Displayed Text'}
          defaultValue={text ?? null}
        />
        <TextInput
          key={href}
          {...registerInput({
            register,
            name: 'url',
            options: { required: 'Required' },
          })}
          id="edit_url"
          label="Edit url"
          error={errors?.url?.message}
          placeholder={'url of link or button'}
          defaultValue={href ?? null}
        />
        <Button type="submit" size={ButtonSizes.Stretch}>
          Update Url
        </Button>
      </form>
    </Card>
  );
};

const CreateNewEmail = () => {
  const [newEmail, setNewEmail] = useState([]);
  const [templateSaved, setTemplateSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isFirstSave, setIsFirstSave] = useState(true);

  const theme = useTheme();

  const [showHrefEditor, setShowHrefEditor] = useState<null | number>(null);

  const {
    data: dynamicTemplates,
    isLoading: templatesLoading,
    mutate,
  } = useSWR('/api/matching/emails/dynamic_templates/', dataFetcher, {});
  console.log({ dynamicTemplates });

  const {
    watch,
    register: registerTemplate,
    handleSubmit: submitTemplate,
    formState: { errors: errorsTemplate },
    setError,
    setValue,
  } = useForm();
  const templateName = watch('template_name');

  const onSaveDynamicTemplate = () => {
    setSaving(true);
    fetch(
      `/api/matching/emails/dynamic_templates/${
        isFirstSave ? '' : `${templateName}/`
      }`,
      {
        method: isFirstSave ? 'POST' : 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookiesAsObject().csrftoken,
        },
        body: JSON.stringify({
          template_name: templateName,
          template: renderEmail(
            <EmailBuilder content={newEmail} preview={''} />,
          ),
          subject: 'Test Subject',
          category_id: 'dynamic',
          sender_id: 'noreply',
          content: newEmail,
        }),
      },
    )
      .then(response => {
        if (response?.ok) {
          setSaving(false);
          setTemplateSaved(true);
          setIsFirstSave(false);
          mutate();
        } else {
          throw new Error();
        }
      })
      .catch(() => {
        setSaving(false);
        setError('template_name', { message: 'Error saving' });
      });
  };

  const handleTemplateSelect = value => {
    const dynamicTemplate = dynamicTemplates?.results.find(
      template => template.uuid === value,
    );
    setValue('template_name', `${dynamicTemplate?.template_name} - COPY` ?? '');
    setNewEmail(dynamicTemplate.content);
  };

  useEffect(() => {
    setTemplateSaved(false);
  }, [newEmail]);

  useEffect(() => {
    if (templateName) {
      // check if template name already exists
      setIsFirstSave(
        !dynamicTemplates?.results.some(
          template => template.template_name === templateName,
        ),
      );
    }
  }, [templateName, dynamicTemplates]);

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
    dataCopy[showHrefEditor].text = data.text;

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

  return (
    <Container>
      <PageHeading type={TextTypes.Heading4}>New Email Creator</PageHeading>
      <SaveTemplateForm onSubmit={submitTemplate(onSaveDynamicTemplate)}>
        <Dropdown
          label={'Start with a pre-existing template'}
          options={map(
            filter(dynamicTemplates?.results, item => !isEmpty(item.content)),
            template => ({
              value: template.uuid,
              label: template.template_name,
            }),
          )}
          onValueChange={handleTemplateSelect}
          placeholder="pick a template"
          disabled={templatesLoading || isEmpty(dynamicTemplates?.results)}
        />
        <TextInput
          id={'template_name'}
          {...registerInput({
            register: registerTemplate,
            name: 'template_name',
            options: { required: 'Required' },
          })}
          placeholder="Template Name"
          label="Template Name"
          error={errorsTemplate.template_name?.message}
        />
        <ButtonsContainer>
          <Button
            appearance={ButtonAppearance.Secondary}
            size={ButtonSizes.Small}
            type="submit"
            {...(templateSaved ? { color: theme.color.surface.on } : {})}
          >
            {saving ? <LoadingSpinner /> : 'Save Template'}
          </Button>
          <SendEmailSheet emailTemplateName={templateName} />

          <ToolTip
            trigger={
              <Button
                variation={ButtonVariations.Circle}
                size={ButtonSizes.Large}
                color={theme.color.surface.bold}
              >
                <InfoIcon
                  width="20"
                  height="20"
                  label="infoIcon"
                  labelId="infoIcon"
                />
              </Button>
            }
            text={`Available dynamic variables:
            ${map(BackendVars, variable => variable).join('\n')}`}
          />
        </ButtonsContainer>
      </SaveTemplateForm>

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
        <HrefEditor
          handleUpdate={handleHrefUpdate}
          href={newEmail?.[showHrefEditor]?.href}
          text={newEmail?.[showHrefEditor]?.text}
        />
      </Modal>
    </Container>
  );
};

export default CreateNewEmail;
