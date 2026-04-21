import { defineConfig } from 'vitepress'

// https://vitepress.vuejs.org/config/app-configs
export default defineConfig({
    title: 'X7 Blog',
    description: '技术博客',
    base: '/',
    themeConfig: {
        search: {
            provider: 'local',
            options: {
                translations: {
                    button: {
                        buttonText: '搜索文档',
                        buttonAriaLabel: '搜索文档',
                    },
                    modal: {
                        noResultsText: '无法找到相关结果',
                        resetButtonTitle: '清除查询条件',
                        footer: {
                            selectText: '选择',
                            navigateText: '切换',
                        },
                    },
                },
            },
        },
        nav: [
            { text: '首页', link: '/' },
            { text: '前端', link: '/frontend/' },
            // { text: '后端', link: '/backend/' },
        ],
        sidebar: {
            '/frontend/': [
                {
                    text: '前端总览',
                    items: [{ text: '前端文章导航', link: '/frontend/' }],
                },
                {
                    text: 'JavaScript',
                    items: [
                        { text: '如何切换元素显示与隐藏', link: '/frontend/javascript/how-to-toggle-element-display' },
                    ],
                },
                {
                    text: 'React',
                    items: [
                        { text: 'React 常用知识点速查', link: '/frontend/react/react-base' },
                        { text: 'Next.js App Router', link: '/frontend/react/nextjs-app-router-full-guide' },
                    ],
                },
                {
                    text: 'Vue',
                    items: [
                        { text: '如何打开弹窗', link: '/frontend/vue/how-to-open-dialog' },
                        { text: 'Vue 3 组合式函数实战：提取可复用请求逻辑', link: '/frontend/vue/vue3-composable-reuse-guide' },
                    ],
                },
                {
                    text: '工程化',
                    items: [
                        { text: '版本号中 ^ 和 ~ 的区别', link: '/frontend/engineering/npm-caret-vs-tilde' },
                        { text: '如何配置 @ 别名', link: '/frontend/engineering/how-to-configure-at-alias' },
                        { text: 'ESLint 配置入门指南', link: '/frontend/engineering/eslint-config-getting-started' },
                    ],
                },
                {
                    text: '开发工具',
                    items: [
                        { text: '【git】代码双仓库备份指南', link: '/frontend/development-tools/code-dual-repository-backup' },
                    ],
                },
            ],
            // '/backend/': [
            //     {
            //         text: '后端总览',
            //         items: [{ text: '后端文章导航', link: '/backend/' }],
            //     },
            //     {
            //         text: '后端分类',
            //         items: [{ text: 'Java', link: '/backend/java/' }],
            //     },
            // ],
        },
        footer: {
            copyright: 'Copyright © 2026 X7 Blog',
        },
    },
})
