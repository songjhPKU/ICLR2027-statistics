"""Build the standalone English edition without modifying the embedded data.

Run from any directory: python scripts/build_en.py
Chinese index.html is the source of truth. New untranslated UI text fails the build.
"""

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

TRANSLATIONS = {
    'ICLR 2027 公开评审评分统计：评分分布、领域比较与论文检索。基于 OpenReview 公开数据快照。': 'Explore ICLR 2027 public review scores: percentile lookup, score distributions, research area comparisons, and paper search. Based on an OpenReview snapshot.',
    '在 GitHub 打开仓库并添加 Star（新窗口）': 'Open the repository on GitHub to add a star (new tab)',
    '觉得有帮助？到 GitHub 点个 Star': 'Found this useful? Star the project on GitHub',
    '你的均分，': 'Where does your',
    '排在什么位置？': 'score stand?',
    '输入均分，查看你在公开评审中的位置。': 'Enter your mean score to find your place in the public reviews.',
    '也可以按领域筛选，找到更贴近你的比较范围。': 'Filter by research area for a more relevant comparison.',
    '筛选领域，探索更多统计 ↓': 'Choose an area. Explore the data. ↓',
    '均分百分位查询': 'Find your percentile',
    '快照采集完成（UTC）': 'Snapshot collected (UTC)',
    '均分不高于此分数的论文占比': 'Share of papers at or below this mean score',
    '按当前筛选中有评分的论文计算；包含并列。不代表录用概率。': 'Based on scored papers in the current selection, including ties. This is not an acceptance probability.',
    '当前范围：全部有评分论文': 'Current cohort: all scored papers',
    '输入论文均分': 'Enter your paper’s mean score',
    '你的视角，你的数据切片': 'Your lens on the review landscape',
    '标题关键词或 OpenReview ID…': 'Title keywords or OpenReview ID…',
    '重置筛选 ↺': 'Reset filters ↺',
    '至少 1 条评分': 'At least 1 score',
    '至少 3 条评分': 'At least 3 scores',
    '至少 4 条评分': 'At least 4 scores',
    '正在读取本地快照…': 'Reading the local snapshot…',
    '所有图表与表格随筛选同步更新': 'Charts and tables update with your filters',
    '下载筛选结果 CSV ↓': 'Export selection as CSV ↓',
    '论文平均分分布': 'Distribution of paper means',
    '每篇论文等权': 'Equal weight per paper',
    '分箱宽度 0.25 分；缺失评分不计入分布。': 'Bin width: 0.25. Missing scores are excluded.',
    '每一条评审，如何打分': 'How reviewers score',
    '每条评分等权': 'Equal weight per score',
    '原始评分的数量与占比，保留 1–4 分尺度。': 'Counts and shares of individual scores on the original 1–4 scale.',
    '评分与评审置信度': 'Scores and reviewer confidence',
    '每个格子为评审条数；颜色越深，数量越多。': 'Each cell counts reviews. Darker cells indicate more reviews.',
    '评审之间，相差多少': 'How much do reviewers disagree?',
    '同篇论文最高分 − 最低分；仅统计至少两条评分的论文。': 'Highest minus lowest score per paper. Requires at least two scores.',
    '领域之间的评分分布': 'Scores across research areas',
    '按当前筛选计算。色条表示每个领域的逐条评分占比；均分按论文等权计算。': 'Based on the current selection. Bars show individual score shares; means give each scored paper equal weight.',
    '有评分 / 总数': 'Scored / total',
    '逐条评分构成': 'Individual score mix',
    '从统计，回到论文': 'From the numbers to the papers',
    '均分从高到低': 'Mean: high to low',
    '均分从低到高': 'Mean: low to high',
    '分歧从大到小': 'Disagreement: high to low',
    '评分条数从多到少': 'Score count: high to low',
    '标题 A–Z': 'Title: A–Z',
    '点击标题查看 OpenReview 原文；无评分论文排在最后。序号为当前筛选和排序下的位置。': 'Open a title to view its OpenReview discussion. Unscored papers appear last. Row numbers reflect the current filters and sort order.',
    '论文 / 研究领域': 'Paper / research area',
    '各评审评分': 'Review scores',
    '平均置信度': 'Mean confidence',
    '← 上一页': '← Previous',
    '下一页 →': 'Next →',
    '让数字有出处，': 'Know the source.',
    '让比较有边界。': 'Understand the limits.',
    '原始快照 JSON ↓': 'Raw snapshot JSON ↓',
    '离线独立网页 ↓': 'Standalone offline page ↓',
    '数据来自 OpenReview 公开投稿及公开正式评审。总数为本快照中可见的投稿数，包含撤稿与初筛拒稿；不等同于官方最终投稿总量。各评分均值重新从逐条评分计算，缺失值不当作零。': 'Data comes from public OpenReview submissions and public official reviews. Submission counts include visible withdrawn and desk-rejected papers in this snapshot, and are not the official final submission total. Means are recomputed from individual scores; missing values are not treated as zero.',
    '论文均分的总体平均值给每篇有评分论文相同权重；逐条评审均值给每条有效评分相同权重。分歧统计仅纳入至少两条评分的论文。评分与置信度使用快照中观察到的 1–4 尺度，不转换为往届量表。': 'The overall paper mean weights each scored paper equally; the review-level mean weights each valid score equally. Disagreement statistics require at least two scores per paper. Scores and confidence use the 1–4 scales observed in this snapshot, without conversion to scales from previous years.',
    '采集跨越一段时间，讨论期内评分仍可能更新。本页没有终审决定、录用率预测或评分变化历史。与其他网站的数量差异可能来自采集时间与纳入范围。': 'Collection spans a time interval rather than a single instant, and scores may change during discussion. This snapshot is not necessarily a record of initial scores. This page provides no final decisions, acceptance predictions, or score history. Differences from other sites may reflect collection time and scope.',
    '信息组织参考 ': 'The information layout draws on ',
    ' 的汇总、领域筛选和论文表格。数据由本项目独立采集，与 ICLR、OpenReview、Paper Copilot 无隶属关系。': ' for summaries, area filters, and paper tables. Data was collected independently. This project is not affiliated with ICLR, OpenReview, or Paper Copilot.',
    '数据校验信息': 'Data validation details',
    '当前筛选没有可用评分': 'No scores available for this selection',
    '请输入 1 到 4 之间的均分。': 'Enter a mean score between 1 and 4.',
    '当前筛选没有有评分的论文。': 'No scored papers in the current selection.',
    '${num(less+equal)} / ${num(scored.length)} 篇论文的均分不高于 ${value.toFixed(2)}，其中 ${num(equal)} 篇并列。': '${num(less+equal)} of ${num(scored.length)} papers have a mean at or below ${value.toFixed(2)}, including ${num(equal)} tied papers.',
    '（含 4 分）': ' (includes 4)',
    '（不含右端点）': ' (upper bound excluded)',
    '论文均分中位数 ${fixed(median(means))} · ${num(means.length)} 篇有评分论文': 'Median paper mean ${fixed(median(means))} · ${num(means.length)} scored papers',
    '逐条评审均值 ${fixed(average(ratings))} · ${num(ratings.length)} 条有效评分': 'Mean individual score ${fixed(average(ratings))} · ${num(ratings.length)} valid scores',
    '横轴：评分 / 纵轴：置信度': 'Columns: score / rows: confidence',
    '评分 ${j+1} · 置信度 ${i+1}：${num(n)} 条': 'Score ${j+1} · Confidence ${i+1}: ${num(n)} reviews',
    '${num(missing)} 条因评分或置信度缺失未计入': '${num(missing)} reviews excluded due to missing score or confidence',
    '相差 ${i} 分': 'Gap: ${i}',
    '${num(eligible.length)} 篇论文 · 每篇至少两条评分': '${num(eligible.length)} papers · At least two scores each',
    '筛选此领域': 'Filter by this research area',
    '${i+1} 分：${num(n)} 条': 'Score ${i+1}: ${num(n)} reviews',
    '没有匹配的论文，试试其他关键词或重置筛选。': 'No matching papers. Try another keyword or reset the filters.',
    '没有匹配的论文': 'No matching papers',
    '评分 ${r[0]}；置信度 ${r[1]??\'缺失\'}': 'Score ${r[0]}; confidence ${r[1]??\'missing\'}',
    '共 ${num(sorted.length)} 篇 · 第 ${pages?page+1:0} / ${num(pages)} 页 · 每页 ${PAGE_SIZE} 篇': '${num(sorted.length)} papers · Page ${pages?page+1:0} of ${num(pages)} · ${PAGE_SIZE} per page',
    '当前比较范围：': 'Current cohort: ',
    ' · 已应用搜索': ' · Search applied',
    ' · 至少 ': ' · At least ',
    '当前 ${num(selected.length)} / ${num(all.length)} 篇投稿 · ${num(selected.length-scored.length)} 篇暂无可解析评分': '${num(selected.length)} of ${num(all.length)} submissions · ${num(selected.length-scored.length)} without parseable scores',
    '在全部 ${num(all.length)} 篇公开投稿中筛选': 'Filtered from ${num(all.length)} public submissions',
    '评分覆盖率 ${coverage.toFixed(2)}%': 'Score coverage ${coverage.toFixed(2)}%',
    '每篇有评分论文平均 ${fixed(scored.length?nReviews/scored.length:null)} 条': '${fixed(scored.length?nReviews/scored.length:null)} scores per scored paper',
    '1–4 分尺度 · 中位数 ${fixed(median(means))}': '1–4 scale · Median ${fixed(median(means))}',
    '数据未加载。请使用离线独立网页，或在本地服务器中打开此项目。': 'Data could not be loaded. Use the standalone offline page or serve the project locally.',
    '采集区间（UTC）：${meta.collection_started_at.replace(\'T\',\' \').slice(0,19)} 至 ${meta.fetched_at.replace(\'T\',\' \').slice(0,19)}。页面内所有数字仅对应这一份快照，不实时访问 OpenReview。': 'Collection window (UTC): ${meta.collection_started_at.replace(\'T\',\' \').slice(0,19)} to ${meta.fetched_at.replace(\'T\',\' \').slice(0,19)}. All figures refer to this snapshot; the page does not query OpenReview live.',
    '原始 JSON 的 SHA-256：${meta.sha256}。已校验论文与评审 ID 唯一性、评分范围，以及保存均分与逐条评分的一致性。': 'Original JSON SHA-256: ${meta.sha256}. Validation covered unique paper and review IDs, score ranges, and agreement between saved means and individual scores.',
    '导出当前数据 CSV ↓': 'Export current selection as CSV ↓',
    '此文件可直接离线使用': 'This page works offline',
    '有评分论文数': 'Scored paper count',
    '篇有评分论文': 'scored papers',
    '有评分论文': 'Scored papers',
    '论文平均分': 'Mean paper score',
    '论文均分': 'Paper mean score',
    '当前投稿': 'Selected submissions',
    '公开评分': 'Public scores',
    '分布总览': 'Overview',
    '领域比较': 'Research areas',
    '论文列表': 'Papers',
    '查百分位': 'Find percentile',
    '探索数据': 'Explore',
    '统计口径 ↗': 'Methodology ↗',
    '搜索论文': 'Search papers',
    '研究领域': 'Research area',
    '投稿状态': 'Submission status',
    '评审数量': 'Score count',
    '全部领域': 'All areas',
    '全部状态': 'All statuses',
    '初筛拒稿': 'Desk rejected',
    '已撤稿': 'Withdrawn',
    '在审': 'Under review',
    '其他': 'Other',
    '不限': 'Any',
    '统计摘要': 'Summary statistics',
    '数据视图': 'Data views',
    '置信度': 'Confidence',
    '排序': 'Sort by',
    '中位数': 'Median',
    '状态': 'Status',
    '均分': 'Mean',
    '极差': 'Range',
    '加载中': 'Loading…',
    '分尺度': 'score scale',
    '条评分': 'scores',
    '篇论文': 'papers',
    '条评审': 'reviews',
    '${i+1} 分': 'Score ${i+1}',
    '${x} 分': '${x}',
    '1 分': 'Score 1',
    '2 分': 'Score 2',
    '3 分': 'Score 3',
    '4 分': 'Score 4',
    '：': ': ',
    '；': '; ',
}


