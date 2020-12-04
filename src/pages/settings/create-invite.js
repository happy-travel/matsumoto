import React from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { API } from "core";

import { Loader } from "simple";
import { CachedForm, FORM_NAMES, FieldText } from "components/form";
import { registrationUserValidatorWithEmail } from "components/form/validation";
import FormUserData from "parts/form-user-data";
import SettingsHeader from "pages/settings/parts/settings-header";

import UI from "stores/ui-store";
import authStore from "stores/auth-store";
import View from "stores/view-store";

const copyToClipboard = text => {
    if (window.clipboardData && window.clipboardData.setData) {
        return clipboardData.setData("Text", text);
    } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        var textarea = document.createElement("textarea");
        textarea.textContent = text;
        textarea.style.position = "fixed";
        document.body.appendChild(textarea);
        textarea.select();
        try {
            return document.execCommand("copy");
        } catch (ex) {
            return false;
        } finally {
            document.body.removeChild(textarea);
        }
    }
};

@observer
class UserInvitePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            success: false,
            form: null
        };
        this.submit = this.submit.bind(this);
        this.reset = this.reset.bind(this);
    }

    submit(values) {
        this.setState({ success: null });
        API.post({
            url: values.send ? API.AGENT_INVITE_SEND : API.AGENT_INVITE_GENERATE,
            body: {
                email: values.email,
                agencyId: authStore.activeCounterparty.agencyId,
                registrationInfo: {
                    firstName: values.firstName,
                    lastName: values.lastName,
                    position: values.position,
                    title: values.title
                }
            },
            success: data => {
                UI.dropFormCache(FORM_NAMES.CreateInviteForm);
                this.setState({
                    success:
                        (values.send || !data) ?
                        true :
                        window.location.origin + "/signup/invite/" + values.email + "/" + data,
                    name: (values.firstName || values.lastName) ? (values.firstName + " " + values.lastName) : null
                });
            },
            error: (error) => {
                this.setState({ success: false });
                View.setTopAlertText(error?.title || error?.detail);
            }
        });
    }

    reset() {
        this.setState({ success: false });
    }

    submitButtonClick(send, formik) {
        formik.setFieldValue("send", send);
        formik.handleSubmit();
    }

    render() {
        var { t } = useTranslation();

        return (
    <div class="settings block">
        <SettingsHeader />
        <section>
            <h2><span class="brand">{t("Invite an agent")}</span></h2>
            { this.state.success === null && <Loader /> }
            { this.state.success && <div>
                {this.state.success === true ?
                <div>
                    { this.state.name ?
                        <h3>{t("Your invitation sent to")} {this.state.name}</h3> :
                        <h3>{t("Your invitation sent")}</h3> }
                    <br/>
                </div> :
                <div>
                    <div class="form">
                        <h3>{t("Send this link as an invitation")}</h3>
                        <br/>
                        <FieldText
                            value={this.state.success}
                        />
                    </div>
                    <br/>
                    <button class="button small" onClick={() => copyToClipboard(this.state.success)}>
                        {t("Copy to clipboard")}
                    </button>
                </div>}
                <button class="button payment-back" onClick={this.reset}>
                    {t("Send one more invite")}
                </button>
            </div> }
            { false === this.state.success && <p>
                {t("Invite someone to create a free Happytravel.com account and start booking today.")}<br/>
                <br/>
            </p> }

            { false === this.state.success && <CachedForm
                id={FORM_NAMES.CreateInviteForm}
                initialValues={{
                    "email": "",
                    "title": "",
                    "firstName": "",
                    "lastName": "",
                    "position": ""
                }}
                validationSchema={registrationUserValidatorWithEmail}
                onSubmit={this.submit}
                render={formik => (
                    <React.Fragment>
                        <div class="form">
                            <div class="row">
                                <FieldText formik={formik}
                                    id="email"
                                    label={t("Email")}
                                    placeholder={t("Email")}
                                    required
                                />
                            </div>
                            <FormUserData formik={formik} t={t} />
                            <div class="row submit-holder">
                                <div class="field">
                                    <div class="inner">
                                        <button onClick={() => this.submitButtonClick(true, formik)}
                                                class={"button" + __class(!formik.isValid, "disabled")}>
                                            {t("Send invitation")}
                                        </button>
                                    </div>
                                </div>
                                <div class="field">
                                    <div class="inner">
                                        <button onClick={() => this.submitButtonClick(false, formik)}
                                                class={"button" + __class(!formik.isValid, "disabled")}>
                                            {t("Generate invitation link")}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </React.Fragment>
                )}
            /> }
        </section>
    </div>
        );
    }
}

export default UserInvitePage;