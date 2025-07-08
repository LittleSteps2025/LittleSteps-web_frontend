import { CreditCard, Search, DollarSign, FileText, CheckCircle, Clock } from 'lucide-react';

const Payments = () => {
  const payments = [
    { id: 1, parent: 'malith', amount: 250, date: '2023-05-15', status: 'Paid', invoice: '001' },
    { id: 2, parent: 'farshad', amount: 250, date: '2023-05-10', status: 'Paid', invoice: '002' },
    { id: 3, parent: 'chathumini', amount: 250, date: '2023-05-05', status: 'Pending', invoice: '003' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
       <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="bg-gradient-to-r from-[#4f46e5] to-[#7c73e6] bg-clip-text text-transparent">
            Payments
          </span>
        </h1>
        <button className="btn-primary">
          <CreditCard className="w-4 h-4 mr-2" />
          Process Payment
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <div className="flex items-center">
              <DollarSign className="text-indigo-600 mr-2" />
              <h3 className="font-medium">Total Revenue</h3>
            </div>
            <p className="text-2xl font-bold mt-2">$1,250.00</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="text-green-600 mr-2" />
              <h3 className="font-medium">Paid</h3>
            </div>
            <p className="text-2xl font-bold mt-2">$750.00</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Clock className="text-yellow-600 mr-2" />
              <h3 className="font-medium">Pending</h3>
            </div>
            <p className="text-2xl font-bold mt-2">$500.00</p>
          </div>
        </div>

        <div className="flex items-center mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search payments..."
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {payment.invoice}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.parent}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${payment.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      payment.status === 'Paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3 flex items-center">
                      <FileText className="w-4 h-4 mr-1" />
                      Receipt
                    </button>
                    {payment.status === 'Pending' && (
                      <button className="text-green-600 hover:text-green-900 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payments;