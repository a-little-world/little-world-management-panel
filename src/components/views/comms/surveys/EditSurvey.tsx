import {
  Button,
  ButtonAppearance,
  ButtonSizes,
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
import { PlusIcon, TrashIcon } from '@heroicons/react/20/solid';
import React, { useEffect, useRef, useState } from 'react';
import {
  Control,
  Controller,
  FieldErrors,
  useFieldArray,
  useForm,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR, { mutate } from 'swr';

import {
  ADMIN_SURVEY_CAMPAIGNS_ENDPOINT,
  createSurveyCampaign,
  fetchSurveyAudienceOptions,
  fetchSurveyCampaign,
  SurveyAudienceFilterOption,
  SurveyAudienceOptions,
  SurveyAudienceType,
  SurveyCampaign,
  SurveyCampaignPayload,
  SurveyTrigger,
  SurveyEligibleAfterEvent,
  SurveyQuestion,
  updateSurveyCampaign,
} from '../../../../api/surveys';
import {
  parseIsoToDate,
  toEndOfDayIso,
  toStartOfDayIso,
} from '../../../../helpers/berlinDates';
import { SURVEYS_ROUTE } from '../../../../router/routes';
import { registerInput } from '../../../../store';
import { DatePicker } from '../../../atoms/DatePicker';
import StructureRail from '../../../atoms/StructureRail';
import { usePageHeader } from '../../../blocks/LayoutHeaderContext';
import {
  DeleteSectionBtn,
  Divider,
  EditorRoot,
  EmptyCallout,
  EmptyCalloutBody,
  EmptyCalloutText,
  EmptyCalloutTitle,
  FormStack,
  MainPane,
  PaneHeading,
  PaneHint,
  PaneRoot,
  SectionMeta,
  SectionMetaLabel,
  SectionNumGradient,
  SectionTitle,
  TopBarDivider,
  TwoCol,
  TwoPaneLayout,
} from '../../../atoms/EditorShell.styles';
import {
  CopyRow,
  InlineIcon,
  LoadingWrap,
  LockedNotice,
} from './EditSurvey.styles';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * The form mirrors the API shape rather than flattening it: `copy` and each question's label
 * are `{de, en}` blocks, so a field path is `copy.title.de` and nothing has to be reassembled
 * on save.
 */
type LocalizedValue = { de: string; en: string };

type QuestionFormValues = {
  id: string;
  label: LocalizedValue;
  placeholder: LocalizedValue;
  required: boolean;
};

type SurveyFormValues = {
  slug: string;
  name: string;
  copy: {
    title: LocalizedValue;
    description: LocalizedValue;
    submit_button: LocalizedValue;
  };
  scale: number;
  /** The rating question's label. Edited on the details pane, since the rating is implicit. */
  ratingLabel: LocalizedValue;
  /**
   * Id of the rating question as stored. Ids are frozen once answered, so a campaign whose
   * rating is called something else must keep that name rather than be renamed to `rating`.
   */
  ratingId: string;
  questions: QuestionFormValues[];
  /**
   * Questions this editor cannot render — choice questions, or a second rating — carried
   * through a save untouched. Without this, opening a campaign built in Django admin and
   * saving it would silently delete them.
   */
  preservedQuestions: SurveyQuestion[];
  /** Question ids in their stored order, so a round-trip does not reshuffle the card. */
  questionOrder: string[];
  audience_type: 'all' | 'company' | 'filter';
  audience_value: string;
  trigger: SurveyTrigger;
  eligible_after_event: SurveyEligibleAfterEvent;
  eligible_after_since: string | null;
  /** Preserved on edit so saving post-call cannot flatten it to once-per-user. */
  repeat_scope: 'user' | 'context';
  context_type: '' | 'live_session' | 'match';
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  max_shows: number;
};

// ---------------------------------------------------------------------------
// Constants + helpers
// ---------------------------------------------------------------------------

/** Radix Select forbids an empty value, so the "Immediately" option carries this instead. */
const NO_ELIGIBILITY_EVENT = 'none';

/**
 * Dropdown contents come from `/api/admin/survey_campaigns/options/`, which serves the
 * backend enums directly. They were hardcoded here once and drifted — labels described a
 * rule that had changed, and one trigger was missing entirely, so a campaign type the
 * backend supported could not be created at all.
 *
 * `keepValue` guarantees the campaign's stored value is always present, so opening an older
 * campaign and saving it unchanged cannot silently snap it to a different trigger.
 */
function selectOptions(
  served: SurveyAudienceFilterOption[] | undefined,
  keepValue: string,
): { label: string; value: string }[] {
  const options = (served ?? []).map(option => ({
    label: option.label,
    value: option.value === '' ? NO_ELIGIBILITY_EVENT : option.value,
  }));
  const current = keepValue === '' ? NO_ELIGIBILITY_EVENT : keepValue;
  if (current && !options.some(option => option.value === current)) {
    options.push({ label: current, value: current });
  }
  return options;
}

const MIN_SCALE = 2;
const MAX_SCALE = 10;

/** An offer has to be shown at least once to be an offer at all. */
const MIN_MAX_SHOWS = 1;
const MAX_MAX_SHOWS = 10;
const DEFAULT_MAX_SHOWS = 3;

/** The rating question is implicit: every campaign has one, so it is never in the rail. */
const RATING_QUESTION_ID = 'rating';

const AUDIENCE_PREFIX = {
  company: 'company:',
  filter: 'filter:',
} as const;

function encodeAudience(type: SurveyAudienceType, value: string) {
  if (type === 'company') return `${AUDIENCE_PREFIX.company}${value}`;
  if (type === 'filter') return `${AUDIENCE_PREFIX.filter}${value}`;
  return 'all';
}

function decodeAudience(encoded: string): {
  audience_type: SurveyAudienceType;
  audience_value: string;
} {
  if (encoded.startsWith(AUDIENCE_PREFIX.company)) {
    return {
      audience_type: 'company',
      audience_value: encoded.slice(AUDIENCE_PREFIX.company.length),
    };
  }
  if (encoded.startsWith(AUDIENCE_PREFIX.filter)) {
    return {
      audience_type: 'filter',
      audience_value: encoded.slice(AUDIENCE_PREFIX.filter.length),
    };
  }
  return { audience_type: 'all', audience_value: '' };
}

function audienceSelectOptions(
  options: SurveyAudienceOptions | undefined,
  currentType: SurveyAudienceType,
  currentValue: string,
) {
  const companies = new Set(options?.companies ?? []);
  if (currentType === 'company' && currentValue) companies.add(currentValue);

  const rows: { label: string; value: string }[] = [
    { label: 'Everyone', value: 'all' },
    ...[...companies].sort().map(company => ({
      label: `Company · ${company}`,
      value: encodeAudience('company', company),
    })),
    ...(options?.filters ?? []).map(filter => ({
      label: filter.label,
      value: encodeAudience('filter', filter.value),
    })),
  ];

  // A stored filter that is no longer offered still has to appear, or the select
  // would snap to Everyone on an unchanged save.
  const encoded = encodeAudience(currentType, currentValue);
  if (encoded !== 'all' && !rows.some(row => row.value === encoded)) {
    rows.push({ label: currentValue, value: encoded });
  }
  return rows;
}

const emptyLocalized = (): LocalizedValue => ({ de: '', en: '' });

/**
 * German letters the backend's ascii-only patterns would otherwise drop, so "Übung" becomes
 * "uebung" rather than "bung".
 */
const TRANSLITERATIONS: [RegExp, string][] = [
  [/ä/g, 'ae'],
  [/ö/g, 'oe'],
  [/ü/g, 'ue'],
  [/ß/g, 'ss'],
];

const asciify = (value: string) =>
  TRANSLITERATIONS.reduce(
    (text, [pattern, replacement]) => text.replace(pattern, replacement),
    value.toLowerCase(),
  ).replace(/[^a-z0-9\s_-]/g, '');

/**
 * Campaign slug: kebab-case. `SurveyCampaign._validate_slug` rejects underscores because the
 * slug is reused in URL path segments.
 */
function slugify(value: string) {
  return asciify(value)
    .trim()
    .replace(/[\s-]+/g, '-');
}

/**
 * Question id: snake_case. Frozen once answered, and used as a JSON key and in `answers__<id>`
 * ORM lookups, which is why `QUESTION_ID_PATTERN` is `^[a-z][a-z0-9_]{0,39}$` — hyphens are
 * rejected.
 *
 * Deliberately not `slugify`: the two rules are exact opposites, and sharing one helper is
 * what produced ids like `how-was-your-call` that the backend refused to save.
 */
function questionIdFrom(label: string, index: number) {
  const candidate = asciify(label)
    .trim()
    .replace(/[\s-]+/g, '_')
    .replace(/^_+/, '')
    .slice(0, 40);
  return /^[a-z]/.test(candidate) ? candidate : `question_${index + 1}`;
}

const localizedFrom = (value?: {
  de?: string;
  en?: string;
}): LocalizedValue => ({
  de: value?.de ?? '',
  en: value?.en ?? '',
});

const defaultQuestion = (): QuestionFormValues => ({
  id: '',
  label: emptyLocalized(),
  placeholder: emptyLocalized(),
  required: false,
});

const defaultFormValues: SurveyFormValues = {
  slug: '',
  name: '',
  copy: {
    title: emptyLocalized(),
    description: emptyLocalized(),
    submit_button: emptyLocalized(),
  },
  scale: 5,
  ratingLabel: emptyLocalized(),
  ratingId: RATING_QUESTION_ID,
  questions: [],
  preservedQuestions: [],
  questionOrder: [],
  audience_type: 'all',
  audience_value: '',
  trigger: 'on_session',
  eligible_after_event: '',
  eligible_after_since: null,
  repeat_scope: 'user',
  context_type: '',
  active: false,
  starts_at: null,
  ends_at: null,
  max_shows: DEFAULT_MAX_SHOWS,
};

function campaignToFormValues(campaign: SurveyCampaign): SurveyFormValues {
  const ratingQuestion = campaign.questions.find(q => q.type === 'rating');
  const editable = new Set(
    campaign.questions
      .filter(
        question => question === ratingQuestion || question.type === 'text',
      )
      .map(question => question.id),
  );
  return {
    slug: campaign.slug,
    name: campaign.name,
    copy: {
      title: localizedFrom(campaign.copy?.title),
      description: localizedFrom(campaign.copy?.description),
      submit_button: localizedFrom(campaign.copy?.submit_button),
    },
    scale: campaign.scale,
    ratingLabel: localizedFrom(ratingQuestion?.label),
    ratingId: ratingQuestion?.id || RATING_QUESTION_ID,
    preservedQuestions: campaign.questions.filter(
      question => !editable.has(question.id),
    ),
    questionOrder: campaign.questions.map(question => question.id),
    questions: campaign.questions
      .filter(q => q.type === 'text')
      .map(q => ({
        id: q.id,
        label: localizedFrom(q.label),
        placeholder: localizedFrom(q.placeholder),
        required: q.required,
      })),
    audience_type: campaign.audience_type,
    audience_value: campaign.audience_value,
    trigger: campaign.trigger,
    eligible_after_event: campaign.eligible_after_event,
    eligible_after_since: campaign.eligible_after_since,
    repeat_scope: campaign.repeat_scope,
    context_type: campaign.context_type,
    active: campaign.active,
    starts_at: campaign.starts_at,
    ends_at: campaign.ends_at,
    max_shows: campaign.max_shows,
  };
}

/** Drop a language that was left entirely blank so the backend sees "no English" cleanly. */
function pruneLocalized(value?: LocalizedValue) {
  const de = value?.de?.trim() ?? '';
  const en = value?.en?.trim() ?? '';
  const pruned: { de?: string; en?: string } = { de };
  if (en) pruned.en = en;
  return pruned;
}

function formValuesToPayload(values: SurveyFormValues): SurveyCampaignPayload {
  const ratingLabel = values.ratingLabel ?? emptyLocalized();
  const order = values.questionOrder ?? [];
  // Anything the editor did not create keeps its stored position; new questions go last in
  // the order they were added. `sort` is stable, so equal ranks preserve that order.
  const rank = (question: SurveyQuestion) => {
    const index = order.indexOf(question.id);
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  };

  const questions: SurveyQuestion[] = [
    {
      id: values.ratingId || RATING_QUESTION_ID,
      type: 'rating' as const,
      required: true,
      label: pruneLocalized(ratingLabel),
    },
    ...values.questions.map((question, index) => ({
      id: question.id || questionIdFrom(question.label.de, index),
      type: 'text' as const,
      required: question.required,
      label: pruneLocalized(question.label),
      placeholder: pruneLocalized(question.placeholder),
    })),
    ...(values.preservedQuestions ?? []),
  ].sort((a, b) => rank(a) - rank(b));

  return {
    slug: values.slug.trim(),
    name: values.name.trim(),
    copy: {
      title: pruneLocalized(values.copy.title),
      description: pruneLocalized(values.copy.description),
      submit_button: pruneLocalized(values.copy.submit_button),
    },
    scale: Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number(values.scale) || 5)),
    questions,
    audience_type: values.audience_type,
    audience_value:
      values.audience_type === 'all' ? '' : values.audience_value.trim(),
    trigger: values.trigger,
    eligible_after_event: values.eligible_after_event,
    eligible_after_since: values.eligible_after_event
      ? values.eligible_after_since
      : null,
    // New campaigns are once-per-user. Existing ones (post-call) keep the scope they arrived with.
    repeat_scope: values.repeat_scope,
    context_type: values.context_type,
    active: values.active,
    starts_at: values.starts_at,
    ends_at: values.ends_at,
    // Clamped into range. A blank field falls back to the default; a typed 0 becomes the
    // minimum rather than silently becoming 3, which is what `Number(x) || 3` used to do.
    max_shows: Math.min(
      MAX_MAX_SHOWS,
      Math.max(MIN_MAX_SHOWS, Number(values.max_shows) || DEFAULT_MAX_SHOWS),
    ),
  };
}

