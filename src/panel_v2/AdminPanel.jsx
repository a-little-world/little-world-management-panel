import { Children, useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from "react-router-dom";
import style from './markdown-styles.module.css';
import '../withTailwind.css';
import UserImage from '../atoms/userImage.jsx'
import { withTheme } from "@rjsf/core";
const ThemedForm = withTheme(rjsfDaisyUiTheme);
import validator from "@rjsf/validator-ajv8";
import { rjsfDaisyUiTheme } from "../rjsf-daisyui-theme/rjsfDaisyUiTheme"
import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable'
import { mutate as gMutate } from 'swr'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import MDEditor from '@uiw/react-md-editor';
import { getCookiesAsObject } from '../utils';
import debounce from 'lodash.debounce';
import { set } from 'lodash';

async function processAiRequest(model, messages, updateValue) {
  const response = await fetch('/api/ai/prompt/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookiesAsObject().csrftoken
    },
    body: JSON.stringify({
      "messages": messages,
      "model_config" : model
    })
  });
  
  const task = await response.json();
  
  const fetchResults = async () => {
    const resultsResponse = await fetch(`/api/admin/tasks/${task.task_id}/status/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookiesAsObject().csrftoken
      },
    });
    return await resultsResponse.json();
  }
  
  // now continously fetch the results url
  while(true) {
    const results = await fetchResults();
    if(results.state === "SUCCESS") break;
    if(results.state === "FAILURE") break;
    updateValue(results.info.progress);
    await new Promise(r => setTimeout(r, 100));
  }
  

}

function readableFormatDate(dateString) {
  var date = new Date();
  var dateToCompare = new Date(dateString);
  var diffTime = Math.abs(date - dateToCompare);
  var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

  return diffDays + ' days ago';
}

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

const MatchingSuggestionView = (matchingUser, setQuickViewUser, addUserToSelection) => {
    return <div className='h-fit flex flex-col items-center content-center justify-center'>
            <div className="flex flex-row hover:bg-info p-4 rounded-xl" onClick={() => {
              setQuickViewUser(matchingUser);
            }}>
              <UserImage user={matchingUser.profile} dimensions={{
                height: 20,
                width: 20
              }}/>
              <div>{matchingUser.profile.first_name}, {matchingUser.profile.second_name}</div>
          </div>
          <button className='btn btn-xs' onClick={() => {
            addUserToSelection(matchingUser);
          }}>add to selections</button>
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
        // 

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
    "date_joined": (field, user, key, tableView) => {
      return <Base tableView={tableView} _key={key}>{readableFormatDate(field)}</Base>
    }
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
    "sucess",
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
  "sucess" : (email, field, _key, _onclick=null) => {
      const className = email[field] ? "bg-success" : "bg-error"
      const span = <div className={`badge badge-md ${className}`}>{email[field] ? "sucess": "failure"}</div>
      
      return email[field] ? <td key={_key}>{span}</td> : <td key={_key}>
        {span}
        <button className='btn btn-xs' onClick={_onclick}>Retry</button>        
      </td>
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
    user,
    emails, 
    setEmailHTML
  }) => {
  console.log("EMAILS", emails)
    
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [emailInput, setEmailInput] = useState({subject: null})
  const [emailConfrimHTML, setEmailConfirmHTML] = useState(null);

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
                        } else if (field === "sucess"){
                          return EMAIL_FIELD_GETTERS[field](email, field, j, () => {
                              console.log("Getting email field")

                              fetch(email["retrieve"]).then((response) => response.text()).then((html) => {
                                var parser = new DOMParser();
                                var doc = parser.parseFromString(html, "text/html");
                                setSelectedEmail(email)
                                setEmailConfirmHTML(html)
                                window.email_resend_confirm_modal.showModal()
                              })
                            });
                        }
                        return EMAIL_FIELD_GETTERS[field](email, field, j)
                      } else {
                        return <td key={j}>{email[field]}</td>
                      }
                    })}
                </tr>
            })}
        </tbody>
      </table>
      <dialog id="email_resend_confirm_modal" className="modal">
        <form method="dialog" className="modal-box">
          <h3 className="font-bold text-lg">Hello Do you really want to re-send this email?!</h3>
          <p className="py-4">Subject</p>
          <input type="text" className="input input-bordered w-full max-w-xs" value={emailInput.subject} onChange={(e) => {
            setEmailInput({...emailInput, subject: e.target.value})
          }} />
          <div dangerouslySetInnerHTML={{ __html: emailConfrimHTML }} />
          <div className="modal-action">
            <span className="btn btn-success" onClick={(e) => {
              console.log("CLICKED")
                fetch(`/api/admin/user_advanced/${user.id}/resend_email/`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookiesAsObject().csrftoken
                  },
                  body: JSON.stringify((emailInput.subject === null) ? {
                    'email_id': selectedEmail.id,
                  }: {
                    'email_id': selectedEmail.id,
                    'subject': emailInput.subject
                  })
                }).then((res) => {
                  if(res.ok){
                    res.text().then((text) => {
                      window.email_resend_confirm_modal.close()
                    })
                  }else{
                    res.text().then((text) => {
                      console.error("ERROR", text)
                    })
                  }
                });
            }}>SEND</span>
            <button className="btn btn-error" onClick={(e) => {
              window.email_resend_confirm_modal.close()
            }}>Close</button>
          </div>
        </form>
      </dialog>
      </>
}


const MATCHING_FIELDS = [
  "score",
  "latest_update",
  "matchable",
  "to_usr",
  "markdown_info"
]
const MATCHING_FIELD_GETTERS = {
  "markdown_info": (matchingScore, field, _key, _onclick=null, _extras=null) => {
    return <td key={_key}>
        <button className='btn btn-xs' onClick={() => {
          _extras.setResultsMarkdown(matchingScore[field])
        }}>View Scoring Table</button>
    </td> 
  },
  "matchable": (matchingScore, field, _key, _onclick=null, _extras=null) => {
    const className = matchingScore[field] ? "bg-success" : "bg-error"
    const span = <div className={`badge badge-md ${className}`}>{matchingScore[field] ? "Matchable!" : "X unmatchable"}</div>

    return <td key={_key}>{span}</td> 
  },
  "to_usr": (matchingScore, field, _key, _onclick=null, _extras=null) => {
    const matchesListing = MatchingSuggestionView(matchingScore[field], _extras.setQuickViewUser, _extras.addUserToSelection)

    return <td _key={_key}>{matchesListing}</td>
  },
}

const MatchingScoreTable = ({data, addUserToSelection}) => {
  const [quickViewUser, updateQuickViewUser] = useState(null)
  const [resultsMardown, setResultsMarkdown] = useState(null)

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
                        let extras = null
                        if(field === "to_usr")
                          extras = {
                            setQuickViewUser: (user) => {
                              updateQuickViewUser(matching_score[field])
                              window.matching_quick_user_details.showModal()
                            },
                            addUserToSelection: addUserToSelection
                          }
                        else if(field === "markdown_info")
                          extras = {
                            setResultsMarkdown: (content) => {
                              setResultsMarkdown(content)
                              window.matching_score_results_table.showModal()
                            }
                          }
                        return MATCHING_FIELD_GETTERS[field](matching_score, field, j, () => {}, extras)
                      } else {
                        return <td key={j}>{matching_score[field]}</td>
                      }
                    })}
                </tr>
            })}
        </tbody>
      </table>
      <dialog id="matching_quick_user_details" className="modal">
        <form method="dialog" className="modal-box">
          <h3 className="font-bold text-lg">Hello!</h3>
          <p className="py-4">Press ESC key or click the button below to close</p>
            {quickViewUser && <UserDetailsCard 
                user={quickViewUser} 
                _key={102131} 
                key={212312} 
                selectUserForDetails={() => {}}
                deselectUser={() => {}}
                partial={false}
                tiny={false}
            />}
          <div className="modal-action">
            <button className="btn" onClick={(e) => {
              updateQuickViewUser(null);
            }}>Close</button>
          </div>
        </form>
      </dialog>
      <dialog id="matching_score_results_table" className="modal w-full">
        <form method="dialog" className="modal-box w-full max-w-none">
          <h3 className="font-bold text-lg">Hello!</h3>
          <p className="py-4">Press ESC key or click the button below to close</p>
            {resultsMardown && <ReactMarkdown remarkPlugins={[remarkGfm]} children={resultsMardown} className={style.reactMarkDown}/>}
          <div className="modal-action">
            <button className="btn" onClick={(e) => {

            }}>Close</button>
          </div>
        </form>
      </dialog>
    </>
};

const TaskMonitorComponent = ({task_id, finishedCallback }) => {
 
  const fetcher = (...args) => fetch(...args).then(res => res.json());
  const { data, error, mutate, isLoading } = useSWR(`/api/admin/tasks/${task_id}/status/`, fetcher, { refreshInterval: 1000 })
  
  if (error) return <div>failed to load</div>
  if (isLoading) return <div>loading...</div>
    
    
  let progressInfo = null
  console.log("INFO", data.info)
  if(data && data?.info && data.info.progress) {
    progressInfo = data.info.progress
    console.log("MANGED TO PARSE", progressInfo);
  }
  
  if(data && data?.state && data.state === "SUCCESS") {
    console.log("FINISHED")
    finishedCallback();
  }

  return <div className='flex flex-row flex-grow rounded-xl content-center justify-center'>
      {data?.state && <div className='bg-base-300 p-1 rounded-xl'>{data.state}</div>}
      {progressInfo && <div className='flex h-full flex-col items-start content-start justify-start w-52'>
          <div className='text-xs'>{progressInfo.progress}/{progressInfo.total_considered_users}</div>
          <progress className="progress progress-primary w-full" value={progressInfo.progress} max={progressInfo.total_considered_users}></progress>
        </div>}
      {progressInfo && <div className='p-1 bg-success'>
          {progressInfo.state}
        </div>}
  </div>
}


const UserSmsTab = ({
  user
}) => {
  
  const fetcher = (...args) => fetch(...args).then(res => res.json());
  const { data: sms, error, mutate, isLoading } = useSWR(`/api/admin/user_advanced/${user.id}/sms/`, fetcher)
  const [smsInput, setSmsInput] = useState({
    message: "",
  })
  
  
  return <div className='flex flex-col w-full h-full'>
    <div className='flex flex-row w-full h-fit content-start justify-start items-start'>
      <div className='text-xl'>Tasks</div>
    </div>
    <div className='flex flex-row w-full h-fit items-end content-end justify-end'>
      {sms && <table className="table table-zebra leading-3 w-full z-50 bg-base-100">
        <thead className='bg-base-300'>
          <tr>
            <th></th>
            <th>message</th>
            <td>recipient</td>
            <th>created_at</th>
          </tr>
        </thead>
        <tbody>
            {sms.map((task,i) => {
                return <tr key={i} className='p-0 hover:bg-100 hover:text-success hover:border hover:border-accent'>
                    <th className='w-20'>
                      {i}
                    </th>
                    <td>{sms.message}</td>
                    <td>{sms.recipient}</td>
                    <td>{sms.created_at}</td>
                </tr>
            })}
        </tbody>
      </table>}
    </div>
    {/** Now a simple input with a 'create' button at the end, with an onClick that mutates the api above */}
    <div className='flex flex-row w-full h-fit items-end content-end justify-end'>
      {/** description */}
      <input type="text" placeholder="Type here" className="input input-bordered w-full max-w-xs" value={smsInput.message} onChange={(e) => {
        setSmsInput({...smsInput, message: e.target.value})
      }}/>
      <button className='btn btn-success' onClick={() => {
            fetch(`/api/admin/quick_actions/send_sms_to_user/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookiesAsObject().csrftoken
              },
              body: JSON.stringify({
                'user_id': user.id,
                'message': smsInput.message,
              })
            }).then((res) => {
              if(res.ok){
                // TODO: update sms table
                res.json().then((newMessage) => {
                  mutate([...sms, newMessage])
                })
              }else{
                res.text().then((text) => {
                  console.error("ERROR", text)
                })
              }
            })
      }}>Send Sms</button>
    </div>
  </div> 
}

