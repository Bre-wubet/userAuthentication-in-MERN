import React from 'react';
import { useForm } from 'react-hook-form';
import { Lock, KeyRound } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { authAPI } from '../lib/api';
import toast from 'react-hot-toast';

export default function ChangePassword() {
  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const newPassword = watch('newPassword');

  const onSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      await authAPI.changePassword(values);
      toast.success('Password changed successfully');
      reset();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your account password securely.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="currentPassword"
                    type="password"
                    className="pl-10"
                    {...register('currentPassword', { required: 'Current password is required' })}
                    error={errors.currentPassword?.message}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="newPassword"
                    type="password"
                    className="pl-10"
                    {...register('newPassword', { required: 'New password is required', minLength: { value: 8, message: 'At least 8 characters' } })}
                    error={errors.newPassword?.message}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  {...register('confirmNewPassword', { required: 'Please confirm your new password', validate: (v) => v === newPassword || 'Passwords do not match' })}
                  error={errors.confirmNewPassword?.message}
                />
              </div>
              <Button type="submit" disabled={isSubmitting} loading={isSubmitting}>Update Password</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


