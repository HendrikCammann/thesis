export interface PositionModel {
  x: number;
  y: number;
}

// BARCHART
export class BarChartItem {
  startX: number;
  startY: number;
  endX: number;
  endY: number;

  constructor(startX, startY, endX, endY) {
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;
  }
}
