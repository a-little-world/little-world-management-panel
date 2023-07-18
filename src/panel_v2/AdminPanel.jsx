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

/**
 * 
                  <table className="table table-zebra">
                    <thead className='sticky top-0 bg-base-300'>
                      <tr>
                        <th></th>
                        <th>Name</th>
                        <th>Job</th>
                        <th>Favorite Color</th>
                      </tr>
                    </thead>
                    <tbody>
                    {users.map((user,i) => {
                        return <tr key={i} className='h-2 p-0'>
                            <th>{i}</th>
                            {fields.map((field, j) => {
                                return getTableComponentUser(user, field)
                            })}
                        </tr>
                    })}
                    </tbody>
                  </table>
              <table className="table table-zebra leading-3 w-full z-50 bg-base-100">
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
 */

const BaseContent = ({users, fields}) => {
    return <div className='bg-error h-full pt-15 relative'>
        <div className='w-full h-full bg-info min-h-full max-h-full'>
            <div className='h-screen bg-accent'>ey</div>
        </div>
    </div>
}

const getTableComponentUser = (user, field) => {
    const value = fetchFromObject(user, field)
    return FIELDS[field](value)
}

export const AdminPanel = ({
    _querySets,
    _userLists
}) => {
    
    const [userLists, setUserLists] = useState(_userLists)
    const [list, setList] = useState("all")
    const [fields, setFields] = useState(Object.keys(FIELDS))
    
    console.log("DATA", _querySets, _userLists)

    return <div className='relative w-full h-full flex flex-col'>
        <NavBar />
        <div className='bg-error h-auto flex flex-grow relative'>
            </div>
        <BaseContent users={userLists[list]} fields={fields} />
    </div>
}