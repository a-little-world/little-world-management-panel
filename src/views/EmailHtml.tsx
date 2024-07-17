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

export const EmailHtmlRenderer = ({
  template,
  params,
}) => {
  const Component = EMAIL_TEMPLATES[template]?.Component;

  if (!Component) return 'Invalid Email Path';
  const emailHtml = renderEmail(<Component {...params} />, {
    pretty: true,
  });

  return <><div dangerouslySetInnerHTML={{ __html: emailHtml }} />
    <button onClick={() => {
      const blob = new Blob([emailHtml], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template}.html`;
      a.click();
    }}>Dowload as django template</button>
  </>;
}

export default EmailHtml;
