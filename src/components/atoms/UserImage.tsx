import {
  Gradients,
  StarIcon,
  Tooltip,
} from '@a-little-world/little-world-design-system';
import React from 'react';
import ReactAvatar from 'react-nice-avatar';
import styled from 'styled-components';

const Image = styled.img<{ $dimensions?: { height: number; width: number } }>`
  border-radius: 50%;
  height: ${({ $dimensions }) => $dimensions?.height || '64'}px;
  width: ${({ $dimensions }) => $dimensions?.width || '64'}px;
  object-fit: cover;
`;

const Avatar = styled(ReactAvatar)<{
  $dimensions?: { height: number; width: number };
}>`
  height: ${({ $dimensions }) => $dimensions?.height || '64'}px;
  width: ${({ $dimensions }) => $dimensions?.width || '64'}px;
`;

const ImageContainer = styled.div<{
  $dimensions?: { height: number; width: number };
}>`
  position: relative;
  display: inline-block;
  height: ${({ $dimensions }) => $dimensions?.height || '64'}px;
  width: ${({ $dimensions }) => $dimensions?.width || '64'}px;
`;

const StyledStarIcon = styled(StarIcon)<{ $isSmall?: boolean }>`
  position: absolute;
  bottom: ${({ $isSmall }) => ($isSmall ? '-5px' : '0px')};
  right: ${({ $isSmall }) => ($isSmall ? '-5px' : '-4px')};
  z-index: 1;
  width: ${({ $isSmall }) => ($isSmall ? '16px' : '40px')} !important;
  height: ${({ $isSmall }) => ($isSmall ? '16px' : '40px')} !important;
  padding: ${({ $isSmall }) => ($isSmall ? '1px' : '8px')};
  border-width: ${({ $isSmall }) => ($isSmall ? '1px' : '2px')};
`;

interface UserImageProps {
  alt: string;
  user: any;
  dimensions?: { height: number; width: number };
  hasPriority?: boolean;
  tooltipText?: string;
}

const UserImage = ({
  alt,
  user,
  dimensions,
  hasPriority = false,
  tooltipText,
}: UserImageProps) => {
  const { image, avatar_config, image_type } = user;
  const usesAvatar = image_type === 'avatar';
  let avatarConfig = avatar_config;

  const imageElement = usesAvatar ? (
    <Avatar {...avatarConfig} $dimensions={dimensions} />
  ) : (
    <Image alt={alt} src={image} $dimensions={dimensions} />
  );

  const isSmall = dimensions && dimensions.height <= 32;

  const imageWithPriority = hasPriority ? (
    <ImageContainer $dimensions={dimensions}>
      {imageElement}
      <StyledStarIcon
        $isSmall={isSmall}
        circular
        gradient={Gradients.Orange}
        borderColor={Gradients.Orange}
        width={isSmall ? '16' : '32'}
        height={isSmall ? '16' : '32'}
        label="Priority user"
      />
    </ImageContainer>
  ) : (
    imageElement
  );

  if (tooltipText) {
    return (
      <Tooltip text={tooltipText} trigger={<div>{imageWithPriority}</div>} />
    );
  }

  return imageWithPriority;
};

export default UserImage;
