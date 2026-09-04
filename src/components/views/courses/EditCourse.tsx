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
import {
  ChevronDownIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/20/solid';
import { useEffect, useRef, useState } from 'react';
import {
  Controller,
  useFieldArray,
  useForm,
  UseFormGetValues,
  UseFormSetValue,
  useWatch,
} from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR, { mutate } from 'swr';

import {
  ADMIN_COURSES_ENDPOINT,
  AdminCourse,
  CourseChapter,
  CoursePayload,
  createAdminCourse,
  fetchAdminCourse,
  removeCourseImage,
  resolveCourseImageUrl,
  SELF_ONBOARDING_COURSE_SLUG,
  updateAdminCourse,
  uploadCourseImage,
  UserTypeAvailability,
} from '../../../api/courses';
import { COURSES_ROUTE } from '../../../router/routes';
import { registerInput } from '../../../store';
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
} from '../../atoms/EditorShell.styles';
import { ImageUploadField } from '../../atoms/ImageUploadField';
import StructureRail from '../../atoms/StructureRail';
import { usePageHeader } from '../../blocks/LayoutHeaderContext';
import {
  AnswerInstructionHint,
  AnswerList,
  AnswerListHeader,
  AnswerRadio,
  AnswerRowHighlight,
  CompletionCollapseBtn,
  CompletionIconBadge,
  CompletionOptionalBadge,
  CompletionPanel,
  CompletionPanelBody,
  CompletionPanelHeader,
  CompletionPanelHint,
  CompletionPanelTitle,
  CompletionToggle,
  CompletionToggleHint,
  CompletionToggleLabel,
  CorrectAnswerBadge,
  IconButton,
  InlineTitleInput,
  QuizEmptyCallout,
  QuizEmptyText,
  QuizStepCollapsedMeta,
  QuizStepCollapsedNum,
  QuizStepCollapsedQuestion,
  QuizStepCollapsedRow,
  QuizStepItem,
  QuizStepItemBody,
  QuizStepItemHeaderBtn,
  QuizStepItemTitle,
  QuizStepList,
  QuizStepsCount,
  QuizStepsHeader,
  QuizStepsTitle,
  QuizStepsTitleRow,
} from './EditCourse.styles';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AnswerFormValue = { text: string };

type QuizStepFormValues = {
  order: number;
  question: string;
  answers: AnswerFormValue[];
  correct_answer_index: number;
};

type ChapterFormValues = {
  chapter_id: string;
  order: number;
  available_to: UserTypeAvailability;
  title: string;
  description: string;
  video_url: string;
  video_title: string;
  completed_title: string;
  completed_description: string;
  completed_additional_text: string;
  completed_cta_label: string;
  quiz_steps: QuizStepFormValues[];
};

type CourseFormValues = {
  title: string;
  slug: string;
  description: string;
  is_active: boolean;
  is_listed: boolean;
  available_to: UserTypeAvailability;
  chapters: ChapterFormValues[];
};

// ---------------------------------------------------------------------------
// Constants + helpers
// ---------------------------------------------------------------------------

