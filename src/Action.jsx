import React, { PropTypes } from 'react';
import moment from 'moment';
import cx from 'classnames';
import last from 'lodash';

import styles from './Action.css';

function Action(props) {
  const { action, unread } = props;

  let lastEnd = 0;
  const typings = [];
  action.typings.forEach((typing, typingIdx) => {
    const start = typing.startDate - action.startDate;
    const end = typing.endDate - action.startDate;
    const width = end - start;

    if (typingIdx !== 0) {
      const lastTyping = action.typings[typingIdx - 1];
      typings.push(
        <div
          className={styles.pause}
          title={`${Math.round((typing.startDate - lastTyping.endDate) / 1000)}s`}
          style={{
            width: start - lastEnd,
          }}
        />
      );
    }

    typings.push(
      <div
        className={cx([
          styles.typing,
          typing.ongoing && styles.typingOngoing,
        ])}
        title={
          `${Math.round((typing.endDate - typing.startDate) / 1000)}s – ` +
          `${moment(typing.startDate).format('HH:mm:ss')} to ` +
          `${moment(typing.endDate).format('HH:mm:ss')}`
        }
        style={{ width }}
      />
    );
    lastEnd = end;
  });

  typings.push(
    <div
      className={styles.pause}
      title={`${Math.round((action.endDate - lastEnd) / 1000)}s`}
      style={{
        width: action.endDate - last(action.typings).endDate,
      }}
    />
  );

  let lastDate = 0;
  const messages = [];

  if (action.messages.length > 0) {
    messages.push(
      <div
        className={styles.pauseIgnored}
        style={{
          width: action.messages[0].timestamp - action.startDate,
        }}
      />
    );
  }

  action.messages.forEach((message, messageIdx) => {
    if (messageIdx !== 0) {
      messages.push(
        <div
          className={styles.pauseIgnored}
          style={{
            width: message.timestamp - lastDate,
          }}
        />
      );
    }

    messages.push(
      <div
        className={styles.message}
        title={moment(message.timestamp).format('HH:mm:ss')}
      />
    );

    lastDate = message.timestamp;
  });

  messages.push(
    <div
      className={styles.pauseIgnored}
      style={{
        width: action.endDate - lastDate,
      }}
    />
  );

  return (
    <div
      className={cx([
        unread && styles.unread,
        styles.action,
      ])}
    >
      <img
        alt={action.user.name}
        src={action.user.thumbSrc}
        className={styles.thumb}
      />
      <div className={styles.info}>
        <div className={styles.infoHead}>
          <div className={styles.name}>{action.user.name}</div>
          {!action.thread.is_canonical &&
            [
              <div className={styles.convIn}>in</div>,
              <div className={styles.convName}>{action.thread.name}</div>,
            ]
          }
        </div>
        <div className={styles.date}>{moment(action.endDate).fromNow()}</div>
        <div className={styles.bar}>
          <div className={styles.typings}>
            {typings}
          </div>
          <div className={styles.messages}>
            {messages}
          </div>
        </div>
      </div>
    </div>
  );
}

Action.propTypes = {
  action: PropTypes.object.isRequired,
  unread: PropTypes.bool.isRequired,
};

export default Action;
