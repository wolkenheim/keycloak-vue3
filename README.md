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
1) User calls Vue application. They have no auth token. 
2) Keycloak-js redirects User to the auth page of Keycloak Server. User logs in. Keycloak server start session for user.
3) Redirect back to Vue application with token.

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

The way to do this is exporting the realm to a file. This can be 
done with this standalone command when your Keycloak instance is running
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
