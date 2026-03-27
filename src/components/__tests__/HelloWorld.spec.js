import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HelloWorld from '../HelloWorld.vue'

describe('HelloWorld', () => {
  it('renders properly', () => {
    const wrapper = mount(HelloWorld, {
      props: { msg: 'Hello Vitest' },
      global: {
        stubs: {
          'el-table': true,
          'el-table-column': true,
          'el-tag': true
        }
      }
    })
    expect(wrapper.text()).toContain('Hello Vitest')
  })
})
