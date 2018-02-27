import strava from 'strava-v3';
let activities: any[] = [];

/**
 * gets an athlete
 */

export function getAthlete(athletheId, accessToken) {
  strava.athlete.get({
    access_token: accessToken,
    id: athletheId
  }, function(err, payload, limits) {
    if (!err) {
      console.log('athlete', payload);
    }
    else {
      console.log(err);
    }
    if (limits) {
      console.log(limits);
    }
  });
}


/**
 * gets a single activity with all information
 */

export function getActivity(activityId, accessToken, cb) {
  strava.activities.get({
    access_token: accessToken,
    id: activityId
  }, function (err, payload, limits) {
    if (!err) {
      cb(payload);
    }
    else {
      console.log(err);
    }
    if (limits) {
      console.log(limits);
    }
  });
}


/**
 * gets all activities paginated
 */

export function getActivityPages(page, per_page, accessToken, cb) {
  strava.athlete.listActivities({
    access_token: accessToken,
    page: page,
    per_page: per_page
  }, function (err, payload, limits) {
    if (!err) {
      activities = [...activities, ...payload];
      if (payload.length === per_page) {
        page++;
        getActivityPages(page, per_page, accessToken, cb);
      } else {
        // console.log(polyline.decode(activities[0].map.summary_polyline));
        cb(activities);
      }
    }
    else {
      console.log(err);
    }
    if (limits) {
      console.log(limits);
    }
  });
}


/**
 * gives all heartrate/pace etc. zones for a single activity
 */

export function getZonesForActivity(activityId, accessToken) {
  strava.activities.listZones({
    access_token: accessToken,
    id: activityId
  }, function (err, payload, limits) {
    if (!err) {
      console.log('zones', payload);
    }
    else {
      console.log(err);
    }
    if (limits) {
      console.log(limits);
    }
  });
}


/**
 * gives all heartrate/pace etc. values for a single activity
 */

export function getStreamsForActivity(activityId, streams, accessToken, cb) {
  strava.streams.activity({
    access_token: accessToken,
    id: activityId,
    types: streams
  }, function (err, payload, limits) {
    if (!err) {
      console.log('streams', payload);
      cb(payload);
    }
    else {
      console.log(err);
    }
    if (limits) {
      console.log(limits);
    }
  });
}
