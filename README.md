# crossref-stq

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
