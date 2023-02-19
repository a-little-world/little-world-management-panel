import Plot from 'react-plotly.js';


export const GraphDashboard = ({ graph }) => {
    console.log("Graph", graph);

    var curTime = Date.parse(graph?.time);
    console.log("1curTime", curTime)
    curTime.setMilliseconds(0);
    curTime = curTime.toISOString().slice(0, 19);
    console.log("curTime", curTime)

    return (
        <>
        <h2>saved at: {graph?.time}</h2>
        <Plot
            data={graph?.data?.data}
            layout={ {width: 600, height: 400, ...graph?.data?.layout} }
            />
        <h3>older versions</h3>
        Load from before:
        <input type="datetime-local" id="meeting-time"
            name="meeting-time" value={curTime}></input> 
        </>
    )
}