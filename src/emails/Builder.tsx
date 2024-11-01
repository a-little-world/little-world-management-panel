import {
  ButtonVariations,
  ChevronDownIcon,
  Button as DSButton,
  TrashIcon,
} from '@a-little-world/little-world-design-system';
import { Heading, Img, Link, Text } from '@react-email/components';
import { LinkIcon } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

import EditableText from '../atoms/EditableText';
import ButtonLink from './shared/ButtonLink';
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
  Title = 'title',
  Paragraph = 'paragraph',
  Sentence = 'sentence',
  Code = 'code',
  // Illustration = 'illustration',
  Button = 'button',
  Link = 'link',
}

interface BlockDataType {
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
}

type Props = {
  content: BlockDataType[];
  editable?: boolean;
  preview?: string;
  deleteBlock?: (index: number) => void;
  moveBlock?: (index1: number, index2: number) => void;
  updateText?: ({ index, text }: { index: number; text: string }) => void;
  openHrefEditor?: (index: number) => void;
  unsubscribeLink?: string;
};

const EditActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0px;
  right: 0px;
  height: 100%;
  gap: ${({ theme }) => theme.spacing.small};
  padding: ${({ theme }) => theme.spacing.xxsmall};
  background: ${({ theme }) => theme.color.surface.accent};
  border-radius: 0
    ${({ theme }) => `${theme.radius.small} ${theme.radius.small}`} 0;
`;

const EditWrapper = styled.div`
  width: 100%;
  position: relative;
  border-radius: ${({ theme }) => theme.radius.small};
  &:hover {
    box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px,
      ${({ theme }) => theme.color.border.selected} 0px 0px 0px 3px;

    // ${EditActions} {
    //   display: flex;
    // }
  }
`;

const ChevronUpIcon = styled(ChevronDownIcon)`
  transform: rotate(180deg);
`;

export const BlocksWithLink = [ContentTypes.Button, ContentTypes.Link];

const EmailBlock = ({
  centred,
  href,
  text,
  type,
  imgProps,
  updateText,
}: BlockDataType) => {
  if (type === ContentTypes.Title)
    return (
      <EditableText
        key={text}
        defaultText={text}
        Component={Heading}
        componentProps={{ style: title }}
        updateText={updateText}
      />
    );

  if (type === ContentTypes.Code)
    return (
      <EditableText
        key={text}
        defaultText={text}
        updateText={updateText}
        Component={'code'}
        componentProps={{ style: codeBlock }}
      />
    );

  if (type === ContentTypes.Paragraph)
    return (
      <EditableText
        key={text}
        defaultText={text}
        updateText={updateText}
        Component={Text}
        componentProps={{ style: centred ? centredParagraph : paragraph }}
      />
    );

  if (type === ContentTypes.Sentence)
    return (
      <EditableText
        key={text}
        defaultText={text}
        updateText={updateText}
        Component={Text}
        componentProps={{ style: centred ? centredSentence : sentence }}
      />
    );

  if (type === ContentTypes.Button)
    return (
      <EditableText
        key={text}
        defaultText={text}
        Component={ButtonLink}
        componentProps={{ style: button, href }}
      />
    );

  if (type === ContentTypes.Link)
    return (
      <EditableText
        key={text}
        defaultText={text}
        updateText={updateText}
        Component={Link}
        componentProps={{ style: link, target: '_blank', href }}
      />
    );

  if (type === ContentTypes.Illustration)
    return (
      <Img style={illustration} key={text} {...imgProps}>
        {text}
      </Img>
    );
};

const EditableEmailBlock: React.FC = ({
  blockData,
  index,
  moveBlock,
  deleteBlock,
  totalBlocks,
  updateText,
  openHrefEditor,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const showComponent = useCallback(() => setIsVisible(true), []);
  const hideComponent = useCallback(() => setIsVisible(false), []);

  return (
    <>
      <EditWrapper
        onMouseEnter={showComponent}
        onMouseLeave={hideComponent}
        onTouchStart={showComponent}
        onTouchEnd={hideComponent}
      >
        {isVisible && (
          <EditActions>
            {BlocksWithLink.includes(blockData.type) && (
              <DSButton
                variation={ButtonVariations.Icon}
                onClick={openHrefEditor}
              >
                <LinkIcon height={16} width={16} />
              </DSButton>
            )}
            <DSButton
              variation={ButtonVariations.Icon}
              onClick={() => deleteBlock(index)}
            >
              <TrashIcon
                label="delete block"
                labelId="deleteBlockIcon"
                width={16}
                height={16}
              />
            </DSButton>
            <DSButton
              variation={ButtonVariations.Icon}
              onClick={() => moveBlock(index, index + 1)}
              disabled={index === totalBlocks - 1}
            >
              <ChevronDownIcon
                label="shift block down"
                labelId="moveBlockDownIcon"
                width={16}
                height={16}
              />
            </DSButton>
            <DSButton
              variation={ButtonVariations.Icon}
              onClick={() => moveBlock(index, index - 1)}
              disabled={Boolean(!index)}
            >
              <ChevronUpIcon
                label="shift block up"
                labelId="moveBlockUpIcon"
                width={16}
                height={16}
              />
            </DSButton>
          </EditActions>
        )}

        <EmailBlock {...blockData} updateText={updateText} />
      </EditWrapper>
    </>
  );
};

const EmailBuilder = ({
  content,
  preview,
  editable,
  deleteBlock,
  moveBlock,
  updateText,
  openHrefEditor,
  unsubscribeLink,
}: Props) => {
  return (
    <EmailLayout previewText={preview} unsubscribeLink={unsubscribeLink}>
      {content?.map((blockData, index) =>
        editable ? (
          <EditableEmailBlock
            key={index + blockData.type}
            blockData={blockData}
            index={index}
            moveBlock={moveBlock}
            deleteBlock={deleteBlock}
            totalBlocks={content.length}
            updateText={(text: string) => updateText({ text, index })}
            openHrefEditor={() => openHrefEditor(index)}
          />
        ) : (
          <EmailBlock key={index + blockData.type} {...blockData} />
        ),
      )}
    </EmailLayout>
  );
};

export default EmailBuilder;
