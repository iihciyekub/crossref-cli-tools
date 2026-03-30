# crossrefCLI

一个面向 Crossref 的轻量命令行工具集，分成三步：

1. `crossref-stq`
   把参考文献文本批量匹配成 DOI
2. `crossref-doi`
   通过 DOI 取格式化参考文献或结构化元数据
3. `crossref-csl`
   通过 DOI 渲染 citation / bibliography，支持 `text` 和 `html`

## CLI 列表

- `crossref-stq`
  输入参考文献文本，输出 DOI
- `crossref-doi`
  输入 DOI，输出 `text` / `bibtex` / `ris` / `csljson` / `json` / `unixref` / `unixsd`
- `crossref-csl`
  输入 DOI，输出 `citation` 或 `bibliography`

## 依赖

### `crossref-stq`

需要：

- `curl`
- `perl`

### `crossref-doi`

需要：

- `curl`
- `perl`

### `crossref-csl`

需要：

- `node`
- `npm`

安装：

```bash
npm install
```

## 快速开始

先给脚本可执行权限：

```bash
chmod +x ./crossref-stq ./crossref-doi ./crossref-csl
```

### 1. 文本参考文献转 DOI

```bash
./crossref-stq refs.txt
```

### 2. DOI 转格式化参考文献

```bash
./crossref-doi 10.1126/science.1157784
```

### 3. DOI 渲染 bibliography

```bash
./crossref-csl bibliography 10.1126/science.1157784
```

### 4. 串联使用

```bash
./crossref-stq refs.txt | ./crossref-csl bibliography --style apa
```

## `crossref-stq`

用途：

- 输入一条或多条参考文献文本
- 调用 Crossref Simple Text Query 页面
- 返回匹配到的 DOI

核心站点：

