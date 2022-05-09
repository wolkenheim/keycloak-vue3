# Keycloak Client for Vue 3 with Pinia and TypeScript

This is a detailed step-by-step guide to set up an existing Vue 3 project with Keycloak. There are multiple ways to 
achieve this. The Keycloak docs give you some hints but let´s be honest: the basic solution with conditions 
in main.ts is not that great. You end up with a bloated main.ts file with a lot of conditions, see
[keycloak vue example](https://www.keycloak.org/securing-apps/vue)

## Motivation: lessons learned with Keycloak and Vue 2
I wrote an own npm package for internal Vue 2 projects at work. This worked fine as we had exactly the same setup in 
our apps. However: you needed to inject the Vuex store to the given plugin. The Keycloak User and their token needed 
to be stored in Vuex.

Things got even a bit more complicated with Vue 3 and Pinia. In theory you need the store before Vue is created, 
see [docs](https://pinia.vuejs.org/core-concepts/outside-component-usage.html). This creates a chicken and egg problem.
To access the userStore `app.use(pinia)` needs to be called first. But in order to do so you need Keycloak auth first 
which also gets and sets your User object.

So why not abandoning the idea altogether to solve everything in main.ts? That´s exactly what I did moving all the 
logic to App.vue. This component with the base layout will be called on every router view. 

Let´s get started.

## Overview of the Keycloak Auth workflow
This is going to happen
1) User calls Vue application first time. There is no auth token.
2) Keycloak-js redirects User to the auth page of Keycloak Server. User logs in. Keycloak server start session for user.
3) Server Redirects user back to Vue SPA application. User is logged in and has a valid JWT token.

The auth workflow is handled by keycloak, both js and server. Our job starts with the authenticated user. Their token,
user info and groups need to be persisted globally in our app via a Pinia User Store. Each component will potentially 
need access to the user. Think of roles and ACL. The token is a special case. This will be need only by the http client
to make secure calls to the backend.

## 1. Setting up Keycloak
Note: I will check in a fully configured Keycloak server in this project. This guide is optional.

To work with Keycloak you need a running Keycloak server instance. It is convenient to have full access to a realm
which might not be the case in your company when other teams manage the Keycloak instance. I prepared a docker compose
file with Keycloak and its Postgres DB.
```
cd _INFRA
docker-compose up
```

Starting up should take a while. Docker start the Keycloak instance at http://localhost:8081 Please consult the 
docker-compose file for admin passwords. You can log in with those credentials to configure a realm. This will start a session on the
Keycloak server.

Keycloak is a universe in itself. You can configure now a client from scratch here. Specify the root url 
`http://localhost:3000` which is the vite dev server. This should automatically fill out all forms. 
You want Client Protocol openid-connect and Client Protocol public.

Next configure a test user and set a password for yourself.

As soon as you run `docker-compose down` all the data from keycloak will be lost. Not ideal. You could use a volume
for the database mounted to the Postgres container. But what about your working colleagues? Configuring realms,
clients and users can be quite a drudgery. You really want to do this work only once. And then persist these changes
in your CVS so every developer gets the same realm. As soon as your app relies on ACL and roles this will become crucial.

The way to do this is exporting the realm to a file. What will not work is to use the "export" button in the admin panel.
Not all necessary data is getting exported. The full export can be done with the following standalone command when your 
Keycloak instance is running
```
docker exec -it keycloak-vue3_keycloak_1 /opt/jboss/keycloak/bin/standalone.sh -Djboss.socket.binding.port-offset=100 -Dkeycloak.migration.action=export -Dkeycloak.migration.provider=singleFile -Dkeycloak.migration.realmName=master -Dkeycloak.migration.usersExportStrategy=REALM_FILE -Dkeycloak.migration.file=/opt/jboss/keycloak/imports/realm-export.json
```
Once you do this even after deleting the Docker container your changes will be back next time you start up the server.

