import ReactAvatar, { genConfig } from 'react-nice-avatar';
import styled from 'styled-components';

const Image = styled.img`
  border-radius: 50%;
  height: 64px;
  width: 64px;
  object-fit: cover;
`;

const Avatar = styled(ReactAvatar)`
  height: 64px;
  width: 64px;
`;

const UserImage = ({ alt, user }) => {
  const { image, avatar_config, image_type } = user;
  const usesAvatar = image_type === 'avatar';
  console.log("avatar_config", avatar_config, image, image_type, usesAvatar, user)
  let avatarConfig = avatar_config

  return usesAvatar ? (
    <Avatar {...avatarConfig} />
  ) : (
    <Image alt={alt} src={image} />
  );
};

export default UserImage;
