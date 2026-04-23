import {
  ArrowLeftIcon,
  Button,
  ButtonAppearance,
  ButtonSizes,
  ButtonVariations,
  Card,
  CardContent,
  CardHeader,
  CardSizes,
  Dropdown,
  Loading,
  LoadingSizes,
  StatusMessage,
  StatusTypes,
  Switch,
  Text,
  TextArea,
  TextInput,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import React, { RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import useSWR, { mutate } from 'swr';

import {
  ADMIN_BANNERS_ENDPOINT,
  Banner,
  BannerPayload,
  createBanner,
  fetchAdminBanner,
  resolveBannerImageUrl,
  updateBanner,
} from '../../../../api/banners';
import { registerInput } from '../../../../store';
import { ImageUploadField } from '../../../atoms/ImageUploadField';
import {
  Container,
  Description,
  Header,
  HeaderText,
  Title,
} from '../events/Events.styles';

const Preview = styled.div<{ $background: string; $textColor: string }>`
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.medium};
  padding: ${({ theme }) => theme.spacing.medium};
  background: ${({ $background, theme }) =>
    $background || theme.color.surface.accent};
  color: ${({ $textColor, theme }) => $textColor || theme.color.text.reversed};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

const CardHeaderTopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.small};
  flex-wrap: wrap;
`;

const EditBannerCard = styled(Card)`
  min-height: 0;
`;

const BackButton = styled(Button)`
  gap: ${({ theme }) => theme.spacing.xxxsmall};
  font-weight: 600;
  padding: ${({ theme }) => theme.spacing.xxsmall} !important;
  flex-shrink: 0;
  text-align: left;

  > svg {
    flex-shrink: 0;
  }
`;

type BannerFormValues = BannerPayload & {
  bannerImageFile: File | null;
};

const defaultValues: BannerFormValues = {
  name: '',
  active: true,
  title: '',
  text: '',
  text_color: '#000000',
  background: '',
  cta_1_url: '',
  cta_1_text: '',
  cta_2_url: '',
  cta_2_text: '',
  type: 'small',
  image_alt: '',
  activation_time: null,
  expiration_time: null,
  custom_filter: 'none',
  filter_priority: 0,
  bannerImageFile: null,
};

const buildPayload = (values: BannerFormValues): BannerPayload => ({
  name: values.name,
  active: values.active,
  title: values.title,
  text: values.text,
  text_color: values.text_color,
  background: values.background,
  cta_1_url: values.cta_1_url,
  cta_1_text: values.cta_1_text,
  cta_2_url: values.cta_2_url,
  cta_2_text: values.cta_2_text,
  type: values.type,
  image_alt: values.image_alt,
  activation_time: values.activation_time || null,
  expiration_time: values.expiration_time || null,
  custom_filter: values.custom_filter,
  filter_priority: Number(values.filter_priority) || 0,
});

function BannerFormPage() {
  const { bannerId } = useParams();
  const navigate = useNavigate();
  const activeSwitchRef = useRef<HTMLButtonElement>(null);
  const isNew = bannerId === 'new';
  const numericId = bannerId && !isNew ? Number(bannerId) : null;

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { data, isLoading, error } = useSWR<Banner>(
    numericId ? `${ADMIN_BANNERS_ENDPOINT}${numericId}/` : null,
    () => fetchAdminBanner(numericId as number),
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<BannerFormValues>({
    defaultValues: isNew
      ? defaultValues
      : {
          ...defaultValues,
          ...data,
          bannerImageFile: null,
        },
    values:
      isNew || !data
        ? undefined
        : {
            ...defaultValues,
            ...data,
            bannerImageFile: null,
          },
  });

  const customFilterOptions = useMemo(
    () =>
      (data?.options?.custom_filter ?? [{ tag: 'none', value: 'none' }]).map(
        item => ({ label: item.tag, value: item.value }),
      ),
    [data],
  );

  const previewValues = watch();
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!previewValues.bannerImageFile) {
      setLocalPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(previewValues.bannerImageFile);
    setLocalPreviewUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [previewValues.bannerImageFile]);

  const previewImage = localPreviewUrl || resolveBannerImageUrl(data?.image);

  const onSave = async (values: BannerFormValues) => {
    setSaving(true);
    setSaveError(null);
    setStatusMessage(null);

    try {
      const payload = buildPayload(values);
      const image = values.bannerImageFile ?? undefined;

      if (isNew) {
        const created = await createBanner(payload, image);
        await mutate(ADMIN_BANNERS_ENDPOINT);
        setStatusMessage('Banner created successfully.');
        navigate(`/banners/${created.id}/`);
        return;
      }

      await updateBanner(numericId as number, payload, image);
      await mutate(ADMIN_BANNERS_ENDPOINT);
      await mutate(`${ADMIN_BANNERS_ENDPOINT}${numericId}/`);
      setStatusMessage('Banner saved successfully.');
      reset({ ...values, bannerImageFile: null });
    } catch (e: any) {
      setSaveError(e?.message || 'Failed to save banner.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container>
      <Header>
        <BackButton
          variation={ButtonVariations.Icon}
          size={ButtonSizes.Small}
          onClick={() => navigate('/banners/')}
          disabled={saving}
        >
          <ArrowLeftIcon height={12} width={12} label="back icon" />
          View all banners
        </BackButton>
        <HeaderText>
          <Title>{isNew ? 'Create Banner' : `Edit Banner #${bannerId}`}</Title>
          <Description>
            Preview updates live from the current form values.
          </Description>
        </HeaderText>
      </Header>

      {error && (
        <StatusMessage type={StatusTypes.Error} visible>
          Failed to load banner.
        </StatusMessage>
      )}

      {statusMessage && (
        <StatusMessage type={StatusTypes.Success} visible>
          {statusMessage}
        </StatusMessage>
      )}

      {saveError && (
        <StatusMessage type={StatusTypes.Error} visible>
          {saveError}
        </StatusMessage>
      )}

      {isLoading && !isNew ? (
        <Loading size={LoadingSizes.Medium} />
      ) : (
        <>
          <Preview
            $background={previewValues.background}
            $textColor={previewValues.text_color}
          >
            <Text type={TextTypes.Heading4} color={previewValues.text_color}>
              {previewValues.title || 'Banner title'}
            </Text>
            <Text color={previewValues.text_color}>
              {previewValues.text || 'Banner body preview text'}
            </Text>
            {previewImage && (
              <img
                src={previewImage}
                alt={previewValues.image_alt || 'Banner image preview'}
                style={{ maxHeight: 180, objectFit: 'contain' }}
              />
            )}
          </Preview>

          <EditBannerCard width={CardSizes.FullWidth}>
            <CardHeader asContainer center={false} align="stretch">
              <CardHeaderTopRow>
                <Controller
                  name="active"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Switch
                      inputRef={activeSwitchRef as RefObject<HTMLButtonElement>}
                      label="Active"
                      labelInline
                      checked={value}
                      onCheckedChange={onChange}
                    />
                  )}
                />
                <Button
                  appearance={ButtonAppearance.Primary}
                  size={ButtonSizes.Small}
                  onClick={handleSubmit(onSave)}
                  disabled={saving}
                  loading={saving}
                >
                  Save
                </Button>
              </CardHeaderTopRow>
            </CardHeader>
            <CardContent scrollable align="stretch" textAlign="left">
              <TextInput
                label="Internal name"
                required
                error={errors?.name?.message}
                {...registerInput({
                  register,
                  name: 'name',
                  options: { required: 'Required' },
                })}
              />
              <TextInput
                label="Title"
                {...registerInput({ register, name: 'title' })}
              />
              <TextArea
                label="Text"
                rows={3}
                {...registerInput({ register, name: 'text' })}
              />
              <TextInput
                label="Text color"
                placeholder="#000000"
                {...registerInput({ register, name: 'text_color' })}
              />
              <TextInput
                label="Background"
                placeholder="linear-gradient(...) or #hex"
                {...registerInput({ register, name: 'background' })}
              />
              <TextInput
                label="CTA 1 Text"
                {...registerInput({ register, name: 'cta_1_text' })}
              />
              <TextInput
                label="CTA 1 URL"
                {...registerInput({ register, name: 'cta_1_url' })}
              />
              <TextInput
                label="CTA 2 Text"
                {...registerInput({ register, name: 'cta_2_text' })}
              />
              <TextInput
                label="CTA 2 URL"
                {...registerInput({ register, name: 'cta_2_url' })}
              />
              <Controller
                name="type"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Dropdown
                    id="banner_type"
                    label="Type"
                    placeholder="Select type"
                    value={value}
                    options={[
                      { label: 'small', value: 'small' },
                      { label: 'large', value: 'large' },
                    ]}
                    onValueChange={next => onChange(next as Banner['type'])}
                    cannotError
                  />
                )}
              />
              <Controller
                name="custom_filter"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Dropdown
                    id="banner_custom_filter"
                    label="Custom filter"
                    placeholder="Select filter"
                    value={value}
                    options={customFilterOptions}
                    onValueChange={onChange}
                    cannotError
                  />
                )}
              />
              <TextInput
                label="Filter priority"
                type="number"
                {...registerInput({ register, name: 'filter_priority' })}
              />
              <TextInput
                label="Activation time (ISO)"
                placeholder="2026-04-23T12:00:00Z"
                {...registerInput({ register, name: 'activation_time' })}
              />
              <TextInput
                label="Expiration time (ISO)"
                placeholder="2026-05-23T12:00:00Z"
                {...registerInput({ register, name: 'expiration_time' })}
              />
              <TextInput
                label="Image alt text"
                {...registerInput({ register, name: 'image_alt' })}
              />
              <Controller
                name="bannerImageFile"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <ImageUploadField
                    id="bannerImage"
                    label="Banner image"
                    file={value}
                    onFileChange={onChange}
                    existingImageUrl={resolveBannerImageUrl(data?.image)}
                    disabled={saving}
                    compact
                    helperText="JPEG, PNG, WebP, or GIF"
                  />
                )}
              />
            </CardContent>
          </EditBannerCard>
        </>
      )}
    </Container>
  );
}

export default BannerFormPage;
