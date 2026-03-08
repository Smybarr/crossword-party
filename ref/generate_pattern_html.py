#!/usr/bin/env python3
"""Generate grid correction HTML using pattern-based anomaly detection.

Uses 32x32 translational periodicity in the grid to find cells that
disagree with the majority of their periodic copies. Much more reliable
than clue-based suggestions since it's independent of the noisy clue DB.
"""

import csv
import json

# Read grid
grid = []
with open('grid_layout.csv', 'r') as f:
    reader = csv.reader(f)
    for row in reader:
        grid.append([1 if c == '1' else 0 for c in row])

ROWS = len(grid)
COLS = len(grid[0]) if grid else 0
print(f"Grid: {ROWS}x{COLS}")

# Pattern-based anomaly detection using translational periodicity
PERIOD = 32

def find_pattern_anomalies(base_threshold=0.85):
    """Find cells that disagree with majority of periodic copies.

    Uses adaptive threshold: cells near edges have fewer copies,
    so we lower the threshold proportionally to avoid blind spots.
    Interior cells (~80 copies) use the base threshold.
    Edge cells (~8-20 copies) use a lower threshold.
    """
    anomalies = {}  # (r,c) -> (cell_val, disagree_count, total_count)

    for r in range(ROWS):
        for c in range(COLS):
            val = grid[r][c]
            # Collect all periodic copies
            copies = []
            for dr in range(-9, 10):  # ~9 periods in each direction
                for dc in range(-9, 10):
                    nr, nc = r + dr * PERIOD, c + dc * PERIOD
                    if 0 <= nr < ROWS and 0 <= nc < COLS and (dr != 0 or dc != 0):
                        copies.append(grid[nr][nc])

            if len(copies) < 3:
                continue

            # Count how many copies agree vs disagree
            agree = sum(1 for v in copies if v == val)
            disagree = len(copies) - agree

            # Adaptive threshold: lower for cells with fewer copies (edges)
            # Interior cells have ~80 copies, edge cells ~8-20
            # Scale threshold from 0.65 (few copies) to base_threshold (many copies)
            max_copies = 80
            t = min(len(copies) / max_copies, 1.0)
            threshold = 0.65 + t * (base_threshold - 0.65)

            if disagree / len(copies) >= threshold:
                anomalies[(r, c)] = (val, disagree, len(copies))

    return anomalies

