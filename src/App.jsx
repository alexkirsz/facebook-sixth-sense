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
      <div className={styles.actions}>
        {actions.map(action =>
          <Action
            key={action.startDate}
            action={action}
            unread={action.endDate > lastReadDate}
          />
        )}
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