- 页面：[https://apps.crossref.org/SimpleTextQuery](https://apps.crossref.org/SimpleTextQuery)
- 前端脚本：[https://apps.crossref.org/SimpleTextQuery.js](https://apps.crossref.org/SimpleTextQuery.js)

工作方式：

1. `GET https://apps.crossref.org/SimpleTextQuery`
2. 提取隐藏字段 `key`
3. 保留服务端下发的 cookie
4. `POST` 提交 `command=Submit`、`key`、`freetext`
5. 解析返回的 HTML 结果页，提取 DOI

### 帮助

```bash
./crossref-stq --help
```

### 语法

```bash
./crossref-stq [options] [file]
./crossref-stq --text "citation text"
cat refs.txt | ./crossref-stq --stdin
```

### 参数

- `--stdin`
  从标准输入读取参考文献文本
- `--text TEXT`
  直接从命令行参数读取参考文献文本
- `--include-pm`
  请求返回 PubMed ID
- `--multi-hit`
  请求每条参考文献返回多个候选 DOI
- `--verbose`
  输出详细结果，而不是只输出 DOI
- `--json`
  输出 JSON
- `-h`, `--help`
  显示帮助

### 输入规则

- 一行一条参考文献
- 单条参考文献内部不要换行
- 一条或多条都可以
- 默认同一个命令自动处理单条或多条

### 输出规则

默认输出：

- 只输出 DOI
- 一行一个 DOI

示例：

```bash
./crossref-stq refs.txt
```

输出：

```text
https://doi.org/10.1183/09031936.03.00057003
https://doi.org/10.1172/JCI0215217
```

详细输出：

```bash
./crossref-stq refs.txt --verbose
```

JSON 输出：

```bash
./crossref-stq refs.txt --json
```

### 常见示例

单条文本：

```bash
./crossref-stq --text "Boucher RC (2004) New concepts of the pathogenesis of cystic fibrosis lung disease. Eur Resp J 23: 146-158."
```

从文件读取：

```bash
./crossref-stq refs.txt
```

从标准输入读取：

```bash
cat refs.txt | ./crossref-stq --stdin
```

返回 PMID：

```bash
./crossref-stq refs.txt --include-pm --verbose
```

返回多候选 DOI：

```bash
./crossref-stq refs.txt --multi-hit --verbose
```

## `crossref-doi`

用途：

- 输入 DOI
- 通过 Crossref 官方 content negotiation 或 REST API 取回元数据
- 输出格式化文本或结构化格式

官方文档：

- [Retrieve metadata](https://www.crossref.org/documentation/retrieve-metadata/)
- [Content negotiation](https://www.crossref.org/documentation/retrieve-metadata/content-negotiation/)
- [REST API](https://www.crossref.org/documentation/retrieve-metadata/rest-api/)
- [Styles list](https://api.crossref.org/v1/styles)

### 帮助

```bash
./crossref-doi --help
```

### 语法

```bash
./crossref-doi [options] DOI
./crossref-doi --doi DOI --format text --style apa
./crossref-doi --list-styles
```

### 参数

- `--doi DOI`
  指定 DOI
- `--format NAME`
  支持：
  `text | bibtex | ris | csljson | json | unixref | unixsd`
- `--style NAME`
  `--format text` 时使用的 CSL 样式，默认 `apa`
- `--locale NAME`
  `--format text` 时使用的 locale，默认 `en-US`
- `--search-style KEYWORD`
  按关键词搜索样式名
- `--show-styles N`
  只显示前 N 个样式
- `--list-styles`
  列出全部样式
- `-h`, `--help`
  显示帮助

### 支持的输出格式

- `text`
  已经格式化好的参考文献文本
- `bibtex`
  BibTeX
- `ris`
  RIS
- `csljson`
  CSL JSON
- `json`
  Crossref REST API JSON
- `unixref`
  Crossref Unixref XML
- `unixsd`
  Crossref UnixSD XML

### 说明

- `--style` 和 `--locale` 只对 `--format text` 生效
- `RIS` 一般可直接导入 EndNote
- `text` 支持不同 CSL 样式切换，但它返回的是格式化文本，不是完整 HTML citation 渲染

### 常见示例

默认输出格式化文本：

```bash
./crossref-doi 10.1126/science.1157784
```

切换样式：

```bash
./crossref-doi 10.1126/science.1157784 --style ieee
./crossref-doi 10.1126/science.1157784 --style mla
./crossref-doi 10.1126/science.1157784 --style chicago-author-date
```

切换语言：

```bash
./crossref-doi 10.1126/science.1157784 --style apa --locale zh-CN
```

输出 BibTeX：

```bash
./crossref-doi 10.1126/science.1157784 --format bibtex
```

输出 RIS：

```bash
./crossref-doi 10.1126/science.1157784 --format ris
```

输出 CSL JSON：

```bash
./crossref-doi 10.1126/science.1157784 --format csljson
```

输出 REST JSON：

```bash
./crossref-doi 10.1126/science.1157784 --format json
```

输出 XML：

```bash
./crossref-doi 10.1126/science.1157784 --format unixref
./crossref-doi 10.1126/science.1157784 --format unixsd
```

### 样式查看

查看全部样式：

```bash
./crossref-doi --list-styles
```

搜索样式：

```bash
./crossref-doi --search-style apa
./crossref-doi --search-style ieee
./crossref-doi --search-style chicago
```

只看前 20 个样式：

```bash
./crossref-doi --show-styles 20
```

## `crossref-csl`

用途：

- 输入 DOI
- 先获取 DOI 对应的 CSL JSON
- 使用 `citeproc-js` 渲染
- 输出 `citation` 或 `bibliography`
- 支持 `text` 和 `html`

适合场景：

- 需要文中引用
- 需要 bibliography
- 需要基于不同 CSL 样式输出 HTML
- 需要把多个 DOI 一起渲染成参考文献列表

### 帮助

```bash
./crossref-csl --help
```

### 语法

```bash
./crossref-csl bibliography [options] DOI...
./crossref-csl citation [options] DOI...
./crossref-csl --mode bibliography DOI...
./crossref-csl --list-styles
```

### 模式

- `bibliography`
  渲染参考文献列表
- `citation`
  渲染文中引用

### 参数

- `--mode NAME`
  `bibliography | citation`
- `--style NAME`
  CSL 样式名，默认 `apa`
- `--style-file PATH`
  使用本地 `.csl` 文件，不从远程样式库取
- `--locale NAME`
  CSL locale，默认 `en-US`
- `--output NAME`
  `text | html`
- `--search-style KEYWORD`
  按关键词搜索样式名
- `--show-styles N`
  只显示前 N 个样式
- `--list-styles`
  列出全部样式
- `-h`, `--help`
  显示帮助

### 输入方式

- 直接在命令行传一个或多个 DOI
- 从标准输入读取 DOI 列表
- 和 `crossref-stq` 串联

### 输出方式

- `text`
  纯文本 citation 或 bibliography
- `html`
  HTML citation 或 bibliography

### 说明

- 默认样式：`apa`
- 默认 locale：`en-US`
- 当前 `citation` 模式是单个 citation cluster
- 还没有实现“整篇文档上下文连续引用状态管理”
- 样式、locale、DOI 对应的 CSL JSON 会缓存到本地

缓存目录默认：

```text
~/.cache/crossref-cli
```

也可以通过环境变量修改：

```bash
export CROSSREFCLI_CACHE_DIR=/your/cache/dir
```

### 常见示例

渲染 bibliography：

```bash
./crossref-csl bibliography 10.1126/science.1157784
```

渲染 citation：

```bash
./crossref-csl citation 10.1126/science.1157784
```

切换样式：

```bash
./crossref-csl bibliography 10.1126/science.1157784 --style ieee
./crossref-csl citation 10.1126/science.1157784 --style mla
```

输出 HTML：

```bash
./crossref-csl bibliography 10.1126/science.1157784 --output html
./crossref-csl citation 10.1126/science.1157784 --output html
```

渲染多 DOI：

```bash
./crossref-csl bibliography 10.1126/science.1157784 10.1038/nphys1170
./crossref-csl citation 10.1126/science.1157784 10.1038/nphys1170
```

从标准输入读 DOI：

```bash
printf '%s\n' 10.1126/science.1157784 10.1038/nphys1170 | ./crossref-csl bibliography
```

和 `crossref-stq` 串联：

```bash
./crossref-stq refs.txt | ./crossref-csl bibliography --style apa
./crossref-stq refs.txt | ./crossref-csl citation --style ieee
```

使用本地 `.csl` 文件：

```bash
./crossref-csl bibliography 10.1126/science.1157784 --style-file /path/to/custom.csl
```

### 样式查看

查看全部样式：

```bash
./crossref-csl --list-styles
```

搜索样式：

```bash
./crossref-csl --search-style apa
./crossref-csl --search-style ieee
./crossref-csl --search-style chicago
./crossref-csl --search-style vancouver
```

只看前 20 个样式：

```bash
./crossref-csl --show-styles 20
```

## 推荐工作流

### 工作流 1：只有参考文献文本，先找 DOI，再渲染 bibliography

```bash
./crossref-stq refs.txt | ./crossref-csl bibliography --style apa
```

### 工作流 2：只有 DOI，直接拿 RIS 或 BibTeX

```bash
./crossref-doi 10.1126/science.1157784 --format ris
./crossref-doi 10.1126/science.1157784 --format bibtex
```

### 工作流 3：通过 DOI 直接渲染文中引用

```bash
./crossref-csl citation 10.1126/science.1157784 --style apa
./crossref-csl citation 10.1126/science.1157784 --style ieee
```

### 工作流 4：通过 DOI 输出 HTML bibliography

```bash
./crossref-csl bibliography 10.1126/science.1157784 --output html
```

## 注意事项

- `crossref-stq` 面向“参考文献文本匹配 DOI”
- `crossref-doi` 面向“DOI 元数据获取”
- `crossref-csl` 面向“DOI 渲染 citation / bibliography”
- `crossref-doi --format text` 和 `crossref-csl bibliography` 都能得到参考文献信息
  区别是前者直接用 Crossref content negotiation，后者走 `CSL JSON + citeproc-js`
- 如果你只想快速拿到格式化文本，用 `crossref-doi`
- 如果你需要 citation、HTML 或更可控的 CSL 渲染，用 `crossref-csl`
