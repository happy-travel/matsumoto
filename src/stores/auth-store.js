import React from "react";
import { observable, action } from "mobx";
import autosave from "core/misc/autosave";
import { RenderTheApp } from "../";
import { StorageUserIdKey } from "core/storage";

const defaultUserSettings = {
    "preferredLanguage": '',
    "weekStartOn": '',
    "availableCredit": false,
    "nationality": '',
    "nationalityName": '',
    "residency": '',
    "residencyName": '',
};

class AuthStore {
    @observable registration = {
        "customer": {},
        "company": {}
    };

    @observable user = {
        "email": null,
        "lastName": null,
        "firstName": null,
        "title": null,
        "position": null
    };

    @observable userSettings = defaultUserSettings;

    @observable userCache = null;
    @observable cachedUserRegistered = false;

    constructor() {
        autosave(this, "_auth_store_cache");
    }

    setUser(value) {
        this.user = value;
    }

    setUserForm(form) {
        this.registration.customer = form;
    }

    setCompanyForm(form) {
        this.registration.company = form;
        if (this.registration.company.phone)
            this.registration.company.phone = this.registration.company.phone.replace(/\D/g,''); //todo: make decorators
    }

    setCountryValue(country) {
        this.registration.company.countryCode = country.code;
    }

    setUserCache(newUserCache) {
        var rerenderNeeded = this.userCache?.access_token != newUserCache?.access_token;

        if (newUserCache?.profile?.email)
            window.localStorage.setItem(StorageUserIdKey, btoa(newUserCache.profile?.email));
        else
            window.localStorage.removeItem(StorageUserIdKey);

        if (newUserCache?.access_token)
            this.userCache = {
                access_token: newUserCache?.access_token
            };
        else {
            this.userCache = null;
            this.cachedUserRegistered = false;
        }
        if (rerenderNeeded)
            RenderTheApp();
    }

    setCachedUserRegistered(value) {
        this.cachedUserRegistered = value;
    }

    @action.bound
    setUserSettings(result) {
        this.userSettings = result || defaultUserSettings;
    }
}

export default new AuthStore();
