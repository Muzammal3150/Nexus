import { FieldDescription } from '@/components/ui/field';

import Link from 'next/link';

export function SignUpFormHeader() {
    return (
        <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex flex-col items-center gap-2 font-medium">
                <div className="flex size-8 items-center justify-center rounded-md"></div>
                <span className="sr-only">Acme Inc.</span>
            </div>

            <h1 className="text-xl font-bold">Create A Account</h1>

            <FieldDescription>
                Already have an account? <Link href="/login">Login</Link>
            </FieldDescription>
        </div>
    );
}
