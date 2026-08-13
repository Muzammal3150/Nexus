'use client';

import { InputField } from '@/components/auth/fields/input-field';
import { PasswordInput } from '@/components/auth/fields/password-input';
import { SignUpFormFooter } from '@/components/auth/signup/footer';
import { SignUpFormHeader } from '@/components/auth/signup/header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { authClient } from '@/lib/auth/auth';
import { signUpValidator, signUpValues } from '@/validators/auth/signup';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, TriangleAlert, UserIcon } from 'lucide-react';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

export default function SignupForm() {
    const form = useForm<signUpValues>({
        resolver: zodResolver(signUpValidator),
        defaultValues: {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            name: '',
        },
    });
    const router = useRouter();

    const onSubmit = async (values: signUpValues) => {
        try {
            const { error } = await authClient.signUp.email(values);

            if (error) {
                form.setError('form', {
                    type: 'server',
                    message: error.message || 'Unable to create your account.',
                });
                return;
            }

            router.replace('/');
        } catch {
            form.setError('form', {
                type: 'server',
                message: 'Internal Server Error.',
            });
        }
    };

    const disabled = form.formState.isSubmitting;

    return (
        <form
            className="flex flex-col gap-6 w-full max-w-sm"
            onSubmit={form.handleSubmit(onSubmit)}
        >
            <SignUpFormHeader />
            {form.formState.errors.form && (
                <Alert variant="destructive" className="max-w-md">
                    <TriangleAlert />
                    <AlertDescription>{form.formState.errors.form?.message}</AlertDescription>
                </Alert>
            )}
            {/* NAME */}
            <InputField
                name="name"
                label="Name"
                form={form}
                icon={UserIcon}
                placeholder="John"
                autoComplete="name"
                required
            />
            <InputField
                name="username"
                label="Username"
                form={form}
                icon={UserIcon}
                placeholder="John123"
                autoComplete="username"
                required
            />

            {/* EMAIL */}
            <InputField
                name="email"
                label="Email"
                form={form}
                icon={Mail}
                type="email"
                placeholder="m@example.com"
                autoComplete="email"
                required
            />

            {/* PASSWORDS */}
            <FieldGroup className="grid grid-cols-2 gap-4">
                {/* PASSWORD */}
                <Field className="group" data-invalid={!!form.formState.errors.password}>
                    <FieldLabel className="group-data-[invalid=true]:text-destructive">
                        Password
                    </FieldLabel>

                    <PasswordInput
                        id="password"
                        autoComplete="new-password"
                        disabled={disabled}
                        aria-invalid={!!form.formState.errors.password}
                        placeholder="1H7x3rPHTogOuTY7"
                        {...form.register('password')}
                    />
                </Field>

                {/* CONFIRM PASSWORD */}
                <Field className="group" data-invalid={!!form.formState.errors.password}>
                    <FieldLabel className="group-data-[invalid=true]:text-destructive">
                        Confirm password
                    </FieldLabel>

                    <PasswordInput
                        id="confirmPassword"
                        autoComplete="new-password"
                        disabled={disabled}
                        aria-invalid={!!form.formState.errors.password}
                        placeholder="1H7x3rPHTogOuTY7"
                        {...form.register('confirmPassword')}
                    />
                </Field>
                <FieldError className="col-span-2">
                    {form.formState.errors.password?.message}
                </FieldError>
            </FieldGroup>

            {/* SUBMIT */}
            <Field>
                <Button type="submit" disabled={disabled}>
                    {disabled ? 'Creating account...' : 'Sign Up'}
                </Button>
            </Field>

            <SignUpFormFooter disabled={disabled} />
        </form>
    );
}
