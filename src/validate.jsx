import React, { Component } from "react";
import PropTypes from "prop-types";
import merge from "lodash/merge";
import union from "lodash/union";
import validationRules from "./validationRules";
import createValidationRulesFromInput from "./createValidationRulesFromInput";

const _ = { merge, union };


class Validate extends Component {
  static checkErrorCount(errorObject) {
    return Object.keys(errorObject).length &&
      Object.keys(errorObject).reduce((acc, curr) => {
        const total = acc += Object.keys(errorObject[curr]).length;
        return total;
      }, 0);
  }

  constructor(props) {
    super(props);

    this.state = {
      errorMessages: {},
      argumentSeperator: ":",
      allValid: false,
      errorCount: 0,
      values: {}
    };

    this.handleValidate = this.handleValidate.bind(this);
    this.testForValidation = this.testForValidation.bind(this);
  }

  componentWillMount() {
    const validations = _.merge(
      {},
      createValidationRulesFromInput(this.renderChildren()),
      this.props.validations,
    );

    this.setState({
      validations,
    });
  }

  handleValidate(e) {
    let fieldName = "";
    let fieldValue = "";

    if (e.target) {
      fieldName = e.target.name;
      fieldValue = e.target.value;
    } else {
      fieldName = e.name;
      fieldValue = e.value;
    }

    this.validateField(fieldName,fieldValue)
  }

  validateField(fieldName,fieldValue,overrideValidations)
  {
    const fieldErrorMessages = this.testForValidation(fieldName, fieldValue,overrideValidations);
    this.setState((currentState) => {
        const allErrors = Object.assign(
            {},
            currentState.errorMessages,
            { [fieldName]: fieldErrorMessages },
        );
        const errorCount = Validate.checkErrorCount(allErrors);
        let values = currentState.values
        values[fieldName] = fieldValue;
        
        return { errorMessages: allErrors,
        errorCount,
        values: values,
        allValid: errorCount === 0
    }});

    return !fieldErrorMessages.length
  }

  validateAll()
  {
      return Object.keys(this.state.validations).reduce(
          (currentValue,fieldName) => 
              {
                  let v = this.validateField(fieldName,this.state.values[fieldName])
                  return currentValue && v;
              }
          ,true)
  }


  ruleHasArgument(rule) {
    return rule.indexOf(this.state.argumentSeperator) >= 0;
  }

  testForValidation(field, value,overrideValidations) {
    const fieldRequirements = overrideValidations || this.state.validations[field];

    // combine both the built in rules and custom rules
    const combinedValidationRules = _.merge({}, validationRules, this.props.rules);

    return fieldRequirements && fieldRequirements.map(rule => {
      if (this.ruleHasArgument(rule)) {
        const [funcName, arg] = rule.split(this.state.argumentSeperator);
        return (
          combinedValidationRules[funcName] &&
          !combinedValidationRules[funcName].test(arg)(value,this.state.values,field) &&
          combinedValidationRules[funcName].message(arg)(field, value,this.state.values,field)
        );
      }
      return (
        combinedValidationRules[rule] &&
        !combinedValidationRules[rule].test(value,this.state.values,field) &&
        combinedValidationRules[rule].message(field, value,this.state.values,field)
      );
    }).filter(val => val);
  }

  renderChildren() {
    return this.props.children({
      validate: this.handleValidate,
      errorMessages: this.state.errorMessages,
      allValid: this.state.allValid,
      errorCount: this.state.errorCount,
    });
  }

  render() {
    return this.renderChildren();
  }
}

Validate.propTypes = {
  children: PropTypes.func.isRequired,
  validations: PropTypes.objectOf(PropTypes.array),
  rules: PropTypes.shape({
    test: PropTypes.func,
    message: PropTypes.func,
  }),
};

Validate.defaultProps = {
  validations: {},
  rules: {},
};

export default Validate;
