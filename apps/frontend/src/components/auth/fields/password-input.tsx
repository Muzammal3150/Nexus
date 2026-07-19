'use client';

import { ComponentProps, useState } from 'react';

import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Eye, EyeClosed, LockIcon } from 'lucide-react';

type PasswordInputProps = ComponentProps<typeof InputGroupInput>;

export function PasswordInput({ ...props }: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <InputGroup>
            <InputGroupInput type={showPassword ? 'text' : 'password'} {...props} />

            <InputGroupAddon align="inline-end">
                <Button
                    type="button"
                    variant={'ghost'}
                    size="icon"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                    {showPassword ? <EyeClosed size={18} /> : <Eye size={18} />}
                </Button>
            </InputGroupAddon>

            <InputGroupAddon align="inline-start">
                <LockIcon className="text-muted-foreground aria-invalid:text-destructive" />
            </InputGroupAddon>
        </InputGroup>
    );
}
