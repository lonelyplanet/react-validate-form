import { emailRegEx } from "./regExRules";

const validationRules = {
  required: {
    test: val => val.length > 0,
    message: name => `${name} is required.`,
  },
  email: {
    test: val => emailRegEx.test(val),
    message: name => `${name} must be a valid email.`,
  },
  min: {
    test: arg => val => val.length >= arg,
    message: arg => name => `${name} must be at least ${arg} characters.`,
  },
  max: {
    test: arg => val => val.length <= arg,
    message: arg => name => `${name} must be less than ${arg} characters.`,
  },
  equalTo: {
    test: compareTo => (val, allValues) => allValues[compareTo] === val,
    message: compareTo => name => `${name} does not match ${compareTo}`,
  },
};


export default validationRules;
