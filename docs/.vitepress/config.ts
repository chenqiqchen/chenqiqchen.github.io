import { defineConfig } from 'vitepress'

// https://vitepress.vuejs.org/config/app-configs
export default defineConfig({
    title: 'My Blog',
    description: '技术博客',
    themeConfig: {
        nav: [
            { text: '首页', link: '/' },
            { text: '文章', link: '/guide/first-post' },
        ],
    },
})
