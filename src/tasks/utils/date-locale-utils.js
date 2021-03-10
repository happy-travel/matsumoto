import React from "react";
import { windowLocalStorage } from "core/misc/window-storage";

const getLocale = () => windowLocalStorage.get("locale");

const WEEKDAYS_LONG = {
    en: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ],
    ar: [
        "الأحد",
        "الإثنين",
        "الثلاثاء",
        "الأربعاء",
        "الخميس",
        "الجمعة",
        "السبت"
    ],
};
const WEEKDAYS_SHORT = {
    en: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    ar: [
        "الأحد",
        "الإثنين",
        "الثلاثاء",
        "الأربعاء",
        "الخميس",
        "الجمعة",
        "السبت",
    ],
};
const MONTHS = {
    en: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ],
    ar: [
        "يناير",
        "فبراير",
        "مارس",
        "أبريل",
        "مايو",
        "يونيو",
        "يوليو",
        "أغسطس",
        "سبتمبر",
        "أكتوبر",
        "نوفمبر",
        "ديسمبر"
    ],
};

const FIRST_DAY = {
    en: 1,
    ar: 0,
};

const formatDay = (d) => {
    const locale = getLocale();
    return `${WEEKDAYS_LONG[locale][d.getDay()]}, ${d.getDate()} ${
        MONTHS[locale][d.getMonth()]
    } ${d.getFullYear()}`;
};

const formatMonthTitle = (d) => {
    const locale = getLocale();

    return (
        MONTHS[locale][d.getMonth()] +
        (d.getFullYear() !== new Date().getFullYear() ?
            " " + d.getFullYear() :
            ""
        )
    );
};

const formatWeekdayShort = (i) => {
    const locale = getLocale();
    return WEEKDAYS_SHORT[locale][i];
};

const formatWeekdayLong = (i) => {
    const locale = getLocale();
    return WEEKDAYS_LONG[locale][i];
};

const getFirstDayOfWeek = () => {
    const locale = getLocale();
    return FIRST_DAY[locale];
};

const getMonths = () => {
    const locale = getLocale();
    return MONTHS[locale];
};

const localeUtils = {
    formatDay,
    formatMonthTitle,
    formatWeekdayShort,
    formatWeekdayLong,
    getFirstDayOfWeek,
    getMonths
};

export default localeUtils;