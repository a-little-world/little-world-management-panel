import Form from "@rjsf/material-ui";
import ReactMarkdown from 'react-markdown'
//import Form from "@rjsf/core";
import ReactJson from 'react-json-view'
import { useEffect, useState } from 'react';
import { simulateFilterUpdate } from '../loginSimulator';
import Header from '../atoms/header';
import Panel from '../atoms/panel';
import UserImage from '../atoms/userImage';
import { getCookiesAsObject } from "../utils";
import remarkGfm from 'remark-gfm';

import Dropdown from '../atoms/dropdown';
import { genericTwoUserApiCall } from '../api';
import {
  OverlaySelectorListContainer,
  OverlaySelectorTopMenu,
  OverlaySelectorToggle,
  ActionsMenuResultsContainer,
  InputFormContainer,
  UserDetailed,
  UserTags,
  Button,
  CloseIcon,
  Container,
  Filter,
  Filters,
  FlexContainer,
  InteractionsContainer,
  Name,
  Option,
  OrderedList,
  PanelFallbackText,
  SearchPanels,
  SearchSection,
  Selections,
  Subheading,
  Text,
  User,
  UserList,
  OverlaySelector,
} from './styles';
import { 
  USER_FILTERS, 
  ADDITIONAL_USER_FIELDS,
  ADMIN_ACTIONS,
} from '../constants';
import { RJSFSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";

const markdown = `A paragraph with *emphasis* and **strong importance**.

| a | b |
| - | - |
`

const UserItem = ({
  isSelected,
  user,
  setSelection1,
  setSelection2,
  setViewUser,
}) => (
  <User>
    <Name>
      {user.profile.first_name} {user.profile.second_name} ({user.user.email})
    </Name>
    <Option onClick={setViewUser}>View</Option>
    <Option disabled={isSelected} onClick={setSelection1}>
      Select (1)
    </Option>
    <Option disabled={isSelected} onClick={setSelection2}>
      Select (2)
    </Option>
  </User>
);

const UserListItemDetailed = ({
  isSelected,
  user,
  setSelection1,
  setSelection2,
  setViewUser,
  stateInfo,
  userTags,
  updateUserTags,
  mode = 'regular' // or suggestions
}) => {
  const curUserTags = userTags.filter((u) => u.userHash === user.user.hash)[0]
  
  return (
  <><UserDetailed>
    <Name>
      {user.profile.first_name} {user.profile.second_name} ({user.user.email})
    </Name>
  {mode === 'regular' && 
    <Option onClick={setViewUser}>View</Option>}
    {mode === 'regular' && <Option disabled={isSelected} onClick={setSelection1}>
      Select (1)
    </Option>}
    <Option disabled={isSelected} onClick={setSelection2}>
      Select (2)
    </Option>
    {mode === 'regular' && <Option onClick={(e) => {
          const parser = new URL(window.location);
          parser.searchParams.set("suggest", user.user.hash);
          window.open(parser.href, '_blank');
    }}>
      Focus for maching
    </Option>}
    {mode === 'suggestion' && <Option>
      Score: {user.score.score}
      </Option>}
    {mode === 'suggestion' && <Option>
      View Scoring Table
      </Option>}
  </UserDetailed>
  <UserTags>
      {stateInfo?.filter_options.state.tags.map((tag) => (
        <Option style={{
          'font-size': '10px',
          'padding': '0px',
          'background': curUserTags?.tags.includes(tag.value) ? 'green' : 'white'
        }} onClick={(e)=> {
          fetch(`/api/admin/user/tag/toggle/`, {
            method: 'POST',
            headers: {
              'X-CSRFToken': getCookiesAsObject().csrftoken,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              tag: tag.value,
              user: user.user.hash,
              lookup: 'hash'
            }),
          }).then((res) => {
            if(res.status === 200)
              res.json().then(json => {
                updateUserTags(prevState => [...prevState.filter((u) => u.userHash !== user.user.hash), {
                  tags: json.tags,
                  userHash: curUserTags.userHash
                }])
              });
          })
        }}>
          {tag.tag}
        </Option>
      ))}
    </UserTags>
  </>
)}

const UserPanel = ({ additionalFields = [], heading, user, fallback }) => (
  <Panel heading={heading}>
    {user ? (
      <>
        <FlexContainer>
          <UserImage
            alt={`${user.profile.first_name} avatar`}
            user={user.profile}
          />
          <Name>
            {user.profile.first_name} {user.profile.second_name} ({user.user.email})
          </Name>
        </FlexContainer>

        <Text>{user.profile.email}</Text>
        <Text>{user.hash}</Text>
        {additionalFields.map(field => (
          <Text key={field}>{`${field}: ${user.profile[field]}`}</Text>
        ))}
        <ReactJson src={user} collapsed={true} />
      </>
    ) : (
      <PanelFallbackText>{fallback}</PanelFallbackText>
    )}
  </Panel>
);

