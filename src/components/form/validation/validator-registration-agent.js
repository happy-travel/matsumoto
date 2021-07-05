import * as Yup from "yup";

export const emailForm =  {
    email: Yup.string()
        .email("Incorrect email")
        .required("Required"),
};

export const agencyNameForm =  {
    agencyName: Yup.string()
        .required("Required"),
};

const validator = {
    firstName: Yup.string()
        .max(50, "Too long")
        .required("Required"),
    lastName: Yup.string()
        .max(50, "Too long")
        .required("Required"),
    title: Yup.string()
        .required("Required"),
    position: Yup.string()
        .required("Required"),
};

export default Yup.object().shape(validator);

export const emailFormValidator = Yup.object().shape(emailForm);

export const registrationAgentValidatorWithEmail = Yup.object().shape({
    ...validator,
    ...emailForm,
    roleIds: Yup.mixed()
        .test('roles', 'At least one role required', roleIds => {
            return Object.keys(roleIds).some(key => roleIds[key])
        })
});

export const registrationAgentValidatorWithEmailAndAgencyName = Yup.object().shape({
    ...validator,
    ...emailForm,
    ...agencyNameForm
});
