import type {KeycloakService} from "@/keycloak/types";
import type {UserStoreReturnType} from "@/keycloak/user";
import testUser from "@/keycloak/fixtures/test-user.json"


export class ServiceMock implements KeycloakService {

    constructor(
        protected userStore: UserStoreReturnType,
    ) {
    }

    async login(): Promise<void> {
        this.userStore.user = testUser
        this.userStore.accessToken = "token goes here"
        this.userStore.addRole("Designer")
    }

    logout(): void {
    }

}
