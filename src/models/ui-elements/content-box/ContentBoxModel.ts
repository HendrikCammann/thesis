import {ClusterTypes} from '../../State/StateModel';

export class ContentBoxModel {
  value: string | number;
  label: string | number;
  icon: ContentBoxIcons;
  isActive: boolean;

  constructor(value, label, icon, isActive) {
    this.value = value;
    this.label = label;
    this.icon = icon;
    this.isActive = isActive;
  }
}

export enum ContentBoxIcons {
  Distance = 'distance',
  Duration = 'clock',
  Heartrate = 'heart',
  Pace = 'pace',
  Run = 'running',
  Competition = 'trophy',
  Marathon = 'marathon',
  Halfmarathon = 'halfMarathon',
  Tenk = 'tenK',
}

export function getContentBoxIcon(type: ClusterTypes) {
  switch (type) {
    case ClusterTypes.Marathon:
      return ContentBoxIcons.Marathon;
    case ClusterTypes.Halfmarathon:
      return ContentBoxIcons.Halfmarathon;
    case ClusterTypes.TenK:
      return ContentBoxIcons.Tenk;
  }
}
