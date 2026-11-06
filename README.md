<p align="center">
  <a href="https://songjhpku.github.io/ICLR2027-statistics/">
    <img src="docs/assets/cover.svg" alt="ICLR 2027 · Score Atlas — Explore the public review landscape" width="100%">
  </a>
</p>

<h1 align="center">ICLR 2027 · Score Atlas</h1>

<p align="center">
  <strong>你的均分，排在什么位置？</strong><br>
  以公开评审数据为坐标，理解论文评分与领域分布。
</p>

<p align="center">
  <a href="https://songjhpku.github.io/ICLR2027-statistics/"><img src="https://img.shields.io/badge/Live_Demo-GitHub_Pages-19766c?style=flat-square" alt="Live demo on GitHub Pages"></a>
  <a href="#数据与统计口径"><img src="https://img.shields.io/badge/Snapshot-2026.11.06-667675?style=flat-square" alt="Data snapshot: 2026-11-06"></a>
  <a href="#本地使用与部署"><img src="https://img.shields.io/badge/Standalone-Zero_Dependencies-b78a50?style=flat-square" alt="Standalone page with zero dependencies"></a>
</p>

<p align="center">
  <a href="https://songjhpku.github.io/ICLR2027-statistics/"><strong>中文体验 ↗</strong></a> &nbsp; · &nbsp;
  <a href="https://songjhpku.github.io/ICLR2027-statistics/en.html"><strong>English Demo ↗</strong></a> &nbsp; · &nbsp;
  <a href="#项目预览">项目预览</a> &nbsp; · &nbsp;
  <a href="#功能概览">功能概览</a> &nbsp; · &nbsp;
  <a href="#数据与统计口径">统计口径</a>
</p>

---

基于 **OpenReview 公开投稿与正式评审**的交互式统计工具。输入论文均分，查询当前比较范围内的百分位；按领域、投稿状态和评分数量筛选，查看分布、比较领域、检索论文并导出结果。所有计算在浏览器本地完成，无需登录。

<p align="center">
  <img src="docs/assets/stats.svg" alt="42,790 篇公开投稿 · 40,642 篇有评分论文 · 125,610 条公开评分" width="100%">
</p>

> [!NOTE]
> 当前数据采集于 **2026 年 11 月 6 日**，为静态快照。百分位包含并列，**不代表录用概率**。

## 项目预览

