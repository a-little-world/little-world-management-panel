import { useState } from 'react';
import { simulateFilterUpdate } from '../loginSimulator';
import Header from '../atoms/header';
import Panel from '../atoms/panel';
import UserImage from '../atoms/userImage';

import Dropdown from '../atoms/dropdown';
import { apiMakeMatch } from '../api';
import {
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
} from './styles';
import { USER_FILTERS, ADDITIONAL_USER_FIELDS } from '../constants';

const UserItem = ({
  isSelected,
  profile,
  setSelection1,
  setSelection2,
  setViewUser,
}) => (
  <User>
    <Name>
      {profile.first_name} {profile.second_name}
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
            {user.profile.first_name} {user.profile.second_name}
          </Name>
        </FlexContainer>

        <Text>{user.profile.email}</Text>
        <Text>{user.user_h256_pk}</Text>
        {additionalFields.map(field => (
          <Text key={field}>{`${field}: ${user.profile[field]}`}</Text>
        ))}
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
}) => {
  const [selection1, setSelection1] = useState(null);
  const [selection2, setSelection2] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [filters, setFilters] = useState(JSON.parse(initalFilters));

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

  const handleMatchClick = () => {
    apiMakeMatch(selection1.email, selection2.email).then(res => {
      // TODO: handle response the right way, maybe request @tbscode to adopt the reponse format or the API
      res.json().then(json => {
        console.log(json);
      });
    });
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
          />
        </Selections>
        <Button
          onClick={handleMatchClick}
          disabled={!selection1 || !selection2}
        >
          Confirm Match
        </Button>
        <SearchSection>
          <Filters>
            <Subheading htmlFor="filter-select">
              Add a Search Filter:
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
          <SearchPanels>
            <Panel heading="Users searching for a match" Wrapper={UserList}>
              <OrderedList>
                {users.map(user => (
                  <UserItem
                    key={user.user_h256_pk}
                    {...user}
                    isSelected={[
                      selection1?.user_h256_pk,
                      selection2?.user_h256_pk,
                    ].includes(user.user_h256_pk)}
                    setSelection1={() => setSelection1(user)}
                    setSelection2={() => setSelection2(user)}
                    setViewUser={() => setViewUser(user)}
                  />
                ))}
              </OrderedList>
            </Panel>
            <UserPanel
              additionalFields={ADDITIONAL_USER_FIELDS}
              heading="Detailed User View"
              fallback={
                'Click "View" User list to see a detailed view of that user.'
              }
              user={viewUser}
            />
          </SearchPanels>
        </SearchSection>
      </InteractionsContainer>
    </Container>
  );
};
