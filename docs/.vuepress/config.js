/*
 * @Description: 
 * @Autor: alexdkhu
 * @Date: 2022-02-12 21:26:08
 * @LastEditors: alexdkhu
 * @LastEditTime: 2022-02-12 21:29:26
 */
module.exports = {
  title: `hudk's blog`,
  description: `hudk's blog`,
  base: '/blog/',
  themeConfig: {
    sidebar: [
      {
        title: '框架',
        // path: '/framework',
        collapsable: true,
        children: [
          {
            title: '后端',
            collapsable: true,
            // path: '/framework/backend',
            children: [
              {
                title: 'adonisjs',
                // path: '/framework/backend/adonis',
                collapsable: true,
                children: [
                  {
                    title: 'cli & ignitor',
                    path: '/framework/backend/adonis/cli',
                  }
                ],
              }
            ],
          }
        ],
      },
      {
        title: '',
        path: '/',
        collapsable: true,
      },
    ],
  }
}
