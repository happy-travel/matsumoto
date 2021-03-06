import Authorize from "./auth/authorize";
import React from "react";
import { isPageAvailableAuthorizedOnly, authSetToStorage, isSignUpRoutes } from "core/auth";
import { API } from "core";
import { initInvite } from "tasks/signup/invitation";
import { loadAgentSettings } from "tasks/utils/agent-settings";
import { searchCheckAndFix } from "tasks/accommodation/search-init-fix";
import { APR_VALUES } from "enum";
import { $ui, $personal, $notifications } from "stores";

export const initApplication = () => {
    initInvite();
    initHeader();
    searchCheckAndFix();
};

export const initAgent = () => {
    if (!isSignUpRoutes()) {
        API.get({
            url: API.AGENT,
            success: (result) => {
                if (result?.email) {
                    $personal.setInformation(result);
                    API.get({
                        url: API.AGENCY_APR_SETTINGS,
                        success: result => $personal.setAgencyAPR(APR_VALUES[result])
                    });
                }
            },
            after: (agent, error, response) => {
                if (!response)
                    return;
                if (response.status == 401 || response.status == 403) {
                    if (isPageAvailableAuthorizedOnly())
                        Authorize.signinRedirect();
                    return;
                }
                if (response.status == 400 && "Could not get agent data" == error?.detail) {
                    if (isPageAvailableAuthorizedOnly()) {
                        $notifications.closeAllNotifications();
                        window.location.href = window.location.origin + "/signup";
                    }
                } else
                    authSetToStorage(agent);
            }
        });

        loadAgentSettings();
    }

    API.get({
        url: API.BASE_VERSION,
        success: result => {
            if ($ui.currentAPIVersion != result ||
                !$ui.regions?.length ||
                !$ui.currencies?.length
            ) {
                API.get({
                    url: API.BASE_REGIONS,
                    success: (result) => $ui.setRegions(result)
                });
                API.get({
                    url: API.BASE_CURRENCIES,
                    success: (result) => $ui.setCurrencies(result)
                });
                API.get({
                    url: API.OUR_COMPANY,
                    success: (result) => $ui.setOurCompanyInfo(result)
                });
            }
            $ui.setCurrentAPIVersion(result)
        }
    });
};

const initHeader = () => {
    const modifyHeaderOnScroll = () => {
        const distanceY = window.pageYOffset || document.documentElement.scrollTop,
            shrinkOn = 80,
            headerEl = document.getElementsByTagName("header")?.[0];

        if (!headerEl)
            return;

        if (distanceY > shrinkOn) {
            headerEl.classList.add("fixed");
        } else {
            headerEl.classList.remove("fixed");
        }
    };

    window.addEventListener('scroll', modifyHeaderOnScroll);
};
