import React, { PropTypes } from 'react';

import Action from './Action';
import styles from './App.css';

function Popup(props) {
  const { lastReadDate, actions, onClear } = props;
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img
          src={chrome.extension.getURL('assets/icon_white.png')}
          className={styles.logo}
          alt="Logo"
        />
        Facebook Sixth Sense
      </div>
      <div className={styles.content}>
        <div className={styles.actions}>
          {actions.map(action =>
            <Action
              key={action.startDate}
              action={action}
              unread={action.endDate > lastReadDate}
            />
          )}
        </div>
        <div className={styles.info}>
          {actions.length === 0 &&
            <div className={styles.empty}>There's nothing to show here yet!</div>
          }
          <a
            className={styles.faq}
            href="https://github.com/Morhaus/facebook-sixth-sense/blob/master/FAQ.md#why-are-some-events-not-showing-up"
            target="_blank"
            tabIndex={-1}
          >
            Why are some events not showing up?
          </a>
        </div>
      </div>
      <div className={styles.footer}>
        <span className={styles.clickable} onClick={onClear}>
          Clear
        </span>
        <a
          className={styles.clickable}
          href="https://twitter.com/Morhaus"
          target="_blank"
          // Avoids it being selected when the popup appears
          tabIndex={-1}
        >
          @Morhaus
        </a>
      </div>
    </div>
  );
}

Popup.propTypes = {
  actions: PropTypes.arrayOf(PropTypes.object).isRequired,
  lastReadDate: PropTypes.number.isRequired,
  onClear: PropTypes.func.isRequired,
};

export default Popup;
