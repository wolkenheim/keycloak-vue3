import Keycloak from "keycloak-js";
import {keycloakJsConfig, serviceConfig} from "@/keycloak/config";
import type {KeycloakService} from "@/keycloak/types";
import type {UserStoreReturnType} from "@/keycloak/user";
import {ServiceMock} from "@/keycloak/service-mock";
import {Service} from "@/keycloak/service";

let s : KeycloakService | null = null;

export function createKeycloakInstance(): Keycloak {
    return new Keycloak(keycloakJsConfig)
}

export function serviceFactory(enableKeycloak : boolean, userStore: UserStoreReturnType): KeycloakService {
    if(s === null){
        if(enableKeycloak){
            s = new Service(createKeycloakInstance(), userStore, serviceConfig)
        } else {
            s = new ServiceMock(userStore)
        }
    }
    return s
}
