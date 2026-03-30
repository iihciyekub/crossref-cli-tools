# crossrefCLI

面向 Crossref 的轻量命令行工具集。

GitHub:

- [iihciyekub/crossref-cli-tools](https://github.com/iihciyekub/crossref-cli-tools)

项目现在稳定分成四条链路：

- `crossref-stq`
  参考文献文本 -> DOI
- `crossref-doi`
  DOI -> 格式化文本 / 元数据 / 批量导出文件
- `crossref-csl`
  DOI -> citation / bibliography / HTML
- `doi-pdf`
  DOI -> 按可配置下载源抓取 PDF

设计原则：

- 尽量轻
- 默认可直接在终端使用
- 需要保存结果时再显式加文件输出参数
- 不引入重型框架

## 目录结构

- [crossref-stq](/Users/iipro/iiworkspace/crossrefCLI/crossref-stq)
- [crossref-doi](/Users/iipro/iiworkspace/crossrefCLI/crossref-doi)
- [crossref-csl](/Users/iipro/iiworkspace/crossrefCLI/crossref-csl)
- [doi-pdf](/Users/iipro/iiworkspace/crossrefCLI/doi-pdf)
- [install.sh](/Users/iipro/iiworkspace/crossrefCLI/install.sh)
- [check](/Users/iipro/iiworkspace/crossrefCLI/check)
- [README.md](/Users/iipro/iiworkspace/crossrefCLI/README.md)

## 依赖

四个 CLI 现在都基于 Node：

- `node`
- `npm`

## 安装

推荐全局安装：

```bash
npm install -g crossref-cli-tools
```

安装后可直接在任意目录使用：

```bash
crossref-stq --help
crossref-doi --help
crossref-csl --help
doi-pdf --help
```

从 GitHub 下载并本地全局链接：

```bash
git clone https://github.com/iihciyekub/crossref-cli-tools.git
cd crossref-cli-tools
npm install
npm link
```

只在当前仓库里本地运行：

```bash
git clone https://github.com/iihciyekub/crossref-cli-tools.git
cd crossref-cli-tools
npm install
./crossref-doi 10.1126/science.1157784
```

如果你更偏向本地脚本链接，也可以用：

```bash
./install.sh
```

默认会把命令链接到：

```text
~/.local/bin
```

如果这个目录还没在 `PATH` 里，安装脚本会提示你加上。

给脚本执行权限：

```bash
chmod +x ./crossref-stq ./crossref-doi ./crossref-csl ./doi-pdf ./install.sh ./check
```

## 快速开始

文本参考文献转 DOI：

```bash
./crossref-stq refs.txt
```

DOI 转格式化参考文献：

```bash
./crossref-doi 10.1126/science.1157784
```

DOI 渲染 bibliography：

```bash
./crossref-csl bibliography 10.1126/science.1157784
```

配置下载源后按 DOI 下载 PDF：

```bash
./doi-pdf --source 'https://example.org/{doi}' 10.1126/science.1157784
```

第一次初始化全局配置：

```bash
./doi-pdf --init-config --source 'https://example.org/{doi}'
```

串联使用：

```bash
./crossref-stq refs.txt | ./crossref-csl bibliography --style apa
```

安装完成后也可以在任意目录直接调用：

```bash
crossref-doi 10.1126/science.1157784
doi-pdf --print-config
```

## 发布准备

当前 npm 包名 `crossref-cli-tools` 还没有被占用。GitHub 仓库已经创建好：

- [iihciyekub/crossref-cli-tools](https://github.com/iihciyekub/crossref-cli-tools)

正式发布到 npm 之前还需要你自己完成一件事：

- 用你的 npm 账号执行 `npm login`，然后运行 `npm publish`

发布前可先检查打包内容：

```bash
npm pack --dry-run
```

## 命令概览

### `crossref-stq`

用途：

- 输入一条或多条参考文献文本
- 调用 Crossref Simple Text Query
- 返回匹配到的 DOI

最常用：

```bash
./crossref-stq refs.txt
./crossref-stq --text "citation text"
cat refs.txt | ./crossref-stq --stdin
```

默认输出：

- 只打印 DOI
- 一行一个 DOI

其它模式：

```bash
./crossref-stq refs.txt --verbose
./crossref-stq refs.txt --json
./crossref-stq refs.txt --include-pm --verbose
./crossref-stq refs.txt --multi-hit --verbose
```

帮助：

```bash
./crossref-stq --help
./crossref-stq --version
```

输入约束：

- 一行一条参考文献
- 单条参考文献内部不要换行
- 单条和多条都自动支持

相关站点：

- [Simple Text Query](https://apps.crossref.org/SimpleTextQuery)
- [SimpleTextQuery.js](https://apps.crossref.org/SimpleTextQuery.js)

### `crossref-doi`

用途：

- 输入一个或多个 DOI
- 通过 Crossref content negotiation 或 REST API 获取结果
- 输出到终端，或按 DOI 分别保存到目录

支持格式：

- `text`
- `bibtex`
- `ris`
- `csljson`
- `json`
- `unixref`
- `unixsd`

最常用：

```bash
./crossref-doi 10.1126/science.1157784
./crossref-doi 10.1126/science.1157784 --style ieee
./crossref-doi 10.1126/science.1157784 --format ris
./crossref-doi 10.1126/science.1157784 --format bibtex
./crossref-doi 10.1126/science.1157784 --format csljson
./crossref-doi 10.1126/science.1157784 --format json
```

多 DOI：

```bash
./crossref-doi 10.1126/science.1157784 10.1038/nphys1170
./crossref-doi --doi 10.1126/science.1157784 --doi 10.1038/nphys1170
printf '%s\n' 10.1126/science.1157784 10.1038/nphys1170 | ./crossref-doi
```

批量保存文件：

```bash
./crossref-doi 10.1126/science.1157784 10.1038/nphys1170 --format ris --out out/
```

会生成类似：

```text
out/10.1126_science.1157784.ris
out/10.1038_nphys1170.ris
```

样式查看：

```bash
./crossref-doi --list-styles
./crossref-doi --search-style apa
./crossref-doi --show-styles 20
```

帮助：

```bash
./crossref-doi --help
./crossref-doi --version
```

说明：

- `--style` 和 `--locale` 只对 `--format text` 生效
- `RIS` 一般可直接导入 EndNote
- 多 DOI 模式内部按顺序逐个请求，不做并发
- 多 DOI 时，`json` 和 `csljson` 输出 JSON 数组
- `--out DIR` 模式下，结果主体不再打印到 stdout，而是在 `DIR` 中一条 DOI 一个文件
- 样式名拼错时，会给出候选建议

官方文档：

- [Retrieve metadata](https://www.crossref.org/documentation/retrieve-metadata/)
- [Content negotiation](https://www.crossref.org/documentation/retrieve-metadata/content-negotiation/)
- [REST API](https://www.crossref.org/documentation/retrieve-metadata/rest-api/)
- [Styles list](https://api.crossref.org/v1/styles)

### `crossref-csl`

用途：

- 输入一个或多个 DOI
- 获取 DOI 对应的 CSL JSON
- 使用 `citeproc-js` 渲染
- 输出 `citation` 或 `bibliography`
- 支持 `text` 和 `html`

两种模式：

- `bibliography`
- `citation`

最常用：

```bash
./crossref-csl bibliography 10.1126/science.1157784
./crossref-csl citation 10.1126/science.1157784
./crossref-csl bibliography 10.1126/science.1157784 --output html
./crossref-csl bibliography 10.1126/science.1157784 --style ieee
```

多 DOI：

```bash
./crossref-csl bibliography 10.1126/science.1157784 10.1038/nphys1170
./crossref-csl citation 10.1126/science.1157784 10.1038/nphys1170 --style ieee
printf '%s\n' 10.1126/science.1157784 10.1038/nphys1170 | ./crossref-csl bibliography
```

文中引用细节：

```bash
./crossref-csl citation 10.1126/science.1157784 --style apa --locator "12"
./crossref-csl citation 10.1126/science.1157784 --style apa --prefix "see"
./crossref-csl citation 10.1126/science.1157784 --style apa --prefix "see" --locator "12" --suffix "for discussion"
```

示例输出可能类似：

```text
(Renear & Palmer, 2009)
(see Renear & Palmer, 2009, p. 12 for discussion)
```

保存渲染结果到文件：

```bash
./crossref-csl bibliography 10.1126/science.1157784 --output html --out out/bibliography.html
./crossref-csl citation 10.1126/science.1157784 --style apa --out out/citation.txt
```

使用本地样式文件：

```bash
./crossref-csl bibliography 10.1126/science.1157784 --style-file /path/to/custom.csl
```

样式查看：

```bash
./crossref-csl --list-styles
./crossref-csl --search-style chicago
./crossref-csl --show-styles 20
```

帮助：

```bash
./crossref-csl --help
./crossref-csl --version
```

说明：

- 默认样式是 `apa`
- 默认 locale 是 `en-US`
- `--prefix`、`--suffix`、`--locator` 只对 `citation` 模式生效
- `--out FILE` 模式下，结果主体不再打印到 stdout，而是写入文件
- 当前 `citation` 模式是单个 citation cluster
- 还没有实现整篇文档上下文连续引用状态管理
- 样式、locale、DOI 对应的 CSL JSON 会缓存到本地
- 样式名拼错时，会给出候选建议

### `doi-pdf`

用途：

- 输入一个或多个 DOI
- 访问你配置的下载源
- 从页面里查找 PDF 链接并保存到目录
- 最终在 stdout 输出成功下载的 DOI JSON 数组

最常用：

```bash
./doi-pdf --source 'https://example.org/{doi}' 10.1126/science.1157784
./doi-pdf --source 'https://example.org/{doi_encoded}' 10.1126/science.1157784
printf '%s\n' 10.1126/science.1157784 10.1038/nphys1170 | ./doi-pdf --source 'https://example.org/'
```

批量下载和并发：

```bash
./doi-pdf --source 'https://example.org/{doi}' 10.1126/science.1157784 10.1038/nphys1170
./doi-pdf --source 'https://example.org/{doi}' --concurrency 2 10.1126/science.1157784 10.1038/nphys1170
printf '%s\n' 10.1126/science.1157784 10.1038/nphys1170 | ./doi-pdf --source 'https://example.org/{doi}'
```

配置文件：

```json
{
  "source": "https://example.org/{doi}",
  "outputDir": "papers",
  "maxConcurrency": 2
}
```

默认配置文件路径：

```text
~/.config/crossref-cli/doi-pdf.json
```

第一次安装时最简单的方式：

```bash
./doi-pdf --init-config --source 'https://example.org/{doi}'
./doi-pdf --print-config
```

这会把配置写到：

```text
~/.config/crossref-cli/doi-pdf.json
```

如果后面想重写这份配置：

```bash
./doi-pdf --init-config --source 'https://example.org/{doi}' --force
```

也可以显式指定：

```bash
./doi-pdf --config /path/to/doi-pdf.json 10.1126/science.1157784
./doi-pdf --print-config
```

输出目录和并发：

```bash
./doi-pdf --source 'https://example.org/{doi}' --out out/papers --concurrency 2 10.1126/science.1157784
```

帮助：

```bash
./doi-pdf --help
./doi-pdf --version
```

说明：

- 不内置默认下载源，必须通过 `--source`、环境变量或配置文件提供
- `--init-config` 必须显式传 `--source`，然后才会创建全局配置文件
- 如果配置文件已存在，可配合 `--force` 覆盖
- `source` 可以是基地址，也可以是带 `{doi}` / `{doi_encoded}` 的 URL 模板
- 如果 `source` 不含占位符，行为就是 `source + DOI`
- 默认输出目录是当前目录下的 `papers`
- 默认并发是 `3`，最大也是 `3`
- 支持多个 DOI 批量下载，既可以作为位置参数传入，也可以从 `stdin` 读入
- 内部使用小并发队列处理批量下载，不会一次性把所有 DOI 全部并发发出
- 如果输入 50 个 DOI，最多同时跑 `3` 个下载任务，完成一个再补下一个
- 下载源返回的内容需要满足以下任一条件：
  - 直接返回 PDF
  - HTML 中包含 `citation_pdf_url`
  - HTML 中存在指向 PDF / download 的 `a` 或 `iframe`
- `stderr` 会打印下载成功或跳过原因
- `stdout` 只打印成功 DOI 的 JSON 数组

## 常见工作流

只有参考文献文本，先找 DOI 再渲染 bibliography：

```bash
./crossref-stq refs.txt | ./crossref-csl bibliography --style apa
```

只有 DOI，直接导出 RIS / BibTeX：

```bash
./crossref-doi 10.1126/science.1157784 --format ris
./crossref-doi 10.1126/science.1157784 --format bibtex
```

通过 DOI 直接生成正文引用：

```bash
./crossref-csl citation 10.1126/science.1157784 --style apa
./crossref-csl citation 10.1126/science.1157784 --style ieee --locator "12"
```

导出 HTML bibliography：

```bash
./crossref-csl bibliography 10.1126/science.1157784 --output html --out out/bibliography.html
```

通过可配置下载源批量抓 PDF：

```bash
printf '%s\n' 10.1126/science.1157784 10.1038/nphys1170 | ./doi-pdf --source 'https://example.org/{doi}' --out out/papers
```

## 网络与缓存配置

为了保持脚本简单，项目统一采用少量环境变量。

所有 Node CLI 都可用：

- `CROSSREFCLI_RETRIES`
  请求重试次数，默认 `2`
- `CROSSREFCLI_MAX_TIME`
  单次请求最大秒数，默认 `60`
- `CROSSREFCLI_FETCH_TIMEOUT_MS`
  单次请求超时毫秒数，默认跟随 `CROSSREFCLI_MAX_TIME`

部分命令额外可用：

- `CROSSREFCLI_CACHE_DIR`
  缓存目录
- `DOI2PDF_SOURCE_URL`
  `doi-pdf` 的下载源
- `DOI2PDF_BASE_URL`
  `DOI2PDF_SOURCE_URL` 的兼容别名
- `DOI2PDF_OUTPUT_DIR`
  `doi-pdf` 输出目录
- `DOI2PDF_MAX_CONCURRENCY`
  `doi-pdf` 并发数
- `DOI2PDF_CONFIG`
  `doi-pdf` 配置文件路径

示例：

```bash
export CROSSREFCLI_RETRIES=3
export CROSSREFCLI_CONNECT_TIMEOUT=10
export CROSSREFCLI_MAX_TIME=60
export CROSSREFCLI_FETCH_TIMEOUT_MS=60000
export CROSSREFCLI_CACHE_DIR="$HOME/.cache/crossref-cli"
export DOI2PDF_SOURCE_URL='https://example.org/{doi}'
export DOI2PDF_OUTPUT_DIR='papers'
export DOI2PDF_MAX_CONCURRENCY=2
```

默认缓存目录：

```text
~/.cache/crossref-cli
```

## 检查

项目根目录提供了一个最小 smoke test：

```bash
./check
```

它会检查：

- 四个 CLI 的 `--help`
- 四个 CLI 的 `--version`
- `crossref-stq` 是否能返回 DOI
- `crossref-doi` 是否能返回格式化文本
- `crossref-doi` 是否能处理多 DOI
- `crossref-doi` 是否能输出文件
- `crossref-csl` 是否能返回 citation
- `crossref-csl` 是否能处理 citation 细节参数
- `crossref-csl` 是否能返回 bibliography
- `crossref-csl` 是否能输出文件
- `doi-pdf` 是否能解析帮助和配置输出

## 什么时候用哪个命令

如果你只有参考文献文本：

- 用 `crossref-stq`

如果你已经有 DOI，只想拿官方返回格式：

- 用 `crossref-doi`

如果你已经有 DOI，需要 citation / bibliography / HTML 渲染：

- 用 `crossref-csl`

如果你已经有 DOI，并且想通过自定义下载源抓 PDF：

- 用 `doi-pdf`