const UserTasksTab = ({
  user
}) => {
  
  const fetcher = (...args) => fetch(...args).then(res => res.json());
  const { data: tasks, error, mutate, isLoading } = useSWR(`/api/admin/user_advanced/${user.id}/tasks/`, fetcher)
  const [tasksInput, setTaskInput] = useState({
    description: "",
  })
  
  
  return <div className='flex flex-col w-full h-full'>
    <div className='flex flex-row w-full h-fit content-start justify-start items-start'>
      <div className='text-xl'>Tasks</div>
    </div>
    <div className='flex flex-row w-full h-fit items-end content-end justify-end'>
      {tasks && <table className="table table-zebra leading-3 w-full z-50 bg-base-100">
        <thead className='bg-base-300'>
          <tr>
            <th></th>
            <th>description</th>
            <th>state</th>
            <th>created_at</th>
            <th>updated_at</th>
          </tr>
        </thead>
        <tbody>
            {tasks.map((task,i) => {
                return <tr key={i} className='p-0 hover:bg-100 hover:text-success hover:border hover:border-accent'>
                    <th className='w-20'>
                      <input type="checkbox" className="checkbox ml-2" onChange={() => {
                        fetch(`/api/admin/user_advanced/${user.id}/tasks/complete/`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': getCookiesAsObject().csrftoken
                          },
                          body: JSON.stringify({
                            'task_id': task.id,
                          })
                        }).then((res) => {
                          if(res.ok){
                            mutate(tasks.filter((t) => t.id !== task.id))
                          }else{
                            res.text().then((text) => {
                              console.error("ERROR", text)
                            })
                          }
                        })
                      }}/>
                    </th>
                    <td>{task.description}</td>
                    <td>{task.state}</td>
                    <td>{task.created_at}</td>
                    <td>{task.updated_at}</td>
                </tr>
            })}
        </tbody>
      </table>}
    </div>
    {/** Now a simple input with a 'create' button at the end, with an onClick that mutates the api above */}
    <div className='flex flex-row w-full h-fit items-end content-end justify-end'>
      {/** description */}
      <input type="text" placeholder="Type here" className="input input-bordered w-full max-w-xs" value={tasksInput.description} onChange={(e) => {
        setTaskInput({...tasksInput, description: e.target.value})
      }}/>
      <button className='btn btn-success' onClick={() => {
        fetch(`/api/admin/user_advanced/${user.id}/tasks/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookiesAsObject().csrftoken
          },
          body: JSON.stringify(tasksInput)
        }).then((res) => {
          if(res.ok){
            res.text().then((text) => {
              mutate([...tasks, text])
            })
          }else{
            res.text().then((text) => {
              console.error("ERROR", text)
            })
          }
        })
      }}>Create Task</button>
    </div>
  </div> 
}

function MatchCaculationOptions({ user, mutateScores }){
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [monitorTask, setMonitorTask] = useState(null)
  const daysSearchingInput = useRef(null);
  const fetcher = (...args) => fetch(...args).then(res => res.json());

  return <div className='relative flex flex-col'>
    <button className='btn btn-sm' onClick={() => {
      setOptionsOpen(!optionsOpen)
    }}>Update options</button>
    {optionsOpen && <div className='relative'>
      <div className={`w-96 bg-info fixed z-60 p-4 rounded-xl flex flex-col gap-2`}>
      <h3 className="font-bold text-lg">Consider maximum dasy searching</h3>
      <input type="number" ref={daysSearchingInput} placeholder="Days searching" defaultValue={40} className="input input-bordered w-full max-w-xs" />
      <button className='btn' onClick={() => {
        fetcher(`/api/admin/user_advanced/${user.id}/request_score_update/?days_searching=${daysSearchingInput.current.value}`).then((res) => {
          setMonitorTask(res.task_id)
        })
      }}>Calculate Score</button>
      {monitorTask && <TaskMonitorComponent task_id={monitorTask} finishedCallback={() => {
        setMonitorTask(null);
        mutateScores();
      }}/>}
      </div>
    </div>}
  </div>
}

const MatchingTable = ({ 
  user,
  addUserToSelection,
  matchingSelectionState,
  setMatchingSelectionState
}) => {

  const fetcher = (...args) => fetch(...args).then(res => res.json());
  const [listingSelection, setListingSelection] = useState("listing") // or "selection"
  
  const [confirmationModalState, setConfirmationModalState] = useState({
    visible: false,
    title: "Are you sure you want to make this match?", 
    text: "We will confirm first that the user are matchable and then make the match. If this fails you can 'force' a match if you want.",
    error: null,
    success: null
  });

  const updateConfirmationModalState = (newState) => {
    if(newState.visible){
      window.match_confirmation_modal.showModal()
    }else
      window.match_confirmation_modal.close()
    setConfirmationModalState({...confirmationModalState, ...newState})
  }

  const [matchingOverlayState, setMatchingOverlayState] = useState({
    visible: false,
    type: "proposal",
    title: "Make Match" // or "Make Matching Proposal"
  });

  const { data, error, isLoading, mutate } = useSWR(`/api/admin/user_advanced/${user.id}/scores/`, fetcher)
  
  const makeMatchingApi = (matchingType) => {
      let postData = (matchingType === "proposal") ? {
          user1: user.id,
          user2: matchingSelectionState.user.id,
          proposal: true
      } : {
          user1: user.id,
          user2: matchingSelectionState.user.id,
      }

      fetch(`/api/admin/user/match/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookiesAsObject().csrftoken
        },
        body: JSON.stringify(postData)
      }).then((res) => {
        if(res.ok){
          res.text().then((text) => {
            updateConfirmationModalState({success: text, visible: true})
          })
        }else{
          res.text().then((text) => {
            updateConfirmationModalState({error: text, visible: true})
          })
        }
      })
  }
  
  
  const MatchDialogContent = <>
    <div className='text-6xl'>{confirmationModalState.title}</div>
    <div className='text-2xl'>{confirmationModalState.text}</div>
    <div className='flex flex-col'>
      <UserDetailsCard user={user} _key={0} selectUserForDetails={() => {}} deselectUser={() => {}} partial={true} tiny={true} horizontal={true}/>
      <div className='text-2xl bg-error'>With</div>
      <UserDetailsCard user={matchingSelectionState.user} _key={0} selectUserForDetails={() => {}} deselectUser={() => {}} partial={true} tiny={true} horizontal={true}/>
    </div>
    <div className='flex flex-row'>
      <button className='btn btn-error' onClick={() => {
        setMatchingOverlayState({...matchingOverlayState, visible: false})
        setMatchingSelectionState({...matchingSelectionState, inProgress: false})
      }}>Abbort</button> 
      <div className='btn btn-success' onClick={() => {
        if(matchingOverlayState.type === "score"){
          // TODO: api call to get or calculate score
        }else{
          makeMatchingApi(matchingOverlayState.type);
        }
      }}>Make Match!</div> 
    </div>
    {confirmationModalState.error && <div className='text-error'>{confirmationModalState.error}</div>}
    {confirmationModalState.success && <div className='text-success'>{confirmationModalState.success}</div>}
  </>


  if (error) return <div>failed to load</div>
  if (isLoading) return <div>loading...</div>
    
  return <><div className='flex flex-grow w-full flex-col content-center justify-start items-start'>
    <div className='flex flex-row w-full h-fit content-start justify-start items-start gap-2'>
      <div className='text-xl'>Matching Menu</div>
      <button onClick={() => {
        if(matchingOverlayState.visible){
          setMatchingOverlayState({...matchingOverlayState, visible: false, tyoe: "proposal"})
          setMatchingSelectionState({...matchingSelectionState, inProgress: false})
        } else {
          setMatchingOverlayState({...matchingOverlayState, visible: true, title: "Make Matching Proposal", type: "proposal"})
          setMatchingSelectionState({...matchingSelectionState, inProgress: true})
        }
      }} className='btn btn btn-accent btn-xs'>Make Matching Proposal</button>
      <button onClick={() => {
        if(matchingOverlayState.visible){
          setMatchingOverlayState({...matchingOverlayState, visible: false})
          setMatchingSelectionState({...matchingSelectionState, inProgress: false})
        } else {
          setMatchingOverlayState({...matchingOverlayState, visible: true, title: "Make Matching", type: "matching"})
          setMatchingSelectionState({...matchingSelectionState, inProgress: true})
        }
      }} className='btn btn btn-info btn-xs'>Make Matching </button>
      <button onClick={() => {
        if(matchingOverlayState.visible){
          setMatchingOverlayState({...matchingOverlayState, visible: false, tyoe: "score"})
          setMatchingSelectionState({...matchingSelectionState, inProgress: false})
        } else {
          setMatchingOverlayState({...matchingOverlayState, visible: true, title: "Get Or Caclulate Score Between", type: "score"})
          setMatchingSelectionState({...matchingSelectionState, inProgress: true})
        }
      }} className='btn btn btn-accent btn-xs'>Get Score Between</button>
    </div>
    <div className="divider m-0"></div> 
    <div className='flex flex-row w-full h-fit items-end content-end justify-end'>
    <div className="tabs tabs-boxed">
      <a className={`tab ${listingSelection === "listing" ? 'tab-active' : ''}`}>Score Listing</a> 
      <a className={`tab ${listingSelection === "selection" ? 'tab-active' : ''}`}>Custom selection</a> 
    </div>
      <MatchCaculationOptions user={user} mutateScores={mutate}/>
    </div>
    <MatchingScoreTable data={data} addUserToSelection={addUserToSelection}/>
  </div>
    {matchingOverlayState.visible && <div className='w-240 h-full bg-base-200 z-80 absolute'>
      <div className='text-6xl'>{matchingOverlayState.title}</div>
      <button className='btn btn-xs btn-error' onClick={() => {
        setMatchingOverlayState({...matchingOverlayState, visible: false})
        setMatchingSelectionState({...matchingSelectionState, inProgress: false})
      }}>Close</button>
      <div className='flex flex-col'>
        <UserDetailsCard user={user} _key={0} selectUserForDetails={() => {}} deselectUser={() => {}} partial={true} tiny={false} horizontal={false}/>
        <div className='text-2xl bg-error'>With</div>
        {matchingSelectionState?.user ? 
          <>
            <UserDetailsCard user={matchingSelectionState.user} _key={1} selectUserForDetails={() => {}} deselectUser={() => {}} partial={true} tiny={false} horizontal={false}/>
            <div className='flex flex-row'>
              <button className='btn btn-success' onClick={() => {
                // TODO: api call to make matching
                let title = ""
                if(matchingOverlayState.type === "proposal")
                  title = "Are you sure you want to make this MATCHING PROPOSAL?"
                else if(matchingOverlayState.type === "matching")
                  title = "Are you sure you want to make this MATCH?"
                else if(matchingOverlayState.type === "score")
                  title = "Are you sure you want to get the score between these users?"
                updateConfirmationModalState({
                  visible: true,
                  title: title,
                  text: matchingOverlayState.type === "score" ? "" : "We will confirm first that the user are matchable and then make the match. If this fails you can 'force' a match if you want.",
                }) 
              }}>Confirm</button>
            </div>
          </> : 
            <div className='text-2xl bg-info rounded-xl'>No User Selected</div>}
      </div>
    </div>}
  <dialog id="match_confirmation_modal" className="modal">
    <form method="dialog" className="modal-box">
     {MatchDialogContent}
      <div className="modal-action">
        {/* if there is a button in form, it will close the modal */}
        <button className="btn">Close</button>
      </div>
    </form>
  </dialog>
  </>

}

