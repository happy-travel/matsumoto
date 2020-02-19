import React from "react";
import { NavLink  } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function () {
    const { t } = useTranslation();

    return  <>
        <section>
            <h1>COMPANYNAME SETTINGS</h1>
            <p>{t('Account Not Verificated Yet')}</p>
            <a href="" className="button personal-info__button">{t('Update contract')}</a>
        </section>
        <div className="users-pages-navigation">
            <NavLink to="/settings/company">{t('Company settings')}</NavLink >
            <NavLink to="/settings/admin" activeClassName="active">{t('Admin settings')}</NavLink >
            <NavLink to="/settings/users-management">{t('users management')}</NavLink >
            <NavLink to="/settings/notifications">{t('Notifications')}</NavLink >
        </div>
    </>
}