param(
  [string]$ProjectPath = 'C:\Users\carva\Desktop\myApp\MyApp',
  [string]$BaselinePath = 'C:\Users\carva\Documents\Codex\2026-10-22\referenced-chatgpt-conversation-this-is-an\work\pre-decontamination',
  [string]$ReportPath = 'C:\Users\carva\Desktop\myApp\MyApp\audits\experience-decontamination-2026-10-22\VERIFICATION.json'
)
$ErrorActionPreference = 'Stop'
$checks = [System.Collections.Generic.List[object]]::new()
function Add-Check([string]$Name, [bool]$Pass, [object]$Detail) {
  $checks.Add([pscustomobject]@{ name=$Name; pass=$Pass; detail=$Detail })
}
function Read-Normalized([string]$Path) {
  [IO.File]::ReadAllText($Path).Replace("`r`n", "`n").TrimStart([char]0xFEFF)
}
function Test-OrderedLines([string]$Original, [string]$Current) {
  $priorLines = $Original.Split("`n")
  $newLines = $Current.Split("`n")
  $cursor = 0
  $missing = [System.Collections.Generic.List[int]]::new()
  for ($i=0; $i -lt $priorLines.Count; $i++) {
    if ([string]::IsNullOrWhiteSpace($priorLines[$i])) { continue }
    $found = $false
    for ($j=$cursor; $j -lt $newLines.Count; $j++) {
      if ($priorLines[$i] -ceq $newLines[$j]) { $cursor=$j+1; $found=$true; break }
    }
    if (-not $found) { $missing.Add($i+1) }
  }
  @($missing.ToArray())
}
$manifest = Get-Content -LiteralPath (Join-Path $BaselinePath 'manifest.json') -Raw | ConvertFrom-Json
$hashes = foreach ($item in $manifest) {
  $originalPath = Join-Path $BaselinePath $item.path
  $currentPath = Join-Path $ProjectPath $item.path
  $baselineHash = (Get-FileHash -LiteralPath $originalPath -Algorithm SHA256).Hash
  Add-Check "baseline:$($item.path)" ($baselineHash -ceq $item.sha256) 'Pre-mission original matches captured hash.'
  $exists = Test-Path -LiteralPath $currentPath -PathType Leaf
  Add-Check "exists:$($item.path)" $exists 'Original authority artifact remains present.'
  if ($exists) {
    [pscustomobject]@{ path=$item.path; before_sha256=$item.sha256; after_sha256=(Get-FileHash -LiteralPath $currentPath -Algorithm SHA256).Hash }
  }
}

# Preserve every nonblank source line in order for all domain/experience bodies.
# These checks include the four previously dirty artifacts, not just Git HEAD.
$knowledgeFiles = @($manifest | Where-Object { $_.path -match '^(product[\\/]|canon[\\/]VILUMO_)' })
foreach ($item in $knowledgeFiles) {
  $missing = @(Test-OrderedLines (Read-Normalized (Join-Path $BaselinePath $item.path)) (Read-Normalized (Join-Path $ProjectPath $item.path)))
  Add-Check "preserve-source-lines:$($item.path)" ($missing.Count -eq 0) @{ missing_baseline_lines=$missing }
}

$snapshot = Join-Path $ProjectPath 'governance\snapshots\2026-10-22-pre-experience-decontamination\CURRENT_MISSION.md'
$missionOriginal = Join-Path $BaselinePath 'CURRENT_MISSION.md'
Add-Check 'mission-history-byte-identical' ((Test-Path -LiteralPath $snapshot) -and ((Get-FileHash -LiteralPath $snapshot -Algorithm SHA256).Hash -ceq (Get-FileHash -LiteralPath $missionOriginal -Algorithm SHA256).Hash)) 'Includes preexisting uncommitted completeness phase.'
$ledgerOriginal = Read-Normalized (Join-Path $BaselinePath 'MISSION_LEDGER.md')
$ledgerCurrent = Read-Normalized (Join-Path $ProjectPath 'MISSION_LEDGER.md')
Add-Check 'ledger-history-preserved' ($ledgerCurrent.Contains($ledgerOriginal)) 'Pre-mission ledger body remains recoverable without rewriting historical records.'

