import React from 'react';
import { PackageOpen, AlertTriangle } from 'lucide-react';
import { useData } from './DataContext';

export const InventoryManagement = () => {
  const { approvedRequests } = useData();

  const standardInventory = [
    { id: 'INV-001', name: 'Paracetamol 500mg', quantity: '1,200 Strips', expiry: 'Jan 2026', status: 'Good' },
    { id: 'INV-002', name: 'Amoxicillin Syrup', quantity: '45 Bottles', expiry: 'May 2024', status: 'Low Stock' },
    { id: 'INV-003', name: 'Insulin Vials', quantity: '12 Vials', expiry: 'Aug 2024', status: 'Near Expiry' },
    { id: 'INV-004', name: 'Bandages (Large)', quantity: '500 Units', expiry: 'Dec 2028', status: 'Good' },
    { id: 'INV-005', name: 'Vitamin C Tablets', quantity: '80 Strips', expiry: 'Jul 2024', status: 'Near Expiry' },
  ];

  const incomingInventory = approvedRequests
    .filter(req => req.pickupStatus === 'Completed')
    .map(req => ({
      id: `INV-PU-${req.id}`,
      name: req.medicine,
      quantity: req.quantity,
      expiry: req.expiry,
      status: 'Good'
    }));

  const inventory = [...incomingInventory, ...standardInventory];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <PackageOpen className="w-6 h-6 text-emerald-600" />
          <h2 className="text-xl font-bold text-gray-800">Inventory Management</h2>
        </div>
        <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">View All</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500">
              <th className="pb-3 font-medium">Medicine Name</th>
              <th className="pb-3 font-medium">Quantity</th>
              <th className="pb-3 font-medium">Expiry Date</th>
              <th className="pb-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {inventory.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-3 font-medium text-gray-800">{item.name}</td>
                <td className="py-3 text-gray-600">{item.quantity}</td>
                <td className="py-3 text-gray-600">
                  <span className={`${item.status === 'Near Expiry' ? 'text-red-600 font-semibold' : ''}`}>
                    {item.expiry}
                  </span>
                </td>
                <td className="py-3">
                  {item.status === 'Good' && <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700">Good</span>}
                  {item.status === 'Low Stock' && <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 gap-1"><AlertTriangle className="w-3 h-3"/> Low Stock</span>}
                  {item.status === 'Near Expiry' && <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-700 gap-1"><AlertTriangle className="w-3 h-3"/> Near Expiry</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