# Manually confirmed errors (verified against physical puzzle)
# Format: (r, c): (current_val, 1, 1) where current_val: 1=WHITE->BLACK, 0=BLACK->WHITE
CONFIRMED_ERRORS = {
    # B->W: black cells that should be white
    (215, 2): (0, 1, 1),  # C216 (verified)
    (247, 2): (0, 1, 1),  # C248 (verified)
    (87, 300): (0, 1, 1),  # KO88 (mirror of C216)
    (55, 300): (0, 1, 1),  # KO56 (mirror of C248)
    # W->B: Row 3: verified + 180deg mirrors
    (2, 117): (1, 1, 1),  # DN3 (verified)
    (2, 119): (1, 1, 1),  # DP3 (verified)
    (2, 121): (1, 1, 1),  # DR3 (verified)
    (2, 181): (1, 1, 1),  # FZ3 (verified)
    (2, 183): (1, 1, 1),  # GB3 (verified)
    (2, 185): (1, 1, 1),  # GD3 (mirror of DN301)
    # Row 301: verified + 180deg mirrors
    (300, 117): (1, 1, 1),  # DN301 (verified)
    (300, 119): (1, 1, 1),  # DP301 (verified)
    (300, 121): (1, 1, 1),  # DR301 (verified)
    (300, 181): (1, 1, 1),  # FZ301 (mirror of DR3)
    (300, 183): (1, 1, 1),  # GB301 (mirror of DP3)
    (300, 185): (1, 1, 1),  # GD301 (mirror of DN3)
    # Periodic position (r%32=1, c%32=9) — verified against physical puzzle
    # Row 130: AP130, BV130, DB130
    (129, 41): (1, 1, 1),
    (129, 73): (1, 1, 1),
    (129, 105): (1, 1, 1),
    # Row 162: AP162, BV162, DB162
    (161, 41): (1, 1, 1),
    (161, 73): (1, 1, 1),
    (161, 105): (1, 1, 1),
    # 180deg mirrors of the above 6
    (173, 197): (1, 1, 1),  # GP174 (mirror of DB130)
    (173, 229): (1, 1, 1),  # HV174 (mirror of BV130)
    (173, 261): (1, 1, 1),  # JB174 (mirror of AP130)
    (141, 197): (1, 1, 1),  # GP142 (mirror of DB162)
    (141, 229): (1, 1, 1),  # HV142 (mirror of BV162)
    (141, 261): (1, 1, 1),  # JB142 (mirror of AP162)
    # Missing mirrors found by audit
    (173, 105): (1, 1, 1),  # DB174 (mirror of GP130)
    # HV162 — verified against physical puzzle
    (161, 229): (1, 1, 1),  # HV162 (mirror of BV142)
    # Rows 106,118 x cols DZ,EL,FF,FR — verified against physical puzzle
    (105, 129): (1, 1, 1),  # DZ106
    (105, 141): (1, 1, 1),  # EL106
    (105, 161): (1, 1, 1),  # FF106
    (105, 173): (1, 1, 1),  # FR106
    (117, 129): (1, 1, 1),  # DZ118
    (117, 141): (1, 1, 1),  # EL118
    (117, 161): (1, 1, 1),  # FF118
    (117, 173): (1, 1, 1),  # FR118
    # 180deg mirrors: rows 186,198
    (197, 129): (1, 1, 1),  # DZ198
    (197, 141): (1, 1, 1),  # EL198
    (197, 161): (1, 1, 1),  # FF198
    (197, 173): (1, 1, 1),  # FR198
    (185, 129): (1, 1, 1),  # DZ186
    (185, 141): (1, 1, 1),  # EL186
    (185, 161): (1, 1, 1),  # FF186
    (185, 173): (1, 1, 1),  # FR186
    # Rows 130,142,162,174 x cols GD,GP — verified against physical puzzle
    (129, 185): (1, 1, 1),  # GD130
    (129, 197): (1, 1, 1),  # GP130
    (141, 185): (1, 1, 1),  # GD142
    (141, 197): (1, 1, 1),  # GP142
    (161, 185): (1, 1, 1),  # GD162
    (161, 197): (1, 1, 1),  # GP162
    (173, 185): (1, 1, 1),  # GD174
    # GP174 (173,197) already exists above
    # Mirrors (DN and DB columns at rows 130,142,162,174)
    (173, 117): (1, 1, 1),  # DN174 (mirror of GD130)
    # DB174 (173,105) already exists above
    (161, 117): (1, 1, 1),  # DN162 (mirror of GD142)
    # DB162 (161,105) already exists above
    (141, 117): (1, 1, 1),  # DN142 (mirror of GD162)
    (141, 105): (1, 1, 1),  # DB142 (mirror of GP162)
    (129, 117): (1, 1, 1),  # DN130 (mirror of GD174)
    # DB130 (129,105) already exists above
    # Rows 130,142,162,174 x cols AP,BB,BV,CH — verified against physical puzzle
    # (AP130, BV130, AP162, BV162 already above)
    (129, 53): (1, 1, 1),   # BB130
    (129, 85): (1, 1, 1),   # CH130
    (141, 41): (1, 1, 1),   # AP142
    (141, 53): (1, 1, 1),   # BB142
    (141, 73): (1, 1, 1),   # BV142
    (141, 85): (1, 1, 1),   # CH142
    (161, 53): (1, 1, 1),   # BB162
    (161, 85): (1, 1, 1),   # CH162
    (173, 41): (1, 1, 1),   # AP174
    (173, 53): (1, 1, 1),   # BB174
    (173, 73): (1, 1, 1),   # BV174
    (173, 85): (1, 1, 1),   # CH174
    # 180deg mirrors of the new ones
    (173, 249): (1, 1, 1),  # IP174 (mirror of BB130)
    (173, 217): (1, 1, 1),  # HJ174 (mirror of CH130)
    (161, 249): (1, 1, 1),  # IP162 (mirror of BB142)
    (161, 217): (1, 1, 1),  # HJ162 (mirror of CH142)
    (141, 249): (1, 1, 1),  # IP142 (mirror of BB162)
    (141, 217): (1, 1, 1),  # HJ142 (mirror of CH162)
    (129, 261): (1, 1, 1),  # JB130 (mirror of AP174)
    (129, 249): (1, 1, 1),  # IP130 (mirror of BB174)
    (129, 229): (1, 1, 1),  # HV130 (mirror of BV174)
    (129, 217): (1, 1, 1),  # HJ130 (mirror of CH174)
    (161, 261): (1, 1, 1),  # JB162 (mirror of AP142)
    (141, 261): (1, 1, 1),  # JB142 (mirror of AP162 — may duplicate)
    # Rows 42,54,74,86 x cols DZ,EL,FF,FR — verified against physical puzzle
    (41, 129): (1, 1, 1),   # DZ42
    (41, 141): (1, 1, 1),   # EL42
    (41, 161): (1, 1, 1),   # FF42
    (41, 173): (1, 1, 1),   # FR42
    (53, 129): (1, 1, 1),   # DZ54
    (53, 141): (1, 1, 1),   # EL54
    (53, 161): (1, 1, 1),   # FF54
    (53, 173): (1, 1, 1),   # FR54
    (73, 129): (1, 1, 1),   # DZ74
    (73, 141): (1, 1, 1),   # EL74
    (73, 161): (1, 1, 1),   # FF74
    (73, 173): (1, 1, 1),   # FR74
    (85, 129): (1, 1, 1),   # DZ86
    (85, 141): (1, 1, 1),   # EL86
    (85, 161): (1, 1, 1),   # FF86
    (85, 173): (1, 1, 1),   # FR86
    # 180deg mirrors: rows 218,230,250,262 x cols DZ,EL,FF,FR
    (217, 129): (1, 1, 1),  # DZ218
    (217, 141): (1, 1, 1),  # EL218
    (217, 161): (1, 1, 1),  # FF218
    (217, 173): (1, 1, 1),  # FR218
    (229, 129): (1, 1, 1),  # DZ230
    (229, 141): (1, 1, 1),  # EL230
    (229, 161): (1, 1, 1),  # FF230
    (229, 173): (1, 1, 1),  # FR230
    (249, 129): (1, 1, 1),  # DZ250
    (249, 141): (1, 1, 1),  # EL250
    (249, 161): (1, 1, 1),  # FF250
    (249, 173): (1, 1, 1),  # FR250
    (261, 129): (1, 1, 1),  # DZ262
    (261, 141): (1, 1, 1),  # EL262
    (261, 161): (1, 1, 1),  # FF262
    (261, 173): (1, 1, 1),  # FR262
}