export const Dashboard = ({
  availableFilters = USER_FILTERS,
  initalFilters = localStorage.getItem('filterTags') || '[]',
  users,
  stateInfo
}) => {
  const [selection1, setSelection1] = useState(null);
  const [selection2, setSelection2] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [filters, setFilters] = useState(JSON.parse(initalFilters));
  const [adminAction, setAdminAction] = useState(ADMIN_ACTIONS.makeMatch);
  //const [adminFormData, setAdminFormData] = useState({formData: {}});
  const [requestResponse, updateRequestResponse] = useState({});
  const [overlaySelectorState, setOverlaySelectorState] = useState({
    visible: false,
    tab: 'users'
  })
  const [userTags, setUserTags] = useState(null)
  const [suggestionTable, setSuggestionTable] = useState(null);

  useEffect(() => {
    /* This should be handled by a some sort of global state instead */
    setUserTags(users.map((u) => {
      return {
        tags: u.state.tags,
        userHash: u.user.hash
      }
    }));
  }, [users])

  useEffect(() => {
    updateRequestResponse(stateInfo);

    if (stateInfo?.s1)
      setSelection1(users.filter(u => u.user.hash === stateInfo.s1)[0]);

    if (stateInfo?.s2)
      setSelection2(users.filter(u => u.user.hash === stateInfo.s2)[0]);

  }, [stateInfo, users]);

  const updateFilters = updatedFilters => {
    /*
     * This causes a page reload ( as intended )
     * Of course we could also add and api e.g.: `GET /admin/users/?filter=....`
     * But untill we have that api we reload the page with the filter added as get param
     */
    const filterStrings = updatedFilters.map(
      filter => availableFilters[filter].filters,
    );
    setFilters(filters => [...updatedFilters]);
    // Store the current filterTags, so they can persist after reload. This can be removed if we replace the reload with an API
    localStorage.setItem('filterTags', JSON.stringify(updatedFilters));
    simulateFilterUpdate(filterStrings);
  };

  return (
    <Container>
      <Header />
      <InteractionsContainer>
        <Selections>
          <UserPanel
            heading="Selection 1"
            user={selection1}
            fallback={'Select an available user from the list below'}
          />
          <UserPanel
            heading="Selection 2"
            user={selection2}
            fallback={'Select an available user from the list below'}
          >
            <ReactJson src={adminAction?.result} />
          </UserPanel>
          <InputFormContainer>
            <Dropdown
                name="filters"
                id="filter-select"
                onChange={e => setAdminAction(ADMIN_ACTIONS[e.target.value])}
            >
              <option value="">--sect an admin action--</option>
                {Object.keys(ADMIN_ACTIONS).map(key => (
                  <option key={key} value={key} selected={key==='makeMatch'}>
                    {ADMIN_ACTIONS[key].text}
                  </option>
                ))}
            </Dropdown>
            {/* We can coveniently use react-jsonschema-form 
            this allowes us to copy our open api schemas 
            and this will automaticly generate froms based on it
            We can dynamicly input userdata to this form ( -> see constants.ADMIN_ACTIONS.schema )
            but still allow admins to change the other form params! 
            -> react-jsonschema-form.readthedocs.io  */}
            <Form 
              name="adminForm"
              schema={adminAction.schema(selection1, selection2)}
              onSubmit={(e) => {
                fetch(adminAction.path, adminAction?.method === 'GET' ? {
                  method: 'GET',
                } :{
                  method: 'POST',
                  redirect: 'manual',
                  headers: {
                    'X-CSRFToken': getCookiesAsObject().csrftoken,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify('transformData' in adminAction ? adminAction.transformData(e.formData) : e.formData )
                }).then(res => {
                  /* TODO based on status code change result background or smth */
                  res.json().then(json => {
                    updateRequestResponse(json);
                  });
                })
              }}
              validator={validator}>
              <Button type='submit'>
                {adminAction.text}
              </Button>
            </Form>
          </InputFormContainer>
        </Selections>
        <SearchSection>
          <Filters>
            <Subheading htmlFor="filter-select">
              Add Search Filter ...
            </Subheading>
            <Dropdown
              name="filters"
              id="filter-select"
              onChange={e => updateFilters([...filters, e.target.value])}
            >
              <option value="">--Select a filter--</option>
              {Object.keys(availableFilters).map(key => (
                <option key={key} value={key}>
                  {availableFilters[key].text}
                </option>
              ))}
            </Dropdown>
            {filters.map(filter => (
              <Filter
                key={filter}
                onClick={() =>
                  updateFilters(filters.filter(item => item !== filter))
                }
              >
                {filter}
                <CloseIcon />
              </Filter>
            ))}
          </Filters>
          <div>
            {/* Temporary page selectors for pagination */}
            {[...Array(stateInfo?.num_pages).keys()].map((x) => x + 1).map(page => {
              return (<><button id={page} onClick={(e) => {
                    // Switch to that page by reloading, with url param
                    const url = window.location.href;
                    const parser = new URL(url || window.location);
                    parser.searchParams.set("page", e.target.id);
                    window.location = parser.href;
              } }>{page}</button><span>  </span></>)
            })}
          </div>
          <Selections>
            <ActionsMenuResultsContainer>
              <ReactJson src={typeof requestResponse === 'string' ? {"msg" : requestResponse } : requestResponse} />
            </ActionsMenuResultsContainer>
            <UserPanel
              additionalFields={ADDITIONAL_USER_FIELDS}
              heading="Detailed User View"
              fallback={
                'Click "View" User list to see a detailed view of that user.'
              }
              user={viewUser}
            />
            <Panel heading="Users searching for a match" Wrapper={UserList}>
              <OrderedList>
                {users.map(user => (
                  <UserItem
                    key={user.hash}
                    user={user}
                    isSelected={[
                      selection1?.user.hash,
                      selection2?.user.hash,
                    ].includes(user.user.hash)}
                    setSelection1={() => setSelection1(user)}
                    setSelection2={() => setSelection2(user)}
                    setViewUser={() => setViewUser(user)}
                  />
                ))}
              </OrderedList>
            </Panel>
          </Selections>
        </SearchSection>
      </InteractionsContainer>
      ...{overlaySelectorState?.visible && 
        <OverlaySelector>
          <OverlaySelectorTopMenu>
            <Option style={{
              'background': overlaySelectorState.tab === 'users' ? 'green' : 'white'
            }} onClick={(e) => {
              setOverlaySelectorState({
                ...overlaySelectorState,
                tab: 'users'
              })
            }}>
              Users
            </Option>
            <Option style={{
              'background': overlaySelectorState.tab === 'suggestions' ? 'green' : 'white'
            }} onClick={(e) => {
              setOverlaySelectorState({
                ...overlaySelectorState,
                tab: 'suggestions'
              })
            }}>
              Suggestions
            </Option>
            <Option style={{
              'background': overlaySelectorState.tab === 'table' ? 'green' : 'white'
            }} onClick={(e) => {
              setOverlaySelectorState({
                ...overlaySelectorState,
                tab: 'table'
              })
            }}>
              Table
            </Option>
            <Option disabled={true}>
              Pages:
            </Option>
            {[...Array(stateInfo?.num_pages).keys()].map((x) => x + 1).map(page => {
              return (<><Option id={page} onClick={(e) => {
                    // Switch to that page by reloading, with url param
                    const url = window.location.href;
                    const parser = new URL(url || window.location);
                    parser.searchParams.set("page", e.target.id);
                    window.location = parser.href;
              } }>{page}</Option><span>  </span></>)
            })}
          </OverlaySelectorTopMenu>
          <OverlaySelectorListContainer>
            <OrderedList style={{display: overlaySelectorState.tab === 'users' ? 'block' : 'none'}}>
              {users.map(user => (
                <UserListItemDetailed
                  key={user.hash}
                  user={user}
                  isSelected={[
                    selection1?.user.hash,
                    selection2?.user.hash,
                  ].includes(user.user.hash)}
                  setSelection1={() => setSelection1(user)}
                  setSelection2={() => setSelection2(user)}
                  setViewUser={() => setViewUser(user)}
                  stateInfo={stateInfo}
                  userTags={userTags}
                  updateUserTags={setUserTags}
                />
              ))}
            </OrderedList>
            <OrderedList style={{display: overlaySelectorState.tab === 'suggestions' ? 'block' : 'none'}}>
              {stateInfo.suggested_users?.map(user => (
                <UserListItemDetailed
                  key={user.hash}
                  user={user}
                  isSelected={[
                    selection1?.user.hash,
                    selection2?.user.hash,
                  ].includes(user.user.hash)}
                  setSelection1={() => setSelection1(user)}
                  setSelection2={() => setSelection2(user)}
                  setViewUser={() => setViewUser(user)}
                  stateInfo={stateInfo}
                  userTags={userTags}
                  updateUserTags={setUserTags}
                  mode="suggestion"
                />
              ))}
            </OrderedList>
            {overlaySelectorState.tab === "table"  && 
            <div style={{ background: 'white'}}><ReactMarkdown 
              children={selection2?.score.rendered_results_md_table} remarkPlugins={[remarkGfm]} /></div>}
          </OverlaySelectorListContainer>
        </OverlaySelector>
      }
      <OverlaySelectorToggle onClick={(e) => {
        setOverlaySelectorState({...overlaySelectorState, visible: !overlaySelectorState.visible})
      }}>
        YO YO
      </OverlaySelectorToggle>
    </Container>
  );
};
