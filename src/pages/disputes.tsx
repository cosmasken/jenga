import { useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmptyDisputesState } from "@/assets/empty-states";
import { Gavel, TriangleAlert, Clock, Check, AlertCircle, TrendingUp } from "lucide-react";

export default function Disputes() {
    const { disputes, groups, addDispute, setShowVotingModal } = useStore();
    const { toast } = useToast();

    const [disputeForm, setDisputeForm] = useState({
        groupId: "",
        type: "",
        description: "",
        evidence: ""
    });

    const handleSubmitDispute = (e: React.FormEvent) => {
        e.preventDefault();

        if (!disputeForm.groupId || !disputeForm.type || !disputeForm.description.trim()) {
            toast({
                title: "Please fill in all required fields",
                description: "Group, dispute type, and description are required.",
                variant: "destructive",
            });
            return;
        }

        const selectedGroup = groups.find(g => g.id === disputeForm.groupId);
        if (!selectedGroup) return;

        const newDispute = {
            id: Date.now().toString(),
            groupId: disputeForm.groupId,
            groupName: selectedGroup.name,
            title: getDisputeTitle(disputeForm.type),
            description: disputeForm.description,
            type: disputeForm.type as 'payment' | 'late' | 'fraud' | 'rule',
            reportedBy: "You",
            reportedAt: new Date(),
            votingEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
            votesSupport: 0,
            votesDispute: 0,
            status: 'active' as const,
            evidence: disputeForm.evidence || undefined,
        };

        addDispute(newDispute);

        toast({
            title: "Dispute Submitted",
            description: "Your dispute has been submitted for community voting.",
            className: "bg-[hsl(27,87%,54%)] text-white border-[hsl(27,87%,49%)]",
        });

        // Reset form
        setDisputeForm({
            groupId: "",
            type: "",
            description: "",
            evidence: ""
        });
    };

    const getDisputeTitle = (type: string) => {
        const titles = {
            payment: 'Payment Dispute',
            late: 'Late Payment Report',
            fraud: 'Fraudulent Activity',
            rule: 'Rule Violation'
        };
        return titles[type as keyof typeof titles] || 'Dispute';
    };

    const handleVote = (dispute: any) => {
        setShowVotingModal(true, dispute);
    };

    const formatTimeRemaining = (date: Date) => {
        const now = new Date();
        const diff = date.getTime() - now.getTime();

        if (diff <= 0) return "Voting ended";

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `${days}d ${hours % 24}h`;
        }

        return `${hours}h ${minutes}m`;
    };

    const activeDisputes = disputes.filter(d => d.status === 'active');
    const resolvedDisputes = disputes.filter(d => d.status === 'resolved');

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <motion.div className="mb-8" variants={itemVariants}>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-2">
                        Dispute Center
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Resolve conflicts and maintain community trust
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Active Disputes */}
                        <motion.div variants={itemVariants}>
                            <Card className="border border-gray-200 dark:border-gray-700">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                            Active Disputes
                                        </h2>
                                        <Badge
                                            variant="destructive"
                                            className="bg-red-500 text-white"
                                        >
                                            {activeDisputes.length} Active
                                        </Badge>
                                    </div>

                                    {activeDisputes.length === 0 ? (
                                        <EmptyDisputesState />
                                    ) : (
                                        <div className="space-y-4">
                                            {activeDisputes.map((dispute) => (
                                                <motion.div
                                                    key={dispute.id}
                                                    className={`border rounded-xl p-4 ${dispute.type === 'payment' ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20' :
                                                        dispute.type === 'late' ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20' :
                                                            dispute.type === 'fraud' ? 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20' :
                                                                'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
                                                        }`}
                                                    whileHover={{ scale: 1.02 }}
                                                    transition={{ type: "spring", stiffness: 300 }}
                                                    data-testid={`dispute-${dispute.id}`}
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center">
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white mr-3 ${dispute.type === 'payment' ? 'bg-red-500' :
                                                                dispute.type === 'late' ? 'bg-yellow-500' :
                                                                    dispute.type === 'fraud' ? 'bg-purple-500' :
                                                                        'bg-blue-500'
                                                                }`}>
                                                                {dispute.type === 'payment' ? <TriangleAlert className="h-5 w-5" /> :
                                                                    dispute.type === 'late' ? <Clock className="h-5 w-5" /> :
                                                                        dispute.type === 'fraud' ? <AlertCircle className="h-5 w-5" /> :
                                                                            <Gavel className="h-5 w-5" />}
                                                            </div>
                                                            <div>
                                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                                    {dispute.title}
                                                                </h3>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {dispute.groupName} • Reported by {dispute.reportedBy}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className={`text-sm font-medium ${dispute.type === 'payment' ? 'text-red-600 dark:text-red-400' :
                                                                dispute.type === 'late' ? 'text-yellow-600 dark:text-yellow-400' :
                                                                    dispute.type === 'fraud' ? 'text-purple-600 dark:text-purple-400' :
                                                                        'text-blue-600 dark:text-blue-400'
                                                                }`}>
                                                                Voting Ends In
                                                            </div>
                                                            <div className={`text-lg font-bold ${dispute.type === 'payment' ? 'text-red-600 dark:text-red-400' :
                                                                dispute.type === 'late' ? 'text-yellow-600 dark:text-yellow-400' :
                                                                    dispute.type === 'fraud' ? 'text-purple-600 dark:text-purple-400' :
                                                                        'text-blue-600 dark:text-blue-400'
                                                                }`}>
                                                                {formatTimeRemaining(dispute.votingEndsAt)}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                                                        {dispute.description}
                                                    </p>

                                                    {dispute.evidence && (
                                                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                                                            <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                                                                Evidence Provided:
                                                            </p>
                                                            <p className="text-sm text-blue-700 dark:text-blue-400 font-mono">
                                                                {dispute.evidence}
                                                            </p>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="text-sm">
                                                                <span className="text-gray-600 dark:text-gray-400">Votes:</span>
                                                                <span className="font-medium text-green-600 dark:text-green-400 ml-1">
                                                                    {dispute.votesSupport} Support
                                                                </span>
                                                                <span className="font-medium text-red-600 dark:text-red-400 ml-2">
                                                                    {dispute.votesDispute} Dispute
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            onClick={() => handleVote(dispute)}
                                                            className="bg-[hsl(27,87%,54%)] hover:bg-[hsl(27,87%,49%)] text-white"
                                                            data-testid={`button-vote-${dispute.id}`}
                                                        >
                                                            Cast Vote
                                                        </Button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Resolved Disputes */}
                        {resolvedDisputes.length > 0 && (
                            <motion.div variants={itemVariants}>
                                <Card className="border border-gray-200 dark:border-gray-700">
                                    <CardContent className="p-6">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                            Recently Resolved
                                        </h2>
                                        <div className="space-y-4">
                                            {resolvedDisputes.slice(0, 3).map((dispute) => (
                                                <div
                                                    key={dispute.id}
                                                    className="border border-green-200 dark:border-green-800 rounded-xl p-4 bg-green-50 dark:bg-green-900/20"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white mr-3">
                                                                <Check className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                                    {dispute.title}
                                                                </h3>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                    Resolved 2 days ago • {dispute.groupName}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Badge className="bg-green-500 text-white">
                                                            Resolved
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Raise Dispute Form */}
                        <motion.div variants={itemVariants}>
                            <Card className="border border-gray-200 dark:border-gray-700">
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                                        Raise a Dispute
                                    </h3>
                                    <form onSubmit={handleSubmitDispute} className="space-y-4">
                                        <div>
                                            <Label htmlFor="group" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Group *
                                            </Label>
                                            <Select
                                                value={disputeForm.groupId}
                                                onValueChange={(value) => setDisputeForm(prev => ({ ...prev, groupId: value }))}
                                            >
                                                <SelectTrigger data-testid="select-dispute-group">
                                                    <SelectValue placeholder="Select a group" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {groups.map((group) => (
                                                        <SelectItem key={group.id} value={group.id}>
                                                            {group.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="type" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Dispute Type *
                                            </Label>
                                            <Select
                                                value={disputeForm.type}
                                                onValueChange={(value) => setDisputeForm(prev => ({ ...prev, type: value }))}
                                            >
                                                <SelectTrigger data-testid="select-dispute-type">
                                                    <SelectValue placeholder="Select dispute type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="payment">Payment Issue</SelectItem>
                                                    <SelectItem value="late">Late Payment</SelectItem>
                                                    <SelectItem value="fraud">Fraudulent Activity</SelectItem>
                                                    <SelectItem value="rule">Rule Violation</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Description *
                                            </Label>
                                            <Textarea
                                                id="description"
                                                placeholder="Describe the issue..."
                                                rows={4}
                                                value={disputeForm.description}
                                                onChange={(e) => setDisputeForm(prev => ({ ...prev, description: e.target.value }))}
                                                data-testid="textarea-dispute-description"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="evidence" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Evidence (Transaction Hash)
                                            </Label>
                                            <Input
                                                id="evidence"
                                                type="text"
                                                placeholder="Optional transaction hash"
                                                value={disputeForm.evidence}
                                                onChange={(e) => setDisputeForm(prev => ({ ...prev, evidence: e.target.value }))}
                                                data-testid="input-dispute-evidence"
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3"
                                            data-testid="button-submit-dispute"
                                        >
                                            Submit Dispute
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Community Stats */}
                        <motion.div variants={itemVariants}>
                            <Card className="border border-gray-200 dark:border-gray-700">
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                                        Community Stats
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Resolution Rate</span>
                                            <span className="font-semibold text-green-500">94.2%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Avg. Resolution Time</span>
                                            <span className="font-semibold text-gray-900 dark:text-gray-100">1.8 days</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Your Voting Power</span>
                                            <span className="font-semibold text-[hsl(27,87%,54%)]">87.5%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Disputes Resolved</span>
                                            <span className="font-semibold text-gray-900 dark:text-gray-100">23</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 p-4 bg-[hsl(27,87%,54%)]/10 rounded-lg border border-[hsl(27,87%,54%)]/20">
                                        <div className="flex items-center mb-2">
                                            <TrendingUp className="h-5 w-5 text-[hsl(27,87%,54%)] mr-2" />
                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                Voting Streak
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            You've participated in 12 consecutive dispute votes. Keep it up to maintain your reputation!
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
