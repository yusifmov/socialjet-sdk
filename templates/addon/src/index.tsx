/**
 * Entry point of the {{TITLE}} add-on. Everything registered here shows up in the
 * SocialJet admin screen. See https://github.com/yusifmov/socialjet-sdk for the API.
 */
import {defineSettingsItem, sj} from '@socialjet/sdk';
import {Switch} from 'antd';
import {AppstoreAddOutlined} from '@ant-design/icons';
import {HelloPage} from './HelloPage';

const SETTINGS_GROUP = '{{PHP_PREFIX}}';

// A page in the SocialJet sidebar.
sj.registerMenuItem({
    slug: '{{SLUG}}',
    title: '{{TITLE}}',
    icon: <AppstoreAddOutlined/>,
    priority: 50,
    actions: [],
    render: HelloPage,
});

// A group on the Settings page, with one setting. The value is saved by SocialJet
// under the key "{{PHP_PREFIX}}:enabled" — read it in PHP the same way core settings are read.
sj.registerSettingsProvider({
    slug: SETTINGS_GROUP,
    title: '{{TITLE}}',
    description: 'Settings added by the {{TITLE}} add-on.',
    icon: null,
    priority: 50,
});

sj.registerSettingsItem(defineSettingsItem<boolean>({
    provider: SETTINGS_GROUP,
    slug: 'enabled',
    title: 'Enable {{TITLE}}',
    description: 'An example switch.',
    targets: ['settings'],
    defaultValue: false,
    priority: 0,
    render: ({value, setValue}) => <Switch checked={Boolean(value)} onChange={setValue}/>,
}));
