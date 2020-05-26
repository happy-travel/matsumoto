import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";
import UserMenu from "components/switchers/user-menu";
import authStore from "stores/auth-store";

const Header = () => {
    const { t } = useTranslation();

    return (
        <header>
            <section>
                <div class="logo-wrapper">
                    <Link to="/" class="logo" />
                </div>
                <nav>
                    { !!authStore.userCache?.access_token && <li><Link class="selected" to="/">{t("Accommodations")}</Link></li> }
                </nav>
                { !!authStore.userCache?.access_token && <UserMenu /> }
            </section>
        </header>
    );
};

export default Header;
