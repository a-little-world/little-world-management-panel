import React, { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { getCookiesAsObject } from '../utils';
import { HeroiconsSolidMail } from '../AdminPanelV2.jsx';
import { useSearchParams } from 'react-router-dom';

export function DevkitSelector() {
  const fetcher = (...args) => fetch(...args).then(res => res.json());
  const { data: devKitEnabled, isLoading } = useSWR("/api/admin/devkit/enabled/", fetcher);

  if (isLoading) return null
  if (devKitEnabled?.enabled)
    return <a href={`/matching/devkit/`} className="flex flex-col items-center bg-green-500 p-8 rounded-lg shadow-lg m-4 h-64 w-64">
      <HeroiconsSolidMail className="h-16 w-16 text-white mb-2" />
      <h2 className="text-white text-2xl">dev-kit</h2>
    </a>
  return null
}

function CallbackCard({ callback, className, setSelectedCallback }) {
  return <button className={`w-96 p-2 bg-base-200 rounded-xl hover:bg-base-100 ${className}`} onClick={() => {
    setSelectedCallback(callback);
  }}>
    {callback.type}
    <div className='text-xs'>{JSON.stringify(callback.fields)}</div>
  </button>
}

export function WebsocketCallbackTester() {

  const fetcher = (...args) => fetch(...args).then(res => res.json());
  const userIdFieldRef = useRef(null);
  const { data: callBacks, isLoading } = useSWR("/api/callbacks/", fetcher);

  const [selectedCallback, setSelectedCallback] = useState(null);
  const [formFields, setFormFields] = useState({});
  const [res, setRes] = useState(null);

  console.log("CALLBACKS", callBacks, selectedCallback);

  const sendCallback = async (callbackName, userId, callBackFields) => {
    const _res = await fetch(`/api/callbacks/send/${callbackName}/${userId}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookiesAsObject().csrftoken
      },
      body: JSON.stringify(callBackFields)
    });

    const response = await _res.json()
    setRes(response);
    console.log("SEND CALLBACK", _res);
  };

  const updateSelectedCallback = (callback) => {
    setSelectedCallback(callback);
    setFormFields(Object.fromEntries(Object.keys(callback.fields).map((field) => [field, callback.fields[field].default])));
  }
  return <><div className='flex flex-col gap-2 h-full'>
    {isLoading ? <div>Loading...</div> : callBacks?.map((callback) => <CallbackCard setSelectedCallback={updateSelectedCallback} callback={callback} className={`${selectedCallback?.type === callback.type ? "bg-error" : ""}`} />)}
  </div>
    <div className='flex flex-col gap-2 h-full'>
      Selected Callback: {selectedCallback?.type}
      {selectedCallback ?
        <div className='flex flex-col gap-2'>
          {JSON.stringify(selectedCallback.fields)}
          {Object.keys(selectedCallback.fields).map((field) => {
            const fieldData = selectedCallback.fields[field]
            return <div key={`${field}_container`}>
              <div id={`${field}_name`} className='text-xs'>{field} (type: {fieldData.type} )</div>
              <input id={field} key={field} type='text' value={formFields[field]} onChange={() => {
                setFormFields({ ...formFields, [field]: document.getElementById(field).value })
              }} />
            </div>
          })}
          <h1>Receiver Hash ( who send the callback to ? )</h1>
          <input type='text' ref={userIdFieldRef} placeholder='user_id' />
          <button className='btn btn-primary' onClick={() => {
            sendCallback(selectedCallback.type, userIdFieldRef.current.value, formFields);
          }}>Send Callback</button>
        </div> : null}
      <div className='bg-base-200 p-4 rounded-xl'>
        {res ? JSON.stringify(res) : null}
      </div>
    </div></>
}

const TABS = [
  'callbacks',
  'user-journey-v2'
]

export function UserJourneyUserListing({
  data,
  selectedCategory
}) {
  return <div className='max-w-[1000px] h-screen'>
    {selectedCategory && <div className='h-full flex flex-col'>
      <div className='flex flex-row gap-2 bg-base-200 w-full p-4 text-xl'>
        {data.find((bucket) => bucket.query === selectedCategory).name}
      </div>
      <div className='flex flex-row bg-base-100'>
        Content
      </div>
    </div>}
  </div>
}

export function UserJourneySchema() {

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || null;

  const fetcher = (...args) => fetch(...args).then(res => res.json());
  const { data, isLoading } = useSWR("/api/admin/user_journey/schema/", fetcher);

  if (!data)
    return <div>Loading...</div>

  return <div className='flex flex-row relative'>
    <ul className="w-[350px] bg-base-200 text-base-content relative h-screen overflow-y-auto relative">
      {data.map((bucket, i) => {
        return <li key={i} className='p-2'>
          <a onClick={() => {
            searchParams.set('category', bucket.query);
            setSearchParams(searchParams);
          }} className={`rounded-btn flex flex-col hover:bg-error ${selectedCategory === bucket.query}`}>
            <div className='text-xl'>{bucket.name}</div>
            <div className='text-xs'>Category: {bucket.category}</div>
            <div className='text-xs'>{bucket.description}</div>
          </a>
        </li>
      })}
    </ul>
    <UserJourneyUserListing data={data} selectedCategory={selectedCategory} />
  </div>
}

export function AdminPanelV2_DevKit() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTab = searchParams.get('tab') || 'callbacks';

  return <>
    <div className='flex flex-row'>
      <div className='flex flex-col gap-2'>
        <h1>DEVELOPMENT KIT</h1>
        {TABS.map((tab) => <button className={`btn btn-primary ${selectedTab === tab ? 'bg-primary' : ''}`} onClick={() => {
          setSearchParams({ tab });
        }}>{tab}</button>)}
      </div>
      {selectedTab === 'callbacks' ? <WebsocketCallbackTester /> : null}
      {selectedTab === 'user-journey-v2' ? <UserJourneySchema /> : null}
    </div>
  </>
}