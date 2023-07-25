import { Children, useState, useEffect } from 'react'
import '../withTailwind.css';
import UserImage from '../atoms/userImage.jsx'
import { withTheme } from "@rjsf/core";
const ThemedForm = withTheme(rjsfDaisyUiTheme);
import validator from "@rjsf/validator-ajv8";
import { rjsfDaisyUiTheme } from "../rjsf-daisyui-theme/rjsfDaisyUiTheme"
import useSWR from 'swr'
import useSWRImmutable from 'swr/immutable'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'


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

const matchingBubbleList = (matches) => {
    return <div className='h-fit flex flex-row items-center content-center justify-center'>
        {matches.map((match, i) => {
            return <div key={i} className="tooltip" data-tip={`${match.partner.first_name} ${match.partner.second_name}`}>
                <UserImage user={match.partner} dimensions={{
                height: 20,
                width: 20
            }}/></div>})}
    </div>
}

const Base = ({children, tableView, _key}) => {
    return tableView ? (
            <td key={_key} className={`${baseTableStyles}`}>{children}</td>
                ) : (
            <div key={_key} className={`${baseTableStyles}`}>{children}</div>)
}

const FIELDS = {
    "profile.image": (field, user, key, tableView) => {
        const imageComponent = <UserImage user={user.profile} dimensions={{
            height: 32,
            width: 32
        }}/>
        return <Base tableView={tableView} _key={key}>{imageComponent}</Base>
    },
    "state.matching_state": (field, user, key, tableView) => {
        const className = user.state.matching_state === "searching" ? "bg-error" : "bg-success"
        const span = <div className={`badge badge-md ${className}`}>{field}</div>
        return <Base tableView={tableView} _key={key}>{span}</Base>
    },
    "profile.user_type": (field, user, key, tableView) => {
        const className = user.profile.user_type === "volunteer" ? "bg-success" : "bg-error"
        const span = <div className={`badge badge-md ${className}`}>{field}</div>
        return <Base tableView={tableView} _key={key}>{span}</Base>
    },
    "profile.first_name": (field, user, key, tableView) => {
        return <Base tableView={tableView} _key={key}>{field}</Base>
    },
    "profile.second_name": (field, user, key, tableView) => {
        return <Base tableView={tableView} _key={key}>{field}</Base>
    },
    "matches.unconfirmed": (field, user, key, tableView) => {
        const matchesListing = matchingBubbleList(field.items)
        return <Base tableView={tableView} _key={key}>{matchesListing}</Base>
    },
    "matches.confirmed": (field, user, key, tableView) => {
        const matchesListing = matchingBubbleList(field.items)
        return <Base tableView={tableView} _key={key}>{matchesListing}</Base>
    },
    "matches.proposed": (field, user, key, tableView) => {
        const matchesListing = matchingBubbleList(field.items)
        return <Base tableView={tableView} _key={key}>{matchesListing}</Base>
    },
    "matches.support": (field, user, key, tableView) => {
        const matchesListing = matchingBubbleList(field.items)
        return <Base tableView={tableView} _key={key}>{matchesListing}</Base>
    },
}

const DEFAULT_FIELDS = [
    "profile.image",
    "profile.user_type",
    "profile.first_name",
    "profile.second_name",
    "matches.unconfirmed",
    "matches.confirmed",
]

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

const updateQueryParams = ({param, value}) => {
    var queryParams = new URLSearchParams(window.location.search);
    if(value === null && queryParams.has(param)) {
      queryParams.delete(param)
    } else if(value !== null) {
      queryParams.set(param, value);
    }
    history.replaceState(null, null, "?"+queryParams.toString());
}

const EMAIL_FIELDS = [
    //"sender",
    "receiver",
    "template",
    "time",
    "retrieve"
]

