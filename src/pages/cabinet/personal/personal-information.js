import React, {useState} from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { API } from "core";
import FormAgentData from "parts/form-agent-data";
import { Loader } from "components/simple";
import { CachedForm } from "components/form";
import { registrationAgentValidator } from "components/form/validation";
import { $personal } from "stores";

const PersonalInformation = observer(() => {
    const [loading, setLoading] = useState(false);

    const submitAgentData = (values) => {
        setLoading(true);
        API.put({
            url: API.AGENT_PROPERTIES,
            body: values,
            success: (result) => {
                $personal.setInformation({
                    ...$personal.information,
                    ...result
                });
            },
            after: () => setLoading(false)
        });
    };

    const { t } = useTranslation();
    return (
        <div className="cabinet block">

            <section>
                { loading &&
                    <Loader page />
                }

                <h2>{t("Personal Information")}</h2>

                <CachedForm
                    onSubmit={submitAgentData}
                    validationSchema={registrationAgentValidator}
                    initialValues={$personal.information}
                    render={formik => (
                        <div className="form agent-data">
                            <FormAgentData formik={formik} />
                            <div className="row controls">
                                <div className="field">
                                    <div className="inner">
                                        <button type="submit" className={"button" +
                                        __class(!formik.isValid || !formik.dirty, "disabled")}>
                                            {t("Save changes")}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                />
            </section>
        </div>
    );
});

export default PersonalInformation;
