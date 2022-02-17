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
                    path: '/framework/backend/adonis/cli/index',
                    children: [
                      {
                        title: 'manifest',
                        path: '/framework/backend/adonis/cli/manifest',
                      },
                    ]
                  },
                  {
                    title: 'application',
                    path: '/framework/backend/adonis/application/index',
                    children: [
                      {
                        title: 'IOC',
                        path: '/framework/backend/adonis/application/IOC',
                      },
                      {
                        title: 'provider加载',
                        path: '/framework/backend/adonis/application/load-provider',
                      },
                    ]
                  },
                  {
                    title: 'http server',
                    path: '/framework/backend/adonis/server/index',
                    children: [
                      {
                        title: '请求处理流',
                        path: '/framework/backend/adonis/server/request-handler',
                      },
                      {
                        title: 'hook与middleware',
                        path: '/framework/backend/adonis/server/hook-middleware',
                      },
                      {
                        title: 'co-compose',
                        path: '/framework/backend/adonis/server/co-compose',
                      },
                      {
                        title: '静态文件处理',
                        path: '/framework/backend/adonis/server/serve-static',
                      },
                    ]
                  },
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
