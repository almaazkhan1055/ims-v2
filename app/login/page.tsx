'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, LogIn } from 'lucide-react';
import { UserRole } from '@/lib/types';

// Validation schema
const LoginSchema = Yup.object().shape({
  username: Yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .trim(),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  role: Yup.string()
    .required('Please select a role')
    .oneOf(['admin', 'ta_member', 'panelist'], 'Invalid role selected'),
});

interface LoginFormValues {
  username: string;
  password: string;
  role: UserRole;
}

export default function LoginPage() {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect to dashboard when authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (
    values: LoginFormValues,
    { setSubmitting, setStatus }: FormikHelpers<LoginFormValues>
  ) => {
    try {
      await login({
        username: values.username.trim(),
        password: values.password,
        role: values.role,
      });
      // Don't redirect here, let useEffect handle it
    } catch (err) {
      setStatus('Invalid credentials. Please try again.');
      console.error('Login error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading if authentication is in progress
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't show login form if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-2 px-4 sm:py-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md overflow-y-auto">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-3">
            <Shield className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold">Interview Dashboard</CardTitle>
          <CardDescription className="text-sm">
            Sign in to access the interview management system
          </CardDescription>
        </CardHeader>

        <CardContent className="px-4 sm:px-6">
          <Formik
            initialValues={{
              username: '',
              password: '',
              role: '' as UserRole,
            }}
            validationSchema={LoginSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting, status }) => (
              <Form className="space-y-3 sm:space-y-4">
                {status && (
                  <Alert variant="destructive">
                    <AlertDescription>{status}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Field name="username">
                    {({ field }: any) => (
                      <Input
                        {...field}
                        id="username"
                        type="text"
                        placeholder="Enter username"
                        disabled={isSubmitting}
                        aria-describedby="username-help"
                        autoComplete="username"
                        className={errors.username && touched.username ? 'border-destructive' : ''}
                      />
                    )}
                  </Field>
                  {errors.username && touched.username && (
                    <div className="text-sm text-destructive">{errors.username}</div>
                  )}
                  <p id="username-help" className="text-xs text-gray-500">
                    Use any DummyJSON username (e.g., kminchelle)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Field name="password">
                    {({ field }: any) => (
                      <Input
                        {...field}
                        id="password"
                        type="password"
                        placeholder="Enter password"
                        disabled={isSubmitting}
                        aria-describedby="password-help"
                        autoComplete="current-password"
                        className={errors.password && touched.password ? 'border-destructive' : ''}
                      />
                    )}
                  </Field>
                  {errors.password && touched.password && (
                    <div className="text-sm text-destructive">{errors.password}</div>
                  )}
                  <p id="password-help" className="text-xs text-gray-500">
                    Any password will work for demo purposes
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Field name="role">
                    {({ field, form }: any) => (
                      <Select
                        value={field.value}
                        onValueChange={(value: UserRole) => form.setFieldValue('role', value)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className={errors.role && touched.role ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrator</SelectItem>
                          <SelectItem value="ta_member">TA Member</SelectItem>
                          <SelectItem value="panelist">Panelist</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </Field>
                  {errors.role && touched.role && (
                    <div className="text-sm text-destructive">{errors.role}</div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    'Signing In...'
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In
                    </>
                  )}
                </Button>
              </Form>
            )}
          </Formik>

          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">
              <strong>Demo Credentials:</strong>
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>Username: emilys</p>
              <p>Password: emilyspass</p>
              <p>Role: admin (or select from dropdown)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}