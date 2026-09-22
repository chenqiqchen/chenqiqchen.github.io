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
            { text: 'Java', link: '/backend/' },
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
                        { text: 'Vue 3 组合式函数', link: '/frontend/vue/vue3-composable-reuse-guide' },
                    ],
                },
                {
                    text: '工程化',
                    items: [
                        { text: '版本号中 ^ 和 ~ 的区别', link: '/frontend/engineering/npm-caret-vs-tilde' },
                        { text: '如何配置 @ 别名', link: '/frontend/engineering/how-to-configure-at-alias' },
                        { text: 'ESLint 配置入门指南', link: '/frontend/engineering/eslint-config-getting-started' },
                        { text: 'Prettier 实战指南', link: '/frontend/engineering/prettier-practical-guide' },
                        { text: 'lint-staged + husky 实战指南', link: '/frontend/engineering/prettier-eslint-lint-staged-husky-guide' },
                        { text: '本地 Vite 和测试 Nginx，请求到底怎么走', link: '/frontend/engineering/process-of-api-request' },
                    ],
                },
                {
                    text: '开发工具',
                    items: [
                        { text: '【git】指令场景实战：单分支与多分支协作流程', link: '/frontend/development-tools/git-commands-getting-started' },
                        { text: '【git】代码双仓库备份指南', link: '/frontend/development-tools/code-dual-repository-backup' },
                        { text: '【Nginx】前端项目部署与反向代理实战指南', link: '/frontend/development-tools/nginx-practical-guide-for-frontend' },
                    ],
                },
                   {
                    text: '经验总结',
                    items: [
                        { text: '【代码优化】记一次邮件复制功能的代码优化', link: '/frontend/experience/code-optimization-for-email-copying' },
                    ],
                },
                
            ],
            '/backend/': [
                {
                    text: '后端总览',
                    items: [{ text: '后端文章导航', link: '/backend/' }],
                },
                {
                    text: 'Java',
                    items: [
                        { text: 'Spring Boot 常见注解', link: '/backend/java/springboot-common-annotations' },
                        { text: 'Session、ThreadLocal 和应用级变量', link: '/backend/java/session-threadlocal-app-scope' },
                    ],
                },
            ],
        },
        footer: {
            copyright: 'Copyright © 2026 X7 Blog',
        },
    },
})
