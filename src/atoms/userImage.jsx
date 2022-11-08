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
  const { profile_image, profile_avatar, profile_image_type } = user;
  const isAvatar = profile_image_type === 0;
  let avatarConfig;

  if (isAvatar) {
    try {
      avatarConfig = JSON.parse(profile_avatar);
    } catch {
      avatarConfig = null;
    }
  }

  return avatarConfig ? (
    <Avatar {...avatarConfig} />
  ) : (
    <Image alt={alt} src={profile_image} />
  );
};

export default UserImage;