def build():
    source = (ROOT / 'index.html').read_text(encoding='utf-8')
    before, marker, rest = source.partition('<script>window.ICLR_DATA=')
    if not marker:
        raise ValueError('Missing embedded data script')
    snapshot, close, after = rest.partition('</script>')
    if not close:
        raise ValueError('Unterminated embedded data script')

    # Translate UI only. The snapshot is carried over byte for byte.
    ui = before + '\n<!-- SNAPSHOT -->\n' + after
    for original, translated in sorted(TRANSLATIONS.items(), key=lambda item: -len(item[0])):
        ui = ui.replace(original, translated)
    ui = ui.replace('lang="zh-CN"', 'lang="en"')
    ui = ui.replace('<title>ICLR 2027 · Score Atlas</title>', '<title>ICLR 2027 · Score Atlas | Public Review Statistics</title>')
    ui = ui.replace('href="en.html" lang="en" hreflang="en" aria-label="Switch to English">EN</a>',
                    'href="index.html" lang="zh-CN" hreflang="zh-CN" aria-label="Switch to Chinese">中文</a>')

    remaining = re.findall(r'[\u4e00-\u9fff]+', ui.replace('>中文</a>', '>Chinese</a>'))
    if remaining:
        raise ValueError(f'Untranslated UI text: {remaining}')
    output = ui.replace('\n<!-- SNAPSHOT -->\n', marker + snapshot + close)
    (ROOT / 'en.html').write_text(output, encoding='utf-8')
    print('Built en.html: translated UI, original embedded snapshot preserved.')


if __name__ == '__main__':
    build()
