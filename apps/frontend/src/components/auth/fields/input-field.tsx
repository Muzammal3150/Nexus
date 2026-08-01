import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { cn } from '@/lib/utils';
import { FieldValues, Path, UseFormReturn, useFormState } from 'react-hook-form';

type InputFieldProps<T extends FieldValues> = {
    name: Path<T>;
    label: string;
    form: UseFormReturn<T>;
    icon: React.ElementType;
} & Omit<React.ComponentProps<'input'>, 'form'>;

export function InputField<T extends FieldValues>({
    name,
    label,
    form,
    icon: Icon,
    className,
    ...props
}: InputFieldProps<T>) {
    const { errors, isSubmitting } = useFormState({
        control: form.control,
        name,
    });

    const error = errors[name]?.message as string | undefined;
    const isInvalid = !!error;

    return (
        <Field className="group" data-invalid={isInvalid}>
            <FieldLabel className="group-data-[invalid=true]:text-destructive">{label}</FieldLabel>

            <InputGroup>
                <InputGroupAddon align="inline-start">
                    <Icon
                        size={18}
                        className="text-muted-foreground group-data-[invalid=true]:text-destructive"
                    />
                </InputGroupAddon>

                <InputGroupInput
                    {...form.register(name)}
                    {...props}
                    disabled={isSubmitting}
                    aria-invalid={isInvalid}
                    className={cn(
                        'aria-invalid:ring-destructive aria-invalid:border-destructive',
                        className,
                    )}
                />
            </InputGroup>

            <FieldError>{error}</FieldError>
        </Field>
    );
}
