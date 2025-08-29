import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/hooks/use-toast'
import {
  Share2,
  Users,
  Copy,
  Mail,
  MessageCircle,
  Plus,
  QrCode,
  Link,
  UserPlus,
  Check,
  X
} from 'lucide-react'
import { getChamaUrl } from '@/utils/urlUtils'
import { offchainChamaService } from '@/services/offchainChamaService'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface ChamaShareInviteCardProps {
  chamaAddress: string
  userAddress: Address
}

export function ChamaShareInviteCard({ chamaAddress, userAddress }: ChamaShareInviteCardProps) {
  const [copied, setCopied] = useState(false)

  // Get chama data
  const { data: chama } = useQuery({
    queryKey: ['chama', chamaAddress],
    queryFn: () => offchainChamaService.getChama(chamaAddress)
  })

  const shareUrl = getChamaUrl(chamaAddress)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast({
        title: "📋 Copied to clipboard",
        description: "Share link copied successfully!"
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "❌ Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      })
    }
  }

  const shareViaEmail = () => {
    const subject = `Join "${chama?.name}" Chama`
    const body = `Hi! You've been invited to join our savings circle "${chama?.name}".

🎯 Target Members: ${chama?.member_target}
💰 Contribution: ${chama?.contribution_amount} cBTC
⏰ Round Duration: ${chama?.round_duration_hours / 24} days

Join here: ${shareUrl}

Best regards!`

    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoLink)
  }

  const shareViaWhatsApp = () => {
    const message = `🎉 Join our "${chama?.name}" Chama!

💰 Contribution: ${chama?.contribution_amount} cBTC
👥 Target: ${chama?.member_target} members
⏰ Duration: ${chama?.round_duration_hours / 24} days

Join: ${shareUrl}`

    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappLink, '_blank')
  }

  if (!chama) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Share & Invite
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Share */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Quick Share</Label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={shareViaWhatsApp}
              className="flex-1"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              WhatsApp
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={shareViaEmail}
              className="flex-1"
            >
              <Mail className="h-4 w-4 mr-1" />
              Email
            </Button>
          </div>
        </div>

        <Separator />

        {/* Share Link */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Share Link</Label>
          <div className="flex gap-2">
            <Input
              value={shareUrl}
              readOnly
              className="text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(shareUrl)}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Invitation Code */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Invitation Code</Label>
          <div className="flex gap-2 items-center">
            <Badge variant="secondary" className="font-mono text-sm">
              {chama.invitation_code}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(chama.invitation_code)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Send Direct Invite */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full">
              <UserPlus className="h-4 w-4 mr-2" />
              Send Direct Invite
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Direct Invitations</DialogTitle>
            </DialogHeader>
            <DirectInviteForm chamaId={chamaAddress} inviterAddress={userAddress} />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

interface DirectInviteFormProps {
  chamaId: string
  inviterAddress: Address
}

function DirectInviteForm({ chamaId, inviterAddress }: DirectInviteFormProps) {
  const [invites, setInvites] = useState([{ address: '', email: '', message: '' }])
  const queryClient = useQueryClient()

  const sendInvitesMutation = useMutation({
    mutationFn: async (inviteData: Array<{ invitee_address?: string, invitee_email?: string, message?: string }>) => {
      return offchainChamaService.sendInvitations(chamaId, inviterAddress, inviteData)
    },
    onSuccess: () => {
      toast({
        title: "✅ Invitations sent!",
        description: "All invitations have been sent successfully"
      })
      queryClient.invalidateQueries({ queryKey: ['chama-invites', chamaId] })
      // Reset form
      setInvites([{ address: '', email: '', message: '' }])
    },
    onError: (error) => {
      toast({
        title: "❌ Failed to send invites",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      })
    }
  })

  const addInviteField = () => {
    setInvites([...invites, { address: '', email: '', message: '' }])
  }

  const removeInviteField = (index: number) => {
    if (invites.length > 1) {
      setInvites(invites.filter((_, i) => i !== index))
    }
  }

  const updateInvite = (index: number, field: string, value: string) => {
    const updated = [...invites]
    updated[index] = { ...updated[index], [field]: value }
    setInvites(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Filter out empty invites and validate
    const validInvites = invites.filter(invite =>
      invite.address.trim() || invite.email.trim()
    ).map(invite => ({
      invitee_address: invite.address.trim() || undefined,
      invitee_email: invite.email.trim() || undefined,
      message: invite.message.trim() || undefined
    }))

    if (validInvites.length === 0) {
      toast({
        title: "⚠️ No valid invites",
        description: "Please provide at least one wallet address or email",
        variant: "destructive"
      })
      return
    }

    sendInvitesMutation.mutate(validInvites)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {invites.map((invite, index) => (
        <div key={index} className="space-y-3 p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Invite #{index + 1}</h4>
            {invites.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeInviteField(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label>Wallet Address</Label>
            <Input
              placeholder="0x..."
              value={invite.address}
              onChange={(e) => updateInvite(index, 'address', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Email (optional)</Label>
            <Input
              type="email"
              placeholder="user@example.com"
              value={invite.email}
              onChange={(e) => updateInvite(index, 'email', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Personal Message (optional)</Label>
            <Textarea
              placeholder="Join our savings circle..."
              value={invite.message}
              onChange={(e) => updateInvite(index, 'message', e.target.value)}
              rows={2}
            />
          </div>
        </div>
      ))}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={addInviteField}
          className="flex-1"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Another
        </Button>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={sendInvitesMutation.isPending}
      >
        {sendInvitesMutation.isPending ? "Sending..." : "Send Invitations"}
      </Button>
    </form>
  )
}

interface ChamaInviteManagerProps {
  chamaAddress: string
  userAddress: Address
}

export function ChamaInviteManager({ chamaAddress, userAddress }: ChamaInviteManagerProps) {
  // Get sent invitations
  const { data: invitations, isLoading } = useQuery({
    queryKey: ['chama-invites', chamaAddress],
    queryFn: async () => {
      // This would need to be implemented in the service
      // For now, return empty array
      return []
    }
  })

  const { data: chama } = useQuery({
    queryKey: ['chama', chamaAddress],
    queryFn: () => offchainChamaService.getChama(chamaAddress)
  })

  const { data: members } = useQuery({
    queryKey: ['chama-members', chamaAddress],
    queryFn: () => offchainChamaService.getChamaMembers(chamaAddress)
  })

  if (isLoading) {
    return <div>Loading invitations...</div>
  }

  return (
    <div className="space-y-6">
      {/* Chama Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Chama Members ({members?.length || 0}/{chama?.member_target || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Status</Label>
              <Badge variant={chama?.status === 'draft' ? 'secondary' : 'default'}>
                {chama?.status?.toUpperCase()}
              </Badge>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Contribution Amount</Label>
              <p className="font-medium">{chama?.contribution_amount} cBTC</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Round Duration</Label>
              <p className="font-medium">{(chama?.round_duration_hours || 0) / 24} days</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Security Deposit</Label>
              <p className="font-medium">{chama?.security_deposit} cBTC</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Members */}
      {members && members.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {members.map((member, index) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{member.user_address.slice(0, 10)}...{member.user_address.slice(-8)}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.join_method === 'creator' ? 'Creator' : 'Member'} •
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                    {member.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Invitations */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          {(!invitations || invitations.length === 0) ? (
            <p className="text-muted-foreground text-center py-8">
              No pending invitations
            </p>
          ) : (
            <div className="space-y-2">
              {invitations.map((invitation: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">
                      {invitation.invitee_email || `${invitation.invitee_address?.slice(0, 10)}...`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Sent {new Date(invitation.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary">{invitation.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card> */}
    </div>
  )
}
