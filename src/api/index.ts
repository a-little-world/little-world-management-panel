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