const EMAIL_FIELD_GETTERS = {
  "retrieve": (email, field, _key, _onclick=null) => {
    return <td key={_key}>
        <button className='btn btn-xs' onClick={_onclick}>View</button>
    </td> 
  },
  "time": (email, field, _key, _onclick=null) => {
    const timeConverted = datetimeAsIsoString(email[field])
    return <td key={_key}><input type="datetime-local" id="datetime" value={timeConverted}/></td>

  },
  "sender": (email, field, _key,  _onclick=null) => {
    return <td key={_key}>
        <UserImage user={email[field].profile} dimensions={{
            height: 20,
            width: 20
        }}/>
        <span>{`${email[field].profile.first_name} ${email[field].profile.second_name} (${email[field].email})`}</span>
    </td>
  },
  "receiver": (email, field, _key,  _onclick=null) => {
    return <td key={_key}>
        <UserImage user={email[field].profile} dimensions={{
            height: 20,
            width: 20
        }}/>
        <span>{`${email[field].profile.first_name} ${email[field].profile.second_name} (${email[field].email})`}</span>
    </td>
  }
}

const datetimeAsIsoString = (datetime) => {
  
  // Deparse value and change it to locale string (difference is due to time zone)
  var date = new Date(datetime);
  var shiftedDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));

  return shiftedDate.toISOString().slice(0,16);
}

const EmailsTable = ({
    emails, 
    setEmailHTML
  }) => {
  console.log("EMAILS", emails)
  // 
  return <><table className="table table-zebra leading-3 w-full z-50 bg-base-100">
        <thead className='bg-base-300'>
          <tr>
            <th></th>
            {EMAIL_FIELDS.map((field, i) => {
                return <th key={i}>{field}</th> 
            })}
          </tr>
        </thead>
        <tbody>
            {emails.items.map((email,i) => {
                return <tr key={i} className='p-0 hover:bg-100 hover:text-success hover:border hover:border-accent'>
                    <th className='w-20'>
                        {i}
                    </th>
                    {EMAIL_FIELDS.map((field, j) => {
                      if(field in EMAIL_FIELD_GETTERS) {
                        if(field === "retrieve") {
                          return EMAIL_FIELD_GETTERS[field](email, field, j, () => {
                            console.log("FETCHING", email[field])
                            fetch(email[field]).then((response) => response.text()).then((html) => {
                              var parser = new DOMParser();
                              var doc = parser.parseFromString(html, "text/html");
                              setEmailHTML(html)
                              console.log("HTML", doc)
                              window.my_modal_1.showModal() 
                            })
                          })
                        }
                        return EMAIL_FIELD_GETTERS[field](email, field, j)
                      } else {
                        return <td key={j}>{email[field]}</td>
                      }
                    })}
                </tr>
            })}
        </tbody>
      </table></>
}


const MATCHING_FIELDS = [
  "score",
  "created_at",
  "matchable"
]
const MATCHING_FIELD_GETTERS = {
  "rendered_results_md_table": (matchingScore, field, _key, _onclick=null) => {
    return <td key={_key}>
        <button className='btn btn-xs' onClick={_onclick}>View Scoring Table</button>
    </td> 
  },
  "matchable": (matchingScore, field, _key, _onclick=null) => {
    const className = matchingScore[field] ? "bg-success" : "bg-error"
    const span = <div className={`badge badge-md ${className}`}>{matchingScore[field] ? "Matchable!" : "X unmatchable"}</div>

    return <td key={_key}>{span}</td> 
  }
}

const MatchingScoreTable = ({data}) => {
  return <>
  <table className="table table-zebra leading-3 w-full z-50 bg-base-100">
        <thead className='bg-base-300'>
          <tr>
            <th></th>
            {MATCHING_FIELDS.map((field, i) => {
                return <th key={i}>{field}</th> 
            })}
          </tr>
        </thead>
        <tbody>
            {data.results.map((matching_score, i) => {
                return <tr key={i} className='p-0 hover:bg-100 hover:text-success hover:border hover:border-accent'>
                    <th className='w-20'>
                        {i}
                    </th>
                    {MATCHING_FIELDS.map((field, j) => {
                      if(field in MATCHING_FIELD_GETTERS) {
                        return MATCHING_FIELD_GETTERS[field](matching_score, field, j, () => {})
                      } else {
                        return <td key={j}>{matching_score[field]}</td>
                      }
                    })}
                </tr>
            })}
        </tbody>
      </table>
    </>
};