$briefRelative = 'product\DESIGNER_PRODUCT_CONTEXT.md'
$briefPath = Join-Path $ProjectPath $briefRelative
Add-Check 'brief-exists' (Test-Path -LiteralPath $briefPath -PathType Leaf) $briefRelative
if (Test-Path -LiteralPath $briefPath) {
  $brief = Read-Normalized $briefPath
  $guardrails = @(
    'THE NEW FIGMA OWNS THE EXPERIENCE ARCHITECTURE',
    'DOMAIN DOCUMENTS PROVIDE CAPABILITIES, CONSTRAINTS AND TRUTH — NOT LAYOUT',
    'PRODUCT CAPABILITY DOES NOT IMPLY UI SURFACE',
    'DO NOT ADD A SURFACE SOLELY BECAUSE A CAPABILITY EXISTS',
    'NO PIXEL MIGRATION. SEMANTIC MIGRATION ONLY',
    'DO NOT BEND THE NEW EXPERIENCE TO MATCH THE OLD FIGMA. BEND IT ONLY WHEN REQUIRED BY PRODUCT TRUTH'
  )
  $cleanPath = (Read-Normalized (Join-Path $ProjectPath 'CURRENT_MISSION.md')) + (Read-Normalized (Join-Path $ProjectPath 'canon\CANONICAL_INDEX.md')) + $brief
  foreach ($rule in $guardrails) { Add-Check "guardrail:$rule" ($cleanPath.Contains($rule)) 'Explicit Founder guardrail available in clean designer path (mission/index/brief); no duplicate literal requirement in the derived view.' }
  $contamination = [regex]::Matches($brief, '(?i)\bPierre\b|\bS1(?:\.[0-9])?\b|NeaZKGCzHMy6IHc47cVEHs|\bSURF-[0-9]|\bVIS-[0-9]|\bgradients?\b|\bvisual spacing\b|\bscreen maps?\b')
  Add-Check 'brief-no-old-face-identifiers' ($contamination.Count -eq 0) @{ matches=@($contamination | ForEach-Object Value) }
  $wordCount = ($brief -split '\s+' | Where-Object { $_ }).Count
  Add-Check 'brief-bounded-length' ($wordCount -le 3500) @{ words=$wordCount; maximum=3500; note='Length guard only; relevance and design freedom require independent review.' }
}

# Check new local Markdown references only; preexisting historical broken links
# are not silently claimed repaired or used to justify rewriting old audits.
$changed = @($hashes | Where-Object { $_.before_sha256 -cne $_.after_sha256 } | ForEach-Object path)
if (Test-Path -LiteralPath $briefPath) { $changed += $briefRelative }
foreach ($relativePath in $changed) {
  $path = Join-Path $ProjectPath $relativePath
  $currentText = Read-Normalized $path
  $priorPath = Join-Path $BaselinePath $relativePath
  $oldRefs = if (Test-Path -LiteralPath $priorPath) { @([regex]::Matches((Read-Normalized $priorPath), '\]\(([^)]+)\)') | ForEach-Object { $_.Groups[1].Value }) } else { @() }
  $newRefs = @([regex]::Matches($currentText, '\]\(([^)]+)\)') | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique | Where-Object { $_ -notin $oldRefs })
  foreach ($reference in $newRefs) {
    $target = $reference.Split('#')[0].Trim('<','>')
    if (-not $target -or $target -match '^[a-zA-Z][a-zA-Z0-9+.-]*:') { continue }
    $resolved = Join-Path (Split-Path $path) ([Uri]::UnescapeDataString($target))
    Add-Check "new-link:$relativePath->$reference" (Test-Path -LiteralPath $resolved) 'New local link resolves.'
  }
}

$gitDiffCheck = & git -C $ProjectPath diff --check 2>&1
Add-Check 'git-diff-check' ($LASTEXITCODE -eq 0) @($gitDiffCheck | ForEach-Object ToString)
$deletions = @(& git -C $ProjectPath diff --name-only --diff-filter=D)
Add-Check 'no-tracked-file-deletions' ($deletions.Count -eq 0) $deletions
$branch = & git -C $ProjectPath branch --show-current
$head = & git -C $ProjectPath rev-parse HEAD
Add-Check 'no-commit-or-branch-change' (($branch -eq 'main') -and ($head -like '2ff17ae*')) @{ branch=$branch; head=$head }
$report = [pscustomobject]@{
  revision='DEC-DOC-CHECKS-r2'; captured_at=[DateTimeOffset]::Now.ToString('o'); project=$ProjectPath;
  inputs='Direct Founder request 2026-10-22 + exact pre-mission originals including uncommitted changes';
  scope='Document preservation, history, local links, bounded clean brief, guardrails, Git hygiene. No efficacy, algorithm, visual, device, commercial or release validation.';
  passed=@($checks | Where-Object pass).Count; failed=@($checks | Where-Object { -not $_.pass }).Count;
  artifacts=$hashes; checks=$checks.ToArray()
}
$report | ConvertTo-Json -Depth 9 | Set-Content -LiteralPath $ReportPath -Encoding utf8
Write-Output ("Checks: {0} pass, {1} fail. Report: {2}" -f $report.passed,$report.failed,$ReportPath)
$checks | Where-Object { -not $_.pass } | ConvertTo-Json -Depth 5
if ($report.failed -gt 0) { exit 1 }
