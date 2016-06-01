import React from 'react';
import ReactDOM from 'react-dom';
import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';
import sortedIndexBy from 'lodash/sortedIndexBy';

import App from './App';
import getUserId from './getUserId';

const container = document.getElementById('container');

// Aggregate typings that occur this close (in ms) to each other.
const AGGREGATE_TIME = 30 * 60 * 1000;

// Ignore typings that last longer than this duration (in ms). They are usually
// caused  by the user closing their browser or the computer going to sleep
// while someone is typing.
const IGNORE_LIMIT = 10 * 60 * 1000;

// Consider messages this close (in ms) to the last stopped_typing event to be
// part of the overall action.
const MESSAGE_LATENCY = 1 * 60 * 1000;

function actionToThreadUser(a) {
  return `${a.thread.thread_id}/${a.user.id}`;
}

function aggregate(actions, messages) {
  const sortedMessages = sortBy(messages, 'timestamp');

  const actionsByUserThread = groupBy(actions, actionToThreadUser);
  const messagesByUserThread = groupBy(
    sortedMessages,
    m => `${m.thread_id}/${getUserId(m.author)}`
  );

  const aggregatedActions = [];
  Object.keys(actionsByUserThread).forEach(key => {
    const utActions = actionsByUserThread[key];

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

  const aggregatedActionsWithMessages = aggregatedActions.map(action => {
    const threadMessages = messagesByUserThread[actionToThreadUser(action)];
    if (!threadMessages) {
      return {
        ...action,
        messages: [],
      };
    }
    const firstMessageIndex = sortedIndexBy(
      threadMessages,
      { timestamp: action.startDate },
      'timestamp'
    );
    const lastMessageIndex = sortedIndexBy(
      threadMessages,
      { timestamp: action.endDate + MESSAGE_LATENCY },
      'timestamp'
    );
    return {
      ...action,
      messages: threadMessages.slice(firstMessageIndex, lastMessageIndex),
    };
  });

  aggregatedActionsWithMessages.sort((a, b) => b.endDate - a.endDate);
  return aggregatedActionsWithMessages;
}

function render(store) {
  const { actions, messages, lastReadDate = 0 } = store;

  const aggregatedActions = aggregate(actions, messages);

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
