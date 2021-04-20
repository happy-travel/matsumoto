import React from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { API } from "core";
import { CachedForm } from "components/form";
import FieldAccommodation from "components/complex/field-accommodation";
import * as Yup from "yup";
import { $view } from "stores";

export const duplicateFormValidator = Yup.object().shape({
    name: Yup.string().required("*"),
    id: Yup.string().required("*"),
});

@observer
class ReportDuplicateModal extends React.Component {
    state = {
        result: null
    };

    submit = (values) => {
        let id = $view.modalData?.accommodation?.id,
            supplier = $view.modalData?.supplier;

        if (!id)
            return;

        API.post({
            url: API.REPORT_DUPLICATE,
            body: {
                "accommodation": {
                    "supplier": supplier,
                    "id": id
                },
                "duplicates": [
                    {
                        "supplier": values.source,
                        "id": values.id
                    },
                ]
            },
            success: () => {
                var temporary_duplicate_element = document.getElementById(supplier + "." + id);
                if (temporary_duplicate_element)
                    temporary_duplicate_element.outerHTML =
                        '<button class="button mini-label disabled">Marked as Duplicate</button>';
            }
        });

        this.props.closeModal();
    };

    render() {
        var { t } = useTranslation(),
            data = $view.modalData,
            { closeModal } = this.props;

        return (
            <div className="confirm modal duplicate">
                { closeModal &&
                    <div className="close-button" onClick={closeModal}>
                        <span className="icon icon-close" />
                    </div>
                }

                <h2>Mark the accommodation as a duplicate</h2>
                <p>
                    If you have seen “{data?.accommodation?.name || ""}“ previously in the current accommodations list,
                    you could link it with a duplicate one, and we will join both results to show them as one next time.
                </p>
                <CachedForm
                    onSubmit={this.submit}
                    validationSchema={duplicateFormValidator}
                    render={formik => (
                        <div className="form">
                            <FieldAccommodation
                                formik={formik}
                                placeholder={t("Select")}
                                id="name"
                                label={t("Accommodation Name")}
                                clearable
                            />
                            <button type="submit" className="button">
                                {t("Confirm")}
                            </button>
                        </div>
                    )}
                />
            </div>
        );
    }
}

export default ReportDuplicateModal;
