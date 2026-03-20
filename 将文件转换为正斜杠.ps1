<#
.SYNOPSIS
    交互式从 CSV 文件读取文件列表，输出相对根目录的 Web 路径（以 ./ 开头），并保存到文件。
.DESCRIPTION
    用户输入 CSV 文件路径、输出文件路径和网站根目录后，
    将每个完整路径转换为相对于根目录的路径，替换反斜杠为正斜杠，前缀 ./
#>

# 交互式输入
$defaultCsv = "最早日期.txt"
$defaultOutput = "最早文件（正斜杠）.txt"
$defaultRoot = "D:\website"

Write-Host "请提供以下信息（直接回车使用默认值）：" -ForegroundColor Cyan

# 读取 CSV 文件路径
$csvInput = Read-Host "请输入 CSV 文件路径 [默认: $defaultCsv]"
if ([string]::IsNullOrWhiteSpace($csvInput)) {
    $CsvPath = $defaultCsv
} else {
    $CsvPath = $csvInput
}

# 读取输出文件路径
$outputInput = Read-Host "请输入输出文件路径 [默认: $defaultOutput]"
if ([string]::IsNullOrWhiteSpace($outputInput)) {
    $OutputFile = $defaultOutput
} else {
    $OutputFile = $outputInput
}

# 读取网站根目录
$rootInput = Read-Host "请输入网站根目录 [默认: $defaultRoot]"
if ([string]::IsNullOrWhiteSpace($rootInput)) {
    $RootDir = $defaultRoot
} else {
    $RootDir = $rootInput
}

# 检查 CSV 文件是否存在
if (-not (Test-Path $CsvPath)) {
    Write-Error "错误：找不到 CSV 文件 '$CsvPath'"
    exit 1
}

# 导入 CSV
try {
    $files = Import-Csv $CsvPath -Encoding UTF8 -ErrorAction Stop
} catch {
    Write-Error "读取 CSV 失败: $_"
    exit 1
}

$webPaths = @()  # 用于存储结果

# 处理每个文件
foreach ($file in $files) {
    $fullPath = $file.Path
    if ([string]::IsNullOrWhiteSpace($fullPath)) {
        Write-Warning "遇到空路径，跳过"
        continue
    }

    # 确保路径以根目录开头（不区分大小写）
    if ($fullPath.StartsWith($RootDir, [StringComparison]::OrdinalIgnoreCase)) {
        # 去掉根目录部分，并去除开头的反斜杠
        $relative = $fullPath.Substring($RootDir.Length).TrimStart('\')
        # 替换反斜杠为正斜杠，并加上 ./
        $webPath = "./" + $relative.Replace('\', '/')
        $webPaths += $webPath
    } else {
        Write-Warning "路径不在根目录下，已忽略: $fullPath"
    }
}

# 将结果保存到文件（每行一个）
$webPaths | Out-File -FilePath $OutputFile -Encoding utf8
Write-Host "已保存 $($webPaths.Count) 个路径到文件: $OutputFile" -ForegroundColor Green

# 同时在控制台输出
Write-Host "`n生成的路径列表：" -ForegroundColor Yellow
$webPaths | ForEach-Object { Write-Output $_ }