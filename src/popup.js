import React from 'react';
import ReactDOM from 'react-dom';
import groupBy from 'lodash/groupBy';

import App from './App';

const container = document.getElementById('container');

// Aggregate typings that occur this close (in ms) to each other.
const AGGREGATE_TIME = 30 * 60 * 1000;

// Ignore typings that last longer than this duration (in ms). They are usually
// caused  by the user closing their browser or the computer going to sleep
// while someone is typing.
const IGNORE_LIMIT = 10 * 60 * 1000;

function aggregate(actions) {
  const byUserThread = groupBy(
    actions,
    a => `${a.thread.thread_id}/${a.user.id}`
  );

  const aggregatedActions = [];
  Object.keys(byUserThread).forEach(key => {
    const utActions = byUserThread[key];

    let typings = [];
    let startDate = null;
    for (const action of utActions) {
      if (action.type === 'stopped_typing') {
        typings.push({
          startDate,
          endDate: action.date,
        });
        startDate = null;
      } else {
        startDate = action.date;
      }
    }
    if (startDate !== null) {
      typings.push({
        startDate,
        endDate: Date.now(),
        ongoing: true,
      });
    }

    typings = typings.filter(t => t.endDate - t.startDate < IGNORE_LIMIT);

    if (typings.length === 0) {
      return;
    }

    const { user, thread } = utActions[0];

    let prevAction = null;
    for (const typing of typings) {
      if (
        prevAction !== null &&
        typing.startDate - prevAction.endDate < AGGREGATE_TIME
      ) {
        prevAction.typings.push(typing);
        prevAction.endDate = typing.endDate;
      } else {
        prevAction = {
          user,
          thread,
          startDate: typing.startDate,
          endDate: typing.endDate,
          typings: [typing],
        };
        aggregatedActions.push(prevAction);
      }
    }
  });

  aggregatedActions.sort((a, b) => b.endDate - a.endDate);
  return aggregatedActions;
}

function render(store) {
  const { actions, lastReadDate = 0 } = store;

  const aggregatedActions = aggregate(actions);

  ReactDOM.render(
    <App
      actions={aggregatedActions}
      lastReadDate={lastReadDate}
      onClear={() =>
        chrome.storage.local.remove('store', () =>
          render({ actions: [], lastReadDate: 0 })
        )
      }
    />
  , container);
}

chrome.storage.local.get('store', ({ store = '{}' }) => {
  const storeData = JSON.parse(store);
  render(storeData);
  chrome.storage.local.set({
    store: JSON.stringify({ ...storeData, lastReadDate: Date.now() }),
  });
});

chrome.tabs.query({
  active: true,
  lastFocusedWindow: true,
}, () => {
  chrome.browserAction.setIcon({
    path: {
      19: 'assets/icon19_inactive.png',
      38: 'assets/icon38_inactive.png',
    },
  });
});
