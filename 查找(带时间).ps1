<#
.SYNOPSIS
    从同名文件列表文件中提取每组文件的最早和最晚修改时间，输出为文本文件（CSV 格式）。
.DESCRIPTION
    读取“同名文件列表_排除后.txt”，解析每组同名文件的路径和修改时间，
    找出每组最早和最晚修改时间的文件，分别输出为 .txt 文件，内容格式： "FileName","Path","LastWriteTime"
.NOTES
    版本：4.1
    输出：最早日期.txt、最晚日期.txt
#>

param(
    [string]$InputFile = "同名文件列表_排除后.txt",
    [string]$EarliestOutput = "最早日期.txt",
    [string]$LatestOutput = "最晚日期.txt"
)

# 获取脚本所在目录
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$inputPath = Join-Path $scriptDir $InputFile
$earliestPath = Join-Path $scriptDir $EarliestOutput
$latestPath = Join-Path $scriptDir $LatestOutput

# 检查输入文件
if (-not (Test-Path $inputPath)) {
    Write-Error "输入文件 '$inputPath' 不存在。"
    exit 1
}

# 使用系统默认编码（ANSI/GBK）读取文件
try {
    $lines = Get-Content $inputPath -Encoding Default
} catch {
    Write-Error "无法读取文件 '$inputPath'：$_"
    exit 1
}

# 用于存储结果
$earliestList = @()
$latestList = @()

# 临时变量
$currentFile = $null
$fileInfos = @()   # 存储当前组的 {Path, Date} 对象

# 逐行处理
foreach ($line in $lines) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }

    # 文件名行（不以空白开头）
    if ($line -notmatch '^\s') {
        # 处理上一组
        if ($currentFile -ne $null -and $fileInfos.Count -gt 0) {
            $objects = $fileInfos | ForEach-Object {
                try {
                    $dateObj = [datetime]::ParseExact($_.Date, "yyyy-MM-dd HH:mm:ss", $null)
                    [PSCustomObject]@{ Path = $_.Path; Date = $dateObj }
                } catch {
                    Write-Warning "无法解析日期: $($_.Date) ，跳过该条记录。"
                    $null
                }
            } | Where-Object { $_ -ne $null }

            if ($objects.Count -gt 0) {
                $earliestObj = $objects | Sort-Object Date | Select-Object -First 1
                $latestObj   = $objects | Sort-Object Date | Select-Object -Last 1
                $earliestList += [PSCustomObject]@{
                    FileName = $currentFile
                    Path = $earliestObj.Path
                    LastWriteTime = $earliestObj.Date.ToString('yyyy-MM-dd HH:mm:ss')
                }
                $latestList += [PSCustomObject]@{
                    FileName = $currentFile
                    Path = $latestObj.Path
                    LastWriteTime = $latestObj.Date.ToString('yyyy-MM-dd HH:mm:ss')
                }
            } else {
                Write-Warning "文件组 '$currentFile' 没有有效的修改时间记录。"
            }
        }

        # 开始新组
        $currentFile = $line.Trim()
        $fileInfos = @()
    } else {
        # 缩进行：提取路径和日期
        if ($line -match '^\s+(.+?)\s+\(修改时间:\s*(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\)') {
            $filePath = $matches[1].Trim()
            $dateStr = $matches[2]
            $fileInfos += [PSCustomObject]@{ Path = $filePath; Date = $dateStr }
        } else {
            Write-Warning "无法从行中提取路径和时间: $line"
        }
    }
}

# 处理最后一组
if ($currentFile -ne $null -and $fileInfos.Count -gt 0) {
    $objects = $fileInfos | ForEach-Object {
        try {
            $dateObj = [datetime]::ParseExact($_.Date, "yyyy-MM-dd HH:mm:ss", $null)
            [PSCustomObject]@{ Path = $_.Path; Date = $dateObj }
        } catch {
            Write-Warning "无法解析日期: $($_.Date) ，跳过该条记录。"
            $null
        }
    } | Where-Object { $_ -ne $null }

    if ($objects.Count -gt 0) {
        $earliestObj = $objects | Sort-Object Date | Select-Object -First 1
        $latestObj   = $objects | Sort-Object Date | Select-Object -Last 1
        $earliestList += [PSCustomObject]@{
            FileName = $currentFile
            Path = $earliestObj.Path
            LastWriteTime = $earliestObj.Date.ToString('yyyy-MM-dd HH:mm:ss')
        }
        $latestList += [PSCustomObject]@{
            FileName = $currentFile
            Path = $latestObj.Path
            LastWriteTime = $latestObj.Date.ToString('yyyy-MM-dd HH:mm:ss')
        }
    } else {
        Write-Warning "文件组 '$currentFile' 没有有效的修改时间记录。"
    }
}

# 导出为文本文件（CSV 格式）
if ($earliestList.Count -gt 0) {
    $earliestList | Export-Csv -Path $earliestPath -NoTypeInformation -Encoding UTF8
    Write-Host "最早时间已导出: $earliestPath"
} else {
    Write-Warning "没有有效的记录可写入最早时间文件。"
}

if ($latestList.Count -gt 0) {
    $latestList | Export-Csv -Path $latestPath -NoTypeInformation -Encoding UTF8
    Write-Host "最晚时间已导出: $latestPath"
} else {
    Write-Warning "没有有效的记录可写入最晚时间文件。"
}