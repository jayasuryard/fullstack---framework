import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function BillingPage() {
  const { data: plansData } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => { const res = await api.get('/billing/plans'); return res.data.data.plans; },
  });

  const { data: subData } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => { const res = await api.get('/billing/subscription'); return res.data.data.subscription; },
  });

  const { data: invoicesData } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => { const res = await api.get('/billing/invoices'); return res.data; },
  });

  const subscribe = useMutation({
    mutationFn: (planId: string) => api.post('/billing/subscribe', { planId }),
    onSuccess: () => { toast.success('Subscribed!'); window.location.reload(); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Subscription failed'),
  });

  const cancelSub = useMutation({
    mutationFn: (id: string) => api.post(`/billing/subscription/${id}/cancel`),
    onSuccess: () => { toast.success('Subscription cancelled'); window.location.reload(); },
  });

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-6">Billing</h1>

      {subData ? (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Current Subscription</h2>
          <p className="text-sm">Plan: <strong>{subData.plan?.name || 'N/A'}</strong></p>
          <p className="text-sm">Status: <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">{subData.status}</span></p>
          <p className="text-sm">Started: {formatDate(subData.startsAt)}</p>
          {subData.endsAt && <p className="text-sm">Ends: {formatDate(subData.endsAt)}</p>}
          <button onClick={() => cancelSub.mutate(subData.id)} className="btn-danger mt-4 text-sm">Cancel subscription</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {(plansData || []).map((plan: any) => (
            <div key={plan.id} className="card flex flex-col">
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="text-3xl font-bold mt-2">${Number(plan.price).toFixed(2)}<span className="text-sm font-normal text-gray-500">/{plan.interval}</span></p>
              <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
              {plan.features && Array.isArray(plan.features) && (
                <ul className="mt-4 space-y-1 text-sm">
                  {plan.features.map((f: string, i: number) => <li key={i} className="flex items-center gap-2">&#10003; {f}</li>)}
                </ul>
              )}
              <div className="mt-auto pt-4">
                <button onClick={() => subscribe.mutate(plan.id)} className="btn-primary w-full text-sm">
                  {plan.price > 0 ? `Subscribe - $${Number(plan.price).toFixed(2)}` : 'Get started free'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Invoice History</h2>
        {invoicesData?.data?.length ? (
          <table className="w-full">
            <thead><tr className="border-b text-xs text-gray-500 uppercase">
              <th className="text-left py-2">Invoice</th><th className="text-left py-2">Amount</th><th className="text-left py-2">Status</th><th className="text-left py-2">Date</th>
            </tr></thead>
            <tbody className="divide-y">
              {invoicesData.data.map((inv: any) => (
                <tr key={inv.id}>
                  <td className="py-3 text-sm">{inv.number}</td>
                  <td className="py-3 text-sm">${Number(inv.amount).toFixed(2)}</td>
                  <td className="py-3"><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${inv.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{inv.status}</span></td>
                  <td className="py-3 text-sm">{formatDate(inv.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="text-sm text-gray-500">No invoices yet</p>}
      </div>
    </div>
  );
}
