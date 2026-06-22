import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  InputWidth,
  Loading,
  LoadingSizes,
  StatusMessage,
  StatusTypes,
  TextArea,
  TextInput,
  Toast,
} from '@a-little-world/little-world-design-system';
import { PlusIcon, TrashIcon } from '@heroicons/react/20/solid';
import React, { useEffect, useRef, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import useSWR, { mutate } from 'swr';

import {
  ADMIN_QUESTION_CARDS_ENDPOINT,
  QuestionCardsPayload,
  QuestionCategoryFormValue,
  deleteAdminQuestionCard,
  deleteAdminQuestionCategory,
  fetchAdminQuestionCards,
  saveAdminQuestionCards,
} from '../../../../api/questionCards';
import {
  COMMUNICATIONS_ROUTE,
} from '../../../../router/routes';
import { registerInput } from '../../../../store';
import { usePageHeader } from '../../../blocks/LayoutHeaderContext';
import {
  CardEditorHeader,
  CardEditorItem,
  CardEditorLabel,
  CardList,
  CardsSectionHeader,
  CardsSectionTitle,
  CategoryEditorHeading,
  CategoryEditorHint,
  CategoryEditorRoot,
  CategoryRail,
  CategoryRailAddBtn,
  CategoryRailCount,
  CategoryRailEmpty,
  CategoryRailItem,
  CategoryRailItemTitle,
  CategoryRailLabel,
  CategoryRailTop,
  DeleteCategoryBtn,
  Divider,
  EditorRoot,
  EmptyCategoryPane,
  FormStack,
  IconButton,
  MainPane,
  TwoCol,
  TwoPaneLayout,
} from './QuestionCards.styles';

type QuestionCardsFormValues = {
  categories: QuestionCategoryFormValue[];
};

const defaultCard = () => ({
  content: { en: '', de: '' },
});

const defaultCategory = (): QuestionCategoryFormValue => ({
  content: { en: '', de: '' },
  cards: [],
});

const defaultFormValues: QuestionCardsFormValues = {
  categories: [],
};

type CategoryEditorPaneProps = {
  categoryIndex: number;
  register: ReturnType<typeof useForm<QuestionCardsFormValues>>['register'];
  control: ReturnType<typeof useForm<QuestionCardsFormValues>>['control'];
  saving: boolean;
  categoryTitle: string;
  canDeleteCategory: boolean;
  onDeleteCategory: () => void;
  onDeleteCard: (cardIndex: number) => Promise<void>;
};

function CategoryEditorPane({
  categoryIndex,
  register,
  control,
  saving,
  categoryTitle,
  canDeleteCategory,
  onDeleteCategory,
  onDeleteCard,
}: CategoryEditorPaneProps) {
  const { fields: cardFields, append: appendCard, remove: removeCard } =
    useFieldArray({
      control,
      name: `categories.${categoryIndex}.cards`,
    });

  const handleDeleteCard = async (cardIndex: number) => {
    await onDeleteCard(cardIndex);
    removeCard(cardIndex);
  };

  return (
    <CategoryEditorRoot>
      <div>
        <CategoryEditorHeading>{categoryTitle}</CategoryEditorHeading>
        <CategoryEditorHint>
          Edit the category name and the conversation starter cards shown during
          video calls.
        </CategoryEditorHint>
      </div>

      <DeleteCategoryBtn
        type="button"
        onClick={onDeleteCategory}
        disabled={saving || !canDeleteCategory}
        title={
          canDeleteCategory
            ? 'Delete this category'
            : 'Remove all cards from this category before deleting it'
        }
      >
        <TrashIcon style={{ width: 12, height: 12 }} />
        Delete category
      </DeleteCategoryBtn>

      <FormStack>
        <TwoCol>
          <TextInput
            label="English name"
            placeholder="Personal"
            width={InputWidth.Large}
            {...registerInput({
              register,
              name: `categories.${categoryIndex}.content.en`,
            })}
          />
          <TextInput
            label="German name"
            placeholder="Persönlich"
            width={InputWidth.Large}
            {...registerInput({
              register,
              name: `categories.${categoryIndex}.content.de`,
            })}
          />
        </TwoCol>
      </FormStack>

      <Divider />

      <CardsSectionHeader>
        <CardsSectionTitle>
          Cards
          {cardFields.length > 0 ? ` · ${cardFields.length}` : ''}
        </CardsSectionTitle>
        <Button
          appearance={ButtonAppearance.Secondary}
          size={ButtonSizes.Small}
          onClick={() => appendCard(defaultCard())}
          disabled={saving}
        >
          <PlusIcon style={{ width: 12, height: 12, marginRight: 4 }} />
          Add card
        </Button>
      </CardsSectionHeader>

      {cardFields.length === 0 ? (
        <CategoryEditorHint>No cards in this category yet.</CategoryEditorHint>
      ) : (
        <CardList>
          {cardFields.map((field, cardIndex) => (
            <CardEditorItem key={field.id}>
              <CardEditorHeader>
                <CardEditorLabel>Card {cardIndex + 1}</CardEditorLabel>
                <IconButton
                  type="button"
                  title="Remove card"
                  onClick={() => handleDeleteCard(cardIndex)}
                  disabled={saving}
                >
                  <TrashIcon style={{ width: 14, height: 14 }} />
                </IconButton>
              </CardEditorHeader>
              <TwoCol>
                <TextArea
                  label="English"
                  rows={3}
                  {...registerInput({
                    register,
                    name: `categories.${categoryIndex}.cards.${cardIndex}.content.en`,
                  })}
                />
                <TextArea
                  label="German"
                  rows={3}
                  {...registerInput({
                    register,
                    name: `categories.${categoryIndex}.cards.${cardIndex}.content.de`,
                  })}
                />
              </TwoCol>
            </CardEditorItem>
          ))}
        </CardList>
      )}
    </CategoryEditorRoot>
  );
}

function QuestionCards() {
  const { data, error, isLoading } = useSWR(
    ADMIN_QUESTION_CARDS_ENDPOINT,
    fetchAdminQuestionCards,
  );

  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<
    number | null
  >(null);
  const [saving, setSaving] = useState(false);
  const [saveToast, setSaveToast] = useState<{
    id: number;
    headline: string;
    title: string;
  } | null>(null);

  const hydratedRef = useRef(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<QuestionCardsFormValues>({
    defaultValues: defaultFormValues,
  });

  const {
    fields: categoryFields,
    append: appendCategory,
    remove: removeCategory,
  } = useFieldArray({
    control,
    name: 'categories',
  });

  const watchedCategories = useWatch({ control, name: 'categories' }) || [];

  useEffect(() => {
    if (!data || hydratedRef.current) return;
    hydratedRef.current = true;
    reset({
      categories: data.categories.map(category => ({
        uuid: category.uuid,
        content: {
          en: category.content.en ?? '',
          de: category.content.de ?? '',
        },
        cards: category.cards.map(card => ({
          uuid: card.uuid,
          content: {
            en: card.content.en ?? '',
            de: card.content.de ?? '',
          },
        })),
      })),
    });
    setSelectedCategoryIndex(data.categories.length > 0 ? 0 : null);
  }, [data, reset]);

  const selectedIndex =
    selectedCategoryIndex !== null &&
    selectedCategoryIndex < categoryFields.length
      ? selectedCategoryIndex
      : categoryFields.length > 0
        ? 0
        : null;

  const addCategory = () => {
    appendCategory(defaultCategory());
    setSelectedCategoryIndex(categoryFields.length);
  };

  const handleDeleteCategory = async () => {
    if (selectedIndex === null) return;
    const category = watchedCategories[selectedIndex];
    if (!category) return;

    if ((category.cards?.length ?? 0) > 0) {
      setSaveToast({
        id: Date.now(),
        headline: 'Cannot delete category',
        title: 'Remove all cards from this category before deleting it.',
      });
      return;
    }

    if (category.uuid) {
      try {
        await deleteAdminQuestionCategory(category.uuid);
        await mutate(ADMIN_QUESTION_CARDS_ENDPOINT);
      } catch (e: any) {
        setSaveToast({
          id: Date.now(),
          headline: 'Error',
          title: e?.message || 'Failed to delete category.',
        });
        return;
      }
    }

    removeCategory(selectedIndex);
    setSelectedCategoryIndex(prev => {
      if (prev === null) return null;
      if (prev >= categoryFields.length - 1) {
        return Math.max(0, categoryFields.length - 2);
      }
      return prev;
    });
    if (categoryFields.length <= 1) {
      setSelectedCategoryIndex(null);
    }
  };

  const handleDeleteCard = async (cardIndex: number) => {
    if (selectedIndex === null) return;
    const card = watchedCategories[selectedIndex]?.cards?.[cardIndex];
    if (!card) return;

    if (card.uuid) {
      await deleteAdminQuestionCard(card.uuid);
      await mutate(ADMIN_QUESTION_CARDS_ENDPOINT);
    }
  };

  const onSave = async (values: QuestionCardsFormValues) => {
    setSaving(true);
    setSaveToast(null);

    const payload: QuestionCardsPayload = {
      categories: values.categories.map(category => ({
        uuid: category.uuid,
        content: category.content,
        cards: category.cards.map(card => ({
          uuid: card.uuid,
          content: card.content,
        })),
      })),
    };

    try {
      const saved = await saveAdminQuestionCards(payload);
      await mutate(ADMIN_QUESTION_CARDS_ENDPOINT);
      reset({
        categories: saved.categories.map(category => ({
          uuid: category.uuid,
          content: {
            en: category.content.en ?? '',
            de: category.content.de ?? '',
          },
          cards: category.cards.map(card => ({
            uuid: card.uuid,
            content: {
              en: card.content.en ?? '',
              de: card.content.de ?? '',
            },
          })),
        })),
      });
      setSaveToast({
        id: Date.now(),
        headline: 'Success',
        title: 'Question cards saved.',
      });
    } catch (e: any) {
      setSaveToast({
        id: Date.now(),
        headline: 'Error',
        title: e?.message || 'Failed to save question cards.',
      });
    } finally {
      setSaving(false);
    }
  };

  usePageHeader({
    breadcrumbs: {
      items: [{ label: 'Communications', to: COMMUNICATIONS_ROUTE }],
      current: 'Question cards',
    },
    actions: (
      <Button
        appearance={ButtonAppearance.Primary}
        size={ButtonSizes.Small}
        onClick={handleSubmit(onSave)}
        disabled={saving || (!isDirty && !!data)}
        loading={saving}
      >
        Save changes
      </Button>
    ),
  });

  return (
    <EditorRoot>
      {error && (
        <StatusMessage type={StatusTypes.Error} visible>
          Failed to load question cards.
        </StatusMessage>
      )}

      {isLoading ? (
        <Loading size={LoadingSizes.Medium} />
      ) : (
        <TwoPaneLayout>
          <CategoryRail>
            <CategoryRailTop>
              <CategoryRailLabel>Categories</CategoryRailLabel>
              {categoryFields.length === 0 ? (
                <CategoryRailEmpty>
                  No categories yet. Add one to get started.
                </CategoryRailEmpty>
              ) : (
                categoryFields.map((field, index) => {
                  const title =
                    watchedCategories[index]?.content?.en?.trim() ||
                    `Category ${index + 1}`;
                  const cardCount =
                    watchedCategories[index]?.cards?.length ?? 0;

                  return (
                    <CategoryRailItem
                      key={field.id}
                      type="button"
                      $selected={selectedIndex === index}
                      onClick={() => setSelectedCategoryIndex(index)}
                    >
                      <CategoryRailItemTitle title={title}>
                        {title}
                      </CategoryRailItemTitle>
                      <CategoryRailCount>{cardCount}</CategoryRailCount>
                    </CategoryRailItem>
                  );
                })
              )}
              <CategoryRailAddBtn
                type="button"
                onClick={addCategory}
                disabled={saving}
              >
                <PlusIcon style={{ width: 14, height: 14 }} />
                Add category
              </CategoryRailAddBtn>
            </CategoryRailTop>
          </CategoryRail>

          <MainPane>
            {selectedIndex === null ? (
              <EmptyCategoryPane>
                Select a category or create one to edit question cards.
              </EmptyCategoryPane>
            ) : (
              <CategoryEditorPane
                key={categoryFields[selectedIndex]?.id ?? selectedIndex}
                categoryIndex={selectedIndex}
                register={register}
                control={control}
                saving={saving}
                categoryTitle={
                  watchedCategories[selectedIndex]?.content?.en?.trim() ||
                  `Category ${selectedIndex + 1}`
                }
                canDeleteCategory={
                  (watchedCategories[selectedIndex]?.cards?.length ?? 0) === 0
                }
                onDeleteCategory={handleDeleteCategory}
                onDeleteCard={async cardIndex => {
                  try {
                    await handleDeleteCard(cardIndex);
                  } catch (e: any) {
                    setSaveToast({
                      id: Date.now(),
                      headline: 'Error',
                      title: e?.message || 'Failed to delete card.',
                    });
                    throw e;
                  }
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

export default QuestionCards;
