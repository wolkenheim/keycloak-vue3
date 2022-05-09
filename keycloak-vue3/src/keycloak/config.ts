export interface KeycloakJsConfigType {
    url: string
    realm: string
    clientId: string
}

export const keycloakJsConfig : KeycloakJsConfigType = {
    url: import.meta.env.VITE_APP_KEYCLOAK_JS_URL ?? "",
    realm: import.meta.env.VITE_APP_KEYCLOAK_JS_REALM ?? "",
    clientId: import.meta.env.VITE_APP_KEYCLOAK_JS_CLIENT_ID ?? "",
}

