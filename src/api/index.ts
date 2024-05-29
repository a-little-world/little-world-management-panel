import { getCookiesAsObject } from '../utils.js';

export const addUserByHash = async (userHash: string, onError: (error) => void, onSuccess: (user: string[]) => void) => {
    console.log('ADDING')
    fetch(`/api/admin/user_info/${userHash}/`).then((res) => {
    if (res.ok) {
      res.json().then(onSuccess)
    } else {
      res.text().then(onError)
    }
  }).catch(onError)
}

export const sendChatMessage = ({ userId, message, onError, onSuccess}) => fetch(`/api/admin/user_advanced/${userId}/message_reply/`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRFToken': getCookiesAsObject().csrftoken
  },
  body: JSON.stringify({
    message,
  })
}).then((res) => {
  if (res.ok) {
    res.json().then(onSuccess)
  } else {
    res.text().then(onError)
  }
}).catch(onError)