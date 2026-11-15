import {useEffect} from 'react';
import {Card, List, Result, Typography} from 'antd';
import {isAccountExpired, sj, useApi, type AccountType} from '@socialjet/sdk';

/** Example page: lists connected accounts through the SocialJet REST API. */
export function HelloPage() {
    const {sendRequest, data, loading, error} = useApi<undefined, AccountType[]>();

    useEffect(() => {
        sendRequest('socialjet/accounts/all');
    }, [sendRequest]);

    if (error) return <Result status="error" title="Could not load accounts" subTitle={error}/>;

    return (
        <Card title="Hello from {{TITLE}}">
            <Typography.Paragraph type="secondary">
                Edit <code>src/HelloPage.tsx</code> and run <code>npm run dev</code> to rebuild.
            </Typography.Paragraph>
            <List
                loading={loading}
                dataSource={data ?? []}
                locale={{emptyText: 'No accounts connected yet.'}}
                renderItem={account => (
                    <List.Item>
                        <List.Item.Meta
                            title={account.title}
                            description={sj.getAccountProvider(account.provider)?.getAccountTypeText(account) ?? account.provider}
                        />
                        {isAccountExpired(account) && <Typography.Text type="danger">Expired</Typography.Text>}
                    </List.Item>
                )}
            />
        </Card>
    );
}
