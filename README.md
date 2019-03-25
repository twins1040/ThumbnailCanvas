# ThumbnailCanvas
youtube thumbnail maker by canvas, fabric.js

app : https://thumbnail-maker.xyz/
api : https://thumbnail-maker.xyz/api/

# API local test Guide (macOS)
install
0. install python3 and pip3 https://itsevans.com/install-pip-osx/ (we need python3.6 or later)
1. git clone https://github.com/twins1040/ThumbnailCanvas.git (do not need to make dir)
2. cd ThumbnailCanvas
4. pip3 install virtualenv ( do not use apt-get, python2 virtualenv might be installed )
5. virtualenv myenv ( restart terminal if can't find .../bin/virtualenv )
6. source myenv/bin/activate
7. pip install -r requirement.txt
8. get oauth.json ( tell me directly. It is secret for google api )
9. python manage.py migrate

test
1. source myenv/bin/activate (if not)
2. python manage.py runserver
3. enter 127.0.0.1:8000 by your browser 
4. refresh 127.0.0.1:8000 (you don't need to runserver)

# Contribute
1. git checkout develop
2. edit something, commit
3. push your commit to origin/develop

# Merge
1. git checkout master
2. git merge develop
3. solve conflict if exist
4. git push origin master
2. your commit will automatically change server. 
3. so check https://thumbnail-maker.xyz/
