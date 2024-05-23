import React, { useState, useRef } from 'react';
import useSWR from 'swr';

import { getCookiesAsObject } from '../utils';
import { HeroiconsSolidMail } from '../atoms/HeroiconsSolidMail.tsx';

export function DevkitSelector() {
  const fetcher = (...args) => fetch(...args).then(res => res.json());
  const { data: devKitEnabled, isLoading } = useSWR(
    '/api/admin/devkit/enabled/',
    fetcher,
  );

  if (isLoading) return null;
  if (devKitEnabled?.enabled)
    return (
      <a
        href={`/matching/devkit/`}
        className="flex flex-col items-center bg-green-500 p-8 rounded-lg shadow-lg m-4 h-64 w-64"
      >
        <HeroiconsSolidMail className="h-16 w-16 text-white mb-2" />
        <h2 className="text-white text-2xl">dev-kit</h2>
      </a>
    );
  return null;
}

function CallbackCard({ callback, className, setSelectedCallback }) {
  return (
    <button
      className={`w-96 p-2 bg-base-200 rounded-xl hover:bg-base-100 ${className}`}
      onClick={() => {
        setSelectedCallback(callback);
      }}
    >
      {callback.type}
      <div className="text-xs">{JSON.stringify(callback.fields)}</div>
    </button>
  );
}

export function AdminPanelV2_DevKit() {
  const fetcher = (...args) => fetch(...args).then(res => res.json());
  const userIdFieldRef = useRef(null);
  const { data: callBacks, isLoading } = useSWR('/api/callbacks/', fetcher);

  const [selectedCallback, setSelectedCallback] = useState(null);
  const [formFields, setFormFields] = useState({});
  const [res, setRes] = useState(null);

  console.log('CALLBACKS', callBacks, selectedCallback);

  const sendCallback = async (callbackName, userId, callBackFields) => {
    const _res = await fetch(`/api/callbacks/send/${callbackName}/${userId}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookiesAsObject().csrftoken,
      },
      body: JSON.stringify(callBackFields),
    });

    const response = await _res.json();
    setRes(response);
    console.log('SEND CALLBACK', _res);
  };

  const updateSelectedCallback = callback => {
    setSelectedCallback(callback);
    setFormFields(
      Object.fromEntries(
        Object.keys(callback.fields).map(field => [
          field,
          callback.fields[field].default,
        ]),
      ),
    );
  };

  return (
    <>
      <div className="flex flex-row">
        <h1>DEVELOPMENT KIT</h1>
        <div className="flex flex-col gap-2 h-full">
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            callBacks?.map(callback => (
              <CallbackCard
                setSelectedCallback={updateSelectedCallback}
                callback={callback}
                className={`${
                  selectedCallback?.type === callback.type ? 'bg-error' : ''
                }`}
              />
            ))
          )}
        </div>
        <div className="flex flex-col gap-2 h-full">
          Selected Callback: {selectedCallback?.type}
          {selectedCallback ? (
            <div className="flex flex-col gap-2">
              {JSON.stringify(selectedCallback.fields)}
              {Object.keys(selectedCallback.fields).map(field => {
                const fieldData = selectedCallback.fields[field];
                return (
                  <div key={`${field}_container`}>
                    <div id={`${field}_name`} className="text-xs">
                      {field} (type: {fieldData.type} )
                    </div>
                    <input
                      id={field}
                      key={field}
                      type="text"
                      value={formFields[field]}
                      onChange={() => {
                        setFormFields({
                          ...formFields,
                          [field]: document.getElementById(field).value,
                        });
                      }}
                    />
                  </div>
                );
              })}
              <h1>Receiver Hash ( who send the callback to ? )</h1>
              <input type="text" ref={userIdFieldRef} placeholder="user_id" />
              <button
                className="btn btn-primary"
                onClick={() => {
                  sendCallback(
                    selectedCallback.type,
                    userIdFieldRef.current.value,
                    formFields,
                  );
                }}
              >
                Send Callback
              </button>
            </div>
          ) : null}
          <div className="bg-base-200 p-4 rounded-xl">
            {res ? JSON.stringify(res) : null}
          </div>
        </div>
      </div>
    </>
  );
}
