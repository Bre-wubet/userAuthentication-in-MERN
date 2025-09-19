import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { roleAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export function PermissionChecker() {
  const { user, hasPermission } = useAuth();
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const response = await roleAPI.getUserPermissions();
        setPermissions(response.data.data || []);
      } catch (error) {
        toast.error('Failed to load permissions');
        console.error('Error loading permissions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPermissions();
  }, []);

  const checkPermission = (resource, action) => {
    return hasPermission(`${resource}.${action}`);
  };

  const permissionGroups = [
    {
      name: 'Users',
      resource: 'users',
      actions: ['create', 'read', 'update', 'delete'],
      description: 'Manage user accounts and profiles'
    },
    {
      name: 'Roles',
      resource: 'roles', 
      actions: ['create', 'read', 'update', 'delete'],
      description: 'Manage roles and permissions'
    },
    {
      name: 'Settings',
      resource: 'settings',
      actions: ['read', 'update'],
      description: 'Access and modify application settings'
    }
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Your Permissions
          </CardTitle>
          <CardDescription>
            Loading your current permissions...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Your Permissions
        </CardTitle>
        <CardDescription>
          Current permissions for {user?.firstName || user?.username}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {permissionGroups.map((group) => (
          <div key={group.resource} className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">{group.name}</h4>
              <p className="text-xs text-gray-500">{group.description}</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {group.actions.map((action) => {
                const hasAccess = checkPermission(group.resource, action);
                return (
                  <div
                    key={action}
                    className={`flex items-center space-x-2 p-2 rounded-lg text-xs ${
                      hasAccess
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-gray-50 text-gray-500 border border-gray-200'
                    }`}
                  >
                    {hasAccess ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    <span className="capitalize">{action}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {permissions.length === 0 && (
          <Alert variant="warning" title="No Permissions Found">
            You don't have any specific permissions assigned. Contact an administrator to get access.
          </Alert>
        )}

        <div className="pt-4 border-t">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">All Your Permissions</h4>
          <div className="flex flex-wrap gap-1">
            {permissions.map((permission) => (
              <span
                key={permission.id}
                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
              >
                {permission.name}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
