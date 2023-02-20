import Plot from 'react-plotly.js';
import { useEffect, useState } from 'react';
import { getCookiesAsObject } from './utils';

const asInputSelctorString = (date) => {
    console.log("Date", date)
    return date.toISOString().split('T')[0] + 'T' + date.toTimeString().split(' ')[0]
}

const BottomNav = () => {
    return <div className="btm-nav">
  <button className="bg-pink-200 text-pink-600">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
    <span className="btm-nav-label">Home</span>
  </button>
  <button className="active bg-neutral text-neutral-content">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    <span className="btm-nav-label">Warnings</span>
  </button>
  <button className="bg-teal-200 text-teal-600">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    <span className="btm-nav-label">Statics</span>
  </button>
</div>
}

const DatePicker = ({ curDate, setCurDate ,dateRanges }) => {
    return <div className="stats shadow">
  <div className="stat">
    <div className="stat-title">Version date</div>
<input type="datetime-local" id="meeting-time"
            name="meeting-time" 
            onChange={(e) => {
                console.log("e.target.value", e.target.value)
                setCurDate(new Date(e.target.value))
            }}
            value={asInputSelctorString(curDate)}
            min={asInputSelctorString(dateRanges?.minTime)}
            max={asInputSelctorString(dateRanges?.maxTime)}
            ></input> 
    <button className="btn btn-xs"
    onClick={(e) => {
            var url = new URL(window.location.href);
            const urlParams = new URLSearchParams(window.location.search);
            url.searchParams.set('date', encodeURIComponent());
            window.location.reload();
    }}
    >reload</button>
  </div>
</div>
}

const VersionAmountIndicator = ({ amount }) => {
    return <div className="stats shadow">
  <div className="stat">
    <div className="stat-title">Amount of versions</div>
    <div className="stat-value">{amount}</div>
    <div className="stat-desc">(recored hourly)</div>
  </div>
</div>
}

