import {FilterModel} from '../models/Filter/FilterModel';
import {ClusterType, RunType} from '../store/state';

export function formatDatasetKey(key: string): number {
  return parseInt(key.substring(0, 4));
}

export function selectAndFilterDataset(dataset, filter: FilterModel): any {
  let tempData;
  let startYear;
  let endYear;

  if (filter.timeRange.start) {
    startYear = filter.timeRange.start.getFullYear();
  } else {
    startYear = -1;
  }

  if (filter.timeRange.end) {
    endYear = filter.timeRange.end.getFullYear();
  } else {
    endYear = new Date(new Date().getFullYear());
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
      if (formatDatasetKey(key) >= startYear && formatDatasetKey(key) <= endYear) {
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
  if (elementRunType === filterRunType) {
    return true;
  }
  return false;
}