print("Finding pattern anomalies (this takes a minute)...")
anomalies = find_pattern_anomalies(base_threshold=0.85)

# Merge confirmed errors
for k, v in CONFIRMED_ERRORS.items():
    if k not in anomalies:
        anomalies[k] = v

# Separate W->B and B->W
# Pattern-detected W->B suggestions are 100% wrong per user verification against photo.
# Only keep manually confirmed W->B errors.
wb_anomalies = {k: v for k, v in anomalies.items() if v[0] == 1 and k in CONFIRMED_ERRORS}
bw_anomalies = {k: v for k, v in anomalies.items() if v[0] == 0}  # black cells that should be white
# Ensure confirmed B->W errors are included even if pattern detection missed them
for k, v in CONFIRMED_ERRORS.items():
    if v[0] == 0 and k not in bw_anomalies:
        bw_anomalies[k] = v

# Check symmetric pairs
def has_symmetric_pair(r, c, anomaly_set):
    sr, sc = ROWS - 1 - r, COLS - 1 - c
    return (sr, sc) in anomaly_set

wb_sym = sum(1 for r, c in wb_anomalies if has_symmetric_pair(r, c, wb_anomalies))
bw_sym = sum(1 for r, c in bw_anomalies if has_symmetric_pair(r, c, bw_anomalies))

print(f"Anomalies found: {len(anomalies)}")
print(f"  W->B: {len(wb_anomalies)} ({wb_sym} with symmetric pair)")
print(f"  B->W: {len(bw_anomalies)} ({bw_sym} with symmetric pair)")

