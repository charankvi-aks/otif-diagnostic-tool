Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "python """ & WshShell.CurrentDirectory & "\launch_app.py""", 0, False
