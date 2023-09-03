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

const UserImage = ({ alt, user, dimensions }) => {
  const { image, avatar_config, image_type } = user;
  const usesAvatar = image_type === 'avatar';
  let avatarConfig = avatar_config

  if (typeof dimensions == 'undefined') {
    return usesAvatar ? (
      <Avatar {...avatarConfig} />
    ) : (
      <Image alt={alt} src={image} />
    );
  }else {
    const _Image = styled.img`
      border-radius: 50%;
      height: ${dimensions.height}px;
      width: ${dimensions.width}px;
      object-fit: cover;
    `;
    const _Avatar = styled(ReactAvatar)`
      height: ${dimensions.height}px;
      width: ${dimensions.width}px;
    `;
    return usesAvatar ? (
      <_Avatar {...avatarConfig} />
    ) : (
      <_Image alt={alt} src={image} />
    );
  }
};

export default UserImage;
