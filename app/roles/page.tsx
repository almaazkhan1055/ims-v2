'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/guards/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, Shield, Edit, Save, X } from 'lucide-react';
import { UserRole } from '@/lib/types';

interface MockUser {
  id: number;
  name: string;
  email: string;
  currentRole: UserRole;
  department: string;
}

const mockUsers: MockUser[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    currentRole: 'ta_member',
    department: 'Engineering',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    currentRole: 'panelist',
    department: 'HR',
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike@example.com',
    currentRole: 'panelist',
    department: 'Engineering',
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    currentRole: 'admin',
    department: 'Management',
  },
];

const rolePermissions = {
  admin: [
    'View Dashboard',
    'Manage Candidates',
    'Manage Roles',
    'View Feedback',
    'Submit Feedback',
  ],
  ta_member: [
    'View Dashboard',
    'Manage Candidates',
    'View Feedback',
  ],
  panelist: [
    'View Dashboard',
    'View Candidates',
    'Submit Feedback',
  ],
};

export default function RoleManagementPage() {
  const [users, setUsers] = useState<MockUser[]>(mockUsers);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingRole, setEditingRole] = useState<UserRole>('admin');

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'ta_member':
        return 'default';
      case 'panelist':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const handleEditRole = (userId: number, currentRole: UserRole) => {
    setEditingId(userId);
    setEditingRole(currentRole);
  };

  const handleSaveRole = (userId: number) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, currentRole: editingRole }
        : user
    ));
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  return (
    <ProtectedRoute requiredPermission="manage_roles">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-600 mt-2">
            Manage user roles and permissions for the interview system.
          </p>
        </div>

        {/* Role Permissions Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Object.entries(rolePermissions).map(([role, permissions]) => (
            <Card key={role}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>{role.replace('_', ' ').toUpperCase()}</span>
                  <Badge variant={getRoleBadgeVariant(role as UserRole)}>
                    {permissions.length} permissions
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {permissions.map((permission) => (
                    <div key={permission} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm">{permission}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* User Role Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>User Role Assignment</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>
                      {editingId === user.id ? (
                        <Select
                          value={editingRole}
                          onValueChange={(value: UserRole) => setEditingRole(value)}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrator</SelectItem>
                            <SelectItem value="ta_member">TA Member</SelectItem>
                            <SelectItem value="panelist">Panelist</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant={getRoleBadgeVariant(user.currentRole)}>
                          {user.currentRole.replace('_', ' ').toUpperCase()}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === user.id ? (
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveRole(user.id)}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditRole(user.id, user.currentRole)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Role
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800">Security Notice</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Role changes take effect immediately. Users will need to refresh their session 
                  to see updated permissions. Only administrators can access this page.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}