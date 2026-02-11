import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const TransactionHistory = ({ transactions }) => {
    if (!transactions || transactions.length === 0) {
        return (
            <div className="text-center py-8 text-slate-400">
                No recent transactions found.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-700 text-slate-400 text-sm">
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Student RegNo</th>
                        <th className="py-3 px-4">Transaction ID</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                        <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {transactions.map((txn) => (
                        <tr key={txn._id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                            <td className="py-3 px-4 text-slate-300">
                                {new Date(txn.date).toLocaleDateString()} {new Date(txn.date).toLocaleTimeString()}
                            </td>
                            <td className="py-3 px-4 text-white font-medium">{txn.regno}</td>
                            <td className="py-3 px-4 text-slate-400 font-mono text-xs">{txn.razorpay_payment_id}</td>
                            <td className="py-3 px-4 text-right text-white">₹{txn.amount}</td>
                            <td className="py-3 px-4 text-center">
                                {txn.status === 'Success' ? (
                                    <span className="inline-flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-1 rounded-full text-xs">
                                        <CheckCircle className="h-3 w-3" /> Success
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-red-400 bg-red-400/10 px-2 py-1 rounded-full text-xs">
                                        <XCircle className="h-3 w-3" /> Failed
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TransactionHistory;