const TaskMonitorComponent = ({task_id}) => {
 
  const fetcher = (...args) => fetch(...args).then(res => res.json());
  const { data, error, mutate, isLoading } = useSWR(`/api/admin/tasks/${task_id}/status/`, fetcher, { refreshInterval: 1000 })
  
  if (error) return <div>failed to load</div>
  if (isLoading) return <div>loading...</div>
    
    
  let progressInfo = null
  console.log("INFO", data.info)
  if(data && data?.info && data.info.progress && data.info.progress.startsWith("json:")) {
    progressInfo = JSON.parse(data.info.progress.substring(5))
    console.log("MANGED TO PARSE", progressInfo);
  }

  return <div className='flex flex-row flex-grow rounded-xl content-center justify-center'>
      {data?.state && <div className='bg-info p-4 rounded-xl'>{data.state}</div>}
      {progressInfo && <div className='flex h-full flex-col items-start content-start justify-start w-52'>
          <div className='text-xs'>{progressInfo.progress}/{progressInfo.amnt_users}</div>
          <progress className="progress progress-primary w-full" value={progressInfo.progress} max={progressInfo.amnt_users}></progress>
        </div>}
      {progressInfo && <div className='p-4 bg-success p-4'>
          {progressInfo.state}
        </div>}
  </div>
}

const MatchingTable = ({ user }) => {

  const fetcher = (...args) => fetch(...args).then(res => res.json());
  const [monitorTask, setMonitorTask] = useState(null)
  const { data, error, isLoading } = useSWR(`/api/admin/user_advanced/${user.id}/scores/`, fetcher)


  if (error) return <div>failed to load</div>
  if (isLoading) return <div>loading...</div>
    
  return <div className='flex flex-grow w-full flex-col content-center justify-start items-start'>
    <div className='flex flex-row w-full h-fit items-end content-end justify-end'>
      {monitorTask && <TaskMonitorComponent task_id={monitorTask}/>}
      <button className='btn' onClick={() => {
        fetcher(`/api/admin/user_advanced/${user.id}/request_score_update/`).then((res) => {
          console.log("RES: ", res)
          setMonitorTask(res.task_id)
        })
      }}>Request Calculation</button>
    </div>
    <MatchingScoreTable data={data} />
  </div>

    /**
  return <><table className="table table-zebra leading-3 w-full z-50 bg-base-100">
        <thead className='bg-base-300'>
          <tr>
            <th></th>
            {MATCHING_FIELDS.map((field, i) => {
                return <th key={i}>{field}</th> 
            })}
          </tr>
        </thead>
        <tbody>
            {emails.items.map((email,i) => {
                return <tr key={i} className='p-0 hover:bg-100 hover:text-success hover:border hover:border-accent'>
                    <th className='w-20'>
                        {i}
                    </th>
                    {MATCHING_FIELDS.map((field, j) => {
                        return <td key={j}>{data[field]}</td>
                    })}
                </tr>
            })}
        </tbody>
      </table></>  */
}

const Table = ({users, selectedList, fields, selectedUsers, setSelectedUsers}) => {
    const onClickPage = (page) => {
        updateQueryParams({param: "page", value: page})
    }
      return <><table className="table table-zebra leading-3 w-full z-50 bg-base-100">
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
                        return getTableComponentUser(user, field, j)
                    })}
                </tr>
            })}
        </tbody>
      </table>
        <div className='w-full flex flex-row content-center items-center justify-center h-24 sticky bottom-0 z-50'>
            <div className="stats shadow">
      
              <div className="stat">
                <div className="stat-value">{users.count}</div>
                <div className="stat-desc">Objects in {selectedList} </div>
              </div>
              
            </div>
            <div className="form-control w-full max-w-xs mr-8">
              <label className="label">
                <span className="label-text-alt">Entries per page</span>
              </label>
              <input type="text" placeholder="Type here" className="input input-bordered w-full max-w-xs" defaultValue={users.page_size} onChange={(e) => {
                updateQueryParams({param: "items_per_page", value: e.target.value})
              }}/>
              <button className='btn btn-xs' onClick={() => {
                window.location.reload();
              }}>Refresh</button>
            </div>
    
            <div className="join">
              {users.page !== users.first_page && <>
                <button className="join-item btn">1</button>
                <button className="join-item btn" onClick={() => onClickPage(users.page - 1)}>«</button>
              </>}
              <button className="join-item btn">Page {users.page}</button>
              {users.next_page && <button className="join-item btn" onClick={() => onClickPage(users.next_page)}>»</button>}
            </div>
        </div>
    </>
}

