import { Children, useState } from 'react'
import '../withTailwind.css';


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

const Table = ({users, fields}) => {
      return <table className="table table-zebra leading-3 w-full z-50 bg-base-100">
        <thead className='bg-base-300'>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Job</th>
            <th>Favorite Color</th>
          </tr>
        </thead>
        <tbody>
        {users.map((user,i) => {
            return <tr key={i} className='p-0 hover:bg-accent hover:text-base-200'>
                <th className='w-20'>
                    <input type="checkbox" checked="checked" className="checkbox ml-2" />
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

const UserSelectionDrawer = ({selectedUsers, fields, children}) => {
    return <div className='w-full h-full bg-error min-h-full max-h-full flex flex-row'>
        <div className='w-3/4 h-full bg-info min-h-full max-h-full'>
            {children}
        </div>
        <div className='w-1/4 h-full bg-accent min-h-full max-h-full'>
            SIDE
        </div>
    </div>
}

const DynamicDisplay = ({querySets,selectedList, children}) => {

    return <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <UserSelectionDrawer>
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
    
    const [userLists, setUserLists] = useState(_userLists)
    const [list, setList] = useState("all")
    const [fields, setFields] = useState(Object.keys(FIELDS))
    
    console.log("DATA", _querySets, _userLists)
    return <DynamicDisplay querySets={_querySets} selectedList={list}>
        <Table users={userLists[list]} fields={fields} />
    </DynamicDisplay>
}