// ---------------------------------------------------------------------------
// LocalizedField — the same string in both languages, side by side
// ---------------------------------------------------------------------------

function LocalizedField({
  register,
  name,
  label,
  placeholderDe,
  placeholderEn,
  required,
  multiline,
  disabled,
}: {
  register: UseFormRegister<SurveyFormValues>;
  /** Path of the `{de, en}` block; the two inputs register `<name>.de` and `<name>.en`. */
  name: string;
  label: string;
  placeholderDe?: string;
  placeholderEn?: string;
  required?: boolean;
  multiline?: boolean;
  disabled?: boolean;
}) {
  const Field = multiline ? TextArea : TextInput;
  return (
    <CopyRow>
      <Field
        label={`${label} (German)`}
        required={required}
        disabled={disabled}
        placeholder={placeholderDe}
        rows={multiline ? 3 : undefined}
        width={InputWidth.Large}
        {...registerInput({ register, name: `${name}.de` })}
      />
      <Field
        label={`${label} (English)`}
        disabled={disabled}
        placeholder={placeholderEn}
        rows={multiline ? 3 : undefined}
        width={InputWidth.Large}
        {...registerInput({ register, name: `${name}.en` })}
      />
    </CopyRow>
  );
}

// ---------------------------------------------------------------------------
// DetailsPane — everything that is not a question
// ---------------------------------------------------------------------------

