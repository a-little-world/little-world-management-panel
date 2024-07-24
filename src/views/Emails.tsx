import {
  Accordion,
  Button,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { render as renderEmail } from '@react-email/render';
import { map } from 'lodash';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import automatedEmails from '../emails/data/automated';
import marketingEmails from '../emails/data/marketing';
import partnershipsEmails from '../emails/data/partnerships';
import emailData from '../emails/data/';
import { dataFetcher } from '../store';
import useSWR from 'swr';
import EmailBuilder from '../emails/Builder';
import { getCookiesAsObject } from '../utils';

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.small};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
`;

const Template = styled(Link)`
  background: ${({ theme }) => theme.color.surface.primary};
  border: 1px solid ${({ theme }) => theme.color.border.bold};
  border-radius: ${({ theme }) => theme.radius.xxsmall};
  color: ${({ theme }) => theme.color.text.heading};
  padding: ${({ theme }) => theme.spacing.xsmall};
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
`;

const GROUPED_TEMPLATES = {
  Automated: map(automatedEmails),
  Marketing: map(marketingEmails),
  Partnerships: map(partnershipsEmails),
};

function developmentUpdateBackendEmailTemplatesAndConfiguration({
  backendEmailConfig,
}) {
  console.log('Syncing backend emails');

  const updateBackendEmailConfig = (newConfig) => {
    return fetch(`/api/matching/emails/config/overwrite/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookiesAsObject().csrftoken,
      },
      body: JSON.stringify(newConfig)
    });
  }

  const overwriteBackendEmailTemplate = (key, html) => {
    return fetch(`/api/matching/emails/templates/${key}/overwrite/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookiesAsObject().csrftoken,
      },
      body: JSON.stringify({
        html: html,
      }),
    });
  }


  const newEmailConfig = backendEmailConfig;
  const templateToUpload = []
  for (const [key, value] of Object.entries(emailData)) {
    console.log(`TEMPLATE: ${key}: ${value}`);
    const email = value;
    const html = renderEmail(<EmailBuilder content={email.content} preview={email.preview} />);
    const templateDict = {
      id: key,
      sender_id: "noreply",
      category_id: "automated",
      subject: backendEmailConfig?.emails?.[key]?.subject ?? "No Subject",
      template: "react_emails/" + key + ".html",
    }
    templateToUpload.push({
      key: key,
      html: html,
    });
    console.log(templateDict);
    newEmailConfig.emails[key] = templateDict;
  }

  const promises = []
  promises.push(updateBackendEmailConfig(newEmailConfig));
  templateToUpload.forEach((template) => {
    promises.push(overwriteBackendEmailTemplate(template.key, template.html));
  });

  return Promise.all(promises);
}

const Emails = () => {
  const GROUPED_TEMPLATES = {
    Automated: map(automatedEmails),
    Marketing: map(marketingEmails),
    Partnerships: map(partnershipsEmails),
  };



  const {
    data: backendEmailConfiguration,
  } = useSWR("/api/matching/emails/config/", dataFetcher, {});

  const onSyncBackendEmails = () => {
    // 1 - fetches the current email confirguration from the backend
    // 2 - injects all the new email templates into the json
    // 3 - creates on zip file to download continaing all the email htmls and an updated emails.json
    developmentUpdateBackendEmailTemplatesAndConfiguration({
      backendEmailConfig: backendEmailConfiguration,
    });
  };

  return (
    <Container>
      <Text type={TextTypes.Heading4}>Email Templates</Text>
      <Accordion
        contentClassName={'emailGroup'}
        items={map(GROUPED_TEMPLATES, (item, header) => {
          return {
            header,
            content: item.map(template => (
              <Template key={template.id} to={template.id}>
                <Text>{template.label}</Text>
              </Template>
            )),
          };
        })}
      />
      <Button onClick={onSyncBackendEmails}> Sync Backend Emails ( Only For Development! )</Button>
    </Container>
  );
};

export default Emails;
