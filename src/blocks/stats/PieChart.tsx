import { Text } from '@a-little-world/little-world-design-system';
import { fill } from 'lodash';
import { TrendingUp } from 'lucide-react';
import * as React from 'react';
import { Label, Legend, Pie, PieChart as PieChartRechart } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../atoms/Card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '../../atoms/Chart';

export function PieChart({
  title = 'Pie Chart',
  description = 'This is a pie chart showing the counts of visitors for the last 6 months',
  chartData = [{ tag: 'count_name', count: 8, fill: 'var(--color-chrome)' }],
  label = 'Sign-Ups',
  chartConfig = {
    count: {
      label: 'Count',
    },
    count_name: {
      label: 'Count Name',
      color: 'hsl(var(--chart-1))',
    },
  },
  extraHeader = null,
}) {
  const totalVisitors = chartData.reduce((acc, { count }) => acc + count, 0);

  console.log('TOTAL VISITORS', totalVisitors, chartData);
  const renderLegend = props => {
    const { payload } = props;

    console.log({ payload });
    return (
      <ul className="flex flex-col gap-2">
        {payload.map((entry, index) => (
          <Text bold center tag="li" key={`item-${index}`} color={entry.color}>
            {`${Math.floor(entry.payload.percent * 100)}% ${entry.value} (${
              entry.payload.count
            })`}
          </Text>
        ))}
      </ul>
    );
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {extraHeader}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[500px]"
        >
          <PieChartRechart width={500}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />

            <Legend content={renderLegend} />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="tag"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalVisitors.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {label}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChartRechart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
