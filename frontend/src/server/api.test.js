// Unit tests for the API client's envelope unwrapping — no browser/DOM required.
import { describe, it, expect } from 'vitest'
import { unwrapApiResult, ApiError } from './api'

describe('unwrapApiResult', () => {
  it('returns responseData.result for success code 1000', () => {
    const body = { responseCode: 1000, responseMessage: 'ok', responseData: { result: { rows: [1, 2] } } }
    expect(unwrapApiResult(body)).toEqual({ rows: [1, 2] })
  })

  it('accepts created code 1012 as success', () => {
    const body = { responseCode: 1012, responseMessage: 'created', responseData: { result: { id: 'x' } } }
    expect(unwrapApiResult(body)).toEqual({ id: 'x' })
  })

  it('throws ApiError for non-success codes', () => {
    const body = { responseCode: 1002, responseMessage: 'Unauthorized access.', responseData: { result: {} } }
    expect(() => unwrapApiResult(body)).toThrow(ApiError)
  })

  it('prefers result.message for error detail', () => {
    const body = { responseCode: 1006, responseMessage: 'Validation failed.', responseData: { result: { message: 'Email is required.' } } }
    try {
      unwrapApiResult(body)
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError)
      expect(err.message).toBe('Email is required.')
    }
  })

  it('throws ApiError when body missing', () => {
    expect(() => unwrapApiResult(null)).toThrow(ApiError)
  })
})