const AUDIENCE_OPTIONS = [
  { label: 'Everyone', value: 'all' },
  { label: 'Learners only', value: 'learner' },
  { label: 'Volunteers only', value: 'volunteer' },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function resolveCorrectAnswerIndex(
  answers: string[],
  correctAnswer: string,
): number {
  if (answers.length === 0) return 0;
  const exactIdx = answers.indexOf(correctAnswer);
  if (exactIdx >= 0) return exactIdx;
  const normalized = correctAnswer.trim();
  const trimmedIdx = answers.findIndex(a => a.trim() === normalized);
  if (trimmedIdx >= 0) return trimmedIdx;
  return 0;
}

function chapterToFormValues(chapter: CourseChapter): ChapterFormValues {
  return {
    ...chapter,
    available_to: chapter.available_to ?? 'all',
    quiz_steps: chapter.quiz_steps.map(s => ({
      order: s.order,
      question: s.question,
      answers: s.answers.map(text => ({ text })),
      correct_answer_index: resolveCorrectAnswerIndex(
        s.answers,
        s.correct_answer,
      ),
    })),
  };
}

function formValuesToPayload(values: CourseFormValues): CoursePayload {
  return {
    ...values,
    chapters: values.chapters.map((ch, idx) => ({
      ...ch,
      order: idx + 1,
      quiz_steps: ch.quiz_steps.map((s, si) => ({
        order: si + 1,
        question: s.question,
        answers: s.answers.map(a => a.text),
        correct_answer: s.answers[s.correct_answer_index]?.text ?? '',
      })),
    })),
  };
}

const defaultChapter = (order: number): ChapterFormValues => ({
  chapter_id: `chapter-${order}-${Date.now()}`,
  order,
  available_to: 'all',
  title: '',
  description: '',
  video_url: '',
  video_title: '',
  completed_title: '',
  completed_description: '',
  completed_additional_text: '',
  completed_cta_label: '',
  quiz_steps: [],
});

const defaultQuizStep = (): QuizStepFormValues => ({
  order: 0,
  question: '',
  answers: [{ text: '' }, { text: '' }],
  correct_answer_index: 0,
});

const defaultFormValues: CourseFormValues = {
  title: '',
  slug: '',
  description: '',
  is_active: true,
  is_listed: true,
  available_to: 'all',
  chapters: [],
};

// ---------------------------------------------------------------------------
// QuizStepCard — single quiz step, collapsed or expanded
// ---------------------------------------------------------------------------

function QuizStepCard({
  nestIndex,
  stepIdx,
  control,
  register,
  setValue,
  getValues,
  onRemove,
  defaultExpanded = false,
}: {
  nestIndex: number;
  stepIdx: number;
  control: any;
  register: any;
  setValue: UseFormSetValue<CourseFormValues>;
  getValues: UseFormGetValues<CourseFormValues>;
  onRemove: () => void;
  defaultExpanded?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const {
    fields: answerFields,
    append: appendAnswer,
    remove: removeAnswer,
  } = useFieldArray({
    control,
    name: `chapters.${nestIndex}.quiz_steps.${stepIdx}.answers`,
  });

  const question = useWatch({
    control,
    name: `chapters.${nestIndex}.quiz_steps.${stepIdx}.question`,
  });

  const correctIndexPath =
    `chapters.${nestIndex}.quiz_steps.${stepIdx}.correct_answer_index` as const;

  const handleRemoveAnswer = (answerIdx: number) => {
    const currentCorrect = Number(getValues(correctIndexPath));
    const newLength = answerFields.length - 1;
    removeAnswer(answerIdx);
    let nextCorrect = currentCorrect;
    if (answerIdx < currentCorrect) {
      nextCorrect = currentCorrect - 1;
    } else if (answerIdx === currentCorrect) {
      nextCorrect = Math.min(currentCorrect, Math.max(0, newLength - 1));
    }
    setValue(correctIndexPath, Math.max(0, nextCorrect), { shouldDirty: true });
  };

  if (!isExpanded) {
    return (
      <QuizStepCollapsedRow type="button" onClick={() => setIsExpanded(true)}>
        <QuizStepCollapsedNum>Q{stepIdx + 1}</QuizStepCollapsedNum>
        <QuizStepCollapsedQuestion>
          {question || (
            <span style={{ opacity: 0.4, fontStyle: 'italic' }}>
              Untitled question
            </span>
          )}
        </QuizStepCollapsedQuestion>
        <QuizStepCollapsedMeta>
          {answerFields.length} answers · 1 correct
        </QuizStepCollapsedMeta>
        <IconButton
          type="button"
          title="Remove step"
          onClick={e => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <TrashIcon style={{ width: 14, height: 14 }} />
        </IconButton>
      </QuizStepCollapsedRow>
    );
  }

  return (
    <QuizStepItem>
      <QuizStepItemHeaderBtn type="button" onClick={() => setIsExpanded(false)}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <QuizStepCollapsedNum>Q{stepIdx + 1}</QuizStepCollapsedNum>
          <QuizStepItemTitle>Question {stepIdx + 1}</QuizStepItemTitle>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <IconButton
            type="button"
            title="Remove step"
            onClick={e => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <TrashIcon style={{ width: 14, height: 14 }} />
          </IconButton>
          <ChevronDownIcon
            style={{
              width: 14,
              height: 14,
              transform: 'rotate(180deg)',
              color: '#a6a6a6',
            }}
          />
        </span>
      </QuizStepItemHeaderBtn>

      <QuizStepItemBody>
        <TextInput
          label="Question"
          placeholder="What is…?"
          width={InputWidth.Large}
          {...registerInput({
            register,
            name: `chapters.${nestIndex}.quiz_steps.${stepIdx}.question`,
            options: { required: true },
          })}
        />

        <AnswerList>
          <AnswerListHeader>
            <SectionTitle>Answers</SectionTitle>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AnswerInstructionHint>
                ● Select the correct one
              </AnswerInstructionHint>
              <Button
                appearance={ButtonAppearance.Secondary}
                size={ButtonSizes.Small}
                onClick={() => appendAnswer({ text: '' })}
              >
                <PlusIcon style={{ width: 12, height: 12, marginRight: 4 }} />
                Add answer
              </Button>
            </span>
          </AnswerListHeader>

          <Controller
            name={correctIndexPath}
            control={control}
            render={({ field: { value, onChange } }) => (
              <>
                {answerFields.map((field, answerIdx) => {
                  const isCorrect = Number(value) === answerIdx;
                  return (
                    <AnswerRowHighlight key={field.id} $correct={isCorrect}>
                      <AnswerRadio
                        type="radio"
                        title="Mark as correct answer"
                        checked={isCorrect}
                        onChange={() => onChange(answerIdx)}
                      />
                      <TextInput
                        label=""
                        placeholder={`Answer ${answerIdx + 1}`}
                        width={InputWidth.Large}
                        cannotError
                        {...registerInput({
                          register,
                          name: `chapters.${nestIndex}.quiz_steps.${stepIdx}.answers.${answerIdx}.text`,
                        })}
                      />
                      {isCorrect && (
                        <CorrectAnswerBadge>correct</CorrectAnswerBadge>
                      )}
                      <IconButton
                        type="button"
                        title="Remove answer"
                        onClick={() => handleRemoveAnswer(answerIdx)}
                        disabled={answerFields.length <= 2}
                      >
                        <TrashIcon style={{ width: 14, height: 14 }} />
                      </IconButton>
                    </AnswerRowHighlight>
                  );
                })}
              </>
            )}
          />
        </AnswerList>
      </QuizStepItemBody>
    </QuizStepItem>
  );
}

// ---------------------------------------------------------------------------
// ChapterQuizSteps — list of quiz steps with add button
// ---------------------------------------------------------------------------

function ChapterQuizSteps({
  nestIndex,
  control,
  register,
  setValue,
  getValues,
  errors: _errors,
}: {
  nestIndex: number;
  control: any;
  register: any;
  setValue: UseFormSetValue<CourseFormValues>;
  getValues: UseFormGetValues<CourseFormValues>;
  errors: any;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `chapters.${nestIndex}.quiz_steps`,
  });

  return (
    <div>
      <QuizStepsHeader>
        <QuizStepsTitleRow>
          <QuizStepsTitle>Quiz steps</QuizStepsTitle>
          {fields.length > 0 ? (
            <QuizStepsCount>· {fields.length}</QuizStepsCount>
          ) : (
            <CompletionOptionalBadge>optional</CompletionOptionalBadge>
          )}
        </QuizStepsTitleRow>
        <Button
          appearance={ButtonAppearance.Secondary}
          size={ButtonSizes.Small}
          onClick={() => append(defaultQuizStep())}
        >
          <PlusIcon style={{ width: 12, height: 12, marginRight: 4 }} />
          Add step
        </Button>
      </QuizStepsHeader>

      {fields.length === 0 ? (
        <QuizEmptyCallout>
          <QuizEmptyText>
            No questions needed. Leave this empty for a video-only chapter —
            learners go straight to the next chapter after the video, with no
            quiz and no completion screen.
          </QuizEmptyText>
        </QuizEmptyCallout>
      ) : (
        <QuizStepList>
          {fields.map((field, stepIdx) => (
            <QuizStepCard
              key={field.id}
              nestIndex={nestIndex}
              stepIdx={stepIdx}
              control={control}
              register={register}
              setValue={setValue}
              getValues={getValues}
              onRemove={() => remove(stepIdx)}
              defaultExpanded={stepIdx === 0}
            />
          ))}
        </QuizStepList>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CompletionMessagingSection — collapsible at the bottom of the chapter editor
// ---------------------------------------------------------------------------

function CompletionMessagingSection({
  chapterIndex,
  register,
  open,
  onToggle,
}: {
  chapterIndex: number;
  register: any;
  open: boolean;
  onToggle: () => void;
}) {
  if (!open) {
    return (
      <CompletionToggle type="button" onClick={onToggle}>
        <CompletionToggleLabel>Completion messaging</CompletionToggleLabel>
        <CompletionOptionalBadge>optional</CompletionOptionalBadge>
        <CompletionToggleHint>
          What learners see when they finish this chapter.
        </CompletionToggleHint>
        <ChevronDownIcon style={{ width: 12, height: 12, color: '#a6a6a6' }} />
      </CompletionToggle>
    );
  }

  return (
    <CompletionPanel>
      <CompletionPanelHeader>
        <CompletionIconBadge>✓</CompletionIconBadge>
        <CompletionPanelTitle>Completion messaging</CompletionPanelTitle>
        <CompletionOptionalBadge>optional</CompletionOptionalBadge>
        <CompletionPanelHint>
          Shown to learners after they finish this chapter
        </CompletionPanelHint>
        <CompletionCollapseBtn type="button" onClick={onToggle}>
          <ChevronDownIcon
            style={{ width: 12, height: 12, transform: 'rotate(180deg)' }}
          />
        </CompletionCollapseBtn>
      </CompletionPanelHeader>

      <CompletionPanelBody>
        <TextInput
          label="Completion title"
          placeholder="Great work!"
          width={InputWidth.Large}
          {...registerInput({
            register,
            name: `chapters.${chapterIndex}.completed_title`,
          })}
        />
        <TextInput
          label="CTA button label"
          placeholder="Continue"
          width={InputWidth.Large}
          {...registerInput({
            register,
            name: `chapters.${chapterIndex}.completed_cta_label`,
          })}
        />
        <div style={{ gridColumn: '1 / -1' }}>
          <TextArea
            label="Completion description"
            rows={2}
            {...registerInput({
              register,
              name: `chapters.${chapterIndex}.completed_description`,
            })}
          />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <TextArea
            label="Additional text"
            rows={2}
            {...registerInput({
              register,
              name: `chapters.${chapterIndex}.completed_additional_text`,
            })}
          />
        </div>
      </CompletionPanelBody>
    </CompletionPanel>
  );
}

// ---------------------------------------------------------------------------
// ChapterEditorPane — right pane when a chapter is selected
// ---------------------------------------------------------------------------

function ChapterEditorPane({
  chapterIndex,
  totalChapters,
  control,
  register,
  setValue,
  getValues,
  errors,
  onRemove,
}: {
  chapterIndex: number;
  totalChapters: number;
  control: any;
  register: any;
  setValue: UseFormSetValue<CourseFormValues>;
  getValues: UseFormGetValues<CourseFormValues>;
  errors: any;
  onRemove: () => void;
}) {
  const [showCompletion, setShowCompletion] = useState(false);
  // A chapter with no quiz steps is video-only, and a video-only chapter never reaches a
  // completion screen — learners continue straight to the next chapter after the video.
  const quizSteps = useWatch({
    control,
    name: `chapters.${chapterIndex}.quiz_steps`,
  });
  const hasQuizSteps = (quizSteps?.length ?? 0) > 0;

  return (
    <PaneRoot>
      {/* ── Meta row ── */}
      <SectionMeta>
        <SectionMetaLabel>Chapter</SectionMetaLabel>
        <SectionNumGradient>
          {String(chapterIndex + 1).padStart(2, '0')}
        </SectionNumGradient>
        <SectionMetaLabel>
          · position {chapterIndex + 1} of {totalChapters}
        </SectionMetaLabel>
        <DeleteSectionBtn type="button" onClick={onRemove}>
          <TrashIcon style={{ width: 12, height: 12 }} />
          Delete chapter
        </DeleteSectionBtn>
      </SectionMeta>

      {/* ── Inline title ── */}
      <InlineTitleInput
        placeholder="Chapter title…"
        {...register(`chapters.${chapterIndex}.title`, {
          required: 'Required',
        })}
      />

      {/* ── Core fields ── */}
      <TwoCol>
        <TextInput
          label="Chapter ID"
          required
          placeholder="intro-to-grammar"
          width={InputWidth.Large}
          error={errors?.chapters?.[chapterIndex]?.chapter_id?.message}
          {...registerInput({
            register,
            name: `chapters.${chapterIndex}.chapter_id`,
            options: { required: 'Required' },
          })}
        />
        <TextInput
          label="Video URL"
          required
          placeholder="https://vimeo.com/…"
          width={InputWidth.Large}
          error={errors?.chapters?.[chapterIndex]?.video_url?.message}
          {...registerInput({
            register,
            name: `chapters.${chapterIndex}.video_url`,
            options: { required: 'Required' },
          })}
        />
      </TwoCol>

      <TwoCol>
        <TextInput
          label="Video title"
          placeholder="Intro video"
          width={InputWidth.Large}
          {...registerInput({
            register,
            name: `chapters.${chapterIndex}.video_title`,
          })}
        />
        <Controller
          name={`chapters.${chapterIndex}.available_to`}
          control={control}
          render={({ field: { value, onChange } }) => (
            <Select
              key={`chapter_audience_${chapterIndex}_${String(value ?? 'all')}`}
              id={`chapter_audience_${chapterIndex}`}
              label="Visible to"
              labelTooltip="Limit this chapter to a specific user type. Other chapters in the same course are still shown to all."
              placeholder="Select audience"
              value={value ?? 'all'}
              options={AUDIENCE_OPTIONS}
              onValueChange={v => onChange(v as UserTypeAvailability)}
              cannotError
            />
          )}
        />
      </TwoCol>

      <TextArea
        label="Description"
        rows={3}
        {...registerInput({
          register,
          name: `chapters.${chapterIndex}.description`,
        })}
      />

      <Divider />

      {/* ── Quiz steps ── */}
      <ChapterQuizSteps
        nestIndex={chapterIndex}
        control={control}
        register={register}
        setValue={setValue}
        getValues={getValues}
        errors={errors}
      />

      {/* ── Completion messaging ── */}
      {hasQuizSteps && (
        <>
          <Divider />
          <CompletionMessagingSection
            chapterIndex={chapterIndex}
            register={register}
            open={showCompletion}
            onToggle={() => setShowCompletion(v => !v)}
          />
        </>
      )}
    </PaneRoot>
  );
}

// ---------------------------------------------------------------------------
// CourseDetailsPane — right pane when "Course details" is selected
// ---------------------------------------------------------------------------

function CourseDetailsPane({
  chapterCount,
  register,
  control,
  errors,
  onAddChapter,
  existingImageUrl,
  pendingImageFile,
  onImageFileChange,
  isSelfOnboardingCourse,
}: {
  chapterCount: number;
  register: any;
  control: any;
  errors: any;
  onAddChapter: () => void;
  existingImageUrl: string | null;
  pendingImageFile: File | null;
  onImageFileChange: (file: File | null) => void;
  isSelfOnboardingCourse: boolean;
}) {
  return (
    <PaneRoot $maxWidth="720px">
      <div>
        <PaneHeading>Course details</PaneHeading>
        <PaneHint>
          Title, slug, and audience apply to the whole course. Chapters inherit
          unless overridden.
        </PaneHint>
      </div>

      <FormStack>
        <TwoCol>
          <TextInput
            label="Course title"
            required
            placeholder="e.g. Welcome Workshop"
            width={InputWidth.Large}
            error={errors.title?.message}
            {...registerInput({
              register,
              name: 'title',
              options: { required: 'Required' },
            })}
          />
          <TextInput
            label="Slug"
            required
            placeholder="auto-from-title"
            labelTooltip={
              isSelfOnboardingCourse
                ? 'The self-onboarding course slug is fixed and cannot be changed.'
                : 'URL-safe identifier. Auto-generated from title when creating, until you set a slug.'
            }
            width={InputWidth.Large}
            error={errors.slug?.message}
            disabled={isSelfOnboardingCourse}
            {...registerInput({
              register,
              name: 'slug',
              options: { required: 'Required' },
            })}
          />
        </TwoCol>

        <TextArea
          label="Description"
          rows={3}
          {...registerInput({ register, name: 'description' })}
        />

        <Controller
          name="available_to"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Select
              key={`course_audience_${String(value ?? 'all')}`}
              id="course_audience"
              label="Audience"
              labelTooltip="Which user types can see this course."
              placeholder="Select audience"
              value={value ?? 'all'}
              options={AUDIENCE_OPTIONS}
              onValueChange={v => onChange(v as UserTypeAvailability)}
              cannotError
              maxWidth="220px"
            />
          )}
        />
      </FormStack>

      <ImageUploadField
        label="Course image"
        existingImageUrl={existingImageUrl}
        file={pendingImageFile}
        onFileChange={onImageFileChange}
        helperText="JPEG, PNG, WebP, or GIF"
      />

      <Divider />

      {chapterCount === 0 && (
        <EmptyCallout>
          <EmptyCalloutText>
            <EmptyCalloutTitle>No chapters yet</EmptyCalloutTitle>
            <EmptyCalloutBody>
              A course needs at least one chapter. Add chapters from the
              sidebar, or get started below.
            </EmptyCalloutBody>
          </EmptyCalloutText>
          <Button
            appearance={ButtonAppearance.Primary}
            size={ButtonSizes.Small}
            onClick={onAddChapter}
          >
            <PlusIcon style={{ width: 12, height: 12, marginRight: 4 }} />
            Add first chapter
          </Button>
        </EmptyCallout>
      )}
    </PaneRoot>
  );
}

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// EditCourse — main page
// ---------------------------------------------------------------------------

function EditCourse() {
  const { courseSlug } = useParams<{ courseSlug: string }>();
  const navigate = useNavigate();
  const isNew = courseSlug === 'new';

  const [selectedSection, setSelectedSection] = useState<'details' | number>(
    'details',
  );
  const [saving, setSaving] = useState(false);
  const [saveToast, setSaveToast] = useState<{
    id: number;
    headline: string;
    title: string;
  } | null>(null);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [clearImage, setClearImage] = useState(false);

  const { data, isLoading, error } = useSWR<AdminCourse>(
    !isNew ? `${ADMIN_COURSES_ENDPOINT}${courseSlug}/` : null,
    () => fetchAdminCourse(courseSlug as string),
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors, isDirty },
  } = useForm<CourseFormValues>({ defaultValues: defaultFormValues });

  const {
    fields: chapterFields,
    append,
    remove,
    move,
  } = useFieldArray({ control, name: 'chapters' });

  const hydratedSlugRef = useRef<string | null>(null);

  useEffect(() => {
    if (isNew || !data) return;
    // Hydrate once per course load — avoid SWR revalidation wiping in-progress edits.
    if (hydratedSlugRef.current === courseSlug) return;
    hydratedSlugRef.current = courseSlug ?? null;
    reset({
      title: data.title,
      slug: data.slug,
      description: data.description,
      is_active: data.is_active,
      is_listed: data.is_listed,
      available_to: data.available_to,
      chapters: data.chapters.map(chapterToFormValues),
    });
  }, [isNew, data, reset, courseSlug]);

  const watchedTitle = watch('title');
  const watchedSlug = watch('slug');
  const prevTitleRef = useRef('');

  useEffect(() => {
    if (!isNew) return;
    const autoSlug = slugify(watchedTitle);
    const slugStillAutoGenerated =
      !watchedSlug?.trim() || watchedSlug === slugify(prevTitleRef.current);
    if (slugStillAutoGenerated) {
      setValue('slug', autoSlug, { shouldDirty: true });
    }
    prevTitleRef.current = watchedTitle;
  }, [isNew, watchedTitle, watchedSlug, setValue]);

  const isSelfOnboardingCourse =
    !isNew &&
    (courseSlug === SELF_ONBOARDING_COURSE_SLUG ||
      data?.slug === SELF_ONBOARDING_COURSE_SLUG);

  // Keep chapter titles in sync for the rail — watch the full chapters array
  const watchedChapters = watch('chapters') || [];
  const chapterTitles = watchedChapters.map(c => c.title);

  const addChapter = () => {
    const newIdx = chapterFields.length;
    append(defaultChapter(newIdx + 1));
    setSelectedSection(newIdx);
  };

  const handleImageFileChange = (file: File | null) => {
    if (file) {
      setPendingImageFile(file);
      setClearImage(false);
    } else {
      setPendingImageFile(null);
      if (data?.image) setClearImage(true);
    }
  };

  const onSave = async (values: CourseFormValues) => {
    setSaving(true);
    setSaveToast(null);
    try {
      const payload = formValuesToPayload(values);
      if (isNew) {
        const created = await createAdminCourse(payload);
        // Upload image if one was selected before the course existed.
        if (pendingImageFile) {
          await uploadCourseImage(created.slug, pendingImageFile);
          setPendingImageFile(null);
        }
        await mutate(ADMIN_COURSES_ENDPOINT);
        setSaveToast({
          id: Date.now(),
          headline: 'Success',
          title: 'Course created.',
        });
        navigate(`/courses/${created.slug}/`);
        return;
      }
      const updated = await updateAdminCourse(courseSlug as string, payload);
      // Handle image upload or removal separately (dedicated multipart endpoint).
      if (pendingImageFile) {
        await uploadCourseImage(courseSlug as string, pendingImageFile);
        setPendingImageFile(null);
      } else if (clearImage) {
        await removeCourseImage(courseSlug as string);
        setClearImage(false);
      }
      await mutate(ADMIN_COURSES_ENDPOINT);
      await mutate(`${ADMIN_COURSES_ENDPOINT}${courseSlug}/`);
      setSaveToast({
        id: Date.now(),
        headline: 'Success',
        title: 'Course saved.',
      });
      reset({
        title: updated.title,
        slug: updated.slug,
        description: updated.description,
        is_active: updated.is_active,
        is_listed: updated.is_listed,
        available_to: updated.available_to,
        chapters: updated.chapters.map(chapterToFormValues),
      });
    } catch (e: any) {
      setSaveToast({
        id: Date.now(),
        headline: 'Error',
        title: e?.message || 'Failed to save course.',
      });
    } finally {
      setSaving(false);
    }
  };

  const courseTitle = watchedTitle || data?.title;
  const pageTitle = isNew ? 'New course' : courseTitle || '…';

  usePageHeader({
    breadcrumbs: {
      items: [{ label: 'Courses', to: COURSES_ROUTE }],
      current: pageTitle,
    },
    actions: (
      <>
        <Controller
          name="is_listed"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Switch
              label={value ? 'Listed' : 'Unlisted'}
              labelInline
              cannotError
              checked={value}
              onCheckedChange={onChange}
              disabled={saving}
            />
          )}
        />
        <Controller
          name="is_active"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Switch
              label={value ? 'Published' : 'Draft'}
              labelInline
              cannotError
              checked={value}
              onCheckedChange={onChange}
              disabled={saving}
            />
          )}
        />
        <TopBarDivider />
        {(() => {
          const previewDisabled = isNew
            ? 'Save the course first to preview'
            : isDirty
              ? 'Save your changes to preview'
              : null;
          return (
            <span title={previewDisabled ?? undefined}>
              <Button
                appearance={ButtonAppearance.Secondary}
                size={ButtonSizes.Small}
                disabled={!!previewDisabled}
                onClick={() =>
                  window.open(
                    `${window.location.origin}/app/courses/preview/${watchedSlug}`,
                    '_blank',
                    'noopener,noreferrer',
                  )
                }
              >
                Preview
              </Button>
            </span>
          );
        })()}
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
          Failed to load course.
        </StatusMessage>
      )}

      {isLoading && !isNew ? (
        <div
          style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}
        >
          <Loading size={LoadingSizes.Medium} />
        </div>
      ) : (
        <TwoPaneLayout>
          <StructureRail
            sectionTitles={chapterTitles}
            selectedSection={selectedSection}
            onSelectDetails={() => setSelectedSection('details')}
            onSelectSection={(idx: number) => setSelectedSection(idx)}
            onAddSection={addChapter}
            onMoveUp={(idx: number) => move(idx, idx - 1)}
            onMoveDown={(idx: number) => move(idx, idx + 1)}
            saving={saving}
          />

          <MainPane>
            {selectedSection === 'details' ? (
              <CourseDetailsPane
                register={register}
                control={control}
                errors={errors}
                onAddChapter={addChapter}
                chapterCount={chapterFields.length}
                existingImageUrl={
                  clearImage ? null : resolveCourseImageUrl(data?.image)
                }
                pendingImageFile={pendingImageFile}
                onImageFileChange={handleImageFileChange}
                isSelfOnboardingCourse={isSelfOnboardingCourse}
              />
            ) : (
              <ChapterEditorPane
                key={selectedSection}
                chapterIndex={selectedSection as number}
                totalChapters={chapterFields.length}
                control={control}
                register={register}
                setValue={setValue}
                getValues={getValues}
                errors={errors}
                onRemove={() => {
                  remove(selectedSection as number);
                  setSelectedSection('details');
                }}
              />
            )}
          </MainPane>
        </TwoPaneLayout>
      )}

      {saveToast && (
        <Toast
          key={saveToast.id}
          headline={saveToast.headline}
          title={saveToast.title}
          onClose={() => setSaveToast(null)}
        />
      )}
    </EditorRoot>
  );
}

export default EditCourse;
