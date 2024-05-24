REM Ausfuehren per:
REM git Das ist der Commit
REM ergibt ein git commit -m "Das ist der Commit"
REM --------------------
REM Aufruf per ./up.bat
REM --------------------
REM das git pull ist zur Sicherheit immer vor dem Start der eigenen Arbeit durchzuführen
REM --------------------
git pull
git add .
git commit -m "%*"
git push