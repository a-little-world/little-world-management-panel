import {
  ButtonVariations,
  ChevronDownIcon,
  Button as DSButton,
  PencilIcon,
  TrashIcon,
} from '@a-little-world/little-world-design-system';
import { Button, Heading, Img, Link, Text } from '@react-email/components';
import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

import EditableText from '../atoms/EditableText';
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
  //   List = 'list',
  Code = 'code',
  //   Subtitle = 'subtitle',
  //   Heading = 'heading',
  //   Emphasize = 'emphasize',
  Illustration = 'illustration',
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
  deleteBlock: (index: number) => void;
  moveBlock: (index1: number, index2: number) => void;
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

const EmailBlock = ({
  centred,
  text,
  type,
  imgProps,
  listItems,
}: BlockDataType) => {
  // if (type === ContentTypes.Heading)
  //   return (
  //     <Text style={heading} key={text}>
  //       {text}
  //     </Text>
  //   );

  if (type === ContentTypes.Title)
    return (
      <EditableText
        key={text}
        defaultText={text}
        Component={Heading}
        componentProps={{ style: title }}
      />
    );

  if (type === ContentTypes.Code)
    return (
      <EditableText
        key={text}
        defaultText={text}
        Component={'code'}
        componentProps={{ style: codeBlock }}
      />
    );

  // if (type === ContentTypes.Subtitle)
  //   return (
  //     <Text style={subtitle} key={text}>
  //       {text}
  //     </Text>
  //   );

  if (type === ContentTypes.Paragraph)
    return (
      <EditableText
        key={text}
        defaultText={text}
        Component={Text}
        componentProps={{ style: centred ? centredParagraph : paragraph }}
      />
    );

  if (type === ContentTypes.Sentence)
    return (
      <EditableText
        key={text}
        defaultText={text}
        Component={Text}
        componentProps={{ style: centred ? centredSentence : sentence }}
      />
    );

  if (type === ContentTypes.Button)
    return (
      <EditableText
        key={text}
        defaultText={text}
        Component={Button}
        componentProps={{ style: button, target: '_blank' }}
      />
    );

  if (type === ContentTypes.Link)
    return (
      <EditableText
        key={text}
        defaultText={text}
        Component={Link}
        componentProps={{ style: link }}
      />
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
};

const EditableEmailBlock: React.FC = ({
  blockData,
  index,
  moveBlock,
  deleteBlock,
  totalBlocks,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const showComponent = useCallback(() => setIsVisible(true), []);
  const hideComponent = useCallback(() => setIsVisible(false), []);

  return (
    <EditWrapper
      onMouseEnter={showComponent}
      onMouseLeave={hideComponent}
      onTouchStart={showComponent}
      onTouchEnd={hideComponent}
    >
      {isVisible && (
        <EditActions>
          <DSButton
            variation={ButtonVariations.Icon}
            onClick={() => deleteBlock(index)}
          >
            <PencilIcon
              label="edit block"
              labelId="editBlockIcon"
              width={16}
              height={16}
            />
          </DSButton>
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

      <EmailBlock {...blockData} />
    </EditWrapper>
  );
};

const EmailBuilder = ({
  content,
  preview,
  editable,
  deleteBlock,
  moveBlock,
}: Props) => {
  return (
    <EmailLayout previewText={preview}>
      {content?.map((blockData, index) =>
        editable ? (
          <EditableEmailBlock
            key={index + blockData.type}
            blockData={blockData}
            index={index}
            moveBlock={moveBlock}
            deleteBlock={deleteBlock}
            totalBlocks={content.length}
          />
        ) : (
          <EmailBlock key={index + blockData.type} {...blockData} />
        ),
      )}
    </EmailLayout>
  );
};

export default EmailBuilder;
