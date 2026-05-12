import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  ButtonVariations,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardSizes,
  InputWidth,
  Label,
  PlusIcon,
  Switch,
  Text,
  TextInput,
  TrashIcon,
} from '@a-little-world/little-world-design-system';
import React, { useEffect } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import styled, { useTheme } from 'styled-components';

import { AdminShortLink } from '../../../../api/shortLinks';

export const DeleteButton = styled(Button)`
  bottom: ${({ theme }) => theme.spacing.small};
`;

export const AddMoreButton = styled(Button)`
  color: ${({ theme }) => theme.color.text.highlight};
  flex-shrink: 0;

  &:disabled {
    color: ${({ theme }) => theme.color.text.disabled};
  }
`;

export const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const CookiesHeader = styled.div`
  display: flex;
  align-items: end;
  gap: ${({ theme }) => theme.spacing.large};
`;

const CookieField = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  align-items: end;
  gap: ${({ theme }) => theme.spacing.small};
`;

export type LinkFormValues = {
  tag: string;
  url: string;
  tracking_cookies_enabled: boolean;
  register_at_app_root: boolean;
  tracking_cookies: Array<{ name: string; value: string }>;
};

type LinkFormProps = {
  editingLink: AdminShortLink | null;
  saving: boolean;
  initialValues: LinkFormValues;
  onCancel: () => void;
  onSubmit: (values: LinkFormValues) => void;
};

function LinkForm({
  editingLink,
  saving,
  initialValues,
  onCancel,
  onSubmit,
}: LinkFormProps) {
  const theme = useTheme();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LinkFormValues>({
    mode: 'onSubmit',
    defaultValues: initialValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tracking_cookies',
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  return (
    <Card width={CardSizes.Large}>
      <StyledForm
        onSubmit={handleSubmit(values => {
          onSubmit(values);
        })}
      >
        <CardHeader>
          {editingLink ? 'Edit short link' : 'Create short link'}
        </CardHeader>
        <CardContent align="flex-start">
          {!editingLink && (
            <TextInput
              label="Tag"
              id="short-link-tag"
              placeholder="e.g. spring-campaign"
              {...register('tag', { required: 'Tag is required' })}
              error={errors.tag?.message}
            />
          )}

          <TextInput
            label="Destination URL"
            id="short-link-url"
            placeholder="https://…"
            {...register('url', { required: 'URL is required' })}
            error={errors.url?.message}
          />

          <Controller
            name="register_at_app_root"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Switch
                id="short-link-root"
                label="Allow from home app root (home.little-world.com)"
                labelInline
                checked={value}
                onCheckedChange={onChange}
              />
            )}
          />

          <Controller
            name="tracking_cookies_enabled"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Switch
                id="short-link-tracking-toggle"
                label="Set tracking cookies on redirect"
                labelInline
                checked={value}
                onCheckedChange={onChange}
              />
            )}
          />
          <CookiesHeader>
            <Label bold marginBottom={0}>
              Tracking cookies
            </Label>
            <AddMoreButton
              variation={ButtonVariations.Circle}
              size={ButtonSizes.Medium}
              color="orange"
              onClick={() => append({ name: '', value: '' })}
            >
              <PlusIcon label="Add cookie row" width={16} height={16} />
            </AddMoreButton>
          </CookiesHeader>

          <div>
            {fields.length > 0 ? (
              fields.map((field, index) => (
                <CookieField key={field.id}>
                  <TextInput
                    label="Name"
                    width={InputWidth.Small}
                    id={`cookie-name-${field.id}`}
                    {...register(`tracking_cookies.${index}.name` as const)}
                  />
                  <TextInput
                    label="Value"
                    width={InputWidth.Small}
                    id={`cookie-value-${field.id}`}
                    {...register(`tracking_cookies.${index}.value` as const)}
                  />
                  <DeleteButton
                    variation={ButtonVariations.Icon}
                    size={ButtonSizes.Medium}
                    onClick={() => remove(index)}
                  >
                    <TrashIcon
                      label="Remove cookie row"
                      width={16}
                      height={16}
                      color="orange"
                    />
                  </DeleteButton>
                </CookieField>
              ))
            ) : (
              <Text>No tracking cookies set</Text>
            )}
          </div>
        </CardContent>

        <CardFooter align="space-between">
          <Button
            type="button"
            appearance={ButtonAppearance.Secondary}
            size={ButtonSizes.Medium}
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            appearance={ButtonAppearance.Primary}
            size={ButtonSizes.Medium}
            disabled={saving}
          >
            {saving ? 'Saving…' : editingLink ? 'Save changes' : 'Create link'}
          </Button>
        </CardFooter>
      </StyledForm>
    </Card>
  );
}

export default LinkForm;
