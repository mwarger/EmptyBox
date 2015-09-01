webpackJsonp([13],{340:function(e,t){e.exports='# Nailing that validation with React JS\n\nValidation is complex. Validation is extremely complex. I think it is right up there at the top of implementations we misjudge regarding complexity. So why is validation so difficult in general? How could we implement this with React JS? And do you get a prize for reading through this article? ... yep, you do! Look forward to a virtual cookie at the bottom of this article, you will definitely deserve it ;-)\n\nAt my employer, Gloppen EDB Lag, we are building a React JS component framework for application development. We have everything from grids and panels to calendars and forms. Think of it as [React Bootstrap](http://react-bootstrap.github.io/), but with bigger parts specific to our applications. So we have lots of forms in our applications and we needed a form that could handle both user input validation, server validation and be very flexible with the contents of the form.\n\nThis article will explain the challenges and the thought process of building such a form component. Forms and validation is complex no matter what framework you use, and even though we look at React JS here, the same principles goes for all frameworks.\n\nAs a result of writing this article I built an extension to React JS, [formsy-react](https://github.com/christianalfoni/formsy-react)... and the same concept implemented for Angular JS: [formsy-angular](https://github.com/christianalfoni/formsy-angular). This is a small extension that I think nails that "sweet spot" between flexibility and reuseability of building forms in your application and still get all the difficult wiring of validation for free.\n\n### Validation in general\nValidation is most often related to forms and that is what we are going to focus on here. First of all we have to divide our validation into two:\n\n  1. Client side validation\n  2. Server side validation\n  \nYou should of course always have server side validation, but to improve user experience we validate on the client side also. Bringing client side validation into forms has seriously made them more complex. It is not just the concept of handling validation state in the form, but we also have many different ways of indicating the actual validation error.\n\n  1. Red border on the input\n  2. Tooltip\n  3. Text to the right\n  4. Text underneath\n  5. Text on each form element or general text at the top... or bottom\n  6. Lock submit button until form is valid\n  \nIf that is not enough, we also have a choice of handling validation as we type/blur and not just when submitting the whole form. And even worse, the form should not validate the inputs initially, except if you pass initial values or you have set that input as required.\n\n### A scaling related question\nA form... is it view state or is it application state? Let me explain that in more detail. View state is handled in the controller of your UI. In Angular JS this would be the controller, in React JS it is the component and in Backbone JS it would be the View. Application state is handled further up in your application architecture. In Angular that would be a service, in React JS (with flux) it is a store and in Backbone JS it would have to be something you made up yourself. So, if nothing else in the application cares about the form we only need to care about view state. If some other part of the application cares about the state of the form, we have to implement application state.\n\nSo what is the case? View state or application state? In my experience a form is a completely isolated implementation, which means the only thing that cares about the form is the view (component). In Angular JS and Backbone JS that might not be such a hard choice, as you really do not have a strong concept of application state, but with React JS and FLUX it is a very important question to answer. Jump ahead to [**"Lets get an overview"**](#overview) if the FLUX part does not interest you.\n\n#### React JS FLUX form validation\nIf you decided that the form was application state you would have to trigger an action to save the form, have a validation state in your store and you would have to grab that state when the request to the server was responded and the store emitted a change. This requires more implementation and most certainly more implementation than you really need. Another thing is that you would still have view state because the user input validation does not have anything to do with the store. Lets visualize just the server validation part:\n\n```javascript\n\n| FLUX - Application state |\n\n                    |------------|\n  |---------------> | DISPATCHER | // 3. Pass submit to store\n  |                 |------------|\n  |                       |\n  |                   |-------|\n  |                   | STORE | // 4. Save to server, update state and emit change\n  |                   |-------|\n  |                       |\n  |                 |-----------|\n  |                 | COMPONENT | // 1. Get server validation state\n  | 2. submit form  |-----------|\n  |-----------------------|\n  \n```\n\nThis is of course a bigger implementation than:\n\n```javascript\n\n| FLUX - Component state |\n\n  |-----------|\n  | COMPONENT | // Submit, update state based on server response and update component\n  |-----------|\n\n```\n\nSo I personally believe validation should be handled within the component, which of course is the simpler, but again least scalable solution. That said you can still notify your stores about the state of the form. You can add success and error handler to your form that triggers an action:\n\n```javascript\n\n| FLUX - Application state |\n\n                 |------------|\n  |------------> | DISPATCHER | // 3. Pass action to store\n  |              |------------|\n  |                    |\n  |                |-------|\n  |                | STORE | // 4. Toggle some state based on success/error\n  |                |-------|\n  |                    |\n  |              |-----------|\n  |              | COMPONENT | // 1. Send success/error action on server response when form submitted\n  | 2. action    |-----------|\n  |--------------------|\n  \n```\n\nSo to summarise. An isolated component is the way to go here.\n\n### Lets get an overview\n\nOkay, so what we want to do is create a generic form component for our application. The form itself should have a valid/invalid state and its inputs should also have individual valid/invalid states. We also want validation in both directions:\n\n```javascript\n\n| FORM - Validation |\n\n|--------|\n| SERVER |\n|--------|\n    |\n    | // Is form valid?\n    |\n|------|\n| FORM |\n|------|\n    |\n    | // Is input valid?\n    |\n|--------|\n| INPUTS |\n|--------|\n\n```\n\nWhen we change our inputs we want to validate the inputs themselves. If they turn out to be invalid we want to go up to the form and make the form invalid also. But also posting the form to the server could cause invalid state of the form, and we want that to propagate down to the specific inputs. An example of this would be inserting a username in an input. The validation of the input itself could be that the value is required and on the server it checks if the username is actually available. Regardless of where it fails we need to tell both the form and the specific input about it.\n\nAnd this is where things are really getting tricky. How you choose to design validation user experience is a matter of choice, but wiring up all the validation can be a daunting task.\n\n### So how do we go about handling this?\nWell, we want this to be generic. So first of all we need our own form component and then we need our own input components. We will only look at a typical input in this article, but you can use the same principal on any kind of component you want to build. \n\nLet us take a quick look at how we want to use these two components:\n\n```javascript\n\nvar MyApplicationForm = React.createClass({\n  changeUrl: function () {\n    location.href = \'/success\';\n  },\n  render: function () {\n    return (\n      <App.Form url="/emails" onSuccess={this.changeUrl}>\n        <div className="form-group">\n          <label>Email</label>\n          <App.Input name="email" validations="isEmail" validationError="This is not a valid email"/>\n        </div>\n      </App.Form>\n    );\n  }\n});\n```\n\nWe create a generic form component that takes a url and an onSuccess handler. The children of the form can be anything, making it easier to implement different forms in your application. The input takes a name, that will result in the property/attribute passed to your server, and finally it has a validation description and validation error text. The validation error text is defined on the input itself because the validation rule does not translate directly to an error message. The same validation rule might give different validation error messages in different contexts and you might need to handle multiple languages.\n\nLets define our form as a component first:\n\n```javascript\n\nvar Form = React.createClass({\n  render: function () {\n    return (\n      <form>\n        {this.props.children}\n        <button type="submit">Submit</button>\n      </form>\n    );\n  }\n});\n```\n\nSo our form currently wraps the children with a form element and adds a submit button at the bottom. What we want to do first is create a relationship between the form component and any input child components. We have to create this relationship because we want our form to validate when inputs change and we want inputs to validate when the form gets an error form the server. But we want it to be smart, we want it to be dynamic, because you can have any number of nested children in your form. So lets see how we can solve this.\n\n#### Traversing children\nWhat we want to do is traverse the children of the form and create a registry of inputs inside the App.Form component:\n\n```javascript\n\nvar Form = React.createClass({\n  componentWillMount: function () {\n    this.inputs = {}; // We create a map of traversed inputs\n    this.registerInputs(this.props.children); // We register inputs from the children\n  },\n  registerInputs: function (children) {\n    \n    // A React helper for traversing children\n    React.Children.forEach(children, function (child) {\n    \n      // We do a simple check for "name" on the child, which indicates it is an input.\n      // You might consider doing a better check though\n      if (child.props.name) {\n      \n        // We attach a method for the input to register itself to the form\n        child.props.attachToForm = this.attachToForm;\n        \n        // We attach a method for the input to detach itself from the form\n        child.props.detachFromForm = this.detachFromForm;\n      }\n      \n      // If the child has its own children, traverse through them also...\n      // in the search for inputs\n      if (child.props.children) {\n        this.registerInputs(child.props.children);\n      }\n    }.bind(this));\n  },\n  \n  // All methods defined are bound to the component by React JS, so it is safe to use "this"\n  // even though we did not bind it. We add the input component to our inputs map\n  attachToForm: function (component) {\n    this.inputs[component.props.name] = component;\n  },\n  \n  // We want to remove the input component from the inputs map\n  detachFromForm: function (component) {\n    delete this.inputs[component.props.name];\n  },\n  render: function () {\n    return (\n      <form>\n        {this.props.children}\n        <button type="submit">Submit</button>\n      </form>\n    );\n  }\n});\n```\n\nSo now all input children will get two methods from the form. One to register and one to unregister. The next thing we want to implement is an internal model in the form. The model will keep track of all the values from the inputs, so that when the form is submitted it will submit it with the values of the inputs. The name of the inputs will be the key.\n\n#### Adding a model\n\n```javascript\n\nvar Form = React.createClass({\n  componentWillMount: function () {\n    this.model = {}; // We add a model to use when submitting the form\n    this.inputs = {};\n    this.registerInputs(this.props.children);\n  },\n  registerInputs: ...\n  attachToForm: function (component) {\n    this.inputs[component.props.name] = component;\n    \n    // We add the value from the component to our model, using the\n    // name of the component as the key. This ensures that we\n    // grab the initial value of the input\n    this.model[component.props.name] = component.state.value;\n  },\n  detachFromForm: function (component) {\n    delete this.inputs[component.props.name];\n    \n    // We of course have to delete the model property\n    // if the component is removed\n    delete this.model[component.props.name];\n  },\n  render: ...\n});\n```\n\nOkay, I think it is a good idea to create our App.Input component now to see this first part in action. Then we will move on to communicating with the server and finish this whole thing up with validation.\n\n#### The App.Input component\nThere is not really much to it. We create an input that will use our attachToForm and detachFromForm methods and update its value state when changing the value of the input.\n\n```javascript\n\nvar Input = React.createClass({\n  \n  // Create an initial state with the value passed to the input\n  // or an empty value\n  getInitialState: function () {\n    return {\n      value: this.props.value || \'\'\n    };\n  },\n  componentWillMount: function () {\n    this.props.attachToForm(this); // Attaching the component to the form\n  },\n  componentWillUnmount: function () {\n    this.props.detachFromForm(this); // Detaching if unmounting\n  },\n  \n  // Whenever the input changes we update the value state\n  // of this component\n  setValue: function (event) {\n    this.setState({\n      value: event.currentTarget.value\n    });\n  },\n  render: function () {\n    return (\n      <input type="text" name={this.props.name} onChange={this.setValue} value={this.state.value}/>\n    );\n  }\n});\n```\n\nSo now we have an input that works with our form. Let us create the submit method.\n\n#### Submitting the form\n\n```javascript\n\nvar Form = React.createClass({\n  componentWillMount: ...\n  registerInputs: ...\n  attachToForm: ...\n  detachFromForm: ...\n  \n  // We need a method to update the model when submitting the form.\n  // We go through the inputs and update the model\n  updateModel: function (component) {\n    Object.keys(this.inputs).forEach(function (name) {\n      this.model[name] = this.inputs[name].state.value;\n    }.bind(this));\n  },\n  \n  // We prevent the form from doing its native\n  // behaviour, update the model and log out the value\n  submit: function (event) {\n    event.preventDefault();\n    this.updateModel();\n    console.log(this.model);\n  },\n  \n  // And we add our submit method to onSubmit\n  render: function () {\n    return (\n      <form onSubmit={this.submit}>\n        {this.props.children}\n        <button type="submit">Submit</button>\n      </form>\n    );\n  }\n});\n```\n\nAnd the syntax so far for building the form:\n\n```javascript\n\nvar MyApplicationForm = React.createClass({\n  render: function () {\n    return (\n      <App.Form>\n        <div className="form-group">\n          <label>Email</label>\n          <App.Input name="email"/>\n        </div>\n      </App.Form>\n    );\n  }\n});\n```\n\nWhen I type "some@email.com" in the input and submit the form we see: { email: "some@email.com" }, in our log. That is great! Lets move on to actually submitting this data to the server.\n\n#### Sending the model to the server\n\n```javascript\n\nvar Form = React.createClass({\n  componentWillMount: ...\n  registerInputs: ...\n  attachToForm: ...\n  detachFromForm: ...\n  updateModel: ...\n  \n  // Just using some fake ajax service here to post the model to\n  // the url set on the form. On sucess it wil run the onSuccess method.\n  // Depending on your app you probably want to verify that the method actually exists\n  submit: function (event) {\n    event.preventDefault();\n    this.updateModel();\n    MyAjaxService.post(this.props.url, this.model)\n      .then(this.props.onSuccess);\n  },\n  render: ...\n});\n```\n\nNow I want to take a minute to make sure that we give a good user experience. When submitting this form it will probably take a little bit of time before we get a response. Let us make sure that the form does not allow you to click submit again. Lets create a isSubmitting state on our form.\n\n#### Submitting\n```javascript\n\nvar Form = React.createClass({\n  getInitialState: function () {\n    return {\n      isSubmitting: false\n    };\n  },\n  componentWillMount: ...\n  registerInputs: ...\n  attachToForm: ...\n  detachFromForm: ...\n  updateModel: ...\n  \n  // We change the state of the form before submitting\n  submit: function (event) {\n    event.preventDefault();\n    this.setState({\n      isSubmitting: true\n    });\n    this.updateModel();\n    MyAjaxService.post(this.props.url, this.model)\n      .then(this.props.onSuccess);\n  },\n  \n  // We disable the button if the form is submitting\n  render: function () {\n    return (\n      <form onSubmit={this.submit}>\n        {this.props.children}\n        <button type="submit" disabled={this.state.isSubmitting}>Submit</button>\n      </form>\n    );    \n  }\n});\n```\n\nAnd now our form supports:\n\n```javascript\n\nvar MyApplicationForm = React.createClass({\n  changeUrl: function () {\n    location.href = \'/success\';\n  },\n  render: function () {\n    return (\n      <App.Form url="/emails" onSuccess={this.changeUrl}>\n        <div className="form-group">\n          <label>Email</label>\n          <App.Input name="email"/>\n        </div>\n      </App.Form>\n    );\n  }\n});\n```\n\nNow we are getting somewhere! Lets get going with validation.\n\n### Adding validation\n\nSo there are a few things we need to do here:\n\n  1. We need a valiation library\n  2. We need a validate method that both runs the validation of a specific input and validates the form itself\n  3. We need to handle errors from the server and set inputs and the form to invalid state\n  \n#### 1. Validation library\nWe initially chose [validator](https://www.npmjs.org/package/validator) as our validation library. It has lots of default rules and we wanted to use them by defining comma separated rules on a validations property. Validator made that easy. Have a look at what we wanted:\n\n```javascript\n\nvar MyApplicationForm = React.createClass({\n  render: function () {\n    return (\n      <App.Form>\n        <div className="form-group">\n          <label>Email</label>\n          <App.Input name="email" validations="isEmail"/>\n          <label>Number</label>\n          <App.Input name="number" validations="isNumeric,isLength:4:12"/>\n        </div>\n      </App.Form>\n    );\n  }\n});\n```\n\nWhat we realized though is that running a validation rule on some value is a very small percentage of the whole issue we are trying to solve, and as this code moved into the [formsy-react](https://github.com/christianalfoni/formsy-react) extension, there was no reason to add a dependency to "Validator". We just implemented our own validation rule handling.\n\n#### 2. Implementing the validate method\nAs stated above we need a validate method that will handle our input validation and after that validate the actual form. We also want to use the same validator no matter what type of input it is. This means that the form needs to have this method, but at the same time let the inputs use it. \n\nAn other thing here is empty values. Should they be validated? Does "no value" actually mean "wrong value"? In this context requiring an input and giving an input is two different things. There might be an input you do not require, but if you put something in there you want to validate it. So we have to handle this with a **required** property. This is the syntax:\n\n```javascript\n\nvar MyApplicationForm = React.createClass({\n  render: function () {\n    return (\n      <App.Form>\n        <div className="form-group">\n          <label>Email</label>\n          <App.Input name="email" validations="isEmail" required/>\n          <label>Number</label>\n          <App.Input name="number" validations="isNumeric, isLength:4:12"/>\n        </div>\n      </App.Form>\n    );\n  }\n});\n```\n\nLet us look at the implementation:\n\n```javascript\n\nvar Form = React.createClass({\n  getInitialState: function () {\n    return {\n      isSubmitting: false,\n      \n      // We add a new state here, isValid, which will be true initially.\n      // When inputs are attached they will be validated, in turn \n      // changing this value to false if any inputs are invalid\n      isValid: true\n    };\n  }, \n  componentWillMount: ...\n  \n  // When the form loads we validate it\n  componentDidMount: function () {\n    this.validateForm();\n  },\n  registerInputs: function (children) {\n    React.Children.forEach(children, function (child) {\n    \n      if (child.props.name) {\n        child.props.attachToForm = this.attachToForm;\n        child.props.detachFromForm = this.detachFromForm;\n        \n        // We also attach a validate method to the props of the input so\n        // whenever the value is upated, the input will run this validate method\n        child.props.validate = this.validate;\n      }\n\n      if (child.props.children) {\n        this.registerInputs(child.props.children);\n      }\n      \n    }.bind(this));\n  },\n  \n  // The validate method grabs what it needs from the component,\n  // validates the component and then validates the form\n  validate: function (component) {\n  \n    // If no validations property, do not validate\n    if (!component.props.validations) {\n      return;\n    }\n    \n    // We initially set isValid to true and then flip it if we\n    // run a validator that invalidates the input\n    var isValid = true;\n    \n    // We only validate if the input has value or if it is required\n    if (component.props.value || component.props.required) {\n    \n      // We split on comma to iterate the list of validation rules\n      component.props.validations.split(\',\').forEach(function (validation) {\n\n        // By splitting on ":"" we get an array of arguments that we pass\n        // to the validator. ex.: isLength:5 -> [\'isLength\', \'5\']\n        var args = validation.split(\':\');\n\n        // We remove the top item and are left with the method to\n        // call the validator with [\'isLength\', \'5\'] -> \'isLength\'\n        var validateMethod = args.shift();\n\n        // We use JSON.parse to convert the string values passed to the\n        // correct type. Ex. \'isLength:1\' will make \'1\' actually a number\n        args = args.map(function (arg) { return JSON.parse(arg); });\n\n        // We then merge two arrays, ending up with the value\n        // to pass first, then options, if any. [\'valueFromInput\', 5]\n        args = [component.state.value].concat(args);\n\n        // So the next line of code is actually:\n        // validator.isLength(\'valueFromInput\', 5)\n        if (!validator[validateMethod].apply(validator, args)) {\n          isValid = false;\n        }\n      });\n      \n    }\n    \n    // Now we set the state of the input based on the validation\n    component.setState({\n      isValid: isValid,\n      \n      // We use the callback of setState to wait for the state\n      // change being propagated, then we validate the form itself\n    }, this.validateForm);\n\n  },\n  validateForm: function () {\n    \n    // We set allIsValid to true and flip it if we find any\n    // invalid input components\n    var allIsValid = true;\n    \n    // Now we run through the inputs registered and flip our state\n    // if we find an invalid input component\n    var inputs = this.inputs;\n    Object.keys(inputs).forEach(function (name) {\n      if (!inputs[name].state.isValid) {\n        allIsValid = false;\n      }\n    });\n    \n    // And last, but not least, we set the valid state of the\n    // form itself\n    this.setState({\n      isValid: allIsValid\n    });\n  },\n  attachToForm: function (component) {\n    this.inputs[component.props.name] = component;\n    this.model[component .props.name] = component.state.value;\n    \n    // We have to validate the input when it is attached to put the\n    // form in its correct state\n    this.validate(component);\n\n  },\n  detachFromForm: ...\n  updateModel: ...\n  submit: ...\n  render: ...\n});\n```\n\nLets jump over to the input component and make sure everything there is handled correctly:\n\n```javascript\n\nvar Input = React.createClass({\n\n  getInitialState: ...\n  componentWillMount: function () {\n  \n    // If we use the required prop we add a validation rule\n    // that ensures there is a value. The input\n    // should not be valid with empty value\n    if (this.props.required) {\n      this.props.validations = this.props.validations ? this.props.validations + \',\' : \'\';\n      this.props.validations += \'isValue\';\n    }\n    \n    this.props.attachToForm(this);\n  },\n  componentWillUnmount: ...\n  setValue: function (event) {\n    this.setState({\n      value: event.currentTarget.value\n      \n      // When the value changes, wait for it to propagate and\n      // then validate the input\n    }, function () {\n      this.props.validate(this);\n    }.bind(this));\n  },\n  render: function () {\n    return (\n      <input type="text" name={this.props.name} onChange={this.setValue} value={this.state.value}/>\n    );\n  }\n});\n```\n\nWow, that was a lot of code! Well, this is somewhat the hidden message of this article. Validation is freakin\' complex! There are so many ways to create a user experience, you need validation both from user input and from server and you have two concepts of validation, form validation and input validation. On top of that we have this total headspin of "Should an empty value be validated?". But lets finish this up and I will give you a couple of advices when it comes to building validation for your application.\n\n#### 3. Server error response\nIf the form itself is valid that does not mean the backend is happy. We have to make sure that we display error messages from the server. In this implementation we have a requirement. If the backend gives validation errors it has to return an object where the key maps to the name of the inputs and the value is the error message itself. F.ex. { email: \'Email already exists\' }. Lets dive into our FORM code again and add an error handler. \n\n```javascript\n\nvar Form = React.createClass({\n  getInitialState: ...\n  componentWillMount: ...\n  componentDidMount: ...\n  registerInputs: ...\n  validate: function (component) {\n  \n    if (!component.props.validations) {\n      return;\n    }\n    \n    var isValid = true;\n    if (component.props.value || component.props.required) {\n      component.props.validations.split(\',\').forEach(function (validation) {\n        var args = validation.split(\':\');\n        var validateMethod = args.shift();\n        args = args.map(function (arg) { return JSON.parse(arg); });\n        args = [component.state.value].concat(args);\n        if (!validator[validateMethod].apply(validator, args)) {\n          isValid = false;\n        }\n      }); \n    }\n    \n    component.setState({\n      isValid: isValid,\n      \n      // Our new server error state on a component needs to be reset when\n      // new validations occur\n      serverError: null \n    }, this.validateForm);\n    \n  },\n  validateForm: ...\n  attachToForm: ...\n  detachFromForm: ...\n  updateModel: ...\n  submit: function (event) {\n    event.preventDefault();\n    this.setState({\n      isSubmitting: true\n    });\n    this.updateModel();\n    MyAjaxService.post(this.props.url, this.model)\n      .then(this.props.onSuccess)\n      .catch(this.setErrorsOnInputs); // We catch the error from the post\n  },\n  setErrorsOnInputs: function (errors) {\n  \n     // We go through the errors\n     Object.keys(errors).forEach(function (name, index) {\n     \n      // We grab the component by using the key from errors\n      var component = this.inputs[name];\n\n      // We change the state\n      component.setState({\n        isValid: false,\n        serverError: errors[name] // We use a new state here to indicate a server error\n      });\n      \n      // And after changing the state of the form,\n      // we validate it\n      this.setState({\n        isSubmitting: false\n      }, this.validateForm);\n      \n    }.bind(this));\n  },\n  render: ...\n});\n```\n\nAlmost there! The only thing remaining now is making sure that our input validates and displays validation errors correctly.\n\n```javascript\n\nvar Input = React.createClass({\n  \n  getInitialState: function () {\n    return {\n      value: this.props.value || \'\',\n      serverErrors: null // No initial server errors\n    };\n  },\n  componentWillMount: ...\n  componentWillUnmount: ...\n  setValue: ...\n  \n  // We have to wrap our input to display error messages\n  render: function () {\n    \n    // We create variables that states how the input should be marked.\n    // Should it be marked as valid? Should it be marked as required?\n    var markAsValid = this.state.isValid;\n    var markAsRequired = this.props.required && !this.state.value;\n    \n    var className = \'\';\n    \n    // We prioritize marking it as required over marking it\n    // as not valid\n    if (markAsRequired) {\n      className = \'required\';\n    } else if (!markAsValid) {\n      className = \'error\';\n    }\n    \n    // If it is valid or marked as required, we show no error.\n    // If not valid we either show the server error or the validation error\n    return (\n      <div className={className}>\n        <input type="text" name={this.props.name} onChange={this.setValue} value={this.state.value}/>\n        <span>{markAsValid || markAsRequired ? null : this.state.serverError || this.state.validationError}</span>\n      </div>\n    );\n  }\n});\n```\n\nSweet! We got through it! And while we sum this up, enjoy your virtual cookie:\n\n![Cookie](http://www.chick-fil-a.com/Media/Img/catalog/Food/XLarge/Cookie.png)\n\nAs stated this article was written to point out the insane complexity we confront when building good user experiences in forms. The big takeaway here is that a form is an isolated implementation, just like a live search, autocomplete, calendar etc. I do not recommend implementing it as a "part of your application logic". The other takeaway here is that you will need a dynamic, but tight relationship between your form and the inputs. The reason is that user inputs will be validated on the input itself, but also needs to notify the form. And the same when the form receives an error from the server. It needs to invalidate itself and the related inputs. It is also worth mentioning that "empty value" should only be validated if you have a "required" flag on your input. \n\nAs stated above this article resulted in an extension for React JS, [formsy-react](https://github.com/christianalfoni/formsy-react), and for Angular JS, [formsy-angular](https://github.com/christianalfoni/formsy-angular). This will essentially just give a form and a toolbox to build whatever inputs you want in your application, even non-traditional form inputs and you still get the validation for free.\n\nThanks for taking the time to read through this article and I hope it will help you handle forms and validation with React JS.\n'}});
//# sourceMappingURL=13.blog.js.map