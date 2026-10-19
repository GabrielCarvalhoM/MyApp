# Documentary verifier for UXSPEC-20261018. Read-only except for the JSON written to -Out.
# Checks preservation (hash), file-scope allowlist, links and required-term coverage of the UX spec.
# It does not judge semantics, usability, legality, physiology or implementation.
param(
  [string]$Root = "C:\Users\carva\Desktop\myApp\MyApp",
  [ValidateSet('pre-review', 'final')][string]$Mode = 'pre-review',
  [string]$Out
)
$ErrorActionPreference = 'Stop'
$rootFull = (Resolve-Path $Root).Path
$audit = Join-Path $rootFull 'audits\ux-spec-2026-10-18'
$checks = New-Object System.Collections.Generic.List[object]
$warnings = New-Object System.Collections.Generic.List[object]
function Add-Check([string]$id, [bool]$pass, [string]$detail) { $checks.Add([ordered]@{ id = $id; pass = $pass; detail = $detail }) }
function Get-Sha([string]$p) { (Get-FileHash -Algorithm SHA256 -LiteralPath $p).Hash.ToLower() }
function Rel([string]$full) { ($full.Substring($rootFull.Length + 1)) -replace '\\', '/' }

# A. Preservation against the pre-edit baseline
$manifest = Get-Content -Raw -Encoding UTF8 (Join-Path $audit 'BASELINE_MANIFEST.json') | ConvertFrom-Json
$mutable = @('CURRENT_MISSION.md', 'MISSION_LEDGER.md')
$baselinePaths = @{}
foreach ($f in $manifest.files) {
  $baselinePaths[$f.path] = $true
  if ($mutable -contains $f.path) { continue }
  $full = Join-Path $rootFull ($f.path -replace '/', '\')
  if (-not (Test-Path -LiteralPath $full)) { Add-Check "preserve:$($f.path)" $false 'missing'; continue }
  $h = Get-Sha $full
  Add-Check "preserve:$($f.path)" ($h -eq $f.sha256) $h
}
$ledger = Join-Path $rootFull 'MISSION_LEDGER.md'
$lb = [System.IO.File]::ReadAllBytes($ledger)
$prefixLen = 63457
$okLen = $lb.Length -ge $prefixLen
$prefixSha = ''
if ($okLen) {
  $buf = New-Object byte[] $prefixLen; [Array]::Copy($lb, $buf, $prefixLen)
  $prefixSha = (([System.Security.Cryptography.SHA256]::Create().ComputeHash($buf)) | ForEach-Object { $_.ToString('x2') }) -join ''
}
Add-Check 'ledger:append-only-prefix' ($okLen -and $prefixSha -eq 'e9f1a60103baaca9cf028369a06123c933aff99cc51177f0c3d89502054e66c1') "bytes=$($lb.Length) prefixSha=$prefixSha"
$snap = Join-Path $audit 'baseline\CURRENT_MISSION.AEOS_COMPLETE.md'
Add-Check 'mission:aeos-snapshot' ((Test-Path $snap) -and (Get-Sha $snap) -eq 'aa31d509599972d160fdaa7d7fbb07b152a7485ec8ef820eff36dd4747b842ad') 'prior mission preserved byte-identical'
Add-Check 'canon:ptc-3.0.0' ((Get-Sha (Join-Path $rootFull 'canon\VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md')) -eq 'dde1b81a57a3ee208279f2b7c4ed80d4fb2b986005f575a4b56631e150082614') 'PTC-3.0.0 published hash'

# B. Scope: every new file must be on the mission allowlist
$all = Get-ChildItem -Path $rootFull -Recurse -File -Force | Where-Object { $_.FullName -notmatch '\\\.git\\' }
$newFiles = @($all | ForEach-Object { Rel $_.FullName } | Where-Object { -not $baselinePaths.ContainsKey($_) })
$outside = @($newFiles | Where-Object { $_ -ne 'product/UX_SPECIFICATION.md' -and $_ -ne '.gitattributes' -and -not $_.StartsWith('audits/ux-spec-2026-10-18/') })
Add-Check 'scope:new-files-allowlisted' ($outside.Count -eq 0) ("new=" + ($newFiles -join ', ') + " | outside=" + ($outside -join ', '))

# C. Links in mission files and the spec
$spec = Join-Path $rootFull 'product\UX_SPECIFICATION.md'
$linkSources = @((Join-Path $rootFull 'CURRENT_MISSION.md'), (Join-Path $audit 'MISSION_RECORD.md'))
if (Test-Path $spec) { $linkSources += $spec }
foreach ($src in $linkSources) {
  $text = Get-Content -Raw -Encoding UTF8 -LiteralPath $src
  $dir = Split-Path -Parent $src
  foreach ($m in [regex]::Matches($text, '\]\(([^)\s]+)\)')) {
    $t = $m.Groups[1].Value
    if ($t -match '^(https?:|mailto:|#)') { continue }
    $pathPart = ($t -split '#')[0]
    if (-not $pathPart) { continue }
    $target = [System.IO.Path]::GetFullPath((Join-Path $dir ($pathPart -replace '/', '\')))
    Add-Check ("link:" + (Rel $src) + '->' + $pathPart) (Test-Path -LiteralPath $target) $target
  }
}

# D. Spec coverage (required terms) and lint warnings
if (-not (Test-Path $spec)) {
  Add-Check 'spec:exists' $false 'product/UX_SPECIFICATION.md not found'
} else {
  Add-Check 'spec:exists' $true (Rel $spec)
  $s = Get-Content -Raw -Encoding UTF8 -LiteralPath $spec
  Add-Check 'spec:revision-marker' ($s -match 'UXS-1\.0-r\d') 'UXS-1.0-rN present'
  Add-Check 'spec:not-founder-approved-marker' (($s -match '(?i)n[aã]o aprovad') -and ($s -match 'Figma')) 'status declares no Founder approval and Figma limit'
  $required = [ordered]@{
    'destinations' = @('Hoje', 'Plano', 'Progresso', 'Crews', 'Você')
    'confidence' = @('SUFFICIENT', 'PARTIAL', 'CONFLICTING', 'STALE', 'ABSENT')
    'classes' = @('KEEP', 'MOVE', 'REORDER', 'REDUCE_VOLUME', 'REDUCE_INTENSITY', 'SUBSTITUTE', 'RECOVER', 'REST', 'REPLAN', 'RETURN', 'ASK', 'HOLD', 'RECONCILE')
    'dependencies' = @('G01', 'G02', 'G03', 'G04', 'G05', 'G06', 'G07', 'G08', 'G09', 'G10', 'G11')
    'carried-conditions' = @('PB-F-02', 'PB-F-03', 'SEC-J3-05', 'SEC-J3-06', 'O015', 'DR-63')
    'engine-boundaries' = @('B0', 'JEV', 'SHADOW', 'template')
    'exclusions' = @('Relay')
    'workstreams' = @('Onboarding', 'Running', 'Strength', 'Nutrition', 'Crew', 'agente', 'notifica', '18+')
    'self-check' = @('Architecture Eval', 'self')
    'upstream-refs' = @('PA-1.1', 'EM-1.1', 'CF-1.1', 'AEC-1.1', 'AEOS', 'AESL', 'RS-1.1', 'PDM-1.1')
  }
  foreach ($k in $required.Keys) {
    foreach ($term in $required[$k]) {
      Add-Check ("cover:" + $k + ':' + $term) ($s.IndexOf($term, [System.StringComparison]::OrdinalIgnoreCase) -ge 0) $term
    }
  }
  foreach ($j in 1..10) { $f = 'F{0:D2}' -f $j; Add-Check ("trace:CF:" + $f) ($s -match $f) $f }
  foreach ($q in @('poucos segundos', 'Runna', 'first-class', 'theater', 'Figma')) { Add-Check ("trace:question-term:" + $q) ($s.IndexOf($q, [System.StringComparison]::OrdinalIgnoreCase) -ge 0) $q }
  $lines = $s -split "`n"
  $lint = @(
    @{ id = 'percent-number'; rx = '\d+\s?%' },
    @{ id = 'pixel'; rx = '\b\d+\s?px\b' },
    @{ id = 'hex-colour'; rx = '#[0-9a-fA-F]{6}\b' },
    @{ id = 'visual-vocabulary'; rx = '(?i)\b(tipografia|paleta|fonte tipogr|hexadecimal|gradiente)\b' }
  )
  foreach ($l in $lint) {
    for ($i = 0; $i -lt $lines.Count; $i++) {
      if ($lines[$i] -match $l.rx) { $warnings.Add([ordered]@{ id = $l.id; line = $i + 1; text = $lines[$i].Trim().Substring(0, [Math]::Min(200, $lines[$i].Trim().Length)) }) }
    }
  }
}

# E. Final mode: reviewed revision, frozen inputs, review records and mission closure
$inventory = @()
if ($Mode -eq 'final') {
  $expectFrozen = [ordered]@{
    'review-inputs-r1/UX_SPECIFICATION.md' = '08ac2f964791f1b9903ca435174a4d660ad74d2abb9a55cd2e9e2df42afc5d8c'
    'review-inputs-r2/UX_SPECIFICATION.md' = '092ec0336ddaf6bee5257d3c45a5f34ad5ac232beb9cb26ee1a2604d4b410bec'
    'review-inputs-r3/UX_SPECIFICATION.md' = '598b055d8df6cf67cafe0365e88d0ba694164d00c7ab6576fc2643eff5dcfcdb'
  }
  foreach ($k in $expectFrozen.Keys) {
    $p = Join-Path $audit ($k -replace '/', '\')
    Add-Check ('final:frozen:' + $k) ((Test-Path -LiteralPath $p) -and (Get-Sha $p) -eq $expectFrozen[$k]) $expectFrozen[$k]
  }
  Add-Check 'final:spec-is-reviewed-r3' ((Test-Path $spec) -and (Get-Sha $spec) -eq $expectFrozen['review-inputs-r3/UX_SPECIFICATION.md']) 'current product/UX_SPECIFICATION.md equals the reviewed UXS-1.0-r3'
  foreach ($r in @('UX', 'SECURITY', 'AI', 'ENGINEERING')) {
    foreach ($n in 1..3) {
      $f = '{0}_REVIEW_r{1}.md' -f $r, $n
      Add-Check ('final:review:' + $f) (Test-Path -LiteralPath (Join-Path $audit $f)) $f
    }
  }
  foreach ($f in @('AUTHOR_RESPONSE_r1.md', 'AUTHOR_RESPONSE_r2.md', 'FINAL_CONSOLIDATION.md', 'FOUNDER_REQUEST_2026-10-18.md', 'MISSION_RECORD.md')) {
    Add-Check ('final:record:' + $f) (Test-Path -LiteralPath (Join-Path $audit $f)) $f
  }
  $cm = Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $rootFull 'CURRENT_MISSION.md')
  Add-Check 'final:mission-closed-marker' ($cm -match 'COMPLETE_DOCUMENTARY_SPECIFICATION') 'CURRENT_MISSION declares the closed documentary state'
  Add-Check 'final:no-figma-authorization' ($cm -match 'FIGMA_AUTHORIZED_IN_THIS_MISSION = NO') 'CURRENT_MISSION keeps Figma unauthorised'
  $inventory = @(Get-ChildItem -Path $audit -Recurse -File | Where-Object { $_.Name -notlike 'FINAL_VERIFICATION*' } | Sort-Object FullName | ForEach-Object { [ordered]@{ path = (Rel $_.FullName); sha256 = (Get-Sha $_.FullName); bytes = $_.Length } })
}

$passed = @($checks | Where-Object { $_.pass }).Count
$failed = @($checks | Where-Object { -not $_.pass }).Count
$result = [ordered]@{
  kind = "uxspec-documentary-$Mode"
  checkedAt = (Get-Date).ToUniversalTime().ToString('o')
  project = ($rootFull -replace '\\', '/')
  spec = if (Test-Path $spec) { [ordered]@{ path = 'product/UX_SPECIFICATION.md'; sha256 = (Get-Sha $spec); bytes = (Get-Item $spec).Length } } else { $null }
  passed = $passed
  failed = $failed
  warningCount = $warnings.Count
  limits = 'Hash/scope/link/term-coverage checks only; no semantic, usability, legal, physiological, runtime or visual validation.'
  checks = $checks
  warnings = $warnings
  auditInventory = $inventory
}
if ($Out) { [System.IO.File]::WriteAllText($Out, ($result | ConvertTo-Json -Depth 6), (New-Object System.Text.UTF8Encoding($false))) }
"passed=$passed failed=$failed warnings=$($warnings.Count)"
@($checks | Where-Object { -not $_.pass }) | ForEach-Object { "FAIL " + $_.id + " :: " + $_.detail }
if ($failed -gt 0) { exit 1 } else { exit 0 }
