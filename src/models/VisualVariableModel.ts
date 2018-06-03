export enum CategoryOpacity {
  Hidden = 0,
  Active = 0.7,
  Full = 1,
  Inactive = 0.1,
  Background = 0.05,
}

export enum CategoryConnectingOpacity {
  Hidden = 0,
  Active = 0.15,
  SingleActive = 0.3,
  Inactive = 0.05,
  ActivityArea = 0.1,
}

export enum Colors {
  Black = '#4f5b64',
  LightGray = '#adb7bf',
  White = '#FFFFFF',
}

export enum CategoryColors {
  Run = '#9013FE',
  Competition = '#faa628',
  LongRun = '#3C0071',
  ShortIntervals = '#EC407A',
  Uncategorized = 'green',
  Default = '#4f5b64'
}

export enum ZoneColors {
  Pace = '#43b3e6',
  Heartrate = '#ec407a',
}

export enum BarChartSizes {
  BarHeight = 2,
  OffsetBarHeight = 1,
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

export class ChartConstraints {
  padding: number;
  width: number;
  height: number;

  constructor(padding, width, height) {
    this.padding = padding;
    this.width = width;
    this.height = height;
  }
}