function DetailsPane({
  register,
  control,
  errors,
  setValue,
  values,
  isNew,
  questionCount,
  onAddQuestion,
  saving,
  scaleLocked,
  audienceOptions,
}: {
  register: UseFormRegister<SurveyFormValues>;
  control: Control<SurveyFormValues>;
  errors: FieldErrors<SurveyFormValues>;
  setValue: UseFormSetValue<SurveyFormValues>;
  values: SurveyFormValues;
  isNew: boolean;
  questionCount: number;
  onAddQuestion: () => void;
  saving: boolean;
  scaleLocked: boolean;
  audienceOptions?: SurveyAudienceOptions;
}) {
  return (
    <PaneRoot>
      <div>
        <PaneHeading>Survey details</PaneHeading>
        <PaneHint>
          Who sees this survey, when, and what the card says. German is
          required; leave English blank and German is shown to everyone.
        </PaneHint>
      </div>

      <FormStack>
        <TwoCol>
          <TextInput
            label="Internal name"
            required
            placeholder="e.g. Acme service check-in"
            width={InputWidth.Large}
            error={errors.name?.message}
            {...registerInput({
              register,
              name: 'name',
              options: { required: 'Required' },
            })}
          />
          <TextInput
            label="Slug"
            required
            placeholder="auto-from-name"
            labelTooltip="Stable identifier used by analytics. Cannot be changed once responses exist."
            width={InputWidth.Large}
            disabled={!isNew}
            error={errors.slug?.message}
            {...registerInput({
              register,
              name: 'slug',
              options: { required: 'Required' },
            })}
          />
        </TwoCol>
        <TwoCol>
          <Controller
            name="starts_at"
            control={control}
            render={({ field: { value, onChange } }) => (
              <DatePicker
                date={parseIsoToDate(value)}
                setDate={d => onChange(toStartOfDayIso(d))}
                disabled={saving}
                label="Campaign start"
                tooltipText="Start of the selected day, Europe/Berlin. Leave empty to start as soon as the survey is active."
              />
            )}
          />
          <Controller
            name="ends_at"
            control={control}
            render={({ field: { value, onChange } }) => (
              <DatePicker
                date={parseIsoToDate(value)}
                setDate={d => onChange(toEndOfDayIso(d))}
                disabled={saving}
                label="Campaign end"
                tooltipText="End of the selected day, Europe/Berlin. After this, nobody is offered the survey — including people who would otherwise become eligible later. Leave empty to run until the survey is deactivated."
              />
            )}
          />
        </TwoCol>

        <Divider />
        <SectionTitle>Rating</SectionTitle>
        <PaneHint>Every survey opens with a star rating.</PaneHint>

        <TwoCol>
          <Controller
            name="scale"
            control={control}
            rules={{ required: 'Required' }}
            render={({ field: { value, onChange, onBlur, name, ref } }) => (
              <TextInput
                label="Scale"
                type="number"
                required
                min={MIN_SCALE}
                max={MAX_SCALE}
                step={1}
                disabled={scaleLocked || saving}
                labelTooltip={
                  scaleLocked
                    ? 'Scale is frozen because someone has already submitted a rating. Changing it would make existing scores mean something else.'
                    : 'Highest score a user can give. The star captions ("Terrible" … "Excellent") only fit a 5-star scale, so any other value shows bare stars.'
                }
                width={InputWidth.Large}
                id="survey_scale"
                name={name}
                value={value ?? ''}
                inputRef={ref as unknown as React.RefObject<HTMLInputElement>}
                onBlur={() => {
                  const n = Number(value);
                  if (!Number.isFinite(n) || n < MIN_SCALE) {
                    onChange(MIN_SCALE);
                  } else if (n > MAX_SCALE) {
                    onChange(MAX_SCALE);
                  }
                  onBlur();
                }}
                onChange={event => {
                  const raw = event.target.value;
                  if (raw === '') {
                    onChange(raw);
                    return;
                  }
                  const next = Number(raw);
                  if (Number.isNaN(next)) return;
                  onChange(Math.min(MAX_SCALE, next));
                }}
              />
            )}
          />
        </TwoCol>
        {scaleLocked && (
          <LockedNotice>
            Scale is frozen because someone has already submitted a rating.
            Changing it would make existing scores mean something else.
          </LockedNotice>
        )}

        <LocalizedField
          register={register}
          name="ratingLabel"
          label="Rating question"
          required
          placeholderDe="Wie zufrieden bist du?"
          placeholderEn="How satisfied are you?"
          disabled={saving}
        />

        <Divider />
        <SectionTitle>Audience and timing</SectionTitle>

        <TwoCol>
          <Controller
            name="audience_type"
            control={control}
            render={() => (
              <Select
                key={`audience_${encodeAudience(values.audience_type, values.audience_value)}`}
                id="survey_audience"
                label="Audience"
                labelTooltip="Everyone, a company already on the platform, or one of the filters used for banners and events."
                placeholder="Select an audience"
                value={encodeAudience(
                  values.audience_type,
                  values.audience_value,
                )}
                options={audienceSelectOptions(
                  audienceOptions,
                  values.audience_type,
                  values.audience_value,
                )}
                onValueChange={next => {
                  const decoded = decodeAudience(next);
                  setValue('audience_type', decoded.audience_type, {
                    shouldDirty: true,
                  });
                  setValue('audience_value', decoded.audience_value, {
                    shouldDirty: true,
                  });
                }}
                cannotError
              />
            )}
          />
        </TwoCol>

        <TwoCol>
          <Controller
            name="trigger"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Select
                key={`trigger_${String(value)}`}
                id="survey_trigger"
                label="When to offer it"
                labelTooltip="When the card is presented. Eligibility is separate: a user who does not yet match Eligible after is skipped until they do, and after Ends nobody is offered it."
                placeholder="Select a trigger"
                value={value ?? 'on_session'}
                options={selectOptions(
                  audienceOptions?.triggers,
                  values.trigger,
                )}
                onValueChange={onChange}
                cannotError
              />
            )}
          />
          <Controller
            name="eligible_after_event"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Select
                key={`eligible_after_${String(value || NO_ELIGIBILITY_EVENT)}`}
                id="survey_eligible_after"
                label="Eligible after"
                labelTooltip="As soon as they match this condition they can be offered the survey. Match created and match success count if any tandem match qualifies — not the support chat. The survey is still once per user, so a second match does not produce a second offer. Use Only since to ignore people who reached this earlier."
                placeholder="Select a condition"
                value={value || NO_ELIGIBILITY_EVENT}
                options={selectOptions(
                  audienceOptions?.eligible_after_events,
                  values.eligible_after_event,
                )}
                onValueChange={next => {
                  const event = next === NO_ELIGIBILITY_EVENT ? '' : next;
                  onChange(event);
                  if (!event) {
                    setValue('eligible_after_since', null, {
                      shouldDirty: true,
                    });
                  }
                }}
                cannotError
              />
            )}
          />
        </TwoCol>

        {!!values.eligible_after_event && (
          <TwoCol>
            <Controller
              name="eligible_after_since"
              control={control}
              render={({ field: { value, onChange } }) => (
                <DatePicker
                  date={parseIsoToDate(value)}
                  setDate={d => onChange(toStartOfDayIso(d))}
                  disabled={saving}
                  label="Only since"
                  tooltipText="Start of the selected day, Europe/Berlin. Only people who reached Eligible after on or after this date are included. Leave empty to include everyone who ever has."
                />
              )}
            />
          </TwoCol>
        )}

        <TwoCol>
          <TextInput
            label="Times to re-ask"
            type="number"
            min={MIN_MAX_SHOWS}
            max={MAX_MAX_SHOWS}
            step={1}
            labelTooltip="How often an unanswered survey is shown again before it gives up."
            width={InputWidth.Large}
            error={errors.max_shows?.message}
            {...registerInput({
              register,
              name: 'max_shows',
              options: {
                valueAsNumber: true,
                min: {
                  value: MIN_MAX_SHOWS,
                  message: `At least ${MIN_MAX_SHOWS}`,
                },
                max: {
                  value: MAX_MAX_SHOWS,
                  message: `At most ${MAX_MAX_SHOWS}`,
                },
              },
            })}
          />
        </TwoCol>
      </FormStack>
      <Divider />
      <SectionTitle>Card copy</SectionTitle>

      <LocalizedField
        register={register}
        name="copy.title"
        label="Title"
        required
        placeholderDe="Wie gefällt dir unser Angebot?"
        placeholderEn="How are you finding the service?"
        disabled={saving}
      />
      <LocalizedField
        register={register}
        name="copy.description"
        label="Description"
        multiline
        disabled={saving}
      />
      <LocalizedField
        register={register}
        name="copy.submit_button"
        label="Submit button"
        required
        placeholderDe="Feedback abgeben"
        placeholderEn="Submit feedback"
        disabled={saving}
      />

      {!!values.preservedQuestions?.length && (
        <LockedNotice>
          {`This survey has ${values.preservedQuestions.length} question(s) this editor cannot show — `}
          {values.preservedQuestions.map(question => question.id).join(', ')}
          {`. They are kept exactly as they are when you save; edit them in Django admin.`}
        </LockedNotice>
      )}

      {questionCount === 0 && (
        <EmptyCallout>
          <EmptyCalloutText>
            <EmptyCalloutTitle>No follow-up questions</EmptyCalloutTitle>
            <EmptyCalloutBody>
              The survey will ask for a star rating only. Add a written question
              if you want more than a number.
            </EmptyCalloutBody>
          </EmptyCalloutText>
          <Button
            appearance={ButtonAppearance.Primary}
            size={ButtonSizes.Small}
            onClick={onAddQuestion}
          >
            <InlineIcon>
              <PlusIcon />
            </InlineIcon>
            Add question
          </Button>
        </EmptyCallout>
      )}
    </PaneRoot>
  );
}

