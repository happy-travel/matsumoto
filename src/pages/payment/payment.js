import React from "react";
import settings from "settings";
import BasicPaymentPage from "./utils/processing";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { API } from "core";
import { Formik } from "formik";
import { StaticHeader, Loader, price, decorate } from "simple";
import { creditCardType } from "card-validator";
import ReactTooltip from "react-tooltip";
import {
    prettyCardNumber,
    postVirtualForm,
    formatExpiryDate,
    allowedTypes,
    decorateExpirationDate,
    decorateCardholderName
} from "./utils/decorator";
import { snare } from "./utils/snare";

import {
    FieldText,
    FieldCheckbox
} from "components/form";
import Breadcrumbs from "components/breadcrumbs";
import { creditCardValidator, savedCreditCardValidator } from "components/form/validation";

import store from "stores/accommodation-store";
import UI from "stores/ui-store";

@observer
class PaymentPage extends BasicPaymentPage {
    constructor(props) {
        super(props);
        this.state = {
            request_url: null,
            currency: store.selected?.roomContractSet?.price.currency,
            amount: store.selected?.roomContractSet?.price.netTotal,
            comment: null,
            service: {
                service_command     : "TOKENIZATION",
                merchant_reference  : require('uuid/v4')(),
                language            : "en", //the only alternative : "ar"
                return_url          : settings.payment_any_cb_host + "/payment/result/" + store.booking?.referenceCode
            },
            code: {
                name: "CVV",
                size: 3
            },
            savedCards: [],
            selectedCardId: null,
            loading: true,
            everSubmitted: false,
            addNew: false
        };
        this.submit = this.submit.bind(this);
        this.detectCardType = this.detectCardType.bind(this);
        this.payBySavedCard = this.payBySavedCard.bind(this);
        this.selectCard = this.selectCard.bind(this);
        this.callback = this.callback.bind(this);
    }

    componentDidMount() {
        API.get({
            url: API.CARDS_SETTINGS,
            after: data => {
                if (!data)
                    return;
                this.setState({
                    service: {
                        ...this.state.service,
                        access_code         : data.accessCode,
                        merchant_identifier : data.merchantIdentifier
                    },
                    request_url: data.tokenizationUrl
                });
            }
        });
        API.get({
            url: API.CARDS_SAVED,
            success: data => this.setState({
                savedCards: data || [],
                loading: false,
                addNew: !data?.length
            })
        });
        snare();
    }

    detectCardType(e) {
        var info = creditCardType(e.target?.value);
        if (!e.target?.value || !info?.[0]) {
            this.setState({
                type: null
            });
            return;
        }
        info = info[0];

        this.setState({
            code: info.code,
            type: info.type
        });

        e.target.value = prettyCardNumber(e.target.value, info);
    }

    submit(values) {
        var request = {
            card_holder_name: values.card_holder_name,
            card_security_code: values.card_security_code,
            card_number: decorate.removeNonDigits(values.card_number),
            expiry_date: formatExpiryDate(values),
            remember_me: values.remember_me ? "YES" : "NO"
        };

        UI.setSaveCreditCard(values.remember_me);

        var fingerprint = this.state.direct ? "" : (document.getElementById("device_fingerprint")?.value || "");
        this.setState({
            service: {
                ...this.state.service,
                ...(fingerprint ? { device_fingerprint: fingerprint } : {})
            },
            loading: true,
            everSubmitted: true
        });

        API.post({
            url: this.state.direct ? null : API.CARDS_SIGN,
            external_url: this.state.direct ? API.DIRECT_LINK_PAY.SIGN(this.state.order_code) : null,
            body: this.state.service,
            after: data => {
                postVirtualForm(this.state.request_url, {
                    ...this.state.service,
                    ...request,
                    signature: data
                });
            }
        });
    }

    payBySavedCard(values) {
        if (!this.state.selectedCardId)
            return;

        this.setState({
            loading: true
        });

        UI.setSaveCreditCard(false);

        API.post({
            url: API.PAYMENTS_CARD_SAVED,
            body: {
                referenceCode: store.booking?.referenceCode,
                cardId: this.state.selectedCardId,
                securityCode: values.card_security_code
            },
            after: (data, error) => this.callback(data, error)
        });
    }

