import { Dropdown, Text } from '@a-little-world/little-world-design-system';
import { createSearchParams, useSearchParams } from 'react-router-dom';
import Tag, { TagAppearance, TagSizes } from '../atoms/Tag';
import { useVideoCallsFilterOptions, useVideoCallsListData } from '../store';
import { get, isEmpty } from 'lodash';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import Pagination from '../atoms/Pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../atoms/Table';
import UserImage from '../atoms/UserImage';
import { formatDate } from '../helpers/date';
import { useGlobalState } from '../store';
import { SelectedUsersSheet } from './../blocks/SelectedUsersSheet';

const StyledDropdown = styled(Dropdown)`
  div[data-radix-popper-content-wrapper] {
    z-index: 20 !important;
  }
`;

const DEFAULT_VIDEO_CALL_FIELDS = [
    { key: 'created_at', label: 'Created At' },
    { key: 'end_time', label: 'End Time' },
    { key: 'u1', label: 'First User' },
    { key: 'u2', label: 'Second User' },
    { key: 'status', label: 'Status' },
    { key: 'both_have_been_active', label: 'Both Active?' },
    { key: 'duration', label: 'Duration' },
];

export function VideoCallsTable({ videoCallsList }) {
    const [fields, setFields] = useState(DEFAULT_VIDEO_CALL_FIELDS);

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        {fields.map(({ key, label }) => (
                            <TableHead key={key} className="w-[100px]">
                                {label}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                {isEmpty(videoCallsList?.results) ? (
                    <Text className="p-4 w-full" center>
                        No results.
                    </Text>
                ) : (
                    <TableBody>
                        {videoCallsList?.results.map(videoCall => (
                            <TableRow key={videoCall.uuid}>
                                {fields.map(({ key }) => {
                                    if (key === 'created_at' || key === 'end_time') {
                                        return (
                                            <TableCell key={videoCall.uuid + key}>
                                                {formatDate(new Date(get(videoCall, key)))}
                                            </TableCell>
                                        );
                                    }

                                    if (key === 'both_have_been_active') {
                                        return <TableCell key={videoCall.uuid + key}>
                                            <Tag
                                                appearance={
                                                    TagAppearance[videoCall.both_have_been_active]
                                                }
                                                size={TagSizes.small}
                                            >
                                                {videoCall.both_have_been_active ? 'Yes' : 'No'}
                                            </Tag>
                                        </TableCell>

                                    }

                                    if (key === 'u1' || key === 'u2') {
                                        const user = get(videoCall, key);
                                        return (
                                            <TableCell key={videoCall.uuid + key}>
                                                <Link to={`/user/${user.id}`}>
                                                    <UserImage
                                                        alt={
                                                            user.profile.first_name +
                                                            ' ' +
                                                            user.profile.second_name
                                                        }
                                                        user={user.profile}
                                                        dimensions={{
                                                            height: 32,
                                                            width: 32,
                                                        }}
                                                    />
                                                </Link>
                                            </TableCell>
                                        );
                                    }


                                    return (
                                        <TableCell key={videoCall.uuid + key}>
                                            {get(videoCall, key)}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                )}
            </Table>
            <SelectedUsersSheet />
        </>
    );
}

const orderingOptions = [{
    value: 'created_at',
    label: '(Asc) Created At',
}, {
    value: '-created_at',
    label: '(Desc) Created At',
}, {
    value: 'end_time',
    label: '(Asc) End Time',
}, {
    value: '-end_time',
    label: '(Desc) End Time',
}]

function VideoCalls() {
    let [searchParams, setSearchParams] = useSearchParams();
    const list = searchParams.get('list') || 'all';
    const orderBy = searchParams.get('order_by') || '-date_joined';

    const { filterOptions, isLoading: filtersLoading } = useVideoCallsFilterOptions();
    const { videoCallsList, isLoading: videoCallsLoading } = useVideoCallsListData(
        createSearchParams(searchParams)
    );

    const changeList = (list) => {
        setSearchParams(createSearchParams({ ...searchParams, list }));
    };

    if (filtersLoading) {
        return 'Loading filters...';
    }

    return (
        <>
            <div className="w-full flex items-center w-full gap-4 p-4 justify-between flex-wrap">
                {/* Assuming you have filter options similarly set up like in Users component */}
                <StyledDropdown
                    value={list}
                    options={filterOptions.lists.map(({ name, description }) => ({
                        value: name,
                        label: description,
                    }))}
                    onValueChange={val => changeList(val)}
                    placeholder="Select a video calls list..."
                    cannotError
                />
                <StyledDropdown
                    value={orderBy}
                    options={orderingOptions}
                    onValueChange={val => setSearchParams(createSearchParams({ ...searchParams, order_by: val }))}
                    placeholder="Select a user list..."
                    cannotError
                />

                <Pagination list={videoCallsList} />
            </div>

            {videoCallsLoading ? (
                <div className="p-4 text-center">Loading video calls list '{list}'...</div>
            ) : (
                <VideoCallsTable videoCallsList={videoCallsList} />
            )}
        </>
    );
}

export default VideoCalls;
