import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { useRosca } from "../hooks/useRosca";
import { useLocation } from "wouter";
import { useRoscaToast } from "@/hooks/use-rosca-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Gavel, TriangleAlert, Clock, Check, AlertCircle, TrendingUp, Wallet, FileText, Users } from "lucide-react";

interface Dispute {
    id: string;
    groupId: string;
    groupName: string;
    type: string;
    description: string;
    evidence: string;
    status: 'pending' | 'investigating' | 'resolved';
    createdAt: Date;
    reporter: string;
}

export default function Disputes() {
    const { primaryWallet, user } = useDynamicContext();
    const isLoggedIn = useIsLoggedIn();
    const [, setLocation] = useLocation();
    const { isConnected, groupCount, getGroupCount } = useRosca();
    const { success, warning, error } = useRoscaToast();

    // Local state for disputes (in a real app, this would come from a backend/contract)
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [userGroups, setUserGroups] = useState<any[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const [disputeForm, setDisputeForm] = useState({
        groupId: "",
        type: "",
        description: "",
        evidence: ""
    });

    // Redirect if not logged in
    useEffect(() => {
        if (!isLoggedIn) {
            setLocation("/");
        }
    }, [isLoggedIn, setLocation]);

    // Load data when connected
    useEffect(() => {
        if (isConnected && primaryWallet) {
            getGroupCount();
            // TODO: Load user's groups and disputes from contract/backend
            loadUserData();
        }
    }, [isConnected, primaryWallet, getGroupCount]);

    const loadUserData = async () => {
        // TODO: Replace with real data loading
        // For now, we'll use empty arrays since we're removing faker
        setUserGroups([]);
        setDisputes([]);
    };

    const handleSubmitDispute = (e: React.FormEvent) => {
        e.preventDefault();

        if (!disputeForm.groupId || !disputeForm.type || !disputeForm.description.trim()) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        if (!primaryWallet?.address) {
            error("Wallet Error", "Please ensure your wallet is connected");
            return;
        }

        // Create new dispute
        const newDispute: Dispute = {
            id: Date.now().toString(),
            groupId: disputeForm.groupId,
            groupName: `Group #${disputeForm.groupId}`,
            type: disputeForm.type,
            description: disputeForm.description,
            evidence: disputeForm.evidence,
            status: 'pending',
            createdAt: new Date(),
            reporter: primaryWallet.address,
        };

        setDisputes(prev => [newDispute, ...prev]);

        // Reset form
        setDisputeForm({
            groupId: "",
            type: "",
            description: "",
            evidence: ""
        });
        setShowCreateForm(false);

        success("Dispute Submitted! ⚖️", "Your dispute has been submitted and is under review");
    };

    const handleVoteOnDispute = (disputeId: string) => {
        // TODO: Implement voting functionality
        toast({
            title: "Coming Soon",
            description: "Dispute voting functionality will be available soon",
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'investigating': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="h-4 w-4" />;
            case 'investigating': return <AlertCircle className="h-4 w-4" />;
            case 'resolved': return <Check className="h-4 w-4" />;
            default: return <TriangleAlert className="h-4 w-4" />;
        }
    };

    if (!isConnected || !primaryWallet) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6 text-center">
                        <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h2 className="text-xl font-bold mb-2">Wallet Not Connected</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Please connect your wallet to access disputes.
                        </p>
                        <Button onClick={() => setLocation("/")} className="w-full">
                            Go to Landing
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                Disputes
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Manage and resolve group disputes fairly and transparently
                            </p>
                        </div>
                        <Button
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            className="bg-[hsl(27,87%,54%)] hover:bg-[hsl(27,87%,49%)]"
                        >
                            <Gavel className="h-4 w-4 mr-2" />
                            Report Dispute
                        </Button>
                    </div>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Total Disputes
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                            {disputes.length}
                                        </p>
                                    </div>
                                    <Gavel className="h-8 w-8 text-[hsl(27,87%,54%)]" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Pending
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                            {disputes.filter(d => d.status === 'pending').length}
                                        </p>
                                    </div>
                                    <Clock className="h-8 w-8 text-yellow-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Resolved
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                            {disputes.filter(d => d.status === 'resolved').length}
                                        </p>
                                    </div>
                                    <Check className="h-8 w-8 text-green-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Create Dispute Form */}
                {showCreateForm && (
                    <motion.div
                        className="mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                    Report a Dispute
                                </h2>
                                <form onSubmit={handleSubmitDispute} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="groupId">Group ID *</Label>
                                            <Input
                                                id="groupId"
                                                type="number"
                                                placeholder="Enter group ID"
                                                value={disputeForm.groupId}
                                                onChange={(e) => setDisputeForm(prev => ({
                                                    ...prev,
                                                    groupId: e.target.value
                                                }))}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="type">Dispute Type *</Label>
                                            <Select
                                                value={disputeForm.type}
                                                onValueChange={(value) => setDisputeForm(prev => ({
                                                    ...prev,
                                                    type: value
                                                }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select dispute type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="missed_payment">Missed Payment</SelectItem>
                                                    <SelectItem value="unfair_payout">Unfair Payout</SelectItem>
                                                    <SelectItem value="rule_violation">Rule Violation</SelectItem>
                                                    <SelectItem value="fraud">Fraud</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="description">Description *</Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Describe the dispute in detail..."
                                            value={disputeForm.description}
                                            onChange={(e) => setDisputeForm(prev => ({
                                                ...prev,
                                                description: e.target.value
                                            }))}
                                            rows={4}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="evidence">Evidence (Optional)</Label>
                                        <Textarea
                                            id="evidence"
                                            placeholder="Provide any evidence or additional information..."
                                            value={disputeForm.evidence}
                                            onChange={(e) => setDisputeForm(prev => ({
                                                ...prev,
                                                evidence: e.target.value
                                            }))}
                                            rows={3}
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <Button
                                            type="submit"
                                            className="bg-[hsl(27,87%,54%)] hover:bg-[hsl(27,87%,49%)]"
                                        >
                                            Submit Dispute
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setShowCreateForm(false)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Disputes List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <Card>
                        <CardContent className="p-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                All Disputes
                            </h2>

                            {disputes.length === 0 ? (
                                <div className="text-center py-12">
                                    <Gavel className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                        No Disputes
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                                        No disputes have been reported yet. This is a good sign for community trust!
                                    </p>
                                    <Button
                                        onClick={() => setShowCreateForm(true)}
                                        variant="outline"
                                    >
                                        <FileText className="h-4 w-4 mr-2" />
                                        Report First Dispute
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {disputes.map((dispute) => (
                                        <Card key={dispute.id} className="border border-gray-200 dark:border-gray-700">
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-shrink-0">
                                                            {getStatusIcon(dispute.status)}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                                {dispute.groupName} - {dispute.type.replace('_', ' ').toUpperCase()}
                                                            </h3>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                Reported by {dispute.reporter.slice(0, 6)}...{dispute.reporter.slice(-4)} • {dispute.createdAt.toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge className={getStatusColor(dispute.status)}>
                                                        {dispute.status.toUpperCase()}
                                                    </Badge>
                                                </div>

                                                <p className="text-gray-700 dark:text-gray-300 mb-3">
                                                    {dispute.description}
                                                </p>

                                                {dispute.evidence && (
                                                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
                                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Evidence:
                                                        </p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {dispute.evidence}
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleVoteOnDispute(dispute.id)}
                                                        disabled={dispute.status === 'resolved'}
                                                    >
                                                        <Users className="h-3 w-3 mr-1" />
                                                        Vote
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setLocation(`/group/${dispute.groupId}`)}
                                                    >
                                                        View Group
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