Note: this is still based on the image from Docker Hub. The Keycloak Docker repository moved meanwhile to 
[quay.io](https://quay.io/repository/keycloak/keycloak)

## 2. Install Vue 3
I added a fresh Vue 3 installation with TypeScript, Pinia and Vue Router. I also installed keycloak-js. Quick note here:
versions of keycloak server and keycloak-js don´t have to match exactly. In this case server runs on version 16.1.1 and 
keycloak-js on 18.0.0
```
cd keycloak-vue3
npm run dev
```
This is the plan: the logic for authentication will live in App.vue. This is a base component that will be called no
matter what route is active.

What we build is basically a wrapper around the Keycloak client. The task is to get data from keycloak and put it 
into the store. 

## 4. Authenticate User
A couple of things here: First a userStore is needed. Nothing fancy here, just a regular Pinia store to make the 
current User and their token accessible. Then the Keycloak client needs to get instantiated. I wrote a small 
factory function for this. The main part is the Keycloak Service which needs both the Keycloak instance and the user
store. 

During local testing you might want to disable Keycloak altogether at certain phases. A real Keycloak server might not
be accessible. Also, it is not very convenient to run the docker file all the time. As it consumes quite some resources.
In most cases Keycloak will not be necessary. What we want here is a solution that can be turned off. We do this with 
a config flag and swap our service for a mock implementation. Also think of unit tests. 

Therefor we create an interface for the keycloak service with two methods: login and logout.
First thing is to login the user. This will happen with `await this.keycloakInstance.init()`. In case of success the result
is just a boolean success flag. Not very useful. What we do have is the access Token of the user. It can be retrieved
simply by `this.keycloakInstance.token`

## 5. Attach Bearer token to Http Client
Now for the axios http client. I created a global instance to demonstrate the idea. It is not possible to import
axios from the package anymore. A central instance with the auth token is needed. This instance has access to Pinia and 
gets its token from there. The token will be used in all outgoing calls that use said axiosInstance from src/axios.ts. 
Just click on the "fetch products" button and inspect the outgoing header. The call will fail as there is no backend
running yet. This is okay, we are not interested on the response. 

Something else is important here: There should be an "Authorization" key in the headers of the outgoing call. It should
have the Bearer token retrieved from Keycloak. Now the backend application needs to verify that token on every call.
This is out of scope for this project.

## 6. Refresh the token
One small problem though. The token is valid only for a small period of time, sometimes only one minute. You need to 
refresh the token. What we learned the hard way: you cannot use `setInterval()` of Javascript. Behavior in chrome: As 
soon as the Browser tab goes to background mode the function will not work as intended, 
see [stackoverflow](https://stackoverflow.com/questions/6032429/chrome-timeouts-interval-suspended-in-background-tabs) 
The phenomenon still exists: background tabs have low priority. You need to use setTimeout and make a recursive call.

An alternative option is to use web works which are not affected by the background limitations and hence the problems
with setInterval in browser tabs.

## 7. Fetch User Data
Next we wanted to get basic information about the logged-in user. To display it, let´s show their name. This can be
done simply by calling `loadUserProfile()` on the Keycloak client. We set the info to the store. Hence, every component
can access and display it. To demonstrate it, let´s implement a TopBar component without Props but direct access to 
the user store. This works, the userName can be displayed here. You can inspect Pinia and the state of User store via
Vue Dev Tools in Chrome. 

## 8. Authorization: Adding Roles
Next we need same roles. Keycloak roles are quite a complex topic. On the server, I added Client roles and assigned
the Test user to a "Designer" Client role. Not realm roles. Those roles can be retrieved via 
`this.keycloakInstance.resourceAccess['vue-acme']`. 

This may or may not be useful for you. It really depends on your setup and there are a plethora of ways to configure
authorization roles here. You will most likely write custom methods extracting data. Also, it is possible to send 
additional user data in the encoded JWT token or make it accessible via an own REST endpoint.

## 9. Add Mock Keycloak Service
For local development it is convenient to disable Keycloak at times. There is an env Variable `VITE_APP_KEYCLOAK_ENABLED=false`
for that. Based on its value the factory delivers a mock service without any real keycloak requests. This should
be good for many use cases. If you need multiple users with roles a boolean flag will no longer work. But
for simple cases this is a great way to work.

## 10. Unit Testing
Time to add unit tests. This should have come first. It did not. Well, better late than never. As components get usually 
tested in isolation, keycloak will be out of our way. In case it needs to be disabled, we can make good use of the
env variable implemented earlier. Installing Keycloak was quite an endeavour, testing is not. As all the relevant data
resides in the store, we simply need to pass in mock User Object, a fake string for a token and a role. This is basically
the same we did already in the mock service. 

The [testing](https://pinia.vuejs.org/cookbook/testing.html#unit-testing-components) 
section in the docs describe what we need: a testing package for Vite. Afterwards the initial state needs to be set
when mounting the wrapper.

This is a very simple setup when it comes to authentication and authorization. You might want to work with more with
router props for more sophisticated tasks.

## Conclusion
This is a working setup to implement Keycloak in Vue. I found surprisingly little information on the topic and that´s
why I wrote down this guide. You don´t have to fall in all the pits I´ve been already in. And there are quite a few 
of them. Keycloak is definitely not a hot, new tech you master in a few hours. It takes time. Good luck on your way.

