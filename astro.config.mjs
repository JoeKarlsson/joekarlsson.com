// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://www.joekarlsson.com',
	integrations: [mdx(), sitemap(), tailwind()],
	markdown: {
		shikiConfig: {
			theme: 'github-dark',
		},
	},
	redirects: {
		// WordPress date-based blog URLs → new /blog/slug pattern
		'/2025/10/[...slug]': '/blog/[...slug]',
		'/2025/06/[...slug]': '/blog/[...slug]',
		'/2024/04/[...slug]': '/blog/[...slug]',
		'/2024/03/[...slug]': '/blog/[...slug]',
		'/2024/01/[...slug]': '/blog/[...slug]',
		'/2023/09/[...slug]': '/blog/[...slug]',
		'/2023/03/[...slug]': '/blog/[...slug]',
		'/2023/02/[...slug]': '/blog/[...slug]',
		'/2022/06/[...slug]': '/blog/[...slug]',
		'/2021/12/[...slug]': '/blog/[...slug]',
		'/2021/11/[...slug]': '/blog/[...slug]',
		'/2021/06/[...slug]': '/blog/[...slug]',
		'/2021/05/[...slug]': '/blog/[...slug]',
		'/2020/11/[...slug]': '/blog/[...slug]',
		'/2020/10/[...slug]': '/blog/[...slug]',
		'/2020/09/[...slug]': '/blog/[...slug]',
		'/2020/05/[...slug]': '/blog/[...slug]',
		'/2020/04/[...slug]': '/blog/[...slug]',
		'/2020/02/[...slug]': '/blog/[...slug]',
		'/2020/01/[...slug]': '/blog/[...slug]',
		'/2019/11/[...slug]': '/blog/[...slug]',
		'/2019/06/[...slug]': '/blog/[...slug]',
		'/2019/04/[...slug]': '/blog/[...slug]',
		'/2019/03/[...slug]': '/blog/[...slug]',
		'/2019/01/[...slug]': '/blog/[...slug]',
		'/2018/12/[...slug]': '/blog/[...slug]',
		'/2018/11/[...slug]': '/blog/[...slug]',
		'/2018/01/[...slug]': '/blog/[...slug]',
		'/2017/01/[...slug]': '/blog/[...slug]',
		'/2016/07/[...slug]': '/blog/[...slug]',
		'/2015/12/[...slug]': '/blog/[...slug]',
		'/2015/07/[...slug]': '/blog/[...slug]',
		'/2015/05/[...slug]': '/blog/[...slug]',

		// WordPress page redirects
		'/speaking/joe-karlssons-talk-archive': '/talk-archive',
		'/speaking': '/talk-archive',
		'/all-work': '/work',
		'/404-error': '/404',

		// WordPress portfolio URLs
		'/portfolio': '/work',

		// WordPress feed URLs
		'/feed': '/rss.xml',
	},
});
