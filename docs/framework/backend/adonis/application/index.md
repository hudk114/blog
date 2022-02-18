# application

core/src/Ignitor/HttpServer/index.ts

在第一节 [cli & 启动](/blog/framework/backend/adonis/cli/) 中说到过，Ignitor实现了application和server的启动

``` js {3}
public async start(serverCallback?: CustomServerCallback) {
  try {
    await this.wire() // 这句话内启动了application
    this.setServer()
    this.createServer(serverCallback)
    this.monitorHttpServer()
    await this.listen()
    this.signalsListener.listen(() => this.close())
  } catch (error) {
    await new ErrorHandler(this.application).handleError(error)
  }
}
```

其中，application实际上是服务的运行时管理，其生命周期就是的整个服务的生命周期

另一方面，application提供了IOC，这也是adonis的核心能力

本节主要介绍application的作用以及内部IOC的相关实现

## 生命周期

``` js
export type ApplicationStates =
  | 'initiated'         // 初始化
  | 'setup'             // 解析config，注入基础应用级ioc
  | 'registered'        // 注册完成所有provider
  | 'booted'            // 启动完所有provider
  | 'ready'             // 服务准备完毕 此时所有provider的ready hook会被调用
  | 'shutdown'          // 服务（应用关闭）此时所有provider的shutdown hook会被调用
```

这个生命周期也是实际上服务的[生命周期](https://docs.adonisjs.com/guides/application#boot-lifecycle)

## 实现
### 属性

``` js
class Application implements ApplicationContract {
  state: ApplicationStates
  readonly rcFile: RcFile
  readonly appRoot: string
  readonly cliCwd?: string
  readonly appName: string
  readonly adonisVersion: SemverNode | null
  readonly version: SemverNode | null
  readonly typescript: boolean
  readonly environment: AppEnvironments
  exceptionHandlerNamespace?: string
  logger: LoggerContract
  profiler: ProfilerContract
  env: EnvContract
  config: ConfigContract
  helpers: typeof Helpers
  preloads: PreloadNode[]
  nodeEnvironment: string

  ...
}
```

上面的属性为服务的配置信息

``` js
class Application implements ApplicationContract {
  ...
  public preloads: PreloadNode[] = []
  public directoriesMap: Map<string, string> = new Map()
  public aliasesMap: Map<string, string> = new Map()
  public namespacesMap: Map<string, string> = new Map()
  public container: ApplicationContract['container'] = new Ioc()
}
```

以上为container的相关内容，用于提供ioc能力，这块是我们关注的核心

Ioc内提供了一些容器的基础方法（比如use make bind singleton之类的），内部实际上是用一个list来实现管理的，这类实现大同小异，这里不在展开

constructor
比较重要的部分有下列几块

``` js
private loadRcFile() {
  return this.resolveModule('./.adonisrc.json', () => {
    throw new Error('AdonisJS expects ".adonisrc.json" file to exist in the application root')
  })
}
```

loadRcFile 加载了adonis的配置文件（类似spring的boot xml），该文件定义了所有的provider，alias等等内容

``` js
private setupGlobals() {
  global[Symbol.for('ioc.use')] = this.container.use.bind(this.container)
  global[Symbol.for('ioc.make')] = this.container.make.bind(this.container)
  global[Symbol.for('ioc.call')] = this.container.call.bind(this.container)
}
```

setupGlobals ioc的三个全局方法的binding；global是node的全局变量，实际上让整个运行上下文都可以获取到ioc的能力，这个和provider的获取能力相关

**这也说明，一个运行环境中，application应该是唯一单例的（从设计上来说也确实如此）**

``` js
private registerItselfToTheContainer() {
  this.container.singleton('Adonis/Core/Application', () => this)
}
```

registerItselfToTheContainer 核心方法，将自己注册到了container中，之后就可以通过ioc获取到

可见，constructor主要做了全局的数据初始化和自身（实际上还包含了helper）的ioc注入

### setup

``` js
public async setup(): Promise<void> {
  if (this.state !== 'initiated') {
    return
  }

  this.state = 'setup'
  this.registerAliases()
  this.loadEnvironmentVariables()
  this.loadConfig()
  this.setupLogger()
  this.setupProfiler()
}
```

简单的来说，解析并设置了ioc的alias与env，并注册了env，[config](https://docs.adonisjs.com/guides/config#document)，logger与profiler；这些字段在解析IOC路径的时候会用到

### registerProviders

``` js
public async registerProviders(): Promise<void> {
  // register生命周期进行注册
  if (this.state !== 'setup') {
    return
  }
  this.state = 'registered'

  ...

  // 注册provider
  this.registrar = new Registrar([this], this.appRoot)

  const registeredProviders = await this.registrar
    .useProviders(providers, (provider) => {
      return new provider(this)
    })
    .register()

  // 生命周期的管理
  registeredProviders.forEach((provider: any) => {
    if (typeof provider.shutdown === 'function') {
      this.providersWithShutdownHook.push(provider)
    }

    if (typeof provider.ready === 'function') {
      this.providersWithReadyHook.push(provider)
    }
  })

  ...
}
```

实现了provider的注册，可以看到其生命周期的hook管理也是在application中（但是其boot不是在这里做的，是通过外层的wire来做的）

provider的具体注册与boot流程会在[load-provider](/blog/framework/backend/adonis/application/load-provider)中说明

### bootProviders
boot是在provider被注册之后，provider的启动操作：register实际上只是引入了provider，但是没有boot

``` js {9}
public async bootProviders(): Promise<void> {
  if (this.state !== 'registered') {
    return
  }
  this.state = 'booted'

  await this.profiler.profileAsync('providers:boot', {}, async () => {
    this.logger.trace('booting providers')
    await this.registrar.boot()
  })
}
```


实现也很简单，实际上就是调用每个provider的boot方法（registrar进行了一层封装）

boot方法可以是异步的，这里不再展开

### requirePreloads
也是极其核心的方法，用于在application boot完之后进行操作

https://docs.adonisjs.com/guides/adonisrc-file#preloads

``` js {9-13}
public async requirePreloads(): Promise<void> {
  this.preloads
    .filter((node) => {
      ...
    })
    .forEach((node) => {
      ...

      this.resolveModule(node.file, (error) => {
        if (!node.optional) {
          throw error
        }
      })
    })
}
```

此时，ioc能力以及准备好并且可用，preload会在server启动解析相应的文件并运行（有点类似于package.json里的main）

``` js {5-6}
private resolveModule(modulePath: string, onMissingCallback: (error: any) => void) {
  let filePath: string | undefined

  try {
    filePath = helpers.resolveFrom(this.appRoot, modulePath)
    return require(filePath)
  } catch (error) {
    ...
  }
}
```

简单的用了node的require

可以在hello-world项目看一下，可以看到preload的文件里已经在使用ioc了
hello-world\start\routes.ts

``` js {1}
import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async ({ view }) => {
  return view.render('welcome')
})
```
