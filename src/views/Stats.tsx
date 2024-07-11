import React, { useState } from 'react';
import styled from 'styled-components';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../shadcnui/ui/tabs";

import { Dropdown, Text } from '@a-little-world/little-world-design-system';
import { RangedDataGraph } from '../blocks/RangedDataGraph';
import { BarChartTimeRanged } from '../blocks/BarChartTimeRanged';


function Stats() {

    const [tab, setTab] = useState("graphs");

    const onTabChange = (value: string) => {
        setTab(value);
    };

    return (
        <div className="flex flex-col justify-center items-center h-screen w-full relative">
            <Tabs value={tab} onValueChange={onTabChange} className="flex flex-col w-full h-full">
                <TabsList>
                    <TabsTrigger value="graphs">Graphs</TabsTrigger>
                    <TabsTrigger value="charts">Charts</TabsTrigger>
                    <TabsTrigger value="numbers">Numbers</TabsTrigger>
                </TabsList>
                {tab === "graphs" && <TabsContent value="graphs" className='flex flex-col content-center justify-center items-center flex-grow'>
                    <RangedDataGraph />
                </TabsContent>}
                {tab === "charts" && <TabsContent value="charts" className='flex flex-col content-center justify-center items-center flex-grow'>
                    <BarChartTimeRanged />
                </TabsContent>}
                {tab === "numbers" && <TabsContent value="numbers" className='flex flex-col content-center justify-center items-center flex-grow'>
                    Hello?
                </TabsContent>}
            </Tabs>
        </div>
    )
}

export default Stats;
