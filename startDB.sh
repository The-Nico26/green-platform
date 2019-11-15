# /bin/bash
docker run -d -p 8080:8080 -p 28015:28015 -p 29015:29015 --mount source=data,target=/data rethinkdb
