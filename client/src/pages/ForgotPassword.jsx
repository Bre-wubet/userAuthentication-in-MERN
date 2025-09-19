import React from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { authAPI } from '../lib/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSubmit = async ({ email }) => {
    try {
      setIsSubmitting(true);
      await authAPI.forgotPassword(email);
      toast.success('If the email exists, a reset link was sent.');
      reset();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to send reset email');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader>
            <CardTitle>Forgot Password</CardTitle>
            <CardDescription>Enter your email to receive a reset link.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    className="pl-10"
                    placeholder="you@example.com"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    error={errors.email?.message}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting} loading={isSubmitting}>
                <Send className="h-4 w-4 mr-2" />
                Send reset link
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


