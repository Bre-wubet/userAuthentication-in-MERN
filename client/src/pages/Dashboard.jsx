import React from 'react';
import { Link } from 'react-router-dom';
import { User, Settings, Shield, Users, Activity, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, hasRole, hasPermission } = useAuth();

  const stats = [
    {
      name: 'Account Status',
      value: user?.isVerified ? 'Verified' : 'Pending Verification',
      icon: User,
      color: user?.isVerified ? 'text-green-600' : 'text-yellow-600',
    },
    {
      name: 'Role',
      value: user?.roles?.[0] || 'User',
      icon: Shield,
      color: 'text-blue-600',
    },
    {
      name: 'Permissions',
      value: user?.permissions?.length || 0,
      icon: Activity,
      color: 'text-purple-600',
    },
  ];

  const quickActions = [
    {
      name: 'Update Profile',
      description: 'Manage your personal information',
      href: '/profile',
      icon: Settings,
      color: 'bg-blue-500',
    },
  ];

  const adminActions = [
    {
      name: 'Manage Users',
      description: 'View and manage user accounts',
      href: '/admin/users',
      icon: Users,
      color: 'bg-green-500',
      permission: 'users.read',
    },
    {
      name: 'Manage Roles',
      description: 'Configure roles and permissions',
      href: '/admin/roles',
      icon: Shield,
      color: 'bg-purple-500',
      permission: 'roles.read',
    },
  ];

  const filteredAdminActions = adminActions.filter(action => 
    !action.permission || hasPermission(action.permission)
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName || user?.username}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening with your account today.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.name}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                      <p className={`text-2xl font-semibold ${stat.color}`}>
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks you might want to perform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.name} to={action.href}>
                    <div className="flex items-center p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                      <div className={`flex-shrink-0 p-2 rounded-md ${action.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-900">
                          {action.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          {/* Admin Actions */}
          {hasRole('admin') && filteredAdminActions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Admin Panel</CardTitle>
                <CardDescription>
                  Administrative functions and tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredAdminActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link key={action.name} to={action.href}>
                      <div className="flex items-center p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                        <div className={`flex-shrink-0 p-2 rounded-md ${action.color}`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-medium text-gray-900">
                            {action.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest account activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-2" />
                Last login: {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <User className="h-4 w-4 mr-2" />
                Account created: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
