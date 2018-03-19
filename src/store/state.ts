export interface ListItem {
  id: number;
  name: string;
}

export class State {
  public count: number;
  public listItem: ListItem[];
  public activityList: any[];
  public selectedActivityId: number;
  public acitvitySortedLists: {
    byMonths: null,
    byWeeks: null,
    byYears: null
  };

  constructor() {
    this.count = 0;
    this.listItem = [];
    this.activityList = [];
    this.acitvitySortedLists = {
      byMonths: null,
      byWeeks: null,
      byYears: null
    };
    this.selectedActivityId = null;
  }
}

const state = new State();
export default state;
