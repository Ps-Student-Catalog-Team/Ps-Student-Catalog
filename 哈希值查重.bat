@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set infile=hash_list_MD5.txt
set outfile=duplicates.txt
set tempfile=%temp%\hash_temp.txt

if exist "%outfile%" del "%outfile%"
if exist "%tempfile%" del "%tempfile%"

echo 正在分析文件列表，请稍候...
set curdir=
for /f "usebackq tokens=*" %%a in ("%infile%") do (
    set "line=%%a"
    rem 如果是目录行（以"Directory: "开头）
    echo !line! | findstr /b "Directory:" >nul
    if !errorlevel! equ 0 (
        rem 提取目录路径，并确保以反斜杠结尾
        set "curdir=!line:*Directory: =!"
        if not "!curdir:~-1!"=="\" set "curdir=!curdir!\"
    ) else (
        rem 检查是否是文件行（以空格开头且包含" : "）
        echo !line! | findstr /r "^[ ]" >nul && echo !line! | findstr /c:" : " >nul
        if !errorlevel! equ 0 (
            rem 解析文件名和哈希值
            for /f "tokens=1-3 delims=:" %%i in ("!line!") do (
                set "fname_part=%%i"
                set "hash=%%j"
                rem 去除文件名前的空格
                for /f "tokens=*" %%x in ("!fname_part!") do set "fname=%%x"
                rem 去除哈希值前的空格
                for /f "tokens=*" %%y in ("!hash!") do set "hash=%%y"
                set "fullpath=!curdir!!fname!"
                rem 将哈希值和路径写入临时文件（格式：哈希值|路径）
                echo !hash!^|!fullpath!>>"%tempfile%"
            )
        )
    )
)

rem 对临时文件按哈希值排序，使相同哈希相邻
sort "%tempfile%" /o "%tempfile%.sorted"

rem 找出重复的哈希值并输出
set prevhash=
set count=0
set firstfile=
(
    for /f "usebackq tokens=1,* delims=|" %%a in ("%tempfile%.sorted") do (
        set "hash=%%a"
        set "path=%%b"
        if "!hash!"=="!prevhash!" (
            rem 遇到重复哈希
            if !count! equ 1 (
                echo !prevhash!:
                echo    !firstfile!
                set count=2
            )
            echo    !path!
        ) else (
            set prevhash=!hash!
            set firstfile=!path!
            set count=1
        )
    )
) > "%outfile%"

echo 完成！重复文件列表已保存到 %outfile%
pause