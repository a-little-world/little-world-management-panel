import { useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import theme from './theme';
import { AdminPanel } from './panel_v2/AdminPanel';
import useSWR from 'swr'
import * as utils from './utils';

function AdminPanelV2Login(props) {
  const initData = props.data;
  const [error, setError] = useState(null);
  const [loginData, setloginData] = useState({
    email: '',
    password: '',
  });
  
  const loginApi = () => fetch('/admin_panel_v2_login/', {
    method: 'POST',
    headers: {
      'X-CSRFToken': utils.getCookiesAsObject().csrftoken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "email": loginData.email, 
      "password": loginData.password,
    }),
  });
  
  return (<div className="hero min-h-screen bg-base-200">
  <div className="hero-content flex-col lg:flex-row-reverse">
    <div className="text-center lg:text-left">
      <h1 className="text-5xl font-bold">Login now Matcher!</h1>
      <p className="py-6">Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem quasi. In deleniti eaque aut repudiandae et a id nisi.</p>
    </div>
    <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
      <div className="card-body">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Email</span>
          </label>
          <input 
            type="text" 
            placeholder="email" 
            className="input input-bordered" 
            value={loginData.email} 
            onChange={(e) => {
              setloginData({
                ...loginData,
                email: e.target.value,
              });
          }}/>
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Password</span>
          </label>
          <input 
            type="password"
            placeholder="password"
            className="input input-bordered"
            value={loginData.password}
            onChange={(e) => {
              setloginData({
                ...loginData,
                password: e.target.value,
              });
          }}/>
          <label className="label">
            <a href="#" className="label-text-alt link link-hover">Forgot password?</a>
          </label>
        </div>
        <div className="form-control mt-6">
          <button className="btn btn-primary"
            onClick={() => {
              loginApi(loginData.email, loginData.password).then((res) => {
                  if (res.status === 200) {
                    window.location.href = '/admin_panel_v2/';
                  }else{
                    res.text().then((text) => {
                      setError(`${res.status} ${res.statusText} ${text}`);
                    });
                  }
              }).catch((err) => {
                  console.log('err', err);
                });
            }}
            >Login</button>
        </div>
        {error && <div className="form-control mt-6">
          <div className="alert alert-error">
            <div className="flex-1">
              <label>{error}</label>
            </div>
          </div>
        </div>}
      </div>
    </div>
  </div>
</div>);
}

export default AdminPanelV2Login;
