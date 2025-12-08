import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import HeadingSmall from '@/components/heading-small';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { index } from '@/routes/tokens';
import CreateToken from '@/components/create-token';
import DeleteToken from '@/components/delete-token';
import { Token } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tokens',
        href: index().url,
    },
];

export default function Tokens({ tokens }: { tokens: Token[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tokens" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Tokens"
                        description="Manage your tokens"
                    />
                    <CreateToken />

                    <div className="grid divide-y">
                        {tokens.map((token: Token) => (
                            <div key={token.id} className="flex items-center justify-between">
                                <p>{token.name}</p>
                                <p>{token.token}</p>
                                <DeleteToken token={token} />
                            </div>
                        ))}
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
