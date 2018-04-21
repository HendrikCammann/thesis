export enum loadingStatus {
  Loading = 'loading',
  Loaded = 'loaded',
  NotLoaded = 'not loaded',

}

export class LoadingStatus {
  activities: loadingStatus;

  constructor() {
    this.activities = loadingStatus.NotLoaded;
  }
}
