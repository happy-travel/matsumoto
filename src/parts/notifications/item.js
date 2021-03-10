import React from "react";
import { observer } from "mobx-react";
import Notifications from "stores/notifications-store";

@observer
class NotificationItem extends React.Component {
    hideAlert = () => {
        const { notification } = this.props;
        Notifications.closeNotification(notification.id);
    }

    render() {
        const { notification } = this.props,
              { text, title, style, temporary } = notification;

        return (
            <div className={"item" + __class(style)}>
                <div className="content">
                    { style &&
                        <div className="style">
                            <i />
                        </div>
                    }
                    <div className="holder">
                        <div className="text">
                            { title &&
                                <h2>{title}</h2>
                            }
                            <div>{text}</div>
                        </div>
                    </div>
                </div>
                { temporary &&
                    <div class="progress-timer">
                        <div class="bar" />
                    </div>
                }
                <div className="close-button" onClick={this.hideAlert}>
                    <span className="icon icon-close" />
                </div>
            </div>
        );
    }
}

export default NotificationItem;
