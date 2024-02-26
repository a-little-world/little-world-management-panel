import React, { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { useParams } from 'react-router-dom';
import { UserDetailsCard } from './AdminPanel.jsx';
import { getCookiesAsObject } from '../utils';
import { HeroiconsSolidMail } from '../AdminPanelV2.jsx';

export function DevkitSelector(){
    const fetcher = (...args) => fetch(...args).then(res => res.json());
    const { data: devKitEnabled, isLoading } = useSWR("/api/admin/devkit/enabled/", fetcher);
    
    if (isLoading) return null
    if (devKitEnabled?.enabled) 
    return <a href={`/matching/devkit/`} className="flex flex-col items-center bg-green-500 p-8 rounded-lg shadow-lg m-4 h-64 w-64">
        <HeroiconsSolidMail className="h-16 w-16 text-white mb-2"/>
        <h2 className="text-white text-2xl">dev-kit</h2>
      </a>
    return null
}