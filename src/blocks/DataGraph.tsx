import React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../shadcnui/ui/chart"

export function DataGraph({
    data,
    dataLabel
}) {

    const chartConfig = {
        count: {
            label: dataLabel,
            color: "#2563eb",
        },
        date: {
            label: "Date",
            color: "#000",
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
                content={<ChartTooltipContent />}
            />
            <Bar dataKey="count" fill="var(--color-desktop)" radius={8} />
        </BarChart>
    </ChartContainer>
}

export default DataGraph;