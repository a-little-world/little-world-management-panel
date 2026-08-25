import {
  BannerTypes,
  Button,
  ButtonAppearance,
  ButtonSizes,
  ButtonVariations,
  CardContent,
  CloseIcon,
  ImageSearchIcon,
  InputWidth,
  Loading,
  LoadingSizes,
  Select,
  StatusMessage,
  StatusTypes,
  Switch,
  TextArea,
  TextInput,
  Toast,
} from '@a-little-world/little-world-design-system';
import React, { RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from 'styled-components';
import useSWR, { mutate } from 'swr';

import {
  ADMIN_BANNERS_ENDPOINT,
  Banner as ApiBanner,
  BannerPayload,
  createBanner,
  fetchAdminBanner,
  resolveBannerBackgroundCss,
  resolveBannerImageUrl,
  updateBanner,
} from '../../../../api/banners';
import {
  parseIsoToDate,
  toEndOfDayIso as toExpirationIso,
  toStartOfDayIso as toActivationIso,
} from '../../../../helpers/berlinDates';
import { BANNERS_ROUTE } from '../../../../router/routes';
import { registerInput } from '../../../../store';
import { DatePicker } from '../../../atoms/DatePicker';
import { ImageUploadField } from '../../../atoms/ImageUploadField';
import { usePageHeader } from '../../../blocks/LayoutHeaderContext';
import {
  AddBackgroundImageButton,
  BackgroundInputRow,
  ClearBackgroundImageButton,
  Container,
  CtaColumn,
  CtaGrid,
  CtaTextColorRow,
  DateField,
  DatesRow,
  EditableFields,
  FormStack,
  HiddenFileInput,
  ImagesRow,
  LeftStack,
  PreviewBanner,
  PreviewBannerFrame,
  TextBodyColumn,
  TitleColorStack,
  TitleTextBlockRow,
  TopMetaColumn,
  TopMetaRow,
} from './EditBanner.styles';

type BannerFormValues = BannerPayload & {
  bannerImageFile: File | null;
  backgroundImageFile: File | null;
};

function isCssUrlBackground(value: string | null | undefined): boolean {
  return Boolean(value?.trim().match(/^url\s*\(/i));
}

function getSafePreviewBackground(
  value: string | null | undefined,
): string | undefined {
  const raw = value?.trim();
  if (!raw) return undefined;
  if (typeof window === 'undefined' || !window.CSS?.supports) return raw;
  return window.CSS.supports('background', raw) ? raw : undefined;
}

const defaultValues: BannerFormValues = {
  name: '',
  active: false,
  title: '',
  text: '',
  text_color: '#000000',
  background: '',
  cta_1_url: '',
  cta_1_text: '',
  cta_1_color: '',
  cta_2_url: '',
  cta_2_text: '',
  cta_2_color: '',
  type: 'small',
  image_alt: '',
  activation_time: null,
  expiration_time: null,
  custom_filter: 'none',
  filter_priority: 0,
  bannerImageFile: null,
  backgroundImageFile: null,
};

const buildPayload = (values: BannerFormValues): BannerPayload => ({
  name: values.name,
  active: values.active,
  title: values.title,
  text: values.text,
  text_color: values.text_color.trim() || '#000000',
  background: values.background,
  cta_1_url: values.cta_1_url,
  cta_1_text: values.cta_1_text,
  cta_1_color: values.cta_1_color.trim(),
  cta_2_url: values.cta_2_url,
  cta_2_text: values.cta_2_text,
  cta_2_color: values.cta_2_color.trim(),
  type: values.type,
  image_alt: values.image_alt,
  activation_time: values.activation_time || null,
  expiration_time: values.expiration_time || null,
  custom_filter: values.custom_filter,
  filter_priority: Number(values.filter_priority) || 0,
});

function EditBanner() {
  const { bannerId } = useParams();
  const navigate = useNavigate();
  const activeSwitchRef = useRef<HTMLButtonElement>(null);
  const backgroundFileInputRef = useRef<HTMLInputElement>(null);
  const isNew = bannerId === 'new';
  const numericId = bannerId && !isNew ? Number(bannerId) : null;
  const theme = useTheme();

  const [saveToast, setSaveToast] = useState<{
    id: number;
    headline: string;
    title: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [backgroundObjectUrl, setBackgroundObjectUrl] = useState<string | null>(
    null,
  );
  const [clearBannerImage, setClearBannerImage] = useState(false);
  const [clearBackground, setClearBackground] = useState(false);

  const { data, isLoading, error } = useSWR<ApiBanner>(
    numericId ? `${ADMIN_BANNERS_ENDPOINT}${numericId}/` : null,
    () => fetchAdminBanner(numericId as number),
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<BannerFormValues>({
    defaultValues: isNew
      ? defaultValues
      : {
          ...defaultValues,
          ...data,
          bannerImageFile: null,
          backgroundImageFile: null,
        },
  });

  useEffect(() => {
    if (isNew || !data) return;
    reset({
      ...defaultValues,
      ...data,
      bannerImageFile: null,
      backgroundImageFile: null,
    });
    setClearBannerImage(false);
    setClearBackground(false);
  }, [isNew, data, reset]);

  const customFilterOptions = useMemo(
    () =>
      (data?.options?.custom_filter ?? [{ tag: 'none', value: 'none' }]).map(
        (item: { tag: string; value: string }) => ({
          label: item.tag,
          value: item.value,
        }),
      ),
    [data],
  );

  const previewValues = watch();
  const backgroundImageFile = watch('backgroundImageFile');

  const hasBannerImage =
    Boolean(previewValues.bannerImageFile) ||
    (Boolean(data?.image) && !clearBannerImage);
  const hasBackgroundImage =
    Boolean(backgroundImageFile) ||
    (isCssUrlBackground(previewValues.background) && !clearBackground);
  const cta1NeedsUrl = Boolean(previewValues.cta_1_text?.trim());
  const cta2NeedsUrl = Boolean(previewValues.cta_2_text?.trim());
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

  useEffect(() => {
    if (!backgroundImageFile) {
      setBackgroundObjectUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(backgroundImageFile);
    setBackgroundObjectUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [backgroundImageFile]);

  const previewImage =
    localPreviewUrl ||
    (clearBannerImage ? null : resolveBannerImageUrl(data?.image));
  const previewBackgroundCss = backgroundObjectUrl
    ? `url(${backgroundObjectUrl})`
    : clearBackground
      ? undefined
      : getSafePreviewBackground(
          resolveBannerBackgroundCss(previewValues.background),
        );

  const clearBackgroundImage = () => {
    setValue('backgroundImageFile', null, { shouldDirty: true });
    setValue('background', '', { shouldDirty: true });
    setClearBackground(true);
    if (backgroundFileInputRef.current) {
      backgroundFileInputRef.current.value = '';
    }
  };

  const pageTitle = isNew
    ? 'Create Banner'
    : `Edit ${previewValues.name || data?.name || 'Banner'}`;

  const onSave = async (values: BannerFormValues) => {
    setSaving(true);
    setSaveToast(null);

    try {
      const payload = buildPayload(values);
      const image = values.bannerImageFile ?? undefined;
      const backgroundImage = values.backgroundImageFile ?? undefined;
      const imageOptions = {
        clearImage: clearBannerImage && !image,
        clearBackground: clearBackground && !backgroundImage,
      };

      if (isNew) {
        const created = await createBanner(
          payload,
          image,
          backgroundImage,
          imageOptions,
        );
        await mutate(ADMIN_BANNERS_ENDPOINT);
        setSaveToast({
          id: Date.now(),
          headline: 'Success',
          title: 'Banner created successfully.',
        });
        navigate(`/banners/${created.id}/`);
        return;
      }

      const updated = await updateBanner(
        numericId as number,
        payload,
        image,
        backgroundImage,
        imageOptions,
      );
      await mutate(ADMIN_BANNERS_ENDPOINT);
      await mutate(`${ADMIN_BANNERS_ENDPOINT}${numericId}/`);
      setSaveToast({
        id: Date.now(),
        headline: 'Success',
        title: 'Banner saved successfully.',
      });
      setClearBannerImage(false);
      setClearBackground(false);
      reset({
        ...defaultValues,
        ...updated,
        bannerImageFile: null,
        backgroundImageFile: null,
      });
      if (backgroundFileInputRef.current) {
        backgroundFileInputRef.current.value = '';
      }
    } catch (e: any) {
      setSaveToast({
        id: Date.now(),
        headline: 'Error',
        title: e?.message || 'Failed to save banner.',
      });
    } finally {
      setSaving(false);
    }
  };

  usePageHeader({
    breadcrumbs: {
      items: [{ label: 'Banners', to: BANNERS_ROUTE }],
      current: pageTitle,
    },
    actions: (
      <>
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
              disabled={saving}
              cannotError
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
      </>
    ),
  });

  return (
    <Container>
      {error && (
        <StatusMessage type={StatusTypes.Error} visible>
          Failed to load banner.
        </StatusMessage>
      )}

      {isLoading && !isNew ? (
        <Loading size={LoadingSizes.Medium} />
      ) : (
        <>
          <PreviewBannerFrame $compact={previewValues.type === 'large'}>
            <PreviewBanner
              $compact={previewValues.type === 'large'}
              title={previewValues.title || 'Banner title'}
              description={previewValues.text || 'Banner body preview text'}
              type={
                previewValues.type === 'large'
                  ? BannerTypes.Large
                  : BannerTypes.Small
              }
              background={previewBackgroundCss}
              textColor={previewValues.text_color || undefined}
              image={previewImage || undefined}
              imageAlt={previewValues.image_alt || 'Banner image preview'}
              primaryCtaText={previewValues.cta_1_text || undefined}
              primaryCtaUrl={previewValues.cta_1_url || undefined}
              primaryCtaColor={previewValues.cta_1_color || undefined}
              secondaryCtaText={previewValues.cta_2_text || undefined}
              secondaryCtaUrl={previewValues.cta_2_url || undefined}
              secondaryCtaColor={previewValues.cta_2_color || undefined}
            />
          </PreviewBannerFrame>

          <EditableFields>
            <CardContent align="stretch" textAlign="left">
              <FormStack>
                <TopMetaRow>
                  <TopMetaColumn>
                    <TextInput
                      label="Internal name"
                      required
                      error={errors?.name?.message}
                      width={InputWidth.Large}
                      {...registerInput({
                        register,
                        name: 'name',
                        options: { required: 'Required' },
                      })}
                    />
                    <Controller
                      name="type"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <Select
                          key={`banner_type_${String(value ?? 'small')}`}
                          id="banner_type"
                          label="Type"
                          placeholder="Select type"
                          value={value ?? 'small'}
                          options={[
                            { label: 'small', value: 'small' },
                            { label: 'large', value: 'large' },
                          ]}
                          onValueChange={next =>
                            onChange(next as ApiBanner['type'])
                          }
                          cannotError
                          maxWidth="120px"
                        />
                      )}
                    />
                  </TopMetaColumn>
                  <TopMetaColumn>
                    <Controller
                      name="custom_filter"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <Select
                          id="banner_custom_filter"
                          label="Custom filter"
                          placeholder="Select filter"
                          labelTooltip="Banner will only be shown to users who match the selected filter."
                          value={value}
                          options={customFilterOptions}
                          onValueChange={onChange}
                          cannotError
                        />
                      )}
                    />
                    <TextInput
                      label="Filter priority"
                      labelTooltip="The higher the number, the higher the priority of the filter."
                      type="number"
                      width={InputWidth.Small}
                      {...registerInput({ register, name: 'filter_priority' })}
                    />
                  </TopMetaColumn>
                </TopMetaRow>

                <TitleTextBlockRow>
                  <TitleColorStack>
                    <TextInput
                      label="Title"
                      {...registerInput({ register, name: 'title' })}
                    />
                    <TextInput
                      label="Text color"
                      placeholder="#000 / rgba() / red"
                      width={InputWidth.Small}
                      {...registerInput({ register, name: 'text_color' })}
                    />
                  </TitleColorStack>
                  <TextBodyColumn>
                    <TextArea
                      label="Text"
                      rows={6}
                      {...registerInput({ register, name: 'text' })}
                    />
                  </TextBodyColumn>
                </TitleTextBlockRow>

                <CtaGrid>
                  <CtaColumn>
                    <CtaTextColorRow>
                      <TextInput
                        label="CTA 1 text"
                        {...registerInput({ register, name: 'cta_1_text' })}
                      />
                      <TextInput
                        label="CTA 1 color"
                        placeholder="#000 / rgba() / red"
                        width={InputWidth.Small}
                        {...registerInput({ register, name: 'cta_1_color' })}
                      />
                    </CtaTextColorRow>
                    <TextInput
                      label="CTA 1 URL"
                      required={cta1NeedsUrl}
                      error={errors?.cta_1_url?.message}
                      {...registerInput({
                        register,
                        name: 'cta_1_url',
                        options: {
                          deps: ['cta_1_text'],
                          validate: (url: string) => {
                            const t = getValues('cta_1_text');
                            if (t?.trim() && !url?.trim()) {
                              return 'Required when CTA 1 text is set';
                            }
                            return true;
                          },
                        },
                      })}
                    />
                  </CtaColumn>
                  <CtaColumn>
                    <CtaTextColorRow>
                      <TextInput
                        label="CTA 2 text"
                        {...registerInput({ register, name: 'cta_2_text' })}
                      />
                      <TextInput
                        label="CTA 2 color"
                        placeholder="#000 / rgba() / red"
                        width={InputWidth.Small}
                        {...registerInput({ register, name: 'cta_2_color' })}
                      />
                    </CtaTextColorRow>
                    <TextInput
                      label="CTA 2 URL"
                      required={cta2NeedsUrl}
                      error={errors?.cta_2_url?.message}
                      {...registerInput({
                        register,
                        name: 'cta_2_url',
                        options: {
                          deps: ['cta_2_text'],
                          validate: (url: string) => {
                            const t = getValues('cta_2_text');
                            if (t?.trim() && !url?.trim()) {
                              return 'Required when CTA 2 text is set';
                            }
                            return true;
                          },
                        },
                      })}
                    />
                  </CtaColumn>
                </CtaGrid>

                <DatesRow>
                  <Controller
                    name="activation_time"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <DateField>
                        <DatePicker
                          date={parseIsoToDate(value)}
                          setDate={d => onChange(toActivationIso(d))}
                          disabled={saving}
                          label="Activation date"
                          tooltipText="Saved as start of selected day in Europe/Berlin timezone (00:00). Banner can auto-activate once server time passes this."
                        />
                      </DateField>
                    )}
                  />
                  <Controller
                    name="expiration_time"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <DateField>
                        <DatePicker
                          date={parseIsoToDate(value)}
                          setDate={d => onChange(toExpirationIso(d))}
                          disabled={saving}
                          label="Expiration date"
                          tooltipText="Saved as end of selected day in Europe/Berlin timezone (23:59:59). Banner remains valid through this date and deactivates after this timestamp."
                        />
                      </DateField>
                    )}
                  />
                </DatesRow>

                <ImagesRow>
                  <LeftStack>
                    <BackgroundInputRow>
                      <TextInput
                        label="Background"
                        placeholder="Color, gradient, or url..."
                        labelTooltip="Can be any valid CSS background value, e.g. color (#000000), gradient (linear-gradient(#e66465, #9198e5)), or image URL (url(PATH_OF_IMAGE))."
                        {...registerInput({
                          register,
                          name: 'background',
                          options: {
                            onChange: () => {
                              // Manual CSS edits supersede a pending clear/upload.
                              setClearBackground(false);
                            },
                          },
                        })}
                      />
                      <HiddenFileInput
                        ref={backgroundFileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={e => {
                          const file = e.target.files?.[0] ?? null;
                          setValue('backgroundImageFile', file, {
                            shouldDirty: true,
                          });
                          if (file) setClearBackground(false);
                        }}
                      />
                      <AddBackgroundImageButton
                        type="button"
                        variation={ButtonVariations.Icon}
                        disabled={saving}
                        onClick={() => backgroundFileInputRef.current?.click()}
                        title="Upload background image"
                        size={ButtonSizes.Small}
                      >
                        <ImageSearchIcon
                          borderColor={theme.color.text.accent}
                          color={theme.color.text.accent}
                          circular
                          label="add background image"
                        />
                      </AddBackgroundImageButton>
                      {hasBackgroundImage && (
                        <ClearBackgroundImageButton
                          variation={ButtonVariations.Circle}
                          size={ButtonSizes.Medium}
                          backgroundColor={theme.color.text.error}
                          disabled={saving}
                          onClick={clearBackgroundImage}
                        >
                          <CloseIcon
                            width={16}
                            height={16}
                            label="remove background image"
                          />
                        </ClearBackgroundImageButton>
                      )}
                    </BackgroundInputRow>
                    <TextInput
                      label="Image alt text"
                      required={hasBannerImage}
                      error={errors?.image_alt?.message}
                      width={InputWidth.Medium}
                      {...registerInput({
                        register,
                        name: 'image_alt',
                        options: {
                          deps: ['bannerImageFile'],
                          validate: (alt: string) => {
                            const file = getValues('bannerImageFile');
                            const hasImage =
                              Boolean(file) ||
                              (Boolean(data?.image) && !clearBannerImage);
                            if (hasImage && !alt?.trim()) {
                              return 'Required when a banner image is set';
                            }
                            return true;
                          },
                        },
                      })}
                    />
                  </LeftStack>
                  <Controller
                    name="bannerImageFile"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <ImageUploadField
                        id="bannerImage"
                        label="Banner image"
                        file={value}
                        onFileChange={file => {
                          onChange(file);
                          if (file) setClearBannerImage(false);
                          else if (data?.image) setClearBannerImage(true);
                        }}
                        existingImageUrl={
                          clearBannerImage
                            ? null
                            : resolveBannerImageUrl(data?.image)
                        }
                        disabled={saving}
                        compact
                        helperText="JPEG, PNG, WebP, or GIF"
                      />
                    )}
                  />
                </ImagesRow>
              </FormStack>
            </CardContent>
          </EditableFields>
        </>
      )}
      {saveToast && (
        <Toast
          key={saveToast.id}
          headline={saveToast.headline}
          title={saveToast.title}
          onClose={() => setSaveToast(null)}
        />
      )}
    </Container>
  );
}

export default EditBanner;
