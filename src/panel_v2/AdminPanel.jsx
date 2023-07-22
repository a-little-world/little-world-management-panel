import { Children, useState } from 'react'
import '../withTailwind.css';
import UserImage from '../atoms/userImage.jsx'


const NavBar = () => {
    return <div className='h-fit w-full flex flex-row bg-base-300'>
        <div className='flex flex-grow'>
            <div className="tabs">
              <a className="tab tab-lifted">Tab 1</a> 
              <a className="tab tab-lifted tab-active">Tab 2</a> 
              <a className="tab tab-lifted">Tab 3</a>
            </div>
        </div>
    </div>
}

const baseTableStyles = "p-0 h-2"

const FIELDS = {
    //""
    "profile.user_type": (field) => (<td className={`${baseTableStyles}`}>{field}</td>),
    "profile.first_name": (field) => (<td className={`${baseTableStyles}`}>{field}</td>),
    "profile.second_name": (field) => (<td className={`${baseTableStyles}`}>{field}</td>),
}

function fetchFromObject(obj, prop){
    //property not found
    if(typeof obj === 'undefined') return false;
    
    //index of next property split
    var _index = prop.indexOf('.')

    //property split found; recursive call
    if(_index > -1){
        //get object at property (before split), pass on remainder
        return fetchFromObject(obj[prop.substring(0, _index)], prop.substr(_index+1));
    }
    
    //no split; get property
    return obj[prop];
}

const Table = ({users, fields, selectedUsers, setSelectedUsers}) => {
    console.log("SELECTED", selectedUsers)
      return <table className="table table-zebra leading-3 w-full z-50 bg-base-100">
        <thead className='bg-base-300'>
          <tr>
            <th></th>
            {fields.map((field, i) => {
                return <th key={i}>{field}</th> 
            })}
          </tr>
        </thead>
        <tbody>
        {users.results.map((user,i) => {
            return <tr key={i} className='p-0 hover:bg-100 hover:text-success hover:border hover:border-accent'>
                <th className='w-20'>
                    <input type="checkbox" checked={selectedUsers.indexOf(user.hash) != -1} className="checkbox ml-2" onChange={() => {
                        if(selectedUsers.indexOf(user.hash) != -1) {
                            setSelectedUsers(selectedUsers.filter((hash) => hash !== user.hash))
                        } else {
                            setSelectedUsers([...selectedUsers, user.hash])
                        }
                    }}/>
                </th>
                {fields.map((field, j) => {
                    return getTableComponentUser(user, field)
                })}
            </tr>
        })}
        </tbody>
      </table>
}

const getTableComponentUser = (user, field) => {
    const value = fetchFromObject(user, field)
    return FIELDS[field](value)
}

const UserDetailsCard = ({user}) => {
    return <div className='w-full flex flex-col bg-error h-72'>
        <div className='w-full h-32 bg-error'>
           <UserImage user={user.profile} />
        </div>
        <div className='w-full h-10 bg-info'>
        Ho
        </div>
    </div>
}

const UserSelectionDrawer = ({selectedUsersHashes, selectedUsers, fields, children}) => {
    return <div className='w-full h-full min-h-full max-h-full flex flex-row relative'>
        <div className='w-3/4 h-screen min-h-full max-h-full overflow-y-scroll'>
            {children}
        </div>
        <div className='w-1/4 h-full bg-accent min-h-full max-h-full'>
            {selectedUsers.map((user, i) => {
                return <UserDetailsCard user={user} />
            })}
        </div>
    </div>
}

const DynamicDisplay = ({querySets, selectedList, children, selectedUsersHashes, selectedUsers}) => {

    return <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <UserSelectionDrawer selectedUsers={selectedUsers} selectedUsersHashes={selectedUsersHashes}>
            {children}
        </UserSelectionDrawer>
        <label htmlFor="my-drawer-2" className="btn btn-primary drawer-button lg:hidden">Open drawer</label>
      
      </div> 
      <div className="drawer-side">
        <label htmlFor="my-drawer-2" className="drawer-overlay"></label> 
        <ul className="menu p-4 w-80 h-full bg-base-200 text-base-content text-left">
            {Object.keys(querySets).map((key, i) => {
                return <li key={i} className='p-2'>
                    <a onClick={() => {

                    }} className={`rounded-btn flex flex-col items-start ${selectedList === key ? 'bg-base-100' : ''}`}>
                        <div className='text-xl'>{key}</div>
                        <div className='text-xs'>{querySets[key]}</div>
                    </a>
                </li> 
            })}
        </ul>
      
      </div>
</div>
}


export const AdminPanel = ({
    _querySets,
    _userLists
}) => {
    
    // A dict {list_name: <paginated-user-listing>}.results = [] ...
    const [userLists, setUserLists] = useState(_userLists)
    // Just a string reference to the current list
    const [list, setList] = useState("all")
    // Contains a list of selected users hashes from the current list
    const [usersListsSelections, setUsersListsSelections] = useState({
        "all": []
    });
    // The fields that should be currently displayed
    const [fields, setFields] = useState(Object.keys(FIELDS))
    
    // Updates the users selection for the current selected list
    const setSelectedUsers = (list, users) => {
        console.log("UPDATE users selection", users)
        setUsersListsSelections({
            ...usersListsSelections,
            [list]: users
        }) 
    }
    
    // Filters the users for the current selected users list
    const selectedUsers = userLists[list].results.filter((user) => usersListsSelections[list].indexOf(user.hash) != -1)
    
    return <DynamicDisplay querySets={_querySets} selectedList={list} selectedUsersHashes={usersListsSelections[list]} selectedUsers={selectedUsers}>
        <Table users={userLists[list]} fields={fields} selectedUsers={usersListsSelections[list]} setSelectedUsers={(users) => setSelectedUsers(list, users)}/>
    </DynamicDisplay>
}