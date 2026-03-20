<#
.SYNOPSIS
    根据CSV文件中的文件列表删除文件。
.DESCRIPTION
    读取包含FileName、Path和LastWriteTime列的CSV文件，并删除Path列指定的所有文件。
.PARAMETER CsvPath
    CSV文件的路径，默认为脚本所在目录下的“从列表.txt”。
.EXAMPLE
    .\Delete-FilesFromList.ps1
    使用默认的“从列表.txt”文件。
.EXAMPLE
    .\Delete-FilesFromList.ps1 -CsvPath "D:\list.csv"
    使用指定的CSV文件。
#>

param(
    [string]$CsvPath = "最早同名文件_从列表.txt"
)

# 检查CSV文件是否存在
if (-not (Test-Path $CsvPath)) {
    Write-Error "错误：找不到CSV文件 '$CsvPath'"
    exit 1
}

# 导入CSV（假设编码为UTF8 with BOM）
try {
    $files = Import-Csv $CsvPath -Encoding UTF8 -ErrorAction Stop
} catch {
    Write-Error "无法读取CSV文件：$_"
    exit 1
}

Write-Host "共找到 $($files.Count) 个待删除文件。"

# 可选：确认删除
$confirm = Read-Host "是否继续删除操作？(y/n)"
if ($confirm -ne 'y') {
    Write-Host "操作已取消。"
    exit
}

$deletedCount = 0
$errorCount = 0

foreach ($file in $files) {
    $path = $file.Path  # 从CSV的Path列获取完整路径

    if ([string]::IsNullOrWhiteSpace($path)) {
        Write-Warning "跳过空路径的记录。"
        continue
    }

    if (Test-Path $path -PathType Leaf) {
        try {
            Remove-Item -Path $path -Force -ErrorAction Stop
            Write-Host "已删除：$path"
            $deletedCount++
        } catch {
            Write-Warning "删除失败：$path - $_"
            $errorCount++
        }
    } else {
        Write-Warning "文件不存在：$path"
        $errorCount++
    }
}

Write-Host "操作完成。成功删除 $deletedCount 个文件，失败 $errorCount 个。"