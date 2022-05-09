import { defineStore } from 'pinia'
import type {KeycloakProfile} from "keycloak-js";

export type UserStoreReturnType = ReturnType<typeof useUserStore>

export type UserStore = {
    user: KeycloakProfile | null,
    accessToken: string | null,
    roles: string[],
    errorMsg: string
}

export const useUserStore = defineStore({
    id: 'user',
    state: () : UserStore => ({
        user: null,
        accessToken: "",
        roles: [],
        errorMsg: ""
    }),
    getters: {
        isLoggedIn(): boolean {
            return !!this.accessToken
        },
    },
    actions: {
        setUser(user: KeycloakProfile): void {
            this.user = user
        },
        deleteUser(): void {
            this.user = null
        },
        setAccessToken(token: string): void {
            this.accessToken = token
        },
        addRole(role: string) : void {
            this.roles.push(role)
        }
    }
})
