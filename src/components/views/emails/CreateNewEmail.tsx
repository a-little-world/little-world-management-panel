import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  ButtonVariations,
  Card,
  CardSizes,
  Dropdown,
  InfoIcon,
  InputWidth,
  Modal,
  Text,
  TextInput,
  TextTypes,
  Tooltip,
} from '@a-little-world/little-world-design-system';
import { render as renderEmail } from '@react-email/render';
import { capitalize, filter, isEmpty, isNumber, map, pullAt } from 'lodash';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';
import useSWR from 'swr';

import { updateDynamicTemplate } from '../../../api';
import EmailBuilder, {
  BlocksWithLink,
  ContentTypes,
} from '../../../emails/Builder';
import {
  BackendVars,
  EMAIL_CATEGORIES,
  getUnsubscribeUrl,
} from '../../../emails/shared/constants';
import { EmailThemeContext } from '../../../emails/shared/theme';
import useAutosave from '../../../hooks/useAutoSave';
import {
  CREATE_NEW_EMAIL_ROUTE,
  getEditEmailRoute,
} from '../../../router/routes';
import { dataFetcher, registerInput } from '../../../store';
import LoadingSpinner from '../../atoms/LoadingSpinner';
import SendEmailSheet from '../../blocks/SendEmailSheet';
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

