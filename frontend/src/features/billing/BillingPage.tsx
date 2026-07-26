import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { PageHeader, Card, Button, Badge, EmptyState, Skeleton } from '@/design-system';
import toast from 'react-hot-toast';
import { CreditCard, Receipt } from 'lucide-react';

export default function BillingPage() {
  const queryClient = useQueryClient();
  const { data: plansData, isLoading: plansLoading } = useQuery({
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

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['subscription'] });

  const subscribe = useMutation({
    mutationFn: (planId: string) => api.post('/billing/subscribe', { planId }),
    onSuccess: () => { toast.success('Subscribed!'); invalidate(); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Subscription failed'),
  });

  const cancelSub = useMutation({
    mutationFn: (id: string) => api.post(`/billing/subscription/${id}/cancel`),
    onSuccess: () => { toast.success('Subscription cancelled'); invalidate(); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to cancel'),
  });

  return (
    <div className="max-w-4xl">
      <PageHeader title="Billing" description="Manage your subscription" />

      {plansLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : subData ? (
        <Card className="mb-6 space-y-2">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Current Subscription</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Plan: <strong className="text-neutral-900 dark:text-neutral-100">{subData.plan?.name || 'N/A'}</strong></p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Status: <Badge variant="success">{subData.status}</Badge></p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Started: {formatDate(subData.startsAt)}</p>
          {subData.endsAt && <p className="text-sm text-neutral-600 dark:text-neutral-400">Ends: {formatDate(subData.endsAt)}</p>}
          <Button onClick={() => cancelSub.mutate(subData.id)} variant="danger" size="sm">Cancel subscription</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {plansData?.length === 0 && (
            <div className="col-span-3">
              <EmptyState icon={<CreditCard className="h-10 w-10" />} title="No plans available" description="Contact support to set up billing plans." />
            </div>
          )}
          {(plansData || []).map((plan: any) => (
            <Card key={plan.id} className="flex flex-col">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">{plan.name}</h3>
              <p className="text-3xl font-bold mt-2 text-neutral-900 dark:text-neutral-50">
                ${Number(plan.price).toFixed(2)}
                <span className="text-sm font-normal text-neutral-500">/{plan.interval}</span>
              </p>
              <p className="text-sm text-neutral-500 mt-2">{plan.description}</p>
              {plan.features && Array.isArray(plan.features) && (
                <ul className="mt-4 space-y-1 text-sm">
                  {plan.features.map((f: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                      <span className="text-success-500">✓</span> {f}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-auto pt-4">
                <Button onClick={() => subscribe.mutate(plan.id)} className="w-full">
                  {plan.price > 0 ? `Subscribe - $${Number(plan.price).toFixed(2)}` : 'Get started free'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="space-y-4">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Invoice History</h2>
        {invoicesData?.data?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800">
                  <th className="text-left py-2 text-xs font-medium text-neutral-500 uppercase tracking-wide">Invoice</th>
                  <th className="text-left py-2 text-xs font-medium text-neutral-500 uppercase tracking-wide">Amount</th>
                  <th className="text-left py-2 text-xs font-medium text-neutral-500 uppercase tracking-wide">Status</th>
                  <th className="text-left py-2 text-xs font-medium text-neutral-500 uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {invoicesData.data.map((inv: any) => (
                  <tr key={inv.id}>
                    <td className="py-3 text-sm text-neutral-900 dark:text-neutral-100">{inv.number}</td>
                    <td className="py-3 text-sm text-neutral-900 dark:text-neutral-100">${Number(inv.amount).toFixed(2)}</td>
                    <td className="py-3"><Badge variant={inv.status === 'paid' ? 'success' : 'warning'}>{inv.status}</Badge></td>
                    <td className="py-3 text-sm text-neutral-500">{formatDate(inv.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={<Receipt className="h-8 w-8" />} title="No invoices yet" description="Your invoices will appear here once you subscribe to a plan." />
        )}
      </Card>
    </div>
  );
}
