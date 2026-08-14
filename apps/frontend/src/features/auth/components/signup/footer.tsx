import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Marker, MarkerContent } from '@/components/ui/marker';

export function SignUpFormFooter({ disabled }: { disabled: boolean }) {
    return (
        <>
            <Marker variant="separator">
                <MarkerContent>Or</MarkerContent>
            </Marker>

            <Field className="grid gap-4 sm:grid-cols-2">
                <Button variant="outline" type="button" disabled={disabled}>
                    Continue with Apple
                </Button>
                <Button variant="outline" type="button" disabled={disabled}>
                    Continue with Google
                </Button>
            </Field>

            <div className="text-center text-sm text-muted-foreground">
                By clicking continue, you agree to our <a href="#">Terms of Service</a> and{' '}
                <a href="#">Privacy Policy</a>.
            </div>
        </>
    );
}
