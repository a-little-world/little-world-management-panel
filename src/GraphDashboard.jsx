import Plot from 'react-plotly.js';
import { useEffect, useState } from 'react';
import { getCookiesAsObject } from './utils';

const asInputSelctorString = (date) => {
    console.log("Date", date)
    try {
        return date.toISOString().split('T')[0] + 'T' + date.toTimeString().split(' ')[0]
    } catch (error) {
        return "error"
    }
}

const overviews = [
    {
        "title" : "User influx",
        "description" : "User groth over time, also comparison new volunteers vs new learners",
        "lookup" : ""
    },
    {
        "title" : "User matching choices",
        "description" : "Overview of overall matching choinces in e.g.: interests, availability time, learner or volunteer...",
        "lookup" : ""
    },
    {
        "title" : "Match activity",
        "description" : "Activity of matches. Show amount of active matches currently. And actions by active matches.",
        "lookup" : ""
    },
    {
        "title" : "Plattform activity",
        "description" : "Total interactions overtime. Amount of logins, messages send, etc...",
        "lookup" : ""
    },
]

const ActionMenu = ({actions}) => {
    const [checkedReload, setCheckedReload] = useState(false);

    return <div className="stats shadow">
        <div className="stat">
            <div className="stat-title">Actions</div>
                <div className="divider"></div>
                <button className="btn btn-xs" onClick={(e) => {
                    console.log("Actions", actions);
                    actions.removeGraph();
                }} >remove graph</button>
                <div className="stat-desc">remove the currently selected graph</div>
                <div className="divider"></div>
                <div className="form-control">
                    <label className="label cursor-pointer">
                        <span className="label-text">automatic reload</span> 
                        <input type="checkbox" checked={checkedReload} className="checkbox" onChange={(e) => {
                            setCheckedReload(e.target.checked);
                            actions.makeToast({text: `automatic reload ${e.target.checked ? "enabled" : "disabled"}`, type: 'success'})
                        }}/>
                    </label>
                    <div className="stat-desc">will refresh the page for new stats every 5 min</div>
                </div>
                <div className="divider"></div>
                <select className="select select-bordered w-full max-w-xs" onChange={(e) => {
                            console.log("e.target.value", e.target.value)
                            actions.themeControl.setTheme(e.target.value)
                        }}>
                {actions?.themeControl?.availableThemes?.map((theme, i) => {
                    return <option key={i} value={theme}>{theme}</option>
                })}
                </select>
                <div className="stat-desc">change up the theme</div>
        </div>
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
    <button className="btn btn-xs mt-2" onClick={(e) => {
            var url = new URL(window.location.href);
            const urlParams = new URLSearchParams(window.location.search);
            url.searchParams.set('date', encodeURIComponent());
            window.location.reload();
    }} >reload</button>
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

const GraphSelector = ({graph, fetchedGraphs,updateGraphs, makeToast}) => {
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
            <button className="btn btn-xs mt-2"
                onClick={(e) => {
                    const fetchedSlugs = fetchedGraphs.map((graph) => graph.slug)
                    console.log("fetchedSlugs", fetchedSlugs, slectedSlug);
                    if(fetchedSlugs.includes(slectedSlug)){
                        makeToast({text: `the slug '${slectedSlug}' is already fetched!`, type: 'warning'})
                    }else{
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
                                            makeToast({text: `sucessfully fechted '${slectedSlug}' graph`, type: 'success'})
                                            updateGraphs(data);
                                        }))
                                    }else{
                                        makeToast({text: `failed fetching '${slectedSlug}' graph`, type: 'warning'})
                                    }
                                })
                    }
            }}>fetch</button>
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

