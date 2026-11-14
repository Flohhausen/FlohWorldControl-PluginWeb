@echo off
setlocal
title FlohWorldControl - Gradle Build
cd /d "%~dp0"

REM Java 21 bevorzugen
if not defined JAVA_HOME (
  if exist "%ProgramFiles%\Eclipse Adoptium\jdk-21*" (
    for /d %%J in ("%ProgramFiles%\Eclipse Adoptium\jdk-21*") do set "JAVA_HOME=%%J"
  )
)
if not defined JAVA_HOME (
  if exist "%LOCALAPPDATA%\Programs\Eclipse Adoptium\jdk-21*" (
    for /d %%J in ("%LOCALAPPDATA%\Programs\Eclipse Adoptium\jdk-21*") do set "JAVA_HOME=%%J"
  )
)
if defined JAVA_HOME set "PATH=%JAVA_HOME%\bin;%PATH%"

echo === Java ===
java -version
if errorlevel 1 (
  echo FEHLER: Java JDK 21 wurde nicht gefunden. JAVA_HOME setzen.
  pause
  exit /b 1
)

echo.
echo === Gradle Build ===
where gradle >nul 2>nul
if not errorlevel 1 (
  gradle clean build
) else if exist "C:\Gradle\gradle-8.14.6-bin\gradle-8.14.6\bin\gradle.bat" (
  "C:\Gradle\gradle-8.14.6-bin\gradle-8.14.6\bin\gradle.bat" clean build
) else (
  echo FEHLER: Gradle nicht gefunden. Gradle 8.14.6 installieren oder PATH setzen.
  pause
  exit /b 1
)

if errorlevel 1 (
  echo.
  echo BUILD FEHLGESCHLAGEN. Bitte die erste Fehlermeldung oben pruefen.
) else (
  echo.
  echo BUILD ERFOLGREICH!
  echo JAR: %~dp0build\libs\FlohWorldControl-0.1.0.jar
)
pause
