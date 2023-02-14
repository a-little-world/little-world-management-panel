import Plot from 'react-plotly.js';
import { Table } from "./views/styles"

export const StatsDashboard = ({
    series,
    staticStats,
    combinedGraphs
}) => {
    console.log("COMBINED GRAPHS", combinedGraphs)
    return (
        <><h1> Little World Stats (Beta)</h1>
        <div>(updated hourly)</div>
        <h1>Count statistics</h1>
        <Table>
            <thead>
                    <tr>
                        <th>Registered Users</th>
                        <th>Users Matched</th>
                        <th>Total Matches</th>
                    </tr>
            </thead>
        <tbody>
            <tr>
                <td>{staticStats?.total_amoount_of_users}</td>
                <td>{staticStats?.total_matches}</td>
                <td>{staticStats?.total_individual_matches}</td>
            </tr>
        </tbody>
        </Table>
        <h1>Time Series</h1>
        {true && Object.keys(series).map(stat => {
            return <>
                <Plot
                data={[
                {type: 'bar', 
                    x: series[stat].map((elem) => elem.x), 
                    y: series[stat].map((elem) => elem.y)},
                ]}
                layout={ {width: 600, height: 400, title: stat} }
            />
            </>
        })}
        <h1>Combined Graphs</h1>
        {combinedGraphs.map((graph, index) => {
            console.log("GRAPH", graph)
            return <><Plot 
                data={graph.data} 
                layout={{width: 600, height: 400, ...graph.layout}}
            /></>
        })}
        <h1>Absolute charts</h1>
        {staticStats?.charts?.map((chart, index) => {
            console.log("CHART", chart)
            return <><Plot 
                data={chart.data} 
                layout={{width: 600, height: 400, ...chart.layout}}
            /></>
        })}
        </>
    )
}