    selectCard(id) {
        this.setState({
            selectedCardId: id
        });
    }

render() {
    const { t } = useTranslation();

    if (this.state.loading)
        return <Loader />;

    return (
        <React.Fragment>
            { this.state.direct && <StaticHeader /> }

<div class="confirmation block payment">
    <section class="double-sections">
        <div class="middle-section">
            { !this.state.direct &&
            <Breadcrumbs items={[
                {
                    text: t("Search accommodation"),
                    link: "/search"
                }, {
                    text: t("Your Booking"),
                    link: "/accommodation/booking",
                }, {
                    text: t("Payment")
                }
            ]}
                backLink="/accommodation/booking"
            />
            }

            { this.state.comment && <p>
                { this.state.comment }
            </p> }

            { "Success" == this.state.status && <h2 class="payment-title">
                {t("This order was successfully paid already")}
            </h2> }

            { this.state.direct && !this.state.loading && ("Success" != this.state.status) &&
              ("Created" != this.state.status) && <h2 class="payment-title">
                {t("You are not able to pay this order anymore")}
            </h2> }

            {!this.state.direct && <p class="remark">
                <strong>Please note:</strong> when paying by card, we hold funds on your account until the deadline date approach. In case of cancellation, funds will be released in accordance with the service cancellation policy as soon as possible.
            </p>}

            { !this.state.direct && !!this.state.savedCards.length && !this.state.addNew &&
            <React.Fragment>
                <h2 class="payment-title">
                    {t("Pay using saved cards")}
                </h2>
                <Formik
                    initialValues={{
                        card_security_code: ""
                    }}
                    validateOnChange={true}
                    validationSchema={savedCreditCardValidator}
                    onSubmit={this.payBySavedCard}
                >
                    {formik => (
                        <form onSubmit={formik.handleSubmit}>
                            <div class="form">
                                <div class="payment method cards">
                                    <div class="list">
                                    {this.state.savedCards.map(item => {
                                        var type = creditCardType(item.number)?.[0];
                                        return (<div
                                            onClick={() => this.selectCard(item.id)}
                                            class={"item" + __class(item.id == this.state.selectedCardId, "selected")}>
                                            {allowedTypes[type.type] ? <img src={allowedTypes[type.type]} /> : null}
                                            {item.number} <span>{item.expirationDate.substr(2,2) + " / " + item.expirationDate.substr(0,2)}</span>
                                            <FieldText formik={formik}
                                                id="card_security_code"
                                                placeholder={this.state.code.name}
                                                addClass={__class(formik.values.card_security_code.length != this.state.code.size, "force-invalid")}
                                                required
                                                password
                                                numeric
                                                maxLength={this.state.code.size}
                                            />
                                        </div>);
                                    })}
                                    </div>
                                </div>
                                <button class={"no-margin button" + __class(!this.state.selectedCardId, "disabled")}>
                                    <span class="icon icon-white-lock" />
                                    { t("Pay") + price(this.state.currency, this.state.amount || 0) + t("using saved card")}
                                </button>
                                <button onClick={() => this.setState({ addNew: true })} class="button transparent-with-border">
                                    {t("Use another card")}
                                </button>
                            </div>
                        </form>
                    )}
                </Formik>
            </React.Fragment>}

            { ((!this.state.direct && this.state.addNew) || ("Created" == this.state.status)) &&
            <React.Fragment>
                {!!this.state.savedCards.length &&
                    <div class="form" style={{paddingTop: "40px"}}>
                        <button onClick={() => this.setState({ addNew: false })} class="button transparent-with-border">
                            {t("Back to saved cards")}
                        </button>
                    </div>
                }
                <h2 class="payment-title">
                    {t("Please Enter Your Card Details")}
                </h2>

                <Formik
                    initialValues={{
                        card_number: "",
                        expiry_date: "",
                        card_security_code: "",
                        card_holder_name: "",
                        remember_me: false,
                        code_length: 3
                    }}
                    validateOnChange={true}
                    validationSchema={creditCardValidator}
                    onSubmit={this.submit}
                >
                {formik => (
                    <form onSubmit={formik.handleSubmit} class={__class(!this.state.everSubmitted, "never-submitted")}>
                        <div class="form">
                            <div class="row">
                                <FieldText formik={formik}
                                    id="card_holder_name"
                                    label={t("Card Holder Name")}
                                    placeholder={t("Card Holder Name")}
                                    onChange={decorateCardholderName}
                                    autocomplete="cc-name"
                                />
                            </div>
                            <div class="row">
                                <FieldText formik={formik}
                                    id="card_number"
                                    label={t("Card Number")}
                                    placeholder={t("Card Number")}
                                    required
                                    numeric={"/"}
                                    maxLength={22}
                                    onChange={this.detectCardType}
                                    Icon={allowedTypes[this.state.type] ? <img src={allowedTypes[this.state.type]} /> : null}
                                    autocomplete="cc-number"
                                />
                            </div>
                            <div class="row">
                                <FieldText formik={formik}
                                    id="expiry_date"
                                    label={t("Expiration Date")}
                                    placeholder={"MM/YY"}
                                    addClass="size-half"
                                    required
                                    numeric={"/"}
                                    onChange={decorateExpirationDate}
                                    maxLength={5}
                                    autocomplete="cc-exp"
                                />
                                <FieldText formik={formik}
                                    id="card_security_code"
                                    password
                                    label={
                                        <span>
                                            {this.state.code.name}
                                            <span
                                                class="icon icon-info"
                                                data-tip="Security code on your credit card"
                                            />
                                        </span>
                                    }
                                    placeholder={this.state.code.name}
                                    addClass={"size-half" +
                                        __class(formik.values.card_security_code.length != this.state.code.size, "force-invalid")}
                                    required
                                    numeric
                                    maxLength={this.state.code.size}
                                    autocomplete="cc-csc"
                                />
                            </div>
                            { !this.state.direct && <div class="row">
                                <FieldCheckbox formik={formik}
                                    label={
                                        <span>
                                            {t("Save my card for faster checkout")}
                                            <span
                                                class="icon icon-info"
                                                data-tip={t("It's safe, only a part of your card data will be stored")}
                                            />
                                        </span>
                                    }
                                    id={"remember_me"}
                                />
                            </div> }
                            <button class="button">
                                <span class="icon icon-white-lock" />
                                { t("Pay") + price(this.state.currency, this.state.amount || 0) }
                            </button>
                        </div>
                    </form>
                    )}
                </Formik>
            </React.Fragment> }
        </div>
    </section>
    <input type="hidden" id="device_fingerprint" name="device_fingerprint" />
    <ReactTooltip place="top" type="dark" effect="solid"/>
</div>

        </React.Fragment>
    );
}
}

export default PaymentPage;
