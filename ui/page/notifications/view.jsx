// @flow
import * as ICONS from 'constants/icons';
import React from 'react';
import Page from 'component/page';
import Spinner from 'component/spinner';
import { FormField } from 'component/common/form';
import Notification from 'component/notification';
import Button from 'component/button';
import usePersistedState from 'effects/use-persisted-state';
import Yrbl from 'component/yrbl';
import * as NOTIFICATIONS from 'constants/notifications';
import useFetched from 'effects/use-fetched';
import { RULE } from 'constants/notifications';

type Props = {
  notifications: Array<Notification>,
  localNotifications: Array<Notification>,
  notificationsFiltered: Array<Notification>,
  notificationCategories: Array<NotificationCategory>,
  fetching: boolean,
  unreadCount: number,
  unseenCount: number,
  doLbryioSeeAllNotifications: () => void,
  doLbryioNotificationsMarkRead: () => void,
  doLbryioNotificationList: (?Array<string>) => void,
  activeChannel: ?ChannelClaim,
  doCommentReactList: (Array<string>) => Promise<any>,
  user: User,
};

export default function NotificationsPage(props: Props) {
  const {
    notifications,
    notificationsFiltered,
    localNotifications,
    fetching,
    unreadCount,
    unseenCount,
    doLbryioSeeAllNotifications,
    doLbryioNotificationsMarkRead,
    doLbryioNotificationList,
    notificationCategories,
    activeChannel,
    doCommentReactList,
    user,
  } = props;
  // const localCategories = [{ name: 'New Content', types: ['new_content'] }];
  const legacyNotificationsEnabled = user && user.experimental_ui;
  const initialFetchDone = useFetched(fetching);
  const [name, setName] = usePersistedState('notifications--rule', NOTIFICATIONS.NOTIFICATION_NAME_ALL);
  const isFiltered = name !== NOTIFICATIONS.NOTIFICATION_NAME_ALL;
  const list = isFiltered ? notificationsFiltered : notifications;

  // Fetch reacts
  React.useEffect(() => {
    if ((!fetching || initialFetchDone) && activeChannel) {
      let idsForReactionFetch = [];
      list.map((notification) => {
        const { notification_rule, notification_parameters } = notification;
        const isComment =
          notification_rule === RULE.COMMENT ||
          notification_rule === RULE.COMMENT_REPLY ||
          notification_rule === RULE.CREATOR_COMMENT;
        const commentId =
          isComment &&
          notification_parameters &&
          notification_parameters.dynamic &&
          notification_parameters.dynamic.hash;

        if (commentId) {
          idsForReactionFetch.push(commentId);
        }
      });

      if (idsForReactionFetch.length !== 0) {
        doCommentReactList(idsForReactionFetch);
      }
    }
  }, [doCommentReactList, list, activeChannel, fetching, initialFetchDone]);

  React.useEffect(() => {
    if (unseenCount > 0 || unreadCount > 0) {
      // If there are unread notifications when entering the page, reset to All.
      setName(NOTIFICATIONS.NOTIFICATION_NAME_ALL);
    }
  }, []);

  React.useEffect(() => {
    if (unseenCount > 0) {
      doLbryioSeeAllNotifications();
    }
  }, [unseenCount, doLbryioSeeAllNotifications]);

  const stringifiedNotificationCategories = JSON.stringify(notificationCategories);
  React.useEffect(() => {
    if (stringifiedNotificationCategories) {
      const arrayNotificationCategories = JSON.parse(stringifiedNotificationCategories);

      if (name !== NOTIFICATIONS.NOTIFICATION_NAME_ALL) {
        // Fetch filtered list when:
        // (1) 'name' changed
        // (2) new "all" notifications received (e.g. from websocket).
        try {
          const matchingCategory = arrayNotificationCategories.find((category) => category.name === name);
          if (matchingCategory) {
            doLbryioNotificationList(matchingCategory.types);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [name, notifications, stringifiedNotificationCategories]);

  const notificationListElement = (
    <>
      <div className="claim-list__header">
        <h1 className="card__title">{__('Notifications')}</h1>
        <div className="claim-list__alt-controls--wrap">
          {fetching && <Spinner type="small" />}

          {legacyNotificationsEnabled && unreadCount > 0 && (
            <Button
              icon={ICONS.EYE}
              onClick={doLbryioNotificationsMarkRead}
              button="secondary"
              label={__('Mark all as read')}
            />
          )}
          {!legacyNotificationsEnabled && unreadCount > 0 && (
            <Button icon={ICONS.EYE} onClick={() => alert('clear')} button="secondary" label={__('Mark all as read')} />
          )}
          {legacyNotificationsEnabled && notificationCategories && (
            <FormField
              className="notification__filter"
              type="select"
              name="filter"
              value={name}
              onChange={(e) => setName(e.target.value)}
            >
              {notificationCategories.map((category) => {
                return (
                  <option key={category.name} value={category.name}>
                    {__(category.name)}
                  </option>
                );
              })}
            </FormField>
          )}
        </div>
      </div>
      {legacyNotificationsEnabled && list && list.length > 0 && !(isFiltered && fetching) && (
        <div className="card">
          <div className="notification_list">
            {list.map((notification) => {
              return <Notification key={notification.id} notification={notification} />;
            })}
          </div>
        </div>
      )}
      {!legacyNotificationsEnabled && localNotifications && localNotifications.length > 0 && (
        <div className="card">
          <div className="notification_list">
            {localNotifications.map((notification) => {
              return <Notification key={notification.id} notification={notification} local />;
            })}
          </div>
        </div>
      )}
      {!(legacyNotificationsEnabled && list && list.length > 0 && !(isFiltered && fetching)) && (
        <div className="main--empty">
          {!fetching && (
            <Yrbl
              title={__('No notifications')}
              subtitle={
                isFiltered
                  ? __('Try selecting another filter.')
                  : __("You don't have any notifications yet, but they will be here when you do!")
              }
              actions={
                <div className="section__actions">
                  <Button button="primary" icon={ICONS.HOME} label={__('Go Home')} navigate="/" />
                </div>
              }
            />
          )}
        </div>
      )}
    </>
  );

  return (
    <Page>
      {initialFetchDone ? (
        notificationListElement
      ) : fetching ? (
        <div className="main--empty">
          <Spinner delayed />
        </div>
      ) : (
        notificationListElement
      )}
    </Page>
  );
}
