'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  UserPlus,
  Mail,
  MoreVertical,
  Crown,
  Shield,
  User,
  Calendar,
  Copy,
  Check
} from 'lucide-react';

interface OrganizationMember {
  id: string;
  userId: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
  role: 'admin' | 'member' | 'viewer';
  joinedAt: string;
  lastActive: string | null;
}

interface MemberManagementProps {
  organizationId: string;
}

export function MemberManagement({ organizationId }: MemberManagementProps) {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [organizationId]);

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/members');
      
      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }
      
      const data = await response.json();
      
      // Map the API response to the expected format
      const mappedMembers = (data.members || []).map((member: any) => ({
        id: member.id,
        userId: member.id,
        email: member.email,
        name: member.name,
        imageUrl: member.imageUrl,
        role: 'member' as const, // Default role since we don't have roles in the schema yet
        joinedAt: member.createdAt,
        lastActive: member.createdAt,
      }));
      
      setMembers(mappedMembers);
    } catch (error) {
      console.error('Error fetching members:', error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async () => {
    try {
      // Call API to invite member
      // await fetch(`/api/organizations/${organizationId}/invites`, {
      //   method: 'POST',
      //   body: JSON.stringify({ email: inviteEmail, role: inviteRole })
      // });

      console.log('Inviting member:', { email: inviteEmail, role: inviteRole });
      setInviteEmail('');
      setInviteRole('member');
      setShowInviteDialog(false);
      // Refresh members list
      // fetchMembers();
    } catch (error) {
      console.error('Error inviting member:', error);
    }
  };

  const updateMemberRole = async (memberId: string, newRole: 'admin' | 'member' | 'viewer') => {
    try {
      // Call API to update member role
      // await fetch(`/api/organizations/${organizationId}/members/${memberId}`, {
      //   method: 'PATCH',
      //   body: JSON.stringify({ role: newRole })
      // });

      setMembers(prev =>
        prev.map(member =>
          member.id === memberId ? { ...member, role: newRole } : member
        )
      );
    } catch (error) {
      console.error('Error updating member role:', error);
    }
  };

  const removeMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      // Call API to remove member
      // await fetch(`/api/organizations/${organizationId}/members/${memberId}`, {
      //   method: 'DELETE'
      // });

      setMembers(prev => prev.filter(member => member.id !== memberId));
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/invite/${organizationId}`;
    navigator.clipboard.writeText(inviteLink);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'member':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'viewer':
        return <User className="h-4 w-4 text-gray-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'member':
        return 'secondary';
      case 'viewer':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(part => part[0]).join('').toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return <div>Loading members...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Team Members</h2>
          <p className="text-muted-foreground">
            Manage who has access to your organization's projects
          </p>
        </div>

        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation to join your organization
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInviteEmail(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Role</label>
                <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <div>
                          <div>Viewer</div>
                          <div className="text-xs text-muted-foreground">Can view projects and documentation</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="member">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4" />
                        <div>
                          <div>Member</div>
                          <div className="text-xs text-muted-foreground">Can manage projects and documentation</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center space-x-2">
                        <Crown className="h-4 w-4" />
                        <div>
                          <div>Admin</div>
                          <div className="text-xs text-muted-foreground">Full access to organization settings</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={copyInviteLink}
                  className="flex items-center space-x-2"
                >
                  {copiedInvite ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedInvite ? 'Copied!' : 'Copy Invite Link'}</span>
                </Button>

                <Button onClick={handleInviteMember} disabled={!inviteEmail}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Invitation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Members ({members.length})</CardTitle>
          <CardDescription>
            People who have access to this organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={member.imageUrl || undefined} />
                    <AvatarFallback>
                      {getInitials(member.name, member.email)}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">
                        {member.name || member.email.split('@')[0]}
                      </h4>
                      <Badge variant={getRoleBadgeVariant(member.role)} className="flex items-center space-x-1">
                        {getRoleIcon(member.role)}
                        <span className="capitalize">{member.role}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Joined {formatDate(member.joinedAt)}</span>
                      </span>
                      <span>Last active {formatDate(member.lastActive)}</span>
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => updateMemberRole(member.id, 'admin')}>
                      <Crown className="h-4 w-4 mr-2" />
                      Make Admin
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateMemberRole(member.id, 'member')}>
                      <Shield className="h-4 w-4 mr-2" />
                      Make Member
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateMemberRole(member.id, 'viewer')}>
                      <User className="h-4 w-4 mr-2" />
                      Make Viewer
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => removeMember(member.id)}
                      className="text-red-600"
                    >
                      Remove from Organization
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Permissions Info */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Crown className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Admin</h4>
                <p className="text-sm text-muted-foreground">
                  Full access to organization settings, can manage members, projects, and billing
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Member</h4>
                <p className="text-sm text-muted-foreground">
                  Can manage projects, connect repositories, and configure Gem agent settings
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-gray-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Viewer</h4>
                <p className="text-sm text-muted-foreground">
                  Can view projects, documentation, and activity logs but cannot make changes
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}