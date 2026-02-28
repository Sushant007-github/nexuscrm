import { useEffect, useState } from 'react'
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline'
import { EmptyState } from '../../components/ui'
import { formatCurrency, avatarText } from '../../utils/helpers'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function RestaurantPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/records?type=customer&industry=restaurant&limit=30')
      .then(r => setOrders(r.data.records))
      .catch(() => toast.error('Error loading orders'))
      .finally(() => setLoading(false))
  }, [])

  const totalSales = orders.reduce((s, o) => s + (o.totalAmount || 0), 0)
  const byStatus = (s) => orders.filter(o => o.orderStatus === s).length

  const STATUS_STYLES = {
    pending: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300',
    preparing: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
    ready: 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300',
    served: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
    cancelled: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  }

  return (
    <div className="space-y-5 max-w-[1600px]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-sm">
          <BuildingStorefrontIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">Restaurant Module</h2>
          <p className="text-sm text-gray-500">Table, order & kitchen management</p>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: orders.length, bg: 'bg-orange-500' },
          { label: "Today's Sales", value: formatCurrency(totalSales), bg: 'bg-emerald-500' },
          { label: 'Preparing', value: byStatus('preparing'), bg: 'bg-blue-500' },
          { label: 'Ready to Serve', value: byStatus('ready'), bg: 'bg-violet-500' },
        ].map((c, i) => (
          <div key={i} className="card p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0`}>
              {i === 0 ? orders.length : i === 2 ? byStatus('preparing') : i === 3 ? byStatus('ready') : '💰'}
            </div>
            <div>
              <div className="text-2xl font-display font-bold text-gray-900 dark:text-white">{c.value}</div>
              <div className="text-sm text-gray-500">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Kitchen-style board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="skeleton h-4 w-20" />
              <div className="skeleton h-3 w-32" />
              <div className="skeleton h-3 w-24" />
            </div>
          ))
        ) : orders.length === 0 ? (
          <div className="col-span-full">
            <EmptyState icon={BuildingStorefrontIcon} title="No orders found" description="Add orders via the Records module with type 'customer' and industry 'restaurant'." />
          </div>
        ) : orders.map((order, i) => (
          <div key={order._id} className="card p-5 space-y-3 hover:shadow-soft-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-gray-900 dark:text-white text-sm">{order.name}</div>
                {order.tableNumber && (
                  <div className="text-xs text-gray-500 mt-0.5">Table {order.tableNumber}</div>
                )}
              </div>
              {order.orderStatus && (
                <span className={`badge capitalize ${STATUS_STYLES[order.orderStatus] || STATUS_STYLES.pending}`}>
                  {order.orderStatus}
                </span>
              )}
            </div>

            {(order.orderItems || []).length > 0 && (
              <div className="space-y-1 border-t border-gray-100 dark:border-gray-700 pt-2">
                {order.orderItems.map((item, j) => (
                  <div key={j} className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>{item.quantity}× {item.name}</span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-2">
              <span className="text-xs text-gray-500">Total</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(order.totalAmount || 0)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
