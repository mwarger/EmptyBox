webpackJsonp([3],{330:function(e,t){e.exports="# Cerebral developer preview\n\nI have been writing about React, Webpack, Flux and Flux like architectures for quite some time now. All these ideas and thoughts have been churning around in my head and after watching [this video](https://youtu.be/2HK4ENBPcWA) on how [Elm](http://elm-lang.org/) is able to control the state flow of your application everything just came together. I wanted to take what I have learned so far and build something that tries to solve all the challenges I have been writing about and at the same time bring something new to the table.\n\n## Meet Cerebral\n\n![People](/images/cerebral.png)\n\nCerebral is a framework. I call it a framework because it has the bare necessities of what you need to build an application. It provides concepts for handling application state and depends on React for its UI. Routing, http requests etc. are separate tools you choose based on what the project needs. Technically Cerebral does not need React to work, and there is an open issue for discussion on how Cerebral could be used with other frameworks: [Should Cerebral be independent of React?](https://github.com/christianalfoni/cerebral/issues/3)\n\n**So why would you even consider Cerebral?** Before going into the thoughts behind Cerebral I want to point out that this is not another \"FLUX framework\" with its own take on actions, dispatchers and stores. I am certainly not talking down those frameworks, many of them are really great, but Cerebral is a new take on how to handle application state alltogether. It is inspired by Flux and more recent solutions like [Baobab](https://github.com/Yomguithereal/baobab). So big thanks to all the brilliant people working on tools to make web application development more fun than frustrating!\n\n### Thinking Cerebral\n\n> If your application was a person, Cerebral would be the brain and the nervous system of that person\n\nI want to give you an analogy for building web applications. Think of your application as different people having different responsibilities. Maybe you have one person responsible for a form, an other for the main menu and a third person is responsible for a list. This translates to **views** in an application. So a **view** is basically a person with a brain (the state) and a nervous system (events), and the body would be the UI. The user interacts with the **view** in different ways and events are processed to change state which in turn changes the UI. We can go all the way back to [Backbone](http://www.backbonejs.org) for this type of behaviour.\n\n![People](/images/people.png)\n\nThough this seems like a good way to manage interaction and state, it does have its challenges. Imagine you are part of a development team of 5 people. It is very difficult to keep everyone in complete sync as interactions most often is \"one to one\". You might say something to one team member and later you realize that other team members should also be notified... but that is probably after something went wrong. This is the exact same problem with having multiple persons with their own brain and nervous system representing your application, or in web application terms, multiple views with their own state and event processing. You quickly loose control of communicating between them.\n\nWhen FLUX and React came a long it basically said; *it is too complicated to have multiple persons representing your application, it should be one person, with one brain and one nervous system*. This translates to the brain being your stores and the dispatcher and actions being your nervous system. Indeed it is a lot easier to keep control of everything when there is only one person to blame, but the challenge with FLUX though is that this one person responsible for your application has a split personality. It is a single brain indeed, but that brain is divided into different sections... different stores. And these stores face similar problems as they depend on each other and requires complex logic to share and update state.\n\n**So what makes Cerebral different?** Cerebral is truly \"one person\" in this analogy. It has one brain (one object) with the state of the application, but it shares even more with our human anatomy. Lets keep using the analogy with an example. When you burn your finger, what happens? Does your finger tell your brain to move your arm? No, your finger sends a \"fingerHeated\" impulse to your brain, your brain processes this impulse and when it reaches a certain level of heat it will put your brain in \"move arm state\" and the arm moves.\n\nBut let us now imagine that you burn your finger badly and it hurts, you do not just move your arm, you also scream. If your finger told your brain to move the arm, the finger would also tell the brain to scream. But you do not have just one finger, you probably have 10 fingers and all of them would have to \"implement this logic\". They would also have to keep the order correct, or you might scream before removing your arm burning your right hand fingers, but the opposite burning your left hand fingers. This is of course not how it works. The fingers just sends impulses and the brain processes these impulses which ultimately results in changed \"state\".\n\nCerebral has an implementation called **signals**. A signal is just like an impulse. It lets your components signal an interaction. This signal can be processed by multiple actions, but they all happen one after the other. So with our burned finger example you would always move your arm before screaming, or the opposite. The point is that it is consistent. A typical name for a signal in Cerebral is \"inputChanged\" or \"formSubmitted\". A signal indicates \"what happened\", not \"what should happen\". A good feature with signals is that they have functional benefits. You can add, remove, reuse and test actions very easily.\n\n### What makes Cerebral so special\nWhen writing a Cerebral app you should ideally not have any state at all in your components. Everything should be defined in **the cerebral**. This keeps Cerebral in complete control of your application state flow and this is an extremely powerful concept. First of all you get a strong concept of how to mutate state. Cerebral will actually throw an error if you try to mutate state outside a signal. You also have a strong concept of where to define the state, as a single object passed to the cerebral instance. \n\nSecond Cerebral is able to analyze the state flow and exposes an API to use that information. An example of using this information is the **Cerebral Debugger**. When developing an application with Cerebral you are able to use a debugger that displays signals sent and mutations performed. But not only that, you can remember! Using a slider you are able to move back in time, always seeing what signal and mutations caused the current state. That is extremely powerful stuff. You can imagine this information could be used for a lot of different things. Like user support, user tracking, notifications etc. It will be exciting to see what developers come up with! Take a look at the following video to see how the debugger works: [Cerebral - The debugger](https://www.youtube.com/watch?v=Fo86aiBoomE).\n\nA last thing to mention is that a signal runs between animation frames and automatically measures the time it takes to run all the mutations. It also measures the time it takes for your components to retrieve these state updates as an \"update\" event is triggered synchronously at the end of all signals. This is displayed in the debugger and makes it easy to get a grip on how your application performs. It is more predictable and performant to trigger an \"update\" event at the end of a signal rather than manually do so for each mutation, which is common in traditional FLUX architecture.\n\n## Lets get into some code\nI want to start this off with a rant. I am sick and tired of framework presentations that shows you how to do the exact same thing with just different syntax. We know how to build a TODO app by now. What we need is to control the state flow of complex applications, handle things like optimistic updates, asynchronous code and relational state. That said we are going to start off with a simple example to get to know Cerebral, then we will move on to the complex stuff.\n\nLets quickly review the files we are going to work in.\n\n```javascript\n\ncomponents/\n  App.js\nactions/\n  setInputValue.js\n  addListItem.js\ncerebral.js\nmain.js\n```\n\nAnd finally some code.\n\n### Create a Cerebral\n*cerebral.js*\n```javascript\n\nimport Cerebral from 'cerebral';\n\nlet cerebral = Cerebral({\n  inputValue: '',\n  list: []\n});\n\nexport default cerebral;\n```\n\nWe have defined just a couple of state values for our application. The text in an input and a list. Our application will just add text to the list as you hit enter in the input.\n\n### Create a component\n*components/App.js*\n```javascript\n\nimport React from 'react';\nimport mixin from 'cerebral/mixin';\n\nlet App = React.createClass({\n  mixins: [mixin],\n  getCerebralState() {\n    return ['inputValue', 'list'];\n  },\n  onInputValueSubmitted(event) {\n    event.preventDefault();\n    this.signals.inputValueSubmitted();\n  },\n  onInputValueChanged(event) {\n    this.signals.inputValueChanged(event.target.value);\n  },\n  renderListItem(item, index) {\n    return <li key={index}>{item}</li>;\n  },\n  render() {\n    return (\n      <div>\n        <form onSubmit={this.onInputValueSubmitted}>\n          <input\n            type=\"text\"\n            value={this.state.inputValue}\n            onChange={this.onInputValueChanged}/>\n        </form>\n        <ul>\n          {this.state.list.map(this.renderListItem)}\n        </ul>\n      </div>\n    );\n  }\n});\n\nexport default App;\n```\n\nSo this is a typical React component. What to notice here is that we do not import anything related to our cerebral instance, just a mixin. This is because the cerebral instance will be injected into the application and exposed on the context. This allows any component to hook on to the cerebral state, extract it and send signals to it. As you start to see now, Cerebral exists \"inside\" the body of the application, not outside it.\n\nI would also like to mention that you can return an object from `getCerebralState()` instead. The keys will map to whatever key you want to use on the components state object and the value being the path to the state you want to extract from the cerebral instance.\n\n### Inject the cerebral into the app\n*main.js*\n```javascript\n\nimport React from 'react';\nimport cerebral from './cerebral.js';\nimport App from './components/App.js';\n\nimport setInputValue from './actions/setInputValue.js';\nimport addListeItem from './actions/addListItem.js';\n\ncerebral.signal('inputValueChanged', setInputValue);\ncerebral.signal('inputValueSubmitted', addListItem);\n\nlet Wrapper = cerebral.injectInto(App);\n\nReact.render(<Wrapper/>, document.querySelector('#app'));\n```\nSo we are doing two different things here. First of all we define the signals we are using in our App component. As you can see the naming is how you would name an impulse, \"what happened\", not \"what should happen\".\n\nWhen injecting cerebral into the App component it will return a Wrapper. When not running in a production environment Cerebral will also insert the debugger into this wrapper. The debugger will show you the previous signal and the mutations done to the cerebral during that signal. The debugger also has a slider that lets you travel back in time and look at all signals and mutations done during the lifespan of the application.\n\n### Creating actions\nYour actions are run when the signal is received. They are run synchronously by default, but can also run asynchronously. The arguments passed to an action is the cerebral instance and any arguments passed with the signal. Whatever you return from an action will be passed to the next action, but beware, any objects will be frozen. You see, Cerebral runs in an immutable environment. Any state you extract from the cerebral can not be changed. This is what makes updates to the components so fast because there is no need for deep checking of changes. It also benefits Cerebrals ability to remember. You can not change the past, immutability makes sure of that.\n\n*actions/setInputValue*\n```javascript\n\nlet setInputValue = function (cerebral, value) {\n  cerebral.set('inputValue', value);\n};\n\nexport default setInputValue;\n```\nCerebral has many different methods for mutating state. **set, push, concat, splice, merge, unset, pop** etc. The first argument of a mutation is always the path to the value you want to mutate. In the example above we use a string as we are changing the top level of the cerebral. For nested values you use an array. You can also pass retrieved state values as path to the mutation.\n\n*actions/addListItem.js*\n```javascript\n\nlet addListItem = function (cerebral) {\n  cerebral.push('list', cerebral.get('inputValue'));\n  cerebral.set('inputValue', '');\n};\n\nexport default addListItem;\n```\nYou get state from the cerebral using the `.get()` method. This takes a path, either a string or an array. As stated earlier these values are immutable, but you can easily make a mutable copy by running a `.toJS()` method on them.\n\nYou can also watch an introduction video of this, which shows the workflow using the debugger: [Cerebral - Building your first app](https://www.youtube.com/watch?v=ZG1omJek6SY).\n\n## Complex state handling\nSo far we have just introduced some basic implementations that looks good in any framework really. The debugger is a major advantage to keep you sane, but what about the really tough problems? Like asynchronous code, optimistic updates and relational state? \n\nLet us start out by answering a basic question first. How should you store your data? In an array? Or as a key/value map? They both have their benefits in regards to data access and traversal. In Cerebral the choice is made for you. You use a key/value map to store data for lookups. For example some todos would be stored like this:\n\n```javascript\n\nlet cerebral = Cerebral({\n  todos: {\n    'cerebral_ref_1': {\n      id: 'todo_1',\n      title: 'My todo',\n      completed: false\n    },\n    'cerebral_ref_2': {\n      id: 'todo_2',\n      title: 'My other todo',\n      completed: true\n    }\n  }\n});\n```\n\nAnd if you want to display a list of todos you would add an array for that:\n\n```javascript\n\nlet cerebral = Cerebral({\n  todos: {...},\n  displayedTodos: []\n});\n```\n\nThe reason you separate the two is scalability. Your UI rarely wants to display all the data. Just look at the simple TODO-mvc app, when clicking \"completed\" and \"active\", you only want to display a subset of the todos. Normally this is handled by for example using a filter inside a component, but that is not a good solution. The reason is that by doing so the logic is isolated in a component and other components will have a different understanding of the list of todos than the specific component with the filter.\n\nThis is where referencing comes into play, because you have one state containing all the data, but can still use it in many different scenarios. If you come from Angular or other frameworks you might say, \"Why make it so complicated?\". This is something that FLUX taught us. Complex is not a bad word. Though you require a bit more wiring to solve simple use cases, you will never get into scaling or sync issues as your application grows. Of course we should strive for making the complex simple, but that does not mean less code, it means having good concepts to understand how to solve the complex. That is what Cerebral tries to do. \n\nBut we are getting way off here, this is how you would reference a todo:\n\n```javascript\n\nlet cerebral = Cerebral({\n  todos: {...},\n  displayedTodos: [\n    'cerebral_ref_1'\n  ]\n});\n```\n\n### Doing lookups\nIn the above code we are inserting references in the `displayedTodos` state, but there has to be something that actually grabs the todo from the `todos` map. This is done using a mapping function. Lets take a look into our cerebral:\n\n```javascript\n\nlet displayedTodos = function () {\n  return {\n    initialState: [],\n    lookupState: ['todos'],\n    get(cerebral, lookupState, refs) {\n      return refs.map(function (ref) {\n        return lookupState.todos[ref];\n      });\n    }\n  };\n};\n\nlet cerebral = Cerebral({\n  todos: {},\n  displayedTodos: displayedTodos\n});\n```\nSo our cerebral can also have a function as state. This function can return an object describing the behaviour of the state. First of all it needs an initial state, in this case an empty array. The lookupState property lists what other state it will do lookups into. You can use an array or key/path to define this. The last property is a method that composes the output when grabbing `displayedTodos`. What we do here is simply map over the references put into the array and return the actual todo by doing a lookup into the todos map. The great thing about this is that if anything changes in the todos this `get()` method will run again and updates itself. You do not have to worry about keeping state in sync, it happens automatically.\n\n### Optimistic updates\nAs stated above you will use Cerebral references to do lookups in your cerebral. This allows you to do optimistic updates very easily. Imagine we want to add a new todo using a `todoSubmitted` signal.\n\n```javascript\n\ncerebral.signal('todoSubmitted', addTodo, saveTodo, setTodoSaveResult);\n```\nAnd now let us create the first action.\n\n```javascript\n\nlet addTodo = function (cerebral, title) {\n  let ref = cerebral.ref.create();\n  let todo = {\n    $isSaving: true,\n    title: title\n  };\n  cerebral.set(['todos', ref], todo);\n  cerebral.unshift(['displayedTodos'], ref);\n  return ref;\n};\n```\n\nWhat we do here is create a Cerebral reference. We also add an `$isSaving` property to our todo to inidicate the state of this particular data. Before returning the reference we created we insert the todo optimistically into our todos map and add the reference to the displayedTodos array. Our state mapping will now trigger and also display this new optimistic todo.\n\nAgain, the reason we do this is because our `todos` state might have lots of todos, but we only display a subset of them using references.\n\n### Asynchronous actions\nThe next natural step is to save this todo to the server and update it with either an ID or maybe an error occured. When Facebook intitially put FLUX into the wild there was a lot of discussions on where to put asynchronous code. In Cerebral you are not able to change state unless it is synchronously done from an action. So how do you change state with asynchronous code?\n\nFirst we create our `saveTodo` action.\n\n```javascript\n\nimport request from 'superagent';\n\nlet saveTodo = function (cerebral, ref) {\n  return new Promise(function (resolve, reject) {\n\n    let todo = cerebral.get('todos', ref);\n\n    request('/todos').post({\n      title: todo.title\n    }).end(function (err, result) {\n      \n      if (err) {\n\n        reject({\n          ref: ref,\n          error: err\n        });\n\n      } else {\n\n        resolve({\n          ref: ref,\n          id: result.text\n        });\n\n      }\n\n    });\n    \n  });\n};\n```\nWe can now use the returned reference to grab the todo from the cerebral and do a post to the server. The first thing to notice here is that our action returns a **Promise**. This is what indicates that an action is asynchronous. If a promise is returned it will wait for it to fulfill before it runs the next action in the signal. The resolved value will be passed as an argument to the next action. That will be either the id and the ref, or the error and the ref on an error response.\n\nAs you can see there are no state changes at all here. An asynchronous action is only able to grab state from the cerebral, not do changes to it. It depends on a synchronous action after it to do changes with whatever is returned from the asynchronous action.\n\nBut what about the debugger? It would not be a very good experience if you retraced your steps and these async actions would trigger new server requests. Well, they don't. Cerebral does not only remember the signals and mutations done, but also values returned from asynchronous actions. This means that when you look at previous state in the debugger it will all happen synchronously.\n\n```javascript\n\nlet setTodoSaveResult = function (cerebral, result) {\n\n  let todo = cerebral.get('todos', result.ref);\n\n  if (result.id) {\n\n    cerebral.ref.update(result.ref, result.id);\n    cerebral.merge(todo, {\n      id: result.id,\n      $isSaving: false\n    });\n\n  } else {\n\n    cerebral.merge(todo, {\n      $error: result.error,\n      $isSaving: false\n    });\n\n  }\n};\n```\nAnd the last action now grabs the todo from the cerebral and uses it as a path to merge in the id or the error, and also the $isSaving property set to false. If we do get an id from the server we will also link that to the reference. This means that when you later pass the id to some action to identify the todo you can use `cerebral.ref.get(todo.id)` to grab the reference to that todo.\n\nSo now you see that Cerebral handles asynchronous actions simply using a promise. Cerebral does not allow any mutations from asynchronous actions, you have to return a result that a synchronous action can process when it is done. This is one of the core concepts that lets Cerebral keep control of your state. As a plus your code is less error prone, easier to test and easier to read.\n\nNotice that synchronous functions are pure functions. That makes them very easy to test. Just pass an instance of a Cerebral whan calling them and verify that they make the changes and/or returns the value you expect.\n\n### Relational state\nSo lets take this a step further. What if the todos has an authorId that references a specific user? Maybe we can use our map to merge in that information? We certainly can, but we have a problem. If we now use Cerebral references to allow for optimistic updates, the reference pointing to the user, `authorId`, will not work because it is just a plain ID. We briefly touched on the solution above, but let us download some todos and users and see this in detail.\n\nThe signal.\n```javascript\n\ncerebral.signal('todosOpened', getTodos, mergeTodos);\n```\n\nThe first action grabbing the todos.\n```javascript\n\nlet getTodos = function (cerebral) {\n  return new Promise(function (resolve, reject) {\n    \n    request('/todos').end(function (err, result) {\n      \n      if (err) {\n        reject(err);\n      } else {\n        resolve(JSON.parse(result.text));\n      }\n\n    });\n\n  });\n\n};\n```\nAnd after that we run an action actually putting the todos into the cerebral.\n```javascript\n\nlet mergeTodos = function (cerebral, todos) {\n\n  let todosMap = todos.reduce(function (allTodos, todo) {\n\n    let ref = cerebral.ref.create(todo.id);\n    allTodos[ref] = todo;\n    return allTodos;\n\n  }, {});\n  \n  cerebral.merge('todos', todosMap);\n};\n```\nTypically when you get data from a backend it is in an array. In this example we convert that array to a map where the key is a new Cerebral reference, just like we did when adding a new todo. The difference here though is that we pass in the ID of the todo when creating the reference. This will create a link between them. We do the exact same thing as above with the users. So now we have a map with some todos where the key is a Cerebral reference linked to its ID, allowing for optimistic updates and relational lookup. Each todo has an `authorId` property with the id of a user. We also have a map of users where the key is a Cerebral reference that is linked to its ID, again allowing for optimistic updates and relational lookup.\n\nLets get back to our `displayedTodos` to see what we are now able to do.\n\n```javascript\n\nlet displayedTodos = function () {\n  return {\n    initialState: [],\n    lookupState: ['todos', 'users'],\n    get(cerebral, lookupState, refs) {\n\n      return refs.map(function (ref) {\n        let todo = lookupState.todos[ref].toJS(); // Lets us mutate the todo\n        let authorRef = cerebral.ref.get(todo.authorId);\n        todo.author = lookupState.users[authorRef];\n        return todo;\n      });\n\n    }\n  };\n};\n```\n\nNow you see why a Cerebral benefits from giving you references. Even though we have a key/value map of users that is set using Cerebral references, we can still do a plain lookup using the id.\n\nBut let us make this even more complex. What if the user is not in the client? We can extend our actions to do even more work. Lets take a look at a signal that automatically grabs missing users based on the todo loaded:\n\n```javascript\n\ncerebral.signal('todosOpened', getTodos, mergeTodos, getMissingUsers, mergeUsers);\n```\n\nFirst we need to update our mergeTodos action to return missing users.\n```javascript\n\nlet mergeTodos = function (cerebral, todos) {\n\n  let users = cerebral.get('users');\n  let missingUsers = [];\n  let todosMap = todos.reduce(function (allTodos, todo) {\n\n    let ref = cerebral.ref.create(todo.id);\n    let authorRef = cerebral.ref.get(todo.authorId);\n    allTodos[ref] = todo;\n\n    if (!authorRef) {\n      missingUsers.push(todo.authorId);\n    }\n\n    return allTodos;\n\n  }, {});\n  \n  cerebral.merge('todos', todosMap);\n\n  return missingUsers;\n};\n```\n\nSo now our mergeTodos action will return an array of missing users. Let us create the getMissingUsers action.\n```javascript\n\nlet getMissingUsers = function (cerebral, ids) {\n  return new Promise(function (resolve, reject) {\n    \n    if (ids.length) {\n\n      request('/users').query({\n        ids: ids\n      }).end(function (err, result) {\n        \n        if (err) {\n          reject(err);\n        } else {\n          resolve(JSON.parse(result.text));\n        }\n\n      });\n\n    } else {\n\n      resolve([]);\n\n    }\n\n  });\n\n};\n```\nSo this action will either receive an empty array or an array with some ids for users. Note that we always return a promise, even if there are no ids. So the promise is either resolved with a request to the server where the returned result is passed to the next action, our **mergeUsers** action, or resolved with an empty array.\n\n```javascript\n\nlet mergeUsers = function (cerebral, users) {\n\n  let usersMap = users.reduce(function (allUsers, user) {\n\n    let ref = cerebral.ref.create(user.id);\n    allUsers[ref] = user;\n    return allUsers;\n\n  }, {});\n  \n  cerebral.merge('users', usersMap);\n\n};\n```\nAnd here we do pretty much the same thing as we did with our todos. We convert to a map, create references and merge in with existing users. And now finally we we can do some more mapping.\n\n```javascript\n\nlet displayedTodos = function () {\n  return {\n    initialState: [],\n    lookupState: ['todos', 'users'],\n    get(cerebral, lookupState, refs) {\n\n      let displayedTodos = refs.map(function (ref) {\n        \n        let todo = lookupState.todos[ref].toJS();\n        let authorRef = cerebral.ref.get(todo.authorId);\n        todo.author = lookupState.users[authorRef] || {\n          $isLoading: true\n        };\n        return todo;\n\n      });\n\n      return displayedTodos;\n\n    }\n  };\n};\n```\n\nThis is a really complex state handling situation, but as you can see Cerebral handles it very well. And Cerebral is still in full control of your state flow. You can go back and forth in time, debug your complete flow, look at state etc. But let us quickly summarize our steps here.\n\nWe can easily see how that state flows looking at our signal.\n```javascript\n\ncerebral.signal('todosOpened', getTodos, mergeTodos, getMissingUsers, mergeUsers);\n```\n\nThe good thing here is that all these actions are reusable and can be composed in other signals as well. When the signal is running it will run the **displayedTodos** mapping when there is a change to any of its lookupState. So it will run on *mergeTodos* and *mergeUsers*. The first time we do not have the user so the mapping will return an author with a *$isLoading* state. The next time the user exists and we map the user out on an *author* property.\n\nYou can see a video on implementing this [right here](https://www.youtube.com/watch?v=6W0S2p01Paw).\n\n## Summary\nI hope this article gave you insight into what Cerebral is all about. The project is currently not running on any applications in production, but I was hoping you would want to try it out, give feedback and help me bring it to a stable release. I think we are just scratching the surface of what we are able to do when the framework has complete control of the state flow. It is pretty amazing to use the debugger when developing because you avoid retracing your steps all the time, and as your application grows you always have a good overview of how the state flows. I can not wait to see what new ideas might show up using Cerebrals ability to understand the state flow!\n\nYou can check out the project and documentation at the [cerebral repo](https://github.com/christianalfoni/cerebral). It will guide you with introduction videos and a webpack boilerplate. "}});
//# sourceMappingURL=3.blog.js.map