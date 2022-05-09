import type {KeycloakService} from "@/keycloak/types";
import type Keycloak from "keycloak-js";
import type {UserStoreReturnType} from "@/stores/user";

export class Service implements KeycloakService {

    constructor(
        protected keycloakInstance: Keycloak,
        protected userStore: UserStoreReturnType,
    ){
    }

    login(): Promise<void> {
        return Promise.resolve(undefined);
    }

    logout(): void {
    }

}
