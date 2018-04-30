export enum CategoryOpacity {
  Hidden = 0,
  Active = 0.7,
  Inactive = 0.15
}

export enum CategoryConnectingOpacity {
  Hidden = 0,
  Active = 0.15,
  SingleActive = 0.3,
  Inactive = 0.05,
  ActivityArea = 0.1,
}

export enum CategoryColors {
  Run = '#43b3e6',
  Competition = '#faa628',
  LongRun = '#273866',
  ShortIntervals = '#ec407a',
  Uncategorized = '#9D9D9D',
  Default = 'black'
}

export class CanvasConstraints {
  padding: number;
  width: number;
  height: number;
  clusterMaxMargin: number;
  barMargin: number;
  barHeight: number;

  constructor(padding, width, height, clusterMargin, barMargin, barHeight) {
    this.padding = padding;
    this.width = width;
    this.height = height;
    this.clusterMaxMargin = clusterMargin;
    this.barMargin = barMargin;
    this.barHeight = barHeight;
  }
}