const HrefEditor = ({
  handleUpdate,
  href,
  leftHref,
  rightHref,
  text,
  leftText,
  rightText,
  leftColor,
  rightColor,
  type,
}: {
  handleUpdate: (data: any) => void;
  href?: string;
  leftHref?: string;
  rightHref?: string;
  text?: string;
  leftText?: string;
  rightText?: string;
  leftColor?: string;
  rightColor?: string;
  type?: string;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  if (type === ContentTypes.TwoButtons) {
    return (
      <Card width={CardSizes.Small}>
        <form onSubmit={handleSubmit(handleUpdate)}>
          <TextInput
            {...registerInput({
              register,
              name: 'leftText',
              options: { required: 'Required' },
            })}
            id="edit_left_text"
            error={errors?.leftText?.message}
            placeholder="Enter text for left button"
            label={'Left Button Text'}
            defaultValue={leftText ?? 'Left Button'}
          />
          <TextInput
            {...registerInput({
              register,
              name: 'leftUrl',
              options: { required: 'Required' },
            })}
            id="edit_left_url"
            label="Left Button URL"
            error={errors?.leftUrl?.message}
            placeholder={'URL for left button'}
            defaultValue={leftHref ?? null}
          />
          <TextInput
            {...registerInput({
              register,
              name: 'leftColor',
            })}
            id="edit_left_color"
            label="Left Button Color"
            error={errors?.leftColor?.message}
            placeholder={'#0063AF (default)'}
            defaultValue={leftColor ?? null}
          />
          <TextInput
            {...registerInput({
              register,
              name: 'rightText',
              options: { required: 'Required' },
            })}
            id="edit_right_text"
            error={errors?.rightText?.message}
            placeholder="Enter text for right button"
            label={'Right Button Text'}
            defaultValue={rightText ?? 'Right Button'}
          />
          <TextInput
            {...registerInput({
              register,
              name: 'rightUrl',
              options: { required: 'Required' },
            })}
            id="edit_right_url"
            label="Right Button URL"
            error={errors?.rightUrl?.message}
            placeholder={'URL for right button'}
            defaultValue={rightHref ?? null}
          />
          <TextInput
            {...registerInput({
              register,
              name: 'rightColor',
            })}
            id="edit_right_color"
            label="Right Button Color"
            error={errors?.rightColor?.message}
            placeholder={'#0063AF (default)'}
            defaultValue={rightColor ?? null}
          />
          <Button type="submit" size={ButtonSizes.Stretch}>
            Update Buttons
          </Button>
        </form>
      </Card>
    );
  }

  // Original code for other link types
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
  const [newEmail, setNewEmail] = useState<any[]>([]);
  const [templateSaved, setTemplateSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const { templateId } = useParams();

  const theme = useTheme();

  const [showHrefEditor, setShowHrefEditor] = useState<null | number>(null);

  const {
    data: dynamicTemplates,
    isLoading: templatesLoading,
    mutate,
  } = useSWR(
    '/api/matching/emails/dynamic_templates/?page_size=50',
    dataFetcher,
    {},
  );

  const {
    watch,
    control,
    register: registerTemplate,
    handleSubmit: submitTemplate,
    formState: { errors: errorsTemplate },
    setError,
    setValue,
  } = useForm();
  const templateName = watch('template_name');
  const subject = watch('subject');
  const category = watch('category');
  const shouldSave =
    !templateSaved && subject && templateName && !isEmpty(newEmail);
  const { emailTheme, setEmailTheme } = React.useContext(EmailThemeContext)!;

  const onSaveDynamicTemplate = async () => {
    setSaving(true);
    try {
      const renderedTemplate = await renderEmail(
        <EmailBuilder
          content={newEmail}
          preview={''}
          theme={emailTheme}
          unsubscribeLink={getUnsubscribeUrl(category)}
        />,
      );

      updateDynamicTemplate({
        existingTemplate: Boolean(templateId),
        category,
        templateName,
        template: renderedTemplate,
        templateContent: newEmail,
        subject,
        theme: emailTheme,
        onSuccess: () => {
          setSaving(false);
          mutate();
          setTemplateSaved(true);
        },
        onError: error => {
          console.error(error);
          setSaving(false);
          setError('template_name', { message: 'Error saving' });
        },
      });
    } catch (error) {
      console.error('Error rendering email:', error);
      setSaving(false);
      setError('template_name', { message: 'Error rendering email' });
    }
  };

  useAutosave({
    callback: onSaveDynamicTemplate,
    delay: 10000,
    shouldSave,
  });

  const updateTemplate = (templateId: string) => {
    const dynamicTemplate = dynamicTemplates?.results.find(
      template => template.id.toString() === templateId,
    );
    // if template does not exist navigate to create new template
    if (!dynamicTemplate) return navigate(CREATE_NEW_EMAIL_ROUTE);

    setValue('template', dynamicTemplate.uuid);
    setValue('template_name', dynamicTemplate.template_name);
    setValue('subject', dynamicTemplate.subject);
    setValue('category', dynamicTemplate.category_id);
    setEmailTheme(dynamicTemplate.theme);
    setNewEmail(dynamicTemplate.content);
    setTemplateSaved(true);
  };

  const handleTemplateSelect = value => {
    const dynamicTemplate = dynamicTemplates?.results.find(
      template => template.uuid === value,
    );
    navigate(getEditEmailRoute(dynamicTemplate.id));
  };

  useEffect(() => {
    setTemplateSaved(false);
  }, [newEmail, subject, emailTheme]);

  useEffect(() => {
    // update path on template name changes
    if (!templatesLoading) {
      const existingTemplate = dynamicTemplates?.results?.find(
        template => template.template_name === templateName,
      );
      if (!existingTemplate?.id) {
        navigate(CREATE_NEW_EMAIL_ROUTE);
      } else if (existingTemplate?.id !== templateId) {
        navigate(getEditEmailRoute(existingTemplate.id));
      }
    }
  }, [templateName, dynamicTemplates]);

  useEffect(() => {
    // populate existing template
    if (!templatesLoading && templateId) updateTemplate(templateId);
  }, [templatesLoading, templateId]);

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
    if (showHrefEditor === null) return;

    if (dataCopy[showHrefEditor].type === ContentTypes.TwoButtons) {
      dataCopy[showHrefEditor].leftHref = data.leftUrl;
      dataCopy[showHrefEditor].rightHref = data.rightUrl;
      dataCopy[showHrefEditor].leftText = data.leftText;
      dataCopy[showHrefEditor].rightText = data.rightText;
      dataCopy[showHrefEditor].leftColor = data.leftColor;
      dataCopy[showHrefEditor].rightColor = data.rightColor;
      // Keep the main text field for compatibility
      dataCopy[showHrefEditor].text = `${data.leftText} | ${data.rightText}`;
    } else {
      dataCopy[showHrefEditor].href = data.url;
      dataCopy[showHrefEditor].text = data.text;
    }

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
      <SaveTemplateForm
        onSubmit={submitTemplate(async () => {
          await onSaveDynamicTemplate();
        })}
      >
        <Dropdown
          onValueChange={setEmailTheme}
          key={emailTheme}
          maxWidth="160px"
          value={emailTheme}
          label={'Theme'}
          placeholder="Select a theme"
          options={[
            { label: 'Little World', value: 'little_world' },
            { label: 'Patenmatch', value: 'patenmatch' },
          ]}
        />
        <Controller
          defaultValue={null}
          name={'template'}
          control={control}
          render={({
            field: { onBlur, value, name, ref },
            fieldState: { error },
          }) => (
            <Dropdown
              key={category}
              name={name}
              inputRef={ref}
              onBlur={onBlur}
              value={value}
              error={error?.message}
              label={'Start with a pre-existing template'}
              options={map(
                filter(
                  dynamicTemplates?.results,
                  item => !isEmpty(item.content),
                ),
                template => ({
                  value: template.uuid,
                  label: template.template_name,
                }),
              )}
              onValueChange={handleTemplateSelect}
              placeholder="pick a template"
              disabled={templatesLoading || isEmpty(dynamicTemplates?.results)}
            />
          )}
        />
        <Controller
          defaultValue={null}
          name={'category'}
          control={control}
          rules={{ required: 'Required' }}
          render={({
            field: { onChange, onBlur, value, name, ref },
            fieldState: { error },
          }) => (
            <Dropdown
              key={category}
              name={name}
              inputRef={ref}
              onBlur={onBlur}
              value={value}
              error={error?.message}
              label={'Category'}
              options={map(EMAIL_CATEGORIES, category => ({
                value: category,
                label: capitalize(category),
              }))}
              onValueChange={val => onChange({ target: { value: val } })}
              placeholder="pick a category"
              disabled={templatesLoading}
              maxWidth="160px"
            />
          )}
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
          width={InputWidth.Medium}
        />
        <TextInput
          id={'subject'}
          {...registerInput({
            register: registerTemplate,
            name: 'subject',
            options: { required: 'Required' },
          })}
          placeholder="Email subject..."
          label="Subject"
          error={errorsTemplate.subject?.message}
          width={InputWidth.Medium}
        />
        <ButtonsContainer>
          <Button
            appearance={ButtonAppearance.Secondary}
            size={ButtonSizes.Small}
            type="submit"
            disabled={!shouldSave}
            {...(templateSaved ? { color: theme.color.text.success } : {})}
          >
            {saving ? <LoadingSpinner /> : 'Save Template'}
          </Button>
          <SendEmailSheet
            emailTemplateName={templateName}
            subject={subject}
            cannotOpen={!templateSaved}
          />

          <Tooltip
            trigger={
              <Button
                variation={ButtonVariations.Circle}
                size={ButtonSizes.Large}
                color={theme.color.surface.bold}
              >
                <InfoIcon width="20" height="20" label="infoIcon" />
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
              {templatesLoading ? (
                <Text>Templates Loading...</Text>
              ) : (
                <Text>
                  Nothing Selected. Please start with an existing template or
                  select a building block to get started.
                </Text>
              )}
            </NothingSelected>
          ) : (
            <EmailBuilder
              content={newEmail}
              editable
              preview={''}
              deleteBlock={deleteBlock}
              moveBlock={moveBlock}
              openHrefEditor={setShowHrefEditor}
              theme={emailTheme}
              updateText={handleTextUpdate}
              unsubscribeLink={getUnsubscribeUrl(category)}
            />
          )}
        </TemplateWrapper>
      </Content>
      <Modal
        open={isNumber(showHrefEditor)}
        onClose={() => setShowHrefEditor(null)}
      >
        {showHrefEditor !== null && (
          <HrefEditor
            handleUpdate={handleHrefUpdate}
            href={newEmail?.[showHrefEditor]?.href}
            leftHref={newEmail?.[showHrefEditor]?.leftHref}
            rightHref={newEmail?.[showHrefEditor]?.rightHref}
            text={newEmail?.[showHrefEditor]?.text}
            leftText={newEmail?.[showHrefEditor]?.leftText}
            rightText={newEmail?.[showHrefEditor]?.rightText}
            leftColor={newEmail?.[showHrefEditor]?.leftColor}
            rightColor={newEmail?.[showHrefEditor]?.rightColor}
            type={newEmail?.[showHrefEditor]?.type}
          />
        )}
      </Modal>
    </Container>
  );
};

export default CreateNewEmail;
