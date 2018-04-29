export class MutationTypes {
  public static SET_LOADING_STATUS = 'SET_LOADING_STATUS';
  public static SET_ATHLETE_LOADING_STATUS = 'SET_ATHLETE_LOADING_STATUS';


  public static GET_ATHLETE = '[Strava-API] GET_ATHLETE';

  public static GET_ACTIVITIES = '[Strava-API] GET_ACTIVITIES';
  public static GET_ACTIVITY = '[Strava-API] GET_ACTIVITY';
  public static GET_ACTIVITY_STREAMS = '[Strava-API] GET_ACTIVITY_STREAMS';
  public static GET_ACTIVITY_ZONES = '[Strava-API] GET_ACTIVITY_ZONES';

  public static GET_ACTIVITIES_FROM_JSON = '[Local] GET_ACTIVITIES_FROM_JSON';

  public static SET_SELECTED_ACTIVITY = '[Store] SET_SELECTED_ACTIVITY';
  public static SET_SELECTED_RUNTYPE = '[Store] SET_SELECTED_RUNTYPE';
  public static SET_SELECTED_CLUSTER = '[Store] SET_SELECTED_CLUSTER';
  public static SET_FILTERBY_TYPE = '[Store] SET_FILTERBY_TYPE';
  public static SET_TIME_RANGE = '[Store] SET_TIME_RANGE';

  public static REMOVE_SELECTED_TRAINING_CLUSTER = '[Store] REMOVE_SELECTED_TRAINING_CLUSTER';
  public static ADD_SELECTED_TRAINING_CLUSTER = '[Store] ADD_SELECTED_TRAINING_CLUSTER';

  public static GET_RACE = '[Strava-API] GET_RACE';
}
