import { Children, useState, useEffect, useCallback, useRef } from 'react'
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
import { UserDetailsCard } from './AdminPanel.jsx';

function StatsCard({scoringFunction}) {
  const fetcher = (...args) => fetch(...args).then(res => res.json());
  const { data, error, mutate,  isLoading } = useSWR(`/api/admin/quick_matching_statistics/?scoring_function=${scoringFunction}`, fetcher)
  console.log("data", data)
  let processedValue = "Loading..."
  
  if(!isLoading){
   processedValue = data?.score_type == "percentage" ? `${data?.data?.value?.toFixed(2)}%` : data?.data?.value
  }
  

  return <div className="stats shadow">
        <div className="stat">
          <div className="stat-title">{isLoading ? "Loading..." : data?.scoring_function}</div>
          <div className="stat-value">{processedValue}</div>
          <div className="stat-desc">{isLoading ? "Loading..." : data?.score_type}</div>
        </div>
      </div>
}

function MatchScoreListItem({item}) {
  return <div className='w-full flex flex-row gap-10 p-3 border-2 items-center content-center justify-center'>
    <div className='min-w-md'>
      <div>{item?.from_usr?.id} to {item?.to_usr?.id}</div>
    </div>
    <div className='min-w-md'>
      Score: {item?.score}
    </div>
    <div className='min-w-md'>
      Matchable: {item?.matchable ? "TRUE": "FALSE"}
    </div>
    <div className='max-w-md'>
      <UserDetailsCard user={item?.from_usr} _key={0} selectUserForDetails={() => {}} deselectUser={() => {}} partial={true} tiny={true} horizontal={true}/>
    </div>
    <div className='max-w-md'>
      <UserDetailsCard user={item?.to_usr} _key={0} selectUserForDetails={() => {}} deselectUser={() => {}} partial={true} tiny={true} horizontal={true}/>
    </div>
  </div>
}

function MatchingScoreListing({}) {
  const fetcher = (...args) => fetch(...args).then(res => res.json());
  const { data, error, mutate,  isLoading } = useSWR(`/api/admin/top_scores/?items_per_page=100`, fetcher)
  console.log("data", data)
  if(isLoading)
    return <div>Loading Best Matching Scores...</div>
  return <>
  <div className='w-full p-2 justify-center content-center items-center'>
    <h1 className='text-2xl'>Total 'matchable' combinations: {data?.total_items}</h1>
  </div>
<div className='w-full h-full flex flex-row justify-center content-center items-center gap-2 p-2 relative overflow-y-scroll'>
  <div className="w-full h-full flex flex-col gap-2">
    {data?.length == 0 && "No data"}
    {data?.results?.map((item, index) => <MatchScoreListItem key={item?.id ? item?.id : index} item={item} />)}
    </div>
    </div>
    </>
}

export function AdminPanelV2_Matches(props) {
  const fetcher = (...args) => fetch(...args).then(res => res.json());
  const [shouldFetch, setShouldFetch] = useState(false);
  const { data } = useSWR(shouldFetch ? null : "/api/admin/optimize_possible_matches/", fetcher);
  console.log("data", data, shouldFetch)
  
  return <div className='w-screen h-screen relative bg-base-300'>
    <div className='w-full h-full p-4 flex flex-col content-center justify-start items-start gap-2 relative'>
      <div className='w-full flex flex-row justify-center content-center items-center gap-2 p-2 border'>
        <StatsCard scoringFunction="users_waiting_for_match" />
        <StatsCard scoringFunction="percentage_of_learners_waiting_for_match" />
      </div>
      <div className='w-full flex flex-row justify-center content-center items-center gap-2 p-2'>
        <h1 className='text-3xl'>Matches</h1>
        <button className="btn btn-xl" onClick={() => {} }>Burst Update Matching Scores</button>
      <button className="btn btn-xl" onClick={() => {
        setShouldFetch(true);
      }}>Optimize posible matches</button>
      </div>
          <MatchingScoreListing /> 
    </div>
  </div>
}