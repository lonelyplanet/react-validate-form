# React Validate Form

Wraps any number of inputs using a function as a child component and validates them on either a set of built in rules or custom rules that can be passed in. The child of the Validation component must be a function and that function is passed several arguments to work with.

## Installation
``` npm install react-validate-form```

``` import Validate from "react-validate-form"```

## Basic Usage
```javascript
  <Validate>
      {({ validate, errorMessages }) => (
          <Fragment>
              <input onChange={validate} name="first" required />
              <p>{errorMessages.first[0]}</p>
          </Fragment
      )}
 </Validate>
```

The function that is called in the body of the `Validate` component is passed on object that contains:

- `validate`:

  a function that can be attached to any input event in order to validate that input. The event is passed through and the Validation component validates based on the rules passed in
- `errorMessages`:

  an object of errorMessages. Keys are based on the inputs `name` field. An input with `name="first"` an access error messages from `errorMessages.first`
- `allValid`:

  a boolean telling you if all fields attached to the validator are valid
- `errorCount`:

  total error count

The above example calls the `validate` function when the onChange event occurs on that input, but the `validate` function can be triggered from any event that you can dream of.

Since the `required` attribute exists on the input, any time the `validate` function is fired the value of that input will be tested against that validation rule.

In the instance that the input fails validation then an object with the key of the input `name` will exist inside of the `errorMessages` object. In the above example, since the input has the attribute `name="first"` an array of errors will exist on `errorMessages.first`

## Built In Rules
- `required`

  add to an input by either having the `required` attribute or by passing in [validation object prop](#valditionProp) `["required"]`
- `email`

  add to an input by either having the `type="email"` attribute or by passing in [validation object prop](#valditionProp) `["email"]`
- `min`

  add to an input by either having the `min="3"` attribute or by passing in [validation object prop](#valditionProp) `["min:3"]`
- `max`

  add to an input by either having the `max="5"` attribute or by passing in [validation object prop](#valditionProp) `["max:5"]`



## Props

### `validations`

Another way to assign validation rules to inputs besides inline on the input is by passing in an object that maps the keys to an array of validation rules that are required for that input. The keys need to match the `name` field on the inputs.
```javascript
   const validations = {
    firstName: ["required"],
    email: ["required", "email"],
    password: ["required", "min:3", "max:15"],
   }

   <Validate
    validations={validations}
   >
    ...
   </Validate>
```
The validation rules are passed in as strings and MUST match either one of the [built in rules](#) or a [custom defined rule](#)

#### Rules with arguments
Some built in rules and any custom rules have the ability to take arguments. For example the built in rule for `min:3` Passes the argument `3` into both the `test` function and `message` function.
Rules with arguments are :

- `min`
- `max`

Creating your own rules that take arguments will need to define both the `test` function and `message` function a bit differently.
See [creating rules with arguments](#)

### `rules`

You are not limited to just the built in rules. You can create your own by passing in a rules object. The `key` used to define each rule will be the string that is needed to assign your new rule to a validation.

A `rule` is itself an object and must contain two properties:

- `test`

  a function that takes the value of the input being tested as an argument  and return a `boolean`. `true` if the value is valid, `false` if it is not.
- `message`

  a function that takes the both the `name` of the input field and its current value, and returns a message. This is the error message that is returned in the event that the `test` function returns false.

  ```javascript
     const rules = {
        customRule: {
          test: (val) => val.indexOf("cool") >= 0,
          message: (field, val) => `${field} should contain the word cool. Check the value ${val}`,
        },
       };

      const validations = {
        firstName: ["required", "customRule"],
      };

      <Validate
       validations={validations}
       rules={rules}
      >
       ...
      </Validate>
  ```

You can also overwrite just a `test` or `message` of any [built in rule](#) by just passing in the function you need to replace

```javascript
    const rules = {
      required: {
        message: (field) => `${field} should be required and this message is custom`,
      },
     };
    const validations = {
      firstName: ["required"],
    };

    <Validate
     validations={validations}
     rules={rules}
    >
     ...
    </Validate>
```

#### Creating Rules With Arguments

A rule that accepts an argument like `min:3` can also be created as a custom rule but with an extra step. You have to curry your functions to take the argument first and then return a function that takes the value.

```javascript
     customMin: {
      test: (arg) => (val) => val.length >= arg,
      message: (arg) => (name) => `${name} must be at least ${arg} characters.`,
    },
```
