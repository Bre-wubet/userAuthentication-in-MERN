import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Shield, 
  Settings, 
  BarChart3, 
  Activity,
  UserCheck,
  Lock,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PermissionChecker } from '../../components/admin/PermissionChecker';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { hasPermission, hasRole } = useAuth();

  const adminFeatures = [
    {
      name: 'User Management',
      description: 'Create, edit, and manage user accounts',
      href: '/admin/users',
      icon: Users,
      permission: 'users.read',
      color: 'bg-blue-500',
    },
    {
      name: 'Role Management', 
      description: 'Create and assign roles with specific permissions',
      href: '/admin/roles',
      icon: Shield,
      permission: 'roles.read',
      color: 'bg-purple-500',
    },
    {
      name: 'System Settings',
      description: 'Configure application settings and preferences',
      href: '/admin/settings',
      icon: Settings,
      permission: 'settings.read',
      color: 'bg-green-500',
    },
    {
      name: 'Analytics',
      description: 'View system usage and user activity reports',
      href: '/admin/analytics',
      icon: BarChart3,
      permission: 'analytics.read',
      color: 'bg-orange-500',
    },
  ];

  const quickStats = [
    {
      name: 'Total Users',
      value: '1,234',
      change: '+12%',
      changeType: 'positive',
      icon: Users,
    },
    {
      name: 'Active Sessions',
      value: '89',
      change: '+5%',
      changeType: 'positive',
      icon: Activity,
    },
    {
      name: 'Roles Created',
      value: '12',
      change: '+2',
      changeType: 'positive',
      icon: Shield,
    },
    {
      name: 'Security Alerts',
      value: '3',
      change: '-1',
      changeType: 'negative',
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage your application and user accounts
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat) => (
            <Card key={stat.name}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                      <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <p className={`text-sm ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change} from last month
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Admin Features */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Administrative Tools</CardTitle>
                <CardDescription>
                  Access management features based on your permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {adminFeatures.map((feature) => {
                    const hasAccess = hasPermission(feature.permission);
                    const Icon = feature.icon;
                    
                    return (
                      <div
                        key={feature.name}
                        className={`p-4 rounded-lg border transition-all ${
                          hasAccess
                            ? 'hover:shadow-md cursor-pointer border-gray-200'
                            : 'opacity-50 cursor-not-allowed border-gray-100'
                        }`}
                      >
                        {hasAccess ? (
                          <Link to={feature.href} className="block">
                            <div className="flex items-start space-x-3">
                              <div className={`p-2 rounded-lg ${feature.color} bg-opacity-10`}>
                                <Icon className={`h-5 w-5 ${feature.color.replace('bg-', 'text-')}`} />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-sm font-semibold text-gray-900">
                                  {feature.name}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                  {feature.description}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ) : (
                          <div className="flex items-start space-x-3">
                            <div className="p-2 rounded-lg bg-gray-100">
                              <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold text-gray-500">
                                {feature.name}
                              </h3>
                              <p className="text-xs text-gray-400 mt-1">
                                Permission required: {feature.permission}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Permission Checker */}
          <div className="lg:col-span-1">
            <PermissionChecker />
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest system events and user actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <UserCheck className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    New user registered: john.doe@example.com
                  </p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    Role "Manager" was created
                  </p>
                  <p className="text-xs text-gray-500">15 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <Activity className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    User session expired: admin@example.com
                  </p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
