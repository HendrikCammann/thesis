export interface ListItem {
  id: number;
  name: string;
}

export class State {
  public count: number;
  public listItem: ListItem[];
  public activityList: any[];
  public selectedActivityId: number;

  constructor() {
    this.count = 0;
    this.listItem = [];
    this.activityList = [];
    this.selectedActivityId = null;
  }
}

const state = new State();
export default state;