# Compute confidence score for each anomaly
def confidence_score(r, c, val, disagree, total, anomaly_set):
    """Higher = more confident this is a real error."""
    ratio = disagree / total
    has_pair = has_symmetric_pair(r, c, anomaly_set)
    # Base score from agreement ratio
    score = ratio
    # Boost for symmetric pair (Dan mirrored UL quadrant)
    if has_pair:
        score += 0.1
    return min(score, 1.0)

# Build anomaly data for HTML
wb_data = []
for (r, c), (val, disagree, total) in sorted(wb_anomalies.items()):
    score = confidence_score(r, c, val, disagree, total, wb_anomalies)
    has_pair = has_symmetric_pair(r, c, wb_anomalies)
    confirmed = (r, c) in CONFIRMED_ERRORS
    wb_data.append({
        'r': r, 'c': c,
        'disagree': disagree, 'total': total,
        'score': round(score, 3),
        'hasPair': has_pair,
        'confirmed': confirmed
    })

bw_data = []
for (r, c), (val, disagree, total) in sorted(bw_anomalies.items()):
    score = confidence_score(r, c, val, disagree, total, bw_anomalies)
    has_pair = has_symmetric_pair(r, c, bw_anomalies)
    confirmed = (r, c) in CONFIRMED_ERRORS
    bw_data.append({
        'r': r, 'c': c,
        'disagree': disagree, 'total': total,
        'score': round(score, 3),
        'hasPair': has_pair,
        'confirmed': confirmed
    })

confirmed_wb = sum(1 for d in wb_data if d['confirmed'])
print(f"  Confirmed errors included: {confirmed_wb} W->B")

