import type { OpenChatAccessUser, OpenChatPartner } from '../../../api/openChat';
import { parseOpenChatInteractionPayload } from '../../../helpers/chat';

export function formatOpenChatAccessUserName(user: OpenChatAccessUser): string {
  const firstName = user.profile?.first_name?.trim() ?? '';
  const secondName = user.profile?.second_name?.trim() ?? '';
  return [firstName, secondName].filter(Boolean).join(' ') || user.email;
}

export function formatOpenChatPartnerName(partner: OpenChatPartner): string {
  if (partner.censored) {
    return 'Censored partner';
  }
  return `${partner.first_name ?? ''} ${partner.second_name ?? ''}`.trim() || 'Partner';
}

export function partnerToUserImageProfile(partner: OpenChatPartner) {
  const name = formatOpenChatPartnerName(partner);
  return {
    image: partner.image ?? null,
    avatar_config: { name },
    image_type: partner.image ? 'upload' : 'avatar',
  };
}

export function accessUserToUserImageProfile(user: OpenChatAccessUser) {
  const name = formatOpenChatAccessUserName(user);
  return {
    image: user.profile?.image ?? null,
    avatar_config: { name },
    image_type: user.profile?.image ? 'upload' : 'avatar',
  };
}

export function formatOpenChatMessagePreview(text: string): string {
  if (parseOpenChatInteractionPayload(text)) {
    return 'Open Chat interaction';
  }
  const trimmed = text.trim();
  if (!trimmed) {
    return 'Empty message';
  }
  return trimmed.length > 80 ? `${trimmed.slice(0, 80)}…` : trimmed;
}
