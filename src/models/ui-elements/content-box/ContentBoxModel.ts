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
  Distance = 'map',
  Duration = 'clock',
  Heartrate = 'hr',
  Pace = 'timer',
  Run = 'running',
  Intensity = 'flash',
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
