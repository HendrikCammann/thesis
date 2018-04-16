export enum CategoryOpacity {
  Hidden = 0,
  Active = 0.7,
  Inactive = 0.15
}

export enum CategoryConnectingOpacity {
  Hidden = 0,
  Active = 0.15,
  SingleActive = 0.3,
  Inactive = 0.05
}

export enum CategoryColors {
  Run = '#1280B2',
  Competition = '#B2AB09',
  LongRun = '#00AFFF',
  ShortIntervals = '#FF1939',
  Uncategorized = 'gray',
  Default = 'black'
}

export class CanvasConstraints {
  padding: number;
  width: number;
  height: number;
  clusterMaxMargin: number;
  barMargin: number;

  constructor(padding, width, height, clusterMargin, barMargin) {
    this.padding = padding;
    this.width = width;
    this.height = height;
    this.clusterMaxMargin = clusterMargin;
    this.barMargin = barMargin;
  }
}