const ReproduceHashs = ({repOv, actions}) => {
    return <div className="stats shadow">
  <div className="stat">
    <div className="stat-title">Reproduce this overview? </div>
    <div className="stat-desc">Frozen in time <button className='btn btn-xs btn-ghost' 
    onClick={() => {
        actions.makeToast({text: `copied frozen time tag`, type: 'success'})
        navigator.clipboard.writeText(repOv?.frozen);
    }}>copy</button></div>
    <div className="stat-desc max-w-xs overflow-x-hidden">{repOv?.frozen}</div>
    <div className="stat-desc max-w-xs overflow-x-hidden">...</div>
    <div className="stat-desc">Newest time <button className='btn btn-xs btn-ghost'
    onClick={() => {
        actions.makeToast({text: `copied relative time tag`, type: 'success'})
        navigator.clipboard.writeText(repOv?.newest);
    }}>copy</button></div>
    <div className="stat-desc max-w-xs overflow-x-hidden">{repOv?.newest}</div>
    <div className="stat-desc max-w-xs overflow-x-hidden">...</div>
  </div>
</div>
}

const PredefinedOverviews = ({repOv}) => {
    return <div className="stats shadow">
  <div className="stat">
    <div className="stat-title">Predefined overviews</div>
    <label htmlFor="my-modal-3" className="btn">show options</label>
  </div>
</div>
}

const PredefinedOverviewItem = ({overview}) => {
    return <div className="stats shadow mb-5 mr-5">
  <div className="stat">
    <div className="stat-title">{overview?.title}</div>
    <div className="stat-desc w-40" style={{whiteSpace: 'pre-wrap'}}>{overview?.description}</div>
    <label htmlFor="my-modal-3" className="btn btn-xs btn-ghost" onClick={() => {
        window.location.href = "/stats/graph/" + overview?.lookup;
    }}>open</label>
  </div>
</div>
}

