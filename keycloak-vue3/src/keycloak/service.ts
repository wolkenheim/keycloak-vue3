import type {KeycloakService} from "@/keycloak/types";
import type Keycloak from "keycloak-js";
import type {UserStoreReturnType} from "@/keycloak/user";
import type {ServiceConfigType} from "@/keycloak/config";

export class Service implements KeycloakService {

    constructor(
        protected keycloakInstance: Keycloak,
        protected userStore: UserStoreReturnType,
        protected conf: ServiceConfigType
    ) {
    }

    async login(): Promise<void> {
        try {
            const auth = await this.keycloakInstance.init({onLoad: 'login-required', checkLoginIframe: false})
            if (auth) {
                this.userStore.setAccessToken(this.keycloakInstance.token as string)
                await this.refreshToken()
                await this.fetchUser()
            } else {
                console.log("Unknown auth error occurred")
            }
        } catch (error) {
            console.log(error)
        }
    }

    logout(): void {
        this.keycloakInstance.logout()
    }

    async fetchUser(): Promise<void> {
        try {
            const userProfile = await this.keycloakInstance.loadUserProfile();
            this.userStore.setUser(userProfile)
        } catch (error) {
            console.log(error)
        }
    }

    async refreshToken(): Promise<void> {
        const refreshed = await this.keycloakInstance.updateToken(5)

        if (refreshed) {
            this.userStore.setAccessToken(this.keycloakInstance.token as string)
        }

        setTimeout(async () => {
            await this.refreshToken()
        }, this.conf.refreshTokenMilliseconds)
    }

}
