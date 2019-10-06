import React from 'react';
import { Route, Switch } from "react-router-dom";

import accommodationTitle         from 'pages/accommodation/title';
import accommodationVariants      from 'pages/accommodation/variants';
import accommodationBooking       from 'pages/accommodation/booking';
import accommodationConfirmation  from 'pages/accommodation/confirmation';

import accountRegistrationStep2   from "pages/account/registration-step-2";
import accountRegistrationStep3   from "pages/account/registration-step-3";
import bookingManagement          from "pages/account/booking-management";

import contactUsPage              from 'pages/common/contact';
import termsPage                  from 'pages/common/terms';
import privacyPage                from 'pages/common/privacy';
import aboutUsPage                from 'pages/common/about';

import errorPage   from "pages/common/error";
import devAuthPage from "pages/account/odawara/confirmation";

export const routesWithSearch = [
    "/",
    "/search"
];
export const routesWithHeaderAndFooter = [
    ...routesWithSearch,
    "/accommodation/booking",
    "/accommodation/confirmation",
    "/contact", "/terms", "/privacy", "/about",
    "/user/booking"
];

const Routes = () => (
    <Switch>
        <Route exact path="/"                     component={accommodationTitle} />
        <Route path="/search"                     component={accommodationVariants} />
        <Route path="/accommodation/booking"      component={accommodationBooking} />
        <Route path="/accommodation/confirmation" component={accommodationConfirmation} />

        <Route path="/signup/user"                component={accountRegistrationStep2} />
        <Route path="/signup/company"             component={accountRegistrationStep3} />
        <Route path="/user/booking"               component={bookingManagement} />

        <Route path="/contact"                    component={contactUsPage} />
        <Route path="/terms"                      component={termsPage} />
        <Route path="/privacy"                    component={privacyPage} />
        <Route path="/about"                      component={aboutUsPage} />

        <Route path="/dev/auth" component={devAuthPage} />

        <Route path="/auth" component={null} />
        <Route component={errorPage} />
    </Switch>
);

export default Routes;
