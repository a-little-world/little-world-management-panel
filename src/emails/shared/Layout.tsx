import { Body, Head, Html, Preview } from '@react-email/components';
import * as React from 'react';

import EmailContent from './EmailContent';
import { THEMES } from './constants';
import { body } from './styles';

interface EmailLayoutProps {
  children: React.ReactNode;
  previewText: string;
  themeContent: (typeof THEMES)[keyof typeof THEMES];
  unsubscribeLink?: boolean;
}

export const EmailLayout = ({
  children,
  previewText,
  themeContent,
  unsubscribeLink,
}: EmailLayoutProps) => {
  return (
    <Html>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="x-apple-disable-message-reformatting" />
        <style type="text/css">
          {`body {background-color: #fafbfb; padding:0;}`}
        </style>
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={body}>
        <EmailContent
          themeContent={themeContent}
          unsubscribeLink={unsubscribeLink}
        >
          {children}
        </EmailContent>
      </Body>
    </Html>
  );
};

export default EmailLayout;
