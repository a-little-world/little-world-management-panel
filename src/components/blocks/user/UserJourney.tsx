import {
    Button,
    ButtonSizes,
    Separator,
    StatusMessage,
    StatusTypes,
    Text,
    TextTypes,
} from '@a-little-world/little-world-design-system';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getUserJourneyPath, updateUserJourneyPath } from '../../../api/index';

interface JourneyEntry {
    start_date: string;
    end_date: string | null;
    buckets: string[];
}

const JourneyContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const JourneyHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const JourneyTimeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
  padding-left: 24px;

  &::before {
    content: '';
    position: absolute;
    left: 8px;
    top: 20px;
    bottom: 20px;
    width: 2px;
    background: ${({ theme }) => theme.color.border.secondary};
  }
`;

const JourneyItem = styled.div<{ $hasChange: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 0;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: -20px;
    top: 20px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${({ theme, $hasChange }) =>
        $hasChange ? theme.color.status.success : theme.color.gradient.blue10};
    border: 2px solid ${({ theme }) => theme.color.surface.primary};
  }
`;

const DateRange = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.primary};
  font-size: 14px;
`;

const DateArrow = styled.span`
  color: ${({ theme }) => theme.color.text.secondary};
  font-size: 12px;
`;

const BucketsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const BucketBadge = styled.span<{ $isJourneyBucket?: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 12px;
  background: ${({ theme, $isJourneyBucket }) =>
        $isJourneyBucket
            ? theme.color.gradient.blue10
            : theme.color.surface.secondary};
  color: ${({ theme, $isJourneyBucket }) =>
        $isJourneyBucket ? theme.color.surface.primary : theme.color.text.secondary};
  font-weight: 500;
  font-size: 12px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  background: ${({ theme }) => theme.color.surface.secondary};
  border-radius: 12px;
  gap: 16px;
`;

const StatsRow = styled.div`
  display: flex;
  gap: 24px;
  padding: 12px 0;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StatLabel = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const StatValue = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.primary};
`;

const UserJourney = ({ user }: { user: any }) => {
    const [journeyData, setJourneyData] = useState<JourneyEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [updateSuccess, setUpdateSuccess] = useState(false);

    const fetchJourneyPath = () => {
        setIsLoading(true);
        setError(null);
        getUserJourneyPath({
            userHash: user.hash,
            onSuccess: data => {
                setJourneyData(data.user_journey || []);
                setIsLoading(false);
            },
            onError: err => {
                setError(err?.message || 'Failed to load user journey');
                setIsLoading(false);
            },
        });
    };

    useEffect(() => {
        fetchJourneyPath();
    }, [user.hash]);

    const handleUpdateJourney = () => {
        setIsUpdating(true);
        setUpdateSuccess(false);
        setError(null);
        updateUserJourneyPath({
            userHash: user.hash,
            onSuccess: () => {
                setIsUpdating(false);
                setUpdateSuccess(true);
                fetchJourneyPath();
                setTimeout(() => setUpdateSuccess(false), 3000);
            },
            onError: err => {
                setError(err?.message || 'Failed to update user journey');
                setIsUpdating(false);
            },
        });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const getBucketDisplayName = (bucket: string) => {
        // Clean up bucket names for display
        return bucket
            .replace('journey_v2__', '')
            .replace(/__/g, ' → ')
            .replace(/_/g, ' ');
    };

    const isJourneyBucket = (bucket: string) => {
        return bucket.startsWith('journey_v2__');
    };

    // Check if buckets changed from previous entry
    const bucketsChanged = (index: number) => {
        if (index === 0) return true;
        const prev = journeyData[index - 1].buckets;
        const curr = journeyData[index].buckets;
        return JSON.stringify(prev.sort()) !== JSON.stringify(curr.sort());
    };

    if (isLoading) {
        return (
            <JourneyContainer>
                <Text type={TextTypes.Body1}>Loading user journey...</Text>
            </JourneyContainer>
        );
    }

    // Calculate stats
    const totalPeriods = journeyData.length;
    const uniqueBuckets = new Set(journeyData.flatMap((d: JourneyEntry) => d.buckets)).size;
    const journeyBucketChanges = journeyData.filter((_: JourneyEntry, i: number) => bucketsChanged(i)).length - 1;

    return (
        <JourneyContainer>
            <JourneyHeader>
                <Text tag="h3" type={TextTypes.Heading5}>
                    User Journey Timeline
                </Text>
                <Button
                    size={ButtonSizes.Small}
                    onClick={handleUpdateJourney}
                    disabled={isUpdating}
                >
                    {isUpdating ? 'Updating...' : 'Update Journey'}
                </Button>
            </JourneyHeader>

            <StatusMessage $visible={!!error} $type={StatusTypes.Error}>
                {error}
            </StatusMessage>

            <StatusMessage $visible={updateSuccess} $type={StatusTypes.Success}>
                Journey updated successfully!
            </StatusMessage>

            <Separator />

            {journeyData.length === 0 ? (
                <EmptyState>
                    <Text type={TextTypes.Body1}>No journey data available</Text>
                    <Text type={TextTypes.Body2}>
                        Click "Update Journey" to generate the user's journey from
                        statistics
                    </Text>
                </EmptyState>
            ) : (
                <>
                    <StatsRow>
                        <StatItem>
                            <StatLabel>Time Periods</StatLabel>
                            <StatValue>{totalPeriods}</StatValue>
                        </StatItem>
                        <StatItem>
                            <StatLabel>Unique Buckets</StatLabel>
                            <StatValue>{uniqueBuckets}</StatValue>
                        </StatItem>
                        <StatItem>
                            <StatLabel>State Changes</StatLabel>
                            <StatValue>{journeyBucketChanges}</StatValue>
                        </StatItem>
                    </StatsRow>

                    <JourneyTimeline>
                        {journeyData.map((entry: JourneyEntry, index: number) => (
                            <JourneyItem
                                key={`${entry.start_date}-${index}`}
                                $hasChange={bucketsChanged(index)}
                            >
                                <DateRange>
                                    {formatDate(entry.start_date)}
                                    {entry.end_date && (
                                        <>
                                            <DateArrow>→</DateArrow>
                                            {formatDate(entry.end_date)}
                                        </>
                                    )}
                                </DateRange>
                                <BucketsContainer>
                                    {entry.buckets.map((bucket: string) => (
                                        <BucketBadge
                                            key={bucket}
                                            $isJourneyBucket={isJourneyBucket(bucket)}
                                        >
                                            {getBucketDisplayName(bucket)}
                                        </BucketBadge>
                                    ))}
                                </BucketsContainer>
                            </JourneyItem>
                        ))}
                    </JourneyTimeline>
                </>
            )}
        </JourneyContainer>
    );
};

export default UserJourney;
