import type {KeycloakService} from "@/keycloak/types";
import Keycloak from "keycloak-js";
import type {UserStoreReturnType} from "@/stores/user";


export class ServiceMock implements KeycloakService{

    constructor(
        protected userStore: UserStoreReturnType,
    ){
    }

    login(): Promise<void> {
        return Promise.resolve(undefined);
    }

    logout(): void {
    }

}
