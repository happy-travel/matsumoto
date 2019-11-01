import React from "react";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react";
import { API, dateFormat, price } from "core";
import { Formik, FieldArray } from "formik";

import {
    FieldText,
    FieldTextarea,
    FieldSwitch,
    FieldCheckbox,
    FieldSelect
} from "components/form";
import Breadcrumbs from "components/breadcrumbs";
import ActionSteps from "components/action-steps";
import { Dual, Loader } from "components/simple";
import { Redirect } from "react-router-dom";
import { accommodationBookingValidator } from "components/form/validation";

import store from "stores/accommodation-store";

@observer
class AccommodationBookingPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            redirectToConfirmationPage: false
        };
        this.submit = this.submit.bind(this);
    }

    componentDidMount() {
        store.setBookingRequest(null);
        store.setBookingResult(null);
    }

    submit(values, { setSubmitting }) {
        if (!store.selected.hotel.id || !store.selected.variant.id)
            return null; //todo: another answer

        var variant = store.selected.variant,
            search = store.search.request;

        var roomDetails = [];

        for (var r = 0; r < store.search.rooms; r++) {
            var adults = store.search.request.roomDetails[r].adultsNumber,
                total = adults + store.search.request.roomDetails[r].childrenNumber,
                passengers = [];

            for (var i = 0; i < total; i++)
                passengers.push({
                    "title": values.room[r].passengers[i].title,
                    "firstName": values.room[r].passengers[i].firstName,
                    "lastName": values.room[r].passengers[i].lastName,
                    "age": i < adults ? 33 : 12,
                    "initials":"",
                    ...( i == 0 ? {"isLeader": true} : {} )
                });

            roomDetails.push({
                type: variant.rooms[r].type,
                passengers
            })
        }

        var request = {
            "availabilityId": store.search.result.availabilityId,
            "nationality": search.nationality,
            "paymentMethod": "CreditCard",
            "residency": search.residency,
            "mainPassengerName": roomDetails[0].passengers[0].firstName + " " + roomDetails[0].passengers[0].lastName,
            "agreementId": variant.id,
            "agentReference": values.agentReference,
            "roomDetails": roomDetails,
            "features": []
        };
        store.setBookingRequest(request);

        API.post({
            url: API.ACCOMMODATION_BOOKING,
            body: request,
            after: (result, data) => {
                store.setBookingResult(result, data);
                setSubmitting(false);
            }
        });

        // todo: payment via user account wallet:
    //    this.setState({
    //        redirectToConfirmationPage: true
    //    });
    }

    render() {
        const { t } = useTranslation();

        if (!store.selected?.hotel?.id || !store.selected?.variant?.id)
            return null; //todo: another answer

        var hotel = store.selected.hotel,
            variant = store.selected.variant;

        if (this.state.redirectToConfirmationPage)
            return <Redirect push to="/accommodation/confirmation" />;

        return (

<React.Fragment>
    <div class="booking block">
        <section class="double-sections">
            <div class="left-section filters">
                <div class="static item">{t("Booking Summary")}</div>
                <div class="expanded">
                    <img src={hotel.picture.source} alt={hotel.picture.caption} class="round" />
                </div>
                <div class="static item no-border">
                    {hotel.name}
                </div>
                <div class="subtitle">
                    {hotel.location.address}
                    , {hotel.location.city}
                    , {hotel.location.country}
                </div>

                <div class="static item">{t("Your Reservation")}</div>
                <Dual
                    a={<span>Arrival<br/> Date</span>}
                    b={dateFormat.a(store.search.result.checkInDate)}
                />
                <Dual
                    a={<span>Departure<br/> Date</span>}
                    b={dateFormat.a(store.search.result.checkOutDate)}
                />
                <Dual
                    a={t("Number of Rooms")}
                    b={"1"}
                />

                <div class="static item">{t("Room Information")}</div>
                {[...Array(store.search.rooms)].map((x,i)=>(
                <Dual
                    a={t("Room Type") + " " + (store.search.rooms > 1 ? (i+1) : '')}
                    b={variant.rooms[i].type}
                />
                ))}
                { false && [<Dual
                    a={t("Board Basis")}
                    b={"Room Only"}
                />,
                <Dual
                    a={t("Occupancy")}
                    b={"2 Adults , 2 Children, Children Ages: 3, 14"}
                />] /* todo */ }

                <div class="static item">{t("Room & Total Cost")}</div>
                <Dual
                    a={t("Room Cost")}
                    b={price(variant.currencyCode, variant.price.total)}
                />
                <Dual
                    a={t("Total Cost")}
                    b={price(variant.currencyCode, variant.price.total)}
                />
                <div class="total-cost">
                    <div>{t("Reservation Total Cost")}</div>
                    <div>{price(variant.currencyCode, variant.price.total)}</div>
                </div>
            </div>
            <div class="right-section">
                <Breadcrumbs items={[
                    {
                        text: t("Search accommodation"),
                        link: "/search"
                    }, {
                        text: t("Guest Details")
                    }
                ]}/>
                <ActionSteps
                    items={[t("Search accommodation"), t("Guest Details"), t("Booking Confirmation")]}
                    current={1}
                />

                <Formik
                    initialValues={{
                        room: [...Array(store.search.rooms)].map((x,r) => ({
                            passengers: [
                                ...Array(store.search.request.roomDetails[r].adultsNumber),
                                ...Array(store.search.request.roomDetails[r].childrenNumber),
                            ]
                        }))
                    }}
                    validationSchema={accommodationBookingValidator}
                    onSubmit={this.submit}
                    render={formik => (
                        <form onSubmit={formik.handleSubmit}>
                            <div class="form">
                                <FieldArray
                                    render={() => (
                                formik.values.room.map((item, r) => (
                                <React.Fragment>
                                <h2>
                                    <span>Room {r+1}:</span> {variant.rooms[r].type}
                                </h2>
                                <div class="part">
                                    <table class="people"><tbody>
                                        <tr>
                                            <th><span class="required">{t("Title")}</span></th>
                                            <th><span class="required">{t("First Name")}</span></th>
                                            <th><span class="required">{t("Last Name")}</span></th>
                                        </tr>

                                        <FieldArray
                                            render={() => (
                                        <React.Fragment>
                                            {formik.values.room[r].passengers.map((item, index) => (
                                            <tr>
                                                <td>
                                                { index < store.search.request.roomDetails[r].adultsNumber ?
                                                    <FieldSelect formik={formik}
                                                        id={`room.${r}.passengers.${index}.title`}
                                                        placeholder={t("Please select one")}
                                                        options={[
                                                            { value: "Mr", text: t("Mr.")},
                                                            { value: "Ms", text: t("Ms.")},
                                                            { value: "Miss", text: t("Miss.")},
                                                            { value: "Mrs", text: t("Mrs.")}
                                                        ]}
                                                    /> :
                                                    <FieldText formik={formik}
                                                        id={`room.${r}.passengers.${index}.title`}
                                                        value={t("Child")}
                                                        disabled
                                                    />
                                                }
                                                </td>
                                                <td class="bigger">
                                                    <FieldText formik={formik}
                                                        id={`room.${r}.passengers.${index}.firstName`}
                                                        placeholder={t("Please enter first name")}
                                                        clearable
                                                    />
                                                </td>
                                                <td class="bigger">
                                                    <FieldText formik={formik}
                                                        id={`room.${r}.passengers.${index}.lastName`}
                                                        placeholder={t("Please enter last name")}
                                                        clearable
                                                    />
                                                </td>
                                            </tr>))}
                                        </React.Fragment>
                                        )} />
                                    </tbody></table>
                                </div>
                                </React.Fragment>)))} />

                                { /* todo
                                <div class="part">
                                    <div class="row no-margin">
                                        <div class="vertical-label">{t("Agent Reference")}</div>
                                        <FieldText formik={formik}
                                            id={"agent-reference"}
                                            placeholder={t("Please enter here")}
                                            clearable
                                        />
                                    </div>
                                    <div class="row">
                                        <div class="vertical-label">
                                            <div>{t("Extra Meal")} <span class="icon icon-info" /></div>
                                        </div>
                                        <FieldSwitch formik={formik}
                                            id={"extra-meal"}
                                        />
                                    </div>
                                    <div class="row">
                                        <div class="vertical-label">
                                            <div>{t("Special Request")} <span class="icon icon-info" /></div>
                                        </div>
                                        <FieldSwitch formik={formik}
                                            id={"special-request"}
                                        />
                                    </div>

                                    <FieldTextarea formik={formik}
                                        id="agentReference"
                                        placeholder={"Please enter your message"}
                                        label={t("Special Request")}
                                    />
                                </div>

                                <div class="part">
                                    <table class="checkboxes"><tbody>
                                        <tr>
                                            <td class="bigger"><FieldCheckbox formik={formik} label={"Request Interconnecting Rooms"} /></td>
                                            <td><FieldCheckbox formik={formik} label={"Request for an Early Check In"} /></td>
                                        </tr>
                                        <tr>
                                            <td class="bigger"><FieldCheckbox formik={formik} label={"Require a Smoking Room"} /></td>
                                            <td><FieldCheckbox formik={formik} label={"Request for a Late Check Out"} /></td>
                                        </tr>
                                        <tr>
                                            <td class="bigger"><FieldCheckbox formik={formik} label={"Require a Non Smoking Room"} /></td>
                                            <td><FieldCheckbox formik={formik} label={"Please note that Guest is a VIP"} /></td>
                                        </tr>
                                        <tr>
                                            <td class="bigger"><FieldCheckbox formik={formik} label={"Request Room on a Low Floor"} /></td>
                                            <td><FieldCheckbox formik={formik} label={"Please note that Guests are a Honeymoon Couple"} /></td>
                                        </tr>
                                        <tr>
                                            <td class="bigger"><FieldCheckbox formik={formik} label={"Request Room on a High Floor"} /></td>
                                            <td><FieldCheckbox formik={formik} label={"Request for a Baby Cot"} /></td>
                                        </tr>
                                        <tr>
                                            <td class="bigger"><FieldCheckbox formik={formik} label={"Request for Late Check-In"} /></td>
                                            <td />
                                        </tr>
                                    </tbody></table>
                                </div> */ }

                                <div class="payment method">
                                    <h2>{t("Please Select Payment Method")}</h2>
                                    <p>{t("You need to pay")}:
                                        <span class="value">{price(store.selected.variant.currencyCode, store.selected.variant.price.total)}</span>
                                    </p>
                                    <div class="list">
                                        <div class="item">
                                            {t("My Site Balance")} <span>{price(store.selected.variant.currencyCode, 0)}</span>
                                        </div>
                                        <div class="item selected">
                                            {t("Credit/Debit Card")}
                                            <img src="/images/other/visa.png" />
                                            <img src="/images/other/mc.png" />
                                        </div>
                                    </div>
                                </div>

                                { !store.booking.result.referenceCode && !formik.isSubmitting &&
                                    <div class="final">
                                        <button type="submit" class={"button" + (formik.isValid ? "" : " disabled")}>
                                            {t("Confirm booking")}
                                        </button>
                                    </div> }

                                { formik.isSubmitting && !store.booking.result.referenceCode &&
                                    <Loader /> }

                                { store.booking.result.referenceCode &&
                                    <Redirect to="/payment/form" /> }

                            </div>
                        </form>
                    )}
                />
            </div>
        </section>
    </div>
</React.Fragment>

    );
}
}

export default AccommodationBookingPage;
