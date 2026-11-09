"""Reconcile published aggregates against exact score frequencies."""
from fractions import Fraction
from pathlib import Path
import json
import math
import statistics

root = Path(__file__).resolve().parents[1]
history = json.loads((root / 'src/history-summary.json').read_text())
expected = {2024: (7262, 2.2887951742709385),
            2025: (11520, 2.259606435552616),
            2026: (19473, 2.260564187776482)}
for year in history['years']:
    assert year['scored'] == expected[year['year']][0]
    assert year['total'] == year['scored'] + year['unscored']
    assert year['archive_rows'] == year['total'] + year['duplicates_removed']
    assert sum(year['status_counts'].values()) == year['total']
    assert sum(year['scored_status_counts'].values()) == year['scored']
    assert sum(year['review_histogram'].values()) == year['reviews']
    means = [Fraction(a, b) for a, b, count in year['mean_fractions']
             for _ in range(count)]
    assert len(means) == year['scored']
    mapped = [1 + 3 * (x - year['minimum']) /
              (year['maximum'] - year['minimum']) for x in means]
    assert math.isclose(float(statistics.mean(means)), year['raw_mean'], abs_tol=1e-12)
    assert math.isclose(float(statistics.mean(mapped)), expected[year['year']][1], abs_tol=1e-12)
    assert math.isclose(float(statistics.median(mapped)), year['mapped_median'], abs_tol=1e-12)
    counts = [sum(1 for x in mapped if min(11, (x - 1) // Fraction(1, 4)) == i)
              for i in range(12)]
    assert counts == year['bins']
    assert history['revision'] in year['source_url']
    assert len(year['sha256']) == 64
    if year['year'] == 2026:
        assert year['minimum'] == 0
        assert year['review_histogram']['0'] == 1315
        assert means.count(Fraction(0)) == 23
        assert year['duplicates_removed'] == 3
        assert year['total'] == 19631
        assert 'after discussion opened' in year['capture_note']
print('PASS: historical sample counts, exact means, bins, zero scores and provenance')