const getTableComponentUser = (user, field, key=0, tableView=true) => {
    const value = fetchFromObject(user, field)
    return FIELDS[field](value, user, key, tableView)
}

const ActionsButtons = () => {
   return <div className='w-full h-fit flex flex-row content-center items-center justify-center'>
            <button className="btn btn-xs">
                details
            </button>
            <button className="btn btn-xs">
                chat
            </button>
   </div> 
}

const UserDetailsCard = ({
        user, 
        _key, 
        deselectUser,
        selectUserForDetails,
        partial=true,
        tiny=false,
        horizontal=false
    }) => {
    if(tiny)
      console.log("RENDERING TINY", user)
    const UserType = getTableComponentUser(user, "profile.user_type", 0, false)
    let Content = <></>
    if(!tiny){
      const ConfirmedMatches = getTableComponentUser(user, "matches.confirmed", 0, false)
      const UnconfirmedMatches = getTableComponentUser(user, "matches.unconfirmed", 0, false)

      Content = <>
        <div className='w-full h-fit text-xs text-center'>
            {"matches.confirmed"}
        </div>
        <div className='w-full h-fit'>
            {ConfirmedMatches}
        </div>
        <div className='w-full h-fit text-xs text-center'>
            {"matches.unconfirmed"}
        </div>
        <div className='w-full h-fit flex flex-row items-center content-center justify-center'>
            {UnconfirmedMatches}
        </div></>
    }
      
    let End = <></>
    if(!partial){
      
      const ProposedMatches = getTableComponentUser(user, "matches.proposed", 0, false)
      
      const filterShemaInterests = {
        type: "array",
        uniqueItems: true,
        items: {
          type: "string",
          enum: user.profile.options.interests.map((op) => op.value)
        },
      };
      console.log("INTERESTS", typeof user.profile.interests, user.profile)
      
      End = <>
            <div className='w-full h-fit text-xs text-center'>
                {"matches.proposed"}
            </div>
            <div className='w-full h-fit text-xs text-center'>
               {ProposedMatches} 
            </div>
            <div class="w-full flex flex-col content-start justify-start items-start gap-4">
              <div className='text-xl'>Interests</div>
              <ThemedForm
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
                  onChange={({formData}) => {
                    setFields(formData)
                  }}
                />
              <div className='text-xl'>About</div>
              <div>{user.profile.description}</div>
              <div className='text-xl'>Other Topics</div>
              <div>{user.profile.additional_interests}</div>
              <div className='text-xl'>Which languages do you speak and how well?</div>
              <div>{user.profile.language_skill_description}</div>
            </div>
        </>
    }


    return <div 
        key={_key} 
        className={`w-full flex ${horizontal ? 'flex-row': 'flex-col'} bg-base-200 h-fit items-center content-center justify-center rounded-xl p-2 gap-2 mb-1 ${!tiny ? 'hover:border-2 hover:border-error hover:bg-base-100' : '' }`}
        onClick={() => {
            if(partial && !tiny){
              updateQueryParams({param: "user_details", value: user.id})
              selectUserForDetails(user)
            }
        }}>
        {(partial && !tiny) && <div className='w-full h-fit flex flex-row items-end justify-end'>
            <button className="btn btn-circle" onClick={deselectUser}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>}
        <div className='w-full h-fit flex flex-row items-center content-center justify-center'>
           <UserImage user={user.profile} dimensions={{
                height: partial ? (tiny ? 50: 120) : 180, 
                width: partial ? (tiny? 50: 120) : 180
           }}/>
        </div>
        <div className={`w-full h-fit ${tiny ? 'text-xs': 'text-2xl'}`}>
            {user.profile.first_name} {user.profile.second_name}
        </div>
        <div className='w-full h-fit text-xs'>
            {UserType}
        </div>
        {Content}
        {(partial && !tiny) && <ActionsButtons />}
        {End}
    </div>
}

