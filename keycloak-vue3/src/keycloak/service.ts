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
        this.userStore.errorMsg = ""
        try {
            const auth = await this.keycloakInstance.init({onLoad: 'login-required', checkLoginIframe: false})
            if (auth) {
                this.userStore.accessToken = this.keycloakInstance.token as string
                await this.refreshToken()
                await this.fetchUserProfile()

                const roleKey = this.keycloakInstance.clientId ?? ""
                this.extractClientRoles(roleKey)
            } else {
                this.userStore.errorMsg = "Auth failed. Unknown error occurred"
            }
        } catch (error: unknown) {
            this.userStore.errorMsg = error as string
        }
    }

    logout(): void {
        this.keycloakInstance.logout()
    }

    async fetchUserProfile(): Promise<void> {
        try {
            this.userStore.user = await this.keycloakInstance.loadUserProfile();
        } catch (error : unknown) {
            this.userStore.errorMsg = error as string
        }
    }

    extractClientRoles(roleKey: string): void {
        if (this.keycloakInstance.resourceAccess && Object.prototype.hasOwnProperty.call(this.keycloakInstance.resourceAccess, roleKey)) {
            this.keycloakInstance.resourceAccess[roleKey].roles.forEach(group => {
                this.userStore.addRole(group)
            })
        }
    }

    async refreshToken(): Promise<void> {
        const refreshed = await this.keycloakInstance.updateToken(5)

        if (refreshed) {
            this.userStore.accessToken = this.keycloakInstance.token as string
        }

        setTimeout(async () => {
            await this.refreshToken()
        }, this.conf.refreshTokenMilliseconds)
    }

}
