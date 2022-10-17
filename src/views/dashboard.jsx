import { useState } from 'react';

import Header from '../atoms/header';
import Panel from '../atoms/panel';
import Dropdown from '../atoms/dropdown';
import {
  Button,
  CloseIcon,
  Container,
  Filter,
  Filters,
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
import { DUMMY_FILTERS, ADDITIONAL_USER_FIELDS } from '../constants';

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
        <Name>
          {user.profile.first_name} {user.profile.second_name}
        </Name>
        <Text>{user.profile.email}</Text>
        <Text>{user.user_h256_pk}</Text>
        {additionalFields.map(field => (
          <Text>{`${field}: ${user.profile[field]}`}</Text>
        ))}
      </>
    ) : (
      <PanelFallbackText>{fallback}</PanelFallbackText>
    )}
  </Panel>
);

export const Dashboard = ({ availableFilters = DUMMY_FILTERS, users }) => {
  const [selection1, setSelection1] = useState(null);
  const [selection2, setSelection2] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [filters, setFilters] = useState([]);

  const handleMatchClick = () => {
    // TODO API mutation to confirm match
    // setMatch(selection1.user_h256_pk, selection2.user_h256_pk)
  };

  const removeFilter = filter => {
    setFilters(filters => filters.filter(item => item !== filter));
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
            <Subheading for="filter-select">Add a Search Filter:</Subheading>
            <Dropdown
              name="filters"
              id="filter-select"
              onChange={e =>
                setFilters(filters => [...filters, e.target.value])
              }
            >
              <option value="">--Select a filter--</option>
              {availableFilters.map(filter => (
                <option value={filter}>{filter}</option>
              ))}
            </Dropdown>
            {filters.map(filter => (
              <Filter key={filter} onClick={() => removeFilter(filter)}>
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