const GraphSelector = ({graph, updateGraphs}) => {
    const [slectedSlug, setSlectedSlug] = useState(graph?.slug)

    return <div className="stats shadow">
  <div className="stat">
    <div className="stat-title">View another graph</div>
    <div className="stat-value">
        <select className="select select-bordered w-full max-w-xs"
        onChange={(e) => {
            console.log("e.target.value", e.target.value)
            setSlectedSlug(e.target.value)
        }}>
            {graph?.slug_options?.map((slug, i) => {
                return <option key={i} value={slug}>{slug}</option>
            })}
        </select>
    </div>
    <div className="stat-desc">
            <button className="btn btn-xs"
                onClick={(e) => {
            fetch(`/api/admin/graph/get/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookiesAsObject().csrftoken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({slug: slectedSlug})
                }).then((res) => {
                    if(res.ok){
                        res.json().then((data => {
                            updateGraphs(data);
                        }))
                    }else{

                    }
                })
            }}>fetch</button>
    </div>
  </div>
</div>
}

const CompareTrigger = ({setView}) => {
    return <div className="stats shadow">
  <div className="stat">
    <div className="stat-title">Compare all?</div>
    <div className="stat-value">
        <button class="btn" onClick={(e) => {
            setView("compare");
        }}>overview</button>
    </div>
    <div className="stat-desc">(opens a big overview)</div>
  </div>
</div>
}

const ReproduceHashs = ({repOv}) => {
    return <div className="stats shadow">
  <div className="stat">
    <div className="stat-title">Reproduce this overview? </div>
    <div className="stat-desc">Frozen in time <button className='btn btn-xs btn-ghost'>copy</button></div>
    <div className="stat-desc max-w-xs overflow-x-hidden">{repOv?.frozen}</div>
    <div className="stat-desc max-w-xs overflow-x-hidden">...</div>
    <div className="stat-desc">Newest time <button className='btn btn-xs btn-ghost'>copy</button></div>
    <div className="stat-desc max-w-xs overflow-x-hidden">{repOv?.newest}</div>
    <div className="stat-desc max-w-xs overflow-x-hidden">...</div>
  </div>
</div>
}

const PlotContainer = ({ graph, mode }) => {
    return <div className="stats shadow">
  <div className="stat">
    {mode === "single" && <div className="stat-title">Graph for slug '{graph?.slug}'</div>}
    {mode === "single" && <div className="stat-value">
                                    <Plot
                                        data={graph?.data?.data}
                                        layout={ {width: 600, height: 400, ...graph?.data?.layout} }
                                        />
    </div>}
    {mode === "compare" && 
                                    <Plot
                                        data={graph?.data?.data}
                                        layout={ {width: 500, height: 350, ...graph?.data?.layout} }
                                        />
    }
    {mode === "single" && <div className="stat-desc">hash: {graph?.hash}</div>}
  </div>
</div>
}

export const GraphDashboard = ({ inGraph }) => {
    const [curDate, setCurDate] = useState(null);
    const [dateRanges, setDateRanges] = useState(null);
    const [graph, setGraph] = useState({});
    const [fetchedGraphs, setFetchedGraphs] = useState([]);
    const [view, setView] = useState("single");

    const [repOv, setRepOv] = useState({frozen: "", newest: ""});

    useEffect(() => {
    }, [graph])

    useEffect(() => {
        const newGraph = inGraph || {};
        setGraph(newGraph);

        setFetchedGraphs([newGraph])

        setRepOv({
            frozen: "by-hash:" + newGraph?.hash,
            newest: "by-slug:" + newGraph?.slug,
        })

        if(Object.keys(inGraph).length !== 0){
            setCurDate(new Date(inGraph?.time))
            setDateRanges({
                curTime : new Date(inGraph?.time),
                maxTime : new Date(inGraph?.newest_time),
                minTime : new Date(inGraph?.oldest_time)
            })
        }
    }, [inGraph])

    const updateGraphs = (newGraph) => {
        setGraph(newGraph);
        const allGraphsNew = [newGraph, ...fetchedGraphs]
        setFetchedGraphs(allGraphsNew)
        setRepOv({
            frozen: "by-hash:" + allGraphsNew.map((g) => g?.hash).join(","),
            newest: "by-slug:" + allGraphsNew.map((g) => g?.slug).join(","),
        })
    }

    if(Object.keys(graph).length === 0 || !dateRanges) {
        return <h1>loading...</h1>
    }


    return (
        <>{view === "single" &&
                    <div class="grid h-screen place-items-center">
                        <div className='flex justify-around relative'>
                            <div className='h-full flex flex-col justify-around mr-10'>
                                <div className='mb-5'><GraphSelector graph={graph} updateGraphs={updateGraphs}></GraphSelector></div>
                                <div className='mb-5'><CompareTrigger setView={setView}></CompareTrigger></div>
                                <div className='mb-5'><ReproduceHashs repOv={repOv}></ReproduceHashs></div>
                            </div>
                            <div className='h-full flex flex-col justify-around mr-10'>
                                <div className="tabs ml-10 max-w-xl	overflow-x-auto">
                                    {fetchedGraphs.map((g) => {
                                        return <button className={g?.slug !== graph?.slug ? "tab tab-lifted" : "tab tab-lifted tab-active"}
                                        onClick={(e) => {
                                            setGraph(g);
                                        }}
                                        >{g?.slug}</button> 
                                    })}
                                </div>
                                <PlotContainer graph={graph} mode={view}></PlotContainer>
                            </div>
                            <div className='h-full flex flex-col justify-around ml-10'>
                                <div className='mb-5'><VersionAmountIndicator amount={graph?.amount_versions}></VersionAmountIndicator></div>
                                <div className='mb-5'><DatePicker curDate={curDate} setCurDate={setCurDate} dateRanges={dateRanges}></DatePicker></div>
                            </div>
                        </div>
                    </div>}
            {view === "compare" && <>
           <div className='absolute t-0'><button className='btn'
                    onClick={(e) => {
                        setView("single");
                    }}>BACK</button></div> 
            <div className='flex flex-wrap pt-20'>
                {fetchedGraphs.map((g) => {
                    return <PlotContainer graph={g} mode={view}></PlotContainer>
                })}
            </div> 
            </>
            }
        </>
    )
}