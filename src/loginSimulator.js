import * as utils from './utils'
/* 
The 'data' should prob be centralized in some env-file
Be aware that using the loginSimulator will only work in combination with 'schroedingers-nginx.sh'
*/
const data = {
  username: "admin@little-world.com",
  passoword: "Admin123",
  baseUrl: "http://localhost:3333"
}

const exampleFilters = {
  allUsersSearching: "state.matching_state:is:1",
  allUsersSearchingThatAreLearners: ["state.matching_state:is:1", "profile.learner:is:1"], // This is no-one user currently
  allLearners : "profile.learner:is:1",
  allVolunteers : "profile.learner:is:0",
}

export function simulatedAutoLogin(username=data.username, password=data.passoword) {
  return fetch(`${data.baseUrl}/api2/login_hack/`, {
    method: 'POST',
    credentials: 'include',
    body: utils.objectToFormData({
      username,
      password,
      "dev_dataset" : "admin_area",
      /* 
      Filters are handled via get-params in production, this is just to simulate the production behavior,
      TODO: there is still an issue with lists not being delivered as real list using the `utils.objectToFormData`
      */
      "filter" : exampleFilters.allVolunteers
    })
  })
}