const UserSelectionDrawer = ({
        selectedUsersHashes, 
        selectedUsers, 
        fields, 
        children, 
        setSelectedUsers,
        selectUserForDetails
    }) => {
    return <div className='w-full h-full min-h-full max-h-full flex flex-row relative'>
        <div className='w-3/4 h-screen min-h-full max-h-full overflow-y-scroll'>
            {children}
        </div>
        <div className='w-1/4 h-screen min-h-full max-h-full p-1 gap-1 overflow-y-auto'>
            {selectedUsers.map((user, i) => {
                return <UserDetailsCard 
                        user={user} 
                        _key={i} 
                        key={i} 
                        selectUserForDetails={selectUserForDetails}
                        deselectUser={() => {
                            setSelectedUsers(selectedUsersHashes.filter((hash) => hash !== user.hash))
                        }}/>
            })}
        </div>
    </div>
}


const filterShema = {
  type: "array",
  uniqueItems: true,
  items: {
    type: "string",
    enum: Object.keys(FIELDS),
  },
};

const Accordion = ({elements}) => {
    const [expanded, setExpanded] = useState(0)

    return <>{elements.map((element, i) => {
        return <div key={i} className="collapse collapse-arrow bg-base-200">
          <input type="radio" name="my-accordion-2" checked={expanded === i} /> 
          <div className="collapse-title text-xl font-medium" onClick={() => {
              setExpanded(i)
          }}>
            <span>{element.title}</span>
          </div>
          <div className="collapse-content"> 
            <div>{element.content}</div>
          </div>
        </div>})}</>
};

const DynamicDisplay = ({
        querySets, 
        selectedList, 
        children, 
        selectedUsersHashes, 
        selectedUsers, 
        setSelectedUsers, 
        fields,
        setFields,
        selectUserForDetails,
        setData
    }) => {

    return <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <UserSelectionDrawer 
            selectedUsers={selectedUsers} 
            selectedUsersHashes={selectedUsersHashes} 
            setSelectedUsers={setSelectedUsers} 
            selectUserForDetails={selectUserForDetails}>
            {children}
        </UserSelectionDrawer>
        <label htmlFor="my-drawer-2" className="btn btn-primary drawer-button lg:hidden">Open drawer</label>
      
      </div> 
      <div className="drawer-side">
        <label htmlFor="my-drawer-2" className="drawer-overlay"></label> 
        <Accordion elements={[{
            title: "User List Selection", 
            content: (<ul className="menu p-4 w-80 bg-base-200 text-base-content text-left">
            {Object.keys(querySets).map((key, i) => {
                return <li key={i} className='p-2'>
                    <a onClick={() => {
                        selectUserForDetails(null)
                        updateQueryParams({param: "list", value: key})
                         // this will trigger useSWR in the root component to fetch the new data
                        setData(null);
                    }} className={`rounded-btn flex flex-col items-start ${selectedList === key ? 'bg-base-100' : ''}`}>
                        <div className='text-xl'>{key}</div>
                        <div className='text-xs'>{querySets[key]}</div>
                        </a>
                    </li> 
                })}
            </ul>)
        },{
            title: "Table display settings",
            content: (<ThemedForm
                    className='text-xs w-64'
                  schema={filterShema}
                  extraErrors={{}}
                  showErrorList="bottom"
                  uiSchema={{
                    "ui:submitButtonOptions": {
                      norender: true,
                    },
                  }}
                  formData={fields}
                  validator={validator}
                  onChange={({formData}) => {
                    setFields(formData)
                  }}
                />)
        }]} />
      
      </div>
</div>
}

const ChatNavbarContent = ({user1, user2}) => {
  return <>
    <UserDetailsCard user={user1} _key={0} selectUserForDetails={() => {}} deselectUser={() => {}} partial={true} tiny={true} horizontal={true}/>
    <UserDetailsCard user={user2} _key={0} selectUserForDetails={() => {}} deselectUser={() => {}} partial={true} tiny={true} horizontal={true}/>
  </>
}

const ChatNavbar = ({user, chat, unFocousChat}) => {
  return <div className="navbar bg-base-100">
  <div className="navbar-start">
    <div tabIndex={0} className="flex flex-row">
      <ChatNavbarContent user1={user} user2={chat.match}/>
    </div>
  </div>
  <div className="navbar-end">
    <a className="btn" onClick={() => {
      unFocousChat()
    }}>Back to chat overview</a>
  </div>
</div>
}

