import { dataFetcher } from '../../store';
import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';

export function SendDynamicTemplateView() {
    const { emailTemplateName } = useParams();
    const {
        data: dynamicEmail,
    } = useSWR(`/api/matching/emails/dynamic_templates/${emailTemplateName}/`, dataFetcher, {});
    let [searchParams, setSearchParams] = useSearchParams();

    return <div dangerouslySetInnerHTML={{ __html: dynamicEmail?.template }} />;
}