// ---------------------------------------------------------------------------
// QuestionPane — one written question
// ---------------------------------------------------------------------------

function QuestionPane({
  index,
  total,
  register,
  control,
  locked,
  onRemove,
  saving,
}: {
  index: number;
  total: number;
  register: UseFormRegister<SurveyFormValues>;
  control: Control<SurveyFormValues>;
  locked: boolean;
  onRemove: () => void;
  saving: boolean;
}) {
  return (
    <PaneRoot>
      <SectionMeta>
        <SectionMetaLabel>Question</SectionMetaLabel>
        <SectionNumGradient>
          {String(index + 1).padStart(2, '0')}
        </SectionNumGradient>
        <SectionMetaLabel>
          · {index + 1} of {total}
        </SectionMetaLabel>
        <DeleteSectionBtn type="button" onClick={onRemove} disabled={locked}>
          <InlineIcon>
            <TrashIcon />
          </InlineIcon>
          {locked ? 'Answered — cannot delete' : 'Delete question'}
        </DeleteSectionBtn>
      </SectionMeta>

      {locked && (
        <LockedNotice>
          People have already answered this question, so it cannot be removed or
          renamed — their answers would stop meaning anything. The wording is
          still editable, and you can add another question instead.
        </LockedNotice>
      )}

      <FormStack>
        <LocalizedField
          register={register}
          name={`questions.${index}.label`}
          label="Question"
          required
          placeholderDe="Was können wir besser machen?"
          placeholderEn="What could we do better?"
          disabled={saving}
        />
        <LocalizedField
          register={register}
          name={`questions.${index}.placeholder`}
          label="Placeholder"
          placeholderDe="Schreib dein Feedback hier"
          placeholderEn="Leave your feedback here"
          disabled={saving}
        />

        <Controller
          name={`questions.${index}.required`}
          control={control}
          render={({ field: { value, onChange } }) => (
            <Switch
              label={value ? 'Answer required' : 'Answer optional'}
              labelInline
              cannotError
              checked={!!value}
              onCheckedChange={onChange}
              disabled={saving}
            />
          )}
        />
      </FormStack>
    </PaneRoot>
  );
}

