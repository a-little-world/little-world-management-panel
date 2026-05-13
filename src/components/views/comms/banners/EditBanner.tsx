import {
  ArrowLeftIcon,
  BannerTypes,
  Button,
  ButtonAppearance,
  ButtonSizes,
  ButtonVariations,
  CardContent,
  Dropdown,
  ImageSearchIcon,
  InputWidth,
  Loading,
  LoadingSizes,
  StatusMessage,
  StatusTypes,
  Switch,
  Text,
  TextArea,
  TextInput,
  Toast,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { isValid, parseISO } from 'date-fns';
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
  resolveBannerImageUrl,
  updateBanner,
} from '../../../../api/banners';
import { registerInput } from '../../../../store';
import { DatePicker } from '../../../atoms/DatePicker';
import { ImageUploadField } from '../../../atoms/ImageUploadField';
import {
  AddBackgroundImageButton,
  BackButton,
  BackgroundInputRow,
  Container,
  CtaGrid,
  DateField,
  DatesRow,
  EditableFields,
  FormStack,
  Header,
  HeaderActions,
  HeaderTopRow,
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

const BERLIN_TZ = 'Europe/Berlin';

/** Berlin wall-clock fields for an instant (DST-aware). */
function berlinParts(utcMs: number) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: BERLIN_TZ,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const p = Object.fromEntries(dtf.formatToParts(new Date(utcMs)).map(x => [x.type, x.value]));
  return {
    y: Number(p.year),
    mo: Number(p.month) - 1,
    d: Number(p.day),
    h: Number(p.hour),
    mi: Number(p.minute),
    s: Number(p.second),
  };
}

/** Treat (y, mo, d, h, mi, s, ms) as a clock time in Europe/Berlin; return that instant as ISO UTC. */
function berlinWallToIso(
  y: number,
  mo: number,
  d: number,
  h: number,
  mi: number,
  s: number,
  ms: number,
): string {
  const utcGuess = Date.UTC(y, mo, d, h, mi, s, ms);
  const wall = berlinParts(utcGuess);
  const wallAsUtc = Date.UTC(wall.y, wall.mo, wall.d, wall.h, wall.mi, wall.s);
  return new Date(utcGuess - (wallAsUtc - utcGuess)).toISOString();
}

function parseIsoToDate(value: string | null | undefined): Date | null {
  if (value == null || value === '') return null;
  const d = parseISO(value);
  if (!isValid(d)) return null;
  const { y, mo, d: day } = berlinParts(d.getTime());
  return new Date(y, mo, day);
}

function toActivationIso(date: Date | null): string | null {
  if (!date) return null;
  return berlinWallToIso(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

function toExpirationIso(date: Date | null): string | null {
  if (!date) return null;
  return berlinWallToIso(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function getSafePreviewBackground(value: string | null | undefined): string | undefined {
  const raw = value?.trim();
  if (!raw) return undefined;
  if (typeof window === 'undefined' || !window.CSS?.supports) return raw;
  return window.CSS.supports('background', raw) ? raw : undefined;
}

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
  backgroundImageFile: null,
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
    Boolean(previewValues.bannerImageFile) || Boolean(data?.image);
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

  const previewImage = localPreviewUrl || resolveBannerImageUrl(data?.image);
  const previewBackgroundCss = backgroundObjectUrl
    ? `url(${backgroundObjectUrl})`
    : getSafePreviewBackground(previewValues.background);

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

      if (isNew) {
        const created = await createBanner(payload, image, backgroundImage);
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
      );
      await mutate(ADMIN_BANNERS_ENDPOINT);
      await mutate(`${ADMIN_BANNERS_ENDPOINT}${numericId}/`);
      setSaveToast({
        id: Date.now(),
        headline: 'Success',
        title: 'Banner saved successfully.',
      });
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

  return (
    <Container>
      <Header>
        <HeaderTopRow>
          <BackButton
            variation={ButtonVariations.Icon}
            size={ButtonSizes.Small}
            onClick={() => navigate('/banners/')}
            disabled={saving}
          >
            <ArrowLeftIcon height={12} width={12} label="back icon" />
            View all banners
          </BackButton>
          <Text tag="h1" type={TextTypes.Heading4}>
            {pageTitle}
          </Text>
          <HeaderActions>
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
          </HeaderActions>
        </HeaderTopRow>
      </Header>

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
              secondaryCtaText={previewValues.cta_2_text || undefined}
              secondaryCtaUrl={previewValues.cta_2_url || undefined}
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
                        <Dropdown
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
                        <Dropdown
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
                      placeholder="#000000"
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
                  <TextInput
                    label="CTA 1 text"
                    {...registerInput({ register, name: 'cta_1_text' })}
                  />
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
                  <TextInput
                    label="CTA 2 text"
                    {...registerInput({ register, name: 'cta_2_text' })}
                  />
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
                        {...registerInput({ register, name: 'background' })}
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
                              Boolean(file) || Boolean(data?.image);
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
                        onFileChange={onChange}
                        existingImageUrl={resolveBannerImageUrl(data?.image)}
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
