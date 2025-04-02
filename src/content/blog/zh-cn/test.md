---
title: 海上生明月
created_at: 2021-01-01 00:00:00
updated_at: 2021-01-01 00:00:00
tags: [test, test2]
translation_id: test
original_locale: zh-cn
locale: zh-cn
cover: /assets/kaili.jpg
description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
---


一级标题
============

段落之间用空行分隔。

第二段。*斜体*，**粗体**，和 `等宽字体`。项目列表看起来像：

  * 这一个
  * 那一个
  * 另一个

请注意 --- 不考虑星号 --- 实际文本内容从第 4 列开始。

> 块引用是
> 这样写的。
>
> 如果你愿意，它们可以跨越多个段落。

使用 3 个破折号作为破折号。使用 2 个破折号表示范围（例如，" 全在第 12--14 章中 "）。三个点...将被转换为省略号。
支持 Unicode。☺

二级标题
------------

这是一个有序列表：

 1. 第一项
 2. 第二项
 3. 第三项

再次注意实际文本如何从第 4 列开始（距离左侧 4 个字符）。这是一个代码示例：

    # 让我重申一下...
    for i in 1 .. 10 { do-something(i) }

正如你可能猜到的，缩进 4 个空格。顺便说一下，与其缩进块，如果你愿意，可以使用分隔块：

~~~
define foobar() {
    print "欢迎来到风味国度！";
}
~~~

（这使复制和粘贴更容易）。你可以选择标记分隔块，以便 Pandoc 进行语法高亮：

~~~python
import time
# 快，数到十！for i in range(10):
    # （但不要*太*快）    time.sleep(0.5)
    print i
~~~

## 三级标题 ###

现在是一个嵌套列表：

 1. 首先，准备这些原料：

      * 胡萝卜
      * 芹菜
      * 小扁豆

 2. 烧开一些水。

 3. 把所有东西倒入锅中并按照
    这个算法操作：

        找一个木勺
        揭开锅盖
        搅拌
        盖上锅盖
        把木勺小心地放在锅把上
        等待10分钟
        回到第一步（或完成后关火）

    不要碰到木勺，否则它会掉下来。

再次注意文本总是在 4 个空格缩进处对齐（包括
上面第 3 项的最后一行）。

这是一个指向 [网站](http://foo.bar) 的链接，一个指向 [本地文档](local-doc.html) 的链接，以及一个指向 [当前文档中的章节标题](#an-h2-header) 的链接。这里有一个脚注 [^1]。

表格可以像这样：

| a     | b        | c         |
| ----- | -------- | --------- |
| 1     | 2        | 3         |
| 12eas | '1eqw'   | 12`1ewdq` |
| 1w    | **said** | *sajnd*   |

尺寸 材料 颜色
---- ------------ ------------
9 皮革 棕色
10 麻布 自然色
11 玻璃 透明

Table: 鞋子、它们的尺寸和材质

（以上是表格的标题。）Pandoc 还支持多行表格：

-------- -----------------------
关键词 文本
-------- -----------------------
红色 日落、苹果和
          其他红色或偏红的
          东西。

绿色 叶子、草、青蛙
          以及其他不容易
          成为的东西。
-------- -----------------------

下面是一条水平线。

***

这是一个定义列表：

苹果
  : 适合制作苹果酱。
橙子
  : 柑橘类水果！
番茄
  : "tomato" 中没有 "e"。

再次强调，文本缩进 4 个空格。（在每个术语/定义对之间放一个空行，使内容更加分散。）

这是一个 " 行块 "：

| 第一行
| 第二行
| 第三行

图像可以这样指定：

![/assets/kaili.jpg](/assets/kaili.jpg "一个示例图片")

![/assets/kaili.jpg](/assets/kaili.jpg "一个示例图片")

![/assets/kaili.jpg](/assets/kaili.jpg "一个示例图片")

![/assets/kaili.jpg](/assets/kaili.jpg "一个示例图片")
![/assets/kaili.jpg](/assets/kaili.jpg "一个示例图片")
![/assets/kaili.jpg](/assets/kaili.jpg "一个示例图片")

行内数学公式像这样：$\omega = d\phi / dt$。显示
数学应该有自己的行并放在双美元符号中：

$$
I = \int \rho R^{2} dV
$$

请注意，你可以使用反斜杠转义任何你希望按字面显示的标点符号，例如：\`foo\`，\*bar\* 等。

[^1]: 脚注文本放在这里。

