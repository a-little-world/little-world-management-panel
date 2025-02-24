export function modifyData(data, bucketDescriptionMap={}) {
  const modifiedData = [];
  const topCount = data[0].count;
  let currentCount = topCount;
  let lastName = '';

  data.forEach((item, index) => {
    if (index !== 0) {
      currentCount -= item.count;
    }
    const percentage = Math.round((currentCount / topCount) * 100);
    modifiedData.push({
      name: bucketDescriptionMap.hasOwnProperty(item.name) ? bucketDescriptionMap[item.name] : item.name,
      count: currentCount,
      longDescription: `${index !== 0 ? '-' : ''} ${item.name} (${
        item.count
      }) = ${currentCount} (${percentage}%)`,
      percentage,
    });
  });
  return modifiedData;
}

export function modifyDataToPercentages(data) {
  const modifiedData = [];
  const topCount = data.find(item => item.name === 'all').count;
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

export function modifyDataToPercentagesNonCummulative(data) {
  const modifiedData = [];
  const topCount = data[0].count;
  let currentCount = topCount;
  let lastName = '';

  data.forEach((item, index) => {
    if (index !== 0) {
      currentCount -= item.count;
    }
  });
}