import {FilterModel} from '../models/Filter/FilterModel';
import {ClusterType, RunType} from '../store/state';

export function formatDatasetKey(key: string): number {
  return parseInt(key.substring(0, 4));
}

export function selectAndFilterDataset(dataset, filter: FilterModel): any {
  let tempData;
  let startDate;
  let endDate;

  if (filter.timeRange.start) {
    startDate = filter.timeRange.start;
  } else {
    startDate = new Date(1970);
  }

  if (filter.timeRange.end) {
    endDate = filter.timeRange.end;
  } else {
    endDate = new Date(new Date());
  }

  switch (filter.selectedCluster) {
    case ClusterType.All:
      tempData = dataset.all;
      break;
    case ClusterType.ByYears:
      tempData = dataset.byYears;
      break;
    case ClusterType.ByMonths:
      tempData = dataset.byMonths;
      break;
    case ClusterType.ByWeeks:
      tempData = dataset.byWeeks;
      break;
  }

  let returnData = [];
  if (filter.showEverything) {
    for (let key in tempData) {
      returnData.unshift(tempData[key]);
    }
  } else {
    for (let key in tempData) {
      if (tempData[key].rangeDate >= startDate && tempData[key].rangeDate <= endDate) {
        returnData.unshift(tempData[key]);
      }
    }
  }

  return returnData;
}

export function checkIfMatchesRunType(filterRunType: RunType, elementRunType: RunType, excludeAll: boolean): boolean {
  if (!excludeAll) {
    if (filterRunType === RunType.All) {
      return true;
    }
  }
  return (elementRunType === filterRunType);
}
