import {describe, it, expect, vi} from 'vitest'

import {mount} from '@vue/test-utils'
import App from '../../App.vue'
import {createTestingPinia} from '@pinia/testing'
import testUser from "@/keycloak/fixtures/test-user.json"

describe('App', () => {
    it('renders properly', () => {
        const wrapper = mount(App, {
            global: {
                stubs: ["router-link", "router-view"],
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

        expect(wrapper.text()).toContain('Welcome back, jb')
        expect(wrapper.text()).toContain('Designer')
    })
})
