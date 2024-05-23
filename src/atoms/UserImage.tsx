import React from 'react';
import ReactAvatar from 'react-nice-avatar';
import styled from 'styled-components';

const Image = styled.img<{ $dimensions?: { height: number, width: number }}>`
  border-radius: 50%;
  height: ${({ $dimensions }) => $dimensions?.height || '64'}px;
  width: ${({ $dimensions }) => $dimensions?.width || '64'}px;
  object-fit: cover;
`;

const Avatar = styled(ReactAvatar)<{ $dimensions?: { height: number, width: number }}>`
height: ${({ $dimensions }) => $dimensions?.height || '64'}px;
width: ${({ $dimensions }) => $dimensions?.width || '64'}px;
`;

const UserImage = ({ alt, user, dimensions }: { alt: string, user: any, dimensions?: { height: number, width: number } }) => {
  const { image, avatar_config, image_type } = user;
  const usesAvatar = image_type === 'avatar';
  let avatarConfig = avatar_config

  return usesAvatar ? (
    <Avatar {...avatarConfig} $dimensions={dimensions} />
  ) : (
    <Image alt={alt} src={image} $dimensions={dimensions} />
  );
  
};

export default UserImage;
