import moment from "moment";

export const dateFormat = {
    a: date => !date ? '' : moment(date).format("ddd, DD MMMM YYYY"),
    b: date => !date ? '' : moment(date).format("DD/MM/YYYY"),
    c: date => !date ? '' : moment(date).format("DD.MM.YYYY")
};

export const decorate = {
    cutFirstPart: (str, firstPart) => {
        if (!firstPart || !str)
            return '';
        if (str.slice(0, firstPart.length).toUpperCase() == firstPart.toUpperCase())
            return str.slice(firstPart.length, str.length);
        return '';
    }
};

export const hotelStars = [, "OneStar", "TwoStars", "ThreeStars", "FourStars", "FiveStars"];