const AdminChatMessagesDisplay = ({ user, chatMessages }) => {
  console.log("MESSAGES", chatMessages, user);
  return <div className='w-full'>
    {chatMessages.items.toReversed().map((message, i) => {
      const isSelf = message.sender_hash === user.hash;
      const date = new Date(message.sent * 1000)

      return <div className={`chat ${isSelf ? 'chat-end':'chat-start'}`}>
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          <UserImage user={isSelf ? user.profile : chatMessages.match.profile} dimensions={{
            height: 32,
            width: 32
          }}/>
        </div>
      </div>
      <div className="chat-header">
        {isSelf ? user.profile.first_name : chatMessages.match.profile.first_name}
        <time className="text-xs opacity-50">{date.toDateString()}</time>
      </div>
      <div className={`chat-bubble ${message.read ? '': 'border-2 border-error'}`}>{message.text}</div>
      <div className="chat-footer opacity-50">
        {message.read ? 'read' : 'unread'}
      </div>
    </div>
    })}
  </div>
}

const AdminChat = ({ user, messages }) => {
  const [chat, setChat] = useState(null)

  return chat ? <>
    <ChatNavbar user={user} chat={chat} unFocousChat={() => setChat(null)}/>
    <div className='w-full h-full flex flex-col'>
      <AdminChatMessagesDisplay user={user} chatMessages={chat} />
    </div></>: <div className='w-full flex flex-grow items-start content-start justify-start'>
    <div className='w-full h-full flex flex-col gap-2 p-2'>
      {Object.keys(messages).map((message_chat, i) => {
        return <div className='w-full h-fit flex flex-row rounded-xl text-2xl p-3 gap-2 hover:bg-error' onClick={() => {
          setChat(messages[message_chat])
          updateQueryParams({param: "chat", value: messages[message_chat].match.profile.id})
        }}>
          <UserDetailsCard user={messages[message_chat].match} _key={2*i + 1} selectUserForDetails={() => {}} deselectUser={() => {}} partial={true} tiny={true}/>
          <UserDetailsCard user={user} _key={2 * i} selectUserForDetails={() => {}} deselectUser={() => {}} partial={true} tiny={true}/>
        </div>
      })}
      </div>
    </div>
}

const AdvancedUserDetailPageSelect = ({panes, selectedPane, setPane}) => {
  return <>{panes.map((pane, i) => {
        return <li key={i}><a className={`${selectedPane === pane.id ? 'bg-base-300' : ''}`} onClick={() => {
          setPane(pane.id)
        }}>{pane.title}</a></li>
      })}</>
}

const SwitchPane = ({panes, pane}) => {
  return <>{panes.filter((_pane) => _pane.id === pane)[0].component}</>
}

