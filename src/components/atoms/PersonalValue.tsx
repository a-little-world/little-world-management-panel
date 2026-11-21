import React from 'react';
import styled from 'styled-components';

/**
 * The backend sends `null` for personal details (email, phone, ...) the viewer may not see:
 * panel workers without the Personal details permission. Show that it is hidden, and why,
 * instead of leaving the space empty.
 */
export const HIDDEN_PERSONAL_VALUE_LABEL = 'Hidden';
export const HIDDEN_PERSONAL_VALUE_REASON =
  'Hidden: needs the Personal details permission';

const HiddenText = styled.span`
  color: ${({ theme }) => theme.color.text.tertiary};
  font-style: italic;
`;

export function isHiddenPersonalValue(
  value: string | null | undefined,
): value is null | undefined | '' {
  return value === null || value === undefined || value === '';
}

/** The value as plain text, for tooltips and other places that need a string. */
export function personalValueText(value: string | null | undefined): string {
  return isHiddenPersonalValue(value) ? HIDDEN_PERSONAL_VALUE_REASON : value;
}

/**
 * A personal value, or a muted "Hidden" with the reason as tooltip when the backend withheld it.
 * Pass `children` to render the value differently (e.g. as a link); they are only rendered when
 * the value is present.
 */
export default function PersonalValue({
  value,
  children,
}: {
  value: string | null | undefined;
  children?: React.ReactNode;
}) {
  if (isHiddenPersonalValue(value)) {
    return (
      <HiddenText title={HIDDEN_PERSONAL_VALUE_REASON}>
        {HIDDEN_PERSONAL_VALUE_LABEL}
      </HiddenText>
    );
  }
  return <>{children ?? value}</>;
}
