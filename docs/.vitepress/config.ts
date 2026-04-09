import { defineConfig } from 'vitepress'

// https://vitepress.vuejs.org/config/app-configs
export default defineConfig({
    title: 'X7 Blog',
    description: '技术博客',
    base: '/',
    themeConfig: {
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
                        { text: 'JavaScript文章1', link: '/frontend/javascript/' },
                    ],
                },
                {
                    text: 'React',
                    items: [
                        { text: 'React', link: '/frontend/react/' },
                    ],
                },
                {
                    text: 'Vue',
                    items: [
                        { text: 'Vue', link: '/frontend/vue/' },
                    ],
                },
                {
                    text: '工程化',
                    items: [
                        { text: '版本号中 ^ 和 ~ 的区别', link: '/frontend/engineering/npm-caret-vs-tilde' },
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
    },
})
