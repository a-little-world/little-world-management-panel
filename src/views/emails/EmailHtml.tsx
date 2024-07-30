import { render as renderEmail } from '@react-email/render';
import React from 'react';

import EmailBuilder from '../../emails/Builder';
import emailsData from '../../emails/data/index';

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

  const email = emailsData[emailTemplateName];
  const emailProps = useQueryParams();
  if (!email) return 'Invalid Email Path';

  return renderEmail(
    <EmailBuilder
      content={email?.content}
      preview={email?.preview}
      {...emailProps}
    />,
    {
      pretty: true,
    },
  );
};

export const EmailHtmlRenderer = ({ template, params }) => {
  const email = emailsData[template];

  if (!email) return 'Invalid Email Path';
  const emailHtml = renderEmail(
    <EmailBuilder
      content={email?.content}
      preview={email?.preview}
      {...params}
    />,
    {
      pretty: true,
    },
  );

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: emailHtml }} />
      <button
        onClick={() => {
          const blob = new Blob([emailHtml], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${template}.html`;
          a.click();
        }}
      >
        Dowload as django template
      </button>
    </>
  );
};

export default EmailHtml;
