import React from 'react';
import UserImage from './UserImage';
import { isEmpty } from 'lodash';
import { Text, TextTypes } from '@a-little-world/little-world-design-system';

const MatchesIcons = ({ matches, label }: { matches: any[], label?: string }) => {
    return (
      <div className='h-fit flex flex-row items-center content-center gap-2'>
        {label && <Text bold type={TextTypes.Body5}>{label}:</Text>}
        {isEmpty(matches) ? 
        <Text type={TextTypes.Body5}>None</Text>
        : matches?.map((match, i) => {
          return (
          <div key={i} className="tooltip" data-tip={`${match.partner.first_name} ${match.partner.second_name}`}>
            <UserImage alt='match profile pic' user={match.partner} dimensions={{
              height: 20,
              width: 20
            }} />
          </div>
        )})}
      </div>
    )
  }

  export default MatchesIcons