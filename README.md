# rem

rem 布局初始化。

## 用法

安装：

``` bash
$ npm install toyobayashi/rem
```

直接引入：

``` html
<script src="node_modules/@tybys/rem/dist/rem.min.js"></script>
<script>
rem.enable({ /* ... */ });
</script>
```

打包构建：

* ESM / TypeScript

    ``` js
    import * as rem from '@tybys/rem'

    rem.enable({ /* ... */ })
    ```

* CommonJS

    ``` js
    const rem = require('@tybys/rem')

    rem.enable({ /* ... */ })
    ```

CSS3:

``` css
:root {
  /**
   * 当窗口逻辑像素宽度正好与设计稿宽度相同时的 HTML 字号
   * 要和 JS 配置一致，默认是 30
   */
  --rem-base-font-size: 30;
}

/** 用设计稿的像素大小转换成 rem */
.logo-css3 {
  width: calc(150rem / var(--rem-base-font-size));
  height: calc(150rem / var(--rem-base-font-size));
}
```

CSS 预处理（以 Stylus 为例）：

``` styl
// 当窗口逻辑像素宽度正好与设计稿宽度相同时的 HTML 字号
// 要和 JS 配置一致，默认是 30
rem-base-font-size = 30px

// px 转 rem
p2r(value)
  return (value / rem-base-font-size)rem

// 用设计稿的像素大小转换成 rem
.logo
  width p2r(150)
  height p2r(150)
```

有关配置项请阅读 [API 文档](./docs/api/rem.md)。

演示：[https://toyobayashi.github.io/rem/](https://toyobayashi.github.io/rem/)

## REM 原理

公式：

* `1 rem ＝ HTML字号像素值 px`

* `逻辑像素值 ＝ HTML字号像素值 × REM值`

* `比例 ＝ 窗口逻辑像素宽度 ÷ HTML字号基准像素值`

例：假设设计稿宽度为 750px，设计稿中的某张图片尺寸是 150px × 150px，当屏幕实际逻辑像素宽度与设计稿宽度相同时的 HTML 字号为 30px，问：

1. 用 rem 做单位表示该图片的尺寸

2. 当屏幕实际逻辑像素宽度为 375px 时，图片尺寸的实际逻辑像素值

解：

图片尺寸 ＝ 150 ÷ 30 ＝ 5rem (5rem × 5rem)

比例 ＝ 750px ÷ 30px ＝ 25

当屏幕实际逻辑像素宽度为 375px 时，HTML 字号 ＝ 375 ÷ 25 ＝ 15px

此时图片的实际逻辑像素尺寸 ＝ 15 × 5 ＝ 75px (75px × 75px)
