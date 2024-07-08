import React from 'react';
import 'chartjs-adapter-date-fns';
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../shadcnui/ui/chart"

const chartData = [
    { month: "January", desktop: 186, mobile: 80 },
    { month: "February", desktop: 305, mobile: 200 },
    { month: "March", desktop: 237, mobile: 120 },
    { month: "April", desktop: 73, mobile: 190 },
    { month: "May", desktop: 209, mobile: 130 },
    { month: "June", desktop: 214, mobile: 140 },
]


export function DataGraph({
    data,
    dataLabel
}) {

    const chartConfig = {
        count: {
            label: dataLabel,
            color: "#2563eb",
        }
    };

    return <ChartContainer config={chartConfig} className='min-h-[400px] mb-10'>
        <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
                dataKey="date"
                tickLine={true}
                tickMargin={2}
                axisLine={true}
                angle={-20}
                textAnchor='end'
                tickFormatter={(value) => value.slice(0, 10)}
            />
            <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="count" fill="var(--color-desktop)" radius={8} />
        </BarChart>
    </ChartContainer>
}

export default DataGraph;