/**
 * Page stub — copy this file to create a new page.
 * Source: pattern extracted from all 101 product pages.
 *
 * Naming convention:  <Feature>Page.jsx   e.g. UsersPage.jsx
 * File location:      src/pages/<feature>/<Feature>Page.jsx
 *
 * Add it to App.jsx:
 *   import { FeaturePage } from './pages/feature/FeaturePage'
 *   <Route path="/admin/feature" element={<FeaturePage />} />
 *
 * Add its API namespace to src/server/api.js.
 */
import { useState } from 'react'
import { useDataFetch } from '../hooks/useDataFetch'
import { useToast } from '../components/common'
import { Button, Loading, Table } from '../components/common'
import api from '../server/api'

export function FeaturePage() {
  const { toast, ToastContainer } = useToast()
  const [page, setPage] = useState(1)

  const { data, loading, error, refetch } = useDataFetch(
    () => api.admin.feature.list({ page, limit: 20 }),
    [page]
  )

  if (loading) return <Loading />
  if (error)   return <div className="p-4 text-red-600">{error.message}</div>

  return (
    <div className="p-6">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">Feature</h1>

      {/* Table / content */}
      <Table
        columns={[
          { key: 'id',   label: 'ID' },
          { key: 'name', label: 'Name' },
        ]}
        data={data?.rows || []}
      />

      {/* Pagination */}
      <div className="flex gap-2 mt-4">
        <Button disabled={page <= 1}                       onClick={() => setPage(p => p - 1)}>Prev</Button>
        <Button disabled={!data?.pagination?.hasNext}      onClick={() => setPage(p => p + 1)}>Next</Button>
      </div>
    </div>
  )
}
