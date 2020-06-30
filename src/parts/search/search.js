import React from "react";
import moment from "moment";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { Stars } from "simple";

import { Redirect } from "react-router-dom";
import { CachedForm, FORM_NAMES, FieldText, FieldSelect } from "components/form";
import FieldCountry, { searchFormSetDefaultCountries } from "components/complex/field-country";
import FieldDestination from "components/complex/field-destination";
import FieldDatepicker from "components/complex/field-datepicker";
import { accommodationSearchValidator } from "components/form/validation";

import PeopleDropdown from "components/form/dropdown/room-details";

import store from "stores/accommodation-store";
import View from "stores/view-store";
import authStore from "stores/auth-store";

import { createSearch } from "./search-logic";

import { countPassengers } from "./search-ui-helpers";

@observer
class AccommodationSearch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            redirectToVariantsPage: false
        };
        this.submit = this.submit.bind(this);
    }

    submit(values, formik) {
        View.setOpenDropdown(null);
        if (values.predictionDestination != values.destination)
            formik.setFieldValue("destination", values.predictionDestination);

        createSearch(values);

        this.setState({
            redirectToVariantsPage: true
        });
    }

    componentDidUpdate() {
        if (this.state.redirectToVariantsPage)
            this.setState({
                redirectToVariantsPage: false
            }); // prevent redirection circle
    }

    render() {
        var { t } = useTranslation();

        return (
            <div class="search block">
                { this.state.redirectToVariantsPage && <Redirect to="/search"/> }
                <section>
                    <div class="hide">{JSON.stringify(store.suggestion)}{JSON.stringify(authStore.settings)}</div>
                    <CachedForm
                        id={ FORM_NAMES.SearchForm }
                        initialValues={{
                            destination: "",
                            residency: "", residencyCode: "",
                            nationality: "", nationalityCode: "",
                            checkInDate: moment().startOf("day"),
                            checkOutDate: moment().startOf("day").add(1, "d"),
                            roomDetails: [
                                {
                                    adultsNumber: 2,
                                    childrenAges: []
                                }
                            ],
                            // Advanced search:
                            propertyTypes: "Any",
                            ratings: "Unknown",
                            availability: "all",
                            address: "",
                            radius: "",
                            order: "room",
                            predictionResult: null,
                            predictionDestination: "",

                            advancedSearch: false
                        }}
                        valuesOverwrite={searchFormSetDefaultCountries}
                        validationSchema={accommodationSearchValidator}
                        onSubmit={this.submit}
                        enableReinitialize={!authStore.settings.loaded}
                        render={(formik, reset) => (
                            <React.Fragment>
                                <div class="form">
                                    <div class="row">
                                        <FieldDestination formik={formik}
                                                          id="destination"
                                                          label={t("Destination, Hotel name, Location or Landmark")}
                                                          placeholder={t("Choose your Destination, Hotel name, Location or Landmark")}
                                        />
                                        <FieldDatepicker formik={formik}
                                                         id="dates"
                                                         first="checkInDate"
                                                         second="checkOutDate"
                                                         label={t("Check In - Check Out")}
                                                         placeholder={t("Choose date")}
                                        />
                                        <FieldText formik={formik}
                                                   id="room"
                                                   label={t("Adults, Children, Rooms")}
                                                   placeholder={t("Choose options")}
                                                   Icon={<span class="icon icon-arrows-expand"/>}
                                                   addClass="size-medium"
                                                   Dropdown={PeopleDropdown}
                                                   value={
                                                          [__plural(t, countPassengers(formik.values, "adultsNumber"), "Adult"),
                                                           __plural(t, countPassengers(formik.values, "childrenNumber"), "Children"),
                                                           __plural(t, formik.values.roomDetails.length, "Room")].join(" • ")
                                                   }
                                        />
                                    </div>
                                    <div class={"row advanced" + __class(!formik.values.advancedSearch, "invisible")}>
                                        <FieldSelect formik={formik}
                                                     id="propertyTypes"
                                                     label={t("Property Type")}
                                                     options={[
                                                         {value: "Any", text: t("All")},
                                                         {value: "Hotels", text: t("Hotel")},
                                                         {value: "Apartments", text: t("Serviced Apartment")}
                                                     ]}
                                        />
                                        <FieldSelect formik={formik}
                                                     id="ratings"
                                                     label={t("Star Rating")}
                                                     addClass="size-large"
                                                     options={[
                                                         {value: "Unknown",    text: t("All")},
                                                         {value: "OneStar",    text: <span>{t("Economy")}  <Stars count="1" /></span>},
                                                         {value: "TwoStars",   text: <span>{t("Budget")}   <Stars count="2" /></span>},
                                                         {value: "ThreeStars", text: <span>{t("Standard")} <Stars count="3" /></span>},
                                                         {value: "FourStars",  text: <span>{t("Superior")} <Stars count="4" /></span>},
                                                         {value: "FiveStars",  text: <span>{t("Luxury")}   <Stars count="5" /></span>},
                                                         {value: "NotRated",   text: "Unrated"}
                                                     ]}
                                        />
                                        <FieldText formik={formik}
                                                   id="radius"
                                                   label={t("Radius (Km)")}
                                                   placeholder="1"
                                                   numeric
                                        />
                                        <FieldSelect formik={formik}
                                                     id="order"
                                                     label={t("Order Rates")}
                                                     options={[
                                                         {value: "room", text: t("By Room")},
                                                         {value: "rate", text: t("By Rate")}
                                                     ]}
                                        />
                                    </div>
                                    <div class="row">
                                        <FieldCountry formik={formik}
                                                      id="nationality"
                                                      anotherField="residency"
                                                      label={t("Nationality")}
                                                      placeholder={t("Choose your nationality")}
                                                      addClass="size-large"
                                                      clearable
                                        />
                                        <FieldCountry formik={formik}
                                                      id="residency"
                                                      anotherField="nationality"
                                                      label={t("Residency")}
                                                      placeholder={t("Choose your residency")}
                                                      addClass="size-large"
                                                      clearable
                                        />
                                        <div class="field">
                                            <div class="label"/>
                                            <div class="inner">
                                                <button type="submit" class="button">
                                                    {t("Search accommodation")}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="additionals">
                                    {formik.values.advancedSearch ?
                                        <button type="button" class="button-expand reverse" onClick={() => formik.setFieldValue("advancedSearch", false)}>
                                            {t("Simple Search")}
                                        </button> :
                                        <button type="button" class="button-expand" onClick={() => formik.setFieldValue("advancedSearch", true)}>
                                            {t("Advanced Search")}
                                        </button>
                                    }
                                    <button type="button" class="button-clear" onClick={reset}>
                                        {t("Clear")}
                                    </button>
                                </div>
                            </React.Fragment>
                        )}
                    />
                </section>
            </div>
        );
    }
}

export default AccommodationSearch;
