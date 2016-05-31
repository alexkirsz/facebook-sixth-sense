import difference from 'lodash/difference';
import intersection from 'lodash/intersection';
import getUserId from './getUserId';

chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {
              hostContains: 'facebook',
            },
          }),
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {
              hostContains: 'messenger',
            },
          }),
        ],
        actions: [
          new chrome.declarativeContent.RequestContentScript({
            js: ['lib/inject.js'],
          }),
        ],
      },
    ]);
  });
});

chrome.runtime.onMessage.addListener(request => {
  const { state: nextState, users: nextUsers, threads: nextThreads } = request;
  chrome.storage.local.get('store', ({ store = '{}' }) => {
    const storeData = JSON.parse(store);
    const {
      state: currState = {},
      users: currUsers = {},
      threads: currThreads = {},
      actions = [],
    } = storeData;

    const currStateKeys = Object.keys(currState);
    const nextStateKeys = Object.keys(nextState);
    const removedKeys = difference(currStateKeys, nextStateKeys);
    const addedKeys = difference(nextStateKeys, currStateKeys);
    const otherKeys = intersection(currStateKeys, nextStateKeys);

    let newActions = [];

    newActions = newActions.concat.apply(newActions, removedKeys.map(key =>
      currState[key].map(fbid => ({
        user: currUsers[getUserId(fbid)],
        thread: currThreads[key],
        type: 'stopped_typing',
        date: Date.now(),
      }))
    ));

    newActions = newActions.concat.apply(newActions, addedKeys.map(key =>
      nextState[key].map(fbid => ({
        user: nextUsers[getUserId(fbid)],
        thread: nextThreads[key],
        type: 'started_typing',
        date: Date.now(),
      }))
    ));

    newActions = newActions.concat.apply(newActions, otherKeys.map(key => {
      const removedUsers = difference(currState[key], nextState[key]);
      const addedUsers = difference(nextState[key], currState[key]);

      return removedUsers.map(fbid => ({
        user: currUsers[getUserId(fbid)],
        thread: currThreads[key],
        type: 'stopped_typing',
        date: Date.now(),
      })).concat(addedUsers.map(fbid => ({
        user: nextUsers[getUserId(fbid)],
        thread: nextThreads[key],
        type: 'started_typing',
        date: Date.now(),
      })));
    }));

    if (newActions.length > 0) {
      chrome.storage.local.set({
        store: JSON.stringify({
          ...storeData,
          users: nextUsers,
          state: nextState,
          threads: nextThreads,
          actions: actions.concat(newActions),
        }),
      }, () => {
        chrome.browserAction.setIcon({
          path: {
            19: 'assets/icon19_active.png',
            38: 'assets/icon38_active.png',
          },
        });
      });
    }
  });
});