const PlotContainer = ({ graph, mode }) => {
    return <div className={mode === "single" ? "stats shadow" : "stats shadow mt-10"}>
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

const ToastContainer = ({ toasts }) => {
        return <div className="toast">{toasts.map((toast, i) => {
                return <div className={`alert alert-${toast?.type}`}>
                    <div>
                        {toast?.type === 'success' && <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        {toast?.type === 'warning' && <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        <span>{toast?.text}</span>
                    </div>
                </div>})}
            </div>
}

const TableContainer = () => {
    const headers = ["slug", "hash", "date", "actions"]
    const rows = [
        [ "slug", "hash", "date", "actions" ],
        [ "slug", "hash", "date", "actions" ],
        [ "slug", "hash", "date", "actions" ],
    ]
    return <div className="stats shadow">
        <div className="stat"></div>
    <div className="overflow-x-auto">
  <table className="table w-full">
    <thead>
      <tr>
        <th></th>
        {headers.map((header, i) => {
            return <th>{header}</th>
        })}
      </tr>
    </thead>
    <tbody>
        {rows.map((row, i) => {
            return <tr>
                <th>{i}</th>
                {row.map((cell, i) => {
                    return <td>{cell}</td>
                })}
            </tr>
        })}
    </tbody>
  </table>
</div>
</div>
}

export const GraphDashboard = ({ inGraph, inFetched, themeControl }) => {
    const [curDate, setCurDate] = useState(null);
    const [dateRanges, setDateRanges] = useState(null);
    const [graph, setGraph] = useState({});
    const [fetchedGraphs, setFetchedGraphs] = useState([]);
    const [view, setView] = useState("single");
    const [repOv, setRepOv] = useState({frozen: "", newest: ""});

    const [toasts, setToasts] = useState([]);

    console.log("IN GRAPH", inGraph);
    console.log("IN fetched", inFetched);

    useEffect(() => {
        const newGraph = inGraph || {};
        setGraph(newGraph);

        if(inFetched){
            setFetchedGraphs(inFetched)
            setRepOv({
                frozen: "hash:" + inFetched.map((g) => g?.hash).join(","),
                newest: "slug:" + inFetched.map((g) => g?.slug).join(",")
            })
        }else{
            setFetchedGraphs([newGraph])
            setRepOv({
                frozen: "hash:" + newGraph?.hash,
                newest: "slug:" + newGraph?.slug,
            })
        }

        if(Object.keys(inGraph).length !== 0){
            setCurDate(new Date(inGraph?.time))
            setDateRanges({
                curTime : new Date(inGraph?.time),
                maxTime : new Date(inGraph?.newest_time),
                minTime : new Date(inGraph?.oldest_time)
            })
        }
    }, [inGraph])

    const triggerToast = (toast) => {
        const id = crypto.randomUUID();
        setToasts([...toasts, {id , ...toast}]);
        setTimeout(() => {
            setToasts(to => to.filter((t) => t.id !== id));
        }, 3000);
    }

    const updateGraphs = (newGraph) => {
        setGraph(newGraph);
        const allGraphsNew = [newGraph, ...fetchedGraphs.filter((g) => g?.slug !== newGraph?.slug)]
        setFetchedGraphs(allGraphsNew)
        setRepOv({
            frozen: "hash:" + allGraphsNew.map((g) => g?.hash).join(","),
            newest: "slug:" + allGraphsNew.map((g) => g?.slug).join(","),
        })
    }

    const removeGraph = () => {
        console.log("Removing graph")
        const slug = graph?.slug;
        const allGraphsNew = [...fetchedGraphs.filter((g) => g?.slug !== slug)]
        setGraph(allGraphsNew[0] || {})
        setFetchedGraphs(allGraphsNew)
        setRepOv({
            frozen: "hash:" + allGraphsNew.map((g) => g?.hash).join(","),
            newest: "slug:" + allGraphsNew.map((g) => g?.slug).join(","),
        })

        triggerToast({text: `removed current graph '${slug}'`, type: 'success'})
    }


    return (
        <div className="bg-base-300">{view === "single" &&
                    <div class="grid h-screen place-items-center">
                        <div className='flex justify-around relative'>
                            <div className='h-full flex flex-col justify-around mr-10'>
                                <div className='mb-5'><GraphSelector 
                                    graph={graph} 
                                    updateGraphs={updateGraphs}
                                    makeToast={triggerToast}
                                    fetchedGraphs={fetchedGraphs}></GraphSelector></div>
                                <div className='mb-5'><CompareTrigger setView={setView}></CompareTrigger></div>
                                <div className='mb-5'><ReproduceHashs repOv={repOv} actions={{
                                    makeToast: triggerToast,
                                }}></ReproduceHashs></div>
                                <div className='mb-5'><PredefinedOverviews></PredefinedOverviews></div>
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
                                {graph?.type === "plot" && <PlotContainer graph={graph} mode={view}></PlotContainer>}
                            </div>
                            <div className='h-full flex flex-col justify-around ml-10'>
                                <div className='mb-5'><VersionAmountIndicator amount={graph?.amount_versions}></VersionAmountIndicator></div>
                                <div className='mb-5'><DatePicker curDate={curDate} setCurDate={setCurDate} dateRanges={dateRanges}></DatePicker></div>
                                <div className='mb-5'><ActionMenu actions={{
                                    removeGraph: removeGraph,
                                    makeToast: triggerToast,
                                    themeControl: themeControl
                                }}></ActionMenu></div>
                            </div>
                        </div>
                    </div>}
            {view === "compare" && <>
           <div className='absolute t-0'><button className='btn'
                    onClick={(e) => {
                        setView("single");
                    }}>BACK</button></div> 
            <div className='h-screen overflow-y-scroll'>
                <div className='flex flex-wrap justify-around pt-20'>
                    {fetchedGraphs.map((g) => {
                        return <PlotContainer graph={g} mode={view}></PlotContainer>
                    })}
                </div> 
            </div> 
            </>
            }
            <input type="checkbox" id="my-modal-3" className="modal-toggle" />
            <div className="modal">
            <div className="modal-box relative">
                <label htmlFor="my-modal-3" className="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
                <h3 className="text-lg font-bold">Predefined overviews</h3>
                <div className='flex flex-wrap'>
                    {overviews.map((o) => {
                        return <PredefinedOverviewItem overview={o}></PredefinedOverviewItem>
                    })}
                </div>
            </div>
            </div>
            <ToastContainer toasts={toasts}></ToastContainer>
        </div>
    )
}