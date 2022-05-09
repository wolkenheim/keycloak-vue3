import {describe, it, expect, vi} from 'vitest'

import {mount} from '@vue/test-utils'
import TopBar from '../TopBar.vue'
import {createTestingPinia} from '@pinia/testing'
import {useUserStore} from "../../keycloak/user";
import testUser from "@/keycloak/fixtures/test-user.json"

describe('TopBar', () => {
    it('renders properly', () => {
        const wrapper = mount(TopBar, {
            global: {
                plugins: [createTestingPinia({
                    initialState: {
                        user: {
                            user: testUser,
                            accessToken: "token not empty",
                            roles: ["Designer"]
                        },
                    },
                    createSpy: vi.fn,
                })],
            }
        })

        const userStore = useUserStore()
        userStore.addRole("Admin")

        console.log(wrapper.text())

        // expect(wrapper.text()).toContain('Hello Vitest')
    })
})
