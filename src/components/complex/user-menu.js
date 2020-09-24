import React from "react";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import authStore from "stores/auth-store";

const calcTitleFor = (value) => (value?.length > 14 ? { title: value } : {});

@observer
class UserMenuDropdown extends React.Component {
    render() {
        const { t } = useTranslation();

        return (
            <React.Fragment>
                <Link to="/agent/bookings" class="button transparent-with-border">
                    {t("Bookings")}
                </Link>
                <Link to="/settings/personal" class="switcher user-switcher">
                    <div class="avatar" />
                    <div class="double">
                        <div
                            class="name"
                            {...calcTitleFor(authStore.user?.firstName + " " + authStore.user?.lastName)}
                        >
                            {authStore.user?.firstName} {authStore.user?.lastName}
                            <i class="icon icon-gear" />
                        </div>
                        <div
                            class="company"
                            {...calcTitleFor(authStore.activeCounterparty.name)}
                        >
                            {authStore.activeCounterparty.name}
                        </div>
                    </div>
                </Link>
            </React.Fragment>
        );
    }
}

export default UserMenuDropdown;
