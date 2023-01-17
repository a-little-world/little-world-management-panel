import Plot from 'react-plotly.js';
import { Table } from "./views/styles"

export const StatsDashboard = ({
    series,
    staticStats
}) => {
    return (
        <><h1> Little World Stats (Beta)</h1>
        <div>(updated hourly)</div>
        <Table>
            <thead>
                    <tr>
                        <th>Absolute Registered Users</th>
                        <th>Absolute matches made</th>
                        <th>Count users currently online</th>
                    </tr>
            </thead>
        <tbody>
            <tr>
                <td>{staticStats?.total_amoount_of_users}</td>
                <td>{staticStats?.total_matches}</td>
                <td>TODO</td>
            </tr>
        </tbody>
        </Table>
        {Object.keys(series).map(stat => {
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
        </>
    )
}