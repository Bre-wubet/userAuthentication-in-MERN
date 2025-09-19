import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  Search,
  Filter,
  AlertCircle,
  Lock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { RoleForm } from '../../components/admin/RoleForm';
import { roleAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminRoles() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();

  // Check permissions
  const canCreate = hasPermission('roles.create');
  const canUpdate = hasPermission('roles.update');
  const canDelete = hasPermission('roles.delete');

  const { data: rolesData, isLoading, error } = useQuery(
    'roles',
    () => roleAPI.getAllRoles(),
    {
      keepPreviousData: true,
    }
  );

  const { data: permissionsData } = useQuery(
    'permissions',
    () => roleAPI.getAllPermissions()
  );

  const deleteRoleMutation = useMutation(
    (roleId) => roleAPI.deleteRole(roleId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('roles');
        toast.success('Role deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete role');
      },
    }
  );

  const handleDeleteRole = (roleId, roleName) => {
    if (window.confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
      deleteRoleMutation.mutate(roleId);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCreateRole = () => {
    setSelectedRole(null);
    setShowRoleForm(true);
  };

  const handleEditRole = (role) => {
    setSelectedRole(role);
    setShowRoleForm(true);
  };

  const handleRoleFormClose = () => {
    setShowRoleForm(false);
    setSelectedRole(null);
  };

  const handleRoleFormSuccess = () => {
    queryClient.invalidateQueries('roles');
    setShowRoleForm(false);
    setSelectedRole(null);
  };

  const roles = rolesData?.data?.data || [];
  const permissions = permissionsData?.data?.data || [];

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600">
              {error.response?.data?.message || 'Failed to load roles'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
              <p className="mt-2 text-gray-600">
                Manage roles and their permissions
              </p>
            </div>
            {canCreate ? (
              <Button 
                className="flex items-center"
                onClick={handleCreateRole}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Role
              </Button>
            ) : (
              <div className="flex items-center text-gray-500">
                <Lock className="h-4 w-4 mr-2" />
                <span className="text-sm">Create permission required</span>
              </div>
            )}
          </div>
        </div>

        {/* Permission Notice */}
        {!canCreate && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-amber-600 mr-2" />
                <p className="text-amber-800 text-sm">
                  You don't have permission to create or modify roles. Contact an administrator for access.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search roles..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline" className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredRoles.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Shield className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No roles found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search terms.' : 'No roles have been created yet.'}
              </p>
            </div>
          ) : (
            filteredRoles.map((role) => (
              <Card key={role.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-indigo-600 mr-2" />
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-1">
                      {canUpdate ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRole(role)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      ) : (
                        <div className="w-8 h-8 flex items-center justify-center">
                          <Lock className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                      {canDelete ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRole(role.id, role.name)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : (
                        <div className="w-8 h-8 flex items-center justify-center">
                          <Lock className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    {role.description || 'No description provided'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-2" />
                      {role.userCount} user{role.userCount !== 1 ? 's' : ''}
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Permissions ({role.permissions?.length || 0})
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions?.slice(0, 3).map((permission) => (
                          <span
                            key={permission.id}
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {permission.action}
                          </span>
                        ))}
                        {role.permissions?.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            +{role.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      Created {new Date(role.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Permissions Overview */}
        {permissions.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Available Permissions</CardTitle>
              <CardDescription>
                All permissions that can be assigned to roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {permissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {permission.action}
                      </div>
                      <div className="text-xs text-gray-500">
                        {permission.resource}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {permission.description}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Role Form Modal */}
        {showRoleForm && (
          <RoleForm
            role={selectedRole}
            onClose={handleRoleFormClose}
            onSuccess={handleRoleFormSuccess}
          />
        )}
      </div>
    </div>
  );
}
