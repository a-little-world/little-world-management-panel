/* 
The 'data' should prob be centralized in some env-file
Be aware that using the loginSimulator will only work in combination with 'schroedingers-nginx.sh'
*/
const data = {
  username: "admin@little-world.com",
  passoword: "Admin123",
  baseUrl: "http://localhost:3333"
}

export function simulatedAutoLogin(username=data.username, password=data.passoword) {
  const formData = new FormData();
  formData.append("username", username)
  formData.append("password", password)
  return fetch(`${data.baseUrl}/api2/login_hack/`, {
    method: 'POST',
    credentials: 'include',
    body: formData
  })
}
