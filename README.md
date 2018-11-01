# ThumbnailCanvas
youtube thumbnail maker by canvas, fabric.js

http://13.209.162.217:8000

# Test Guide (macOS)
install
0. install python3 and pip3 https://itsevans.com/install-pip-osx/ (we need python3.6 or later)
1. git clone https://github.com/twins1040/ThumbnailCanvas.git (do not need to make dir)
2. cd ThumbnailCanvas
4. pipi3 install virtualenv
5. virtualenv myenv
6. source myenv/bin/activate
7. pip install -r requirement.txt
8. python manage.py migrate

test
1. source myenv/bin/activate (if not)
2. python manage.py runserver
3. enter 127.0.0.1:8000 by your browser
4. fix some code ( please just touch fabricCanvas/templates/fabricCanvas/index.html for design )
5. refresh 127.0.0.1:8000 (you don't need to runserver)

# Commit and check
1. push your commit to origin master
2. your commit will automatically change server. 
3. so check http://13.209.162.217:8000