[![Score Atlas 英文版实际页面：均分百分位查询、联动筛选与评分分布](docs/assets/preview.png)](https://songjhpku.github.io/ICLR2027-statistics/en.html)

<p align="center"><sub>English edition · 真实页面截图 · 点击图片进入交互页面</sub></p>

## 功能概览

<table>
  <tr>
    <td width="50%" valign="top"><h3>01 &nbsp; 均分定位</h3>输入 1–4 分范围内的均分，查看均分不高于该分数的论文占比，以及并列论文数量。</td>
    <td width="50%" valign="top"><h3>02 &nbsp; 分布总览</h3>从论文均分、逐条评分、评分与置信度热力图、评审分歧四个角度观察数据。</td>
  </tr>
  <tr>
    <td valign="top"><h3>03 &nbsp; 领域比较</h3>对比各研究领域的投稿规模、均分、中位数与评分构成，点击领域进一步筛选。</td>
    <td valign="top"><h3>04 &nbsp; 论文检索</h3>按标题关键词或 OpenReview ID 搜索，查看逐条评分，并跳转原始讨论页。</td>
  </tr>
  <tr>
    <td valign="top"><h3>05 &nbsp; 联动筛选</h3>组合研究领域、投稿状态和最低评分条数；图表、表格与百分位随筛选同步更新。</td>
    <td valign="top"><h3>06 &nbsp; 结果导出</h3>将当前筛选结果导出为 CSV，包含论文信息、评分、置信度、分差与 OpenReview 链接。</td>
  </tr>
</table>

## 开始使用

| 步骤 | 操作 |
| :--- | :--- |
| **01 · 输入均分** | 打开[中文页面](https://songjhpku.github.io/ICLR2027-statistics/#position)或 [English edition](https://songjhpku.github.io/ICLR2027-statistics/en.html#position)，输入论文均分，查看百分位。 |
| **02 · 选择范围** | 在「探索数据 / Explore」中筛选研究领域、投稿状态与最低评分条数。 |
| **03 · 探索与导出** | 切换分布总览、领域比较或论文列表，按需下载筛选结果 CSV。 |

**比较范围提示：** 搜索条件同样会影响百分位。查看全体有评分论文中的位置前，请先点击「重置筛选 / Reset filters」。页面顶部可切换中文与英文。

## 数据与统计口径

### 快照信息

| 项目 | 说明 |
| :--- | :--- |
| 数据来源 | [OpenReview API v2](https://api2.openreview.net/notes) 中公开可见的投稿及正式评审（`Official_Review`） |
| 采集时间 · UTC | 2026-11-06 **13:41:06–13:53:25** |
| 采集时间 · 北京时间 | 2026-11-06 **21:41:06–21:53:25**（UTC+8） |
| 评分 / 置信度 | 均保留快照中观察到的 **1–4** 尺度 |
| 更新方式 | 数据内嵌于网页，页面不会实时请求 OpenReview |

投稿总数包含快照中可见的撤稿与初筛拒稿记录，不等同于官方最终投稿总量。采集跨越一段时间，**并非同一时刻的原子快照，也不代表初始评分**；后续评分或状态可能变化。

### 百分位计算

```text
P(s) = 100% × N(论文均分 ≤ s) / N(有可解析评分的论文)
```

其中，`s` 为输入均分，两个计数均限定在**当前筛选范围**内。

例如，结果为 **80%**，表示当前范围内约 80% 的有评分论文均分不高于输入分数，包含并列论文。

| 指标 | 计算规则 |
| :--- | :--- |
| 论文均分 | 从该论文可解析的逐条评分重新计算，缺失评分不计入。 |
| 论文层面统计 | 每篇有评分论文等权；逐条评分分布则按每条有效评分等权。 |
| 评审分歧 | 最高分减最低分，仅对至少有两条有效评分的论文计算。 |
| 无评分论文 | 保留在投稿列表与投稿总数中，不参与均分分布和百分位计算。 |

页面不提供录用预测或评分变化历史。与其他统计网站比较时，请核对采集时间、可见数据范围和筛选条件。更多说明见页面内的[统计口径](https://songjhpku.github.io/ICLR2027-statistics/#method)。

## 本地使用与部署

**下载 [`index.html`](index.html)（中文）或 [`en.html`](en.html)（英文），直接用浏览器打开即可。** 每个页面均内嵌界面、样式、脚本与同一份数据快照，无需安装依赖或构建。统计、筛选与 CSV 导出可离线使用；访问外部论文链接需要网络。

<details>
<summary><strong>克隆仓库</strong></summary>

```bash
git clone https://github.com/songjhPKU/ICLR2027-statistics.git
cd ICLR2027-statistics
```

随后用浏览器打开 `index.html` 或 `en.html`。离线切换语言时，请将两个文件保存在同一目录。

</details>

<details>
<summary><strong>发布到 GitHub Pages</strong></summary>

1. Fork 本仓库，或将 `index.html` 和 `en.html` 上传至你自己的仓库根目录。
2. 打开 **Settings → Pages**，将 Source 设为 **Deploy from a branch**。
3. 选择 **main** 分支与 **/(root)** 目录，点击 **Save**。
4. 等待部署完成，使用 Pages 页面显示的地址访问。

完整配置说明见 [GitHub Pages 官方文档](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

</details>

<details>
<summary><strong>维护英文页面与仓库结构</strong></summary>

英文页面由中文源页面生成。更新 `index.html` 后，运行以下命令同步英文版本；新增中文界面文案时，需同时补充脚本中的翻译表。

```bash
python scripts/build_en.py
```

```text
.
├── index.html          # 中文独立网页与内嵌数据快照
├── en.html             # 英文独立网页，由脚本生成
├── scripts/build_en.py # 英文版生成脚本与翻译表
├── .nojekyll           # GitHub Pages 静态文件标记
├── docs/assets/        # README 封面与页面预览
└── README.md           # 项目说明
```

</details>

## 来源与反馈

数据来自 [OpenReview](https://openreview.net/)，信息组织参考了 [Paper Copilot 的 ICLR 2027 汇总](https://papercopilot.com/paper-list/iclr-paper-list/iclr-2027-paper-list/)。本项目与 ICLR、OpenReview、Paper Copilot 无隶属关系。

如发现展示或统计问题，欢迎[提交 Issue](https://github.com/songjhPKU/ICLR2027-statistics/issues)，附上 **OpenReview ID、筛选条件与问题描述**，以便复现和核查。

---

<p align="center">
  <strong>Public data. Clear perspective.</strong><br>
  <sub>Built by <a href="https://github.com/songjhPKU">songjhPKU</a> · 如果这个项目对你有帮助，欢迎 Star 支持。</sub>
</p>
