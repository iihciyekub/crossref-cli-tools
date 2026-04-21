# crossref-cli-tools

面向 Crossref / DOI 工作流的轻量 Node.js 命令行工具集。

仓库地址：

- [iihciyekub/crossref-cli-tools](https://github.com/iihciyekub/crossref-cli-tools)

当前包含四个 CLI：

- `crossref-stq`
  参考文献文本 -> DOI
- `crossref-doi`
  DOI -> 格式化文献 / 元数据 / 批量导出
- `crossref-csl`
  DOI -> citation / bibliography / HTML
- `doi-pdf`
  DOI / DOI URL / Zotero 风格条目 JSON -> PDF 下载

## 特点

- 纯 Node.js，依赖轻
- 可直接在终端运行
- 支持单条输入、批量输入、标准输入
- `doi-pdf` 支持 DOI 规范化、官方 DOI 回退、Zotero 风格条目 JSON

## 依赖

- `node >= 18`
- `npm`

## 安装

全局安装：

```bash
npm install -g crossref-cli-tools
```

安装后可直接使用：

```bash
crossref-stq --help
crossref-doi --help
crossref-csl --help
doi-pdf --help
```

本地开发：

```bash
git clone https://github.com/iihciyekub/crossref-cli-tools.git
cd crossref-cli-tools
npm install
```

如果只想在当前仓库目录里直接运行：

```bash
./crossref-stq --help
./crossref-doi --help
./crossref-csl --help
./doi-pdf --help
```

如果你偏向本地脚本链接，也可以运行：

```bash
./install.sh
```

## 快速开始

参考文献文本转 DOI：

```bash
./crossref-stq refs.txt
./crossref-stq --text "Boucher RC (2004) New concepts of the pathogenesis of cystic fibrosis lung disease. Eur Resp J 23: 146-158."
```

DOI 转格式化参考文献：

```bash
./crossref-doi 10.1126/science.1157784
./crossref-doi 10.1126/science.1157784 --style ieee
./crossref-doi 10.1126/science.1157784 --format ris
```

DOI 渲染 citation / bibliography：

```bash
./crossref-csl bibliography 10.1126/science.1157784
./crossref-csl citation 10.1126/science.1157784 --style apa --locator "12"
```

按 DOI 下载 PDF：

```bash
./doi-pdf 10.1126/science.1157784
./doi-pdf https://doi.org/10.1007/s11423-017-9556-8
printf '%s\n' 10.1126/science.1157784 10.1038/nphys1170 | ./doi-pdf
```

用 Zotero 风格条目 JSON 下载 PDF：

```bash
./doi-pdf --items zotero-items.json
cat zotero-items.jsonl | ./doi-pdf --stdin-json
```

## 命令说明

### `crossref-stq`

用途：

- 输入一条或多条参考文献文本
- 调用 Crossref Simple Text Query
- 输出匹配 DOI

常见示例：

```bash
./crossref-stq refs.txt
./crossref-stq --text "citation text"
cat refs.txt | ./crossref-stq --stdin
./crossref-stq refs.txt --verbose
./crossref-stq refs.txt --json
```

### `crossref-doi`

用途：

- 输入一个或多个 DOI
- 通过 DOI content negotiation 或 Crossref REST API 获取结果
- 输出到终端或保存到目录

支持格式：

- `text`
- `bibtex`
- `ris`
- `csljson`
- `json`
- `unixref`
- `unixsd`

常见示例：

```bash
./crossref-doi 10.1126/science.1157784
./crossref-doi 10.1126/science.1157784 --format bibtex
./crossref-doi 10.1126/science.1157784 10.1038/nphys1170 --format ris --out out/
printf '%s\n' 10.1126/science.1157784 10.1038/nphys1170 | ./crossref-doi --format text
```

### `crossref-csl`

用途：

- 输入 DOI
- 拉取 CSL JSON
- 通过 `citeproc-js` 渲染文中引用或参考文献

支持模式：

- `citation`
- `bibliography`

常见示例：

```bash
./crossref-csl bibliography 10.1126/science.1157784
./crossref-csl citation 10.1126/science.1157784 --style apa
./crossref-csl bibliography 10.1126/science.1157784 --output html --out out/bibliography.html
```

### `doi-pdf`

用途：

- 输入 DOI、DOI URL，或 Zotero 风格条目 JSON
- 先规范化 DOI，再尝试下载 PDF
- 成功时把 PDF 保存到输出目录，并在 `stdout` 打印成功 DOI JSON 数组

输入支持：

- 标准 DOI
- `https://doi.org/...` 或 `doi:...`
- Zotero 风格 JSON 对象
- Zotero 风格 JSON 数组
- JSON Lines

Zotero 风格条目里的 DOI 提取顺序：

- `DOI` / `doi`
- `extra` 中的 `DOI: ...`
- `url` 中的 `doi.org/...`

下载逻辑：

- 优先使用你配置的 `source`
- 如果失败，自动回退到 `doi.org/{doi}`
- 支持从 HTML 中提取 `citation_pdf_url`、`application/pdf` 链接，以及常见 `a` / `iframe` / `embed` / `object` PDF 链接

配置示例：

```json
{
  "source": "https://example.org/{doi}",
  "outputDir": "papers",
  "maxConcurrency": 2
}
```

初始化全局配置：

```bash
./doi-pdf --init-config --source 'https://example.org/{doi}'
./doi-pdf --print-config
```

更多示例：

```bash
./doi-pdf --source 'https://example.org/{doi}' 10.1126/science.1157784
./doi-pdf --source 'https://example.org/{doi_encoded}' 10.1126/science.1157784
./doi-pdf --out out/papers --concurrency 2 10.1126/science.1157784 10.1038/nphys1170
./doi-pdf --items zotero-items.json
cat zotero-items.jsonl | ./doi-pdf --stdin-json
```

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

直接从 DOI 下载 PDF：

```bash
./doi-pdf 10.1126/science.1157784
```

从 Zotero 导出的条目 JSON 批量下载 PDF：

```bash
./doi-pdf --items items.json
```

## 环境变量

所有 Node CLI 通用：

- `CROSSREFCLI_RETRIES`
  请求重试次数，默认 `2`
- `CROSSREFCLI_MAX_TIME`
  单次请求最大秒数，默认 `60`
- `CROSSREFCLI_FETCH_TIMEOUT_MS`
  单次请求超时毫秒数，默认跟随 `CROSSREFCLI_MAX_TIME`

`doi-pdf` 额外支持：

- `DOI2PDF_SOURCE_URL`
- `DOI2PDF_BASE_URL`
  `DOI2PDF_SOURCE_URL` 的兼容别名
- `DOI2PDF_OUTPUT_DIR`
- `DOI2PDF_MAX_CONCURRENCY`
- `DOI2PDF_CONFIG`

示例：

```bash
export CROSSREFCLI_RETRIES=3
export CROSSREFCLI_MAX_TIME=60
export CROSSREFCLI_FETCH_TIMEOUT_MS=60000
export DOI2PDF_SOURCE_URL='https://example.org/{doi}'
export DOI2PDF_OUTPUT_DIR='papers'
export DOI2PDF_MAX_CONCURRENCY=2
```

## 检查

项目根目录提供了一个最小 smoke test：

```bash
./check
```

如果你刚 clone 下来，需要先安装依赖：

```bash
npm install
./check
```

## 发布

更新版本号：

```bash
npm version patch
```

推送代码并打 tag：

```bash
git push origin main
git push origin vX.Y.Z
```

创建 GitHub Release 后，仓库里的 GitHub Actions 会自动：

- `npm ci`
- 运行 `./check`
- 运行 `npm pack --dry-run`
- 用 npm automation token 发布到 npm

需要先在 GitHub 仓库里配置一个 secret：

- `NPM_TOKEN`
  这个值应当使用 npm 的 automation token

推荐做法：

1. 在 npm 网站创建 automation token
2. 在 GitHub 仓库 Settings -> Secrets and variables -> Actions 中添加 `NPM_TOKEN`
3. 创建并发布 GitHub Release

如果需要手动补发，也可以在 GitHub Actions 里手动触发 `Publish to npm`

预览打包内容：

```bash
npm pack --dry-run
```

本地手动发布到 npm：

```bash
npm login
npm publish
```

自动发布 workflow 位于：

- `.github/workflows/npm-publish.yml`

## 什么时候用哪个命令

如果你只有参考文献文本：

- 用 `crossref-stq`

如果你已经有 DOI，只想拿官方格式化结果或元数据：

- 用 `crossref-doi`

如果你已经有 DOI，需要 citation / bibliography / HTML：

- 用 `crossref-csl`

如果你已经有 DOI、DOI URL，或者 Zotero 风格条目 JSON，并且想下载 PDF：

- 用 `doi-pdf`