// ---------------------------------------------------------------------------
// EditSurvey — main page
// ---------------------------------------------------------------------------

function EditSurvey() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const isNew = campaignId === 'new';

  const [selectedSection, setSelectedSection] = useState<'details' | number>(
    'details',
  );
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    id: number;
    headline: string;
    title: string;
  } | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const detailUrl = `${ADMIN_SURVEY_CAMPAIGNS_ENDPOINT}${campaignId}/`;
  const { data, isLoading, error } = useSWR<SurveyCampaign>(
    !isNew ? detailUrl : null,
    () => fetchSurveyCampaign(Number(campaignId)),
  );
  const { data: audienceOptions } = useSWR(
    `${ADMIN_SURVEY_CAMPAIGNS_ENDPOINT}options/`,
    fetchSurveyAudienceOptions,
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SurveyFormValues>({ defaultValues: defaultFormValues });

  const {
    fields: questionFields,
    append,
    remove,
    move,
  } = useFieldArray({ control, name: 'questions' });

  const hydratedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (isNew || !data) return;
    // Hydrate once per campaign so SWR revalidation cannot wipe in-progress edits.
    if (hydratedIdRef.current === campaignId) return;
    hydratedIdRef.current = campaignId ?? null;
    reset(campaignToFormValues(data));
  }, [isNew, data, reset, campaignId]);

  const values = watch();
  const watchedName = values.name;
  const prevNameRef = useRef('');

  useEffect(() => {
    if (!isNew) return;
    const autoSlug = slugify(watchedName ?? '');
    const slugStillAuto =
      !values.slug?.trim() || values.slug === slugify(prevNameRef.current);
    if (slugStillAuto) setValue('slug', autoSlug);
    prevNameRef.current = watchedName ?? '';
  }, [isNew, watchedName, values.slug, setValue]);

  const lockedQuestions = data?.locked_questions ?? [];
  const questionTitles = (values.questions ?? []).map(
    question => question.label?.de || question.label?.en || '',
  );

  const addQuestion = () => {
    append(defaultQuestion());
    setSelectedSection(questionFields.length);
  };

  const onSave = async (formValues: SurveyFormValues) => {
    setSaving(true);
    setSaveError(null);
    try {
      const payload = formValuesToPayload(formValues);
      if (isNew) {
        const created = await createSurveyCampaign(payload);
        await mutate(ADMIN_SURVEY_CAMPAIGNS_ENDPOINT);
        setToast({
          id: Date.now(),
          headline: 'Success',
          title: 'Survey created.',
        });
        navigate(`${SURVEYS_ROUTE}${created.id}/`);
        return;
      }
      const updated = await updateSurveyCampaign(Number(campaignId), payload);
      await mutate(ADMIN_SURVEY_CAMPAIGNS_ENDPOINT);
      await mutate(detailUrl);
      reset(campaignToFormValues(updated));
      setToast({
        id: Date.now(),
        headline: 'Success',
        title: 'Survey saved.',
      });
    } catch (e: any) {
      // The model refuses to activate a campaign with missing copy, among other rules; its
      // message is more useful than anything this form could guess.
      setSaveError(e?.message || 'Failed to save survey.');
      setToast({
        id: Date.now(),
        headline: 'Error',
        title: 'Survey not saved.',
      });
    } finally {
      setSaving(false);
    }
  };

  const pageTitle = isNew ? 'New survey' : values.name || data?.name || '…';

  usePageHeader({
    breadcrumbs: {
      items: [{ label: 'Surveys', to: SURVEYS_ROUTE }],
      current: pageTitle,
    },
    actions: (
      <>
        <Controller
          name="active"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Switch
              label={value ? 'Active' : 'Draft'}
              labelInline
              cannotError
              checked={!!value}
              onCheckedChange={onChange}
              disabled={saving}
            />
          )}
        />
        <TopBarDivider />
        <Button
          appearance={ButtonAppearance.Primary}
          size={ButtonSizes.Small}
          onClick={handleSubmit(onSave)}
          disabled={saving}
          loading={saving}
        >
          Save changes
        </Button>
      </>
    ),
  });

  return (
    <EditorRoot>
      {error && (
        <StatusMessage type={StatusTypes.Error} visible>
          Failed to load survey.
        </StatusMessage>
      )}
      {saveError && (
        <StatusMessage type={StatusTypes.Error} visible withBorder>
          {saveError}
        </StatusMessage>
      )}
      {!isNew && !!data?.missing_copy?.length && (
        <StatusMessage type={StatusTypes.Warning} visible withBorder>
          {`Cannot be activated yet — missing: ${data.missing_copy.join(', ')}.`}
        </StatusMessage>
      )}

      {isLoading && !isNew ? (
        <LoadingWrap>
          <Loading size={LoadingSizes.Medium} />
        </LoadingWrap>
      ) : (
        <TwoPaneLayout>
          <StructureRail
            sectionTitles={questionTitles}
            selectedSection={selectedSection}
            onSelectDetails={() => setSelectedSection('details')}
            onSelectSection={setSelectedSection}
            onAddSection={addQuestion}
            onMoveUp={idx => move(idx, idx - 1)}
            onMoveDown={idx => move(idx, idx + 1)}
            saving={saving}
            detailsLabel="Survey details"
            sectionsLabel="Written questions"
            addLabel="Add question"
            untitledLabel="Untitled question"
            emptyLabel="Rating only. Add one to ask more."
          />

          <MainPane>
            {selectedSection === 'details' ? (
              <DetailsPane
                register={register}
                control={control}
                errors={errors}
                setValue={setValue}
                values={values}
                isNew={isNew}
                questionCount={questionFields.length}
                onAddQuestion={addQuestion}
                saving={saving}
                scaleLocked={!!data?.scale_locked}
                audienceOptions={audienceOptions}
              />
            ) : (
              <QuestionPane
                key={selectedSection}
                index={selectedSection as number}
                total={questionFields.length}
                register={register}
                control={control}
                locked={lockedQuestions.includes(
                  values.questions?.[selectedSection as number]?.id ?? '',
                )}
                onRemove={() => {
                  remove(selectedSection as number);
                  setSelectedSection('details');
                }}
                saving={saving}
              />
            )}
          </MainPane>
        </TwoPaneLayout>
      )}

      {toast && (
        <Toast
          key={toast.id}
          headline={toast.headline}
          title={toast.title}
          onClose={() => setToast(null)}
        />
      )}
    </EditorRoot>
  );
}

export default EditSurvey;
