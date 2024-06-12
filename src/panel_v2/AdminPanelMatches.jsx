import { useState, useEffect, useRef } from 'react'
import '../withTailwind.css';
import useSWR from 'swr';
import { mutate as gMutate } from 'swr'
import { getCookiesAsObject } from '../utils';
import { UserDetailsCard } from './AdminPanel.jsx';

function StatsCard({ scoringFunction }) {
  const fetcher = (...args) => fetch(...args).then(res => res.json());
  const { data, error, mutate, isLoading } = useSWR(`/api/admin/quick_matching_statistics/?scoring_function=${scoringFunction}`, fetcher, { refreshInterval: 5000 })
  console.log("data", data)
  let processedValue = "Loading..."

  if (!isLoading) {
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

function ConfirmMatchSuggestion({ user1, user2, matchingType }) {
  const [res, setRes] = useState(null)
  const [visible, setVisible] = useState(false)

  const dialogId = `my_modal_3_${user1.id}_${user2.id}`

  const makeMatchingApi = () => {
    let postData = (matchingType === "proposal") ? {
      user1: user1.id,
      user2: user2.id,
      proposal: true
    } : {
      user1: user1.id,
      user2: user2.id,
    }

    fetch(`/api/admin/user/match/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookiesAsObject().csrftoken
      },
      body: JSON.stringify(postData)
    }).then((res) => {
      if (res.ok) {
        res.text().then((text) => {
          gMutate(`/api/admin/optimize_possible_matches/`)
          setRes({
            status: "success",
            message: text
          })
        })
      }
    })
  }

  return <>
    <button className="btn btn-sm" onClick={() => {
      document.getElementById(dialogId).showModal()
      setVisible(true)
    }}>Make Matching Suggestion</button>
    <dialog id={dialogId} className="modal">
      <div className="w-1/2 max-h-full overflow-y-scroll border-2 rounded-xl bg-base-200">
        <div className='flex flex-row gap-10 p-3 items-center content-center justify-center'>
          <button className="btn btn-sm btn-success" onClick={() => {
            makeMatchingApi()
          }}>Confirm</button>
          <h3 className="font-bold text-lg">You sure you want to confirm this matching suggestion?</h3>
          <button className="btn btn-sm btn-error" onClick={() => {
            setVisible(false)
            document.getElementById(dialogId).close()
            setRes(null)
          }}>Cancel</button>
        </div>
        {!res && <div className='flex flex-row gap-10 p-3 items-center content-center justify-center'>
          <UserDetailsCard user={user1} _key={0} selectUserForDetails={() => { }} deselectUser={() => { }} partial={false} tiny={true} horizontal={false} />
          <UserDetailsCard user={user2} _key={0} selectUserForDetails={() => { }} deselectUser={() => { }} partial={false} tiny={true} horizontal={false} />
        </div>}
        {res && <div className='flex flex-row gap-10 p-3 items-center content-center justify-center'>
          <div className="alert alert-success">{res.message}</div>
        </div>}
      </div>
    </dialog>
  </>

}

function MatchScoreListItem({ item }) {
  return <div className='w-full flex flex-row gap-10 p-3 border-2 items-center content-center justify-center'>
    <div className='min-w-md'>
      <div>{item?.from_usr?.id} to {item?.to_usr?.id}</div>
    </div>
    <div className='min-w-md'>
      Score: {item?.score}
    </div>
    <div className='min-w-md'>
      Matchable: {item?.matchable ? "TRUE" : "FALSE"}
    </div>
    <div className='max-w-md'>
      <UserDetailsCard user={item?.from_usr} _key={0} selectUserForDetails={() => { }} deselectUser={() => { }} partial={true} tiny={true} horizontal={true} />
    </div>
    <div className='max-w-md'>
      <UserDetailsCard user={item?.to_usr} _key={0} selectUserForDetails={() => { }} deselectUser={() => { }} partial={true} tiny={true} horizontal={true} />
    </div>
    <div className='max-w-md'>
      <ConfirmMatchSuggestion user1={item?.from_usr} user2={item?.to_usr} matchingType={"proposal"} />
    </div>
  </div>
}

function MatchingScoreListing({ }) {
  const fetcher = (...args) => fetch(...args).then(res => res.json());
  const { data, error, mutate, isLoading } = useSWR(`/api/admin/top_scores/?items_per_page=100`, fetcher)
  console.log("data", data)
  if (isLoading)
    return <div>Loading Best Matching Scores...</div>
  return <>
    <div className='w-full p-2 justify-center content-center items-center'>
      <h1 className='text-2xl'>Total 'matchable' scores ( contains many duplicate user matchings ): {data?.total_items}</h1>
    </div>
    <div className='w-full h-full flex flex-row justify-center content-center items-center gap-2 p-2 relative overflow-y-scroll'>
      <div className="w-full h-full flex flex-col gap-2">
        {data?.length == 0 && "No data"}
        {data?.results?.map((item, index) => <MatchScoreListItem key={item?.id ? item?.id : index} item={item} />)}
      </div>
    </div>
  </>
}

function TaskMangerItem({ task }) {
  // Manges the parallel matching score calculation tasks
  const fetcher = (...args) => fetch(...args).then(res => res.json());
  const [completed, setCompleted] = useState(false);
  const { data, error, isLoading } = useSWR(completed ? null : `/api/admin/tasks/${task?.task_id}/status/`, fetcher, { refreshInterval: 1000 })

  useEffect(() => {
    if (data?.state == "SUCCESS") {
      setCompleted(true);
    }
  }, [data])

  if (error) return <div>failed to load</div>
  if (isLoading) return <div>loading...</div>

  if (completed) {
    return <div className='text-green-500'>Task {task?.task_id} completed</div>
  }

  return <div>
    <span>Task {task?.task_id} ({data?.info?.progress?.combinations_processed}/{data?.info?.progress?.total_combinations}) </span>
    <progress className="progress progress-secondary w-56" value={parseInt(data?.info?.progress?.combinations_processed)} max={parseInt(data?.info?.progress?.total_combinations)}></progress>
  </div>
}

function MatchOptimizationModal({ }) {
  const fetcher = (...args) => fetch(...args).then(res => res.json());
  const [trackableTasks, setTrackableTasks] = useState([]);

  const taskAmountRef = useRef();
  const taskDelayRef = useRef();
  const paralelTaskRef = useRef();


  return <dialog id="my_modal_2" className="modal">
    <div className="modal-box">
      <h3 className="font-bold text-lg">Caluclating Matching options & scores can be resource intensive</h3>
      <StatsCard scoringFunction="considerable_match_permutations" />
      <div className='flex flex-col'>
        <span>amount_of_tasks</span>
        <input type="text" defaultValue={10} className="input input-bordered w-full max-w-xs" ref={taskAmountRef} />
        <span>delay_between_tasks ( seconds )</span>
        <input type="text" defaultValue={10} className="input input-bordered w-full max-w-xs" ref={taskDelayRef} />
        <span>paralel_tasks</span>
        <input type="text" defaultValue={2} className="input input-bordered w-full max-w-xs" ref={paralelTaskRef} />
        <button className="btn btn-xl" onClick={() => {
          fetcher(`/api/admin/burst_calulate_matching_scores/?task_count=${taskAmountRef.current.value}&delay_between_tasks=${taskDelayRef.current.value}&paralel_tasks=${paralelTaskRef.current.value}`).then((data) => {
            setTrackableTasks(data)
          });
        }}>Start Burst Matching Score Calculation</button>
        {trackableTasks.map((task, index) => <TaskMangerItem key={index} task={task} />)}
      </div>
    </div>
    <form method="dialog" className="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
}

function CleanupOptionsModal({ }) {
  const fetcher = (...args) => fetch(...args).then(res => res.json());
  const [res, setRes] = useState(null)

  return <dialog id="cleanup_modal" className="modal">
    <div className="modal-box">
      <StatsCard scoringFunction="total_matching_score_count" />
      <button className="btn btn-error" onClick={() => {
        fetcher(`/api/admin/delete_all_matching_scores/`).then((data) => {
          data.json().then((text) => {
            console.log("Deleted all matching scores", data)
            setRes(data)
          })
        });
      }}>
        Delete all matching scores at once
      </button>
      {res && <div className="alert alert-success">{res?.msg}</div>}
    </div>
  </dialog>
}


function MatchingScoreNavigation({ tab, setTab }) {
  return <div className='w-full flex flex-row justify-center content-center items-center gap-2 p-2 bg-base-100'>
    <div role="tablist" className="tabs tabs-boxed">
      <a role="tab" onClick={() => { setTab("scores") }} className={`tab ${tab == 'scores' ? 'tab-active' : ''}`}>Scores</a>
      <a role="tab" onClick={() => { setTab("suggested_matches") }} className={`tab ${tab == 'suggested_matches' ? 'tab-active' : ''}`}>Matching Suggestion</a>
    </div>
    <h1 className='text-3xl'>Matches</h1>
    <button className="btn btn-xl" onClick={() => {
      document.getElementById('my_modal_2').showModal()
    }}>Burst Update Matching Scores</button>
    <button className="btn btn-xl" onClick={() => {
      document.getElementById('cleanup_modal').showModal()
    }}>Cleanup options</button>
    <MatchOptimizationModal />
    <CleanupOptionsModal />
  </div>
}

function SuggestedMatches({ }) {
  const fetcher = (...args) => fetch(...args).then(res => res.json());
  const { data, isLoading } = useSWR("/api/admin/optimize_possible_matches/", fetcher);

  console.log("Optimized Matches", data)

  if (isLoading)
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

function MatchingScoreStats({ }) {
  return <div className='w-full flex flex-row justify-center content-center items-center gap-2 p-2 border'>
    <StatsCard scoringFunction="users_waiting_for_match" />
    <StatsCard scoringFunction="matchable_scores" />
    <StatsCard scoringFunction="unmatchable_scores" />
    <StatsCard scoringFunction="percentage_of_learners_waiting_for_match" />
  </div>
}

export function AdminPanelV2_Matches(props) {
  const [tab, setTab] = useState("scores");

  return <div className='w-screen h-screen relative bg-base-300'>
    <div className='w-full h-full p-4 flex flex-col content-center justify-start items-start gap-2 relative'>
      <MatchingScoreStats />
      <MatchingScoreNavigation tab={tab} setTab={setTab} />
      {tab == "scores" && <MatchingScoreListing />}
      {tab == "suggested_matches" && <SuggestedMatches />}
    </div>
  </div>
}