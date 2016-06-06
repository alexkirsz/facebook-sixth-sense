import getUserId from './getUserId';

requireLazy(
  ['MercuryTypingReceiver', 'MercuryThreads', 'ShortProfiles', 'MercuryThreadInformer'],
  (MercuryTypingReceiver, MercuryThreads, ShortProfiles, MercuryThreadInformer) => {
    MercuryThreadInformer.get().subscribe('messages-received', (m, newMessages) => {
      const threadIds = Object.keys(newMessages);
      const messages = threadIds.reduce(
        (res, threadId) => res.concat(newMessages[threadId]),
        []
      );
      window.postMessage({
        type: 'update-messages',
        messages,
      }, '*');
    });
    MercuryTypingReceiver.get().addRetroactiveListener('state-changed', state => {
      const threadIds = Object.keys(state);
      const userIds = threadIds.reduce(
        (res, threadId) => res.concat(state[threadId].map(getUserId)),
        []
      );
      MercuryThreads.get().getMultiThreadMeta(threadIds, threads => {
        ShortProfiles.getMulti(userIds, users => {
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
