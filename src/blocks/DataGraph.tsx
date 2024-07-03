import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, TimeScale, Title, Tooltip, Legend } from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(LineElement, PointElement, LinearScale, TimeScale, Title, Tooltip, Legend);

const DataGraph = ({ data }) => {
    const chartData = {
        labels: data.map(item => new Date(item.date)),
        datasets: [
            {
                label: 'User Count Over Time',
                data: data.map(item => item.count),
                fill: false,
                borderColor: 'rgba(75,192,192,1)',
                tension: 0.1
            }
        ]
    };

    const options = {
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'day'
                },
                title: {
                    display: true,
                    text: 'Date'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Count'
                },
                min: 0
            }
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return `Count: ${context.raw}`;
                    }
                }
            }
        },
        maintainAspectRatio: false
    };

    return (
        <div style={{ width: '600px', height: '400px' }}>
            <Line data={chartData} options={options} />
        </div>
    );
};

export default DataGraph;