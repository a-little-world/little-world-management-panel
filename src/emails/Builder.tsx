import { Button, Heading, Img, Link, Text } from '@react-email/components';
import React from 'react';

import { EmailLayout } from './shared/Layout';
import {
  button,
  centredParagraph,
  centredSentence,
  codeBlock,
  illustration,
  link,
  paragraph,
  sentence,
  title,
} from './shared/styles';

export enum ContentTypes {
  Paragraph = 'paragraph',
  List = 'list',
  Title = 'title',
  Code = 'code',
  Subtitle = 'subtitle',
  Heading = 'heading',
  Emphasize = 'emphasize',
  Sentence = 'sentence',
  Illustration = 'illustration',
  Button = 'button',
  Link = 'link',
}

type Props = {
  content: {
    type: ContentTypes;
    centred?: boolean;
    imgProps?: {
      src: string;
      width: string;
      alt: string;
    };
    href?: string;
    text: string;
    listItems?: string[];
  }[];
  preview: string;
};

const EmailBuilder = ({ content, preview }: Props) => {
  return (
    <EmailLayout previewText={preview}>
      {content.map(({ centred, text, type, imgProps, listItems }) => {
        // if (type === ContentTypes.Heading)
        //   return (
        //     <Text style={heading} key={text}>
        //       {text}
        //     </Text>
        //   );

        if (type === ContentTypes.Title)
          return (
            <Heading style={title} key={text}>
              {text}
            </Heading>
          );

        if (type === ContentTypes.Code)
          return (
            <code style={codeBlock} key={text}>
              {text}
            </code>
          );

        // if (type === ContentTypes.Subtitle)
        //   return (
        //     <Text style={subtitle} key={text}>
        //       {text}
        //     </Text>
        //   );
        //console.log({ centred, text });
        if (type === ContentTypes.Paragraph)
          return (
            <Text style={centred ? centredParagraph : paragraph} key={text}>
              {text}
            </Text>
          );

        if (type === ContentTypes.Sentence)
          return (
            <Text style={centred ? centredSentence : sentence} key={text}>
              {text}
            </Text>
          );

        if (type === ContentTypes.Button)
          return (
            <Button style={button} key={text} target="_blank">
              {text}
            </Button>
          );

        if (type === ContentTypes.Link)
          return (
            <Link style={link} key={text}>
              {text}
            </Link>
          );

        if (type === ContentTypes.Illustration)
          return (
            <Img style={illustration} key={text} {...imgProps}>
              {text}
            </Img>
          );

        // if (type === ContentTypes.List)
        //   return (
        //     <List key={listItems?.[0]}>
        //       {listItems?.map(item => (
        //         <ListItem key={item} tag="li">
        //           {item}
        //         </ListItem>
        //       ))}
        //     </List>
        //   );

        // if (type === ContentTypes.Emphasize)
        //   return (
        //     <Text key={text} bold>
        //       {text}
        //     </Text>
        //   );
      })}
    </EmailLayout>
  );
};

export default EmailBuilder;
