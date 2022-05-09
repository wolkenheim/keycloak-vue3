import type {KeycloakService} from "@/keycloak/types";
import type {UserStoreReturnType} from "@/keycloak/user";


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
