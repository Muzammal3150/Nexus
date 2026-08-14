import Link from 'next/link';

export function LoginHeader() {
    return (
        <div className="flex flex-col items-center gap-2 text-center">

            <h1 className="text-xl font-bold">Welcome back</h1>

            <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link className="underline" href="/signup">
                    Sign up
                </Link>
            </p>
        </div>
    );
}
