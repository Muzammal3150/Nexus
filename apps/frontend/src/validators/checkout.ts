import { z } from 'zod';

export const checkoutSchema = z
    .object({
        email: z.string().email('Enter a valid email address'),
        phone: z.string().min(7, 'Enter a valid phone number'),

        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),

        // Shipping address — matches the `shipping*` columns in the Prisma schema
        shippingAddress: z.string().min(1, 'Address is required'),
        apartment: z.string().optional(),
        shippingCity: z.string().min(1, 'City is required'),
        shippingState: z.string().min(1, 'State / province is required'),
        shippingPostalCode: z.string().min(1, 'Postal code is required'),
        shippingCountry: z.string().min(1, 'Country is required'),

        shippingMethod: z.enum(['standard', 'express', 'overnight']),

        // Billing address — matches the `billing*` columns in the Prisma schema.
        // Always required: when "same as shipping" is checked, the form syncs
        // these values from the shipping fields automatically (see CheckoutForm),
        // so they're always populated even though the inputs are hidden.
        billingSameAsShipping: z.boolean(),
        billingAddress: z.string().min(1, 'Billing address is required'),
        billingCity: z.string().min(1, 'Billing city is required'),
        billingState: z.string().min(1, 'Billing state / province is required'),
        billingPostalCode: z.string().min(1, 'Billing postal code is required'),
        billingCountry: z.string().min(1, 'Billing country is required'),

        // Payment
        paymentMethod: z.enum(['card', 'bank_transfer', 'cod']),
        cardName: z.string().optional(),
        cardNumber: z.string().optional(),
        cardExpiry: z.string().optional(),
        cardCvc: z.string().optional(),

        saveInfo: z.boolean(),
    })
    .superRefine((data, ctx) => {
        // Card fields are only required when paying by card
        if (data.paymentMethod === 'card') {
            if (!data.cardName?.trim()) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['cardName'],
                    message: 'Name on card is required',
                });
            }

            const digits = (data.cardNumber ?? '').replace(/\s/g, '');
            if (digits.length < 13 || digits.length > 19) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['cardNumber'],
                    message: 'Enter a valid card number',
                });
            }

            if (!/^\d{2}\/\d{2}$/.test(data.cardExpiry ?? '')) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['cardExpiry'],
                    message: 'Enter a valid expiry date (MM/YY)',
                });
            }

            if (!/^\d{3,4}$/.test(data.cardCvc ?? '')) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['cardCvc'],
                    message: 'Enter a valid CVC',
                });
            }
        }
    });

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;