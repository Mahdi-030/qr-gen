import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ADS_CONFIG } from '../../config/ads'
import { installFakeAds } from '../../test/adFixtures'
import { GenerateAdExperience } from './GenerateAdExperience'

let restore: () => void
beforeEach(() => {
  restore = installFakeAds()
})
afterEach(() => restore())

describe('GenerateAdExperience', () => {
  it('shows nothing before the first successful generation', () => {
    const { container } = render(<GenerateAdExperience generateCount={0} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('reveals the result banner once generation has succeeded', () => {
    render(<GenerateAdExperience generateCount={1} />)
    expect(document.querySelector('[data-ad-slot="result-banner"]')).not.toBeNull()
    expect(document.querySelectorAll('iframe')).toHaveLength(1)
  })

  it('keeps the same single frame across later generations', () => {
    const { rerender } = render(<GenerateAdExperience generateCount={1} />)
    const first = document.querySelector('iframe')
    for (const n of [2, 3, 10]) rerender(<GenerateAdExperience generateCount={n} />)
    expect(document.querySelector('iframe')).toBe(first)
    expect(document.querySelectorAll('iframe')).toHaveLength(1)
  })

  it('does nothing when generateAction is "none"', () => {
    ADS_CONFIG.generateAction = 'none'
    const { container } = render(<GenerateAdExperience generateCount={3} />)
    expect(container).toBeEmptyDOMElement()
  })
})
