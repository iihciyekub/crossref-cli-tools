# crossrefCLI

两个最小化的 shell CLI：

- `crossref-stq`：把参考文献文本批量匹配成 DOI
- `crossref-doi`：通过 DOI 取格式化引用或元数据

## 第一步和第二步

当前先实现最轻的一步：

1. `ref -> DOI`
2. `DOI -> text / bibtex / ris / csljson / json / xml`

后续如果要做：

3. `CSL JSON -> citation / bibliography / HTML`

那一步会单独加一个 CSL 渲染器，不混在当前轻量脚本里。

## `crossref-stq`

一个最小化的 shell CLI，用来调用 Crossref 的 [Simple Text Query](https://apps.crossref.org/SimpleTextQuery) 页面并简洁输出 DOI。

## 原理

1. `GET https://apps.crossref.org/SimpleTextQuery`
2. 从页面里提取隐藏字段 `key`，同时保留会话 cookie
3. `POST` 提交 `command=Submit`、`key`、`freetext`
4. 从返回的 HTML 结果页里提取 DOI

页面对应的前端脚本在这里：

- [https://apps.crossref.org/SimpleTextQuery.js](https://apps.crossref.org/SimpleTextQuery.js)

## 用法

先给脚本执行权限：

```bash
chmod +x ./crossref-stq
```

直接传文本，默认只打印 DOI：

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

输出 JSON：

```bash
./crossref-stq refs.txt --json
```

输出详细信息：

```bash
./crossref-stq refs.txt --verbose
```

可选参数：

- `--include-pm`
- `--multi-hit`
- `--verbose`
- `--json`

## 依赖

只需要本机已有：

- `curl`
- `perl`

## `crossref-doi`

一个最小化的 DOI CLI，用来通过官方接口获取格式化参考文献或结构化元数据。

支持的输出：

- `text`
- `bibtex`
- `ris`
- `csljson`
- `json`
- `unixref`
- `unixsd`

### 用法

默认输出 `text`，默认样式 `apa`：

```bash
./crossref-doi 10.1126/science.1157784
```

切换引用样式：

```bash
./crossref-doi 10.1126/science.1157784 --style ieee
./crossref-doi 10.1126/science.1157784 --style mla
./crossref-doi 10.1126/science.1157784 --style chicago-author-date
```

切换语言：

```bash
./crossref-doi 10.1126/science.1157784 --style apa --locale zh-CN
```

输出 RIS：

```bash
./crossref-doi 10.1126/science.1157784 --format ris
```

输出 BibTeX：

```bash
./crossref-doi 10.1126/science.1157784 --format bibtex
```

输出 CSL JSON：

```bash
./crossref-doi 10.1126/science.1157784 --format csljson
```

输出 Crossref REST JSON：

```bash
./crossref-doi 10.1126/science.1157784 --format json
```

查看可用样式名：

```bash
./crossref-doi --list-styles
```

### 说明

- `--style` 和 `--locale` 只对 `--format text` 生效
- `RIS` 通常可直接导入 EndNote
- 这一步只做官方返回格式，不做 HTML citation 渲染
