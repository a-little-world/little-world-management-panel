import React from 'react';
import UserImage from './UserImage';

const MatchesIcons = ({ matches }: { matches: any[] }) => {
    return (
      <div className='h-fit flex flex-row items-center content-center'>
        {matches?.map((match, i) => {
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