const Table = ({users, selectedList, fields, selectedUsersHashes, setSelectedUsers}) => {
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
                        <input type="checkbox" checked={selectedUsersHashes.indexOf(user.hash) != -1} className="checkbox ml-2" onChange={() => {
                            if(selectedUsersHashes.indexOf(user.hash) != -1) {
                                setSelectedUsers(selectedUsersHashes.filter((hash) => hash !== user.hash))
                            } else {
                                setSelectedUsers([...selectedUsersHashes, user.hash])
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


export const UserDetailsCard = ({
        user, 
        _key, 
        deselectUser,
        selectUserForDetails,
        partial=true,
        tiny=false,
        horizontal=false
    }) => {
      
    if(!user)
      return <div>Undefined User</div>
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
            <div class="w-full flex flex-col content-start justify-start items-start gap-2">
              <div className='flex flex-row content-center items-start justify-start'>
                <b className='text-l'>Id</b>: {user.id}
              </div>
              <div className='flex flex-row content-center items-start justify-start'>
                <b className='text-l'>Date Joined</b>: {user.date_joined}  ({readableFormatDate(user.date_joined)})
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
        className={`w-full flex ${horizontal ? 'flex-row': 'flex-col'} bg-base-200 h-fit items-center content-center justify-center rounded-xl p-2 gap-2 mb-1 relativ ${!tiny ? 'hover:border-2 hover:border-error hover:bg-base-100' : '' }`}
        onClick={() => {
            if(partial && !tiny){
              updateQueryParams({param: "user_details", value: user.id})
              selectUserForDetails(user)
            }
        }}>
        {(partial && !tiny) && <div className='w-full h-fit flex flex-row items-end justify-end'>
            <button className="btn btn-circle pointer-events-auto" onClick={(e) => {
              deselectUser(user);
              e.stopPropagation();
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>}
        <div className='w-full h-fit flex flex-row items-center content-center justify-center'>
           <UserImage user={user.profile} dimensions={{
                height: partial ? (tiny ? 50: 120) : 180, 
                width: partial ? (tiny? 50: 120) : 180
           }}/>
        </div>
        {user.state.unresponsive && <div className='w-96 max-w-ful h-10 bg-error text-3xl'>
          Marked as unresponsive
        </div>}
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
        setSelectedUsersByHash,
        selectUserForDetails
    }) => {
      
    const [extraLoadUserId, setExtraLoadUserId] = useState(null)

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
                        deselectUser={(_user) => {
                            setSelectedUsersByHash(selectedUsersHashes.filter((hash) => hash !== _user.hash))
                        }}/>
            })}
            <div className='absolute bottom-0 flex flex-row'>
              <input type="text" placeholder="UserId" className="input input-bordered w-full max-w-xs" onChange={(e) => {
                setExtraLoadUserId(e.target.value)
              }}/>
              <button className='btn btn-success max-w-xs' onClick={() => {
                if(extraLoadUserId){
                  fetch(`/api/admin/user_info/${extraLoadUserId}/`).then((res) => {
                    if(res.ok){
                      res.json().then((user) => {
                        console.log("RES", user)
                        setSelectedUsers([...selectedUsers, user])
                      })
                    }else{
                      res.text().then((text) => {
                        console.error("ERROR", text)
                      })
                    }
                  })
                }
              }}>Add</button>
            </div>
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

const Accordion = ({elements, accordion_id, updateExpanded = (i) => {} }) => {
    const [expanded, setExpanded] = useState(0)

    return <>{elements.map((element, i) => {
        return <div key={i} className="collapse collapse-arrow bg-base-200">
          <input type="radio" name={accordion_id} checked={expanded === i} /> 
          <div className="collapse-title text-xl font-medium" onClick={() => {
              updateExpanded(i)
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
        setSelectedUsersByHash, 
        setSelectedUsers,
        fields,
        setFields,
        selectUserForDetails,
        setData
    }) => {
      
      const navigate = useNavigate();

    return <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <UserSelectionDrawer 
            selectedUsers={selectedUsers} 
            selectedUsersHashes={selectedUsersHashes} 
            setSelectedUsersByHash={setSelectedUsersByHash} 
            setSelectedUsers={setSelectedUsers}
            selectUserForDetails={selectUserForDetails}>
            {children}
        </UserSelectionDrawer>
        <label htmlFor="my-drawer-2" className="btn btn-primary drawer-button lg:hidden">Open drawer</label>
      
      </div> 
      <div className="drawer-side">
        <label htmlFor="my-drawer-2" className="drawer-overlay"></label> 
        <button className="btn btn-ghost drawer-button" onClick={() => {
          navigate("/") 
        }}>back to menu</button>
        <Accordion 
          accordion_id={"accordion-1"}
          elements={[{
            title: "User List Selection", 
            content: (<ul className="menu p-4 w-80 bg-base-200 text-base-content text-left">
            {Object.keys(querySets).map((key, i) => {
                return <li key={i} className='p-2'>
                    <a onClick={() => {
                        selectUserForDetails(null)
                        updateQueryParams({param: "user_details", value: null})
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

const AdminChatMessagesDisplay = ({ 
    user, 
    chatMessages,
    mutateMessages
  }) => {
  console.log("MESSAGES", chatMessages, user);
  return <div className='w-full'>
    {chatMessages.items.toReversed().map((message, i) => {
      // TODO: little fucked-up isSelf is the opposite of what I thought?
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
      {<div className="dropdown">
        <label tabIndex={0} className={`chat-bubble ${message.read ? '': 'border-2 border-error'}`}>{message.text}</label>
          <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
            {(!isSelf) && <>
              <li><a>Delete Message</a></li>
            </>}
            <li><a onClick={() => {
                fetch(`/api/admin/user_advanced/${user.id}/message_read/`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookiesAsObject().csrftoken
                  },
                  body: JSON.stringify({
                    message_id: message.id,
                  })
                }).then((res) => {
                  if(res.ok){
                    res.json().then((text) => {
                      console.log("MESSAGE SENT", text)
                      mutateMessages();
                    })
                  }else{
                    res.text().then((text) => {
                      console.error("ERROR", text)
                    })
                  }
                })
            }}>Mark as read</a></li>
          </ul>
      </div>}
      <div className="chat-footer opacity-50">
        {message.read ? 'read' : 'unread'}
      </div>
    </div>
    })}
  </div>
}

function convertMessagesToInlineFormat(userId, messages) {
  let result = ""
  for(let i = 0; i < messages.length; i++){
    let message = messages[i]
    let notIsSelf = message.sender_hash === userId
    
    result += `${notIsSelf ? "Support" : "Them"}: ${message.text}\n\n`
  }
  return result

}

const AiOptions = ({user, chatMessages, messageText, setMessageText}) => {
  
  const modelSelectionRef = useRef(null);
  const fetcher = (...args) => fetch(...args).then(res => res.json());
  const { data: modelOptions, error, mutate, isLoading } = useSWR(`/api/ai/models/`, fetcher, { refreshInterval: 10000 })
  
  console.log("MODEL OPTIONS", modelOptions)
  
  const managementUserProfile = chatMessages.match.profile
  
  console.log("CHAT", chatMessages, user)
  const [aiResponse, setAiReponse] = useState("")
  return <div className='w-full h-full flex flex-col p-4 rounded-xl'>
   These are pre-release AI feature use with caution!
    <div className='w-full h-fit flex flex-row p-2'>
      <button className='btn btn-sm btn-success' onClick={() => {
        setMessageText(aiResponse) 
      }}>insert response</button>
      <button className='btn btn-sm' onClick={() => {
        const promptMessages = [{
          role: "system",
          content: `I am the 'Support', my name is ${managementUserProfile.first_name} ${managementUserProfile.second_name}\nThis is my description: ${managementUserProfile.description}\nThis is the chat history:\n\n${convertMessagesToInlineFormat(user.hash, chatMessages.items)}`
        },{
          role: "user",
          content: 'Basierend auf diensen nachrichten, generiere eine antwort dich ich senden würde.'
        }]
        console.log("P", promptMessages)
        processAiRequest(modelSelectionRef.current.value, promptMessages, (value) => {
          console.log("V", value);
          setAiReponse(value) 
        });
      }}>generate response</button>
      <button className='btn btn-sm' onClick={() => {
        const promptMessages = [{
          role: "system",
          content: messageText
        },{
          role: "user",
          content: "Bitte die Rechschreibung korregieren, aber die formulierung bei behalten."
        }]
        console.log("P", promptMessages)
        processAiRequest(modelSelectionRef.current.value, promptMessages, (value) => {
          console.log("V", value);
          setAiReponse(value) 
        });
      }}>correct spelling</button>
    </div>
    <div className='w-full h-fit flex flex-row'>
      <textarea className="textarea leading-tight flex flex-grow textarea-primary h-80" value={aiResponse} placeholder="Bio"></textarea>
      <div className='h-full flex flex-col w-40'>
      <select className="select select-bordered w-full max-w-xs" ref={modelSelectionRef}>
        {modelOptions && modelOptions.map((modelName, i) => {
          return <option key={i}>{modelName}</option>
        })}
      </select>
      </div>
    </div>
  </div>
}

const AdminChat = ({ user, _messages }) => {
  const [chat, setChat] = useState(null)
  const [chatId, setChatId] = useState(null)
  const messageInputRef = useRef(null)
  const [aiOptionsVisible, setAiOptionsVisible] = useState(false)

  const fetcher = (...args) => fetch(...args).then(res => res.json());
  const { data: messages, mutate, error, isLoading } = useSWR(`/api/admin/user_advanced/${user.id}/messages/`, fetcher)
  
  useEffect(() => {
    if(chatId){
      setChat(messages[chatId])
    }
  }, [messages, chat, chatId])

  if(!messages)
    return <></>
  
  
  return chat ? <>
    <ChatNavbar user={user} chat={chat} unFocousChat={() => {
      setChatId(null)
      setChat(null)
    }}/>
    <div className='w-full h-full flex flex-col'>
      <AdminChatMessagesDisplay user={user} chatMessages={chat} mutateMessages={mutate}/>
      {/** A simple footer with a text field and a send button */}
      {chat.match.with_management && <><div className="flex flex-row">
        <button className='btn btn-info' onClick={() => {
          setAiOptionsVisible(!aiOptionsVisible)
        }}>AI</button>
        <input type="text" ref={messageInputRef} placeholder="Type a message" className="input input-primary input-bordered w-full"/>
        <button className="btn btn-primary" onClick={() => {
          fetch(`/api/admin/user_advanced/${user.id}/message_reply/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': getCookiesAsObject().csrftoken
            },
            body: JSON.stringify({
              message: messageInputRef.current.value,
            })
          }).then((res) => {
            if(res.ok){
              res.json().then((message) => {
                mutate({...messages, [chatId]: {...messages[chatId], items: [message, ...messages[chatId].items]}})
                messageInputRef.current.value = ""
              })
            }else{
              res.text().then((text) => {
                console.error("ERROR", text)
              })
            }
          })

        }}>Send</button>
      </div>
        {aiOptionsVisible && <AiOptions user={user} chatMessages={chat} messageText={messageInputRef.current.value} setMessageText={(messageText) => {
          messageInputRef.current.value = messageText
        }}/>}
      </>}
    </div></>: <div className='w-full flex flex-grow items-start content-start justify-start'>
    <div className='w-full h-full flex flex-col gap-2 p-2'>
      {Object.keys(messages).map((message_chat, i) => {
        return <div key={i} className='w-full h-fit flex flex-row rounded-xl text-2xl p-3 gap-2 hover:bg-error' onClick={() => {
          setChat(messages[message_chat])
          setChatId(message_chat)
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

const NotesPane = ({user}) => {
  const [value, setValue] = useState(null);

  // Create Note
  const createNote = useCallback(
    debounce((newNote) => { // A debounced function that waits 500 ms after the last call to run
      fetch(`/api/admin/user_advanced/${user.id}/notes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookiesAsObject().csrftoken,
        },
        body: JSON.stringify({ notes: newNote }),
      }).then((response) => {
          if (response.ok) {
            mutate(); // If successful, mutate the data to re-fetch
          } else {
            throw new Error('Failed to create note'); // If not successful, throw an error
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }, 500), // Here 500 is the delay time in milliseconds. You can adjust this value as per your need.
    [mutate, user.id] // dependencies
  );
  
  const fetcher = (...args) => fetch(...args).then(res => res.json());
  const { data: _user_notes, mutate, error, isLoading } = useSWR(`/api/admin/user_advanced/${user.id}/notes/`, fetcher)
  
  useEffect(() => {
    if(_user_notes)
      setValue(_user_notes)
  }, [_user_notes])

  return <div className="container">
    <MDEditor
      value={value}
      onChange={(value) => {
        setValue(value)
        createNote(value)
      }}
    />
  </div>
};

const ActionsConfirmModal = ({
  action,
  schemaStates,
  schemaResponseStates,
  setSchemaResponseStates,
}) => {
  return <dialog id="actions_confirm_modal" className="modal">
            <form method="dialog" className="modal-box max-w-full w-fit">
              <div className="flex flex-col gap-2">
                <div className='text-2xl'>Perform ({action}) with:</div>
                {(action in schemaStates) ? Object.keys(schemaStates[action]).map((property, j) => {
                  return <div className='flex flex-row gap-2' key={j}>
                    <div className='text-xl'>{property}</div>
                    <div className='text-xl'>{(() => {
                      // convert schemaStates[action][property] to a readable format depending on type
                      if(typeof schemaStates[action][property] === "boolean")
                        return schemaStates[action][property] ? "True" : "False"
                      
                      // check if 'null'
                      if(schemaStates[action][property] === null)
                        return "NULL"
                      
                      return schemaStates[action][property]
                    })()}</div>
                  </div>
                  }): <></>}
                <div className="flex flex-row gap-2">
                  <button className="btn btn-primary" onClick={() => {
                    fetch(`/api/admin/quick_actions/${action}/`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'X-CSRFToken': getCookiesAsObject().csrftoken
                        },
                        body: JSON.stringify(schemaStates[action])
                      }).then((res) => {
                        if(res.ok){
                          res.text().then((text) => {
                            console.log("MESSAGE SENT", text)
                            setSchemaResponseStates({...schemaResponseStates, [action]: {success: text, error: null}})
                          })
                        }else{
                          res.text().then((text) => {
                            console.error("ERROR", text)
                            setSchemaResponseStates({...schemaResponseStates, [action]: {success: null, error: text}})
                          })
                        }
                      }
                      )
                  }}>Confirm</button>
                  <button className="btn btn-error" onClick={() => {
                    window.actions_confirm_modal.close();
                  }}>Cancel</button>
                </div>
              </div>
            </form>
          </dialog>
   
}

const ActionsPane = ({user}) => {
  
  const [schemaStates, setSchemaStates] = useState({})
  const [schemaResponseStates, setSchemaResponseStates] = useState({})
  const [selectedAction, setSelectedAction] = useState(null)

  const fetcher = (...args) => fetch(...args).then(res => res.json());
  const { data: actions, error, isLoading } = useSWR(`/api/admin/quick_actions/`, fetcher)
  
  useEffect(() => {
    if(actions){
      const _schemaStates = {}
      const _resStates = {}
      Object.keys(actions).map((action, i) => {
        _schemaStates[action] = {}
        Object.keys(actions[action].schema.properties).map((property, j) => {
          _schemaStates[action][property] = actions[action].schema.properties[property].default
          if(property === "user_id")
            _schemaStates[action][property] = user.id
          
          _resStates[action] = {
            "error": null,
            "success": null,
          }
        })
      })
      setSchemaStates(_schemaStates)
      setSchemaResponseStates(_resStates)
      setSelectedAction(Object.keys(actions)[0])
    }
  }, [actions])
          
  
  return actions ? <>
      {selectedAction && <ActionsConfirmModal
        mId={`actions_confirm_modal`}
        action={selectedAction}
        schemaStates={schemaStates}
        schemaResponseStates={schemaResponseStates}
        setSchemaResponseStates={setSchemaResponseStates}
      />}
  <Accordion 
    accordion_id={"accordion-2"}
    updateExpanded={(i) => {
      setSelectedAction(Object.keys(actions)[i])
    }}
    elements={Object.keys(actions).map((action, i) => {
    return {
      title: action,
      content: <>
      <div className='w-full h-fit flex flex-col gap-2 p-2'>
        <div className='text-xl'>{action}</div>
        <ThemedForm

                  className='w-full'
                  schema={actions[action].schema}
                  extraErrors={{}}
                  showErrorList="bottom"
                  uiSchema={{...{
                    "ui:submitButtonOptions": {
                      norender: true,
                    },
                  }, ...actions[action].ui_schema}}
                  formData={schemaStates[action]}
                  validator={validator}
                  onChange={({formData}) => {
                    setSchemaStates({...schemaStates, [action]: {...schemaStates[action], ...formData}})
                  }}
                />
          {(action in schemaResponseStates) && <>
          {schemaResponseStates[action].success && <div className="alert alert-success">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{schemaResponseStates[action].success}</span>
            </div>}
          {schemaResponseStates[action].error && <div className="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{schemaResponseStates[action].error}</span>
            </div>}
          </>}
        <div className='w-full h-fit flex flex-row content-center items-center justify-center'>
          <button className="btn btn-primary" onClick={() => {
            window.actions_confirm_modal.showModal();
          }}>Confirm</button>
        </div>
      </div>
     </>
    }
  })}/>
  </> : <></>
}

function PreMatchingAppointments({user}) {
  const fetcher = (...args) => fetch(...args).then(res => res.json());
  const { data: preMatchingAppointment, error, isLoading } = useSWR(`/api/admin/user_advanced/${user.id}/prematching_appointments/`, fetcher)

  return <div className='w-full relative flex flex-col'>
    {preMatchingAppointment && 
      <div className='w-full rounded-xl bg-base-300 p-4'>{
        JSON.stringify(preMatchingAppointment)}</div>}</div>
}

const AdvancedUserDetails = ({
  user, closeUserDetails, setEmailHTML, 
  addUserToSelection,
  reloadUserList,
  matchingSelectionState,
  setMatchingSelectionState
}) => {
  
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
  },
  {
    title: "Emails",
    id: "emails",
    component: <><EmailsTable user={user} emails={data["email_logs"]} setEmailHTML={setEmailHTML}/></>
  },
  {
    title: "Notes",
    id: "notes",
    component:  <NotesPane user={data}/>
  },
  {
    title: "Matching",
    id: "matching",
    component: <>
      <h1>Matching Tab</h1>
      <MatchingTable 
        user={data}  
        addUserToSelection={addUserToSelection} 
        matchingSelectionState={matchingSelectionState}
        setMatchingSelectionState={setMatchingSelectionState}
      />
    </>
  },
  {
    title: "Pre-Matching",
    id: "pre-matching",
    component: <>
      <h1>Pre-Matching Appointments</h1>
      <PreMatchingAppointments user={data}/>
    </>
  },
  {
    title: "Tasks",
    id: "tasks",
    component: <UserTasksTab user={data}/>
  },
  {
    title: "Sms",
    id: "sms",
    component: <UserSmsTab user={data}/>
  },
  {
    title: "Actions",
    id: "actions",
    component: <ActionsPane user={data}/>
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
          <button className="btn" onClick={() => {
            reloadUserList();
            closeUserDetails();
          }}>close</button>
        </div>
      </div>
      <SwitchPane panes={panes} pane={pane} />
    </div>
}


export const AdminPanel = ({
    _querySets,
    _userLists,
    setData,
    selectedUsers,
    setSelectedUsers,
    initialList,
    reloadUserList
}) => {
  
  
  
  
  // If a matching selection is being performed ( then the user details are not openend)
  const [matchingSelectionState, setMatchingSelectionState] = useState({
    inProgress: false,
    user: null,
  })
  
  // If there is an email being viewed
  const [emailHTML, setEmailHTML] = useState(null)
    
  // A dict {list_name: <paginated-user-listing>}.results = [] ...
  const [userLists, setUserLists] = useState(_userLists)
  // Just a string reference to the current list
  const [list, setList] = useState(initialList)
  
  useEffect(() => {
    setUserLists(_userLists)
  }, [_userLists])
  
  
  console.log("UPDATE USERS_LIST", _userLists, initialList, userLists)

  // The fields that should be currently displayed
  const [fields, setFields] = useState(DEFAULT_FIELDS)
  
  // The user that is selected into a details view
  const [detailUser, setDetailUser] = useState(null)
  

  var queryParams = new URLSearchParams(window.location.search);
  let user_details = queryParams.get('user_details')
  user_details = user_details ? user_details : null
  const fetcher = (...args) => fetch(...args).then(res => res.json());
  const { data: _pre_loaded_user, error, isLoading } = useSWR((!detailUser && user_details) ? `/api/admin/user_advanced/${user_details}/` : null, fetcher)
  
  useEffect(() => {
    if(_pre_loaded_user){
      console.log("PRE LOADED USER", _pre_loaded_user)
      setDetailUser(_pre_loaded_user)
    }
  }, [_pre_loaded_user])
  
  const selectedUsersHashes = selectedUsers.map((user) => user ? user.hash : null).filter((hash) => hash !== null)

  const setSelectedUsersByHash = (usersHashes) => {
    const users = usersHashes.map((hash, i) => userLists[list].results.filter((user) => user.hash === hash).length > 0 ? userLists[list].results.filter((user) => user.hash === hash)[0] : selectedUsers[i])
    setSelectedUsers(users)
  }
  
  
    return <DynamicDisplay 
            querySets={_querySets} 
            selectedList={list} 
            selectedUsersHashes={selectedUsersHashes}
            selectedUsers={selectedUsers} 
            setSelectedUsers={setSelectedUsers}
            setSelectedUsersByHash={setSelectedUsersByHash}
            fields={fields}
            setFields={setFields}
            selectUserForDetails={(user) => {
              
              if(matchingSelectionState.inProgress){
                setMatchingSelectionState({...matchingSelectionState, user: user})
                console.log("Updated Matching Selection", matchingSelectionState)
              }else{
                setDetailUser(user)
              }
            
            }}
            setData={setData}
            >
        {detailUser ? 
            <AdvancedUserDetails user={detailUser} 
              reloadUserList={reloadUserList}
              addUserToSelection={(user) => {
                if(selectedUsersHashes.indexOf(user.hash) === -1) {
                  setSelectedUsers([...selectedUsers, user])
                }
              }}
              closeUserDetails={() => {
                updateQueryParams({param: "user_details", value: null});
                setDetailUser(null);
              }} 
              setEmailHTML={setEmailHTML}
              matchingSelectionState={matchingSelectionState}
              setMatchingSelectionState={setMatchingSelectionState}
            /> : 
            <Table 
              users={userLists[list]} 
              fields={fields} 
              selectedList={list}
              selectedUsersHashes={selectedUsersHashes}
              setSelectedUsers={setSelectedUsersByHash}/>}
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