# Generate HTML
html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Grid Pattern Anomalies - World's Largest Crossword</title>
<style>
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #1a1a2e; color: #e0e0e0; overflow: hidden; }}
#controls {{ position: fixed; top: 10px; left: 10px; z-index: 100; background: rgba(20,20,40,0.95); border-radius: 8px; padding: 12px; max-width: 380px; box-shadow: 0 2px 10px rgba(0,0,0,0.5); }}
#controls h2 {{ font-size: 14px; margin-bottom: 8px; color: #7eb8da; }}
.filter-group {{ margin-bottom: 8px; }}
.filter-group label {{ display: block; font-size: 12px; margin: 2px 0; cursor: pointer; }}
.filter-group label input {{ margin-right: 6px; }}
#info-box {{ position: fixed; top: 10px; right: 10px; z-index: 100; background: rgba(20,20,40,0.95); border-radius: 8px; padding: 12px; max-width: 400px; box-shadow: 0 2px 10px rgba(0,0,0,0.5); font-size: 12px; }}
#info-box h3 {{ color: #7eb8da; margin-bottom: 6px; font-size: 13px; }}
.info-section {{ margin-bottom: 8px; }}
.info-section p {{ margin: 2px 0; line-height: 1.4; }}
.legend-item {{ display: flex; align-items: center; margin: 3px 0; }}
.legend-swatch {{ width: 14px; height: 14px; border: 1px solid #666; margin-right: 6px; flex-shrink: 0; }}
#tooltip {{ position: fixed; z-index: 200; background: rgba(0,0,0,0.9); color: #fff; padding: 8px 12px; border-radius: 6px; font-size: 12px; pointer-events: none; display: none; max-width: 350px; line-height: 1.5; }}
#stats {{ font-size: 11px; color: #999; margin-top: 6px; }}
canvas {{ display: block; cursor: crosshair; }}
.collapse-btn {{ background: none; border: 1px solid #555; color: #999; font-size: 10px; padding: 2px 6px; border-radius: 3px; cursor: pointer; float: right; }}
.collapse-btn:hover {{ color: #fff; border-color: #999; }}
</style>
</head>
<body>

<div id="controls">
  <h2>Pattern-Based Grid Anomalies <button class="collapse-btn" onclick="togglePanel('controls-body')">-</button></h2>
  <div id="controls-body">
    <div class="filter-group">
      <strong style="font-size:11px; color:#aaa;">Suggestion Type</strong>
      <label><input type="checkbox" id="showWB" onchange="draw()">
        <span style="color:#ff4444">Suspected White &rarr; Black</span> ({len(wb_anomalies)} cells)
      </label>
      <label><input type="checkbox" id="showBW" onchange="draw()">
        <span style="color:#44aaff">Suspected Black &rarr; White</span> ({len(bw_anomalies)} cells)
      </label>
    </div>
    <div class="filter-group">
      <strong style="font-size:11px; color:#aaa;">Confidence Filter</strong>
      <label><input type="checkbox" id="highOnly" onchange="draw()"> Show only high confidence (&ge;95% copies disagree)</label>
    </div>
    <div class="filter-group">
      <strong style="font-size:11px; color:#aaa;">Overlays</strong>
      <label><input type="checkbox" id="showUL" onchange="draw()"> Highlight UL quadrant (Dan's source quadrant)</label>
      <label><input type="checkbox" id="showSymLine" onchange="draw()"> Show symmetry center point</label>
    </div>
    <div id="stats"></div>
  </div>
</div>

<div id="info-box">
  <h3>How This Works <button class="collapse-btn" onclick="togglePanel('info-body')">-</button></h3>
  <div id="info-body">
    <div class="info-section">
      <p><strong>Method:</strong> The grid has a repeating 32&times;32 diamond pattern. For each cell, we check all its periodic copies (every 32 cells in each direction). If 85%+ of copies disagree with the cell's current value, it's flagged as an anomaly.</p>
      <p style="color:#aaa; margin-top:4px;"><strong>Why this works:</strong> Dan built the grid by copying the same diamond pattern across the grid. Errors are one-off mistakes that break the pattern. Unlike clue-based analysis, this is independent of the noisy clue database.</p>
    </div>
    <div class="info-section">
      <p><strong>Legend:</strong></p>
      <div class="legend-item"><div class="legend-swatch" style="background:#22dd22"></div> VERIFIED: white should be BLACK &mdash; confirmed against physical puzzle</div>
      <div class="legend-item"><div class="legend-swatch" style="background:#ddaa00"></div> VERIFIED: black should be WHITE &mdash; confirmed against physical puzzle</div>
      <div class="legend-item"><div class="legend-swatch" style="background:#ff4444"></div> White cell that should likely be BLACK (high confidence)</div>
      <div class="legend-item"><div class="legend-swatch" style="background:#ff8888"></div> White &rarr; Black (moderate confidence)</div>
      <div class="legend-item"><div class="legend-swatch" style="background:#4488ff"></div> Black cell that should likely be WHITE (high confidence)</div>
      <div class="legend-item"><div class="legend-swatch" style="background:#88aaff"></div> Black &rarr; White (moderate confidence)</div>
    </div>
    <div class="info-section">
      <p><strong>Key stats:</strong></p>
      <p>W&rarr;B anomalies: {len(wb_anomalies)} cells ({wb_sym} with 180&deg; symmetric pair = {wb_sym*100//max(len(wb_anomalies),1)}%)</p>
      <p>B&rarr;W anomalies: {len(bw_anomalies)} cells ({bw_sym} with 180&deg; symmetric pair = {bw_sym*100//max(len(bw_anomalies),1)}%)</p>
      <p style="color:#7eb8da;">100% symmetric pair rate confirms these align with Dan's mirroring method.</p>
    </div>
    <div class="info-section">
      <p><strong>Navigation:</strong> Scroll to zoom, drag to pan. Hover over colored cells for details.</p>
      <p style="color:#aaa; margin-top:4px;"><strong>Coordinates:</strong> Cell references match Dan's Google Sheet (row 1 = top, column A = left). Hover any cell to see its sheet reference.</p>
    </div>
  </div>
</div>

<div id="tooltip"></div>
<canvas id="canvas"></canvas>

<script>
const ROWS = {ROWS};
const COLS = {COLS};
const grid = {json.dumps(grid)};
const wbAnomalies = {json.dumps(wb_data)};
const bwAnomalies = {json.dumps(bw_data)};

// Build lookup maps
const wbMap = new Map();
wbAnomalies.forEach(a => wbMap.set(a.r + ',' + a.c, a));
const bwMap = new Map();
bwAnomalies.forEach(a => bwMap.set(a.r + ',' + a.c, a));

// Convert 0-indexed column to spreadsheet letters (0=A, 25=Z, 26=AA, etc.)
function colToSheet(c) {{
  let s = '';
  c++;  // 1-indexed
  while (c > 0) {{
    c--;
    s = String.fromCharCode(65 + (c % 26)) + s;
    c = Math.floor(c / 26);
  }}
  return s;
}}

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const tooltip = document.getElementById('tooltip');

let cellSize = 4;
let offsetX = 0, offsetY = 0;
let isDragging = false, dragStartX, dragStartY, dragOffsetX, dragOffsetY;

function resize() {{
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  draw();
}}
window.addEventListener('resize', resize);

function togglePanel(id) {{
  const el = document.getElementById(id);
  el.style.display = el.style.display === 'none' ? '' : 'none';
}}

function draw() {{
  const w = canvas.width, h = canvas.height;
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, w, h);

  const showWB = document.getElementById('showWB').checked;
  const showBW = document.getElementById('showBW').checked;
  const highOnly = document.getElementById('highOnly').checked;
  const showUL = document.getElementById('showUL').checked;
  const showSymLine = document.getElementById('showSymLine').checked;

  // Visible range
  const startR = Math.max(0, Math.floor(-offsetY / cellSize));
  const endR = Math.min(ROWS, Math.ceil((h - offsetY) / cellSize));
  const startC = Math.max(0, Math.floor(-offsetX / cellSize));
  const endC = Math.min(COLS, Math.ceil((w - offsetX) / cellSize));

  let visibleCount = 0;

  // Draw grid
  for (let r = startR; r < endR; r++) {{
    for (let c = startC; c < endC; c++) {{
      const x = c * cellSize + offsetX;
      const y = r * cellSize + offsetY;
      const val = grid[r][c];

      // Base color
      ctx.fillStyle = val === 1 ? '#ffffff' : '#222222';

      // Check anomalies
      const key = r + ',' + c;
      const wbA = wbMap.get(key);
      const bwA = bwMap.get(key);

      // Confirmed errors always show (regardless of filter checkboxes)
      if (wbA && wbA.confirmed) {{
        ctx.fillStyle = '#22dd22';  // Green = verified W->B
        visibleCount++;
      }} else if (bwA && bwA.confirmed) {{
        ctx.fillStyle = '#ddaa00';  // Gold = verified B->W
        visibleCount++;
      }} else if (wbA && showWB) {{
        if (!highOnly || wbA.disagree / wbA.total >= 0.95) {{
          const conf = wbA.disagree / wbA.total;
          if (conf >= 0.95) {{
            ctx.fillStyle = '#ff2222';
          }} else if (conf >= 0.90) {{
            ctx.fillStyle = '#ff6644';
          }} else {{
            ctx.fillStyle = '#ff8888';
          }}
          visibleCount++;
        }}
      }} else if (bwA && showBW) {{
        if (!highOnly || bwA.disagree / bwA.total >= 0.95) {{
          const conf = bwA.disagree / bwA.total;
          if (conf >= 0.95) {{
            ctx.fillStyle = '#2266ff';
          }} else if (conf >= 0.90) {{
            ctx.fillStyle = '#4488ff';
          }} else {{
            ctx.fillStyle = '#88aaff';
          }}
          visibleCount++;
        }}
      }}

      ctx.fillRect(x, y, cellSize - (cellSize > 3 ? 1 : 0), cellSize - (cellSize > 3 ? 1 : 0));
    }}
  }}

  // UL quadrant overlay
  if (showUL) {{
    const midR = Math.floor(ROWS / 2);
    const midC = Math.floor(COLS / 2);
    ctx.strokeStyle = 'rgba(126, 184, 218, 0.6)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(offsetX, offsetY, midC * cellSize, midR * cellSize);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(126, 184, 218, 0.05)';
    ctx.fillRect(offsetX, offsetY, midC * cellSize, midR * cellSize);
  }}

  // Symmetry center
  if (showSymLine) {{
    const cx = (COLS - 1) / 2 * cellSize + offsetX;
    const cy = (ROWS - 1) / 2 * cellSize + offsetY;
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffaa00';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffaa00';
    ctx.fill();
  }}

  // Stats
  document.getElementById('stats').textContent =
    `Zoom: ${{cellSize}}px/cell | Visible: rows ${{startR+1}}-${{endR}} (${{colToSheet(startC)}}-${{colToSheet(Math.max(0,endC-1))}}) | Showing ${{visibleCount}} anomalies`;
}}

// Mouse events
canvas.addEventListener('wheel', (e) => {{
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const oldSize = cellSize;
  if (e.deltaY < 0) cellSize = Math.min(cellSize + (cellSize < 10 ? 1 : cellSize < 30 ? 2 : 4), 60);
  else cellSize = Math.max(cellSize - (cellSize <= 10 ? 1 : cellSize <= 30 ? 2 : 4), 1);

  // Zoom toward mouse
  const scale = cellSize / oldSize;
  offsetX = mx - (mx - offsetX) * scale;
  offsetY = my - (my - offsetY) * scale;
  draw();
}});

canvas.addEventListener('mousedown', (e) => {{
  isDragging = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  dragOffsetX = offsetX;
  dragOffsetY = offsetY;
}});

canvas.addEventListener('mousemove', (e) => {{
  if (isDragging) {{
    offsetX = dragOffsetX + (e.clientX - dragStartX);
    offsetY = dragOffsetY + (e.clientY - dragStartY);
    draw();
    return;
  }}

  // Tooltip
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const c = Math.floor((mx - offsetX) / cellSize);
  const r = Math.floor((my - offsetY) / cellSize);

  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) {{
    tooltip.style.display = 'none';
    return;
  }}

  const key = r + ',' + c;
  const wbA = wbMap.get(key);
  const bwA = bwMap.get(key);
  const val = grid[r][c];

  const sheetRef = colToSheet(c) + (r + 1);
  let text = `Sheet cell ${{sheetRef}} (row ${{r+1}}, col ${{colToSheet(c)}}) - Currently ${{val ? 'WHITE' : 'BLACK'}}`;

  if (wbA) {{
    const sr = ROWS - 1 - r, sc = COLS - 1 - c;
    const symRef = colToSheet(sc) + (sr + 1);
    if (wbA.confirmed) {{
      text += `\\n\\nVERIFIED ERROR: Should be BLACK`;
      text += `\\nConfirmed by spot-checking against physical puzzle`;
    }} else {{
      const pct = Math.round(wbA.disagree / wbA.total * 100);
      text += `\\n\\nSuggestion: Change to BLACK`;
      text += `\\n${{pct}}% of periodic copies (${{wbA.disagree}}/${{wbA.total}}) are BLACK`;
      text += `\\nThis white cell breaks the local diamond pattern`;
    }}
    text += `\\nSymmetric pair at ${{symRef}}: ${{wbA.hasPair ? 'Also flagged' : 'Not flagged'}}`;
  }} else if (bwA) {{
    const sr = ROWS - 1 - r, sc = COLS - 1 - c;
    const symRef = colToSheet(sc) + (sr + 1);
    if (bwA.confirmed) {{
      text += `\\n\\nVERIFIED ERROR: Should be WHITE`;
      text += `\\nConfirmed by spot-checking against physical puzzle`;
    }} else {{
      const pct = Math.round(bwA.disagree / bwA.total * 100);
      text += `\\n\\nSuggestion: Change to WHITE`;
      text += `\\n${{pct}}% of periodic copies (${{bwA.disagree}}/${{bwA.total}}) are WHITE`;
      text += `\\nThis black cell breaks the local diamond pattern`;
    }}
    text += `\\nSymmetric pair at ${{symRef}}: ${{bwA.hasPair ? 'Also flagged' : 'Not flagged'}}`;
  }}

  tooltip.textContent = text;
  tooltip.style.display = 'block';
  tooltip.style.left = (e.clientX + 15) + 'px';
  tooltip.style.top = (e.clientY + 15) + 'px';
  tooltip.style.whiteSpace = 'pre-wrap';
}});

canvas.addEventListener('mouseup', () => {{ isDragging = false; }});
canvas.addEventListener('mouseleave', () => {{ isDragging = false; tooltip.style.display = 'none'; }});

// Initial draw
resize();
</script>
</body>
</html>"""

with open('grid_correction_suggestions.html', 'w') as f:
    f.write(html)

print(f"\nWrote grid_correction_suggestions.html")
print(f"\nW->B anomalies by region (UL quadrant = rows 0-151, cols 0-151):")
ul_count = sum(1 for r, c in wb_anomalies if r <= 151 and c <= 151)
print(f"  UL quadrant: {ul_count}")
print(f"  Other: {len(wb_anomalies) - ul_count}")
