import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import settings from "settings";
import { observer } from "mobx-react";
import LocaleSwitcher from "./locale-switcher";
import CurrencySwitcher from "./currency-switcher";
import { Authorized } from "core/auth";
import { $ui } from "stores";

@observer
class Footer extends React.Component {
render() {
    const { t } = useTranslation();
    var ht = $ui.ourCompanyInfo;
    return (
        <footer>
            <section>
                <div className="company">
                    <div className="logo-wrapper">
                        <a href="/" className="logo" />
                    </div>
                </div>
                <div className="column">
                    <h3>{t("Information")}</h3>
                    <ul>
                        <li><Link to="/about">{t("About Us")}</Link></li>
                        <li><Link to="/contact">{t("Contacts")}</Link></li>
                        <li><Link to="/terms">{t("Terms & Conditions")}</Link></li>
                        <li><Link to="/privacy">{t("Privacy Policy")}</Link></li>
                    </ul>
                </div>
                <div className="column">
                    <h3>{t("Personalization")}</h3>
                    <ul>
                        <li>
                            <LocaleSwitcher />
                        </li>
                        <li>
                            { Authorized() && <CurrencySwitcher /> }
                        </li>
                    </ul>
                </div>
                <div className="column">
                    <h3>{t("Contacts")}</h3>
                    <ul>
                        <li>
                            <span>{t("Email")}:</span> <a href={`mailto:${ht.email}`}>{ht.email}</a>
                        </li>
                        <li>
                            <span>{t("Phone")}:</span> {ht.phone}
                        </li>
                        <li>
                            <span>{t("Address")}:</span> {ht.name}<br/>
                            {ht.address}<br/>
                            P.O. {ht.postalCode}<br/>
                            {ht.city}, {ht.country}
                        </li>
                        <li>
                            <span>TRN:</span> {ht.trn}
                        </li>
                        <li>
                            <span>IATA:</span> {ht.iata}
                        </li>
                        <li>
                            <span>Trade License:</span> {ht.tradeLicense}
                        </li>
                    </ul>
                </div>
            </section>
            <section>
                <div className="payments">
                    <img src="/images/other/mc.png" className="near transparent" alt="Mastercard" />
                    <img src="/images/other/mc-sec.png" className="interval-big transparent" alt="Mastercard Id Check" />
                    <img src="/images/other/visa.png" alt="Visa" />
                    <img src="/images/other/visa-sec.png" className="interval" alt="Visa Secure" />
                    <img src="/images/other/amex.png" alt="American Express" />
                </div>
            </section>
            <section className="copyright">
                <div>{t("_copyright")} © 2019 — {new Date().getFullYear()} {ht.name}</div>
                <div className="service-info column">
                    <span>Web – {settings.build || 0} </span>
                    <span>API – {$ui.currentAPIVersion || 0}</span>
                </div>
            </section>
        </footer>
    );
}}

export default Footer;
