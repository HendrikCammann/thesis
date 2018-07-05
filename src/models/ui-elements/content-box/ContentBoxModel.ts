import {ClusterTypes} from '../../State/StateModel';

export class ContentBoxModel {
  value: string | number;
  label: string | number;
  icon: ContentBoxIcons;
  isActive: boolean;
  information?: string;

  constructor(value, label, icon, isActive, information) {
    this.value = value;
    this.label = label;
    this.icon = icon;
    this.isActive = isActive;
    this.information = information;
  }
}

export enum ContentBoxIcons {
  Distance = 'distance',
  Duration = 'time',
  Heartrate = 'hr',
  Pace = 'pace',
  Run = 'run',
  Intensity = 'intensity',
  Competition = 'trophy',
  Marathon = 'marathon',
  Halfmarathon = 'halfMarathon',
  Restday = 'restday',
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
