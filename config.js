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
        collapsable: false,
        children: [
          {
            title: '后端',
            children: [
              {
                title: 'adonisjs',
                children: [
                  {
                    title: '1. cli & ignitor',
                    path: '/framework/backend/adonis/cli/index',
                    children: [
                      {
                        title: '1.1 manifest',
                        path: '/framework/backend/adonis/cli/manifest',
                      },
                    ]
                  },
                  {
                    title: '2. application',
                    path: '/framework/backend/adonis/application/index',
                    children: [
                      {
                        title: '2.1 IOC',
                        path: '/framework/backend/adonis/application/IOC',
                      },
                      {
                        title: '2.2 provider加载',
                        path: '/framework/backend/adonis/application/load-provider',
                      },
                    ]
                  },
                  {
                    title: '3. http server',
                    path: '/framework/backend/adonis/server/index',
                    children: [
                      {
                        title: '3.1 请求处理流',
                        path: '/framework/backend/adonis/server/request-handler',
                      },
                      {
                        title: '3.2 hook与middleware',
                        path: '/framework/backend/adonis/server/hook-middleware',
                      },
                      {
                        title: '3.3 co-compose',
                        path: '/framework/backend/adonis/server/co-compose',
                      },
                      {
                        title: '3.4 静态文件处理',
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
      // {
      //   title: '',
      //   path: '/',
      //   collapsable: true,
      // },
    ],
  }
}
