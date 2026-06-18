import { apiFetch } from './helpers';

export type TranslationContent = {
  en: string;
  de: string;
};

export type AdminQuestionCard = {
  uuid: string;
  sort_order: number;
  content: TranslationContent;
};

export type AdminQuestionCategory = {
  uuid: string;
  sort_order: number;
  content: TranslationContent;
  cards: AdminQuestionCard[];
};

export type AdminQuestionCardsResponse = {
  categories: AdminQuestionCategory[];
};

export type QuestionCardFormValue = {
  uuid?: string;
  content: TranslationContent;
};

export type QuestionCategoryFormValue = {
  uuid?: string;
  content: TranslationContent;
  cards: QuestionCardFormValue[];
};

export type QuestionCardsPayload = {
  categories: QuestionCategoryFormValue[];
};

export const ADMIN_QUESTION_CARDS_ENDPOINT = '/api/admin/question_cards/';

export const fetchAdminQuestionCards = () =>
  apiFetch<AdminQuestionCardsResponse>(ADMIN_QUESTION_CARDS_ENDPOINT, {
    method: 'GET',
  });

export const saveAdminQuestionCards = (payload: QuestionCardsPayload) =>
  apiFetch<AdminQuestionCardsResponse>(ADMIN_QUESTION_CARDS_ENDPOINT, {
    method: 'PUT',
    body: payload,
  });

export const deleteAdminQuestionCategory = (uuid: string) =>
  apiFetch<void>(
    `${ADMIN_QUESTION_CARDS_ENDPOINT}categories/${uuid}/`,
    { method: 'DELETE' },
  );

export const deleteAdminQuestionCard = (uuid: string) =>
  apiFetch<void>(`${ADMIN_QUESTION_CARDS_ENDPOINT}cards/${uuid}/`, {
    method: 'DELETE',
  });
