import { Suspense } from 'react';
import ForgotPassword from '../ForgotPassword';

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ForgotPassword />
    </Suspense>
  );
}
