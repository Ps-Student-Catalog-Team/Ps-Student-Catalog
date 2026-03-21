<#
.SYNOPSIS
    精确检测文件移动，输出格式：文件名 原地址 移动到 新地址
    同时将输出内容保存到 file_moves.txt
#>

$TargetPath = $PSScriptRoot
if (-not $TargetPath) { $TargetPath = "." }
$TargetPath = (Resolve-Path $TargetPath).Path

$ReferenceFile = Join-Path $TargetPath "file_state.csv"
$LogFile = Join-Path $TargetPath "file_moves.txt"

# 清空旧的日志文件（每次运行生成新日志）
if (Test-Path $LogFile) { Remove-Item $LogFile -Force }

# 获取当前所有文件的状态（相对路径、绝对路径、哈希）
function Get-FileStates {
    param([string]$BasePath)
    $states = @()
    Get-ChildItem -Path $BasePath -File -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
        $fullPath = $_.FullName
        $relativePath = $fullPath.Substring($BasePath.Length).TrimStart('\')
        $hash = (Get-FileHash -Path $fullPath -Algorithm SHA256).Hash
        $states += [PSCustomObject]@{
            RelativePath = $relativePath
            FullPath     = $fullPath
            Hash         = $hash
        }
    }
    return $states
}

# 首次运行：生成参考文件
if (-not (Test-Path $ReferenceFile)) {
    $msg1 = "首次运行，正在生成参考文件..."
    Write-Host $msg1 -ForegroundColor Cyan
    Add-Content -Path $LogFile -Value $msg1 -Encoding UTF8

    $states = Get-FileStates -BasePath $TargetPath
    $states | Select-Object RelativePath, Hash | Export-Csv -Path $ReferenceFile -NoTypeInformation -Encoding UTF8

    $msg2 = "参考文件已生成：$ReferenceFile"
    Write-Host $msg2 -ForegroundColor Green
    Add-Content -Path $LogFile -Value $msg2 -Encoding UTF8

    $msg3 = "当前共有 $($states.Count) 个文件。"
    Write-Host $msg3 -ForegroundColor Yellow
    Add-Content -Path $LogFile -Value $msg3 -Encoding UTF8
    exit
}

# 读取参考状态
$refStates = Import-Csv -Path $ReferenceFile -Encoding UTF8
# 获取当前状态
$curStates = Get-FileStates -BasePath $TargetPath

# 构建哈希 -> 绝对路径列表的映射（参考）
$refMap = @{}
foreach ($item in $refStates) {
    $fullPath = [System.IO.Path]::GetFullPath((Join-Path $TargetPath $item.RelativePath))
    if (-not $refMap.ContainsKey($item.Hash)) { $refMap[$item.Hash] = [System.Collections.ArrayList]::new() }
    [void]$refMap[$item.Hash].Add($fullPath)
}

# 构建哈希 -> 绝对路径列表的映射（当前）
$curMap = @{}
foreach ($item in $curStates) {
    $fullPath = [System.IO.Path]::GetFullPath($item.FullPath)
    if (-not $curMap.ContainsKey($item.Hash)) { $curMap[$item.Hash] = [System.Collections.ArrayList]::new() }
    [void]$curMap[$item.Hash].Add($fullPath)
}

# 收集移动
$moves = @()
foreach ($hash in $refMap.Keys) {
    if ($curMap.ContainsKey($hash)) {
        $refPaths = $refMap[$hash]
        $curPaths = $curMap[$hash]

        # 找出“消失”的路径（参考中有但当前中没有）
        $movedOut = @($refPaths | Where-Object { $_ -notin $curPaths })
        # 找出“出现”的路径（当前中有但参考中没有）
        $movedIn  = @($curPaths | Where-Object { $_ -notin $refPaths })

        # 配对移动（消失和出现数量应相等）
        $pairCount = [Math]::Min($movedOut.Count, $movedIn.Count)
        for ($i = 0; $i -lt $pairCount; $i++) {
            $oldPath = $movedOut[$i]
            $newPath = $movedIn[$i]
            $moves += [PSCustomObject]@{
                FileName = Split-Path $oldPath -Leaf
                OldPath  = $oldPath
                NewPath  = $newPath
            }
        }
    }
}

# 输出移动信息（同时写入日志）
if ($moves.Count -gt 0) {
    foreach ($move in $moves) {
        $line = "$($move.FileName) $($move.OldPath) 移动到 $($move.NewPath)"
        Write-Host $line
        Add-Content -Path $LogFile -Value $line -Encoding UTF8
    }
} else {
    $msg = "未检测到文件移动。"
    Write-Host $msg
    Add-Content -Path $LogFile -Value $msg -Encoding UTF8
}

# 更新参考文件（保存相对路径）
$curStates | Select-Object RelativePath, Hash | Export-Csv -Path $ReferenceFile -NoTypeInformation -Encoding UTF8 -Force