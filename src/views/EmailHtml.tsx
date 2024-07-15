import { render as renderEmail } from '@react-email/render';
import React from 'react';

import { EMAIL_TEMPLATES } from './Email';

const useQueryParams = (): Record<string, string> => {
  const queryParams: Record<string, string> = {};
  const searchParams = new URLSearchParams(window.location.search);

  searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });

  return queryParams;
};

const EmailHtml = () => {
  const paths = window?.location.pathname.split('/');
  const emailTemplateName = paths[3];

  const Component = EMAIL_TEMPLATES[emailTemplateName]?.Component;
  const emailProps = useQueryParams();
  if (!Component) return 'Invalid Email Path';

  return renderEmail(<Component {...emailProps} />, {
    pretty: true,
  });
};

export default EmailHtml;
