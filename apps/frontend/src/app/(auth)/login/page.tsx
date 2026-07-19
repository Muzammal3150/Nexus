'use client';

import { InputField } from '@/components/auth/fields/input-field';
import { PasswordInput } from '@/components/auth/fields/password-input';
import { LoginFooter } from '@/components/auth/login/footer';
import { LoginHeader } from '@/components/auth/login/header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { authClient } from '@/lib/auth/auth';
import { loginValidator, loginValues } from '@/validators/auth/login';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, TriangleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

export default function LoginForm() {
    const router = useRouter();

    const form = useForm<loginValues>({
        resolver: zodResolver(loginValidator as any),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const disabled = form.formState.isSubmitting;

    const onSubmit = async (values: loginValues) => {
        const { error } = await authClient.signIn.email(values);

        if (error) {
            form.setError('root', { message: error.message });
            return;
        }

        router.replace('/');
    };

    return (
        <form
            className="flex flex-col gap-6 w-full max-w-sm"
            onSubmit={form.handleSubmit(onSubmit)}
        >
            <LoginHeader />

            {form.formState.errors.root && (
                <Alert variant="destructive" className="max-w-md">
                    <TriangleAlert />
                    {/* <AlertTitle>Error</AlertTitle> */}
                    <AlertDescription>{form.formState.errors.root?.message}</AlertDescription>
                </Alert>
            )}

            {/* EMAIL */}
            <InputField
                name="email"
                label="Email"
                form={form}
                icon={Mail}
                type="email"
                placeholder="m@example.com"
                autoComplete="email"
            />

            {/* PASSWORD */}
            <Field>
                <FieldLabel>Password:</FieldLabel>
                <PasswordInput
                    
                    id="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={disabled}
                    aria-invalid={!!form.formState.errors.password}
                    {...form.register('password')}
                />

                <FieldError>{form.formState.errors.password?.message}</FieldError>
            </Field>

            {/* SUBMIT */}
            <Field>
                <Button type="submit" disabled={disabled}>
                    {disabled ? 'Logging in...' : 'Login'}
                </Button>
            </Field>

            <LoginFooter />
        </form>
    );
}
