import Keycloak from "keycloak-js";
import {keycloakJsConfig} from "@/keycloak/config";

export function createKeycloakInstance(): Keycloak {
    return new Keycloak(keycloakJsConfig)
}

