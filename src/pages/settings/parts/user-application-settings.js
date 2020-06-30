import React from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Loader } from "simple";
import { CachedForm, FieldSelect, FieldSwitch } from "components/form";
import FieldCountry from "components/active/field-country";
import {
    loadUserSettings,
    saveUserSettings
} from "simple/logic/user-settings";

import authStore from "stores/auth-store";

@observer
class UserApplicationSettings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false
        };

        loadUserSettings();
        this.submitUserSettings = this.submitUserSettings.bind(this);
    }

    submitUserSettings(values) {
        this.setState({ loading: true });
        saveUserSettings(
            values,
            () => this.setState({ loading: false })
        );
    }

    render() {
        const { t } = useTranslation();
        return (
            <React.Fragment>
                {this.state.loading && <Loader page />}

                <h2><span class="brand">{t("Application Settings")}</span></h2>

                <CachedForm
                    initialValues={authStore.settings}
                    enableReinitialize
                    onSubmit={this.submitUserSettings}
                    render={formik => (
                        <div class="form app-settings">
                            <div class="row">
                                <FieldSelect formik={formik}
                                             id="preferredLanguage"
                                             label={t("Preferred language")}
                                             placeholder={t("Preferred language")}
                                             options={[
                                                 { value: "en", text: "English"},
                                                 { value: "ar", text: "اللغة الحالية"}
                                             ]}
                                />
                                <FieldSelect formik={formik}
                                             id="weekStarts"
                                             label={t("Week starts on")}
                                             placeholder={t("Default")}
                                             options={[
                                                 { value: 0, text: "Default"},
                                                 { value: 7, text: "Sunday"},
                                                 { value: 1, text: "Monday"},
                                                 { value: 2, text: "Tuesday"},
                                                 { value: 3, text: "Wednesday"},
                                                 { value: 4, text: "Thursday"},
                                                 { value: 5, text: "Friday"},
                                                 { value: 6, text: "Saturday"},
                                             ]}
                                />
                            </div>
                            <div class="row">
                                <FieldSwitch formik={formik}
                                             id="availableCredit"
                                             label={t("Show Available Credit")}
                                />
                            </div>
                            <div class="row">
                                <FieldCountry formik={formik}
                                              id="nationality"
                                              anotherField="residency"
                                              label={t("Nationality")}
                                              placeholder={t("Choose your nationality")}
                                              clearable
                                />
                                <FieldCountry formik={formik}
                                              id="residency"
                                              anotherField="nationality"
                                              label={t("Residency")}
                                              placeholder={t("Choose your residency")}
                                              clearable
                                />
                            </div>
                            <div class="row controls">
                                <div class="field">
                                    <div class="inner">
                                        <button type="submit" class={"button" +
                                                                __class(!formik.isValid || !formik.dirty, "disabled")}>
                                            {t("Save changes")}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                />
            </React.Fragment>
        );
    }
}

export default UserApplicationSettings;
