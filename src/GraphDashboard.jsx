import Plot from 'react-plotly.js';
import { useEffect, useState } from 'react';

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

const GraphSelector = ({graph}) => {
    return <div className="stats shadow">
  <div className="stat">
    <div className="stat-title">View another graph</div>
    <div className="stat-value">
        <select className="select select-bordered w-full max-w-xs">
            {graph?.slug_options?.map((slug) => {
                return <option>{slug}</option>
            })}
        </select>
    </div>
    <div className="stat-desc">(by slug)</div>
  </div>
</div>
}

const SlugSearch = () => {
    return <div className="stats shadow">
  <div className="stat">
    <div className="stat-title">search for slug</div>
    <div className="stat-value">
        <input type="text" placeholder="Type here" className="input w-full max-w-xs" />
    </div>
    <div className="stat-desc">(for slug)</div>
  </div>
</div>
}

const PlotContainer = ({ graph }) => {
    return <div className="stats shadow">
  <div className="stat">
    <div className="stat-title">Graph for slug '{graph?.slug}'</div>
    <div className="stat-value">
                                    <Plot
                                        data={graph?.data?.data}
                                        layout={ {width: 600, height: 400, ...graph?.data?.layout} }
                                        />
    </div>
    <div className="stat-desc">hash: {graph?.hash}</div>
  </div>
</div>
}

export const GraphDashboard = ({ inGraph }) => {
    const [curDate, setCurDate] = useState(null);
    const [dateRanges, setDateRanges] = useState(null);
    const [graph, setGraph] = useState({});
    const [fetchedGraphs, setFetchedGraphs] = useState([]);

    useEffect(() => {
    }, [graph])

    useEffect(() => {
        const newGraph = inGraph || {};
        setGraph(newGraph);

        setFetchedGraphs([newGraph, ...fetchedGraphs])

        if(Object.keys(inGraph).length !== 0){
            setCurDate(new Date(inGraph?.time))
            setDateRanges({
                curTime : new Date(inGraph?.time),
                maxTime : new Date(inGraph?.newest_time),
                minTime : new Date(inGraph?.oldest_time)
            })
        }
    }, [inGraph])

    if(Object.keys(graph).length === 0 || !dateRanges) {
        return <h1>loading...</h1>
    }


    return (
        <>
                    <div class="grid h-screen place-items-center">
                        <div className='flex justify-around relative'>
                            <div className='h-full flex flex-col justify-around mr-10'>
                                <div className='mb-5'><GraphSelector graph={graph}></GraphSelector></div>
                                <div className='mb-5'><SlugSearch></SlugSearch></div>
                            </div>
                            <div className='h-full flex flex-col justify-around mr-10'>
                                <div className="tabs ml-10">
                                    {fetchedGraphs.map((g) => {
                                        return <a className="tab tab-lifted">{g?.slug}</a> 
                                    })}
                                </div>
                                <PlotContainer graph={graph}></PlotContainer>
                            </div>
                            <div className='h-full flex flex-col justify-around ml-10'>
                                <div className='mb-5'><VersionAmountIndicator amount={graph?.amount_versions}></VersionAmountIndicator></div>
                                <div className='mb-5'><DatePicker curDate={curDate} setCurDate={setCurDate} dateRanges={dateRanges}></DatePicker></div>
                            </div>
                        </div>
                    </div>
        </>
    )
}