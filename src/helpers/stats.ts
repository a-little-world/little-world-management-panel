/**
 * Consecutive API bucket rows merged into one funnel step (single cumulative subtraction).
 * `label` is the row title; segment labels still come from bucketDescriptionMap via bucket keys.
 */
export type FunnelMergeGroup = {
  buckets: string[];
  label: string;
};

type RawBucket = { name: string; count: number };

type MergedFunnelRow = {
  name: string;
  count: number;
  __mergeMeta: {
    bucketKeys: string[];
    segmentCounts: { bucketKey: string; count: number }[];
  };
};

type FunnelBucketRow = RawBucket | MergedFunnelRow;

function isMergedFunnelRow(row: FunnelBucketRow): row is MergedFunnelRow {
  return '__mergeMeta' in row && row.__mergeMeta != null;
}

function mergeConsecutiveBuckets(
  data: RawBucket[],
  mergeGroups: FunnelMergeGroup[] = [],
): FunnelBucketRow[] {
  if (!mergeGroups.length || !data?.length) return data;
  let rows: FunnelBucketRow[] = data.slice();
  for (const group of mergeGroups) {
    const { buckets, label } = group;
    const n = buckets.length;
    if (n < 2) continue;
    for (let i = 0; i <= rows.length - n; i++) {
      const match = buckets.every((b, j) => {
        const row = rows[i + j];
        return !isMergedFunnelRow(row) && row?.name === b;
      });
      if (!match) continue;
      const slice = rows.slice(i, i + n) as RawBucket[];
      const totalCount = slice.reduce((s, r) => s + r.count, 0);
      const merged: MergedFunnelRow = {
        name: label,
        __mergeMeta: {
          bucketKeys: buckets,
          segmentCounts: buckets.map((b, j) => ({
            bucketKey: b,
            count: slice[j].count,
          })),
        },
        count: totalCount,
      };
      rows.splice(i, n, merged);
      break;
    }
  }
  return rows;
}

export type FunnelBarSegment = {
  label: string;
  count: number;
  fraction: number;
};

export type FunnelBarRow = {
  name: string;
  count: number;
  longDescription: string;
  percentage: number;
  description?: string;
  segments?: FunnelBarSegment[];
};

export function modifyData(
  data: RawBucket[],
  bucketDescriptionMap: Record<string, string> = {},
  options: { mergeGroups?: FunnelMergeGroup[] } = {},
): FunnelBarRow[] {
  const { mergeGroups = [] } = options;
  const mergedInput = mergeConsecutiveBuckets(data, mergeGroups);

  const modifiedData: FunnelBarRow[] = [];
  const topCount = mergedInput[0].count;
  let currentCount = topCount;

  mergedInput.forEach((item, index) => {
    if (index !== 0) {
      currentCount -= item.count;
    }
    const percentage = Math.round((currentCount / topCount) * 100);
    const displayName = Object.prototype.hasOwnProperty.call(
      bucketDescriptionMap,
      item.name,
    )
      ? bucketDescriptionMap[item.name]
      : item.name;

    let longDescription = `${index !== 0 ? '-' : ''} ${item.name} (${
      item.count
    }) = ${currentCount} (${percentage}%)`;

    if (isMergedFunnelRow(item)) {
      const parts = item.__mergeMeta.segmentCounts.map(s => {
        const lbl = bucketDescriptionMap[s.bucketKey] ?? s.bucketKey;
        return `${lbl} (${s.count})`;
      });
      longDescription = `${index !== 0 ? '-' : ''} ${parts.join(' · ')} = ${currentCount} (${percentage}%)`;
    }

    const row: FunnelBarRow = {
      name: displayName,
      count: currentCount,
      longDescription,
      percentage,
    };

    if (isMergedFunnelRow(item)) {
      const totalSeg = item.__mergeMeta.segmentCounts.reduce(
        (s, x) => s + x.count,
        0,
      );
      row.segments = item.__mergeMeta.segmentCounts.map(s => ({
        label: bucketDescriptionMap[s.bucketKey] ?? s.bucketKey,
        count: s.count,
        fraction: totalSeg > 0 ? s.count / totalSeg : 0,
      }));
      row.description = row.segments
        .map(s => `${s.label}: ${s.count} (${s.fraction.toFixed(2)}%)`)
        .join(' · ');
    }

    modifiedData.push(row);
  });
  return modifiedData;
}

export function modifyDataToPercentages(data: RawBucket[]) {
  const modifiedData: Array<Record<string, unknown>> = [];
  const topCount = data.find(item => item.name === 'all')?.count;
  if (topCount == null) return [];
  //console.log("TOP COUNT", topCount);
  var summed = 0;
  data.forEach((item, index) => {
    //console.log("ITEM", item);
    if (item.name !== 'all' && item.name !== 'match_journey_v2__all') {
      modifiedData.push({
        name: item.name,
        count: parseFloat(((item.count / topCount) * 100).toFixed(2)),
        description: `${item.name} (${item.count}) = ${Math.round(
          (item.count / topCount) * 100,
        )}%`,
      });

      summed += item.count;
    }
  });

  modifiedData.push({
    name: 'all',
    count: parseFloat((((topCount - summed) / topCount) * 100).toFixed(2)),
    description: `sum (${summed}) = ${Math.round((summed / topCount) * 100)}%`,
  });

  //console.log("MODIFIED DATA", modifiedData[modifiedData.length - 1]);

  return modifiedData;
}

export function modifyDataToPercentagesNonCummulative(data: RawBucket[]) {
  const modifiedData: unknown[] = [];
  const topCount = data[0].count;
  let currentCount = topCount;
  let lastName = '';

  data.forEach((item, index) => {
    if (index !== 0) {
      currentCount -= item.count;
    }
  });
}
