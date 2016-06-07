import React, { PropTypes } from 'react';
import moment from 'moment';
import cx from 'classnames';

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
        className={styles.typing}
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

  return (
    <div
      className={cx([
        unread && styles.unread,
        styles.action,
      ])}
    >
      <a
        className={styles.actionLink}
        href={action.threadUrl}
        target="_blank"
      >
        <img
          alt={action.user.name}
          src={action.user.thumbSrc}
          className={styles.thumb}
        />
        <div className={styles.info}>
          <div className={styles.infoHead}>
            <div className={styles.name}>
              <a href={action.user.uri} target="_blank">{action.user.name}</a>
            </div>
            {!action.thread.is_canonical &&
              [
                <div className={styles.convIn}>in</div>,
                <div className={styles.convName}>{action.thread.name}</div>,
              ]
            }
          </div>
          <div className={styles.date}>{moment(action.endDate).fromNow()}</div>
          <div className={styles.typings}>
            {typings}
          </div>
        </div>
      </a>
    </div>
  );
}

Action.propTypes = {
  action: PropTypes.object.isRequired,
  unread: PropTypes.bool.isRequired,
};

export default Action;
