import { useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import theme from './theme';
import './withTailwind.css';
import { getCookiesAsObject } from './utils';

const THEMES = [
  'light',
  'dark',
  'cupcake',
  'bumblebee',
  'emerald',
  'corporate',
  'synthwave',
  'retro',
  'cyberpunk',
  'valentine',
  'halloween',
  'garden',
  'forest',
  'aqua',
  'lofi',
  'pastel',
  'fantasy',
  'wireframe',
  'black',
  'luxury',
  'dracula',
  'cmyk',
  'autumn',
  'business',
  'acid',
  'lemonade',
  'night',
  'coffee',
  'winter',
];

function DetailedTable({ users }) {
  const headers = ['Name', 'Email', 'Hash'];

  console.log('users', users);

  return (
    <div className="overflow-x-auto w-full">
      <table className="table w-full">
        {/* head */}
        <thead>
          <tr>
            <th>
              <label>
                <input type="checkbox" className="checkbox" />
              </label>
            </th>
            {headers.map(header => {
              return <th>{header}</th>;
            })}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {/* row 1 */}
          {users.map(user => {
            return (
              <tr>
                <th>
                  <label>
                    <input type="checkbox" className="checkbox" />
                  </label>
                </th>
                <td>
                  <div className="flex items-center space-x-3">
                    <div className="avatar">
                      <div className="mask mask-squircle w-12 h-12">
                        <img
                          src={user.pp}
                          alt="Avatar Tailwind CSS Component"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="font-bold">Name</div>
                      <div className="text-sm opacity-50">tag</div>
                    </div>
                  </div>
                </td>
                <td>
                  Kind
                  <br />
                  <span className="badge badge-ghost badge-sm">TAG</span>
                </td>
                <td>{user.email}</td>
                <th>
                  <button className="btn btn-ghost btn-xs">details</button>
                </th>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <th></th>
            {headers.map(header => {
              return <th>{header}</th>;
            })}
            <th></th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function NavBar({
  users,
  predefinedLists,
  tabs,
  activeTabId,
  fetchList,
  switchTab,
}) {
  return (
    <header class="sticky top-0 z-50 bg pb-10 bg-base-100">
      <div className="tabs">
        {tabs.map((tab, i) => {
          return (
            <button
              className={
                activeTabId === i
                  ? 'tab tab-lg tab-lifted tab-active'
                  : 'tab tab-lg tab-lifted'
              }
              onClick={() => {
                switchTab(i);
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>
      <div>
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-sm m-1">
            download list
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <a
                href={`data:text/json;charset=utf-8,${encodeURIComponent(
                  JSON.stringify(users.map(u => u.hash)),
                )}`}
                download="list.json"
              >
                hash only (json)
              </a>
            </li>
            <li>
              <a
                href={`data:text/json;charset=utf-8,${encodeURIComponent(
                  JSON.stringify(users.map(u => u.email)),
                )}`}
                download="list.json"
              >
                email only (json)
              </a>
            </li>
          </ul>
        </div>
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-sm m-1">
            Predefined Lists
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
          >
            {predefinedLists.map(list => {
              return (
                <li>
                  <button
                    onClick={() => {
                      fetchList(list);
                    }}
                  >
                    {list}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </header>
  );
}

function UserListApp({ inputData }) {
  const [userLists, setUserLists] = useState([]);
  const [theme, setTheme] = useState('dark');
  const [stateInfo, setStateInfo] = useState({
    tabs: [],
    activeTab: 0,
    injected: false,
  });

  const [mode, setMode] = useState({
    table: 'detailed',
  });

  console.log('Input list: ', inputData, inputData.state, inputData.user_lists);

  useEffect(() => {
    const inList = inputData.user_lists || [[]];
    const inStateInfo = inputData.state || {};
    const buildStateInfo = {
      ...stateInfo,
      ...{ tabs: inList.map((e, i) => `List ${i}`), injected: true },
      ...inStateInfo,
    };
    setStateInfo(buildStateInfo);
    setUserLists(inList);
  }, [inputData]);

  if (userLists.length === 0) {
    return <div>Loading...</div>;
  }

  console.log('state info: ', stateInfo, userLists);

  const fetchPredefinedUserList = label => {
    fetch(`/api/admin/user_list/get/`, {
      method: 'POST',
      headers: {
        'X-CSRFToken': getCookiesAsObject().csrftoken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ label: label }),
    }).then(res => {
      if (res.ok) {
        res.json().then(data => {
          setUserLists([...userLists, data.user_list]);
          setStateInfo({
            ...stateInfo,
            ...{ tabs: [...stateInfo.tabs, label] },
          });
        });
      } else {
      }
    });
  };

  const switchTab = tabId => {
    setStateInfo({
      ...stateInfo,
      ...{ activeTab: tabId },
    });
  };

  return (
    <div data-theme={theme}>
      <div className="w-full px-11 pt-5">
        {stateInfo.injected && (
          <NavBar
            users={userLists[stateInfo.activeTab]}
            predefinedLists={stateInfo.available_lists}
            tabs={stateInfo.tabs}
            activeTabId={stateInfo.activeTab}
            fetchList={fetchPredefinedUserList}
            switchTab={switchTab}
          />
        )}
        <div>
          {mode.table === 'detailed' && (
            <DetailedTable users={userLists[stateInfo.activeTab]} />
          )}
        </div>
      </div>
    </div>
  );
}

export default UserListApp;
