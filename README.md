# ICLR 2027 · Score Atlas

**你的均分，排在什么位置？**

基于 OpenReview 公开评审数据的交互式统计页面。输入论文均分，查看它在当前比较范围内的百分位；也可以按研究领域、投稿状态和评审数量筛选，探索评分分布与论文详情。

**[在线查看 →](https://songjhpku.github.io/ICLR2027-statistics/)** · [百分位查询](https://songjhpku.github.io/ICLR2027-statistics/#position) · [探索数据](https://songjhpku.github.io/ICLR2027-statistics/#explore) · [统计口径](https://songjhpku.github.io/ICLR2027-statistics/#method)

> 当前展示的是 **2026-11-06 采集的数据快照**，不会实时更新。百分位包含并列，**不代表录用概率**。

## 可以做什么

| 功能 | 说明 |
| --- | --- |
| 均分百分位查询 | 输入 1–4 分范围内的均分，查看当前筛选中均分不高于该分数的论文占比及并列数量 |
| 分布总览 | 查看论文均分分布、逐条评分分布、评分与置信度热力图、评审分歧 |
| 领域比较 | 对比各领域的投稿数、有评分论文数、均分、中位数和评分构成 |
| 论文检索 | 按标题关键词或 OpenReview ID 搜索，查看逐条评分并跳转原始讨论页 |
| 联动筛选 | 按领域、投稿状态、最低评分条数筛选，所有图表、表格与百分位同步更新 |
| CSV 导出 | 下载当前筛选结果，包含论文信息、评分、置信度、分差和 OpenReview 链接 |

## 快速使用

1. 打开[在线页面](https://songjhpku.github.io/ICLR2027-statistics/)，在「均分百分位查询」中输入论文均分。
2. 如需缩小比较范围，在「探索数据」中选择研究领域、投稿状态或最低评分条数。
3. 切换「分布总览」「领域比较」「论文列表」查看详情，点击「下载筛选结果 CSV」保存数据。

搜索条件也会改变百分位的比较范围。想查看全体有评分论文中的位置，请先点击「重置筛选」。

## 数据快照

| 项目 | 当前快照 |
| --- | --- |
| 公开投稿 | 42,790 篇 |
| 有可解析评分的论文 | 40,642 篇 |
| 可解析评分 | 125,610 条 |
| 评分与置信度尺度 | 1–4 |
| 采集区间（UTC） | 2026-11-06 13:41:06–13:53:25 |
| 采集区间（北京时间，UTC+8） | 2026-11-06 21:41:06–21:53:25 |
| 数据来源 | [OpenReview API v2](https://api2.openreview.net/notes) 中公开可见的投稿及正式评审（`Official_Review`） |

投稿总数包含快照中可见的撤稿与初筛拒稿记录，不等同于官方最终投稿总量。数据在上述时间段内分批采集，并非同一时刻的原子快照，也不能视为初始评分快照；后续评分或状态可能变化。

### 百分位如何计算？

```text
百分位 = 当前筛选中均分 ≤ 输入分数的论文数
       ÷ 当前筛选中有可解析评分的论文数 × 100%
```

例如，结果为 **80%**，表示当前比较范围内约 80% 的有评分论文均分不高于你输入的分数，包含并列论文。它不表示 80% 的录用概率。

- **论文均分**：由该论文可解析的逐条评分重新计算，缺失评分不计入。
- **论文层面统计**：每篇有评分论文等权；逐条评分分布则按每条有效评分等权统计。
- **评审分歧**：最高分减最低分，仅对至少有两条有效评分的论文计算。
- **缺失数据**：无可解析评分的论文保留在投稿列表和投稿总数中，不参与均分分布与百分位计算。

页面未训练录用预测模型，也不提供评分变化历史。与其他统计网站比较时，请先核对采集时间、可见数据范围与筛选条件。

## 本地使用与部署

### 离线打开

下载仓库中的 [`index.html`](index.html)，直接用浏览器打开即可。界面、样式、脚本和数据均内嵌于该文件，无需安装依赖或构建；统计、筛选与 CSV 导出均在浏览器本地完成。访问外部论文链接需要网络。

也可以克隆整个仓库：

```bash
git clone https://github.com/songjhPKU/ICLR2027-statistics.git
cd ICLR2027-statistics
```

随后用浏览器打开 `index.html`。

### 发布到 GitHub Pages

1. Fork 本仓库，或将 `index.html` 上传到你自己的仓库根目录。
2. 在仓库的 **Settings → Pages** 中，将 Source 设为 **Deploy from a branch**。
3. 选择 **main** 分支与 **/(root)** 目录，点击 **Save**。
4. 等待部署完成，使用 Pages 页面显示的地址访问。

部署说明见 [GitHub Pages 官方文档](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

### 仓库结构

```text
.
├── index.html   # 独立网页，内嵌交互逻辑与数据快照
├── .nojekyll    # GitHub Pages 静态文件标记
└── README.md    # 项目介绍、使用方法与统计口径
```

## 来源与反馈

数据来自 [OpenReview](https://openreview.net/)，信息组织参考了 [Paper Copilot 的 ICLR 2027 汇总](https://papercopilot.com/paper-list/iclr-paper-list/iclr-2027-paper-list/)。本项目与 ICLR、OpenReview、Paper Copilot 无隶属关系。

如发现展示或统计问题，欢迎[提交 Issue](https://github.com/songjhPKU/ICLR2027-statistics/issues)，并附上论文 OpenReview ID、筛选条件和问题描述。觉得有帮助，也欢迎给仓库点一个 Star。
