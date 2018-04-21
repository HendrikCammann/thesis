export enum loadingStatus {
  Loading = 'loading',
  Loaded = 'loaded',
  NotLoaded = 'not loaded',

}

export class LoadingStatus {
  activities: loadingStatus;
  athlete: loadingStatus;

  constructor() {
    this.activities = loadingStatus.NotLoaded;
    this.athlete = loadingStatus.NotLoaded;
  }
}
