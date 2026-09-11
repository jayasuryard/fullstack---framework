// @vitest-environment jsdom
// Keyboard/focus behavior tests for the accessible Modal — real DOM via jsdom,
// react-dom/client for rendering, no @testing-library dependency.
import { describe, it, expect, vi, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { Modal } from './Modal'

let root
let container

function renderModal(props) {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(<Modal {...props} />)
  })
  return container
}

function pressKey(key, opts = {}) {
  act(() => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...opts }))
  })
}

afterEach(() => {
  act(() => {
    root?.unmount()
  })
  container?.remove()
  document.body.innerHTML = ''
})

describe('Modal', () => {
  it('moves focus into the dialog on open', () => {
    const el = renderModal({
      isOpen: true,
      onClose: vi.fn(),
      title: 'Test modal',
      children: <button>Inside</button>,
    })

    const dialog = el.querySelector('[role="dialog"]')
    expect(dialog).toBeTruthy()
    expect(dialog.getAttribute('aria-modal')).toBe('true')
    expect(dialog.getAttribute('aria-labelledby')).toBe(el.querySelector('h2').id)
    expect(dialog.contains(document.activeElement)).toBe(true)
  })

  it('restores focus to the trigger element on close', () => {
    const trigger = document.createElement('button')
    trigger.textContent = 'open modal'
    document.body.appendChild(trigger)
    trigger.focus()
    expect(document.activeElement).toBe(trigger)

    renderModal({ isOpen: true, onClose: vi.fn(), title: 'Test modal', children: <button>Inside</button> })
    expect(document.activeElement).not.toBe(trigger)

    act(() => {
      root.render(<Modal isOpen={false} onClose={vi.fn()} title="Test modal">Inside</Modal>)
    })

    expect(document.activeElement).toBe(trigger)
    trigger.remove()
  })

  it('calls onClose on Escape', () => {
    const onClose = vi.fn()
    renderModal({ isOpen: true, onClose, title: 'Test modal', children: <button>Inside</button> })

    pressKey('Escape')

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not close on Escape when closeOnEscape is false', () => {
    const onClose = vi.fn()
    renderModal({ isOpen: true, onClose, title: 'Test modal', closeOnEscape: false, children: <button>Inside</button> })

    pressKey('Escape')

    expect(onClose).not.toHaveBeenCalled()
  })

  it('traps Tab focus within the dialog (wraps last -> first)', () => {
    const el = renderModal({
      isOpen: true,
      onClose: vi.fn(),
      title: 'Test modal',
      children: (
        <>
          <button>First</button>
          <button>Last</button>
        </>
      ),
    })

    const dialog = el.querySelector('[role="dialog"]')
    const focusables = dialog.querySelectorAll('button')
    const first = focusables[0]
    const last = focusables[focusables.length - 1]

    act(() => {
      last.focus()
    })
    expect(document.activeElement).toBe(last)

    pressKey('Tab')

    expect(document.activeElement).toBe(first)
  })

  it('traps Shift+Tab focus within the dialog (wraps first -> last)', () => {
    const el = renderModal({
      isOpen: true,
      onClose: vi.fn(),
      title: 'Test modal',
      children: (
        <>
          <button>First</button>
          <button>Last</button>
        </>
      ),
    })

    const dialog = el.querySelector('[role="dialog"]')
    const focusables = dialog.querySelectorAll('button')
    const last = focusables[focusables.length - 1]

    expect(dialog.contains(document.activeElement)).toBe(true)

    pressKey('Tab', { shiftKey: true })

    expect(document.activeElement).toBe(last)
  })
})
