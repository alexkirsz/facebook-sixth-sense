import getUserId from './getUserId';

requireLazy(
  ['MercuryTypingReceiver', 'MercuryThreads', 'ShortProfiles'],
  (MercuryTypingReceiver, MercuryThreads, ShortProfiles) => {
    MercuryTypingReceiver.get().addRetroactiveListener('state-changed', state => {
      const threadIds = Object.keys(state);
      const userIds = threadIds.reduce(
        (res, threadId) => res.concat(state[threadId].map(getUserId)),
        []
      );
      MercuryThreads.get().getMultiThreadMeta(threadIds, threads => {
        ShortProfiles.getMulti(userIds, users => {
          console.log('ok');
          window.postMessage({
            type: 'update',
            threads,
            users,
            state,
          }, '*');
        });
      });
    });
  }
);