const AdvancedUserDetails = ({user, closeUserDetails, setEmailHTML}) => {
  
  console.log("Rendering advanced user details", user)
  
  const fetcher = (...args) => fetch(...args).then(res => res.json());
  const { data, error, isLoading } = useSWR(`/api/admin/user_advanced/${user.id}/`, fetcher)
  
  console.log("ADVANCED USER FETCHED", data);
  
  
  const [pane, setPane] = useState("user-details")
  
   
  if (error) return <div>failed to load</div>
  if (isLoading) return <div>loading...</div>

  const panes = [{
    title: "User Details",
    id: "user-details",
    component: (
      <div className='w-full flex flex-grow'>
        <div className='w-1/2 flex-grow p-2'>
          <span className='text-2xl'>Profile</span>
          <UserDetailsCard user={data} _key={0} selectUserForDetails={() => {}} deselectUser={() => {}} partial={false}/>
        </div>
        <div className='border border-base-300'></div>
        <div className='w-1/2 flex-grow p-2'>
          <span className='text-2xl'>Actions</span>
          <ul className="steps steps-vertical">
            <li className="step step-primary">Register {(new Date(data.date_joined)).toDateString()}</li>
            {data.state.email_authenticated ? <li className="step step-primary">Email Authenticated</li>: <li className="step">Email Authenticated</li>}
            {data.matches.confirmed.items.length > 0 ? <>
                <li className="step step-primary">First Match</li>
                {data.matches.unconfirmed.items.length > 0 ? <li className="step">View New Match to Confirm</li> : <></>}
              </>: <>
                {data.matches.unconfirmed.items.length > 0 ? <li className="step">View New Match to Confirm</li> : <></>}
                <li className="step">First Match</li>
              </>}
          </ul>
        </div>
      </div>
    ),
  },{
    title: "Chat",
    id: "chat",
    component: <>
        {data?.messages && <AdminChat messages={data.messages} user={data} />}
    </>
  },{
    title: "Emails",
    id: "emails",
    component: <><EmailsTable emails={data["email_logs"]} setEmailHTML={setEmailHTML}/></>
  },{
    title: "Matching",
    id: "matching",
    component: <>
      <h1>Matching Tab</h1>
      <MatchingTable user={data} />
    </>
  },

]
  

    return <div className='w-full h-full flex flex-col'>
       <div className="navbar bg-base-100">
        <div className="navbar-start">
          <div className="dropdown">
            <label tabIndex={0} className="btn btn-ghost lg:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
            </label>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <AdvancedUserDetailPageSelect panes={panes} selectedPane={pane} setPane={setPane} />
            </ul>
          </div>
          <a className="btn btn-ghost normal-case text-xl">{`${user.profile.first_name} ${user.profile.second_name}`}</a>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
              <AdvancedUserDetailPageSelect panes={panes} selectedPane={pane} setPane={setPane} />
          </ul>
        </div>
        <div className="navbar-end">
          <button className="btn" onClick={closeUserDetails}>close</button>
        </div>
      </div>
      <SwitchPane panes={panes} pane={pane} />
    </div>
}


export const AdminPanel = ({
    _querySets,
    _userLists,
    setData,
    initialList
}) => {
  
  // If there is an email being viewed
  const [emailHTML, setEmailHTML] = useState(null)
    
  // A dict {list_name: <paginated-user-listing>}.results = [] ...
  const [userLists, setUserLists] = useState(_userLists)
  // Just a string reference to the current list
  const [list, setList] = useState(initialList)
  // Contains a list of selected users hashes from the current list
  const [usersListsSelections, setUsersListsSelections] = useState({
      "all": [],
      ...{[initialList]: []}
  });
  // The fields that should be currently displayed
  const [fields, setFields] = useState(DEFAULT_FIELDS)
  
  // Updates the users selection for the current selected list
  const setSelectedUsers = (list, users) => {
      setUsersListsSelections({
          ...usersListsSelections,
          [list]: users
      }) 
  }
  // The user that is selected into a details view
  const [detailUser, setDetailUser] = useState(null)
  
  // Filters the users for the current selected users list
  const selectedUsers = userLists[list].results.filter((user) => usersListsSelections[list].indexOf(user.hash) != -1)
    
    return <DynamicDisplay 
            querySets={_querySets} 
            selectedList={list} 
            selectedUsersHashes={usersListsSelections[list]} 
            selectedUsers={selectedUsers} 
            setSelectedUsers={(users) => setSelectedUsers(list, users)}
            fields={fields}
            setFields={setFields}
            selectUserForDetails={(user) => setDetailUser(user)}
            setData={setData}
            >
        {detailUser ? 
            <AdvancedUserDetails user={detailUser} closeUserDetails={() => {
              updateQueryParams({param: "user_details", value: null});
              setDetailUser(null);
            }} setEmailHTML={setEmailHTML}/> : 
            <Table 
              users={userLists[list]} 
              fields={fields} 
              selectedList={list}
              selectedUsers={usersListsSelections[list]} 
              setSelectedUsers={(users) => setSelectedUsers(list, users)}/>}
            <dialog id="my_modal_1" className="modal">
              <form method="dialog" className="modal-box max-w-full w-fit">
                <p className="py-4">Press ESC key or click the button below to close</p>
                <div className="modal-action">
                  {emailHTML && <div dangerouslySetInnerHTML={{ __html: emailHTML }} />}
                  <button className="btn">Close</button>
                </div>
              </form>
            </dialog>
    </DynamicDisplay>
}