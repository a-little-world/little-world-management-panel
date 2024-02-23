import React, { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { useParams } from 'react-router-dom';
import { UserDetailsCard } from './AdminPanel.jsx';
import { getCookiesAsObject } from '../utils';


export function AdminPanelV2_Emails(props){
    const [tab, setTab] = useState("templates");

    return <div className="w-screen h-screen flex flex-col justify-center items-center content-center bg-base-100 relative">
        <div className="p-10 flex justify-center content-center items-center flex-row gap-2 w-full flex-wrap bg-base-200 rounded-xl">
            <a className="btn btn-primary" href="/matching/">Back</a>
            <ul className="menu menu-vertical lg:menu-horizontal bg-base-200 rounded-box">
              <li><a className={`${tab === "templates" ? 'bg-error' : ''} text-xl`} onClick={() => setTab("templates")}>Email Templates</a></li>
              <li><a className={`${tab === "emails" ? 'bg-error' : ''} text-xl`} onClick={() => setTab("emails")}>Emails</a></li>
            </ul>
        </div>
        {tab === "templates" && <EmailTemplatesView/>}
        {tab === "emails" && <EmailLogsView/>}
    </div> 
}

function EmailLogItem({email}){
    // params: template, id, time, sucess, data ({param -> value}), sender (hash, email, id), receiver (hash, email, id)
    return <div className="p-10 flex justify-center content-center items-center flex-row gap-2 w-full bg-base-300 rounded-xl p-3">
        <a href={`/matching/emails/${email.template}`} className="btn btn-link"><h1 className="text-3xl text-bold">{email.template}</h1></a>
        <h2 className="text-xl text-bold">{email.time}</h2>
        <h2 className="text-xl text-bold">{email.sender.email}</h2>
        <h2 className="text-xl text-bold">{email.receiver.email}</h2>
        <h2 className={`text-xl text-bold ${email.success ? 'text-success': 'text-error'}`}>{email.success ? "Sent" : "Failed"}</h2>
        <a className="btn btn-primary" href={email.retrieve}>View</a>
    </div>
}

function EmailLogsView(){
  const fetcher = (...args) => fetch(...args).then(res => res.json());
    const { data: emailLogs, isLoading } = useSWR("/api/admin/list_emails/logs/", fetcher);
    
    console.log("Email logs", emailLogs);
    return <div className="p-10 flex justify-center content-center items-center flex-row gap-2 w-full flex-wrap max-w-full flex-grow">{
        emailLogs && emailLogs.map((email, index) => {
            return <EmailLogItem email={email}/>
        })
    }</div>
}


function EmailTemplatesView(){
  const fetcher = (...args) => fetch(...args).then(res => res.json());
    const { data: emailTemplates, isLoading } = useSWR("/api/admin/list_emails/templates/", fetcher);
    
return <div className="p-10 flex justify-center content-center items-center flex-row gap-2 w-full flex-wrap max-w-full flex-grow">
            <div className="w-full flex justify-center content-center items-center flex-row gap-2">
                <h1 className="text-3xl text-bold">Email Templates</h1>
            </div>
            {isLoading ? "Loading..." : emailTemplates.map((email, index) => {
                return <a 
                className="p-4 bg-base-300 flex justify-center content-center items-center p-4 rounded-xl w-fit border-2 border-base-300 hover:border-secondary"
                href={`/matching/emails/${email.name}`}
                key={index}>
                    <h1 className="text-xl text-bold">{email.name}</h1>
                </a>
            })}
        </div>
}

function EmailDetailsSendEmail(){
    const { emailTemplateName } = useParams();
  const fetcher = (...args) => fetch(...args).then(res => res.json());
    const { data: emailParams, isLoading } = useSWR(`/api/admin/list_emails/${emailTemplateName}/params/`, fetcher);
    
    const [renderedEmail, setRenderedEmail] = useState(null);
    const [emailSendResult, setEmailSendResult] = useState(null);
    
    const [emailForm, setEmailForm] = useState({});
    
    const AUTO_FILLED = ["unsubscribe_url1"]
    
    useEffect(() => {
        // emails form [fieldName] = value
        const initalEmailForm = {
            email: '',
            subject: ''
        };
        if(emailParams){
            Object.keys(emailParams).map((param, index) => {
                if(AUTO_FILLED.includes(param)){
                    initalEmailForm[param] = ""
                }else{
                    initalEmailForm[param] = emailParams[param].default;
                }
            });
            setEmailForm(initalEmailForm);
        }
        console.log("Initial email form", initalEmailForm);
    }, [emailParams]);
    
    const sendEmail = async (emailFormFields) => {
        let emailFormCopy = {...emailFormFields};
        
        delete emailFormCopy.email;

        const res = await fetch(`/api/admin/list_emails/${emailTemplateName}/send/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookiesAsObject().csrftoken
            },
            body: JSON.stringify({
                ...emailFormCopy,
                receiver: emailFormFields.email
        })})
        if (res.status === 200) {
            const data = await res.json();
            setRenderedEmail(null);
            setEmailSendResult(data);
        }else{
            setEmailSendResult({
                "error": "something failed"
            })
        }
    };
    
    const fetchRenderedEmail = async (emailFormFields) => {
        
        let emailFormCopy = {...emailFormFields};
        
        delete emailFormCopy.email;

        const data = await fetcher(`/api/admin/list_emails/${emailTemplateName}/render/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookiesAsObject().csrftoken
            },
            body: JSON.stringify({
                ...emailFormCopy,
                receiver: emailFormFields.email
        })})
        
        setRenderedEmail(data);
        
        console.log("MAIL data")
    };
    
    return <>
    <div className="p-4 bg-base-300 flex flex-col justify-center content-center items-start p-4 rounded-xl w-fit border-2 border-base-300 hover:border-secondary gap-2">
        <h1 className="text-3xl text-bold">Send Email</h1>
        <span>Send email to:</span>
        <input type="text" className="input input-primary" placeholder="Email" onChange={(e) => {
            setEmailForm({
                ...emailForm,
                email: e.target.value
            })
        }} />
        <span>Subject:</span>
        <input type="text" className="input input-primary" placeholder="Subject" onChange={(e) => {
            setEmailForm({
                ...emailForm,
                subject: e.target.value
            })
        }}/>
        <h1 className="text-xl text-bold">Email Template Parameters</h1>
        {emailParams && Object.keys(emailParams).map((param, index) => {
            if(AUTO_FILLED.includes(param)){
                return <><span>
                    auto filled field
                    </span><input type="text" className="input input-primary bg-error disabled" placeholder={param} key={index}/></>
            }
            return <input type="text" className="input input-primary" placeholder={param} key={index} defaultValue={emailParams[param].default} onChange={(e) => {
                setEmailForm({
                    ...emailForm,
                    [param]: e.target.value
                })
            }} />
        })}
        <button className="btn btn-primary" onClick={() => {
            fetchRenderedEmail(emailForm);
        }}>View Email</button>
    </div>
    <div className="p-4 bg-base-300 flex flex-col justify-center content-center items-start p-4 rounded-xl w-fit border-2 border-base-300 hover:border-secondary gap-2 scale-75">
        {renderedEmail && <div className="flex flex-col">
            <h1 className="text-2xl">to {renderedEmail.receiver}</h1>
            <h1 className="text-2xl">subject: {renderedEmail.subject}</h1>
            <div dangerouslySetInnerHTML={{ __html: renderedEmail.html }} />
            <button className="btn btn-primary" onClick={() => {
                sendEmail(emailForm)
            }}>Send Email</button>
            </div>}
        {emailSendResult && <div className="flex flex-col">
           {JSON.stringify(emailSendResult)} 
            </div>}
    </div>
</>

}


export function AdminPanelV2_EmailDetails(props){
    const { emailTemplateName } = useParams();
    const fetcher = (...args) => fetch(...args).then(res => res.text());
    const { data: renderedEmail, isLoading } = useSWR(`/emails/${emailTemplateName}`, fetcher);
    console.log("Rendered email", renderedEmail);
    

    return <div className="w-screen h-screen flex justify-center items-center content-center bg-base-100 relative">
        <div className="w-full relative flex flex-row max-h-full">
            <div className="p-4 bg-base-300 flex flex-col justify-center content-center items-center p-4 rounded-xl w-fit border-2 border-base-300 hover:border-secondary gap-4">
                <h1 className="text-3xl text-bold">Email Details</h1>
                <a className="btn btn-secundary" href="/matching/emails/">Back</a>
            </div>
            <div className="p-4 bg-base-300 flex justify-center content-center items-center p-4 rounded-xl w-fit border-2 border-base-300 hover:border-secondary scale-75 max-h-lg">
                {renderedEmail && <div dangerouslySetInnerHTML={{ __html: renderedEmail }} />}
            </div>
            <EmailDetailsSendEmail />
        </div>
    </div> 
}