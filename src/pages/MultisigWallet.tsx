import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Loader2, Users, Check, XCircle, Send, PlusCircle } from 'lucide-react';
import {
  getMultisigOwners,
  getMultisigTransactionCount,
  getMultisigTransaction,
  getMultisigBalance,
  submitMultisigTransaction,
  confirmMultisigTransaction,
  revokeMultisigConfirmation,
  executeMultisigTransaction,
} from '@/utils/ethUtils';
import { useToast } from '@/hooks/use-toast';

const MultisigWallet = () => {
  const [owners, setOwners] = useState<string[]>([]);
  const [balance, setBalance] = useState<string>('0');
  const [txCount, setTxCount] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitForm, setSubmitForm] = useState({ to: '', value: '', data: '' });
  const [actionLoading, setActionLoading] = useState<{ [key: number]: boolean }>({});
  const { toast } = useToast();

  // Fetch wallet state
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [owners, balance, txCount] = await Promise.all([
          getMultisigOwners(),
          getMultisigBalance(),
          getMultisigTransactionCount(),
        ]);
        setOwners(owners);
        setBalance(balance.toString());
        setTxCount(Number(txCount));
      } catch (e) {
        toast({ title: 'Error loading multisig wallet', description: String(e), variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  // Fetch transactions
  useEffect(() => {
    if (txCount === 0) return;
    setLoading(true);
    Promise.all(
      Array.from({ length: txCount }, (_, i) => getMultisigTransaction(i))
    )
      .then(setTransactions)
      .catch((e) => toast({ title: 'Error loading transactions', description: String(e), variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [txCount, toast]);

  // Handlers for actions
  const handleSubmitTx = async () => {
    setActionLoading((a) => ({ ...a, submit: true }));
    try {
      await submitMultisigTransaction(submitForm.to, submitForm.value, submitForm.data);
      toast({ title: 'Transaction submitted', description: 'New transaction proposal submitted.' });
      setShowSubmitModal(false);
      setSubmitForm({ to: '', value: '', data: '' });
      setTxCount((c) => c + 1); // Trigger reload
    } catch (e) {
      toast({ title: 'Error submitting transaction', description: String(e), variant: 'destructive' });
    } finally {
      setActionLoading((a) => ({ ...a, submit: false }));
    }
  };

  const handleConfirmTx = async (i: number) => {
    setActionLoading((a) => ({ ...a, [i]: true }));
    try {
      await confirmMultisigTransaction(i);
      toast({ title: 'Confirmed', description: 'Transaction confirmed.' });
    } catch (e) {
      toast({ title: 'Error confirming', description: String(e), variant: 'destructive' });
    } finally {
      setActionLoading((a) => ({ ...a, [i]: false }));
    }
  };
  const handleRevokeTx = async (i: number) => {
    setActionLoading((a) => ({ ...a, [i]: true }));
    try {
      await revokeMultisigConfirmation(i);
      toast({ title: 'Revoked', description: 'Confirmation revoked.' });
    } catch (e) {
      toast({ title: 'Error revoking', description: String(e), variant: 'destructive' });
    } finally {
      setActionLoading((a) => ({ ...a, [i]: false }));
    }
  };
  const handleExecuteTx = async (i: number) => {
    setActionLoading((a) => ({ ...a, [i]: true }));
    try {
      await executeMultisigTransaction(i);
      toast({ title: 'Executed', description: 'Transaction executed.' });
    } catch (e) {
      toast({ title: 'Error executing', description: String(e), variant: 'destructive' });
    } finally {
      setActionLoading((a) => ({ ...a, [i]: false }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-8">
      <Card className="bg-gradient-to-br from-yellow-900/30 to-gray-900/80 shadow-lg border border-yellow-400">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-300">
            <Users className="w-5 h-5" /> Multisig Wallet
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin w-8 h-8 text-yellow-400" />
            </div>
          ) : (
            <div>
              <div className="mb-4 flex flex-wrap gap-4">
                <div>
                  <div className="text-sm text-gray-400">Balance</div>
                  <div className="font-bold text-2xl text-yellow-200">{balance} cBTC</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Owners</div>
                  <div className="flex flex-wrap gap-2">
                    {owners.map((o) => (
                      <span key={o} className="bg-yellow-800/30 text-yellow-200 px-2 py-1 rounded font-mono text-xs">
                        {o.slice(0, 6)}...{o.slice(-4)}
                      </span>
                    ))}
                  </div>
                </div>
                <Button className="ml-auto bg-yellow-400 text-black font-bold shadow" onClick={() => setShowSubmitModal(true)}>
                  <PlusCircle className="w-4 h-4 mr-2" /> New Transaction
                </Button>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-bold text-yellow-300 mb-2">Transactions</h3>
                {transactions.length === 0 ? (
                  <div className="text-gray-400">No transactions yet.</div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((tx, i) => (
                      <Card key={i} className="bg-gray-900/60 border border-yellow-900">
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-mono text-xs text-gray-400">To: {tx.to.slice(0, 8)}...{tx.to.slice(-4)}</div>
                            <div className="flex gap-2">
                              {tx.executed ? (
                                <span className="text-green-400 flex items-center gap-1"><Check className="w-4 h-4" />Executed</span>
                              ) : (
                                <span className="text-yellow-400 flex items-center gap-1"><Send className="w-4 h-4" />Pending</span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-4 mb-2">
                            <div className="text-xs text-gray-400">Value: <span className="text-yellow-200 font-mono">{tx.value}</span></div>
                            <div className="text-xs text-gray-400">Confirmations: <span className="text-yellow-200 font-mono">{tx.numConfirmations}</span></div>
                          </div>
                          <div className="flex gap-2">
                            {!tx.executed && <>
                              <Button size="sm" disabled={actionLoading[i]} onClick={() => handleConfirmTx(i)} className="bg-green-600 hover:bg-green-700 text-white">
                                {actionLoading[i] ? <Loader2 className="animate-spin w-4 h-4" /> : <Check className="w-4 h-4 mr-1" />} Confirm
                              </Button>
                              <Button size="sm" disabled={actionLoading[i]} onClick={() => handleRevokeTx(i)} className="bg-yellow-600 hover:bg-yellow-700 text-white">
                                {actionLoading[i] ? <Loader2 className="animate-spin w-4 h-4" /> : <XCircle className="w-4 h-4 mr-1" />} Revoke
                              </Button>
                              <Button size="sm" disabled={actionLoading[i]} onClick={() => handleExecuteTx(i)} className="bg-blue-600 hover:bg-blue-700 text-white">
                                {actionLoading[i] ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4 mr-1" />} Execute
                              </Button>
                            </>}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Transaction Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit New Transaction"
        type="multisig"
        description="Propose a new transaction for the multisig wallet. Requires owner confirmations."
      >
        <div className="space-y-4">
          <Input
            placeholder="Recipient address"
            value={submitForm.to}
            onChange={(e) => setSubmitForm((f) => ({ ...f, to: e.target.value }))}
          />
          <Input
            placeholder="Value (in cBTC wei)"
            value={submitForm.value}
            onChange={(e) => setSubmitForm((f) => ({ ...f, value: e.target.value }))}
          />
          <Input
            placeholder="Data (hex, optional)"
            value={submitForm.data}
            onChange={(e) => setSubmitForm((f) => ({ ...f, data: e.target.value }))}
          />
          <Button className="w-full bg-yellow-400 text-black font-bold" onClick={handleSubmitTx} disabled={actionLoading.submit}>
            {actionLoading.submit ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <PlusCircle className="w-4 h-4 mr-2" />}
            Submit Transaction
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default MultisigWallet;
