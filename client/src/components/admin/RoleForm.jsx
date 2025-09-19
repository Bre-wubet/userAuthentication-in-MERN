import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { roleAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export function RoleForm({ role, onClose, onSuccess }) {
  const { hasPermission } = useAuth();
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      name: role?.name || '',
      description: role?.description || '',
    },
  });

  // Check if user has required permissions
  const canCreate = hasPermission('roles.create');
  const canUpdate = hasPermission('roles.update');

  const isEditMode = !!role;
  const hasRequiredPermission = isEditMode ? canUpdate : canCreate;

  // Load permissions on mount
  useEffect(() => {
    const loadPermissions = async () => {
      try {
        setIsLoadingPermissions(true);
        const response = await roleAPI.getAllPermissions();
        setPermissions(response.data.data || []);
        
        // Set selected permissions for edit mode
        if (isEditMode && role?.permissions) {
          setSelectedPermissions(role.permissions.map(p => p.id));
        }
      } catch (error) {
        toast.error('Failed to load permissions');
        console.error('Error loading permissions:', error);
      } finally {
        setIsLoadingPermissions(false);
      }
    };

    loadPermissions();
  }, [isEditMode, role]);

  const onSubmit = async (data) => {
    if (!hasRequiredPermission) {
      toast.error('You do not have permission to perform this action');
      return;
    }

    try {
      setIsLoading(true);
      
      const roleData = {
        ...data,
        permissions: selectedPermissions,
      };

      let response;
      if (isEditMode) {
        response = await roleAPI.updateRole(role.id, roleData);
        toast.success('Role updated successfully');
      } else {
        response = await roleAPI.createRole(roleData);
        toast.success('Role created successfully');
      }

      onSuccess?.(response.data.data);
      onClose?.();
    } catch (error) {
      const message = error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} role`;
      toast.error(message);
      console.error('Role operation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermissionToggle = (permissionId) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSelectAll = () => {
    setSelectedPermissions(permissions.map(p => p.id));
  };

  const handleSelectNone = () => {
    setSelectedPermissions([]);
  };

  // Group permissions by resource
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const resource = permission.resource;
    if (!acc[resource]) {
      acc[resource] = [];
    }
    acc[resource].push(permission);
    return acc;
  }, {});

  if (!hasRequiredPermission) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              You don't have permission to {isEditMode ? 'update' : 'create'} roles.
            </p>
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              {isEditMode ? 'Edit Role' : 'Create New Role'}
            </CardTitle>
            <CardDescription>
              {isEditMode ? 'Update role information and permissions' : 'Define a new role with specific permissions'}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name *
                </label>
                <Input
                  id="name"
                  placeholder="e.g., Manager, Editor, Viewer"
                  {...register('name', {
                    required: 'Role name is required',
                    minLength: {
                      value: 2,
                      message: 'Role name must be at least 2 characters',
                    },
                    maxLength: {
                      value: 50,
                      message: 'Role name must be less than 50 characters',
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_\s-]+$/,
                      message: 'Role name can only contain letters, numbers, spaces, hyphens, and underscores',
                    },
                  })}
                  error={errors.name?.message}
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Input
                  id="description"
                  placeholder="Brief description of the role"
                  {...register('description', {
                    maxLength: {
                      value: 200,
                      message: 'Description must be less than 200 characters',
                    },
                  })}
                  error={errors.description?.message}
                />
              </div>
            </div>

            {/* Permissions Selection */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Permissions</h3>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    disabled={isLoadingPermissions}
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectNone}
                    disabled={isLoadingPermissions}
                  >
                    Select None
                  </Button>
                </div>
              </div>

              {isLoadingPermissions ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading permissions...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
                    <div key={resource} className="border rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 capitalize">
                        {resource} ({resourcePermissions.length} permissions)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {resourcePermissions.map((permission) => (
                          <label
                            key={permission.id}
                            className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedPermissions.includes(permission.id)}
                              onChange={() => handlePermissionToggle(permission.id)}
                              className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900">
                                {permission.action}
                              </div>
                              {permission.description && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {permission.description}
                                </div>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedPermissions.length > 0 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm text-green-800">
                      {selectedPermissions.length} permission{selectedPermissions.length !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || isLoadingPermissions || selectedPermissions.length === 0}
                loading={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                {isEditMode ? 'Update Role' : 'Create Role'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
