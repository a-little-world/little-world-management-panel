import React from "react";
import { Button, ButtonVariations, Card } from "@a-little-world/little-world-design-system";
import UserImage from "./UserImage";
import MatchesIcons from "./MatchesIcons";
import Tag, { TagTypes } from "./Tag";
export const UserDetailsCard = ({
    user,
    _key,
    deselectUser,
    selectUserForDetails,
    partial = true,
    tiny = false,
    horizontal = false
  }) => {
  
    if (!user) return <div>Undefined User</div>
    
    let Content = <></>
    if (!tiny) {  
      Content = <>
        <div className='w-full h-fit text-xs text-center'>
          {"matches.confirmed"}
        </div>
        <div className='w-full h-fit'>
        <MatchesIcons matches={user?.matches.confirmed?.items} />
        </div>
        <div className='w-full h-fit text-xs text-center'>
          {"matches.unconfirmed"}
        </div>
        <div className='w-full h-fit flex flex-row items-center content-center justify-center'>
        <MatchesIcons matches={user?.matches.unconfirmed?.items} />
        </div></>
    }
  
    let End = <></>
    if (!partial) {
  
  
      const filterShemaInterests = {
        type: "array",
        uniqueItems: true,
        items: {
          type: "string",
          enum: user.profile.options.interests.map((op) => op.value)
        },
      };
  
      End = <>
        <div className='w-full h-fit text-xs text-center'>
          {"matches.proposed"}
        </div>
        <div className='w-full h-fit text-xs text-center'>
            <MatchesIcons matches={user?.matches.proposed?.items} />
        </div>
        <div className="w-full flex flex-col content-start justify-start items-start gap-2">
          <div className='flex flex-row content-center items-start justify-start'>
            <b className='text-l'>Id</b>: {user.id}
          </div>
          <div className='flex flex-row content-center items-start justify-start'>
            <b className='text-l'>Date Joined</b>: {user.date_joined}
          </div>
          <div className='flex flex-row content-center items-start justify-start'>
            <b className='text-l'>Email</b>: {user.email}
          </div>
          <div className='flex flex-row content-center items-start justify-start'>
            <b className='text-l'>Phone Number</b>: {user.profile.phone_mobile} (Nofify via {user.profile.notify_channel})
          </div>
          <div className='flex flex-row content-center items-start justify-start'>
            <b className='text-l'>Matching State</b>: <div className={`badge badge-md ${user.state.matching_state === "searching" ? "bg-error" : "bg-success"}`}>{user.state.matching_state}</div>
          </div>
          <div className='flex flex-row content-center items-start justify-start'>
            <b className='text-l'>Group</b>: {user.profile.target_group}
          </div>
          <div className='text-xl'>Interests</div>
          {/* <ThemedForm
            className='text-xs w-full'
            schema={filterShemaInterests}
            extraErrors={{}}
            showErrorList="bottom"
            uiSchema={{
              "ui:submitButtonOptions": {
                norender: true,
              },
            }}
            formData={user.profile.interests}
            validator={validator}
            onChange={({ formData }) => {
              setFields(formData)
            }}
          /> */}
          <div className='text-xl'>About</div>
          <div>{user.profile.description}</div>
          <div className='text-xl'>Other Topics</div>
          <div>{user.profile.additional_interests}</div>
          <div className='text-xl'>Which languages do you speak and how well?</div>
          <div>{user.profile.language_skill_description}</div>
        </div>
      </>
    }

    return (
        <div
        key={_key}
        className={`w-full flex ${horizontal ? 'flex-row' : 'flex-col'} bg-base-200 h-fit items-center content-center justify-center rounded-xl p-2 gap-2 mb-1 relativ ${!tiny ? 'hover:border-2 hover:border-error hover:bg-base-100' : ''}`}
        onClick={() => {
        if (partial && !tiny) {
            // updateQueryParams({ param: "user_details", value: user.id })
            selectUserForDetails(user)
        }
        }}>
        {(partial && !tiny) &&
        <div className='w-full h-fit flex flex-row justify-between'>
            <Tag type={user.profile.user_type === 'volunteer' ? TagTypes.primary : TagTypes.secondary}>{user.profile.user_type}</Tag>
            <Button variation={ButtonVariations.Icon} onClick={(e) => {
                deselectUser(user.hash);
                e.stopPropagation();
            }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </Button>
        </div>
        }
        <div className='w-full h-fit flex flex-row items-center content-center justify-center'>
        <UserImage alt='user profile pic' user={user.profile} dimensions={{
            height: partial ? (tiny ? 50 : 120) : 180,
            width: partial ? (tiny ? 50 : 120) : 180
        }} />
        </div>
        {user.state.unresponsive && <div className='w-96 max-w-ful h-10 bg-error text-3xl'>
        Marked as unresponsive
        </div>}
        <div className={`w-full h-fit ${tiny ? 'text-xs' : 'text-2xl'}`}>
        {user.profile.first_name} {user.profile.second_name}
        </div>
        {Content}
        {/* {(partial && !tiny) && <ActionsButtons />} */}
        {End}
    </div>
    )
}

export default UserDetailsCard