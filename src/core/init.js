import Authorize from "./auth/authorize";
import React from "react";
import { isPageAvailableAuthorizedOnly, userAuthSetToStorage, isSignUpRoutes } from "core/auth";
import { API } from "core";
import { initInvite } from "core/auth/invite";
import dropdownToggler from "components/form/dropdown/toggler";
import { loadUserSettings } from "simple/logic/user-settings";

import UI from "stores/ui-store";
import authStore, { APR_VALUES } from "stores/auth-store";

export const initApplication = () => {
    initInvite();
    dropdownToggler();
};

export const initUser = () => {
    if (!isSignUpRoutes()) {
        API.get({
            url: API.USER,
            success: (result) => {
                if (result?.email) {
                    authStore.setUser(result);
                    API.get({
                        url: API.AGENCY_APR_SETTINGS,
                        success: result => authStore.setAgencyAPR(APR_VALUES[result])
                    });
                }
            },
            after: (user, error, response) => {
                if (!response)
                    return;
                if (response.status == 401 || response.status == 403) {
                    if (isPageAvailableAuthorizedOnly())
                        Authorize.signinRedirect();
                    return;
                }
                if (response.status == 400 && "Could not get agent data" == error?.detail) {
                    if (isPageAvailableAuthorizedOnly())
                        window.location.href = window.location.origin + "/signup/agent";
                } else
                    userAuthSetToStorage(user);
            }
        });

        loadUserSettings();
    }

    API.get({
        url: API.BASE_VERSION,
        success: result => {
            if (UI.currentAPIVersion != result ||
                !UI.regions?.length ||
                !UI.currencies?.length
            ) {
                API.get({
                    url: API.BASE_REGIONS,
                    success: (result) => UI.setRegions(result)
                });
                API.get({
                    url: API.BASE_CURRENCIES,
                    success: (result) => UI.setCurrencies(result)
                });
                API.get({
                    url: API.OUR_COMPANY,
                    success: (result) => UI.setOurCompanyInfo(result)
                });
            }
            UI.setCurrentAPIVersion(result)
        }
    });
};
