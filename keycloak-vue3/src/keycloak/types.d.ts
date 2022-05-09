export interface KeycloakService {
    login() : Promise<void>
    logout(): void
}
