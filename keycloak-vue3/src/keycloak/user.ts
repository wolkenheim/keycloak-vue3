import { defineStore } from 'pinia'
import type {KeycloakProfile} from "keycloak-js";

export type UserStoreReturnType = ReturnType<typeof useUserStore>

export type UserStore = {
    user: KeycloakProfile | null,
    accessToken: string | null,
    groups: string[]
}

export const useUserStore = defineStore({
    id: 'user',
    state: () : UserStore => ({
        user: null,
        accessToken: "",
        groups: []
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
        addGroup(group: string) : void {
            this.groups.push(group)
        }
    }
})
