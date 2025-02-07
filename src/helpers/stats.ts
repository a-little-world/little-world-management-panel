export function modifyData(data) {
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
      name: item.name,
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
  var summed = 0;
  data.forEach((item, index) => {
    if (item.name !== 'all') {
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

  return modifiedData;
}
