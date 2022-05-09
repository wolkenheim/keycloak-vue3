import Keycloak from "keycloak-js";
import {keycloakJsConfig, serviceConfig} from "@/keycloak/config";
import type {KeycloakService} from "@/keycloak/types";
import type {UserStoreReturnType} from "@/keycloak/user";
import {ServiceMock} from "@/keycloak/service-mock";
import {Service} from "@/keycloak/service";

export function createKeycloakInstance(): Keycloak {
    return new Keycloak(keycloakJsConfig)
}

export function serviceFactory(userStore: UserStoreReturnType): KeycloakService {
    const enableKeycloak = import.meta.env.VITE_APP_KEYCLOAK_ENABLED as boolean ?? false

    if (enableKeycloak) {
        return new ServiceMock(userStore)
    }
    return new Service(createKeycloakInstance(), userStore, serviceConfig)
}
