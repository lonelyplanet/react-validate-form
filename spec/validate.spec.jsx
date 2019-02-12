import React from 'react';
import { shallow, mount } from 'enzyme';

import Validate from '../src/validate';
import validationRules from "../src/validationRules";

describe("Validate Component", () => {
  describe("Base state", () => {
    it("renders a Validate component", () => {
      const wrapper = shallow(
        <Validate>
          { () => {
            return null;
          }}
        </Validate>
      );

      expect(wrapper).toBeTruthy();
    });

    it("passes through an object", () => {
      let returnObject;

      const wrapper = shallow(
        <Validate>
          { (val) => {
            returnObject = val;
            return null;
          }}
        </Validate>
      );

      expect(typeof returnObject === "object").toBe(true);
    });

    it("returns an empty errorMessages object", () => {
      let returnObject;

      const wrapper = shallow(
        <Validate>
          { ({ errorMessages }) => {
            returnObject = errorMessages;
            return null;
          }}
        </Validate>
      );

      expect(typeof returnObject === "object").toBe(true);
    });

    it("defaults allValid to false", () => {
      let returnValue;

      const wrapper = shallow(
        <Validate>
          { ({ allValid }) => {
            returnValue = allValid;
            return null;
          }}
        </Validate>
      );

      expect(returnValue).toBe(false);
    });

    it("starts with no error count", () => {
      let returnValue;

      const wrapper = shallow(
        <Validate>
          { ({ errorCount }) => {
            returnValue = errorCount;
            return null;
          }}
        </Validate>
      );

      expect(returnValue).toBe(0);
    });
  });

  describe("Assign Validations", () => {
    it("accepts an object of validations as a prop", () => {
      const validations = {
        test: ["required"],
      };

      const wrapper = shallow(
        <Validate
          validations={validations}
        >
          { () => {
            return null;
          }}
        </Validate>
      );

      expect(wrapper.state().validations).toEqual(validations);
    });

    it("pulls validation assignments from input values", () => {
      const validations = {
        test: ["required", "min:3"],
      };

      const wrapper = shallow(
        <Validate>
          {() => (
            <input name="test" required min="3" />
          )}
        </Validate>
      );

      expect(wrapper.state().validations).toEqual(validations);
    });

    it("overwrites inline validation assignments with validations passed in with props", () => {
      const propValidations = {
        test: ["required"],
      };

      const wrapper = shallow(
        <Validate
          validations={propValidations}
        >
          {() => (
            <input name="test" min="3" />
          )}
        </Validate>
      );
      expect(wrapper.state().validations).toEqual(propValidations);
    });

    it("can assign validations to several inputs", () => {
      const expectedValidations = {
        test: ["required", "min:5"],
        test2: ["required", "email", "min:2"],
      };

      const wrapper = shallow(
        <Validate>
          {() => (
            <div>
              <input name="test" min="5" required />
              <input name="test2" min="2" type="email" required />
            </div>
          )}
        </Validate>
      );
      expect(wrapper.state().validations).toEqual(expectedValidations);
    });
  });

  describe("Input Validation", () => {
    it("shows no errors for text input without validations prop", () => {
      const wrapper = mount(
        <Validate>
          {({ validate }) => {
            return (
              <input
                type="text"
                onFocus={validate}
                name="test"
                defaultValue="test"
              />
            );
          }}
        </Validate>
      );

      wrapper.find("input").simulate("focus");
      expect(wrapper.state().errorCount).toEqual(0);
      expect(wrapper.state().allValid).toBe(true);
    });

    it("counts the total number of errors", () => {
      const wrapper = mount(
        <Validate>
          {({ validate }) => {
            return (
              <input
                onFocus={validate}
                name="test"
                defaultValue="test"
                min="5"
              />
            );
          }}
        </Validate>
      );

      wrapper.find("input").simulate("focus");
      expect(wrapper.state().errorCount).toEqual(1);
    });

    it("produces an error message when validations aren't met", () => {
      const wrapper = mount(
        <Validate>
          {({ validate }) => {
            return (
              <input
                onFocus={validate}
                name="test"
                defaultValue="test"
                min="5"
              />
            );
          }}
        </Validate>
      );

      wrapper.find("input").simulate("focus");
      expect(wrapper.state().errorMessages.test).toBeTruthy();
    });

    it("changes allValid to false if there are errors", () => {
      const wrapper = mount(
        <Validate>
          {({ validate }) => {
            return (
              <input
                onFocus={validate}
                name="test"
                defaultValue="test"
                min="5"
              />
            );
          }}
        </Validate>
      );

      wrapper.find("input").simulate("focus");
      expect(wrapper.state().allValid).toBe(false);
    });

    it("changes allValid to true if there are no errors", () => {
      const validations = {
        test: ["required", "min:4"]
      };

      const wrapper = mount(
        <Validate
          validations={validations}
        >
          {({ validate }) => {
            return (
              <input
                onFocus={validate}
                name="test"
                defaultValue="test"
              />
            );
          }}
        </Validate>
      );

      wrapper.find("input").simulate("focus");
      expect(wrapper.state().allValid).toBe(true);
    });
  });

  describe("Error Messages", () => {
    it("returns the proper default error messages", () => {

      const fieldName = "test";
      const invalidValue = "";
      const validations = {
        [fieldName]: ["required"],
      };
      const expectedErrorMessage = validationRules.required.message(fieldName)

      const wrapper = mount(
        <Validate
          validations={validations}
        >
          {({ validate }) => {
            return (
              <input
                onFocus={validate}
                name={fieldName}
                defaultValue={invalidValue}
              />
            );
          }}
        </Validate>
      );

      wrapper.find("input").simulate("focus");
      expect(wrapper.state().errorMessages[fieldName]).toContain(expectedErrorMessage);
    });

    it("returns error messages for validation rules that take an argument", () => {

      const fieldName = "test";
      const minAmount = 3;
      const invalidValue = "";
      const validations = {
        [fieldName]: [`min:${minAmount}`],
      };
      const expectedErrorMessage = [
        validationRules.min.message(minAmount)(fieldName),
      ];

      const wrapper = mount(
        <Validate
          validations={validations}
        >
          {({ validate }) => {
            return (
              <input
                onFocus={validate}
                name={fieldName}
                defaultValue={invalidValue}
              />
            );
          }}
        </Validate>
      );

      wrapper.find("input").simulate("focus");
      expect(wrapper.state().errorMessages[fieldName]).toEqual(expectedErrorMessage);
    });

    it("allows you to pass a plain object of key value instead of using event system", () => {

      const fieldName = "test";
      const minAmount = 3;
      const invalidValue = "";
      const validations = {
        [fieldName]: [`min:${minAmount}`],
      };
      const expectedErrorMessage = [
        validationRules.min.message(minAmount)(fieldName),
      ];

      const wrapper = mount(
        <Validate
          validations={validations}
        >
          {({ validate }) => {
            return (
              <input
                onFocus={() => validate({
                  name: fieldName,
                  value: invalidValue,
                })}
                name={fieldName}
                defaultValue={invalidValue}
              />
            );
          }}
        </Validate>
      );

      wrapper.find("input").simulate("focus");
      expect(wrapper.state().errorMessages[fieldName]).toEqual(expectedErrorMessage);
    });
  });

  describe("Custom Rules", () => {
    it("accepts custom rules", () => {
      const rules = {
        customRule: {
          test: () => {},
          message: () => {},
        },
      };

      const validations = {
        test: ["customRule"],
      };

      const wrapper = shallow(
        <Validate
          validations={validations}
          rules={rules}
        >
          {() => (
            <div>
              <input name="test" />
            </div>
          )}
        </Validate>
      );

      expect(wrapper.state().validations).toEqual(validations);
    });

    it("allows default messages to be overwritten by custom rules", () => {

      const fieldName = "test";
      const customMessage = "Some Custom Message";
      const invalidValue = "";
      const customRules = {
        required: {
          message: () => customMessage,
        },
      };
      const validations = {
        [fieldName]: ["required"],
      };
      const expectedErrorMessage = [
        customRules.required.message(),
      ];

      const wrapper = mount(
        <Validate
          validations={validations}
          rules={customRules}
        >
          {({ validate }) => {
            return (
              <input
                onFocus={validate}
                name={fieldName}
                defaultValue={invalidValue}
              />
            );
          }}
        </Validate>
      );

      wrapper.find("input").simulate("focus");
      expect(wrapper.state().errorMessages[fieldName]).toEqual(expectedErrorMessage);
    });

    it("tests input values agains custom rules", () => {

      const fieldName = "test";
      const customRuleName = "customRuleName";
      const customTest = val => val.indexOf("cool") >= 0;
      const validValue = "cool";
      const invalidValue = "not valid";
      const customRules = {
        [customRuleName]: {
          test: customTest,
          message: () => "Must conatin required value",
        },
      };
      const validations = {
        [fieldName]: [customRuleName],
      };
      const expectedErrorMessage = [
        customRules[customRuleName].message(),
      ];

      const validWrapper = mount(
        <Validate
          validations={validations}
          rules={customRules}
        >
          {({ validate }) => {
            return (
              <input
                onFocus={validate}
                name={fieldName}
                defaultValue={validValue}
              />
            );
          }}
        </Validate>
      );

      const invalidWrapper = mount(
        <Validate
          validations={validations}
          rules={customRules}
        >
          {({ validate }) => {
            return (
              <input
                onFocus={validate}
                name={fieldName}
                defaultValue={invalidValue}
              />
            );
          }}
        </Validate>
      );

      validWrapper.find("input").simulate("focus");
      invalidWrapper.find("input").simulate("focus");
      expect(validWrapper.state().errorMessages[fieldName]).not.toEqual(expectedErrorMessage);
      expect(invalidWrapper.state().errorMessages[fieldName]).toEqual(expectedErrorMessage);
    });
  });
});
